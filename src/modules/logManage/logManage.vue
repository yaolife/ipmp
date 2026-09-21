<template>
  <div class="cud-commom-form-style">
    <div class="cud__scroll--div">
      <el-card>
        <query-form
          :queryFormId="'logManage'"
          :queryFields="queryFields"
          :loading="tableLoading"
          :showMoreSetting="false"
          labelWidth="80px"
          @resize="initMaxHeight"
          @submit="search"
          ref="queryForm"
          class="cud-commom-form-search"
        >
        </query-form>
      </el-card>
      <el-card>
        <el-row
          class="cud__table--list"
          :style="{ height: computedTableHeight + 'px' }"
        >
          <el-table
            :data="tableData"
            ref="multipleSelection"
            @selection-change="handleSelectionChange"
            v-loading="tableLoading"
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
              prop="requestTime"
              label="请求时间"
              width="170"
              show-overflow-tooltip
            ></el-table-column>

            <el-table-column
              align="center"
              prop="callType"
              label="关联系统"
              width="130"
            ></el-table-column>

            <el-table-column
              align="center"
              prop="methodName"
              label="接口名称"
              width="170"
              show-overflow-tooltip
            ></el-table-column>

            <el-table-column
              align="center"
              prop="operTitle"
              label="业务模块"
              width="150"
            ></el-table-column>

            <el-table-column
              align="center"
              prop="logType"
              label="业务类型"
              width="150"
            ></el-table-column>

            <el-table-column
              label="响应状态"
              prop="responseStatus"
              align="center"
              width="80"
            >
              <template slot-scope="scope">
                <el-tag type="success" size="mini"
                        v-if="scope.row.responseStatus === 'SUCCESS'"
                        style="color: green;"
                >成功</el-tag>
                <el-tag type="error" size="mini" style="color: orangered;" v-else>失败</el-tag>
              </template>
            </el-table-column>

            <el-table-column
              label="请求ip"
              prop="requestIp"
              align="center"
              width="150"
            >
              <template slot-scope="scope">
                <span>{{(!scope.row.requestIp?"-":scope.row.requestIp)}} </span>
              </template>
            </el-table-column>

            <el-table-column
              label="入参参数"
              prop="methodArgs"
              align="center"
              show-overflow-tooltip
            />
            <el-table-column
              label="响应消息"
              prop="responseMsg"
              align="center"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <span>{{(!scope.row.responseMsg?"/":scope.row.responseMsg)}} </span>
              </template>
            </el-table-column>

            <el-table-column
              label="响应数据"
              prop="responseData"
              align="center"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <span>{{(!scope.row.responseData?"/":scope.row.responseData)}} </span>
              </template>
            </el-table-column>
            <el-table-column
              label="响应耗时"
              prop="costTime"
              align="center"
              width="100"
            >
              <template slot-scope="scope">
                <span>{{toPercentNumMs(scope.row.costTime)}}</span>
              </template>
            </el-table-column>

            <el-table-column
              align="center"
              prop="operUser"
              label="操作用户"
              width="180"
            ></el-table-column>

<!--            <el-table-column-->
<!--              align="center"-->
<!--              :label="$t('cm.operate')"-->
<!--              width="100"-->
<!--              fixed="right"-->
<!--            >-->
<!--              <template slot-scope="scope">-->
<!--                <el-button-->
<!--                  type="text"-->
<!--                  size="small"-->
<!--                  class="cud-common-operate-edit"-->
<!--                  @click.stop="viewRow(scope.row)"-->
<!--                  >{{ $t("cm.look") }}</el-button-->
<!--                >-->
<!--              </template>-->
<!--            </el-table-column>-->
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
              :current-page="currentNo"
              :page-sizes="[10, 20, 30, 40]"
              :page-size="sizeNo"
              layout="total,sizes, prev, pager, next"
              :pager-count="5"
              :total="total"
              :disabled="tableLoading"
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
/deep/ .el-button--text {
  user-select: unset;
}
/deep/ .el-form-item__label {
  white-space: nowrap;
}
/deep/ .cud-commom-form-search .el-form-item {
  display: flex;
  align-items: center;
  padding-right: 12px;
}
/deep/ .cud-commom-form-search .el-form-item__label {
  width: auto !important;
  float: none;
  padding-right: 8px;
  line-height: 32px;
  flex-shrink: 0;
}
/deep/ .cud-commom-form-search .el-form-item__content {
  margin-left: 0 !important;
  flex: 1;
  float: none;
  min-width: 0;
}
/deep/ .el-card:first-child .el-card__body {
  padding-left: 10px;
  padding-right: 10px;
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
