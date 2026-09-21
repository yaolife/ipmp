<template>
  <div class="cud-commom-form-style">
    <div class="brand">
      <breadcrumb :arrayName="brand" :hasIcon="hasIcon"></breadcrumb>
    </div>
    <div class="cud__scroll--div performance_log_manage cud-cgn-task-center">
      <el-card>
        <query-form
          :queryFormId="'performance_log_manage'"
          :queryFields="queryFields"
          :loading="tableLoading"
          @resize="initMaxHeight"
          @submit="search"
          ref="queryForm"
          class="cud-commom-form-search">
        </query-form>
      </el-card>
      <el-card>
        <!--表格部分-->
        <el-row
          class="cud__table--list"
          :style="{ height: computedTableHeight + 'px' }"
        >
          <el-table
            :data="performanceLogTableData"
            ref="auditLogTable"
            :empty-text="$t('cm.nodata')"
            border
            stripe
            v-loading.body="tableLoading"
            highlight-current-row
            :max-height="computedTableHeight"
            header-row-class-name="cud-office-table-header"
            class="cud-office-table"
          >
            <el-table-column
              show-overflow-tooltip
              align="left"
              prop="procId"
              width="320"
              :label="$t('sys.proc_id')"
            ></el-table-column>
            <el-table-column
              show-overflow-tooltip
              align="left"
              prop="extendClassName"
              :label="$t('sys.extend_class_name')"
            ></el-table-column>
            <el-table-column
              show-overflow-tooltip
              align="left"
              prop="extendType"
              :label="$t('sys.extend_type')"
            ></el-table-column>
            <el-table-column
              show-overflow-tooltip
              align="left"
              prop="createUserName"
              :label="$t('sys.operate_user')"
            ></el-table-column>
            <el-table-column
              show-overflow-tooltip
              align="left"
              prop="startTime"
              :label="$t('sys.code_start_time')"
            ></el-table-column>
            <el-table-column
              show-overflow-tooltip
              align="left"
              prop="endTime"
              :label="$t('sys.code_end_time')"
            ></el-table-column>
            <el-table-column
              show-overflow-tooltip
              align="left"
              prop="consumingTime"
              width="120"
              :label="$t('sys.consuming_time')"
            ></el-table-column>
            <el-table-column align="left" :label="$t('cm.operate')" width="110">
              <template slot-scope="scope">
                <el-button
                  type="text"
                  size="small"
                  class="cud-common-operate-edit"
                  @click="handleViewDetail(scope.row)"
                >
                  {{ $t("sys.view_detail") }}
                </el-button>
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
              @prev-click="prePage"
              @next-click="nextPage"
              :current-page.sync="currentPage"
              :page-sizes="[10, 20, 30, 40]"
              :page-size.sync="pageSize"
              :total="total"
              :pager-count="5"
              layout="total,sizes, prev, pager, next"
              :disabled="tableLoading"
            />
          </div>
        </el-row>
      </el-card>
      <!-- 查看详情弹窗 -->
      <el-dialog
        v-dragMove="{
          DragButton: '.el-dialog__header',
          DragWindow: '.el-dialog'
        }"
        :title="$t('sys.view_detail')"
        :close-on-click-modal="false"
        :visible.sync="detailDialogVisible"
        width="800px"
      >
        <el-form
          ref="detailForm"
          size="small"
          label-suffix="："
          label-position="left"
          :model="detailData"
          label-width="120px"
          :disabled="true"
        >
          <el-row>
            <el-col :span="24">
              <el-form-item :label="$t('sys.proc_id')" prop="procId">
                <div>{{ detailData.procId }}</div>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item :label="$t('sys.proc_title')" prop="procTitle">
                <div>{{ detailData.procTitle }}</div>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item :label="$t('sys.proc_name')" prop="procName">
                <div>{{ detailData.procName }}</div>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item :label="$t('sys.act_name')" prop="actName">
                <div>{{ detailData.actName }}</div>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item
                :label="$t('sys.extend_class_name')"
                prop="extendClassName"
              >
                <div>{{ detailData.extendClassName }}</div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="$t('sys.extend_type')" prop="extendType">
                <div>{{ getExtendTypeLabel(detailData.extendType) }}</div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                :label="$t('sys.operate_user')"
                prop="createUserName"
              >
                <div>{{ detailData.createUserName }}</div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                :label="$t('sys.code_start_time')"
                prop="startTime" style="white-space: nowrap;"
              >
                <div>{{ detailData.startTime }}</div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="$t('sys.code_end_time')"
               prop="endTime" style="white-space: nowrap;">
                <div>{{ detailData.endTime }}</div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                :label="$t('sys.consuming_time')"
                prop="consumingTime"
              >
                <div>{{ detailData.consumingTime }} ms</div>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item :label="$t('sys.data_json')" 
              prop="detail" style="white-space: nowrap;">
                <el-input
                  type="textarea"
                  v-model="detailData.dataJson"
                  class="form-input"
                  :rows="6"
                  disabled
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer" align="center">
          <el-button size="small" @click="detailDialogVisible = false">{{
            $t("cm.close")
          }}</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import performanceLogManage from "./js/performance_log_manage";

export default performanceLogManage;
</script>

<style lang="less" scoped>
// @import "src/assets/css/style";

.performance_log_manage .el-table .cell {
  padding: 0;
}
/deep/ .cud-cgn-task-center {
  padding: 0;
}
/deep/ .el-card__body {
  padding: 15px 15px 0;
}
</style>
