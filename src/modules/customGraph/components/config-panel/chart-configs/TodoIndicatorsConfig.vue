<template>
  <div class="todo-indicators-config">
    <el-form label-width="110px" size="small">
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
          placeholder="例如：XXX待办指标"
          :disabled="readonly"
        ></el-input>
      </el-form-item>
      <!-- 行距 -->
      <el-form-item v-if="false" label="行距">
        <el-input-number
          v-model="localConfig.lineSpacing"
          :disabled="readonly"
          :min="1"
          :max="100"
          :step="1"
        />
        <!-- <span>px</span> -->
      </el-form-item>
      <!-- 间距 -->
      <el-form-item v-if="false" label="间距">
        <el-input-number
          v-model="localConfig.scpacing"
          :disabled="readonly"
          :min="1"
          :max="100"
          :step="1"
        />
        <!-- <span>px</span> -->
      </el-form-item>
      <!-- 高度 -->
      <el-form-item label="高度">
        <el-input-number
          v-model="localConfig.todoHeight"
          :disabled="readonly"
          :min="1"
          :max="200"
          :step="1"
        />
        <!-- <span>px</span> -->
      </el-form-item>
      <!-- 最大宽度 -->
      <el-form-item v-if="false" label="最大宽度">
        <el-input-number
          v-model="localConfig.maxWidth"
          :disabled="readonly"
          :min="1"
          :max="500"
          :step="10"
        />
        <!-- <span>px</span> -->
      </el-form-item>
      <!-- 最小宽度 -->
      <el-form-item v-if="false" label="最小宽度">
        <el-input-number
          v-model="localConfig.minWidth"
          :disabled="readonly"
          :min="1"
          :max="500"
          :step="10"
        />
        <!-- <span>px</span> -->
      </el-form-item>
      <!-- 图片宽度占比 -->
      <el-form-item v-if="false" label="图片宽度占比">
        <el-input-number
          v-model="localConfig.imgWidthAccount"
          :disabled="readonly"
          :min="0.1"
          :max="1"
          :step="0.1"
        />
      </el-form-item>
      <!-- 名称字体大小 -->
      <el-form-item label="名称字体大小">
        <el-input-number
          v-model="localConfig.nameSize"
          :disabled="readonly"
          :min="1"
          :max="100"
          :step="1"
        />
        <!-- <span>px</span> -->
      </el-form-item>
      <!-- 数值字体大小 -->
      <el-form-item label="数值字体大小">
        <el-input-number
          :disabled="readonly"
          v-model="localConfig.numSize"
          :min="1"
          :max="100"
          :step="1"
        />
        <!-- <span>px</span> -->
      </el-form-item>
      <div class="config-box">待办项配置</div>
      <!-- 待办项配置 -->
      <el-form-item>
        <el-checkbox-group v-model="localConfig.list">
          <el-checkbox
            v-for="(item, itemIndex) in congigList"
            :key="itemIndex"
            :label="item"
            :disabled="readonly"
            >{{ item }}</el-checkbox
          >
        </el-checkbox-group>
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
  name: "TodoIndicatorsConfig",
  props: {
    config: {
      type: Object,
      required: true
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      congigList: ["待办", "已阅", "已办", "待阅"],
      localConfig: {
        showTitile:true,
        title: "待办指标",
        theme: "default",
        todoHeight: "100",
        lineSpacing: "20",
        scpacing: "20",
        maxWidth: "230",
        minWidth: "140",
        imgWidthAccount: "0.5",
        nameSize: "13",
        numSize: "25",
        list: ["待办", "已阅", "已办", "待阅"]
      }
    };
  },
  watch: {
    config: {
      immediate: true,
      handler(newConfig) {
        // 确保 announcements 数组始终存在，并保留默认图片URL
        this.localConfig = {
          ...this.localConfig,
          ...newConfig
        };
      }
    }
  },
  methods: {
    handleSave() {
      this.updateConfig(true);
    },
    updateConfig(isSave = false) {
      // 确保发送的配置中包含 announcements 数组
      const updatedConfig = {
        ...this.localConfig,
        announcements: this.localConfig.announcements || []
      };
      this.$emit("update", updatedConfig, isSave);
    },
    handleReset() {
      // 重置为初始配置
      this.localConfig = {
        ...this.localConfig,
        ...this.config
      };
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
}
.todo-indicators-config {
  padding: 20px;
}
.indicator-item {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 4px;
}
.indicator-item > * {
  margin-right: 10px;
  margin-bottom: 10px;
}
/deep/ .el-checkbox + .el-checkbox {
  margin-left: inherit;
}
/deep/ label.el-checkbox:last-of-type {
  margin-right: 10px !important;
}
.config-box {
  font-weight: bold;
  color: #606266;
  font-size: 14px;
  line-height: 20px;
}
</style>
