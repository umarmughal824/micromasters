var path = require("path");
var webpack = require("webpack");

module.exports = {
  config: {
    entry: {
      'dashboard': ['babel-polyfill', './static/js/entry/dashboard'],
      'financial_aid': './static/js/financial_aid/functions',
      'public': ['babel-polyfill', './static/js/entry/public'],
      'sentry_client': './static/js/entry/sentry_client.js',
      'style': './static/js/entry/style',
      'style_public': './static/js/entry/style_public',
      'zendesk_widget': './static/js/entry/zendesk_widget.js',
    },
    module: {
      loaders: [
        {
          test: /\.(svg|ttf|woff|woff2|eot|gif)$/,
          loader: 'url-loader'
        },
        {
          test: /\.scss$/,
          exclude: /node_modules/,
          loader: 'style!css!postcss!sass'
        },
        {
          test: /\.css$/,
          exclude: /node_modules/,
          loader: 'style!css'
        },
      ]
    },

    resolve: {
      modulesDirectories: ['node_modules'],
      extensions: ['', '.js', '.jsx'],
      alias: {
        react: path.resolve('./node_modules/react')
      }
    }
  },

  babelSharedLoader: {
    text: /\.jsx?$/,
    exclude: /node_modules/,
    loader: 'babel-loader',
    query: {
      "presets": ["latest", "react"],
      "ignore": [
        "node_modules/**"
      ],
      "plugins": [
        "transform-flow-strip-types",
        "react-hot-loader/babel",
        "transform-object-rest-spread",
        "transform-class-properties",
      ]
    }
  }
}
