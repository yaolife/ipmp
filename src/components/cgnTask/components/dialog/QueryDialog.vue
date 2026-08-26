<template>
  <el-form
    v-model="queryForm"
    label-width="150px"
    size="small"
    class="query-dialog"
  >
    <el-row :gutter="20">
      <el-col v-if="fields.indexOf('procSubject') >= 0" :span="12">
        <!-- 主题 -->
        <el-form-item
          :label="$t('cgnTask.field.procSubject') + $t('cgnCommon.colon')"
        >
          <el-input v-model="queryForm.procSubject"></el-input>
        </el-form-item>
      </el-col>
      <el-col v-if="fields.indexOf('procDefName') >= 0" :span="12">
        <!-- 流程名称 -->
        <el-form-item
          :label="$t('cgnTask.field.procDefName') + $t('cgnCommon.colon')"
        >
          <el-input v-model="queryForm.procDefName"></el-input>
        </el-form-item>
      </el-col>
      <el-col v-if="fields.indexOf('startDept') >= 0" :span="12">
        <!-- 发起部门 -->
        <el-form-item
          :label="$t('cgnTask.field.startDept') + $t('cgnCommon.colon')"
        >
          <cgn-asc-dept-select
            v-model="queryForm"
            :multiple="false"
            :asc-url="ascUrl"
            :props="{ deptId: 'startDeptId', deptName: 'startDeptName' }"
          ></cgn-asc-dept-select>
        </el-form-item>
      </el-col>
      <el-col v-if="fields.indexOf('startUser') >= 0" :span="12">
        <!-- 发起人 -->
        <el-form-item
          :label="$t('cgnTask.field.startUser') + $t('cgnCommon.colon')"
        >
          <cgn-asc-person-select
            v-model="queryForm"
            :multiple="false"
            :asc-url="ascUrl"
            :props="{ userId: 'startUserId', userName: 'startUserName' }"
          ></cgn-asc-person-select>
        </el-form-item>
      </el-col>
      <el-col
        v-if="
          fields.indexOf('assignTime') >= 0 ||
            fields.indexOf('assignTimeForArrival') >= 0 ||
            fields.indexOf('assignTimeForCc') >= 0
        "
        :span="12"
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
            >{{ $t("cgnTask.field.arrivalTime") + $t("cgnCommon.colon") }}</span
          >
          <!-- 标题：抄送时间 -->
          <span slot="label" v-if="fields.indexOf('assignTimeForCc') >= 0">{{
            $t("cgnTask.field.ccTime") + $t("cgnCommon.colon")
          }}</span>

          <el-date-picker
            type="date"
            v-model="queryForm.startAssignTime"
            value-format="yyyy-MM-dd"
          ></el-date-picker>
          <span class="split">-</span>
          <el-date-picker
            type="date"
            v-model="queryForm.endAssignTime"
            value-format="yyyy-MM-dd"
          ></el-date-picker>
        </el-form-item>
      </el-col>
      <el-col v-if="fields.indexOf('completedTime') >= 0" :span="12">
        <!-- 办理时间 -->
        <el-form-item
          class="date-range-item"
          :label="$t('cgnTask.field.completedTime') + $t('cgnCommon.colon')"
        >
          <el-date-picker
            type="date"
            v-model="queryForm.startCompletedTime"
            value-format="yyyy-MM-dd"
          ></el-date-picker>
          <span class="split">-</span>
          <el-date-picker
            type="date"
            v-model="queryForm.endCompletedTime"
            value-format="yyyy-MM-dd"
          ></el-date-picker>
        </el-form-item>
      </el-col>
      <el-col v-if="fields.indexOf('procCategory') >= 0" :span="12">
        <!-- 流程分类 -->
        <el-form-item
          :label="$t('cgnTask.field.procCategory') + $t('cgnCommon.colon')"
        >
          <el-select v-model="queryForm.procCategoryId">
            <el-option :label="$t('cgnCommon.all')" value=""></el-option>
            <el-option
              v-for="item in indexProvide.procCategoryOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col v-if="fields.indexOf('procInstStatus') >= 0" :span="12">
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
      <el-col v-if="fields.indexOf('shareType') >= 0" :span="24">
        <!-- 共享任务类型 -->
        <el-form-item
          :label="$t('cgnTask.field.shareType') + $t('cgnCommon.colon')"
        >
          <el-checkbox
            :indeterminate="isShareTypeIndeterminate"
            v-model="isShareTypeCheckAll"
            @change="onShareTypeCheckAll"
            >{{ $t("cgnCommon.checkAll") }}</el-checkbox
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
      <el-col v-if="fields.indexOf('dataSource') >= 0" :span="12">
        <!-- 选择库 -->
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
      <el-col :span="btnGroupsColSpan" class="btn-groups">
        <!-- 查询 / 重置 -->
        <el-button size="small" @click="resetQueryForm">{{
          $t("cgnCommon.reset")
        }}</el-button>
        <el-button size="small" type="primary" @click="submitQueryForm">{{
          $t("cgnCommon.search")
        }}</el-button>
      </el-col>
    </el-row>
  </el-form>
</template>

<script>
import * as Utils from "@/utils/Utils";
// import CgnAscDeptSelect from "@@/components/cgnPsc/cgnAsc/CgnAscDeptSelect";
// import CgnAscPersonSelect from '@@/components/cgnPsc/cgnAsc/CgnAscPersonSelect';

export default {
  name: "QueryDialog",
  // components: { CgnAscDeptSelect },
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
    } // 共享任务类型列表，当前用户可以查看的所有共享任务类型
  },
  computed: {
    btnGroupsColSpan: function() {
      let fieldLength = this.fields.length;
      if (this.fields.indexOf("shareType") >= 0) {
        fieldLength += 1;
      }
      return fieldLength % 2 == 0 ? 24 : 12;
    }
  },
  data() {
    return {
      ascUrl: "",
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
        dataSource: ["dataSource"] // 选择库
      },
      queryForm: {
        // 查询表单
        procSubject: "", // 任务主题
        procDefName: "", // 流程名称
        startDeptId: "", // 发起人部门ID
        startDeptName: "", // 发起人部门名称
        startUserId: "", // 发起人
        startUserName: "", // 发起人姓名
        procCategoryId: "", // 流程分类ID
        startAssignTime: "", // 任务分派开始时间
        endAssignTime: "", // 任务分派结束时间
        startCompletedTime: "", // 任务完成开始时间
        endCompletedTime: "", // 任务完成结束时间
        procInstStatus: "", // 流程状态
        shareType: [], // 共享业务类型
        dataSource: "" // 选择库
      },
      isShareTypeIndeterminate: false,
      isShareTypeCheckAll: true,
      options: {
        procInstStatus: Utils.Options.procInstStatus
      }
    };
  },
  mounted() {
    this.ascUrl = envConfig.ASC_ROOT;
    this.resetQueryForm();
  },
  methods: {
    /**
     * 提交查询表单
     */
    submitQueryForm() {
      this.$emit("submit");
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
      this.queryForm = Object.assign(this.queryForm, {
        procSubject: "", // 任务主题
        procDefName: "", // 流程名称
        startDeptId: "", // 发起人部门ID
        startDeptName: "", // 发起人部门名称
        startUserId: "", // 发起人
        startUserName: "", // 发起人姓名
        procCategoryId: "", // 流程分类ID
        startAssignTime: "", // 任务分派开始时间
        endAssignTime: "", // 任务分派结束时间
        startCompletedTime: "", // 任务完成开始时间
        endCompletedTime: "", // 任务完成结束时间
        procInstStatus: "", // 流程状态
        shareType: [], // 共享业务类型
        dataSource: "" // 选择库
      });

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
    }
  }
};
</script>

<style scoped></style>
