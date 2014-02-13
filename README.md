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

### GET /carriers

A full list of all carriers in the system based on their comment

```bash
curl http://tel-carrier.coolaj86.com/carriers
```

```json
[
  { "carrier": "verizon"
  , "carrierComment": "Billy Telco DBA Verizon Wireless"
  , "typeComment": "Wireless Prov"
  , "wireless": true
  , "smsGateway": "vtext.com"
  , "mmsGateway": "vpix.com"
  }
]
```

### POST /carriers

Update the carriers list

```bash
curl http://tel-carrier.coolaj86.com/carriers \
  -H 'Content-Type: application/json' \
  -d '{ "carrierComment": "Billy Telco DBA Verizon Wireless"
      , "typeComment": "Wireless Prov"
      , "wireless": true
      , "smsGateway": "vtext.com"
      , "mmsGateway": "vpix.com"
      }'
```

You'll get back what was updated or `null`

```json
{ "carrier": "verizon"
, "carrierComment": "Billy's Telco DBA Verizon Wireless"
, "typeComment": "Wireless Prov"
, "wireless": true
, "smsGateway": "vtext.com"
, "mmsGateway": "vpix.com"
}
```
