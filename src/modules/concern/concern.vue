<template>
  <div class="cud-commom-form-style">
    <!-- <div class="brand">
      <breadcrumb :arrayName="brand" :hasIcon="hasIcon"></breadcrumb>
    </div> -->
    <div class="cud__scroll--div">
      <el-card>
        <query-form
          :queryFormId="'concern'"
          :queryFields="queryFields"
          :loading="loading"
          @resize="initMaxHeight"
          @submit="search"
          ref="queryForm"
          class="cud-commom-form-search"
        >
        </query-form>
      </el-card>
      <el-card>
        <div class="table-button">
          <el-button
            size="small"
            @click="batchDel(tableData)"
            :disabled="selectnum == '0'"
            v-loading.fullscreen.lock="fullscreenLoading"
            >{{ $t("workbench.cancel_concern") }}</el-button
          >
        </div>
        <el-row
          class="cud__table--list"
          :style="{ height: computedTableHeight + 'px' }"
        >
          <el-table
            :data="tableData"
            ref="multipleSelection"
            @selection-change="handleSelectionChange"
            v-loading="loading"
            :empty-text="$t('cm.nodata')"
            border
            stripe
            :max-height="computedTableHeight"
            highlight-current-row
            header-row-class-name="cud-office-table-header"
            class="cud-office-table"
          >
            <el-table-column
              align="center"
              type="selection"
              width="55"
            ></el-table-column>
            <el-table-column
              width="70"
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
              prop="procTitle"
              :label="$t('workbench.work_title')"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <el-button
                  size="small"
                  type="text"
                  @click="handleClick(scope.row)"
                  >{{ scope.row.procTitle }}</el-button
                >
              </template>
            </el-table-column>
            <el-table-column
              align="left"
              prop="processName"
              :label="$t('workbench.process_name')"
            ></el-table-column>
            <el-table-column
              align="left"
              prop="actName"
              show-overflow-tooltip
              :label="$t('workbench.act_name')"
            ></el-table-column>
            <el-table-column align="left" :label="$t('workbench.start_user')">
              <template slot-scope="scope">
                [{{ scope.row.startUser }}] {{ scope.row.startCnUserName }}
              </template>
            </el-table-column>
            <el-table-column
              align="left"
              prop="createDate"
              :label="$t('lang.create_date')"
              min-width="170"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                {{ dateGet(scope.row.createDate) }}
              </template>
            </el-table-column>
            <el-table-column
              align="left"
              prop="createUserNo"
              :label="$t('lang.create_user_no')"
              min-width="120"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              align="left"
              prop="createUserName"
              :label="$t('lang.create_user_name')"
              min-width="120"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              align="left"
              prop="modifyDate"
              :label="$t('lang.modify_date')"
              min-width="170"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                {{ dateGet(scope.row.modifyDate) }}
              </template>
            </el-table-column>
            <el-table-column
              align="left"
              prop="modifyUserNo"
              :label="$t('lang.modify_user_no')"
              min-width="120"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              align="left"
              prop="modifyUserName"
              :label="$t('lang.modify_user_name')"
              min-width="120"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              align="left"
              :label="$t('tm.operate')"
              width="100"
              fixed="right"
            >
              <template slot-scope="scope">
                <el-button
                  type="text"
                  size="small"
                  class="cud-common-operate-delete"
                  @click="delClick(scope.row)"
                >
                  {{ $t("cm.delete") }}</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-row>
        <el-row>
          <div class="cud-special-pagination cud-special-pagination-button">
            <el-pagination popper-class="cud-pager-dropdown"
              ref="pager"
              class="cud__page"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="current"
              :page-sizes="[10, 20, 30, 40]"
              :page-size="size"
              :pager-count="5"
              layout="total,sizes, prev, pager, next"
              :total="total"
              :disabled="loading"
            >
            </el-pagination>
          </div>
        </el-row>
      </el-card>
    </div>
    <el-dialog
      class="task-dialog task-submit-dialog body-fullscreen-dialog"
      v-dragMove="{
        DragButton: '.el-dialog__header',
        DragWindow: '.el-dialog',
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
        <span><img src="@/assets/img/flowview.png" class="cud-define-pic"><span class="cud-define-text">{{$t('cgnTask.operate.showFlow')}}</span></span>
        <i class="el-icon-close cud-interdrawer-close" @click="configflowDialogVisible = false"></i>
      </div> -->
      <cgn-bpmn-map
        ref="bpmn"
        v-bind="flowVO"
        @elementEvent="onElementEvent"
        @renderComplete="onRenderComplete"
        v-if="configflowDialogVisible"
      >
      </cgn-bpmn-map>
    </el-dialog>
    <div class="wfCommPersonComponentDialog">
      <el-dialog
        width="60%"
        :visible.sync="showDialog"
        v-if="showDialog"
        custom-class="process-creator-dialog"
        :modal="false"
        :destory-on-close="true"
        :title="$t('wm.principal_config')"
        :close-on-click-modal="false"
        v-dragMove="{
          DragButton: '.el-dialog__header',
          DragWindow: '.el-dialog',
        }"
      >
        <div class="el-dialog-div">
          <wf-comm-person-component
            ref="wfCommPersonComponentId"
            :show-user-group-tab="false"
            :showDynRoleTab="false"
            :showStationTab="false"
            :showOrgTab="false"
            :showUserMultiple="false"
          ></wf-comm-person-component>
        </div>
        <div slot="footer" class="dialog-footer" align="center">
          <el-button size="small" @click="closeCreatorFunc">{{
            $t("cm.cancel")
          }}</el-button>
          <!-- 确定 -->
          <el-button size="small" type="primary" @click="commitCreatorFunc">{{
            $t("cm.confirm")
          }}</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import concern from "./js/concern.js";
export default concern;
</script>
<style lang="less" scoped>
// @import "src/assets/css/style";
.el-dialog {
  overflow: auto;
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
// /deep/ .el-form-item__content {
//   line-height: normal !important;
// }
// /deep/ .el-form--label-top .el-form-item__label{
//   margin-bottom: 10px !important;
// }
/deep/ .el-button--text {
  user-select: unset  // 设置按钮text类型的时候可以复制
}
</style>
