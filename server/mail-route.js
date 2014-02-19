'use strict';

var nodemailer = require('nodemailer')
  ;

function getGatewayAddresses(numbers, fn) {
  fn([ "8013604427@vtext.com" ]);
}

function route(app) {
  app.post('/sms', function (req, res) {
    if (!req.body.service) {
      req.body.service = 'SMTP';
    }
    if (
        !Array.isArray(req.body.numbers)
      || 'string' !== typeof req.body.sms
      || 'string' !== typeof req.body.email || /[,\s]/.test(req.body.email)
      || 'string' !== typeof req.body.password
      || 'string' !== typeof req.body.service
    ) {
      res.send({ error: "All of 'numbers', 'body', 'email', and 'password' must be present."});
      return;
    }

    getGatewayAddresses(req.body.numbers, function (addresses) {
      var transport
        , headers = {}
        , opts = {}
        , max = 160
        , tail = ' via tel-carrier'
        , bodyMax = max - tail.length
        ;

      headers.subject = '';
      headers.text = req.body.sms.substr(0, bodyMax) + tail;
      headers.bcc = addresses.join(',');
      headers.cc = req.body.email;
      headers.from = req.body.email;
      headers.replyTo = req.body.email;

      opts = {
        auth: {
          user: req.body.email
        , pass: req.body.password
        }
      };

      transport = nodemailer.createTransport(req.body.service, opts);

      // TODO send a report of hit / miss
      transport.sendMail(headers, function (err) {
        transport.close();

        if (!err) {
          res.send({ success: true });
          return;
        }

        console.log('\n[req.body]');
        console.log(req.body);
        console.log('\n[headers]');
        console.log(headers);
        console.log('\n[opts]');
        console.log(opts);

        console.error(err.toString());
        console.error(err);

        res.send(err);
      });
    });
  });
}

module.exports.route = route;
