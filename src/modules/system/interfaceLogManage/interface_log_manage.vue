<template>
  <div class="cud-commom-form-style">
    <div class="brand">
      <breadcrumb :arrayName="brand" :hasIcon="hasIcon"></breadcrumb>
    </div>
    <div class="cud__scroll--div">
      <el-card>
        <query-form
          :queryFormId="'interface_log_manage'"
          :queryFields="queryFields"
          :loading="listLoading"
          @resize="initMaxHeight"
          @submit="logSearch"
          ref="queryForm"
          class="cud-commom-form-search">
        </query-form>
      </el-card>
      <el-card>
        <!-- <el-row class="cud-commom-form-search">
          <div class="search-collapse hight_search">
            <div class="float-left">
              <el-input
                :placeholder="$t('sys.request_url_search')"
                v-model="logQueryModel.requestUrl"
                class="cud-commom-search-ipt el-input-search"
                @keyup.enter.native="search"
              >
                <el-button
                  type="primary"
                  size="small"
                  style="line-height: 18px; border-radius: 5px"
                  slot="append"
                  icon="el-icon-search"
                  @click="logSearch"
                >
                </el-button>
              </el-input>
            </div>
          </div>
          <el-collapse
            class="search-collapse-content"
            @change="advanceSearch"
            accordion
          >
            <el-collapse-item>
              <template slot="title" class="search-collapse-title">
                <span class="title-font"
                  >{{ $t("cm.advance_search") }}
                  <i class="cud3-icon-blue" :class="iconArrow"></i
                ></span>
              </template>
              <div class="cud__search--triangle"></div>
              <el-form
                class="cud__search"
                size="small"
                label-suffix="："
                label-width="110px"
                label-position="top"
              >
                <el-row>
                  <el-col :span="6">
                    <el-form-item
                      :label="$t('sys.request_url')"
                      prop="requestUrl"
                    >
                      <el-input
                        :placeholder="$t('cm.pleaseEnter')"
                        maxlength="256"
                        v-model="logQueryModel.requestUrl"
                      ></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item
                      :label="$t('sys.request_module')"
                      prop="requestModuel"
                    >
                      <el-input
                        :placeholder="$t('cm.pleaseEnter')"
                        maxlength="256"
                        v-model="logQueryModel.requestModuel"
                      ></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item
                      :label="$t('sys.request_function')"
                      prop="requestFunction"
                    >
                      <el-input
                        :placeholder="$t('cm.pleaseEnter')"
                        maxlength="256"
                        v-model="logQueryModel.requestFunction"
                      ></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item
                      :label="$t('sys.request_user')"
                      prop="requestUser"
                    >
                      <el-input
                        :placeholder="$t('cm.pleaseEnter')"
                        maxlength="256"
                        v-model="logQueryModel.requestUser"
                      ></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item
                      :label="$t('sys.action_type')"
                      prop="requestType"
                    >
                      <el-select
                        class="form-input"
                        :placeholder="$t('cm.pselect')"
                        v-model="logQueryModel.requestType"
                      >
                        <el-option
                          v-for="item in interactionTypeOption"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value"
                        ></el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item :label="$t('sys.time')" prop="costTime">
                      <el-input
                        :placeholder="$t('cm.pleaseEnter')"
                        maxlength="256"
                        v-model="logQueryModel.costTime"
                      ></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item :label="$t('sys.status_code')" prop="statusCode">
                      <el-input
                        :placeholder="$t('cm.pleaseEnter')"
                        maxlength="256"
                        v-model="logQueryModel.statusCode"
                      ></el-input>
                    </el-form-item>
                  </el-col>

                  <el-col
                    :span="6"
                    class="cud--right"
                    style="padding-top: 30px; padding-right: 20px"
                  >
                    <el-button type="primary" size="small" @click="logSearch">{{
                      $t("cm.search")
                    }}</el-button>
                    <el-button class="mr-10" size="small" @click="logReset">{{
                      $t("cm.reset")
                    }}</el-button>
                  </el-col>
                </el-row>
              </el-form>
            </el-collapse-item>
          </el-collapse>
        </el-row>
        <el-row class="cud__search--rowhigh">
          <div class="cud__divider"></div>
        </el-row> -->
        <el-row
          class="cud__table--list"
          :style="{ height: computedTableHeight + 'px' }"
        >
          <el-table
            :data="logTableData"
            v-loading="listLoading"
            ref="logTable"
            border
            stripe
            :empty-text="$t('cm.nodata')"
            highlight-current-row
            :max-height="computedTableHeight"
            header-row-class-name="cud-office-table-header"
            class="cud-office-table"
          >
            <el-table-column
              align="left"
              prop="requestUrl"
              show-overflow-tooltip
              :label="$t('sys.request_url')"
              min-width="200"
            >
              <template slot-scope="scope">
                <el-button
                  type="text"
                  size="small"
                  @click="handleClick(scope.row)"
                  :title="scope.row.requestUrl"
                  >{{ scope.row.requestUrl }}</el-button
                >
              </template>
            </el-table-column>
            <el-table-column
              align="left"
              prop="requestModuel"
              show-overflow-tooltip
              :label="$t('sys.request_module')"
              min-width="100"
            >
            </el-table-column>
            <el-table-column
              align="left"
              prop="requestFunction"
              show-overflow-tooltip
              :label="$t('sys.request_function')"
              min-width="150"
            >
            </el-table-column>
            <el-table-column
              align="left"
              prop="requestType"
              :label="$t('sys.action_type')"
              min-width="80"
            >
            </el-table-column>
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
              min-width="80"
            ></el-table-column>
            <!-- <el-table-column
              align="left"
              prop="visitNum"
              :label="$t('sys.visit_num')"
              min-width="80"
            ></el-table-column> -->
            <el-table-column
              align="left"
              prop="requestUser"
              :label="$t('sys.operate_user')"
              min-width="150"
            ></el-table-column>
            <el-table-column
              align="left"
              prop="createDate"
              :label="$t('sys.operate_time')"
              min-width="150"
            ></el-table-column>
            <el-table-column
              align="left"
              :label="$t('cm.operate')"
              width="110"
            >
              <template slot-scope="scope">
                <el-button
                  type="text"
                  size="small"
                  class="cud-common-operate-edit"
                  @click="handleClick(scope.row)"
                >
                  {{ $t("sys.view_detail") }}
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
              @current-change="logPageCurrentChange"
              :current-page="logPageCurrent"
              :page-sizes="[10, 20, 30, 40]"
              :page-size="logPageSize"
              layout="total,sizes, prev, pager, next"
              :pager-count="5"
              :total="logPageTotal"
              :disabled="listLoading"
            >
            </el-pagination>
          </div>
        </el-row>
      </el-card>
      <el-dialog
        v-dragMove="{
          DragButton: '.el-dialog__header',
          DragWindow: '.el-dialog',
        }"
        :title="$t(logDialogTitle)"
        :close-on-click-modal="false"
        :visible.sync="logDetailDialogVisible"
        width="640px"
      >
        <el-form
          ref="logDetailForm"
          size="small"
          label-suffix="："
          label-position="left"
          :model="logData"
          label-width="100px"
          :disabled="true"
        >
          <el-row>
            <el-col :span="24">
              <el-form-item
                :label="$t('sys.request_url')"
                prop="requestUrl"
                v-model="logData.requestUrl"
              >
                <div>{{ logData.requestUrl }}</div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                :label="$t('sys.request_module')"
                prop="reqTraceId"
                v-model="logData.requestModuel"
              >
                <div>{{ logData.requestModuel }}</div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                :label="$t('sys.request_function')"
                prop="requestFunction"
                v-model="logData.requestFunction"
              >
                <div>{{ logData.requestFunction }}</div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                :label="$t('sys.request_type')"
                prop="requestType"
                v-model="logData.requestType"
              >
                <div>{{ logData.requestType }}</div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                :label="$t('sys.status_code')"
                prop="statusCode"
                v-model="logData.statusCode"
              >
                <div>{{ logData.statusCode }}</div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                :label="$t('sys.time')"
                prop="costTime"
                v-model="logData.costTime"
              >
                <div>{{ logData.costTime }}</div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                :label="$t('sys.visit_num')"
                prop="visitNum"
                v-model="logData.visitNum"
              >
                <div>{{ logData.visitNum }}</div>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item
                :label="$t('sys.request_param')"
                prop="requestParam"
                v-model="logData.requestParam"
              >
                <el-input
                  type="textarea"
                  v-model="logData.requestParam"
                  class="form-input"
                  :rows="3"
                  disabled
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24" v-if="logData.resultBody">
              <el-form-item
                :label="$t('sys.result_body')"
                prop="resultBody"
                v-model="logData.resultBody"
              >
                <el-input
                  type="textarea"
                  v-model="logData.resultBody"
                  class="form-input"
                  :rows="5"
                  disabled
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                :label="$t('sys.operate_user')"
                prop="requestUser"
                v-model="logData.requestUser"
              >
                <div>{{ logData.requestUser }}</div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                :label="$t('sys.operate_time')"
                prop="createDate"
                v-model="logData.createDate"
              >
                <div>{{ logData.createDate }}</div>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer" align="center">
          <el-button size="small" @click="logDetailClose">{{
            $t("cm.close")
          }}</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import interfaceLogManage from "./interface_log_manage.js";
export default interfaceLogManage;
</script>
<style lang="less" scoped>
// @import "src/assets/css/style";
/deep/ .el-drawer__body {
  border-top: 4px solid #0069ac;
  position: relative;
  padding-bottom: 80px;
}
.cud__col20 {
  margin-bottom: 2px;
}
/deep/ .el-card__body {
  padding: 15px 15px 0;
}
/deep/ .el-form-item__label {
  // margin-top: -5px;
}
</style>
