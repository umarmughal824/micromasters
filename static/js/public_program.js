__webpack_public_path__ = `http://${SETTINGS.host}:8078/`;  // eslint-disable-line no-undef, camelcase

const $ = require('jquery');

require('slick-carousel');
// require('slick-carousel/slick/slick.scss');
// require('slick-carousel/slick/slick-theme.scss');

$(document).ready(function() {
  $('#faculty-carousel').slick({
    infinite: true,
    dots: true,
    slidesToShow: 2
  });
});
