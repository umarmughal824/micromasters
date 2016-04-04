// Define globals we would usually get from Django
global.SETTINGS = {
  isAuthenticated: true,
  name: "full name"
};

// Make sure window and document are available for testing
require('jsdom-global')();
