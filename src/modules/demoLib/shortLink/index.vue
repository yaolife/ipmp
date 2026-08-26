<template>
  <el-card>
    <div class="main">
      <div class="title">shortLink短链接生成</div>
      <div class="block">
        <div class="card">
          <el-form label-position="top" label-width="180px" :model="form">
            <el-form-item label="请输入原始链接">
              <el-input v-model="form.url" size="small" clearable></el-input>
            </el-form-item>
            <el-form-item label="自定义短链接名">
              <el-input
                v-model="form.customUrl"
                size="small"
                clearable
              ></el-input>
            </el-form-item>
            <el-form-item label="新的链接">
              <el-input
                v-model="form.shortUrl"
                size="small"
                readonly
              ></el-input>
            </el-form-item>
          </el-form>
          <div style="margin-top: 20px;display: flex;">
            <el-button style="margin-right:10px" type="primary" size="small" @click="createUrl"
              >生成短链接</el-button
            >
            <el-button style="margin-right:10px" type="primary" size="small" @click="jumpUrl"
              >跳转短链接</el-button
            >
            <!-- <el-button tsize="small" type="primary" @click="resetForm">重置</el-button> -->
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
    </div>
  </el-card>
</template>
<script>
// 高亮字体插件
import hljs from "highlight.js";
// import hljs from "highlight.js/lib/highlight";
// import "highlight.js/styles/github.css";
import api from "../api";
import { setFollow, unsetFollow } from '../components/scrollFollow.js';

const str = `
    使用示例：

    前端:
    /** 输入长连接获取短链接 */
    getShortLink: params => {
        return axios.post('/s',params);
    },

    const params = {
      url: "" // 原始链接
      code: "" // 自定义编码
    };
      api.getShortLink(params).then((res) => {
         // res.... 获取短链接
      });

    后端:
    1.拉取依赖Mavenn:com.cgnpc:cud-shortlink:dev-4.2.0
    2.application-local.yml配置文件中
    #短链接配置
    short-link:
    #生成的短链接模板，根据实际情况修改http或https、域名或ip、端口号（80或443可不写），其他部分不变
    url-template: http://localhost:8080/s/{code}
    #随机短码长度，建议不要小于5，否则重复几率大
    code-length: 6

    nginx配置:
    location /s/ {
      proxy_pass   http://cuddemo4-proxy/s/;  #这里填上服务器地址
    }
`;
export default {
  components: {},
  data() {
    return {
      src: "",
      dialogVisible: false,
      type: "",
      htmlContent: str,
      show: false,
      loadding: false,
      form: {
        url: "",
        customUrl: "",
        shortUrl: "",
      },
      labelPosition: "left",
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
    hljs.highlightAll()
    //设置滚动跟随
    setFollow(this);
  },
  beforeDestroy() {
    //取消滚动跟随
    unsetFollow(this);
  },
  methods: {
    /** 生成短链接 */
    createUrl() {
      const params = {
        url: this.form.url || "",
        code: this.form.customUrl || "",
      };
      api.getShortLink(params).then((res) => {
        if (res.data.code == 0) {
          this.form.shortUrl = res.data.data;
          this.$message.success(res.data.msg);
        } else {
          this.$message.warning(res.data.msg);
        }
      });
    },
    /** 跳转新的短链接 */
    jumpUrl() {
      window.open(this.form.shortUrl);
    },
    /** dialog关闭 */
    close() {
      this.dialogVisible = false;
    },
    /** 折叠 */
    isShow() {
      this.show = !this.show;
    },
    /** 重置 */
    resetForm() {
      this.form.url = "";
      this.form.customUrl = "";
      this.form.url = "";
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
