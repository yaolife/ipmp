import axios from '@/api/http';
import { default as Request, resetBaseUrl } from '@/utils/request';
const modelName = '/assembly';
const runtimeModelName = '/runtime';
const flowDesignerModelName = '/flowDesigner';
const wfAuthModelName = '/wfAuth';


export default {

    resetAxiosBaseUrl: resetBaseUrl,
    checkTask: function (params) {
        return axios.post(modelName + "/checkTask", params);
    },
    //组件待办任务总数
    countTask: function (params) {
        return axios.post(modelName + "/countTask", params);
    },
    //组件查询待阅总数
    countTaskCC: function (params) {
        return axios.post(modelName + "/countTaskCC", params);
    },
    //组件查询已办总数
    countTaskHist: function (params) {
        return axios.post(modelName + "/countTaskHist", params);
    },
    //组件查询已阅总数
    countTaskCCHist: function (params) {
        return axios.post(modelName + "/countTaskCCHist", params);

    },
    //组件待办共享任务列表总数
    countShareTask: function (params) {
        return axios.post(modelName + "/countShareTask", params);

    },
    //组件查询待办任务
    queryTask: function (params) {
        return axios.post(modelName + "/queryTask", params);

    },
    //组件查询已办任务
    queryTaskHist: function (params) {
        return axios.post(modelName + "/queryTaskHist", params);

    },
    //组件查询待阅任务
    queryTaskCC: function (params) {
        return axios.post(modelName + "/queryTaskCC", params);

    },
    //组件查询已阅任务
    queryTaskCCHist: function (params) {
        return axios.post(modelName + "/queryTaskCCHist", params);

    },
    //组件查询共享任务列表
    queryShareTask: function (params) {
        return axios.post(modelName + "/queryShareTask", params);

    },
    //任务认领
    claimTask: function (params) {
        return axios.post(runtimeModelName + "/claimTask", params);

    },
    //任务取消认领
    unClaimTask: function (params) {
        return axios.post(modelName + "/unClaimTask", params);

    },
    //任务已阅
    completeTaskCC: function (params) {
        return axios.post(modelName + "/completeTaskCC", params);

    },
    //任务撤回
    withdrawTask: function (params) {
        return axios.post(modelName + "/withdrawTask", params);
    },
    withdrawTaskApi: function (params) {
        return axios.post("/process-operations/withdrawTask", params);
    },
    //任务抄送
    createTaskCC: function (params) {
        return axios.post(modelName + "/createTaskCC", params);
    },
    createTaskCCApi: function (params) {
        return axios.post("/process-operations/createTaskCC", params);
    },
    //任务打开
    openTask: function (params) {
        return axios.post(modelName + "/openTask", params);

    },
    //根据应用获取流程模型分类选项
    queryCategoryByAppId: function (params) {
        return Request.post(flowDesignerModelName + "/queryCategoryByAppId", params);

    },
    //查询所有归档库名
    getArchiveDataBaseConfig: function (params) {
        return axios.post(modelName + "/getArchiveDataBaseConfig", params);

    },
    //流程实例作废
    abandonProcInst: function (params) {
        return axios.post(modelName + "/abandonProcInst", params);

    },
    //任务转办
    transferTask: function (params) {
        return axios.post(modelName + "/transferTask", params);
    },
    transferTaskApi: function (params) {
        return axios.post("/process-operations/transferTask", params);
    },
    //任务委托
    detegateTask: function (params) {
        return axios.post(modelName + "/detegateTask", params);
    },
    detegateTaskApi: function (params) {
        return axios.post("/process-operations/detegateTask", params);
    },
    //任务撤销委托
    unDetegateTask: function (params) {
        return axios.post(modelName + "/unDetegateTask", params);
    },
    //根据任务id查询委托人
    queryAssignorByProcId: function (params) {
        return axios.post(modelName + "/queryAssignorByProcId", params);
    },

    //验证流程数据是否更新
    procValidateUpdate: function (params) {
        return axios.post(modelName + "/procValidateUpdate", params);
    },
    //流程发起
    startProcess: function (params) {
        return axios.post(modelName + "/startProcess", params);

    },
    //流程提交
    submitProcess: function (params) {
        return axios.post(modelName + "/submitProcess", params);

    },
    //根据主键查询环节实例
    queryProcActInstById: function (params) {
        return axios.post(modelName + "/queryProcActInstById", params);

    },
    //查询退回可退回环节
    queryGoBackActIdSelList: function (params) {
        return axios.post(modelName + "/queryGoBackActIdSelList", params);

    },
    //任务退回
    sendBack: function (params) {
        return axios.post(modelName + "/sendBack", params);
    },
    sendBackApi: function (params) {
        return axios.post("/process-operations/sendBack", params);
    },
    //任务退回环节内
    sendBackInAct: function (params) {
        return axios.post(modelName + "/sendBackInAct", params);

    },
    //根据流程实例获取模型环节列表
    getProcActListByProcInst: function (params) {
        return Request.post(flowDesignerModelName + "/getProcActListByProcInst", params);
    },
    //关注保存
    addMyConcern: function (params) {
        return axios.post(modelName + "/addMyConcern", params);
    },
    //关注删除
    delMyConcern: function (params) {
        return axios.post(modelName + "/delMyConcern", params);
    },
    // 获取催办人
    remindTask: function (params) {
        return axios.post(modelName + "/remindTask", params);
    },
    // 发送催办邮件
    sendRemind: function (params) {
        return axios.post(modelName + "/sendRemind", params);
    },
    //查询下拉数据
    getOptions: function (params) {
        return axios.post("/workbench/getOptions", params);
    },
    //权限获取
    postWfAuthAPI: function (params) {
        return axios.post(wfAuthModelName + "/getWfAuth", params);
    },
    // 获取下一审批人
    quickApprove: function (params) {
        return axios.post(modelName + "/quickApprove", params);
    },
    // 快捷审批
    quickSubmit: function (params) {
        return axios.post(modelName + "/quickSubmit", params);
    },
    // 查询流程工具条
    getProcFormExamineTool: function (params) {
        return axios.post(modelName + "/getProcFormExamineTool", params);
    },
    // 根据任务id查看委托数据
    queryDetegateByTaskId: function (params) {
        return axios.post(modelName + "/queryDetegateByTaskId", params);
    },
    // 取消委托
    unDetegateTask: function (params) {
        return axios.post(modelName + "/unDetegateTask", params);
    },
    //批量审批
    multiSubmitProcess: function (params) {
        return axios.post(modelName + "/multiSubmitProcess", params);
    },
    //批量退回
    multiSendBack: function (params) {
        return axios.post(modelName + "/multiSendBack", params);
    },
    procInstAssigneeNameList: function (params) {
        return axios.post("/process-operations/queryTaskRelation", params);
    },
    processOperationsLog: function (params) {
        return axios.post("/process-operations/logList", params);
    },
}




