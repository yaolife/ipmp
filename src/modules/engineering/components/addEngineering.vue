<!--
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2025-06-06 16:29:52
 * @LastEditors: Yin Rui Xue P644244@gnpjvc.com.cn
 * @LastEditTime: 2025-07-31 18:31:12
 * @FilePath: \cud4demo-ui\src\modules\engineering\components\addEngineering.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div>
    <el-dialog
      :title="title"
      :visible.sync="visible"
      :show-close="true"
      width="25%"
      :modal="true"
    >
      <el-form
        ref="editForm"
        size="small"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <!-- 工程名称 -->
        <el-form-item label="工程名称" prop="projectName">
          <el-input
            v-model="formData.projectName"
            maxlength="30"
            clearable
          ></el-input>
        </el-form-item>
        <!-- 工程名称 -->
        <el-form-item label="工程类型" prop="projectType">
          <el-select v-model="formData.projectType" clearable>
            <el-option
              v-for="item in engineeringTypeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" align="center">
        <el-button size="small" @click="visible = false">
          {{ $t("cm.cancel") }}
        </el-button>
        <el-button
          size="small"
          type="primary"
          @click="handleConfirm"
          :loading="loading"
        >
          {{ $t("cm.confirm") }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import api from "../api";

export default {
  name: "addEngineering",
  data() {
    return {
      loading: false,
      visible: false,
      formData: {
        projectName: "",
        projectType: ""
      },
      formRules: {
        projectName: {
          required: true,
          message: "请输入工程名称",
          trigger: "change"
        },
        projectType: {
          required: true,
          message: "请选择工程类型",
          trigger: "blur"
        }
      }
    };
  },
  watch: {
    visible(val) {
      if (!val) {
        this.$refs.editForm.resetFields();
        this.formData = {
          projectName: "",
          projectType: ""
        };
      }
    },
    detailObj(val) {
      if (val) {
        this.formData = { ...val };
      }
    }
  },
  props: {
    title: { type: String, default: "" },
    detailObj: { type: Object, default: null },
    engineeringTypeList: { type: Array, default: [] }
  },
  methods: {
    handleConfirm() {
      this.$refs.editForm.validate(valid => {
        let _this = this;
        let url = this.detailObj ? api.updateProject : api.createProject;
        let label = this.detailObj ? "engineering_edit" : "engineering_create";
        let message = this.detailObj ? "编辑成功" : "创建成功";
        let params = { ...this.formData };
        if (valid) {
          _this.loading = true;
          url(params)
            .then(result => {
              _this.$store.dispatch("callCmmonMethod", {
                type: "BUTTON",
                label
              });
              if (result.data.code !== "1") {
                this.$message({
                  message,
                  type: "success"
                });
                _this.loading = false;
                this.visible = false;
                this.$emit("handleConfirm");
              } else {
                _this.$message({
                  message: result.data.msg,
                  type: "warning"
                });
                _this.loading = false;
              }
            })
            .catch(err => {
              _this.$store.dispatch("callCmmonMethod", {
                type: "EXCEPTION",
                errorMessage: err,
                label
              });
              _this.$message({
                message: err,
                type: "warning"
              });
              _this.loading = false;
            });
        } else {
          this.$message({
            message: "请检查表单",
            type: "warning"
          });
        }
      });
    }
  }
};
</script>
<style lang="less" scoped>
/deep/ .el-input {
  width: 100% !important;
}
</style>
