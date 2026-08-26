<!--
 * @Author: [P631038]杨旭
 * @Date: 2024-07-09 11:37:09
 * @LastEditors: [P631038]杨旭
 * @LastEditTime: 2025-04-30 16:27:08
 * @FilePath: \cud4demo-ui\src\components\cudCommPersonComponent\wfCommPersonComponent.vue
 * @Description:
-->

<template>
  <div>
    <div
      class="wfTab"
      v-if="
        showUserTab &&
          !showOrgTab &&
          !showUserGroupTab &&
          !showDynRoleTab &&
          !showStationTab
      "
    >
      <!-- 选人( 多选组件 ) -->
      <div v-if="showUserMultiple">
        <cud-custom-person-multiple
          v-if="customComponentsCheck('CudCustomPersonMultiple')"
          ref="userComponent"
          :IDS="initUserId"
          :buttonGroup="buttonGroup"
          :showCheckBox="showCheckbox"
          :appCode="appCode"
          :lang="lang"
          :init-org-id="initOrgId"
        ></cud-custom-person-multiple>
        <msingle
          v-else
          ref="userComponent"
          :IDS="initUserId"
          :buttonGroup="buttonGroup"
          :showCheckBox="showCheckbox"
          :appCode="appCode"
          :lang="lang"
          :init-org-id="initOrgId"
          :orgTreeExpand="orgTreeExpand"
          :orgTreeOrgIds="orgTreeOrgIds"
        ></msingle>
      </div>
      <div v-if="!showUserMultiple">
        <cud-custom-person-single
          v-if="customComponentsCheck('CudCustomPersonSingle')"
          ref="userComponent"
          :IDS="initUserId"
          :buttonGroup="buttonGroup"
          :showCheckBox="showCheckbox"
          :appCode="appCode"
          :lang="lang"
          :init-org-id="initOrgId"
        ></cud-custom-person-single>
        <!-- 选人( 单选组件 ) -->
        <asingle
          v-else
          ref="userComponent"
          :IDS="initUserId"
          :buttonGroup="buttonGroup"
          :showCheckBox="showCheckbox"
          :appCode="appCode"
          :lang="lang"
          :init-org-id="initOrgId"
          :orgTreeExpand="orgTreeExpand"
          :orgTreeOrgIds="orgTreeOrgIds"
        ></asingle>
      </div>
    </div>
    <div
      class="wfTab"
      v-else-if="
        !showUserTab &&
          showOrgTab &&
          !showUserGroupTab &&
          !showDynRoleTab &&
          !showStationTab
      "
    >
      <cud-commm-org-component
        ref="orgComponent"
        :buttonGroup="buttonGroup"
        :showCheckBox="orgShowCheckbox"
        :appCode="appCode"
        :lang="lang"
        :initOrgId="initOrgId"
      ></cud-commm-org-component>
    </div>
    <div
      class="wfTab"
      v-else-if="
        !showUserTab &&
          !showOrgTab &&
          showUserGroupTab &&
          !showDynRoleTab &&
          !showStationTab
      "
    >
      <el-row style="padding: 10px 10px">
        <el-col :span="24" class="cud--right" style="padding-right: 16px">
          <el-button type="primary" size="small" @click="bindGroupRuleFunc">{{
            $t("wm.route_binding")
          }}</el-button>
        </el-col>
        <el-col
          :span="20"
          v-if="groupRuleBindingData.ruleContext"
          style="padding-top: 5px"
        >
          {{ $t("wm.route_binding_context") }}：[{{
            groupRuleBindingData.ruleName
          }}]-{{ groupRuleBindingData.ruleContext }}
        </el-col>
      </el-row>
      <el-row class="usergroup">
        <el-transfer
          ref="transferGroup"
          filterable
          :filter-placeholder="$t('wm.enter_group_name')"
          :titles="queryData"
          :props="{ key: 'groupId', label: 'groupName' }"
          v-model="transferGroupData"
          @change="transferGroupChangeFunc"
          :data="transferGroupAllData"
          :render-content="renderGroupShow"
        >
        </el-transfer>
      </el-row>
    </div>
    <div
      class="wfTab"
      v-else-if="
        !showUserTab &&
          !showOrgTab &&
          !showUserGroupTab &&
          showDynRoleTab &&
          !showStationTab
      "
    >
      <el-row>
        <el-col :span="24" class="cud--right mb-10">
          <el-button
            type="primary"
            size="small"
            @click="bindDynamicRoleRuleFunc"
            >{{ $t("wm.add_dynamic_role_rule") }}</el-button
          >
        </el-col>
      </el-row>
      <el-row class="dynamicRole">
        <el-table :data="dynamicRoleData">
          <el-table-column
            align="center"
            type="index"
            :label="$t('cm.no')"
            width="70"
          ></el-table-column>
          <el-table-column
            :label="$t('wm.rule_name')"
            prop="participantName"
          ></el-table-column>
          <el-table-column align="left" :label="$t('cm.operate')" width="100">
            <template slot-scope="scope">
              <!--删除按钮暂时隐藏-->
              <el-button
                class="cud-common-operate-delete"
                type="text"
                size="small"
                @click="delDynaRule(scope.row, scope.$index)"
                >{{ $t("cm.delete") }}</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </el-row>
    </div>
    <!-- <div
      class="wfTab"
      v-else-if="
        !showUserTab &&
          !showOrgTab &&
          !showUserGroupTab &&
          !showDynRoleTab &&
          showStationTab
      "
    >
      <el-form
        ref="showStationTabForm"
        size="small"
        label-position="top"
        label-suffix="："
        label-width="110px"
      >
        <el-row>
          <el-col :span="24">
            <el-form-item :label="$t('wm.select_company')" prop="companyName">
              <el-input
                :placeholder="$t('wm.select_company')"
                disabled
                class="cud-commom-search-ipt el-input-search"
                v-model="stationSelCompany.companyName"
              >
                <el-button
                  size="small"
                  type="primary"
                  class="el-button--half"
                  slot="append"
                  icon="el-icon-search"
                  @click="openCompanyDialogFun"
                ></el-button>
              </el-input>
            </el-form-item>
          </el-col> 
          <el-col :span="24">
            <el-form-item :label="$t('wm.select_position')" prop="companyName">
              <el-row>
                <el-col :span="10">
                  <el-table
                    class="border-card"
                    ref="stationTypeTable"
                    :data="stationTypeData"
                    max-height="400"
                    tooltip-effect="dark"
                    @selection-change="stationTypeHandleSelectionChange"
                  >
                    <el-table-column
                      align="center"
                      type="selection"
                      width="65"
                    ></el-table-column>
                    <el-table-column
                      align="left"
                      prop="stationType"
                      :label="$t('wm.position')"
                      width="100"
                    >
                      <template slot-scope="scope">
                        <span v-if="scope.row.stationType === '1'">正职</span>
                        <span v-if="scope.row.stationType === '2'">副职</span>
                        <span v-if="scope.row.stationType === '3'"
                          >部门秘书</span
                        >
                        <span v-if="scope.row.stationType === '5'"
                          >预算协调员</span
                        >
                      </template>
                    </el-table-column>
                    <el-table-column
                      align="left"
                      prop="stationTypePersons"
                      :label="$t('wm.cp_person')"
                      show-overflow-tooltip
                    ></el-table-column>
                  </el-table>
                </el-col>
                <el-col
                  :span="2"
                  style="
                    padding-left: 5px;
                    padding-right: 5px;
                    padding-top: 12px;
                    text-align: center;
                  "
                >
                  <el-button
                    class="mb-10"
                    type="primary"
                    size="small"
                    icon="el-icon-d-arrow-right"
                    @click="addStationType"
                  ></el-button>
                  <el-button
                    type="primary"
                    size="small"
                    icon="el-icon-d-arrow-left"
                    @click="delStationType"
                  ></el-button>
                </el-col>
                <el-col :span="12">
                  <el-table
                    class="border-card"
                    ref="selStationTypeTable"
                    :data="selStationTypeData"
                    max-height="400"
                    tooltip-effect="dark"
                    @selection-change="selStationTypeHandleSelectionChange"
                  >
                    <el-table-column
                      align="center"
                      type="selection"
                      width="65"
                    ></el-table-column>
                    <el-table-column
                      align="left"
                      prop="stationOrgName"
                      :label="$t('wm.department')"
                      width="100"
                      show-overflow-tooltip
                    ></el-table-column>
                    <el-table-column
                      align="left"
                      prop="stationType"
                      :label="$t('wm.position')"
                      width="100"
                    >
                      <template slot-scope="scope">
                        <span v-if="scope.row.stationType === '1'">正职</span>
                        <span v-if="scope.row.stationType === '2'">副职</span>
                        <span v-if="scope.row.stationType === '3'"
                          >部门秘书</span
                        >
                        <span v-if="scope.row.stationType === '5'"
                          >预算协调员</span
                        >
                      </template>
                    </el-table-column>
                    <el-table-column
                      align="left"
                      prop="stationTypePersons"
                      :label="$t('wm.cp_person')"
                      show-overflow-tooltip
                    ></el-table-column>
                  </el-table>
                </el-col>
              </el-row>
            </el-form-item>
          </el-col>
        </el-row> 
      </el-form>
    </div> -->
    <!-- 有tab -->
    <el-tabs v-model="activeTabName" class="border-bottom-card" v-else>
      <el-tab-pane
        :label="$t('wm.user_name')"
        name="userTab"
        v-if="showUserTab"
      >
        <div v-if="showUserMultiple">
          <cud-custom-person-multiple
            v-if="customComponentsCheck('CudCustomPersonMultiple')"
            ref="userComponent"
            :IDS="initUserId"
            :buttonGroup="buttonGroup"
            :showCheckBox="showCheckbox"
            :appCode="appCode"
            :lang="lang"
            :init-org-id="initOrgId"
          ></cud-custom-person-multiple>
          <msingle
            v-else
            ref="userComponent"
            :IDS="initUserId"
            :buttonGroup="buttonGroup"
            :showCheckBox="showCheckbox"
            :appCode="appCode"
            :lang="lang"
            :init-org-id="initOrgId"
            :orgTreeExpand="orgTreeExpand"
            :orgTreeOrgIds="orgTreeOrgIds"
          ></msingle>
        </div>
        <div v-if="!showUserMultiple">
          <cud-custom-person-single
            v-if="customComponentsCheck('CudCustomPersonSingle')"
            ref="userComponent"
            :IDS="initUserId"
            :buttonGroup="buttonGroup"
            :showCheckBox="showCheckbox"
            :appCode="appCode"
            :lang="lang"
            :init-org-id="initOrgId"
          ></cud-custom-person-single>
          <asingle
            v-else
            ref="userComponent"
            :IDS="initUserId"
            :buttonGroup="buttonGroup"
            :showCheckBox="showCheckbox"
            :appCode="appCode"
            :lang="lang"
            :init-org-id="initOrgId"
            :orgTreeExpand="orgTreeExpand"
            :orgTreeOrgIds="orgTreeOrgIds"
          ></asingle>
        </div>
      </el-tab-pane>
      <el-tab-pane :label="$t('wm.department')" name="orgTab" v-if="showOrgTab">
        <cud-commm-org-component
          ref="orgComponent"
          :buttonGroup="buttonGroup"
          :showCheckBox="orgShowCheckbox"
          :appCode="appCode"
          :lang="lang"
          :rightMenuItems="rightMenuItem"
          :initOrgId="initOrgId"
        ></cud-commm-org-component>
      </el-tab-pane>
      <el-tab-pane
        :label="$t('wm.user_group')"
        name="userGroupTab"
        v-if="showUserGroupTab"
      >
        <el-row style="padding:0 10px 10px">
          <el-col :span="24" class="cud--right" style="padding-right: 16px">
            <el-button type="primary" size="small" @click="bindGroupRuleFunc">{{
              $t("wm.route_binding")
            }}</el-button>
          </el-col>
          <el-col
            :span="20"
            v-if="groupRuleBindingData.ruleContext"
            style="padding-top: 5px"
          >
            {{ $t("wm.route_binding_context") }}：[{{
              groupRuleBindingData.ruleName
            }}]-{{ groupRuleBindingData.ruleContext }}
          </el-col>
        </el-row>
        <el-row class="usergroup">
          <el-transfer
            ref="transferGroup"
            filterable
            :filter-placeholder="$t('wm.enter_group_name')"
            :titles="queryData"
            :props="{ key: 'groupId', label: 'groupName' }"
            v-model="transferGroupData"
            @change="transferGroupChangeFunc"
            :data="transferGroupAllData"
            :render-content="renderGroupShow"
          >
          </el-transfer>
        </el-row>
      </el-tab-pane>
      <el-tab-pane
        :label="$t('wm.dynamic_role')"
        name="dynRoleTab"
        v-if="showDynRoleTab"
      >
        <el-row>
          <el-col :span="24" class="cud--right mb-10">
            <el-button
              type="primary"
              size="small"
              @click="bindDynamicRoleRuleFunc"
              >{{ $t("wm.add_dynamic_role_rule") }}</el-button
            >
          </el-col>
        </el-row>
        <el-row class="dynamicRole">
          <el-table :data="dynamicRoleData">
            <el-table-column
              align="center"
              type="index"
              :label="$t('cm.no')"
              width="70"
            ></el-table-column>
            <el-table-column
              :label="$t('wm.rule_name')"
              prop="participantName"
            ></el-table-column>
            <el-table-column align="left" :label="$t('cm.operate')" width="100">
              <template slot-scope="scope">
                <!--删除按钮暂时隐藏-->
                <el-button
                  class="cud-common-operate-delete"
                  type="text"
                  size="small"
                  @click="delDynaRule(scope.row, scope.$index)"
                  >{{ $t("cm.delete") }}</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-row>
      </el-tab-pane>
      <!-- 不需要反显示 -->
      <!-- <el-tab-pane
        :label="$t('wm.post')"
        name="stationTab"
        v-if="showStationTab"
      >
        <el-form
          ref="showStationTabForm"
          size="small"
          label-position="top"
          label-suffix="："
          label-width="110px"
        >
          <el-row>
            <el-col :span="24">
              <el-form-item :label="$t('wm.select_company')" prop="companyName">
                <el-input
                  :placeholder="$t('wm.select_company')"
                  disabled
                  class="cud-commom-search-ipt el-input-search"
                  v-model="stationSelCompany.companyName"
                >
                  <el-button
                    size="small"
                    type="primary"
                    class="el-button--half"
                    slot="append"
                    icon="el-icon-search"
                    @click="openCompanyDialogFun"
                  ></el-button>
                </el-input>
              </el-form-item>
            </el-col> 
            <el-col :span="24">
              <el-form-item
                :label="$t('wm.select_position')"
                prop="companyName"
              >
                <el-row>
                  <el-col :span="10">
                    <el-table
                      class="border-card"
                      ref="stationTypeTable"
                      :data="stationTypeData"
                      max-height="400"
                      tooltip-effect="dark"
                      @selection-change="stationTypeHandleSelectionChange"
                    >
                      <el-table-column
                        align="center"
                        type="selection"
                        width="65"
                      ></el-table-column>
                      <el-table-column
                        align="left"
                        prop="stationType"
                        :label="$t('wm.position')"
                        width="100"
                      >
                        <template slot-scope="scope">
                          <span v-if="scope.row.stationType === '1'">正职</span>
                          <span v-if="scope.row.stationType === '2'">副职</span>
                          <span v-if="scope.row.stationType === '3'"
                            >部门秘书</span
                          >
                          <span v-if="scope.row.stationType === '5'"
                            >预算协调员</span
                          >
                        </template>
                      </el-table-column>
                      <el-table-column
                        align="left"
                        prop="stationTypePersons"
                        :label="$t('wm.cp_person')"
                        show-overflow-tooltip
                      ></el-table-column>
                    </el-table>
                  </el-col>
                  <el-col
                    :span="2"
                    style="
                      padding-left: 5px;
                      padding-right: 5px;
                      padding-top: 12px;
                      text-align: center;
                    "
                  >
                    <el-button
                      class="mb-10"
                      type="primary"
                      size="small"
                      icon="el-icon-d-arrow-right"
                      @click="addStationType"
                    ></el-button>
                    <el-button
                      type="primary"
                      size="small"
                      icon="el-icon-d-arrow-left"
                      @click="delStationType"
                    ></el-button>
                  </el-col>
                  <el-col :span="12">
                    <el-table
                      class="border-card"
                      ref="selStationTypeTable"
                      :data="selStationTypeData"
                      max-height="400"
                      tooltip-effect="dark"
                      @selection-change="selStationTypeHandleSelectionChange"
                    >
                      <el-table-column
                        align="center"
                        type="selection"
                        width="65"
                      ></el-table-column>
                      <el-table-column
                        align="left"
                        prop="stationOrgName"
                        :label="$t('wm.department')"
                        width="100"
                        show-overflow-tooltip
                      ></el-table-column>
                      <el-table-column
                        align="left"
                        prop="stationType"
                        :label="$t('wm.position')"
                        width="100"
                      >
                        <template slot-scope="scope">
                          <span v-if="scope.row.stationType === '1'">正职</span>
                          <span v-if="scope.row.stationType === '2'">副职</span>
                          <span v-if="scope.row.stationType === '3'"
                            >部门秘书</span
                          >
                          <span v-if="scope.row.stationType === '5'"
                            >预算协调员</span
                          >
                        </template>
                      </el-table-column>
                      <el-table-column
                        align="left"
                        prop="stationTypePersons"
                        :label="$t('wm.cp_person')"
                        show-overflow-tooltip
                      ></el-table-column>
                    </el-table>
                  </el-col>
                </el-row>
              </el-form-item>
            </el-col>
          </el-row> 
        </el-form>
      </el-tab-pane> -->
    </el-tabs>
    <!-- 通用组规则绑定弹出窗口 -->
    <rule-binding
      ref="ruleCurrencyBinding"
      :customForm="customForm"
      @bindingRouteDataCurrency="groupRuleBindCallback"
      :ruleFunType="groupRuleBindType"
    ></rule-binding>
    <!-- 动态角色规则绑定弹出窗口 -->
    <rule-binding
      ref="ruleDynamicBinding"
      :customForm="customForm"
      @bindingRouteDataDynamic="bindingDynamicRoleRuleCallback"
      :ruleFunType="dynamicRoleRuleType"
    ></rule-binding>
    <!-- 公司选择弹出框 -->
    <div class="companyDialog">
      <el-dialog
        :visible.sync="showCompanyDialog"
        v-if="showCompanyDialog"
        custom-class="company-dialog"
        :modal="true"
        :destory-on-close="true"
        :close-on-click-modal="false"
        :append-to-body="true"
        width="60%"
        :title="$t('flow.company_dialog_title')"
        @opened="opendCompanyDialogFun"
        @close="closedCompanyDialogFun"
        v-dragMove="{
          DragButton: '.el-dialog__header',
          DragWindow: '.el-dialog'
        }"
      >
        <div class="companyDialogBody el-dialog-div">
          <cud-commm-org-component
            ref="stationOrgDialogComponent"
            :buttonGroup="stationOrgDialogComponentOption.buttonGroup"
            :showCheckbox="stationOrgDialogComponentOption.showCheckbox"
            :appCode="stationOrgDialogComponentOption.appCode"
            :lang="stationOrgDialogComponentOption.lang"
            :init-org-id="initOrgId"
            :initOrgId="initOrgId"
          ></cud-commm-org-component>
        </div>
        <div slot="footer" class="dialog-footer" align="center">
          <el-button size="small" @click="closeCompanyDialog">{{
            $t("cm.close")
          }}</el-button>
          <el-button
            size="small"
            type="primary"
            @click="commitCompanyDialogBinding"
            >{{ $t("cm.confirm2") }}</el-button
          >
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import asingle from "./asingle.vue";
import msingle from "./msingle.vue";
import cudCommmOrgComponent from "./organization.vue";
import API from "./api";
// import ruleApi from '@/components/ruleComponent/api'
import ruleBinding from "@@/components/ruleComponent/rule-binding/ruleBinding";
import constant from "./constant.js";
import cmsg from "@@/components/common/message";
import _ from "lodash";
import Asingle from "./asingle";
export default {
  name: "wfCommPersonComponent",
  props: {
    showUserMultiple: {
      type: Boolean,
      default: true
    },
    showUserTab: {
      type: Boolean,
      default: true
    },
    showOrgTab: {
      type: Boolean,
      default: true
    },
    showUserGroupTab: {
      type: Boolean,
      default: true
    },
    showDynRoleTab: {
      type: Boolean,
      default: true
    },
    showStationTab: {
      type: Boolean,
      default: true
    },
    orgShowCheckbox: {
      type: Boolean,
      default: true
    },
    showCheckbox: {
      type: Boolean,
      default: true
    },
    initOrgId: {
      type: String,
      default: "00888888"
    },
    initUserId: {
      type: String,
      default: ""
    },
    //左侧组织树默认展开
    orgTreeExpand: {
      type: Boolean,
      default: false
    },
    //左侧组织树常用组织ID
    orgTreeOrgIds: {
      type: String,
      default: ""
    },
    initOrgIdOrgComIDS: {
      type: String,
      default: ""
    },
    rightMenuItem: {
      type: Array,
      default() {
        return [];
      }
    },
    transferGroupDataProp: {
      type: Array,
      default() {
        return [];
      }
    },
    dynamicRoleDataArr: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  components: {
    msingle,
    cudCommmOrgComponent,
    ruleBinding,
    asingle
  },
  data() {
    return {
      activeTabName: "userTab",
      /*********************************选人和选组织组件(userTab,orgTab) BEGIN*************************************************/
      IDS: "", // 回显人员
      buttonGroup: false,
      //orgShowCheckbox: false,
      appCode: "cud",
      lang: "zh_CN",
      // initOrgId: '00888888',
      // 搜索框标题
      queryData: [this.$t("wm.all_group"), this.$t("wm.select_group")],
      /*********************************选人和选组织组件 END*************************************************/

      /*******************************流程组（groupTab） BEGIN************************************************************/
      transferGroupAllData: [], //组全部数据
      transferGroupData: [], //流程组穿梭框选择的数据
      groupData: [], //流程组选中的数据
      groupRuleBindType: constant.ruleFunType.currency, //流程组绑定规则的规则类型
      groupRuleBindingData: {}, //绑定的通用角色的规则
      /*******************************流程组 END************************************************************/
      dynamicRoleRuleType: constant.ruleFunType.dynamic, //动态角色规则绑定类型
      //绑定的动态角色的规则
      dynamicRoleData: [],
      /*******************************动态角色 END*****************************************************/

      /*********************职位Tab(stationTab) BEGIN***************************************************** */
      stationTransferTitles: ["职位", "已选择"],
      // 选择公司绑定对象
      stationSelCompany: {
        companyId: "",
        companyName: ""
      },
      // 职位选择的对象
      stationSelData: [],
      // 公司选择窗口选择
      showCompanyDialog: false,
      stationOrgDialogComponentOption: {
        buttonGroup: false,
        showCheckbox: false,
        appCode: "cud",
        lang: "zh_CN"
      },
      stationData: [],
      stationTypeConfig: [],
      // 当前选择的公司职位信息数据
      currSelStationPersonData: {
        deptNo: "",
        header1: "",
        header1Str: "",
        header2: "",
        header2Str: "",
        assistantBugget: "",
        assistantBuggetId: "",
        hrAssistantBuggetId: "",
        hrAssistantBugget: ""
      },
      showStateionPersons: "",
      stationTypeData: [],
      stationTypeMultipleSelection: [],
      selStationTypeMultipleSelection: [],
      selStationTypeData: [],
      customForm: 0

      /*********************职位Tab END***************************************************** */
    };
  },
  created() {
    this.customForm = this.$store.state.workflow.customFormPath ? 1 : 0;
  },
  computed: {
    initOrgIdNew() {
      if (this.initOrgId === "") {
        return "00888888";
      }
      return this.initOrgId;
    }
  },

  watch: {
    transferGroupDataProp: {
      handler(newValue, oldValue) {
        if (newValue) {
          this.transferGroupData = newValue;
          setTimeout(() => {
            this.transferGroupChangeFunc(this.transferGroupData);
          }, 1000);
        }
      },
      deep: true,
      immediate: true
    },
    dynamicRoleDataArr: {
      handler(newValue, oldValue) {
        if (newValue) {
          this.dynamicRoleData = newValue;
        }
      },
      deep: true,
      immediate: true
    },
    initOrgId: {
      handler(newValue, oldValue) {
        if (this.showUserTab === true) {
          this.$nextTick(() => {
            this.$refs.userComponent.initOrgTree();
          });
        }
      },
      deep: true
    }
  },
  mounted() {
    if (this.showUserTab === true) {
      this.activeTabName = "userTab";
    } else if (this.showOrgTab === true) {
      this.activeTabName = "orgTab";
    } else if (this.showUserGroupTab === true) {
      this.activeTabName = "userGroupTab";
    } else if (this.showDynRoleTab === true) {
      this.activeTabName = "dynRoleTab";
    } else if (this.showStationTab === true) {
      this.activeTabName = "stationTab";
    }
    this.init();
  },
  methods: {
    // 检查是否注册了自定义选人选部门组件（通过main.js/formViewIndex.js注册）
    // name: 选人CudCustomPersonSingle CudCustomPersonMultiple / 选部门CudCustomOrganization
    customComponentsCheck(name) {
      let components = this.$root.$options.components;
      for (let component in components) {
        if (component === name) {
          return true;
        }
      }
      return false;
    },
    init() {
      //初始化流程组 获取流程组相关的规则列表
      if (this.showUserGroupTab === true) {
        this.initWFGroupList();
      }
      if (this.showUserTab === true) {
        this.$refs.userComponent.resetData();
      }
    },
    /************************** 流程组 BEGIN ******************************************************/
    //组选中数据收集
    transferGroupChangeFunc(value) {
      // if (!this.groupRuleBindingData.ruleId) {
      //   this.$message({
      //     message: "请先绑定规则后在组信息",
      //     type: "warning"
      //   });
      //   this.transferGroupData = [];
      //   return;
      // }
      let _this = this;
      _this.groupData = [];
      this.transferGroupAllData.find(item => {
        if (value.indexOf(item.groupId) > -1) {
          let selGroupData = {};
          selGroupData.participantType = 3;
          selGroupData.participantId =
            item.groupId + "|" + this.groupRuleBindingData.ruleId;
          selGroupData.participantName = item.groupName;
          _this.groupData.push(selGroupData);
        }
      }); 
    },
    //获取组列表
    initWFGroupList() {
      let _this = this;
      API.groupListAPI({}).then(res => {
        if (res.code === "0") {
          _this.transferGroupAllData = res.data;
        }
      });
    },
    // 用于显示流程组内容的渲染
    renderGroupShow(h, option) {
      let groupDesc = option.groupDesc;
      if (option.groupDesc && option.groupDesc.length > 20) {
        return (
          <span title={option.groupDesc}>
            {" "}
            {option.groupName}[{option.groupDesc.substring(0, 20)}...]{" "}
          </span>
        );
      } else if (option.groupDesc && option.groupDesc.length <= 20) {
        return (
          <span title={option.groupDesc}>
            {" "}
            {option.groupName}[{option.groupDesc}]{" "}
          </span>
        );
      } else {
        return <span> {option.groupName}</span>;
      }
    },
    // 通用组绑定规则回调
    groupRuleBindCallback(data) {
      this.groupRuleBindingData = {
        ruleId: data.actRouteConditionId,
        ruleContext: data.actRouteConditionContent,
        ruleName: data.ruleName
      };
    },
    //显示通用角色规则弹窗
    bindGroupRuleFunc() {
      let formId = this.$store.state.workflow.actFormId;
      if (
        (!formId || formId === "") &&
        !this.$store.state.workflow.customFormPath
      ) {
        this.$message({
          message: "请先配置表单之后再选择规则！",
          type: "warning"
        });
        return;
      }
      if (
        (!formId || formId === "") &&
        !this.$store.state.workflow.customFormPath
      ) {
        this.$message({
          message: "请先配置表单之后再选择规则",
          type: "warning"
        });
        return;
      }

      this.$refs.ruleCurrencyBinding.dialogVisible = true;
      this.$refs.ruleCurrencyBinding.dialogType = "currencyTab";
      let ruleBindingData = {
        actRouteConditionId: this.groupRuleBindingData.ruleId
      };
      this.$refs.ruleCurrencyBinding.formId = formId;
      this.$refs.ruleCurrencyBinding.getTreeList(formId);
      this.$refs.ruleCurrencyBinding.getBindingRule(ruleBindingData);
    },
    /************************** 流程组 END ******************************************************/

    /*************************** 动态角色 BEGIN****************************************************** */
    //显示动态角色规则弹窗
    bindDynamicRoleRuleFunc() {
      //从store中的formVersionList里根据formId和formVersion获取真正表单formId
      let formId = this.$store.state.workflow.actFormId;
      if (
        (!formId || formId === "") &&
        !this.$store.state.workflow.customFormPath
      ) {
        this.$message({
          message: "请先配置表单之后再选择规则！",
          type: "warning"
        });
        return;
      }
      this.$refs.ruleDynamicBinding.dialogVisible = true;
      this.$refs.ruleDynamicBinding.dialogType = "dynamicTab";
      let ruleBindingData = { actRouteConditionId: "" };
      this.$refs.ruleDynamicBinding.formId = formId;
      this.$refs.ruleDynamicBinding.getTreeList(formId);
      this.$refs.ruleDynamicBinding.getBindingRule(ruleBindingData);
    },
    // 动态角色绑定规则回调
    bindingDynamicRoleRuleCallback(data) {
      for (let item in this.dynamicRoleData) {
        if (this.dynamicRoleData[item].participantName == data.ruleName) {
          this.$message({
            message: "该规则已绑定",
            type: "warning"
          });
          return;
        }
      }
      this.$message({ type: "success", message: "添加成功" });
      this.dynamicRoleData.push({
        participantType: 4,
        participantId: data.actRouteConditionId,
        participantName: data.ruleName
      });
    },
    delDynaRule(row, index) {
      this.dynamicRoleData.splice(index, 1);
    },
    /*********************************动态角色 END***************************************************** */

    /*********************************职位/岗位 BEGIN************************************ */
    // 选择公司对话框方法
    openCompanyDialogFun() {
      this.showCompanyDialog = true;
    },
    // 打开选择公司窗口
    opendCompanyDialogFun() {},
    // 关闭选择公司窗口
    closedCompanyDialogFun() {},
    // 关闭选择公司窗口
    closeCompanyDialog() {
      this.showCompanyDialog = false;
    },
    //提交公司选择窗口
    commitCompanyDialogBinding() {
      let selCompanyData = this.$refs.stationOrgDialogComponent.getData();
      if (
        selCompanyData &&
        selCompanyData[0] &&
        selCompanyData[0] === "orgTree"
      ) {
        if (
          selCompanyData[1] &&
          selCompanyData[1][0] &&
          selCompanyData[1][0] != "" &&
          selCompanyData[1][1] != ""
        ) {
          this.stationSelCompany.companyId = selCompanyData[1][1];
          this.stationSelCompany.companyName = selCompanyData[1][5];
          this._queryOrgStation();
          this.closeCompanyDialog();
        } else if (
          selCompanyData[1] &&
          selCompanyData[1][0] &&
          selCompanyData[1][0] === "" &&
          selCompanyData[1][1] === ""
        ) {
          this.stationSelCompany.companyId = "";
          this.stationSelCompany.companyName = "";
        } else {
          this.$message({
            message:
              "中台选人组件返回的数据格式错误，请联系管理员，选择项将被清空！",
            type: "warning"
          });
          this.stationSelCompany.companyId = "";
          this.stationSelCompany.companyName = "";
        }
      } else {
        this.$message({
          message:
            "中台选人组件返回的数据格式错误，请联系管理员，选择项将被清空！",
          type: "warning"
        });
        this.stationSelCompany.companyId = "";
        this.stationSelCompany.companyName = "";
      }
    },
    // 查询组织下的职位信息
    _queryOrgStation() {
      let param = { deptId: this.stationSelCompany.companyId };
      let that = this;
      API.queryStationPersonAPI(param).then(result => {
        if (result.code != "0") {
          that.$message({
            message: result.msg,
            type: "warning"
          });
        } else {
          that.currSelStationPersonData = result.data;
          that.stationTypeData = [];

          if (result.data) {
            if (result.data["header1"] && result.data["header1"] !== "") {
              let stationPersonData = {};
              stationPersonData.stationType = "1";
              stationPersonData.stationTypePersons = result.data["header1Str"];
              stationPersonData.stationTypePersonIds = result.data["header1"];
              that.stationTypeData.push(stationPersonData);
            }
            if (result.data["header2"] && result.data["header2"] !== "") {
              let stationPersonData = {};
              stationPersonData.stationType = "2";
              stationPersonData.stationTypePersons = result.data["header2Str"];
              stationPersonData.stationTypePersonIds = result.data["header2"];
              that.stationTypeData.push(stationPersonData);
            }
            if (
              result.data["assistantBuggetId"] &&
              result.data["assistantBuggetId"] !== ""
            ) {
              let stationPersonData = {};
              stationPersonData.stationType = "5";
              stationPersonData.stationTypePersons =
                result.data["assistantBugget"];
              stationPersonData.stationTypePersonIds =
                result.data["assistantBuggetId"];
              that.stationTypeData.push(stationPersonData);
            }
            if (
              result.data["deptSecretaryId"] &&
              result.data["deptSecretaryId"] !== ""
            ) {
              let stationPersonData = {};
              stationPersonData.stationType = "3";
              stationPersonData.stationTypePersons =
                result.data["deptSecretary"];
              stationPersonData.stationTypePersonIds =
                result.data["deptSecretaryId"];
              that.stationTypeData.push(stationPersonData);
            }
          }
        }
      });
    },
    // 职位类型表格
    stationTypeHandleSelectionChange(val) {
      this.stationTypeMultipleSelection = val;
    },
    selStationTypeHandleSelectionChange(val) {
      this.selStationTypeMultipleSelection = val;
    },
    addStationType() {
      let companyId = this.stationSelCompany.companyId;
      let companyName = this.stationSelCompany.companyName;
      let selStationTypeObj = {};
      for (let i = 0; i < this.stationTypeMultipleSelection.length; i++) {
        selStationTypeObj = {};
        let stationTypeSelection = this.stationTypeMultipleSelection[i];
        let sameIndex = _.findIndex(this.selStationTypeData, {
          stationOrgId: companyId,
          stationType: stationTypeSelection.stationType,
          stationTypePersonIds: stationTypeSelection.stationTypePersonIds
        });
        if (sameIndex < 0) {
          selStationTypeObj.stationOrgName = companyName;
          selStationTypeObj.stationOrgId = companyId;
          selStationTypeObj.stationType = stationTypeSelection.stationType;
          let findStationTypeName = _.find(constant.stationType, {
            value: stationTypeSelection.stationType
          });
          if (findStationTypeName) {
            selStationTypeObj.stationTypeName = findStationTypeName.label;
          } else {
            selStationTypeObj.stationTypeName = "";
          }
          selStationTypeObj.stationTypePersonIds =
            stationTypeSelection.stationTypePersonIds;
          selStationTypeObj.stationTypePersons =
            stationTypeSelection.stationTypePersons;
          this.selStationTypeData.push(selStationTypeObj);
        }
      }
    },
    delStationType() {
      for (let i = 0; i < this.selStationTypeMultipleSelection.length; i++) {
        let selStationTypeSelection = this.selStationTypeMultipleSelection[i];
        let sameIndex = _.findIndex(this.selStationTypeData, {
          stationOrgId: selStationTypeSelection.stationOrgId,
          stationType: selStationTypeSelection.stationType,
          stationTypePersonIds: selStationTypeSelection.stationTypePersonIds
        });
        if (sameIndex >= 0) {
          this.selStationTypeData.splice(sameIndex, 1);
        }
      }
    },
    /*************************职位/岗位 END************************************ */
    // 获取组件的数据方法
    getData() {
      let map = new Map();
      if (this.showUserTab === true) {
        let userData = this.$refs.userComponent.getData();
        map.set("userData", userData);
      }
      if (this.showOrgTab === true) {
        let orgData = this.$refs.orgComponent.getData();
        map.set("orgData", orgData);
      }
      if (this.showUserGroupTab === true) {
        let groupData = this.groupData;
        map.set("groupData", groupData);
      }
      if (this.showDynRoleTab === true) {
        let dynamicRoleData = this.dynamicRoleData;
        map.set("dynamicRoleData", dynamicRoleData);
      }
      if (this.showStationTab === true) {
        let stationData = this.selStationTypeData;
        map.set("stationData", stationData);
      }
      return map;
    }
  }
};
</script>
<style lang="less" scoped>
/deep/ .usergroup .el-transfer {
  text-align: center;
  clear: both;
}
/deep/ .usergroup .el-transfer-panel {
  width: 42% !important;
  text-align: left;
}
/deep/ .usergroup .el-transfer-panel__filter {
  margin: 0px !important;
  padding: 10px !important;
}

/deep/ .stationTransfer .el-transfer {
  text-align: center;
  clear: both;
}
/deep/ .stationTransfer .el-transfer-panel {
  width: 42% !important;
  text-align: left;
}
/deep/ .stationTransfer .el-transfer-panel__filter {
  margin: 0px !important;
  padding: 10px !important;
}
/deep/ .companyDialog .el-dialog .el-dialog__body {
  // height: 100px;
}
.el-button--mini {
  padding: 7px 10px;
}
.el-dialog__body {
  padding: 5px;
  max-height: 81vh;
}
.el-dialog__footer {
  padding: 5px 15px 5px;
}
/deep/ .el-transfer-panel {
  // border: 3px solid #f4f6f9;
  border-radius: 5px;
  overflow: hidden;
  // background: #fff;
  display: inline-block;
  vertical-align: middle;
  width: 45%;
  text-align: left;
  max-height: 100%;
  box-sizing: border-box;
  position: relative;
}
/deep/ .el-transfer-panel .el-transfer-panel__header {
  height: 50px;
  line-height: 50px;
  // background: #fff;
  margin: 0;
  padding-left: 15px;
  // border-bottom: 2px solid #f4f6f9;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  color: #333333;
}
/deep/ .el-transfer-panel .el-transfer-panel__header .el-checkbox {
  line-height: 50px;
}
/deep/ .el-transfer-panel__filter .el-input__inner {
  height: 32px;
  width: 100%;
  font-size: 12px;
  display: inline-block;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  border-radius: 5px;
  padding-right: 10px;
  padding-left: 30px;
}
/deep/ .el-transfer__button {
  border-radius: 4px;
  padding: 7px 10px;
}
.cud-common-operate-delete {
  color: #ec6c00;
  margin-right: 10px;
  font-weight: 500;
  font-size: 14px;
}
.el-table__body-wrapper tr td {
  border-top: 1px solid #f4f6f9;
  box-shadow: initial;
}

/deep/ .border-bottom-card .el-tabs__content {
  max-height: 75vh;
  /* padding: 20px 0 0 !important; */
  margin: 0;
}
/deep/ .el-tabs__item {
  box-shadow: none !important;
}
/deep/ .el-card {
  margin: 0;
}
/deep/ .border {
  height: auto !important;
}
/deep/ .el-transfer-panel__filter .el-input__icon {
  margin-left: 5px;
  margin-top: 3px;
}
/deep/
  .cud-cgn-task-center
  .cgn-task-tabs
  .border-bottom-card
  .el-tabs__active-bar {
  transform: translateX(0px) !important;
}
/deep/ .el-tabs__active-bar {
  left: 0 !important;
}
/deep/ .el-form-item.is-error .el-input__inner,
.el-form-item.is-error .el-input__inner:focus {
  border-color: #ebebeb !important;
}
/deep/ .el-tabs__content {
  // padding: 15px 0px 0 6px !important;
}
/deep/ .el-col-17 {
  width: 62%;
}
/deep/ .el-col-6 {
  width: 33%;
}
.wfTab {
  margin-top: 10px;
}
</style>
