import webpack from 'webpack';

import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import autoprefixer from 'autoprefixer';
import * as path from 'path';

const _capitalize = require('lodash/capitalize');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

import failPlugin from 'webpack-fail-plugin';

import externals from './externals';
import transformTsConfigPaths from '../transformTSPaths';
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const globalSassRegex = /(toastr)\.scss$/;
const aliases = transformTsConfigPaths();

function getApiStageVariables(apiStage) {
  switch (apiStage) {
    case 'prod':
      return {
        __API_BASE_URL__: '"https://api.creditiq.com"',
        __SOCKET_BASE_URL__: '"https://socket.creditiq.com"',
        __SPLIT_API_KEY__: '"45kigfkjph2hipkm0p92l1si72og3ooov32j"',
        __SENTRY_URL__: '"https://1cd04e434335429085e3ab6780e2b77a@sentry.io/148147"',
        __NEW_RELIC_APP_ID__: '"51898835"',
      }
    case 'staging':
      return {
        __API_BASE_URL__: '"https://api.staging.creditiq.com"',
        __SOCKET_BASE_URL__: '"https://socket.staging.creditiq.com"',
        __SPLIT_API_KEY__: '"qrseg78md8q2go6gq37usd02s4cutptk07qn"',
        __SENTRY_URL__: '"https://6f7ddaa1250d46c1bc523d538d6c2726@sentry.io/148097"',
        __NEW_RELIC_APP_ID__: '"51902382"',
      }

    case 'dev':
      return {
        __API_BASE_URL__: '"https://api.dev.creditiq.com"',
        __SOCKET_BASE_URL__: '"https://socket.dev.creditiq.com"',
        __SPLIT_API_KEY__: '"4qd9s8hum9s4jereec5b2218rfg7i7b405nd"',
        __SENTRY_URL__: '""',
        __NEW_RELIC_APP_ID__: '""',
      }
    case 'local':
      return {
        __API_BASE_URL__: '"http://localhost:3000"',
        __SOCKET_BASE_URL__: '"http://localhost:8888"',
        __SPLIT_API_KEY__: '"4qd9s8hum9s4jereec5b2218rfg7i7b405nd"',
        __SENTRY_URL__: '""',
        __NEW_RELIC_APP_ID__: '""',
      }
    default:
      return {
        __API_BASE_URL__: '""',
        __SOCKET_BASE_URL__: '""',
        __SPLIT_API_KEY__: '"4qd9s8hum9s4jereec5b2218rfg7i7b405nd"',
        __SENTRY_URL__: '""',
        __NEW_RELIC_APP_ID__: '""',
      }
  }
}

export default ({
  isDev,
  isDemo,
  apiStage,
  isOffline,
  isLibrary,
}) => {
  const entry = [
    ...(!isLibrary ? ['whatwg-fetch'] : []),
    ...(isDev && ['./src/app/webpack-public-path', 'webpack-hot-middleware/client?reload=true'] || []),
    isLibrary ? './src/lib/index' : './src/app/index'
  ];
  const distPath = path.resolve(__dirname, `../dist/`);

  const output = isDev ? {
    path: `${__dirname}/src`, // Note: Physical files are only output by the production build task `npm run build`.
    publicPath: '/',
    filename: 'bundle.js'
  } : isLibrary ? {
    path: distPath,
    publicPath: '/',
    filename: '[name].js',
    sourceMapFilename: '[file].map',
    libraryTarget: 'commonjs2'
  } : {
    path: path.resolve(distPath, `${isDemo ? 'demo' : 'main'}`),
    publicPath: '/',
    filename: '[name].[chunkhash].js',
    sourceMapFilename: '[file].map'
  };

  let __TITLE_ENV__ = '"';
  if (isDev) {
    __TITLE_ENV__ += ' - Dev';
  }
  if (isOffline) {
    __TITLE_ENV__ += ' - Offline';
  }
  if (isDemo) {
    __TITLE_ENV__ += ' - Demo';
  }
  if (!!apiStage) {
    __TITLE_ENV__ += ` - ${_capitalize(apiStage)}`;
    if (isDev) {
      __TITLE_ENV__ += ' API';
    }
  }
  __TITLE_ENV__ += '"';

  const isProdNotDemo = apiStage === 'prod';

  const plugins = [
    // isDev && new BundleAnalyzerPlugin() || (() => {}),

    ...(!isDev && [
      failPlugin
    ] || []),

    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(isDev ? 'development' : 'production'), // Tells React to build in either dev or prod modes. https://facebook.github.io/react/downloads.html (See bottom)
      __MOCK_DATA__: !!(isDemo || !apiStage),
      __DEMO__: !!isDemo,
      __DEV__: !!isDev,
      __USE_FULLSTORY__: !isDev,
      __OFFLINE_MODE__: !!(isDev && isOffline),
      __TITLE_ENV__,
      __STRIPE_KEY__: isProdNotDemo ?
        '"pk_live_XNg1WHvwod1vdxnreJUO7o4y"' : '"pk_test_mwVRxa6S70EAv9uFNBYbNdml"',
      __MIXPANEL_TOKEN__: isProdNotDemo ?
        '"96b1008525b5f67a1f7ccd6fbae8db70"' : '""',
      ...getApiStageVariables(apiStage)
    }),

    ...(isDev && [
      new webpack.HotModuleReplacementPlugin(),
    ] || []),

    new CheckerPlugin(),
    new MiniCssExtractPlugin({
      filename: isDev ? 'app.css' : `[name]${!isLibrary && '.[contenthash]' || ''}.css`,
    }),
    new HtmlWebpackPlugin({ // Create HTML file that includes references to bundled CSS and JS.
      template: '!!ejs-compiled-loader!src/app/index.ejs',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: !isDev,
        useShortDoctype: !isDev,
        removeEmptyAttributes: !isDev,
        removeStyleLinkTypeAttributes: !isDev,
        keepClosingSlash: !isDev,
        minifyJS: !isDev,
        minifyCSS: !isDev,
        minifyURLs: !isDev
      },
      inject: true
    }),
  ];

  const extractTextOptionsNonGlobal = [
    isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
    {
      loader: 'typings-for-css-modules-loader',
      options: {
        namedExport: true,
        camelCase: true,
        sourceMap: true,
        modules: true,
        importLoaders: 1,
        localIdentName: '[name]__[local]___[hash:base64:5]'
      }
    },
    {
      loader: 'postcss-loader',
      options: {
        plugins: (loader) => [
          autoprefixer(),
        ],
        sourceMap: true
      }
    },
    'resolve-url-loader?sourceMap',
    'sass-loader?sourceMap'
  ];

  // yaya it's dirty but it's also DRY. DRY and dirty suckas.
  const extractTextOptionsGlobal = JSON.parse(JSON.stringify(extractTextOptionsNonGlobal));
  const extractTextOptionsCss = JSON.parse(JSON.stringify(extractTextOptionsNonGlobal));
  extractTextOptionsCss[1] = extractTextOptionsGlobal[1] = {
    loader: 'css-loader',
    options: {
      modules: false,
      sourceMap: true,
      importLoaders: 1,
      localIdentName: '[name]__[local]___[hash:base64:5]'
    }
  };
  extractTextOptionsCss.splice(extractTextOptionsCss.indexOf('sass-loader'), 1);

  const module = {
    rules: [{
        test: /\.tsx?$/,
        use: [{
            loader: 'babel-loader',
          },
          {
            loader: 'ts-loader',
            options: {
              compilerOptions: {
                outDir: './'
              }
            }
          }
        ]
      },
      {
        test: /\.js$/,
        enforce: 'pre',
        use: ["source-map-loader"]
      },
      {
        test: /\.js$/,
        exclude: /node_modules\/(?!(@creditiq\/?|download\-in\-browser)).*/,
        use: ['babel-loader']
      },
      {
        test: /\.eot(\?v=\d+.\d+.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            'name': 'assets/fonts/[name].[ext]'
          }
        }
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'application/font-woff',
            name: 'assets/fonts/[name].[ext]'
          }
        }]
      },
      {
        test: /\.ttf(\?v=\d+.\d+.\d+)?$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'application/octet-stream',
            name: 'assets/fonts/[name].[ext]'
          }
        }]
      },
      {
        test: /\.svg(\?v=\d+.\d+.\d+)?$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'image/svg+xml',
            name: 'assets/fonts/[name].[ext]'
          }
        }],
      },
      {
        test: /\.(jpe?g|png|gif|pdf)$/i,
        use: [{
          loader: 'file-loader',
          options: {
            name: 'assets/images/[name].[ext]'
          }
        }]
      },
      {
        test: /\.ico$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: 'assets/icons/[name].[ext]'
          }
        }]
      },
      {
        test: (absPath) => /\.scss$/.test(absPath) && !globalSassRegex.test(absPath),
        use: extractTextOptionsNonGlobal
      },
      {
        test: globalSassRegex,
        use: extractTextOptionsGlobal
      },
      {
        test: /\.css$/,
        use: extractTextOptionsCss
      }
    ]
  };

  // webpack config object
  const config = {
    optimization: {
      splitChunks: {
        cacheGroups: {
          styles: {
            name: 'styles',
            test: /\.css$/,
            chunks: 'all',
            enforce: true
          }
        }
      }
    },
    resolve: {
      extensions: ['.js', '.ts', '.tsx'],
      alias: aliases,
      symlinks: !isDev
    },
    devtool: isDev ? 'source-map' : 'none', // more info:https://webpack.github.io/docs/build-performance.html#sourcemaps and https://webpack.github.io/docs/configuration.html#devtool
    entry,
    target: 'web', // necessary per https://webpack.github.io/docs/testing.html#compile-and-test
    output,
    plugins,
    module,
    mode: isDev ? 'development' : 'production',
  };
  if (!isDev) {
    config.externals = {
      ...(isLibrary && {
        'react': 'commonjs react', // this line is just to use the React dependency of our parent-testing-project instead of using our own React.
        '@creditiq/item': 'commonjs @creditiq/item',
        '@creditiq/split-web-client': 'commonjs @creditiq/split-web-client',
        'global.scss': 'commonjs global.scss',
        '_variables.scss': 'commonjs _variables.scss',
        '_mixins.scss': 'commonjs _mixins.scss',
      }),
      ...externals
    };
  }
  return config;
};