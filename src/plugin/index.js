'use strict'
import constant from "../constant"
import api from "../api"
import i18nMixin from "../mixins/i18nMixin";
import http from '../api/http'
import VueAxios from 'vue-axios'
import i18nInput from "../components/i18n/i18n_input";
import pixelStream from "../utils/pixelStream";

export default function install(Vue) {
  // 动态多语言全局函数绑定
  Vue.mixin(i18nMixin)
  // $http请求全局绑定
  Vue.use(VueAxios, http)
  // 多语言配置组件全局注册
  Vue.component(i18nInput.name,i18nInput)
  Object.defineProperties(Vue.prototype, {
    // 调用api全局绑定
    $api: {
      get() {
        return api
      }
    },
    // 通用常量全局绑定
    $const: {
      get() {
        return constant
      }
    },
    // 像素流通信全局绑定
    $pixelStream: {
      get() {
        return pixelStream
      }
    }
  })
  window.pixelStream = pixelStream
}
