/**
 * ajax请求配置
 */
import axios from 'axios'
import Vue from 'vue'

function unwrapModule(mod) {
  if (!mod) return mod;
  if (mod.default) return mod.default;
  if (mod.a && (mod.a.state || mod.a.currentRoute || typeof mod.a.registerModule === "function")) {
    return mod.a;
  }
  return mod;
}

function getStore() {
  return unwrapModule(require('@/store'));
}

function getRouter() {
  return unwrapModule(require('../router'));
}

let vm = new Vue();
let _this = this;
var instance = axios.create({});
// axios默认配置
instance.defaults.timeout = 1000000;   // 超时时间 
instance.defaults.baseURL = process.env.API_ROOT;  // 默认地址
instance.defaults.withCredentials = true;
instance.defaults.crossDomain = true;

// 管网业务接口前缀：内网为空，外网为 /api，见 config/*.env.js 的 BIZ_API_PREFIX
var BIZ_API_PREFIX = process.env.BIZ_API_PREFIX || "";
var BIZ_API_PATHS = [
  "/pipeline-components",
  "/sys-files",
  "/model-resources",
  "/model-resource-items",
  "/model-resource-directories",
  "/pipelines",
  "/tm01-assessments",
  "/tm02-assessments",
  "/tm05-assessments",
  "/lof-ledger"
];

function withBizApiPrefix(url) {
  if (!BIZ_API_PREFIX || !url) return url;
  var qIndex = url.indexOf("?");
  var path = qIndex === -1 ? url : url.slice(0, qIndex);
  var query = qIndex === -1 ? "" : url.slice(qIndex);
  if (path.indexOf(BIZ_API_PREFIX + "/") === 0 || path === BIZ_API_PREFIX) {
    return url;
  }
  var matched = BIZ_API_PATHS.some(function(p) {
    return path === p || path.indexOf(p + "/") === 0;
  });
  if (!matched) return url;
  return BIZ_API_PREFIX + (path.charAt(0) === "/" ? path : "/" + path) + query;
}

let loadInstance = null;
// 路由请求拦截
// http request 拦截器
instance.interceptors.request.use(
  config => {
    if (envConfig) {
      config.baseURL = envConfig.API_ROOT
    }
    let locationHref = sessionStorage.getItem('locationHref');
    if (locationHref && getRouter().currentRoute.path === '/welcome') {
      //登录页面不做跳转
      //解决静态扫描问题，当前URL域与跳转前记录的URL域一致时才跳转，防止被篡改跳转
      if (location.href.indexOf("/#/login") === -1 && isVaildPath(locationHref)) {
        // window.open(locationHref, '_self')
        //location.href = locationHref;
        this.$router.push(locationHref)
        //清空记录的URL
        sessionStorage.setItem('locationHref', '');
      }
    }
    // 加载效果启动
    // loadInstance = Loading.service();
    //中英文
    let url = config.url;
    url = withBizApiPrefix(url);
    // config.url = url.indexOf('?') == '-1' ? url + '?_=' + new Date().getTime() : url + '&_=' + new Date().getTime();
    let lang = getStore().state.i18n.language;
    var currentLocale = sessionStorage.getItem("locale");
    config.url = url.indexOf('?') == '-1' ? url + '?_=' + new Date().getTime() + '&lang=' + lang : url + '&_=' + new Date().getTime() + '&lang=' + lang;

    config.headers['X-Requested-With'] = 'XMLHttpRequest';
    config.headers['locale'] = currentLocale;
    config.metadata = { starttime: new Date(), apiTitle: config.apiTitle ? config.apiTitle : "未设置" }
    //解耦版本
    if (process.env.AUTH_TYPE !== "AEP") {
      //带入token
      let token = sessionStorage.getItem("token");
      if (token !== null) config.headers['token'] = token;
    }
    //携带menuCode 菜单唯一标识参数
    config.headers["menuCode"] = sessionStorage.getItem("menuCode");
    return config;
  },
  error => {
    return Promise.resolve(error);
  });

// 路由响应拦截
// http response 拦截器
instance.interceptors.response.use(
  response => {
    return response;
    // if (sessionStorage.getItem('hrefFlag') === 'false') {
    //   window.location.href = sessionStorage.getItem('href')
    // }
    // sessionStorage.setItem('hrefFlag', true)

    //判断是否为导出excel
    // if (response.status == "200" && response.data.type == "application/vnd.ms-excel") {
    //   return response;
    // }
    // if (response.status == "200" && (response.data.code == "0" || response.data.code == "01")) {
    //   return response;
    // } else {
    //   vm.$alert(response.data.msg, "提示");
    // }
  },
  error => {
    // 接口401没有权限的时候:
    if (error.response && error.response.status == 401) {

      // 邮件功能
      // 登录页面不记录
      if (location.href.indexOf("/#/login") === -1 && getRouter().currentRoute.fullPath) {
        sessionStorage.setItem('locationHref', getRouter().currentRoute.fullPath);
      }
      sessionStorage.removeItem('user');
      // PRO是否是解耦版本
      if (process.env.AUTH_TYPE !== "AEP") {
        window.location.href = '/#/login';
      } else {
        // 4A认证登录
        // const href = `${process.env.API_ROOT}/login/cas?customUrl=${window.location.href}`;
        // const href = `${envConfig.API_ROOT}/login/cas?customUrl=${getSecureCurrentUrl()}`;
        // window.location.href = href;
        const safeUrl = getSecureCurrentUrl();
        const href = `${envConfig.API_ROOT}/login/cas?customUrl=${encodeURIComponent(safeUrl)}`;
        window.location.href = href;
      }
    } else if (error.response && (error.response.status == 404 || error.response.status == 405 || error.response.status == 500)) {
      // 后端未部署时不打断页面，仅输出日志
      console.warn("接口错误，状态码: " + error.response.status, error.config && error.config.url);
    } else if (process.env.NODE_ENV !== "development") {
      console.warn("接口错误", error);
    }
    return Promise.reject(error); // 返回接口返回的错误信息
  });

//路径验证函数
function isVaildPath(path) {
  return /^[\/a-zA-Z0-9\-_?=&]*$/.test(path) && !path.includes('//') && !path.startsWith('javascript:') && !path.startsWith('data:') && !path.startsWith('vbscript:');
}

//4A认证登录安全防护
// function getSecureCurrentUrl() {
//   const currentUrl = window.location.href
//   //同源验证
//   if (!currentUrl.startsWith(window.location.origin)) {
//     return window.location.origin
//   }
//   //防止Javascript:和data:协议
//   if (currentUrl.toLowerCase().indexOf('javascript:') > -1 || currentUrl.toLowerCase().indexOf('data:') > -1) {
//     return window.location.origin
//   }
//   //防止明显的XSS payload
//   const xssPatterns = [
//     /<script/i,
//     /on\w+\s*=/i,
//     /javascript:/i,
//     /eval\(/i
//   ]
//   let decodedUrl = decodeURIComponent(currentUrl)
//   for (const pattern of xssPatterns) {
//     if (pattern.test(decodedUrl)) {
//       return window.location.origin
//     }
//   }

//   return currentUrl
// }
function getSecureCurrentUrl() {
  try {
    const url = new URL(window.location.href);

    // 严格同源校验（最安全）
    if (url.origin !== window.location.origin) {
      return window.location.origin;
    }

    // 禁止危险协议
    if (url.protocol === 'javascript:' || url.protocol === 'data:') {
      return window.location.origin;
    }

    // 可选：禁止包含明显恶意特征（额外加固）
    const blacklist = /<script|on\w+\s*=|javascript:|eval\(/i;
    if (blacklist.test(url.href)) {
      return window.location.origin;
    }

    return url.href;
  } catch (e) {
    return window.location.origin;
  }
}
export default instance;
