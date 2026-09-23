/*
 * @Author: [P641842]田颖瑶
 * @LastEditors: [P641842]田颖瑶
 * @Description: 
 */
"use strict";
const path = require("path");
// 业务后端地址，联调时只改这一处
//const BACKEND_API_TARGET = "http://10.43.100.205:8013";//内网 测试环境
const BACKEND_API_TARGET = "http://192.168.0.5:8000";//外网局域网公司wifi
//const BACKEND_API_TARGET = "http://localhost:8086";//内网本地直连
// 前端请求前缀：内网 /server-api，外网 /api，与 config/*.env.js 的 BIZ_API_PREFIX 对应
const SERVER_API_PREFIX = "/server-api";
const EXTERNAL_API_PREFIX = "/api";
const SERVER_API_REWRITE = "^" + SERVER_API_PREFIX;
const BIZ_PROXY_PATHS = [
    "/model-resource-directories",
    "/pipelines",
    "/pipeline-components",
    "/model-resources",
    "/model-resource-items",
    "/sys-files",
    "/tm01-assessments",
    "/tm02-assessments",
    "/tm05-assessments",
    "/lof-ledger"
];
function createBizProxies(prefix, stripPrefix) {
    const table = {};
    BIZ_PROXY_PATHS.forEach(function (bizPath) {
        const conf = {
            target: BACKEND_API_TARGET,
            changeOrigin: true
        };
        // 内网 /server-api 只是网关前缀，要剥掉；外网后端本身就带 /api，不能剥
        if (stripPrefix) {
            conf.pathRewrite = {
                ["^" + prefix]: ""
            };
        }
        table[prefix + bizPath] = conf;
    });
    return table;
}
module.exports = {
    dev: {
        assetsSubDirectory: "static",
        assetsPublicPath: "/",
        proxyTable: Object.assign(
            {
                // 像素流信令（参考 YJ3DVP/web，按实际信令地址调整 target）
                "/pixelStream": {
                    target: "ws://127.0.0.1:11180",//振威电脑
                   //target: "ws://10.43.100.77:11180",  //内网像素流实际访问地址：10.43.100.77 端口 11180 项目标识 YJ3DVP
                    ws: true,
                    changeOrigin: true,
                    pathRewrite: {
                        "^/pixelStream": ""
                    }
                }
            },
            createBizProxies(SERVER_API_PREFIX, true),
            createBizProxies(EXTERNAL_API_PREFIX, false),
            {
            // PSC接口代理，需写在 /server-api 兜底之前
            [SERVER_API_PREFIX + "/api"]: {
                target: "http://psc2-t/psc-process",
                //解耦PSC地址
                // target: "http://bfpsc-t:9000/psc-process",
                changeOrigin: true, // 是否跨域
                pathRewrite: {
                    [SERVER_API_REWRITE + "/api"]: ""
                }
            },
            // 本地代理
            [SERVER_API_PREFIX]: {
                // 联调后端
                target: BACKEND_API_TARGET,
                changeOrigin: true,
                pathRewrite: {
                    [SERVER_API_REWRITE]: ""
                }
            },
            // PSC接口代理（具体业务路径已在上面优先匹配到后端）
            [EXTERNAL_API_PREFIX]: {
                target: "http://psc2-t/psc-process",
                //解耦PSC地址
                // target: "http://bfpsc-t:9000/psc-process",
                changeOrigin: true,
                pathRewrite: {
                    ["^" + EXTERNAL_API_PREFIX]: ""
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
            }
            }
        ),
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
