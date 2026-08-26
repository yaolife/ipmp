/*
 * @Author: P623437
 * @Date: 2021-09-09 18:00:38
 * @LastEditors: Yin Rui Xue P644244@gnpjvc.com.cn
 * @LastEditTime: 2025-06-24 10:11:53
 * @Description:
 */
import Vue from "vue";
import vuex from "vuex";

Vue.use(vuex);

import menu from "./modules/menu";
import user from "./modules/user";
import app from "./modules/app";
import proc from "./modules/proc";
import lightAuth from "./modules/lightAuth";
import buriedCode from "./modules/buriedCode";
// import chart from "@report/store"
// import designer from "@report/store/modules/designer"
// import dashboard from 'dashPackages/js/store'
const store = new vuex.Store({
  modules: {
    menu,
    user,
    app,
    proc,
    lightAuth,
    buriedCode
    // chart,
    // designer,
    // dashboard
  }
});

export default store;

// i18n 模块会间接引用 http/router，必须在 store 导出后再加载，避免循环依赖导致 store 为 undefined
const i18nModule = require("./modules/i18n");
store.registerModule("i18n", i18nModule.default || i18nModule);
