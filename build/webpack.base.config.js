/**
 * 公共配置
 */
const path = require('path');
const webpack = require('webpack');
const pkg = require('../package.json');
function resolve(dir) {
  return path.join(__dirname, '..', dir);
}

module.exports = {
  // 加载器
  module: {
    // https://doc.webpack-china.org/guides/migrating/#module-loaders-module-rules
    rules: [
      {
        // https://vue-loader.vuejs.org/en/configurations/extract-css.html
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            css: [
              'vue-style-loader',
              {
                loader: 'css-loader',
                options: {
                  sourceMap: true,
                },
              },
            ],
            less: [
              'vue-style-loader',
              {
                loader: 'css-loader',
                options: {
                  sourceMap: true,
                },
              },
              {
                loader: 'less-loader',
                options: {
                  sourceMap: true,
                },
              },
            ],
            stylus: [
              'vue-style-loader',
              {
                loader: 'css-loader',
                options: {
                  sourceMap: true,
                },
              },
              {
                loader: 'stylus-loader',
                options: {
                  sourceMap: true,
                },
              },
            ],
          },
          postLoaders: {
            html: 'babel-loader?sourceMap'
          },
          sourceMap: true,
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src'),resolve('cudcomponents'), resolve('node_modules/@wangeditor')],
        exclude: /node_modules\/(?!@wangeditor)/,
        options: {
          sourceMap: false,
        },
        // include: [resolve('node_modules/@wangeditor')],
        // exclude: /node_modules/
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
      {
        test: /\.less$/,
        loaders: [
          {
            loader: 'style-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'less-loader',
            options: {
              sourceMap: true,
            },
          },
        ]
      },
      {
        test: /\.scss$/,
        loaders: [
          {
            loader: 'style-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            },
          },
        ]
      },
      {
        test: /\.stylus$/,
        loaders: [
          {
            loader: 'style-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'stylus-loader',
            options: {
              sourceMap: true,
            },
          },
        ]
      },
      {
        test: /\.(gif|jpg|png|woff|svg|eot|ttf|pdf)\??.*$/,
        loader: 'url-loader?limit=18192'
      },
      {
        test: /\.(html|tpl)$/,
        loader: 'html-loader'
      }
    ]
  },
  externals: {

  },
  resolve: {
    extensions: ['.js', '.vue'],
    alias: {//设定组件的别名
      'vue': 'vue/dist/vue.esm.js',
      '@': resolve('src'),
      '@@': resolve('cudcomponents/workflowModule'),
      // '@report': resolve('report_modules'),
      // // 仪表盘工程路径别名
      // dashPackages: resolve('report_modules/modules/dashboardDesign'),
      // '@dashboard/dash-board-ui': resolve('report_modules/modules/index.js'),

    }
  },

  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.DefinePlugin({
      'process.env.VERSION': `'${pkg.version}'`
    }),
  ]
};
