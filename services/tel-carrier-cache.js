'use strict';

var carriers = require('../carriers')
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
  carriers.lookup(number, obj.carrierName, map);
  carriers.lookup(number, obj.carrier, map);
  carriers.lookup(number, obj.company, map);
  map.carrierComment = obj.carrierName || obj.company;
  map.typeComment = obj.type;

  fn(null, map, { authoritative: false });
};
