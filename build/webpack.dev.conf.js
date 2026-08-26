"use strict";
const utils = require("./utils");
const webpack = require("webpack");
const config = require("../config");
const merge = require("webpack-merge");
const path = require("path");
const baseWebpackConfig = require("./webpack.base.conf");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const FriendlyErrorsPlugin = require("friendly-errors-webpack-plugin");
const portfinder = require("portfinder");


const HOST = process.env.HOST;
const PORT = process.env.PORT && Number(process.env.PORT);

const devWebpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.dev.cssSourceMap,
      usePostCSS: true
    })
  },
  // devtool: "cheap-modules-source-map",
  devServer: {
    clientLogLevel: "warning", // 日志
    progress: true, // 显示进度条
    inline: true, // 页面实时刷新
    compress: true, // 是否开启gip压缩
    historyApiFallback: { // 没有匹配到的静态文件的请求重定向到指定的html文件.
      rewrites: [
        {
          from: /.*/,
          to: path.posix.join(config.dev.assetsPublicPath, "index.html")
        }
      ]
    },
    contentBase: false, // 指定静态资源根目录
    hot: true, // 是否启用模块代码热更新
    host: HOST || config.dev.host, // 服务url
    port: PORT || config.dev.port, // 端口
    open: config.dev.autoOpenBrowser, // 是否自动打开页面
    overlay: config.dev.errorOverlay //当编译器错误时,浏览器中显示全屏覆盖层
      ? { warnings: false, errors: true }
      : false,
    publicPath: config.dev.assetsPublicPath, // 指定静态资源的公共路径
    proxy: config.dev.proxyTable, // 接口请求时跨域代理
    quiet: true, // 静态模式,除了初始信息,其他内容不会打印到控制台
    watchOptions: {
      poll: config.dev.poll  // 每秒检查一次变动
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": require("../config/dev.env")
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "index.html",
      chunks: ["app"],
      inject: true
    }),
    // new HtmlWebpackPlugin({
    //   filename: "formView.html",
    //   template: "formView.html",
    //   chunks: ["formView"],
    //   inject: true
    // }),
    // copy custom static assets
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, "../static"),
        to: config.dev.assetsSubDirectory,
        ignore: [".*"]
      }
    ])
  ]
});


module.exports = new Promise((resolve, reject) => {

  portfinder.basePort = process.env.PORT || config.dev.port;

  portfinder.getPort((err, port) => {
    if (err) {
      reject(err);
    } else {
      process.env.PORT = port;
      devWebpackConfig.devServer.port = port;
      devWebpackConfig.plugins.push(
        new FriendlyErrorsPlugin({
          compilationSuccessInfo: {
            messages: [
              `Your application is running here: http://${devWebpackConfig.devServer.host}:${port}`
            ]
          },
          onErrors: config.dev.notifyOnErrors
            ? utils.createNotifierCallback()
            : undefined
        })
      );

      resolve(devWebpackConfig);
    }
  });
});

