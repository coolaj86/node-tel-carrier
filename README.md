# tel-carriers

# Install & Run Demo

```bash
git clone git@github.com:coolaj86/node-tel-carrier.git
pushd node-tel-carrier
git checkout demo-service

npm install
jade server/public/index.jade
node server
```

## API

### GET /lookup?numbers=8013605555,8012705555

Get info about said numbers.

```bash
curl http://tel-carrier.coolaj86.com/lookup?numbers=8013605555
```

```json
[
  {
    "number": "+18013605555",
    "wireless": true,
    "carrier": "verizon",
    "smsGateway": "8013605555@vtext.com",
    "mmsGateway": "8013605555@vzwpix.com",
    "carrierComment": "Verizon",
    "typeComment": "WIRELESS PROV"
  }
]
```

### GET /gateways

A full list of all gateways in the system

```bash
curl http://tel-carrier.coolaj86.com/gateways
```

```json
{ "verizon":
  { "sms": "vtext.com"
  , "mms": "vpix.com"
  }
}
```

### POST /analytics

Update the carriers list

```bash
curl http://tel-carrier.coolaj86.com/analytics \
  -X POST
  -H 'Content-Type: application/json' \
  -d '{ "gateways":
          { "verizon":
            { "sms": "vtext.com"
            , "mms": "vpix.com"
            }
          }
      , "numbers": {
          "+18013605555":
          { "carrier": "verizon"
          , "wireless": true
          }
        }
      }'
```

Note on email gateways: <http://stackoverflow.com/questions/1179854/limitations-on-sms-messages-sent-using-free-email-sms-gateways>
