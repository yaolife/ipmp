<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="el-card authorization-log-container">
    <!-- 表格区域 -->
    <DataTable
      ref="tableRef"
      :search-config="searchConfig"
      :table-columns="tableColumns"
      :operation-config="operationConfig"
      :load-data="loadTableData"
    />
    <el-dialog
      title="操作详情"
      :destroy-on-close="true"
      :visible.sync="dialogVisible"
      :append-to-body="true"
      :close-on-click-modal="false"
      @close="handleCancel"
    >
      <div v-highlightjs>
        <pre><code class="json">{{ jsonContext ||'{}' }}</code></pre>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleCancel">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script src="./js/index.js"></script>
<style scoped>
.authorization-log-container {
  height: calc(100vh / var(--zoom-value) - 114px);
}
pre code {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  display: block;
  overflow: auto;
  max-height: 300px;
}
</style>
