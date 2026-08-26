import axios from "axios";
import ht from "@/api/http";

// AEPGW_REST_API_ROOT: '"https://aepgw-t.gnpjvc.cgnpc.com.cn/"',
// AEPGATEWAY_REST_API_ROOT: '"https://aepgateway/"',
// CSP_REST_API_ROOT: '"https://cspadmin-back-t/"'

let aep_omscenter_rest_api;
let aepgw_rest_api;
let aep_rest_api;
let aepgateway_rest_api;
let csp_rest_api;
/*-------------------------------单点登录组件-------------------------------------*/
let aep_cas;
let aep_sso;
let aep_sso_login;
let active_fe = "";
let that = "";
axios.defaults.timeout = 1000000;
axios.defaults.withCredentials = true;

axios.interceptors.response.use(
  data => {
    if (data.status && data.status === 200 && data.data.status === "error") {
      return;
    }
    return data;
  },
  error => {
    if (error && error.response) {
      switch (error.response.status) {
        case 400:
          error.message = "请求错误(400)";
          break;
        case 401:
          error.message = "未授权,请重新登录(401),正在尝试重新登录";
          // return Message.info(error.message);
          break;
        case 403:
          error.message = "拒绝访问(403)";
          break;
        case 404:
          error.message = "请求出错(404)";
          break;
        case 405:
          error.message = "请求方法未允许(405)";
          break;
        case 408:
          error.message = "请求超时(408)";
          break;
        case 500:
          if (
            error.response.data.exception &&
            error.response.data.exception.indexOf("上级领导") != -1
          ) {
            error.message = "上级领导为空";
          } else {
            error.message = "服务器端出错(500)";
          }
          break;
        case 501:
          error.message = "网络未实现(501)";
          break;
        case 502:
          error.message = "网络错误(502)";
          break;
        case 503:
          error.message = "服务不可用(503)";
          break;
        case 504:
          error.message = "网络超时(504)";
          break;
        case 505:
          error.message = "HTTP版本不支持该请求(505)";
          break;
        default:
          error.message = `连接错误${error.response.status}`;
      }
    } else {
      error.message = "连接到服务器失败";
    }
    return Promise.reject(error.message);
  }
);

let ajax = {
  post(url, data) {
    return axios({
      method: "post",
      url,
      data
    }).then(function (response) {
      if (parseInt(response.data.code) === 200) {
        return response.data;
      } else {
        return response.data && response.data;
      }
    });
  },
  get(url, data) {
    return axios({
      method: "get",
      url,
      data
    }).then(function (response) {
      if (parseInt(response.data.code) === 200) {
        return response.data;
      } else {
        outputErrorLog(url, response.data.msg);
        return response.data && response.data;
      }
    });
  },
  tget(url, data) {
    return axios.get(url).then(function (response) {
      return response;
    });
  },
  tpost(url, data) {
    return axios.post(url, data).then(function (response) {
      return response;
    });
  }
};
export default {
  getEnvType() {
    switch (window.location.origin) {
      // 开发環境
      case "http://aep-d.gnpjvc.cgnpc.com.cn":
        active_fe = "test";
        break;
      // 开发環境
      case "https://aep-d.gnpjvc.cgnpc.com.cn":
        active_fe = "test";
        break;
      // 測試環境
      case "https://aep-d":
        active_fe = "test";
        break;
      // 測試環境
      case "http://aep-d":
        active_fe = "test";
        break;

      // 开发環境
      case "http://aep-t.gnpjvc.cgnpc.com.cn":
        active_fe = "test";
        break;
      // 开发環境
      case "https://aep-t.gnpjvc.cgnpc.com.cn":
        active_fe = "test";
        break;
      // 測試環境
      case "https://aep-t":
        active_fe = "test";
        break;
      // 測試環境
      case "http://aep-t":
        active_fe = "test";
        break;

      // 开发環境
      case "http://aep-p.gnpjvc.cgnpc.com.cn":
        active_fe = "stage";
        break;
      // 开发環境
      case "https://aep-p.gnpjvc.cgnpc.com.cn":
        active_fe = "stage";
        break;
      // 開發環境
      case "https://aep-p":
        active_fe = "stage";
        break;
      // 開發環境
      case "http://aep-p":
        active_fe = "stage";
        break;

      // 生产環境
      case "http://aep.gnpjvc.cgnpc.com.cn":
        active_fe = "online";
        break;
      // 开发環境
      case "https://aep.gnpjvc.cgnpc.com.cn":
        active_fe = "online";
        break;
      case "https://aep":
        active_fe = "online";
        break;
      case "http://aep":
        active_fe = "online";
        break;
      default:
        active_fe = "test";
    }
    /*---------------依据global.js设置的环境参数加载对应环境全局配置信息-------------------*/
    if (
      typeof active_fe != "undefined" &&
      active_fe != "" &&
      active_fe == "dev"
    ) {
      aep_omscenter_rest_api = "http://localhost:35020/omscenter/";
      //aepgw_rest_api ="http://aepgw-d.gnpjvc.cgnpc.com.cn/";
      aep_rest_api = "http://localhost:35020/";
      aepgateway_rest_api = "http://aepgateway/";
      csp_rest_api = "https://cspadmin-back-t/";
      /*-------------------------------单点登录组件---------------------------------*/
      aep_cas = "http://localhost:35020/login/cas";
      aep_sso = "http://localhost:35020/sso/getUserDetail";
      aep_sso_login = "http://localhost:35020/omscenter/getUserDetail";
    } else if (
      typeof active_fe != "undefined" &&
      active_fe != "" &&
      active_fe == "test"
    ) {
      aep_omscenter_rest_api = "https://aep-t.gnpjvc.cgnpc.com.cn/omscenter/";
      //aepgw_rest_api ="https://aepgw-t.gnpjvc.cgnpc.com.cn/";
      aep_rest_api = "https://aep-t.gnpjvc.cgnpc.com.cn/";
      aepgateway_rest_api = "https://aepgateway/";
      csp_rest_api = "https://cspadmin-back-t/";
      /*-------------------------------单点登录组件---------------------------------*/
      aep_cas = "https://aep-t.gnpjvc.cgnpc.com.cn/login/cas";
      aep_sso = "https://aep-t.gnpjvc.cgnpc.com.cn/sso/getUserDetail";
      aep_sso_login =
        "https://aep-t.gnpjvc.cgnpc.com.cn/omscenter/getUserDetail";
    } else if (
      typeof active_fe != "undefined" &&
      active_fe != "" &&
      active_fe == "stage"
    ) {
      aep_omscenter_rest_api = "https://aep-p.gnpjvc.cgnpc.com.cn/omscenter/";
      // aepgw_rest_api ="https://aepgw-p.gnpjvc.cgnpc.com.cn/";
      aep_rest_api = "https://aep-p.gnpjvc.cgnpc.com.cn/";
      aepgateway_rest_api = "https://aepgateway/";
      csp_rest_api = "https://cspadmin-back-p/";
      /*-------------------------------单点登录组件---------------------------------*/
      aep_cas = "https://aep-p.gnpjvc.cgnpc.com.cn/login/cas";
      aep_sso = "https://aep-p.gnpjvc.cgnpc.com.cn/sso/getUserDetail";
      aep_sso_login =
        "https://aep-p.gnpjvc.cgnpc.com.cn/omscenter/getUserDetail";
    } else if (
      typeof active_fe != "undefined" &&
      active_fe != "" &&
      active_fe == "online"
    ) {
      aep_omscenter_rest_api = "https://aep.gnpjvc.cgnpc.com.cn/omscenter/";
      //aepgw_rest_api ="https://aepgw.gnpjvc.cgnpc.com.cn/";
      aep_rest_api = "https://aep.gnpjvc.cgnpc.com.cn/";
      aepgateway_rest_api = "https://aepgateway/";
      csp_rest_api = "https://cspadmin-back/";
      /*-------------------------------单点登录组件---------------------------------*/
      aep_cas = "https://aep.gnpjvc.cgnpc.com.cn/login/cas";
      aep_sso = "https://aep.gnpjvc.cgnpc.com.cn/sso/getUserDetail";
      aep_sso_login = "https://aep.gnpjvc.cgnpc.com.cn/omscenter/getUserDetail";
    } else {
      console.log(
        "获取部署环境参数异常，请检查global.js部署参数设置！！" +
        "或者检查是否引用global.js,且必须先于restfulapi_url.js引用！！"
      );
    }
    return aep_sso;
  },
  getEnvType2() {
    let evnStr = envConfig.NODE_ENV;
    if (evnStr === "development") {
      active_fe = "dev";
    } else if (evnStr === "test") {
      active_fe = "test";
    } else if (evnStr === "pre") {
      active_fe = "stage";
    } else if (evnStr === "production") {
      active_fe = "stage";
    } else {
      active_fe = "online";
    }
    aep_omscenter_rest_api = envConfig.AEP_REST_API_ROOT + "/omscenter/";
    // aepgw_rest_api = envConfig.AEPGW_REST_API_ROOT
    // aep_rest_api = envConfig.AEP_REST_API_ROOT + "/"
    // aepgateway_rest_api = envConfig.AEPGATEWAY_REST_API_ROOT
    // csp_rest_api = envConfig.CSP_REST_API_ROOT
    /*-------------------------------单点登录组件---------------------------------*/
    // aep_cas = envConfig.AEP_REST_API_ROOT + "/login/cas";
    // aep_sso = envConfig.AEP_REST_API_ROOT + "/sso/getUserDetail";
    // aep_sso_login = envConfig.AEP_REST_API_ROOT + "/omscenter/getUserDetail";
    return aep_omscenter_rest_api;
  },
  /*-------------------------------人资中心接口-------------------------------------*/
  // 加载部门信息树【仅组织机构组件使用】
  getOrgTreeForHr(params) {
    const { deptNo, keyword } = params;
    let url = "";
    if (keyword) {
      url =
        aep_omscenter_rest_api +
        `getOrgTreeForHr?deptNo=${deptNo}&keyword=${keyword}`;
    } else {
      url = aep_omscenter_rest_api + `getOrgTreeForHr?deptNo=${deptNo}`;
    }

    return ajax.post(url).then(res => res.data);
  },
  // 根据部门ID获取当前部门下人员信息结果集。 aep_omscenter_rest_api_getStaffsByOrgId
  getStaffsByOrgIdHr(params) {
    const { deptNo, keyword } = params;
    //兼容IE浏览器，IE浏览器在URL上传递中文参数不会自动编码，使用encodeURI进行编码。其他浏览器会自动进行编码
    let keyWordEncode = encodeURI(keyword);
    const url =
      aep_omscenter_rest_api +
      `getStaffsByOrgIdHr?deptNo=${deptNo}&keyword=${keyWordEncode}`;
    return ajax.post(url);
  },
  // 根据员工信息关键字查询人员信息结果集
  getStaffsByKeyWordHr: aep_omscenter_rest_api + "getStaffsByKeyWordHr",
  // 根据部门信息关键字查询部门
  getOrgByKeyWordHr: aep_omscenter_rest_api + "getOrgByKeyWordHr",
  // 判断获取权限
  queryAuthority: aep_omscenter_rest_api + "queryAuthority",
  //调用选人组件时存储window.location数据
  aep_omscenter_rest_api_insertPickPersonRequestMessages:
    aep_omscenter_rest_api + "insertPickPersonRequestMessages",
  //查询选人组件调用数据
  aep_omscenter_rest_api_queryPickPersonList:
    aep_omscenter_rest_api + "queryPickPersonList",
  //根据多个员工号查询
  getStaffsByStaffNosHr(params) {
    const { ids } = params;
    const url =
      aep_omscenter_rest_api + `getStaffsByStaffNosHr?staffNos=${ids}`;
    return ajax.post(url).then(res => res.data);
  },
  getUrlParam(paramName) {
    var reg = new RegExp("(^|&)" + paramName + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) {
      return decodeURI(r[2]);
    } else {
      return null;
    }
  },
  getActiveEnv() {
    return active_fe;
  },
  checkAuthority(params_1) {
    let queryAuthority = aep_omscenter_rest_api + "queryAuthority";
    let authorityUrl =
      queryAuthority +
      "?appCode=" +
      params_1.appCode +
      "&domain=" +
      params_1.domain;
    //权限校验
    return ajax.post(authorityUrl);
  },
  insertPickPersonRequestMessages() {
    let aep_omscenter_rest_api_insertPickPersonRequestMessages =
      aep_omscenter_rest_api + "insertPickPersonRequestMessages";
    ajax.post(aep_omscenter_rest_api_insertPickPersonRequestMessages);
  },

  //   加载部门信息树
  getOrgTreeForOrgWidget(params) {
    //解耦版本
    return ht.post("/hrcenter/getOrgTreeForOrgWidget", params);
  },
  //   获取人员信息
  getStaffsByOrgId(params) {
    //解耦版本
    return ht.post("/hrcenter/getStaffsByOrgId", params);
  },
  //   获取多个人员信息
  getStaffTysInfos(params) {
    //解耦版本
    if (process.env.AUTH_TYPE !== "AEP")
      return ht.post("/hrcenter/getStaffTysInfo", { userId: params.userId });
    else
      return ht.post("/hrcenter/getStaffTysInfo", params);
  },
  // 根据部门信息关键字查询部门
  getOrgByKeyWord(params) {
    return ht.post("/hrcenter/getOrgByKeyWord", params);
  },
  // 清除选择记录
  userHistoryClear(params) {
    return ht.post("/selection-user-history/clear", params);
  },
  // 获取最近选择的人员
  userGetRecentHistory(params) {
    return ht.post("/selection-user-history/getRecentHistory", params);
  },
  // 记录用户选择记录
  userRecord(params) {
    return ht.post("/selection-user-history/record", params);
  },

};
