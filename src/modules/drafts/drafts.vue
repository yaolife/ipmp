<template>
  <div class="cud-commom-form-style">
    <div class="cud__scroll--div">
      <el-row>
        <el-col
          v-if="!detailVisible"
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
                    v-model="filterText"
                    :placeholder="$t('lang.resource_search_placeholder')"
                    maxlength="32"
                    suffix-icon="el-icon-search"
                    size="small"
                    clearable
                  >
                  </el-input>
                </div>
                <div class="cud-common-tree-title-wrap">
                  <span class="cud-commom-tree-title-text">
                    <span
                      class="cud3-icon-blue font_family icon-icon_process_classification"
                    ></span>
                    &nbsp;&nbsp;{{ $t("lang.resource_catalog") }}
                  </span>
                </div>
                <div class="cud__mtb-10 ml-20 mr-20" v-loading="treeLoading">
                  <el-tree
                    ref="resourceTree"
                    node-key="id"
                    :data="treeData"
                    :props="treeProps"
                    highlight-current
                    default-expand-all
                    :expand-on-click-node="false"
                    :filter-node-method="filterTreeNode"
                    :style="{
                      height: computedTreeHeight + 'px',
                      maxHeight: computedTreeHeight + 'px'
                    }"
                    class="cud_tree"
                    @node-click="onTreeNodeClick"
                  >
                    <span class="custom-tree-node" slot-scope="{ node }">
                      <span>{{ node.label }}</span>
                    </span>
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
          :span="detailVisible ? 24 : isTreeCollapse ? 23 : 18"
          :class="{ 'cud-all-width-resize': isTreeCollapse || detailVisible }"
        >
          <el-card
            v-if="detailVisible"
            class="pipe-detail-card"
            :style="{ height: computedDetailHeight + 'px' }"
          >
            <pipe-detail
              :pipeline-id="currentPipelineId"
              @back="closeDetail"
              @updated="getList"
            ></pipe-detail>
          </el-card>
          <template v-else>
          <el-card>
            <query-form
              :queryFormId="'pipeDatabase'"
              :queryFields="queryFields"
              :loading="loading"
              :showMoreSetting="false"
              labelWidth="180px"
              @resize="initMaxHeight"
              @submit="search"
              @reset="resetList"
              ref="queryForm"
              class="cud-commom-form-search"
            >
            </query-form>
          </el-card>
          <el-card>
            <div class="table-button">
                <el-button size="small" @click="downloadTemplate">{{
                  $t("lang.download_template")
                }}</el-button>
                <el-button size="small" @click="exportList">{{
                  $t("cm.export")
                }}</el-button>
                <el-button size="small" @click="triggerImport">{{
                  $t("lang.batch_import")
                }}</el-button>
                <input
                  ref="importInput"
                  type="file"
                  accept=".xls,.xlsx,.csv"
                  style="display: none"
                  @change="onImportFile"
                />
              </div>
              <el-row
                class="cud__table--list"
                :style="{ height: computedTableHeight + 'px' }"
              >
                <el-table
                  :data="tableData"
                  ref="multipleSelection"
                  @selection-change="handleSelectionChange"
                  v-loading="loading"
                  :empty-text="$t('cm.nodata')"
                  highlight-current-row
                  border
                  stripe
                  :max-height="computedTableHeight"
                  header-row-class-name="cud-office-table-header"
                  class="cud-office-table"
                >
                  <el-table-column
                    align="center"
                    type="selection"
                    width="55"
                  ></el-table-column>
                  <el-table-column
                    align="center"
                    type="index"
                    :label="$t('cm.no')"
                    width="60"
                    :index="indexMethod"
                  ></el-table-column>
                  <el-table-column
                    align="center"
                    prop="pipelineNo"
                    :label="$t('lang.pipe_code')"
                    min-width="140"
                    show-overflow-tooltip
                  ></el-table-column>
                  <el-table-column
                    align="center"
                    prop="pipelineName"
                    :label="$t('lang.pipe_name')"
                    min-width="160"
                    show-overflow-tooltip
                  ></el-table-column>
                  <el-table-column
                    align="center"
                    prop="pipelineNo"
                    :label="$t('lang.pipeline_no')"
                    min-width="140"
                    show-overflow-tooltip
                  ></el-table-column>
                  <el-table-column
                    align="center"
                    prop="workingMedium"
                    :label="$t('lang.working_medium')"
                    min-width="120"
                    show-overflow-tooltip
                  ></el-table-column>
                  <el-table-column
                    align="center"
                    prop="responsiblePerson"
                    :label="$t('lang.pipe_owner')"
                    min-width="100"
                    show-overflow-tooltip
                  ></el-table-column>
                  <el-table-column
                    align="center"
                    prop="modifyDate"
                    :label="$t('lang.update_time')"
                    min-width="170"
                    show-overflow-tooltip
                  ></el-table-column>
                  <el-table-column
                    align="center"
                    :label="$t('cm.operate')"
                    width="180"
                    fixed="right"
                  >
                    <template slot-scope="scope">
                      <el-button
                        type="text"
                        size="small"
                        class="cud-common-operate-edit"
                        @click="viewRow(scope.row)"
                        >{{ $t("lang.detail") }}</el-button
                      >
                      <el-button
                        type="text"
                        size="small"
                        class="cud-common-operate-edit"
                        @click="downloadRow(scope.row)"
                        >{{ $t("cm.download") }}</el-button
                      >
                      <el-button
                        type="text"
                        size="small"
                        class="cud-common-operate-delete"
                        @click="deleteRow(scope.row)"
                        >{{ $t("cm.delete") }}</el-button
                      >
                    </template>
                  </el-table-column>
                </el-table>
              </el-row>
              <el-row>
                <div class="cud-special-pagination cud-special-pagination-button">
                  <el-pagination
                    popper-class="cud-pager-dropdown"
                    ref="pager"
                    class="cud__page"
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page="current"
                    :page-sizes="[10, 20, 30, 40]"
                    :page-size="size"
                    layout="total,sizes, prev, pager, next"
                    :pager-count="5"
                    :total="total"
                    :disabled="loading"
                  >
                  </el-pagination>
                </div>
              </el-row>
          </el-card>
          </template>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import drafts from "./js/drafts.js";
export default drafts;
</script>
<style lang="less" scoped>
/deep/ .el-button--text {
  user-select: unset;
}
.table-button {
  text-align: right;
}
/deep/ .el-form-item__label {
  white-space: nowrap;
}
.custom-tree-node {
  font-size: 14px;
}
/deep/ .cud_tree {
  overflow: auto;
}
.cud-commom-tree-left /deep/ .el-card {
  height: 100%;
}
.pipe-detail-card {
  box-sizing: border-box;
}
.pipe-detail-card /deep/ .el-card__body {
  height: 100%;
  padding: 16px 20px 16px;
  box-sizing: border-box;
  overflow: hidden;
}
</style>
