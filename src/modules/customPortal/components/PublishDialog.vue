<template>
  <el-dialog
    title="发布说明"
    :visible.sync="dialogVisible"
    width="500px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form :model="form" ref="form" label-width="0">
      <el-form-item
        prop="description"
        :rules="[
          { required: true, message: '请输入发布说明', trigger: 'blur' }
        ]"
      >
        <el-input
          type="textarea"
          v-model="form.description"
          resize="none"
          :rows="5"
          placeholder="请输入发布说明"
        ></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取 消</el-button>
      <el-button type="primary" @click="handleConfirm" :loading="loading"
        >确 定</el-button
      >
    </div>
  </el-dialog>
</template>

<script>
import { publishPage } from "@/modules/customPortal/api/pageManagement";

export default {
  name: "PublishDialog",
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    pageIds: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      dialogVisible: false,
      form: {
        description: ""
      },
      loading: false
    };
  },
  watch: {
    visible(val) {
      this.dialogVisible = val;
    },
    dialogVisible(val) {
      if (!val) {
        this.$emit("update:visible", false);
      }
    }
  },
  methods: {
    // 关闭弹窗
    handleClose() {
      this.resetForm();
      this.$emit("update:visible", false);
    },

    // 取消
    handleCancel() {
      this.handleClose();
    },

    // 确认发布
    handleConfirm() {
      this.$refs.form.validate(async valid => {
        if (!valid) return;
        this.loading = true;
        try {
          const params = {
            ids: this.pageIds,
            describe: this.form.description
          };
          // 发布之前得先保存
          await this.$emit("saveData", false);
          const data = await publishPage(params);
          if (data.code === "1") {
            throw new Error(data.data ? data.data : "");
          }
          this.$message.success("发布成功");
          this.$emit("success");
          this.handleClose();
        } catch (error) {
          this.$message.error("发布失败: " + (error.message || "未知错误"));
        } finally {
          this.loading = false;
        }
      });
    },

    // 重置表单
    resetForm() {
      if (this.$refs.form) {
        this.$refs.form.resetFields();
      }
      this.form = {
        description: ""
      };
    }
  }
};
</script>

<style lang="less" scoped>
/deep/ .el-dialog__body {
  padding: 15px 15px 5px;
}
/deep/ .el-form-item {
  margin-right: 0px;
}
/deep/ .el-button {
  line-height: 7px;
}
.dialog-footer {
  text-align: center;
}
</style>
