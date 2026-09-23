/*
 * @Author: [P631038]杨旭
 * @Date: 2024-11-08 17:13:58
 * @LastEditors: Yin Rui Xue P644244@gnpjvc.com.cn
 * @LastEditTime: 2025-06-13 16:01:08
 * @FilePath: \4.2.0-node16\cud4demo-ui\config\test.env.js
 * @Description:
 */
"use strict";
module.exports = {
  // 测试环境
  NODE_ENV: '"test"',
  LIGHT_AUTH: '"true"',
  // api地址
  API_ROOT: '"/server-api"',
  // 管网业务接口请求前缀：内网 /server-api，外网 /api
  BIZ_API_PREFIX: '"/api"',
  // 系统编码
  APP_CODE: '"pims"',
  // 中台选人选部门控件地址名前缀 aep-t测试环境  aep-p生产环境
  ASC_ROOT: '"https://aep-t/SelectPersonandDept"',
  // 中台的地址
  AEP_REST_API_ROOT: '"https://aep-t.gnpjvc.cgnpc.com.cn"',
  // 跳转地址前缀,投产前需改为本系统地址
  DOMAIN_PATH: '"https://cuddemo4-d"',
  // 认证方式 AEP:中台认证 PRO:授权系统认证 LOCAL:本地授权认证
  AUTH_TYPE: '"AEP"',
  // PSC地址前缀，用于前端请求PSC相关服务
  PSC_ROOT: '"/api"',
  //kkFileView应用地址
  kkFileViewUrl: '"http://10.100.139.139:8012"',
  // 像素流路径，最终拼接为 ws(s)://{host}/pixelStream
  PIXEL_STREAM_PATH: '"/pixelStream"'
};
