/*
 * @Author: [P631038]杨旭
 * @LastEditors: [P631038]杨旭
 * @Description: 
 */
'use strict'
module.exports = {
  // 预生产环境
  NODE_ENV: '"pre"',
  // api地址
  API_ROOT: '"/server-api"',
  // 系统编码
  APP_CODE: '"CUDDEMO4"',
  // api地址
  API_ROOT: '"/server-api"',
  // 中台选人选部门控件地址名前缀 aep-t测试环境  aep生产环境
  ASC_ROOT: '"https://aep-p/SelectPersonandDept"',
  // 中台的地址
  AEP_REST_API_ROOT: '"https://aep.gnpjvc.cgnpc.com.cn"',
  // 跳转地址前缀,投产前需改为本系统地址
  DOMAIN_PATH: '"https://cuddemo4-p"',
  // 认证方式 AEP:中台认证 PRO:授权系统认证 LOCAL:本地授权认证
  AUTH_TYPE: '"AEP"',
  // PSC地址前缀，用于前端请求PSC相关服务
  PSC_ROOT: '"/api"',
  //kkFileView应用地址
  kkFileViewUrl: '"http://10.100.139.139:8012"'
}