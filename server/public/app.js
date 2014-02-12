$(function () {
  'use strict';

  $('body').on('submit', '.js-form', function (ev) {
    ev.preventDefault();
    ev.stopPropagation();
    $.get('/lookup?number=' + $('.js-number').val(), function (data) {
      $('.js-result').val(JSON.stringify(data, null, '  '));
    });
  });
});
