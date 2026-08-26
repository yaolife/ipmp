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
    >
    </task-transfer-dialog>
    <!-- 任务委托弹窗 -->
    <task-detegate-dialog
      v-if="taskDetegateDialog.isOpen"
      v-bind="taskDetegateDialog"
      @requestApi="getRequestApi"
      @closeDialog="closeTaskDetegateDialog"
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
// import TaskDetegateDialog from "./components/dialog/TaskDetegateDialog";
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
    // TaskDetegateDialog,
    TaskUndetegateDialog,
    TaskSendBackDialog,
    TaskReadDialog,
    ProcessSubmitDialog
  },
  props: {
    pscUrl: { type: String, required: true }, // 指定psc域名地址，必填
    ascUrl: { type: String, required: true }, // 中台选人控件地址，必填
    accessToken: { type: String, required: true }, // 访问Token，必填
    tenantId: { type: String, required: true }, // 租户ID，必填
    appId: { type: String, required: true }, // 应用ID，必填
    flowChartUrl: { type: String, required: true }, // 流程跟踪图地址。配置流程跟踪图所在地址，可以配置PSC提供的，或者应用系统自身集成的。例如：https://psc2-t/flowchart
    processId: { type: String, required: true }, // 流程ID，必填
    procInsId: { type: String, default: "" }, // 流程实例ID，审批模式/查看模式必填
    procActInstId: { type: String, default: "" }, // 流程环节实例ID，审批模式/查看模式必填
    procTaskId: { type: String, default: "" }, // 任务ID，审批模式/查看模式必填
    dialogType: { type: String, default: "" },
    actionUserInfo: {
      // 操作人信息（userID/userName必填）
      type: Object,
      default: function() {
        return {
          userID: "", // 用户id
          userName: "", // 用户名称
          deptID: "", // 部门ID
          deptName: "", // 部门名称
          deptPath: "", // 部门全路径
          postID: "", // 岗位ID
          postName: "" // 岗位名称
        };
      },
      validator: function(value) {
        return value.userID;
      }
    },
    submitData: {
      // 提交数据
      type: Object,
      default: function() {
        return {
          modifyAssignee: false, // 是否可以修改处理人
          targetActList: [], // 目标环节列表
          actAssigneeInfoList: [], // 可编辑环节列表
          ccList: [], // 抄送人列表
          procInsBizExtendList: [] // 流程实例业务信息拓展
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
        procInsId: "" // 流程实例ID，必填
      },
      taskCcDialog: {
        // 任务抄送弹窗
        isOpen: false,
        isPromptSuccess: false, // 是否提示成功信息（设置不提示，由工具条调用方提示）
        procInsId: "", // 流程实例ID，必填
        procActInstId: "", // 流程环节实例ID，必填
        procTaskId: "" // 任务ID，必填
      },
      taskViewShowDialog: {
        // 查看流程图弹窗
        isOpen: false,
        isPromptSuccess: false, // 是否提示成功信息（设置不提示，由工具条调用方提示）
        procInsId: "" // 流程实例ID，必填
      },
      taskTransferDialog: {
        // 任务转办弹窗
        isOpen: false,
        isPromptSuccess: false, // 是否提示成功信息（设置不提示，由工具条调用方提示）
        procTaskId: "" // 任务ID，必填
      },
      taskDetegateDialog: {
        // 任务委托弹窗
        isOpen: false,
        isPromptSuccess: false, // 是否提示成功信息（设置不提示，由工具条调用方提示）
        procTaskId: "" // 任务ID，必填
      },
      taskUndetegateDialog: {
        // 任务取消委托弹窗
        isOpen: false,
        isPromptSuccess: false, // 是否提示成功信息（设置不提示，由工具条调用方提示）
        procTaskId: "" // 任务ID，必填
      },
      taskSendBackDialog: {
        // 任务退回弹窗
        isOpen: false,
        isPromptSuccess: false, // 是否提示成功信息（设置不提示，由工具条调用方提示）
        procInsId: "", // 流程实例ID，必填
        procActInstId: "", // 任务ID，必填
        procTaskId: "" // 流程环节实例ID，必填
      },
      taskReadDialog: {
        // 任务已阅弹窗
        isOpen: false,
        isPromptSuccess: false, // 是否提示成功信息（设置不提示，由工具条调用方提示）
        procTaskIds: [] // 流程任务ID列表，必填
      },
      processSubmitDialog: {
        // 流程提交弹窗
        isOpen: false,
        isPromptSuccess: false, // 是否提示成功信息（设置不提示，由工具条调用方提示）
        isStartProcess: false, // 是否发起流程，true-发起流程, false-提交流程
        procInsId: "", // 流程实例ID，必填
        procActInstId: "", // 流程环节实例ID，必填
        procTaskId: "", // 任务ID，必填
        modifyAssignee: false, // 是否可以修改处理人
        targetActList: [], // 目标环节列表
        actAssigneeInfoList: [], // 可编辑环节列表
        ccList: [], // 抄送人列表
        procInsBizExtendList: [] // 流程实例业务信息拓展
      }
    };
  },
  mounted() {
    // 0. 重置服务地址
    //ApiTask.resetAxiosBaseUrl(this.pscUrl, this.accessToken);

    this.openProcessSubmitDialog(true);
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
          tenantID: this.tenantId,
          appId: this.appId,
          actionUserInfo: this.actionUserInfo
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
      if (this.procInsId) {
        newUrl = `${flowChartUrl}tenantId=${this.tenantId}&appId=${this.appId}&id=${this.procInsId}&language=${language}`;
      } else {
        newUrl = `${flowChartUrl}tenantId=${this.tenantId}&appId=${this.appId}&procDefId=${this.processId}&language=${language}`;
      }
      window.open(newUrl);
    },

    /**
     * 打开任务作废弹窗
     */
    openTaskAbandonDialog() {
      this.taskAbandonDialog.procInsId = this.procInsId;
      this.taskAbandonDialog.isOpen = true;
    },

    /**
     * 关闭任务作废弹窗
     */
    closeTaskAbandonDialog(isSubmitSuccess, responseData) {
      this.taskAbandonDialog.isOpen = false;
      if (isSubmitSuccess) {
        this.$emit("submitSuccess", "abandonTask", responseData);
      }
    },

    /**
     * 打开任务抄送弹窗
     */
    openTaskCcDialog() {
      this.taskCcDialog.procInsId = this.procInsId; // 流程实例ID
      this.taskCcDialog.procActInstId = this.procActInstId; // 流程环节实例ID
      this.taskCcDialog.procTaskId = this.procTaskId; // 任务ID
      this.taskCcDialog.isOpen = true;
    },

    /**
     * 关闭任务抄送弹窗
     */
    closeTaskCcDialog(isSubmitSuccess, responseData) {
      this.taskCcDialog.isOpen = false;
      if (isSubmitSuccess) {
        this.$emit("submitSuccess", "ccTask", responseData);
      }
    },

    /**
     * 打开流程图弹窗
     */
    openTaskViewShowDialog() {
      this.taskViewShowDialog.procInsId = this.procInsId; // 流程实例ID
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
      this.taskTransferDialog.procTaskId = this.procTaskId;
      this.taskTransferDialog.isOpen = true;
    },

    /**
     * 关闭任务转办弹窗
     */
    closeTaskTransferDialog(isSubmitSuccess, responseData) {
      this.taskTransferDialog.isOpen = false;
      if (isSubmitSuccess) {
        this.$emit("submitSuccess", "transferTask", responseData);
      }
    },

    /**
     * 打开任务委托弹窗
     */
    openTaskDetegateDialog() {
      this.taskDetegateDialog.procTaskId = this.procTaskId;
      this.taskDetegateDialog.isOpen = true;
    },

    /**
     * 关闭任务委托弹窗
     */
    closeTaskDetegateDialog(isSubmitSuccess, responseData) {
      this.taskDetegateDialog.isOpen = false;
      if (isSubmitSuccess) {
        this.$emit("submitSuccess", "detegateTask", responseData);
      }
    },

    /**
     * 打开任务取消委托弹窗
     */
    openTaskUndetegateDialog() {
      this.taskUndetegateDialog.procTaskId = this.procTaskId;
      this.taskUndetegateDialog.isOpen = true;
    },

    /**
     * 关闭任务取消委托弹窗
     */
    closeTaskUndetegateDialog(isSubmitSuccess, responseData) {
      this.taskUndetegateDialog.isOpen = false;
      if (isSubmitSuccess) {
        this.$emit("submitSuccess", "undetegateTask", responseData);
      }
    },

    /**
     * 打开任务退回弹窗
     */
    openTaskSendBackDialog() {
      this.taskSendBackDialog.procInsId = this.procInsId;
      this.taskSendBackDialog.procActInstId = this.procActInstId;
      this.taskSendBackDialog.procTaskId = this.procTaskId;
      this.taskSendBackDialog.isOpen = true;
    },

    /**
     * 关闭任务退回弹窗
     */
    closeTaskSendBackDialog(isSubmitSuccess, responseData) {
      this.taskSendBackDialog.isOpen = false;
      if (isSubmitSuccess) {
        this.$emit("submitSuccess", "sendBackTask", responseData);
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
      this.processSubmitDialog.procInsId = this.procInsId; // 流程实例ID，必填
      this.processSubmitDialog.procActInstId = this.procActInstId; // 流程环节实例ID，必填
      this.processSubmitDialog.procTaskId = this.procTaskId; // 任务ID，必填
      this.processSubmitDialog.modifyAssignee = this.submitData.modifyAssignee; // 是否可以修改处理人
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
      this.processSubmitDialog.isOpen = true;
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
      }
    }
  }
};
</script>

<style lang="less">
// @import "common/Style";
</style>
