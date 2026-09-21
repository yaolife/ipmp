import ht from "@/api/http";
const groupListUrl = '/wfProcessGroup/findList';
const getFaceFuncListUrl = '/func/getFaceFuncAllForProc';
const getCurrentDeptUrl = '/dept/getDeptInfo';
const getCurrentCompanyUrl = '/dept/getStaffCompanyInfo';
// 查询改组织下的所有职位信息
const queryStationPersonPATH = '/dept/getDeptInfo'
export default {

  //流程组管理列表查询
  groupListAPI: function (params) {
    return ht.post(groupListUrl, params).then(res => res.data);
  },
  
  //函数列表查询
  getFaceFuncListAPI: function (params) {
    return ht.post(getFaceFuncListUrl, params).then(res => res.data);
  },
  
   //部门秘书预算员 正负职查询
  getCurrentDeptAPI: function (params) {
    return ht.post(getCurrentDeptUrl, params).then(res => res.data);
  },
   //个人公司查询
  getCurrentCompanyAPI: function (params) {
    return ht.post(getCurrentCompanyUrl, params).then(res => res.data);
  },
  // 查询公司或者部门下的岗位和职位人员
  queryStationPersonAPI(params) {
    return ht.post(queryStationPersonPATH, params).then(res => res.data);
  }
}
