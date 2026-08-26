/*
 * @Author: P623437
 * @Date: 2021-09-08 14:28:14
 * @LastEditors: P623437
 * @LastEditTime: 2022-05-25 14:53:02
 * @Description: 流程管理后台交互
 */

// import ht from '../../../../../../cudcomponents/workflowModule/components/http'
import ht from "@/api/http";
const getWfAuth = "/wfAuth/getWfAuth";
const getlist = "/process/getlist";
const getSubProcDefPage = "/process/getSubProcDefPage";
const deleteTemp = "/process/deleteTemp";
const flowTreeUrl = "/processCategory/getFlowTree";
const updateFlowUrl = "/processCategory/updateFlowType";
const saveFlowUrl = "/processCategory/addFlowType";
const deleteFlowUrl = "/processCategory/deleteFlowType";
const checkCodeOnly = "/processCategory/checkCodeOnly";
const checkNameOnly = "/processCategory/checkNameOnly";
const enableProcess = "/process/enableProcess";
const disableProcess = "/process/disableProcess";
const getHistory = "/process/getHistory";
const copyFlow = "wf/processManage/copyProcessTemplate";
const makeMainVer = "/wf/processManage/setMainVersion";
// 废弃此变量
// const getProcessTemplate = 'wf/processManage/getProcessTemplate';
const excelUpUrlPath = "/wf/processManage/importProcessTemplate";


//优化后接口内容
const initWfConfigInfo  = "/wf/WfConfigManage/initWFConfigInfo";



//保存流程模板为流程图草稿URL
const saveWorkflowDraftPath = "/wf/processManage/saveProcessTemplateDraft";
//发布流程模板为流程图设计URL
const publishWorkflowDraftPath =
  "/wf/processManage/publishProcessTemplateDraft";

const getWorkflowTemplPath = "/wf/processManage/getProcTemplate";

const publishWorkflowConfigPath = "/wf/processManage/publishProcTemplate";

const UpperpublishWorkflowConfigPath =
  "/wf/processManage/pubProcDraftUpVersion";
//流程导出
const exportProcessTemplate = "/wf/processManage/exportProcessTemplate";
//根据流程ID和版本获取所选流程模板的表单、模型、规则
const getProcessManageExportInfo = "/wf/processManage/getExportInfo";
//流程模板的导入
const processManageImportProcZip = "/wf/processManage/importProcZip";
//流程模板发布不进行保存操作只更改状态
const pubProcTemplOnlyStatus = "/wf/processManage/pubProcTemplOnlyStatus";
//查询PSC中当前流程状态
const searchPSCProcessContent = "/wf/processManage/searchPSCProcessContent";
// 根据表单ID表单相关信息接口
const getExportInfoUrl = "/businessForm/getExportInfo";
// 导出接口业务表单
const exportBusinessFormUrl = '/businessForm/exportBusinessForm'
// 查询已选触发子流程接口
const getSubProcConfigListUrl = '/wf/WfConfigManage/getSubProcConfigList'
// 删除子流程配置前的校验接口
const delConfigInfoUrl = '/wf/WfConfigManage/delConfigInfo'
export default {
  //保存流程模板为流程图草稿
  saveWorkflowDraftAPI: function(params) {
    return ht
      .post(saveWorkflowDraftPath, params, {
        apiTitle: "保存流程模板为流程图草稿"
      })
      .then(res => res.data);
  },
  // 发布流程模板为流程图设计
  publishWorkflowAPI: function(params) {
    return ht
      .post(publishWorkflowDraftPath, params, {
        apiTitle: "保存流程模板为流程图草稿"
      })
      .then(res => res.data);
  },
  // 发布流程配置
  publishWorkflowConfigAPI(params) {
    return ht
      .post(publishWorkflowConfigPath, params, { apiTitle: "发布流程模板配置" })
      .then(res => res.data);
  },
  upperpublishWorkflowConfigAPI(params) {
    return ht
      .post(UpperpublishWorkflowConfigPath, params, {
        apiTitle: "发布升版流程模板配置"
      })
      .then(res => res.data);
  },
  getWorkflowTemplByUIAPI(params) {
    return ht
      .post(getWorkflowTemplPath, params, {
        apiTitle: "根据流程ID和版本获取流程模板信息(map版)"
      })
      .then(res => res.data);
  },
  //获取工作流授权参数
  postWfAuthAPI: function(params) {
    return ht
      .post(getWfAuth, params, { apiTitle: "获取工作流授权参数" })
      .then(res => res.data);
  },
  //获得流程模板的分页列表
  getlistAPI: function(params) {
    return ht
      .post(getlist, params, { apiTitle: "得流程模板的分页列表" })
      .then(res => res.data);
  },
  //获得流程模板的分页列表
  getSubProcDefPageAPI: function(params) {
    return ht
      .post(getSubProcDefPage, params, { apiTitle: "得流程模板的分页列表" })
      .then(res => res.data);
  },
  //获得流程模板历史的分页列表
  getHistoryAPI: function(params) {
    return ht
      .post(getHistory, params, { apiTitle: "得流程模板历史的分页列表" })
      .then(res => res.data);
  },
  //编辑流程模板 废弃此方法
  // getProcessTemplateAPI: function (params) {
  //   return ht.getHttp().post(getProcessTemplate, params, { apiTitle: "编辑流程模板" }).then(res => res.data);
  // },
  //删除流程模板
  deleteTempAPI: function(params) {
    return ht
      .post(deleteTemp, params, { apiTitle: "删除流程模板" })
      .then(res => res.data);
  },
  //启用流程模板
  enableProcessAPI: function(params) {
    return ht
      .post(enableProcess, params, { apiTitle: "启用流程模板" })
      .then(res => res.data);
  },
  //禁用流程模板
  disableProcessAPI: function(params) {
    return ht
      .post(disableProcess, params, { apiTitle: "禁用流程模板" })
      .then(res => res.data);
  },
  //复制流程模板
  copyFlowAPI: function(params) {
    return ht
      .post(copyFlow, params, { apiTitle: "复制流程模板" })
      .then(res => res.data);
  },
  //流程模板设置主版本
  makeMainVerAPI: function(params) {
    return ht
      .post(makeMainVer, params, { apiTitle: "流程模板设置主版本" })
      .then(res => res.data);
  },
  //流程树查询
  flowTreeAPI: function(params) {
    return ht
      .post(flowTreeUrl, params, { apiTitle: "流程树查询" })
      .then(res => res.data);
  },
  //保存流程树
  saveFlowAPI: function(params) {
    return ht
      .post(saveFlowUrl, params, { apiTitle: "保存流程树" })
      .then(res => res.data);
  },
  //更新流程树
  updateFlowAPI: function(params) {
    return ht
      .post(updateFlowUrl, params, { apiTitle: "更新流程树" })
      .then(res => res.data);
  },
  //删除流程节点
  deleteFlowAPI: function(params) {
    return ht
      .post(deleteFlowUrl, params, { apiTitle: "删除流程节点" })
      .then(res => res.data);
  },
  //检验流程分类中编码的唯一性
  checkCodeOnlyAPI: function(params) {
    return ht
      .post(checkCodeOnly, params, { apiTitle: "检验流程分类中编码的唯一性" })
      .then(res => res.data);
  },
  //检验流程分类中名称的唯一性
  checkNameOnlyAPI: function(params) {
    return ht
      .post(checkNameOnly, params, { apiTitle: "检验流程分类中名称的唯一性" })
      .then(res => res.data);
  },
  //流程导出
  exportProcessTemplate: function(params) {
    return ht
      .post(exportProcessTemplate, params, { apiTitle: "流程导出" })
      .then(res => res.data);
  },
  //根据流程ID和版本获取所选流程模板的表单、模型、规则
  getProcessManageExportInfo: function(params) {
    return ht
      .post(getProcessManageExportInfo, params, {
        apiTitle: "根据流程ID和版本获取所选流程模板的表单、模型、规则"
      })
      .then(res => res.data);
  },
  getExportInfo: function(params) {
    return ht
      .post(getExportInfoUrl, params)
      .then(res => res.data);
  },
  //流程模板的导入
  processManageImportProcZip: function(params) {
    return ht
      .post(processManageImportProcZip, params, { apiTitle: "流程模板的导入" })
      .then(res => res.data);
  },
  getExcelUpUrl() {
    return ht.defaults.baseURL + excelUpUrlPath;
  },
  // 导出后台地址
  generateCodeAPI: function(params) {
    return ht
      .post("/wf/processManage/exportProcessTemplate", params, {
        responseType: "blob"
      })
      .then(res => res.data);
  },
  // 流程模板发布不进行保存操作只更改状态
  pubProcTemplOnlyStatus: function(params) {
    return ht
      .post(pubProcTemplOnlyStatus, params, {
        apiTitle: "流程模板发布不进行保存操作只更改状态"
      })
      .then(res => res.data);
  },
  //查询PSC中当前流程状态
  searchPSCProcessContent: function (params) {
    return ht.post(searchPSCProcessContent, params, { apiTitle: "查询PSC中当前流程状态" }).then(res => res.data);
  },
  initWfConfigInfo: function (params) {
    return ht.post(initWfConfigInfo, params, { apiTitle: "获取流程配置初始化数据" }).then(res => res.data);
  },
  exportBusinessForm: function(params) {
    return ht
      .post(exportBusinessFormUrl, params, {
        responseType: "blob"
      })
      .then(res => res.data);
  },
  //查询已选触发子流程接口
  getSubProcConfigList: function(params) {
    return ht
      .post(getSubProcConfigListUrl, params)
      .then(res => res.data);
  },
  delConfigInfo: function(params) {
    return ht
      .post(delConfigInfoUrl, params)
      .then(res => res.data);
  },
}

