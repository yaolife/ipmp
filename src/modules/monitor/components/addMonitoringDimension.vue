<!--
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2025-06-06 16:29:52
 * @LastEditors: Yin Rui Xue P644244@gnpjvc.com.cn
 * @LastEditTime: 2025-06-25 16:36:39
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
      class="aaa"
      :modal="true"
    >
      <el-form
        ref="editForm"
        size="small"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <!-- 维度名称 -->
        <el-form-item label="维度名称" prop="name">
          <el-input
            v-model="formData.name"
            maxlength="128"
            clearable
          ></el-input>
        </el-form-item>
        <!-- 监控码 -->
        <el-form-item label="监控码" prop="monitorCode">
          <el-select
            v-model="formData.monitorCode"
            clearable
            filterable
            remote
            :loading="codeLoading"
            :remote-method="remoteMethod"
            @focus="remoteMethod('')"
          >
            <el-option
              v-for="item in monitorCodeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
              <div class="lableClass" :title="item.label">{{ item.label }}</div>
            </el-option>
          </el-select>
        </el-form-item>
        <!-- 顺序编码 -->
        <el-form-item label="顺序编码" prop="orderCode">
          <el-input-number
            v-model="formData.orderCode"
            :min="0"
            :step="1"
            clearable
            :parser="parseInt"
            controls-position="right"
            style="width: 100%"
          ></el-input-number>
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
      codeLoading: false,
      loading: false,
      monitorCodeList: [],
      visible: false,
      formData: {
        name: "",
        monitorCode: "",
        orderCode: "0",
        moduleId: this.$route.query.id || ""
      },
      formRules: {
        name: { required: true, message: "请输入维度名称", trigger: "change" },
        monitorCode: {
          required: true,
          message: "请选择监控码",
          trigger: "change"
        }
      }
    };
  },
  watch: {
    visible(val) {
      if (!val) {
        this.$refs.editForm.resetFields();
        this.formData = {
          name: "",
          monitorCode: "",
          moduleId: this.$route.query.id || "",
          orderCode: "0"
        };
      } else {
        this.monitorCodeList = [...this.codeList];
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
    parentId: { type: String, default: "" },
    detailObj: { type: Object, default: null },
    codeList: { type: Array, default: [] }
  },
  methods: {
    remoteMethod(name) {
      let _this = this;
      let params = {
        pageSize: 100,
        pageIndex: 1,
        name
      };
      this.codeLoading = true;
      api
        .getPageList(params)
        .then(result => {
          if (result.data.code == "0") {
            this.monitorCodeList = result.data.records.map(item => {
              return {
                label: `${item.name}-${item.code}`,
                value: item.code
              };
            });
          }
          this.codeLoading = false;
        })
        .catch(err => {
          _this.$message({
            message: err,
            type: "warning"
          });
        });
    },
    handleConfirm() {
      this.$refs.editForm.validate(valid => {
        let _this = this;
        let url = this.detailObj ? api.editDimes : api.createDimes;
        let message = this.detailObj ? "编辑成功" : "创建成功";
        let params = { ...this.formData };
        if (this.parentId) {
          params.parentId = this.parentId;
        }
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
<style lang="less" scoped>
.lableClass {
  width: 400px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
