'use strict';

var carriers = require('../carriers')
  ;

module.exports = function (request, jar, number, opts, fn) {
  request.post(
    'http://www.freecarrierlookup.com/'
  , { form:
      { cc: 1 // country code?
      , phonenum: number
      , error: true
      , x: 95 // ???
      , y: 10 // ???
      }
    , jar: jar
    }
  , function (err, req, data) {
      var str = /yellowbox[^>]+>([^\/]+)<\//.exec(data)[1]
        , lines
        , map = {}
        ;

      lines = str.trim().replace(/\s*<br>\s*/g, '\n').split(/\n/g);
      lines.forEach(function (line) {
        var pair = line.split(/\s*:\s*/)
          ;

        map[pair[0]] = pair[1];
      });

      fn(null, {
        number: map['Phone Number']
      , wireless: 'n' !== map['Is Wireless']
      , carrier: carriers.lookupBySmsGateway(map['SMS Gateway Address']) || carriers.lookupByComment(map.Carrier)
      , carrierComment: map.Carrier
      , smsGateway: map['SMS Gateway Address']
      , mmsGateway: map['MMS Gateway Address']
      });
    }
  );
};
