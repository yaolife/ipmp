<!--
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2025-06-06 16:29:52
 * @LastEditors: Yin Rui Xue P644244@gnpjvc.com.cn
 * @LastEditTime: 2025-06-26 14:44:26
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
        <el-form-item label="调整说明" prop="describe">
          <el-input
            v-model="formData.describe"
            size="small"
            type="textarea"
            :rows="2"
          ></el-input>
        </el-form-item>
        <el-form-item label="调整资源" prop="linkResources">
          <el-input
            v-model="formData.linkResources"
            placeholder="每个资源占一行"
            size="small"
            type="textarea"
            :rows="2"
          ></el-input>
        </el-form-item>
        <!-- 调整代码量 -->
        <el-form-item label="调整代码量" prop="codeMount">
          <el-input-number
            v-model="formData.codeMount"
            :min="0"
            :step="1"
            clearable
            :parser="parseInt"
            controls-position="right"
            style="width: 100%"
          ></el-input-number>
        </el-form-item>
        <!-- 负责人 -->
        <el-form-item label="负责人" prop="personInCharge">
          <!-- 选人 -->
          <person-select
            ref="personSelect"
            :multiple="true"
            v-if="visible"
            v-model="formData.personInCharge"
          >
          </person-select>
          <!-- <el-input v-model="formData.personInCharge" clearable></el-input> -->
        </el-form-item>
        <!-- 调整日期 -->
        <el-form-item label="调整日期" prop="adjustDate">
          <el-date-picker
            type="date"
            v-model="formData.adjustDate"
            value-format="yyyy-MM-dd"
          ></el-date-picker>
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
      oldVersion: "",
      formData: {
        describe: "", //调整说明
        linkResources: "", //调整资源
        codeMount: "", //调整代码量
        personInCharge: "", //负责人
        userId: "", //负责人id
        adjustDate: "", //调整日期
        versionId: this.$route.query.id || ""
      },
      formRules: {
        describe: {
          required: true,
          message: "请输入调整说明",
          trigger: "change"
        }
      }
    };
  },
  watch: {
    visible(val) {
      if (!val) {
        this.$refs.editForm.resetFields();
        this.$refs.personSelect.personList = [];
        this.formData = {
          describe: "", //调整说明
          linkResources: "", //调整资源
          codeMount: "", //调整代码量
          personInCharge: "", //负责人
          userId: "", //负责人id
          adjustDate: "", //调整日期
          versionId: this.$route.query.id || ""
        };
      }
    },
    detailObj(val) {
      if (val) {
        this.formData = { ...val };
        this.formData.personInCharge = {
          userName: this.formData.personInCharge,
          userId: this.formData.userId || ""
        };
      }
    }
  },
  props: {
    title: { type: String, default: "" },
    detailObj: { type: Object, default: null },
    isDisabled: { type: Boolean, default: false }
  },
  methods: {
    handleConfirm() {
      this.$refs.editForm.validate(valid => {
        let _this = this;
        let url = this.detailObj ? api.updateAdjust : api.createAdjust;
        let message = this.detailObj ? "编辑成功" : "创建成功";
        let params = JSON.parse(JSON.stringify(_this.formData));
        params.personInCharge =
          params.personInCharge && _this.formData.personInCharge.userName
            ? _this.formData.personInCharge.userName
            : "";
        params.userId =
          params.personInCharge && _this.formData.personInCharge.userId
            ? _this.formData.personInCharge.userId
            : "";
        if (valid) {
          _this.loading = true;
          url(params)
            .then(result => {
              if (result.data.code !== "1") {
                _this.loading = false;
                this.$message({
                  message,
                  type: "success"
                });
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
<style lang="less" scoped></style>
