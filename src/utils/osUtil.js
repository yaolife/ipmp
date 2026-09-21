'use strict'
function getOsInfo() {
  var userAgent = navigator.userAgent.toLowerCase();
  var name = "Unknown";
  var version = "Unknown";
  if (userAgent.indexOf("win") > -1) {
    name = "Windows";
    if (userAgent.indexOf("windows nt 5.0") > -1) {
      version = "Windows 2000";
    } else if (
      userAgent.indexOf("windows nt 5.1") > -1 ||
      userAgent.indexOf("windows nt 5.2") > -1
    ) {
      version = "Windows XP";
    } else if (userAgent.indexOf("windows nt 6.0") > -1) {
      version = "Windows Vista";
    } else if (
      userAgent.indexOf("windows nt 6.1") > -1 ||
      userAgent.indexOf("windows 7") > -1
    ) {
      version = "Windows 7";
    } else if (
      userAgent.indexOf("windows nt 6.2") > -1 ||
      userAgent.indexOf("windows 8") > -1
    ) {
      version = "Windows 8";
    } else if (userAgent.indexOf("windows nt 6.3") > -1) {
      version = "Windows 8.1";
    } else if (
      userAgent.indexOf("windows nt 6.2") > -1 ||
      userAgent.indexOf("windows nt 10.0") > -1
    ) {
      version = "Windows 10";
    } else {
      version = "Unknown";
    }
  } else if (userAgent.indexOf("iphone") > -1) {
    name = "Iphone";
  } else if (userAgent.indexOf("mac") > -1) {
    name = "Mac";
  } else if (
    userAgent.indexOf("x11") > -1 ||
    userAgent.indexOf("unix") > -1 ||
    userAgent.indexOf("sunname") > -1 ||
    userAgent.indexOf("bsd") > -1
  ) {
    name = "Unix";
  } else if (userAgent.indexOf("linux") > -1) {
    if (userAgent.indexOf("android") > -1) {
      name = "Android";
    } else {
      name = "Linux";
    }
  } else {
    name = "Unknown";
  }
  return { name, version };
}
function getBrowserInfoString() {
  var agent = navigator.userAgent.toLowerCase();
  // eslint-disable-next-line no-unused-vars
  // var regStr_ie = /msie [\d.]+;/gi
  var regStrFf = /firefox\/[\d.]+/gi;
  var regStrChrome = /chrome\/[\d.]+/gi;
  var regStrSaf = /safari\/[\d.]+/gi;
  var regStrEdge = /edge\/[\d.]+/gi;
  var isIE = agent.indexOf("compatible") > -1 && agent.indexOf("msie" > -1); // 判断是否IE<11浏览器
  var isEdge = agent.indexOf("edge") > -1 && !isIE; // 判断是否IE的Edge浏览器
  var isIE11 = agent.indexOf("trident") > -1 && agent.indexOf("rv:11.0") > -1;
  if (isIE) {
    var reIE = new RegExp("msie (\\d+\\.\\d+);");
    reIE.test(agent);
    var fIEVersion = parseFloat(RegExp.$1);
    if (fIEVersion === 7) {
      return "IE/7";
    } else if (fIEVersion === 8) {
      return "IE/8";
    } else if (fIEVersion === 9) {
      return "IE/9";
    } else if (fIEVersion === 10) {
      return "IE/10";
    } else {
      return "IE/0";
    }
  } // isIE end
  if (isIE11) {
    return "IE/11";
  }
  var res = "";
  if (isEdge) {
    res = agent.match(regStrEdge);
    if (
      res &&
      (res instanceof Array ||
        Object.prototype.toString.call(res) === "[object Array]") &&
      res.length > 0
    ) {
      return res[0];
    } else {
      return res;
    }
  }
  // 中广核浏览器 / 奇安信浏览器
  if (agent.indexOf("360ent") > 0 || agent.indexOf("qaxbrowser") > 0) {
    return 'cgnLlq'
  }
  // firefox
  if (agent.indexOf("firefox") > 0) {
    res = agent.match(regStrFf);
    if (
      res &&
      (res instanceof Array ||
        Object.prototype.toString.call(res) === "[object Array]") &&
      res.length > 0
    ) {
      return res[0];
    } else {
      return res;
    }
  }
  // Safari
  if (agent.indexOf("safari") > 0 && agent.indexOf("chrome") < 0) {
    res = agent.match(regStrSaf);
    if (
      res &&
      (res instanceof Array ||
        Object.prototype.toString.call(res) === "[object Array]") &&
      res.length > 0
    ) {
      return res[0];
    } else {
      return res;
    }
  }
  // Chrome
  if (agent.indexOf("chrome") > 0) {
    res = agent.match(regStrChrome);
    if (
      res &&
      (res instanceof Array ||
        Object.prototype.toString.call(res) === "[object Array]") &&
      res.length > 0
    ) {
      return res[0];
    } else {
      return res;
    }
  }


}
function getBrowserInfo() {
  var Sys = {};
  var infoStr = getBrowserInfoString();
  if (infoStr && infoStr != "" && infoStr.indexOf("/")) {
    var browserInfo = infoStr.split("/");
    if (browserInfo && browserInfo.length == 2) {
      Sys.browser = browserInfo[0];
      Sys.ver = browserInfo[1];
    } else {
      Sys.browser = "error";
      Sys.ver = "error";
    }
  } else {
    Sys.browser = "unknown";
    Sys.ver = "unknown";
  }
  return Sys;
}
export default {
  getOsInfo: getOsInfo,
  getBrowserInfo: getBrowserInfo,
  getBrowserInfoString
};
