// Define globals we would usually get from Django
global.SETTINGS = {
  isAuthenticated: true,
  name: "full name",
  username: "jane"
};

// Make sure window and document are available for testing
require('jsdom-global')();

// required for interacting with react-mdl components
require('react-mdl/extra/material.js');
