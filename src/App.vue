<!--
 * @Author: [P631038]杨旭
 * @Date: 2024-11-08 17:14:00
 * @LastEditors: [P631038]杨旭
 * @LastEditTime: 2025-03-07 09:18:32
 * @FilePath: \4.2.0-node16\cud4demo-ui\src\App.vue
 * @Description: 
-->
<template>
  <div id="app" :class="{ 'pixel-stream-app': isPixelStreamPage }">
    <el-scrollbar ref="myScrollbar" style="width:100%;height: 100%;">
      <router-view />
    </el-scrollbar>
    <pipeline-model-tree-overlay></pipeline-model-tree-overlay>
  </div>
</template>

<script>
import { hasMenuPermission } from "@/permission/menu";
import { mapMutations } from "vuex";
import { getUserInfo } from "@/api/api.js";
import osUtil from "@/utils/osUtil";
import PipelineModelTreeOverlay from "@/modules/screen/components/PipelineModelTreeOverlay.vue";
export default {
  name: "App",
  components: {
    PipelineModelTreeOverlay
  },
  computed: {
    isPixelStreamPage() {
      const path = this.$route.path || "";
      return path === "/YJ3DVP" || path.indexOf("/YJ3DVP/") === 0;
    }
  },
  methods: {
    ...mapMutations(["diffVersion"]),
    resolveMenuCode(meta) {
      if (meta == null || meta === "") return "";
      if (typeof meta === "string") return meta;
      return meta.menuCode || "";
    }
  },
  async created() {
    const menuCode = this.resolveMenuCode(this.$route.meta);
    if (!menuCode) {
      // 路由重定向
      setTimeout(() => {
        sessionStorage.setItem("menuCode", "pipeDatabase");
      }, 1000);
    } else {
      sessionStorage.setItem("menuCode", menuCode);
    }
    //解耦版本
    // if (process.env.AUTH_TYPE === "AEP") {
    //   // 加载翻译项版本，用于浏览器缓存清理 TODO 待修改
    //   const { data } = await this.$http.get(this.$api.i18n.i18nItem.lastTime);
    //   if (data.code === "0") {
    //     const versions = {};
    //     data.data.forEach(item => {
    //       versions[item.category] = item.time;
    //     });
    //     this.diffVersion(versions);
    //   }
    // }
  },
  mounted() {
    //判断是否为IE浏览器还是其他浏览器
    if (osUtil.getBrowserInfo().browser.indexOf("IE") === 0) {
      //解决IE浏览器Backspacet退回上一级页面问题
      document.onkeydown = function(e) {
        var ev = e || window.event; //获取event对象
        if (ev.keyCode == 8) {
          var obj = ev.target || ev.srcElement; //获取事件源
          var t = obj.type || obj.getAttribute("type"); //获取事件源类型
          //获取作为判断条件的事件类型
          var vReadOnly = obj.getAttribute("readonly") || obj.readOnly;
          var vdisabled = obj.getAttribute("disabled") || obj.disabled;
          var flag1 =
            (t == "password" ||
              t == "text" ||
              t == "textarea" ||
              t == "email" ||
              t == "url" ||
              t == "number" ||
              t == "range" ||
              t == "Date" ||
              t == "search" ||
              t == "color") &&
            (vReadOnly == true || vdisabled == true)
              ? true
              : false;
          var flag2 =
            t != "password" &&
            t != "text" &&
            t != "textarea" &&
            t != "email" &&
            t != "url" &&
            t != "number" &&
            t != "range" &&
            t != "Date" &&
            t != "search" &&
            t != "color"
              ? true
              : false;
          //判断
          if (flag1 || flag2) {
            return false;
          }
        }
      };
    }
  },
  watch: {
    $route: {
      handler(to, from) {
        sessionStorage.setItem("menuCode", this.resolveMenuCode(to.meta));
      },
      immediate: true
    }
  }
};
</script>

<style>
#app.pixel-stream-app {
  height: 100%;
  overflow: hidden;
  background: #000;
}
#app.pixel-stream-app .el-scrollbar,
#app.pixel-stream-app .el-scrollbar__wrap,
#app.pixel-stream-app .el-scrollbar__view {
  height: 100% !important;
  overflow: hidden !important;
}
#app.pixel-stream-app .videoWrapper,
#app.pixel-stream-app .screen-scene {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
#app.pixel-stream-app video.pixelStream,
#app.pixel-stream-app video[is="peer-stream"] {
  position: absolute !important;
  inset: 0;
  width: 100% !important;
  height: 100% !important;
  display: block !important;
  object-fit: fill !important;
  background: #000;
}
</style>
