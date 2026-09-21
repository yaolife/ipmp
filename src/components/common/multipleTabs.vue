<template>
  <div class="multiple-tabs">
    <el-tabs
      v-model="currentTab"
      type="card"
      v-if="showTabs"
      @tab-click="tabClick"
      @tab-remove="tabRemove"
      :style="zoomStyle"
    >
      <el-tab-pane
        :key="item.name"
        v-for="(item, index) in multipleTabs"
        :label="item.label"
        :name="item.name"
      >
        <span slot="label" @contextmenu.prevent="tabMenu($event, item, index)">
          <span :class="item.name == currentTab ? 'currentTag' : ''">
            {{ i18nLabel == 'zh-CN' ? item.label : item.labelEn }}{{ item.num > 0 ? '(' + item.num + ')' : ''}}<i class="el-icon-close" @click.stop="handleClose(item)"></i>
          </span>
          <span class="dropdown-icon" @click="tabMenu($event, item, index)">
            <i class="el-icon-more"></i>
          </span>
        </span>
      </el-tab-pane>
    </el-tabs>
    <el-dropdown
      ref="tabMenu"
      size="small"
      class="multiple-tabs-menu"
      :style="{ position: 'fixed', left: this.menuLeft + 'px', top: '80px' }"
      @command="tabCommand"
      :show-timeout="0"
      :hide-timeout="0"
      :append-to-body="false"
    >
      <span></span>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command="refreshThis" divided>
          <i class="el-icon-refresh"></i> 刷新页签
        </el-dropdown-item>
        <el-dropdown-item command="closeThis" divided>
          <i class="el-icon-close"></i> 关闭页签
        </el-dropdown-item>
        <el-dropdown-item command="closeLeft" divided v-if="showCloseLeft">
          <i class="el-icon-arrow-left"></i> 关闭左侧
        </el-dropdown-item>
        <el-dropdown-item command="closeRight" divided v-if="showCloseRight">
          <i class="el-icon-arrow-right"></i> 关闭右侧
        </el-dropdown-item>
        <el-dropdown-item command="closeOther" divided>
          <i class="el-icon-circle-close-outline"></i> 关闭其他
        </el-dropdown-item>
        <!-- <el-dropdown-item command="closeAll" divided>
          <i class="el-icon-circle-close-outline"></i> 关闭所有
        </el-dropdown-item> -->
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script>
import store from "@/store";
import osUtil from "@/utils/osUtil";
import Sortable from "sortablejs";
import Vue from "vue";
import { throttle } from "@/utils/funcUtil";
export default {
  cudUnit: "多页签",
  props: {
    showTabs: { type: Boolean, default: true },
    maxTabs: { type: Number, default: 10 }
  },
  data() {
    return {
      //多页签数组
      multipleTabs: [],
      //当前页签
      currentTab: "",
      i18nLabel: 'zh-CN', //多语言切换
      //页签菜单
      menuLeft: 0,
      menuCurrent: "", //菜单页签
      menuIndex: 0, //菜单索引
      showCloseLeft: false,
      showCloseRight: false,
      // keepAlive的缓存
      keepAlive: {},
      //解决zoom缩放后拖拽失效问题
      zoomStyle: {
        zoom: "100%"
      }
    };
  },
  mounted() {
    //设置一个全局样式，用于改变其他组件的一些样式，如隐藏面包屑
    document.getElementById("app").className += " multiple-tabs-flag";
    //初始化多页签
    this.initTabs();
    //设置全局打开页签的方法
    Vue.prototype.openTab = this.openTab;
    Vue.prototype.closeTab = this.closeTab;
    // keepAlive的缓存
    if (
      this.$parent.$children[1] &&
      this.$parent.$children[1].$vnode.parent.componentInstance
    ) {
      //refs获取不到，通过层级找到keepAlive的实例
      this.keepAlive = this.$parent.$children[1].$vnode.parent.componentInstance;
      if (!this.keepAlive) console.error('没有找到keepAlive实例！');
    }
    //解决zoom缩放后拖拽失效问题
    this.zoomFunc = throttle(this.resetZoom, 500);
    window.addEventListener("resize", this.zoomFunc);
    this.resetZoom();
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.zoomFunc);
    //清空所有页签
    let tabs = [];
    this.multipleTabs.forEach(item => {
      tabs.push(item.name);
    });
    tabs.forEach(item => {
      this.removeTab(item);
    });
    this.keepAlive.cache = {};
    this.keepAlive.keys = [];
  },
  watch: {
    //用于菜单栏高亮
    $route(to) {
      //多页签功能
      if (this.showTabs) {
        this.routeChange(to);
      }
    },
    //监听页签修改
    multipleTabs: {
      handler(val) {
        sessionStorage.setItem("multipleTabs", JSON.stringify(val));
      },
      deep: true
    },
    "$store.state.app.collapse": {
      handler(val) {
        this.resetZoom();
      }
    },
    //监听多语言切换
    "$i18n.locale": {
      handler(val) {
        this.i18nLabel = val;
      }
    }
  },
  methods: {
    //解决zoom缩放后拖拽失效问题
    resetZoom() {
      this.zoomStyle = {
        zoom: (100 / this.$root.zoom) * 100 + "%",
        transform: "scale(" + this.$root.zoom / 100 + ")",
        transformOrigin: "left top",
        width: this.$el.getBoundingClientRect().width + "px"
      };
    },
    //初始化多页签
    initTabs() {
      //判断打开方式
      if (this.showTabs === true) {
        let multipleTabs = sessionStorage.getItem("multipleTabs");
        if (!multipleTabs) {
          if (!this.isHomeRoute(this.$route)) {
            this.addTab(this.$route);
          }
        } else {
          this.multipleTabs = JSON.parse(multipleTabs)
            .filter((item) => !this.isHomeTab(item))
            .map((item) => this.remapTab(item));
          if (!this.multipleTabs.length && !this.isHomeRoute(this.$route)) {
            this.addTab(this.$route);
          }
        }
        if (!this.isHomeRoute(this.$route)) {
          const exists = this.multipleTabs.some(
            item =>
              item.name === this.$route.fullPath ||
              item.path === this.$route.path
          );
          if (!exists) {
            this.addTab(this.$route);
          }
        }
        //切换到当前TAB页面
        this.currentTab = this.$route.fullPath;
        //页签拖拽
        const el = document.querySelector(".multiple-tabs .el-tabs__nav");
        let _this = this;
        Sortable.create(el, {
          onEnd({ newIndex, oldIndex }) {
            let newItem = JSON.parse(
              JSON.stringify(_this.multipleTabs[oldIndex])
            );
            _this.multipleTabs.splice(oldIndex, 1);
            _this.multipleTabs.splice(newIndex, 0, newItem);
          }
        });
      }
    },
    // handleMouseEnter(event) {
    //   this.$set(event, "isHover", true);
    // },
    // handleMouseLeave(event) {
    //   this.$set(event, "isHover", false);
    // },
    isHomeTab(item) {
      const path = (item && item.path) || "";
      const name = (item && item.name) || "";
      const label = (item && item.label) || "";
      return (
        label === "首页" ||
        path === "/" ||
        path === "/welcome" ||
        path.indexOf("/welcome") === 0 ||
        name === "/" ||
        name === "/welcome"
      );
    },
    isHomeRoute(route) {
      const path = (route && route.path) || "";
      return (
        path === "/" ||
        path === "/welcome" ||
        path.indexOf("/welcome") === 0 ||
        route.name === "首页" ||
        route.meta === "welcome"
      );
    },
    remapTab(item) {
      const tabRenameMap = {
        "/drafts": { path: "/pipeDatabase", label: "管道数据库" },
        "/concern": { path: "/hangerDatabase", label: "支吊架数据库" },
        "/fupportInfo": { path: "/hangerDatabase", label: "支吊架数据库" },
        "/fupportDetail": { path: "/hangerDetail", label: "支吊架数据详情" },
        "/operationLogManage": { path: "/logManage", label: "日志管理" },
        "/delegation": { path: "/pipeComponentDatabase", label: "管道模型数据库" }
      };
      const mapped = tabRenameMap[item.path] || tabRenameMap[item.name];
      if (!mapped) return item;
      return Object.assign({}, item, {
        path: mapped.path,
        name: mapped.path,
        label: mapped.label
      });
    },
    //判断打开方式
    openTab(route) {
      //route 路由信息
      //判断是否为IE浏览器，IE不打开新窗口
      let isIE =
        osUtil.getBrowserInfo().browser.indexOf("IE") === 0 ? true : false;
      if (this.showTabs || isIE) {
        //如果打开了多页签 或者IE 不打开新窗口
        this.$router.push(route);
      } else {
        const routeData = this.$router.resolve({
          path: route.path,
          query: route.query
        });
        window.open(routeData.href);
      }
    },
    //关闭页签
    closeTab(path) {
      //path 跳转路径
      //判断是否为IE浏览器，IE不打开新窗口
      let isIE =
        osUtil.getBrowserInfo().browser.indexOf("IE") === 0 ? true : false;
      if (this.showTabs || isIE) {
        //直接调用关闭页签的方法
        this.tabRemove(this.currentTab);
        //跳转到指定路由
        if (path) this.$router.push(path);
      } else {
        window.close();
      }
    },
    //新增[页签
    addTab(route, index) {
      //route 路由信息
      //index 插入位置
      let label = route.query && route.query.procName ? route.query.procName : route.name;
      let labelEn = route.query && route.query.procNameEn ? route.query.procNameEn : route.meta;
      //如果存在重复的页签名称，括号的数字加1
      let num = 0;
      this.multipleTabs.forEach((item) => {
        if (item.label == label && item.num >= num) num = item.num + 1;
      });
      //页签数据
      let item = {
        label: label,
        labelEn: labelEn,
        name: route.fullPath,  //name是唯一标识
        path: route.path,
        query: route.query ? JSON.parse(JSON.stringify(route.query)) : {},
        lastTime: new Date().getTime(), //最后使用时间
        num: num
      };
      //支持打开多个流程，流程通过procItem获取数据，存储对应storage
      if (route.path === "/workbench/view") {
        item["procItem"] = JSON.parse(
          JSON.stringify(sessionStorage.getItem("procItem"))
        );
      }
      if (this.multipleTabs.length >= this.maxTabs) {
        //超过最大数，删除最后使用的页签
        let tabs = JSON.parse(JSON.stringify(this.multipleTabs));
        let sort = tabs.sort((a, b) => {
          return a.lastTime - b.lastTime;
        });
        this.removeTab(sort[0].name);
        // this.$message({ message: '页签数量超过限制，已移除不活动页签', type: 'warning' });
      }
      let lastIndex = 0;
      if (index) {
        //指定了位置的插入指定位置
        lastIndex = index;
      } else {
        //没有指定插入当前页签的后面
        this.multipleTabs.forEach((item, index1) => {
          if (item.name == this.currentTab) lastIndex = index1 + 1;
        });
      }
      //插入指定位置
      this.multipleTabs.splice(lastIndex, 0, item);
      //切换到该页签
      this.currentTab = item.name;
    },
    //删除页签
    removeTab(name) {
      //name 页签名
      let tabIndex = -1;
      this.multipleTabs.forEach((item, index) => {
        if (item.name === name) {
          tabIndex = index;
        }
      });
      if (tabIndex < 0) return;
      // 去掉该页签
      this.multipleTabs.splice(tabIndex, 1);
      //手动销毁组件
      if (
        this.keepAlive.cache[name] &&
        this.keepAlive.cache[name].componentInstance
      ) {
        //判断一下组件是否被自动销毁
        this.keepAlive.cache[name].componentInstance.$destroy();
      }
      //手动删除keepAlive的缓存
      this.keepAlive.cache[name] = null;
      delete this.keepAlive.cache[name];
      //要把keys也删除，否则多次打开关闭会报错
      this.keepAlive.keys = this.keepAlive.keys.filter((item) => item !== name);

    },
    //切换页签
    changeTab(name) {
      //name 页签名
      //切换到该页签
      this.currentTab = name;
      let found = this.multipleTabs.find(item => item.name == name);
      if (!found || found.name == this.$route.fullPath) return;
      //支持打开多个流程，更新对应procItem
      if (found.path === "/workbench/view") {
        //如果是流程页面，更新procItem
        sessionStorage.removeItem("procItem");
        sessionStorage.setItem("procItem", found["procItem"]);
      }
      //跳转路由
      this.$router.push({
        path: found.path,
        query: found.query ? found.query : {}
      });
    },
    //刷新页签
    reloadTab(name) {
      //name 页签名
      let tabIndex = 0;
      let found = this.multipleTabs.find((item, index) => {
        tabIndex = index;
        if (item.name == name) return item;
      });
      if (!found) return;
      //先移除自己的页签
      this.removeTab(name);
      //路由不能跳转到相同路径，必须先跳到一个别的路径
      //$router.replace不记录跳转记录
      this.$router.replace(name + "#refresh");

      this.$nextTick(() => {
        this.removeTab(name + "#refresh");
        //把路由重新引导回来
        this.$router.replace(name);
        //添加一个相同位置的页签
        this.addTab(this.$route, tabIndex);
      });
    },

    //路由切换
    routeChange(route) {
      if (this.isHomeRoute(route)) {
        return;
      }
      let found = this.multipleTabs.find(item => {
        return item.name === route.fullPath;
      });
      if (!found) {
        //没有该页签，新增
        this.addTab(route);
      } else {
        //切换到该页签
        this.changeTab(route.fullPath);
      }
      //浏览器后退存在遮罩层问题
      let model = document.querySelector(".v-modal");
      if (model) {
        model.style.display = "none";
      }
    },
    //点击页签
    tabClick(tab) {
      this.changeTab(tab.name);
    },
    //点击关闭
    tabRemove(name) {
      let tabIndex = 0;
      if (this.multipleTabs.length == 1) {
        this.$message({ message: "最后一个页签不能关闭!", type: "warning" });
        return;
      }
      this.multipleTabs.forEach((item, index) => {
        if (item.name === name) {
          tabIndex = index;
        }
      });
      //删除页签
      this.removeTab(name);
      //切换TAB
      if (name === this.currentTab && tabIndex > 0) {
        this.changeTab(this.multipleTabs[tabIndex - 1].name);
      }
    },
    // 关闭按钮
    handleClose(item) {
      this.tabRemove(item.name);
    },

    //右键菜单
    tabMenu(event, item, index) {
      let zoom = this.$root.zoom ? this.$root.zoom / 100 : 1;
      // this.menuLeft = this.$store.state.app.collapse
      //   ? event.pageX / zoom - 170
      //   : event.pageX / zoom - 310;
      this.menuLeft = event.pageX / zoom - 110;
      this.menuCurrent = item.name;
      this.menuIndex = index;
      this.showCloseLeft = index == 0 ? false : true;
      this.showCloseRight =
        index == this.multipleTabs.length - 1 ? false : true;
      this.$refs.tabMenu.visible = false;
      this.$refs.tabMenu.show();
    },
    //菜单点击
    tabCommand(command) {
      let tabs = [];
      switch (command) {
        case "refreshThis":
          //刷新页面
          // location.reload();
          this.reloadTab(this.menuCurrent);
          break;
        case "closeThis":
          //关闭此页签
          //直接调用关闭页签的方法
          this.tabRemove(this.menuCurrent);
          break;
        case "closeOther":
          //关闭其他
          this.multipleTabs.forEach(item => {
            if (item.name !== this.menuCurrent) {
              tabs.push(item.name);
            }
          });
          tabs.forEach(item => {
            this.removeTab(item);
          });
          // 切换到当前页签
          this.changeTab(this.menuCurrent);
          break;
        case "closeLeft":
          //关闭左侧
          this.multipleTabs.forEach((item, index) => {
            if (index < this.menuIndex) {
              tabs.push(item.name);
            }
          });
          tabs.forEach(item => {
            this.removeTab(item);
          });
          // 切换到当前页签
          this.changeTab(this.menuCurrent);
          break;
        case "closeRight":
          //关闭右侧
          this.multipleTabs.forEach((item, index) => {
            if (index > this.menuIndex) {
              tabs.push(item.name);
            }
          });
          tabs.forEach(item => {
            this.removeTab(item);
          });
          this.changeTab(this.menuCurrent);
          break;
        case "closeAll":
          // 关闭所有
          this.multipleTabs.forEach(item => {
            tabs.push(item.name);
          });
          tabs.forEach(item => {
            this.removeTab(item);
          });
          // 清空所有缓存
          this.keepAlive.cache = {};
          this.keepAlive.keys = [];
          break;
      }
    }
  }
};
</script>

<style scoped>
.multiple-tabs {
  position: relative;
  height: 40px;
  /* margin-bottom: 10px; */
  /* margin-bottom: 5px; */
}
.multiple-tabs .el-tabs {
  position: fixed;
  z-index: 99;
  background-color: #ffffff;
  margin: 0 !important;
  width: 100%;
  height: 35px;
  padding-top: 5px;
  border-bottom: 1px solid #d8dce5;
  border-left: 1px solid #eee;
  /* -webkit-box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12), 0 0 3px 0 rgba(0, 0, 0, 0.04); */
  /* box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12), 0 0 3px 0 rgba(0, 0, 0, 0.04); */
}
/deep/ .el-tabs__header {
  margin: 0;
  /* border-bottom: 1px solid #eee; */
  /* border-bottom: 1px solid #fff; */
}
/deep/ .el-tabs__content {
  display: none;
}
/deep/ .el-tabs--card .el-tabs__item {
  font-size: 14px;
  color: #333 !important;
  font-weight: normal;
  border: 1px solid #d8dce5;
  margin: 0 4px;
  line-height: 28px;
  overflow: hidden;
  height: 30px;
  border-radius: 3px;
  padding: 0 !important;
  box-shadow: none;
}
/deep/ .el-tabs--card .el-tabs__item > span {
  display: block;
  padding: 0 15px;
}
/deep/ .el-tabs--card .el-tabs__item.is-active {
  color: #fff !important;
  line-height: 28px;
  background-color: #0775db;
  border-color: #0775db;
  padding-left: 10px !important;
  padding-right: 10px !important;
}
/deep/ .el-tabs--card .el-tabs__item.is-active::before {
  content: "";
  background: #fff;
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  position: absolute;
  top: 10px;
  left: 8px;
}
/deep/ .el-tabs--card .el-tabs__item.is-active::after {
  display: none;
}
/deep/ .el-tabs--card .el-tabs__item:focus.is-active {
  outline: none;
  box-shadow: none;
}
.multiple-tabs-menu {
  position: absolute;
  z-index: 2000;
  top: 20px;
  width: 200px;
  background: #fff;
}
/deep/ .el-icon-close {
  width: 16px !important;
  height: 16px !important;
  transition: none;
}
/deep/ .el-tabs--card > .el-tabs__header .el-tabs__item:first-child {
  margin-left: 8px;
}
/deep/ .el-tabs__nav-wrap .el-tabs__nav-next, /deep/ .el-tabs__nav-wrap .el-tabs__nav-prev {
  line-height: 30px;
}
.dropdown-icon {
  display: none;
  position: absolute;
  top: 3px;
  right: 0;
  font-size: 12px;
  margin-right: 0px;
  width: 20px;
  height: 20px;
  text-align: center;
  line-height: 18px;
  border: 1px solid rgba(0, 0, 0, 0);
  transform: rotate(-90deg);
}
.dropdown-icon:hover {
  border: 1px solid rgba(255, 255, 255, 0.2);
}
/deep/ .el-tabs--card .el-tabs__item.is-active .dropdown-icon {
  display: block;
}
</style>

<style>
/* 此处作用域是全局，注意避免样式污染 */
/* 表单编辑 */
.multiple-tabs-flag .cud-form-detail-full {
  position: relative;
  left: auto;
  top: auto;
  width: auto;
}
/* 隐藏面包屑 */
.multiple-tabs-flag .brand {
  display: none !important;
}
</style>
