(function () {
  "use strict";

  var connect = require('connect')
    , carriers = require('./carriersdb.json')
    , cmap = {}
    , count = 0
    , inprogress = false
    , lock
    , path = require('path')
    , fs = require('fs')
    , server
    ;

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
    .use(connect.json())
    .use(connect.compress())
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
    ;

  module.exports = server;
}());
