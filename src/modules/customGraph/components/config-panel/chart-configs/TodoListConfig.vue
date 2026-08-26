<template>
  <div class="todo-list-config">
    <el-form
      ref="form"
      :model="localConfig"
      label-width="120px"
      class="config-form"
    >
      <!-- 基础配置 -->
      <div class="config-section">
        <el-form-item label="显示标题">
          <el-checkbox
            class="checkbox-info"
            :disabled="readonly"
            v-model="localConfig.showTitile"
          ></el-checkbox>
        </el-form-item>
        <el-form-item label="标题">
          <el-input
            v-model="localConfig.title"
            placeholder="请输入标题"
            :disabled="readonly"
          ></el-input>
        </el-form-item>
        <el-form-item label="最大显示行数">
          <el-input-number
            v-model="localConfig.maxRows"
            placeholder="请输入最大显示行数"
            :disabled="readonly"
            :min="1"
            :max="50"
            :step="1"
          />
        </el-form-item>
        <el-form-item label="待办行高">
          <el-input-number
            v-model="localConfig.rowHeight"
            placeholder="请输入待办行高"
            :disabled="readonly"
            :min="1"
            :max="100"
            :step="1"
          />
        </el-form-item>
        <el-form-item label="待办行内间距">
          <el-input-number
            v-model="localConfig.rowPadding"
            :disabled="readonly"
            placeholder="请输入待办行内间距"
            :min="1"
            :max="100"
            :step="1"
          />
        </el-form-item>
        <el-form-item label="待办字体大小">
          <el-input-number
            v-model="localConfig.fontSize"
            placeholder="请输入待办字体大小"
            :disabled="readonly"
            :min="1"
            :max="30"
            :step="1"
          />
        </el-form-item>
      </div>

      <!-- 待办事项配置 -->
      <div class="config-section todo-types-section">
        <el-form-item label="待办配置">
          <div class="todo-types-container">
            <div class="todo-types-grid">
              <el-checkbox
                :disabled="readonly"
                v-model="localConfig.todoTypes"
                label="pending"
                >待办</el-checkbox
              >
              <el-checkbox
                :disabled="readonly"
                v-model="localConfig.todoTypes"
                label="created"
                >已阅</el-checkbox
              >
              <el-checkbox
                :disabled="readonly"
                v-model="localConfig.todoTypes"
                label="completed"
                >已办</el-checkbox
              >
              <el-checkbox
                :disabled="readonly"
                v-model="localConfig.todoTypes"
                label="cc"
                >待阅</el-checkbox
              >
            </div>
          </div>
        </el-form-item>
      </div>

      <!-- 操作按钮 -->
      <div class="config-footer" v-if="!readonly">
        <el-button type="primary" size="small" @click="handleSave"
          >保存</el-button
        >
        <el-button size="small" @click="handleReset">重置</el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "TodoListConfig",
  props: {
    config: {
      type: Object,
      default: () => ({})
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      localConfig: {
        title: "我的待办",
        showTitile: "",
        maxRows: "",
        rowHeight: "",
        rowPadding: "",
        fontSize: "",
        todoTypes: ["pending", "created", "completed", "cc"]
      },
      originalConfig: null
    };
  },
  watch: {
    config: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          // 合并默认配置和传入的配置
          this.localConfig = {
            title: newVal.title || "我的待办",
            showTitile: newVal.showTitile ? newVal.showTitile : "",
            maxRows: String(newVal.maxRows || 10),
            rowHeight: String(newVal.rowHeight || 35),
            rowPadding: String(newVal.rowPadding || 3),
            fontSize: String(newVal.fontSize || 14),
            todoTypes: newVal.todoTypes || [
              "pending",
              "created",
              "completed",
              "cc"
            ]
          };
          // 保存原始配置，用于重置操作
          this.originalConfig = JSON.parse(JSON.stringify(this.localConfig));
        }
      }
    }
  },
  mounted() {
    // this.localConfig["showTitile"] = true;
    // this.originalConfig["showTitile"] = true;
  },
  methods: {
    // 保存按钮处理函数
    handleSave() {
      // 验证配置
      if (
        !this.localConfig.todoTypes ||
        this.localConfig.todoTypes.length === 0
      ) {
        this.$message.error("至少需要选择一个待办类型");
        return;
      }

      const fontSize = parseInt(this.localConfig.fontSize, 10);
      if (isNaN(fontSize) || fontSize < 12) {
        this.$message.error("字体大小不能小于12px");
        return;
      }

      const maxRows = parseInt(this.localConfig.maxRows, 10);
      if (isNaN(maxRows) || maxRows < 1) {
        this.$message.error("最大行数不能少于1行");
        return;
      }

      // 将字符串转换为数字
      const configToSave = {
        ...this.localConfig,
        maxRows: maxRows,
        rowHeight: parseInt(this.localConfig.rowHeight, 10),
        rowPadding: parseInt(this.localConfig.rowPadding, 10),
        fontSize: fontSize,
        showTitile: this.localConfig.showTitile,
        dataList: null
      };

      this.$emit("update", configToSave, true);

      this.$message({
        message: "配置已保存",
        type: "success"
      });
    },

    // 重置按钮处理函数
    handleReset() {
      // 恢复原始配置
      this.localConfig = JSON.parse(JSON.stringify(this.originalConfig));
      this.$message({
        message: "配置已重置",
        type: "info"
      });
    }
  }
};
</script>

<style lang="less" scoped>
.checkbox-info {
  line-height: 32px;
  margin-bottom: 0 !important;
}
.todo-list-config {
  padding: 16px;
}
/deep/ .el-input-number {
  position: relative;
  display: inline-block;
  width: auto;
  line-height: 32px;
}
/deep/ .el-checkbox + .el-checkbox {
  margin-left: 0;
}
/deep/ .el-input-number__decrease,
/deep/ .el-input-number__increase {
  top: 2px;
  height: 28px;
}
/deep/ .el-checkbox {
  margin-right: 25px;
  margin-bottom: 10px;
}
/deep/ .el-input {
  height: 35px;
}

/deep/ .el-input__inner {
  height: 32px;
  line-height: 32px;
}

:deep(.el-button) {
  padding: 8px 15px;
}

.config-form {
  .el-form-item {
    margin-bottom: 16px;
  }
}

.todo-types-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 0;

  :deep(.el-checkbox) {
    margin-right: 10px;
  }
}

.config-footer {
  display: flex;
  justify-content: center;
  margin-top: 30px;

  .el-button {
    margin-right: 10px;
  }
}
</style>
