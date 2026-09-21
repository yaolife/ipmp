/*
 * @Author: [P631038]杨旭
 * @Date: 2024-11-08 17:13:58
 * @LastEditors: [P631038]杨旭
 * @LastEditTime: 2026-01-12 15:38:52
 * @FilePath: \4.2.0-node16\cud4demo-ui\config\dev.env.js
 * @Description:
 */
'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
    // 开发环境
    NODE_ENV: '"development"',
    // api地址
    API_ROOT: '"/server-api"',
    // 本地联内网后端，不加 /api；若要对着外网联调改为 '"/api"'
    BIZ_API_PREFIX: '"/api"',
    // 系统编码
    APP_CODE: '"CUDDEMO4"',
    // 中台选人选部门控件地址名前缀 aep-t测试环境  aep生产环境
    ASC_ROOT: '"https://aep-t/SelectPersonandDept"',
    // 中台的地址
    AEP_REST_API_ROOT: '"https://aep-t.gnpjvc.cgnpc.com.cn"',
    // 跳转地址前缀,投产前需改为本系统地址
    DOMAIN_PATH: '"http://localhost:8010"',
    // 认证方式 AEP:中台认证 PRO:授权系统认证 LOCAL:本地授权认证
    AUTH_TYPE: '"AEP"',
    // PSC地址前缀，用于前端请求PSC相关服务
    PSC_ROOT: '"/api"',
    //kkFileView应用地址
    kkFileViewUrl:'"http://10.100.139.139:8012"',
    // 像素流路径，最终拼接为 ws(s)://{host}/pixelStream
    PIXEL_STREAM_PATH: '"/pixelStream"',
})
