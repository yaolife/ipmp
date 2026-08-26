<template>
  <div ref="tableContainer" class="table-container">
    <div class="cud-commom-form-style">
      <div class="brand">
        <breadcrumb :arrayName="brand" :hasIcon="hasIcon"></breadcrumb>
      </div>
      <div class="cud__scroll--div">
        <!-- 表格全屏的容器 -->
        <el-card>
          <query-form
            :queryFormId="'email_template'"
            :queryFields="queryFields"
            :loading="loading"
            :isFullscreen="!isFullscreen"
            @resize="initMaxHeight"
            @submit="search"
            ref="queryForm"
            class="cud-commom-form-search"
          >
          </query-form>
        </el-card>
        <el-card>
          <div class="cud__tree--right">
            <div
              class="cud__table--list"
              :style="{ height: computedTableHeight + 'px' }"
            >
               <!-- :pageSize="pageSize" -->
              <TableWithToolbar
                :tableData="tableData"
                :columns="columns"
                :loading="loading"
                :computedTableHeight="computedTableHeight"
                :total="total"
                :queryTableId="'email_template_table'"
                isCheckBox
                @select-all="selectAllEvent"
                @select-change="selectChangeEvent"
                @refresh="refresh"
                @handle-size-change="handleSizeChange"
                @handle-current-change="handleCurrentChange"
                @pre-page="prePage"
                @next-page="nextPage"
              >
                <!-- 自定义工具栏内容 -->
                <template #toolbar-tools> </template>

                <!-- 自定义操作按钮 -->
                <template #toolbar-buttons>
                  <el-button
                    type="primary"
                    size="small"
                    @click="addEmailTemplate"
                    v-if="btnShow('email_template_add')"
                  >
                    {{ $t("tm.add") }}
                  </el-button>
                  <el-button
                    style="margin-left: 4px"
                    size="small"
                    @click="batchDel(tableData)"
                    :disabled="selectnum == '0'"
                    v-if="btnShow('email_template_delete')"
                  >
                    {{ $t("tm.delete") }}
                  </el-button>
                </template>

                <!-- 自定义列内容 -->
                <template #operation="{ row }">
                  <el-button
                    @click="editTemplate(row)"
                    type="text"
                    size="small"
                    class="cud-common-operate-edit"
                  >
                    {{ $t("tm.modify") }}
                  </el-button>
                  <el-button
                    @click="delClick(row)"
                    type="text"
                    size="small"
                    class="cud-common-operate-delete"
                  >
                    {{ $t("tm.delete") }}
                  </el-button>
                  <el-dropdown
                    style="line-height: 0; top: -2px"
                    @command="moreCommandHandler"
                    size="small"
                    placement="top"
                    :append-to-body="!isFullscreen"
                    trigger="click"
                  >
                    <span class="el-dropdown-link">
                      {{ $t("cm.more") }}<i class="el-icon-arrow-down"></i>
                    </span>

                    <el-dropdown-menu
                      slot="dropdown"
                      :append-to-body="!isFullscreen"
                    >
                      <el-dropdown-item
                        :command="beforeMoreCommandHandler('showDetails', row)"
                      >
                        <span
                          style="font-size: 14px; margin: 0 2px"
                          class="cud3-icon-blue font_family el-icon-view"
                        ></span>
                        {{ $t("tm.preview") }}
                      </el-dropdown-item>
                      <el-dropdown-item
                        :command="
                          beforeMoreCommandHandler('exportEmailTemplate', row)
                        "
                      >
                        <span
                          style="
                            font-size: 18px;
                            transform: translateY(2px);
                            display: inline-block;
                          "
                          class="
                            cud3-icon-blue
                            font_family
                            icon-icon_more_yinyongxiangqing
                          "
                        ></span>
                        {{ $t("cm.export") }}
                      </el-dropdown-item>
                      <el-dropdown-item
                        :command="beforeMoreCommandHandler('formDetail', row)"
                      >
                        <span
                          style="
                            font-size: 18px;
                            transform: translateY(2px);
                            display: inline-block;
                          "
                          class="
                            cud3-icon-blue
                            font_family
                            icon-icon_more_history
                          "
                        ></span>
                        {{ $t("cm.commonRelatedetail") }}
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </template>
              </TableWithToolbar>
            </div>
          </div>
        </el-card>

        <!-- 引入类似modal的内容 以组件的形式 -->
        <el-dialog
          :title="$t('tm.preview_email_template')"
          v-if="dialogDetails"
          :visible.sync="dialogDetails"
          width="640px"
          :modal-append-to-body="!isFullscreen"
          :append-to-body="!isFullscreen"
          v-dragMove="{
            DragButton: '.el-dialog__header',
            DragWindow: '.el-dialog',
          }"
        >
          <div class="cud__mlr-20 cud__mtb-20">
            <b>{{ $t("tm.id") }}：</b>{{ objeDataToDetails.templateCode }}
          </div>
          <div
            class="cud__mlr-20 cud__mtb-20"
            v-html="htmlUnEscape(objeDataToDetails.templateContent)"
          ></div>
        </el-dialog>
        <div>
          <el-dialog
            class="add_tip"
            v-dragMove="{
              DragButton: '.el-dialog__header',
              DragWindow: '.el-dialog',
            }"
            :title="$t('cm.commonRelatedetail')"
            :modal-append-to-body="!isFullscreen"
            :append-to-body="!isFullscreen"
            :withHeader="false"
            :visible.sync="formDetailDialogVisible"
            :before-close="formDetailDialogHandleClose"
            width="70%"
            height="90%"
            direction="rtl"
            destroy-on-close
            :close-on-press-escape="false"
          >
            <query-form
              :queryFormId="'email_template_2'"
              :queryFields="queryFields2"
              :loading="detailLoading"
              @submit="searchDetails"
              ref="queryForm2"
              class="cud-commom-form-search"
            >
            </query-form>

            <div style="margin-top: 5px">
              <el-row class="cud__table--list">
                <el-col :span="24">
                  <div>
                    <el-table
                      :data="detailData"
                      :empty-text="$t('cm.nodata')"
                      ref="ruleDetailTable"
                      v-loading="detailLoading"
                    >
                      <!-- <el-table-column :label="$t('cm.no')" align="center" type="index" width="70"></el-table-column> -->
                      <el-table-column
                        align="left"
                        show-overflow-tooltip
                        :label="$t('wm.procName')"
                        prop="procName"
                      ></el-table-column>
                      <el-table-column
                        align="left"
                        show-overflow-tooltip
                        :label="$t('flow.actName')"
                        prop="actName"
                      ></el-table-column>
                      <el-table-column
                        align="left"
                        :label="$t('form.version')"
                        prop="procVersion"
                      ></el-table-column>
                      <el-table-column
                        align="left"
                        show-overflow-tooltip
                        :label="$t('cm.describe')"
                        prop="actDesc"
                      ></el-table-column>
                    </el-table>
                  </div>
                </el-col>
                <el-col :span="12">&nbsp;</el-col>
                <div class="cud-special-pagination" style="margin-bottom: 0">
                  <el-pagination
                    popper-class="cud-pager-dropdown"
                    size="small"
                    :total="detailTotal"
                    @current-change="detailChangeCurrentPage"
                    @size-change="detailChangeSize"
                    class="cud__page"
                    layout="total,sizes, prev, pager, next"
                    ref="detailPage"
                    :disabled="detailLoading"
                  >
                  </el-pagination>
                </div>
              </el-row>
            </div>
          </el-dialog>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import email_template from "./js/email_template";
export default email_template;
</script>
<style lang="less" scoped>
/deep/ .el-card__body {
  padding: 15px 15px 0;
}
/deep/ .el-table-column--selection .cell {
  justify-content: center;
}
/deep/ .el-checkbox:last-of-type {
  margin-right: 1px;
}

/deep/.vxe-table--render-default .vxe-body--column:first-child .vxe-cell {
  text-align: center;
}
/deep/.vxe-table--render-default .vxe-header--column:first-child .vxe-cell {
  text-align: center;
}
/deep/.vxe-toolbar {
  padding: 0 0 10px 0;
}
</style>
