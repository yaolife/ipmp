<template>
  <div class="cud-commom-form-style">
    <div class="cud__scroll--div">
      <el-card>
        <query-form
          :queryFormId="'overhaulRecord'"
          :queryFields="queryFields"
          :loading="loading"
          :showMoreSetting="false"
          labelWidth="120px"
          @resize="initMaxHeight"
          @submit="search"
          ref="queryForm"
          class="cud-commom-form-search"
        >
        </query-form>
      </el-card>
      <el-card>
        <div class="table-toolbar">
          <el-tabs v-model="activeTab" class="record-tabs">
            <el-tab-pane
              :label="$t('lang.overhaul_record')"
              name="record"
            ></el-tab-pane>
            <el-tab-pane
              :label="$t('lang.daily_inspect')"
              name="inspect"
            ></el-tab-pane>
          </el-tabs>
          <div class="table-button">
            <el-button size="small" @click="exportList">{{
              $t("cm.export")
            }}</el-button>
          </div>
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
              type="index"
              :label="$t('cm.no')"
              width="60"
              :index="indexMethod"
            ></el-table-column>
            <el-table-column
              align="center"
              prop="hangerNo"
              :label="$t('lang.hanger_no')"
              min-width="140"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              align="center"
              prop="unitNo"
              :label="$t('lang.unit_no')"
              min-width="90"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              align="center"
              prop="systemNo"
              :label="$t('lang.system_no_short')"
              min-width="90"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              align="center"
              prop="hangerCategory"
              :label="$t('lang.hanger_category')"
              min-width="110"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              align="center"
              prop="hangerType"
              :label="$t('lang.hanger_type')"
              min-width="150"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              align="center"
              prop="defectDesc"
              :label="$t('lang.defect_desc')"
              min-width="160"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              align="center"
              prop="handleMeasure"
              :label="$t('lang.handle_measure')"
              min-width="150"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              align="center"
              prop="islandType"
              :label="$t('lang.island_type')"
              min-width="120"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              align="center"
              prop="overhaulType"
              :label="$t('lang.overhaul_type')"
              min-width="110"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              align="center"
              prop="planNo"
              :label="$t('lang.plan_no')"
              min-width="140"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              align="center"
              prop="overhaulResult"
              :label="$t('lang.overhaul_result')"
              min-width="100"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              align="center"
              prop="overhaulStatus"
              :label="$t('lang.overhaul_status')"
              min-width="100"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              align="center"
              prop="inspector"
              :label="$t('lang.overhaul_inspector')"
              min-width="140"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              align="center"
              prop="recordTime"
              :label="$t('lang.record_time')"
              min-width="170"
              sortable
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
              :label="$t('cm.operate')"
              width="90"
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
      <el-drawer
        :title="$t('lang.overhaul_detail')"
        :visible.sync="detailVisible"
        size="520px"
        append-to-body
      >
        <div class="record-detail" v-if="currentRow && currentRow.id">
          <div class="record-detail-row">
            <label>{{ $t("lang.hanger_no") }}</label>
            <span>{{ currentRow.hangerNo }}</span>
          </div>
          <div class="record-detail-row">
            <label>{{ $t("lang.unit_no") }}</label>
            <span>{{ currentRow.unitNo }}</span>
          </div>
          <div class="record-detail-row">
            <label>{{ $t("lang.system_no") }}</label>
            <span>{{ currentRow.systemNo }}</span>
          </div>
          <div class="record-detail-row">
            <label>{{ $t("lang.hanger_category") }}</label>
            <span>{{ currentRow.hangerCategory }}</span>
          </div>
          <div class="record-detail-row">
            <label>{{ $t("lang.hanger_type") }}</label>
            <span>{{ currentRow.hangerType }}</span>
          </div>
          <div class="record-detail-row">
            <label>{{ $t("lang.island_type") }}</label>
            <span>{{ currentRow.islandType }}</span>
          </div>
          <div class="record-detail-row">
            <label>{{ $t("lang.plan_no") }}</label>
            <span>{{ currentRow.planNo }}</span>
          </div>
          <div class="record-detail-row">
            <label>{{ $t("lang.overhaul_type") }}</label>
            <span>{{ currentRow.overhaulType }}</span>
          </div>
          <div class="record-detail-row">
            <label>{{ $t("lang.overhaul_status") }}</label>
            <span>{{ currentRow.overhaulStatus }}</span>
          </div>
          <div class="record-detail-row">
            <label>{{ $t("lang.overhaul_result") }}</label>
            <span>{{ currentRow.overhaulResult }}</span>
          </div>
          <div class="record-detail-row">
            <label>{{ $t("lang.overhaul_inspector") }}</label>
            <span>{{ currentRow.inspector }}</span>
          </div>
          <div class="record-detail-row">
            <label>{{ $t("lang.factory") }}</label>
            <span>{{ currentRow.factory }}</span>
          </div>
          <div class="record-detail-row">
            <label>{{ $t("lang.record_time") }}</label>
            <span>{{ currentRow.recordTime }}</span>
          </div>
          <div class="record-detail-row">
            <label>{{ $t("lang.update_time") }}</label>
            <span>{{ currentRow.updateTime }}</span>
          </div>
          <div class="record-detail-block">
            <label>{{ $t("lang.defect_desc") }}</label>
            <p>{{ currentRow.defectDesc || "/" }}</p>
          </div>
          <div class="record-detail-block">
            <label>{{ $t("lang.handle_measure") }}</label>
            <p>{{ currentRow.handleMeasure || "/" }}</p>
          </div>
        </div>
      </el-drawer>
    </div>
  </div>
</template>

<script>
import overhaulRecord from "./js/overhaulRecord.js";
export default overhaulRecord;
</script>
<style lang="less" scoped>
.el-card.is-always-shadow {
  margin-left: 15px;
}
/deep/ .el-button--text {
  user-select: unset;
}
/deep/ .el-form-item__label {
  white-space: nowrap;
}
.table-toolbar {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 8px;
}
.table-button {
  text-align: right;
  flex-shrink: 0;
  padding-bottom: 8px;
}
.record-tabs {
  flex: 1;
  min-width: 0;
  /deep/ .el-tabs__header {
    margin: 0;
  }
  /deep/ .el-tabs__content {
    display: none;
  }
  /deep/ .el-tabs__item {
    height: 36px;
    line-height: 36px;
  }
}
.record-detail {
  padding: 0 20px 24px;
}
.record-detail-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
  font-size: 13px;
  line-height: 22px;
  label {
    width: 110px;
    color: #909399;
    flex-shrink: 0;
  }
  span {
    color: #303133;
    word-break: break-all;
  }
}
.record-detail-block {
  margin-top: 16px;
  label {
    display: block;
    margin-bottom: 8px;
    color: #909399;
    font-size: 13px;
  }
  p {
    margin: 0;
    padding: 12px;
    background: #f6f8fa;
    border-radius: 4px;
    color: #303133;
    white-space: pre-wrap;
    word-break: break-all;
    font-size: 13px;
    line-height: 1.6;
  }
}
</style>
