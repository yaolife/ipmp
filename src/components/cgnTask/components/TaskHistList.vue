<template>
  <div class="task-tab-content">
    <!-- 查询条件 -->
    <!-- <new-query
      class="cud-office-search-blocks"
      ref="queryDialog"
      :fields="queryFields"
      :moreMenus="moreMenus"
      :currentTabName="currentTabName"
      @submit="submitQueryForm"
      @onMoreMenuCommand="onMoreMenuCommand"
      @resizeTableHeight="resizeTableHeight"
      @SelectedremindTask="SelectedremindTask"
      @SelectedwithdrawTask="SelectedwithdrawTask"
    >
    </new-query> -->
    <div ref="searchRef">
      <query-form
        :queryFormId="'offce_task_hist_list'"
        :queryFields="queryFields"
        :delaySetting="1000"
        :loading="loading"
        @resize="resizeTableHeight"
        @submit="submitQueryForm"
        ref="queryDialog"
        class="cud-commom-form-search"
      >
      </query-form>
    </div>
    <!-- 卡片布局 -->
    <div class="cud-card-view" v-if="displayCard === 'card'">
      <div class="cud-card-list">
        <div v-for="(item, index) in data" :key="item.id" class="cud-card-item"
          :style="{ animationDuration: 0.5 + index % 20 * 0.05 + 's' }">
          <div class="icon" @click="onTaskViewFlowChart(item)">
            <span class="cud3-icon-blue font_family icon-icon_workplace_flowchart"></span>
          </div>
          <div class="title">{{ item.procSubject }}</div>
          <div class="desc">
            <p>{{ $t('pw.currentTast') }}：{{ item.procActName }}</p>
            <p>{{ $t('workbench.executor_user') }}：　{{ item.startUserIdName }}</p>
            <!-- <p>{{ $t('pw.processingTime') }}：{{ item.startTime }}</p> -->
            <p>{{ $t("pw.processingTime") }}：{{ item | fieldValue("completedTime", $i18n) }}</p>
          </div>
          <div class="button">
            <el-button @click="$emit('openTaskForm', item)">查看</el-button>
            <el-button @click="cardRemindTask(item)">{{ $t("cgnTask.operate.remindTask") }}</el-button>
            <el-button @click="cardWithdrawTask(item)">{{ $t("cgnTask.operate.withdrawTask") }}</el-button>
          </div>
        </div>
      </div>
      <!-- <div class="cud-card-more" v-if="data.length && data.length > 0">
        <el-button size="small" @click="scrollTop" icon="el-icon-arrow-up">返回顶部</el-button>
        <el-button size="small" @click="loadingMore" icon="el-icon-more" :loading="loading">加载更多</el-button>
      </div> -->
      <div style="clear: both;"></div>
      <div class="cud-card-top" @click="scrollTop" v-if="showScrollTop && data.length > 0">
        <img :src="require('@/assets/img/rocket.svg')" />
        <span>返回顶部</span>
      </div>
      <div class="el-table__empty-block" v-if="data.length == 0" v-loading="loading">
        <span class="el-table__empty-text">暂无数据</span>
      </div>
    </div>
    <div class="table-button" v-if="displayCard === 'table'">
      <el-button
        v-if="showBtn('remindTaskButton')"
        type="primary"
        size="small"
        @click="SelectedremindTask"
        >{{ $t("cgnTask.operate.remindTask") }}</el-button
      >
      <el-button
        v-if="showBtn('withdrawTaskButton')"
        size="small"
        class="cud-office-btn-reset"
        @click="SelectedwithdrawTask"
        >{{ $t("cgnTask.operate.withdrawTask") }}</el-button
      >
    </div>
    <!-- 查询结果 -->
    <div
      class="query-result cud__table--list"
      :style="{ height: getComputedHeight + 'px' }"
       v-if="displayCard === 'table'"
    >
      <!-- 表格 -->
      <el-table
        highlight-current-row
        header-row-class-name="cud-office-table-header"
        v-loading="loading"
        border
        stripe
        :data="data"
        class="cud-office-table"
        :max-height="getComputedHeight"
        :default-sort="{ prop: 'completedTime', order: 'descending' }"
        @selection-change="getSelectData"
      >
        <el-table-column
          type="selection"
          width="50"
          align="center"
        ></el-table-column>
        <!-- 优先级 -->
        <!-- <el-table-column width="130" align="left" class-name="vertical-align-top">
            <template slot-scope="scope">
                <div :class="['cud-task-priority', $options.filters.priorityClass(scope.row.priority)]">{{$t(getRowProority(scope.row.priority))}}·{{$t('cgnTask.field.priority')}}</div>
            </template>
        </el-table-column> -->
        <!-- 流程图 -->
        <el-table-column width="70" align="center" :label="$t('pw.proc_pic')">
          <template slot-scope="scope">
            <div
              class="cud-table-process-border"
              @click="onTaskViewFlowChart(scope.row)"
            >
              <span
                class="cud3-icon-blue font_family icon-icon_workplace_flowchart"
              ></span>
            </div>
          </template>
        </el-table-column>
        <!-- 工作主题 -->
        <el-table-column
          min-width="200"
          show-overflow-tooltip
          :label="$t('cgnBpmn.field.procSubject')"
        >
          <template slot-scope="scope">
            <div class="task-subject cud-task-subject">
              <el-button
                type="text"
                @click="$emit('openTaskForm', scope.row)"
                >{{ scope.row.procSubject }}</el-button
              >
            </div>
          </template>
        </el-table-column>

        <!-- 优先级暂时注释 -->
        <el-table-column
          min-width="62"
          align="left"
          :label="$t('cgnTask.field.priority')"
        >
          <template slot-scope="scope">
            <span>{{ $t(getRowProority(scope.row.priority)) }}</span>
          </template>
        </el-table-column>
        <!-- 流程状态 -->
        <el-table-column
          min-width="100"
          align="left"
          :label="$t('pw.procTaskStatus')"
        >
          <template slot-scope="scope">
            <el-tag
              v-if="scope.row.procInstStatus === '0'"
              size="mini"
              >{{ $t("pw.status_haveInHand") }}</el-tag
            >
            <el-tag v-if="scope.row.procInstStatus === '2'" size="mini" type="success">{{
              $t("pw.status_completed")
            }}</el-tag>
            <el-tag
              v-if="
                scope.row.procInstStatus === '3' ||
                  scope.row.procTaskStatus === '9'
              "
              type="info"
              size="mini"
              >{{ $t("pw.status_abandon") }}
            </el-tag>
            <el-tag v-if="scope.row.procInstStatus === '4'"
              size="mini"
              type="danger"
              >{{$t("pw.status_terminate")}}
            </el-tag>
            <el-tag v-if="scope.row.procInstStatus === '1'"
              size="mini"
              type="danger"
              >{{$t("pw.status_suspend")}}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          min-width="100"
          align="left"
          show-overflow-tooltip
          sortable
          :label="$t('pw.processingTime')"
          prop="completedTime"
        >
          <!-- <template slot-scope="scope">
            {{ scope.row.completedTime }}
          </template> -->
        </el-table-column>
        <el-table-column
          min-width="80"
          align="left"
          show-overflow-tooltip
          :label="$t('pw.currentTast')"
        >
          <template slot-scope="scope">
            {{ scope.row.procActName }}
          </template>
        </el-table-column>
        <template v-for="(field, fieldIndex) in fieldSettings">
          <el-table-column
            min-width="145"
            show-overflow-tooltip
            v-if="
              field.fieldKey !== 'procDefName' &&
                field.fieldKey !== 'startUserIdName' &&
                field.fieldKey !== 'testFiled' &&
                field.fieldKey !== 'procInstStatus'
            "
            align="left"
            :key="fieldIndex"
            :label="$t(getFieldName(field.fieldKey))"
          >
            <template slot-scope="scope">
              {{ scope.row | fieldValue(field.fieldKey, $i18n) }}
            </template>
          </el-table-column>
        </template>
        <!-- 流程名称 -->
        <el-table-column
          min-width="120"
          show-overflow-tooltip
          align="left"
          :label="$t('pw.procName')"
        >
          <template slot-scope="scope">
            <span>{{ scope.row | fieldValue("procDefName", $i18n) }}</span>
          </template>
        </el-table-column>
        <!-- 执行人 -->
        <el-table-column
          min-width="120"
          show-overflow-tooltip
          align="left"
          :label="$t('workbench.executor_user')"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.startUserIdName }}</span>
          </template>
        </el-table-column>
        <!-- 操作 -->
        <el-table-column
          width="80"
          align="left"
          v-if="showBtn('operate')"
          class-name="task-oprate cud-task-oprate"
          :label="$t('cm.operate')"
          fixed="right"
        >
          <div slot-scope="scope">
            <el-button
              size="small"
              type="text"
              :class="
                scope.row.concernFlag === '1'
                  ? 'el-icon-star-on'
                  : 'el-icon-star-off'
              "
              @click="myConcern(scope.row)"
            ></el-button>
          </div>
        </el-table-column>
      </el-table>
    </div>
    <div class="cud-special-pagination" v-if="displayCard === 'table'">
      <!-- 分页 -->
      <el-pagination
        popper-class="cud-pager-dropdown"
        class="cud__page float-right"
        :layout="pagination.layout"
        :page-sizes="pagination.pageSizes"
        :page-size="pagination.pageSize"
        :pager-count="5"
        :current-page="pagination.pageNum"
        :total="pagination.total"
        :disabled="loading"
        @size-change="pageSize => queryTaskList(1, pageSize)"
        @current-change="pageNum => queryTaskList(pageNum)"
      >
      </el-pagination>
    </div>

    <!-- 任务抄送弹窗 -->
    <task-cc-dialog
      v-if="taskCcDialog.isOpen"
      v-bind="taskCcDialog"
      @closeDialog="closeTaskCcDialog"
    >
    </task-cc-dialog>
    <!-- 任务撤销弹窗 -->
    <task-withdraw-dialog
      v-if="taskWithdrawDialog.isOpen"
      v-bind="taskWithdrawDialog"
      @closeDialog="closeTaskWithdrawDialog"
    >
    </task-withdraw-dialog>

    <!-- 任务催办弹窗 -->
    <task-remind-dialog
      v-if="taskRemindDialog.isOpen"
      v-bind="taskRemindDialog"
      :emailMessageShow="emailMessageShow"
      :shortMessageShow="shortMessageShow"
      :dingMessageShow="dingMessageShow"
      :emailMessageTrue="emailMessageTrue"
      :shortMessageTrue="shortMessageTrue"
      :dingMessageTrue="dingMessageTrue"
      @closeDialog="closeTaskRemindDialog"
    >
    </task-remind-dialog>
  </div>
</template>

<script>
import * as Utils from "@/utils/Utils";
import { throttle } from "@/utils/funcUtil";
// import NewQuery from "./dialog/NewQuery";
// import TaskCcDialog from "./dialog/TaskCcDialog";
// import TaskRemindDialog from "./dialog/TaskRemindDialog";
// import TaskWithdrawDialog from "./dialog/TaskWithdrawDialog";
import api from "../common/ApiTask";
import { hasPermission } from "@/permission/btn";
import queryForm from "@/components/common/queryForm";
import { calcHeight } from "@/utils/funcUtil";

/**
 * 已办任务列表
 */
export default {
  name: "CgnTaskCenterTaskHistList",
  components: {
    // NewQuery,
    queryForm
  },
  inject: [
    // 祖先组件注入参数
    "indexProvide" // Index注入参数
  ],
  props: {
    showQuery: { type: Boolean, default: false }, // 是否显示查询表单
    taskCount: { type: Number, default: 0 }, // 任务数量
    taskCountLoading: { type: Boolean, default: false }, // 是否统计任务数量完成
    pageSize: { type: Number, default: 10 }, // 每页笔数
    handleDatas: { type: Function, default: (datas, fieldSettings) => {} }, // 处理数据列表回调方法
    moreMenus: { type: Object, default: () => {} },
    currentTabName: { type: String, default: "" },
    displayCard: { type: String, default: "table" },
    showScrollTop: { type: Boolean, default: false }
  },
  data() {
    return {
      loading: false,
      // queryFields: [
      //   "procSubject",
      //   "startUser",
      //   "startDept",
      //   "procDefName",
      //   "assignTimeForArrival",
      //   "completedTime",
      //   "procInstStatus",
      //   "dataSource",
      //   "priority",
      //   "taskOrderBy",
      //   "remindTaskButton",
      //   "withdrawTaskButton",
      // ],
      queryFields: [
        // { name: 'dataSource', label: '', labelKey: 'cgnTask.field.dataSource', value: '', type: 'select', display: true, order: 0, fieldMap: this.indexProvide.dataSourceOptions }, 
        {
          name: "procSubject",
          label: "",
          labelKey: "工作主题",
          value: "",
          type: "input",
          display: true,
          order: 1
        },
        {
          name: "procDefName",
          label: "",
          labelKey: "cgnTask.field.procDefName",
          value: "",
          type: "input",
          display: true,
          order: 2
        },
        {
          name: "startUserId",
          label: "",
          labelKey: "cgnTask.field.startUser",
          value: "",
          type: "personal",
          display: true,
          order: 3
        },
        {
          name: "procInstStatus",
          label: "",
          labelKey: "cgnTask.field.procInstStatus",
          value: "",
          type: "select",
          display: true,
          order: 4,
          fieldMap: Utils.Options.procInstStatus
        },
        {
          name: "priority",
          label: "",
          labelKey: "cgnTask.field.priority",
          value: "",
          type: "select",
          display: true,
          order: 5,
          fieldMap: Utils.Options.priority
        },
        {
          name: "taskOrderBy",
          label: "",
          labelKey: "cgnTask.field.startTimeOrder",
          value: "0",
          type: "select",
          display: true,
          order: 6,
          fieldMap: Utils.Options.startTimeOrder
        },
        {
          name: "startAssignTime",
          label: "",
          labelKey: "cgnTask.field.arrivalTime",
          relation: "endAssignTime",
          value: "",
          type: "dateRange",
          display: true,
          order: 7
        },
        {
          name: "startCompletedTime",
          label: "",
          labelKey: "cgnTask.field.completedTime",
          relation: "endCompletedTime",
          value: "",
          type: "dateRange",
          display: true,
          order: 8
        }
      ],
      queryForm: {
        // 查询表单
        procSubject: "", // 任务主题
        startUserId: "", // 发起人
        startDeptId: "", // 发起人部门ID
        procDefName: "", // 流程名称
        startAssignTime: "", // 任务分派开始时间
        endAssignTime: "", // 任务分派结束时间
        startCompletedTime: "", // 任务完成开始时间
        endCompletedTime: "", // 任务完成结束时间
        procInstStatus: "", // 流程状态
        procCategoryId: "", // 流程分类ID
        dataSource: "", // 选择库
        priority: "", // 优先级
        taskOrderBy: "0" // 任务开始时间排序
      },
      data: [], // 查询结果
      fieldSettings: [], // 查询结果字段设定
      pagination: {
        // 分页参数
        layout: Utils.Pagination.layout,
        pageSizes: Utils.Pagination.pageSizes,
        pageSize: this.pageSize,
        pageNum: 1,
        total: 0
      },
      taskCcDialog: {
        // 任务抄送弹窗
        isOpen: false,
        procInsId: "", // 流程实例ID，必填
        procActInstId: "", // 流程环节实例ID，必填
        procTaskId: "", // 任务ID，必填
        procActId: "" // 环节ID，必填
      },
      taskWithdrawDialog: {
        // 任务撤销弹窗
        isOpen: false,
        procDefId: "", // 流程ID
        procTaskId: "", // 流程任务ID
        procInstId: "", // 流程任务ID
        procActId: "",
        cosignItemCode: "",
        cosignItemName: ""
      },
      taskRemindDialog: {
        isOpen: false,
        procInstId: "", // 流程实例ID，必填
        remindUserList: []
      },
      class: "",
      computedHeight: 0,
      selection: [], //表格勾选数据集合
      selectionIds: [], //表格勾选数据id集合,用于一键催办和撤销
      remindDialog: false,
      ascUrl: envConfig.ASC_ROOT,
      dingMessageShow: false,
      emailMessageShow: false,
      shortMessageShow: false,
      emailMessageTrue: false,
      shortMessageTrue: false,
      dingMessageTrue: false
    };
  },
  filters: Utils.Filters,
  mounted() {
    // 缓存查询表单值
    this.queryForm = Object.assign(
      this.queryForm,
      this.$refs.queryDialog.getQueryForm()
    );
    // throttleFunc记录当前的节流方法，用于在页面销毁时释放
    this.throttleFunc = throttle(this.resizeTableHeight, 500);
    window.addEventListener("resize", this.throttleFunc);
  },
  computed: {
    getComputedHeight() {
      return this.computedHeight;
    }
  },
  watch: {
    /**
     * 切换语言时重新查询表单
     */
    "$i18n.locale"() {
      this.queryTaskList();
    }
  },
  methods: {
    showBtn(btn) {
      return hasPermission(btn);
    },
    /**
     * 勾选数据催办
     */
    SelectedremindTask() {
      if (this.selection.length != 1) {
        this.$message.warning(this.$t("cgnTask.tips.taskHistNotOne"));
        return;
      }
      console.log(this.data, this.selectionIds);
      this.data.forEach(item => {
        if (item.procInstId === this.selectionIds[0]) {
          if (item.formUrl) {
            if (this.selectionIds.length != 1) {
              this.$message.warning(this.$t("cgnTask.tips.taskHistNotOne"));
              return;
            }
            // this.selectionIds
            api.remindTask({ procInstId: this.selectionIds[0] }).then(res => {
              if (res.status == 200 && res.data.code == 0) {
                this.taskRemindDialog.isOpen = true;
                this.taskRemindDialog.procActId = this.selection[0].procActId; // 环节ID，必填
                this.taskRemindDialog.remindUserList = res.data.data;
                this.taskRemindDialog.procInstId = this.selectionIds[0];
              } else {
                this.$message.error(res.data.msg);
              }
            });
          } else {
            this.loading = true;
            api
              .getProcFormExamineTool({
                procInstId: this.selectionIds[0]
              })
              .then(res => {
                this.loading = false;
                if (res.data.code === "0") {
                  this.dingMessageShow = res.data.data.dingMessageShow;
                  this.emailMessageShow = res.data.data.emailMessageShow;
                  this.shortMessageShow = res.data.data.shortMessageShow;
                  this.emailMessageTrue = res.data.data.emailMessageTrue;
                  this.shortMessageTrue = res.data.data.shortMessageTrue;
                  this.dingMessageTrue = res.data.data.dingMessageTrue;
                  if (this.selectionIds.length != 1) {
                    this.$message.warning(
                      this.$t("cgnTask.tips.taskHistNotOne")
                    );
                    return;
                  }
                  // this.selectionIds
                  api
                    .remindTask({ procInstId: this.selectionIds[0] })
                    .then(res => {
                      if (res.status == 200 && res.data.code == 0) {
                        this.taskRemindDialog.isOpen = true;
                        this.taskRemindDialog.procActId = this.selection[0].procActId; // 环节ID，必填
                        this.taskRemindDialog.remindUserList = res.data.data;
                        this.taskRemindDialog.procInstId = this.selectionIds[0];
                      } else {
                        this.$message.error(res.data.msg);
                      }
                    });
                } else {
                  if (this.selectionIds.length != 1) {
                    this.$message.warning(
                      this.$t("cgnTask.tips.taskHistNotOne")
                    );
                    return;
                  }
                  // this.selectionIds
                  api
                    .remindTask({ procInstId: this.selectionIds[0] })
                    .then(res => {
                      if (res.status == 200 && res.data.code == 0) {
                        this.taskRemindDialog.isOpen = true;
                        this.taskRemindDialog.procActId = this.selection[0].procActId; // 环节ID，必填
                        this.taskRemindDialog.remindUserList = res.data.data;
                        this.taskRemindDialog.procInstId = this.selectionIds[0];
                      } else {
                        this.$message.error(res.data.msg);
                      }
                    });
                }
              });
          }
        }
      });
    },
    /**
     * 勾选数据撤销
     */
    SelectedwithdrawTask() {
      if (this.selection.length != 1) {
        this.$message.warning(this.$t("cgnTask.tips.taskHistNotOne"));
        return;
      }

      if (this.selection.length === 1) {
        if (this.selection[0].procInstStatus == "1") {
          this.$message.warning(this.$t("cgnTask.tips.withdrawSuspended"));
          return;
        }

        if (this.selection[0].procInstStatus == "2") {
          this.$message.warning(this.$t("cgnTask.tips.withdrawEndProcess"));
          return;
        }

        if (this.selection[0].procInstStatus == "3") {
          this.$message.warning(this.$t("cgnTask.tips.withdrawCancelled"));
          return;
        }

        if (this.selection[0].procInstStatus == "4") {
          this.$message.warning(this.$t("cgnTask.tips.withdrawTermination"));
          return;
        }

        this.taskWithdrawDialog.procDefId = this.selection[0].procDefId;
        this.taskWithdrawDialog.procTaskId = this.selection[0].id;
        this.taskWithdrawDialog.procInstId = this.selection[0].procInstId;
        this.taskWithdrawDialog.procActId = this.selection[0].procActId;
        this.taskWithdrawDialog.cosignItemCode = this.selection[0].cosignItemCode;
        this.taskWithdrawDialog.cosignItemName = this.selection[0].cosignItemName;
        this.taskWithdrawDialog.isOpen = true;
      }
      if (this.selection.length > 1) {
        this.$message.error(this.$t("cgnTask.tips.withdrawTaskNotEmpty"));
      }
    },
    resizeTableHeight() {
      calcHeight(this, 6);
    },
    getRowProority(priority) {
      switch (priority) {
        case "0":
          return "cgnTask.priority.low";
        case "1":
          return "cgnTask.priority.middle";
        case "2":
          return "cgnTask.priority.high";
      }
    },
    getFieldName(fieldKey) {
      return "cgnTask.completedList." + fieldKey;
    },
    resetSeniorSearch() {
      this.$refs.queryDialog.resetSeniorSearch();
    },
    onMoreMenuCommand() {
      this.$emit("onMoreMenuCommand");
    },
    /**
     * 隐藏查询表单
     */
    hideQueryForm() {
      this.$emit("update:showQuery", false);
    },

    /**
     * 提交查询表单
     */
    submitQueryForm() {
      // 缓存查询表单值，并提交查询表单
      this.queryForm = Object.assign(
        this.queryForm,
        this.$refs.queryDialog.getQueryForm()
      );
      this.queryTaskList(1);
    },

    /**
     * 请求API，更新任务数量
     */
    updateTaskCount() {
      let that = this;
      that.$emit("requestApi", function(requestApi, requestApiBasic) {
        // 获取查询参数
        let requestParams = {
          parameter: ""
        };
        // 请求API
        that.$emit("update:taskCount", 0);
        that.$emit("update:taskCountLoading", true);
        requestApi
          .countTaskHist(requestParams)
          .then(res => {
            that.$emit("update:taskCountLoading", false);
            if (res.status == 200 && res.data.code == 0) {
              that.$emit("update:taskCount", res.data.data);
            }
          })
          .catch(err => {
            that.$emit("update:taskCountLoading", false);
          });
      });
    },

    /**
     * 请求API，查询任务列表
     */
    queryTaskList(pageNum, pageSize) {
      let that = this;
      //防重点击
      // if (that.loading) {
      //   that.$message({ type: 'warning', message: that.$t('cm.system_is_processing') });
      //   return;
      // }
      // 更新分页参数
      that.pagination.pageNum = pageNum || that.pagination.pageNum;
      that.pagination.pageSize = pageSize || that.pagination.pageSize;

      that.$emit("requestApi", function(
        requestApi,
        requestApiBasic,
        { priority, taskOrderBy, languageType }
      ) {
        // 清空查询显示
        that.data = [];
        that.fieldSettings = [];

        let requestParams = Object.assign(
          {
            taskOrderBy: taskOrderBy, // 排序方式 0-任务分派时间降序 1-任务分派时间升序
            pageIndex: that.pagination.pageNum,
            pageSize: that.pagination.pageSize,
            priority: priority
          },
          that.queryForm
        );

        // 请求API
        that.loading = true;
        requestApi
          .queryTaskHist(requestParams)
          .then(res => {
            that.loading = false;
            if (res.status == 200 && res.data.code == 0) {
              // 更新前回调处理数据列表方法
              let dataList = res.data.data.page.records;
              let fieldSettings = res.data.data.fieldReturnDtoList;
              if (that.handleDatas instanceof Function) {
                that.handleDatas(dataList, fieldSettings);
              }

              that.data = dataList; // 更新查询结果
              that.pagination.total = res.data.data.page.total; // 更新分页总数
              that.fieldSettings = fieldSettings; // 更新字段显示设置
              that.$emit("update:taskCountLoading", false); // 关闭任务数量Loading提示
              that.$emit("update:taskCount", res.data.data.page.total);
              // 隐藏查询表单
              that.hideQueryForm();
            } else {
              that.$message.error(res.data.message);
            }
          })
          .catch(err => {
            that.loading = false;
            that.$emit("update:taskCountLoading", false);
          });
      });
    },

    /**
     * 任务操作：查看流程图
     */
    onTaskViewFlowChart(row) {
      this.$emit("viewFlowChart", row);
    },

    /**
     * 任务操作：撤销
     */
    onTaskWithdraw(row) {
      this.taskWithdrawDialog.procDefId = row.procDefId;
      this.taskWithdrawDialog.procTaskId = row.id;
      this.taskWithdrawDialog.isOpen = true;
    },

    // 关注
    myConcern(row) {
      if (row.concernFlag === null || row.concernFlag === undefined) {
        this.saveData(row);
      } else {
        this.delData(row);
      }
    },

    /**
     * 保存关注
     */
    saveData(row) {
      let that = this;
      let requestApiFun = function(requestApi, requestApiBasic) {
        let requestParams = row;
        // 请求API
        that.loading = true;
        requestApi
          .addMyConcern(requestParams)
          .then(res => {
            that.loading = false;
            if (res.status == 200 && res.data.code == 0) {
              // 提示成功，并关闭弹窗
              that.$message.success(that.$t("cgnTask.tips.concernTaskSuccess"));
              // 隐藏查询表单
              that.hideQueryForm();
              row.concernFlag = "1";
            }
          })
          .catch(err => {
            that.loading = false;
          });
      };
      // 若表单验证通过，则提交表单
      that.$emit("requestApi", requestApiFun);
    },

    /**
     * 删除关注
     */
    delData(row) {
      let that = this;
      let requestApiFun = function(requestApi, requestApiBasic) {
        let requestParams = row;
        // 请求API
        that.loading = true;
        requestApi
          .delMyConcern(requestParams)
          .then(res => {
            that.loading = false;
            if (res.status == 200 && res.data.code == 0) {
              // 提示成功，并关闭弹窗
              that.$message.success(that.$t("cgnTask.tips.concernTaskCancel"));
              // 隐藏查询表单
              that.hideQueryForm();
              row.concernFlag = null;
            }
          })
          .catch(err => {
            that.loading = false;
          });
      };
      // 若表单验证通过，则提交表单
      that.$emit("requestApi", requestApiFun);
    },

    /**
     * 任务催办
     */
    remindTask(row) {
      let that = this;
      let requestApiFun = function(requestApi, requestApiBasic) {
        let requestParams = row;
        // 请求API
        that.loading = true;
        requestApi
          .remindTask(requestParams)
          .then(res => {
            that.loading = false;
            if (res.status == 200 && res.data.code == 0) {
              // 提示成功，并关闭弹窗
              that.$message.success(that.$t("cgnTask.tips.concernTaskSuccess"));
              // 隐藏查询表单
              that.hideQueryForm();
            }
          })
          .catch(err => {
            that.loading = false;
          });
      };

      // 若表单验证通过，则提交表单
      that.$emit("requestApi", requestApiFun);
    },

    /**
     * 关闭任务撤销弹窗
     */
    closeTaskWithdrawDialog(isSubmitted) {
      this.taskWithdrawDialog.isOpen = false;
      if (isSubmitted) {
        // 通知任务状态变更，并重新查询任务列表
        this.$emit("taskStatusChange");
        this.queryTaskList();
      }
    },
    closeTaskRemindDialog() {
      this.taskRemindDialog.isOpen = false;
    },

    /**
     * 任务操作：抄送
     */
    onTaskCc(row) {
      this.taskCcDialog.procInsId = row.procInstId; // 流程实例ID，必填
      this.taskCcDialog.procActInstId = row.procActInstId; // 流程环节实例ID，必填
      this.taskCcDialog.procTaskId = row.id; // 任务ID，必填
      this.taskCcDialog.procActId = row.procActId; // 环节ID，必填
      this.taskCcDialog.isOpen = true;
    },

    /**
     * 关闭任务抄送弹窗
     */
    closeTaskCcDialog() {
      this.taskCcDialog.isOpen = false;
    },
    /**
     * 获取表格选择数据
     */
    getSelectData(selection) {
      this.selection = selection;
      this.selectionIds = selection.map(item => item.procInstId);
    },

    //加载更多
    loadingMore() {
      let that = this;
      if (that.loading) return;
      if (that.data.length >= that.pagination.total) {
        that.$message.error('没有更多数据了...');
        return;
      }
      // 更新分页参数
      that.pagination.pageNum = that.pagination.pageNum + 1;
      that.$emit("requestApi", function(
        requestApi,
        requestApiBasic,
        { priority, taskOrderBy, languageType }
      ) {
        // 获取查询参数
        let requestParams = Object.assign(
          {
            taskOrderBy: taskOrderBy, // 排序方式 0-任务分派时间降序 1-任务分派时间升序
            pageIndex: that.pagination.pageNum,
            pageSize: that.pagination.pageSize,
            priority: priority
          },
          that.queryForm
        );
        // 请求API
        that.loading = true;
        const loading = that.$loading();
        requestApi
          .queryTaskHist(requestParams)
          .then(res => {
            that.loading = false;
            loading.close();
            if (res.status == 200 && res.data.code == 0) {
              // 更新前回调处理数据列表方法
              let dataList = res.data.data.page.records;
              dataList.forEach((item) => {
                that.data.push(item);
              })
              that.pagination.total = res.data.data.page.total;
            }
          })
          .catch(err => {
            that.loading = false;
            loading.close();
          });
      });
    },
    //返回顶部
    scrollTop() {
      document.querySelector('.cud-display-card').scrollIntoView({
        block: "center",
        behavior: "smooth",
      });
    },
    //单个催办
    cardRemindTask(item) {
      this.getSelectData([item]);
      this.SelectedremindTask();
    },
    //单个撤销
    cardWithdrawTask(item) {
      this.getSelectData([item]);
      this.SelectedwithdrawTask();
    },
  },
  beforeDestroy() {
    // throttleFunc记录当前的节流方法，用于在页面销毁时释放
    window.removeEventListener("resize", this.throttleFunc);
  }
};
</script>
<style lang="less" scoped>
/deep/ .el-table_fixed {
  height: 100% !important;
}
/deep/ .el-table--scrollable-y .el-table__body-wrapper {
  // height: 90% !important;
}
/deep/ .cud-commom-form-style .cud-special-pagination {
  margin-bottom: 0 !important;
}
/deep/ .cud__page {
  margin-top: 10px;
  margin-bottom: 0;
}
//  @import "src/assets/css/style";
</style>
