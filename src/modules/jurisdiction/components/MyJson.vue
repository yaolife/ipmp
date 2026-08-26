<template>
  <div class="code-editor-wrapper">
    <!-- 工具栏 -->
    <!-- <div class="toolbar">
      <el-button
        type="text"
        icon="el-icon-document-checked"
        @click="formatCode"
        >格式化</el-button
      >
      <el-button
        type="text"
        icon="el-icon-edit-outline"
        @click="toggleComment"
        >注释</el-button
      >
      <el-button
        type="text"
        icon="el-icon-success"
        @click="submitCode"
        >提交</el-button
      >
    </div> -->

    <!-- 编辑器容器 -->
    <div ref="monacoBox" class="monaco-box"></div>
  </div>
</template>

<script>
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'

export default {
  name: 'MyJson',
  props: {
    value: { type: String, default: '' },
    language: { type: String, default: 'json' },
    readonly: { type: Boolean, default: false },
    theme: { type: String, default: 'vs-dark' },
  },
  data() {
    return {
      monacoInstance: null,
      innerCode: '',
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(v) {
        this.innerCode = v
        if (this.monacoInstance) {
          // 防止光标跳动：如果内容没变就不 setValue
          if (this.monacoInstance.getValue() !== v) {
            this.formatCode(v)
            // this.monacoInstance.setValue(v)
          }
        }
      },
    },
  },
  mounted() {
    this.initMonaco()
  },
  beforeDestroy() {
    this.monacoInstance && this.monacoInstance.dispose()
  },
  methods: {
    /* 1. 初始化 */
    initMonaco() {
      this.monacoInstance = monaco.editor.create(this.$refs.monacoBox, {
        value: this.innerCode,
        language: this.language,
        theme: this.theme,
        readOnly: this.readonly,
        fontSize: 14,
        automaticLayout: true, // 容器大小变化时自动适配
        scrollBeyondLastLine: false,
        minimap: { enabled: false },
      })

      // 双向绑定：编辑器内容变化 -> 父组件
      this.monacoInstance.onDidChangeModelContent(() => {
        const val = this.monacoInstance.getValue()
        this.$emit('input', val) // v-model
        this.innerCode = val
      })
    },

    /* 2. 格式化 */
    formatCode(val) {
      const code = val|| this.monacoInstance.getValue()
      let formatted = code
      try {
        if (this.language === 'json') {
          // 使用原生 JSON 格式化
          const parsed = JSON.parse(code)
          formatted = JSON.stringify(parsed, null, 2)
          this.monacoInstance.setValue(formatted)
          // this.$message.success('JSON 格式化成功')
        } else {
          this.$message.warning('当前只支持 JSON 格式化')
        }
      } catch (e) {
        this.$message.error('格式化失败：' + e.message)
      }
    },

    /* 3. 注释 / 取消注释 */
    toggleComment() {
      // Monaco 自带快捷键 Ctrl+/ / Cmd+/，这里用 API 实现按钮点击
      this.monacoInstance
        .getAction('editor.action.commentLine')
        .run()
        .then(() => this.$message.success('已切换注释'))
    },

    /* 4. 提交 */
    submitCode() {
      const code = this.monacoInstance.getValue()
      this.$emit('submit', code) // 父组件监听 submit 事件即可
    },
  },
}
</script>

<style scoped>
.code-editor-wrapper {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}
/* .toolbar {
  background: #f5f7fa;
  padding: 6px 8px;
  border-bottom: 1px solid #dcdfe6;
  display: flex;
  align-items: center;
} */
.monaco-box {
  height: 200px;
}
</style>