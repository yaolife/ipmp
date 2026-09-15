<template>
  <div class="cud-commom-form-style">
    <div class="cud__scroll--div">
      <el-card>
        <query-form
          :queryFormId="'pipeComponent'"
          :queryFields="queryFields"
          :loading="loading"
          :showMoreSetting="false"
          labelWidth="120px"
          @resize="initMaxHeight"
          @submit="search"
          @reset="search"
          ref="queryForm"
          class="cud-commom-form-search"
        >
        </query-form>
      </el-card>
      <el-card>
        <div class="table-button">
          <el-button size="small" @click="openCreate">{{
            $t("cm.add")
          }}</el-button>
          <el-button size="small" type="primary" @click="batchDownload">{{
            $t("lang.batch_download")
          }}</el-button>
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
            highlight-current-row
            border
            stripe
            :max-height="computedTableHeight"
            header-row-class-name="cud-office-table-header"
            class="cud-office-table"
          >
            <el-table-column
              align="center"
              type="selection"
              width="55"
            ></el-table-column>
            <el-table-column
              align="center"
              type="index"
              :label="$t('cm.no')"
              width="60"
              :index="indexMethod"
            ></el-table-column>
            <el-table-column
              align="center"
              prop="componentName"
              :label="$t('lang.component_name')"
              min-width="180"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              align="center"
              prop="modelFormat"
              :label="$t('lang.model_format')"
              min-width="110"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              align="center"
              prop="modelSize"
              :label="$t('lang.model_size')"
              min-width="110"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              align="center"
              prop="remark"
              :label="$t('lang.remark')"
              min-width="140"
              show-overflow-tooltip
            >
              <template slot-scope="scope">{{
                scope.row.remark || "-"
              }}</template>
            </el-table-column>
            <el-table-column
              align="center"
              prop="createDate"
              :label="$t('lang.upload_date')"
              min-width="170"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              align="center"
              prop="createUserNo"
              :label="$t('lang.upload_user_no')"
              min-width="120"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              align="center"
              prop="createUserName"
              :label="$t('lang.upload_user_name')"
              min-width="120"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              align="center"
              prop="modifyDate"
              :label="$t('lang.modify_date')"
              min-width="170"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              align="center"
              prop="modifyUserNo"
              :label="$t('lang.modify_user_no')"
              min-width="120"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              align="center"
              prop="modifyUserName"
              :label="$t('lang.modify_user_name')"
              min-width="120"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              align="center"
              :label="$t('cm.operate')"
              width="180"
              fixed="right"
            >
              <template slot-scope="scope">
                <el-button
                  type="text"
                  size="small"
                  class="cud-common-operate-edit"
                  @click="editRow(scope.row)"
                  >{{ $t("cm.edit") }}</el-button
                >
                <el-button
                  type="text"
                  size="small"
                  class="cud-common-operate-edit"
                  @click="downloadRow(scope.row)"
                  >{{ $t("cm.download") }}</el-button
                >
                <el-button
                  type="text"
                  size="small"
                  class="cud-common-operate-delete"
                  @click="deleteRow(scope.row)"
                  >{{ $t("cm.delete") }}</el-button
                >
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
              :current-page="current"
              :page-sizes="[10, 20, 30, 40]"
              :page-size="size"
              layout="total,sizes, prev, pager, next"
              :pager-count="5"
              :total="total"
              :disabled="loading"
            >
            </el-pagination>
          </div>
        </el-row>
      </el-card>
    </div>
    <component-form-dialog
      ref="componentFormDialog"
      @save="saveComponent"
    ></component-form-dialog>
    <component-confirm-dialog
      ref="componentConfirmDialog"
      @confirm="onConfirmAction"
    ></component-confirm-dialog>
  </div>
</template>

<script>
import delegation from "./js/delegation.js";
export default delegation;
</script>
<style lang="less" scoped>
.el-card.is-always-shadow {
  margin-left: 15px;
}
/deep/ .el-button--text {
  user-select: unset;
}
.table-button {
  text-align: right;
}
/deep/ .el-form-item__label {
  white-space: nowrap;
}
</style>
