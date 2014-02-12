'use strict';

var carriers = require('../carriers')
  ;

/*
https://api.data24-7.com/v/2.0\?user\=coolaj86\&pass\=Wh1t3Ch3dd3r\&api\=T\&p1\=17818640108\&out\=json                  !10112
{
  "response": {
    "results": [
      {
        "status": "OK",
        "number": "17818640108",
        "wless": "y",
        "carrier_name": "Sprint",
        "carrier_id": "9",
        "sms_address": "7818640108@messaging.sprintpcs.com",
        "mms_address": "7818640108@pm.sprint.com"
      }
    ]
  }
}
 */
module.exports = function (request, jar, number, opts, fn) {
  // 11 digit number
  number = '1' + number;
  request.get(
    'https://api.data24-7.com/v/2.0?user=' + opts.username + '&pass=' + opts.password + ' + &api=T&p1=' + number + '&out=json'
  , { jar: jar }
  , function (err, req, data) {
      var r
        ;

      if ('string' === typeof data) {
        try {
          data = JSON.parse(data);
        } catch(e) {
          fn(e);
          return;
        }
      }

      r = data && data.response && data.response.results;

      if (!r) {
        fn(data);
        return;
      }

      fn(null, {
        number: number
      , wireless: 'y' === r.wless
      , carrier: carriers.lookupBySmsGateway(r.sms_address) || carriers.lookupByComment(r.carrier_name)
      , carrierComment: r.carrier_name
      , smsGateaway: r.sms_address
      , mmsGateaway: r.mms_address
      });
    }
  );
};
