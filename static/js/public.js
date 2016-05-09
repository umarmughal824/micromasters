/* eslint-disable no-unused-vars, no-undef, no-var */
__webpack_public_path__ = `http://${SETTINGS.host}:8078/`;  // eslint-disable-line no-undef, camelcase

require("bootstrap");

// jquery things
require("./public/jquery.raty.js");

// other code
require("./public/core.js");
require("./public/site.js");

// jquery components
require("./public/components/raty.js");

// make the thing work
(function(document, window, $) {
  'use strict';
  var Site = window.Site;
  $(document).ready(function() {
    Site.run();
  });
})(document, window, jQuery);
