<template>
  <div class="cud-commom-form-style">
    <!-- <div class="brand">
      <breadcrumb :arrayName="brand" :hasIcon="hasIcon"></breadcrumb>
    </div> -->
    <div
      class="cud__scroll--div dict_manage cud-cgn-task-center"
      style="margin: 10px 10px 10px 10px"
    >
      <el-tabs
        v-model="activeName"
        @tab-click="handleTabClick"
        class="dict_tab cgn-task-tabs"
        ref="tabs"
      >
        <!--有效代理-->
        <el-tab-pane
          name="delegation1"
          :label="$t('workbench.delegation_vaild')"
          class="cud-task-list"
        >
          <!--有效代理查询条件-->
          <query-form
            :queryFormId="'delegation1'"
            :queryFields="queryFields"
            :loading="loading"
            @resize="initMaxHeight"
            @submit="search(0)"
            ref="queryForm1"
            class="cud-commom-form-search"
          >
          </query-form>
          <div class="table-button">
            <el-button type="primary" size="small" @click="add">{{
              $t("cm.add")
            }}</el-button>
          </div>
          <el-row
            class="cud__table--list"
            :style="{ height: computedTableHeight + 'px' }"
          >
            <!--有效代理列表-->
            <el-table
              :data="tableData"
              ref="multipleSelection"
              v-loading="loading"
              :empty-text="$t('cm.nodata')"
              border
              stripe
              highlight-current-row
              :max-height="computedTableHeight"
              header-row-class-name="cud-office-table-header"
              class="cud-office-table"
            >
              <div style="display: inline-block" v-if="show">
                <el-table-column
                  align="left"
                  prop="delegationId"
                  :label="$t('workbench.procId')"
                  width="55"
                  show-overflow-tooltip
                ></el-table-column>
              </div>
              <el-table-column
                align="left"
                prop="detailSize"
                :label="$t('workbench.process_name')"
                width="300"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  <el-button
                    size="small"
                    type="text"
                    @click="handleClick(scope.row)"
                  >
                    {{ setDetailSize(scope.row.delegationDetail) }}
                  </el-button>
                </template>
              </el-table-column>
              <el-table-column
                align="left"
                prop="description"
                :label="$t('workbench.description')"
                title="description"
                show-overflow-tooltip
              >
              </el-table-column>
              <!--<el-table-column align="left" :label="$t('workbench.delegated_user')">
                <template slot-scope="scope">
                  [{{ scope.row.fromUserId }}] {{ scope.row.fromUserName }}
                </template>
              </el-table-column>-->
              <el-table-column
                align="left"
                :label="$t('workbench.delegation_user')"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  [{{ scope.row.toUserId }}] {{ scope.row.toUserName }}
                </template>
              </el-table-column>
              <el-table-column
                align="left"
                :label="$t('workbench.delegation_date')"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  {{ splitTime(scope.row.startTime) }}
                  {{ $t("pw.to") }}
                  {{ splitTime(scope.row.endTime) }}
                </template>
              </el-table-column>
              <el-table-column
                align="left"
                :label="$t('workbench.date_number')"
                width="130"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  {{ getDateNumber(scope.row.startTime, scope.row.endTime) }}
                </template>
              </el-table-column>
              <el-table-column
                align="left"
                :label="$t('cm.operate')"
                width="180"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  <el-button
                    type="text"
                    size="small"
                    class="cud-common-operate-edit"
                    @click="updateOrCopyClick(scope.row, '2')"
                  >
                    {{ $t("cm.edit") }}
                  </el-button>
                  <el-button
                    type="text"
                    size="small"
                    class="cud-common-operate-edit"
                    @click="updateOrCopyClick(scope.row, '1')"
                  >
                    {{ $t("cm.copy") }}
                  </el-button>
                  <el-button
                    type="text"
                    size="small"
                    class="cud-common-operate-delete"
                    @click="delClick(scope.row)"
                    v-loading.fullscreen.lock="fullscreenLoading"
                  >
                    {{ $t("cm.cancel") }}
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-row>
          <el-row>
            <div class="cud-special-pagination cud-special-pagination-button">
              <el-pagination
                popper-class="cud-pager-dropdown"
                ref="pager"
                class="cud__page"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page.sync="current"
                :page-sizes="[10, 20, 30, 40]"
                :page-size.sync="size"
                :pager-count="5"
                layout="total,sizes, prev, pager, next"
                :total="total"
                :disabled="loading"
              >
              </el-pagination>
            </div>
          </el-row>
        </el-tab-pane>
        <!--无效代理-->
        <el-tab-pane
          name="delegation2"
          :label="$t('workbench.delegation_invaild')"
        >
          <!--无效代理查询条件-->
          <query-form
            :queryFormId="'delegation2'"
            :queryFields="queryFields"
            @resize="initMaxHeight"
            @submit="search(9)"
            ref="queryForm2"
            class="cud-senior-search"
          >
          </query-form>

          <el-row
            class="cud__table--list"
            :style="{ height: computedTableHeight + 'px' }"
          >
            <!--无效代理列表-->
            <el-table
              :data="tableData"
              ref="multipleSelection"
              v-loading="loading"
              :empty-text="$t('cm.nodata')"
              border
              stripe
              highlight-current-row
              :max-height="computedTableHeight"
              header-row-class-name="cud-office-table-header"
              class="cud-office-table"
            >
              <div style="display: inline-block" v-if="show">
                <el-table-column
                  align="left"
                  prop="delegationId"
                  :label="$t('workbench.procId')"
                  width="55"
                ></el-table-column>
              </div>
              <el-table-column
                align="left"
                prop="detailSize"
                :label="$t('workbench.process_name')"
              >
                <template slot-scope="scope">
                  <el-button
                    size="small"
                    type="text"
                    @click="handleClick(scope.row)"
                  >
                    {{ setDetailSize(scope.row.delegationDetail) }}
                  </el-button>
                </template>
              </el-table-column>
              <el-table-column
                align="left"
                prop="description"
                :label="$t('workbench.description')"
              >
              </el-table-column>
              <!-- <el-table-column align="left" :label="$t('workbench.delegated_user')">
                 <template slot-scope="scope">
                   [{{ scope.row.fromUserId }}] {{ scope.row.fromUserName }}
                 </template>
               </el-table-column>-->
              <el-table-column
                align="left"
                :label="$t('workbench.delegation_user')"
              >
                <template slot-scope="scope">
                  [{{ scope.row.toUserId }}] {{ scope.row.toUserName }}
                </template>
              </el-table-column>
              <el-table-column
                align="left"
                :label="$t('workbench.delegation_date')"
              >
                <template slot-scope="scope">
                  {{ splitTime(scope.row.startTime) }}
                  {{ $t("pw.to") }}
                  {{ splitTime(scope.row.endTime) }}
                </template>
              </el-table-column>
              <el-table-column
                align="left"
                :label="$t('workbench.date_number')"
                width="130"
              >
                <template slot-scope="scope">
                  {{ getDateNumber(scope.row.startTime, scope.row.endTime) }}
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
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page.sync="current"
                :page-sizes="[10, 20, 30, 40]"
                :page-size.sync="size"
                :pager-count="5"
                layout="total,sizes, prev, pager, next"
                :total="total"
              >
              </el-pagination>
            </div>
          </el-row>
        </el-tab-pane>
      </el-tabs>
    </div>

    <div>
      <!--新增/编辑弹框页面-->
      <el-dialog
        :title="titleType"
        :before-close="configFlowDialogHandleClose"
        :close-on-click-modal="false"
        v-dragMove="{
          DragButton: '.el-dialog__header',
          DragWindow: '.el-dialog'
        }"
        :visible.sync="configflowDialogVisible"
        width="750px"
      >
        <el-form
          ref="itemForm"
          size="small"
          label-position="top"
          label-suffix="："
          :rules="flowRules"
          :model="flowVO"
          label-width="170px"
        >
          <el-row>
            <el-col :span="12">
              <el-form-item
                :label="$t('workbench.delegation_date')"
                prop="delegationDate"
              >
                <el-date-picker
                  v-model="flowVO.delegationDate"
                  type="daterange"
                  value-format="yyyy-MM-dd"
                  unlink-panels
                  :range-separator="$t('pw.to')"
                  :start-placeholder="$t('workbench.begin_delegation_date')"
                  :end-placeholder="$t('workbench.end_delegation_date')"
                >
                </el-date-picker>
              </el-form-item>
            </el-col>
            <!-- <el-col :span="12">
              <el-form-item
                :label="$t('workbench.to_authorization')"
                prop="authorization"
              >
                <el-radio-group v-model="flowVO.authorization">
                  <el-radio :label="0">{{ $t("cm.true") }}</el-radio>
                  <el-radio :label="1">{{ $t("cm.false") }}</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col> -->
            <el-col :span="12">
              <el-form-item
                :label="$t('workbench.delegation_user')"
                prop="toUserId1"
                v-if="saveIsAdd === '1'"
              >
                <el-input
                  ref="personSelect"
                  v-model="flowVO.showFromUser"
                  :placeholder="$t('el.select.placeholder')"
                  name="personSelect"
                  id="fromUserIdvalue"
                  :disabled="true"
                >
                  <el-button
                    size="small"
                    type="primary"
                    class="el-button--half"
                    slot="append"
                    icon="el-icon-plus"
                    @click="openCreatorFunc('add', true)"
                  ></el-button>
                </el-input>
              </el-form-item>
              <el-form-item
                :label="$t('workbench.delegation_user')"
                prop="toUserId1"
                v-if="saveIsAdd !== '1'"
              >
                <el-input
                  v-model="flowVO.showFromUser"
                  v-show="false"
                ></el-input>
                <el-tag>[{{ flowVO.toUserId }}] {{ flowVO.toUserName }}</el-tag>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12" v-if="saveIsAdd === '1'">
              <el-form-item :label="$t('workbench.near_user')">
                <el-tag
                  v-for="item in flowVO.nearUser"
                  :key="item.userID"
                  @click="clickUser(item)"
                  style="cursor: pointer"
                >
                  [{{ item.userID }}]{{ item.userName }}
                </el-tag>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item
                :label="$t('workbench.process_name')"
                prop="procCheck"
              >
                <el-radio-group
                  v-model="flowVO.delegateScope"
                  @change="procCheckClick"
                >
                  <el-radio :label="0">{{
                    $t("workbench.all_process")
                  }}</el-radio>
                  <el-radio :label="1">{{
                    $t("workbench.part_process")
                  }}</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col
              :span="12"
              class="cud__col20"
              v-if="flowVO.delegateScope == 1"
            >
              <el-form-item
                :label="$t('workbench.process_name')"
                prop="procCheckBoxSelect"
              >
                <wf-checkbox-select
                  v-model="flowVO.procCheckBoxSelect"
                  :initValue="initProcName"
                  @callback="processCheckCallback"
                  :checkedPressList="checkedPressList"
                ></wf-checkbox-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item
                :label="$t('workbench.description')"
                prop="description"
              >
                <el-input
                  v-model="flowVO.description"
                  type="textarea"
                  :row="3"
                  maxlength="500"
                  @blur="trimDescription()"
                  show-word-limit
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer" align="center">
          <!-- 取消 -->
          <el-button size="small" @click="configFlowDialogHandleClose">{{
            $t("cm.cancel")
          }}</el-button>
          <!-- 提交 -->
          <el-button
            size="small"
            type="primary"
            @click="save"
            v-loading.fullscreen.lock="fullscreenLoading"
            >{{ $t("cm.commit") }}</el-button
          >
        </div>
      </el-dialog>
    </div>
    <!--    <proc-tree ref="procTree" @getData="getData"></proc-tree>-->
    <!--流程展示-->
    <wf-checkbox-show
      v-model="checkedPressShowList"
      :checkedPressList="checkedPressShowList"
      :showFlag="showFlag"
      @closeChildDialog="closeChildDialog"
    ></wf-checkbox-show>
    <div class="wfCommPersonComponentDialog">
      <el-dialog
        width="60%"
        :visible.sync="showDialog"
        v-if="showDialog"
        custom-class="process-creator-dialog"
        :modal="false"
        v-dragMove="{
          DragButton: '.el-dialog__header',
          DragWindow: '.el-dialog'
        }"
        :destory-on-close="true"
        :title="$t('cm.choose') + $t(selectUserTitle)"
        :close-on-click-modal="false"
      >
        <div class="el-dialog-div">
          <wf-comm-person-component
            ref="wfCommPersonComponentId"
            :show-user-group-tab="false"
            :showDynRoleTab="false"
            :showStationTab="false"
            :showOrgTab="false"
            :showUserMultiple="showUserMultiple"
            :initUserId="initUserId"
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
import delegation from "./js/delegation.js";
export default delegation;
</script>
<style lang="less" scoped>
.cud-cgn-task-center {
  margin-top: 0px;
}

.dict_manage .el-table .cell {
  padding: 0;
}

.el-table .el-tag {
  padding: 0;
  width: 60px;
  text-align: center;
}

.cud-cm-config-left {
  margin-top: 40px;
}
/deep/ .cud-cgn-task-center .cgn-task-tabs .el-tabs__content {
  padding: 12px 15px 0;
}
/deep/ .el-tabs__active-bar {
  width: 30px !important;
  left: 52px;
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
