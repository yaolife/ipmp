<!--
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2025-06-06 16:29:52
 * @LastEditors: Yin Rui Xue P644244@gnpjvc.com.cn
 * @LastEditTime: 2025-06-25 16:36:53
 * @FilePath: \cud4demo-ui\src\modules\engineering\components\addEngineering.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div>
    <el-dialog
      :title="title"
      :visible.sync="visible"
      :show-close="true"
      width="30%"
      :modal="true"
    >
      <el-form
        ref="editForm"
        size="small"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <!-- 模块名称 -->
        <el-form-item label="模块名称" prop="name">
          <el-input
            v-model="formData.name"
            maxlength="128"
            clearable
          ></el-input>
        </el-form-item>
        <!-- 描述 -->
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="formData.description"
            placeholder=""
            size="small"
            type="textarea"
            :rows="2"
          ></el-input>
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
        name: "",
        description: ""
      },
      formRules: {
        name: { required: true, message: "请输入模块名称", trigger: "change" }
      }
    };
  },
  watch: {
    visible(val) {
      if (!val) {
        this.$refs.editForm.resetFields();
        this.formData = {
          name: "",
          description: ""
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
    detailObj: { type: Object, default: null }
  },
  methods: {
    handleConfirm() {
      this.$refs.editForm.validate(valid => {
        let _this = this;
        let url = this.detailObj ? api.updateModule : api.createModule;
        let message = this.detailObj ? "编辑成功" : "创建成功";
        let params = { ...this.formData };
        if (valid) {
          _this.loading = true;
          url(params)
            .then(result => {
              if (result.data.code == "0") {
                this.$message({
                  message,
                  type: "success"
                });
                this.visible = false;
                this.$emit("handleConfirm");
                _this.loading = false;
              } else {
                _this.$message({
                  message: result.data.msg,
                  type: "warning"
                });
                this.loading = false;
              }
            })
            .catch(err => {
              this.loading = false;
              _this.$message({
                message: err,
                type: "warning"
              });
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
<style lang="less" scoped></style>
