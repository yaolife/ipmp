<template>
  <el-card>
    <div class="main">
      <div class="title">kkFileView预览组件</div>
      <div class="block">
        <div class="card">
          <div id="docx-demo">
            <el-upload
              :headers="headersOptions"
              :limit="1"
              :file-list="[]"
              :beforeUpload="beforeUpload"
              :action="fileUploadUrl"
              :on-success="upfileBack"
            >
              <el-button size="small" type="primary">上传预览</el-button>
            </el-upload>
            <div style="font-size: 12px; color: #606266; margin-top: 7px">
              {{
                `支持多种格式(如office文档 , 文本/代码 , 图片 , 压缩包 , 视频&音频等....)`
              }}
            </div>
            <!-- <div style="font-size: 12px; color: #606266; margin-top: 7px">
              只能上传docx，xlsx，pdf格式的文件
            </div> -->
          </div>
          <div
            v-for="(file, index) in fileList"
            :key="index"
            @click="filePreview(file)"
          >
            {{ file.fileName }}
            &nbsp; &nbsp; &nbsp;
            <span style="color: red; cursor: pointer; text-decoration: underline"
              >预览</span
            >
          </div>
        </div>
        <div v-if="!show" class="meta">
          <div class="highligh" style="width: 100%">
            <pre v-highlightjs>
              <code class="vue code-css">
            {{htmlContent}}
              </code>
           </pre>
          </div>
        </div>

        <div v-if="show" class="demo-block-control show" @click="isShow">
          <i class="el-icon-caret-bottom hovering"></i>
          <span class="show-content">显示代码</span>
        </div>
        <div v-else class="demo-block-control show" @click="isShow">
          <i class="el-icon-caret-top hovering"></i>
          <span class="show-content">隐藏代码</span>
        </div>
      </div>
    <iframe style="display: none" ref="iframe"></iframe>
    </div>
  </el-card>
</template>
<script>
import kkFileView from "./index";
export default kkFileView;
</script>

<style lang="less" scoped>
.main {
  padding: 20px;
  .title {
    font-size: 20px;
    margin-bottom: 20px;
    // margin-left: 15px;
  }
  .valShow {
    margin-bottom: 10px;
  }
  .card {
    padding: 20px 20px 40px 20px;
    border: 1px solid #ebebeb;
    border-radius: 3px;
    transition: 0.2s;
  }
  .demo-block-control {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #eaeefb;
    height: 44px;
    box-sizing: border-box;
    background-color: #fff;
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
    text-align: center;
    margin-top: -1px;
    color: #d3dce6;
    cursor: pointer;
    position: relative;
    .demo-block-control > span {
      position: absolute;
      transform: translateX(-30px);
      font-size: 14px;
      line-height: 44px;
      transition: 0.3s;
      display: inline-block;
    }
    i.hovering {
      transform: translateX(-10px);
    }
  }
  .demo-block-control:hover {
    color: #409eff;
  }
  .demo-block-control.is-fixed {
    position: fixed;
    bottom: 0;
    width: calc(100% - 295px);
  }
  .el-icon-caret-bottom {
    font-size: 16px;
    line-height: 44px;
    transition: 0.3s;
  }
  .el-icon-caret-bottom:before {
    content: "\e790";
  }
  .hljs {
    font-family: Menlo, Monaco, Consolas, Courier, monospace;
    font-size: 14px;
    padding: 18px 125px;
    background-color: #fafafa;
    border-radius: 4px;
    -webkit-font-smoothing: auto;
  }
}
pre {
  background-color: #f8f8f8;
  margin: 0;
  overflow-x: auto;
}
code {
  font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
  font-size: 13px;
  color: #333;
}
/deep/ .el-card__body {
  padding: 15px;
}
.code-css {
  position: relative;
  top: 0px;
  left: -80px;
  font-size: 18px;
}
.show-content {
  display: none;
}
.show:hover .show-content {
  display: block;
}
</style>
