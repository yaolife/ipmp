<template>
  <el-dialog
    :visible.sync="isShow"
    v-bind="dialogOption"
    class="dialog_Option"
    :before-close="handleClose"
    :close-on-click-modal="false"
  >
    <span slot="title" class="el-dialog__title">
      任务派生
      <el-popover
        placement="top-start"
        width="250"
        trigger="hover"
        content="管理员委托、转办、代理操作记录。"
      >
        <i class="el-icon-question" slot="reference"></i>
      </el-popover>
    </span>
    <el-row style="padding-bottom:.625rem" class="cud-commom-form-style">
      <el-table :data="tableData" style="width: 100%">
        <el-table-column
          align="left"
          prop="procSubject"
          :label="$t('cgnBpmn.field.procSubject')"
          min-width="240"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <el-button type="text" @click="view(scope.row)">{{
              scope.row.procSubject
            }}</el-button>
          </template></el-table-column
        >
        <el-table-column
          align="left"
          label="任务处理人"
          width=""
          min-width="120"
          show-overflow-tooltip
          prop="handlerId"
        >
        </el-table-column>
        <el-table-column
          align="left"
          show-overflow-tooltip
          label="处理动作"
          min-width="80"
        >
          <template slot-scope="scope">
            {{ actionFn(scope.row.taskName) }}
          </template>
        </el-table-column>
        <el-table-column
          align="left"
          prop="notes"
          show-overflow-tooltip
          label="处理意见"
          width="200"
        >
        </el-table-column>
        <el-table-column
          align="left"
          prop="adminId"
          show-overflow-tooltip
          label="操作人"
          min-width="120"
        >
        </el-table-column>
        <el-table-column
          align="left"
          width="160"
          :label="$t('wm.arrival_time')"
        >
          <template slot-scope="scope">
            {{ filters(scope.row.assignTime) }}
          </template>
        </el-table-column>
      </el-table>

      <div class="cud-special-pagination cud-special-pagination-button">
        <el-pagination
          popper-class="cud-pager-dropdown"
          ref="pager"
          class="cud__page float-right"
          :current-page="currentPage"
          :page-sizes="[10, 20, 30, 40]"
          :page-size="pageSize"
          layout="total,sizes, prev, pager, next"
          :pager-count="5"
          :total="total"
          :disabled="listLoading"
        ></el-pagination>
      </div>
    </el-row>
  </el-dialog>
</template>

<script>
import ApiTask from "../../common/ApiTask";
import * as Utils from "@/utils/Utils";
export default {
  props: {
    value: {
      type: Boolean,
      default: false
    },
    isShow: {
      type: Boolean,
      default: false
    },
    updateData: {
      type: Function,
      default: () => {}
    },
    row: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      filters: Utils.Filters.splitTime,
      dialogOption: {
        width: "62.5rem",
        closeOnClickModal: false,
        appendToBody: true
      },
      currentPage: 1,
      pageSize: 10,
      total: 0,
      listLoading: false,
      tableData: []
    };
  },
  watch: {
    isShow(n) {
      this.getData();
    }
  },
  mounted() {},
  methods: {
    getData() {
      ApiTask.procInstAssigneeNameList({
        pageIndex: this.currentPage,
        pageSize: this.pageSize,
        taskId: this.row.id,
        toUserId: this.row.assigneeId
      }).then(res => {
        if (res.data.code === "0") {
          this.row.delegationList.forEach(item => {
            this.row.operationsLogList.push({
              adminId: item.adminId,
              createTime: "",
              delegationId: item.delegationId ? item.delegationId : "",
              handlerId: "",
              id: null,
              notes: item.notes,
              procName: item.delegation ? item.delegation.procName : "",
              procTaskId: "",
              procTaskList: null,
              processMethod: "delegation"
            });
          });
          res.data.records.forEach(_item => {
            Object.assign(_item, {
              procSubject: this.row.procSubject,
              handlerId:
                _item.taskName === "代理任务"
                  ? "[" +
                    _item.toUserIdDelegation +
                    "] " +
                    _item.toUserNameDelegation
                  : "[" +
                    _item.toUserIdTransfer +
                    "] " +
                    _item.toUserNameTransfer
            });
            console.log(
              this.row.operationsLogList,
              "this.row.operationsLogList===="
            );
            if (this.row.operationsLogList.length > 0) {
              let notes;
              this.row.operationsLogList.forEach(item => {
                let handlerIdArr = item.handlerId.split(",");
                handlerIdArr.forEach(_items => {
                  if (
                    _items ===
                    "[" +
                      _item.toUserIdTransfer +
                      "]" +
                      _item.toUserNameTransfer
                  ) {
                    if (
                      item.processMethod === "detegateTask" &&
                      _item.taskName === "委托任务"
                    ) {
                      Object.assign(_item, {
                        adminId: item.adminId,
                        notes: item.notes
                      });
                    } else if (
                      item.processMethod === "transferTask" &&
                      _item.taskName === "转办任务"
                    ) {
                      Object.assign(_item, {
                        adminId: item.adminId,
                        notes: item.notes
                      });
                    }
                  }
                });
                if (
                  item.processMethod === "delegation" &&
                  _item.taskName === "代理任务"
                ) {
                  Object.assign(_item, {
                    adminId:
                      "[" +
                      _item.fromUserIdDelegation +
                      "]" +
                      _item.fromUserNameDelegation,
                    notes: item.notes
                  });
                }
              });
            }
          });
          this.tableData = res.data.records;
          this.total = res.data.total;
        }
      });
    },
    /**
     * 关闭弹窗事件
     */
    handleClose() {
      this.$emit("closeDialog");
    },
    actionFn(action) {
      if (action === "委托任务") {
        return "委托";
      } else if (action === "转办任务") {
        return "转办";
      } else if (action === "代理任务") {
        return "代理";
      }
    },
    view(row) {
      row = this.row;
      let dataInfo = {
        // 流程ID
        procId: row.procId,
        // 流程版本
        procVersion: row.taskExtend01,
        // 流程名
        procName: row.procDefName,
        // 流程实例ID
        procInstId: row.procInstId,
        // 类型 // 1 发起页面 / 2 待办页面 / 3 已办页面 / 4 草稿页面
        procNode: 3,
        // 活动ID
        actId: row.procActId,
        // 活动实例ID
        actInstId: row.procActInstId,
        // 活动名
        actName: row.procActName,
        // 上一操作流程环节id
        sentByProcActId: row.sentByProcActId,
        // 流程模型ID
        procModelId: row.pscModelId,
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
      console.log(dataInfo, "dataInfo");
      sessionStorage.removeItem("procItem");
      sessionStorage.setItem("procItem", JSON.stringify(dataInfo));
      this.handleClose();
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
};
</script>
<style lang="less" scoped>
.search-btn {
  border-radius: 1rem;
}
.dialog_Option {
  /deep/.el-dialog__body {
    min-height: 6.25rem;
  }
  /deep/ .el-form-item__label {
    text-align: right;
    float: left;
    font-size: 0.875rem;
    color: #606266;
    line-height: 2.125rem;
    padding: 0 0.75rem 0 0;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    font-weight: 700;
  }
  /deep/ .el-input--small .el-input__inner {
    height: 2.0625rem;
  }
  .form_warp {
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
  }
  /deep/ .orgselect .previewBtn {
    top: 0.125rem;
  }
}
</style>
