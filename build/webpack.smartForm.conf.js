/*
 * @Author: P623437
 * @Date: 2022-04-14 13:37:43
 * @LastEditors: [P631038]杨旭
 * @LastEditTime: 2024-08-27 15:15:46
 * @Description:
 */
const path = require("path");
const webpack = require("webpack");
const merge = require("webpack-merge");
const webpackBaseConfig = require("./webpack.base.config.js");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const env = require("../config/smartForm.env");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const OptimizeCSSPlugin = require("optimize-css-assets-webpack-plugin");
const utils = require("./utils");

function resolve(dir) {
  return path.join(__dirname, "..", dir);
}

module.exports = merge(webpackBaseConfig, {
  // devtool: "source-map",
  module: {
    rules: utils.styleLoaders({
      extract: true,
      usePostCSS: true
    })
  },
  entry: {
    // app: './src/main.js',
    main: "./cudcomponents/smartFormModule/index.js"
  },
  output: {
    path: path.resolve(__dirname, "../lib/smartForm/"),
    publicPath: "static/img/temp/",
    filename: "smartForm.js",
    library: "smartForm",
    libraryTarget: "umd",
    umdNamedDefine: true
  },
  externals: {
    vue: {
      root: "Vue",
      commonjs: "vue",
      commonjs2: "vue",
      amd: "vue"
    },
    "vue-router": "vue-router"
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": env
    }),
    new UglifyJsPlugin({
      uglifyOptions: {
        compress: {
          warnings: false,
          drop_debugger: true,
          drop_console: true,
          collapse_vars: false
        }
      },
      exclude: [resolve("node_modules/psc-module")],
      sourceMap: true,
      parallel: true
    }),
    new ExtractTextPlugin({
      filename: utils.assetsPath("css/smartForm.css"),
      allChunks: true
    }),
    new OptimizeCSSPlugin({
      cssProcessorOptions: { safe: true }
    })
  ]
});
