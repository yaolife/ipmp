<template>
  <div class="cud-commom-form-style">
    <div class="cud__scroll--div">
      <el-card>
        <query-form
          :queryFormId="'modelManage'"
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
          <el-button type="primary" size="small" @click="openUpload">{{
            $t("lang.upload_model_file")
          }}</el-button>
          <el-button size="small" @click="batchDownload">{{
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
              prop="modelName"
              :label="$t('lang.model_name')"
              min-width="180"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              align="center"
              prop="createUserName"
              :label="$t('lang.uploader')"
              min-width="110"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              align="center"
              prop="fileFormat"
              :label="$t('lang.file_format')"
              min-width="100"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              align="center"
              prop="versionNo"
              :label="$t('lang.version_no')"
              min-width="90"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              align="center"
              prop="createDate"
              :label="$t('lang.upload_date')"
              min-width="170"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              align="center"
              prop="modifyDate"
              :label="$t('lang.last_update_time')"
              min-width="170"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              align="center"
              :label="$t('lang.enable_status')"
              width="90"
            >
              <template slot-scope="scope">
                <el-switch
                  :value="isEnabled(scope.row.status)"
                  @change="onStatusChange(scope.row, $event)"
                ></el-switch>
              </template>
            </el-table-column>
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
    <upload-model-dialog
      ref="uploadDialog"
      @save="createModel"
    ></upload-model-dialog>
    <edit-model-info-dialog
      ref="editInfoDialog"
      @save="updateModel"
    ></edit-model-info-dialog>
    <model-library-dialog
      ref="libraryDialog"
      @edit-model="openEditModel"
    ></model-library-dialog>
  </div>
</template>

<script>
import modelManage from "./js/modelManage.js";
export default modelManage;
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
