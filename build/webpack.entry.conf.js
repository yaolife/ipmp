/*
 * @Author: P623437
 * @Date: 2022-04-14 13:37:43
 * @LastEditors: [P631038]杨旭
 * @LastEditTime: 2025-09-09 09:21:17
 * @Description:
 */
const path = require("path");
const webpack = require("webpack");
const merge = require("webpack-merge");
const webpackBaseConfig = require("./webpack.base.config.js");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const env = require("../config/entry.env");
const config = require("../config");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const OptimizeCSSPlugin = require("optimize-css-assets-webpack-plugin");
const utils = require("./utils");

function resolve(dir) {
  return path.join(__dirname, "..", dir);
}

const webpackConfig = merge(webpackBaseConfig, {
  // module.exports = merge(webpackBaseConfig, {
  // devtool: "source-map",
  module: {
    rules: utils.styleLoaders({
      extract: true,
      usePostCSS: true
    })
  },
  entry: {
    main: "./cudcomponents/workflowModule/index.js"
  },
  output: {
    path: path.resolve(__dirname, "../lib/cud4.0/"),
    publicPath: "/",
    filename: "cud4-component.js",
    library: "cud4-component",
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
    "vue-router": "vue-router",
    "element-ui": "element-ui",
    "vue-pdf": "vue-pdf",
    "tinymce/tinymce": "tinymce/tinymce",
    "tinymce/themes/silver": "tinymce/themes/silver",
    // "tinymce/plugins/importword": "tinymce/plugins/importword",
    "@wangeditor": "@wangeditor",
    "@wangeditor/editor/dist": "@wangeditor/editor/dist",
    "@tinymce": "@tinymce",
    "editor": "editor",
    "psc-module": "psc-module",
    "highlight.js": "highlight.js",
    "monaco-editor/esm/vs/editor/editor.api": "monaco-editor/esm/vs/editor/editor.api"
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
          drop_console: true
        }
      },
      exclude: [resolve("node_modules/psc-module")],
      sourceMap: true,
      parallel: true
    }),
    new ExtractTextPlugin({
      filename: utils.assetsPath("css/cud4-component.css"),
      allChunks: true
    }),
    new OptimizeCSSPlugin({
      cssProcessorOptions: { safe: true }
    })
  ],

});

if (config.build.bundleAnalyzerReport) {
  const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
    .BundleAnalyzerPlugin;
  webpackConfig.plugins.push(new BundleAnalyzerPlugin());
}

module.exports = webpackConfig;
