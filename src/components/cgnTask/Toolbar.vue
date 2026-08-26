<template>
  <div class="cgn-task-toolbar">
    <!-- 任务作废弹窗 -->
    <task-abandon-dialog
      v-if="taskAbandonDialog.isOpen"
      v-bind="taskAbandonDialog"
      @requestApi="getRequestApi"
      @closeDialog="closeTaskAbandonDialog"
    >
    </task-abandon-dialog>
    <!-- 任务抄送弹窗 -->
    <task-cc-dialog
      v-if="taskCcDialog.isOpen"
      v-bind="taskCcDialog"
      @closeDialog="closeTaskCcDialog"
      :emailMessageShow="emailMessageShow"
      :shortMessageShow="shortMessageShow"
      :dingMessageShow="dingMessageShow"
      :emailMessageTrue="emailMessageTrue"
      :shortMessageTrue="shortMessageTrue"
      :dingMessageTrue="dingMessageTrue"
    >
    </task-cc-dialog>
    <!-- 查看流程图弹窗 -->
    <task-view-show-dialog
      v-if="taskViewShowDialog.isOpen"
      v-bind="taskViewShowDialog"
      @requestApi="getRequestApi"
      @closeDialog="closeTaskViewShowDialog"
    >
    </task-view-show-dialog>
    <!-- 任务转办弹窗 -->
    <task-transfer-dialog
      v-if="taskTransferDialog.isOpen"
      v-bind="taskTransferDialog"
      @requestApi="getRequestApi"
      @closeDialog="closeTaskTransferDialog"
      :emailMessageShow="emailMessageShow"
      :shortMessageShow="shortMessageShow"
      :dingMessageShow="dingMessageShow"
      :emailMessageTrue="emailMessageTrue"
      :shortMessageTrue="shortMessageTrue"
      :dingMessageTrue="dingMessageTrue"
    >
    </task-transfer-dialog>
    <!-- 任务委托弹窗 -->
    <task-detegate-dialog
      v-if="taskDetegateDialog.isOpen"
      v-bind="taskDetegateDialog"
      @requestApi="getRequestApi"
      @closeDialog="closeTaskDetegateDialog"
      :emailMessageShow="emailMessageShow"
      :shortMessageShow="shortMessageShow"
      :dingMessageShow="dingMessageShow"
      :emailMessageTrue="emailMessageTrue"
      :shortMessageTrue="shortMessageTrue"
      :dingMessageTrue="dingMessageTrue"
    >
    </task-detegate-dialog>
    <!-- 任务取消委托弹窗 -->
    <task-undetegate-dialog
      v-if="taskUndetegateDialog.isOpen"
      v-bind="taskUndetegateDialog"
      @requestApi="getRequestApi"
      @closeDialog="closeTaskUndetegateDialog"
    >
    </task-undetegate-dialog>
    <!-- 任务退回弹窗 -->
    <task-send-back-dialog
      v-if="taskSendBackDialog.isOpen"
      v-bind="taskSendBackDialog"
      @requestApi="getRequestApi"
      @closeDialog="closeTaskSendBackDialog"
      :emailMessageShow="emailMessageShow"
      :shortMessageShow="shortMessageShow"
      :dingMessageShow="dingMessageShow"
      :emailMessageTrue="emailMessageTrue"
      :shortMessageTrue="shortMessageTrue"
      :dingMessageTrue="dingMessageTrue"
    >
    </task-send-back-dialog>
    <!-- 任务已阅弹窗 -->
    <task-read-dialog
      v-if="taskReadDialog.isOpen"
      v-bind="taskReadDialog"
      @requestApi="getRequestApi"
      @closeDialog="closeTaskReadDialog"
    >
    </task-read-dialog>
    <!-- 流程提交弹窗 -->
    <process-submit-dialog
      v-if="processSubmitDialog.isOpen"
      v-bind="processSubmitDialog"
      @requestApi="getRequestApi"
      @closeDialog="closeProcessSubmitDialog"
      @saveFn="saveFn"
      :ccShow="ccShow"
      :emailMessageShow="emailMessageShow"
      :shortMessageShow="shortMessageShow"
      :dingMessageShow="dingMessageShow"
      :emailMessageTrue="emailMessageTrue"
      :shortMessageTrue="shortMessageTrue"
      :dingMessageTrue="dingMessageTrue"
      :messageAllHide="messageAllHide"
      :dialogAutoSubmit="dialogAutoSubmit"
      :getOption="getOption"
      :directionType="directionType"
    >
    </process-submit-dialog>
  </div>
</template>

<script>
import Vue from "vue";
import * as Utils from "@/utils/Utils";
import ApiTask from "./common/ApiTask";
import TaskAbandonDialog from "./components/dialog/TaskAbandonDialog";
// import TaskCcDialog from './components/dialog/TaskCcDialog';
import TaskTransferDialog from "./components/dialog/TaskTransferDialog";
import TaskDetegateDialog from "./components/dialog/TaskDetegateDialog";
import TaskUndetegateDialog from "./components/dialog/TaskUndetegateDialog";
import TaskSendBackDialog from "./components/dialog/TaskSendBackDialog";
import TaskReadDialog from "./components/dialog/TaskReadDialog";
import ProcessSubmitDialog from "./components/dialog/ProcessSubmitDialog";
// import TaskViewShowDialog from './components/dialog/TaskViewShowDialog';

/**
 * 流程服务工具条
 */
export default {
  name: "CgnTaskToolbar",
  components: {
    TaskAbandonDialog,
    TaskTransferDialog,
    TaskDetegateDialog,
    TaskUndetegateDialog,
    TaskSendBackDialog,
    TaskReadDialog,
    ProcessSubmitDialog
  },
  props: {
    processId: { type: String, required: true }, // 流程ID，必填
    procVersion: { type: String, default: "" }, // 流程版本，必填
    procActId: { type: String, default: "" }, // 当前环节ID
    procActName: { type: String, default: "" }, // 当前环节名称
    procActEnName: { type: String, default: "" }, // 当前环节英文名称
    procInstId: { type: String, default: "" }, // 流程实例ID，审批模式/查看模式必填
    procActInstId: { type: String, default: "" }, // 流程环节实例ID，审批模式/查看模式必填
    procTaskId: { type: String, default: "" }, // 任务ID，审批模式/查看模式必填
    dialogType: { type: String, default: "" }, // 按钮控制1：发起，2：提交
    dataKey: { type: String, default: "" }, // 数据key
    dataUpdateFlag: { type: String, default: "" }, // 数据更新标识
    modelName: { type: String, default: "" },
    scItemCofList: { type: Array }, //会签事项名称配置
    ccShow: { type: Boolean, default: false }, //是否显示抄送
    shortMessageShow: { type: Boolean, default: false }, // 是否显示短信
    emailMessageShow: { type: Boolean, default: false }, // 是否显示邮箱
    dingMessageShow: { type: Boolean, default: false }, // 是否显示鹭钉
    shortMessageTrue: { type: Boolean, default: false }, // 是否默认勾选短信
    emailMessageTrue: { type: Boolean, default: false }, // 是否默认勾选邮件
    dingMessageTrue: { type: Boolean, default: false }, // 是否默认勾选鹭钉
    messageAllHide: { type: String },
    dialogAutoSubmit: { type: String },
    directionType: { type: String },
    modelRelation: { type: Array }, //数据模型映射
    getOption: {
      type: Object,
      dufault: () => {}
    },
    submitData: {
      // 提交数据
      type: Object,
      default: function() {
        return {
          end: false, //是否结束环节
          modifyAssignee: false, // 是否可以修改处理人
          targetActList: [], // 目标环节列表
          actAssigneeInfoList: [], // 可编辑环节列表
          ccList: [], // 抄送人列表
          procInsBizExtendList: [] // 流程实例业务信息拓展
        };
      }
    },
    backData: {
      // 退回数据
      type: Object,
      default: function() {
        return {
          approvalAction: "",
          comment: "",
          approvalFlg: false,
          goBackActOptions: [],
          isShow: false
        };
      }
    },
    abandonData: {
      // 作废数据
      type: Object,
      default: function() {
        return {
          comment: ""
        };
      }
    }
  },
  provide() {
    let that = this;
    return {
      indexProvide: new Vue({
        data() {
          return {
            ascUrl: that.ascUrl // 中台选人控件地址
          };
        }
      })
    };
  },
  data() {
    return {
      taskAbandonDialog: {
        // 任务作废弹窗
        isOpen: false,
        isPromptSuccess: false, // 是否提示成功信息（设置不提示，由工具条调用方提示）
        procInstId: "", // 流程实例ID，必填
        procActId: "" // 环节ID，必填
      },
      taskCcDialog: {
        // 任务抄送弹窗
        isOpen: false,
        isPromptSuccess: false, // 是否提示成功信息（设置不提示，由工具条调用方提示）
        procInstId: "", // 流程实例ID，必填
        procActInstId: "", // 流程环节实例ID，必填
        procTaskId: "", // 任务ID，必填
        procActId: "" // 环节ID，必填
      },
      taskViewShowDialog: {
        // 查看流程图弹窗
        isOpen: false,
        isPromptSuccess: false, // 是否提示成功信息（设置不提示，由工具条调用方提示）
        procInstId: "" // 流程实例ID，必填
      },
      taskTransferDialog: {
        // 任务转办弹窗
        isOpen: false,
        isPromptSuccess: false, // 是否提示成功信息（设置不提示，由工具条调用方提示）
        procTaskId: "", // 任务ID，必填
        procActId: "", // 环节ID，必填
        procInstId: "" // 流程实例id，必填
      },
      taskDetegateDialog: {
        // 任务委托弹窗
        isOpen: false,
        isPromptSuccess: false, // 是否提示成功信息（设置不提示，由工具条调用方提示）
        procTaskId: "", // 任务ID，必填
        procActId: "", // 环节ID，必填
        procInstId: "" // 流程实例id，必填
      },
      taskUndetegateDialog: {
        // 任务取消委托弹窗
        isOpen: false,
        isPromptSuccess: false, // 是否提示成功信息（设置不提示，由工具条调用方提示）
        procTaskId: "", // 任务ID，必填
        procInstId: "" // 流程实例id，必填
      },
      taskSendBackDialog: {
        // 任务退回弹窗
        isOpen: false,
        isPromptSuccess: false, // 是否提示成功信息（设置不提示，由工具条调用方提示）
        procInstId: "", // 流程实例ID，必填
        procActInstId: "", // 任务ID，必填
        procTaskId: "", // 流程环节实例ID，必填
        processId: "", // 流程ID
        procVersion: "", // 流程版本
        procActId: "", // 当前环节ID
        procActName: "", // 当前环节名称
        procActEnName: "", // 当前环节英文名
        approval: false,
        approvalAction: 0,
        backActOptions: []
      },
      taskReadDialog: {
        // 任务已阅弹窗
        isOpen: false,
        isPromptSuccess: false, // 是否提示成功信息（设置不提示，由工具条调用方提示）
        procTaskIds: [] // 流程任务ID列表，必填
      },
      processSubmitDialog: {
        // 流程提交弹窗
        end: false, //是否结束环节
        isOpen: false,
        isPromptSuccess: false, // 是否提示成功信息（设置不提示，由工具条调用方提示）
        isStartProcess: false, // 是否发起流程，true-发起流程, false-提交流程
        processId: "",
        procInstId: "", // 流程实例ID，必填
        procActInstId: "", // 流程环节实例ID，必填
        procTaskId: "", // 任务ID，必填
        modifyAssignee: false, // 是否可以修改处理人
        targetActList: [], // 目标环节列表
        actAssigneeInfoList: [], // 可编辑环节列表
        ccList: "", // 抄送人列表
        procInsBizExtendList: [], // 流程实例业务信息拓展
        dataKey: "", // 数据KEY
        dataUpdateFlag: "", // 数据更新标识
        subject: "", // 工作主题
        comment: "", // 审批意见
        modelName: "",
        scItemCofList: [] // 会签事项名称配置
      }
    };
  },
  mounted() {
    // 0. 重置服务地址
    //ApiTask.resetAxiosBaseUrl(this.pscUrl, this.accessToken);
    if (this.dialogType === "1") {
      this.openProcessSubmitDialog(true);
    } else if (this.dialogType === "2") {
      this.openProcessSubmitDialog(false);
    } else if (this.dialogType === "3") {
      this.openTaskSendBackDialog();
    } else if (this.dialogType === "4") {
      this.openTaskCcDialog();
    } else if (this.dialogType === "5") {
      this.openTaskDetegateDialog();
    } else if (this.dialogType === "6") {
      this.openTaskUndetegateDialog();
    } else if (this.dialogType === "7") {
      this.openTaskTransferDialog();
    } else if (this.dialogType === "8") {
      this.openTaskAbandonDialog();
    }
  },
  methods: {
    /**
     * 获取请求API实例
     */
    getRequestApi(callback) {
      if (callback) {
        let isEnLanguage = Utils.isEnLanguage(this.$i18n);
        let languageType = isEnLanguage ? 1 : 0;

        let basicInfo = {
          processId: this.processId // 流程ID
        };
        let extData = {
          // 其他数据
          languageType: languageType, // 语言类型，0-中文，1-英文
          processId: this.processId // 流程ID
        };
        callback(ApiTask, basicInfo, extData);
      }
    },

    /**
     * 查看流程图
     */
    onTaskViewFlowChart() {
      let language = this.$i18n.locale;
      let flowChartUrl =
        this.flowChartUrl + (this.flowChartUrl.indexOf("?") >= 0 ? "&" : "?");
      let newUrl;
      if (this.procInstId) {
        newUrl = `${flowChartUrl}tenantId=${this.tenantId}&appId=${this.appId}&id=${this.procInstId}&language=${language}`;
      } else {
        newUrl = `${flowChartUrl}tenantId=${this.tenantId}&appId=${this.appId}&procDefId=${this.processId}&language=${language}`;
      }
      window.open(newUrl);
    },

    /**
     * 打开任务作废弹窗
     */
    openTaskAbandonDialog() {
      this.taskAbandonDialog.procInstId = this.procInstId;
      this.taskAbandonDialog.comment = this.abandonData.comment;
      this.taskAbandonDialog.processId = this.processId;
      this.taskAbandonDialog.isOpen = true;
      this.taskAbandonDialog.isPromptSuccess = true;
      this.taskAbandonDialog.procActId = this.procActId;
    },

    /**
     * 关闭任务作废弹窗
     */
    closeTaskAbandonDialog(isSubmitSuccess, responseData) {
      this.taskAbandonDialog.isOpen = false;
      if (isSubmitSuccess) {
        this.$emit("submitSuccess", "abandonTask", responseData);
      } else {
        this.$emit("closeDialog");
      }
    },

    /**
     * 打开任务抄送弹窗
     */
    openTaskCcDialog() {
      this.taskCcDialog.procInstId = this.procInstId; // 流程实例ID
      this.taskCcDialog.procActInstId = this.procActInstId; // 流程环节实例ID
      this.taskCcDialog.procTaskId = this.procTaskId; // 任务ID
      this.taskCcDialog.procActId = this.procActId; // 环节ID，必填
      this.taskCcDialog.isOpen = true;
      this.taskCcDialog.isPromptSuccess = true;
    },

    /**
     * 关闭任务抄送弹窗
     */
    closeTaskCcDialog(isSubmitSuccess, responseData) {
      this.taskCcDialog.isOpen = false;
      if (isSubmitSuccess) {
        this.$emit("submitSuccess", "ccTask", responseData);
      } else {
        this.$emit("closeDialog");
      }
    },

    /**
     * 打开流程图弹窗
     */
    openTaskViewShowDialog() {
      this.taskViewShowDialog.procInstId = this.procInstId; // 流程实例ID
      this.taskViewShowDialog.isOpen = true;
    },

    /**
     * 关闭流程图弹窗
     */
    closeTaskViewShowDialog(isSubmitSuccess, responseData) {
      this.taskViewShowDialog.isOpen = false;
      if (isSubmitSuccess) {
        this.$emit("submitSuccess", "taskViewShow", responseData);
      }
    },

    /**
     * 打开任务转办弹窗
     */
    openTaskTransferDialog() {
      this.taskTransferDialog.procInstId = this.procInstId; // 流程实例ID
      this.taskTransferDialog.procTaskId = this.procTaskId;
      (this.taskTransferDialog.procActId = this.procActId), // 环节ID，必填
        (this.taskTransferDialog.isOpen = true);
      this.taskTransferDialog.isPromptSuccess = true;
    },

    /**
     * 关闭任务转办弹窗
     */
    closeTaskTransferDialog(isSubmitSuccess, responseData) {
      this.taskTransferDialog.isOpen = false;
      if (isSubmitSuccess) {
        this.$emit("submitSuccess", "transferTask", responseData);
      } else {
        this.$emit("closeDialog");
      }
    },

    /**
     * 打开任务委托弹窗
     */
    openTaskDetegateDialog() {
      this.taskDetegateDialog.procInstId = this.procInstId; // 流程实例ID
      this.taskDetegateDialog.procTaskId = this.procTaskId;
      (this.taskDetegateDialog.procActId = this.procActId), // 环节ID，必填
        (this.taskDetegateDialog.isOpen = true);
      this.taskDetegateDialog.isPromptSuccess = true;
    },

    /**
     * 关闭任务委托弹窗
     */
    closeTaskDetegateDialog(isSubmitSuccess, responseData) {
      this.taskDetegateDialog.isOpen = false;
      if (isSubmitSuccess) {
        this.$emit("submitSuccess", "detegateTask", responseData);
      } else {
        this.$emit("closeDialog");
      }
    },

    /**
     * 打开任务取消委托弹窗
     */
    openTaskUndetegateDialog() {
      this.taskUndetegateDialog.procTaskId = this.procTaskId;
      this.taskUndetegateDialog.isOpen = true;
      this.taskUndetegateDialog.isPromptSuccess = true;
    },

    /**
     * 关闭任务取消委托弹窗
     */
    closeTaskUndetegateDialog(isSubmitSuccess, responseData) {
      this.taskUndetegateDialog.isOpen = false;
      if (isSubmitSuccess) {
        this.$emit("submitSuccess", "undetegateTask", responseData);
      } else {
        this.$emit("closeDialog");
      }
    },

    /**
     * 打开任务退回弹窗
     */
    openTaskSendBackDialog() {
      this.taskSendBackDialog.procInstId = this.procInstId;
      this.taskSendBackDialog.procActInstId = this.procActInstId;
      this.taskSendBackDialog.procTaskId = this.procTaskId;
      this.taskSendBackDialog.processId = this.processId;
      this.taskSendBackDialog.procVersion = this.procVersion;
      this.taskSendBackDialog.procActId = this.procActId;
      this.taskSendBackDialog.procActName = this.procActName;
      this.taskSendBackDialog.approval = this.backData.approvalFlg;
      this.taskSendBackDialog.approvalAction = this.backData.approvalAction;
      this.taskSendBackDialog.backActOptions = this.backData.goBackActOptions;
      this.taskSendBackDialog.comment = this.backData.comment;
      this.taskSendBackDialog.attachment = this.backData.attachment;
      this.taskSendBackDialog.isShowComment = this.backData.isShowComment;
      this.taskSendBackDialog.modelRelation = this.modelRelation;
      this.taskSendBackDialog.isOpen = true;
    },

    /**
     * 关闭任务退回弹窗
     */
    closeTaskSendBackDialog(isSubmitSuccess, responseData) {
      this.taskSendBackDialog.isOpen = false;
      if (isSubmitSuccess) {
        this.$emit("submitSuccess", "sendBackTask", responseData);
      } else {
        this.$emit("closeDialog");
      }
    },

    /**
     * 打开任务已阅弹窗
     */
    openTaskReadDialog() {
      this.taskReadDialog.procTaskIds = [this.procTaskId];
      this.taskReadDialog.isOpen = true;
    },

    /**
     * 关闭任务已阅弹窗
     */
    closeTaskReadDialog(isSubmitSuccess, responseData) {
      this.taskReadDialog.isOpen = false;
      if (isSubmitSuccess) {
        this.$emit("submitSuccess", "readTask", responseData);
      }
    },

    /**
     * 打开流程提交弹窗
     */
    openProcessSubmitDialog(isStartProcess) {
      this.processSubmitDialog.scItemCofList = this.scItemCofList; //会签事项名称配置
      this.processSubmitDialog.processId = this.processId;
      this.processSubmitDialog.procInstId = this.procInstId; // 流程实例ID，必填
      this.processSubmitDialog.procActInstId = this.procActInstId; // 流程环节实例ID，必填
      this.processSubmitDialog.procTaskId = this.procTaskId; // 任务ID，必填
      this.processSubmitDialog.end = this.submitData.end; // 是否是最后一个环节
      this.processSubmitDialog.delAssignee = this.submitData.delAssignee; // 是否可以删除会签项
      this.processSubmitDialog.addAssignee = this.submitData.addAssignee; // 是否可以允许添加多个会签项
      this.processSubmitDialog.delAssigneePerson = this.submitData.delAssigneePerson; // 是否可以允许删除会签项负责人
      this.processSubmitDialog.addAssigneePerson = this.submitData.addAssigneePerson; // 是否可以允许会签项添加多个负责人
      this.processSubmitDialog.delActPerson = this.submitData.delActPerson; // 由上一个环节进入是否可以删除已经配置的负责人
      this.processSubmitDialog.addActPerson = this.submitData.addActPerson; // 由上一个环节进入是否可以添加多个负责人
      this.processSubmitDialog.moveAssignee = this.submitData.moveAssignee; // 是否可以允许移动会签项
      this.processSubmitDialog.userCheck = this.submitData.userCheck; // 是否会签显示选人提示信息
      this.processSubmitDialog.tipShow = this.submitData.tipShow; // 是否会签负责人可以勾选
      this.processSubmitDialog.modelName = this.modelName;
      this.processSubmitDialog.targetActList = JSON.parse(
        JSON.stringify(this.submitData.targetActList || [])
      ); // 目标环节列表
      this.processSubmitDialog.actAssigneeInfoList = JSON.parse(
        JSON.stringify(this.submitData.actAssigneeInfoList || [])
      ); // 可编辑环节列表
      this.processSubmitDialog.ccList = JSON.parse(
        JSON.stringify(this.submitData.ccList || [])
      ); // 抄送人列表
      this.processSubmitDialog.procInsBizExtendList = JSON.parse(
        JSON.stringify(this.submitData.procInsBizExtendList || [])
      ); // 流程实例业务信息拓展
      this.processSubmitDialog.isStartProcess = isStartProcess;
      this.processSubmitDialog.dataKey = this.dataKey;
      //数据更新标识
      this.processSubmitDialog.dataUpdateFlag = this.dataUpdateFlag;
      this.processSubmitDialog.isOpen = true;
      this.processSubmitDialog.isPromptSuccess = true;
      this.processSubmitDialog.subject = this.submitData.subject;
      this.processSubmitDialog.comment = this.submitData.comment;
    },

    /**
     * 关闭流程提交弹窗
     */
    closeProcessSubmitDialog(isSubmitSuccess, responseData) {
      this.processSubmitDialog.isOpen = false;
      if (isSubmitSuccess) {
        let actionName = this.processSubmitDialog.isStartProcess
          ? "startProcess"
          : "submitProcess";
        this.$emit("submitSuccess", actionName, responseData);
      } else {
        this.$emit("closeDialog");
      }
    },
    saveFn(procInstId) {
      if (procInstId) {
        this.$emit("saveFn", procInstId);
      } else {
        this.$emit("saveFn");
      }
    }
  }
};
</script>

<style lang="less">
// @import "common/Style.less";
</style>
