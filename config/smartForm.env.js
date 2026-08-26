'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./smartForm.env')
/**
 * 保密管理系统 serverapi 
 * 苏州院物质管理系统/工器具有效性管理系统 cuddemo4-server  
 * 阳江流程平台 ypm-server
 * 宁德流程平台 ndpm-server
 * 红沿河人力资源管理系统 server-api
 */
module.exports = merge(prodEnv, {
    // CUD智能填表配置
    NODE_ENV: '"entry"',
    // api地址
    API_ROOT: '"/server-api"',
    // 系统编码
    APP_CODE: '"CUDDEMO4"',
    // 中台选人选部门控件地址名前缀 aep-t测试环境  aep-p生产环境
    ASC_ROOT: '"https://aep-t/SelectPersonandDept"',
    // 中台的地址
    AEP_REST_API_ROOT: '"https://aep.gnpjvc.cgnpc.com.cn"',
    // 跳转地址前缀,投产前需改为本系统地址
    DOMAIN_PATH: '"http://localhost:8010"',
    // 认证方式 AEP:中台认证 PRO:授权系统认证 LOCAL:本地授权认证
    AUTH_TYPE: '"AEP"',
    // PSC地址前缀，用于前端请求PSC相关服务
    PSC_ROOT: '"/api"',
}) 