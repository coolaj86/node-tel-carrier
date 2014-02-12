'use strict';

var request = require('request')
  , carr
  , cmap
  ;

request.get('http://tel-carrier.coolaj86.com/carriers', function (err, req, data) {
  try {
    carr = JSON.parse(data);
  } catch(e) {
    // ignore
    carr = [];
  }

  cmap = {};
  carr.forEach(function (c) {
    cmap[c.carrierComment] = c;
  });
});

function updateRegistry(map, opts) {
  opts = opts || {};
  if (!cmap) {
    setTimeout(function () {
      updateRegistry(map, opts);
    }, 500);
    return;
  }

  if (!map || !map.carrierComment) {
    return;
  }

  var json
    ;
    
  json = {
    carrier: map.carrier
  , carrierComment: map.carrierComment
  , typeComment: map.typeComment
  , smsGateway: (map.smsGateway||'').replace(/.*@/, '')
  , mmsGateway: (map.mmsGateway||'').replace(/.*@/, '')
  , wireless: map.wireless
  };

  if (false === opts.authoritatize) {
    // these values are inferred when non-authoritative
    delete json.mmsGateway;
    delete json.smsGateway;
    delete json.carrier;
    delete json.wireless;
    json.authoritative = false;
  }

  cmap[json.carrierComment] = json;
  request.post('http://tel-carrier.coolaj86.com/carriers', { json: json }, function (/*err, req, data*/) {
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
  
  return {
    lookup: function (number, fn) {
      service(request, jar, number, opts, function (err, map, opts) {
        updateRegistry(map, opts);
        fn(err, map);
      });
    }
  };
};
