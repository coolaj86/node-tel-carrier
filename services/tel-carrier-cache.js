'use strict';

var carriers = require('tel-carrier-gateways')
  , telDb = require('tel-carrier-db')
  ;

module.exports = function (request, jar, number, opts, fn) {
  var parts = /(?=\+1\s*)?(\d{3})\D*(\d{3})\D*(\d{4})$/.exec(number)
    , map = {}
    , obj
    ;

  obj = telDb.lookup(1, parts[1], parts[2], parts[3]);
  if (!obj) {
    fn(new Error("'" + number + "' is not a valid phone number (area code + prefix not found in database)"), null);
    return;
  }

  map.number = number;
  map.wireless = obj.wireless;
  carriers.lookup(obj.carrierName, number, map);
  carriers.lookup(obj.carrier, number, map);
  carriers.lookup(obj.company, number, map);
  map.smsGateway = map.smsAddress;
  delete map.smsAddress;
  map.mmsGateway = map.mmsAddress;
  delete map.mmsAddress;
  map.carrierComment = obj.carrierName || obj.company;
  map.typeComment = obj.type;

  fn(null, map, { authoritative: false });
};
