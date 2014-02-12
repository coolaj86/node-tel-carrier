'use strict';

var request = require('request')
  ;

module.exports.create = function (opts) {
  var jar = request.jar()
    , services
    , service
    ;

  services = require('./services');
  service = services[opts.service];
  
  return {
    lookup: function (number, fn) {
      service(request, jar, number, opts, fn);
    }
  };
};
