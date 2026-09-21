import axios from "@/api/http";

const pageListUrl = "/dataAuth/getDataAuthPageList";
const batchDeleteUrl = "/entity/delete";
const saveUrl = "/entity/save";
const paramDetailUrl = "/entity/paramDetail";
const detailUrl = "/entity/detail";
const updateUrl = "/entity/update";
const tables = "/entity/tables";
const findTableColumns = "/entity/findTableColumns";
const checkTable = "/entity/checkTable";
const entityDetailListUrl = "entity/relationDetails/getRelationUnionIdType";

const saveDataAuthUrl = "/dataAuth/saveDataAuth";
const getDataAuthDetailUrl = "/dataAuth/getDataAuthDetail";
const getDataRulePageListUrl = "/dataRule/getDataRulePageList";
const getRoleListByGroupUrl = "/dataAuth/getRoleListByGroup";
const queryRoleGroupByAppIdUrl = "role/queryRoleGroupByAppId/bp";
// ----
// const getDataRuleByFunctinCodeAndRoleUrl =
//   "/dataAuth/getDataRuleByFunctinCodeAndRole";
const getDataRuleByFunctinCodeAndUserUrl="/dataAuth/getDataRuleByFunctinCodeAndUser"
// 人员维度列表接口
const getDataAuthPageListByUserUrl =
  "/dataAuthStatics/getDataAuthPageListByUser";
// 人员维度修改
const updateDataAuthByUserUrl = "/dataAuthStatics/updateDataAuthByUser";
// 人员维度删除
const deleteDataAuthByUserUrl = "/dataAuthStatics/deleteDataAuthByUser";
// 数据授权转移/复制
const transferDataAuthByUserUrl = "/dataAuthStatics/transferDataAuthByUser";
// 角色维度列表接口
const getDataAuthPageListByRoleUrl ="/dataAuthStatics/getDataAuthPageListByRole";
// 导出角色维度
const exportDataAuthInfoByRoleUrl = '/dataAuthStatics/exportDataAuthInfoByRole'
// 角色维度表格删除
const delDataAuthByRoleAndObjTypeUrl = '/dataAuthStatics/delDataAuthByRoleAndObjType'
// 角色维度数据规则删除
const delFuncDataRuleByRoleUrl="/dataAuthStatics/delFuncDataRuleByRole"
// 角色维度数据规则查询
const getDataRuleByFunctinCodeAndRoleUrl="/dataAuth/getDataRuleByFunctinCodeAndRole"
// 角色维度数据规则增加
const addFuncDataRuleByRoleUrl="/dataAuthStatics/addFuncDataRuleByRole"
// 组维度
const getDataAuthPageListByGroupUrl ="/dataAuthStatics/getDataAuthPageListByGroup";
// 用户维度按用户钻取到的数据
const getDataAuthDetailByUserUrl = "/dataAuthStatics/getDataAuthDetailByUser";
// 组维度，按组钻取到的数据
const getDataAuthDetailByGroupUrl = "/dataAuthStatics/getDataAuthDetailByGroup";
// 角色维度，按角色钻取到的数据
const getDataAuthDetailByRoleUrl = "/dataAuth/getDataAuthDetailByRole";
// 组织维度列表
const getDataAuthPageListByOrgUrl='/dataAuthStatics/getDataAuthPageListByOrg'
// 组织维度钻取
const getDataAuthDetailByOrgUrl='/dataAuthStatics/getDataAuthDetailByOrg'
// 用户岗位 列表
const getDataAuthPageListByPostUrl='/dataAuthStatics/getDataAuthPageListByPost'
// 用户岗位钻取 
const getDataAuthDetailByPostUrl='/dataAuthStatics/getDataAuthDetailByPost'

const delFuncDataRuleUrl = '/dataAuth/delFuncDataRule'
// 人员钻取树列表联动
const getDataRuleByUserUrl='/dataAuthStatics/getDataRuleByUser'
// 导出
const exportDataAuthInfoUrl='/dataAuth/exportDataAuthInfo'

const addFuncDataRuleUrl = '/dataAuth/addFuncDataRule'
// 导出人员维度
const exportDataAuthInfoByUserUrl = '/dataAuthStatics/exportDataAuthInfoByUser'


export default {
  tables: function() {
    return axios.post(tables).then(res => res.data);
  },
  findTableColumns: function(param) {
    return axios.post(findTableColumns + "/" + param).then(res => res.data);
  },
  checkTable: function(param) {
    return axios.post(checkTable + "/" + param).then(res => res.data);
  },
  pageListAPI: function(params) {
    return axios.post(pageListUrl + "?pageIndex=" +params.pageIndex +"&pageSize=" +params.pageSize,params).then(res => res.data);
  },
  batchDeleteAPI: function(params) {
    return axios.post(batchDeleteUrl, params).then(res => res.data);
  },

  saveAPI: function(params) {
    return axios.post(saveUrl, params).then(res => res.data);
  },
  detailAPI: function(params) {
    return axios
      .post(detailUrl + "/" + params.id + "/" + params.type)
      .then(res => res.data);
  },

  paramDetailAPI: function(params) {
    return axios
      .get(paramDetailUrl + "/" + params.id, params)
      .then(res => res.data);
  },
  updateAPI: function(params) {
    return axios.post(updateUrl, params).then(res => res.data);
  },
  entityDetailList: function(params) {
    return axios
      .post(entityDetailListUrl, params, { apiTitle: "查询实体引用详情列表" })
      .then(res => res.data);
  },
  // 菜单树
  getDataAuthDetail: function(params) {
    return axios.post(getDataAuthDetailUrl, params).then(res => res.data);
  },
  getDataRulePageList: function(params) {
    return axios.post(getDataRulePageListUrl, params).then(res => res.data);
  },
  queryRoleGroupByAppId: function(params) {
    return axios.get(queryRoleGroupByAppIdUrl, params).then(res => res.data);
  },
  getRoleListByGroup: function(params) {
    return axios.post(getRoleListByGroupUrl, params).then(res => res.data);
  },
  getMenuTreeDataUrl: function(params) {
    return axios.post(getMenuTreeDataUrl, params).then(res => res.data);
  },
  getDataRuleByFunctinCodeAndUser: function(params) {
    return axios.post(getDataRuleByFunctinCodeAndUserUrl, params).then(res => res.data);
  },
  // 保存
  saveDataAuth: function(params) {
    return axios.post(saveDataAuthUrl, params).then(res => res.data);
  },
  // 人员维度列表接口
  getDataAuthPageListByUser: function(params) {
    return axios
      .post(getDataAuthPageListByUserUrl, params)
      .then(res => res.data);
  },
  // 角色维度列表接口
  getDataAuthPageListByRole: function(params) {
    return axios
      .post(getDataAuthPageListByRoleUrl, params)
      .then(res => res.data);
  },
  // 组维度
  getDataAuthPageListByGroup: function(params) {
    return axios
      .post(getDataAuthPageListByGroupUrl, params)
      .then(res => res.data);
  },
  // 角色维度，按角色钻取到的数据
  getDataAuthDetailByUser: function(params) {
    return axios.post(getDataAuthDetailByUserUrl, params).then(res => res.data);
  },
  // 角色维度数据规则删除
delFuncDataRuleByRole: function(params) {
    return axios.post(delFuncDataRuleByRoleUrl, params).then(res => res.data);
  },
    // 角色维度数据规则添加
addFuncDataRuleByRole: function(params) {
  return axios.post(addFuncDataRuleByRoleUrl, params).then(res => res.data);
},
    // 角色维度数据规则添加
    getDataRuleByFunctinCodeAndRole: function(params) {
  return axios.post(getDataRuleByFunctinCodeAndRoleUrl, params).then(res => res.data);
},
  // 组维度，按组钻取到的数据
  getDataAuthDetailByGroup: function(params) {
    return axios
      .post(getDataAuthDetailByGroupUrl, params)
      .then(res => res.data);
  },
  // 角色维度，按角色钻取到的数据
  getDataAuthDetailByRole: function(params) {
    return axios.post(getDataAuthDetailByRoleUrl, params).then(res => res.data);
  },
  // 角色维度列表删除
  delDataAuthByRoleAndObjType: function(params) {
    return axios.post(delDataAuthByRoleAndObjTypeUrl, params).then(res => res.data);
  },
  // 人员维度修改
  updateDataAuthByUser: function(params) {
    return axios.post(updateDataAuthByUserUrl, params).then(res => res.data);
  },
  // 人员维度删除
  deleteDataAuthByUser: function(params) {
    return axios.post(deleteDataAuthByUserUrl, params).then(res => res.data);
  },
  // 数据授权转移/复制
  transferDataAuthByUser: function(params) {
    return axios.post(transferDataAuthByUserUrl, params).then(res => res.data);
  },
  // 组织列表
  getDataAuthPageListByOrg: function (params) {
    return axios.post(getDataAuthPageListByOrgUrl, params).then(res => res.data);
  },
  // 组织钻取{"orgId" : "00888888|50359648"}
  getDataAuthDetailByOrg: function (params) {
    return axios.post(getDataAuthDetailByOrgUrl, params).then(res => res.data);
  },
  // 用户岗位 列表
    getDataAuthPageListByPost: function (params) {
    return axios.post(getDataAuthPageListByPostUrl, params).then(res => res.data);
  },
  // 用户岗位钻取 {"postId" : "1111"}
  getDataAuthDetailByPost: function (params) {
    return axios.post(getDataAuthDetailByPostUrl, params).then(res => res.data);
  },

  delFuncDataRule: function (params) {
    return axios.post(delFuncDataRuleUrl, params).then(res => res.data);
  },
  // 人员钻取树列表联动
  getDataRuleByUser: function (params) {
      return axios.post(getDataRuleByUserUrl, params).then(res => res.data);
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
  addFuncDataRule: function (params) {
    return axios.post(addFuncDataRuleUrl, params).then(res=>res.data)
  },
  // 导出角色
  exportDataAuthInfoByRole: function (params) {
    return axios({
      method:'post',
      url:exportDataAuthInfoByRoleUrl, 
      data:params, 
      responseType: 'blob'
    }).then(res => res.data);
  },
  // 导出人员
  exportDataAuthInfoByUser: function (params) {
    return axios({
      method:'post',
      url:exportDataAuthInfoByUserUrl, 
      data:params, 
      responseType: 'blob'
    }).then(res => res.data);
  }
};

