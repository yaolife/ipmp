<!--
 * @Author: P623437
 * @Date: 2021-09-08 10:17:46
 * @LastEditors: P623437
 * @LastEditTime: 2022-02-17 09:41:32
 * @Description: 流程模板管理
-->

<template>
  <div class="cud-commom-form-style" v-loading="loading">
    <div class="brand">
      <breadcrumb :arrayName="brand" :hasIcon="hasIcon"></breadcrumb>
    </div>
    <div class="cud__scroll--div workflow_template_manage">
      <el-row class="cud-common-bottom-wrap">
        <el-col
          :span="6"
          class="cud-commom-tree-left"
          :class="{
            'cud-commom-tree-content-hidden': isTreeCollapse,
            'cud-commom-tree-content-show': !isTreeCollapse
          }"
          :style="isTreeCollapse ? { height: maxRightHeight + 'px' } : {}"
        >
          <el-card>
            <div class="cud__tree--left">
              <div class="cud-common-tree-content">
                <div class="tree-search-box">
                  <el-input
                    size="small"
                    v-model="processCategoryFilterText"
                    :placeholder="$t('cm.cate_filter_text')"
                    maxlength="20"
                    suffix-icon="el-icon-search"
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
                  >&nbsp;&nbsp;{{ $t("wm.flow_manage_type") }}</span
                  >
                  <div
                    class="cud-commom-tree-title-icon-wrap"
                    style="min-width: 90px"
                  >
                    <div class="cud-commom-tree-title-icon" @click="removeFlow">
                      <span
                        class="
                          cud3-icon-blue
                          font_family
                          icon-icon_common_delete
                        "
                        :title="$t('cm.delete')"
                      ></span>
                    </div>
                    <div class="cud-commom-tree-title-icon" @click="updateFlow">
                      <span
                        class="cud3-icon-blue font_family icon-icon_common_edit"
                        :title="$t('cm.edit')"
                      ></span>
                    </div>
                    <div class="cud-commom-tree-title-icon" @click="appendFlow">
                      <span
                        class="cud3-icon-blue font_family icon-icon_common_add"
                        :title="$t('cm.add')"
                      ></span>
                    </div>
                  </div>
                </div>
                <div class="cud__mtb-10 ml-20 mr-20" v-loading="treeLoading">
                  <el-tree
                    :data="processCategoryTreeData"
                    class="cud_tree"
                    :props="processCategoryTreeOption"
                    @node-click="processCategoryTreeNodeClick"
                    highlight-current
                    :filter-node-method="filterProcessCategoryTreeNode"
                    ref="processCategoryTree"
                    :expand-on-click-node="false"
                    node-key="id"
                    default-expand-all
                    :style="{
                      height: computedTreeHeight + 'px',
                      maxHeight: computedTreeHeight + 'px'
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
              <el-form
                label-suffix="："
                label-width="110px"
                label-position="top"
              >
                <el-row
                  class="cud__search--rowhigh cud-senior-search"
                  type="flex"
                >
                  <el-col :xs="12" :sm="12" :md="8" :lg="8">
                    <el-form-item :label="$t('wm.procName')">
                      <el-input
                        v-model="processTemplateVo.procName"
                        size="small"
                        :placeholder="$t('cm.pleaseEnter')"
                        maxlength="64"
                      ></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="12" :sm="12" :md="8" :lg="8">
                    <el-form-item :label="$t('cm.state')">
                      <el-select
                        class="form-input"
                        v-model="processTemplateVo.procStatus"
                        size="small"
                        :placeholder="$t('wm.statusSelect')"
                      >
                        <el-option
                          :label="$t('wm.draftdesign')"
                          :value="0"
                        ></el-option>
                        <el-option
                          :label="$t('wm.designandpublish')"
                          :value="1"
                        ></el-option>
                        <el-option
                          :label="$t('wm.draftconfig')"
                          :value="2"
                        ></el-option>
                        <el-option
                          :label="$t('wm.configandpublish')"
                          :value="3"
                        ></el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col
                    :xs="12"
                    :sm="12"
                    :md="8"
                    :lg="8"
                    class="cud--right pt-23"
                  >
                    <!-- <el-form-item label=" "> -->
                    <el-button
                      class="mr-10"
                      type="primary"
                      size="small"
                      @click="searchProcessTemplates"
                    >{{ $t("cm.search") }}</el-button
                    >
                    <el-button size="small" @click="resetProcessTemplate">{{
                      $t("cm.reset")
                      }}</el-button>
                    <!--                                        <el-upload  style="display:inline-block;"-->
                    <!--                                            :show-file-list="false"-->
                    <!--                                            :action="excelUpUrl"-->
                    <!--                                            :before-upload="beforeUpload"-->
                    <!--                                            :on-success="upfileBack"-->
                    <!--                                            :on-progress="loadingFile"-->
                    <!--                                            :on-error="uplofileError"-->
                    <!--                                            :disabled="processTemplateVo.procCategory === ''">-->
                    <!--                                            <el-button type="primary" size="small"   :disabled="processTemplateVo.procCategory === ''">{{$t('cm.import')}} </el-button>-->
                    <!--                                        </el-upload>-->
                    <!-- </el-form-item> -->
                  </el-col>
                </el-row>
              </el-form>
              <el-row class="cud__search--rowhigh">
                <div class="cud__divider"></div>
              </el-row>
              <div class="table-button">
                <el-button
                  type="primary"
                  size="small"
                  @click="addWfTemplateDesignFun"
                  v-if="btnShow('workflow_temp_manage_add')"
                >{{ $t("cm.add") }}</el-button
                >
              </div>
              <el-row
                class="cud__table--list"
                :style="{ height: maxRightHeight + 'px' }"
              >
                <el-table
                  :data="processTableData"
                  ref="processTable"
                  :empty-text="$t('cm.nodata')"
                  :max-height="computedTableHeight"
                  highlight-current-row
                  header-row-class-name="cud-office-table-header"
                  class="cud-office-table"
                  @selection-change="selectChange"
                  v-loading="listLoading"
                >
                  <!-- <el-table-column align="left" type="index" :label="$t('cm.no')" width="55"></el-table-column> -->
                  <el-table-column
                    align="left"
                    min-width="150"
                    show-overflow-tooltip
                    :label="$t('wm.procName')"
                  >
                    <template slot-scope="scope">
                      <span class="cud-commom-process-name">{{
                        scope.row.procName
                      }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column
                    align="left"
                    min-width="110"
                    show-overflow-tooltip
                    prop="procVersion"
                    :label="$t('wm.procVersion')"
                  ></el-table-column>
                  <el-table-column
                    align="left"
                    :label="$t('wm.procStatusName')"
                    min-width="140"
                  >
                    <template slot-scope="scope">
                      <!-- <el-tag  class="cud-tb-tag"
                                        :type="scope.row.procStatus == 3?'success':scope.row.procStatus == 2?'':scope.row.procStatus == 1?'warning':'info'">
                                            <i class="cud-el-icon-point" :style="{background:(scope.row.procStatus == 3?'#41B048':scope.row.procStatus == 2?'#00A0E9':scope.row.procStatus == 1?'#e6a23c':'#909399')}"></i> -->
                      <span v-if="scope.row.procStatus === 0">设计草稿</span>
                      <span v-if="scope.row.procStatus === 1">设计发布</span>
                      <span v-if="scope.row.procStatus === 2">配置草稿</span>
                      <span v-if="scope.row.procStatus === 3">配置发布</span>
                      <!-- </el-tag> -->
                    </template>
                  </el-table-column>
                  <el-table-column
                    align="left"
                    prop="isActiveVersion"
                    :label="$t('wm.isOrnotActived')"
                    min-width="130"
                  >
                    <template slot-scope="scope">
                      <el-tag
                        class="cud-tb-tag"
                        v-if="scope.row.isActiveVersion == 0"
                        type="danger"
                      >
                        <i
                          class="cud-el-icon-point"
                          style="background: #e94848"
                        ></i
                        >未激活
                      </el-tag>
                      <el-tag
                        class="cud-tb-tag"
                        v-if="scope.row.isActiveVersion"
                        type="success"
                      >
                        <i
                          class="cud-el-icon-point"
                          style="background: #41b048"
                        ></i
                        >已激活
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column
                    align="left"
                    show-overflow-tooltip
                    min-width="150"
                    prop="procDesc"
                    :label="$t('wm.procDesc')"
                  ></el-table-column>
                  <el-table-column
                    align="left"
                    prop="createUserName"
                    min-width="150"
                    :label="$t('cm.creat_by')"
                  ></el-table-column>
                  <el-table-column
                    align="left"
                    min-width="150"
                    prop="createDate"
                    :label="$t('cm.creat_time')"
                  ></el-table-column>
                  <el-table-column
                    align="left"
                    :label="$t('cm.operate')"
                    min-width="180"
                    fixed="right"
                  >
                    <template slot-scope="scope">
                      <el-button
                        type="text"
                        size="small"
                        class="cud-common-operate-edit"
                        @click="editWfTemplateDesignFun(scope.row)"
                        v-if="btnShow('workflow_temp_manage_edit')"
                      >
                        {{ $t("cm.edit") }}</el-button
                      >
                      <el-button
                        type="text"
                        size="small"
                        class="cud-common-operate-delete"
                        @click="delWfTemplateDesignFun(scope.row)"
                        v-if="btnShow('workflow_temp_manage_delete')"
                      >
                        {{ $t("cm.delete") }}</el-button
                      >
                      <el-dropdown
                        @command="moreCommandHandler"
                        trigger="click"
                      >
                        <span class="el-dropdown-link"
                        >{{ $t("cm.more") }}<i class="el-icon-arrow-down"></i>
                        </span>
                        <el-dropdown-menu slot="dropdown">
                          <!-- <el-dropdown-item :command="beforeMoreCommandHandler('delData', scope.row)">
                                                    <img src="@/assets/img/commondelicon.png" class="cud-commom-operate-size cud-commom-title-operate-icon cud-commom-operate-delete-size cud-commom-operate-preview">{{$t('cm.delete')}}
                                                </el-dropdown-item> -->
                          <!-- <el-dropdown-item :command="beforeMoreCommandHandler('flowCopy', scope.row)" v-if="scope.row.procStatus === 1 || scope.row.procStatus === 2 || scope.row.procStatus === 3">
                                                    <img src="@/assets/img/commonconfigicon.png" class="cud-commom-title-operate-icon cud-commom-operate-size cud-commom-operate-flowConfig">流程复制
                                                </el-dropdown-item> -->
                          <el-dropdown-item
                            :command="
                              beforeMoreCommandHandler('flowConfig', scope.row)
                            "
                            v-if="
                              (scope.row.procStatus === 1 ||
                                scope.row.procStatus === 2 ||
                                scope.row.procStatus === 3) &&
                                btnShow('workflow_temp_manage_config')
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
                                icon-icon_more_configure
                              "
                            ></span>
                            {{ $t("wm.config") }}
                          </el-dropdown-item>
                          <el-dropdown-item
                            :command="
                              beforeMoreCommandHandler('flowMaster', scope.row)
                            "
                            v-if="scope.row.procStatus === 3"
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
                                icon-icon_more_edition
                              "
                            ></span>
                            {{ $t("wm.setAsMainVersion") }}
                          </el-dropdown-item>
                          <el-dropdown-item
                            :command="
                              beforeMoreCommandHandler('flowHistory', scope.row)
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
                                icon-icon_more_history
                              "
                            ></span>
                            {{ $t("cm.history") }}
                          </el-dropdown-item>
<!--                          <el-dropdown-item-->
<!--                            :command="-->
<!--                              beforeMoreCommandHandler('flowExport', scope.row)-->
<!--                            "-->
<!--                            v-if="scope.row.procStatus === 3"-->
<!--                          >-->
<!--                            <span-->
<!--                              style="-->
<!--                                font-size: 18px;-->
<!--                                transform: translateY(2px);-->
<!--                                display: inline-block;-->
<!--                              "-->
<!--                              class="-->
<!--                                cud3-icon-blue-->
<!--                                font_family-->
<!--                                icon-icon_more_configure-->
<!--                              "-->
<!--                            ></span>-->
<!--                            {{ $t("cm.export") }}-->
<!--                          </el-dropdown-item>-->
                          <el-dropdown-item
                            :command="
                              beforeMoreCommandHandler('flowImport', scope.row)
                            "
                            v-if="
                              scope.row.isActiveVersion === 0 &&
                                scope.row.procStatus != 0
                            "
                          >
<!--                            <el-upload-->
<!--                              style="display: inline-block; width: 100%"-->
<!--                              class="importClass"-->
<!--                              :show-file-list="false"-->
<!--                              :action="excelUpUrlSubComponent"-->
<!--                              :before-upload="beforeUploadSubComponent"-->
<!--                              :on-success="upfileBackSubComponent"-->
<!--                              :on-progress="loadingFileSubComponent"-->
<!--                              :on-error="uplofileErrorSubComponent"-->
<!--                              :headers="headersOptions"-->
<!--                            >-->
<!--                              &lt;!&ndash;                                                    <el-button type="primary" size="small"   :disabled="processTemplateVo.procCategory === ''">{{$t('cm.import')}} </el-button>&ndash;&gt;-->
<!--                              <span-->
<!--                                style="-->
<!--                                  font-size: 18px;-->
<!--                                  transform: translateY(2px);-->
<!--                                  display: inline-block;-->
<!--                                "-->
<!--                                class="-->
<!--                                  cud3-icon-blue-->
<!--                                  font_family-->
<!--                                  icon-icon_more_configure-->
<!--                                "-->
<!--                              ></span>-->
<!--                              {{ $t("cm.import") }}-->
<!--                            </el-upload>-->
                          </el-dropdown-item>
                          <el-dropdown-item
                            :command="
                              beforeMoreCommandHandler(
                                'testCaseManage',
                                scope.row
                              )
                            "
                            v-if="scope.row.procStatus === 3"
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
                            {{ $t("wm.test_case_manage") }}
                          </el-dropdown-item>
                          <!-- <el-dropdown-item v-if="scope.row.procStatus === '0' || scope.row.procStatus === '2'">发布流程图</el-dropdown-item> -->
                          <!-- <el-dropdown-item :command="beforeMoreCommandHandler('flowCopy', scope.row)" v-if="scope.row.procStatus === 3">复制</el-dropdown-item> -->
                        </el-dropdown-menu>
                      </el-dropdown>
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
                    layout="total,sizes, prev, pager, next"
                    :pager-count="5"
                    :total="tablePage.total"
                  >
                  </el-pagination>
                </div>
              </el-row>
            </div>
          </el-card>
        </el-col>
        <div>
          <el-dialog
            v-dragMove="{
              DragButton: '.el-dialog__header',
              DragWindow: '.el-dialog'
            }"
            :title="
              titleCategoryDialog === 'update'
                ? $t('wm.edit_proc_cate')
                : $t('wm.add_proc_cate')
            "
            :visible.sync="categoryDialogShow"
            width="640px"
            height="90%"
            destroy-on-close
            :before-close="closeCategoryDialog"
          >
            <el-form
              ref="flowCateAdd"
              label-position="top"
              size="small"
              label-suffix="："
              :rules="categoryFormRules"
              :model="flowCateVO"
              label-width="170px"
            >
              <el-row>
                <!--分类编码-->
                <el-col :span="12">
                  <el-form-item
                    :label="$t('cm.category_code')"
                    prop="procCategoryCode"
                  >
                    <el-input
                      :placeholder="$t('cm.pleaseEnter')"
                      maxlength="32"
                      v-model="flowCateVO.procCategoryCode"
                      class="form-input"
                    ></el-input>
                  </el-form-item>
                </el-col>
                <!--分类名称-->
                <el-col :span="12">
                  <el-form-item
                    :label="$t('cm.category_name')"
                    prop="procCategoryName"
                  >
                    <el-input
                      :placeholder="$t('cm.pleaseEnter')"
                      maxlength="20"
                      v-model="flowCateVO.procCategoryName"
                      class="form-input"
                    ></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <!--父级目录-->
                <el-col :span="12">
                  <el-form-item :label="$t('cm.category_parent')">
                    <el-tag>{{ flowCateVO.procCategoryParentName }}</el-tag>
                  </el-form-item>
                </el-col>
                <!--排序-->
                <el-col :span="12">
                  <el-form-item :label="$t('cm.sort')" prop="procCategoryIndex">
                    <el-input
                      :placeholder="$t('cm.pleaseEnter')"
                      maxlength="30"
                      v-model="flowCateVO.procCategoryIndex"
                      class="form-input"
                    ></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="12" class="cud__col20">
                  <el-form-item :label="'图标'">
                    <el-select
                      v-model="flowCateVO.procIcon"
                      size="small"
                      placeholder="请选择"
                    >
                      <el-option
                        v-for="(item, index) in iconFontList"
                        :label="item.name"
                        :value="item.font_class"
                        :key="index"
                      >
                        <span
                          style="float: left; font-size: 30px"
                          :class="[family_name, 'icon-' + item.font_class]"
                        ></span>
                        <span style="float: right; margin-right: 15px">{{
                          item.name
                        }}</span>
                      </el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12" class="cud__col20">
                  <el-form-item :label="'颜色'">
                    <el-select
                      v-model="flowCateVO.procColour"
                      size="small"
                      class="color_select_after"
                      style="width: 50px"
                      placeholder=" "
                      @change="handleChange"
                      ref="colorSelect"
                    >
                      <el-option value="00AAE8" key="1" label=" ">
                        <div
                          style="
                            background-color: #00aae8;
                            margin: 6px 30px 6px 10px;
                            height: 28px;
                            text-align: center;
                          "
                        ></div>
                      </el-option>
                      <el-option value="0C7BCA" key="2" label=" ">
                        <div
                          style="
                            background-color: #0c7bca;
                            margin: 6px 30px 6px 10px;
                            height: 28px;
                            text-align: center;
                          "
                        ></div>
                      </el-option>
                      <el-option value="0069AC" key="3" label=" ">
                        <div
                          style="
                            background-color: #0069ac;
                            margin: 6px 30px 6px 10px;
                            height: 28px;
                            text-align: center;
                          "
                        ></div>
                      </el-option>
                      <el-option value="609819" key="4" label=" ">
                        <div
                          style="
                            background-color: #609819;
                            margin: 6px 30px 6px 10px;
                            height: 28px;
                            text-align: center;
                          "
                        ></div>
                      </el-option>
                      <el-option value="EC6C00" key="5" label=" ">
                        <div
                          style="
                            background-color: #ec6c00;
                            margin: 6px 30px 6px 10px;
                            height: 28px;
                            text-align: center;
                          "
                        ></div>
                      </el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <!--描述-->
                <el-col :span="24">
                  <el-form-item :label="$t('cm.describe')">
                    <el-input
                      :placeholder="$t('cm.pleaseEnter')"
                      v-model="flowCateVO.procCategoryDesc"
                      type="textarea"
                      rows="5"
                      maxlength="200"
                      show-word-limit
                      class="form-input"
                    ></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
            <div slot="footer" class="dialog-footer" align="center">
              <el-button size="small" @click="closeCategoryDialog">{{
                $t("cm.cancel")
                }}</el-button>
              <el-button
                size="small"
                type="primary"
                @click="saveFlowCateClick"
              >{{ $t("cm.commit") }}</el-button
              >
            </div>
          </el-dialog>
          <!--导出-->
        </div>
      </el-row>
    </div>
  </div>
</template>

<script>
  import processManage from "./js/processManage.js";
  export default processManage;
</script>

<style lang="less" scoped>
  //  @import "src/assets/css/style";
  .workflow_template_manage .el-table .cell {
    padding: 0;
  }
  .el-table .el-tag {
    padding: 0;
    width: 70px;
    text-align: center;
  }

  .cud_tree {
    max-height: 552px;
  }
  .color_select_after .el-icon-arrow-up:before {
    content: none;
  }
  .importClass .el-upload.el-upload--text {
    width: 100%;
    text-align: left;
  }
  /deep/ .el-card__body {
    padding: 15px 15px 0;
  }
  /deep/ .el-table__body .cell {
    line-height: none !important;
  }
  /deep/ .el-card.is-always-shadow {
    margin: 15px 22px 15px 0px;
  }
  /deep/ .cud__scroll--div {
    padding-left: 15px;
  }
</style>
