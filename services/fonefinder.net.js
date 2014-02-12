'use strict';

var carriers = require('../carriers')
  ;

module.exports = function (request, jar, number, opts, fn) {
  var url
    , numbers
    ;

  numbers = /(\d{3})[^\d]*(\d{3})[^\d]*(\d{4})$/.exec(number);
  url = 'http://www.fonefinder.net/findome.php'
    + '?npa=' + numbers[1]
    + '&nxx=' + numbers[2]
    + '&thoublock=' + numbers[3]
    + '&usaquerytype=Search+by+Number&cityname='
    ;

  request.get(
    url
  , { jar: jar }
  , function (err, req, data) {
      var lines
        , map = {}
        ;
        
      lines = /TABLE.*?>([\s\S]*)<\/TABLE/.exec(data)[1];
      lines = /TR.*?TR.*?>([\s\S]*)<TR/.exec(lines)[1];
      lines = lines
        .replace(/<a.*?>(.*?)<\/a>/ig, '$1')
        .replace(/<td>/ig, '\n')
        .replace(/<img.*>/ig, '\n')
        .replace(/<\/td>/ig, '\n')
        .trim()
        .split(/\n/g)
        ;

      // lines 0 & 1 are area code and prefix
      // lines 2 & 3 are bogus
      // lines 4 & 5 
      map.number = number;
      // wireless
      // carrier
      carriers.lookup(number, lines[4], map);
      carriers.lookup(number, lines[5], map);
      //map.carrier = carriers.lookupBySmsGateway(map.smsGateway) || carriers.lookupByComment(lines[4]);
      map.carrierComment = lines[4];
      map.typeComment = lines[5];
      fn(null, map, { authoritative: false });
    }
  ); 
};
