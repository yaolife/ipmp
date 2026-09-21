<template>
  <el-card>
    <div class="main">
      <div class="title">vue-office预览组件</div>
      <div class="block">
        <div class="card">
          <div id="docx-demo">
            <el-upload
              :limit="1"
              :file-list="fileList"
              accept=".docx,.xlsx,.pdf"
              :beforeUpload="beforeUpload"
              action=""
            >
              <el-button size="small" type="primary">上传预览</el-button>
            </el-upload>
            <div style="font-size: 12px; color: #606266; margin-top: 7px">
              只能上传docx,xlsx,pdf,ppt格式的文件
            </div>
            <el-dialog
              :title="title"
              :before-close="close"
              @close="close"
              :visible.sync="dialogVisible"
              width="70%"
            >
              <div v-if="type === 'docx'">
                <!-- <vue-office-docx :src="src" @rendered="renderedWord" /> -->
              </div>

              <div v-if="type === 'xlsx'">
                <!-- <vue-office-excel
                  style="height: 800px"
                  :src="src"
                  @rendered="renderedExcel"
                /> -->
              </div>

              <div v-if="type === 'pdf'" ref="office">
                <!-- <vue-office-pdf
                  ref="officePdf"
                  :src="src"
                  @rendered="renderedPdf"
                /> -->
              </div>

              <span slot="footer" class="dialog-footer">
                <el-button size="small" @click="dialogVisible = false"
                  >关 闭</el-button
                >
              </span>
            </el-dialog>
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
import { codeList } from "./previewHtmlDemo";
// 高亮字体插件
import hljs from "highlight.js";
// import hljs from "highlight.js/lib/highlight";
// import "highlight.js/styles/github.css";
//引入VueOffice组件
// import VueOfficeDocx from "@vue-office/docx";
// import VueOfficeExcel from "@vue-office/excel";
// import VueOfficePdf from "@vue-office/pdf";
// //引入相关样式
// import "@vue-office/docx/lib/index.css";
// import "@vue-office/excel/lib/index.css";
import { setFollow, unsetFollow } from "../components/scrollFollow.js";

export default {
  components: {
    // VueOfficeDocx,
    // VueOfficeExcel,
    // VueOfficePdf,
  },
  data() {
    return {
      src: "",
      fileList: [],
      dialogVisible: false,
      type: "",
      htmlContent: codeList,
      show: false,
      title: "word预览",
      pdfDocument: null,
    };
  },
  directives: {
    highlightjs: {
      bind: (el) => {
        let blocks = el.querySelectorAll("pre code");
        blocks.forEach((block) => {
          hljs.highlightBlock(block);
        });
      },
    },
  },
  mounted() {
    //设置滚动跟随
    setFollow(this);
    hljs.highlightAll();
  },
  beforeDestroy() {
    //取消滚动跟随
    unsetFollow(this);
  },
  methods: {
    /** 上传文件之前 */
    beforeUpload(file) {
      let fileExt = file.name.replace(/.+\./, "");
      if (["docx", "xlsx", "pdf"].indexOf(fileExt.toLowerCase()) === -1) {
        this.$message({
          type: "warning",
          message: "预览插件仅支持后缀名为docx,,xlsx,pdf的文件,请重新上传!",
        });
        return false;
      }
      this.type = fileExt;
      this.title = fileExt + "预览";
      console.log("[ fileExt ]", fileExt);
      let reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = (loadEvent) => {
        this.dialogVisible = true;
        let arrayBuffer = loadEvent.target.result;
        this.src = arrayBuffer;
      };
      return false;
    },
    /** word事件 */
    renderedWord() {
      console.log("[ word渲染完成 ]");
    },
    /** excel事件 */
    renderedExcel() {
      console.log("[ excel渲染完成 ]");
    },
    /** pdf事件 */
    renderedPdf() {
      console.log("[ pdf渲染完成 ]");
      // const printFrame = document.createElement("iframe");
      // printFrame.style.display = "none";
      // document.body.appendChild(printFrame);
      const iframe = this.$refs["iframe"];
      let blob = new Blob([this.src], { type: "application/pdf" });
      let url = URL.createObjectURL(blob);
      iframe.src = url;
      iframe.onload = () => {
        iframe.contentWindow.print();
      };
    },
    close() {
      this.dialogVisible = false;
      this.src = "";
      this.fileList = [];
    },
    isShow() {
      this.show = !this.show;
    },
  },
};
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
