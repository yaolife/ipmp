<template>
  <el-dialog
    title="创建页面基础信息"
    :visible.sync="dialogVisible"
    width="500px"
    @close="handleClose"
    :close-on-click-modal="false"
  >
    <el-form ref="form" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="页面名称" prop="pageName">
        <el-input
          v-model="form.pageName"
          placeholder="请输入页面名称"
        ></el-input>
      </el-form-item>
      <el-form-item v-if="false" label="页面类型" prop="type">
        <el-select
          v-model="form.type"
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
      <el-form-item label="路由地址" prop="routeUrl">
        <el-input
          v-model="form.routeUrl"
          placeholder="请输入路由地址"
        ></el-input>
      </el-form-item>
      <!-- <el-form-item label="门户角色" prop="roleIds">
        <el-select
          v-model="form.roleIds"
          placeholder="请选择角色"
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
      <!-- <el-form-item label="是否生效">
        <el-switch v-model="form.takeEffect"></el-switch>
      </el-form-item> -->
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取 消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="loading"
        >确 定</el-button
      >
    </div>
  </el-dialog>
</template>

<script>
import {
  createPage,
  checkURLOnlyAPI,
} from "@/modules/customPortal/api/pageManagement";
import { getCurrfentUserRoles } from "@/api/api.js";
export default {
  name: "PageDialog",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      dialogVisible: this.visible,
      loading: false,
      form: {
        pageName: "",
        type: "",
        routeUrl: "",
        takeEffect: true,
        roleIds: "",
      },
      rules: {
        pageName: [
          { required: true, message: "请输入页面名称", trigger: "blur" },
          {
            min: 2,
            max: 50,
            message: "长度在 2 到 50 个字符",
            trigger: "blur",
          },
        ],
        type: [
          { required: true, message: "请选择页面类型", trigger: "change" },
        ],
        routeUrl: [
          {
            required: true,
            message: "请输入路由地址",
            trigger: "blur",
          },
          { pattern: /^\//, message: "路由地址必须以/开头", trigger: "blur" },
          {
            validator: this.validateRouteUrl,
            trigger: "blur",
          },
        ],
        roleIds: [{ required: true, message: "请选择角色", trigger: "blur" }],
      },
      roleOption: [],
      pageTypeOptions: [
        { value: "NORMAL", label: "普通页面" },
        { value: "SYSTEM", label: "系统页面" },
        { value: "CUSTOM", label: "自定义页面" },
      ],
    };
  },
  watch: {
    visible(val) {
      this.dialogVisible = val;
    },
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
    // 提交表单
    handleSubmit() {
      this.$refs.form.validate(async (valid) => {
        if (!valid) return;
        this.loading = true;
        try {
          const { data, code, message } = await createPage(this.form);
          if (code === "1") {
            return;
          }
          this.$message.success("创建成功");
          this.$emit("success", { ...this.form, id: data || message });
          this.handleClose();
        } catch (error) {
          this.$message.error("创建页面失败");
        } finally {
          this.loading = false;
        }
      });
    },

    // 关闭弹窗
    handleClose() {
      this.$refs.form && this.$refs.form.resetFields();
      this.form = {
        pageName: "",
        type: "",
        routeUrl: "",
        takeEffect: true,
        roleIds: "",
      };
      this.$emit("update:visible", false);
    },

    //验证输入路由是否重复
    validateRouteUrl(rule, value, callback) {
      let params = {
        routeUrl: value,
      };
      checkURLOnlyAPI(params).then((res) => {
        if (res.code === "0") {
          if (!res.data) {
            callback(new Error("该路由地址已存在，请重新输入"));
          } else {
            callback();
          }
        }
      });
    },
  },
};
</script>

<style scoped lang="less">
/deep/ .el-button {
  line-height: 7px;
}
/deep/ .el-form-item {
  margin-bottom: 15px;
}
/deep/ .el-dialog__body {
  padding-top: 20px;
}
</style>
