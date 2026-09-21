<template>
  <div class="cud-commom-form-style">
    <div class="brand">
      <breadcrumb :arrayName="brand" :hasIcon="hasIcon"></breadcrumb>
    </div>
    <div class="cud__scroll--div">
      <el-card>
        <query-form
          :queryFormId="'connector_log'"
          :queryFields="queryFields"
          :loading="listLoading"
          @resize="initMaxHeight"
          @submit="logSearch"
          ref="queryForm"
          class="cud-commom-form-search">
        </query-form>
      </el-card>
      <el-card>
        <el-row
          class="cud__table--list"
          :style="{ height: computedTableHeight + 'px' }"
        >
          <!--日志列表-->
          <el-table
            :data="logListData"
            v-loading="listLoading"
            ref="logTable"
            :empty-text="$t('cm.nodata')"
            border
            stripe
            :max-height="computedTableHeight"
            highlight-current-row
            header-row-class-name="cud-office-table-header"
            :default-sort="{ prop: 'startTime', order: 'descending' }"
            class="cud-office-table"
          >
            <el-table-column :label="$t('cm.no')" min-width="50">
              <template slot-scope="scope">
                {{ scope.$index + 1 }}
              </template>
            </el-table-column>
            <el-table-column
              align="left"
              prop="requestUrl"
              :label="$t('sys.request_url')"
              min-width="230"
              :show-overflow-tooltip="true"
            ></el-table-column>
            <el-table-column
              align="left"
              prop="requestType"
              :label="$t('hc.http_action_method')"
              min-width="80"
            >
              <template slot-scope="scope">
                <span v-if="scope.row.requestType === 0">GET</span>
                <span v-if="scope.row.requestType === 1">POST</span>
                <span v-if="scope.row.requestType === 2">PUT</span>
                <span v-if="scope.row.requestType === 3">DELETE</span>
              </template>
            </el-table-column>
            <el-table-column
              align="left"
              prop="interactionType"
              :label="$t('sys.action_type')"
              min-width="80"
            >
              <template slot-scope="scope">
                <span v-if="scope.row.interactionType === '1'">{{
                  $t("hc.http_sync")
                }}</span>
                <span v-if="scope.row.interactionType === '2'">{{
                  $t("hc.http_asyn")
                }}</span>
              </template>
            </el-table-column>
            <el-table-column
              align="left"
              width="160"
              :label="$t('sys.start_time')"
              sortable
              prop="startTime"
            >
              <!-- <template slot-scope="scope">
                {{ filters(scope.row.startTime) }}
              </template> -->
            </el-table-column>

            <!-- <el-table-column align="left" prop="endTime" :label="$t('sys.response_time')" min-width="160">
            </el-table-column> -->
            <el-table-column
              align="left"
              prop="costTime"
              :label="$t('sys.time')"
              min-width="80"
            ></el-table-column>
            <el-table-column
              align="left"
              prop="statusCode"
              :label="$t('sys.status_code')"
              min-width="70"
            >
            </el-table-column>
            <el-table-column
              align="left"
              prop="successFlag"
              :label="$t('cm.state')"
              min-width="60"
            >
              <template slot-scope="scope">
                <span v-if="scope.row.successFlag == '0'">{{
                  $t("cm.success")
                }}</span>
                <span v-if="scope.row.successFlag == '1'">{{
                  $t("cm.fail")
                }}</span>
              </template>
            </el-table-column>
            <el-table-column
              align="left"
              show-overflow-tooltip
              prop="requestUserName"
              :label="$t('sys.request_user')"
              min-width="140"
            >
              <template slot-scope="scope">
                [{{ scope.row.requestUserNo }}]{{ scope.row.requestUserName }}
              </template>
            </el-table-column>
            <el-table-column
              align="left"
              prop="statusCode"
              :label="$t('cm.operate')"
              min-width="60"
            >
              <template slot-scope="scope">
                <el-button
                  type="text"
                  size="small"
                  class="cud-common-operate-edit"
                  @click="getLogDetail(scope.row)"
                >
                  {{ $t("cm.look") }}
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
              @size-change="logPageSizeChange"
              :pager-count="5"
              @current-change="logPageCurrentChange"
              :current-page="logPageCurrent"
              :page-sizes="[10, 20, 30, 40]"
              :page-size="logPageSize"
              layout="total,sizes, prev, pager, next"
              :total="logPageTotal"
              :disabled="listLoading"
            >
            </el-pagination>
          </div>
        </el-row>
      </el-card>
      <!--日志详情-->
      <el-dialog
        :title="$t('sys.detail_log')"
        :visible.sync="detailShow"
        v-loading="detailLoading"
        width="70%"
        v-dragMove="{
          DragButton: '.el-dialog__header',
          DragWindow: '.el-dialog',
        }"
      >
        <div class="detail" style="height: 450px">
          <el-form
            :model="detailData"
            label-position="left"
            label-suffix="："
            label-width="150px"
          >
            <el-row>
              <el-col :span="24">
                <el-form-item :label="$t('hc.http_name')" prop="connectorName">
                  {{ detailData.connectorName }}
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item :label="$t('sys.request_url')" prop="requestUrl">
                  {{ detailData.requestUrl }}
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8">
                <el-form-item
                  :label="$t('hc.http_action_method')"
                  prop="requestType"
                >
                  <span v-if="detailData.requestType === 0">GET</span>
                  <span v-if="detailData.requestType === 1">POST</span>
                  <span v-if="detailData.requestType === 2">PUT</span>
                  <span v-if="detailData.requestType === 3">DELETE</span>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item
                  :label="$t('sys.action_type')"
                  prop="interactionType"
                >
                  <span v-if="detailData.interactionType === '1'">{{
                    $t("hc.http_sync")
                  }}</span>
                  <span v-if="detailData.interactionType === '2'">{{
                    $t("hc.http_asyn")
                  }}</span>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8">
                <el-form-item :label="$t('sys.start_time')" prop="startTime">
                  {{ detailData.startTime }}
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item :label="$t('sys.response_time')" prop="endTime">
                  {{ detailData.endTime }}
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item :label="$t('sys.time')" prop="costTime">
                  {{ detailData.costTime }}
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8">
                <el-form-item :label="$t('sys.status_code')" prop="statusCode">
                  {{ detailData.statusCode }}
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item
                  :label="$t('sys.request_user')"
                  prop="requestUserName"
                >
                  [{{ detailData.requestUserNo }}]{{
                    detailData.requestUserName
                  }}
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item
                  :label="$t('hc.http_param_query')"
                  prop="requestQuery"
                >
                  <div class="word-break">{{ detailData.requestQuery }}</div>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item
                  :label="$t('hc.http_param_body')"
                  prop="requestBody"
                >
                  <div class="word-break">{{ detailData.requestBody }}</div>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item
                  :label="$t('hc.http_param_path')"
                  prop="requestPath"
                >
                  <div class="word-break">{{ detailData.requestPath }}</div>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item
                  :label="$t('hc.http_param_header')"
                  prop="requestHeader"
                >
                  <div class="word-break">{{ detailData.requestHeader }}</div>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item
                  :label="$t('hc.http_param_response')"
                  prop="resultBody"
                >
                  <div class="word-break">{{ detailData.resultBody }}</div>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>
        <div slot="footer" class="dialog-footer" align="center">
          <el-button size="small" type="primary" @click="detailShow = false">
            关闭
          </el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import connectorLog from "./js/connector_log.js";
export default connectorLog;
</script>
<style lang="less" scoped>
.word-break {
  word-wrap: break-word;
}
/deep/.search-collapse-content .cud__search--triangle {
  left: 300px !important;
}
/deep/ .el-card__body {
  padding: 15px 15px 0;
}
/deep/ .el-dialog .el-form-item__content {
  line-height: 40px;
}
</style>
