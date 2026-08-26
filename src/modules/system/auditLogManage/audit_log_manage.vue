<template>
  <div class="cud-commom-form-style">
    <div class="brand">
      <breadcrumb :arrayName="brand" :hasIcon="hasIcon"></breadcrumb>
    </div>
    <div
      class="cud__scroll--div audit_log_manage cud-cgn-task-center"
      style="margin: 5px 10px 14px"
    >
      <el-tabs
        v-model="activeName"
        @tab-click="handleClick"
        class="dict_tab cgn-task-tabs"
        ref="tabs"
      >
        <el-tab-pane :label="$t('sys.configure')" name="configure">
          <el-card>
            <query-form
              :queryFormId="'audit_log_manage1'"
              :queryFields="queryFields1"
              :loading="configTableLoading"
              @resize="initMaxHeight"
              @submit="search"
              ref="queryForm1"
              class="cud-commom-form-search">
            </query-form>

            <!--表格部分-->
            <el-row
              class="cud__table--list"
              :style="{ height: computedTableHeight + 'px' }"
            >
              <el-table
                :data="auditLogConfigTableData"
                ref="auditLogTable"
                :empty-text="$t('cm.nodata')"
                border
                stripe
                v-loading.body="configTableLoading"
                highlight-current-row
                :max-height="computedTableHeight"
                header-row-class-name="cud-office-table-header"
                class="cud-office-table"
              >
                <el-table-column
                  align="left"
                  show-overflow-tooltip
                  prop="moduleName"
                  width="200"
                  :label="$t('sys.model_name')"
                ></el-table-column>
                <el-table-column
                  align="left"
                  prop="operateType"
                  :label="$t('sys.operate_type')"
                >
                </el-table-column>
                <el-table-column
                  align="left"
                  show-overflow-tooltip
                  prop="operateContent"
                  :label="$t('sys.operate_content')"
                ></el-table-column>
                <el-table-column
                  align="left"
                  prop="createUserName"
                  :label="$t('sys.operate_user')"
                ></el-table-column>
                <el-table-column align="left" :label="$t('sys.operate_time')" prop="createDateTimeStr" sortable>
                  <!-- <template slot-scope="scope">
                    {{ filters(scope.row.createDateTimeStr) }}
                  </template> -->
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
                      @click="viewConfigDetails(scope.row)"
                    >
                      {{ $t("sys.view_detail") }}
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-row>
            <el-row>
              <div class="cud-special-pagination">
                <el-pagination popper-class="cud-pager-dropdown"
                  ref="pager"
                  class="cud__page"
                  @size-change="changeSize"
                  @current-change="changeCurrentPage"
                  @prev-click="prePage"
                  @next-click="nextPage"
                  :current-page.sync="currentPage"
                  :page-sizes="[10, 20, 30, 40]"
                  :page-size.sync="pageSize"
                  :total="total"
                  :pager-count="5"
                  layout="total,sizes, prev, pager, next"
                  :disabled="configTableLoading"
                />
              </div>
            </el-row>
          </el-card>
        </el-tab-pane>
        <el-tab-pane :label="$t('sys.running')" name="running">
          <el-card class="box-shadow">
            <query-form
              :queryFormId="'audit_log_manage2'"
              :queryFields="queryFields2"
              :loading="runTableLoading"
              @resize="initMaxHeight"
              @submit="searchRun"
              ref="queryForm2"
              class="cud-commom-form-search">
            </query-form>

            <!--表格部分-->
            <el-row
              class="cud__table--list"
              :style="{ height: computedTableHeight + 25 + 'px' }"
            >
              <el-table
                :data="auditLogRunTableData"
                ref="auditLogTable"
                :empty-text="$t('cm.nodata')"
                border
                stripe
                v-loading.body="runTableLoading"
                highlight-current-row
                :max-height="computedTableHeight + 25"
                header-row-class-name="cud-office-table-header"
                class="cud-office-table"
                :default-sort="{
                  prop: 'createDateTimeStr',
                  order: 'descending',
                }"
              >
                <el-table-column
                  align="left"
                  prop="workTheme"
                  :label="$t('sys.work_theme')"
                ></el-table-column>
                <el-table-column
                  align="left"
                  prop="procName"
                  :label="$t('sys.proc_name')"
                ></el-table-column>
                <el-table-column
                  align="left"
                  prop="actName"
                  :label="$t('sys.act_name')"
                ></el-table-column>
                <el-table-column
                  align="left"
                  prop="createUserName"
                  :label="$t('sys.operate_user')"
                ></el-table-column>
                <el-table-column
                  align="left"
                  :label="$t('sys.operate_time')"
                  prop="createDateTimeStr"
                  sortable
                >
                  <!-- <template slot-scope="scope">
                    {{ filters(scope.row.createDateTimeStr) }}
                  </template> -->
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
                      @click="viewRunDetails(scope.row)"
                      >{{ $t("sys.view_detail") }}
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-row>
            <el-row>
              <div class="cud-special-pagination">
                <el-pagination popper-class="cud-pager-dropdown"
                  ref="pager"
                  class="cud__page"
                  @size-change="changeSize"
                  @current-change="changeCurrentPage"
                  @prev-click="prePage"
                  @next-click="nextPage"
                  :current-page.sync="currentPage"
                  :page-sizes="[10, 20, 30, 40]"
                  :page-size.sync="pageSize"
                  :total="total"
                  :pager-count="5"
                  layout="total,sizes, prev, pager, next"
                  :disabled="runTableLoading"
                />
              </div>
            </el-row>
          </el-card>
        </el-tab-pane>
      </el-tabs>
      <!--配置弹窗-->
      <el-dialog
        v-dragMove="{
          DragButton: '.el-dialog__header',
          DragWindow: '.el-dialog',
        }"
        class="auditConfigDialog"
        :title="$t('sys.view_detail')"
        :before-close="dialogConfigClose"
        :close-on-click-modal="false"
        :visible.sync="dialogConfigVisible"
        width="640px"
      >
        <el-form
          size="small"
          label-position="top"
          label-suffix="："
          :model="detailConfigData"
          label-width="170px"
        >
          <el-row>
            <el-col :span="12">
              <el-form-item :label="$t('sys.operate_user')" prop="operateUser">
                <div>
                  {{ detailConfigData.operateUser }}
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="$t('sys.operate_time')" prop="operateTime">
                <div>
                  {{ detailConfigData.operateTime }}
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item
                :label="$t('sys.operate_old_data')"
                prop="operateOldData"
              >
                <el-input
                  type="textarea"
                  v-model="detailConfigData.operateOldData"
                  class="form-input"
                  :rows="5"
                  disabled
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item
                :label="$t('sys.operate_new_data')"
                prop="operateNewData"
              >
                <el-input
                  type="textarea"
                  v-model="detailConfigData.operateNewData"
                  class="form-input"
                  :rows="5"
                  disabled
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer" align="center">
          <el-button size="small" @click="dialogConfigClose">{{
            $t("cm.close")
          }}</el-button>
        </div>
      </el-dialog>
      <!--运行弹窗-->
      <el-dialog
        v-dragMove="{
          DragButton: '.el-dialog__header',
          DragWindow: '.el-dialog',
        }"
        :title="$t('sys.view_detail')"
        :before-close="dialogRunClose"
        :close-on-click-modal="false"
        :visible.sync="dialogRunVisible"
        width="640px"
      >
        <el-form
          label-position="top"
          label-suffix="："
          :model="detailRunData"
          label-width="170px"
        >
          <el-row>
            <el-col :span="24">
              <el-form-item :label="$t('sys.operate_old_data')" prop="dataJson">
                <el-input
                  type="textarea"
                  :rows="10"
                  v-model="detailRunData.dataJson"
                  class="form-input"
                  disabled
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer" align="center">
          <el-button size="small" @click="dialogRunClose">{{
            $t("cm.close")
          }}</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import auditLogManage from "./js/audit_log_manage";

export default auditLogManage;
</script>

<style lang="less" scoped>
// @import "src/assets/css/style";

.audit_log_manage .el-table .cell {
  padding: 0;
}

.el-table .el-tag {
  padding: 0;
  width: 60px;
  text-align: center;
}
/deep/ .cud-cgn-task-center .cgn-task-tabs .el-tabs__content {
  padding: 0;
}
/deep/ .pt-30 {
  padding: 10px 10px 5px;
}
/deep/ .el-card.is-always-shadow {
  margin: 15px;
}
/deep/ .el-dialog__body {
  padding: 0 0 0 15px;
}
/deep/ .el-dialog .el-form-item__content {
  line-height: 10px;
}
/deep/ .el-card__body {
  padding: 15px 15px 0;
}
/deep/ .el-tabs__active-bar {
  width: 30px !important;
  left: 52px;
}
</style>
