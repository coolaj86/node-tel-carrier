$(function () {
  'use strict';

  $('body').on('submit', '.js-form', function (ev) {
    ev.preventDefault();
    ev.stopPropagation();

    var text = $('textarea.js-numbers').val()
      , lines
      , numbers = []
      , formatted = []
      , getUrl = '/lookup?numbers='
      ;

    console.log('text', text);
    lines = text.split(/\s*[,\n]+\s*/);
    console.log('lines.length', lines.length);
    lines.forEach(function (line) {
      var parts = /\s*(?=\+?\s*1)?[\-\.\(\s]*(\d{3})[\-\.\)\s]*(\d{3})[\-\.\s]*(\d{4})\s*(?=\D|$)/.exec(line)
        ;

      if (!parts) {
        console.warn(line);
        return;
      }

      numbers.push(parts[1].toString() + parts[2] + parts[3]);
      formatted.push('(' + parts[1] + ') ' + parts[2] + '-' + parts[3]);
    });
    console.log('numbers.length', numbers.length);
    
    $('.js-numbers').val(formatted.join('\n'));

    function onResult(data) {
      console.log('data.length', data.length);
      $('.js-result').text(JSON.stringify(data, null, '  '));
    }

    // if total url length exceeds 2000, use a POST (10 digits + ',' === 11)
    if (getUrl.length + (numbers.length * 11) > 2000) {
      $.ajax('/lookup', 
      { data: JSON.stringify({ numbers: numbers })
      , contentType: 'application/json'
      , success: onResult
      , type: 'POST'
      });
    } else {
      $.get(getUrl + numbers.join(','), onResult);
    }
  });
});
