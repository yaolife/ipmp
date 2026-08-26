import axios from '@/api/http';

const getClassUrl = '/client/connection/v4/query/classType'//获取分类
const setClassUrl = '/client/connection/v4/ClassType/insClassType'//编辑分类
const delClassUrl = '/client/connection/v4/ClassType/delClassType'//删除分类
const moveClassUrl = '/client/request/detail/update/connectorType'//移动分类
const getListUrl = '/client/connection/v4/query/connector'//获取连接器列表
const getDetailUrl = '/client/request/detail/query/connectorDetail'//获取详情
const setDetailUrl = '/client/request/detail/insert/Connector/v2'//编辑详情
const delDetailUrl = '/client/connection/v4/Connector/delConnector'//删除连接器
const setActionUrl = '/client/request/detail/insert/RequestDetail'//编辑动作
const delActionUrl = '/client/request/detail/delete/RequestDetail/v2'//删除动作
const testUrl   = '/client/connection/v4/untitled/request'//测试接口
const resultUrl = '/client/connection/v4/Connector/getVerificationParameters'//正式接口
const getValidateUrl   = '/client/request/detail/validated/connectorName' //连接器名称验证
const getValidateIdUrl = '/client/request/detail/validated/requestId' //动作唯一标识验证
const getRelationUrl = '/client/connection/v4/query/connectorByLikeList' //连接器引用列表
const importUrl = '/client/request/detail/excel/connector'   //导入
const exportUrl = '/client/request/detail/export/connector'  //导出
const getLogListUrl = '/client/request/log/query/requestLog'    //日志列表
const getLogDetailUrl = '/client/request/log/query/requestLog/detail'  //日志详情

const xmlToJsonUrl = '/client/request/detail/format/xmlToJsonBySoap' //解析XML

export default{
  // 分类查询
  getClassAPI: function() {
    return axios.get(getClassUrl).then(res => res.data);
  },
  // 分类编辑
  setClassAPI: function(params) {
    return axios.post(setClassUrl, params).then(res => res.data);
  },
  // 分类删除
  delClassAPI: function(params) {
    return axios.post(delClassUrl, params).then(res => res.data);
  },
  // 移动分类
  moveClassAPI: function(params) {
    return axios.post(moveClassUrl, params).then(res => res.data);
  },
  // 数据列表
  getListAPI: function(params) {
    return axios.post(getListUrl, params).then(res => res.data);
  },
  // 数据查询
  getSearchAPI: function(params) {
    return axios.post(getListUrl, params).then(res => res.data);
  },
  // 获取数据详情
  getDetailAPI: function(params) {
    return axios.get(getDetailUrl, {params}).then(res => res.data);
  },
  // 更新数据详情
  setDetailAPI: function(params) {
    return axios.post(setDetailUrl, params).then(res => res.data);
  },
  // 数据数据
  delDetailAPI: function(params) {
    return axios.post(delDetailUrl, params).then(res => res.data);
  },
  // 更新动作
  setActionAPI: function(params) {
    return axios.post(setActionUrl, params).then(res => res.data);
  },
  // 删除动作
  delActionAPI: function(params) {
    return axios.post(delActionUrl, params).then(res => res.data);
  },
  // 接口测试
  testAPI: function(params) {
    return axios.post(testUrl, params).then(res => res.data);
  },
  // 接口调用
  resultAPI: function(params) {
    return axios.post(resultUrl, params).then(res => res.data);
  },
  //连接器名称验证
  getValidateAPI: function(params) {
    return axios.post(getValidateUrl, {}, {params}).then(res => res.data);
  },
  //唯一标识验证
  getValidateIdAPI: function(params) {
    return axios.post(getValidateIdUrl, {}, {params}).then(res => res.data);
  },
  //获取引用列表
  getRelationAPI: function(params) {
    return axios.post(getRelationUrl, params).then(res => res.data);
  },
  
  //导入
  importAPI: function(params) {
    return axios.post(importUrl, params).then(res => res.data);
  },
  //导出
  exportAPI: function(params) {
    return axios.get(exportUrl, params).then(res => res.data);
  },

  //日志列表
  getLogListAPI: function(params) {
    return axios.post(getLogListUrl, params).then(res => res.data);
  },
  //日志详情
  getLogDetailAPI: function(params) {
    return axios.post(getLogDetailUrl, params).then(res => res.data);
  },
  //解析XML
  xmlToJsonAPI: function(params) {
    return axios.post(xmlToJsonUrl, params).then(res => res.data);
  },
}
