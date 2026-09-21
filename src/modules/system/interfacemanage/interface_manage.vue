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
                    v-model="appFilterText"
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
                    >&nbsp;&nbsp;{{ $t("sys.application") }}</span
                  >
                  <div
                    class="cud-commom-tree-title-icon-wrap"
                    style="min-width: 90px"
                  >
                    <div
                      class="cud-commom-tree-title-icon"
                      @click="removeAppFamily"
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
                      @click="udpAppFamily"
                    >
                      <span
                        class="cud3-icon-blue font_family icon-icon_common_edit"
                        :title="$t('cm.edit')"
                      ></span>
                    </div>
                    <div
                      class="cud-commom-tree-title-icon"
                      @click="addAppFamily"
                    >
                      <span
                        class="cud3-icon-blue font_family icon-icon_common_add"
                        :title="$t('cm.add')"
                      ></span>
                    </div>
                  </div>
                </div>

                <div class="cud__mtb-10 ml-20 mr-20">
                  <el-tree
                    :data="appDataList"
                    :props="appTreeOption"
                    class="cud_tree"
                    @node-click="appTreeNodeClick"
                    highlight-current
                    :filter-node-method="filterAppTreeNode"
                    ref="appTree"
                    node-key="registAppId"
                    :current-node-key="nodeKey"
                    :style="{
                      height: computedTreeHeight + 'px',
                      maxHeight: computedTreeHeight + 'px',
                    }"
                  >
                    <span class="custom-tree-node" slot-scope="{ node, data }">
                      <el-tooltip
                        class="item"
                        effect="dark"
                        :content="node.label"
                        placement="top-start"
                      >
                        <span>{{ ellipsis(node.label, 40) }}</span>
                      </el-tooltip>
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
          :span="isTreeCollapse ? 23 : 18"
          :class="{ 'cud-all-width-resize': isTreeCollapse }"
        >
          <!-- <el-card> -->
          <div class="dict_manage cud-cgn-task-center" style="margin-top: 10px">
            <el-tabs
              v-model="tabName"
              @tab-click="toggleTab"
              class="dict_tab cgn-task-tabs"
            >
              <el-tab-pane
                :label="$t('sys.external_interface')"
                name="otherSysInter"
                class="cud-task-list"
                :class="{ 'cud-iscur-tab': tabName === 'otherSysInter' }"
                v-if="currentTreeNode.appCode !== currentLocalAppCode"
              >
                <div class="cud__tree--right">
                  <el-form
                    size="small"
                    label-suffix="："
                    label-width="110px"
                    label-position="top"
                  >
                    <el-row
                      class="cud__search--rowhigh cud-senior-search"
                      type="flex"
                    >
                      <el-col :xs="12" :sm="12" :md="8" :lg="8">
                        <el-form-item :label="$t('sys.interface_name')">
                          <el-input
                            :placeholder="$t('cm.pleaseEnter')"
                            maxlength="200"
                            v-model="otherInterfaceQueryModel.interName"
                          ></el-input>
                        </el-form-item>
                      </el-col>
                      <el-col :xs="12" :sm="12" :md="8" :lg="8">
                        <el-form-item :label="$t('sys.interface_url')">
                          <el-input
                            :placeholder="$t('cm.pleaseEnter')"
                            maxlength="256"
                            v-model="otherInterfaceQueryModel.interUrl"
                          ></el-input>
                        </el-form-item>
                      </el-col>
                      <el-col
                        :xs="12"
                        :sm="12"
                        :md="8"
                        :lg="8"
                        class="cud--right pt-30"
                      >
                        <!-- <el-form-item label=" "> -->
                        <el-button
                          class="mr-10"
                          type="primary"
                          size="small"
                          @click="otherSearch"
                          >{{ $t("cm.search") }}</el-button
                        >
                        <el-button size="small" @click="otherReset">{{
                          $t("cm.reset")
                        }}</el-button>
                        <!-- </el-form-item> -->
                      </el-col>
                    </el-row>
                    <el-row class="cud__search--rowhigh">
                      <div class="cud__divider"></div>
                    </el-row>
                    <div class="table-button">
                      <el-button
                        type="primary"
                        size="small"
                        @click="addOtherInterface"
                        >{{ $t("cm.add") }}</el-button
                      >
                    </div>
                    <el-row
                      class="cud__table--list"
                      :class="{ 'cud__table--list-padding': isTreeCollapse }"
                      :style="{ height: computedTableHeight + 'px' }"
                    >
                      <el-table
                        :data="otherInterfaceTableData"
                        ref="otherInterfaceTable"
                        :empty-text="$t('cm.nodata')"
                        border
                        stripe
                        :max-height="computedTableHeight"
                        highlight-current-row
                        header-row-class-name="cud-office-table-header"
                        :default-sort="{ prop: 'createDateTimeStr', order: 'descending' }"
                        class="cud-office-table"
                      >
                        <!-- <el-table-column align="left" type="index" :label="$t('cm.no')" width="70"></el-table-column> -->
                        <div style="display: inline-block" v-if="show">
                          <el-table-column
                            align="left"
                            prop="registInterId"
                          ></el-table-column>
                          <el-table-column
                            align="left"
                            prop="subInterName"
                          ></el-table-column>
                          <el-table-column
                            align="left"
                            prop="subInterUrl"
                          ></el-table-column>
                          <el-table-column
                            align="left"
                            prop="subAppCode"
                          ></el-table-column>
                        </div>
                        <el-table-column
                          align="left"
                          prop="interName"
                          :label="$t('sys.interface_name')"
                          :show-overflow-tooltip="true"
                          width="300"
                        >
                          <template slot-scope="scope">
                            <!-- <el-button type="text" size="small" @click="handleClick(scope.row)">{{scope.row.interName}}</el-button> -->
                            <el-button
                              type="text"
                              size="small"
                              @click="handleClick(scope.row)"
                              >{{ scope.row.interName }}</el-button
                            >
                          </template>
                        </el-table-column>
                        <el-table-column
                          align="left"
                          prop="interUrl"
                          label="接口地址"
                          width="80"
                          :show-overflow-tooltip="true"
                        ></el-table-column>
                        <el-table-column
                          align="left"
                          prop="interCode"
                          :label="$t('sys.interface_code')"
                          width="80"
                          :show-overflow-tooltip="true"
                        ></el-table-column>
                        <el-table-column
                          align="left"
                          prop="interStatus"
                          :label="$t('sys.status')"
                          width="100"
                        >
                          <template slot-scope="scope">
                            <el-tag
                              class="cud-tb-tag"
                              v-if="scope.row.interStatus === '1'"
                              type="success"
                            >
                              <i
                                class="cud-el-icon-point"
                                style="background: #41b048"
                              ></i>
                              已启用
                            </el-tag>
                            <el-tag
                              class="cud-tb-tag"
                              v-if="scope.row.interStatus === '0'"
                              type="danger"
                            >
                              <i
                                class="cud-el-icon-point"
                                style="background: #e94848"
                              ></i>
                              已禁用
                            </el-tag>
                          </template>
                        </el-table-column>
                        <el-table-column
                          align="left"
                          prop="interType"
                          :label="$t('sys.interface_type')"
                          width="80"
                          :show-overflow-tooltip="true"
                        >
                          <template slot-scope="scope">
                            <span v-if="scope.row.interType === '0'">http</span>
                            <span v-if="scope.row.interType === '1'"
                              >https</span
                            >
                            <span v-if="scope.row.interType === '2'"
                              >Webservice</span
                            >
                            <span v-if="scope.row.interType === '3'">MQ</span>
                            <span v-if="scope.row.interType === '5'">中台</span>
                            <span v-if="scope.row.interType === '4'"
                              >自定义</span
                            >
                          </template>
                        </el-table-column>
                        <el-table-column
                          align="left"
                          prop="requestType"
                          :label="$t('sys.interface_req')"
                          width="110"
                          :show-overflow-tooltip="true"
                        >
                          <template slot-scope="scope">
                            <span v-if="scope.row.requestType === '1'"
                              >GET</span
                            >
                            <span v-if="scope.row.requestType === '2'"
                              >POST</span
                            >
                          </template>
                        </el-table-column>
                        <el-table-column
                          align="left"
                          prop="interactionType"
                          :label="$t('sys.interface_action')"
                          width="110"
                          ><!--  v-if="isLocalSystem" -->
                          <template slot-scope="scope">
                            <span v-if="scope.row.interactionType === '0'"
                              >异步接口</span
                            >
                            <span v-if="scope.row.interactionType === '1'"
                              >同步接口</span
                            >
                            <span v-if="scope.row.interactionType === '2'"
                              >异步回调</span
                            >
                          </template>
                        </el-table-column>
                        <el-table-column
                          align="left"
                          prop="subInterCode"
                          :label="$t('sys.sub_interface')"
                          width="90"
                          :show-overflow-tooltip="true"
                        >
                          <template slot-scope="scope">
                            <el-button
                              type="text"
                              size="small"
                              @click="handleSubClick(scope.row)"
                              >{{ scope.row.subInterCode }}</el-button
                            >
                          </template>
                        </el-table-column>
                        <!-- <el-table-column align="left" prop="interUrl" :label="$t('sys.interface_url')" min-width="150"></el-table-column> -->
                        <el-table-column
                          align="left"
                          prop="createUserName"
                          :label="$t('cm.creat_by')"
                          width="150"
                          :show-overflow-tooltip="true"
                        ></el-table-column>
                        <el-table-column
                          align="left"
                          label="创建时间"
                          width="140"
                          sortable
                          prop="createDateTimeStr"
                        >
                          <!-- <template slot-scope="scope">
                            {{ filters(scope.row.createDateTimeStr) }}
                          </template> -->
                          </el-table-column>
                        <!-- <el-table-column align="left" prop="createDateTimeStr" :label="$t('cm.creat_time')" min-width="140"></el-table-column> -->
                        <el-table-column
                          align="left"
                          :label="$t('cm.operate')"
                          width="180"
                        >
                          <template slot-scope="scope">
                            <el-button
                              type="text"
                              size="small"
                              class="cud-common-operate-edit"
                              @click="editOtherInterface(scope.row)"
                            >
                              {{ $t("cm.edit") }}</el-button
                            >
                            <el-button
                              type="text"
                              size="small"
                              class="cud-common-operate-delete"
                              @click="deleteInterface(scope.row)"
                            >
                              {{ $t("cm.delete") }}</el-button
                            >
                            <el-dropdown
                              @command="moreCommandHandler"
                              trigger="click"
                            >
                              <span class="el-dropdown-link"
                                >{{ $t("cm.more")
                                }}<i class="el-icon-arrow-down"></i>
                              </span>
                              <el-dropdown-menu slot="dropdown">
                                <el-dropdown-item
                                  :command="
                                    beforeMoreCommandHandler(
                                      'enableInterface',
                                      scope.row
                                    )
                                  "
                                  v-if="
                                    scope.row.interStatus === '0' &&
                                    currentTreeNode.appCode !== '1'
                                  "
                                >
                                  <span
                                    class="
                                      cud3-icon-blue
                                      font_family
                                      icon-icon_more_star
                                    "
                                  ></span>
                                  {{ $t("cm.enable") }}
                                </el-dropdown-item>
                                <el-dropdown-item
                                  :command="
                                    beforeMoreCommandHandler(
                                      'fobiddenInterface',
                                      scope.row
                                    )
                                  "
                                  v-if="
                                    scope.row.interStatus === '1' &&
                                    currentTreeNode.appCode !== '1'
                                  "
                                >
                                  <span
                                    class="
                                      cud3-icon-blue
                                      font_family
                                      icon-icon_more_disable
                                    "
                                  ></span>
                                  {{ $t("cm.disable") }}
                                </el-dropdown-item>
                                <!-- <el-dropdown-item :command="beforeMoreCommandHandler('interfaceParams', scope.row)">
                                                <span class="cud3-icon-blue font_family icon-icon_more_disable"></span> 参数配置
                                            </el-dropdown-item> -->
                              </el-dropdown-menu>
                            </el-dropdown>
                          </template>
                        </el-table-column>
                      </el-table>
                    </el-row>
                    <el-row>
                      <div
                        style="margin-bottom: 0"
                        class="
                          cud-special-pagination cud-special-pagination-button
                        "
                      >
                        <el-pagination popper-class="cud-pager-dropdown"
                          ref="pager"
                          class="cud__page"
                          @size-change="handleOtherSizeChange"
                          @current-change="handleOtherCurrentChange"
                          :current-page="otherCurrent"
                          :page-sizes="[10, 20, 30, 40]"
                          :page-size="otherSize"
                          layout="total,sizes, prev, pager, next"
                          :pager-count="5"
                          :total="otherTotal"
                        >
                        </el-pagination>
                      </div>
                    </el-row>
                  </el-form>
                </div>
              </el-tab-pane>
              <el-tab-pane
                :label="$t('sys.internal_interface')"
                name="localSysInter"
                :class="{ 'cud-iscur-tab': tabName === 'localSysInter' }"
              >
                <div class="cud__tree--right">
                  <query-form
                    :queryFormId="'interface_manage'"
                    :queryFields="queryFields"
                    @resize="initMaxHeight"
                    @submit="localSearch"
                    ref="queryForm"
                    class="cud-commom-form-search">
                  </query-form>

                  <el-form
                    size="small"
                    label-suffix="："
                    label-width="110px"
                    label-position="top"
                  >
                    <!-- <el-row
                      class="cud__search--rowhigh cud-senior-search"
                      type="flex"
                    >
                      <el-col :xs="12" :sm="12" :md="8" :lg="8">
                        <el-form-item :label="$t('sys.interface_name')">
                          <el-input
                            :placeholder="$t('cm.pleaseEnter')"
                            maxlength="200"
                            v-model="localInterfaceQueryModel.interName"
                          ></el-input>
                        </el-form-item>
                      </el-col>
                      <el-col :xs="12" :sm="12" :md="8" :lg="8">
                        <el-form-item :label="$t('sys.interface_url')">
                          <el-input
                            :placeholder="$t('cm.pleaseEnter')"
                            maxlength="256"
                            v-model="localInterfaceQueryModel.interUrl"
                          ></el-input>
                        </el-form-item>
                      </el-col>
                      <el-col
                        :xs="12"
                        :sm="12"
                        :md="8"
                        :lg="8"
                        class="cud--right pt-30"
                      >
                        <el-button
                          class="mr-10"
                          type="primary"
                          size="small"
                          @click="localSearch"
                          >{{ $t("cm.search") }}</el-button
                        >
                        <el-button size="small" @click="localReset">{{
                          $t("cm.reset")
                        }}</el-button>
                      </el-col>
                    </el-row>
                    <el-row class="cud__search--rowhigh">
                      <div class="cud__divider"></div>
                    </el-row> -->
                    <div class="table-button">
                      <el-button
                        type="primary"
                        size="small"
                        @click="addLocalInterface"
                        v-if="btnShow('interface_manage_add')"
                        >{{ $t("cm.add") }}</el-button
                      >
                    </div>
                    <el-row
                      class="cud__table--list"
                      :style="{ height: maxRightHeight + 'px' }"
                      :class="{ 'cud__table--list-padding': isTreeCollapse }"
                    >
                      <el-table
                        :data="localInterfaceTableData"
                        ref="localInterfaceTable"
                        :empty-text="$t('cm.nodata')"
                        border
                        stripe
                         :max-height="computedTableHeight"
                        highlight-current-row
                        header-row-class-name="cud-office-table-header"
                        :default-sort="{ prop: 'createDateTimeStr', order: 'descending' }"
                        class="cud-office-table"
                      >
                        <!-- <el-table-column align="left" type="index" :label="$t('cm.no')" width="70"></el-table-column> -->
                        <div style="display: inline-block" v-if="show">
                          <el-table-column
                            align="left"
                            prop="registInterId"
                          ></el-table-column>
                          <el-table-column
                            align="left"
                            prop="subInterName"
                          ></el-table-column>
                          <el-table-column
                            align="left"
                            prop="subInterUrl"
                          ></el-table-column>
                          <el-table-column
                            align="left"
                            prop="subAppCode"
                          ></el-table-column>
                        </div>
                        <el-table-column
                          align="left"
                          prop="interName"
                          :label="$t('sys.interface_name')"
                          :show-overflow-tooltip="true"
                        >
                          <template slot-scope="scope">
                            <!-- <el-button type="text" size="small" @click="handleClick(scope.row)">{{scope.row.interName}}</el-button> -->
                            <div class="cud-commom-process-name">
                              <el-button
                                type="text"
                                size="small"
                                @click="handleClick(scope.row)"
                                >{{ scope.row.interName }}</el-button
                              >
                            </div>
                          </template>
                        </el-table-column>
                        <el-table-column
                          align="left"
                          prop="interUrl"
                          label="接口地址"
                          width="80"
                          :show-overflow-tooltip="true"
                        ></el-table-column>
                        <el-table-column
                          align="left"
                          prop="interCode"
                          :label="$t('sys.interface_code')"
                          width="110"
                          :show-overflow-tooltip="true"
                        ></el-table-column>
                        <el-table-column
                          align="left"
                          prop="interStatus"
                          :label="$t('sys.status')"
                          width="110"
                        >
                          <template slot-scope="scope">
                            <el-tag
                              class="cud-tb-tag"
                              v-if="scope.row.interStatus === '1'"
                              type="success"
                            >
                              <i
                                class="cud-el-icon-point"
                                style="background: #41b048"
                              ></i>
                              已启用
                            </el-tag>
                            <el-tag
                              class="cud-tb-tag"
                              v-if="scope.row.interStatus === '0'"
                              type="danger"
                            >
                              <i
                                class="cud-el-icon-point"
                                style="background: #e94848"
                              ></i>
                              已禁用
                            </el-tag>
                          </template>
                        </el-table-column>
                        <el-table-column
                          align="left"
                          prop="interType"
                          :label="$t('sys.interface_type')"
                          width="120"
                        >
                          <template slot-scope="scope">
                            <span v-if="scope.row.interType === '0'">http</span>
                            <span v-if="scope.row.interType === '1'"
                              >https</span
                            >
                            <span v-if="scope.row.interType === '2'"
                              >Webservice</span
                            >
                            <span v-if="scope.row.interType === '3'">MQ</span>
                            <span v-if="scope.row.interType === '5'">中台</span>
                            <span v-if="scope.row.interType === '4'"
                              >自定义</span
                            >
                          </template>
                        </el-table-column>
                        <el-table-column
                          align="left"
                          prop="requestType"
                          :label="$t('sys.interface_req')"
                          width="130"
                        >
                          <template slot-scope="scope">
                            <span v-if="scope.row.requestType === '1'"
                              >GET</span
                            >
                            <span v-if="scope.row.requestType === '2'"
                              >POST</span
                            >
                          </template>
                        </el-table-column>
                        <el-table-column
                          align="left"
                          prop="interactionType"
                          :label="$t('sys.interface_action')"
                          width="130"
                          ><!--  v-if="!isLocalSystem" -->
                          <template slot-scope="scope">
                            <span v-if="scope.row.interactionType === '0'"
                              >异步接口</span
                            >
                            <span v-if="scope.row.interactionType === '1'"
                              >同步接口</span
                            >
                            <span v-if="scope.row.interactionType === '2'"
                              >异步回调</span
                            >
                          </template>
                        </el-table-column>
                        <el-table-column
                          align="left"
                          prop="subInterCode"
                          :label="$t('sys.sub_interface')"
                          width="110"
                          v-if="!isLocalSystem"
                          :show-overflow-tooltip="true"
                        >
                          <template slot-scope="scope">
                            <el-button
                              type="text"
                              size="small"
                              @click="handleSubClick(scope.row)"
                              >{{ scope.row.subInterCode }}</el-button
                            >
                          </template>
                        </el-table-column>
                        <!-- <el-table-column align="left" prop="interUrl" :label="$t('sys.interface_url')" min-width="150"></el-table-column> -->
                        <el-table-column
                          align="left"
                          prop="createUserName"
                          :label="$t('cm.creat_by')"
                          width="150"
                          :show-overflow-tooltip="true"
                        ></el-table-column>
                        <el-table-column
                          align="left"
                          label="创建时间"
                          width="140"
                          :show-overflow-tooltip="true"
                          prop="createDateTimeStr"
                          sortable
                        >
                          <!-- <template slot-scope="scope">
                            {{ filters(scope.row.createDateTimeStr) }}
                          </template> -->
                          </el-table-column>
                        <!-- <el-table-column align="left" prop="createDateTimeStr" :label="$t('cm.creat_time')" min-width="150"></el-table-column> -->
                        <el-table-column
                          align="left"
                          fixed="right"
                          :label="$t('cm.operate')"
                          width="150"
                        >
                          <template slot-scope="scope">
                            <el-button
                              type="text"
                              size="small"
                              class="cud-common-operate-edit"
                              @click="editOtherInterface(scope.row)"
                              v-if="
                                currentTreeNode.appCode ===
                                  currentLocalAppCode &&
                                btnShow('interface_manage_edit')
                              "
                            >
                              {{ $t("cm.edit") }}</el-button
                            >
                            <el-button
                              type="text"
                              size="small"
                              class="cud-common-operate-delete"
                              @click="deleteInterface(scope.row)"
                              v-if="btnShow('interface_manage_delete')"
                            >
                              {{ $t("cm.delete") }}</el-button
                            >
                            <el-button
                              type="text"
                              size="small"
                              class="cud-common-operate-edit"
                              @click="enableInterface(scope.row)"
                              v-if="
                                scope.row.interStatus === '0' &&
                                currentTreeNode.appCode !== '1'
                              "
                            >
                              {{ $t("cm.enable") }}</el-button
                            >
                            <el-button
                              type="text"
                              size="small"
                              class="cud-common-operate-edit"
                              @click="fobiddenInterface(scope.row)"
                              v-if="
                                scope.row.interStatus === '1' &&
                                currentTreeNode.appCode !== '1'
                              "
                            >
                              {{ $t("cm.disable") }}</el-button
                            >
                          </template>
                        </el-table-column>
                      </el-table>
                    </el-row>
                    <el-row>
                      <div
                        style="margin-bottom: 0"
                        class="
                          cud-special-pagination cud-special-pagination-button
                        "
                      >
                        <el-pagination popper-class="cud-pager-dropdown"
                          ref="pager"
                          class="cud__page"
                          @size-change="handleLocalSizeChange"
                          @current-change="handleLocalCurrentChange"
                          :current-page="localCurrent"
                          :page-sizes="[10, 20, 30, 40]"
                          :page-size="localSize"
                          layout="total,sizes, prev, pager, next"
                          :total="localTotal"
                          :pager-count="5"
                        >
                        </el-pagination>
                      </div>
                    </el-row>
                  </el-form>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
          <!-- </el-card> -->
          <el-dialog
            v-dragMove="{
              DragButton: '.el-dialog__header',
              DragWindow: '.el-dialog',
            }"
            :title="addStatus ? $t('sys.add_app') : $t('sys.edit_app')"
            :before-close="appDialogHandleClose"
            :close-on-click-modal="false"
            :visible.sync="appDialogVisible"
            width="640px"
          >
            <el-form
              ref="appForm"
              size="small"
              label-position="top"
              label-suffix="："
              :rules="appRules"
              :model="appData"
              label-width="170px"
            >
              <el-row class="row-css">
                <el-col :span="12" >
                  <el-form-item :label="$t('sys.app_code')" prop="appCode">
                    <el-select
                      v-if="idpEnable === 'true'"
                      @change="idpAppChange"
                      v-model="appData.appCode"
                      :placeholder="$t('cm.pselect')"
                      filterable
                      clearable
                      :disabled="!addStatus"
                    >
                      <el-option
                        v-for="item in idpAppList"
                        :key="item.id"
                        :label="item.name"
                        :value="item"
                      ></el-option>
                    </el-select>
                    <el-input
                      v-if="idpEnable === 'false'"
                      v-model="appData.appCode"
                      maxlength="32"
                      :placeholder="$t('cm.pleaseEnter')"
                      :disabled="!addStatus"
                      class="form-input"
                    ></el-input>
                    <!-- <el-input :placeholder="$t('cm.pleaseEnter')" maxlength="256" v-model="appData.appCode" class="form-input"></el-input> -->
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item :label="$t('sys.app_name')" prop="appName">
                    <el-input
                      v-if="idpEnable === 'true'"
                      :placeholder="$t('cm.pleaseEnter')"
                      maxlength="64"
                      :disabled="true"
                      v-model="appData.appName"
                      class="form-input"
                    ></el-input>
                    <el-input
                      v-if="idpEnable === 'false'"
                      :placeholder="$t('cm.pleaseEnter')"
                      maxlength="64"
                      :disabled="!addStatus"
                      v-model="appData.appName"
                      class="form-input"
                    ></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item :label="$t('sys.auth_type')" prop="authType">
                    <el-select
                      @change="authTypeChange"
                      class="form-input"
                      :placeholder="$t('cm.pselect')"
                      v-model="appData.authType"
                    >
                      <el-option
                        v-for="item in authTypeOption"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      ></el-option>
                    </el-select>
                    <!-- <el-input :placeholder="$t('cm.pleaseEnter')" maxlength="10" v-model="appData.authType" class="form-input"></el-input> -->
                  </el-form-item>
                </el-col>
                <el-col :span="12" v-if="appData.authType === '3'">
                  <el-form-item
                    :label="$t('sys.class_path')"
                    prop="authClasspath"
                  >
                    <el-input
                      :placeholder="$t('cm.pleaseEnter')"
                      maxlength="64"
                      v-model="appData.authClasspath"
                      class="form-input"
                    ></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item :label="$t('sys.app_desc')" prop="appDesc">
                    <el-input
                      :placeholder="$t('cm.pleaseEnter')"
                      v-model="appData.appDesc"
                      type="textarea"
                      rows="5"
                      maxlength="256"
                      show-word-limit
                      size="small"
                      class="form-input"
                    ></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
            <div slot="footer" class="dialog-footer" align="center">
              <el-button size="small" @click="appDialogHandleClose">{{
                $t("cm.cancel")
              }}</el-button>
              <el-button size="small" type="primary" @click="saveAppClick">{{
                $t("cm.commit")
              }}</el-button>
            </div>
          </el-dialog>
          <el-dialog
            v-dragMove="{
              DragButton: '.el-dialog__header',
              DragWindow: '.el-dialog',
            }"
            :title="$t(interDialogTitle)"
            :before-close="interDialogHandleClose"
            :close-on-click-modal="false"
            :visible.sync="interDialogVisible"
            width="640px"
          >
            <el-form
              ref="interForm"
              size="small"
              label-position="top"
              label-suffix="："
              :rules="interRules"
              :model="interfaceData"
              label-width="170px"
              :disabled="!interfaceEditFlag"
            >
              <el-row>
                <el-col :span="12">
                  <el-form-item
                    :label="$t('sys.interface_name')"
                    prop="interName"
                  >
                    <el-input
                      :placeholder="$t('cm.pleaseEnter')"
                      maxlength="200"
                      :disabled="!interfaceEditFlag"
                      v-model="interfaceData.interName"
                      class="form-input"
                    ></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item
                    :label="$t('sys.interface_code')"
                    prop="interCode"
                  >
                    <el-input
                      :placeholder="$t('cm.pleaseEnter')"
                      maxlength="32"
                      :disabled="
                        !interfaceEditFlag || interfaceData.registInterId != ''
                      "
                      v-model="interfaceData.interCode"
                      class="form-input"
                    ></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item
                    :label="$t('sys.interface_type')"
                    prop="interType"
                  >
                    <el-select
                      @change="interTypeChange"
                      class="form-input"
                      :placeholder="$t('cm.pselect')"
                      :disabled="!interfaceEditFlag"
                      v-model="interfaceData.interType"
                    >
                      <el-option
                        v-for="item in interTypeOption"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      ></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <!--接口类型为0->http、1->https、5->中台时，显示参数类型、请求方式、交互方式-->
                <el-col
                  :span="12"
                  v-if="
                    interfaceData.interType === '0' ||
                    interfaceData.interType === '1' ||
                    interfaceData.interType === '5'
                  "
                >
                  <el-form-item :label="$t('sys.param_type')" prop="paramType">
                    <el-select
                      @change="paramTypeChange"
                      class="form-input"
                      :placeholder="$t('cm.pselect')"
                      :disabled="!interfaceEditFlag"
                      v-model="interfaceData.paramType"
                    >
                      <el-option
                        v-for="item in paramTypeOption"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      ></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <!--接口类型为0->http、1->https、5->中台时，显示参数类型、请求方式、交互方式-->
                <el-col
                  :span="12"
                  v-if="
                    interfaceData.interType === '0' ||
                    interfaceData.interType === '1' ||
                    interfaceData.interType === '5'
                  "
                >
                  <el-form-item
                    :label="$t('sys.request_type')"
                    prop="requestType"
                  >
                    <el-select
                      @change="requestTypeChange"
                      class="form-input"
                      :placeholder="$t('cm.pselect')"
                      :disabled="!interfaceEditFlag"
                      v-model="interfaceData.requestType"
                    >
                      <el-option
                        v-for="item in requestTypeOption"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      ></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <!--接口类型为0->http、1->https、5->中台时，显示参数类型、请求方式、交互方式-->
                <el-col
                  :span="12"
                  v-if="
                    interfaceData.interType === '0' ||
                    interfaceData.interType === '1' ||
                    interfaceData.interType === '5'
                  "
                >
                  <el-form-item
                    :label="$t('sys.action_type')"
                    prop="interactionType"
                  >
                    <el-select
                      @change="interactionTypeChange"
                      class="form-input"
                      :placeholder="$t('cm.pselect')"
                      :disabled="!interfaceEditFlag"
                      v-model="interfaceData.interactionType"
                    >
                      <el-option
                        v-for="item in interactionTypeOption"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      ></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col
                  :span="12"
                  v-if="
                    interfaceData.interactionType === '2' &&
                    (interfaceData.interType === '0' ||
                      interfaceData.interType === '1' ||
                      interfaceData.interType === '5')
                  "
                >
                  <el-form-item
                    :label="$t('sys.sub_interface')"
                    prop="subInterCode"
                  >
                    <el-row>
                      <el-col :span="6"
                        ><el-button
                          type="primary"
                          @click="selectInterClick"
                          :disabled="!interfaceEditFlag"
                          >{{ $t("cm.choose") }}</el-button
                        ></el-col
                      >
                      <el-col :span="18"
                        ><div>
                          {{ $t("sys.sub_app") }}：{{ interfaceData.subAppCode
                          }}<br />{{ $t("sys.sub_interface_name") }}：{{
                            interfaceData.subInterName
                          }}<br />{{ $t("sys.sub_interface_code") }}：{{
                            interfaceData.subInterCode
                          }}
                        </div></el-col
                      >
                    </el-row>
                  </el-form-item>
                </el-col>
                <el-col
                  :span="24"
                  v-if="interfaceData.interType === '2'"
                  style="margin-bottom: 110px"
                >
                  <el-row>
                    <el-form-item :label="$t('sys.WSDL_config')" prop="wsdlUrl">
                      <el-input
                        :placeholder="$t('cm.pleaseEnter')"
                        v-model="interfaceData.wsdlUrl"
                        type="textarea"
                        rows="5"
                        maxlength="256"
                        show-word-limit
                        class="form-input"
                        :disabled="!interfaceEditFlag"
                      ></el-input> </el-form-item
                  ></el-row>
                </el-col>
                <el-col :span="24">
                  <el-row>
                    <el-form-item
                      :label="$t('sys.interface_address')"
                      prop="interUrl"
                    >
                      <el-input
                        :placeholder="$t('cm.pleaseEnter')"
                        v-model="interfaceData.interUrl"
                        type="textarea"
                        rows="5"
                        maxlength="256"
                        show-word-limit
                        class="form-input"
                        :disabled="!interfaceEditFlag"
                      ></el-input> </el-form-item
                  ></el-row>
                </el-col>
                <el-col :span="24">
                  <el-row>
                    <el-form-item
                      :label="$t('sys.interface_content')"
                      prop="interDesc"
                    >
                      <el-input
                        :placeholder="$t('cm.pleaseEnter')"
                        v-model="interfaceData.interDesc"
                        type="textarea"
                        rows="5"
                        maxlength="256"
                        show-word-limit
                        class="form-input"
                        :disabled="!interfaceEditFlag"
                      ></el-input> </el-form-item
                  ></el-row>
                </el-col>
              </el-row>
            </el-form>
            <div slot="footer" class="dialog-footer" align="center">
              <el-button size="small" @click="interDialogHandleClose">{{
                $t("cm.cancel")
              }}</el-button>
              <el-button
                size="small"
                type="primary"
                @click="saveInterClick"
                v-if="interfaceEditFlag"
                >{{ $t("cm.commit") }}</el-button
              >
            </div>
          </el-dialog>
          <!-- 弹窗选择内部接口 -->
          <el-dialog
            v-dragMove="{
              DragButton: '.el-dialog__header',
              DragWindow: '.el-dialog',
            }"
            :title="$t('sys.sub_interface_config')"
            :close-on-click-modal="false"
            :before-close="callBackInterDialogHandleClose"
            :visible.sync="callBackInterDialogVisible"
            width="70%"
          >
            <el-form
              size="small"
              label-suffix="："
              label-position="top"
              label-width="170px"
              :rules="callBackRules"
              ref="callBackForm"
            >
              <el-row
                class="cud__search--rowhigh cud-senior-search mr-10"
                type="flex"
              >
                <el-col :span="6">
                  <el-form-item :label="$t('sys.interface_name')">
                    <el-input
                      :placeholder="$t('cm.pleaseEnter')"
                      maxlength="200"
                      v-model="callBackInterQueryModel.interName"
                    ></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item :label="$t('sys.interface_code')">
                    <el-input
                      :placeholder="$t('cm.pleaseEnter')"
                      maxlength="32"
                      v-model="callBackInterQueryModel.interCode"
                    ></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item :label="$t('sys.interface_url')">
                    <el-input
                      :placeholder="$t('cm.pleaseEnter')"
                      maxlength="256"
                      v-model="callBackInterQueryModel.interUrl"
                    ></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="6" class="cud--right pt-30">
                  <!-- <el-form-item  label=" "> -->
                  <el-button size="small" @click="callBackInterReset">{{
                    $t("cm.cancel")
                  }}</el-button>
                  <el-button
                    size="small"
                    type="primary"
                    @click="callBackInterSearch()"
                    >{{ $t("cm.search") }}</el-button
                  >
                  <!-- </el-form-item> -->
                </el-col>
              </el-row>
              <el-row
                class="cud__table--list"
                :class="{ 'cud__table--list-padding': isTreeCollapse }"
              >
                <el-table
                  :data="callBackInterTableData"
                  ref="callBackInterFormTable"
                  :empty-text="$t('cm.nodata')"
                  :max-height="computedTableHeight"
                  highlight-current-row
                  header-row-class-name="cud-office-table-header"
                  class="cud-office-table"
                >
                  <el-table-column :label="$t('cm.choose')" width="60">
                    <template slot-scope="scope">
                      <el-radio
                        v-model="callBackInterSelectData"
                        :label="scope.row"
                        >&nbsp;</el-radio
                      >
                    </template>
                  </el-table-column>
                  <el-table-column
                    align="center"
                    type="index"
                    :label="$t('cm.no')"
                    width="60"
                  ></el-table-column>
                  <div style="display: inline-block" v-if="show">
                    <el-table-column
                      align="left"
                      prop="registInterId"
                    ></el-table-column>
                    <el-table-column
                      align="left"
                      prop="subInterName"
                    ></el-table-column>
                    <el-table-column
                      align="left"
                      prop="subInterUrl"
                    ></el-table-column>
                    <el-table-column
                      align="left"
                      prop="subAppCode"
                    ></el-table-column>
                  </div>
                  <el-table-column
                    align="left"
                    prop="appCode"
                    :label="$t('sys.app_code')"
                    min-width="100"
                    :show-overflow-tooltip="true"
                  ></el-table-column>
                  <el-table-column
                    align="left"
                    prop="interName"
                    :label="$t('sys.interface_name')"
                    min-width="100"
                    :show-overflow-tooltip="true"
                  ></el-table-column>
                  <el-table-column
                    align="left"
                    prop="interCode"
                    :label="$t('sys.interface_code')"
                    min-width="100"
                    :show-overflow-tooltip="true"
                  ></el-table-column>
                  <el-table-column
                    align="left"
                    prop="interUrl"
                    :label="$t('sys.interface_url')"
                    min-width="150"
                    :show-overflow-tooltip="true"
                  ></el-table-column>
                  <el-table-column
                    align="left"
                    prop="interDesc"
                    :label="$t('sys.interface_content')"
                    min-width="150"
                    :show-overflow-tooltip="true"
                  ></el-table-column>
                </el-table>
              </el-row>
              <el-row>
                <div class="cud-special-pagination" style="margin-bottom: 0">
                  <el-pagination popper-class="cud-pager-dropdown"
                    ref="pager"
                    class="cud__page"
                    @size-change="handleCallBackInterSizeChange"
                    @current-change="handleCallBackInterCurrentChange"
                    :current-page="callBackInterCurrent"
                    :page-sizes="[10, 20, 30, 40]"
                    :page-size="callBackInterSize"
                    layout="total,sizes, prev, pager, next"
                    :pager-count="5"
                    :total="callBackInterTotal"
                  >
                  </el-pagination>
                </div>
              </el-row>
              <el-row>
                <el-col :span="6">
                  <el-form-item :label="$t('sys.field_type')" prop="fieldType">
                    <el-select
                      @change="fieldTypeChange"
                      class="form-input"
                      :placeholder="$t('cm.pselect')"
                      size="small"
                      v-model="interfaceData.fieldType"
                    >
                      <el-option
                        v-for="item in fieldTypeOption"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      ></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item :label="$t('sys.request_key')" prop="fieldKey">
                    <el-input
                      :placeholder="$t('cm.pleaseEnter')"
                      maxlength="80"
                      v-model="interfaceData.fieldKey"
                      size="small"
                    ></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
            <div slot="footer" class="dialog-footer" align="center">
              <el-button size="small" @click="callBackInterDialogHandleClose">{{
                $t("cm.cancel")
              }}</el-button>
              <el-button
                size="small"
                type="primary"
                @click="submitCallBackInterClick"
                >{{ $t("cm.commit") }}</el-button
              >
            </div>
          </el-dialog>
          <!--外系统添加内部接口弹窗-->
          <el-dialog
            v-dragMove="{
              DragButton: '.el-dialog__header',
              DragWindow: '.el-dialog',
            }"
            :title="$t('sys.add_internal_interface')"
            :close-on-click-modal="false"
            :before-close="otherAddLocalDialogHandleClose"
            :visible.sync="otherAddLocalDialogVisible"
            width="70%"
          >
            <el-form label-position="top" label-width="110px">
              <el-row
                class="cud__search--rowhigh cud-senior-search"
                type="flex"
              >
                <el-col :xs="12" :sm="12" :md="6" :lg="6">
                  <el-form-item :label="$t('sys.interface_name')">
                    <el-input
                      :placeholder="$t('cm.pleaseEnter')"
                      maxlength="200"
                      v-model="otherAddLocalQueryModel.interName"
                      size="small"
                    ></el-input>
                  </el-form-item>
                </el-col>
                <el-col :xs="12" :sm="12" :md="6" :lg="6">
                  <el-form-item :label="$t('sys.interface_url')">
                    <el-input
                      :placeholder="$t('cm.pleaseEnter')"
                      maxlength="256"
                      v-model="otherAddLocalQueryModel.interUrl"
                      size="small"
                    ></el-input>
                  </el-form-item>
                </el-col>
                <el-col :xs="12" :sm="12" :md="6" :lg="6">
                  <el-form-item label=" "> </el-form-item>
                </el-col>
                <el-col :xs="12" :sm="12" :md="6" :lg="6" class="cud--right">
                  <el-form-item label=" ">
                    <el-button
                      type="primary"
                      size="small"
                      @click="otherAddLocalSearch()"
                      >{{ $t("cm.search") }}</el-button
                    >
                    <el-button size="small" @click="otherAddLocalReset">{{
                      $t("cm.reset")
                    }}</el-button>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row
                class="cud__table--list"
                :class="{ 'cud__table--list-padding': isTreeCollapse }"
              >
                <el-table
                  :data="otherAddLocalTableData"
                  ref="otherAddLocalFormTable"
                  :empty-text="$t('cm.nodata')"
                  :max-height="computedTableHeight"
                  highlight-current-row
                  header-row-class-name="cud-office-table-header"
                  class="cud-office-table"
                >
                  <el-table-column :label="$t('cm.choose')" width="80">
                    <template slot-scope="scope">
                      <el-checkbox
                        v-model="otherAddLocalSelectData"
                        :label="scope.row"
                        >&nbsp;</el-checkbox
                      >
                    </template>
                  </el-table-column>
                  <el-table-column
                    align="center"
                    type="index"
                    :label="$t('cm.no')"
                    width="70"
                  ></el-table-column>
                  <div style="display: inline-block" v-if="show">
                    <el-table-column
                      align="center"
                      prop="registInterId"
                    ></el-table-column>
                    <el-table-column
                      align="center"
                      prop="subInterName"
                    ></el-table-column>
                    <el-table-column
                      align="center"
                      prop="subInterUrl"
                    ></el-table-column>
                    <el-table-column
                      align="center"
                      prop="subAppCode"
                    ></el-table-column>
                    <el-table-column
                      align="center"
                      prop="appCode"
                    ></el-table-column>
                  </div>
                  <el-table-column
                    align="center"
                    prop="interName"
                    :label="$t('sys.interface_name')"
                    min-width="150"
                    :show-overflow-tooltip="true"
                  ></el-table-column>
                  <el-table-column
                    align="center"
                    prop="interCode"
                    :label="$t('sys.interface_code')"
                    min-width="150"
                    :show-overflow-tooltip="true"
                  ></el-table-column>
                  <el-table-column
                    align="center"
                    prop="interType"
                    :label="$t('sys.interface_type')"
                    min-width="120"
                  >
                    <template slot-scope="scope">
                      <span v-if="scope.row.interType === '0'">http</span>
                      <span v-if="scope.row.interType === '1'">https</span>
                      <span v-if="scope.row.interType === '2'">Webservice</span>
                      <span v-if="scope.row.interType === '3'">MQ</span>
                      <span v-if="scope.row.interType === '5'">中台</span>
                      <span v-if="scope.row.interType === '4'">自定义</span>
                    </template>
                  </el-table-column>
                  <el-table-column
                    align="center"
                    prop="requestType"
                    :label="$t('sys.interface_req')"
                    min-width="120"
                  >
                    <template slot-scope="scope">
                      <span v-if="scope.row.requestType === '1'">GET</span>
                      <span v-if="scope.row.requestType === '2'">POST</span>
                    </template>
                  </el-table-column>
                  <el-table-column
                    align="center"
                    prop="interactionType"
                    :label="$t('sys.interface_action')"
                    min-width="120"
                    ><!--  v-if="!isLocalSystem" -->
                    <template slot-scope="scope">
                      <span v-if="scope.row.interactionType === '0'"
                        >异步接口</span
                      >
                      <span v-if="scope.row.interactionType === '1'"
                        >同步接口</span
                      >
                      <span v-if="scope.row.interactionType === '2'"
                        >异步回调</span
                      >
                    </template>
                  </el-table-column>
                  <el-table-column
                    align="center"
                    prop="interUrl"
                    :label="$t('sys.interface_url')"
                    min-width="150"
                    :show-overflow-tooltip="true"
                  ></el-table-column>
                </el-table>
              </el-row>
              <el-row>
                <div class="cud-special-pagination" style="margin-bottom: 0">
                  <el-pagination popper-class="cud-pager-dropdown"
                    ref="pager"
                    class="cud__page"
                    @size-change="handleOtherAddLocalSizeChange"
                    @current-change="handleOtherAddLocalCurrentChange"
                    :current-page="otherAddLocalCurrent"
                    :page-sizes="[10, 20, 30, 40]"
                    :page-size="otherAddLocalSize"
                    :pager-count="5"
                    layout="total,sizes, prev, pager, next"
                    :total="otherAddLocalTotal"
                  >
                  </el-pagination>
                </div>
              </el-row>
            </el-form>
            <div slot="footer" class="dialog-footer" align="center">
              <el-button size="small" @click="otherAddLocalDialogHandleClose">{{
                $t("cm.cancel")
              }}</el-button>
              <el-button
                size="small"
                type="primary"
                @click="submitOtherAddLocalClick"
                >{{ $t("cm.commit") }}</el-button
              >
            </div>
          </el-dialog>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import intefaceManage from "./js/interface_manage.js";
export default intefaceManage;
</script>
<style lang="less" scoped>
.row-css {
  display: flex;
  justify-content: left;
  flex-wrap: wrap;
}
/deep/ .el-tabs__nav-wrap {
  margin-top: 15px;
}
/deep/ .cud-commom-form-style .cud-special-pagination {
  margin-bottom: 0;
}
/deep/ .el-form--label-top .el-form-item__label {
  margin-top: 0;
}
/deep/ .cud-cgn-task-center .cgn-task-tabs .el-tabs__item {
  margin-top: 0;
}
// @import "src/assets/css/style";
.cud__scroll--div {
  // background: #f8f8f8;
}
.cud__table--list {
  // background: #f8f8f8;
}
/deep/ .el-drawer__body {
  border-top: 4px solid #0069ac;
  position: relative;
  padding-bottom: 80px;
}
/deep/ .cud-cgn-task-center .cgn-task-tabs .el-tabs__content {
  padding: 15px;
  margin-right: 20px;
}
/deep/ .el-tabs__active-bar {
  width: 30px !important;
  left: 52px;
}
</style>
