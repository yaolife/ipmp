<!--
 * @Author: P628200
 * @Date: 2022-01-22
 * @Description: 任务实例管理
-->
<template>
  <div class="cud-commom-form-style">
    <div class="brand">
      <breadcrumb :arrayName="brandLog" :hasIcon="hasIcon"></breadcrumb>
    </div>
    <div class="cud__scroll--div workflow_task_manage">
      <el-row class="cud-common-bottom-wrap">
        <el-col :span="24">
          <el-card>
            <query-form
              :queryFormId="'proc_instance_manage_log'"
              :queryFields="queryFields"
              :loading="listLoading"
              @resize="initMaxHeight"
              @submit="searchTaskInstList"
              ref="queryForm"
              class="cud-commom-form-search">
            </query-form>
          </el-card>
          <el-card>
            <div class="container">
              <!--↓表单列表-->
              <el-row
                class="cud__table--list"
                :style="{ height: maxRightHeight + 'px' }"
              >
                <el-table
                  :data="processTableData"
                  ref="processTable"
                  :empty-text="$t('cm.nodata')"
                  highlight-current-row
                  border
                  stripe
                  :max-height="computedTableHeight"
                  header-row-class-name="cud-office-table-header"
                  :default-sort="{ prop: 'createDate', order: 'descending' }"
                  class="cud-office-table"
                  v-loading="listLoading"
                >
                  <el-table-column
                    align="left"
                    prop="procTitle"
                    width="200"
                    :label="$t('flow.procTitle')"
                    show-overflow-tooltip
                  />
                  <el-table-column
                    align="left"
                    prop="procName"
                    width="180"
                    show-overflow-tooltip
                    :label="$t('flow.procName')"
                  />
                  <el-table-column
                    align="left"
                    prop="actName"
                    width="120"
                    show-overflow-tooltip
                    :label="$t('flow.actName')"
                  />

                  <!-- <el-table-column
                    align="left"
                    show-overflow-tooltip
                    :label="$t('flow.moduleItem')"
                  >
                    <template slot-scope="scope">
                      <span v-if="scope.row.operationBusiness === 'proc'">{{
                        $t("flow.proc_instance")
                      }}</span>
                      <span v-if="scope.row.operationBusiness === 'task'">{{
                        $t("flow.task_instance")
                      }}</span>
                    </template>
                  </el-table-column> -->

                  <el-table-column
                    align="left"
                    show-overflow-tooltip
                    width="80"
                    :label="$t('flow.procStatus')"
                  >
                    <template slot-scope="scope">
                      <span v-if="scope.row.procStatus === '0'">{{
                        $t("flow.status_run")
                      }}</span>
                      <span v-if="scope.row.procStatus === '1'">{{
                        $t("flow.status_suspend")
                      }}</span>
                      <span v-if="scope.row.procStatus === '2'">{{
                        $t("flow.status_complete")
                      }}</span>
                      <span v-if="scope.row.procStatus === '3'">{{
                        $t("flow.status_abandon")
                      }}</span>
                      <span v-if="scope.row.procStatus === '4'">{{
                        $t("flow.status_terminate")
                      }}</span>
                    </template>
                  </el-table-column>

                  <el-table-column
                    align="left"
                    show-overflow-tooltip
                    width="80"
                    prop="operationTypeName"
                    :label="$t('flow.operationTypeName')"
                  />
                  <!-- <el-table-column align="left" prop="createStaffName" :label="$t('flow.createStaffName')"/> -->
                  <el-table-column
                    align="left"
                    show-overflow-tooltip
                    width="140"
                    prop="modifyBy"
                    :label="$t('flow.operater')"
                  >
                    <template slot-scope="scope">
                      [{{ scope.row.modifyBy }}]{{ scope.row.modifyStaffName }}
                    </template>
                  </el-table-column>
                  <!-- <el-table-column align="left" prop="dataSource" :label="$t('flow.dataSource')"/> -->
                  <!-- <el-table-column align="left" prop="status" :label="$t('flow.status')"/> -->
                  <el-table-column
                    align="left"
                    width="160"
                    :label="$t('flow.operat_time')"
                    prop="createDate"
                    sortable
                  >
                    <!-- <template slot-scope="scope">
                      {{ filters(scope.row.createDate) }}
                    </template> -->
                  </el-table-column>

                  <el-table-column
                    show-overflow-tooltip
                    align="left"
                    prop="operationDetail"
                    :label="$t('flow.operationDetail')"
                  />
                </el-table>
              </el-row>
              <el-row>
                <div class="cud-special-pagination">
                  <el-pagination popper-class="cud-pager-dropdown"
                    ref="pager"
                    class="cud__page"
                    @size-change="changeSize"
                    @current-change="changeCurrentPage"
                    :current-page.sync="tablePage.pageIndex"
                    :page-sizes="[10, 20, 30, 40]"
                    :page-size.sync="tablePage.pageSize"
                    :pager-count="5"
                    layout="total,sizes, prev, pager, next"
                    :total="tablePage.total"
                    :disabled="listLoading"
                  />
                </div>
              </el-row>
            </div>
          </el-card>
        </el-col>
      </el-row>
      <!--操作人弹框-->
      <el-dialog
        width="60%"
        :visible.sync="showOperaterUser"
        custom-class="act-creator-dialog"
        :modal="false"
        :destory-on-close="true"
        :title="$t('cm.choose') + $t('flow.operater')"
        :close-on-click-modal="false"
        v-dragMove="{
          DragButton: '.el-dialog__header',
          DragWindow: '.el-dialog',
        }"
      >
        <div class="el-dialog-div">
          <wf-comm-person-component
            v-if="showOperaterUser"
            ref="operaterUserId"
            :showUserMultiple="false"
            :show-user-group-tab="false"
            :showDynRoleTab="false"
            :showStationTab="false"
            :showOrgTab="false"
            :initUserId="initUserId"
          ></wf-comm-person-component>
        </div>
        <div slot="footer" class="dialog-footer" align="center">
          <!-- 取消 -->
          <el-button size="small" @click="closeOperaterUserDialog">{{
            $t("cm.cancel")
          }}</el-button>
          <!-- 确定 -->
          <el-button size="small" type="primary" @click="commitOperaterUser">{{
            $t("cm.confirm")
          }}</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import instance from "./js/wf_proc_instance_manage_log.js";
export default instance;
</script>

<style lang="less" scoped>
// .workflow_template_manage .el-table .cell {
//   padding: 0;
// }

.el-table .el-tag {
  padding: 0;
  width: 60px;
  text-align: center;
}

.cud_tree {
  max-height: 552px;
}

.cud__table--list {
  margin-top: 0px;
}
/deep/ .el-card__body {
  padding: 20px 15px 0;
}
// /deep/ .orgselect .previewBtn {
//   margin: 0;
//   position: absolute;
//   right: 0;
//   top: -1px !important;
//   border: none;
//   color: #999999 !important;
//   height: 32px !important;
//   background: transparent !important;
// }
</style>
