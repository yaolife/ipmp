/*
 * @Author: [P631038]杨旭
 * @Date: 2024-11-08 17:14:00
 * @LastEditors: [P631038]杨旭
 * @LastEditTime: 2026-01-06 16:27:18
 * @FilePath: \4.2.0-node16\cud4demo-ui\src\main.js
 * @Description:
 */
import Vue from "vue";
Vue.config.ignoredElements = ["peer-stream"];
import VueI18n from "vue-i18n";
import router from "./router";
import App from "./App";
import ElementUI from "element-ui";

import enLocale from "element-ui/lib/locale/lang/en";
import zhLocale from "element-ui/lib/locale/lang/zh-CN";
import axios from "axios";
import VueAxios from "vue-axios";
import url from "@/api/api";
import Vue2OrgTree from "vue2-org-tree";
Vue.use(Vue2OrgTree);
import dragMove from "./utils/dragMove"; // 支持弹窗移动
Vue.use(dragMove);
import EventBusPlugin from "./utils/eventBus"; // 编辑画布通信
Vue.use(EventBusPlugin);
import Avue from "@smallwei/avue";
import "@smallwei/avue/lib/index.css";
Vue.use(Avue, { size: "medium", menuType: "text" });
import plugin from "./plugin";
import { getUserInfo } from "@/api/api";
import VueGridLayout from "vue-grid-layout";

Vue.use(plugin);
Vue.use(VueI18n);
Vue.use(VueGridLayout);
Vue.use(ElementUI, {
  i18n: (key, value) => i18n.t(key, value)
}); //兼容i18n 7.x 版本设置

Vue.use(VueAxios, axios);

Vue.prototype.SCROLLHEIGHT = 0;

Vue.prototype.URL = url;
import Print from "vue-print-nb";
Vue.use(Print);

// cud3.0组件添加整合 begin
Vue.prototype.$DomainPath = process.env.DOMAIN_PATH;
Vue.prototype.$AppCode = process.env.APP_CODE;

import HttpAxios from "@/api/http";
import FieldsConfig from "@/components/form/fieldsConfig";

// 注册自定义选人组件
// import CudCustomPersonSingle from "@/components/cudCommPersonComponent/asingle.vue";
// import CudCustomPersonMultiple from "@/components/cudCommPersonComponent/msingle.vue";
// Vue.component("CudCustomPersonSingle", CudCustomPersonSingle);
// Vue.component("CudCustomPersonMultiple", CudCustomPersonMultiple);

// 开发调试模式 开启
// import WorkflowModule from "../cudcomponents/workflowModule/";
import WorkflowModule from "../lib/cud4.0/cud4-component.js";
import "../lib/cud4.0/static/css/cud4-component.css";
import "@/assets/lib/css/table-empty-center.css";

// 引用框架提供的本地样式,不采用框架打包样式
// require("@/assets/lib/css/global.css");

Vue.use(WorkflowModule, {
  httpAxios: HttpAxios,
  fieldsConfig: FieldsConfig
}); 

// lib源码包前缀配置
window.envConfig = WorkflowModule.envFn(process.env)

// // 精细化报表模块集成
// if (!window.canvg) {
//   window.canvg = {};
// }
// // import report from "../report_modules"
// // import '../lib/report/static/css/report.css'
// let report = require('../lib/report/report.js').default;
// store.registerModule("chart", report.store.chart);
// store.registerModule("designer", report.store.designer);
// store.registerModule("dashboard", report.store.dashboard);

// Vue.use(report, {
//   httpAxios: HttpAxios,
// });
// for (let routerReport of report.routerDefine.router) {
//   router.addRoute("manage", routerReport);
// }

// 仅保留资产管理、日志管理页面，不再注册表单/流程/数据模型等模块路由

//添加Vuex的整合（运行时再取 store，避免循环依赖把 ES import 绑定成 undefined）
function resolveVuexStore() {
  const storeModule = require("./store");
  const candidates = [
    storeModule,
    storeModule && storeModule.default,
    storeModule && storeModule.a
  ];
  for (let i = 0; i < candidates.length; i++) {
    const item = candidates[i];
    if (item && typeof item.registerModule === "function") {
      return item;
    }
  }
  return null;
}
const vuexStore = resolveVuexStore();
if (!vuexStore) {
  throw new Error("Vuex store 初始化失败，请检查 src/store 循环依赖");
}
vuexStore.registerModule("workflow", WorkflowModule.store.workflowStore);
vuexStore.registerModule("form", WorkflowModule.store.formStore);

import LocalComponent from "@/components/form/components";
import LocalWidget from "@/components/form/widget";
import LocalConfig from "@/components/form/config";
Vue.use(LocalComponent);
Vue.use(LocalWidget);
Vue.use(LocalConfig);

// 全局样式
require("./assets/css/el-icon.css");
require("./assets/css/font-awesome.css");

// 智能填表
// import smartFormModule from "../cudcomponents/smartFormModule/";
import smartFormModule from "../lib/smartForm/smartForm.js";
Vue.use(smartFormModule, {
  httpAxios: HttpAxios,
  fieldsConfig: FieldsConfig
});

const i18n = new VueI18n({
  locale: "zh-CN", //语言标识，通过切换locale的值来实现语言切换，this.$18n.locale
  silentTranslationWarn: true,
  messages: {
    "en-US": Object.assign(
      //国际化按模块分为七个文件：
      // 流程 workflow_manage.js
      // 规则 flow_rule.js
      // 表单 form_design.js
      // 模型 data_model_manage.js
      // 系统 system_manage.js
      // 个人工作台 workbench.js
      // 公用 common.js
      // 其他第三方国际化文件(如：psc)
      require("./assets/i18n/en/common.js"), //公共模块
      ...WorkflowModule.i18nDefine.cudRuleManageI18n.en,
      ...WorkflowModule.i18nDefine.cudWFManageI18n.en,
      ...WorkflowModule.i18nDefine.cudWorkbenchI18n.en,
      ...WorkflowModule.i18nDefine.cudFormManageI18n.en,
      ...WorkflowModule.i18nDefine.cudDatamodelI18n.en,
      ...WorkflowModule.i18nDefine.cudPrintTemplI18n.en,
      ...WorkflowModule.i18nDefine.cudFuncManageI18n.en,
      ...WorkflowModule.i18nDefine.cudLCCommonI18n.en,
      ...WorkflowModule.i18nDefine.cudComponentsI18n.en,
      ...smartFormModule.i18nDefine.cudSmartFormI18n.en,
      require("./assets/i18n/en/personal_workbench.js"), // 个人工作台
      require("./assets/i18n/en/template_manage.js"), // 模板管理
      require("./assets/i18n/en/system_manage.js"),
      require("psc-module/dist/i18n/en/cgnBpmn.js"),
      require("./assets/i18n/en/psc/cgnCommon.js"),
      require("./assets/i18n/en/psc/cgnProcessDelegation.js"),
      require("./assets/i18n/en/psc/cgnSelectProcess.js"),
      require("./assets/i18n/en/psc/cgnTask.js"),
      require("./assets/i18n/en/manage.js"),
      require("./assets/i18n/en/dict_manage.js"),
      require("./components/form/i18n/en/components.js"),
      require("./assets/i18n/en/http_connector.js"),
      require("./assets/i18n/en/process_maintenance.js"),
      require("./modules/authManage/common/i18/en/index.js"),
      enLocale
    ),
    "zh-CN": Object.assign(
      require("./assets/i18n/cn/common.js"), //公共模块
      ...WorkflowModule.i18nDefine.cudRuleManageI18n.cn,
      ...WorkflowModule.i18nDefine.cudWFManageI18n.cn,
      ...WorkflowModule.i18nDefine.cudWorkbenchI18n.cn,
      ...WorkflowModule.i18nDefine.cudFormManageI18n.cn,
      ...WorkflowModule.i18nDefine.cudDatamodelI18n.cn,
      ...WorkflowModule.i18nDefine.cudPrintTemplI18n.cn,
      ...WorkflowModule.i18nDefine.cudFuncManageI18n.cn,
      ...WorkflowModule.i18nDefine.cudLCCommonI18n.cn,
      ...WorkflowModule.i18nDefine.cudComponentsI18n.cn,
      ...smartFormModule.i18nDefine.cudSmartFormI18n.cn,
      require("./assets/i18n/cn/personal_workbench.js"), // 个人工作台
      require("./assets/i18n/cn/template_manage.js"), // 模板管理
      require("./assets/i18n/cn/system_manage.js"),
      require("psc-module/dist/i18n/cn/cgnBpmn.js"),
      require("./assets/i18n/cn/psc/cgnCommon.js"),
      require("./assets/i18n/cn/psc/cgnProcessDelegation.js"),
      require("./assets/i18n/cn/psc/cgnSelectProcess.js"),
      require("./assets/i18n/cn/psc/cgnTask.js"),
      require("./assets/i18n/cn/manage.js"),
      require("./assets/i18n/cn/dict_manage.js"),
      require("./components/form/i18n/cn/components.js"),
      require("./assets/i18n/cn/http_connector.js"),
      require("./assets/i18n/cn/process_maintenance.js"),
      require("./modules/authManage/common/i18/cn/index.js"),
      zhLocale
    )
  }
});

//业务消息全局获取方法
import businessMsg from "@/modules/system/businessMsg/js/business_msg_func";
Vue.use(businessMsg);

//全局守卫
router.beforeEach(async (to, from, next) => {
  if (to.path === "/") {
    next({ path: "/YJ3DVP", replace: true });
    return;
  }
  if (to.meta && typeof to.meta === "object" && to.meta.title) {
    document.title = to.meta.title;
  } else {
    document.title = "管网智慧管理平台";
  }
  // 解决首次进入时会显示页面再刷新的问题,直接同步加载,401跳转4A
  // 解耦版不执行该操作
  if (
    process.env.AUTH_TYPE === "AEP" &&
    !sessionStorage.getItem("user") &&
    to.path !== "/login"
  ) {
    try {
      const result = await getUserInfo({
        t: Math.random()
      });
      const data = result && result.data && result.data.data;
      if (data && data.nowUserName) {
        sessionStorage.setItem("user", data.nowUserName);
        sessionStorage.setItem("userDept", data.userDeptName);
        sessionStorage.setItem("userDeptId", data.userDeptId);
      }
    } catch (e) {
      // 后端不可用时不阻塞入口页渲染
      console.error("获取用户信息失败，继续进入页面", e);
    }
  }
  //邮件跳转
  if (to.path == "/workbench/view") {
    sessionStorage.setItem("locationHref", "");
  }
  //排除权限校验的页面
  if (
    //开发环境默认不过滤权限 (集团统一框架uau没有开发环境微服务)
    process.env.NODE_ENV == "development" ||
    to.path == "/chart_design" ||
    to.path == "/office" ||
    to.path == "/welcome" ||
    to.path == "/login" ||
    to.path == "/password" ||
    to.path == "/" ||
    to.path == "/404" ||
    to.path == "/401" ||
    //表单预览/智能填表路径排除
    to.path == "/workbench/view" ||
    to.path == "/smartFormView"
  ) {
    next();
    return;
  }
  next();
});

const startTime = performance.now();

//全局守卫
router.afterEach((to, from, next) => {
  const endTime = performance.now();
  const time = (endTime - startTime) / 1000;
  vuexStore.dispatch("callCmmonMethod", { time, to, type: "WEB" });
});

//是否显示按钮
import { hasPermission } from "@/permission/btn";
Vue.prototype.btnShow = hasPermission;
Vue.prototype.hasPermission = hasPermission;

import myXss from "./utils/xss";
Vue.prototype.$xss = val => {
  return myXss.process(val);
};
/* eslint-disable no-new */
new Vue({
  el: "#app",
  router,
  i18n,
  store: vuexStore,
  data: {
    COLLAPSE: false,
    NOW_USER: "" //当前用户信息 [pxmwxxx]xxx
  },
  components: { App },
  template: "<App/>"
});
