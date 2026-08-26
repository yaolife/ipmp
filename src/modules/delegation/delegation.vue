<template>
  <div class="cud-commom-form-style">
    <div class="cud__scroll--div">
      <el-card>
        <query-form
          :queryFormId="'pipeComponent'"
          :queryFields="queryFields"
          :loading="loading"
          :showMoreSetting="false"
          @resize="initMaxHeight"
          @submit="search"
          ref="queryForm"
          class="cud-commom-form-search"
        >
        </query-form>
      </el-card>
      <el-card>
        <div class="table-button">
          <el-button size="small" @click="exportList">{{
            $t("cm.export")
          }}</el-button>
          <el-button type="primary" size="small" @click="triggerImport">{{
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
              prop="code"
              :label="$t('lang.pipe_code')"
              min-width="120"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              align="center"
              prop="pipeName"
              :label="$t('lang.pipe_name')"
              min-width="180"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              align="center"
              prop="type"
              :label="$t('lang.pipe_type')"
              min-width="100"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              align="center"
              prop="owner"
              :label="$t('lang.pipe_owner')"
              min-width="120"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              align="center"
              prop="updateTime"
              :label="$t('lang.update_time')"
              min-width="170"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              align="center"
              prop="status"
              :label="$t('lang.status')"
              width="110"
            >
              <template slot-scope="scope">
                <el-tag
                  v-if="scope.row.status === 'published'"
                  type="success"
                  size="mini"
                  >{{ $t("lang.status_published") }}</el-tag
                >
                <el-tag v-else type="warning" size="mini">{{
                  $t("lang.status_pending")
                }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column
              align="center"
              :label="$t('cm.operate')"
              width="200"
              fixed="right"
            >
              <template slot-scope="scope">
                <el-button
                  type="text"
                  size="small"
                  class="cud-common-operate-edit"
                  @click="viewRow(scope.row)"
                  >{{ $t("cm.look") }}</el-button
                >
                <el-button
                  type="text"
                  size="small"
                  class="cud-common-operate-edit"
                  @click="updateRow(scope.row)"
                  >{{ $t("cm.update") }}</el-button
                >
                <el-dropdown
                  trigger="click"
                  @command="cmd => handleMore(cmd, scope.row)"
                >
                  <el-button type="text" size="small">
                    {{ $t("cm.more") }}<i class="el-icon-arrow-down el-icon--right"></i>
                  </el-button>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item command="edit">{{
                      $t("cm.edit")
                    }}</el-dropdown-item>
                    <el-dropdown-item command="delete">{{
                      $t("cm.delete")
                    }}</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
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
</style>
