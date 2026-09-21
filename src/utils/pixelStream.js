/**
 * 像素流通信全局封装（参考 YJ3DVP/web）
 * 用法：
 *   this.$pixelStream.mount(container)
 *   this.$pixelStream.on('SetMenu', (data) => {})
 *   this.$pixelStream.send('focus', modelId)
 */

export const PIXEL_STREAM_EVENT = {
  SET_MENU: "SetMenu",
  OPEN: "open",
  PROGRESS: "progress",
  USER_INFO: "UserInfo",
  ON_DC_OPEN: "onDcOpen",
  UE_DISCONNECTED: "ueDisConnected",
  CONN_LIMIT: "connLimit",
  SELECT_MESH: "SelectMesh",
  CANCEL_SELECTED_MESH: "CancelSelectedMesh",
  SHOW_DETAILS: "ShowDetails",
  SHOW_ONLINE_MONITORING: "ShowOnlineMonitoring",
  SHOW_CASE: "ShowCase",
  EXIT_SHOW_CASE: "ExitShowCase"
};

export const PIXEL_STREAM_MENU = {
  PIPELINE_NETWORK_PLANT: "PipelineNetwork_Plant",
  NONE: "None"
};

function parseUeMessage(detail) {
  if (detail == null || detail === "") return null;
  let msg = detail;
  if (typeof msg === "string") {
    try {
      msg = JSON.parse(String(msg).replace(/\0/g, "").trim());
    } catch (e) {
      return { event: "raw", data: detail };
    }
  }
  if (!msg || typeof msg !== "object") {
    return { event: "raw", data: msg };
  }
  return msg;
}

function unwrapQuoted(value) {
  return String(value == null ? "" : value)
    .replace(/^["']+|["']+$/g, "")
    .trim();
}

function normalizeMenuKey(data) {
  if (data == null) return "";
  if (typeof data === "object") {
    return unwrapQuoted(data.menu || data.name || data.key || data.data || "");
  }
  return unwrapQuoted(data);
}

function normalizeMeshId(data) {
  if (data == null || data === "") return "";
  if (typeof data === "object") {
    return unwrapQuoted(
      data.meshId ||
        data.modelId ||
        data.pipelineNo ||
        data.modelCode ||
        data.modelNo ||
        data.data ||
        data.id ||
        data.name ||
        ""
    );
  }
  return unwrapQuoted(data);
}

function getNodeMeshId(node) {
  if (!node) return "";
  return normalizeMeshId(
    node.pipelineNo ||
      node.modelCode ||
      node.modelNo ||
      node.nodeName ||
      node.code ||
      node.name
  );
}

function getPixelStreamUrl() {
  const configured =
    process.env.PIXEL_STREAM_URL || process.env.PIXEL_STREAM_PATH || "/pixelStream";
  if (/^wss?:\/\//.test(configured)) return configured;
  const prefix = (typeof window !== "undefined"
    ? window.location.origin
    : ""
  ).replace("http", "ws").replace("https", "wss");
  const path = configured.charAt(0) === "/" ? configured : "/" + configured;
  if (/YJ3DVP/i.test(path)) return prefix + path;
  return prefix + path + "/YJ3DVP";
}

class PixelStreamClient {
  constructor() {
    this.el = null;
    this.container = null;
    this.ready = false;
    this.listeners = {};
    this._nativeHandlers = {};
    this._bindTimer = null;
    this.owned = false;
    this.selectedMeshId = "";
    this.pendingDetail = null;
    this.EVENTS = PIXEL_STREAM_EVENT;
    this.MENUS = PIXEL_STREAM_MENU;
  }

  getUrl() {
    return getPixelStreamUrl();
  }

  normalizeMeshId(data) {
    return normalizeMeshId(data);
  }

  getNodeMeshId(node) {
    return getNodeMeshId(node);
  }

  getElement() {
    return this.el;
  }

  attachElement(el) {
    this.el = el || null;
    this.owned = false;
    if (el) {
      el.enableChinese = true;
      window.pixelStreamRef = el;
      window.ps = el;
    }
    return this;
  }

  isReady() {
    return !!(this.ready && this.el);
  }

  on(event, handler) {
    if (!event || typeof handler !== "function") return this;
    if (!this.listeners[event]) this.listeners[event] = [];
    if (this.listeners[event].indexOf(handler) === -1) {
      this.listeners[event].push(handler);
    }
    return this;
  }

  off(event, handler) {
    if (!event) {
      this.listeners = {};
      return this;
    }
    if (!this.listeners[event]) return this;
    if (!handler) {
      delete this.listeners[event];
      return this;
    }
    this.listeners[event] = this.listeners[event].filter(function(item) {
      return item !== handler;
    });
    return this;
  }

  once(event, handler) {
    const self = this;
    const wrap = function() {
      self.off(event, wrap);
      handler.apply(null, arguments);
    };
    return this.on(event, wrap);
  }

  _emit(event, payload, raw) {
    const list = this.listeners[event];
    if (!list || !list.length) return;
    list.slice().forEach(function(handler) {
      try {
        handler(payload, raw);
      } catch (e) {
        console.error("[pixelStream] listener error:", e);
      }
    });
  }

  getUserInfoPayload() {
    const name =
      (typeof sessionStorage !== "undefined" &&
        (sessionStorage.getItem("user") || sessionStorage.getItem("userName"))) ||
      "admin";
    return {
      id: name,
      name: name,
      fullName: name
    };
  }

  handleMessage(e) {
    const msg = parseUeMessage(e && e.detail);
    if (!msg) return;
    if (
      msg.event === "raw" &&
      (msg.data === true ||
        msg.data === false ||
        msg.data === "true" ||
        msg.data === "false")
    ) {
      return;
    }
    if (msg.event === "input" && typeof msg.data === "boolean") {
      return;
    }
    if (
      msg.event === PIXEL_STREAM_EVENT.USER_INFO ||
      msg.event === "UserInfo" ||
      msg.event === "userInfo"
    ) {
      this.send("userInfo", this.getUserInfoPayload());
    }
    if (msg.event === PIXEL_STREAM_EVENT.SET_MENU) {
      msg.data = normalizeMenuKey(msg.data);
    } else if (
      msg.event === PIXEL_STREAM_EVENT.SELECT_MESH ||
      msg.event === PIXEL_STREAM_EVENT.CANCEL_SELECTED_MESH ||
      msg.event === PIXEL_STREAM_EVENT.SHOW_DETAILS ||
      msg.event === PIXEL_STREAM_EVENT.SHOW_ONLINE_MONITORING ||
      msg.event === PIXEL_STREAM_EVENT.SHOW_CASE ||
      msg.event === PIXEL_STREAM_EVENT.EXIT_SHOW_CASE
    ) {
      msg.data = normalizeMeshId(msg.data);
    }
    this._emit("message", msg, msg);
    if (msg.event) this._emit(msg.event, msg.data, msg);
  }

  bind(el) {
    this.unbind();
    this.el = el || null;
    if (!this.el) return this;
    this.el.enableChinese = true;
    const self = this;
    this._nativeHandlers = {
      message: function(e) {
        self.handleMessage(e);
      },
      onDcOpen: function() {
        self.ready = true;
        self.send(PIXEL_STREAM_EVENT.OPEN, {});
        self._emit(PIXEL_STREAM_EVENT.ON_DC_OPEN, null);
      },
      ueDisConnected: function() {
        self.ready = false;
        self._emit(PIXEL_STREAM_EVENT.UE_DISCONNECTED, null);
      },
      connLimit: function(e) {
        self._emit(PIXEL_STREAM_EVENT.CONN_LIMIT, e && e.detail);
      }
    };
    Object.keys(this._nativeHandlers).forEach(function(name) {
      self.el.addEventListener(name, self._nativeHandlers[name]);
    });
    window.pixelStreamRef = this.el;
    window.ps = this.el;
    return this;
  }

  unbind() {
    const el = this.el;
    const handlers = this._nativeHandlers;
    if (el && handlers) {
      Object.keys(handlers).forEach(function(name) {
        el.removeEventListener(name, handlers[name]);
      });
    }
    this.el = null;
    this.ready = false;
    this._nativeHandlers = {};
    return this;
  }

  findElement() {
    if (this.el && this.el.tagName === "VIDEO") return this.el;
    if (window.pixelStreamRef && window.pixelStreamRef.tagName === "VIDEO") {
      return window.pixelStreamRef;
    }
    if (window.ps && window.ps.tagName === "VIDEO") return window.ps;
    return (
      document.querySelector('video[is="peer-stream"]') ||
      document.querySelector("video.pixelStream") ||
      document.querySelector("video.pixel-stream")
    );
  }

  bindExisting() {
    const el = this.findElement();
    if (!el) return false;
    if (this.el === el) return true;
    this.owned = false;
    this.bind(el);
    return true;
  }

  bindWhenReady(interval) {
    const self = this;
    this.bindExisting();
    if (this._bindTimer) return this;
    this._bindTimer = setInterval(function() {
      self.bindExisting();
    }, interval || 500);
    return this;
  }

  stopBindWatch() {
    if (this._bindTimer) {
      clearInterval(this._bindTimer);
      this._bindTimer = null;
    }
    return this;
  }

  mount(container, url) {
    this.unmount();
    if (!container) return null;
    this.container = container;
    const video = document.createElement("video", { is: "peer-stream" });
    video.id = url || this.getUrl();
    video.setAttribute("idaudio", "");
    video.className = "pixel-stream";
    video.style.cssText =
      "width:100%;height:100%;display:block;object-fit:fill;background:#000;";
    this.owned = true;
    this.bind(video);
    container.appendChild(video);
    if (typeof video.emitMessage !== "function") {
      console.error(
        "[pixelStream] peer-stream 未生效，请确认已加载 static/peer-stream.js"
      );
    }
    return video;
  }

  unmount() {
    const el = this.el;
    const owned = this.owned;
    this.unbind();
    if (owned && el) {
      try {
        if (el.ws && typeof el.ws.close === "function") el.ws.close(1000);
        if (el.pc && typeof el.pc.close === "function") el.pc.close();
      } catch (e) {
        console.warn("[pixelStream] close error:", e);
      }
      if (el.parentNode) el.parentNode.removeChild(el);
    }
    this.owned = false;
    this.container = null;
    return this;
  }

  emitMessage(msg) {
    const el = this.findElement();
    if (!el) {
      console.warn("[pixelStream] 像素流尚未就绪，无法发送", msg);
      return;
    }
    if (this.el !== el) this.attachElement(el);
    if (typeof el.emitMessage !== "function") {
      console.warn("[pixelStream] peer-stream 未生效，无法发送", msg);
      return;
    }
    try {
      return el.emitMessage(msg);
    } catch (e) {
      console.warn("[pixelStream] 发送失败", msg, e);
    }
  }

  send(event, data) {
    if (event && typeof event === "object") {
      return this.emitMessage(event);
    }
    return this.emitMessage({
      event: event,
      data: data == null ? "" : data
    });
  }

  sendSelectMesh(meshId) {
    const id = normalizeMeshId(meshId);
    if (!id) return;
    this.selectedMeshId = id;
    return this.send(PIXEL_STREAM_EVENT.SELECT_MESH, id);
  }

  sendCancelSelectedMesh(meshId) {
    const id = normalizeMeshId(meshId) || this.selectedMeshId;
    if (!id) return;
    if (this.selectedMeshId === id) this.selectedMeshId = "";
    return this.send(PIXEL_STREAM_EVENT.CANCEL_SELECTED_MESH, id);
  }

  sendShowCase(modelNo) {
    const id = unwrapQuoted(modelNo);
    this.selectedMeshId = id;
    if (typeof window !== "undefined" && typeof window.sendShowCase === "function") {
      return window.sendShowCase(id);
    }
    return this.send(PIXEL_STREAM_EVENT.SHOW_CASE, id);
  }

  setPendingDetail(meshId, tab) {
    const id = normalizeMeshId(meshId);
    this.pendingDetail = {
      meshId: id,
      tab: tab || "basic"
    };
    if (id) this.selectedMeshId = id;
    return this.pendingDetail;
  }

  consumePendingDetail() {
    const pending = this.pendingDetail;
    this.pendingDetail = null;
    return pending;
  }
}

const pixelStream = new PixelStreamClient();

export { normalizeMenuKey, normalizeMeshId, getNodeMeshId, getPixelStreamUrl };
export default pixelStream;
