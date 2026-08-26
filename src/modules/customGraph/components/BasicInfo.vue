<template>
  <div class="basic-info">
    <el-form
      :model="formData"
      :rules="rules"
      ref="basicForm"
      label-width="100px"
      class="basic-form"
    >
      <el-form-item label="项目名称" prop="pageName">
        <el-input
          v-model="formData.pageName"
          placeholder="请输入项目名称"
        ></el-input>
      </el-form-item>

      <el-form-item v-if="false" label="页面类型" prop="pageType">
        <el-select
          v-model="formData.pageType"
          placeholder="请选择页面类型"
          style="width: 100%"
        >
          <el-option
            v-for="item in pageTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item v-if="false" label="路由地址" prop="routePath">
        <el-input v-model="formData.routePath" placeholder="请输入路由地址">
        </el-input>
      </el-form-item>
      <!-- <el-form-item label="门户角色" prop="roleIds">
        <el-select
          v-model="formData.roleIds"
          placeholder="请选择页面类型"
          multiple
          clearable
        >
          <el-option
            v-for="item in roleOption"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </el-form-item> -->
      <el-form-item label="监控码">
        <el-input
          disabled
          v-model="formData.monitorCode"
          placeholder="请输入监控码（选填）"
        ></el-input>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { getCurrfentUserRoles } from "@/api/api.js";
export default {
  name: "BasicInfo",
  data() {
    // 路由地址验证规则
    const validateRoutePath = (_, value, callback) => {
      if (!value) {
        callback(new Error("请输入路由地址"));
      } else if (!/^[a-zA-Z0-9-/]*$/.test(value)) {
        callback(new Error("路由地址只能包含字母、数字、横杠和斜杠"));
      } else {
        callback();
      }
    };

    return {
      formData: {
        pageName: "",
        pageType: "",
        roleIds: "",
        routePath: "",
        monitorCode: "",
      },
      rules: {
        pageName: [
          { required: true, message: "请输入项目名称", trigger: "blur" },
          {
            min: 2,
            max: 50,
            message: "长度在 2 到 50 个字符",
            trigger: "blur",
          },
        ],
        pageType: [
          { required: true, message: "请选择页面类型", trigger: "change" },
        ],
        routePath: [
          { required: true, validator: validateRoutePath, trigger: "blur" },
        ],
        roleIds: [{ required: true, message: "请选择角色", trigger: "blur" }],
      },
      // 门户角色
      roleOption: [],
      pageTypeOptions: [
        { value: "NORMAL", label: "普通页面" },
        { value: "SYSTEM", label: "系统页面" },
        { value: "CUSTOM", label: "自定义页面" },
      ],
    };
  },
  created() {
    //this.getUserRoleOption();
  },
  methods: {
    // 获取角色
    async getUserRoleOption() {
      const { data } = await getCurrfentUserRoles();
      if (data.code !== "0") {
        return;
      }
      this.roleOption = data.data.map((item) => {
        return {
          value: item.roleCode,
          label: item.roleName,
        };
      });
    },
    // 获取表单数据
    getFormData() {
      return new Promise((resolve, reject) => {
        this.$refs.basicForm.validate((valid) => {
          if (valid) {
            resolve(this.formData);
          } else {
            reject(new Error("表单验证失败"));
          }
        });
      });
    },
    // 设置表单数据
    setFormData(data) {
      this.formData = { ...this.formData, ...data };
    },
  },
};
</script>

<style lang="less" scoped>
.basic-info {
  padding: 20px;
  background-color: #fff;
  height: 100%;
  overflow-y: auto;
  /deep/ .el-form-item {
    margin-bottom: 15px;
  }
  .basic-form {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    background: #fff;
    border-radius: 4px;
  }
}
</style>
