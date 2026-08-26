/*
 * @Author: p628200
 * @Date: 2022-01-18 14:28:14
 * @LastEditors: P623437
 * @LastEditTime: 2022-04-15 14:27:43
 * @Description: 流程管理后台交互
 */
import axios from "@/api/http";

const getDataBaseConfig = "/proc-instance/getDataBase";

//**************流程实例*****************
const getProcInstlist = "/proc-instance/queryTaskList";
const proInstDetail = "/proc-instance/getProcInst";
const proInstUpdate = "/proc-instance/update";
const abandonProcInstAPI = "/proc-instance/invalid";
// const terminateProcInstAPI = "/proc-instance/terminate";
const terminateProcInstAPI = "/process-operations/terminate";
const hangupProcInstAPI = "/proc-instance/hangup";
const recoverProcInstAPI = "/proc-instance/recover"; 
// const activeProcInstAPI = "/proc-instance/active";
const activeProcInstAPI = "/process-operations/active"; 
const deleteProcInstAPI = "/proc-instance/delete"; 
const removeInvalidProcessAPI = "/remove-invalid-process";

//**************流程实例*****************
const getProcInstLoglist = "/wfAPI/log/getLogDataPage";

import cryptojs from "@/utils/crypto";
const modelName = "/assembly/prepareSubmit";
const initProcess = "/assembly/initProcess";
const procUrl = "/workbench/getProcAllData";
const favoriteUrl = "/workbench/getFavoriteAllData";
const commonlyUseUrl = "/workbench/getCommonlyUseAllData";
const delListUrl = "/favorite/deleteFavorite";
const saveFavoritUrl = "/favorite/saveFavorite";
const getWfAuth = "/wfAuth/getWfAuth";
const getProcFormUrl = "/procForm/getProcForm";
const saveDrafts = "/procssinfo/saveDrafts";
const procValidateUpdate = "/assembly/procValidateUpdate";
const delConcernUrl = "/concern/deleteMyConcern";
const sendSubmitProcess = "/assembly/backSubmitProcess";
const queryGoBackActIdSelList = "/assembly/queryGoBackActIdSelList";
const addConcernUrl = "/assembly/addMyConcern";
const unDetegateTask = "/assembly/unDetegateTask";
//用于获取会签项名称复杂参数
const getDataItemManTableList = "/processRelData/getDataItemManTableList";
const getTaskInstlist = "/task-instance/list";

export default {
  //获取工作流授权参数
  postWfAuthAPI: function(params) {
    return axios
      .post(getWfAuth, params, { apiTitle: "获取工作流授权参数" })
      .then(res => res.data);
  },
  //查询所有归档库名
  getDataBaseConfigApi: function(params) {
    return axios.post(getDataBaseConfig, params);
  },

  //----------------------------流程实例-----------------------
  //获得流程实例的分页列表
  getProcInstlistAPI: function(params) {
    return axios
      .post(getProcInstlist, params, { apiTitle: "获得流程实例的分页列表" })
      .then(res => res.data);
  },

  //获得流程实例的详情
  detailProcInstAPI: function(params) {
    return axios
      .post(proInstDetail, params, { apiTitle: "获得流程实例的详情" })
      .then(res => res.data);
  },
  //流程实例-编辑
  updateProcInstAPI: function(params) {
    return axios
      .post(proInstUpdate, params, { apiTitle: "流程实例-编辑" })
      .then(res => res.data);
  },
  //流程实例-作废
  abandonProcInstAPI: function(params) {
    return axios
      .post(abandonProcInstAPI, params, { apiTitle: "流程实例-作废" })
      .then(res => res.data);
  },
  //流程实例-终止
  terminateProcInstAPI: function(params) {
    return axios
      .post(terminateProcInstAPI, params, { apiTitle: "流程实例-终止" })
      .then(res => res.data);
  },
  //流程实例-挂起
  hangupProcInstAPI: function(params) {
    return axios
      .post(hangupProcInstAPI, params, { apiTitle: "流程实例-挂起" })
      .then(res => res.data);
  },
  //流程实例-恢复
  recoverProcInstAPI: function(params) {
    return axios
      .post(recoverProcInstAPI, params, { apiTitle: "流程实例-恢复" })
      .then(res => res.data);
  },
  //流程实例-激活
  activeProcInstAPI: function(params) {
    return axios
      .post(activeProcInstAPI, params, { apiTitle: "流程实例-激活" })
      .then(res => res.data);
  },
  deleteProcInstAPI: function(params) {
    return axios
      .post(deleteProcInstAPI, params, { apiTitle: "流程实例-激活" })
      .then(res => res.data);
  },


  //----------------------------流程日志-----------------------
  //获得流程日志的的分页列表
  getProcInstLoglistAPI: function(params) {
    return axios
      .post(getProcInstLoglist, params, { apiTitle: "获得流程实例的分页列表" })
      .then(res => res.data);
  },
  //获取当前用户信息
  getUserInfo: params => {
    return axios.post("user/getCurrentUser", params);
  },
  //根据流程实例获取模型环节列表
  prepareSubmit: function(params) {
    let signInfo = cryptojs.getMd5(encodeURIComponent(JSON.stringify(params)));
    return axios.post(modelName, params, { headers: { signInfo: signInfo } });
  },
  //查询数据管理项页面的表中的内容不分页-用于获取会签项名称复杂参数
  getDataItemManTableListAPI: function(params) {
    return axios
      .post(getDataItemManTableList, params, {
        apiTitle: "查询数据管理项页面的表中的内容-不分页"
      })
      .then(res => res.data);
  },
  procListAPI: function(params) {
    return axios.post(procUrl, params).then(res => res.data);
  },
  favoriteListAPI: function(params) {
    return axios.post(favoriteUrl, params).then(res => res.data);
  },
  commonlyUseListAPI: function(params) {
    return axios.post(commonlyUseUrl, params).then(res => res.data);
  },
  deletefavorit: function(params) {
    return axios.post(delListUrl, params).then(res => res.data);
  },
  savefavorit: function(params) {
    return axios.post(saveFavoritUrl, params).then(res => res.data);
  },
  // 获取流程表单渲染数据
  getProcFormAPI: function(params) {
    return axios
      .post(getProcFormUrl, params, { apiTitle: "获取流程表单渲染数据" })
      .then(res => res.data);
  },
  initProcess: function(params) {
    return axios
      .post(initProcess, params, { apiTitle: "初始化流程表单" })
      .then(res => res.data);
  },
  //获得任务实例的分页列表
  getTaskInstlist: function(params) {
    return axios
      .post(getTaskInstlist, params, { apiTitle: "获得流程实例的分页列表" })
      .then(res => res.data);
  },
  // 保存草稿
  saveDrafts: function(params) {
    return axios
      .post(saveDrafts, params, { apiTitle: "保存草稿" })
      .then(res => res.data);
  },
  // 保存草稿
  procValidateUpdate: function(params) {
    return axios
      .post(procValidateUpdate, params, { apiTitle: "验证流程数据是否更新" })
      .then(res => res.data);
  },
  deleteMyConcern: function(params) {
    return axios
      .post(delConcernUrl + "?ids=" + params.ids, params)
      .then(res => res.data);
  },
  //查询退回可退回环节
  queryGoBackActIdSelList: function(params) {
    return axios.post(queryGoBackActIdSelList, params);
  },
  sendSubmitProcess: function(params) {
    return axios.post(sendSubmitProcess, params).then(res => res.data);
  },
  //关注保存
  addConcernUrl: function(params) {
    return axios.post(addConcernUrl, params);
  },
  //任务撤销委托
  unDetegateTask: function(params) {
    return axios.post(unDetegateTask, params);
  },
  asyncTest: function(params) {
    return axios.post("/v1/ext/startProcessExt", params);
    // return axios.post('/processCollectionRule/getProcColleRulePage', params);
  },

  removeInvalidProcessAPI: function(params) {
    return axios
      .post(removeInvalidProcessAPI, params, { apiTitle: "删除流程" })
      .then(res => res.data);
  },
};
