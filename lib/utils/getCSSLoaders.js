'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = getCSSLoaders;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function getCSSLoaders(config) {
  var own = [];
  var nodeModules = [];
  var noCSSModules = [];

  var baseCSSOptions = {
    importLoaders: 1,
    sourceMap: !config.disableCSSSourceMap
  };

  if (process.env.NODE_ENV === "production") {
    // baseCSSOptions.minimize = true
  }

  if (config.disableCSSModules) {
    own.push({
      loader: require.resolve('css-loader'),
      options: baseCSSOptions
    });
  } else {
    own.push({
      loader: require.resolve('css-loader'),
      options: _extends({}, baseCSSOptions, {
        modules: true,
        localIdentName: '[local]___[hash:base64:5]'
      })
    });
  }
  nodeModules.push({
    loader: require.resolve('css-loader'),
    options: baseCSSOptions
  });
  noCSSModules.push({
    loader: require.resolve('css-loader'),
    options: baseCSSOptions
  });

  var postcssLoader = {
    loader: require.resolve('postcss-loader'),
    options: {
      // Necessary for external CSS imports to work
      // https://github.com/facebookincubator/create-react-app/issues/2677
      ident: 'postcss',
      plugins: function plugins() {
        return [require('postcss-flexbugs-fixes'), autoprefixer(config.autoprefixer || {
          browsers: ['>1%', 'last 4 versions', 'Firefox ESR', 'not ie < 9'],
          flexbox: 'no-2009'
        })].concat(_toConsumableArray(config.extraPostCSSPlugins ? config.extraPostCSSPlugins : []));
      }
    }
  };

  noCSSModules.push(postcssLoader);
  own.push(postcssLoader);
  nodeModules.push(postcssLoader);

  return {
    own: own,
    nodeModules: nodeModules,
    noCSSModules: noCSSModules
  };
}
module.exports = exports['default'];