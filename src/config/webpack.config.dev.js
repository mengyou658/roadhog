import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import webpack from 'webpack';
import WatchMissingNodeModulesPlugin from 'react-dev-utils/WatchMissingNodeModulesPlugin';
import SystemBellWebpackPlugin from 'system-bell-webpack-plugin';
import { join } from 'path';
import getPaths from './paths';
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

export default function (config, cwd) {
  const publicPath = '/';
  const {
    library = null,
    libraryTarget = 'var',
    devtool = defaultDevtool,
  } = config;

  const babelOptions = getBabelOptions(config);
  const cssLoaders = getCSSLoaders(config);
  const theme = getTheme(process.cwd(), config);
  const paths = getPaths(cwd);

  const output = {
    path: paths.appBuild,
    filename: (config.assetsPath && config.assetsPath.js ? config.assetsPath.js : 'assets/js/') + '[name].js',
    publicPath,
    libraryTarget,
    chunkFilename: (config.assetsPath && config.assetsPath.js ? config.assetsPath.js : 'assets/js/') + '[name].async.js',
  };

  if (library) output.library = library;

  const dllPlugins = config.dllPlugin ? [
    new webpack.DllReferencePlugin({
      context: paths.appSrc,
      manifest: require(paths.dllManifest),  // eslint-disable-line
    }),
    new CopyWebpackPlugin([
      {
        from: join(paths.dllNodeModule, 'roadhog.dll.js'),
        to: join(paths.appBuild, 'roadhog.dll.js'),
      },
    ]),
  ] : [];

  const finalWebpackConfig = {
    devtool,
    entry: getEntry(config, paths.appDirectory),
    output,
    ...getResolve(config, paths),
    module: {
      rules: [
        ...getFirstRules({ config, paths, babelOptions }),
        ...getCSSRules('development', { config, paths, cssLoaders, theme }),
        ...getLastRules({ paths, babelOptions }),
      ],
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new CaseSensitivePathsPlugin(),
      new WatchMissingNodeModulesPlugin(paths.appNodeModules),
      new SystemBellWebpackPlugin(),
      ...dllPlugins,
      ...getCommonPlugins({
        config,
        paths,
        appBuild: paths.appBuild,
        NODE_ENV: process.env.NODE_ENV,
      }),
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

  return addExtraBabelIncludes(config, finalWebpackConfig, paths, config.extraBabelIncludes, babelOptions);
}
