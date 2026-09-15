import axios from '@/api/http';

const typeTreeUrl = '/business/log/caregory/getCaregoryTree';
const addTypeUrl = '/business/log/caregory/addLogType';
const saveTypeUrl = '/business/log/caregory/updateLogType';
const deleteTypeUrl = '/business/log/caregory/deleteLogType';

const checkTypeCodeOnLyUrl = '/business/log/caregory/checkCodeOnly';
const checkTypeNameOnLyUrl = '/business/log/caregory/checkNameOnly';

const pageLogListUrl = '/business/log/page';
const getLogDetailUrl = '/business/log/detail';
const getLogJumpUrl = '/business/log/log-jump';

export default {
  // 分类树查询
  typeTreeAPI: function (params) {
    return axios.post(typeTreeUrl, params, { apiTitle: "分类树查询" }).then(res => res.data);
  },
  // 新增分类
  addTypeAPI: function (params) {
    return axios.post(addTypeUrl, params, { apiTitle: "新增分类" }).then(res => res.data);
  },
  // 保存分类
  saveTypeAPI: function (params) {
    return axios.post(saveTypeUrl, params, { apiTitle: "保存分类" }).then(res => res.data);
  },
  // 删除分类
  deleteTypeAPI: function (params) {
    return axios.post(deleteTypeUrl, params, { apiTitle: "删除分类" }).then(res => res.data);
  },
  // 校验分类编码唯一性
  checkTypeCodeOnLyAPI: function (params) {
    return axios.post(checkTypeCodeOnLyUrl, params, { apiTitle: "校验分类编码唯一性" }).then(res => res.data);
  },
  // 校验分类名称唯一性
  checkTypeNameOnLyAPI: function (params) {
    return axios.post(checkTypeNameOnLyUrl, params, { apiTitle: "校验分类名称唯一性" }).then(res => res.data);
  },
  // 日志列表
  pageLogListAPI: function(params) {
    return axios.post(pageLogListUrl, params).then( res => res.data);
  },
  // 日志详情
  getLogDetailAPI: function(params) {
    return axios.post(getLogDetailUrl, params).then( res => res.data);
  },
  // 详情跳转
  getLogJumpAPI: function(params) {
    return axios.post(getLogJumpUrl, params).then( res => res.data);
  },
}
