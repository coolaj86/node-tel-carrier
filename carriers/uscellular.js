'use strict';

module.exports = {
  name: 'uscellular'
, smsGateway: 'email.uscc.net'
, mmsGateway: null
, isWireless: function () { return true; }
, test: function (number, string) {
    var re = /\b((u\.?s\.?\s*cellular)|(united\s*states\s*cellular))\b/i
      ;

    return re.test(string);
  }
};
