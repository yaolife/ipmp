<!--
 * @Author: [P631038]杨旭
 * @Date: 2024-11-06 10:47:13
 * @LastEditors: [P631038]杨旭
 * @LastEditTime: 2025-08-07 11:09:23
 * @FilePath: \cud4demo-ui\src\modules\demoLib\iconDemo.vue
 * @Description:
-->
<template>
  <el-card>
  <div class="main">
    <div class="title">使用方法</div>
    <div class="block">
      <div class="card">
        <div>
          <span>element图标</span>
          <i class="el-icon-edit icon-css1"></i>
          <i class="el-icon-share icon-css1"></i>
          <i class="el-icon-delete icon-css1"></i>
        </div>
        <div>
          <span>iconfont图标</span>
          <i class="iconfont icon-css1">&#xe98b;</i>
          <i class="iconfont icon-css1">&#xe98c;</i>
          <i class="font_family icon-css1">&#xe68b;</i>
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
    <div class="title" style="margin-top: 30px;">图标集合</div>
    <el-tabs type="border-card" style="margin: 0 !important;">
      <el-tab-pane label="element图标库">
        <div class="block">
          <div class="card">
            <div
              class="myIcon"
              v-for="item in elementIcon"
              :key="item.icon"
              @click="iconClick(item.icon)"
            >
              <i class="icon-css" :class="item.icon"></i>
              <div class="myIcon-title">{{ item.icon }}</div>
            </div>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="iconfont图标库">
        <div style="font-size: 16px; margin-bottom: 16px">
          cud4.0图标1 类名采用class="iconfont"
        </div>
        <div class="iconBox">
          <div
            class="myIcon"
            v-for="item in iconfontIcon"
            :key="item.icon"
            @click="iconClick(item.icon)"
          >
            <i class="iconfont icon-css">{{ iconfontFn(item.icon) }}</i>
            <div class="myIcon-title">{{ item.icon }}</div>
          </div>
        </div>
        <div style="font-size: 16px; margin: 16px 0">cud4.0图标2 类名采用class="font_family"</div>
        <div class="iconBox">
          <div
            class="myIcon"
            v-for="item in iconfontIcon2"
            :key="item.icon"
            @click="iconClick(item.icon)"
          >
            <i class="font_family icon-css">{{ iconfontFn(item.icon) }}</i>
            <div class="myIcon-title">{{ item.icon }}</div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
  </el-card>
</template>
<script>
import hljs from "highlight.js";
// import hljs from "highlight.js/lib/highlight";
// import "highlight.js/styles/github.css";

import elementIcon from "./json/elementIcon.json";
import iconfontIcon from "./json/iconfontIcon.json";
import iconfontIcon2 from "./json/iconfontIcon2.json";
import { iconfont } from "@/utils/funcUtil";
import { codeList } from "./iconDemo";
export default {
  data() {
    return {
      elementIcon: elementIcon,
      iconfontIcon: iconfontIcon,
      iconfontIcon2: iconfontIcon2,
      show: true,
      htmlContent: codeList,
      icon1: "&#xe98c;",
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
  },
  methods: {
    iconfontFn(icon) {
      return iconfont(icon);
    },
    isShow() {
      this.show = !this.show;
    },
    iconClick(icon) {
      const input = document.createElement("input");
      input.value = icon;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      this.$message.success(`已复制  ${icon}`);
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
.myIcon {
  display: inline-grid;
  width: 100px;
  height: 100px;
  border: 1px solid #eaeefb;
  text-align: center;
}
.myIcon :hover {
  cursor: pointer;
  color: #5cb6ff;
}
.icon-css {
  font-size: 30px;
  color: #606266;
  margin: 10px 0px;
}
.icon-css1 {
  font-size: 30px;
  color: #606266;
  margin: 10px 10px;
}
.myIcon-title {
  font-size: 12px;
  color: #99a9bf;
}
</style>
