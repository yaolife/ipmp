<template>
  <div class="task-tab-content">
    <!-- 查询条件 -->
    <!-- <new-query
      class="cud-office-search-block-c"
      ref="queryDialog"
      :fields="queryFields"
      :moreMenus="moreMenus"
      :currentTabName="currentTabName"
      @submit="submitQueryForm"
      @onMoreMenuCommand="onMoreMenuCommand"
      @resizeTableHeight="resizeTableHeight"
      @SelectedremindTask="SelectedremindTask"
      @batchReadTask="batchReadTask"
    >
    </new-query> -->
    <div ref="searchRef">
      <query-form
        :queryFormId="'offce_task_cc_list'"
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
            <p>{{ $t('workbench.act_name') }}：{{ item.procActName }}</p>
            <p>{{ $t('pw.sender') }}：　{{ item.startUserIdName }}</p>
            <!-- <p>{{ $t('cgnTask.toReadList.assignTime') }}：{{ item.assignTime }}</p> -->
            <p>{{ $t("cgnTask.toReadList.assignTime") }}：{{ item | fieldValue("assignTime", $i18n) }}</p>
          </div>
          <div class="button">
            <el-button style="width: 50%;" @click="$emit('openTaskForm', item)">查看</el-button>
            <el-button style="width: 50%;" @click="cardReadTask(item)">{{ $t("cgnTask.operate.readTask") }}</el-button>
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
        v-if="showBtn('readTaskButton')"
        size="small"
        class="cud-office-btn-reset"
        @click="batchReadTask"
        >{{ $t("cgnTask.operate.readTask") }}</el-button
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
        ref="dataTable"
        :data="data"
        :show-header="true"
        v-loading="loading"
        @selection-change="getSelectData"
        :highlight-current-row="true"
        border
        stripe
        :max-height="getComputedHeight"
        :default-sort="{ prop: 'assignTime', order: 'descending' }"
        header-row-class-name="cud-office-table-header"
        class="cud-office-table"
      >
        <!-- 复选框 -->
        <el-table-column
          v-if="indexProvide.rights.indexOf('batchToRead') >= 0"
          type="selection"
          width="40"
          align="center"
        >
        </el-table-column>
        <!-- 优先级 -->
        <!-- <el-table-column width="130" align="center" class-name="vertical-align-top">
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
          min-width="180"
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
          min-width="70"
          align="left"
          :label="$t('cgnTask.field.priority')"
        >
          <template slot-scope="scope">
            <span>{{ $t(getRowProority(scope.row.priority)) }}</span>
          </template>
        </el-table-column>
        <!-- 循环的psc给的字段fieldReturnDtoList,暂时通过v-if隐藏了 -->
        <template v-for="(field, fieldIndex) in fieldSettings">
          <el-table-column
            :min-width="field.fieldKey === 'startUserIdName' ? 150 : 105"
            show-overflow-tooltip
            v-if="
              field.fieldKey !== 'procDefName' &&
              field.fieldKey !== 'startUserIdName' &&
              field.fieldKey !== 'testFiled' &&
              field.fieldKey !== 'assignTime'
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
        <!-- 抄送时间 -->
        <el-table-column
          show-overflow-tooltip
          min-width="110"
          align="left"
          :label="$t(getFieldName('assignTime'))"
          sortable
          prop="assignTime"
        >
        </el-table-column>
        <!-- 流程名称 -->
        <el-table-column
          show-overflow-tooltip
          min-width="110"
          align="left"
          :label="$t('pw.procName')"
        >
          <template slot-scope="scope">
            <span>{{ scope.row | fieldValue("procDefName", $i18n) }}</span>
          </template>
        </el-table-column>
        <!-- 发送者 -->
        <el-table-column
          show-overflow-tooltip
          min-width="150"
          align="left"
          :label="$t('pw.sender')"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.startUserIdName }}</span>
          </template>
        </el-table-column>
        <!-- 操作 -->
        <el-table-column
          width="80"
          align="left"
          v-if="showBtn('operateCC')"
          class-name="task-oprate cud-task-oprate"
          :label="$t('cm.operate')"
          fixed="right"
        >
          <div slot-scope="scope">
            <el-button
              type="text"
              size="small"
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
      <el-pagination popper-class="cud-pager-dropdown"
        class="cud__page float-right"
        :layout="pagination.layout"
        :pager-count="5"
        :page-sizes="pagination.pageSizes"
        :page-size="pagination.pageSize"
        :current-page="pagination.pageNum"
        :total="pagination.total"
        :disabled="loading"
        @size-change="(pageSize) => queryTaskList(1, pageSize)"
        @current-change="(pageNum) => queryTaskList(pageNum)"
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
    <!-- 任务已阅弹窗 -->
    <task-read-dialog
      v-if="taskReadDialog.isOpen"
      v-bind="taskReadDialog"
      @closeDialog="closeTaskReadDialog"
    >
    </task-read-dialog>
    <!-- 任务催办弹窗 -->
    <task-remind-dialog
      v-if="taskRemindDialog.isOpen"
      v-bind="taskRemindDialog"
      @closeDialog="closeTaskRemindDialog"
    >
    </task-remind-dialog>
  </div>
</template>

<script>
import * as Utils from "@/utils/Utils";
import { throttle } from "@/utils/funcUtil";
import NewQuery from "./dialog/NewQuery";
// import TaskCcDialog from "./dialog/TaskCcDialog";
// import TaskReadDialog from "./dialog/TaskReadDialog";
import api from "../common/ApiTask";
import { hasPermission } from "@/permission/btn";
// import TaskRemindDialog from "./dialog/TaskRemindDialog";
import queryForm from "@/components/common/queryForm";
import { calcHeight } from "@/utils/funcUtil";

/**
 * 待阅任务列表
 */
export default {
  name: "CgnTaskCenterTaskCcList",
  components: {
    // NewQuery,
    queryForm,
  },
  inject: [
    // 祖先组件注入参数
    "indexProvide", // Index注入参数
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
      //   "assignTimeForCc",
      //   "dataSource",
      //   "priority",
      //   "taskOrderBy",
      //   "readTaskButton",
      // ],
      queryFields: [ 
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
          order: 2,
        },
        {
          name: "startUserId",
          label: "",
          labelKey: "cgnTask.field.startUser",
          value: "",
          type: "personal",
          display: true,
          order:3,
        },
        {
          name: "priority",
          label: "",
          labelKey: "cgnTask.field.priority",
          value: "",
          type: "select",
          display: true,
          order: 4,
          fieldMap: Utils.Options.priority,
        },
        {
          name: "taskOrderBy",
          label: "",
          labelKey: "cgnTask.field.startTimeOrder",
          value: "0",
          type: "select",
          display: true,
          order: 5,
          fieldMap: Utils.Options.startTimeOrder,
        },
        {
          name: "startAssignTime",
          label: "",
          labelKey: "cgnTask.field.ccTime",
          relation: "endAssignTime",
          value: "",
          type: "dateRange",
          display: true,
          order: 6,
        },
      ],
      queryForm: {
        // 查询表单
        procSubject: "", // 任务主题
        startUserId: "", // 发起人
        startDeptId: "", // 发起人部门ID
        procDefName: "", // 流程名称
        startAssignTime: "", // 任务分派开始时间
        endAssignTime: "", // 任务分派结束时间
        procCategoryId: "", // 流程分类ID
        dataSource: "", // 选择库
        priority: "", // 优先级
        taskOrderBy: "0", // 任务开始时间排序
      },
      data: [], // 查询结果
      fieldSettings: [], // 查询结果字段设定
      pagination: {
        // 分页参数
        layout: Utils.Pagination.layout,
        pageSizes: Utils.Pagination.pageSizes,
        pageSize: this.pageSize,
        pageNum: 1,
        total: 0,
      },
      taskCcDialog: {
        // 任务抄送弹窗
        isOpen: false,
        procInstId: "", // 流程实例ID，必填
        procActInstId: "", // 流程环节实例ID，必填
        procTaskId: "", // 任务ID，必填
        procActId: "", // 环节ID，必填
      },
      taskReadDialog: {
        // 任务已阅弹窗
        isOpen: false,
        procTaskIds: [], // 流程任务ID列表，必填
      },
      taskRemindDialog: {
        isOpen: false,
        procInstId: "", // 流程实例ID，必填
        remindUserList: [],
      },
      selectionIds: [],
      computedHeight: 0,
      selection: [], //表格勾选数据集合
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
    },
  },
  watch: {
    /**
     * 切换语言时重新查询表单
     */
    "$i18n.locale"() {
      this.queryTaskList();
    },
  },
  methods: {
    showBtn(btn) {
      return hasPermission(btn);
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
      return "cgnTask.toReadList." + fieldKey;
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
      that.$emit("requestApi", function (requestApi, requestApiBasic) {
        // 获取查询参数
        let requestParams = {
          parameter: "",
        };

        // 请求API
        that.$emit("update:taskCount", 0);
        that.$emit("update:taskCountLoading", true);
        requestApi
          .countTaskCC(requestParams)
          .then((res) => {
            that.$emit("update:taskCountLoading", false);
            if (res.status == 200 && res.data.code == 0) {
              that.$emit("update:taskCount", res.data.data);
            }
          })
          .catch((err) => {
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

      that.$emit(
        "requestApi",
        function (
          requestApi,
          requestApiBasic,
          { priority, taskOrderBy, languageType }
        ) {
          // 清空查询显示
          that.data = [];
          that.fieldSettings = [];

          let requestParams = Object.assign(
            {
              languageType: languageType, // 语言类型，0-中文，1-英文
              taskOrderBy: taskOrderBy, // 排序方式 0-任务分派时间降序 1-任务分派时间升序
              pageIndex: that.pagination.pageNum,
              pageSize: that.pagination.pageSize,
              priority: priority, // 优先级，null-默认，0-低，1-中，2-高
            },
            that.queryForm
          );

          // 请求API
          that.loading = true;
          requestApi
            .queryTaskCC(requestParams)
            .then((res) => {
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
            .catch((err) => {
              that.loading = false;
              that.$emit("update:taskCountLoading", false);
            });
        }
      );
    },

    /**
     * 批量选择/取消选择任务
     */
    batchSelectTask() {
      this.$refs.dataTable.toggleAllSelection();
    },

    /**
     * 批量已阅任务
     */
    batchReadTask() {
      let that = this;
      // 验证是否有勾选待阅任务
      let selectedTasks = that.$refs.dataTable.selection;
      if (selectedTasks.length == 0) {
        that.$message.warning(that.$t("cgnTask.tips.pleaseChooseTaskCc"));
        return;
      }

      // 收集勾选待阅任务ID列表，并打开弹窗
      let selectedTaskIds = [];
      for (let i = 0; i < selectedTasks.length; i++) {
        let task = selectedTasks[i];
        selectedTaskIds.push(task.id);
      }
      this.taskReadDialog.procTaskIds = selectedTaskIds;
      this.taskReadDialog.isOpen = true;
    },

    /**
     * 关闭任务已阅弹窗
     */
    closeTaskReadDialog(isSubmitted) {
      this.taskReadDialog.isOpen = false;
      if (isSubmitted) {
        // 通知任务状态变更，并重新查询任务列表
        this.$emit("taskStatusChange");
        this.queryTaskList();
      }
    },

    /**
     * 任务操作：查看流程图
     */
    onTaskViewFlowChart(row) {
      this.$emit("viewFlowChart", row);
    },

    /**
     * 任务操作：抄送
     */
    onTaskCc(row) {
      this.taskCcDialog.procInstId = row.procInstId; // 流程实例ID，必填
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
      this.selectionIds = selection.map((item) => item.procInstId);
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
      let requestApiFun = function (requestApi, requestApiBasic) {
        let requestParams = row;
        // 请求API
        that.loading = true;
        requestApi
          .addMyConcern(requestParams)
          .then((res) => {
            that.loading = false;
            if (res.status == 200 && res.data.code == 0) {
              // 提示成功，并关闭弹窗
              that.$message.success(that.$t("cgnTask.tips.concernTaskSuccess"));
              // 隐藏查询表单
              that.hideQueryForm();
              row.concernFlag = "1";
            }
          })
          .catch((err) => {
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
      let requestApiFun = function (requestApi, requestApiBasic) {
        let requestParams = row;
        // 请求API
        that.loading = true;
        requestApi
          .delMyConcern(requestParams)
          .then((res) => {
            that.loading = false;
            if (res.status == 200 && res.data.code == 0) {
              // 提示成功，并关闭弹窗
              that.$message.success(that.$t("cgnTask.tips.concernTaskCancel"));
              // 隐藏查询表单
              that.hideQueryForm();
              row.concernFlag = null;
            }
          })
          .catch((err) => {
            that.loading = false;
          });
      };
      // 若表单验证通过，则提交表单
      that.$emit("requestApi", requestApiFun);
    },
    // 催办
    SelectedremindTask() {
      if (this.selectionIds.length != 1) {
        this.$message.warning("请选择一条待阅数据");
        return;
      }
      // this.selectionIds
      api.remindTask({ procInstId: this.selectionIds[0] }).then((res) => {
        if (res.status == 200 && res.data.code == 0) {
          this.taskRemindDialog.isOpen = true;
          this.taskRemindDialog.procActId = this.selection[0].procActId; // 环节ID，必填
          this.taskRemindDialog.remindUserList = res.data.data;
          this.taskRemindDialog.procInstId = this.selectionIds[0];
          // 提示成功，并关闭弹窗
          //this.$message.success(this.$t("cgnTask.tips.concernTaskCancel"));
        }
      });
    },
    closeTaskRemindDialog() {
      this.taskRemindDialog.isOpen = false;
    },
    readTaskHandle() {

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
          .queryTaskCC(requestParams)
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
    //单个已阅
    cardReadTask(item) {
      this.taskReadDialog.procTaskIds = [item.id];
      this.taskReadDialog.isOpen = true;
    }
  },
  beforeDestroy() {
    // throttleFunc记录当前的节流方法，用于在页面销毁时释放
    window.removeEventListener("resize", this.throttleFunc);
  },
};
</script>
<style lang="less" scoped>
/deep/ .el-table_fixed {
  height: 100% !important;
}

/deep/ .cud-commom-form-style .cud-special-pagination {
  margin-bottom: 0 !important;
}
/deep/ .cud__page {
  margin-bottom: 0;
  margin-top: 10px;
}
// @import "src/assets/css/style";
</style>
