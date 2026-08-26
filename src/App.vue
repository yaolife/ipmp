<!--
 * @Author: [P631038]杨旭
 * @Date: 2024-11-08 17:14:00
 * @LastEditors: [P631038]杨旭
 * @LastEditTime: 2025-03-07 09:18:32
 * @FilePath: \4.2.0-node16\cud4demo-ui\src\App.vue
 * @Description: 
-->
<template>
  <div id="app">
    <el-scrollbar ref="myScrollbar" style="width:100%;height: 100%;">
      <router-view />
    </el-scrollbar>
  </div>
</template>

<script>
import { hasMenuPermission } from "@/permission/menu";
import { mapMutations } from "vuex";
import { getUserInfo } from "@/api/api.js";
import osUtil from "@/utils/osUtil";
export default {
  name: "App",
  methods: mapMutations(["diffVersion"]),
  async created() {
    if (JSON.stringify(this.$route.meta) === "{}") {
      // 路由重定向
      setTimeout(() => {
        sessionStorage.setItem("menuCode", "office");
      }, 1000);
    } else {
      sessionStorage.setItem("menuCode", this.$route.meta);
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
        sessionStorage.setItem("menuCode", to.meta);
      },
      immediate: true
    }
  }
};
</script>

<style></style>
