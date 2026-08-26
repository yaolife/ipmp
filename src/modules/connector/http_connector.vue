<template>
  <div class="cud-commom-form-style">
    <div class="brand">
      <breadcrumb :arrayName="brand" :hasIcon="hasIcon"></breadcrumb>
    </div>
    <div class="cud__scroll--div">
      <el-row>
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
                  >
                  </el-input>
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
                    >&nbsp;&nbsp;{{ $t("hc.http_class") }}</span
                  >
                  <div class="cud-commom-tree-title-icon-wrap">
                    <div
                      class="cud-commom-tree-title-icon"
                      @click="classDelete"
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
                    <div class="cud-commom-tree-title-icon" @click="classEdit">
                      <span
                        class="cud3-icon-blue font_family icon-icon_common_edit"
                        :title="$t('cm.edit')"
                      ></span>
                    </div>
                    <div class="cud-commom-tree-title-icon" @click="classAdd">
                      <span
                        class="cud3-icon-blue font_family icon-icon_common_add"
                        :title="$t('cm.add')"
                      ></span>
                    </div>
                  </div>
                </div>
                <div class="cud__mtb-10 ml-20 mr-20">
                  <el-tree
                    node-key="classId"
                    :data="classTreeList"
                    class="cud_tree"
                    @node-click="classClick"
                    highlight-current
                    :filter-node-method="classFilter"
                    ref="classTree"
                    :style="{
                      height: computedTreeHeight + 'px',
                      maxHeight: computedTreeHeight + 'px',
                    }"
                  >
                    <span class="custom-tree-node" slot-scope="{ node, data }">
                      <!-- <el-tooltip class="item" effect="dark" :content="data.className" placement="top-start"> -->
                      <span>{{ ellipsis(data.className, 40) }}</span>
                      <!-- </el-tooltip> -->
                    </span>
                  </el-tree>
                </div>
              </div>
              <div
                class="cud__tree--expand-trigger"
                :class="{ 'cud__tree--expand-shadow': isTreeCollapse }"
                @click="classToggle"
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
                :queryFormId="'http_connector'"
                :queryFields="queryFields"
                @resize="initMaxHeight"
                @submit="dataSearch"
                ref="queryForm"
                class="cud-commom-form-search">
              </query-form>
              <div class="table-button">
                <el-button
                  @click="dataAdd()"
                  type="primary"
                  size="small"
                  v-if="btnShow('http_connector_add')"
                  >{{ $t("cm.add") }}</el-button
                >
                <el-upload
                  :headers="headersOptions"
                  action=""
                  accept=".xls"
                  :http-request="dataImport"
                  :show-file-list="false"
                  style="display: inline"
                  ><el-button size="small">{{
                    $t("hc.http_list_import")
                  }}</el-button>
                </el-upload>
                <el-button @click="dataExport" size="small">{{
                  $t("hc.http_list_export")
                }}</el-button>
                <el-button @click="classMove" size="small"
                  >修改分类</el-button
                >
              </div>
              <el-form
                size="small"
                label-suffix="："
                label-width="110px"
                label-position="left"
              >
                <el-row
                  class="cud__table--list"
                  :style="{ height: computedTableHeight + 'px' }"
                  :class="{ 'cud__table--list-padding': isTreeCollapse }"
                >
                  <el-table
                    :data="dataList"
                    ref="otherInterfaceTable"
                    :empty-text="$t('cm.nodata')"
                    border
                    stripe
                    :max-height="computedTableHeight"
                    highlight-current-row
                    header-row-class-name="cud-office-table-header"
                    class="cud-office-table"
                    :default-sort="{ prop: 'createTime', order: 'descending' }"
                    @selection-change="selectChange"
                  >
                    <el-table-column
                      :label="$t('cm.choose')"
                      type="selection"
                    ></el-table-column>
                    <el-table-column
                      align="left"
                      prop="name"
                      :label="$t('hc.http_name')"
                      show-overflow-tooltip
                      min-width="150"
                    >
                      <template slot-scope="scope">
                        <div class="cud-commom-process-name">
                          {{ scope.row.connectorName }}
                        </div>
                      </template>
                    </el-table-column>
                    <el-table-column
                      align="left"
                      prop="domain"
                      :label="$t('hc.http_domain')"
                      min-width="150"
                      :show-overflow-tooltip="true"
                    ></el-table-column>
                    <el-table-column
                      align="left"
                      prop="authType"
                      :label="$t('hc.http_auth_type')"
                      min-width="100"
                      :show-overflow-tooltip="true"
                    >
                      <template slot-scope="scope">
                        <span v-if="scope.row.authType == '0'">{{
                          $t("hc.http_auth_type_0")
                        }}</span>
                        <span v-if="scope.row.authType == '1'">{{
                          $t("hc.http_auth_type_1")
                        }}</span>
                        <span v-if="scope.row.authType == '2'">{{
                          $t("hc.http_auth_type_2")
                        }}</span>
                        <span v-if="scope.row.authType == '3'">{{
                          $t("hc.http_auth_type_3")
                        }}</span>
                      </template>
                    </el-table-column>
                    <!-- <el-table-column align="left" prop="protocol" :label="$t('hc.http_protocol')" min-width="100" :show-overflow-tooltip='true'>
                      <template slot-scope="scope">
                        <span v-if="scope.row.protocol == '0'">http</span>
                        <span v-if="scope.row.protocol == '1'">https</span>
                      </template>
                    </el-table-column> -->
                    <!-- <el-table-column align="left" prop="requestMethod" :label="$t('hc.http_request_method')" min-width="80" :show-overflow-tooltip='true'>
                      <template slot-scope="scope">
                        <span v-if="scope.row.requestMethod == '0'">GET</span>
                        <span v-if="scope.row.requestMethod == '1'">POST</span>
                      </template>
                    </el-table-column> -->
                    <el-table-column
                      align="left"
                      prop="createUser"
                      :label="$t('hc.http_creator')"
                      min-width="150"
                      show-overflow-tooltip
                    ></el-table-column>
                    <el-table-column
                      align="left"
                      width="180"
                      :label="$t('hc.http_createtime')"
                      sortable
                      prop="createTime"
                    >
                      <!-- <template slot-scope="scope">
                        {{ filters(scope.row.createTime) }}
                      </template> -->
                    </el-table-column>
                    <el-table-column
                      align="left"
                      :label="$t('cm.operate')"
                      min-width="160"
                    >
                      <template slot-scope="scope">
                        <el-button
                          type="text"
                          size="small"
                          class="cud-common-operate-edit"
                          @click="dataEdit(scope.row.connectorId)"
                          v-if="btnShow('http_connector_edit')"
                          >{{ $t("cm.edit") }}</el-button
                        >
                        <el-button
                          type="text"
                          size="small"
                          class="cud-common-operate-delete"
                          @click="dataDelete(scope.row.connectorId)"
                          v-if="btnShow('http_connector_delete')"
                          >{{ $t("cm.delete") }}</el-button
                        >
                        <!-- <el-button type="text" size="small" class="cud-common-operate-edit" @click="showRelation(scope.row.connectorId, scope.row.connectorName)">
                          {{ $t("cm.commonRelatedetail") }}</el-button> -->
                        <el-dropdown
                          trigger="click"
                          @command="
                            (command) => moreCommand(command, scope.row)
                          "
                          size="small"
                          placement="top"
                        >
                          <span class="el-dropdown-link"
                            >{{ $t("cm.more")
                            }}<i class="el-icon-arrow-down"></i
                          ></span>
                          <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item command="relation">
                              <span
                                style="font-size: 14px; margin: 0 2px"
                                class="cud3-icon-blue font_family el-icon-view"
                              ></span>
                              {{ $t("cm.commonRelatedetail") }}
                            </el-dropdown-item>
                            <el-dropdown-item command="log">
                              <span
                                style="font-size: 14px; margin: 0 2px"
                                class="
                                  cud3-icon-blue
                                  font_family
                                  el-icon-tickets
                                "
                              ></span>
                              {{ $t("hc.connector_log") }}
                            </el-dropdown-item>
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
                      @size-change="pageSizeChange"
                      @current-change="pageNumberChange"
                      :current-page="pageNumber"
                      :page-sizes="[10, 20, 30, 40]"
                      :page-size="pageSize"
                      layout="total,sizes, prev, pager, next"
                      :pager-count="5"
                      :total="pageTotal"
                    >
                    </el-pagination>
                  </div>
                </el-row>
              </el-form>
            </div>
          </el-card>
        </el-col>
      </el-row>
      <!--编辑分类-->
      <el-dialog
        v-dragMove="{
          DragButton: '.el-dialog__header',
          DragWindow: '.el-dialog',
        }"
        :title="$t('hc.http_class_edit')"
        destroy-on-close
        :visible.sync="editVisible"
        width="640px"
      >
        <el-form
          ref="editForm"
          size="small"
          label-position="top"
          label-suffix="："
          :rules="rules"
          :model="edit"
          label-width="170px"
        >
          <el-row>
            <el-col :span="24">
              <el-form-item :label="$t('hc.http_class_name')" prop="className">
                <el-input v-model="edit.className" maxlength="32"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer" align="center">
          <el-button size="small" @click="editVisible = false">{{
            $t("cm.cancel")
          }}</el-button>
          <el-button size="small" type="primary" @click="classSave()">{{
            $t("cm.commit")
          }}</el-button>
        </div>
      </el-dialog>
      <!--修改分类-->
      <el-dialog
        v-dragMove="{
          DragButton: '.el-dialog__header',
          DragWindow: '.el-dialog',
        }"
        :title="$t('hc.http_class_move')"
        destroy-on-close
        :visible.sync="moveVisible"
        width="640px"
      >
        <el-form
          ref="editForm"
          size="small"
          label-position="top"
          label-suffix="："
          :rules="rules"
          :model="edit"
          label-width="170px"
        >
          <el-row>
            <el-col :span="24">
              <el-form-item :label="$t('hc.http_class_name')" prop="className">
                <el-select v-model="classMoveId" placeholder="请选择">
                  <el-option
                    v-for="item in classTreeList"
                    :key="item.classId"
                    :label="item.className"
                    :value="item.classId"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer" align="center">
          <el-button size="small" @click="moveVisible = false">{{
            $t("cm.cancel")
          }}</el-button>
          <el-button size="small" type="primary" @click="classMoveSubmit()">{{
            $t("cm.commit")
          }}</el-button>
        </div>
      </el-dialog>
      <!--引用详情-->
      <el-dialog
        :title="relationTitle + ' ' + $t('cm.commonRelatedetail')"
        :visible.sync="relationVisible"
        destroy-on-close
        width="70%"
        v-dragMove="{
          DragButton: '.el-dialog__header',
          DragWindow: '.el-dialog',
        }"
      >
        <query-form
          :queryFormId="'http_connector2'"
          :queryFields="queryFields2"
          @submit="relationSearch"
          ref="queryForm2"
          class="cud-commom-form-search">
        </query-form>

        <div class="cud__table--list">
          <el-table
            :data="relationData"
            :empty-text="$t('cm.nodata')"
            ref="ruleDetailTable"
            v-loading="relationLoading"
          >
            <el-table-column
              align="left"
              :label="$t('form.form_name')"
              prop="formName"
            ></el-table-column>
            <el-table-column
              align="left"
              :label="$t('form.form_cate')"
              prop="formCategoryName"
            ></el-table-column>
            <el-table-column
              align="left"
              :label="$t('form.version')"
              prop="version"
              width="80"
            ></el-table-column>
            <el-table-column align="left" :label="$t('hc.http_name')">{{
              relationTitle
            }}</el-table-column>
            <el-table-column
              align="left"
              :label="$t('hc.http_action_name')"
              prop="requestName"
            ></el-table-column>
            <el-table-column
              align="left"
              :label="$t('hc.http_action_id')"
              prop="requestId"
            ></el-table-column>
            <!-- <el-table-column align="left" :label="$t('cm.operate')" width="80">
            <template slot-scope="scope">
              <el-button type="text" size="small" class="cud-common-operate-delete" @click="relationDelete(scope.row.formId)">
                {{$t('cm.delete')}}</el-button>
            </template>
          </el-table-column> -->
          </el-table>
        </div>

        <div class="cud-special-pagination">
          <el-pagination popper-class="cud-pager-dropdown"
            :current-page="relationCurrent"
            :page-sizes="[10, 20, 30, 40]"
            size="small"
            :total="relationTotal"
            @current-change="relationChangeCurrent"
            @size-change="relationChangeSize"
            class="cud__page"
            layout="total,sizes, prev, pager, next"
            :pager-count="5"
            ref="detailPage"
          >
          </el-pagination>
        </div>
        <div
          style="
            margin-top: 50px;
            width: 100%;
            display: flex;
            justify-content: center;
          "
        >
          <el-button
            size="small"
            type="primary"
            @click="relationVisible = !relationVisible"
            >{{ $t("cm.close") }}</el-button
          >
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import httpConnector from "./js/http_connector.js";
export default httpConnector;
</script>

<style lang="less" scoped>
// @import "src/assets/css/style";
/deep/ .el-dialog__body {
  height: auto !important;
  padding: 10px 15px 5px;
}
/deep/.search-collapse-content .cud__search--triangle {
  left: 300px !important;
}
/deep/ .el-card__body {
  padding: 15px 15px 0px;
}
/deep/ .el-checkbox:last-of-type {
  margin-right: 11px;
}
/deep/ .el-card.is-always-shadow {
  margin: 15px 22px 15px 0px;
}
/deep/ .cud__scroll--div {
  padding-left: 15px;
}
/deep/ .el-dialog__body {
  padding: 15px !important;
}
/deep/ .el-table-column--selection .cell {
  text-overflow: unset;
}
</style>
