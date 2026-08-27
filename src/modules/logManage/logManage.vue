<template>
  <div class="cud-commom-form-style">
    <div class="cud__scroll--div">
      <el-card>
        <query-form
          :queryFormId="'logManage'"
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
        <div class="table-toolbar">
          <div class="level-chips">
            <span
              class="level-chip"
              :class="{ active: !activeLevel }"
              @click="filterByLevel('')"
            >
              {{ $t("lang.log_all") }}
              <em>{{ levelCounts.ALL }}</em>
            </span>
            <span
              class="level-chip error"
              :class="{ active: activeLevel === 'ERROR' }"
              @click="filterByLevel('ERROR')"
            >
              {{ $t("lang.log_level_error") }}
              <em>{{ levelCounts.ERROR }}</em>
            </span>
            <span
              class="level-chip warn"
              :class="{ active: activeLevel === 'WARN' }"
              @click="filterByLevel('WARN')"
            >
              {{ $t("lang.log_level_warn") }}
              <em>{{ levelCounts.WARN }}</em>
            </span>
            <span
              class="level-chip info"
              :class="{ active: activeLevel === 'INFO' }"
              @click="filterByLevel('INFO')"
            >
              {{ $t("lang.log_level_info") }}
              <em>{{ levelCounts.INFO }}</em>
            </span>
            <span
              class="level-chip debug"
              :class="{ active: activeLevel === 'DEBUG' }"
              @click="filterByLevel('DEBUG')"
            >
              {{ $t("lang.log_level_debug") }}
              <em>{{ levelCounts.DEBUG }}</em>
            </span>
          </div>
          <div class="table-button">
            <el-button size="small" @click="exportList">{{
              $t("cm.export")
            }}</el-button>
            <el-button type="primary" size="small" @click="refreshList">{{
              $t("cm.refresh")
            }}</el-button>
          </div>
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
            @row-click="viewRow"
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
              prop="time"
              :label="$t('lang.log_time_range')"
              min-width="170"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              align="center"
              prop="level"
              :label="$t('lang.log_level')"
              width="100"
            >
              <template slot-scope="scope">
                <el-tag
                  :type="levelTagType(scope.row.level)"
                  size="mini"
                  effect="dark"
                  >{{ $t("lang.log_level_" + scope.row.level.toLowerCase()) }}</el-tag
                >
              </template>
            </el-table-column>
            <el-table-column
              align="center"
              prop="module"
              :label="$t('lang.log_module')"
              min-width="130"
              show-overflow-tooltip
            >
              <template slot-scope="scope">{{
                moduleLabel(scope.row.module)
              }}</template>
            </el-table-column>
            <el-table-column
              align="center"
              prop="operator"
              :label="$t('lang.log_operator')"
              min-width="100"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              align="center"
              prop="ip"
              :label="$t('lang.log_ip')"
              min-width="130"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              align="center"
              prop="message"
              :label="$t('lang.log_message')"
              min-width="240"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <span class="log-message">{{ scope.row.message }}</span>
              </template>
            </el-table-column>
            <el-table-column
              align="center"
              :label="$t('cm.operate')"
              width="100"
              fixed="right"
            >
              <template slot-scope="scope">
                <el-button
                  type="text"
                  size="small"
                  class="cud-common-operate-edit"
                  @click.stop="viewRow(scope.row)"
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
        :title="$t('lang.log_detail')"
        :visible.sync="detailVisible"
        size="480px"
        append-to-body
      >
        <div class="log-detail" v-if="currentRow && currentRow.id">
          <div class="log-detail-row">
            <label>{{ $t("lang.log_level") }}</label>
            <el-tag :type="levelTagType(currentRow.level)" size="mini" effect="dark">{{
              $t("lang.log_level_" + (currentRow.level || "").toLowerCase())
            }}</el-tag>
          </div>
          <div class="log-detail-row">
            <label>{{ $t("lang.log_time_range") }}</label>
            <span>{{ currentRow.time }}</span>
          </div>
          <div class="log-detail-row">
            <label>{{ $t("lang.log_module") }}</label>
            <span>{{ moduleLabel(currentRow.module) }}</span>
          </div>
          <div class="log-detail-row">
            <label>{{ $t("lang.log_operator") }}</label>
            <span>{{ currentRow.operator }}</span>
          </div>
          <div class="log-detail-row">
            <label>{{ $t("lang.log_ip") }}</label>
            <span>{{ currentRow.ip }}</span>
          </div>
          <div class="log-detail-row">
            <label>{{ $t("lang.log_cost") }}</label>
            <span>{{ currentRow.cost }} ms</span>
          </div>
          <div class="log-detail-row">
            <label>{{ $t("lang.log_trace_id") }}</label>
            <span class="mono">{{ currentRow.traceId }}</span>
          </div>
          <div class="log-detail-row">
            <label>{{ $t("lang.log_request_id") }}</label>
            <span class="mono">{{ currentRow.requestId }}</span>
          </div>
          <div class="log-detail-block">
            <label>{{ $t("lang.log_message") }}</label>
            <p>{{ currentRow.message }}</p>
          </div>
          <div class="log-detail-block">
            <label>{{ $t("lang.log_detail") }}</label>
            <pre>{{ currentRow.detail }}</pre>
          </div>
        </div>
      </el-drawer>
    </div>
  </div>
</template>

<script>
import logManage from "./js/logManage.js";
export default logManage;
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
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.table-button {
  text-align: right;
  flex-shrink: 0;
}
.level-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.level-chip {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 10px;
  border-radius: 14px;
  font-size: 12px;
  color: #606266;
  background: #f4f6f8;
  cursor: pointer;
  user-select: none;
  em {
    font-style: normal;
    margin-left: 6px;
    font-weight: 600;
  }
  &.active {
    color: #fff;
    background: #409eff;
  }
  &.error.active {
    background: #f56c6c;
  }
  &.warn.active {
    background: #e6a23c;
  }
  &.info.active {
    background: #67c23a;
  }
  &.debug.active {
    background: #909399;
  }
}
.log-message {
  color: #303133;
}
.log-detail {
  padding: 0 20px 24px;
}
.log-detail-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 13px;
  label {
    width: 80px;
    color: #909399;
    flex-shrink: 0;
  }
}
.log-detail-block {
  margin-top: 16px;
  label {
    display: block;
    margin-bottom: 8px;
    color: #909399;
    font-size: 13px;
  }
  p,
  pre {
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
.mono {
  font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
}
</style>
