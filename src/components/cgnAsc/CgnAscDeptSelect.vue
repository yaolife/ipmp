<template>
  <div class="cgn-asc-dept-select">
    <el-input
      :value="deptModelDesc"
      :title="deptModelDesc"
      :readonly="true"
      :disabled="inputDisabled"
      :placeholder="$t('cm.pleaseSelect')"
    >
      <el-button
        type="primary"
        size="small"
        class="el-button--half"
        v-if="!inputDisabled"
        slot="append"
        icon="el-icon-plus"
        @click="onOpenSelectDialog"
      ></el-button>
    </el-input>

    <!-- 选择弹窗 -->
    <el-dialog
      width="850"
      :title="$t('el.select.placeholder')"
      :append-to-body="true"
      :close-on-click-modal="false"
      :visible.sync="selectDialog.visible"
      v-dragMove="{
        DragButton: '.el-dialog__header',
        DragWindow: '.el-dialog'
      }"
    >
      <cgn-asc-base
        :width="'100%'"
        :height="500"
        :src="selectDialog.src"
        :selected="selectDialog.selected"
        @handle="handleMessage"
      ></cgn-asc-base>
    </el-dialog>
  </div>
</template>

<script>
import * as Utils from "@@/utils/Utils";
import CgnAscBase from "./CgnAscBase";
import Vue from "vue";

export default {
  name: "CgnAscDeptSelect",
  components: { CgnAscBase },
  inject: {
    elForm: { default: "" } // 祖父级注入参数
  },
  props: {
    ascUrl: { type: String, required: true }, // 中台选人控件地址，必填
    value: { type: [Array, Object] }, // 选中显示值
    multiple: { type: Boolean, default: false }, // 是否多选（目前暂时只支持单选）
    props: {
      type: Object,
      default() {
        return {};
      }
    }, // 选中值属性
    disabled: { type: Boolean, default: false } // 是否禁止输入
  },
  data() {
    return {
      deptModel: this.value || (this.multiple ? [] : {}), // 部门数据（单选时为对象，多选时为数组）
      deptProps: {
        deptId: this.props.deptId || "deptId",
        deptName: this.props.deptName || "deptName"
      },
      selectDialog: {
        // 选择弹窗
        visible: false,
        src: "", // iframe Url
        selected: [] // 默认选中值
      }
    };
  },
  watch: {
    /**
     * 子组件修改数据的时候回传到父组件
     */
    deptModel() {
      this.$emit("input", this.deptModel);
    }
  },
  computed: {
    /**
     * 判断输入框是否禁用
     */
    inputDisabled() {
      return this.disabled || (this.elForm || {}).disabled;
    },

    /**
     * 部门数据展示
     */
    deptModelDesc() {
      return this.getDeptModelDesc(this.deptModel, this.deptProps);
    }
  },
  methods: {
    /**
     * 获取部门数据显示
     */
    getDeptModelDesc(deptModel, deptProps) {
      let deptDescArr = [];
      if (deptModel instanceof Array) {
        for (let i = 0; i < deptModel.length; i++) {
          deptDescArr.push(
            "[" +
              deptModel[i][deptProps.deptId] +
              "]" +
              deptModel[i][deptProps.deptName]
          );
        }
      } else if (deptModel[deptProps.deptId]) {
        deptDescArr.push(
          "[" +
            deptModel[deptProps.deptId] +
            "]" +
            deptModel[deptProps.deptName]
        );
      }
      return deptDescArr.join(",");
    },

    /**
     * 处理弹窗回传消息
     */
    handleMessage(data) {
      if (data instanceof Array && data.length >= 6) {
        // data = ["orgId_1,orgId_2,...", "orgName_1,orgName_2,..."]
        let orgIdArr = data[0] ? data[0].split(";") : [];
        let orgNameArr = data[5] ? data[5].split(";") : [];

        // 从回传消息中分解出用户数据
        let newDeptModel = this.deptModel;
        if (newDeptModel instanceof Array) {
          newDeptModel = [];
          for (let i = 0; i < orgIdArr.length; i++) {
            let newDept = {};
            newDept[this.deptProps.deptId] = orgIdArr[i];
            newDept[this.deptProps.deptName] = orgNameArr[i];
            newDeptModel.push(newDept);
          }
        } else {
          newDeptModel[this.deptProps.deptId] =
            orgIdArr.length > 0 ? orgIdArr[0] : "";
          newDeptModel[this.deptProps.deptName] =
            orgNameArr.length > 0 ? orgNameArr[0] : "";
        }

        // 回调选中值事件
        this.deptModel = newDeptModel;
        this.$emit("change", this.deptModel);
        // 关闭弹窗
        this.selectDialog.visible = false;
      } else {
        // 关闭弹窗(data="close"或其他)
        this.selectDialog.visible = false;
      }
    },

    /**
     * 获取Iframe访问Url
     * @return {string}
     */
    getAscBaseSrc() {
      let page = "/organizationwidget.html";
      let withAppCode = "appCode=" + this.$getAppCodeFunc();
      let withLanguage = Utils.isEnLanguage(this.$i18n)
        ? "lang=en_US"
        : "lang=zh_CN";
      let withTime = "time=" + new Date().getTime();
      let sourceUrl = "sourceUrl=" + this.$getDomainPathFunc();
      let baseSrc = `${this.ascUrl}${page}?${withAppCode}&${withLanguage}&${withTime}&${sourceUrl}`; 
      return baseSrc;
    },

    /**
     * 打开选择弹窗
     */
    onOpenSelectDialog() {
      // 从用户数据中分解出用户工号列表
      let orgIds = [];
      if (this.deptModel instanceof Array) {
        for (let i = 0; i < this.deptModel.length; i++) {
          orgIds.push(this.deptModel[i][this.deptProps.deptId]);
        }
      } else {
        orgIds.push(this.deptModel[this.deptProps.deptId]);
      }

      // 设置选择弹窗默认选中值
      if (this.multiple) {
        this.selectDialog.selected = ["", "", "", "", "", orgIds.join(",")];
      } else {
        let selected = orgIds.length > 0 ? orgIds[0] : "";
        this.selectDialog.selected = ["", "", "", "", "", selected];
      }
      this.selectDialog.src = this.getAscBaseSrc();
      this.selectDialog.visible = true;
    }
  }
};
</script>

<style scoped></style>
