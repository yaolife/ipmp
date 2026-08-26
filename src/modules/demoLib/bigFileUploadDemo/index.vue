<template>
  <div>
    <el-card>
      <div class="main">
        <div class="title">大文件演示</div>
        <Upload @upload-success="refreshFileList" />
        <div style="margin-top: 40px;">
        <FileList  ref="fileList" />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import Upload from './Upload.vue'
import FileList from './FileList.vue';

export default {
  components: {
    Upload,
    FileList
  },
  methods: {
    // 刷新文件列表
    refreshFileList(file) {
      this.$refs.fileList.fetchFileList(file);
    }
  }
}
</script>
<style lang="less" scoped>
.main {
  padding: 20px;
}
.title {
  font-size: 20px;
  padding-bottom: 20px;
}
</style>
