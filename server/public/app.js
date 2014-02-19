$(function () {
  'use strict';

  var rePhone = /(?=^|\D)(\+?1)?\s*[\-\.]?\s*\(?\s*(\d{3})\s*\)?\s*[\-\.]?\s*(\d{3})\s*[\-\.]?\s*(\d{4})(?=\D|$)/g
    , numbersCache = {}
    , lock
    , token
    ;

  function log(redThing) {
    $('table').append('<tr><td>' + redThing + '</td></tr>\n');
    //$('table').append('<tr><td>' + redThing + '</td><td>' + (blueThing || '') + '</td></tr>\n');
  }

  function setNumber(number, info) {
    var key = String(number).replace(/.*(\d{10})$/, '$1')
      ;

    numbersCache[key] = info;
  }
  function getNumber(number) {
    var key = String(number).replace(/.*(\d{10})$/, '$1')
      ;

    return numbersCache[key];
  }

  function getNumbers(numbers, fn) {
    if (lock) {
      token = setTimeout(function () {
        getNumbers(numbers, fn);
      }, 100);
      return;
    }
    lock = true;

    var getUrl = '/lookup?numbers='
      , newNumbers = []
      ;

    function missing(n) { return !getNumber(n); }
    newNumbers = numbers.filter(missing);

    function gotNumbers(nums) {
      nums.forEach(function (info) {
        setNumber(info.number, info);
      });
      fn(numbers.filter(getNumber).map(function (number) {
        return getNumber(number);
      }), numbers.filter(missing));
      lock = false;
    }

    if (0 === newNumbers.length) {
      gotNumbers([]);
      return;
    }

    // if total url length exceeds 2000, use a POST (10 digits + ',' === 11)
    if (getUrl.length + (newNumbers.length * 11) > 2000) {
      $.ajax('/lookup', 
      { data: JSON.stringify({ numbers: newNumbers })
      , contentType: 'application/json'
      , type: 'POST'
      }).then(gotNumbers);
    } else {
      $.get(getUrl + newNumbers.join(',')).then(gotNumbers);
    }
  }

  function parseNumbers() {
    var parts
      , phone
      , text = $('textarea.js-numbers').val()
      , formatted = []
      , onesies = []
      , onesie
      , numbers = []
      , numbersMap = {}
        // must be new RegExp each time, btw
      , rePhoneLoop = new RegExp(rePhone)
      ;

    while ((parts = rePhoneLoop.exec(text)) !== null) {
      phone = '(' + parts[2] + ') ' + parts[3] + '-' + parts[4];
      onesie = parts[2].toString() + parts[3] + parts[4];

      if (!numbersMap[phone]) {
        numbersMap[phone] = true;
        numbers.push(parts);
        formatted.push(phone);
        onesies.push(onesie);
      }
    }

    $('table').html('');
    $('.js-nums-length').text(numbers.length);
    formatted.sort().forEach(function (phone) {
      log(phone);
    });

    return onesies;
  }

  function smsFirst(a, b) {
    if (a.smsGateway && !b.smsGateway) {
      return -2;
    } else if (!a.smsGateway && b.smsGateway) {
      return 2;
    } else {
      if ((a.carrier || a.carrierComment).toLowerCase() > (b.carrier || b.carrierComment).toLowerCase()) {
        return 1;
      } else if ((b.carrier || b.carrierComment).toLowerCase() > (a.carrier || a.carrierComment).toLowerCase()) {
        return -1;
      } else {
        if (a.number > b.number) {
          return 0.5;
        } else if (b.number > a.number) {
          return -0.5;
        } else {
          return 0;
        }

      }
    }
  }

  function selectEmail() {
    var email = $('[name="email"]').val()
      , provider = $('[name="provider"]').val()
      ;

    if (/@(gmail|hotmail|live|outlook|msn|yahoo|ymail)\.com/i.test(email)) {
      provider = 'auto';
      $('[name="provider"]').val(provider);
      return;
    }

    if ('auto' === provider) {
      $('[name="provider"]').val('other');
    }
  }

  function doWork(onesies, fn) {
    getNumbers(onesies, function (data, badNums) {
      if (badNums.length) {
        console.error('bad numbers', badNums.length);
        console.error('bad numbers', badNums);
      }
      console.log('data.length', data.length);
      $('table').html('');
      log('info.number', 'info.smsGateway');

      data.sort(smsFirst).forEach(function (info, i) {
        if (!info) {
          console.log(i);
          console.log(data);
        }
        log(info.smsGateway || ('<b>' + info.number + ' - ' + (info.carrier || info.carrierComment).substr(0, 20) + '</b>'));
      });
      $('code.js-results').html(JSON.stringify(data, null, '  '));

      if (fn) {
        fn(data, badNums);
      }
    });
  }

  $('body').on('submit', '.js-form', function (ev) {
    ev.preventDefault();
    ev.stopPropagation();

    doWork(parseNumbers());
  });

  $('body').on('submit', '.js-msg-form', function (ev) {
    ev.preventDefault();
    ev.stopPropagation();

    var data = {}
      , provider = $('[name="provider"]').val()
        // must be a new instance each exec
      , phone = new RegExp(rePhone).exec($('input[name="phone"]').val())
      ;

    data.phone = phone && (phone[2].toString() + phone[3] + phone[4]);
    data.email = $('input[name="email"]').val();
    data.password = $('input[name="password"]').val();
    data.numbers = parseNumbers();
    data.emails = [];
    data.sms = $('textarea[name="sms"]').val();

    if (!data.email || !data.password) {
      window.alert("We don't send messages from our own server. We need your email address and password because the text messages will be sent using your email. We won't send you spam or store your password.");
      return;
    }

    if (!data.sms) {
      window.alert("Awww... how cute, you tried to send an empty message to your friends.");
      return;
    }

    if (0 === data.numbers.length) {
      window.alert("Awww... how cute, you don't have any friends to send you message to.");
      return;
    }

    if (!data.phone) {
      window.alert("To prevent spam we require a valid phone number");
      return;
    }

    if ('other' === provider) {
      window.alert('Please select your email service provider');
      return;
    }

    if ('unsupported' === provider) {
      window.alert('Try creating a free gmail account');
      return;
    }

    if ('auto' !== provider) {
      data.service = provider;
    }

    console.log(data);

    $.ajax('/sms', 
      { data: JSON.stringify(data)
      , contentType: 'application/json'
      , type: 'POST'
      }
    ).then(function (data) {
      // should have deliverable and undeliverable
      console.log(data);
      if (data.success) {
        window.alert('Sent your message. :-)');
      } else {
        window.alert('Error: ' + data.err);
      }
    });
  });

  // TODO ajax get the list of numbers that haven't been gotten yet
  $('body').on('keyup', 'textarea[name="sms"]', function (ev) {
    ev.preventDefault();
    ev.stopPropagation();

    var sms = $('textarea[name="sms"]').val()
      ;

    $('.js-msg-length').text(sms.length);

    if (sms.length > 140) {
      $('.js-msg-length').css({ color: 'red' });
    } else {
      $('.js-msg-length').css({ color: 'black' });
    }
  });

  $('body').on('change', '[name="provider"]', function (ev) {
    ev.preventDefault();
    ev.stopPropagation();

    selectEmail();
  });
  $('body').on('change', '[name="email"]', function (ev) {
    ev.preventDefault();
    ev.stopPropagation();

    selectEmail();
  });
  $('body').on('keyup', '[name="email"]', function (ev) {
    ev.preventDefault();
    ev.stopPropagation();

    selectEmail();
  });

  $('body').on('keyup', 'textarea[name="numbers"]', function (ev) {
    ev.preventDefault();
    ev.stopPropagation();

    doWork(parseNumbers());
  });
});
