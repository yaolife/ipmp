/*
 * @Author: [P631038]杨旭
 * @LastEditors: [P631038]杨旭
 * @Description: 
 */
'use strict'
const path = require('path')
const utils = require('./utils')
const config = require('../config')
const vueLoaderConfig = require('./vue-loader.conf')

function resolve(dir) {
  return path.join(__dirname, '..', dir)
}
module.exports = {
  externals: {
    canvg: 'canvg',
  },
  context: path.resolve(__dirname, '../'),
  entry: {
    app: ['babel-polyfill', './src/main.js'],
  },
  output: {
    path: config.build.assetsRoot,
    filename: '[name].js',
    publicPath: process.env.NODE_ENV === 'production'
      ? config.build.assetsPublicPath
      : config.dev.assetsPublicPath
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': resolve('src'),
      'cud_component': path.resolve(__dirname, '../static/cud2.0_components/cud-component.min.js'),
      '@@': resolve('cudcomponents/workflowModule'),
      // 以下为精细化报表
      // '@report': resolve('report_modules'),
      // dashPackages: resolve('report_modules/modules/dashboardDesign'),
      // '@dashboard/dash-board-ui': resolve('report_modules/modules/index.js'),

    }
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: vueLoaderConfig,
        // exclude: [
        //   path.resolve(__dirname, '../src/modules/demoLib') // 添加你想要排除的demo目录
        // ],
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src'), resolve('report_modules'), resolve('formviewcomponent'), resolve('test'), resolve('node_modules/webpack-dev-server/client'), resolve('cudcomponents'), resolve('node_modules/@wangeditor')],
        // exclude: [
        //   path.resolve(__dirname, '../src/modules/demoLib') // 添加你想要排除的demo目录
        // ],
      },
      {
        test: /\.(png|jpe?g|gif|svg|pdf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 20000,
          name: utils.assetsPath('img/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('media/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
        }
      },
      // {
      //   test: /\.worker\.js$/,
      //   loader: 'worker-loader',
      //   options: {
      //     inline: true,
      //     fallback: false
      //   }
      // },
      {
        test: /\\\\\\\\.css$/,
        loader: "style!css"
      },
      // {
      //   test: /\.less$/,
      //   loader: "style-loader!css-loader!less-loader",
      //   exclude: /node_modules/,
      // }
    ]
  },
  node: {
    setImmediate: false,
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  }
}
