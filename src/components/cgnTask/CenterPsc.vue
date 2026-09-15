<template>
  <div class="cgn-task-center" v-loading="loading">
    <!-- 任务页签右边的工具条 -->
    <div class="task-tab-toolbar">
      <!-- 优先级下拉列表 -->
      <div class="toolbar-select">
        <span
          >{{ $t("cgnTask.field.priority") }}{{ $t("cgnCommon.colon") }}</span
        >
        <el-dropdown @command="updatePriorityValue">
          <span
            >{{ priorityLabel }}<i class="el-icon-arrow-down el-icon--right"></i
          ></span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              v-for="item in options.priority"
              :key="item.value"
              :command="item.value"
              >{{ $t(item.labelKey) }}</el-dropdown-item
            >
          </el-dropdown-menu>
        </el-dropdown>
      </div>
      <!-- 时间排序下拉列表 -->
      <div class="toolbar-select">
        <span
          >{{ $t("cgnTask.field.startTimeOrder")
          }}{{ $t("cgnCommon.colon") }}</span
        >
        <el-dropdown @command="updateStartTimeOrderValue">
          <span
            >{{ startTimeOrderLabel
            }}<i class="el-icon-arrow-down el-icon--right"></i
          ></span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              v-for="item in options.startTimeOrder"
              :key="item.value"
              :command="item.value"
              >{{ $t(item.labelKey) }}</el-dropdown-item
            >
          </el-dropdown-menu>
        </el-dropdown>
      </div>
      <!-- 搜索按钮 -->
      <el-button
        size="small"
        class="btn-search"
        icon="el-icon-search"
        :title="$t('cgnCommon.query')"
        @mouseover.native="openAdvancedSearch"
        @click="openAdvancedSearch"
      ></el-button>
      <!-- 更多菜单 -->
      <el-dropdown
        v-if="moreMenus[currentTabName] && moreMenus[currentTabName].length > 0"
        class="btn-more"
        @command="onMoreMenuCommand"
      >
        <span class="el-dropdown-link"><i class="psc-icon-menu"></i></span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item
            v-for="item in moreMenus[currentTabName]"
            :key="item.value"
            :command="item.command"
            >{{ $t(item.labelKey) }}</el-dropdown-item
          >
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <!-- 任务页签 -->
    <el-tabs
      v-model="currentTabName"
      class="task-tabs"
      @tab-click="switchTaskTab"
    >
      <el-tab-pane name="taskList">
        <!-- 页签标题 -->
        <div slot="label" class="task-tab-title">
          <span class="title">{{ $t("cgnTask.task") }}</span>
          <i
            v-if="taskTabs['taskList'].taskCountLoading"
            class="el-icon-loading"
          ></i>
          <span v-if="taskTabs['taskList'].taskCount > 0" class="badge">{{
            taskTabs["taskList"].taskCount | taskCountDesc
          }}</span>
        </div>
        <!-- 待办列表 -->
        <task-list
          ref="taskList"
          :show-query.sync="taskTabs['taskList'].showQuery"
          :task-count.sync="taskTabs['taskList'].taskCount"
          :task-count-loading.sync="taskTabs['taskList'].taskCountLoading"
          :pageSize="pageSize"
          :handle-datas="
            (datas, fieldSettings) =>
              onHandleDatas('taskList', datas, fieldSettings)
          "
          @requestApi="getRequestApi"
          @viewFlowChart="onTaskViewFlowChart"
          @taskStatusChange="refreshAllTaskCount"
          @openTaskForm="row => onOpenTaskForm('taskList', row)"
        >
        </task-list>
      </el-tab-pane>
      <el-tab-pane name="taskHistList">
        <!-- 页签标题 -->
        <div slot="label" class="task-tab-title">
          <span class="title">{{ $t("cgnTask.taskHist") }}</span>
          <i
            v-if="taskTabs['taskHistList'].taskCountLoading"
            class="el-icon-loading"
          ></i>
          <span v-if="taskTabs['taskHistList'].taskCount > 0" class="badge">{{
            taskTabs["taskHistList"].taskCount | taskCountDesc
          }}</span>
        </div>
        <!-- 已办列表 -->
        <task-hist-list
          ref="taskHistList"
          :show-query.sync="taskTabs['taskHistList'].showQuery"
          :task-count.sync="taskTabs['taskHistList'].taskCount"
          :task-count-loading.sync="taskTabs['taskHistList'].taskCountLoading"
          :pageSize="pageSize"
          :handle-datas="
            (datas, fieldSettings) =>
              onHandleDatas('taskHistList', datas, fieldSettings)
          "
          @requestApi="getRequestApi"
          @viewFlowChart="onTaskViewFlowChart"
          @taskStatusChange="refreshAllTaskCount"
          @openTaskForm="row => onOpenTaskForm('taskHistList', row)"
        >
        </task-hist-list>
      </el-tab-pane>
      <el-tab-pane name="taskCcList">
        <!-- 页签标题 -->
        <div slot="label" class="task-tab-title">
          <span class="title">{{ $t("cgnTask.taskCc") }}</span>
          <i
            v-if="taskTabs['taskCcList'].taskCountLoading"
            class="el-icon-loading"
          ></i>
          <span v-if="taskTabs['taskCcList'].taskCount > 0" class="badge">{{
            taskTabs["taskCcList"].taskCount | taskCountDesc
          }}</span>
        </div>
        <!-- 待阅列表 -->
        <task-cc-list
          ref="taskCcList"
          :show-query.sync="taskTabs['taskCcList'].showQuery"
          :task-count.sync="taskTabs['taskCcList'].taskCount"
          :task-count-loading.sync="taskTabs['taskCcList'].taskCountLoading"
          :pageSize="pageSize"
          :handle-datas="
            (datas, fieldSettings) =>
              onHandleDatas('taskCcList', datas, fieldSettings)
          "
          @requestApi="getRequestApi"
          @viewFlowChart="onTaskViewFlowChart"
          @taskStatusChange="refreshAllTaskCount"
          @openTaskForm="row => onOpenTaskForm('taskCcList', row)"
        >
        </task-cc-list>
      </el-tab-pane>
      <el-tab-pane name="taskCcHistList">
        <!-- 页签标题 -->
        <div slot="label" class="task-tab-title">
          <span class="title">{{ $t("cgnTask.taskCcHist") }}</span>
          <i
            v-if="taskTabs['taskCcHistList'].taskCountLoading"
            class="el-icon-loading"
          ></i>
          <span v-if="taskTabs['taskCcHistList'].taskCount > 0" class="badge">{{
            taskTabs["taskCcHistList"].taskCount | taskCountDesc
          }}</span>
        </div>
        <!-- 已阅列表 -->
        <task-cc-hist-list
          ref="taskCcHistList"
          :show-query.sync="taskTabs['taskCcHistList'].showQuery"
          :task-count.sync="taskTabs['taskCcHistList'].taskCount"
          :task-count-loading.sync="taskTabs['taskCcHistList'].taskCountLoading"
          :pageSize="pageSize"
          :handle-datas="
            (datas, fieldSettings) =>
              onHandleDatas('taskCcHistList', datas, fieldSettings)
          "
          @requestApi="getRequestApi"
          @viewFlowChart="onTaskViewFlowChart"
          @taskStatusChange="refreshAllTaskCount"
          @openTaskForm="row => onOpenTaskForm('taskCcHistList', row)"
        >
        </task-cc-hist-list>
      </el-tab-pane>
      <el-tab-pane name="taskShareList" v-if="showShareTask">
        <!-- 页签标题 -->
        <div slot="label" class="task-tab-title">
          <span class="title">{{ $t("cgnTask.taskShare") }}</span>
          <i
            v-if="taskTabs['taskShareList'].taskCountLoading"
            class="el-icon-loading"
          ></i>
          <span v-if="taskTabs['taskShareList'].taskCount > 0" class="badge">{{
            taskTabs["taskShareList"].taskCount | taskCountDesc
          }}</span>
        </div>
        <!-- 共享列表 -->
        <task-share-list
          ref="taskShareList"
          :show-query.sync="taskTabs['taskShareList'].showQuery"
          :task-count.sync="taskTabs['taskShareList'].taskCount"
          :share-types="shareTypes"
          :task-count-loading.sync="taskTabs['taskShareList'].taskCountLoading"
          :pageSize="pageSize"
          :handle-datas="
            (datas, fieldSettings) =>
              onHandleDatas('taskShareList', datas, fieldSettings)
          "
          @requestApi="getRequestApi"
          @viewFlowChart="onTaskViewFlowChart"
          @taskStatusChange="refreshAllTaskCount"
          @openTaskForm="row => onOpenTaskForm('taskShareList', row)"
        >
        </task-share-list>
      </el-tab-pane>
    </el-tabs>
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
    pscUrl: { type: String, required: true }, // 指定psc域名地址，必填
    ascUrl: { type: String, required: true }, // 中台选人控件地址，必填
    accessToken: { type: String, required: true }, // 访问Token，必填
    tenantId: { type: String, required: true }, // 租户ID，必填
    appId: { type: String, required: true }, // 应用ID，必填
    appUrl: { type: String, required: true }, // 指定应用的域名地址
    handleDatas: {
      type: Function,
      default: (datasType, datas, fieldSettings) => {}
    }, // 处理数据列表回调方法
    pageSize: { type: Number, default: 10 }, // 每页笔数
    rights: { type: Array, default: () => [] }, // 权限列表，例如：claim(认领),unclaim(取消认领),cc(抄送),remind(催办),revoke(撤销),batchToRead(批量已阅)
    flowChartUrl: { type: String, required: true }, // 流程跟踪图地址。配置流程跟踪图所在地址，可以配置PSC提供的，或者应用系统自身集成的。例如：https://psc2-t/flowchart
    showShareTask: { type: Boolean, default: false }, // 是否显示共享列表
    shareTypes: {
      type: Array,
      default: () => {
        return [];
      }
    }, // 共享任务类型列表，当前用户可以查看的所有共享任务类型
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
    }
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
      currentTabName: "taskList",
      queryForm: {
        // 查询表单
        priority: "", // 优先级
        startTimeOrder: "1" // 任务开始时间排序
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
      options: {
        // 选项
        priority: Utils.Options.priority,
        startTimeOrder: Utils.Options.startTimeOrder
      },
      /**
       * 更多菜单
       * moreMenus: {
       *     taskCcList: [ // 显示页签名
       *        { labelKey: "i18n 标签key", command: {ref: "命令引用对象", method: "命令引用方法"} },
       *     ]
       * }
       */
      moreMenus: {}
    };
  },
  filters: Utils.Filters,
  mounted() {
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
      this.$set(this.moreMenus, "taskCcList", taskCcListMenus);
    }

    // 更新任务数量
    //this.refreshAllTaskCount();
    // 更新代办任务列表
    this.$refs.taskList.queryTaskList();
  },
  computed: {
    /**
     * 优先级下拉选项显示值
     */
    priorityLabel() {
      return Utils.Options.getOptionLabel(
        this.$i18n,
        this.options.priority,
        this.queryForm.priority
      );
    },

    /**
     * 任务开始时间排序下拉选项显示值
     */
    startTimeOrderLabel() {
      return Utils.Options.getOptionLabel(
        this.$i18n,
        this.options.startTimeOrder,
        this.queryForm.startTimeOrder
      );
    }
  },
  methods: {
    /**
     * 加载基本的选项列表（流程分类选项 + 选择库选项）
     */
    loadBaseOptions() {
      let that = this;
      that.loading = true;
      // that.getRequestApi(function (requestApi, requestApiBasic) {
      //   // 获取查询参数
      //   let requestParams = {
      //     basicInformation: requestApiBasic,
      //     parameter: {tenantId: ""}
      //   };

      //   Axios.all([
      //     requestApi.queryCategoryByAppId(requestParams), // 根据应用获取流程模型分类选项
      //     requestApi.getArchiveDataBaseConfig(requestParams) // 查询所有归档库名
      //   ]).then(Axios.spread((categoryRes, dataSourceRes) => {
      //     let isCategoryResSuccess = (categoryRes.status == 200 && categoryRes.data.code == 200);
      //     let isDataSourceResSuccess = (dataSourceRes.status == 200 && dataSourceRes.data.code == 200);

      //     that.loading = false;
      //     if (isCategoryResSuccess && isDataSourceResSuccess) {
      //       that._provided.indexProvide.procCategoryOptions = categoryRes.data.data;
      //       that._provided.indexProvide.dataSourceOptions = dataSourceRes.data.data;
      //     } else if (isCategoryResSuccess == false) {
      //       that.$message.error(categoryRes.data.message);
      //     } else {
      //       that.$message.error(dataSourceRes.data.message);
      //     }
      //   })).catch((err) => {
      //     that.loading = false;
      //   });
      // });
    },

    /**
     * 更新所有任务统计数量
     */
    refreshAllTaskCount() {
      this.$refs.taskList.updateTaskCount();
      this.$refs.taskHistList.updateTaskCount();
      this.$refs.taskCcList.updateTaskCount();
      this.$refs.taskCcHistList.updateTaskCount();
      if (this.showShareTask) {
        this.$refs.taskShareList.updateTaskCount();
      }
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
      this.queryForm.startTimeOrder = value;
      // 更新当前页签任务列表（页签名与ref名字相同）
      let currentTabRef = this.$refs[this.currentTabName];
      if (currentTabRef) {
        currentTabRef.queryTaskList();
      }
    },

    /**
     * 开启高级搜索
     */
    openAdvancedSearch() {
      if (this.taskTabs[this.currentTabName]) {
        this.taskTabs[this.currentTabName].showQuery = !this.taskTabs[
          this.currentTabName
        ].showQuery;
      }
    },

    /**
     * 切换任务页签
     * @param tab
     * @param event
     */
    switchTaskTab(tab, event) {
      // 更新当前页签任务数量及查询（页签名与ref名字相同）
      let currentTabRef = this.$refs[this.currentTabName];
      if (currentTabRef) {
        currentTabRef.updateTaskCount();
        currentTabRef.queryTaskList();
      }
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
          startTimeOrder: this.queryForm.startTimeOrder, // 任务开始时间排序
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
      let that = this;

      // 打开任务表单地址
      let newWindow = window.open(that.appUrl + row.formUrl);
      newWindow.onbeforeunload = function() {
        // 任务表单弹窗关闭时，更新所有任务统计数量
        that.refreshAllTaskCount();
        // 任务表单弹窗关闭时，更新当前页签任务查询
        let currentTabRef = that.$refs[that.currentTabName];
        if (currentTabRef) {
          currentTabRef.queryTaskList();
        }
      };

      // 代办任务时，点击链接时触发“打开任务”
      if (datasType == "taskList") {
        that.getRequestApi(function(requestApi, requestApiBasic) {
          // 获取查询参数
          let requestParams = {
            basicInformation: requestApiBasic,
            parameter: {
              procTaskId: row.id
            }
          };

          // 请求API
          that.loading = true;
          requestApi
            .openTask(requestParams)
            .then(res => {
              that.loading = false;
              if (res.status == 200 && res.data.code == 200) {
              } else {
                that.$message.error(res.data.message);
              }
            })
            .catch(err => {
              that.loading = false;
            });
        });
      }
    },

    /**
     * 任务操作：查看流程图
     */
    onTaskViewFlowChart(row) {
      let flowChartUrl =
        this.flowChartUrl + (this.flowChartUrl.indexOf("?") >= 0 ? "&" : "?");
      let newUrl = `${flowChartUrl}tenantId=${this.tenantId}&appId=${this.appId}&id=${row.procInstId}`;
      window.open(newUrl);
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
  }
};
</script>

<style lang="less">
@import "common/Style";
</style>
