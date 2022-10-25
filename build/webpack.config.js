// Generated using webpack-cli https://github.com/webpack/webpack-cli
const webpack = require('webpack');
const merge = require('webpack-merge');
const WorkboxWebpackPlugin = require('workbox-webpack-plugin');
const Base = require('./webpack.base');

/**
 * workbox-webpack-plugin文档`service worker`
 * https://developer.chrome.com/docs/workbox/modules/workbox-webpack-plugin/
 * https://webpack.docschina.org/guides/progressive-web-application/
 */

const isPre = process.env.NODE_ENV == 'pre';
const isTest = process.env.NODE_ENV == 'test';
const isDev = process.env.NODE_ENV == 'development';
const isProduction = process.env.NODE_ENV == 'production';

let webpack_config =  merge.merge(Base, {
  entry: './src/index.tsx',
  plugins: [
    // Add your plugins here
    // Learn more about plugins from https://webpack.js.org/configuration/plugins/
    new webpack.DefinePlugin({
      'process.env.WEB_ENV': `'${process.env.NODE_ENV}'`,
      // 'process.env.WEB_ENV': '"production"', // 在代码里面直接用process.env.WEB_ENV
    }),
  ],
});

module.exports = () => {
  if (isDev) {
    webpack_config = {
      ...webpack_config,
      mode: 'development',
      devServer: {
        open: true,
        port: 2001,
        compress: true,
        host: 'localhost',
        historyApiFallback: true, // 只要是接口命中404此时都会把index.html返回
        proxy: {
          '/demo': {
            target: 'http://localhost:8090',
            changeOrigin: true
          },
        },
      },
    }
  }
  if (isTest) {
    webpack_config = {
      ...webpack_config,
      mode: 'production',
      output: {
        ...webpack_config.output,
        publicPath: "//luoxupan.github.io/", // 测试环境
      },
    }
  }
  if (isPre) {
    webpack_config = {
      ...webpack_config,
      mode: 'production',
      output: {
        ...webpack_config.output,
        publicPath: "//luoxupan.github.io/", // pre环境
      },
    }
  }
  if (isProduction) {
    webpack_config = {
      ...webpack_config,
      mode: 'production',
      output: {
        ...webpack_config.output,
        publicPath: "//luoxupan.github.io/", // 线上环境
      },
    }
    // webpack_config.plugins.push(new WorkboxWebpackPlugin.GenerateSW({
    //   clientsClaim: true,
    //   skipWaiting: true,
    // }));
  }
  return webpack_config;
};
