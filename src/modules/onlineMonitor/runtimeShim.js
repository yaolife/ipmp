/**
 * 趋势画布引擎依赖的全局：轻量事件封装、$config、$utils。
 * 画布脚本按非严格模式读取这些全局，不引入 jQuery / layer。
 */
var handlerKey = "_ipmpTrendJq";

function handlerMap(el) {
  if (!el[handlerKey]) {
    el[handlerKey] = {};
  }
  return el[handlerKey];
}

function addHandler(el, type, fn) {
  var map = handlerMap(el);
  if (!map[type]) {
    map[type] = [];
  }
  map[type].push(fn);
  el.addEventListener(type, fn);
}

function removeHandler(el, type, fn) {
  var map = el[handlerKey];
  if (!map || !map[type]) {
    return;
  }
  var list = map[type].slice();
  for (var i = 0; i < list.length; i++) {
    if (!fn || list[i] === fn) {
      el.removeEventListener(type, list[i]);
      var idx = map[type].indexOf(list[i]);
      if (idx >= 0) {
        map[type].splice(idx, 1);
      }
    }
  }
}

function wrap(els) {
  var api = {
    unbind: function(type, fn) {
      els.forEach(function(el) {
        if (!type) {
          var map = el[handlerKey] || {};
          Object.keys(map).forEach(function(name) {
            removeHandler(el, name);
          });
          return;
        }
        removeHandler(el, type, fn);
      });
      return api;
    },
    off: function(types) {
      String(types || "")
        .split(/\s+/)
        .forEach(function(type) {
          if (type) {
            api.unbind(type);
          }
        });
      return api;
    },
    on: function(types, fn) {
      if (types && typeof types === "object") {
        Object.keys(types).forEach(function(type) {
          api.on(type, types[type]);
        });
        return api;
      }
      String(types || "")
        .split(/\s+/)
        .forEach(function(type) {
          if (!type) {
            return;
          }
          els.forEach(function(el) {
            addHandler(el, type, fn);
          });
        });
      return api;
    },
    bind: function(types, fn) {
      return api.on(types, fn);
    },
    resize: function(fn) {
      return api.on("resize", fn);
    }
  };
  return api;
}

function $(sel) {
  if (sel === window || sel === document) {
    return wrap([sel]);
  }
  if (typeof sel === "string") {
    if (sel.charAt(0) === "#") {
      var el = document.getElementById(sel.slice(1));
      return wrap(el ? [el] : []);
    }
    if (sel === "window") {
      return wrap([window]);
    }
    if (sel === "body") {
      return wrap([document.body]);
    }
  }
  if (sel && sel.addEventListener) {
    return wrap([sel]);
  }
  return wrap([]);
}

function pad(n) {
  return n < 10 ? "0" + n : "" + n;
}

function formatDate(dateInput) {
  var date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    return "";
  }
  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    " " +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes()) +
    ":" +
    pad(date.getSeconds())
  );
}

if (!Date.prototype.pattern) {
  Date.prototype.pattern = function(fmt) {
    fmt = fmt || "yyyy-MM-dd HH:mm:ss";
    var o = {
      "M+": this.getMonth() + 1,
      "d+": this.getDate(),
      "H+": this.getHours(),
      "h+": this.getHours() % 12 === 0 ? 12 : this.getHours() % 12,
      "m+": this.getMinutes(),
      "s+": this.getSeconds(),
      "q+": Math.floor((this.getMonth() + 3) / 3),
      S: this.getMilliseconds()
    };
    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        (this.getFullYear() + "").substr(4 - RegExp.$1.length)
      );
    }
    for (var k in o) {
      if (new RegExp("(" + k + ")").test(fmt)) {
        fmt = fmt.replace(
          RegExp.$1,
          RegExp.$1.length === 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)
        );
      }
    }
    return fmt;
  };
}

if (!String.prototype.dotClear) {
  String.prototype.dotClear = function() {
    var text = String(this);
    var index = text.indexOf(".");
    if (index < 0) {
      return text;
    }
    return text.slice(0, index + 1) + text.slice(index + 1).replace(/\./g, "");
  };
}

window.$ = window.$ || $;
window.$config = window.$config || {
  "trend.mode": "plot",
  "more.defaultFM": 2,
  "trend.showIntervalInput": false
};
window.$utils = window.$utils || {
  formatDate: formatDate,
  dateFormat: function(ms, format) {
    var date = new Date(ms);
    if (isNaN(date.getTime())) {
      return "";
    }
    if (date.pattern) {
      return date.pattern(format || "yyyy-MM-dd HH:mm:ss");
    }
    return formatDate(date);
  },
  getUrlParms: function() {
    return {};
  }
};
window.thisVue = window.thisVue || null;
window.trendGroup = window.trendGroup || null;
