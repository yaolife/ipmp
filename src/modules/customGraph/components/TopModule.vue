<!--
  顶部模块组件
  功能：
  - 显示页面标题
  - 提供功能切换标签（基础信息和项目编排）
  - 包含操作按钮（撤销、重做、保存、发布、预览和版本管理）
-->
<template>
  <!-- 顶部模块：包含页面标题、功能切换标签和操作按钮 -->
  <div class="top-module">
    <!-- 页面标题显示区域 -->
    <div class="page-title">
      <span>{{ pageTitle }}</span>
    </div>
    <!-- 功能切换标签：基础信息和项目编排 -->
    <div class="tab-container">
      <el-tabs v-model="currentTab">
        <el-tab-pane label="基础信息" name="basicInfo"></el-tab-pane>
        <el-tab-pane label="项目编排" name="graphEditor"></el-tab-pane>
      </el-tabs>
    </div>
    <!-- 操作按钮区域：包含撤销、重做、保存、发布、预览和版本管理 -->
    <div class="action-buttons">
      <el-button size="small" @click="handleUndo" :disabled="!canUndo"
        >撤销</el-button
      >
      <!-- icon="el-icon-refresh-left" -->
      <el-button size="small" @click="handleRedo" :disabled="!canRedo"
        >重做</el-button
      >
      <!-- icon="el-icon-refresh-right" -->
      <el-button
       v-if="btnShow('graph_edit_save')"
        type="primary"
        size="small"
        @click="handleSave"
        :disabled="!hasContent"
        >保存</el-button
      >
      <!-- icon="el-icon-document-checked" -->
      <el-button
       v-if="btnShow('graph_edit_publish')"
        type="success"
        size="small"
        @click="handlePublish"
        :disabled="!hasContent"
        >发布</el-button
      >
      <!-- icon="el-icon-upload" -->
      <el-button size="small"  v-if="btnShow('graph_edit_preview')" @click="handlePreview" :disabled="!hasContent"
        >预览</el-button
      >
      <!-- icon="el-icon-view" -->
      <el-button size="small"   v-if="btnShow('graph_edit_version')" @click="handleVersionCommand">版本</el-button>
      <!-- icon="el-icon-dessert" -->
    </div>
  </div>
</template>

<script>
export default {
  name: "TopModule",
  /**
   * 组件属性
   * @property {string} pageTitle - 页面标题
   * @property {string} activeTab - 当前激活的标签页
   * @property {boolean} canUndo - 是否可以执行撤销操作
   * @property {boolean} canRedo - 是否可以执行重做操作
   * @property {boolean} hasContent - 画布是否有内容，用于控制按钮禁用状态
   */
  props: {
    pageTitle: {
      type: String,
      default: "可视化编辑器"
    },
    activeTab: {
      type: String,
      default: "graphEditor"
    },
    canUndo: {
      type: Boolean,
      default: false
    },
    canRedo: {
      type: Boolean,
      default: false
    },
    hasContent: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    /**
     * 当前激活的标签页，使用计算属性避免直接修改prop
     */
    currentTab: {
      get() {
        return this.activeTab;
      },
      set(value) {
        this.$emit("update:activeTab", value);
      }
    }
  },
  methods: {
    // 撤销操作
    handleUndo() {
      this.$emit("undo");
    },

    // 重做操作
    handleRedo() {
      this.$emit("redo");
    },

    // 保存操作
    handleSave() {
      this.$emit("save", true);
    },

    // 发布操作
    handlePublish() {
      this.$emit("publish");
    },

    // 预览操作
    handlePreview() {
      this.$emit("preview");
    },

    // 版本操作处理
    handleVersionCommand() {
      this.$emit("version-command");
    }
  }
};
</script>

<style lang="less" scoped>
/* 顶部模块样式 */
.top-module {
  display: flex;
  align-items: center;
  padding: 0 20px;
  height: 50px;
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  z-index: 2;

  .page-title {
    width: 200px;
    font-size: 18px;
    font-weight: bold;
    color: #303133;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .tab-container {
    flex: 1;
    display: flex;
    justify-content: center;

    :deep(.el-tabs__header) {
      margin-bottom: 0;
    }

    :deep(.el-tabs__nav-wrap::after) {
      display: none;
    }
  }

  .action-buttons {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    width: 300px;
  }
}
</style>
