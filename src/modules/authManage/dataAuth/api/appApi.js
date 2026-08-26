import axios from '@/api/http';

const pageListUrl = '/dataAuth/getDataAuthPageList';
const batchDeleteUrl = '/dataAuth/delDataAuthByIds';
const saveUrl = '/entity/save';
const paramDetailUrl = '/entity/paramDetail';
const detailUrl = '/entity/detail';
const updateUrl = '/entity/update';
const tables = '/entity/tables';
const findTableColumns = '/entity/findTableColumns'
const checkTable = '/entity/checkTable'
const entityDetailListUrl = 'entity/relationDetails/getRelationUnionIdType';
const saveDataAuthUrl = '/dataAuth/saveDataAuth'
const getDataAuthDetailUrl = '/dataAuth/getDataAuthDetail'
const getDataRulePageListUrl = '/dataRule/getDataRulePageList'

const getRoleListByGroupUrl = '/dataAuth/getRoleListByGroup'
const getRoleListByAppIdUrl = '/role/getRoleListByAppId/'

const queryRoleGroupByAppIdUrl = 'role/queryRoleGroupByAppId/bp'
const getDataRuleByFunctinCodeAndRoleUrl = '/dataAuth/getDataRuleByFunctinCodeAndRole'
const delFuncDataRuleUrl = '/dataAuth/delFuncDataRule'
const addFuncDataRuleUrl = '/dataAuth/addFuncDataRule'

const currUserAppListUrl = 'role/currUserAppList'

// 导出 数据授权
const exportDataAuthInfoUrl='/dataAuth/exportDataAuthInfo'
// 导入 数据授权
const importDataAuthInfoUrl='/dataAuth/importDataAuthInfo'
const updateAuthStateUrl = '/dataAuth/updateAuthState'

export default {
  currUserAppList: function () {
    return axios.get(currUserAppListUrl).then(res => res.data);
  },

  tables: function () {
    return axios.post(tables).then(res => res.data);
  },
  findTableColumns: function (param) {
    return axios.post(findTableColumns + "/" + param).then(res => res.data);
  },
  checkTable: function (param) {
    return axios.post(checkTable + "/" + param).then(res => res.data);
  },
  pageListAPI: function (params) {
    return axios.post(pageListUrl + "?pageIndex=" + params.pageIndex + "&pageSize=" + params.pageSize, params).then(res => res.data);
  },
  batchDeleteAPI: function (params) {
    return axios.post(batchDeleteUrl, params).then(res => res.data);
  },

  saveAPI: function (params) {
    return axios.post(saveUrl, params).then(res => res.data);
  },
  detailAPI: function (params) {
    return axios.post(detailUrl + "/" + params.id + "/" + params.type).then(res => res.data);
  },

  paramDetailAPI: function (params) {
    return axios.get(paramDetailUrl + "/" + params.id, params).then(res => res.data);
  },
  updateAPI: function (params) {
    return axios.post(updateUrl, params).then(res => res.data);
  },
  entityDetailList: function (params) {
    return axios.post(entityDetailListUrl, params, { apiTitle: "查询实体引用详情列表" }).then(res => res.data);
  },

  // 菜单树
  getDataAuthDetail: function (params) {
    return axios.post(getDataAuthDetailUrl, params).then(res => res.data);
  },
  getDataRulePageList: function (params) {
    return axios.post(getDataRulePageListUrl, params).then(res => res.data);
  },
  queryRoleGroupByAppId: function (params) {
    return axios.get(queryRoleGroupByAppIdUrl, params).then(res => res.data);
  },
  getRoleListByGroup: function (params) {
    return axios.post(getRoleListByGroupUrl, params).then(res => res.data);
  },
  //根据应用ID查询角色
  getRoleListByAppId: function (params) {
    return axios.get(getRoleListByAppIdUrl + params.appId).then(res => res.data);
  },

  getMenuTreeDataUrl: function (params) {
    return axios.post(getMenuTreeDataUrl, params).then(res => res.data);
  },
  getDataRuleByFunctinCodeAndRole: function (params) {
    return axios.post(getDataRuleByFunctinCodeAndRoleUrl, params).then(res => res.data);
  },
  // 保存
  saveDataAuth: function (params) {
    return axios.post(saveDataAuthUrl, params).then(res => res.data);
  },
  delFuncDataRule: function (params) {
    return axios.post(delFuncDataRuleUrl, params).then(res => res.data);
  },
  // 导出接口
  exportDataAuthInfo: function (params) {
    return axios({
      method:'post',
      url:exportDataAuthInfoUrl,
      data:params,
      responseType: 'blob'
    }).then(res => res.data);
  },
  exportDataAuthInfo2: function (params) {
    return axios({
      method:'post',
      url:exportDataAuthInfoUrl,
      data:params,
      responseType: 'blob'
    }).then(res => res.data);
  },
  // 导入
  importDataAuthInfoUrl: function (params) {
    return axios({
      method:'post',
      url:importDataAuthInfoUrl,
      data:params,
      responseType: 'blob'
    }).then(res => res.data);
  },
  // 更新数据授权状态
  updateAuthState: function (params) {
    return axios.post(updateAuthStateUrl, params).then(res=>res.data)
  },
  addFuncDataRule: function (params) {
    return axios.post(addFuncDataRuleUrl, params).then(res=>res.data)
  }
}
