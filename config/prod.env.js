/*
 * @Author: [P631038]杨旭
 * @Date: 2024-07-17 16:03:10
 * @LastEditors: [P631038]杨旭
 * @LastEditTime: 2024-08-27 09:24:54
 * @FilePath: \cud4demo-ui\config\prod.env.js
 * @Description: 
 */
'use strict'
module.exports = {
  // 生产环境
  NODE_ENV: '"production"',
  // api地址
  API_ROOT: '"/server-api"',
  // 系统编码
  APP_CODE: '"CUDDEMO4"',
  // 中台选人选部门控件地址名前缀 aep-t测试环境  aep生产环境
  ASC_ROOT: '"https://aep/SelectPersonandDept"',
  // 中台的地址
  AEP_REST_API_ROOT: '"https://aep.gnpjvc.cgnpc.com.cn"',
  // 跳转地址前缀,投产前需改为本系统地址
  DOMAIN_PATH: '"http://cuddemo4"',
  // 认证方式 AEP:中台认证 PRO:授权系统认证 LOCAL:本地授权认证
  AUTH_TYPE: '"AEP"',
  // PSC地址前缀，用于前端请求PSC相关服务
  PSC_ROOT: '"/api"',
}
