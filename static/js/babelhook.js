const { babelSharedLoader } = require("../../webpack.config.shared");

require('babel-register')(babelSharedLoader.query);
