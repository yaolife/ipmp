import axios from '@/api/http';
import qs from 'qs';

const queryTask = '/process-operations/procInstTaskList' // 待办
const submitProcess = '/assembly/submitProcess'
const queryGoBackActIdSelList = "/assembly/queryGoBackActIdSelList"
const sendBack = "/process-operations-sendBack"
const recoverProcInstAPI = "/proc-instance/recover"
const hangup = "/proc-instance/hangup"
const queryTaskList = "/processAdmin/queryTaskList"
const detegateTask = "/process-operations/updateTask"
const getProcInst = '/proc-instance/getProcInst'
const selectAaaList = '/processAdmin/selectAaaList'
const queryTaskHist = '/process-operations-queryTaskHist' // 已办
const taskInstQueryDetail = '/task-instance/queryDetail';
const taskInstJumpActList = '/task-instance/jump/actList';
const taskInstJump = '/task-instance/jump';
// const taskInstAddSign = '/task-instance/addSign'; 
const taskInstAddSign = '/process-operations/addSign';
const getDataItemManTableList = '/processRelData/getDataItemManTableList';
export default {
  queryTask: params => {
    return axios.post(queryTask, params);
  },
  submitProcess: params => {
    return axios.post(submitProcess, params);
  },
  //查询退回可退回环节
  queryGoBackActIdSelList: function (params) {
    return axios.post(queryGoBackActIdSelList, params);
  },
  //退回接口
  sendBack: function (params) {
    return axios.post(sendBack, params);
  },

  //流程实例-恢复
  recoverProcInstAPI: function (params) {
    return axios
      .post(recoverProcInstAPI, params, { apiTitle: "流程实例-恢复" })
      .then(res => res.data);
  },

  //流程实例-挂起
  hangupProcInstAPI: function (params) {
    return axios
      .post(hangup, params, { apiTitle: "流程实例-挂起" })
      .then(res => res.data);
  },
  //挂起任务列表
  queryTaskList: function (params) {
    return axios.post(queryTaskList, params);
  },

  // 更换处理人
  detegateTask: function (params) {
    return axios.post(detegateTask, params);
  },

  // 挂起前置查询
  getProcInst: function (params) {
    return axios.post(getProcInst, params);
  },

  // 异常任务-列表
  selectAaaList: function (params) {
    return axios.post(selectAaaList, params);
  },

  // 已办
  queryTaskHist: function (params) {
    return axios.post(queryTaskHist, params);
  },
  //任务实例-详情
  queryDetailTaskInstAPI: function (params) {
    return axios.post(taskInstQueryDetail, params, { apiTitle: "任务实例详情" }).then(res => res.data);
  },
  //任务实例-可跳转列表
  jumpSelListTaskInstAPI: function (params) {
    return axios.post(taskInstJumpActList, params, { apiTitle: "任务实例-可跳转列表" }).then(res => res.data);
  },
  //任务实例-跳转
  jumpTaskInstAPI: function (params) {
    return axios.post(taskInstJump, params, { apiTitle: "任务实例跳转" }).then(res => res.data);
  },
  //任务实例-加签
  addSignTaskInstAPI: function (params) {
    return axios.post(taskInstAddSign, params, { apiTitle: "任务实例加签" }).then(res => res.data);
  },
  //查询数据管理项页面的表中的内容不分页-用于获取会签项名称复杂参数
  getDataItemManTableListAPI: function (params) {
    return axios.post(getDataItemManTableList, params, { apiTitle: "查询数据管理项页面的表中的内容-不分页" }).then(res => res.data);
  },
}