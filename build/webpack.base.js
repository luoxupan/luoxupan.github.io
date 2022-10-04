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
    filename: "assets/js/[name]_[hash:8].js",
    publicPath: '/',
    // `chunkFilename` provides a template for naming code-split bundles (optional)
    chunkFilename: 'chunks/[name]_[contenthash:8].js',
    environment: {
      arrowFunction: false, // webpack拼装的代码不要箭头函数
    },
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
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: 'asset',
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
    },
  },
  devtool: "hidden-source-map",
};

module.exports = Base;
