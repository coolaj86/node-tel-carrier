function lookupViaGet() {
  curl 'http://tel-carrier.coolaj86.com:3010/lookup?number=18013604427'
  curl 'http://tel-carrier.coolaj86.com:3010/lookup?numbers=18013604427,7578805555,+13857225555'
}
#lookupViaGet

function lookupViaPost() {
  curl 'http://tel-carrier.coolaj86.com:3010/lookup' \
    -X POST \
    -H 'Content-Type: application/json' \
    -d '{ "numbers": [ 18013604427, "7578805555", "+13857225555" ] }'
}
#lookupViaPost

function updateAnalytics() {
  curl 'http://tel-carrier.coolaj86.com:3010/analytics' \
    -X POST \
    -H 'Content-Type: application/json' \
    -d '{ "numbers": { "+17578805555": { "carrier": "verizon", "wireless": true } }
        , "carriers": { "verizon": { "sms": "vtext.com", "mms": "vzwpix.com" } }
        }'
}
updateAnalytics

function getGateways() {
  curl 'http://tel-carrier.coolaj86.com:3010/gateways'
}
getGateways
