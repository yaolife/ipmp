<template>
  <div class="cud-commom-form-style">
    <div class="cud__scroll--div">
      <div class="cud-common-header-wrap">
        <img
          src="@/assets/img/formmanageicon.png"
          class="cud-common-title-icon"
        />
        <span class="cud-common-title-text">{{
          $t("sys.interface_manage")
        }}</span>
      </div>
      <el-row class="search cud-commom-form-search">
        <div class="search-collapse hight_search">
          <!--普通搜索-->
          <el-input
            :placeholder="$t('sys.search_interface_id')"
            v-model="model.interfaceId"
            maxlength="256"
            size="small"
            class="cud-commom-search-ipt"
            @keyup.enter.native="commonSearch"
          >
            <i
              slot="suffix"
              class="cud-ipt-search el-input__icon el-icon-search"
              @click="commonSearch"
            ></i>
          </el-input>
        </div>
        <!--折叠板-->
        <el-collapse
          class="search-collapse-content"
          @change="advanceSearch"
          accordion
        >
          <el-collapse-item>
            <template slot="title" class="search-collapse-title">
              <span class="title-font">{{ $t(advSearch) }}</span>
            </template>
            <!-- 高级搜索具体内容 -->
            <el-form label-width="130px">
              <el-col :span="12">
                <el-form-item :label="$t('sys.business_type')">
                  <el-input
                    :placeholder="$t('cm.pleaseEnter')"
                    v-model="model.businessClass"
                    size="small"
                    maxlength="256"
                  ></el-input>
                </el-form-item>
              </el-col>
              <el-col :xs="12" :sm="12" :md="8" :lg="8">
                <el-form-item
                  :label="$t('sys.interface_type')"
                  prop="interfaceType"
                >
                  <el-select
                    class="form-input"
                    v-model="model.interfaceType"
                    size="small"
                    :clearable="true"
                  >
                    <el-option
                      v-for="(item, index) in interfaceTypes"
                      :key="index"
                      :label="item.label"
                      :value="item.value"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item
                  :label="$t('sys.call_direction')"
                  prop="callDirection"
                >
                  <el-select
                    class="form-input"
                    v-model="model.callDirection"
                    size="small"
                    :clearable="true"
                  >
                    <el-option
                      v-for="(item, index) in callDirections"
                      :key="index"
                      :label="item.label"
                      :value="item.value"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :xs="12" :sm="12" :md="8" :lg="8">
                <el-form-item
                  :label="$t('sys.asynchronous_flag')"
                  prop="asynchronousFlag"
                >
                  <el-select
                    class="form-input"
                    v-model="model.asynchronousFlag"
                    size="small"
                    :clearable="true"
                  >
                    <el-option
                      v-for="(item, index) in asynchronousFlags"
                      :key="index"
                      :label="item.label"
                      :value="item.value"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :xs="12" :sm="12" :md="4" :lg="4" class="cud--right">
                <el-button type="primary" size="small" @click="search">{{
                  $t("cm.search")
                }}</el-button>
                <el-button size="small" @click="resetData">{{
                  $t("cm.reset")
                }}</el-button>
              </el-col>
            </el-form>
          </el-collapse-item>
        </el-collapse>
      </el-row>
      <el-row class="cud__table--list cud__table--list-padding">
        <el-table
          :data="tableData"
          ref="multipleSelection"
          @selection-change="handleSelectionChange"
          v-loading.body="loading"
          :empty-text="$t('cm.nodata')"
          :max-height="maxTableHeight"
          highlight-current-row
          header-row-class-name="cud-office-table-header"
          class="cud-office-table"
        >
          <el-table-column
            align="left"
            type="index"
            :label="$t('cm.no')"
            width="70"
          ></el-table-column>
          <div style="display:inline-block;" v-if="show">
            <el-table-column
              align="left"
              prop="id"
              width="55"
            ></el-table-column>
            <el-table-column
              align="left"
              prop="interfaceAddress"
              width="55"
            ></el-table-column>
            <el-table-column
              align="left"
              prop="paramContent"
              width="55"
            ></el-table-column>
            <el-table-column
              align="left"
              prop="returnContent"
              width="55"
            ></el-table-column>
            <el-table-column
              align="left"
              prop="callBackInterfaceId"
              width="55"
            ></el-table-column>
            <el-table-column
              align="left"
              prop="callBackInterfaceType"
              width="55"
            ></el-table-column>
            <el-table-column
              align="left"
              prop="callBackBusinessClass"
              width="55"
            ></el-table-column>
            <el-table-column
              align="left"
              prop="callBackCallDirection"
              width="55"
            ></el-table-column>
            <el-table-column
              align="left"
              prop="callBackInterfaceContent"
              width="55"
            ></el-table-column>
            <el-table-column
              align="left"
              prop="callBackInterfaceAddress"
              width="55"
            ></el-table-column>
            <el-table-column
              align="left"
              prop="callBackParamContent"
              width="55"
            ></el-table-column>
            <el-table-column
              align="left"
              prop="callBackReturnContent"
              width="55"
            ></el-table-column>
            <el-table-column
              align="left"
              prop="accountId"
              width="55"
            ></el-table-column>
          </div>

          <el-table-column
            align="left"
            prop="interfaceId"
            :label="$t('sys.interface_id')"
            min-width="120"
          >
            <template slot-scope="scope">
              <el-button
                type="text"
                size="small"
                @click="viewWorkFlowRule(scope.row)"
                >{{ scope.row.interfaceId }}</el-button
              >
            </template>
          </el-table-column>
          <el-table-column
            align="left"
            prop="interfaceContent"
            :label="$t('sys.interface_content')"
            min-width="135"
          ></el-table-column>
          <el-table-column
            align="left"
            prop="interfaceType"
            :label="$t('sys.interface_type')"
            min-width="120"
          >
            <template slot-scope="scope">
              <span v-if="scope.row.interfaceType === 1">中台</span>
              <span v-if="scope.row.interfaceType === 2">HTTP</span>
              <span v-if="scope.row.interfaceType === 3">webService</span>
            </template>
          </el-table-column>
          <el-table-column
            align="left"
            prop="callDirection"
            :label="$t('sys.call_direction')"
            width="100"
          >
            <template slot-scope="scope">
              <span v-if="scope.row.callDirection === 1">CUD</span>
              <span v-if="scope.row.callDirection === 2">SAP</span>
              <span v-if="scope.row.callDirection === 3">中台</span>
            </template>
          </el-table-column>
          <el-table-column
            align="left"
            prop="asynchronousFlag"
            :label="$t('sys.asynchronous_flag')"
            width="150"
          >
            <template slot-scope="scope">
              <span v-if="scope.row.asynchronousFlag === 1">同步</span>
              <span v-if="scope.row.asynchronousFlag === 2">异步</span>
            </template>
          </el-table-column>
          <el-table-column
            align="left"
            prop="businessClass"
            :label="$t('sys.business_type')"
            width="120"
          ></el-table-column>
          <el-table-column
            align="left"
            prop="enableFlag"
            :label="$t('sys.enable_flag')"
            width="120"
          >
            <template slot-scope="scope">
              <span v-if="scope.row.enableFlag === 1">启用</span>
              <span v-if="scope.row.enableFlag === 2">停用</span>
            </template>
          </el-table-column>

          <el-table-column align="left" :label="$t('tm.operate')" width="110">
            <template slot-scope="scope">
              <el-button
                type="text"
                size="small"
                class="cud-common-operate-edit"
                @click="editClick(scope.row)"
              >
                <img
                  src="@/assets/img/commonediticon.png"
                  class="cud-common-operate-edit-pic"
                />{{ $t("cm.edit") }}</el-button
              >
              <el-dropdown trigger="click">
                <div class="cud-commom-operate-expand-wrap">
                  <img
                    src="@/assets/img/moreexpand.png"
                    class="cud-commom-operate-expand"
                  />
                </div>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item>
                    <span @click="delClick(scope.row)">
                      <img
                        src="@/assets/img/commondelicon.png"
                        class="cud-commom-operate-delete-size cud-commom-title-operate-icon cud-commom-operate-size"
                      />{{ $t("cm.delete") }}
                    </span>
                  </el-dropdown-item>
                  <el-dropdown-item>
                    <span @click="saveStartClick(scope.row)">
                      <span v-if="scope.row.ruleStatus == '1'">
                        <span
                          class="cud3-icon-blue font_family icon-icon_more_disable"
                        ></span>
                        {{ $t("cm.disable") }}</span
                      >
                      <span v-if="scope.row.ruleStatus != '1'">
                        <span
                          class="cud3-icon-blue font_family icon-icon_more_star"
                        ></span>
                        {{ $t("cm.enable") }}</span
                      >
                    </span>
                  </el-dropdown-item>
                  <el-dropdown-item>
                    <span @click="addAccount(scope.row)">
                      <span
                        class="cud3-icon-blue font_family icon-icon_more_configure"
                      ></span>
                      {{ $t("flow.config") }}
                    </span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>
        <el-row>
          <div class="cud-special-pagination">
            <el-button
              class="cud__button--add"
              size="small"
              @click="addInterface"
              >{{ $t("cm.increase") }}</el-button
            >
            <el-pagination popper-class="cud-pager-dropdown"
              ref="pager"
              class="cud__page"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="current"
              :page-sizes="[10, 20, 30, 40]"
              :page-size="size"
              :pager-count="5"
              layout="total,sizes, prev, pager, next"
              :total="total"
            >
            </el-pagination>
          </div>
        </el-row>
      </el-row>
      <div>
        <el-dialog
          v-dragMove="{
            DragButton: '.el-dialog__header',
            DragWindow: '.el-dialog'
          }"
          :title="$t('sys.interface_setting')"
          :visible.sync="configflowDialogVisible"
          width="80%"
        >
          <el-form
            ref="itemForm"
            :rules="itemRules"
            :model="flowVO"
            label-width="170px"
          >
            <el-row>
              <el-col :span="20" class="cud__col20">
                <el-form-item
                  :label="$t('sys.interface_id')"
                  prop="interfaceId"
                  v-if="flowVO.saveAction !== 'view'"
                >
                  <el-input
                    :placeholder="$t('cm.pleaseEnter')"
                    maxlength="256"
                    v-model="flowVO.interfaceId"
                    size="small"
                    class="form-input"
                  ></el-input>
                </el-form-item>
                <el-form-item
                  :label="$t('sys.interface_id')"
                  v-if="flowVO.saveAction === 'view'"
                  >{{ flowVO.interfaceId }}</el-form-item
                >
              </el-col>
              <el-col :span="20" class="cud__col20">
                <el-form-item
                  :label="$t('sys.interface_type')"
                  prop="interfaceType"
                  v-if="flowVO.saveAction !== 'view'"
                >
                  <el-select
                    class="form-input"
                    v-model="flowVO.interfaceType"
                    size="small"
                    :clearable="true"
                  >
                    <el-option
                      v-for="(item, index) in interfaceTypes"
                      :key="index"
                      :label="item.label"
                      :value="item.value"
                    ></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item
                  :label="$t('sys.interface_type')"
                  v-if="flowVO.saveAction === 'view'"
                  >{{ getInterfaceTypes(flowVO.interfaceType) }}</el-form-item
                >
              </el-col>
              <el-col :span="20" class="cud__col20">
                <el-form-item
                  :label="$t('sys.business_type')"
                  prop="businessClass"
                  v-if="flowVO.saveAction !== 'view'"
                >
                  <el-input
                    :placeholder="$t('cm.pleaseEnter')"
                    maxlength="256"
                    v-model="flowVO.businessClass"
                    size="small"
                    class="form-input"
                  ></el-input>
                </el-form-item>
                <el-form-item
                  :label="$t('sys.business_type')"
                  v-if="flowVO.saveAction === 'view'"
                  >{{ flowVO.businessClass }}</el-form-item
                >
              </el-col>
              <el-col :span="20" class="cud__col20">
                <el-form-item
                  :label="$t('sys.call_direction')"
                  prop="callDirection"
                  v-if="flowVO.saveAction !== 'view'"
                >
                  <el-select
                    class="form-input"
                    v-model="flowVO.callDirection"
                    size="small"
                    :clearable="true"
                  >
                    <el-option
                      v-for="(item, index) in callDirections"
                      :key="index"
                      :label="item.label"
                      :value="item.value"
                    ></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item
                  :label="$t('sys.call_direction')"
                  v-if="flowVO.saveAction === 'view'"
                  >{{ getCallDirections(flowVO.callDirection) }}</el-form-item
                >
              </el-col>
              <el-col :span="20" class="cud__col20 add_tip_textarea">
                <el-form-item
                  :label="$t('sys.interface_address')"
                  prop="interfaceAddress"
                  v-if="flowVO.saveAction !== 'view'"
                >
                  <el-input
                    :placeholder="$t('cm.pleaseEnter')"
                    v-model="flowVO.interfaceAddress"
                    type="textarea"
                    :row="1"
                    maxlength="256"
                  ></el-input>
                </el-form-item>
                <el-form-item
                  :label="$t('sys.interface_address')"
                  v-if="flowVO.saveAction === 'view'"
                  >{{ flowVO.interfaceAddress }}</el-form-item
                >
              </el-col>
              <el-col :span="20" class="cud__col20 add_tip_textarea">
                <el-form-item
                  :label="$t('sys.interface_content')"
                  prop="interfaceContent"
                  v-if="flowVO.saveAction !== 'view'"
                >
                  <el-input
                    :placeholder="$t('cm.pleaseEnter')"
                    v-model="flowVO.interfaceContent"
                    type="textarea"
                    :row="1"
                    maxlength="256"
                  ></el-input>
                </el-form-item>
                <el-form-item
                  :label="$t('sys.interface_content')"
                  v-if="flowVO.saveAction === 'view'"
                  >{{ flowVO.interfaceContent }}</el-form-item
                >
              </el-col>
              <el-col :span="20" class="cud__col20 add_tip_textarea">
                <el-form-item
                  :label="$t('sys.param_content')"
                  prop="paramContent"
                  v-if="flowVO.saveAction !== 'view'"
                >
                  <el-input
                    :placeholder="$t('cm.pleaseEnter')"
                    v-model="flowVO.paramContent"
                    type="textarea"
                    :row="1"
                    maxlength="256"
                  ></el-input>
                </el-form-item>
                <el-form-item
                  :label="$t('sys.param_content')"
                  v-if="flowVO.saveAction === 'view'"
                  >{{ flowVO.paramContent }}</el-form-item
                >
              </el-col>
              <el-col :span="20" class="cud__col20 add_tip_textarea">
                <el-form-item
                  :label="$t('sys.return_content')"
                  prop="returnContent"
                  v-if="flowVO.saveAction !== 'view'"
                >
                  <el-input
                    :placeholder="$t('cm.pleaseEnter')"
                    v-model="flowVO.returnContent"
                    type="textarea"
                    :row="1"
                    maxlength="256"
                  ></el-input>
                </el-form-item>
                <el-form-item
                  :label="$t('sys.return_content')"
                  v-if="flowVO.saveAction === 'view'"
                  >{{ flowVO.returnContent }}</el-form-item
                >
              </el-col>
              <el-col :span="20" class="cud__col20 add_tip_textarea">
                <el-form-item
                  :label="$t('sys.asynchronous_flag')"
                  v-if="flowVO.saveAction !== 'view'"
                >
                  <template>
                    <el-radio-group
                      v-model="flowVO.asynchronousFlag"
                      @change="asynchronousChange"
                    >
                      <el-radio :label="1">同步</el-radio>
                      <el-radio :label="2">异步</el-radio>
                    </el-radio-group>
                  </template>
                </el-form-item>
                <el-form-item
                  :label="$t('sys.asynchronous_flag')"
                  v-if="flowVO.saveAction === 'view'"
                  >{{
                    getAsynchronousFlags(flowVO.asynchronousFlag)
                  }}</el-form-item
                >
              </el-col>
              <el-col
                :span="20"
                class="cud__col20"
                v-if="flowVO.asynchronousFlag === 2"
              >
                <el-form-item
                  :label="$t('sys.call_back_interface_id')"
                  prop="callBackInterfaceId"
                  v-if="flowVO.saveAction !== 'view'"
                >
                  <el-input
                    :placeholder="$t('cm.pleaseEnter')"
                    maxlength="256"
                    v-model="flowVO.callBackInterfaceId"
                    size="small"
                    class="form-input"
                  ></el-input>
                </el-form-item>
                <el-form-item
                  :label="$t('sys.call_back_interface_id')"
                  v-if="flowVO.saveAction === 'view'"
                  >{{ flowVO.callBackInterfaceId }}</el-form-item
                >
              </el-col>
              <el-col
                :span="20"
                class="cud__col20"
                v-if="flowVO.asynchronousFlag === 2"
              >
                <el-form-item
                  :label="$t('sys.call_back_interface_type')"
                  prop="callBackInterfaceType"
                  v-if="flowVO.saveAction !== 'view'"
                >
                  <el-select
                    class="form-input"
                    v-model="flowVO.callBackInterfaceType"
                    size="small"
                    :clearable="true"
                  >
                    <el-option
                      v-for="(item, index) in interfaceTypes"
                      :key="index"
                      :label="item.label"
                      :value="item.value"
                    ></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item
                  :label="$t('sys.call_back_interface_type')"
                  v-if="flowVO.saveAction === 'view'"
                  >{{
                    getInterfaceTypes(flowVO.callBackInterfaceType)
                  }}</el-form-item
                >
              </el-col>
              <el-col
                :span="20"
                class="cud__col20"
                v-if="flowVO.asynchronousFlag === 2"
              >
                <el-form-item
                  :label="$t('sys.call_back_business_type')"
                  prop="callBackBusinessClass"
                  v-if="flowVO.saveAction !== 'view'"
                >
                  <el-input
                    :placeholder="$t('cm.pleaseEnter')"
                    maxlength="256"
                    v-model="flowVO.callBackBusinessClass"
                    size="small"
                    class="form-input"
                  ></el-input>
                </el-form-item>
                <el-form-item
                  :label="$t('sys.call_back_business_type')"
                  v-if="flowVO.saveAction === 'view'"
                  >{{ flowVO.callBackBusinessClass }}</el-form-item
                >
              </el-col>
              <el-col
                :span="20"
                class="cud__col20"
                v-if="flowVO.asynchronousFlag === 2"
              >
                <el-form-item
                  :label="$t('sys.call_back_call_direction')"
                  prop="callBackCallDirection"
                  v-if="flowVO.saveAction !== 'view'"
                >
                  <el-select
                    class="form-input"
                    v-model="flowVO.callBackCallDirection"
                    size="small"
                    :clearable="true"
                  >
                    <el-option
                      v-for="(item, index) in callDirections"
                      :key="index"
                      :label="item.label"
                      :value="item.value"
                    ></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item
                  :label="$t('sys.call_back_call_direction')"
                  v-if="flowVO.saveAction === 'view'"
                  >{{
                    getCallDirections(flowVO.callBackCallDirection)
                  }}</el-form-item
                >
              </el-col>
              <el-col
                :span="20"
                class="cud__col20 add_tip_textarea"
                v-if="flowVO.asynchronousFlag === 2"
              >
                <el-form-item
                  :label="$t('sys.call_back_interface_address')"
                  prop="callBackInterfaceAddress"
                  v-if="flowVO.saveAction !== 'view'"
                >
                  <el-input
                    :placeholder="$t('cm.pleaseEnter')"
                    v-model="flowVO.callBackInterfaceAddress"
                    type="textarea"
                    :row="1"
                    maxlength="256"
                  ></el-input>
                </el-form-item>
                <el-form-item
                  :label="$t('sys.call_back_interface_address')"
                  v-if="flowVO.saveAction === 'view'"
                  >{{ flowVO.callBackInterfaceAddress }}</el-form-item
                >
              </el-col>
              <el-col
                :span="20"
                class="cud__col20 add_tip_textarea"
                v-if="flowVO.asynchronousFlag === 2"
              >
                <el-form-item
                  :label="$t('sys.interface_content')"
                  prop="callBackInterfaceContent"
                  v-if="flowVO.saveAction !== 'view'"
                >
                  <el-input
                    :placeholder="$t('cm.pleaseEnter')"
                    v-model="flowVO.callBackInterfaceContent"
                    type="textarea"
                    :row="1"
                    maxlength="256"
                  ></el-input>
                </el-form-item>
                <el-form-item
                  :label="$t('sys.interface_content')"
                  v-if="flowVO.saveAction === 'view'"
                  >{{ flowVO.callBackInterfaceContent }}</el-form-item
                >
              </el-col>
              <el-col
                :span="20"
                class="cud__col20 add_tip_textarea"
                v-if="flowVO.asynchronousFlag === 2"
              >
                <el-form-item
                  :label="$t('sys.param_content')"
                  prop="callBackParamContent"
                  v-if="flowVO.saveAction !== 'view'"
                >
                  <el-input
                    :placeholder="$t('cm.pleaseEnter')"
                    v-model="flowVO.callBackParamContent"
                    type="textarea"
                    :row="1"
                    maxlength="256"
                  ></el-input>
                </el-form-item>
                <el-form-item
                  :label="$t('sys.param_content')"
                  v-if="flowVO.saveAction === 'view'"
                  >{{ flowVO.callBackParamContent }}</el-form-item
                >
              </el-col>
              <el-col
                :span="20"
                class="cud__col20 add_tip_textarea"
                v-if="flowVO.asynchronousFlag === 2"
              >
                <el-form-item
                  :label="$t('sys.return_content')"
                  prop="callBackReturnContent"
                  v-if="flowVO.saveAction !== 'view'"
                >
                  <el-input
                    :placeholder="$t('cm.pleaseEnter')"
                    v-model="flowVO.callBackReturnContent"
                    type="textarea"
                    :row="1"
                    maxlength="256"
                  ></el-input>
                </el-form-item>
                <el-form-item
                  :label="$t('sys.return_content')"
                  v-if="flowVO.saveAction === 'view'"
                  >{{ flowVO.callBackReturnContent }}</el-form-item
                >
              </el-col>
            </el-row>
            <el-col :span="20" class="cud__col20">
              <el-form-item
                :label="$t('sys.enable_flag')"
                prop="enableFlag"
                v-if="flowVO.saveAction !== 'view'"
              >
                <el-checkbox v-model="flowVO.enableFlagValue"></el-checkbox>
              </el-form-item>
              <el-form-item
                :label="$t('sys.enable_flag')"
                v-if="flowVO.saveAction === 'view'"
                >{{ getAccountStatuss(flowVO.enableFlag) }}</el-form-item
              >
            </el-col>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button
              class="cud__button--search"
              size="small"
              @click="saveFlowClick"
              v-if="flowVO.saveAction !== 'view'"
              >{{ $t("cm.commit") }}
            </el-button>
            <el-button
              class="cud__button--reset"
              size="small"
              @click="configFlowDialogHandleClose"
              >{{ $t("cm.return") }}</el-button
            >
          </div>
        </el-dialog>
        <!--添加账户dialog-->
        <el-dialog
          :title="$t('sys.account_setting')"
          :close-on-click-modal="false"
          :visible.sync="addMainEntityVisible"
          width="50%"
          class="model_dialog"
          v-dragMove="{
            DragButton: '.el-dialog__header',
            DragWindow: '.el-dialog'
          }"
        >
          <el-form label-width="110px">
            <el-row class="cud__search--rowdialog">
              <el-col :span="10">
                <el-form-item :label="$t('sys.account_id')">
                  <el-input
                    :placeholder="$t('cm.pleaseEnter')"
                    v-model="accountModel.accountId"
                    size="small"
                  ></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item
                  :label="$t('sys.belonging_application')"
                  prop="systemType"
                >
                  <el-select
                    class="form-input"
                    v-model="accountModel.systemType"
                    size="small"
                    :clearable="true"
                  >
                    <el-option
                      v-for="(business, index) in systemTypes"
                      :key="index"
                      :label="business.label"
                      :value="business.value"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row class="cud__search--rowdialog">
              <el-col :span="24" class="cud--right">
                <el-button type="primary" size="small" @click="searchAcc">{{
                  $t("cm.search")
                }}</el-button>
                <el-button size="small" @click="resetDataAcc">{{
                  $t("cm.reset")
                }}</el-button>
              </el-col>
            </el-row>
          </el-form>
          <el-row class="cud__table--list">
            <el-col :span="24">
              <el-table
                :data="accTableData"
                border
                ref="dsTable"
                v-loading="loading"
                :empty-text="$t('cm.nodata')"
                @selection-change="selectChange"
                height="300"
              >
                <el-table-column
                  align="center"
                  type="selection"
                  width="55"
                ></el-table-column>
                <el-table-column
                  align="center"
                  prop="accountId"
                  :label="$t('sys.account_id')"
                ></el-table-column>
                <el-table-column
                  align="center"
                  prop="systemType"
                  :label="$t('sys.belonging_application')"
                >
                  <template slot-scope="scope">
                    <span>{{ getSystemTypes(scope.row.systemType) }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </el-col>
          </el-row>
          <div slot="footer" class="dialog-footer" align="center">
            <el-button
              class="cud__button--search"
              size="small"
              @click="accountIdUpdate"
              >{{ $t("cgnCommon.confirm") }}</el-button
            >
            <el-button
              class="cud__button--reset"
              size="small"
              @click="addMainEntityVisible = false"
              >{{ $t("cgnCommon.cancel") }}</el-button
            >
          </div>
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<script>
import intefaceManage from "./js/interface_manage.js";
export default intefaceManage;
</script>
<style lang="less" scoped>
// @import "src/assets/css/style";
.cud__scroll--div {
  background: #f8f8f8;
}
.cud__table--list {
  background: #f8f8f8;
}
/deep/ .el-drawer__body {
  border-top: 4px solid #0069ac;
  position: relative;
  padding-bottom: 80px;
}
</style>
