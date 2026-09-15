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
                    >&nbsp;&nbsp;{{ $t("sys.msg_category") }}</span
                  >
                  <div class="cud-commom-tree-title-icon-wrap">
                    <div
                      class="cud-commom-tree-title-icon"
                      @click="deleteCate"
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
                      @click="saveCate(true)"
                    >
                      <span
                        class="cud3-icon-blue font_family icon-icon_common_edit"
                        :title="$t('cm.edit')"
                      ></span>
                    </div>
                    <div
                      class="cud-commom-tree-title-icon"
                      @click="saveCate(false)"
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
                    @node-click="treeNodeClick"
                    highlight-current
                    :filter-node-method="filterTreeNode"
                    ref="cateTree"
                    :expand-on-click-node="false"
                    node-key="categoryId"
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
              :queryFormId="'business_msg_manage'"
              :queryFields="queryFields"
              :loading="tableLoading"
              @resize="initMaxHeight"
              @submit="searchMsg"
              ref="queryForm"
              class="cud-commom-form-search">
            </query-form>
          </el-card>
          <el-card>
            <div class="cud__tree--right">
              <div class="table-button">
                <el-button
                  type="primary"
                  size="small"
                  @click="saveMsg"
                  v-if="btnShow('business_msg_add')"
                  >{{ $t("cm.add") }}</el-button
                >
              </div>
              <el-row
                class="cud__table--list"
                :style="{ height: maxRightHeight + 'px' }"
              >
                <el-table
                  :data="tableData"
                  ref="msgTable"
                  @selection-change="selectChange"
                  v-loading="tableLoading"
                  border
                  stripe
                  :max-height="computedTableHeight"
                  :empty-text="$t('cm.nodata')"
                  highlight-current-row
                  header-row-class-name="cud-office-table-header"
                  class="cud-office-table"
                >
                  <!-- 序号 -->
                  <el-table-column
                    type="index"
                    width="70"
                    :label="$t('cm.no')"
                  ></el-table-column>
                  <!-- 分类名称 -->
                  <el-table-column
                    align="left"
                    prop="categoryName"
                    :label="$t('sys.msg_category')"
                    width="150"
                  ></el-table-column>
                  <!-- 消息语言 -->
                  <el-table-column
                    align="left"
                    prop="langName"
                    min-width="80"
                    :label="$t('sys.msg_lang')"
                  >
                    <template slot-scope="scope">
                      {{ $i18nn(scope.row.langName) }}
                    </template>
                  </el-table-column>
                  <!-- 消息KEY -->
                  <el-table-column
                    align="left"
                    prop="msgKey"
                    :label="$t('sys.msg_key')"
                    width="200"
                  ></el-table-column>
                  <!-- 消息文本 -->
                  <el-table-column
                    align="left"
                    prop="msgValue"
                    min-width="200"
                    :label="$t('sys.msg_value')"
                  >
                  </el-table-column>
                  <!-- 消息类型 -->
                  <el-table-column
                    align="left"
                    prop="msgType"
                    :label="$t('sys.msg_type')"
                    width="120"
                  >
                    <template slot-scope="scope">
                      <span v-if="scope.row.msgType === 2">前端消息</span>
                      <span v-if="scope.row.msgType === 1">后端消息</span>
                    </template>
                  </el-table-column>
                  <el-table-column
                    align="left"
                    :label="$t('cm.operate')"
                    width="150"
                    fixed="right"
                  >
                    <template slot-scope="scope">
                      <el-button
                        type="text"
                        size="small"
                        class="cud-common-operate-edit"
                        @click="saveMsg(scope.row)"
                        v-if="btnShow('business_msg_edit')"
                      >
                        {{ $t("cm.edit") }}</el-button
                      >
                      <el-button
                        type="text"
                        size="small"
                        class="cud-common-operate-delete"
                        @click="deleteMsg(scope.row)"
                        v-if="btnShow('business_msg_delete')"
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
                    :disabled="tableLoading"
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
            cateSaveIsAdd
              ? $t('sys.add_category')
              : $t('sys.modify_category')
          "
          :visible.sync="cateSaveDialogVisible"
          :close-on-click-modal="false"
          width="640px"
          :before-close="saveCateClose"
        >
          <el-form
            ref="cateSave"
            size="small"
            label-position="top"
            label-suffix="："
            :rules="cateRules"
            :model="cateSaveVo"
            label-width="170px"
          >
            <el-row class="row-css">
              <!--分类编码-->
              <el-col :span="12">
                <el-form-item
                  :label="$t('sys.category_code')"
                  prop="categoryCode"
                >
                  <el-input
                    :placeholder="$t('cm.pleaseEnter')"
                    maxlength="32"
                    v-model="cateSaveVo.categoryCode"
                    class="form-input"
                  >
                  </el-input>
                </el-form-item>
              </el-col>
              <!--分类名称-->
              <el-col :span="12">
                <el-form-item
                  :label="$t('sys.category_name')"
                  prop="categoryName"
                >
                  <el-input
                    :placeholder="$t('cm.pleaseEnter')"
                    maxlength="200"
                    v-model="cateSaveVo.categoryName"
                    class="form-input"
                  >
                  </el-input>
                </el-form-item>
              </el-col>
              <!--父级名称-->
              <el-col :span="12">
                <el-form-item :label="$t('sys.parent_name')" prop="parentName">
                  <el-input
                    :placeholder="$t('cm.pleaseEnter')"
                    disabled
                    v-model="cateSaveVo.parentName"
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
                    v-model="cateSaveVo.categoryDesc"
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
            <el-button size="small" @click="saveCateClose">
              {{ $t("cm.cancel") }}
            </el-button>
            <el-button
              size="small"
              type="primary"
              @click="saveCateSubmit"
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
          :title="msgSaveIsAdd ? $t('sys.add_msg') : $t('sys.modify_msg')"
          :visible.sync="msgSaveDialogVisible"
          width="640px"
          :before-close="saveMsgClose"
        >
          <el-form
            ref="msgSave"
            size="small"
            label-position="top"
            label-suffix="："
            :rules="msgSaveRules"
            :model="msgSaveVo"
            label-width="170px"
          >
            <el-row>
              <!-- 消息分类 -->
              <el-col :span="12">
                <el-form-item
                  :label="$t('sys.msg_category')"
                  prop="msgCategory"
                >
                  <el-input
                    :placeholder="$t('cm.pleaseEnter')"
                    v-model="msgSaveVo.categoryName"
                    class="form-input"
                    disabled
                  >
                  </el-input>
                </el-form-item>
              </el-col>
              <!--消息类型-->
              <el-col :span="12">
                <el-form-item
                  :label="$t('sys.msg_type')"
                  prop="msgType"
                >
                  <el-select
                    class="form-input"
                    v-model="msgSaveVo.msgType"
                    size="small"
                  >
                    <el-option
                      label="前端消息"
                      :value="2"
                    ></el-option>
                    <el-option
                      label="后端消息"
                      :value="1"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <!--消息语言-->
              <el-col :span="12">
                <el-form-item
                  :label="$t('sys.msg_lang')"
                  prop="langId"
                >
                  <el-select
                    class="form-input"
                    v-model="msgSaveVo.langId"
                    size="small"
                  >
                    <el-option
                      v-for="(item, index) in langList"
                      :key="index"
                      :label="$i18nn(item.label)"
                      :value="item.value"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <!--消息KEY-->
              <el-col :span="12">
                <el-form-item
                  :label="$t('sys.msg_key')"
                  prop="msgKey"
                >
                  <el-input
                    :placeholder="$t('cm.pleaseEnter')"
                    maxlength="200"
                    :disabled="msgSaveVo.msgType === 0 || !msgSaveIsAdd"
                    v-model="msgSaveVo.msgKey"
                    class="form-input"
                  >
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <!--消息文本-->
              <el-col :span="24">
                <el-form-item
                  :label="$t('sys.msg_value')"
                  prop="msgValue"
                >
                  <p>&nbsp;提示：后端消息使用 ${xxx} 可插入动态参数</p>
                  <el-input
                    :placeholder="$t('cm.pleaseEnter')"
                    v-model="msgSaveVo.msgValue"
                    type="textarea"
                    rows="5"
                    maxlength="500"
                    show-word-limit
                    class="form-input"
                  >
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <div slot="footer" class="dialog-footer" align="center">
            <el-button size="small" @click="saveMsgClose">
              {{ $t("cm.cancel") }}
            </el-button>
            <el-button
              size="small"
              type="primary"
              @click="saveMsgSubmit"
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
import bubusinessMsgManage from "./js/business_msg_manage.js";

export default bubusinessMsgManage;
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
