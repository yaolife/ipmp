import axios from '@/api/http'

export default {
  //查询app列表
  currUserAppList: function () {
    return axios.get('/role/currUserAppList')
  },
  roleInfo: function (param) {
    return axios.post('/role/roleInfo', param)
  },
  roleGroupList: function () {
    return axios.get('/role/queryRoleGroupByAppId/bp')
  },
  rolesInfoAdd: function (param) {
    return axios.post('/role/save/add', param)
  },
  rolesInfoUpdate: function (param) {
    return axios.post('/role/save/update', param)
  },
  rolesInfoDel: function (param) {
    return axios.get('/role/delete/' + param)
  },
  queryCurrUserTopAuthByAppId: function (param) {
    return axios.get('/role/queryCurrUserTopAuthByAppId/' + param)
  },
  queryNormalRoleByAppId: function (param) {
    return axios.get('/role/queryNormalRoleByAppId/' + param)
  },
  queryConfigRoleByRoleId: function (param) {
    return axios.get('/role/queryConfigRoleByRoleId/' + param)
  },
  saveConfigRole: function (param) {
    return axios.post('/role/saveConfigRole/', param)
  },
  roleUserWaitList: function (param) {
    return axios.post('/user/query/page/role/wait', param)
  },
  roleUserSelectList: function (param) {
    return axios.post('/user/query/page/role/select', param)
  },
  addSelect: function (param) {
    return axios.post('/role/addSelectUser', param)
  },
  deleteSelect: function (param) {
    return axios.post('/role/delSelectUser', param)
  },
  // 配置组织
  getOrgTree: function () {
    return axios.post('/org/getOrgsTree')
  },
  getOrgChecks: function (roleId) {
    return axios.get('/role/orgIds/' + roleId)
  },
  saveOrgRoleInfo: function (param) {
    return axios.post('/role/saveOrgRole', param)
  },
  // 管理授权
  rolePrivilege: function (param) {
    return axios.post('/role/roleFuncTree/synchro', param)
  },
  rolePrivilegeChecks: function (param) {
    return axios.post('/role/funcIds/', param)
  },
  saveRolePrivilege: function (param) {
    return axios.post('/role/save/rolePrivilege', param)
  },
  roleFunction:function (param) {
    return axios.post('/role/roleFunction', param)
  },
  judAddUserPermissions:function (param) {
    return axios.get('/role/judAddUserPermissions/'+ param)
  },
  // 授权
  getDataAuthDetail: function (params) {
    return axios.post('/dataAuth/v2/getDataAuthDetail', params).then(res => res.data);
  },
  saveDataAuth: function (params) {
    return axios.post('/dataAuth/v2/saveDataAuth', params).then(res => res.data);
  },
  // 数据权限
  getRoleScopeInfo: function (roleId) {
    return axios.post('/role/queryRolesScopeInfoByRoleId/' + roleId).then(res => res.data);
  },
  editRoleScopeInfo: function (params) {
    return axios.post('/role/editRoleScopeInfo', params).then(res => res.data);
  },
}
