<template>
  <div class="cud-commom-form-style">
    <div class="cud__scroll--div">
      <el-card>
        <query-form
          :queryFormId="'pipeStressAnalysis'"
          :queryFields="queryFields"
          :loading="loading"
          :showMoreSetting="false"
          labelWidth="130px"
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
          <el-button type="primary" size="small" @click="openCreate">{{
            $t("lang.add_stress_analysis")
          }}</el-button>
          <el-button size="small" @click="openImport">{{
            $t("lang.batch_import")
          }}</el-button>
        </div>
        <el-row
          class="cud__table--list"
          :style="{ height: computedTableHeight + 'px' }"
        >
          <el-table
            :data="tableData"
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
              prop="analysisName"
              :label="$t('lang.analysis_name')"
              min-width="180"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              align="center"
              prop="analyst"
              :label="$t('lang.analyst')"
              min-width="110"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              align="center"
              prop="versionNo"
              :label="$t('lang.analysis_version')"
              min-width="90"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              align="center"
              prop="analysisTime"
              :label="$t('lang.analysis_time')"
              min-width="170"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              align="center"
              :label="$t('lang.status')"
              width="110"
            >
              <template slot-scope="scope">
                <el-tag size="small" :type="statusTagType(scope.row.status)">{{
                  statusText(scope.row.status)
                }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column
              align="center"
              :label="$t('cm.operate')"
              width="230"
              fixed="right"
            >
              <template slot-scope="scope">
                <el-button
                  type="text"
                  size="small"
                  class="cud-common-operate-edit"
                  @click="openPreview(scope.row)"
                  >{{ $t("cm.preview") }}</el-button
                >
                <el-button
                  type="text"
                  size="small"
                  class="cud-common-operate-edit"
                  @click="openEdit(scope.row)"
                  >{{ $t("cm.edit") }}</el-button
                >
                <el-button
                  type="text"
                  size="small"
                  class="cud-common-operate-edit"
                  @click="exportRow(scope.row)"
                  >{{ $t("cm.export") }}</el-button
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

    <el-dialog
      :title="
        formMode === 'edit'
          ? $t('lang.edit_stress_analysis')
          : $t('lang.add_stress_analysis')
      "
      :visible.sync="formVisible"
      width="560px"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-form
        ref="stressForm"
        :model="form"
        :rules="formRules"
        label-width="100px"
        size="small"
      >
        <el-form-item :label="$t('lang.analysis_name')" prop="analysisName">
          <el-input v-model.trim="form.analysisName" maxlength="80"></el-input>
        </el-form-item>
        <el-form-item :label="$t('lang.analysis_no')" prop="analysisNo">
          <el-input v-model.trim="form.analysisNo" maxlength="40"></el-input>
        </el-form-item>
        <el-form-item :label="$t('lang.analysis_desc')" prop="description">
          <el-input
            v-model.trim="form.description"
            type="textarea"
            :rows="3"
            maxlength="200"
          ></el-input>
        </el-form-item>
        <el-form-item :label="$t('lang.analyst')" prop="analyst">
          <el-select v-model="form.analyst" filterable style="width: 100%">
            <el-option
              v-for="name in analystOptions"
              :key="name"
              :label="name"
              :value="name"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('lang.analysis_version')" prop="versionNo">
          <el-input v-model.trim="form.versionNo" maxlength="20"></el-input>
        </el-form-item>
        <el-form-item :label="$t('lang.status')" prop="status">
          <el-select v-model="form.status" style="width: 100%">
            <el-option
              :label="$t('lang.status_published')"
              value="published"
            ></el-option>
            <el-option
              :label="$t('lang.status_pending')"
              value="pending"
            ></el-option>
            <el-option :label="$t('lang.status_draft')" value="draft"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button size="small" @click="formVisible = false">{{
          $t("cm.cancel")
        }}</el-button>
        <el-button size="small" type="primary" @click="saveForm">{{
          $t("cm.save")
        }}</el-button>
      </div>
    </el-dialog>

    <el-dialog
      :title="$t('lang.preview_stress_analysis')"
      :visible.sync="previewVisible"
      width="560px"
      append-to-body
    >
      <el-form v-if="previewRow" label-width="100px" size="small">
        <el-form-item :label="$t('lang.analysis_name')">{{
          previewRow.analysisName
        }}</el-form-item>
        <el-form-item :label="$t('lang.analysis_no')">{{
          previewRow.analysisNo
        }}</el-form-item>
        <el-form-item :label="$t('lang.analysis_desc')">{{
          previewRow.description || "-"
        }}</el-form-item>
        <el-form-item :label="$t('lang.analyst')">{{
          previewRow.analyst
        }}</el-form-item>
        <el-form-item :label="$t('lang.analysis_version')">{{
          previewRow.versionNo
        }}</el-form-item>
        <el-form-item :label="$t('lang.analysis_time')">{{
          previewRow.analysisTime
        }}</el-form-item>
        <el-form-item :label="$t('lang.status')">
          <el-tag size="small" :type="statusTagType(previewRow.status)">{{
            statusText(previewRow.status)
          }}</el-tag>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button size="small" @click="previewVisible = false">{{
          $t("cm.close")
        }}</el-button>
      </div>
    </el-dialog>

    <el-dialog
      :title="$t('lang.batch_import')"
      :visible.sync="importVisible"
      width="520px"
      append-to-body
      :close-on-click-modal="false"
    >
      <p class="import-tip">{{ $t("lang.import_stress_tip") }}</p>
      <el-upload
        action="#"
        :auto-upload="false"
        :file-list="importFiles"
        :on-change="onImportChange"
        :on-remove="onImportRemove"
        multiple
      >
        <el-button size="small" type="primary">{{ $t("cm.choose") }}</el-button>
      </el-upload>
      <div slot="footer">
        <el-button size="small" @click="importVisible = false">{{
          $t("cm.cancel")
        }}</el-button>
        <el-button size="small" type="primary" @click="confirmImport">{{
          $t("cm.import")
        }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import pipeStressAnalysis from "./js/pipeStressAnalysis.js";
export default pipeStressAnalysis;
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
.import-tip {
  margin: 0 0 12px;
  color: #606266;
  line-height: 22px;
}
</style>
