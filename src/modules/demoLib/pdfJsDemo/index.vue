<template>
  <div>
    <!-- <div class="cud-bg-blue" v-if="full">
      <div class="cud-form-detail-full-new">
        <div class="cud-commom-form-style">
          <div class="cud__scroll--div cud__detail_bg">
            <div>
              <canvas
                v-for="page in pages"
                :id="'the-canvas' + page"
                :key="page"
              >
              </canvas>
            </div>
          </div>
        </div>
      </div>
    </div> -->

    <el-card>
      <div class="main">
        <div class="title">pdfJs预览组件</div>
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
                <el-button size="small" type="primary"
                  >上传预览( 基础版 )</el-button
                >
              </el-upload>
              <div style="font-size: 12px; color: #606266; margin-top: 7px">
                专门用于PDF格式文件预览的组件.
              </div>
              <!-- -PDF- -->
              <el-dialog
                :title="title"
                :before-close="close"
                @close="close"
                :visible.sync="dialogVisible"
                width="70%"
              >
                <div class="readPdf">
                  <canvas
                    style="width: 100%"
                    v-for="page in pages"
                    :id="'the-canvas' + page"
                    :key="page"
                  >
                  </canvas>
                </div>
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

        <div class="block" style="margin-top: 20px">
          <div class="card">
            <div id="docx-demo">
              <el-upload
                :limit="1"
                :file-list="fileListHigh"
                accept=".docx,.xlsx,.pdf"
                :beforeUpload="beforeUploadHigh"
                action=""
              >
                <el-button size="small" type="primary"
                  >上传预览( 专业版 )</el-button
                >
              </el-upload>
              <div style="font-size: 12px; color: #606266; margin-top: 7px">
                专门用于PDF格式文件预览的组件，支持编辑，签章，标注，检索，截取，全屏，缩放，水印，橡皮擦，设置页码等多种高级功能。
              </div>
            </div>
          </div>
          <div v-if="!showHigh" class="meta">
            <div class="highligh" style="width: 100%">
              <pre v-highlightjs>
              <code class="vue code-css">
            {{ htmlContentHigh }}
              </code>
           </pre>
            </div>
          </div>

          <div
            v-if="showHigh"
            class="demo-block-control show"
            @click="isShowHigh"
          >
            <i class="el-icon-caret-bottom hovering"></i>
            <span class="show-content">显示代码</span>
          </div>
          <div v-else class="demo-block-control show" @click="isShowHigh">
            <i class="el-icon-caret-top hovering"></i>
            <span class="show-content">隐藏代码</span>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>
<script>
// 高亮字体插件
import hljs from "highlight.js";
// import hljs from "highlight.js/lib/highlight";
// import "highlight.js/styles/github.css";
// PDFJS插件
const str = `
  使用示例：

  前端:
  <template>
       <div class="readPdf">
          <canvas
            v-for="page in pages"
            :id="'the-canvas' + page"
            :key="page"
          >
          </canvas>
      </div>
  </template>
  <script>
  import PDFJS from "pdfjs-dist";
  export default {
  components: {},
  data() {
    return {
      src: "",
      pdfDocument: null
      url: "",
      pdfDoc: null,
      pages: 0,
    };
  },
    mounted() {
    // 给一个pdf文件或者arrayBuffer通过createObjectURL转为Url
    let url = this.pdfFile;
    this.loadFile(url);
  },
  methods: {
    renderPage(num) {
      let _this = this;
      this.pdfDoc.getPage(num).then(function (page) {
        let canvas = document.getElementById("the-canvas" + num);
        let ctx = canvas.getContext("2d");
        let dpr = window.devicePixelRatio || 1;
        let bsr =
          ctx.webkitBackingStorePixelRatio ||
          ctx.mozBackingStorePixelRatio ||
          ctx.msBackingStorePixelRatio ||
          ctx.oBackingStorePixelRatio ||
          ctx.backingStorePixelRatio ||
          1;
        let ratio = dpr / bsr;
        var viewport = page.getViewport(
          screen.availWidth / page.getViewport(1).width
        );
        canvas.width = viewport.width * ratio;
        canvas.height = viewport.height * ratio;
        canvas.style.width = viewport.width + "px";
        canvas.style.height = viewport.height + "px";
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        var renderContext = {
          canvasContext: ctx,
          viewport: viewport,
        };
        page.render(renderContext);
        if (_this.pages > num) {
          _this.renderPage(num + 1);
        }
      });
    },
    loadFile(url) {
      let _this = this;
      PDFJS.getDocument(url).then(function (pdf) {
        _this.pdfDoc = pdf;
        _this.pages = _this.pdfDoc.numPages;
        _this.$nextTick(() => {
          _this.renderPage(1);
        });
      });
    },
  },
};
</ script>

`;
const str2 = `
      使用示例：

      static中引入openPdf和pdfjs文件源码
       file 文件地址
       editType:view 预览/edit查看
       staffName：查看人
       fileName：文件名
       uri远程地址来的文件名
       window.open(
        encodeURI(
          '/static/pdfjs/web/viewer.html?file=url&editType=edit
          functLoc=DY-1&time=new Date()"
        )
      );
      `;
import api from "../api";
import { setFollow, unsetFollow } from "../components/scrollFollow.js";

export default {
  components: {},
  data() {
    return {
      src: "",
      fileList: [],
      fileListHigh: [],
      dialogVisible: false,
      type: "",
      htmlContent: str,
      htmlContentHigh: str2,
      show: false,
      showHigh: true,
      title: "word预览",
      pdfDocument: null,
      url: "",
      title: "",
      pdfDoc: null,
      loadding: false,
      pages: 0,
      full: false,
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
    if (window.location.href.includes("view")) {
      this.full = true;
    } else {
      this.full = false;
    }
    //设置滚动跟随
    setFollow(this);
    hljs.highlightAll();
  },
  beforeDestroy() {
    //取消滚动跟随
    unsetFollow(this);
  },
  methods: {
    /** 基础的PDF预览 */
    loadFile(url) {
      window.open(encodeURI(`/static/pdf@3/web/viewer.html?file=${url}`));
      // let _this = this;

      // PDFJS.getDocument(url).then(function (pdf) {
      //   _this.pdfDoc = pdf;
      //   _this.pages = _this.pdfDoc.numPages;
      //   _this.$nextTick(() => {
      //     _this.renderPage(1);
      //   });
      // });
    },
    renderPage(num) {
      let _this = this;
      this.pdfDoc.getPage(num).then(function (page) {
        let canvas = document.getElementById("the-canvas" + num);
        let ctx = canvas.getContext("2d");
        let dpr = window.devicePixelRatio || 1;
        let bsr =
          ctx.webkitBackingStorePixelRatio ||
          ctx.mozBackingStorePixelRatio ||
          ctx.msBackingStorePixelRatio ||
          ctx.oBackingStorePixelRatio ||
          ctx.backingStorePixelRatio ||
          1;
        let ratio = dpr / bsr;
        var viewport = page.getViewport(
          screen.availWidth / page.getViewport(1).width
        );
        canvas.width = viewport.width * ratio;
        canvas.height = viewport.height * ratio;
        canvas.style.width = viewport.width + "px";
        canvas.style.height = viewport.height + "px";

        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        var renderContext = {
          canvasContext: ctx,
          viewport: viewport,
        };

        //  page.render({
        //   canvasContext: context,
        //   viewport: viewport,
        // }).promise;

        canvas.toDataURL("image/png");
        page.render(renderContext);

        page.render(renderContext).promise.then(() => {
          const imgData = canvas.toDataURL("image/png");
          document.getElementById("the-canvas" + num).src = imgData;
        });
        if (_this.pages > num) {
          _this.renderPage(num + 1);
        }
      });
    },

    loadFileHigh(url, fileName) {
      /**
       * file 文件地址
       * editType:view 预览/edit查看
       * staffName：查看人
       * fileName：文件名
       * uri远程地址来的文件名
       */
      let user = sessionStorage.getItem("user");
      window.open(
        encodeURI(
          `/static/pdfjs/web/viewer.html?file=${url}&editType=edit&fileName=${fileName}&functLoc=DY-1&staffName=${
            user || "[P631038]杨旭"
          }&time=${+new Date()}`
        )
      );
    },
    /** 上传文件(基础) */
    beforeUpload(file) {
      let fileName = file.name;
      let fileExt = file.name.replace(/.+\./, "");
      if (["pdf"].indexOf(fileExt.toLowerCase()) === -1) {
        this.$message({
          type: "warning",
          message: "预览插件仅支持后缀名为pdf的文件,请重新上传!",
        });
        return false;
      }
      this.type = fileExt;
      this.title = fileExt + "预览";
      let reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = (loadEvent) => {
        // this.dialogVisible = true;
        let arrayBuffer = loadEvent.target.result;
        this.src = arrayBuffer;
        const blob = new Blob([arrayBuffer]);
        let url = URL.createObjectURL(blob);
        this.loadFile(url, fileName);
      };
      return false;
    },
    /** 上传文件(专业) */
    beforeUploadHigh(file) {
      let fileName = file.name;
      let fileExt = file.name.replace(/.+\./, "");
      if (["pdf"].indexOf(fileExt.toLowerCase()) === -1) {
        this.$message({
          type: "warning",
          message: "预览插件仅支持后缀名为pdf的文件,请重新上传!",
        });
        return false;
      }
      this.type = fileExt;
      this.title = fileExt + "预览";
      let reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = (loadEvent) => {
        let arrayBuffer = loadEvent.target.result;
        this.src = arrayBuffer;
        const blob = new Blob([arrayBuffer], { type: "application/pdf" });
        let url = URL.createObjectURL(blob);
        this.loadFileHigh(url, fileName);
      };
      return false;
    },
    /** dialog关闭 */
    close() {
      this.dialogVisible = false;
      this.src = "";
      this.fileList = [];
    },
    /** 折叠 */
    isShow() {
      this.show = !this.show;
    },
    isShowHigh() {
      this.showHigh = !this.showHigh;
    },
  },
};
</script>
<style lang="less" scoped>
.main {
  .readPdf {
    zoom: 0.7;
  }
  .pdf-viewer {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
  }
  .toolbar {
    margin-bottom: 10px;
    text-align: center;
  }
  .pdf-container {
    border: 1px solid #ddd;
    overflow: auto;
  }
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
.cud-form-detail-full-new {
  z-index: 999;
  background-color: #f2f7fb;
  position: absolute;
  left: 0;
  top: 0px;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  padding: 0 0 60px;
}
</style>
