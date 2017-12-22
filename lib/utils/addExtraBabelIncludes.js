'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (config, webpackConfig, paths) {
  var includes = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
  var babelOptions = arguments[4];

  includes.forEach(function (include) {
    webpackConfig.module.rules.push({
      test: /\.(js|jsx)$/,
      include: (0, _path.join)(paths.appDirectory, include),
      exclude: config.babelExclude ? config.babelExclude : [],
      loader: 'babel',
      options: babelOptions
    });
  });
  return webpackConfig;
};

var _path = require('path');

module.exports = exports['default'];