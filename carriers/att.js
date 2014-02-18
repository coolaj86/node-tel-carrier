'use strict';

module.exports = {
  name: 'att'
, smsGateway: 'txt.att.net'
, mmsGateway: 'mms.att.net'
, isWireless: null
, test: function test(number, string) {
    var re = /\bAT\s*&?\s*T\b/i
      ;

    return re.test(string);
  }
};
