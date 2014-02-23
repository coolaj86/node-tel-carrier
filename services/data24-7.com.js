'use strict';

var carriers = require('tel-carrier-gateways')
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

function stringify(numbers) {
  var strs = []
    ;

  numbers.forEach(function (n, i) {
    // 11 digit number
    // p1=18013604427
    strs.push('p' + (i+1) + '=1' + n);
  });

  return '&' + strs.join('&');
}

function many(request, jar, numbers, opts, fn, pre, post) {
  var url = 'https://api.data24-7.com/v/2.0'
    + '?user=' + opts.username
    + '&pass=' + opts.password
    + '&api=T'
    + stringify(numbers)
    + '&out=json'
    ;

  request.get(
    url
  , { jar: jar }
  , function (err, req, data) {
      var results
        , mapped = []
        ;

      if ('string' === typeof data) {
        try {
          data = JSON.parse(data);
        } catch(e) {
          fn(e);
          return;
        }
      }

      results = data && data.response && data.response.results;

      if (!results && results.length) {
        fn(data, null);
        return;
      }

      results.forEach(function (r) {
        if (post) { post(r); }
        mapped.push({
          number: r.number
        , wireless: 'y' === r.wless
        , carrier: carriers.lookupBySmsGateway(r.sms_address) || carriers.lookupByComment(r.carrier_name)
        , carrierComment: r.carrier_name
        , smsGateway: r.sms_address
        , mmsGateway: r.mms_address
        });
      });

      fn(null, results);
    }
  );
}

function one(request, jar, number, opts, fn, pre, post) {
  many(request, jar, [number], opts, function (err, many) {
    fn(err, many && many.length && many[0]);
  }, pre, post);
}

module.exports.one = one;
module.exports.many = many;
