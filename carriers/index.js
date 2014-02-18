'use strict';

var carriers
  ;

carriers =
[ require('./verizon')
, require('./att')
, require('./tmobile')
, require('./sprint')
, require('./virgin')
, require('./cingular')
, require('./sprint')
, require('./nextel')
, require('./uscellular')
, require('./suncom')
, require('./powertel')
, require('./alltel')
, require('./metropcs')
, require('./cricket')
, require('./boost')
];

function lookupByComment(comment) {
  var name
    ;

  if (!comment) {
    return;
  }

  carriers.some(function (carrier) {
    if (new RegExp(carrier.name, 'i').test(comment.replace(/\W/, ''))) {
      name = carrier.name;
      return true;
    }
  });

  return name;
}

function lookupBySmsGateway(gateway) {
  var name
    ;

  if (!gateway) {
    return;
  }

  carriers.some(function (carrier) {
    if (carrier.smsGateway) {
      if (new RegExp(carrier.smsGateway, 'i').test(gateway)) {
        name = carrier.name;
        return true;
      }
    }
  });

  return name;
}

function lookup(number, type, map) {
  var ctype = (type||'').replace(/-/, '').replace(/\s+/g, ' ')
    ;

  carriers.some(function (carrier) {
    function isWireless(number, string) {
      if (/wireless|pcs|cellular/i.test(string)) {
        return true;
      }
    }

    function test(number, string) {
      var re = new RegExp(carrier.name, 'i')
        ;

      return re.test(string);
    }

    if ((carrier.test||test)(number, ctype)) {
      if ((carrier.isWireless||isWireless)(number, ctype)) {
        map.wireless = true;
      }

      map.carrier = carrier.name;
      if (map.wireless) {
        if (carrier.smsGateway) {
          map.smsGateway = number + '@' + carrier.smsGateway; 
        }
        if (carrier.mmsGateway) {
          map.mmsGateway = number + '@' + carrier.mmsGateway; 
        }
      }

      return true;
    }
  });

  return map;
}

module.exports.carriers = carriers;
module.exports.lookup = lookup;
module.exports.lookupBySmsGateway = lookupBySmsGateway;
module.exports.lookupByComment = lookupByComment;
