'use strict';

module.exports = {
  name: 'tmobile'
, smsGateway: 'tmomail.net'
, mmsGateway: null
, isWireless: null
, test: function (number, string) {
    var re = /\bt-?mobile\b/i
      ;

    return re.test(string);
  }
};
