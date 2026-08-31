<template>
  <div class="cud-commom-form-style">
    <div class="cud__scroll--div">
      <el-card>
        <query-form
          :queryFormId="'pipeComponent'"
          :queryFields="queryFields"
          :loading="loading"
          :showMoreSetting="false"
          labelWidth="180px"
          @resize="initMaxHeight"
          @submit="search"
          ref="queryForm"
          class="cud-commom-form-search"
        >
        </query-form>
      </el-card>
      <el-card>
        <div class="table-button">
          <el-button size="small" @click="downloadTemplate">{{
            $t("lang.download_template")
          }}</el-button>
          <el-button size="small" @click="exportList">{{
            $t("cm.export")
          }}</el-button>
          <el-button size="small" @click="triggerImport">{{
            $t("lang.batch_import")
          }}</el-button>
          <input
            ref="importInput"
            type="file"
            accept=".xls,.xlsx,.csv"
            style="display: none"
            @change="onImportFile"
          />
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
              prop="componentType"
              :label="$t('lang.component_type')"
              min-width="120"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              align="center"
              prop="modifyDate"
              :label="$t('lang.update_time')"
              min-width="170"
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
                  @click="viewRow(scope.row)"
                  >{{ $t("lang.detail") }}</el-button
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
