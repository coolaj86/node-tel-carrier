'use strict';

var TelCarrier = require('./tel-carrier')
  , telCarrier
  //, numbers = 8013604427 
  , numbers = [8013604427, 3174266525]
  , user = process.argv[2]
  , pass = process.argv[3]
  ;

if (!user || !pass) {
  console.error('needs user, pass');
  return;
}

telCarrier = TelCarrier.create({
  service: "data24-7.com"
, username: user
, password: pass
});

telCarrier.lookup(numbers, function (err, data) {
  if (err) {
    console.error(err);
  } else {
    console.log('data');
    console.log(data);
  }
}, null, function (a) {
  console.log('raw');
  console.log(a);
});
