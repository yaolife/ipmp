<template>
  <div class="consult-list-config">
    <!-- 基础配置 -->
    <el-form label-width="150px" size="small" class="left-aligned-form">
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

      <!-- 饼图左侧间距 -->
      <el-form-item label="饼图左侧间距">
        <el-input-number
          v-model="localConfig.leftLineSpacing"
          :disabled="readonly"
          :min="0"
          :max="100"
          :step="1"
        />
        <!-- <span>%</span> -->
      </el-form-item>

      <!-- 饼图顶部间距 -->
      <el-form-item label="饼图顶部间距">
        <el-input-number
          v-model="localConfig.topLineSpacing"
          :disabled="readonly"
          :min="0"
          :max="100"
          :step="1"
        />
        <!-- <span>%</span> -->
      </el-form-item>

      <!-- 饼图外周径比例 -->
      <el-form-item label="饼图外周径比例">
        <el-input-number
          v-model="localConfig.perRadio"
          :disabled="readonly"
          :min="0"
          :max="100"
          :step="1"
        />
        <!-- <span>%</span> -->
      </el-form-item>
      <!-- 饼图内周径比例 -->
      <el-form-item label="饼图内周径比例">
        <el-input-number
          v-model="localConfig.inRadio"
          :disabled="readonly"
          :min="0"
          :max="100"
          :step="1"
        />
        <!-- <span>%</span> -->
      </el-form-item>
      <!-- 数值顶部间距 -->
      <el-form-item label="数值顶部间距">
        <el-input-number
          v-model="localConfig.numTopLineSpacing"
          :disabled="readonly"
          :min="0"
          :max="100"
          :step="1"
        />
        <!-- <span>%</span> -->
      </el-form-item>
      <!-- 数值左侧间距 -->
      <el-form-item label="数值左侧间距">
        <el-input-number
          v-model="localConfig.numLeftLineSpacing"
          :disabled="readonly"
          :min="0"
          :max="100"
          :step="1"
        />
        <!-- <span>%</span> -->
      </el-form-item>
      <!-- 数值右侧间距 -->
      <el-form-item v-if="false" label="数值右侧间距">
        <el-input-number
          v-model="localConfig.numRightLineSpacing"
          :disabled="readonly"
          :min="0"
          :max="100"
          :step="1"
        />
        <!-- <span>%</span> -->
      </el-form-item>
      <!-- 数值字体大小-->
      <el-form-item label="数值字体大小">
        <el-input-number
          v-model="localConfig.numSize"
          :disabled="readonly"
          :min="1"
          :max="100"
          :step="1"
        />
        <!-- <span>px</span> -->
      </el-form-item>
      <!-- 指标名称字体大小-->
      <el-form-item label="指标名称字体大小">
        <el-input-number
          v-model="localConfig.nameSize"
          :disabled="readonly"
          :min="1"
          :max="100"
          :step="1"
        />
        <!-- <span>px</span> -->
      </el-form-item>
      <!-- 数值与指标名称行间距-->
      <el-form-item label="数值与指标名称行距">
        <el-input-number
          v-model="localConfig.lineSpacing"
          :disabled="readonly"
          :min="0"
          :max="100"
          :step="1"
        />
        <!-- <span>%</span> -->
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
        title: "流程效率分析",
        showTitile: true,
        leftLineSpacing: 40,
        topLineSpacing: 40,
        perRadio: 70,
        inRadio: 50,
        numTopLineSpacing: 40,
        numLeftLineSpacing: 10,
        numRightLineSpacing: 15,
        numSize: 40,
        nameSize: 14,
        lineSpacing: 20,
        dimension: "1",
        dataUrl: "", // mock数据源
        dataList: {}, // 存储数据列表
      },
    };
  },
  watch: {
    config: {
      immediate: true,
      handler(newConfig) {
        if (newConfig) {
          if (!newConfig) return;
          this.localConfig = {
            ...this.localConfig,
            ...newConfig,
            dataList: { ...(newConfig ? newConfig.dataList : {}) },
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
        dataList: this.localConfig.dataList || {},
      };
      this.$emit("update", updatedConfig, isSave);
    },
    handleSave() {
      this.updateConfig(true);
    },
    handleReset() {
      this.localConfig = {
        ...this.localConfig,
        ...this.config,
      };
      this.$message({
        message: "配置已重置",
        type: "info",
      });
    },
  },
};
</script>

<style lang="less" scoped>
.checkbox-info {
  line-height: 32px;
}
.consult-list-config {
  padding-top: 10px;
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
