
"use strict";
const path = require("path");
const utils = require("./utils");
const webpack = require("webpack");
const config = require("../config");
const merge = require("webpack-merge");
const baseWebpackConfig = require("./webpack.base.conf");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const OptimizeCSSPlugin = require("optimize-css-assets-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

const env = require("../config/test.env");

const webpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.build.productionSourceMap,
      extract: true,
      usePostCSS: true
    })
  },
  // devtool: 'eval-source-map',
  // devtool: config.build.productionSourceMap ? config.build.devtool : false,
  output: {
    path: path.resolve(__dirname, "../dist/test"),
    // path: config.build.assetsRoot,
    filename: utils.assetsPath("js/[name].[chunkhash].js"),
    chunkFilename: utils.assetsPath("js/[id].[chunkhash].js")
  },
  plugins: [
    // http://vuejs.github.io/vue-loader/en/workflow/production.html
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
      sourceMap: config.build.productionSourceMap,
      cache: true,
      parallel: true
    }),
    // extract css into its own file
    new ExtractTextPlugin({
      filename: utils.assetsPath("css/[name].[contenthash].css"),
      // filename: path.posix.join("static", "css/[name].[contenthash].css"),
      // Setting the following option to `false` will not extract CSS from codesplit chunks.
      // Their CSS will instead be inserted dynamically with style-loader when the codesplit chunk has been loaded by webpack.
      // It's currently set to `true` because we are seeing that sourcemaps are included in the codesplit bundle as well when it's `false`,
      // increasing file size: https://github.com/vuejs-templates/webpack/issues/1110
      allChunks: true
    }),
    // Compress extracted CSS. We are using this plugin so that possible
    // duplicated CSS from different components can be deduped.
    new OptimizeCSSPlugin({
      cssProcessorOptions: config.build.productionSourceMap
        ? { safe: true, map: { inline: false } }
        : { safe: true }
    }),
    // generate dist index.html with correct asset hash for caching.
    // you can customize output by editing /index.html
    // see https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      // filename: config.build.index,
      filename: path.resolve(__dirname, "../dist/test/index.html"),
      template: "index.html",
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
      },
      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
      chunksSortMode: "manual",
      chunks: ["manifest", "vendor", "vue", "element-ui", "echarts", "tinymce", "editor", "app"],
    }),
    // new HtmlWebpackPlugin({
    //   filename: path.resolve(__dirname, "../dist/formView.html"),
    //   template: "formView.html",
    //   chunks: ["commons", "manifest", "vendor", "formView"],
    //   inject: true,
    //   minify: {
    //     removeComments: true,
    //     collapseWhitespace: true,
    //     removeAttributeQuotes: true
    //   },
    //   chunksSortMode: "dependency"
    // }),

    new webpack.HashedModuleIdsPlugin(),
    new webpack.optimize.ModuleConcatenationPlugin(),
    // new webpack.optimize.CommonsChunkPlugin({
    //   name: "commons",
    //   chunks: ['app', 'formView'],
    //   minChunks: 2
    // }),



    // 检查module.content是否包含"node_modules"
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: function (module) {
        // 检查module.context是否包含"node_modules"
        return module.context && module.context.includes('node_modules');
      }
    }),
    // new webpack.optimize.CommonsChunkPlugin({
    //   name: "vendor",
    //   minChunks(module) {
    //     // any required modules inside node_modules are extracted to vendor
    //     return (
    //       module.resource &&
    //       /\.js$/.test(module.resource) &&
    //       module.resource.indexOf(path.join(__dirname, "../node_modules")) === 0
    //     );
    //   }
    // }),

    new webpack.optimize.CommonsChunkPlugin({
      name: 'vue',
      chunks: ['vendor'],
      minChunks(module) {
        return (
          module.resource &&
          /vue/.test(module.resource)
        )
      }
    }),

    // 从vendor中抽离需要的模块数据
    new webpack.optimize.CommonsChunkPlugin({
      name: 'echarts',
      chunks: ['vendor'],
      minChunks(module) {
        return (
          module.resource &&
          /echarts|zrender/.test(module.resource)
        )
      }
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'element-ui',
      chunks: ['vendor'],
      minChunks(module) {
        return (
          module.resource &&
          /element-ui/.test(module.resource)
        )
      }
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'tinymce',
      chunks: ['vendor'],
      minChunks(module) {
        return (
          module.resource &&
          /tinymce/.test(module.resource)
        )
      }
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'editor',
      chunks: ['vendor'],
      minChunks(module) {
        return (
          module.resource &&
          /editor/.test(module.resource)
        )
      }
    }),

    new webpack.optimize.CommonsChunkPlugin({
      name: "manifest",
      minChunks: Infinity
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: "app",
      async: "vendor-async",
      children: true,
      minChunks: 3
    }),

    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, "../static"),
        to: config.build.assetsSubDirectory,
        ignore: [".*"]
      }
    ])
  ]
});

if (config.build.productionGzip) {
  const CompressionWebpackPlugin = require("compression-webpack-plugin");

  webpackConfig.plugins.push(
    new CompressionWebpackPlugin({
      asset: "[path].gz[query]",
      algorithm: "gzip",
      test: new RegExp(
        "\\.(" + config.build.productionGzipExtensions.join("|") + ")$"
      ),
      threshold: 10240,
      minRatio: 0.8
    })
  );
}

if (config.build.bundleAnalyzerReport) {
  const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
    .BundleAnalyzerPlugin;
  webpackConfig.plugins.push(new BundleAnalyzerPlugin());
}

module.exports = webpackConfig;
