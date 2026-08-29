<template>
  <el-container>
    <el-header class="nav app1" id="app1">
      <el-row class="cud-nav-wrap">
        <el-col :span="14" class="cud-nav-logo">
          <!-- 白色和深色LOGO 切换主题用 -->
          <img class="cud-logo cud-logo-light" src="@/assets/img/logo.png" />
          <img
            class="cud-logo cud-logo-dark"
            src="@/assets/img/login_logo.png"
            style="display: none"
          />
          <div class="cud-logo-split"></div>
          <span class="cud-title-text">{{ $t("lang.system_name") }}</span>
        </el-col>
        <!-- 新版UI -->
        <el-col :span="10">
          <user-center
            ref="userCenter"
            :userName="nowUser"
            :userDept="userDept"
            :role="role"
            @triggerUser="triggerUser"
            @logout="logout"
            @changeLanguage="changeLanguage"
          ></user-center>
        </el-col>
      </el-row>
    </el-header>

    <el-container>
      <div>
        <el-aside
          class="aside left-menu"
          width="190px;"
          :class="{ asideWidth: $store.state.app.width }"
        >
          <!-- 收缩按钮 -->
          <div @click="menuOpen" class="nav-icon" ref="navIcon">
            <!-- <img src="http://cuc/img/icon_01.png"/> -->
            <div
              class="cud3-icon-blue font_family"
              :class="
                $store.state.app.collapse
                  ? 'icon-icon_menu_unfold'
                  : 'icon-icon_menu_retract'
              "
            ></div>
          </div>
          <!-- 菜单搜索 -->
          <div class="cud-menu-search">
            <el-autocomplete
              v-if="!$store.state.app.collapse"
              ref="userCenterSearch"
              v-model="searchInput"
              :fetch-suggestions="searchQuery"
              :placeholder="$t('cm.search')"
              :clearable="true"
              @clear="searchClear"
              @select="searchSubmit"
              prefix-icon="el-icon-search"
            ></el-autocomplete>
          </div>
          <el-scrollbar
            :style="
              'height: calc(100% - ' +
              ($store.state.app.collapse ? 40 : 80) +
              'px)'
            "
          >
            <!-- 菜单 -->
            <el-menu
              :default-active="defaultActive"
              :default-openeds="defaultOpeneds"
              class="el-menu-vertical-demo"
              height="100%"
              router
              popper-append-to-body
              unique-opened
              :collapse="$store.state.app.collapse"
              :collapse-transition="false"
              @select="selectMenu"
            >
              <div v-for="(menu, index) in menus" :key="index">
                <el-submenu
                  :class="menu.children.length === 0 ? 'single-level-menu' : ''"
                  :index="String(index)"
                  v-if="
                    showMenu(menu.resource) &&
                    showMenuAuth(menu.authType) &&
                    menu.children.length > 0
                  "
                >
                  <!-- 一级 -->
                  <template slot="title">
                    <div>
                      <i class="iconfont" id="icon">{{
                        iconfontFn(menu.iconNor)
                      }}</i>
                      <span
                        :title="$t(menu.name)"
                        v-if="!$store.state.app.collapse"
                        >{{ $t(menu.name) }}</span
                      >
                    </div>
                  </template>
                  <!-- 二级 -->
                  <div
                    v-for="(subitem, idx) in menu.children"
                    :key="idx"
                    @click="
                      secondMenuClick(menu.children.length === idx + 1, subitem)
                    "
                  >
                    <!-- 二级 有子菜单 -->
                    <div
                      v-if="
                        subitem.children.length > 0 &&
                        showMenu(subitem.resource)
                      "
                    >
                      <!-- 三级菜单 原有 菜单折叠时使用 -->
                      <el-submenu
                        :index="String(idx + 100)"
                        v-if="$store.state.app.collapse"
                      >
                        <template slot="title">
                          <div :title="$t(subitem.name)">
                            <i
                              v-if="subitem.iconNor"
                              class="iconfont"
                              id="icon"
                              >{{ iconfontFn(subitem.iconNor) }}</i
                            >
                            <span>{{ $t(subitem.name) }}</span>
                          </div></template
                        >
                        <el-menu-item
                          :index="lastItem.url"
                          v-for="(lastItem, lastIndex) in subitem.children"
                          :key="lastIndex"
                          ><div>
                            <span>{{ $t(lastItem.name) }}</span>
                          </div></el-menu-item
                        >
                      </el-submenu>
                      <!-- 三级菜单 新版 不折叠时使用 不需要可以注释，并将原有三级菜单submenu的v-if去掉 -->
                      <div v-else class="cud-menu-level3 menu-level3-col1">
                        <!-- <div v-else class="cud-menu-level3 menu-level3-col3"> -->
                        <!-- 原有菜单必须click才能展开，这里模拟一个el-menu-item使用hover展开 -->
                        <div
                          class="el-menu-item"
                          style="padding-left: 40px"
                          :class="
                            subitem.children.some(
                              (item3) =>
                                item3.url == defaultActive ||
                                defaultActive.includes(item3.url)
                            )
                              ? 'is-active'
                              : ''
                          "
                        >
                          <div :title="$t(subitem.name)">
                            <i
                              v-if="subitem.iconNor"
                              class="iconfont"
                              id="icon"
                              >{{ iconfontFn(subitem.iconNor) }}</i
                            >
                            <span>{{ $t(subitem.name) }}</span>
                          </div>
                          <i
                            class="el-submenu__icon-arrow el-icon-arrow-right"
                          ></i>
                          <div
                            class="menu-level3-list"
                            :style="
                              'background-image: url(' +
                              require('@/assets/img/menu-l3.png') +
                              ');'
                            "
                          >
                            <div class="menu-level3-title">
                              {{ $t(subitem.name) }}
                            </div>
                            <el-menu-item
                              :index="lastItem.url"
                              v-for="(lastItem, lastIndex) in subitem.children"
                              :key="lastIndex"
                            >
                              <i
                                v-if="lastItem.iconNor"
                                class="iconfont"
                                id="icon"
                                >{{ iconfontFn(lastItem.iconNor) }}</i
                              >
                              <span>{{ $t(lastItem.name) }}</span>
                            </el-menu-item>
                          </div>
                        </div>
                      </div>
                    </div>
                    <!-- 二级 无子菜单 -->
                    <div v-else>
                      <el-menu-item
                        :index="subitem.url"
                        v-if="showMenu(subitem.resource)"
                      >
                        <div class="menus3" :title="$t(subitem.name)">
                          <i
                            v-if="subitem.iconNor"
                            class="iconfont"
                            id="icon"
                            >{{ iconfontFn(subitem.iconNor) }}</i
                          >
                          <span>{{ $t(subitem.name) }}</span>
                          <el-badge
                            v-if="
                              subitem.badge &&
                              $store.state.menu.badgeCount[subitem.badge]
                            "
                            :value="$store.state.menu.badgeCount[subitem.badge]"
                            class="menus-badge"
                          ></el-badge>
                        </div>
                      </el-menu-item>
                    </div>
                  </div>
                </el-submenu>
                <!-- 只有一级 -->
                <div
                  v-if="showMenu(menu.resource) && menu.children.length === 0"
                >
                  <el-menu-item :index="menu.url">
                    <i v-if="menu.icon" class="iconfont" id="icon">{{
                      iconfontFn(menu.icon)
                    }}</i>
                    <i v-else class="iconfont" id="icon">{{
                      iconfontFn(menu.iconNor)
                    }}</i>
                    <span v-if="!$store.state.app.collapse">{{
                      $t(menu.name)
                    }}</span></el-menu-item
                  >
                </div>
              </div>
            </el-menu>
          </el-scrollbar>
        </el-aside>
      </div>
      <el-container
        style="margin-top: 50px"
        :class="[$store.state.app.collapse ? 'elContainer2' : 'elContainer1']"
      >
        <el-main class="el-main">
          <!-- <router-view :key="$route.fullPath"></router-view> -->
          <!-- 多页签配置，取消注释multiple-tab和keep-alive开启多页签 -->
          <multiple-tabs :showTabs="true" :maxTabs="10"></multiple-tabs>
          <!-- <transition name="route" mode="out-in" :duration="200"> -->
          <keep-alive max="15" ref="keepAlive">
            <router-view :key="$route.fullPath"></router-view>
          </keep-alive>
          <!-- </transition> -->
        </el-main>
      </el-container>
    </el-container>
    <!-- 初始化环境不展示隐私协议弹窗 -->
  </el-container>
</template>

<script>
import {
  getUserInfo,
  changeUser,
  userLogout,
  getMenuPermission,
  getPermission,
  getProSetByFullName,
  getUserRoles,
  getEreportCode,
  getTokenByCode,
  getPrivacyStatement,
  agreePrivacyStatement,
} from "@/api/api.js";
import { iconfont } from "@/utils/funcUtil";
import store from "@/store";
import { hasMenuPermission } from "@/permission/menu";
import { hasPermission } from "@/permission/btn";
import menuData from "@/assets/json/menu.json";
import LangSwitch from "./i18n/lang_switch";
import osUtil from "@/utils/osUtil";
import multipleTabs from "@/components/common/multipleTabs";
import userCenter from "@/components/common/userCenter";
import draftApi from "../modules/drafts/api/index";
// import router from "@/router/index.js"
export default {
  components: {
    LangSwitch,
    multipleTabs,
    userCenter,
  },
  data() {
    return {
      defaultLanguage: "E",
      nowUser: "",
      userDept: "",
      activeIndex: "",
      menus: [],
      treeMenuList: [],
      //是否显示切换用户
      showTriggerUser: false,
      //认证方式是否授权系统
      isProAuth: false,
      // 当前uau的角色
      role: [],
      dialogVisible: false, //隐私协议
      contents: {},
      isLastShow: true,
      //关联菜单默认选中
      defaultActive: "",
      //打开的菜单
      defaultOpeneds: [],
      //搜索
      searchInput: "",
      searchResult: [],
    };
  },
  computed: {
    menuTree() {
      return this.$store.state.menu.navTree;
    },
    currentRole() {
      if (sessionStorage.getItem("role")) {
        return sessionStorage.getItem("role");
      }
    },
    collapse() {
      return this.$store.state.app.collapse;
    },
  },
  created() {
    this.$nextTick(async () => {
      await this.getNowUser(); //获取当前用户信息，右上角展示
      //能否切换用户
      if (
        process.env.NODE_ENV === "development" ||
        process.env.NODE_ENV === "test"
      ) {
        this.showTriggerUser = true;
      }
      //解耦版本使用授权系统
      if (process.env.AUTH_TYPE !== "AEP") {
        this.isProAuth = true;
      }
    });

    if (this.currentRole && this.currentRole != null) {
      this.role = this.currentRole.split(",");
    }
  },
  mounted() {
    //折叠菜单tr
    this.menuCollapse();
    //关联菜单默认选中
    this.defaultActive = this.$route.fullPath;
    //查询草稿数量
    this.getDraftCount();
  },
  watch: {
    //用于菜单栏高亮
    $route(to) {
      this.menuSelect(this.activeIndex);
      //折叠菜单
      this.menuCollapse();
    },
    menus(val) {
      //菜单变化时更新搜索下拉
      if (val) this.searchInit(val);
    },
  },
  methods: {
    //设置草稿菜单数量标记
    getDraftCount() {
      let params = {
        current: 1,
        size: 10,
      };
      draftApi.pageListAPI(params).then((res) => {
        if (res.code === "0") {
          let count = res.total > 99 ? "99+" : res.total;
          store.commit("setBadgeCount", { name: "draftCount", count: count });
        }
      }).catch(() => {});
    },
    //初始化搜索
    searchInit(val) {
      let result = [];
      val.forEach((item) => {
        if (item.url) {
          result.push({
            value: this.$t(item.name),
            url: item.url,
          });
        }
        //二级菜单
        if (item.children && item.children.length > 0) {
          item.children.forEach((item1) => {
            if (item1.url) {
              result.push({
                value: this.$t(item1.name),
                url: item1.url,
              });
            }
            //三级菜单
            if (item1.children && item1.children.length > 0) {
              item1.children.forEach((item2) => {
                if (item2.url) {
                  result.push({
                    value: this.$t(item2.name),
                    url: item2.url,
                  });
                }
              });
            }
          });
        }
      });
      this.searchResult = result;
    },
    //搜索查询
    searchQuery(queryString, cb) {
      var results = [];
      if (queryString) {
        //有输入返回查询结果
        results = this.searchResult.filter((item, index) => {
          return (
            item.value.toLowerCase().indexOf(queryString.toLowerCase()) > -1
          );
        });
        if (results.length < 1) {
          results = [
            {
              value: "没有找到结果",
              url: "",
            },
          ];
        }
      } else {
        //无输入返回历史记录
        let search = sessionStorage.getItem("search");
        let searchList = [];
        if (search) {
          searchList = JSON.parse(search);
        }
        results = searchList;
      }
      // 调用 callback 返回建议列表的数据
      cb(results);
    },
    //搜索清空
    searchClear() {
      this.$refs.userCenterSearch.activated = true;
    },
    //点击搜索结果
    searchSubmit(item) {
      if (item.url) {
        //保存查询历史
        let search = sessionStorage.getItem("search");
        let searchList = [];
        if (search) {
          searchList = JSON.parse(search);
          //去重去超
          let list = searchList.filter((item1, index) => {
            return item1.value !== item.value && index < 4;
          });
          searchList = list;
        }
        searchList.unshift({
          value: item.value,
          url: item.url,
        });
        sessionStorage.setItem("search", JSON.stringify(searchList));
        //跳转
        this.$router.push(item.url);
      } else {
        this.searchInput = "";
      }
    },
    secondMenuClick(show, subitem) {
      if (show && !this.collapse && subitem.children.length > 0) {
        this.isLastShow = !this.isLastShow;
      }
    },

    closeDialog() {
      this.dialogVisible = false;
    },

    async getPrivacyStatement() {
      try {
        const params = { lang: this.defaultLanguage === "E" ? "cn" : "en" };
        const { code, data } = await getPrivacyStatement(params);
        if (code === "0") {
          const { isAgree } = data;
          if (isAgree) {
            this.dialogVisible = false;
          } else {
            data && (this.contents = data);
            this.dialogVisible = true;
          }
        }
      } catch (e) {
        console.error("获取隐私协议失败", e);
      }
    },
    async handleArgee() {
      const { code } = await agreePrivacyStatement();
      if (code === "0") {
        this.closeDialog();
      }
    },

    iconfontFn(icon) {
      return iconfont(icon);
    },
    async getMenuManagerGetFormMenuTree() {
      const menus = JSON.parse(JSON.stringify(menuData)).map((item) => {
        const children = (item.children || []).map((child) => {
          return Object.assign({}, child, {
            children: child.children || []
          });
        });
        return Object.assign({}, item, { children: children });
      });
      this.menus = Object.freeze(menus);
      sessionStorage.setItem("totalMenu", JSON.stringify(this.menus));
    },
    /**
     * 获取按钮权限
     */
    async getBtnPermission(userId) {
      let _this = this;
      //先判断是否有权限，然后在进行刷新  关注vuex存储数据的存活范围
      if (sessionStorage.getItem("btns")) {
        store.commit("setPerms", JSON.parse(sessionStorage.getItem("btns")));
      } else {
        // 获取当前登陆人uau权限
        const userRole = await getUserRoles({});
        let userArr = userRole.data.data.map((item) => {
          return item.roleName;
        });
        _this.role = userArr;
        if (userArr && userArr.length > 0) {
          let roleStr = userArr.join(",");
          sessionStorage.setItem("role", roleStr);
        }
        getPermission(userId).then((result) => {
          if (result.status == "200" && result.data.code == "0") {
            //保存按钮权限到store
            store.commit("setPerms", result.data.data);
            //sessionStorage保存按钮权限, 为了刷新功能
            sessionStorage.setItem("btns", JSON.stringify(result.data.data));
            let page3 = sessionStorage.getItem("page3");
            if (page3 != null) {
              if (window.location.href.indexOf(page3) == -1) {
                sessionStorage.setItem("pageSkipCount", 1);
                // this.$router.push("/" + sessionStorage.getItem("page3"));
              } else {
                sessionStorage.removeItem("page3");
              }
            }
          }
        });
        // }
      }
    },
    // 获取菜单权限
    getMenuPerm(user) {
      let _this = this;
      let userId = user.substr(1, user.indexOf("]") - 1);
      //获取按钮权限
      _this.getBtnPermission(userId);
      if (sessionStorage.getItem("menus")) {
        store.commit("setNavTree", JSON.parse(sessionStorage.getItem("menus")));
      } else {
        getMenuPermission(userId).then(async (result) => {
          if (!result.data.data || result.data.data.length < 1) {
            _this.$router.push("/401");
            return;
          }
          //保存在store
          store.commit("setNavTree", result.data.data);
          //保存一份在sessionStorage 刷新问题
          sessionStorage.setItem("menus", JSON.stringify(result.data.data));
          await _this.getMenuManagerGetFormMenuTree();
        });
      }
    },
    //是否显示菜单
    showMenu(menu) {
      if (menu) {
        return hasMenuPermission(menu);
      } else {
        return false;
      }
    },
    //是否显示菜单（内网/解耦）
    showMenuAuth(authType) {
      //内网不显示授权系统菜单
      if (authType !== undefined && authType !== process.env.AUTH_TYPE) {
        return false;
      } else {
        return true;
      }
    },
    //是否显示按钮
    showBtn(btn) {
      return hasPermission(btn);
    },
    //语言切换
    changeLanguage() {
      if (this.defaultLanguage == "E") {
        this.defaultLanguage = "中";
        this.$i18n.locale = "en-US";
        store.commit("setLanguage", "en");
      } else {
        this.defaultLanguage = "E";
        this.$i18n.locale = "zh-CN";
        store.commit("setLanguage", "cn");
      }
    },
    //获取当前用户
    async getNowUser() {
      let _this = this;
      try {
        if (sessionStorage.getItem("user")) {
          //解耦版本
          // if (process.env.AUTH_TYPE !== "AEP") {
          //   //授权系统返回的数据需特殊处理
          //   _this.getAuthMenuPerm(sessionStorage.getItem("user"));
          // } else {
          _this.getMenuPerm(sessionStorage.getItem("user"));
          // }
          _this.nowUser = sessionStorage.getItem("user");
          _this.userDept = sessionStorage.getItem("userDept");
          _this.$root.NOW_USER = sessionStorage.getItem("user");
        } else {
          const result = await getUserInfo({ t: Math.random() });
          _this.nowUser = result.data.data.nowUserName;
          _this.userDept = result.data.data.userDeptName;
          _this.$root.NOW_USER = result.data.data.nowUserName;
          sessionStorage.setItem("user", result.data.data.nowUserName);
          sessionStorage.setItem("userDept", result.data.data.userDeptName);
          sessionStorage.setItem("userDeptId", result.data.data.userDeptId);
          // 获取当前登陆人uau权限
          const userRole = await getUserRoles({});
          let userArr = userRole.data.data.map((item) => {
            return item.roleName;
          });
          _this.role = userArr;
          if (userArr && userArr.length > 0) {
            let roleStr = userArr.join(",");
            sessionStorage.setItem("role", roleStr);
          }
          //解耦版本
          // if (process.env.AUTH_TYPE !== "AEP") {
          //   //授权系统返回的数据需特殊处理
          //   _this.getAuthMenuPerm(result.data.data);
          // } else {
          _this.getMenuPerm(result.data.data);
          // }
        }
      } catch (e) {
        console.error("获取用户信息失败，使用本地菜单", e);
      }
      await _this.getMenuManagerGetFormMenuTree();
    },
    //切换用户
    triggerUser: function () {
      this.$prompt(this.$t("cm.enterdomainaccount"), this.$t("cm.tips"), {
        confirmButtonText: this.$t("cm.confirm"),
        cancelButtonText: this.$t("cm.cancel"),
        cancelButtonClass: "btn-second",
        confirmButtonClass: "btn-default",
      })
        .then(({ value }) => {
          changeUser(value).then((result) => {
            sessionStorage.clear();
            if (this.isProAuth) {
              //解耦版本
              sessionStorage.setItem("token", result.data.data);
            }
            this.$nextTick(() => {
              location.href = "/";
              // this.$router.push("/");
              // this.$router.go(0);
            });
          });
        })
        .catch(() => {
          //
        });
    },
    //退出登录
    logout() {
      let _this = this;
      _this
        .$confirm(_this.$t("lang.logout_confirm"), _this.$t("cm.tips"), {
          confirmButtonText: _this.$t("cm.confirm"),
          cancelButtonText: _this.$t("cm.cancel"),
          type: "warning",
        })
        .then(() => {
          if (!_this.isProAuth) {
            //删除用户信息
            _this.$root.NOW_USER = "";
            //清除会话
            sessionStorage.clear();
            //清除菜单权限数据
            store.commit("setNavTree", []);
            store.commit("setPerms", []);
            //内网版本跳到4A
            window.location.href = envConfig.API_ROOT + "/logout";
          } else {
            let token = sessionStorage.getItem("token");
            let params = { token: token };
            userLogout(params)
              .then((result) => {
                if (result.data.code == "0") {
                  //删除用户信息
                  _this.$root.NOW_USER = "";
                  //清除会话
                  sessionStorage.clear();
                  //清除菜单权限数据
                  store.commit("setNavTree", []);
                  store.commit("setPerms", []);
                  //解耦版本跳到登陆页
                  _this.$router.push("/login");
                } else {
                  _this.$message({ type: "error", message: result.data.msg });
                }
              })
              .catch((err) => {
                _this.$message({ type: "error", message: err });
              });
          }
        })
        .catch(() => {
          console.log("取消切换用户");
        });
    },
    //折叠和展开菜单操作
    menuOpen() {
      store.commit("changeCollapse");
      store.commit("changeWidth");
    },
    menuCollapse() {
      //流程、表单编辑等页面菜单折叠
      let to = this.$route;
      if (
        to.path === "/workbench/view" ||
        to.path === "/formAdd" ||
        to.path === "/formPreview" ||
        to.path === "/smartFormView" ||
        to.path === "/customFlow"
      ) {
        //默认收缩菜单
        store.state.app.collapse = true;
        store.state.app.width = false;
      } else {
        store.state.app.collapse = false;
        store.state.app.width = true;
      }
    },
    //路由跳转 改变菜单栏颜色 高亮显示
    async menuSelect(index) {
      this.activeIndex = index;
      //关联菜单默认选中
      let props = this.$route.matched[1].props;
      if (props.default && props.default.menuPath) {
        this.defaultActive = this.$route.matched[1].props.default.menuPath;
      } else {
        this.defaultActive = this.$route.fullPath;
      }
    },
    initProcBaseInfo() {
      //初始化流程基本信息
      let _this = this;
      getProSetByFullName({ fullName: "BMWS\\TestProcess" }).then((result) => {
        let data = result.data.data.data;
        if (data.length > 0) {
          data = data[data.length - 1];
          store.commit("procName", data.procSetDescr);
          store.commit("procId", data.lastProcVerID);
          store.commit("procSetId", data.procSetID);
        } else {
          _this.$alert(
            "不存在流程全名为'BMWS\\TestProcess'的流程",
            _this.$t("cm.tips")
          );
        }
      });
    },
    selectMenu(path) {
      setTimeout(() => {
        this.defaultActive = path;
      }, 50);
    },
  },
};
</script>

<style lang="less" scoped>
/* 多颜色样式 */
/* @import "../../static/less/color.less"; */
// .cud-nav-background {
//   background: #fff;
// }
// 样式
.nav.app1 {
  height: 50px !important;
  line-height: 50px;
  position: fixed;
  width: 100%;
  z-index: 100;
}
.cud-nav-wrap {
  .cud-nav-logo {
    display: flex;
    align-items: center;
    .cud-logo {
      width: 163px;
      margin-top: -4px;
    }
    .cud-logo-split {
      width: 1px;
      height: 16px;
      background: rgba(255, 255, 255, 0.2);
      margin: 2px 20px 0 20px;
    }
    .cud-title-text {
      font-family: "Microsoft YaHei";
      font-size: 18px;
      letter-spacing: 2px;
      color: #ffffff;
      font-weight: 500;
    }
  }
  .cud-user-info-wrap {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    color: #ffffff;
    cursor: default;
    .cud-language-btn-wrap {
      border-right: 1px solid rgba(255, 255, 255, 0.2);
      margin-right: 19px;
      padding-right: 23px;
      .cud-language-btn {
        width: 20px;
        height: 20px;
        background: #ffffff;
        color: #0c7bca;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 50%;
        user-select: none;
      }
    }
    .cud-user-info {
      font-size: 16px;
    }
  }
}
/* 菜单搜索 */
/deep/.cud-menu-search {
  background-color: #fff;
  .el-autocomplete {
    padding: 5px;
  }
  .el-input__inner {
    height: 30px !important;
    border: 1px solid #eee;
  }
  .el-input__prefix {
    top: 2px;
  }
}
#icon {
  // transform: translateY(-4px);
  display: inline-block;
  font-size: 18px !important;
  padding-left: 1px;
  margin-left: -4px;
  margin-top: -2px;
  // position: absolute;
  // top: 4px;
  // left: 20px;
}
.cud3-icon-blue {
  color: #000;
  display: block;
  // font-weight: bold;
}
/deep/ .el-aside {
  transition: width 0.15s;
  -webkit-transition: width 0.15s;
  -moz-transition: width 0.15s;
  -webkit-transition: width 0.15s;
  -o-transition: width 0.15s;
}
.el-menu--collapse .menu-font-span1
/* 隐藏单个一级菜单项的箭头 */
.single-level-menu /deep/.el-submenu__icon-arrow {
  display: none;
}

/* 路由切换过渡 */
.route-enter-from {
  opacity: 0;
}
.route-enter-active {
  transition: all 0.2s ease;
  transform: translateY(50px);
  // transform: scale(0.5, 0.5);
  opacity: 0;
}
.route-enter-to {
  transform: translateY(0);
  // transform: scale(1, 1);
  opacity: 1;
}
.route-leave-active {
  transition: all 0.2s ease;
  transform: translateY(0);
  opacity: 1;
}
.route-leave-to {
  transform: translateY(-50%);
  opacity: 0;
}

/* 三级菜单 */
/deep/ .cud-menu-level3 {
  /* 鼠标移入时显示 */
  .el-menu-item:hover .menu-level3-list {
    visibility: visible;
    transform: translateX(0);
    opacity: 1;
  }
  .el-menu-item:hover .el-submenu__icon-arrow {
    transform: rotate(180deg);
  }
  .menu-level3-list {
    visibility: hidden;
    position: fixed;
    left: 201px;
    top: 0px;
    margin-top: 50px;
    padding-top: 45px;
    padding-left: 20px;
    width: 300px;
    height: 100%;
    z-index: -1;
    background-color: #fff;
    background-size: 250px 250px;
    background-position: right bottom;
    background-repeat: no-repeat;
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
    cursor: default;
    transform: translateX(-50%);
    opacity: 0;
    transition: all 0.3s;

    .menu-level3-title {
      padding-left: 5px;
      padding-top: 10px;
      height: 30px;
      color: #333;
      font-size: 16px;
      line-height: 20px;
    }
    .el-menu-item {
      float: left;
      margin-top: 10px;
      width: 250px;
      height: 35px;
      line-height: 32px;
      color: #333;
      border: 1px solid #eee;
      cursor: pointer;
      border-radius: 5px;
      white-space: normal;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .el-menu-item i {
      position: absolute;
      margin-left: -25px !important;
      margin-top: 0px !important;
    }
    .el-menu-item.is-active {
      color: #fff;
      border: none;
    }
    .el-menu-item:hover {
      color: #0775db;
      border-color: #ddd;
    }
  }
}
.menu-level3-col1 .menu-level3-list {
  width: 280px;
}
.menu-level3-col3 .menu-level3-list {
  width: 800px;
}
/deep/.menus-badge .el-badge__content {
  height: 16px;
  line-height: 16px;
  padding: 0 4px;
  margin-top: -2px;
}
</style>
