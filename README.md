Daplie is Taking Back the Internet!
--------------

[![](https://daplie.github.com/igg/images/ad-developer-rpi-white-890x275.jpg?v2)](https://daplie.com/preorder/)

Stop serving the empire and join the rebel alliance!

* [Invest in Daplie on Wefunder](https://daplie.com/invest/)
* [Pre-order Cloud](https://daplie.com/preorder/), The World's First Home Server for Everyone

node-tel-carrier
===================

Lookup the carrier and sms / mms gateway email addresses for a given phone number through a variety of services.

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

telCarrier.lookup('5551234567', function (err, info) {
  console.log(info);
});
```

Example Output

```javascript
{ number: '5551234567'
, wireless: true
, carrierComment: 'Verizon Wireless'
, carrier: 'verizon'
, smsGateway: '5551234567@vtext.com'
, mmsGateway: '5551234567@vzwpix.com'
, updated: 0
}
```

If `updated` exists it will be a timestamp in milliseconds.

## Services

  * freecarrierlookup.com
  * tel-carrier-cache
  * fonefinder.net
  * data24-7.com
  * xminder.com

### tel-carrier-cache

This is a slightly massaged local copy of fonefinder.net.

Tracks Ported Numbers: NO

<http://tel-carrier.coolaj86.com>

### fonefinder.net

This service is updated every few months and is usually accurate.

Tracks Ported Numbers: NO

<http://www.fonefinder.net/>

<http://fonescout.com/revsearch.php>

```json
{ service: "fonefinder.net" }
```

Submit bugs to this repo if the sms and mms gateways are incorrect.

### data24-7.com

Requires an account. You can make 25 lookups for free.

Tracks Ported Numbers: YES

<http://www.data24-7.com/signup.php>

```json
{ service "data24-7.com"
, username: "your-user-name"
, password: "your-password"
}
```

### freecarrierlookup.com

You get 15 free lookups per ip address per 30 days.

The service is updated daily.

Tracks Ported Numbers: YES

<http://www.freecarrierlookup.com/>

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

### carrierlookup.com

**Not Yet Implemented**

<https://www.carrierlookup.com/index.php/cpanel/apikeys>

<http://www.carrierlookup.com/index.php/api/lookup?key={#api_key}&number={#phone_number}>
