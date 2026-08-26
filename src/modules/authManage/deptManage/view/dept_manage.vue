<template>
  <div class="cud-commom-form-style">
    <div class="brand">
      <breadcrumb :arrayName="brand" :hasIcon="hasIcon"></breadcrumb>
    </div>
    <div class="cud__scroll--div">
      <el-row class="cud-common-bottom-wrap">
        <el-col :span="8" class="cud-commom-tree-left"
        :class="{ 'cud-commom-tree-content-hidden': isTreeCollapse, 'cud-commom-tree-content-show': !isTreeCollapse }"
        :style="isTreeCollapse ? { height: maxRightHeight + 'px' } : {}">
          <!--分类-->
          <el-card>
            <div class="cud__tree--left">
              <div class="cud-common-tree-content">
                <div class="tree-search-box">
                  <el-input class="tree-search mb-10 el-input-search" v-model="filterText"
                    placeholder="搜索组织" maxlength="32" suffix-icon="el-icon-search"></el-input>
                </div>
                <div class="cud-common-tree-title-wrap">
                  <span class="cud-commom-tree-title-text">
                    <span class="cud3-icon-blue font_family icon-icon_process_classification"></span>
                    &nbsp;&nbsp;组织列表
                  </span>
                  <div class="cud-commom-tree-title-icon-wrap" v-if="isOptions" style="width: 55px">
                    <slot name="category_option" :code="selectedCode" :id="selectedId" />
                    <div class="cud-commom-tree-title-icon" style="width:18px" @click="dataDel">
                      <span class="cud3-icon-blue font_family icon-icon_common_delete" :title="$t('cm.delete')"></span>
                    </div>
                    <div class="cud-commom-tree-title-icon" style="width:18px" @click="dataEdit">
                      <span class="cud3-icon-blue font_family icon-icon_common_edit" :title="$t('cm.edit')"></span>
                    </div>
                    <div class="cud-commom-tree-title-icon" style="width:18px" @click="dataAdd">
                      <span class="cud3-icon-blue font_family icon-icon_common_add" :title="$t('cm.add')"></span>
                    </div>
                  </div>
                </div>
                <div class="cud__mtb-10 ml-20 mr-20">
                  <el-upload class="btn_distance" :show-file-list="false" :action="uploadUrl"
                    :with-credentials="true" :before-upload="uploadBefore" :on-success="uploadSuccess"
                    :on-progress="uploading" :on-error="uploadError" :headers="headers">
                    <el-button size="small" v-if="hasPermission('dept_manage_import')">{{ $t("cm.import") }} </el-button>
                  </el-upload>
                  <el-button size="small" :loading="loading1" @click="exportList" v-if="hasPermission('dept_manage_export')">{{ $t("cm.export") }}</el-button>
                  <el-button size="small" :loading="loading2" @click="exportTemplate" v-if="hasPermission('dept_manage_export_template')">{{ $t("dataAuth.download") }}</el-button>
                </div>
                <div class="cud__mtb-10 ml-20 mr-20">
                  <el-tree ref="categoryTree" class="cud_tree" :data="treeData" node-key="id"
                    highlight-current default-expand-all :expand-on-click-node="false"
                    @node-click="treeClick" :filter-node-method="filterTreeNode" v-loading="treeLoading"
                    :style="{ height: maxTreeHeight + 'px', maxHeight: maxTreeHeight + 'px'}">
                    <span class="custom-tree-node" slot-scope="{ node, data }">
                      <span>{{ node.label }}</span>
                      <!-- <span style="position: absolute; right: 0; margin-top: -10px;" v-if="data.id == selectedId">
                        <el-button type="text" size="mini" @click="dataAdd" v-if="hasPermission('dept_manage_add')">
                          <i class="cud3-icon-blue font_family icon-icon_common_add"></i>
                        </el-button>
                        <el-button type="text" size="mini" @click="dataEdit" v-if="hasPermission('dept_manage_edit')">
                          <i class="cud3-icon-blue font_family icon-icon_common_edit"></i>
                        </el-button>
                        <el-button type="text" size="mini" @click="dataDel" v-if="hasPermission('dept_manage_del')">
                          <i class="cud3-icon-blue font_family icon-icon_common_delete"></i>
                        </el-button>
                      </span> -->
                    </span>
                  </el-tree>
                </div>
              </div>
              <div class="cud__tree--expand-trigger box-shadow" :class="{ 'cud__tree--expand-shadow': isTreeCollapse }"
                @click="isTreeCollapse = !isTreeCollapse" v-if="!isDialog">
                <i v-if="isTreeCollapse" class="cud3-icon-blue el-icon-caret-right"></i>
                <i v-else class="cud3-icon-blue el-icon-caret-left"></i>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="14"></el-col>
        <el-col :span="isTreeCollapse ? 23 : 18" :class="{ 'cud-all-width-resize': isTreeCollapse }">
          <!--列表-->
          <el-card>
            <el-tabs v-model="activeName" @tab-click="tabsClick">
              <el-tab-pane label="组织基本信息" name="edit">
                <div class="detail" :style="{ height: maxTableHeight - 115 + 'px'}">
                  <edit-dept ref="editDeptMain" model-type="edit"></edit-dept>
                </div>
              </el-tab-pane>
              <el-tab-pane label="组织人员信息" name="user">
                <div class="person">
                  <dept-users ref="deptUsers"></dept-users>
                </div>
              </el-tab-pane>
            </el-tabs>

            <!-- <el-form label-width="110px" label-position="top" style="display: none;">
              <el-row class="cud__search--rowhigh cud-senior-search">
                <el-col :span="6">
                  <el-form-item label="组织名称">
                    <el-input class="input-small" v-model="queryVO.deptName" :placeholder="$t('dataAuth.pleaseEnter')"
                      size="small"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="英文名称">
                    <el-input class="input-small" v-model="queryVO.deptNameEng" :placeholder="$t('dataAuth.pleaseEnter')"
                      size="small"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="组织状态">
                    <el-select size="small" v-model="queryVO.deptStatus" :placeholder="$t('dataAuth.pleaseEnter')">
                      <el-option label="正常" value="正常"></el-option>
                      <el-option label="草稿" value="草稿"></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="6" class="btn_float">
                  <el-form-item label=" " class="btn_float">
                    <el-button @click="resetData" size="small">{{ $t("cm.reset") }}</el-button>
                    <el-button type="primary" @click="getDeptList" size="small">{{ $t("cm.query") }}</el-button>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row class="cud__search--rowhigh">
                <div class="cud__divider"></div>
              </el-row>
              <el-row class="cud__table--list cud__table--list-padding fssc-div-block">
                <el-table v-loading="loading" ref="childTable" row-id="id" :data="tableData"
                  :empty-text="$t('cm.nodata')" :height="maxTableHeight" highlight-current-row
                  header-row-class-name="cud-office-table-header" class="cud-office-table">
                  <el-table-column :label="$t('cm.no')" align="left" type="index" width="50"></el-table-column>
                  <el-table-column label="部门名称" align="left" prop="deptName" min-width="150"></el-table-column>
                  <el-table-column label="部门编码" align="left" prop="deptCode"></el-table-column>
                  <el-table-column label="部门级别" align="left" prop="deptRankName"></el-table-column>
                  <el-table-column label="部门名称全路径" align="left" prop="deptNamePath" min-width="200" :show-overflow-tooltip="true"></el-table-column>
                  <el-table-column label="状态" align="left" prop="deptStatus"></el-table-column>
                  <el-table-column label="生效时间" align="left" prop="deptBuildDate" min-width="180"></el-table-column>
                  <el-table-column :label="$t('cm.operate')" fixed="right" width="180">
                    <template slot-scope="scope">
                      <el-button type="text" class="cud-common-operate-edit" size="small" @click="dataList(scope.row)">人员列表</el-button>
                      <el-button type="text" class="cud-common-operate-edit" size="small" @click="dataEdit(scope.row)">{{ $t("cm.update") }}</el-button>
                      <el-button class="cud-common-operate-delete" type="text" size="small" @click="dataDel(scope.row)">{{ $t("cm.delete") }}</el-button>
                    </template>
                  </el-table-column>
                </el-table>
                <el-col :span="24">
                  <div class="cud-special-pagination cud-special-pagination-button">
                    <div class="pagination-button">
                      <el-button type="primary" size="small" @click="dataAdd()">{{ $t("cm.add") }}</el-button>
                      <el-upload class="btn_distance" :show-file-list="false" :action="uploadUrl"
                        :with-credentials="true" :before-upload="uploadBefore" :on-success="uploadSuccess"
                        :on-progress="uploading" :on-error="uploadError" :headers="headers">
                        <el-button size="small">{{ $t("cm.import") }} </el-button>
                      </el-upload>
                      <el-button size="small" :loading="loading1" @click="exportList">{{ $t("cm.export") }}</el-button>
                      <el-button size="small" :loading="loading2" @click="exportTemplate">{{ $t("dataAuth.download") }}</el-button>
                    </div>
                    <el-pagination popper-class="cud-pager-dropdown" ref="pager" class="cud__page" @size-change="changeSize"
                      @current-change="changeCurrentPage" :current-page="tablePage.pageIndex"
                      :page-sizes="[10, 20, 30, 40]" :page-size="tablePage.pageSize"
                      layout="total, sizes, prev, pager, next, jumper" :total="tablePage.total">
                    </el-pagination>
                  </div>
                </el-col>
              </el-row>
            </el-form> -->
          </el-card>
        </el-col>
      </el-row>
    </div>
    <!--用户信息-->
    <el-dialog :visible.sync="modelIsOpen" :title="modelTitle" width="800px" :close-on-click-modal="false">
      <edit-dept ref="editDept" :model-type="modelType" @modelOpen="modelOpen" @updateList="updateList"></edit-dept>
    </el-dialog>
  </div>
</template>

<script>
  import deptManage from "../js/dept_manage";
  export default deptManage;
</script>
<style lang="less" scoped>
  .btn_distance {
    display: inline;
  }

  .btn_float {
    float: right;
  }

  /deep/.detail .el-form-item {
    padding: 5px 0 !important;
  }

  /deep/.detail .el-form-item__label {
    float: left !important;
  }
  /deep/.detail .el-input__prefix {
    // margin-top: 5px;
  }

  /deep/.el-tabs .el-tabs__active-bar {
    left: 0 !important;
  }
</style>
