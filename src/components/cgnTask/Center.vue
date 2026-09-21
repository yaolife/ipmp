<template>
  <div class="cud-cgn-task-center" v-loading="loading" style="position: relative;">
    <div class="cud-display-card">
      <el-radio-group v-model="displayCard" size="small" @change="displayCardChange">
        <el-radio-button label="table"><i class="el-icon-tickets"></i> 表格显示</el-radio-button>
        <el-radio-button label="card"><i class="el-icon-menu"></i> 卡片显示</el-radio-button>
      </el-radio-group>
    </div>
    <!-- 任务页签 -->
    <el-tabs
      v-model="currentTabName"
      class="dict_tab cgn-task-tabs"
      ref="tabs"
      @tab-click="switchTaskTab"
    >
      <el-tab-pane name="taskList" style="padding-bottom: 57px">
        <!-- 页签标题 -->
        <div slot="label" class="cgn-task-tab-title">
          <span class="cgn-title">{{ $t("cgnTask.task") }}</span>
          <i
            v-if="taskTabs['taskList'].taskCountLoading"
            class="el-icon-loading"
          ></i>
          <span v-if="taskTabs['taskList'].taskCount > 0" class="badge"
            >({{ taskTabs["taskList"].taskCount | taskCountDesc }})</span
          >
        </div>
        <!-- 待办列表 -->
        <div>
          <task-list
            ref="taskList"
            :show-query.sync="taskTabs['taskList'].showQuery"
            :task-count.sync="taskTabs['taskList'].taskCount"
            :task-count-loading.sync="taskTabs['taskList'].taskCountLoading"
            :pageSize="pageSize"
            :moreMenus="moreMenus"
            :currentTabName="currentTabName"
            :handle-datas="
              (datas, fieldSettings) =>
                onHandleDatas('taskList', datas, fieldSettings)
            "
            :displayCard="displayCard"
            :showScrollTop="showScrollTop"
            @requestApi="getRequestApi"
            @viewFlowChart="onTaskViewFlowChart"
            @taskStatusChange="refreshAllTaskCount"
            @openTaskForm="row => onOpenTaskForm('taskList', row)"
            @onMoreMenuCommand="onMoreMenuCommand"
          >
          </task-list>
        </div>
      </el-tab-pane>
      <el-tab-pane
        name="taskHistList"
        v-if="showBtn('taskHistList')"
        style="padding-bottom: 57px"
      >
        <!-- 页签标题 -->
        <div slot="label" class="cgn-task-tab-title">
          <span class="cgn-title">{{ $t("cgnTask.taskHist") }}</span>
          <i
            v-if="taskTabs['taskHistList'].taskCountLoading"
            class="el-icon-loading"
          ></i>
          <span v-if="taskTabs['taskHistList'].taskCount > 0" class="badge"
            >({{ taskTabs["taskHistList"].taskCount | taskCountDesc }})</span
          >
        </div>
        <!-- 已办列表 -->
        <div>
          <task-hist-list
            ref="taskHistList"
            :show-query.sync="taskTabs['taskHistList'].showQuery"
            :task-count.sync="taskTabs['taskHistList'].taskCount"
            :task-count-loading.sync="taskTabs['taskHistList'].taskCountLoading"
            :pageSize="pageSize"
            :moreMenus="moreMenus"
            :currentTabName="currentTabName"
            :handle-datas="
              (datas, fieldSettings) =>
                onHandleDatas('taskHistList', datas, fieldSettings)
            "
            :displayCard="displayCard"
            :showScrollTop="showScrollTop"
            @requestApi="getRequestApi"
            @viewFlowChart="onTaskViewFlowChart"
            @taskStatusChange="refreshAllTaskCount"
            @openTaskForm="row => onOpenTaskForm('taskHistList', row)"
            @onMoreMenuCommand="onMoreMenuCommand"
          >
          </task-hist-list>
        </div>
      </el-tab-pane>
      <el-tab-pane
        name="taskCcList"
        v-if="showBtn('taskCcList')"
        style="padding-bottom: 57px"
      >
        <!-- 页签标题 -->
        <div slot="label" class="task-tab-title">
          <span class="title">{{ $t("cgnTask.taskCc") }}</span>
          <i
            v-if="taskTabs['taskCcList'].taskCountLoading"
            class="el-icon-loading"
          ></i>
          <span v-if="taskTabs['taskCcList'].taskCount > 0" class="badge"
            >({{ taskTabs["taskCcList"].taskCount | taskCountDesc }})</span
          >
        </div>
        <!-- 待阅列表 -->
        <task-cc-list
          ref="taskCcList"
          :show-query.sync="taskTabs['taskCcList'].showQuery"
          :task-count.sync="taskTabs['taskCcList'].taskCount"
          :currentTabName="currentTabName"
          :moreMenus="moreMenus"
          :task-count-loading.sync="taskTabs['taskCcList'].taskCountLoading"
          :pageSize="pageSize"
          :handle-datas="
            (datas, fieldSettings) =>
              onHandleDatas('taskCcList', datas, fieldSettings)
          "
          :displayCard="displayCard"
          :showScrollTop="showScrollTop"
          @requestApi="getRequestApi"
          @viewFlowChart="onTaskViewFlowChart"
          @taskStatusChange="refreshAllTaskCount"
          @openTaskForm="row => onOpenTaskForm('taskCcList', row)"
        >
        </task-cc-list>
      </el-tab-pane>
      <el-tab-pane
        name="taskCcHistList"
        v-if="showBtn('taskCcHistList')"
        style="padding-bottom: 57px"
      >
        <!-- 页签标题 -->
        <div slot="label" class="task-tab-title">
          <span class="title">{{ $t("cgnTask.taskCcHist") }}</span>
          <i
            v-if="taskTabs['taskCcHistList'].taskCountLoading"
            class="el-icon-loading"
          ></i>
          <span v-if="taskTabs['taskCcHistList'].taskCount > 0" class="badge"
            >({{ taskTabs["taskCcHistList"].taskCount | taskCountDesc }})</span
          >
        </div>
        <!-- 已阅列表 -->
        <task-cc-hist-list
          ref="taskCcHistList"
          :show-query.sync="taskTabs['taskCcHistList'].showQuery"
          :task-count.sync="taskTabs['taskCcHistList'].taskCount"
          :currentTabName="currentTabName"
          :moreMenus="moreMenus"
          :task-count-loading.sync="taskTabs['taskCcHistList'].taskCountLoading"
          :pageSize="pageSize"
          :handle-datas="
            (datas, fieldSettings) =>
              onHandleDatas('taskCcHistList', datas, fieldSettings)
          "
          :displayCard="displayCard"
          :showScrollTop="showScrollTop"
          @requestApi="getRequestApi"
          @viewFlowChart="onTaskViewFlowChart"
          @taskStatusChange="refreshAllTaskCount"
          @openTaskForm="row => onOpenTaskForm('taskCcHistList', row)"
        >
        </task-cc-hist-list>
      </el-tab-pane>
    </el-tabs>

    <!-- 查看流程图弹出窗口 -->
    <task-view-show-dialog
      v-if="taskViewShowDialog.isOpen"
      v-bind="taskViewShowDialog"
      @closeDialog="closeTaskViewShowDialog"
      @requestApi="getRequestApi"
    >
    </task-view-show-dialog>
  </div>
</template>

<script>
import Vue from "vue";
import Axios from "axios";
import * as Utils from "@/utils/Utils";
import ApiTask from "./common/ApiTask";
import TaskList from "./components/TaskList";
import TaskHistList from "./components/TaskHistList";
import TaskCcList from "./components/TaskCcList";
import TaskCcHistList from "./components/TaskCcHistList";
import TaskShareList from "./components/TaskShareList";
// import TaskViewShowDialog from "./components/dialog/TaskViewShowDialog";
import osUtil from "@/utils/osUtil";
import { hasPermission } from "@/permission/btn";
import { throttle } from "@/utils/funcUtil";

export default {
  name: "CgnTaskCenter",
  components: {
    TaskList,
    TaskHistList,
    TaskCcList,
    TaskCcHistList,
    TaskShareList
  },
  props: {
    handleDatas: {
      type: Function,
      default: (datasType, datas, fieldSettings) => {}
    }, // 处理数据列表回调方法
    pageSize: { type: Number, default: 10 }, // 每页笔数
    rights: { type: Array, default: () => [] }, // 权限列表，例如：claim(认领),unclaim(取消认领),cc(抄送),remind(催办),revoke(撤销),batchToRead(批量已阅)
    //flowChartUrl: { type: String, required: true }, // 流程跟踪图地址。配置流程跟踪图所在地址，可以配置PSC提供的，或者应用系统自身集成的。例如：https://psc2-t/flowchart
    showShareTask: { type: Boolean, default: false }, // 是否显示共享列表
    shareTypes: {
      type: Array,
      default: () => {
        return [];
      }
    } // 共享任务类型列表，当前用户可以查看的所有共享任务类型
  },
  provide() {
    let that = this;
    return {
      indexProvide: new Vue({
        data() {
          return {
            ascUrl: that.ascUrl, // 中台选人控件地址
            appUrl: that.appUrl, // 指定应用的域名地址
            rights: that.rights || "", // 权限列表
            procCategoryOptions: [], // 流程分类选项
            dataSourceOptions: [] // 选择库选项
          };
        }
      })
    };
  },
  data() {
    return {
      loading: false,
      displayCard: 'table',
      showScrollTop: false,
      scrollTime: 0,
      currentTabName: "taskList",
      queryForm: {
        // 查询表单
        priority: "", // 优先级
        taskOrderBy: "0" // 任务开始时间排序
      },
      taskTabs: {
        // 任务页签数据
        taskList: {
          showQuery: false,
          taskCountLoading: true,
          taskCount: 0
        },
        taskHistList: {
          showQuery: false,
          taskCountLoading: false,
          taskCount: 0
        },
        taskCcList: {
          showQuery: false,
          taskCountLoading: false,
          taskCount: 0
        },
        taskCcHistList: {
          showQuery: false,
          taskCountLoading: false,
          taskCount: 0
        },
        taskShareList: {
          showQuery: false,
          taskCountLoading: false,
          taskCount: 0
        }
      },
      /**
       * 更多菜单
       * moreMenus: {
       *     taskCcList: [ // 显示页签名
       *        { labelKey: "i18n 标签key", command: {ref: "命令引用对象", method: "命令引用方法"} },
       *     ]
       * }
       */
      moreMenus: {},
      taskViewShowDialog: {
        // 任务撤销弹窗
        isOpen: false,
        procInstId: "", // 流程实例ID
        procDefId: "" // 流程ID
      }
    };
  },
  filters: Utils.Filters,

  mounted() {
    if(this.$route.query.tab) {
      this.currentTabName = this.$route.query.tab
      this.switchTaskTab()
    }
    // 0. 重置服务地址
    // ApiTask.resetAxiosBaseUrl(this.pscUrl, this.accessToken);
    // 1. 加载基本的选项列表（流程分类选项 + 选择库选项）
    //this.loadBaseOptions();

    // 根据权限，设置更多菜单显示
    if (this.rights && this.rights.indexOf("batchToRead") >= 0) {
      // 追加代办列表菜单：批量已阅
      let taskCcListMenus = [
        {
          labelKey: "cgnTask.operate.batchSelectTask",
          command: { ref: "taskCcList", method: "batchSelectTask" }
        }, // 批量选择
        {
          labelKey: "cgnTask.operate.batchReadTask",
          command: { ref: "taskCcList", method: "batchReadTask" }
        } // 批量已阅
      ];
    }
    // 流程分类与库查询
    this.queryOptions();
    // 更新任务数量
    this.refreshAllTaskCount();
    // 更新代办任务列表
    this.$refs.taskList.queryTaskList();
    // window.refreshAllTaskCount = this.returnFn;
    let _this = this;
    // 监听名为 "my_channel" 的广播频道
    const myChannel = new BroadcastChannel("my_channel");
    // 监听该频道并处理消息
    myChannel.onmessage = function(event) {
      _this.returnFn();
    };
    //卡片显示判断
    let displayCard = sessionStorage.getItem('displayCard');
    if (displayCard && displayCard == 'true') {
      this.displayCard = 'card';
      this.displayCardChange('card');
    }
    //下拉自动加载
    document.querySelector('.el-scrollbar__wrap').addEventListener('scroll', this.scrollEvent);
  },
  beforeDestroy() {
    document.querySelector('.el-scrollbar__wrap').removeEventListener("scroll", this.scrollEvent);
  },
  activated() {
    document.querySelector('.el-scrollbar__wrap').addEventListener('scroll', this.scrollEvent);
  },
  deactivated() {
    document.querySelector('.el-scrollbar__wrap').removeEventListener("scroll", this.scrollEvent);
  },
  methods: {
    scrollEvent(e) {
      if (!e || !e.target) return;
      if (this.displayCard !== 'card') return;
      //节流防抖
      if (e.timeStamp - this.scrollTime < 100) return;
      //是否显示返回顶部
      this.showScrollTop = e.target.scrollTop > 0 ? true : false;
      //滚动到底部
      if (e.target.scrollTop + e.target.offsetHeight - e.target.scrollHeight > 1) {
        this.scrollTime = e.timeStamp;
        let currentTabRef = this.$refs[this.currentTabName];
        if (currentTabRef) {
          currentTabRef.loadingMore();
        }
      }
    },
    //表格卡片切换
    displayCardChange(val) {
      if (val == 'card') {
        sessionStorage.setItem('displayCard', 'true');
        document.querySelector('.el-scrollbar__wrap').addEventListener('scroll', this.scrollEvent);
      } else {
        sessionStorage.removeItem('displayCard');
        document.querySelector('.el-scrollbar__wrap').removeEventListener("scroll", this.scrollEvent);
      }
      let pageSize = 10;
      let currentTabRef = this.$refs[this.currentTabName];
      if (currentTabRef) {
        if (val == 'card') {
          pageSize = 20;
        }
        currentTabRef.queryTaskList(1, pageSize);
        currentTabRef.resizeTableHeight();
      }
      if (this.$refs.taskList) this.$refs.taskList.pagination.pageSize = pageSize;
      if (this.$refs.taskCcList) this.$refs.taskCcList.pagination.pageSize = pageSize;
      if (this.$refs.taskHistList) this.$refs.taskHistList.pagination.pageSize = pageSize;
      if (this.$refs.taskCcHistList) this.$refs.taskCcHistList.pagination.pageSize = pageSize;
    },
    /** 刷新待办,已办数量,刷新待办列表 */
    returnFn() {
      if (this.currentTabName === "taskCcList") {
        this.$refs.taskCcList.queryTaskList();
        this.$refs.taskCcList.updateTaskCount();
        if (this.showBtn("taskCcHistList")) {
          this.$refs.taskCcHistList.updateTaskCount();
        }
      } else {
        this.$refs.taskList.queryTaskList();
        this.$refs.taskList.updateTaskCount();
        if (this.showBtn("taskHistList")) {
          this.$refs.taskHistList.updateTaskCount();
        }
      }
    },
    /** 刷新待阅,已阅数量,刷新待阅列表 */
    showBtn(btn) {
      return hasPermission(btn);
    },
    /**
     * 加载基本的选项列表（流程分类选项 + 选择库选项）
     */
    loadBaseOptions() {
      let that = this;
      that.loading = true;
    },

    queryOptions() {
      ApiTask.getOptions().then(res => {
        if (res.data.code === "0") {
          this._provided.indexProvide.procCategoryOptions =
            res.data.data["category"];

          if (res.data.data["dataSource"]) {
            this._provided.indexProvide.dataSourceOptions =
              res.data.data["dataSource"];
          }
        }
      });
    },

    /**
     * 更新所有任务统计数量
     */
    refreshAllTaskCount() {
      let timeout = setTimeout(() => {
        let timer = setInterval(() => {
          if (sessionStorage.getItem("btns")) {
            clearInterval(timer);
            if (this.$refs.taskList) this.$refs.taskList.updateTaskCount();
            if (this.showBtn("taskHistList")) {
              if (this.$refs.taskHistList)
                this.$refs.taskHistList.updateTaskCount();
            }
            if (this.showBtn("taskCcList")) {
              if (this.$refs.taskCcList)
                this.$refs.taskCcList.updateTaskCount();
            }
            if (this.showBtn("taskCcHistList")) {
              if (this.$refs.taskCcHistList)
                this.$refs.taskCcHistList.updateTaskCount();
            }
          }
        }, 1000);
        // let currentTabRef = this.$refs[this.currentTabName];
        // if (currentTabRef) {
        //   currentTabRef.updateTaskCount();
        // }
        clearTimeout(timeout);
      }, 1000);
    },

    /**
     * 更新优先级下拉选项值
     * @param value
     */
    updatePriorityValue(value) {
      this.queryForm.priority = value;
      // 更新当前页签任务列表（页签名与ref名字相同，需重置当前页数）
      let currentTabRef = this.$refs[this.currentTabName];
      if (currentTabRef) {
        currentTabRef.queryTaskList(1);
      }
    },

    /**
     * 更新任务开始时间排序下拉选项值
     * @param value
     */
    updateStartTimeOrderValue(value) {
      this.queryForm.taskOrderBy = value;
      // 更新当前页签任务列表（页签名与ref名字相同）
      let currentTabRef = this.$refs[this.currentTabName];
      if (currentTabRef) {
        currentTabRef.queryTaskList();
      }
    },

    /**
     * 切换任务页签
     * @param tab
     * @param event
     */
    switchTaskTab(tab, event) {
      this.resetActivePosition(this.$refs.tabs.$el);
      // 更新当前页签任务数量及查询（页签名与ref名字相同）
      let currentTabRef = this.$refs[this.currentTabName];
      if (currentTabRef) {
        // currentTabRef.resetSeniorSearch();
        // currentTabRef.updateTaskCount(); // 更新当前标签的任务数量
        currentTabRef.queryTaskList();
        currentTabRef.resizeTableHeight();
      }
    },
    resetActivePosition($el) {
      this.$nextTick(() => {
        const activeEl = $el.querySelector(".el-tabs__item.is-active");
        const lineEl = $el.querySelector(".el-tabs__active-bar");
        const style = getComputedStyle(activeEl);
        const pl = style.paddingLeft.match(/\d+/)[0] * 1;
        const pr = style.paddingRight.match(/\d+/)[0] * 1;
        const w = style.width.match(/\d+/)[0] * 1;
        lineEl.style.transform =
          "translateX(" + (activeEl.offsetLeft + pl - 6) + "px)";
        lineEl.style.width = w - pl - pr + "px";
      });
    },
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
          priority: this.queryForm.priority, // 优先级
          taskOrderBy: this.queryForm.taskOrderBy, // 任务开始时间排序
          languageType: languageType // 语言类型，0-中文，1-英文
        };
        callback(ApiTask, basicInfo, extData);
      }
    },

    /**
     * 更多菜单点击时
     * @param command
     */
    onMoreMenuCommand(command) {
      if (command.ref && this.$refs[command.ref] && command.method) {
        this.$refs[command.ref][command.method]();
      }
    },

    /**
     * 任务操作：打开任务表单
     * @param datasType taskList(待办列表)/taskHistList(已办列表)/taskCcList(待阅列表)/taskCcHistList(已阅列表)/taskShareList(共享列表)
     */
    onOpenTaskForm(datasType, row) {

      // console.log('[ datasType ]', datasType,row)
      // TODO 加个枚举
      row.dataType = datasType;
      const dataType = {
        draft: 4,
        taskList: 2,
        taskHistList: 3,
        taskCcList: 5,
        taskCcHistList: 6
      };
      let dataInfo = {
        // 流程ID
        procId: row.procDefId,
        // 流程版本
        procVersion: row.taskExtend01,
        // 流程名
        procName: row.procDefName,
        // 流程实例ID
        procInstId: row.procInstId,
        // 类型 // 1 发起页面 / 2 待办页面 / 3 已办页面 / 4 草稿页面
        procNode: dataType[datasType],
        // 活动ID
        actId: row.procActId,
        // 活动实例ID
        actInstId: row.procActInstId,
        // 活动名
        actName: row.procActName,
        // 上一操作流程环节id
        sentByProcActId: row.sentByProcActId,
        // 流程模型ID
        procModelId: row.procModelId,
        // 任务ID
        procTaskId: row.id,
        // 会签ID
        cosignItemCode: row.cosignItemCode,
        procInstStatus: row.procInstStatus,
        endTime: row.endTime,
        actCode: row.actCode,
        // 流程状态
        flowStatus: "2"
      };
      sessionStorage.removeItem("procItem");
      sessionStorage.setItem("procItem", JSON.stringify(dataInfo));
      // 待办列表，验证任务是否被任务，被处理刷新列表，未被处理打开新页面
      if (datasType === "taskList") {
        // console.log(row, "row===");
        let params = {
          procId: row.procDefId,
          procTaskId: row.id
        };
        this.loading = true;
        ApiTask.checkTask(params).then(res => {
          this.loading = false;
          if (res.data.code === "0") {
            if (row.formUrl) {
              this.$router.push({
                path: row.formUrl,
                query: {
                  actId: dataInfo.actId,
                  procNode: dataInfo.procNode,
                  procVersion: dataInfo.procVersion,
                  procId: dataInfo.procId,
                  id: dataInfo.procTaskId,
                  actInstId: dataInfo.actInstId,
                  procInstId: dataInfo.procInstId,
                  procName: dataInfo.procName,
                  r: Math.random(),
                  // 流程状态
                  flowStatus: "2",
                  sentByProcActId:row.sentByProcActId
                }
              });
            } else {
              //打开页签
              this.openTab({
                path: "/workbench/view",
                query: {
                  procName: dataInfo.procName,
                  r: Math.random()
                }
              });
            }
          } else {
            this.$alert(res.data.msg);
            // 更新任务数量
            this.refreshAllTaskCount();
            // 更新代办任务列表
            this.$refs.taskList.queryTaskList();
          }
        }).catch((err) => {
          this.loading = false;
        });
      } else {
        if (row.formUrl) {
          this.$router.push({
            path: row.formUrl,
            query: {
              actId: dataInfo.actId,
              procNode: dataInfo.procNode,
              procVersion: dataInfo.procVersion,
              procId: dataInfo.procId,
              id: dataInfo.procTaskId,
              actInstId: dataInfo.actInstId,
              procInstId: dataInfo.procInstId,
              procName: dataInfo.procName,
              r: Math.random(),
              // 流程状态
              flowStatus: "2"
            }
          });
        } else {
          //打开页签
          this.openTab({
            path: "/workbench/view",
            query: {
              // item: dataInfo
              procName: dataInfo.procName,
              r: Math.random()
            }
          });
        }
      }
    },

    /**
     * 任务操作：查看流程图
     */
    onTaskViewFlowChart(row) {
      this.taskViewShowDialog.procInstId = row.procInstId;
      this.taskViewShowDialog.procDefId = row.procDefId;
      this.taskViewShowDialog.isOpen = true;
    },

    /**
     * 关闭流程图弹窗
     */
    closeTaskViewShowDialog() {
      this.taskViewShowDialog.isOpen = false;
    },

    /**
     * 处理数据列表回调方法
     * @param datasType taskList(待办列表)/taskHistList(已办列表)/taskCcList(待阅列表)/taskCcHistList(已阅列表)/taskShareList(共享列表)
     */
    onHandleDatas(datasType, datas, fieldSettings) {
      if (this.handleDatas instanceof Function) {
        this.handleDatas(datasType, datas, fieldSettings);
      }
    }
  },
  destroyed() {
    window.refreshAllTaskCount = null;
  }
};
</script>

<style lang="less" scoped>
// @import "src/assets/css/style";
.cud-cgn-task-center {
  // margin-top: 0px;
  // margin-left: 15px;
}
.cgn-title .el-tabs__item {
  padding-left: 0px;
}

.el-tabs__item {
  padding-left: 30px !important;
  padding-right: 30px !important;
}
/deep/ .el-table--scrollable-x .el-table__body-wrapper {
  overflow-x: hidden;
}
/deep/ .el-tabs__active-bar {
  width: 30px !important;
  left: 52px;
}
/deep/ .el-table__body-wrapper {
  // height: 90% !important;
}

/deep/ .el-button--text {
  user-select: unset  // 设置按钮text类型的时候可以复制
}
.cud-display-card {
  position: absolute;
  z-index: 2;
  top: 0px;
  right: 25px;
  margin-top: -3px;
}
// 卡片
/deep/.cud-card-view {
  min-height: 680px;
  .cud-card-list {

    padding-bottom: 20px;
    .cud-card-item {
      float: left;
      position: relative;
      margin: 1%;
      width: calc(31% - 2px);
      height: 170px;
      overflow: hidden;
      border: 1px solid #e6e6e6;
      border-radius: 5px;
      animation: fadeIn .5s;
      .icon {
        position: absolute;
        left: 20px;
        top: 20px;
        width: 25px;
        height: 25px;
        text-align: center;
        line-height: 23px;
        border-radius: 50%;
        background-color: #f2f7fb;
        border: 1px solid #bfd9ea;
        cursor: pointer;
        margin-right: 10px;
        margin-bottom: 10px;
        span {
          font-size: 13px;
          color: #0775DB;
        }
      }
      .icon:hover {
        background-color: #0775DB;
        border: 1px solid #0775DB;
        span {
          color: #fff;
        }
      }
      .title {
        position: absolute;
        left: 60px;
        top: 22px;
        width: calc(100% - 65px);
        font-size: 16px;
        color: #333;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }
      .desc {
        position: absolute;
        left: 20px;
        top: 60px;
        font-size: 14px;
        color: #999;
        p {
          line-height: 30px;
          margin-bottom: 0;
        }
      }
      .button {
        display: flex;
        position: absolute;
        justify-content: center;
        left: 0;
        bottom: 0;
        width: 100%;
        background-color: #f6f6f6;
        transform: translateY(100%);
        transition: all .3s;
        button {
          width: 33.33%;
          border: none;
          padding: 0;
          transition: all .5s;
        }
      }
    }
    .cud-card-item:hover {
      border: 1px solid #ddd;
      box-shadow: 1px 1px 5px #eee;
      .button {
        transform: translateY(0%);
      }
    }
    @media screen and (min-width: 1600px) {
      .cud-card-item {
        margin: 1%;
        width: calc(23% - 3px);
        height: 180px;
        .title {
          width: 270px;
        }
      }
    }
  }
  .cud-card-more {
    clear: both;
    padding-top: 10px;
    width: 100%;
    text-align: center;
  }
  .cud-card-top {
    position: fixed;
    bottom: 20px;
    right: 30px;
    width: 90px;
    height: 20px;
    padding: 8px;
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 5px;
    cursor: pointer;
    animation: fadeUp .3s;
    img {
      width: 20px;
      height: 20px;
      transform: rotate(-45deg);
    }
    span {
      font-size: 15px;
      vertical-align: top;
    }
  }
  .cud-card-top:hover {
    background-color: #f9f9f9;
    img {
      animation: rocket 5s infinite;
    }
    span {
      font-weight: bold;
    }
  }
  @keyframes fadeIn {
    0% { transform: scale(0.1, 0.1) translateX(100%); opacity:0; }
    100% { transform: scale(1, 1) translateX(0%); opacity: 1; }
  }
  @keyframes fadeUp {
    0% { transform: scale(0.1, 0.1) translateY(100%); opacity:0; }
    100% { transform: scale(1, 1) translateY(0%); opacity: 1; }
  }
  @keyframes rocket {
    20% { transform: translate(-2px, 1px) rotate(-44deg); }
    50% { transform: translate(2px, -1px) rotate(-46deg); }
    80% { transform: translate(-1px, 2px) rotate(-45deg); }
  }
}
</style>
