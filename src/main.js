/*
 * @Author: [P631038]杨旭
 * @Date: 2024-11-08 17:14:00
 * @LastEditors: [P631038]杨旭
 * @LastEditTime: 2026-01-06 16:27:18
 * @FilePath: \4.2.0-node16\cud4demo-ui\src\main.js
 * @Description:
 */
import Vue from "vue";
import VueI18n from "vue-i18n";
import App from "./App";
import router from "./router";
import ElementUI from "element-ui";

import enLocale from "element-ui/lib/locale/lang/en";
import zhLocale from "element-ui/lib/locale/lang/zh-CN";
import axios from "axios";
import VueAxios from "vue-axios";
import url from "@/api/api";
import store from "./store";
import Vue2OrgTree from "vue2-org-tree";
Vue.use(Vue2OrgTree);
import dragMove from "./utils/dragMove"; // 支持弹窗移动
Vue.use(dragMove);
import EventBusPlugin from "./utils/eventBus"; // 编辑画布通信
Vue.use(EventBusPlugin);
import { hasMenuPermission } from "@/permission/menu";
import Avue from "@smallwei/avue";
import "@smallwei/avue/lib/index.css";
Vue.use(Avue, { size: "medium", menuType: "text" });
import plugin from "./plugin";
import { getUserInfo, getMenuPermission } from "@/api/api";
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

// 添加Vue router整合
for (let routerFunc of WorkflowModule.routerDefine.Func) {
  router.addRoute("manage", routerFunc);
}
for (let routerForm of WorkflowModule.routerDefine.Form) {
  router.addRoute("manage", routerForm);
}
for (let routerRule of WorkflowModule.routerDefine.Rule) {
  router.addRoute("manage", routerRule);
}
for (let routerPrintTemp of WorkflowModule.routerDefine.PrintTemp) {
  router.addRoute("manage", routerPrintTemp);
}
for (let routerWorkbench of WorkflowModule.routerDefine.Workbench) {
  router.addRoute("manage", routerWorkbench);
}
for (let routerNewWorkbench of WorkflowModule.routerDefine.NewWorkflowRouter) {
  router.addRoute("manage", routerNewWorkbench);
}
for (let routerDataModel of WorkflowModule.routerDefine.DataModelRouter) {
  router.addRoute("manage", routerDataModel);
}
for (let routerWorkflow of WorkflowModule.routerDefine.WorkflowRouter) {
  router.addRoute("manage", routerWorkflow);
}

//添加Vuex的整合
store.registerModule("workflow", WorkflowModule.store.workflowStore);
store.registerModule("form", WorkflowModule.store.formStore);

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
for (let routerSmartForm of smartFormModule.router) {
  router.addRoute("manage", routerSmartForm);
}

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
  // 解决首次进入时会显示页面再刷新的问题,直接同步加载,401跳转4A
  // 解耦版不执行该操作
  if (process.env.AUTH_TYPE === "AEP" && !sessionStorage.getItem("user")) {
    await getUserInfo({
      t: Math.random()
    }).then(result => {
      sessionStorage.setItem("user", result.data.data.nowUserName);
      sessionStorage.setItem("userDept", result.data.data.userDeptName);
      sessionStorage.setItem("userDeptId", result.data.data.userDeptId);
    });
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
  } else {
    let user = sessionStorage.getItem("user");
    let userId = user.substr(1, user.indexOf("]") - 1);
    if (process.env.AUTH_TYPE !== "PRO") {
      if (sessionStorage.getItem("menus")) {
        if (hasMenuPerm(to.meta)) {
          next();
        } else {
          next("/404");
        }
      } else {
        getMenuPermission(userId).then(async result => {
          store.commit("setNavTree", result.data.data);
          sessionStorage.setItem("menus", JSON.stringify(result.data.data));
          if (hasMenuPerm(to.meta)) {
            next();
          } else {
            next("/404");
          }
        });
      }
    } else {
      //正常的页面跳转
      if (hasMenuPerm(to.meta)) {
        next();
      } else {
        next("/404");
      }
    }
  }
});

const startTime = performance.now();

//全局守卫
router.afterEach((to, from, next) => {
  const endTime = performance.now();
  const time = (endTime - startTime) / 1000;
  store.dispatch("callCmmonMethod", { time, to, type: "WEB" });
});

function hasMenuPerm(url) {
  return hasMenuPermission(url);
}
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
  store,
  data: {
    COLLAPSE: false,
    NOW_USER: "" //当前用户信息 [pxmwxxx]xxx
  },
  components: { App },
  template: "<App/>"
});
