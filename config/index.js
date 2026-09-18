/*
 * @Author: [P631038]杨旭
 * @LastEditors: [P631038]杨旭
 * @Description: 
 */
"use strict";
const path = require("path");
// 业务后端地址，联调时只改这一处
const BACKEND_API_TARGET = "http://192.168.0.254:8000";//YJ-WIFI
//const BACKEND_API_TARGET = "http://192.168.29.254:8000";//个人热点的
//const BACKEND_API_TARGET = "http://localhost:8000";
module.exports = {
    dev: {
        assetsSubDirectory: "static",
        assetsPublicPath: "/",
        proxyTable: {
            // 像素流信令（参考 YJ3DVP/web，按实际信令地址调整 target）
            "/pixelStream": {
                target: "ws://127.0.0.1:11180",
                ws: true,
                changeOrigin: true,
                pathRewrite: {
                    "^/pixelStream": ""
                }
            },
            // 资源目录、管道等业务接口，避免被 PSC /server-api/api 规则抢走
            "/server-api/api/model-resource-directories": {
                target: BACKEND_API_TARGET,
                changeOrigin: true,
                pathRewrite: {
                    "^/server-api": ""
                }
            },
            "/server-api/api/pipelines": {
                target: BACKEND_API_TARGET,
                changeOrigin: true,
                pathRewrite: {
                    "^/server-api": ""
                }
            },
            "/server-api/api/pipeline-components": {
                target: BACKEND_API_TARGET,
                changeOrigin: true,
                pathRewrite: {
                    "^/server-api": ""
                }
            },
            "/server-api/api/sys-files": {
                target: BACKEND_API_TARGET,
                changeOrigin: true,
                pathRewrite: {
                    "^/server-api": ""
                }
            },
            "/server-api/tm01-assessments": {
                target: BACKEND_API_TARGET,
                changeOrigin: true,
                pathRewrite: {
                    "^/server-api": ""
                }
            },
            // 本地代理
            "/server-api": {
                // 联调后端
                target: BACKEND_API_TARGET,
                changeOrigin: true,
                pathRewrite: {
                    "^/server-api": "" // 需要rewrite重写的,
                }
            },
            // PSC接口代理
            "/server-api/api": {
                target: "http://psc2-t/psc-process",
                //解耦PSC地址
                // target: "http://bfpsc-t:9000/psc-process",
                changeOrigin: true, // 是否跨域
                pathRewrite: {
                    "^/server-api/api": ""
                }
            },
            // PSC接口代理
            "/api": {
                target: "http://psc2-t/psc-process",
                //解耦PSC地址
                // target: "http://bfpsc-t:9000/psc-process",
                changeOrigin: true,
                pathRewrite: {
                    "^/api": ""
                }
            },
            // 精细化报表系统代理
            "/serverapi": {
                target: "http://10.100.216.79:8080/ereport",
                changeOrigin: true,
                pathRewrite: {
                    "^/serverapi": "",
                }
            },
            // kkFIleView预览地址
            "/kkFileViewApi": {
                target: "http://10.100.139.139:8012",
                changeOrigin: true,
                pathRewrite: {
                    "^/kkFileViewApi": "",
                }
            },
            //短链接
            "/s/": {
                target: "http://localhost:8088",
                changeOrigin: true,
                pathRewrite: {
                    "^/s/": "/short/",
                }
            },
        },
        host: "0.0.0.0",
        port: 8010,
        autoOpenBrowser: false,
        errorOverlay: true,
        notifyOnErrors: true,
        poll: false,
        // Source Maps  源码控制
        devtool: "cheap-module-eval-source-map", //
        cacheBusting: true,
        cssSourceMap: true,
    },
    build: {
        index: path.resolve(__dirname, "../dist/index.html"),
        // Paths
        assetsRoot: path.resolve(__dirname, "../dist"),
        assetsSubDirectory: "static",
        assetsPublicPath: "/",
        productionSourceMap: false,
        devtool: false,
        // Gzip off by default as many popular static hosts such as
        // Surge or Netlify already gzip all static assets for you.
        // Before setting to `true`, make sure to:
        // npm install --save-dev compression-webpack-plugin
        productionGzip: true,
        productionGzipExtensions: ["js", "css"],
        // Run the build command with an extra argument to
        // View the bundle analyzer report after build finishes:
        // `npm run build --report`
        // Set to `true` or `false` to always turn it on or off
        bundleAnalyzerReport: process.env.npm_config_report
    }
};
