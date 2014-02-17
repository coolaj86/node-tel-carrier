(function () {
  "use strict";

  var connect = require('connect')
    , forEachAsync = require('foreachasync').forEachAsync
    , TelCarrier = require('tel-carrier')
    , telCarrier
    , path = require('path')
    , fs = require('fs')
    , server
    , locks = {} 
    , Gateways = {}
    , Carriers = {}
    , Numbers = {}
    ;

  telCarrier = TelCarrier.create({ service: 'tel-carrier-cache' });

  function saveThing(file, data) {
    var lock
      ;

    lock = locks[file] = locks[file] || { count: 0, token: null, inprogress: false };
    lock.count += 1;

    if (lock.inprogress) {
      return;
    }

    if (lock.count < 10) {
      clearTimeout(lock.token);
    }

    lock.token = setTimeout(function () {
      lock.inprogress = true;
      lock.count = 0;
      fs.writeFile(file, JSON.stringify(data, null, '  '), function () {
        lock.inprogress = false;
      });
    }, 5000);
  }

  Gateways._data = require('./gatewaysdb.json');
  Gateways._save = function () {
    saveThing(path.join(__dirname, 'gatewaysdb.json'), Gateways._data);
  };
  Gateways.update = function (carrier, sms, mms) {
    if (null !== sms && undefined !== sms && 'string' !== typeof sms) {
      return;
    }

    if (null !== mms && undefined !== mms && 'string' !== typeof mms) {
      return;
    }

    var gw = Gateways._data[carrier]
      ;

    if (!gw) {
      gw = {};
      Gateways._data[carrier] = gw;
    }

    if (!gw.sms) {
      gw.sms = sms;
      gw.updated = Date.now();
    }

    if (!gw.mms) {
      gw.mms = mms;
      gw.updated = Date.now();
    }

    Gateways._save();
  };

  Numbers._data = require('./numbersdb.json');
  Numbers._save = function () {
    saveThing(path.join(__dirname, 'numbersdb.json'), Numbers._data);
  };
  Numbers.update = function (number, carrier, wireless) {
    number = normalizeNumber(number);
    if (!number) {
      return;
    }

    if ((null !== typeof carrier && undefined !== carrier && 'string' !== typeof carrier) || carrier.length > 100) {
      return;
    }

    var n = Numbers._data[number]
      ;

    if (!n) {
      n = {};
      Numbers._data[number] = n;
    }
    
    if (!n.wireless || wireless) {
      n.wireless = wireless;
      n.updated = Date.now();
    }

    if (!n.carrier || carrier) {
      n.carrier = carrier || n.carrier;
      n.updated = Date.now();
    }

    Numbers._save();
  };

  Carriers._data = require('./carriersdb.json');
  Carriers._map = {};
  Carriers._data.forEach(function (c) {
    Carriers._map[c.carrierComment] = c;
  });
  Carriers._save = function () {
    saveThing(path.join(__dirname, 'carriersdb.json'), Carriers._data);
  };
  Carriers.update = function (body) {
    if (!body.carrierComment || Carriers._map[body.carrierComment]) {
      return null;
    }

    var c = {}
      ;

    c.carrier = body.carrier;
    c.carrierComment = body.carrierComment;
    c.typeComment = body.typeComment;
    c.wireless = body.wireless;
    c.smsGateway = body.smsGateway;
    c.mmsGateway = body.mmsGateway;

    Carriers._data.push(c);
    Carriers._map[c.carrierComment] = c;
    Carriers._save();

    return c;
  };

  function normalizeNumber(number) {
    var valNum = /(?=\+?1)?(\d{10})$/.exec(String(number))
      ;

    return valNum && ('+1' + valNum[1]);
  }

  function returnMany(numbers, cb) {
    var result = []
      ;

    forEachAsync(numbers, function (next, number) {
      // sometimes '+' becomes ' ' or '%20'
      var valNum = normalizeNumber(number) 
        ;

      if (!valNum) {
        next();
        return;
      }

      number = valNum[1];
      //number = valNum[1];
      telCarrier.lookup(number, function (err, info) {
        if (info) {
          result.push(info);
        }
        next();
      });
    }).then(function () {
      cb(result);
    });
  }

  server = connect.createServer()
    .use(connect.compress())
    .use(connect.static(path.join(__dirname, 'public')))
    .use(connect.json())
    .use(function (request, response, next) {
        if (response.send) {
          next();
          return;
        }

        response.send = function (data) {
          response.setHeader('Content-Type', 'application/json');
          response.write(JSON.stringify(data, null, '  '));
          response.end();
        };
        next();
      })
    .use('/analytics', function (request, response, next) {
        if (!request.method.match(/POST/i) || !Object.keys(request.body).length) { 
          next();
          return;
        }

        if (request.body.numbers) {
          Object.keys(request.body.numbers).forEach(function (number) {
            Numbers.update(number, request.body.numbers[number].carrier, request.body.numbers[number].wireless);
          });
        }

        if (request.body.carriers) {
          Object.keys(request.body.carriers).forEach(function (carrier) {
            Gateways.update(carrier, request.body.carriers[carrier].sms, request.body.carriers[carrier].mms);
          });
        }

        response.send({ success: true });
      })
    .use('/gateways', function (request, response, next) {
        if (request.method.match(/GET/i)) {
          response.send(Gateways._data);
          return;
        }

        next();
      })
    .use('/carriers', function (request, response, next) {
        if (request.method.match(/GET/i)) {
          response.send(Carriers._data);
          return;
        }

        if (request.method.match(/POST/i) && Object.keys(request.body).length) { 
          response.send(Carriers.update(request.body));
          return;
        }

        next();
      })
    .use(connect.query())
    .use('/lookup', function (request, response, next) {
        if (!/POST/.test(request.method) || !Array.isArray(request.body.numbers)) {
          next();
          return;
        }

        returnMany(request.body.numbers, response.send.bind(response));
      })
    .use('/lookup', function (request, response, next) {
        if (request.query.numbers) {
          returnMany(request.query.numbers.split(','), response.send.bind(response));
          return;
        }

        if (!/(\+?1)?\d{10}/.test(request.query.number)) {
          next();
          return;
        }

        returnMany(request.query.numbers.split(','), function (arr) {
          response.send(arr[0] || null);
        });
      })
    ;

  module.exports = server;

  function run() {
    var address
      ;

    address = server.listen(process.argv[2] || 0, function () {
      console.log('Listening', address);
    }).address();
  }
  if (require.main === module) {
    run();
  }
}());
