import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import Visualizer from 'webpack-visualizer-plugin';
import getEntry from '../utils/getEntry';
import getTheme from '../utils/getTheme';
import getCSSLoaders from '../utils/getCSSLoaders';
import addExtraBabelIncludes from '../utils/addExtraBabelIncludes';
import {
  getBabelOptions,
  baseSvgLoader,
  spriteSvgLoader,
  defaultDevtool,
  getResolve,
  getFirstRules,
  getCSSRules,
  getLastRules,
  getCommonPlugins,
  node,
} from './common';

export default function (args, appBuild, config, paths) {
  const { watch, debug, analyze } = args;
  const NODE_ENV = debug ? 'development' : process.env.NODE_ENV;

  const {
    publicPath = '/',
    library = null,
    libraryTarget = 'var',
    devtool = debug ? defaultDevtool : false,
  } = config;

  const babelOptions = getBabelOptions(config);
  const cssLoaders = getCSSLoaders(config);
  const theme = getTheme(process.cwd(), config);

  // Support hash
  const jsFileName = config.hash ? '[name].[chunkhash:8]' : '[name]';
  const cssFileName = config.hash ? '[name].[contenthash:8]' : '[name]';

  const output = {
    path: appBuild,
    filename: (config.assetsPath && config.assetsPath.js ? config.assetsPath.js : 'assets/js/')  + `${jsFileName}.js`,
    publicPath,
    libraryTarget,
    chunkFilename: (config.assetsPath && config.assetsPath.js ? config.assetsPath.js : 'assets/js/') + `${jsFileName}.async.js`,
  };

  if (library) output.library = library;

  const finalWebpackConfig = {
    bail: true,
    devtool,
    entry: getEntry(config, paths.appDirectory, /* isBuild */true),
    output,
    ...getResolve(config, paths),
    module: {
      rules: [
        ...getFirstRules({ config, paths, babelOptions }),
        ...getCSSRules('production', { config, paths, cssLoaders, theme }),
        ...getLastRules({ paths, babelOptions }),
      ],
    },
    plugins: [
      ...(watch ? [] : [
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.optimize.DedupePlugin(),
      ]),
      new ExtractTextPlugin({
        filename: (config.assetsPath && config.assetsPath.css ? config.assetsPath.css : 'assets/css/')  + `${cssFileName}.css`,
        allChunks: true,
      }),
      ...getCommonPlugins({
        config,
        paths,
        appBuild,
        NODE_ENV,
      }),
      ...(debug ? [] : [new webpack.optimize.UglifyJsPlugin({
        compress: {
          screw_ie8: true, // React doesn't support IE8
          warnings: false,
        },
        mangle: {
          screw_ie8: true,
        },
        output: {
          comments: false,
          screw_ie8: true,
          ascii_only: true,
        },
      })]),
      ...(analyze ? [new Visualizer()] : []),
    ],
    externals: config.externals,
    node,
  };

  let _baseSvgLoader = baseSvgLoader(config)
  if (config.svgSpriteLoaderDirs) {
    _baseSvgLoader.exclude = config.svgSpriteLoaderDirs;
    spriteSvgLoader.include = config.svgSpriteLoaderDirs;
    finalWebpackConfig.module.rules.push(_baseSvgLoader);
    finalWebpackConfig.module.rules.push(spriteSvgLoader);
  } else {
    finalWebpackConfig.module.rules.push(_baseSvgLoader);
  }

  const prodConfig = addExtraBabelIncludes(config, finalWebpackConfig, paths, config.extraBabelIncludes, babelOptions)
  return prodConfig;
}
