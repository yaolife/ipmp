<template>
  <div class="consult-list-config">
    <!-- 基础配置 -->
    <el-form label-width="110px" size="small" class="left-aligned-form">
      <el-form-item label="显示标题">
        <el-checkbox
          class="checkbox-info"
          :disabled="readonly"
          v-model="localConfig.showTitile"
        ></el-checkbox>
      </el-form-item>
      <!-- 标题配置 -->
      <el-form-item label="组件标题">
        <el-input
          v-model="localConfig.title"
          :disabled="readonly"
          placeholder="请输入组件顶部显示的标题"
        />
      </el-form-item>

      <!-- 行距 -->
      <el-form-item label="行距">
        <el-input-number
          v-model="localConfig.lineSpacing"
          :disabled="readonly"
          :min="1"
          :max="100"
          :step="1"
        />
      </el-form-item>

      <!-- 字体大小 -->
      <el-form-item label="字体大小">
        <el-input-number
          v-model="localConfig.nameSize"
          :disabled="readonly"
          :min="1"
          :max="100"
          :step="1"
        />
      </el-form-item>
      <!-- 最大显示行数 -->
      <el-form-item label="最大显示行数">
        <el-input-number
          v-model="localConfig.maxLine"
          :disabled="readonly"
          :min="1"
          :max="10"
          :step="1"
        />
      </el-form-item>

      <!-- URL配置 -->
      <el-form-item label="更多链接">
        <el-input
          v-model="localConfig.moreUrl"
          :disabled="readonly"
          placeholder="请输入更多内容的链接"
        />
      </el-form-item>

      <el-form-item label="数据源">
        <el-input
          v-model="localConfig.dataUrl"
          :disabled="readonly"
          placeholder="请输入数据源"
        />
      </el-form-item>

      <!-- 保存和重置按钮 -->
      <el-form-item class="form-buttons" v-if="!readonly">
        <el-button type="primary" size="small" @click="handleSave"
          >保存</el-button
        >
        <el-button size="small" @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "DataListConfig",
  props: {
    config: {
      type: Object,
      default: () => ({}),
      required: true,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      imgObj: {},
      localConfig: {
        title: "",
        lineSpacing: 10,
        showTitile: true,
        nameSize: 14,
        maxLine: 5,
        moreUrl: "", // 更多url
        dataUrl: "", // mock数据源
        dataList: [], // 存储数据列表
      },
    };
  },
  watch: {
    config: {
      immediate: true,
      handler(newConfig) {
        if (newConfig) {
          this.localConfig = {
            ...this.localConfig,
            ...newConfig,
            dataList: [...(newConfig.dataList ? newConfig.dataList : [])],
          };
        }
      },
    },
  },
  methods: {
    updateConfig(isSave = false) {
      // 验证数据
      if (!this.localConfig.dataUrl) {
        this.$message.warning("请填写动态数据源URL");
        return;
      }
      const updatedConfig = {
        ...this.localConfig,
        // 数据列表
        dataList: this.localConfig.dataList || [],
      };
      this.$emit("update", updatedConfig, isSave);
      this.$message({
        message: "配置已保存",
        type: "success",
      });
    },
    handleSave() {
      this.updateConfig(true);
    },
    handleReset() {
      this.$confirm("确认重置所有配置？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          // 重置为初始配置，只保留默认值
          this.localConfig = {
            title: "",
            lineSpacing: 10,
            nameSize: 14,
            maxLine: 5,
            showTitile: true,
            moreUrl: "", // 更多url
            dataUrl: "ds/getDataSourceList", // mock数据源
            dataList: [], // 存储数据列表
          };
          this.$message.success("已重置");
          // 触发数据源变化事件
          this.$bus.emit("data-source-change", {
            componentId: this.item.id,
          });
        })
        .catch(() => {});
    },
  },
};
</script>

<style lang="less" scoped>
.checkbox-info {
  line-height: 32px;
}
.consult-list-config {
  padding: 10px;
  .addForm {
    border: 1px solid;
    margin-top: 10px;
    padding-top: 10px;
    position: relative;
  }

  .left-aligned-form {
    text-align: left;

    .el-form-item {
      margin-bottom: 18px;
    }
  }

  .form-buttons {
    display: flex;
    justify-content: flex-start;
    .el-button {
      margin-right: 10px;
    }
  }
}
.config-box {
  font-weight: bold;
  color: #606266;
  font-size: 14px;
  line-height: 20px;
}
.image-upload-container {
  width: 100%;

  .image-preview-wrapper {
    display: flex;
    height: 80px;

    .image-preview {
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .image-hover-mask {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s;
        color: #fff;

        i {
          font-size: 20px;
          margin-bottom: 4px;
        }

        span {
          font-size: 12px;
        }
      }

      &:hover .image-hover-mask {
        opacity: 1;
      }
    }

    .image-actions {
      position: absolute;
      top: 4px;
      right: 4px;
      z-index: 1;

      .el-button {
        padding: 4px;
        border: none;
        background-color: rgba(0, 0, 0, 0.5);

        &:hover {
          background-color: rgba(0, 0, 0, 0.7);
        }

        i {
          color: #fff;
          font-size: 12px;
        }
      }
    }
  }

  .upload-placeholder {
    width: 120px;
    height: 80px;
    border: 1px dashed #dcdfe6;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;
    background-color: #fff;
    padding: 8px;
    gap: 4px;

    &:hover {
      border-color: #409eff;
      color: #409eff;
    }

    &.disabled {
      cursor: not-allowed;
      opacity: 0.6;

      &:hover {
        border-color: #dcdfe6;
        color: inherit;
      }
    }

    i {
      font-size: 16px;
      margin-bottom: 4px;
      color: #909399;
      line-height: 1;
    }

    span {
      font-size: 12px;
      color: #909399;
      line-height: 1.2;
    }
  }
}

.image-uploader {
  display: block;
  width: 100%;
  height: 100%;
}
.imgage {
  width: 50px;
  height: 50px;
}
.btn {
  margin-left: 10px;
}
.el-icon-close {
  font-size: 16px;
  font-weight: bold;
  position: absolute;
  cursor: pointer;
  bottom: 10px;
  right: 10px;
}
.configClass {
  margin-bottom: 10px;
}
</style>
