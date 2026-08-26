<template>
  <div class="cud-commom-form-style">
    <div class="brand">
      <breadcrumb :arrayName="brand" :hasIcon="hasIcon"></breadcrumb>
    </div>
    <div class="cud__scroll--div">
      <el-row class="cud-common-bottom-wrap">
        <el-col
          :span="6"
          class="cud-commom-tree-left"
          :class="{
            'cud-commom-tree-content-hidden': isTreeCollapse,
            'cud-commom-tree-content-show': !isTreeCollapse,
          }"
          :style="isTreeCollapse ? { height: maxRightHeight + 'px' } : {}"
        >
          <el-card>
            <div class="cud__tree--left">
              <div class="cud-common-tree-content">
                <div class="tree-search-box">
                  <el-input
                    v-model="filterText"
                    :placeholder="$t('sys.search_category')"
                    maxlength="32"
                    suffix-icon="el-icon-search"
                    size="small"
                  ></el-input>
                </div>
                <div class="cud-common-tree-title-wrap">
                  <span class="cud-commom-tree-title-text"
                    ><span
                      class="
                        cud3-icon-blue
                        font_family
                        icon-icon_process_classification
                      "
                    ></span
                    >&nbsp;&nbsp;{{ $t("sys.data_category") }}</span
                  >
                  <div class="cud-commom-tree-title-icon-wrap">
                    <div
                      class="cud-commom-tree-title-icon"
                      @click="deleteType"
                    >
                      <span
                        class="
                          cud3-icon-blue
                          font_family
                          icon-icon_common_delete
                        "
                        :title="$t('cm.delete')"
                      ></span>
                    </div>
                    <div
                      class="cud-commom-tree-title-icon"
                      @click="saveType(true)"
                    >
                      <span
                        class="cud3-icon-blue font_family icon-icon_common_edit"
                        :title="$t('cm.edit')"
                      ></span>
                    </div>
                    <div
                      class="cud-commom-tree-title-icon"
                      @click="saveType(false)"
                    >
                      <span
                        class="cud3-icon-blue font_family icon-icon_common_add"
                        :title="$t('cm.add')"
                      ></span>
                    </div>
                  </div>
                </div>

                <div class="cud__mtb-10 ml-20 mr-20" v-loading="treeLoading">
                  <el-tree
                    :data="treeData"
                    class="cud_tree"
                    :props="treeOption"
                    @node-click="treeClick"
                    highlight-current
                    :filter-node-method="filterTreeNode"
                    ref="typeTree"
                    :expand-on-click-node="false"
                    node-key="id"
                    default-expand-all
                    :style="{
                      height: computedTreeHeight + 'px',
                      maxHeight: computedTreeHeight + 'px',
                    }"
                  >
                  </el-tree>
                </div>
              </div>
              <div
                class="cud__tree--expand-trigger"
                :class="{ 'cud__tree--expand-shadow': isTreeCollapse }"
                @click="toggleTreeExpand"
              >
                <i
                  v-if="isTreeCollapse"
                  class="cud3-icon-blue el-icon-caret-right"
                ></i>
                <i v-else class="cud3-icon-blue el-icon-caret-left"></i>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col
          :span="isTreeCollapse ? 23 : 18"
          :class="{ 'cud-all-width-resize': isTreeCollapse }"
        >
          <el-card>
            <query-form
              :queryFormId="'data_log_manage'"
              :queryFields="queryFields"
              :loading="listLoading"
              @resize="initMaxHeight"
              @submit="logSearch"
              ref="queryForm"
              class="cud-commom-form-search">
            </query-form>
          </el-card>
          <el-card>
            <div class="cud__tree--right">
            <el-row class="cud__table--list">
              <el-table
                :data="tableData"
                v-loading="listLoading"
                ref="logTable"
                :empty-text="$t('cm.nodata')"
                :height="computedTableHeight"
                :max-height="computedTableHeight"
                highlight-current-row
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
                <!-- <el-table-column
                  align="left"
                  prop="orderNo"
                  show-overflow-tooltip
                  :label="$t('sys.data_order_no')"
                  min-width="200"
                >
                </el-table-column> -->
                <!-- <el-table-column
                  align="left"
                  prop="categoryCode"
                  show-overflow-tooltip
                  :label="$t('sys.category_code')"
                  min-width="100"
                >
                </el-table-column> -->
                <el-table-column
                  align="left"
                  prop="content"
                  show-overflow-tooltip
                  :label="$t('sys.data_request_content')"
                  min-width="200"
                ></el-table-column>
                <el-table-column
                  align="left"
                  prop="cost"
                  :label="$t('sys.time')"
                  min-width="80"
                ></el-table-column>
                <el-table-column
                  align="left"
                  prop="createUserName"
                  :label="$t('sys.operate_user')"
                  min-width="150"
                ></el-table-column>
                <el-table-column
                  align="left"
                  prop="createDate"
                  :label="$t('sys.operate_time')"
                  min-width="180"
                ></el-table-column>
                <el-table-column
                  align="left"
                  :label="$t('cm.operate')"
                  width="110"
                  fixed="right"
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
              <el-row>
                <div class="cud-special-pagination">
                  <el-pagination popper-class="cud-pager-dropdown"
                    ref="pager"
                    class="cud__page"
                    @size-change="pageSizeChange"
                    @current-change="pageCurrentChange"
                    :current-page="pageCurrent"
                    :page-sizes="[10, 20, 30, 40]"
                    :page-size="pageSize"
                    layout="total,sizes, prev, pager, next"
                    :pager-count="5"
                    :total="pageTotal"
                    :disabled="listLoading"
                  >
                  </el-pagination>
                </div>
              </el-row>
            </el-row>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-dialog
        v-dragMove="{
          DragButton: '.el-dialog__header',
          DragWindow: '.el-dialog',
        }"
        :title="
          typeSaveIsAdd
            ? $t('sys.add_category')
            : $t('sys.modify_category')
        "
        :visible.sync="typeSaveDialogVisible"
        :close-on-click-modal="false"
        width="640px"
        destroy-on-close
        :before-close="saveTypeClose"
      >
        <el-form
          ref="typeSave"
          size="small"
          label-position="top"
          label-suffix="："
          :rules="typeRules"
          :model="typeVo"
          label-width="170px"
        >
          <el-row class="row-css">
            <!--分类编码-->
            <el-col :span="12">
              <el-form-item
                :label="$t('sys.category_code')"
                prop="code"
              >
                <el-input
                  :placeholder="$t('cm.pleaseEnter')"
                  maxlength="32"
                  v-model="typeVo.code"
                  class="form-input"
                >
                </el-input>
              </el-form-item>
            </el-col>
            <!--分类名称-->
            <el-col :span="12">
              <el-form-item
                :label="$t('sys.category_name')"
                prop="name"
              >
                <el-input
                  :placeholder="$t('cm.pleaseEnter')"
                  maxlength="200"
                  v-model="typeVo.name"
                  class="form-input"
                >
                </el-input>
              </el-form-item>
            </el-col>
            <!--父级-->
            <el-col :span="12">
              <el-form-item :label="$t('sys.parent_name')" prop="parentName">
                <el-input
                  :placeholder="$t('cm.pleaseEnter')"
                  disabled
                  v-model="typeVo.parentName"
                  class="form-input"
                >
                </el-input>
              </el-form-item>
            </el-col>
            <!--排序-->
            <el-col :span="12">
              <el-form-item :label="$t('cm.sort')" prop="categoryIndex">
                <el-input
                  :placeholder="$t('cm.pleaseEnter')"
                  maxlength="3"
                  v-model="typeVo.categoryIndex"
                  class="form-input"
                >
                </el-input>
              </el-form-item>
            </el-col>
            <!--描述-->
            <el-col :span="24">
              <el-form-item :label="$t('cm.describe')">
                <el-input
                  :placeholder="$t('cm.pleaseEnter')"
                  v-model="typeVo.categoryDesc"
                  type="textarea"
                  rows="5"
                  maxlength="255"
                  show-word-limit
                  class="form-input"
                >
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer" align="center">
          <el-button size="small" @click="saveTypeClose">
            {{ $t("cm.cancel") }}
          </el-button>
          <el-button
            size="small"
            type="primary"
            v-loading.fullscreen.lock="fullscreenLoading"
            @click="saveTypeSubmit"
          >
            {{ $t("cm.save") }}
          </el-button>
        </div>
      </el-dialog>

      <el-dialog
        v-dragMove="{
          DragButton: '.el-dialog__header',
          DragWindow: '.el-dialog'
        }"
        :title="$t(logDialogTitle)"
        :close-on-click-modal="false"
        :visible.sync="detailDialogVisible"
        width="800px"
      >
        <el-form
          ref="logDetailForm"
          size="small"
          label-suffix="："
          label-position="left"
          :model="logData"
          label-width="120px"
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
            <el-col :span="24" v-if="logData.orderNo">
              <el-form-item
                :label="$t('sys.data_order_no')"
                prop="orderNo"
                v-model="logData.orderNo"
              >
                <el-button
                  type="text"
                  size="small"
                  class="cud-common-operate-edit"
                  @click="handleDetailClick(logData)"
                > {{ logData.orderNo }} </el-button>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item
                :label="$t('sys.data_request_function')"
                prop="method"
                v-model="logData.method"
              >
                <div>{{ logData.method }}</div>
              </el-form-item>
            </el-col>
            <!-- <el-col :span="12">
              <el-form-item
                :label="$t('sys.category_code')"
                prop="categoryCode"
                v-model="logData.categoryCode"
              >
                <div>{{ logData.categoryCode }}</div>
              </el-form-item>
            </el-col> -->
            <el-col :span="12">
              <el-form-item
                :label="$t('sys.data_request_content')"
                prop="content"
                v-model="logData.content"
              >
                <div>{{ logData.content }}</div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                :label="$t('sys.time')"
                prop="cost"
                v-model="logData.cost"
              >
                <div>{{ logData.cost }}</div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                :label="$t('sys.operate_user')"
                prop="createUserName"
                v-model="logData.createUserName"
              >
                <div>{{ logData.createUserName }}</div>
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
            <el-col :span="24">
              <el-table
                :data="logData.tableData"
                row-key="id"
                default-expand-all
                highlight-current-row
                :tree-props="{
                  children: 'children',
                  hasChildren: 'hasChildren'
                }"
                :empty-text="$t('cm.nodata')"
                :max-height="300"
              >
                <el-table-column :label="$t('sys.param_name')">
                  <template slot-scope="scope">
                    <!-- <span v-if="scope.row.option == 'ADD'" style="color: #83C034">{{ scope.row.name }}</span>
                    <span v-else-if="scope.row.option == 'UPDATE'" style="color: #F6AD02">{{ scope.row.name }}</span>
                    <span v-else-if="scope.row.option == 'DELETE'" style="color: #E94848">{{ scope.row.name }}</span>
                    <span v-else>{{ scope.row.name }}</span> -->
                    <span>{{ scope.row.name }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="oldValue"
                  :label="$t('sys.data_data_before')"
                >
                  <template slot-scope="scope">
                    <span>{{ scope.row.oldValue }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="newValue"
                  :label="$t('sys.data_data_after')"
                >
                  <template slot-scope="scope">
                    <span>{{ scope.row.newValue }}</span>
                  </template>
                </el-table-column>
              </el-table>
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
import dataLogManage from "./data_log_manage.js";
export default dataLogManage;
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
/deep/ .el-card.is-always-shadow {
  margin: 15px 22px 15px 0px;
}
/deep/ .cud__scroll--div {
  padding-left: 15px;
}
/deep/.el-table .expanded .cell {
  padding-left: 30px;
}
/deep/.el-table .cell .el-table__indent {
  padding-left: 30px !important;
}
</style>
