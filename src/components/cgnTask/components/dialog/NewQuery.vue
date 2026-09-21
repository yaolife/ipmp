<template>
  <div class="search-collapse-content">
    <el-form
      v-model="queryForm"
      size="small"
      label-width="140px"
      style="margin-bottom: 5px; position: relative"
      label-position="top"
      class="cud-office-search-wrap"
    >
      <el-input
        v-if="fields.indexOf('procSubject') >= 0"
        style="width: 177px; position: absolute; right: 105px; top: -55px"
        size="small"
        class="cud-commom-search-ipt el-input-search"
        :placeholder="$t('cgnTask.field.procSubjectSearch')"
        v-model="queryForm.procSubject"
        @keyup.enter.native="submitQueryForm"
      >
        <el-button
          style="border-radius: 5px"
          type="primary"
          icon="el-icon-search"
          slot="append"
          size="small"
          @click="submitQueryForm"
        >
        </el-button>
      </el-input>
      <!-- <span @click="changeIsShowMore">{{advSearch + seniorSearch}}</span> -->
      <div
        class="title-font2"
        @click="changeIsShowMore"
        v-if="fields.indexOf('procSubject') >= 0"
      >
        {{ $t("cm.advance_search") }}
        <i class="cud3-icon-blue" :class="iconArrow"></i>
      </div>
      <div
        v-if="fields.indexOf('procSubject') >= 0"
        :span="6"
        class="cud--right"
        style="
          margin-top: 5px;
          padding-right: 0px;
          position: fixed;
          bottom: 33px !important;
          z-index: 999;
        "
        :style="!$store.state.app.collapse ? `left:232px;` : `left:105px;`"
      >
        <el-button
          v-if="
            fields.indexOf('remindTaskButton') >= 0 &&
              showBtn('remindTaskButton')
          "
          type="primary"
          size="small"
          @click="SelectedremindTask"
          >{{ $t("cgnTask.operate.remindTask") }}</el-button
        >
        <el-button
          v-if="
            fields.indexOf('withdrawTaskButton') >= 0 &&
              showBtn('withdrawTaskButton')
          "
          size="small"
          class="cud-office-btn-reset"
          @click="SelectedwithdrawTask"
          >{{ $t("cgnTask.operate.withdrawTask") }}</el-button
        >
        <el-button
          v-if="
            fields.indexOf('readTaskButton') >= 0 && showBtn('readTaskButton')
          "
          size="small"
          class="cud-office-btn-reset"
          @click="batchReadTask"
          >{{ $t("cgnTask.operate.readTask") }}</el-button
        >
      </div>
      <div
        class="cud__search--triangle2"
        v-show="isShowMore"
        style="top: -32px; right: 23px !important; left: auto !important"
      ></div>
      <el-row
        type="flex"
        justify="space-between"
        v-show="isShowMore"
        class="cud-senior-search"
      >
        <!-- 选择库 -->
        <el-col
          style="height: 66px"
          v-if="fields.indexOf('dataSource') >= 0"
          :span="6"
        >
          <el-form-item
            :label="$t('cgnTask.field.dataSource') + $t('cgnCommon.colon')"
          >
            <el-select v-model="queryForm.dataSource">
              <el-option
                v-for="item in indexProvide.dataSourceOptions"
                :key="item.id"
                :label="$t(item.name)"
                :value="item.dbDruid || ''"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <!-- 发起部门 -->
        <!-- <el-col
            style="height:66px"
            v-if="fields.indexOf('startDept') >= 0"
            :span="6"
          >
            <el-form-item
              :label="$t('cgnTask.field.startDept') + $t('cgnCommon.colon')"
            >
              <el-input
                ref="deptSelect"
                v-model="queryForm.showStartDept"
                :placeholder="$t('el.select.placeholder')"
                name="deptSelect"
                id="deptSelect"
                :disabled="true"
              >
                <el-button size="small"
                  type="primary"
                  class="el-button--half"
                  slot="append"
                  icon="el-icon-plus"
                  @click="openCreatorFunc('deptSelect')"
                ></el-button>
              </el-input>
            </el-form-item>
          </el-col> -->
        <el-col
          style="height: 66px"
          v-if="fields.indexOf('startUser') >= 0"
          :span="6"
        >
          <!-- 发起人 -->
          <el-form-item
            :label="$t('cgnTask.field.startUser') + $t('cgnCommon.colon')"
          >
            <person-select 
              ref="personSelect"
              v-model="queryForm.showStartUser"
            ></person-select>
            <!-- <el-input
              ref="personSelect"
              v-model="queryForm.showStartUser"
              :placeholder="$t('el.select.placeholder')"
              name="personSelect"
              id="personSelect"
              @focus="openCreatorFunc('personSelect')"
            >
              <el-button
                size="small"
                type="primary"
                class="el-button--half"
                slot="append"
                icon="el-icon-plus"
                @click="openCreatorFunc('personSelect')"
              ></el-button>
            </el-input> -->
          </el-form-item>
        </el-col>
        <el-col
          style="height: 66px"
          v-if="fields.indexOf('procCategory') >= 0"
          :span="6"
        >
          <!-- 流程分类 -->
          <el-form-item
            :label="$t('cgnTask.field.procCategory') + $t('cgnCommon.colon')"
          >
            <select-tree
              :options="indexProvide.procCategoryOptions"
              v-model="queryForm.procCategoryId"
            ></select-tree>
          </el-form-item>
        </el-col>
        <el-col
          style="height: 66px"
          v-if="fields.indexOf('procInstStatus') >= 0"
          :span="6"
        >
          <!-- 流程状态 -->
          <el-form-item
            :label="$t('cgnTask.field.procInstStatus') + $t('cgnCommon.colon')"
          >
            <el-select v-model="queryForm.procInstStatus">
              <el-option
                v-for="item in options.procInstStatus"
                :key="item.value"
                :label="$t(item.labelKey)"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col
          style="height: 66px"
          v-if="fields.indexOf('shareType') >= 0"
          :span="6"
        >
          <!-- 共享任务类型 -->
          <el-form-item
            :label="$t('cgnTask.field.shareType') + $t('cgnCommon.colon')"
          >
            <el-checkbox
              :indeterminate="isShareTypeIndeterminate"
              v-model="isShareTypeCheckAll"
              @change="onShareTypeCheckAll"
              >{{ seniorSearch }}</el-checkbox
            >
            <el-checkbox-group
              v-model="queryForm.shareType"
              @change="onShareTypeCheckChange"
            >
              <el-checkbox
                v-for="(item, itemIndex) in shareTypes"
                :key="itemIndex"
                :label="item"
                >{{ item }}</el-checkbox
              >
            </el-checkbox-group>
          </el-form-item>
        </el-col>
        <el-col style="height: 66px" :span="6">
          <el-form-item
            :label="$t('cgnTask.field.priority') + $t('cgnCommon.colon')"
          >
            <el-select v-model="queryForm.priority">
              <el-option
                v-for="item in options.priority"
                :key="item.value"
                :label="$t(item.labelKey)"
                :value="item.value || ''"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col style="height: 66px" :span="6">
          <el-form-item
            :label="$t('cgnTask.field.startTimeOrder') + $t('cgnCommon.colon')"
          >
            <el-select v-model="queryForm.taskOrderBy">
              <el-option
                v-for="item in options.startTimeOrder"
                :key="item.value"
                :label="$t(item.labelKey)"
                :value="item.value || ''"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col
          style="height: 66px"
          l
          v-if="
            moreMenus[currentTabName] && moreMenus[currentTabName].length > 0
          "
          :span="6"
        >
          <!-- 更多菜单 -->
          <el-dropdown
            v-if="
              moreMenus[currentTabName] && moreMenus[currentTabName].length > 0
            "
            class="btn-more"
            @command="onMoreMenuCommand"
          >
            <span class="el-dropdown-link"><i class="psc-icon-menu"></i></span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item
                v-for="item in moreMenus[currentTabName]"
                :key="item.value"
                :command="item.command"
                >{{ $t(item.labelKey) }}</el-dropdown-item
              >
            </el-dropdown-menu>
          </el-dropdown>
        </el-col>
        <el-col
          style="height: 66px"
          v-if="fields.indexOf('procDefName') >= 0"
          :span="6"
        >
          <!-- 流程名称 -->
          <el-form-item
            :label="$t('cgnTask.field.procDefName') + $t('cgnCommon.colon')"
          >
            <el-input
              v-model="queryForm.procDefName"
              :placeholder="$t('cgnTask.field.procName')"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col
          style="height: 66px"
          v-if="fields.indexOf('completedTime') >= 0"
          :span="6"
        >
          <!-- 办理时间 -->
          <el-form-item
            class="date-range-item"
            :label="$t('cgnTask.field.completedTime') + $t('cgnCommon.colon')"
          >
            <el-date-picker
              v-model="timeHandleRange"
              type="daterange"
              range-separator="-"
              :start-placeholder="$t('cgnTask.field.beginTime')"
              :end-placeholder="$t('cgnTask.field.endTime')"
              value-format="yyyy-MM-dd HH:mm:ss"
              @change="getHandleTimeRange"
            >
            </el-date-picker>
          </el-form-item>
        </el-col>
        <el-col
          style="height: 66px"
          v-if="
            fields.indexOf('assignTime') >= 0 ||
              fields.indexOf('assignTimeForArrival') >= 0 ||
              fields.indexOf('assignTimeForCc') >= 0
          "
          :span="6"
        >
          <!-- 分派时间 -->
          <el-form-item class="date-range-item">
            <!-- 标题：分派时间 -->
            <span slot="label" v-if="fields.indexOf('assignTime') >= 0">{{
              $t("cgnTask.field.assignTime") + $t("cgnCommon.colon")
            }}</span>
            <!-- 标题：到达时间 -->
            <span
              slot="label"
              v-if="fields.indexOf('assignTimeForArrival') >= 0"
              >{{
                $t("cgnTask.field.arrivalTime") + $t("cgnCommon.colon")
              }}</span
            >
            <!-- 标题：抄送时间 -->
            <span slot="label" v-if="fields.indexOf('assignTimeForCc') >= 0">{{
              $t("cgnTask.field.ccTime") + $t("cgnCommon.colon")
            }}</span>
            <el-date-picker
              v-model="timeRange"
              type="daterange"
              range-separator="-"
              :start-placeholder="$t('cgnTask.field.beginTime')"
              :end-placeholder="$t('cgnTask.field.endTime')"
              value-format="yyyy-MM-dd HH:mm:ss"
              @change="getTimeRange"
            >
            </el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="spanWidth" class="cud--right">
          <!-- 查询 / 重置 -->
          <el-form-item
            ><div :style="{ marginTop: spanWidth === 12 ? '34px' : '15px' }">
              <el-button size="small" type="primary" @click="submitQueryForm">{{
                $t("cgnCommon.search")
              }}</el-button>
              <el-button size="small" @click="resetQueryForm">{{
                $t("cgnCommon.reset")
              }}</el-button>
            </div>
          </el-form-item>
        </el-col>
      </el-row>
      <!-- </el-row> -->
    </el-form>
    <div class="wfCommPersonComponentDialog">
      <el-dialog
        width="60%"
        :visible.sync="showDialog"
        v-if="showDialog"
        custom-class="process-creator-dialog"
        :modal="false"
        :destory-on-close="true"
        :title="$t('wm.principal_config')"
        :close-on-click-modal="false"
        v-dragMove="{
          DragButton: '.el-dialog__header',
          DragWindow: '.el-dialog'
        }"
      >
        <div class="el-dialog-div">
          <!-- showUserTab 类型Boolean true代表选人控件 -->
          <!-- showOrgTab 类型Boolean true代表选部门控件 -->
          <wf-comm-person-component
            ref="wfCommPersonComponentId"
            :show-user-group-tab="false"
            :showDynRoleTab="false"
            :showStationTab="false"
            :showUserTab="showUserTab"
            :showOrgTab="showOrgTab"
            :showUserMultiple="false"
            :orgShowCheckbox="false"
            :initUserId="initUserId"
          ></wf-comm-person-component>
        </div>
        <div slot="footer" class="dialog-footer" align="center">
          <el-button size="small" @click="closeCreatorFunc">{{
            $t("cm.cancel")
          }}</el-button>
          <!-- 确定 -->
          <el-button size="small" type="primary" @click="commitCreatorFunc">{{
            $t("cm.confirm")
          }}</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import * as Utils from "@/utils/Utils";
// import CgnAscDeptSelect from '@/components/cgnPsc/cgnAsc/CgnAscDeptSelect';
// import CgnAscPersonSelect from '@/components/cgnPsc/cgnAsc/CgnAscPersonSelect';
// import wfCommPersonComponent from "@@/components/cudCommPersonComponent/wfCommPersonComponent.vue";
// import personSelect from "@@/components/easy-cud-person-select";
import SelectTree from "./SelectTree.vue";
import { hasPermission } from "@/permission/btn";

export default {
  name: "NewQuery",
  components: {
    // CgnAscDeptSelect,
    // CgnAscPersonSelect,
    // personSelect,
    SelectTree
  },
  inject: [
    // 祖先组件注入参数
    "indexProvide" // Index注入参数 {procCategoryOptions: []}
  ],
  props: {
    fields: { type: Array, require: true }, // 显示的查询字段名列表
    shareTypes: {
      type: Array,
      default: () => {
        return [];
      }
    }, // 共享任务类型列表，当前用户可以查看的所有共享任务类型
    moreMenus: { type: Object, default: () => {} },
    currentTabName: { type: String, default: "" }
  },
  computed: {
    btnGroupsColSpan: function() {
      let fieldLength = this.fields.length;
      if (this.fields.indexOf("shareType") >= 0) {
        fieldLength += 1;
      }
      return fieldLength % 2 == 0 ? 24 : 12;
    },
    /**
     * 优先级下拉选项显示值
     */
    priorityLabel() {
      return Utils.Options.getOptionLabel(
        this.$i18n,
        this.options.priority,
        this.queryForm.priority
      );
    },

    /**
     * 任务开始时间排序下拉选项显示值
     */
    startTimeOrderLabel() {
      return Utils.Options.getOptionLabel(
        this.$i18n,
        this.options.startTimeOrder,
        this.queryForm.taskOrderBy
      );
    }
  },
  data() {
    return {
      fieldGroup: {
        procSubject: ["procSubject"], // 任务主题
        procDefName: ["procDefName"], // 流程名称
        startDept: ["startDeptId"], // 发起部门
        startUser: ["startUserId"], // 发起人
        assignTime: ["startAssignTime", "endAssignTime"], // 分派时间
        assignTimeForArrival: ["startAssignTime", "endAssignTime"], // 分派时间(到达时间)
        assignTimeForCc: ["startAssignTime", "endAssignTime"], // 分派时间(抄送时间)
        completedTime: ["startCompletedTime", "endCompletedTime"], // 办理时间
        procCategory: ["procCategoryId"], // 流程分类
        procInstStatus: ["procInstStatus"], // 流程状态
        shareType: ["shareType"], // 共享任务类型
        dataSource: ["dataSource"], // 选择库
        priority: ["priority"], // 优先级
        taskOrderBy: ["taskOrderBy"] // 任务开始时间排序
      },
      queryForm: {
        // 查询表单
        procSubject: "", // 任务主题
        procDefName: "", // 流程名称
        showStartDept: "", // 显示发起部门
        startDeptId: "", // 发起人部门ID
        startDeptName: "", // 发起人部门名称
        personSelect: {},
        showStartUser: "", // 显示发起人
        startUserId: "", // 发起人
        startUserName: "", // 发起人姓名
        procCategoryId: "", // 流程分类ID
        startAssignTime: "", // 任务分派开始时间
        endAssignTime: "", // 任务分派结束时间
        startCompletedTime: "", // 任务完成开始时间
        endCompletedTime: "", // 任务完成结束时间
        procInstStatus: "", // 流程状态
        shareType: [], // 共享业务类型
        dataSource: "", // 选择库
        priority: "", // 优先级
        taskOrderBy: "0" // 任务开始时间排序
      },
      categroyProps: {
        label: "procCategoryName",
        children: "childList"
      },
      isShareTypeIndeterminate: false,
      isShareTypeCheckAll: true,
      options: {
        procInstStatus: Utils.Options.procInstStatus,
        priority: Utils.Options.priority,
        startTimeOrder: Utils.Options.startTimeOrder
      },
      advSearch: "cm.unfold",
      iconArrow: "el-icon-arrow-down",
      isShowMore: false, // 是否显示高级搜索内容
      timeRange: "", // 表单选择时间范围
      timeHandleRange: "", //处理时间范围
      seniorSearch: "",
      isShowTree: false,
      spanWidth: 12,
      showDialog: false,
      showOrgTab: false,
      showUserTab: false,
      initUserId: ""
    };
  },
  mounted() {
    // this.ascUrl = process.env.ASC_ROOT;
    this.seniorSearch = this.$t("cgnTask.field.seniorSearch");
    this.resetQueryForm(); 
  },
  methods: {
    showBtn(btn) {
      return hasPermission(btn);
    },
    SelectedremindTask() {
      this.$emit("SelectedremindTask");
    },
    SelectedwithdrawTask() {
      this.$emit("SelectedwithdrawTask");
    },
    batchReadTask() {
      this.$emit("batchReadTask");
    },
    resetSeniorSearch() {
      this.isShowMore = false;
      this.resetQueryForm();
    },
    updatePriorityValue(value) {
      this.queryForm.priority = value;
    },
    updateStartTimeOrderValue(value) {
      this.queryForm.taskOrderBy = value;
    },
    onMoreMenuCommand() {
      this.$emit("onMoreMenuCommand");
    },
    /**
     * 提交查询表单
     */
    submitQueryForm() {
      //this.isShowMore = false;
      if (this.queryForm && this.queryForm.showStartUser) {
        this.queryForm.startUserId = this.queryForm.showStartUser.userId;
      }
      // if (
      //   this.queryForm.personSelect &&
      //   this.queryForm.personSelect.length > 0
      // ) {
      //   this.queryForm.startUserId = this.queryForm.startUserId =
      //     this.queryForm.personSelect[0].startUserId;
      //   this.queryForm.startUserName =
      //     this.queryForm.personSelect[0].startUserName;
      // }
      //除去搜索条件前后空格内容
      this.queryForm.procDefName = this.queryForm.procDefName.trim();
      this.queryForm.procSubject = this.queryForm.procSubject.trim();
      this.$emit("submit");
      this.$emit("resizeTableHeight");
    },

    /**
     * 获取查询表单
     */
    getQueryForm() {
      let result = {};
      for (let i = 0; i < this.fields.length; i++) {
        let fieldGroupKey = this.fields[i];
        if ((fieldGroupKey && this.fieldGroup[fieldGroupKey]) == false) {
          continue;
        }

        // 根据设定的字段分组，复制对应的字段值返回
        let fieldKeys = this.fieldGroup[fieldGroupKey] || [];
        for (let j = 0; j < fieldKeys.length; j++) {
          let fieldKey = fieldKeys[j];
          result[fieldKey] = this.queryForm[fieldKey];
        }
      }
      return result;
    },

    /**
     * 重置查询表单
     */
    resetQueryForm() {
      this.timeRange = "";
      this.timeHandleRange = "";
      this.queryForm = Object.assign(this.queryForm, {
        procSubject: "", // 任务主题
        procDefName: "", // 流程名称
        showStartDept: "", // 显示发起部门
        startDeptId: "", // 发起人部门ID
        startDeptName: "", // 发起人部门名称
        personSelect: {},
        showStartUser: {
          userId: "",
          userName: ""
        }, // 显示发起人
        startUserId: "", // 发起人
        startUserName: "", // 发起人姓名
        procCategoryId: "", // 流程分类ID
        startAssignTime: "", // 任务分派开始时间
        endAssignTime: "", // 任务分派结束时间
        startCompletedTime: "", // 任务完成开始时间
        endCompletedTime: "", // 任务完成结束时间
        procInstStatus: "", // 流程状态
        shareType: [], // 共享业务类型
        dataSource: "", // 选择库
        priority: "", // 优先级
        taskOrderBy: "0" // 任务开始时间排序
      });
      // this.$refs.personSelect.clear();

      // 全选共享业务类型
      this.isShareTypeCheckAll = true;
      this.onShareTypeCheckAll(true);
    },

    /**
     * 全选共享任务类型
     */
    onShareTypeCheckAll(checkAll) {
      this.queryForm.shareType = checkAll ? this.shareTypes : [];
      this.isShareTypeIndeterminate = false;
    },

    /**
     * 共享任务类型选择改变时
     */
    onShareTypeCheckChange(value) {
      let checkedCount = value.length;
      this.isShareTypeCheckAll = checkedCount === this.shareTypes.length;
      this.isShareTypeIndeterminate =
        checkedCount > 0 && checkedCount < this.shareTypes.length;
    },
    changeIsShowMore: function(val) {
      this.isShowMore = !this.isShowMore;
      this.advSearch = this.isShowMore ? "cm.fold" : "cm.unfold";
      this.iconArrow = this.isShowMore
        ? "el-icon-arrow-up"
        : "el-icon-arrow-down";
      // this.seniorSearch = this.isShowMore ? this.$t('cgnTask.field.packUpSeniorSearch') : this.$t('cgnTask.field.seniorSearch')
      this.$emit("resizeTableHeight");
    },
    getTimeRange(value) {
      if (value) {
        this.queryForm.startAssignTime = value[0];
        this.queryForm.endAssignTime = value[1];
      } else {
        this.queryForm.startAssignTime = "";
        this.queryForm.endAssignTime = "";
      }
    },
    getHandleTimeRange(value) {
      if (value) {
        this.queryForm.startCompletedTime = value[0];
        this.queryForm.endCompletedTime = value[1];
      } else {
        this.queryForm.startCompletedTime = "";
        this.queryForm.endCompletedTime = "";
      }
    },
    changeTree() {
      this.isShowTree = true;
    },
    hideParentClick() {},
    treeFilter(val) {
      this.visible = true;
      this.$refs.categroyTree.filter(val);
    },
    handleNodelClick(node) {},
    // 打开发起人/发起部门模态框
    openCreatorFunc(type) {
      if (type === "personSelect") {
        this.showUserTab = true;
        this.showOrgTab = false;
      }
      if (type === "deptSelect") {
        this.showUserTab = false;
        this.showOrgTab = true;
      }
      this.showDialog = true;
    },
    // 关闭发起人/发起部门模态框
    closeCreatorFunc() {
      this.showDialog = false;
    },
    // 选发起人/发起部门回调
    commitCreatorFunc() {
      let _this = this;
      let userData = [];
      let orgData = [];
      // 获取选人/选部门数据
      let creatorData = this.$refs.wfCommPersonComponentId.getData();
      if (creatorData) {
        userData = creatorData.get("userData");
        orgData = creatorData.get("orgData");
        if (userData && userData.length > 0) {
          // 判断用户信息是否为空，不为空才插入数据
          if (
            userData[1] &&
            userData[1].length === 2 &&
            userData[1][0] !== ""
          ) {
            // 数据处理
            this.queryForm.showStartUser = `[${userData[1][0]}]${userData[1][1]}`;
            this.queryForm.startUserId = userData[1][0];
            this.initUserId = this.queryForm.startUserId;
          }
        }
        if (orgData && orgData.length > 0) {
          if (orgData[1] && orgData[1].length === 8 && orgData[1][2] !== "") {
            this.queryForm.showStartDept = `[${orgData[1][1]}]${orgData[1][5]}`;
            this.queryForm.startDeptId = orgData[1][1];
          }
        }
      }
      this.showDialog = false;
    }
  },
  watch: {
    currentTabName() {
      this.isShowMore = false;
      this.$emit("resizeTableHeight");
    },
    isShowMore() {
      this.seniorSearch = this.isShowMore
        ? this.$t("cgnTask.field.packUpSeniorSearch")
        : this.$t("cgnTask.field.seniorSearch");
    },
    currentTabName: {
      handler(n, o) {
        this.spanWidth = n === "taskHistList" ? 24 : 12;
      },
      deep: true
    }
  }
};
</script>

<style lang="less" scoped>
// @import "src/assets/css/style";
.cud-base-search {
  margin-top: 19px;
}
.cud-process-more-search {
  font-size: 14px;
  color: #004a86;
  cursor: default;
  margin-bottom: 10px;
  cursor: pointer;
}
.cud-ipt-search {
  cursor: pointer;
}
.cud__search--triangle {
  left: 555px !important;
  // top: 40px !important;
}
.cud-senior-search {
  background-color: #f4f6f9;
  border-radius: 5px;
  padding: 15px 0px 15px 15px;
  margin-bottom: 10px;
  margin-top: 5px;
  flex-wrap: wrap;
  overflow: auto;
  justify-content: flex-start;
  transform: translateY(-4px);
}
.cud-btn-groups {
  text-align: right;
  margin-top: 20px;
  margin-bottom: 20px;
}
.objectTree {
  margin-left: 97px;
  position: absolute;
  overflow: auto;
  z-index: 100;
  height: 200px;
  border: 1px solid #ddd;
  line-height: normal;
  z-index: 204;
}

/deep/.orgselect .previewBtn {
  margin: 0;
  position: absolute;
  right: 0;
  top: -1px !important;
  border: none;
  color: #999999 !important;
  height: 32px !important;
  background: transparent !important;
}
.title-font2 {
  font-family: "Microsoft YaHei";
  color: #0c7bca;
  cursor: pointer;
  position: absolute;
  right: 5px;
  top: -48px;
}
/deep/ .el-input.is-disabled .el-input__inner {
  background-color: #fff !important;
}
</style>
