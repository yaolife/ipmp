import axios from "@/api/http";

const groupListUrl = "/wfProcessGroup/findList";
const getGroupListUrl = "/authGroup/findList";
const getFaceFuncListUrl = "/func/getFaceFuncAllForProc";
const getCurrentDeptUrl = "/dept/getDeptInfo";
const getCurrentCompanyUrl = "/dept/getStaffCompanyInfo";
// 查询改组织下的所有职位信息
const queryStationPersonPATH = "/dept/getDeptInfo";
const getPostListByCompanyId ='/dataAuth/getPostListByCompanyId'
export default {
  //流程组管理列表查询
  groupListAPI: function(params) {
    return axios.post(groupListUrl, params).then(res => res.data);
  },
  // 数据规则组
  getGroupListAPI: function(params) {
    return axios.post(getGroupListUrl, params).then(res => res.data);
  },

  //函数列表查询
  getFaceFuncListAPI: function(params) {
    return axios.post(getFaceFuncListUrl, params).then(res => res.data);
  },

  //部门秘书预算员 正负职查询
  getCurrentDeptAPI: function(params) {
    return axios.post(getCurrentDeptUrl, params).then(res => res.data);
  },
  //个人公司查询
  getCurrentCompanyAPI: function(params) {
    return axios.post(getCurrentCompanyUrl, params).then(res => res.data);
  },
  // 查询公司或者部门下的岗位和职位人员
  queryStationPersonAPI(params) {
    return axios.post(queryStationPersonPATH, params).then(res => res.data);
  },
  // 获取职位
  getPostDataAPI(params) {
    return axios.post(getPostListByCompanyId, params).then(res => res.data);
  },


  //   加载部门信息树
  getOrgTreeForOrgWidget(params) {
    return axios.post("/valid/queryDeptTreeByParentId?deptParentId=" + params.orgId);
  },
  //   获取人员信息
  getStaffsByOrgId(params) {
    return axios.post("/valid/searchUserList", params);
  },
  //根据多个员工号查询
  getStaffsByStaffNosHr(params) {
    return axios.post("/valid/queryUserListByUserId", params).then(res => res.data);
  },
};

//导出系统角色信息
export const exportRoleListExcel = params => {
  return axios({
    method: "post",
    url: "/role/exportRoleInfo",
    data: params,
    responseType: "blob"
  })
}

//导出批量上传模板
export const downLoadTemplate = () => {
  return axios({
    method: "post",
    url: "/role/downLoadTemplate",
    data: null,
    responseType: "blob"
  })
}
