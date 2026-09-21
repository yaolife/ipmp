<template>
  <div class="cud-commom-form-style">
    <div class="brand">
      <breadcrumb :arrayName="brand" :hasIcon="hasIcon"></breadcrumb>
    </div>
    <div
      class="cud__scroll--div dict_manage cud-cgn-task-center"
      style="margin: 14px"
    >
      <!-- <el-tabs
        v-model="activeName"
        @tab-click="handleClick"
        class="dict_tab cgn-task-tabs"
        ref="tabs"
      >
        <el-tab-pane
          :label="$t('dict.local_config')"
          name="local"
          class="cud-task-list"
        > -->
          <el-row>
            <el-col
              :span="6"
              class="cud-commom-tree-left"
              :class="{
                'cud-commom-tree-content-hidden': isTreeCollapse,
                'cud-commom-tree-content-show': !isTreeCollapse,
              }"
              :style="isTreeCollapse ? { height: maxTreeHeight + 'px' } : {}"
            >
              <el-card class="box-shadow">
                <div class="cud__tree--left">
                  <div class="cud-common-tree-content">
                    <div class="tree-search-box">
                      <el-input
                        v-model="dictFilterText"
                        :placeholder="$t('dict.dict_filter_text')"
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
                        >&nbsp;&nbsp;{{ $t("dict.dict_category") }}</span
                      >
                      <div class="cud-commom-tree-title-icon-wrap">
                        <div
                          class="cud-commom-tree-title-icon"
                          @click="removeDict"
                        >
                          <span
                            class="
                              cud3-icon-blue
                              font_family
                              icon-icon_common_delete
                            "
                            :title="$t('dict.del_dict')"
                          ></span>
                        </div>
                        <div
                          class="cud-commom-tree-title-icon"
                          @click="updateDict"
                        >
                          <span
                            class="
                              cud3-icon-blue
                              font_family
                              icon-icon_common_edit
                            "
                            :title="$t('dict.edit_dict')"
                          ></span>
                        </div>
                        <div
                          class="cud-commom-tree-title-icon"
                          @click="appendDict"
                        >
                          <span
                            class="
                              cud3-icon-blue
                              font_family
                              icon-icon_common_grade_down
                            "
                            :title="$t('dict.add_sub_dict')"
                          ></span>
                        </div>
                        <div
                          class="cud-commom-tree-title-icon"
                          @click="insertDictAfter"
                        >
                          <span
                            class="
                              cud3-icon-blue
                              font_family
                              icon-icon_common_add
                            "
                            :title="$t('dict.add_dict')"
                          ></span>
                        </div>
                      </div>
                    </div>

                    <div
                      class="cud__mtb-10 ml-20 mr-20"
                      v-loading="treeLoading"
                    >
                      <el-tree
                        :data="dictData"
                        :props="dictTreeOption"
                        ref="dictTree"
                        node-key="id"
                        @node-click="dictTreeNodeClick"
                        highlight-current
                        class="cud_tree"
                        :filter-node-method="filterDictTreeNode"
                        :style="{
                          height: computedTreeHeight + 'px',
                          maxHeight: computedTreeHeight + 'px',
                        }"
                        :render-content="renderContent"
                      >
                      </el-tree>
                    </div>
                  </div>
                  <div
                    class="cud__tree--expand-trigger box-shadow"
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
              <el-card class="box-shadow">
                <div class="cud__tree--right">
                  <div ref="searchRef">
                    <query-form
                      :queryFormId="'dict_manage'"
                      :queryFields="queryFields"
                      :loading="tableLoading"
                      @resize="initMaxHeight"
                      @submit="search"
                      ref="queryForm"
                      class="cud-commom-form-search"
                    >
                    </query-form>
                  </div>
                  <div
                    class="table-button"
                  >
                    <el-button
                      type="primary"
                      size="small"
                      @click="addDictItem"
                      v-if="btnShow('dict_manage_add')"
                      >{{ $t("cm.add") }}</el-button
                    >
                    <el-button
                      size="small"
                      :disabled="selectnum == '0'"
                      @click="dictItemBatchDel"
                      v-if="btnShow('dict_manage_delete')"
                      >{{ $t("cm.delete") }}</el-button
                    >
                  </div>
                  <el-row
                    class="cud__table--list"
                    :style="{ height: computedTableHeight + 'px' }"
                  >
                    <el-table
                      v-loading="tableLoading"
                      :data="dictItemTableData"
                      ref="dictItemTable"
                      border
                      stripe
                      :max-height="computedTableHeight"
                      highlight-current-row
                      header-row-class-name="cud-office-table-header"
                      class="cud-office-table"
                      @selection-change="selectChange"
                      :empty-text="$t('cm.nodata')"
                      row-key="id"
                      :tree-props="{
                        children: 'children',
                        hasChildren: 'hasChildren',
                      }"
                    >
                      <el-table-column
                        align="center"
                        type="selection"
                        width="55"
                      ></el-table-column>
                      <!-- <el-table-column align="left" type="index" :label="$t('cm.no')" width="70"></el-table-column> -->
                      <el-table-column
                        align="left"
                        show-overflow-tooltip
                        prop="itemText"
                        :label="$t('dict.dict_item_name')"
                      ></el-table-column>
                      <el-table-column
                        align="left"
                        show-overflow-tooltip
                        prop="itemValue"
                        :label="$t('dict.dict_item_val')"
                      ></el-table-column>
                      <el-table-column
                        width="100"
                        align="left"
                        prop="itemCode"
                        :label="$t('dict.dict_item_code')"
                      ></el-table-column>
                      <el-table-column
                        align="left"
                        prop="itemStatus"
                        width="100"
                        :label="$t('dict.dict_item_status')"
                      >
                        <template slot-scope="scope">
                          <el-tag
                            class="cud-tb-tag"
                            size="small"
                            v-if="scope.row.itemStatus === '1'"
                            type="success"
                          >
                            <i
                              class="cud-el-icon-point"
                              style="background: #41b048"
                            ></i>
                            {{ $t("dict.dict_item_status_success") }}
                          </el-tag>
                          <el-tag
                            class="cud-tb-tag"
                            size="small"
                            v-if="scope.row.itemStatus === '0'"
                            type="danger"
                          >
                            <i
                              class="cud-el-icon-point"
                              style="background: #e94848"
                            ></i>
                            {{ $t("dict.dict_item_status_disabled") }}
                          </el-tag>
                          <el-tag
                            class="cud-tb-tag"
                            size="small"
                            v-if="scope.row.itemStatus === '2'"
                          >
                            <i
                              class="cud-el-icon-point"
                              style="background: #00a0e9"
                            ></i>
                            {{ $t("dict.dict_item_status_deleted") }}
                          </el-tag>
                        </template>
                      </el-table-column>
                      <el-table-column
                        align="left"
                        prop="itemSortOrder"
                        width="100"
                        :label="$t('dict.dict_item_order')"
                      ></el-table-column>
                      <el-table-column
                        align="left"
                        prop="itemDesc"
                        :label="$t('dict.dict_item_desc')"
                      ></el-table-column>
                      <el-table-column
                        align="left"
                        :label="$t('cm.operate')"
                        width="200"
                      >
                        <template slot-scope="scope">
                          <el-button
                            type="text"
                            size="small"
                            class="cud-common-operate-edit"
                            @click="updateDictItemData(scope.row)"
                            v-if="btnShow('dict_manage_edit')"
                          >
                            {{ $t("cm.edit") }}</el-button
                          >
                          <el-button
                            type="text"
                            size="small"
                            class="cud-common-operate-delete"
                            @click="dictItemDelData(scope.row)"
                            v-if="btnShow('dict_manage_delete')"
                          >
                            {{ $t("cm.delete") }}</el-button
                          >

                          <el-button
                            type="text"
                            size="small"
                            class="cud-common-operate-edit"
                            @click="addDictChildrenItem(scope.row)"
                          >
                            {{ "新增子项" }}</el-button
                          >
                        </template>
                      </el-table-column>
                    </el-table>
                  </el-row>
                  <el-row>
                    <div
                      class="cud-special-pagination cud-special-pagination-button"
                      style="height: 53px"
                    >

                      <!-- <el-pagination popper-class="cud-pager-dropdown"
                        ref="pager"
                        class="cud__page"
                        @size-change="changeSize"
                        @current-change="changeCurrentPage"
                        :current-page.sync="currentPage"
                        :page-sizes="[10, 20, 30, 40]"
                        :page-size.sync="pageSize"
                        layout="total,sizes, prev, pager, next"
                        :pager-count="5"
                        :total="total"
                        :disabled="tableLoading"
                      >
                      </el-pagination> -->
                    </div>
                  </el-row>
                </div>
              </el-card>
            </el-col>
          </el-row>
          <div>
            <el-dialog
              class="add_tip"
              v-dragMove="{
                DragButton: '.el-dialog__header',
                DragWindow: '.el-dialog',
              }"
              :title="$t('dict.dict_item_config')"
              append-to-body
              :withHeader="false"
              :visible.sync="configDictItemShow"
              :before-close="configDictItemShowHandleClose"
              width="640px"
              height="90%"
              direction="rtl"
              destroy-on-close
              :close-on-press-escape="false"
            >
              <el-form
                ref="dictItemform"
                size="small"
                label-position="top"
                label-suffix="："
                :model="dictItemVO"
                :rules="dictItemRules"
                label-width="170px"
              >
                <el-row>
                  <el-col :span="12">
                    <el-form-item
                      :label="$t('dict.dict_item_name')"
                      prop="itemText"
                    >
                      <el-input
                        :placeholder="$t('cm.pleaseEnter')"
                        maxlength="64"
                        v-model="dictItemVO.itemText"
                        @blur="checkduplicate"
                        class="form-input"
                      ></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item
                      :label="$t('dict.dict_item_code')"
                      prop="itemCode"
                    >
                      <el-input
                        :placeholder="$t('cm.pleaseEnter')"
                        maxlength="32"
                        v-model="dictItemVO.itemCode"
                        @blur="checkduplicate"
                        class="form-input"
                      ></el-input>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :span="12">
                    <el-form-item
                      :label="$t('dict.dict_item_val')"
                      prop="itemValue"
                    >
                      <el-input
                        :placeholder="$t('cm.pleaseEnter')"
                        maxlength="128"
                        v-model="dictItemVO.itemValue"
                        class="form-input"
                      ></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item :label="$t('dict.dict_item_order')">
                      <el-input-number
                        :placeholder="$t('cm.pleaseEnter')"
                        v-model="dictItemVO.itemSortOrder"
                        :min="1"
                        class="form-input"
                      ></el-input-number>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :span="12">
                    <el-form-item :label="$t('dict.dict_item_if_enable')">
                      <el-switch
                        v-model="dictItemVO.itemStatus"
                        :active-text="$t('dict.dict_item_enable')"
                        :inactive-text="$t('dict.dict_item_disabled')"
                      ></el-switch>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :span="24" class="add_tip_textarea">
                    <el-form-item :label="$t('dict.dict_item_desc')">
                      <el-input
                        :placeholder="$t('cm.pleaseEnter')"
                        v-model="dictItemVO.itemDesc"
                        type="textarea"
                        rows="5"
                        maxlength="255"
                        show-word-limit
                        class="form-input"
                      ></el-input>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
              <div slot="footer" class="dialog-footer" align="center">
                <el-button size="small" @click="closeConfigDictItemShow">{{
                  $t("cm.cancel")
                }}</el-button>
                <el-button
                  size="small"
                  type="primary"
                  @click="saveDictItemClick"
                  >{{ $t("cm.commit") }}</el-button
                >
              </div>
            </el-dialog>
            <el-dialog
              v-dragMove="{
                DragButton: '.el-dialog__header',
                DragWindow: '.el-dialog',
              }"
              :title="$t('dict.dict_config')"
              :visible.sync="configDictDialogVisible"
              width="640px"
              :before-close="configDictDialogHandleClose"
              destroy-on-close
            >
              <el-form
                ref="dictForm"
                size="small"
                label-position="top"
                label-suffix="："
                :rules="dictRules"
                :model="dictVO"
                label-width="170px"
              >
                <el-row class="row-css">
                  <el-col :span="12">
                    <el-form-item :label="$t('dict.dict_name')" prop="dictName">
                      <el-input
                        :placeholder="$t('cm.pleaseEnter')"
                        maxlength="64"
                        v-model="dictVO.dictName"
                        size="small"
                        class="form-input"
                      ></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item :label="$t('dict.dict_code')" prop="dictCode">
                      <el-input
                        :placeholder="$t('cm.pleaseEnter')"
                        maxlength="32"
                        v-model="dictVO.dictCode"
                        size="small"
                        class="form-input"
                      ></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item :label="$t('dict.dict_parent_level')">
                      <el-tag>{{ dictVO.supDictName }}</el-tag>
                    </el-form-item>
                  </el-col>
                  <el-col :span="24">
                    <el-form-item :label="$t('dict.dict_desc')">
                      <el-input
                        :placeholder="$t('cm.pleaseEnter')"
                        v-model="dictVO.dictDesc"
                        type="textarea"
                        rows="5"
                        maxlength="255"
                        show-word-limit
                        size="small"
                        class="form-input"
                      ></el-input>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
              <div slot="footer" class="dialog-footer" align="center">
                <el-button size="small" @click="configDictDialogHandleClose">{{
                  $t("cm.cancel")
                }}</el-button>
                <el-button size="small" type="primary" @click="saveDictClick">{{
                  $t("cm.commit")
                }}</el-button>
              </div>
            </el-dialog>
          </div>
        <!-- </el-tab-pane> -->
        <!-- <el-tab-pane
          :label="$t('dict.common_config')"
          name="remote"
          :lazy="true"
        >
          <el-row>
            <el-col
              :span="6"
              class="cud-commom-tree-left cud-commom-tree-content-show"
            >
              <el-card class="box-shadow"> 
                <div class="cud__tree--left">
                  <div class="cud-common-tree-content">
                    <div class="tree-search-box">
                      <el-input
                        v-model="dictFilterTextRemote"
                        :placeholder="$t('dict.dict_filter_text')"
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
                        >&nbsp;&nbsp;{{ $t("dict.dict_category") }}</span
                      >
                    </div>

                    <div
                      class="cud__mtb-10 ml-20 mr-20"
                      v-loading="treeLoading"
                    >
                      <el-tree
                        :data="dictDataRemote"
                        :props="dictTreeOption"
                        ref="dictTreeRemote"
                        node-key="id"
                        @node-click="dictTreeNodeRemoteClick"
                        highlight-current
                        class="cud_tree"
                        :filter-node-method="filterDictTreeNode"
                        :style="{
                          height: computedTreeHeight + 'px',
                          maxHeight: computedTreeHeight + 'px',
                        }"
                        :render-content="renderContent"
                      >
                      </el-tree>
                    </div>
                  </div>
                  <div
                    class="cud__tree--expand-trigger box-shadow"
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
            <el-col :span="18">
              <el-card class="box-shadow">
                <div class="cud__tree--right">
                  <div ref="searchRef">
                    <query-form
                      :queryFormId="'dict_manage_remote'"
                      :queryFields="queryFields2"
                      :loading="tableLoading2"
                      @resize="initMaxHeight"
                      @submit="searchRemote"
                      ref="queryForm2"
                      class="cud-commom-form-search"
                    >
                    </query-form>
                  </div>
                  <el-form
                    label-suffix="："
                    label-width="110px"
                    label-position="top"
                  >
                    <el-row class="cud__table--list">
                      <el-table
                        v-loading="tableLoading2"
                        :data="dictItemTableDataRemote"
                        ref="dictItemTable"
                        :height="computedTableHeight + 42"
                        :max-height="computedTableHeight + 42"
                        highlight-current-row
                        header-row-class-name="cud-office-table-header"
                        class="cud-office-table"
                        style="overflow: auto"
                      > 
                        <el-table-column
                          align="left"
                          prop="itemName"
                          :label="$t('dict.dict_item_name')"
                        ></el-table-column>
                        <el-table-column
                          align="left"
                          prop="itemValue"
                          :label="$t('dict.dict_item_val')"
                        ></el-table-column>
                        <el-table-column
                          align="left"
                          prop="itemCode"
                          :label="$t('dict.dict_item_code')"
                        ></el-table-column>
                        <el-table-column
                          width="100"
                          align="left"
                          prop="itemStatus"
                          :label="$t('dict.dict_item_status')"
                        >
                          <template slot-scope="scope">
                            <el-tag
                              class="cud-tb-tag"
                              v-if="scope.row.itemStatus === '1'"
                              type="success"
                            >
                              <i
                                class="cud-el-icon-point"
                                style="background: #41b048"
                              ></i>
                              {{ $t("dict.dict_item_status_success") }}
                            </el-tag>
                            <el-tag
                              class="cud-tb-tag"
                              v-if="scope.row.itemStatus === '0'"
                              type="danger"
                            >
                              <i
                                class="cud-el-icon-point"
                                style="background: #e94848"
                              ></i>
                              {{ $t("dict.dict_item_status_disabled") }}
                            </el-tag>
                            <el-tag
                              class="cud-tb-tag"
                              v-if="scope.row.itemStatus === '2'"
                            >
                              <i
                                class="cud-el-icon-point"
                                style="background: #00a0e9"
                              ></i>
                              {{ $t("dict.dict_item_status_deleted") }}
                            </el-tag>
                          </template>
                        </el-table-column>

                        <el-table-column
                          align="left"
                          prop="itemSortOrder"
                          width="100"
                          :label="$t('dict.dict_item_order')"
                        ></el-table-column>
                        <el-table-column
                          align="left"
                          prop="itemDesc"
                          :label="$t('dict.dict_item_desc')"
                        ></el-table-column>
                      </el-table>
                      <el-row>
                        <div
                          class="cud-special-pagination cud-special-pagination-button"
                          style="height: 53px"
                        >
                          <el-pagination popper-class="cud-pager-dropdown"
                            ref="pager"
                            class="cud__page"
                            @size-change="changeSizeRemote"
                            @current-change="changeCurrentPageRemote"
                            :current-page.sync="currentPageRemote"
                            :page-sizes="[10, 20, 30, 40]"
                            :page-size.sync="pageSizeRemote"
                            layout="total,sizes, prev, pager, next"
                            :pager-count="5"
                            :total="totalRemote"
                            :disabled="tableLoading2"
                          >
                          </el-pagination>
                        </div>
                      </el-row>
                    </el-row>
                  </el-form>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </el-tab-pane> -->
      <!-- </el-tabs> -->
    </div>
  </div>
</template>

<script>
import "element-ui/lib/theme-chalk/drawer.css";
import dictManage from "./js/dict_manage.js";
export default dictManage;
</script>
<style lang="less" scoped>
// @import "src/assets/css/style";
.row-css {
  display: flex;
  justify-content: left;
  flex-wrap: wrap;
}
.dict_manage .el-table .cell {
  padding: 0;
}
.el-table .el-tag {
  padding: 0;
  width: 60px;
  text-align: center;
  margin-left: -3px;
}
.cud-cm-config-left {
  margin-top: 40px;
}
/deep/ .el-card.is-always-shadow {
  // margin: 15px 0px 15px 20px !important;
}
/deep/.el-tabs__content {
  padding-bottom: 15px !important;
}
/deep/ .el-tabs__active-bar {
  width: 30px !important;
  left: 52px;
}
/deep/ .el-table__body .el-table-column--selection .cell {
  display: flex;
  text-align: center;
  align-items: center;
  width: 100%;
  height: 32px;
  line-height: 32px;
}
/deep/ .el-table__expand-icon {
  // position: absolute;
  // left: -10px;
  // position: relative;
  cursor: pointer;
  color: #666;
  font-size: 12px;
  transition: transform 0.2s ease-in-out;
  // height: 20px;
  // left: -5px;
  // top: 5px;
}

/deep/ .el-tree-node__expand-icon {
  color: transparent !important;
}
/deep/ .el-tree-node__expand-icon {
  color: transparent !important;
}
/deep/ .el-tree-node__expand-icon {
  color: transparent !important;
}
</style>
