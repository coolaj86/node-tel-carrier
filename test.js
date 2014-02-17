'use strict';

var TelCarrier = require('./tel-carrier')
  , telCarrier
  , number = process.argv[2]
  , servicename = process.argv[3] || "fonefinder.net"
  ;

if (!number) {
  console.log('Usage: node test.js <number> <servicename>');
  return;
}

telCarrier = TelCarrier.create({
  //service: "xminder.com"
  //service: "freecarrierlookup.com"
  //service: "data24-7.com"
  //service: "fonefinder.net"
  //service: "tel-carrier-cache"
  service: servicename
});

telCarrier.lookup(number, function (err, data) {
  if (err) {
    console.error(err);
  } else {
    console.log(data);
  }
});
