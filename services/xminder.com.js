'use strict';

var carriers = require('tel-carrier-gateways')
  ;

/*
{ success: true,
  data:
   { number: '8013604427',
     status: 'YES',
     carrier_name: 'Verizon Wireless',
     carrier_id: '5',
     sms_address: '8013604427@vtext.com',
     mms_address: '8013604427@vzwpix.com' }
}
 */
module.exports = function (request, jar, number, opts, fn) {
  request.get(
    'http://www.xminder.com/number.check.php?number=' + number
  , { jar: jar }
  , function (err, req, data) {
      if ('string' === typeof data) {
        try {
          data = JSON.parse(data);
        } catch(e) {
          fn(e);
          return;
        }
      }

      if (!data.success) {
        // probably over daily quota
        fn(data);
        return;
      }

      fn(null, {
        number: data.data.number
      , wireless: 'YES' === data.data.status
      , carrierComment: data.data.carrier_name
      , carrier: carriers.lookupBySmsGateway(data.data.sms_address) || carriers.lookupByComment(data.data.carrier_name)
      , smsGateway: data.data.sms_address
      , mmsGateway: data.data.mms_address
      });
    }
  );
};
