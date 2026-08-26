<!--
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2025-06-06 16:29:52
 * @LastEditors: Yin Rui Xue P644244@gnpjvc.com.cn
 * @LastEditTime: 2025-06-26 14:39:21
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
        <!-- 版本号 -->
        <el-form-item label="版本号" prop="version">
          <el-input
            v-model="formData.version"
            @blur="versionBlur(formData.version)"
            clearable
          ></el-input>
        </el-form-item>
        <!-- 父级版本 -->
        <el-form-item label="父级版本" prop="parentVersion">
          <el-select
            v-model="formData.parentVersion"
            clearable
            :disabled="isDisabled"
          >
            <el-option
              v-for="item in parentVersionList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
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
        <!-- 版本发布日期 -->
        <el-form-item label="版本发布日期" prop="publishTime">
          <el-date-picker
            type="date"
            v-model="formData.publishTime"
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
        version: "",
        parentVersion: "",
        personInCharge: "",
        userId: "",
        publishTime: "",
        projectId: this.$route.query.id || ""
      },
      formRules: {
        version: { required: true, message: "请输入版本号", trigger: "change" },
        parentVersion: {
          required: true,
          message: "请选择父级版本",
          trigger: "blur"
        }
      },
      //父级版本下拉
      parentVersionList: []
    };
  },
  watch: {
    visible(val) {
      if (!val) {
        this.$refs.editForm.resetFields();
        this.formData = {
          version: "",
          parentVersion: "",
          publishTime: "",
          personInCharge: "",
          userId: "",
          projectId: this.$route.query.id || ""
        };
      } else {
        this.getVersionsUrl();
      }
    },
    detailObj(val) {
      if (val) {
        this.formData = { ...val };
        this.formData.personInCharge = {
          userName: this.formData.personInCharge,
          userId: this.formData.userId || ""
        };
        this.oldVersion = val.version;
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
        let url = this.detailObj ? api.updateVersion : api.createVersion;
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
    },
    getVersionsUrl() {
      let _this = this;
      let params = {
        projectId: this.$route.query.id
      };
      api
        .getVersions(params)
        .then(result => {
          if (result.data.code !== "1") {
            let obj = {
              label: "......",
              value: "---"
            };
            let arr = result.data.records.map(item => {
              return {
                label: item,
                value: item
              };
            });
            arr.push(obj);
            this.parentVersionList = [...arr];
          }
        })
        .catch(err => {
          _this.$message({
            message: err,
            type: "warning"
          });
        });
    },
    versionBlur(val) {
      let _this = this;
      if (!this.isDisabled && val) {
        let params = {
          version: this.formData.version,
          projectId: this.$route.query.id
        };
        api
          .checkVersion(params)
          .then(result => {
            if (result.data.code !== "1") {
            } else {
              _this.$message({
                message: result.data.msg,
                type: "warning"
              });
              _this.formData.version = "";
            }
          })
          .catch(err => {
            _this.$message({
              message: err,
              type: "warning"
            });
          });
      } else if (this.isDisabled && val) {
        let params = {
          version: this.formData.version,
          id: this.formData.id,
          projectId: this.$route.query.id
        };
        api
          .checkBeforeUpdate(params)
          .then(result => {
            if (result.data.data) {
            } else {
              _this.$message({
                message: "版本号已经存在不允许修改！",
                type: "warning"
              });
              _this.formData.version = _this.oldVersion;
            }
          })
          .catch(err => {
            _this.$message({
              message: err,
              type: "warning"
            });
          });
      }
    }
  }
};
</script>
<style lang="less" scoped></style>
