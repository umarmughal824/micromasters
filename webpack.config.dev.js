var webpack = require('webpack');
var path = require("path");
var sharedConfig = require(path.resolve("./webpack.config.shared.js"));

module.exports = {
  context: __dirname,
  entry: Object.assign({}, {
    'hot':  'webpack-dev-server/client?http://0.0.0.0:3000',
    'reload': 'webpack/hot/only-dev-server',
  }, sharedConfig.entry ),
  output: sharedConfig.output,
  module: sharedConfig.module,
  sassLoader: sharedConfig.sassLoader,
  resolve: sharedConfig.resolve,

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': '"development"'
      }
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'common',
      minChunks: 2,
    }),

  ],
  devtool: 'source-map'
};
