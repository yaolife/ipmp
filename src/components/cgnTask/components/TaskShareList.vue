<template>
  <div class="task-tab-content" v-loading="loading">
    <!-- 查询条件弹窗 -->
    <div
      v-show="showQuery"
      class="query-dialog-mask"
      @click="hideQueryForm"
    ></div>
    <query-dialog
      ref="queryDialog"
      v-show="showQuery"
      :fields="queryFields"
      :share-types="shareTypes"
      @submit="submitQueryForm"
    ></query-dialog>

    <!-- 查询结果 -->
    <div class="query-result cud__table--list">
      <!-- 表格 -->
      <el-table
        highlight-current-row
        header-row-class-name="cud-office-table-header"
        :data="data"
        border
        stripe
        class="cud-office-table"
      >
        <!-- 优先级暂时注释 -->
        <!-- 优先级 -->
        <el-table-column
          width="50"
          align="left"
          class-name="vertical-align-top"
        >
          <template slot-scope="scope">
            <div
              :class="[
                'task-priority',
                $options.filters.priorityClass(scope.row.priority),
              ]"
            ></div>
          </template>
        </el-table-column>
        <!-- 动态内容 -->
        <el-table-column>
          <template slot-scope="scope">
            <div class="task-subject cud-task-subject">
              <el-tag
                :class="[
                  'cud-task-priority',
                  $options.filters.priorityClass(scope.row.priority),
                ]"
                >{{ $t(getRowProority(scope.row.priority)) }}</el-tag
              >
              <el-link
                :title="scope.row.procSubject"
                @click.native="$emit('openTaskForm', scope.row)"
                >{{ scope.row.procSubject }}</el-link
              >
            </div>
            <div class="task-fields">
              <div
                class="task-field"
                v-for="(field, fieldIndex) in fieldSettings"
                :key="scope.row.id + '_' + fieldIndex"
                :style="{ width: field.percent }"
              >
                <span class="task-field-name">{{ field.fieldName }}：</span>
                <span
                  class="task-field-value"
                  :title="
                    $options.filters.fieldValue(
                      scope.row,
                      field.fieldKey,
                      $i18n
                    )
                  "
                  >{{ scope.row | fieldValue(field.fieldKey, $i18n) }}</span
                >
              </div>
            </div>
          </template>
        </el-table-column>
        <!-- 操作 -->
        <el-table-column width="150" align="left" class-name="task-oprate">
          <div slot-scope="scope">
            <!-- 查看流程图 -->
            <el-button
              size="small"
              type="text"
              icon="psc-icon-process"
              :title="$t('cgnTask.operate.viewFlowChart')"
              @click="onTaskViewFlowChart(scope.row)"
            ></el-button>
            <!-- 认领 -->
            <el-button
              size="small"
              v-if="indexProvide.rights.indexOf('claim') >= 0"
              type="text"
              icon="psc-icon-user-claim"
              :title="$t('cgnTask.operate.claimTask')"
              @click="onTaskClaim(scope.row)"
            ></el-button>
          </div>
        </el-table-column>
      </el-table>
      <div class="cud-special-pagination">
        <!-- 分页 -->
        <el-pagination popper-class="cud-pager-dropdown"
          class="cud__page float-right"
          :layout="pagination.layout"
          :pager-count="5"
          :page-sizes="pagination.pageSizes"
          :page-size="pagination.pageSize"
          :current-page="pagination.pageNum"
          :total="pagination.total"
          @size-change="(pageSize) => queryTaskList(1, pageSize)"
          @current-change="(pageNum) => queryTaskList(pageNum)"
        >
        </el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import * as Utils from "@/utils/Utils";
import QueryDialog from "./dialog/QueryDialog";

/**
 * 共享任务列表
 */
export default {
  name: "CgnTaskCenterTaskShareList",
  components: { QueryDialog },
  inject: [
    // 祖先组件注入参数
    "indexProvide", // Index注入参数
  ],
  props: {
    showQuery: { type: Boolean, default: false }, // 是否显示查询表单
    taskCount: { type: Number, default: 0 }, // 任务数量
    taskCountLoading: { type: Boolean, default: false }, // 是否统计任务数量完成
    pageSize: { type: Number, default: 10 }, // 每页笔数
    shareTypes: {
      type: Array,
      default: () => {
        return [];
      },
    }, // 共享任务类型列表，当前用户可以查看的所有共享任务类型
    handleDatas: { type: Function, default: (datas, fieldSettings) => {} }, // 处理数据列表回调方法
  },
  data() {
    return {
      loading: false,
      queryFields: [
        "procSubject",
        "startUser",
        "startDept",
        "procDefName",
        "assignTimeForArrival",
        "shareType",
      ],
      queryForm: {
        // 查询表单
        procSubject: "", // 任务主题
        startUserId: "", // 发起人
        startDeptId: "", // 发起人部门ID
        procDefName: "", // 流程名称
        startAssignTime: "", // 任务分派开始时间
        endAssignTime: "", // 任务分派结束时间
        shareType: [], // 共享业务类型
        procCategoryId: "", // 流程分类ID
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
    };
  },
  filters: Utils.Filters,
  mounted() {
    // 缓存查询表单值
    this.queryForm = Object.assign(
      this.queryForm,
      this.$refs.queryDialog.getQueryForm()
    );
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
          basicInformation: requestApiBasic,
          parameter: that.queryForm.shareType.join(","),
        };

        // 请求API
        that.$emit("update:taskCount", 0);
        that.$emit("update:taskCountLoading", true);
        // requestApi.countShareTask(requestParams).then(res => {
        //   that.$emit("update:taskCountLoading",  false);
        //   if (res.status == 200 && res.data.code == 200) {
        //     that.$emit("update:taskCount",  res.data.data);
        //   } else {
        //     that.$message.error(res.data.message);
        //   }
        // }).catch((err) => {
        //   that.$emit("update:taskCountLoading",  false);
        // });
      });
    },

    /**
     * 请求API，查询任务列表
     */
    queryTaskList(pageNum, pageSize) {
      let that = this;

      // 更新分页参数
      that.pagination.pageNum = pageNum || that.pagination.pageNum;
      that.pagination.pageSize = pageSize || that.pagination.pageSize;

      that.$emit(
        "requestApi",
        function (
          requestApi,
          requestApiBasic,
          { priority, startTimeOrder, languageType }
        ) {
          // 清空查询显示
          that.data = [];
          that.fieldSettings = [];

          // 若未勾选共享业务类型，隐藏查询表单直接返回
          if (that.queryForm.shareType.length == 0) {
            that.hideQueryForm();
            return;
          }

          // 获取查询参数
          let requestParams = {
            basicInformation: requestApiBasic,
            parameter: Object.assign(
              {
                languageType: languageType, // 语言类型，0-中文，1-英文
                priority: priority, // 优先级，null-默认，0-低，1-中，2-高
                taskOrderBy: startTimeOrder, // 排序方式 0-任务分派时间降序 1-任务分派时间升序
                pageIndex: that.pagination.pageNum,
                pageSize: that.pagination.pageSize,
              },
              that.queryForm,
              { shareType: that.queryForm.shareType.join(",") }
            ),
          };

          // 请求API
          that.loading = true;
          requestApi
            .queryShareTask(requestParams)
            .then((res) => {
              that.loading = false;
              if (res.status == 200 && res.data.code == 200) {
                // 更新前回调处理数据列表方法
                let dataList = res.data.data.page.records;
                let fieldSettings = res.data.data.fieldReturnDtoList;
                if (that.handleDatas instanceof Function) {
                  that.handleDatas(dataList, fieldSettings);
                }

                that.data = dataList; // 更新查询结果
                that.pagination.total = res.data.data.page.total; // 更新分页总数
                that.fieldSettings = fieldSettings; // 更新字段显示设置

                // 隐藏查询表单
                that.hideQueryForm();
              } else {
                that.$message.error(res.data.message);
              }
            })
            .catch((err) => {
              that.loading = false;
            });
        }
      );
    },

    /**
     * 任务操作：查看流程图
     */
    onTaskViewFlowChart(row) {
      this.$emit("viewFlowChart", row);
    },

    /**
     * 任务操作：认领
     */
    onTaskClaim(row) {
      let that = this;

      // 预定义请求API执行的方法
      let requestApiFun = function (requestApi, requestApiBasic) {
        // 获取提交参数
        requestApiBasic.processId = row.procDefId;
        let requestParams = {
          basicInformation: requestApiBasic,
          parameter: {
            taskId: row.id,
          },
        };

        // 请求API
        that.loading = true;
        requestApi
          .claimTask(requestParams)
          .then((res) => {
            that.loading = false;
            if (res.status == 200 && res.data.code == 200) {
              that.$message.success(that.$t("cgnTask.tips.claimTaskSuccess"));
              // 通知任务状态变更，并重新查询任务列表
              that.$emit("taskStatusChange");
              that.queryTaskList();
            } else {
              that.$message.error(res.data.message);
            }
          })
          .catch((err) => {
            that.loading = false;
          });
      };

      // 执行前，询问用户是否确认操作
      that
        .$confirm(
          that.$t("cgnTask.tips.confirmClaimTask"),
          that.$t("cgnCommon.tips"),
          {
            confirmButtonText: that.$t("cgnCommon.confirm"),
            cancelButtonText: that.$t("cgnCommon.cancel"),
            type: "warning",
          }
        )
        .then(() => {
          // 点击确认，则回调执行方法，并传入输入备注
          that.$emit("requestApi", requestApiFun);
        })
        .catch(() => {});
    },
  },
};
</script>

<style lang="less" scoped>
/deep/ .cud-commom-form-style .cud-special-pagination {
  margin-bottom: 0 !important;
}
/deep/ .cud__page {
  margin-top: 10px;
  margin-bottom: 0;
}
// @import "src/assets/css/style";
</style>
