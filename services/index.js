'use strict';

var services
  ;

services = {
  'xminder.com': require('./xminder.com')
, 'fonefinder.net': require('./fonefinder.net')
, 'data24-7.com': require('./data24-7.com')
, 'freecarrierlookup.com': require('./freecarrierlookup.com')
, 'tel-carrier-cache': require('./tel-carrier-cache')
};

module.exports = services;
