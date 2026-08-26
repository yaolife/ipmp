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
                    v-model="paramTypeFilterText"
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
                    >&nbsp;&nbsp;{{ $t("sys.param_category") }}</span
                  >
                  <div class="cud-commom-tree-title-icon-wrap">
                    <div
                      class="cud-commom-tree-title-icon"
                      @click="deleteParamType"
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
                      @click="saveParamType(true)"
                    >
                      <span
                        class="cud3-icon-blue font_family icon-icon_common_edit"
                        :title="$t('cm.edit')"
                      ></span>
                    </div>
                    <div
                      class="cud-commom-tree-title-icon"
                      @click="saveParamType(false)"
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
                    :data="paramTypeTreeData"
                    class="cud_tree"
                    :props="paramTypeTreeOption"
                    @node-click="paramTypeTreeNodeClick"
                    highlight-current
                    :filter-node-method="filterParamTypeTreeNode"
                    ref="paramTypeTree"
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
            <div class="cud__tree--right">
              <query-form
                :queryFormId="'global_param_manage'"
                :queryFields="queryFields"
                :loading="listLoading"
                @resize="initMaxHeight"
                @submit="searchParam"
                ref="queryForm"
                class="cud-commom-form-search">
              </query-form>
              <div class="table-button">
                <el-button
                  type="primary"
                  size="small"
                  @click="saveParam"
                  v-if="btnShow('global_param_add')"
                  >{{ $t("cm.add") }}</el-button
                >
              </div>
              <el-row
                class="cud__table--list"
                :style="{ height: maxRightHeight + 'px' }"
              >
                <el-table
                  :data="globalParamTableData"
                  ref="paramTable"
                  @selection-change="selectChange"
                  v-loading="listLoading"
                  border
                  stripe
                  :max-height="computedTableHeight"
                  :empty-text="$t('cm.nodata')"
                  highlight-current-row
                  header-row-class-name="cud-office-table-header"
                  class="cud-office-table"
                >
                  <!-- <el-table-column align="center" type="index" :label="$t('cm.no')" width="55"></el-table-column> -->
                  <el-table-column
                    align="left"
                    prop="paramCode"
                    :label="$t('sys.param_item_code')"
                    width="220"
                  ></el-table-column>
                  <el-table-column
                    align="left"
                    prop="paramName"
                    min-width="150"
                    :label="$t('sys.param_item_name')"
                  >
                  </el-table-column>
                  <el-table-column
                    align="left"
                    prop="paramType"
                    :label="$t('sys.type')"
                    width="120"
                  >
                    <template slot-scope="scope">
                      <span v-if="scope.row.paramType === 0">{{
                        $t("sys.system_level")
                      }}</span>
                      <span v-if="scope.row.paramType === 1">{{
                        $t("sys.user_defined")
                      }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column
                    align="left"
                    prop="paramValue"
                    :label="$t('sys.parameter_value')"
                    width="120"
                  >
                    <template slot-scope="scope">
                      <span v-if="scope.row.paramValue === '0'">{{
                        $t("cm.false")
                      }}</span>
                      <span v-if="scope.row.paramValue === '1'">{{
                        $t("cm.true")
                      }}</span>
                    </template>
                  </el-table-column>
                  <!-- <el-table-column align="left" prop="paramComment" :label="$t('cm.describe')"></el-table-column> -->
                  <el-table-column
                    align="left"
                    show-overflow-tooltip
                    prop="paramComment"
                    label="描述"
                  ></el-table-column>
                  <el-table-column
                    align="left"
                    prop="paramOrder"
                    :label="$t('cm.sort')"
                    width="70"
                  ></el-table-column>
                  <el-table-column
                    align="left"
                    :label="$t('cm.operate')"
                    width="150"
                  >
                    <template slot-scope="scope">
                      <el-button
                        type="text"
                        size="small"
                        class="cud-common-operate-edit"
                        @click="saveParam(scope.row)"
                        v-if="btnShow('global_param_edit')"
                      >
                        {{ $t("cm.edit") }}</el-button
                      >
                      <el-button
                        type="text"
                        size="small"
                        class="cud-common-operate-delete"
                        :disabled="scope.row.paramType === 0"
                        @click="deleteParam(scope.row.paramId)"
                        v-if="btnShow('global_param_delete')"
                      >
                        {{ $t("cm.delete") }}</el-button
                      >
                    </template>
                  </el-table-column>
                </el-table>
              </el-row>
              <el-row>
                <div
                  class="cud-special-pagination cud-special-pagination-button"
                >
                  <el-pagination popper-class="cud-pager-dropdown"
                    ref="pager"
                    class="cud__page"
                    @size-change="changeSize"
                    @current-change="changeCurrentPage"
                    :current-page.sync="tablePage.pageIndex"
                    :page-sizes="[10, 20, 30, 40]"
                    :page-size.sync="tablePage.pageSize"
                    :pager-count="5"
                    layout="total,sizes, prev, pager, next"
                    :total="tablePage.total"
                    :disabled="listLoading"
                  >
                  </el-pagination>
                </div>
              </el-row>
            </div>
          </el-card>
        </el-col>
      </el-row>
      <div>
        <el-dialog
          v-dragMove="{
            DragButton: '.el-dialog__header',
            DragWindow: '.el-dialog',
          }"
          :title="
            paramTypeSaveIsAdd
              ? $t('sys.add_category')
              : $t('sys.modify_category')
          "
          :visible.sync="paramTypeSaveDialogVisible"
          :close-on-click-modal="false"
          width="640px"
          destroy-on-close
          :before-close="paramTypeSaveClose"
        >
          <el-form
            ref="paramTypeSave"
            size="small"
            label-position="top"
            label-suffix="："
            :rules="paramTypeRules"
            :model="paramTypeVo"
            label-width="170px"
          >
            <el-row class="row-css">
              <!--分类编码-->
              <el-col :span="12">
                <el-form-item
                  :label="$t('sys.category_code')"
                  prop="paramTypeCode"
                >
                  <el-input
                    :placeholder="$t('cm.pleaseEnter')"
                    maxlength="32"
                    v-model="paramTypeVo.paramTypeCode"
                    class="form-input"
                  >
                  </el-input>
                </el-form-item>
              </el-col>
              <!--分类名称-->
              <el-col :span="12">
                <el-form-item
                  :label="$t('sys.category_name')"
                  prop="paramTypeName"
                >
                  <el-input
                    :placeholder="$t('cm.pleaseEnter')"
                    maxlength="200"
                    v-model="paramTypeVo.paramTypeName"
                    class="form-input"
                  >
                  </el-input>
                </el-form-item>
              </el-col>
              <!--参数类型-->
              <el-col :span="12">
                <el-form-item :label="$t('sys.parent_name')" prop="parentName">
                  <el-input
                    :placeholder="$t('cm.pleaseEnter')"
                    disabled
                    v-model="paramTypeVo.parentName"
                    class="form-input"
                  >
                  </el-input>
                </el-form-item>
              </el-col>
              <!--排序-->
              <el-col :span="12">
                <el-form-item :label="$t('cm.sort')" prop="paramTypeOrder">
                  <el-input
                    :placeholder="$t('cm.pleaseEnter')"
                    maxlength="3"
                    v-model="paramTypeVo.paramTypeOrder"
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
                    v-model="paramTypeVo.paramTypeComment"
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
            <el-button size="small" @click="paramTypeSaveClose">
              {{ $t("cm.cancel") }}
            </el-button>
            <el-button
              size="small"
              type="primary"
              v-loading.fullscreen.lock="fullscreenLoading"
              @click="paramTypeSaveSubmit"
            >
              {{ $t("cm.save") }}
            </el-button>
          </div>
        </el-dialog>
        <el-dialog
          v-dragMove="{
            DragButton: '.el-dialog__header',
            DragWindow: '.el-dialog',
          }"
          :title="paramSaveIsAdd ? $t('sys.add_param') : $t('sys.modify_param')"
          :visible.sync="paramSaveDialogVisible"
          width="640px"
          destroy-on-close
          :before-close="paramSaveClose"
        >
          <el-form
            ref="paramSave"
            size="small"
            label-position="top"
            label-suffix="："
            :rules="paramRules"
            :model="paramVo"
            label-width="170px"
          >
            <el-row>
              <!-- 参数分类 -->
              <el-col :span="12">
                <el-form-item
                  :label="$t('sys.param_category')"
                  prop="paramTypeIdLabel"
                >
                  <!-- disabled -->
                  <el-input
                    :placeholder="$t('cm.pleaseEnter')"
                    v-model="paramVo.paramTypeIdLabel"
                    class="form-input"
                  >
                  </el-input>
                </el-form-item>
              </el-col>
              <!--参数项编码-->
              <el-col :span="12">
                <el-form-item
                  :label="$t('sys.param_item_code')"
                  prop="paramCode"
                >
                  <el-input
                    :placeholder="$t('cm.pleaseEnter')"
                    maxlength="32"
                    :disabled="paramVo.paramType === 0 || !paramSaveIsAdd"
                    v-model="paramVo.paramCode"
                    class="form-input"
                  >
                  </el-input>
                </el-form-item>
              </el-col>
              <!--参数项名称-->
              <el-col :span="12">
                <el-form-item
                  :label="$t('sys.param_item_name')"
                  prop="paramName"
                >
                  <el-input
                    :placeholder="$t('cm.pleaseEnter')"
                    maxlength="200"
                    :disabled="paramVo.paramType === 0"
                    v-model="paramVo.paramName"
                    class="form-input"
                  >
                  </el-input>
                </el-form-item>
              </el-col>
              <!--参数类型-->
              <el-col :span="12">
                <el-form-item
                  :label="$t('sys.param_type')"
                  prop="paramTypeLabel"
                >
                  <!-- disabled -->
                  <el-input
                    :placeholder="$t('cm.pleaseEnter')"
                    v-model="paramVo.paramTypeLabel"
                    class="form-input"
                  >
                  </el-input>
                </el-form-item>
              </el-col>
              <!--参数项值-->
              <el-col :span="12">
                <el-form-item
                  :label="$t('sys.parameter_value')"
                  prop="paramValue"
                >
                  <el-select
                    clearable
                    v-model="paramVo.paramValue"
                    :placeholder="$t('cm.pselect')"
                  >
                    <el-option
                      v-for="item in paramValueList"
                      :key="item.key"
                      :label="item.label"
                      :value="item.value"
                    >
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="$t('cm.sort')" prop="paramOrder">
                  <el-input
                    :placeholder="$t('cm.pleaseEnter')"
                    maxlength="30"
                    v-model="paramVo.paramOrder"
                    class="form-input"
                  >
                  </el-input>
                </el-form-item>
              </el-col>
              <!--描述-->
              <el-col :span="24">
                <el-form-item :label="$t('cm.describe')" prop="paramComment">
                  <el-input
                    :placeholder="$t('cm.pleaseEnter')"
                    v-model="paramVo.paramComment"
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
            <el-button size="small" @click="paramSaveClose">
              {{ $t("cm.cancel") }}
            </el-button>
            <el-button
              size="small"
              type="primary"
              v-loading.fullscreen.lock="fullscreenLoading"
              @click="paramSaveSubmit"
            >
              {{ $t("cm.save") }}
            </el-button>
          </div>
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<script>
import globalParamManage from "./js/global_param_manage.js";

export default globalParamManage;
</script>

<style lang="less" scoped>
//  @import "src/assets/css/style";
.row-css {
  display: flex;
  justify-content: left;
  flex-wrap: wrap;
}
.el-table .el-tag {
  padding: 0;
  width: 60px;
  text-align: center;
}

.cud__search--row {
  margin-top: 0px;
}
/deep/ .el-card.is-always-shadow {
  margin: 15px 22px 15px 0px;
}
/deep/ .cud__scroll--div {
  padding-left: 15px;
}
</style>
<style>
.param-save-dialog .el-dialog__body {
  height: 421px;
}
.param-type-save-dialog .el-dialog__body {
  height: 311px;
}
</style>
