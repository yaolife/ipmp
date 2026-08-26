<template>
  <el-card>
    <div class="main">
      <div class="title">在线文档编辑</div>
      <div class="block">
        <div class="card">
          <div style="margin-bottom: 20px">
            <el-button
              :type="active == 1 ? 'primary' : ''"
              size="small"
              @click="onClick(1)"
              >在线word样例</el-button
            >
            <el-button
              :type="active == 2 ? 'primary' : ''"
              size="small"
              @click="onClick(2)"
              >在线excel样例</el-button
            >
            <el-button
              :type="active == 3 ? 'primary' : ''"
              size="small"
              @click="onClick(3)"
              >在线ppt样例</el-button
            >
          </div>

          <div id="calibrationForm">
            <div class="qualityManual-container">
              <div class="qualityManual-container-office">
                <DocOnlyOffice :option="option" />
              </div>
            </div>
          </div>
        </div>

        <div v-if="!show" class="meta">
          <div class="highligh" style="width: 100%">
            <pre v-highlightjs>
            <code class="vue code-css">
          {{'代码'}}
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
    </div>
  </el-card>
</template>
<script>
import hljs from "highlight.js";
// import hljs from "highlight.js/lib/highlight";
// import "highlight.js/styles/github.css";
import { setFollow, unsetFollow } from "../components/scrollFollow.js";
import DocOnlyOffice from "./docOnlyOffice";
import api from "../api";

export default {
  components: { DocOnlyOffice },
  data() {
    return {
      show: true,
      showDialog: false,
      disabled: false,
      loading: false,
      active: 1,
      option: {
        url: "", // 文件的下载地址
        isEdit: "true",
        flag: "", // 文档的唯一标识符
        fileType: "", // 文档类型,文件是word还是excel
        title: "", // 文档标题
        lang: "zh", // 语言设置
        isPrint: "", // 是否可以打印
      },
      fileId: "",
    };
  },
  // 高亮代码的自定义方法
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
  created() {},
  mounted() {
    this.fileId = "1972137227492397056";
    this.init();
    //设置滚动跟随
    setFollow(this);
    hljs.highlightAll();
  },
  beforeDestroy() {
    //取消滚动跟随
    unsetFollow(this);
  },
  methods: {
    isShow() {
      this.show = !this.show;
    },
    onClick(index) {
      this.active = index;
      if (this.active == 2) {
        this.fileId = "1972122997728874496"; // xlsx
      } else if (this.active == 3) {
        this.fileId = "1972124018593107968"; // pptx
      } else {
        this.fileId = "1972137227492397056"; // docx
      }
      this.init();
    },
    /** 初始化 */
    init() {
      let that = this;
      api.getOnlyOffice(that.fileId).then((res) => {
        console.log("[ res.data ]-138", res.data);
        if (res.data) {
          that.option.lang = "zh-CN"; // 语言
          that.option.url = res.data.data.document.url;

          // that.option.editUrl = "https://cuddemo4-t.gnpjvc.cgnpc.com.cn/server-api/onlyoffice/callback?fileId=19685533733094";

          console.log(
            "[ 文件保存回调地址 ]-137",
            res.data.data.editorConfig.callbackUrl
          );
          // that.option.editUrl = res.data.data.editorConfig.callbackUrl; //文件保存回调地址
          that.option.fileId = that.fileId; // 文件主键Id，用于回调保存时查询文件信息
          that.option.title = res.data.data.document.title;
          that.option.fileType = res.data.data.document.fileType; //该变量控制着 文件是word还是excel
          that.option.isPrint = false;
          that.option.flag = res.data.data.document.key; //
          that.option.isEdit = true;
          that.option.user = res.data.data.editorConfig.user;
          that.show = true;
        }
      });
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
    padding: 0px 24px 0 110px;
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
.my-select {
  margin: 10px;
  width: 100px;
  height: 32px;
}
.my-input {
  margin: 10px;
  width: 140px;
  height: 32px;
}
#calibrationForm {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
}

.qualityManual-container {
  padding: 0 !important;
  height: 100%;
}

.qualityManual-container-office {
  width: 100%;
  height: inherit;
  height: 546px;
}
</style>
