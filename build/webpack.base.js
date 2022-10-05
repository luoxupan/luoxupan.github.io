const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');

/**
 * npm i -D XXXX --registry https://registry.npmjs.org
 * npx webpack --help
 */

const Base = {
  // target: '', // 需要看看
  output: {
    // `path` is the folder where Webpack will place your bundles
    path: path.resolve(__dirname, '../dist'),
    // `publicPath` is where Webpack will load your bundles from (optional)
    // publicPath: '//static.xxxx.com/cdn/',
    filename: "js/[name]_[hash:8].js",
    publicPath: '/',
    // `chunkFilename` provides a template for naming code-split bundles (optional)
    chunkFilename: 'chunks/[name]_[contenthash:8].js',
    environment: {
      arrowFunction: false, // webpack拼装的代码不要箭头函数
    },
    assetModuleFilename: 'assets/[name][ext][query]',
    clean: true, // 清理/dist文件夹
  },
  module: {
    /**
     * Add your rules for custom modules here
     * Learn more about loaders from https://webpack.js.org/loaders/
     */
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        loader: 'ts-loader',
        exclude: ['/node_modules/'],
      },
      {
        test: /\.css$/i,
        use: ['style-loader','css-loader'],
      },
      {
        test: /\.less$/i,
        use: ['style-loader','css-loader','less-loader'],
      },
      {
        /**
         * 资源模块配置
         * https://webpack.docschina.org/guides/asset-modules/
         */
        test: /\.(eot|ttf|woff|woff2|png|jpg|jpeg|gif)$/i,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            // maxSize: 4 * 1024, // 4kb
            maxSize: 500
          }
        }
      },
      // {
      //   test: /\.svg$/i,
      //   type: 'asset/resource'
      // },
      {
        test: /\.svg$/,
        use: [
          { loader: 'svg-sprite-loader', options: {} },
        ]
      },
    ]
  },
  optimization: {
    // 代码分离：https://webpack.docschina.org/guides/code-splitting/
    splitChunks: {
      chunks: 'all',
    },
    runtimeChunk: 'single',
  },
  plugins: [
    new HTMLWebpackPlugin({
      template: 'src/index.html'
    }),
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '...'],
    alias: {
      state: path.resolve(__dirname, '../src/state/index'),
      components: path.resolve(__dirname, '../src/components/index'),
    },
  },
  // devtool: "hidden-source-map",
};

module.exports = Base;
