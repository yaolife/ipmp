<!--
 * @Author: P628200
 * @Date: 2022-01-22
 * @Description: 任务实例管理
-->
<template>
  <div class="cud-commom-form-style">
    <div class="brand">
      <breadcrumb :arrayName="brand" :hasIcon="hasIcon"></breadcrumb>
    </div>
    <div class="cud__scroll--div workflow_task_manage">
      <el-card>
        <query-form
          :queryFormId="'proc_instance_manage'"
          :queryFields="queryFields"
          :loading="listLoading"
          @resize="initMaxHeight"
          @submit="searchTaskInstList"
          ref="queryForm"
          class="cud-commom-form-search"
        >
        </query-form>
      </el-card>
      <el-card>
        <div class="cud__tree--right">
          <!--表单列表-->
          <el-row
            class="cud__table--list"
            :style="{ height: computedTableHeight + 'px' }"
          >
            <el-table
              :data="processTableData"
              ref="processTable"
              :empty-text="$t('cm.nodata')"
              border
              stripe
              highlight-current-row
              :max-height="computedTableHeight"
              header-row-class-name="cud-office-table-header"
              class="cud-office-table"
              v-loading="listLoading"
              :default-sort="{ prop: 'createTime', order: 'descending' }"
            >
              <!-- <el-table-column align="left" type="index" :label="$t('cm.no')" width="80"/> -->
              <!-- 流程图 -->
              <el-table-column
                width="80"
                align="center"
                :label="$t('pw.proc_pic')"
              >
                <template slot-scope="scope">
                  <div
                    class="cud-table-process-border"
                    @click="showFlow(scope.row)"
                  >
                    <span
                      class="
                        cud3-icon-blue
                        font_family
                        icon-icon_workplace_flowchart
                      "
                    ></span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                align="left"
                show-overflow-tooltip
                :label="$t('wm.procSubject')"
              >
                <template slot-scope="scope">
                  <el-button type="text" @click="view(scope.row)">{{
                    scope.row.procSubject
                  }}</el-button>
                </template></el-table-column
              >
              <el-table-column
                align="left"
                prop="procName"
                show-overflow-tooltip
                :label="$t('wm.procName')"
              />
              <el-table-column
                align="left"
                width="150"
                :label="$t('wm.start_user')"
              >
                <template slot-scope="scope">
                  [{{ scope.row.startUserId }}] {{ scope.row.startUserName }}
                </template>
              </el-table-column>
              <el-table-column
                align="left"
                width="160"
                :label="$t('wm.start_time')"
                prop="createTime"
                sortable
              >
                <!-- <template slot-scope="scope">
                  {{ filters(scope.row.createTime) }}
                </template> -->
              </el-table-column>

              <el-table-column align="left" :label="$t('cm.state')" width="65">
                <template slot-scope="scope">
                  <span v-if="scope.row.status === 0">{{
                    $t("flow.status_run")
                  }}</span>
                  <span v-if="scope.row.status === 1">{{
                    $t("flow.status_suspend")
                  }}</span>
                  <span v-if="scope.row.status === 2">{{
                    $t("flow.status_complete")
                  }}</span>
                  <span v-if="scope.row.status === 3">{{
                    $t("flow.status_abandon")
                  }}</span>

                  <span v-if="scope.row.status === 4">{{
                    $t("flow.status_terminate")
                  }}</span>
                </template>
              </el-table-column>

              <el-table-column
                align="left"
                :label="$t('cm.operate')"
                width="150"
              >
                <template slot-scope="scope">
                  <el-button
                    type="text"
                    size="small"
                    class="cud-common-operate-edit"
                    @click="procInstUpdate(scope.row)"
                  >
                    {{ $t("cm.edit") }}
                  </el-button>
                  <el-button
                    type="text"
                    size="small"
                    v-show="scope.row.status === 0"
                    class="cud-common-operate-edit"
                    @click="procInstHangup(scope.row)"
                  >
                    {{ $t("wm.hangup") }}
                  </el-button>
                  <el-button
                    type="text"
                    size="small"
                    v-show="scope.row.status === 1"
                    class="cud-common-operate-edit"
                    @click="procInstRecover(scope.row)"
                  >
                    {{ $t("wm.recover") }}
                  </el-button>

                  <el-button
                    v-if="scope.row.status === 4"
                    type="text"
                    size="small"
                    class="cud-common-operate-edit"
                    @click="procInstActive(scope.row)"
                  >
                    {{ $t("wm.active") }}
                  </el-button>
                  <el-button
                    v-if="
                      !(
                        scope.row.status !== 3 &&
                        scope.row.status !== 2 &&
                        scope.row.status !== 1 &&
                        scope.row.status !== 4
                      )
                    "
                    type="text"
                    size="small"
                    class="cud-common-operate-delete"
                    @click="deleteProcess(scope.row)"
                    >删除
                  </el-button>

                  <el-dropdown
                    @command="moreCommandHandler"
                    trigger="click"
                    v-show="
                      scope.row.status !== 3 &&
                        scope.row.status !== 2 &&
                        scope.row.status !== 1 &&
                        scope.row.status !== 4
                    "
                    size="small"
                    placement="top"
                  >
                    <span class="el-dropdown-link"
                      >{{ $t("cm.more") }}<i class="el-icon-arrow-down"></i>
                    </span>
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item
                        v-show="scope.row.status === 0"
                        :command="
                          beforeMoreCommandHandler('abandon', scope.row)
                        "
                      >
                        {{ $t("wm.abandon") }}
                      </el-dropdown-item>
                      <el-dropdown-item
                        v-show="
                          scope.row.status !== 1 &&
                            scope.row.status !== 3 &&
                            scope.row.status !== 4
                        "
                        :command="
                          beforeMoreCommandHandler('terminate', scope.row)
                        "
                      >
                        {{ $t("wm.terminate") }}
                      </el-dropdown-item>
                      <el-dropdown-item
                        :command="
                          beforeMoreCommandHandler('deleteProcess', scope.row)
                        "
                        >删除
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </template>
              </el-table-column>
            </el-table>
          </el-row>
          <el-row>
            <div class="cud-special-pagination">
              <el-pagination
                popper-class="cud-pager-dropdown"
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
    </div>

    <div>
      <!--弹框-作废-->
      <el-dialog
        :title="$t('flow.abandon')"
        append-to-body
        v-dragMove="{
          DragButton: '.el-dialog__header',
          DragWindow: '.el-dialog'
        }"
        :withHeader="false"
        :visible.sync="entityDialogVisible"
        :before-close="entityDialogHandleClose"
        width="640px"
        height="70%"
        direction="rtl"
        destroy-on-close
        :close-on-press-escape="false"
      >
        <el-form
          label-width="170px"
          size="small"
          label-position="top"
          label-suffix=":"
          ref="ruleForm"
          :rules="rules"
          :model="model"
        >
          <el-row type="flex" class="cud-senior-search">
            <el-col :span="24">
              <el-form-item :label="$t('wm.abandon_reason')" prop="comment">
                <el-input
                  rows="5"
                  maxlength="50"
                  :placeholder="$t('cm.pleaseEnter')"
                  class="form-input"
                  type="textarea"
                  show-word-limit
                  v-model="model.comment"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer" align="center">
          <el-button size="small" @click="cancel">{{
            $t("cm.cancel")
          }}</el-button>
          <el-button size="small" type="primary" @click="procInstAbandon()">{{
            $t("cm.commit")
          }}</el-button>
        </div>
      </el-dialog>
      <el-dialog
        class="task-dialog task-submit-dialog body-fullscreen-dialog"
        v-dragMove="{
          DragButton: '.el-dialog__header',
          DragWindow: '.el-dialog'
        }"
        :title="$t('cgnTask.operate.viewFlowChart')"
        append-to-body
        :withHeader="false"
        :visible.sync="configflowDialogVisible"
        :fullscreen="true"
        direction="rtl"
        destroy-on-close
        :close-on-press-escape="false"
        :wrapperClosable="false"
      >
        <!-- <div class="cud-inter-define-title">
          <span><img src="@/assets/img/flowview.png" class="cud-define-pic"><span class="cud-define-text">{{$t('workbench.show_flow')}}</span></span>
          <i class="el-icon-close cud-interdrawer-close" @click="configflowDialogVisible= false"></i>
        </div> -->
        <!-- 查看流程图模式 -->
        <cgn-bpmn-map
          ref="bpmn"
          v-bind="flowVO"
          @elementEvent="onElementEvent"
          @renderComplete="onRenderComplete"
          v-if="configflowDialogVisible"
        >
        </cgn-bpmn-map>
      </el-dialog>
      <el-dialog
        width="60%"
        :visible.sync="showStartUser"
        custom-class="act-creator-dialog"
        :modal="false"
        :destory-on-close="true"
        :title="$t('cm.choose') + $t('wm.start_user')"
        :close-on-click-modal="false"
        v-dragMove="{
          DragButton: '.el-dialog__header',
          DragWindow: '.el-dialog'
        }"
      >
        <div class="el-dialog-div">
          <wf-comm-person-component
            v-if="showStartUser"
            ref="startUserId"
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
          <el-button size="small" @click="closeStartUserDialog">{{
            $t("cm.cancel")
          }}</el-button>
          <!-- 确定 -->
          <el-button size="small" type="primary" @click="commitStartUser">{{
            $t("cm.confirm")
          }}</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import instance from "./js/wf_proc_instance_manage.js";
export default instance;
</script>

<style lang="less" scoped>
// @import "src/assets/css/style";

.workflow_template_manage .el-table .cell {
  padding: 0;
}

.el-table .el-tag {
  padding: 0;
  width: 60px;
  text-align: center;
}

.cud_tree {
  max-height: 552px;
}
/deep/ .pt-23 {
  padding-top: 33px;
}
/deep/ .el-card__body {
  padding: 15px 15px 0;
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
