import axios from "./http";
import qs from "qs";

// 获取菜单权限
export const getMenuPermission = params => {
  return axios.post("/uau/perm/getMenuPermission?userId=" + params);
};

// 获取按钮权限
export const getPermission = params => {
  return axios.post("/uau/perm/getPermissions?userId=" + params);
};

// 获取当前登录人员uau权限
export const getUserRoles = params => {
  return axios.post("/uau/perm/queryUserRoles", params);
};

// 获取当前用户所有角色
export const getCurrfentUserRoles = params => {
  return axios.post("/component/getRoleByAppCode", params);
};

//获取当前用户信息
export const getUserInfo = params => {
  return axios.post("user/getCurrentUser", params);
};

//获取多个用户信息
export const getUsersInfo = params => {
  return axios.post("user/getUsersInfo", params);
};

//获取在线用户信息
export const getOnlineUsers =params=>{
  return axios.get("user/getOnlineUsers").then(res=>res.data)
}

export const getUserLoginCountList =params=>{
  return axios.get("/hrcenter/user-login-log/getUserLoginCountList").then(res=>res.data)
}
//切换用户
export const changeUser = params => {
  return axios.post("user/changeUser?userId=" + params);
};

//注销
export const userLogout = params => {
  return axios.post("/login/userLogout", params);
};

//获取流程实例已经运行的轨迹
export const getProcInsTrace = params => {
  return axios.post("psc/bpmCenter/getWorkListItemTrace", params);
};

//获取流程节点信息
export const getProcActList = params => {
  return axios.post("psc/bpmCenter/getProcActList", params);
};

//获取流程集信息 通过流程全名
export const getProSetByFullName = params => {
  return axios.post("psc/bpmCenter/getProSetByFullName", params);
};

//撤回操作
export const withdraw = params => {
  return axios.post("psc/bpmCenter/withdraw", params);
};

export const getEmailTemplateList = params => {
  return axios.post("/emailTemplate/listByPaging", params);
};
export const addEmailTemplate = params => {
  return axios.post("/emailTemplate/add", params);
};
export const deleteEmailTemplate = params => {
  return axios.post("/emailTemplate/delete", qs.stringify(params));
};
export const updateEmailTemplate = params => {
  return axios.post("/emailTemplate/update", params);
};
export const getEmailTemplateById = params => {
  return axios.post("/emailTemplate/getById", qs.stringify(params));
};
export const getEmailContent = params => {
  return axios.post("/emailTemplate/content", params);
};
export const checkEmailTemplateByCode = params => {
  return axios.post("/emailTemplate/checkTemplateCode", qs.stringify(params));
};
export const getMessageTemplateList = params => {
  return axios.post("/messageTemplate/listByPaging", params);
};
export const addMessageTemplate = params => {
  return axios.post("/messageTemplate/add", params);
};
export const deleteMessageTemplate = params => {
  return axios.post("/messageTemplate/delete", qs.stringify(params));
};
export const updateMessageTemplate = params => {
  return axios.post("/messageTemplate/update", params);
};
export const getMessageTemplateById = params => {
  return axios.post("/messageTemplate/getById", qs.stringify(params));
};
export const getMessageContent = params => {
  return axios.post("/messageTemplate/content", params);
};
export const checkMessageTemplateByCode = params => {
  return axios.post("/messageTemplate/checkTemplateCode", qs.stringify(params));
};

export const menuManagerGetFormMenuTree = params => {
  return axios.post("/menuManager/getFormMenuTree", qs.stringify(params));
};

export const getFormMenuTreeAPI = () => {
  return axios.post("/uau/perm/getBusiMenuPermission");
};

// 获取精细化报表项目CODE编码
export const getEreportCode = params => {
  return axios.post("/rpt/getEreportCode", params);
};
// 获取精细化报表token
export const getTokenByCode = params => {
  return axios.post("/rpt/getToken", params);
};

let baseurl = process.env.API_ROOT;
export default baseurl;

//流程附件 下载
export const downloadFile = params => {
  return axios
    .post("/procAttachment/downloadFile", params, { responseType: "blob" })
    .then(res => res.data);
};

export const processPrintAPI = (procId, procVersion) => {
  return axios
    .get(
      "/printPdf/processPrint?procId=" + procId + "&procVersion=" + procVersion,
      {
        responseType: "blob"
      }
    )
    .then(res => res.data);
};

//个人中心主题配置
export const getUserTheme = () => {
  return axios.get("/user/theme").then(res => res.data);
};
export const setUserTheme = params => {
  return axios.post("/user/theme/save", params).then(res => res.data);
};

//搜索配置字段
export const getQueryFields = params => {
  return axios
    .get("/user/getFields?queryId=" + params.queryId)
    .then(res => res.data);
};
export const saveQueryFields = params => {
  return axios.post("/user/saveFields", params).then(res => res.data);
};
export const getFieldsList = () => {
  return axios.get("/user/getFieldsList").then(res => res.data);
};

//隐私协议
// 获取隐私申明内容
export const getPrivacyStatement = params => {
  return axios
    .post("/privstate/getPrivacyStatement", params)
    .then(res => res.data);
};

// 同意隐私申明
export const agreePrivacyStatement = () => {
  return axios.post("/privstate/agreePrivacyStatement").then(res => res.data);
};
