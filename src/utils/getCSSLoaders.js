import autoprefixer from 'autoprefixer';
export default function getCSSLoaders(config) {
  const own = [];
  const nodeModules = [];
  const noCSSModules = [];

  const baseCSSOptions = {
    importLoaders: 1,
    sourceMap: !config.disableCSSSourceMap,
  };

  if (process.env.NODE_ENV === "production") {
    // baseCSSOptions.minimize = true
  }

  if (config.disableCSSModules) {
    own.push({
      loader: require.resolve('css-loader'),
      options: baseCSSOptions,
    });
  } else {
    own.push({
      loader: require.resolve('css-loader'),
      options: {
        ...baseCSSOptions,
        modules: true,
        localIdentName: '[local]___[hash:base64:5]',
      },
    });
  }
  nodeModules.push({
    loader: require.resolve('css-loader'),
    options: baseCSSOptions,
  });
  noCSSModules.push({
    loader: require.resolve('css-loader'),
    options: baseCSSOptions,
  });

  const postcssLoader = {
    loader: require.resolve('postcss-loader'),
    options: {
      // Necessary for external CSS imports to work
      // https://github.com/facebookincubator/create-react-app/issues/2677
      ident: 'postcss',
      plugins: () => [
        require('postcss-flexbugs-fixes'),
        autoprefixer(config.autoprefixer || {
          browsers: [
            '>1%',
            'last 4 versions',
            'Firefox ESR',
            'not ie < 9', // React doesn't support IE8 anyway
          ],
          flexbox: 'no-2009',
        }),
        ...(config.extraPostCSSPlugins ? config.extraPostCSSPlugins : []),
      ],
    },
  };

  noCSSModules.push(postcssLoader);
  own.push(postcssLoader);
  nodeModules.push(postcssLoader);

  return {
    own,
    nodeModules,
    noCSSModules,
  };
}
