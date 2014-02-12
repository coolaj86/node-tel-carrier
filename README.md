node-tel-carrier
===================

Lookup the carrier and sms / mms gateway email addresses for a given phone number.

## Installation & Usage

```bash
npm install --save tel-carrier
```

```javascript
'use strict';

var TelCarrier = require('tel-carrier')
  , telCarrier
  ;
  
// you can get 15 free lookups with the demo account
// per ip address per 30 day period
telCarrier = TelCarrier.create({
  service: 'freecarrierlookup.com'
});

telCarrier.lookup('5551234567', function (err, data) {
  console.log(data);
});

/*
{ number: '5551234567',
  wireless: true,
  carrierComment: 'Verizon Wireless',
  carrier: 'verizon',
  smsGateway: '8013604427@vtext.com',
  mmsGateway: '8013604427@vzwpix.com' }
*/
```

## Services

  * freecarrierlookup.com
  * fonefinder.com
  * data24-7.com
  * xminder.com

### fonefinder.net

This service is updated every few months and is usually accurate.

Tracks Ported Numbers: NO

```json
{ service "fonefinder.net" }
```

Submit bugs to this repo if the sms and mms gateways are incorrect.

### data24-7.com

Requires an account. You can make 25 lookups for free.

Tracks Ported Numbers: YES

```json
{ service "data24-7.com"
, username: 'your-user-name'
, password: 'your-password'
}
```

### freecarrierlookup.com

You get 15 free lookups per ip address per 30 days.

The service is updated daily.

Tracks Ported Numbers: YES

```json
{ service: "freecarrierlookup.com" }
```

### xminder.com

Without an account you can lookup 5 numbers for free.

<http://www.xminder.com/products/carrier-lookup.html>

```json
{ service: "xminder.com" }
```

Note: there's an API key or a username / password, but their api sign-up didn't work when I tried.
