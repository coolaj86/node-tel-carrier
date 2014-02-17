'use strict';

var request = require('request')
  , allGateways
  ;

request.get('http://tel-carrier.coolaj86.com/gateways', function (err, req, data) {
  try {
    allGateways = JSON.parse(data);
  } catch(e) {
    // ignore
    allGateways = {};
  }
});

function updateRegistry(number, map, opts) {
  opts = opts || {};

  if (!allGateways) {
    setTimeout(function () {
      updateRegistry(number, map, opts);
    }, 500);
    return;
  }

  var data = { gateways: {}, numbers: {} }
    ;

  if ((map.smsGateway && !(allGateways[map.carrier]||{}).sms) || (map.mmsGateway && !(allGateways[map.carrier]||{}).mms)) {
    data.gateways[map.carrier] = { sms: (map.smsGateway||'').replace(/.*@/, ''), mms: (map.mmsGateway||'').replace(/.*@/, '') };
  }

  data.numbers[number] = { wireless: map.wireless, carrier: map.carrier };

  if (false === opts.authoritatize) {
    delete data.gateways;
    delete data.numbers[number].carrier;
    delete data.numbers[number].wireless;
  }

  allGateways[map.carrier] = data.gateways[map.carrier];
  request.post('http://tel-carrier.coolaj86.com/analytics', { json: data }, function (/*err, req, data*/) {
    // ignore
  });
}

module.exports.create = function (opts) {
  var jar = request.jar()
    , services
    , service
    ;

  services = require('./services');
  service = services[opts.service];

  // TODO move
  function normalize(number, map/*, opts*/) {
    map.number = '+1' + /(?=\+?1)?(\d{10})$/.exec(String(map.number))[1];
    if (map.smsGateway) {
      map.smsGateway = map.number.replace(/^\+1/, '') + map.smsGateway.replace(/.*@/, '@');
    }
    if (map.mmsGateway) {
      map.mmsGateway = map.number.replace(/^\+1/, '') + map.mmsGateway.replace(/.*@/, '@');
    }
    return map;
  }
  
  return {
    lookup: function (number, fn) {
      service(request, jar, number, opts, function (err, map, opts) {
        if (map) {
          map = normalize(number, map, opts);
        }
        updateRegistry(number, map, opts);
        fn(err, map);
      });
    }
  };
};
