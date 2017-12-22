import { join } from 'path';

export default function (config, webpackConfig, paths, includes = [], babelOptions) {
  includes.forEach((include) => {
    webpackConfig.module.rules.push({
      test: /\.(js|jsx)$/,
      include: join(paths.appDirectory, include),
      exclude: config.babelExclude ? config.babelExclude : [],
      loader: 'babel',
      options: babelOptions,
    });
  });
  return webpackConfig;
}
