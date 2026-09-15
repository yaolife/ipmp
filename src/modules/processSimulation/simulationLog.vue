<template>
  <div class="cud-commom-form-style" v-loading="loading">
    <div class="brand">
      <breadcrumb :arrayName="brand" :hasIcon="hasIcon"></breadcrumb>
    </div>
    <div class="cud__scroll--div workflow_template_manage">
      <el-row class="cud-common-bottom-wrap">
        <!--        <el-col :span="6" class="cud-commom-tree-left"-->
        <!--                :class="{'cud-commom-tree-content-hidden': isTreeCollapse,'cud-commom-tree-content-show': !isTreeCollapse}"-->
        <!--                :style="isTreeCollapse ? { height: maxRightHeight + 'px' } : {}">-->
        <!--          <el-card>-->
        <!--            <div class="cud__tree&#45;&#45;left">-->
        <!--              <div class="cud-common-tree-content">-->
        <!--                <div class="tree-search-box">-->
        <!--                  <el-input class="tree-search mb-10 el-input-search" v-model="processCategoryFilterText" :placeholder="$t('cm.cate_filter_text')"-->
        <!--                            maxlength="20" suffix-icon="el-icon-search"></el-input>-->
        <!--                </div>-->
        <!--                <div class="cud-common-tree-title-wrap">-->
        <!--                  <span class="cud-commom-tree-title-text">-->
        <!--                    <span class="cud3-icon-blue font_family icon-icon_process_classification"></span>&nbsp;&nbsp;-->
        <!--                    {{ $t("wm.flow_manage_type") }}-->
        <!--                  </span>-->
        <!--                  <div class="cud-commom-tree-title-icon-wrap" style="min-width: 90px"></div>-->
        <!--                </div>-->
        <!--                <div class="cud__mtb-10 ml-20 mr-20" v-loading="treeLoading">-->
        <!--                  <el-tree-->
        <!--                    :data="processCategoryTreeData"-->
        <!--                    class="cud_tree"-->
        <!--                    :props="processCategoryTreeOption"-->
        <!--                    @node-click="processCategoryTreeNodeClick"-->
        <!--                    highlight-current-->
        <!--                    :filter-node-method="filterProcessCategoryTreeNode"-->
        <!--                    ref="processCategoryTree"-->
        <!--                    :expand-on-click-node="false"-->
        <!--                    node-key="id"-->
        <!--                    default-expand-all-->
        <!--                    :style="{-->
        <!--                      height: computedTreeHeight + 'px',-->
        <!--                      maxHeight: computedTreeHeight + 'px'-->
        <!--                    }"-->
        <!--                  >-->
        <!--                  </el-tree>-->
        <!--                </div>-->
        <!--              </div>-->
        <!--              <div class="cud__tree&#45;&#45;expand-trigger" :class="{ 'cud__tree&#45;&#45;expand-shadow': isTreeCollapse }" @click="toggleTreeExpand">-->
        <!--                <i v-if="isTreeCollapse" class="cud3-icon-blue el-icon-caret-right"></i>-->
        <!--                <i v-else class="cud3-icon-blue el-icon-caret-left"></i>-->
        <!--              </div>-->
        <!--            </div>-->
        <!--          </el-card>-->
        <!--        </el-col>-->

        <el-col
          :span="isTreeCollapse ? 24 : 18"
          :class="{ 'cud-all-width-resize': isTreeCollapse }"
        >
          <el-card>
            <query-form
              :queryFormId="'simulation_log'"
              :queryFields="queryFields"
              @resize="initMaxHeight"
              @submit="searchProcessTemplates"
              ref="queryForm"
              class="cud-commom-form-search">
            </query-form>
          </el-card>
          <el-card>
            <div class="cud__tree--right">
              <!-- <el-form
                label-suffix="："
                label-width="110px"
                label-position="top"
              >
                <el-row
                  class="cud__search--rowhigh cud-senior-search"
                  type="flex"
                >
                  <el-col :xs="12" :sm="12" :md="8" :lg="8">
                    <el-form-item :label="$t('测试名称')">
                      <el-input
                        v-model="processTemplateVo.procTestName"
                        size="small"
                        :placeholder="$t('cm.pleaseEnter')"
                        maxlength="64"
                      ></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="12" :sm="12" :md="8" :lg="8">
                    <el-form-item :label="$t('处理人')">
                      <PersonSelect
                        ref="personSelect"
                        :handleCallback="true"
                        @input="callName"
                        :multiple="false"
                        :value="value"
                      ></PersonSelect>
                    </el-form-item>
                  </el-col>
                  <el-col
                    :xs="12"
                    :sm="12"
                    :md="8"
                    :lg="8"
                    class="cud--right pt-23"
                  >
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
                  </el-col>
                </el-row>
              </el-form>
              <el-row class="cud__search--rowhigh">
                <div class="cud__divider"></div>
              </el-row> -->
              <div class="table-button"></div>
              <el-row
                class="cud__table--list"
                :style="{ height: maxRightHeight + 'px' }"
              >
                <el-table
                  :data="tableData"
                  :empty-text="$t('cm.nodata')"
                  border
                  stripe
                  highlight-current-row
                  :max-height="computedTableHeight"
                  header-row-class-name="cud-office-table-header"
                  class="cud-office-table"
                  @selection-change="selectChange"
                  v-loading="listLoading"
                >
                  <el-table-column
                    align="left"
                    min-width="150"
                    prop="procTestCode"
                    show-overflow-tooltip
                    :label="$t('pm.simulationLogTable.procTestCode')"
                  ></el-table-column>
                  <el-table-column
                    align="left"
                    min-width="150"
                    prop="procTestName"
                    show-overflow-tooltip
                    :label="$t('测试名称')"
                  ></el-table-column>
                  <el-table-column
                    align="left"
                    width="110"
                    show-overflow-tooltip
                    prop="procVersion"
                    :label="$t('wm.procVersion')"
                  ></el-table-column>
                  <el-table-column
                    align="left"
                    prop="createTimeStr"
                    :label="$t('模拟时间')"
                    width="140"
                  ></el-table-column>
                  <el-table-column
                    align="left"
                    prop="createUserName"
                    :label="$t('模拟人')"
                    width="140"
                  ></el-table-column>
                  <!--                  <el-table-column align="left" prop="procName" :label="$t('pm.simulationLogTable.simulationDesc')" width="140"></el-table-column>-->
                  <!--                  <el-table-column align="left" prop="procName" :label="$t('pm.simulationLogTable.simulationUser')" width="140"></el-table-column>-->
                  <!--                  <el-table-column align="left" prop="procName" :label="$t('pm.simulationLogTable.simulationTime')" width="140"></el-table-column>-->
                  <el-table-column
                    align="left"
                    prop="procName"
                    :label="$t('cm.operate')"
                    width="130"
                    fixed="right"
                  >
                    <template slot-scope="scope">
                      <span
                        style="color: #006aaf; cursor: pointer"
                        @click="toRunPage(scope.row)"
                        >查看</span
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
                  >
                  </el-pagination>
                </div>
              </el-row>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import simulationLog from "./js/simulationLog";
export default simulationLog;
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
.orgselect /deep/.previewBtn {
  top: -1px !important;
}
</style>
