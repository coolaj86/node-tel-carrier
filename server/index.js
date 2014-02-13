(function () {
  "use strict";

  var connect = require('connect')
    , carriers = require('./carriersdb.json')
    , Sequence = require('sequence').Sequence
    , sequence = Sequence.create()
    , TelCarrier = require('tel-carrier')
    , telCarrier
    , cmap = {}
    , count = 0
    , inprogress = false
    , lock
    , path = require('path')
    , fs = require('fs')
    , server
    ;

  telCarrier = TelCarrier.create({ service: 'fonefinder.net' });

  carriers.forEach(function (c) {
    cmap[c.carrierComment] = c;
  });

  function saveCarriers() {
    count += 1;

    if (inprogress) {
      return;
    }

    if (count < 10) {
      clearTimeout(lock);
    }

    lock = setTimeout(function () {
      inprogress = true;
      count = 0;
      fs.writeFile(path.join(__dirname, 'carriersdb.json'), JSON.stringify(carriers, null, '  '), function () {
        inprogress = false;
      });
    }, 5000);
  }

  function updateCarriers(body) {
    if (!body.carrierComment || cmap[body.carrierComment]) {
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

    carriers.push(c);
    cmap[c.carrierComment] = c;
    saveCarriers();

    return c;
  }

  server = connect.createServer()
    .use(connect.compress())
    .use(connect.static(path.join(__dirname, 'public')))
    .use(connect.json())
    .use('/carriers', function (request, response, next) {
        if (request.method.match(/GET/i)) {
          response.setHeader('Content-Type', 'application/json');
          response.write(JSON.stringify(carriers, null, '  '));
          response.end();
          return;
        }

        if (request.method.match(/POST/i) && Object.keys(request.body).length) { 
          response.setHeader('Content-Type', 'application/json');
          response.write(JSON.stringify(updateCarriers(request.body), null, '  '));
          response.end();
          return;
        }

        next();
      })
    .use(connect.query())
    .use('/lookup', function (request, response, next) {
        if (!/\d{10}/.test(request.query.number)) {
          next();
          return;
        }

        sequence
          .then(function (next) {
            telCarrier.lookup(request.query.number, function (err, data) {
              response.setHeader('Content-Type', 'application/json');
              response.write(JSON.stringify(data, null, '  '));
              response.end();
              next();
            });
          })
          .then(function (next) {
            // only allow 1 request per second
            setTimeout(next, 1000);
          })
          ;
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
