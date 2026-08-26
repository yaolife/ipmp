import ht from "@/api/http";

const getProcessTestPage = "/ipm/processTest/getProcessTestPage";
const manualExecute = "/ipm/processTest/manualExecute";
const getProcessSteps = "/ipm/processTest/getProcessSteps";
const saveProcessTestInfo = "/ipm/processTest/saveProcessTestInfo";
const autoExecute = "/ipm/processTest/autoExecute";

const getModelByProcTestId = "/ipm/processTestSub/getModelByProcTestId";
const saveProcessTestSubInfo = "/ipm/processTestSub/saveProcessTestSubInfo";
const getProcessTestLogPage = "/ipm/processTestLog/getProcessTestLogPage";

//根据环节标识和前置条件标识获取单个环节的所有配置信息
const getWFConfigActPreInfo = "/wf/WfConfigManage/getWFConfigActPreInfo";

const listRouteConfig = "/ipm/processConfig/listRouteConfig";

const expressionCheck = '/ruleEngine/execRuleExpr';
const listPicConfig = '/ipm/processConfig/listPicConfig';

const getSendBackConfig = '/ipm/processConfig/getSendBackConfig';
const sendBack = '/ipm/processTest/sendBack';

const getProcTemplBaseInfoPath = '/wf/procTestCase/getBaseProcessTemplate';
const getFormPath = '/wf/procTestCase/queryFormHisData';
const getSimuActNextRouterInfoPath = '/wf/processRule/getSimuNextActRouterInfo';
const processTestExecuteStatus = '/ipm/processTest/processTestExecuteStatus'

export default {

  //流程模拟列表
  getProcessTestPage: function (params) {
    return ht.post(getProcessTestPage, params, { apiTitle: "流程模拟列表" }).then(res => res.data);
  },
  // 保存模拟测试运行参数
  saveProcessTestInfo: function (params) {
    return ht.post(saveProcessTestInfo, params, { apiTitle: "保存模拟测试运行参数" }).then(res => res.data);
  },
  //流程仿真测试手动执行
  manualExecute: function (params) {
    return ht.post(manualExecute, params, { apiTitle: "流程仿真测试手动执行" }).then(res => res.data);
  },

  getProcessSteps: function (params) {
    return ht.post(getProcessSteps, params).then(res => res.data);
  },


  // 保存模拟测试运行参数
  getProcessTestLogPage: function (params) {
    return ht.post(getProcessTestLogPage, params, { apiTitle: "通过流程测试ID查询流程模拟日志列表" }).then(res => res.data);
  },

  // 通过流程测试ID获取流程模拟测试子表详情
  getModelByProcTestId: function (params) {
    return ht.post(getModelByProcTestId+"?procTestId="+params, params, { apiTitle: "通过流程测试ID获取流程模拟测试子表详情" }).then(res => res.data);
  },
  // 保存流程模拟测试子表数据
  saveProcessTestSubInfo: function (params) {
    return ht.post(saveProcessTestSubInfo, params, { apiTitle: "保存流程模拟测试子表数据" }).then(res => res.data);
  },

  getWFConfigActPreInfo: function (params) {
    return ht.post(getWFConfigActPreInfo, params, {apiTitle: "根据环节标识和前置条件标识获取单个环节的所有配置信息"}).then(res => res.data);
  },


  // 获取流程配置路由配置列表
  listRouteConfig: function (params) {
    return ht.post(listRouteConfig, params, { apiTitle: "获取流程配置路由配置列表" }).then(res => res.data);
  },

  listPicConfig:function(params){
    return ht.post(listPicConfig, params, { apiTitle: "获取流程负责人配置信息" }).then(res => res.data);
  },

  expressionCheck: function (params) {
    return ht.post(expressionCheck, params, { apiTitle: "表达式测试" }).then(res => res.data);
  },

  autoExecute:function (params) {
    return ht.post(autoExecute, params, { apiTitle: "流程仿真测试自动执行" }).then(res => res.data);
  },

  getSendBackConfig:function (params) {
    return ht.post(getSendBackConfig, params, { apiTitle: "获取流程退回配置信息" }).then(res => res.data);
  },
  sendBack:function (params) {
    return ht.post(sendBack, params, { apiTitle: "流程仿真测试退回" }).then(res => res.data);
  },


  // 获取流程模板基本信息
  getProcTemplBaseInfoAPI(params) {
    return ht.post(getProcTemplBaseInfoPath, params, { apiTitle: "获取流程模板基本信息" }).then(res => res.data)
  },
  // 获取表单内容信息
  getFormAPI(params) {
    return ht.post(getFormPath, params, { apiTitle: "获取表单信息" }).then(res => res.data)
  },
  getSimuActNextRouterAPI(params) {
    return ht.post(getSimuActNextRouterInfoPath, params, { apiTitle: "获取当前环节的路由环节信息" }).then(res => res.data)
  },
  //流程组查询详情
  groupDetailAPI: function (params) {
    return ht.post('/wfProcessGroup/detail' + "/" + params.id).then(res => res.data);
  },
  //获取流程组详情
  processGroupCustormers: function (params) {
    return ht.post('/processTest/autoGetCustomer/getProcessGroupCustormers'  ,params,).then(res => res.data);
  },
  //根据DM实体ID获取获取实体信息列表
  getModleDataById:function (params) {
    return ht.post('/processTest/autoGetCustomer/getModleDataById',params,).then(res => res.data);
  },
  //获取当前模拟测试发起人信息
  getCurStartUserByParticipantType:function (params) {
    return ht.post('/processTest/autoGetCustomer/getCurStartUserByParticipantType',params,).then(res => res.data);
  },
  //根据处理人角色ID获取对应的动态审批人信息
  getApproverByParticipantId:function (params) {
    return ht.post('/processTest/autoGetCustomer/getApproverByParticipantId',params,).then(res => res.data);
  },
  processTestExecuteStatusApi: function (params) {
    return ht
      .post(processTestExecuteStatus, params)
      .then(res => res.data);
  },
}
// {
//   participantId:11111,
//     {
//       unit:11111,
//       name:11111,
//     }
// }
