<template>
  <div class="screen-page">
    <pixel-stream-loading
      v-if="!loaded"
      :progress="progress"
      :text="loadingTitle"
      :hint="loadingHint"
    ></pixel-stream-loading>
    <div class="screen-scene">
      <div class="videoWrapper" ref="videoWrapper"></div>
    </div>
    <div class="screen-left" v-show="loaded && treeVisible">
      <model-tree-panel
        ref="treePanel"
        @loaded="onTreeLoaded"
        @select="onTreeSelect"
        @unselect="onTreeUnselect"
        @close="onTreeClose"
      ></model-tree-panel>
    </div>
    <button
      v-if="loaded && treeVisible"
      type="button"
      class="admin-entry"
      @click="goAdminBackend"
    >
      <i
        class="admin-entry-icon"
        :style="{
          WebkitMaskImage: 'url(' + adminEntryIcon + ')',
          maskImage: 'url(' + adminEntryIcon + ')'
        }"
      ></i>
      <span>{{ $t("lang.screen_admin_entry") }}</span>
    </button>
    <div class="screen-right" v-show="loaded && detailVisible">
      <asset-detail-panel
        ref="detailPanel"
        :visible="detailVisible"
        :pipeline-id="pipelineId"
        :directory-path="directoryPath"
        @close="detailVisible = false"
      ></asset-detail-panel>
    </div>
  </div>
</template>

<script>
import api from "@/modules/drafts/api";
import ModelTreePanel from "./components/ModelTreePanel.vue";
import AssetDetailPanel from "./components/AssetDetailPanel.vue";
import PixelStreamLoading from "./components/Loading.vue";
import adminEntryIcon from "@/assets/img/admin-entry.png";

export default {
  name: "DigitalTwinScreen",
  components: {
    ModelTreePanel,
    AssetDetailPanel,
    PixelStreamLoading
  },
  data() {
    return {
      treeData: [],
      currentNode: null,
      directoryPath: [],
      pipelineId: "",
      detailVisible: false,
      treeVisible: false,
      syncingFromUe: false,
      currentMeshId: "",
      userInfoLoading: true,
      loaded: false,
      progress: 0,
      pixelStreamRef: null,
      loadingHint: "",
      adminEntryIcon: adminEntryIcon
    };
  },
  computed: {
    pixelStreamUrl() {
      return this.$pixelStream.getUrl();
    },
    loadingTitle() {
      const meta = this.$route.meta;
      if (meta && typeof meta === "object" && meta.title) {
        return meta.title;
      }
      return "阳江核电融合定位可视化平台";
    }
  },
  watch: {
    pixelStreamRef(el) {
      if (!el) return;
      el.addEventListener("message", this.onPeerStreamMessage);
      el.addEventListener("onDcOpen", this.onPeerStreamDcOpen);
      el.addEventListener("ueDisConnected", this.onPeerStreamDisconnected);
      el.addEventListener("connLimit", this.onPeerStreamConnLimit);
      el.addEventListener("playing", this.onPeerStreamPlaying);
      el.addEventListener("loadeddata", this.onPeerStreamPlaying);
      el.enableChinese = true;
      this.$pixelStream.attachElement(el);
      window.pixelStreamRef = el;
      if (typeof el.emitMessage !== "function") {
        console.error(
          "[pixelStream] peer-stream 未生效，请确认已加载 static/peer-stream.js"
        );
      }
    }
  },
  created() {
    this.bindUeEvents();
  },
  mounted() {
    const self = this;
    this.userInfoLoading = false;
    this.$nextTick(function() {
      self.applyPendingDetail();
      self.ensurePeerStreamVideo();
    });
    this._loadingHintTimer = setTimeout(function() {
      if (!self.loaded) {
        self.loadingHint =
          "云渲染已连接信令但还未出画，请确认 YJ3DVP.exe 窗口有画面，并查看控制台是否有 WebSocket / WebRTC 报错";
      }
    }, 15000);
  },
  activated() {
    if (!this.pixelStreamRef) {
      this.$nextTick(() => {
        this.ensurePeerStreamVideo();
      });
    }
    this.applyPendingDetail();
  },
  beforeDestroy() {
    if (this._loadingHintTimer) {
      clearTimeout(this._loadingHintTimer);
      this._loadingHintTimer = null;
    }
    this.unbindUeEvents();
    this.unbindPeerStreamRef();
  },
  methods: {
    ensurePeerStreamVideo() {
      const wrap = this.$refs.videoWrapper;
      if (!wrap || !this.pixelStreamUrl) return;
      if (this.pixelStreamRef && this.pixelStreamRef.isConnected) {
        return;
      }
      let el = wrap.querySelector("video.pixelStream");
      if (el && typeof el.emitMessage === "function") {
        if (!el.id) el.id = this.pixelStreamUrl;
        this.applyPeerStreamLayout(el, wrap);
        if (this.pixelStreamRef !== el) this.pixelStreamRef = el;
        return;
      }
      el = document.createElement("video", { is: "peer-stream" });
      el.setAttribute("is", "peer-stream");
      el.setAttribute("idaudio", "");
      el.setAttribute("autoplay", "");
      el.setAttribute("playsinline", "");
      el.muted = true;
      el.id = this.pixelStreamUrl;
      el.className = "pixelStream";
      this.applyPeerStreamLayout(el, wrap);
      wrap.appendChild(el);
      this.pixelStreamRef = el;
    },
    applyPeerStreamLayout(el, wrap) {
      const container = wrap || this.$refs.videoWrapper;
      if (container) {
        container.style.position = "relative";
        container.style.width = "100%";
        container.style.height = "100%";
      }
      if (!el) return;
      el.style.position = "absolute";
      el.style.top = "0";
      el.style.left = "0";
      el.style.right = "0";
      el.style.bottom = "0";
      el.style.width = "100%";
      el.style.height = "100%";
      el.style.display = "block";
      el.style.objectFit = "fill";
      el.style.background = "#000";
    },
    unbindPeerStreamRef() {
      const el = this.pixelStreamRef;
      if (el) {
        el.removeEventListener("message", this.onPeerStreamMessage);
        el.removeEventListener("onDcOpen", this.onPeerStreamDcOpen);
        el.removeEventListener("ueDisConnected", this.onPeerStreamDisconnected);
        el.removeEventListener("connLimit", this.onPeerStreamConnLimit);
        el.removeEventListener("playing", this.onPeerStreamPlaying);
        el.removeEventListener("loadeddata", this.onPeerStreamPlaying);
      }
      if (this.$pixelStream.getElement() === el) {
        this.$pixelStream.attachElement(null);
      }
      this.pixelStreamRef = null;
    },
    onPeerStreamMessage(e) {
      this.$pixelStream.handleMessage(e);
    },
    onPeerStreamDcOpen() {
      if (this.$message && typeof this.$message.closeAll === "function") {
        this.$message.closeAll();
      }
      this.$pixelStream.ready = true;
      this.$pixelStream.send(this.$pixelStream.EVENTS.OPEN, {});
      const el = this.pixelStreamRef;
      this.applyPeerStreamLayout(el);
      if (el && typeof el.sendClientResolution === "function") {
        el.sendClientResolution();
        setTimeout(function() {
          el.sendClientResolution();
        }, 200);
      }
      if (el && typeof el.play === "function") {
        const playPromise = el.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function() {});
        }
      }
      const modelId = this.$route.params.modelId;
      if (modelId) {
        const self = this;
        setTimeout(function() {
          self.$pixelStream.send("focus", modelId);
        }, 1000);
      }
    },
    onPeerStreamPlaying() {
      const el = this.pixelStreamRef;
      if (el && el.videoWidth > 0) {
        this.markPixelStreamLoaded();
      }
    },
    markPixelStreamLoaded() {
      this.loaded = true;
      this.progress = 100;
      this.loadingHint = "";
    },
    onPeerStreamDisconnected() {
      this.loaded = false;
      this.$pixelStream.ready = false;
      this.$message.error("服务异常关闭 正在重启");
      const el = this.pixelStreamRef;
      if (el && el.ws && typeof el.ws.close === "function") {
        el.ws.close();
      }
    },
    onPeerStreamConnLimit(e) {
      const limit = e && e.detail;
      this.$message({
        showClose: true,
        message: "连接数已达到上限 连接数上限:" + limit,
        duration: 0,
        type: "warning"
      });
    },
    bindUeEvents() {
      const ps = this.$pixelStream;
      ps.on(ps.EVENTS.SELECT_MESH, this.onUeSelectMesh);
      ps.on(ps.EVENTS.CANCEL_SELECTED_MESH, this.onUeCancelSelectedMesh);
      ps.on(ps.EVENTS.SHOW_DETAILS, this.onUeShowDetails);
      ps.on(ps.EVENTS.SHOW_ONLINE_MONITORING, this.onUeShowOnlineMonitoring);
      ps.on(ps.EVENTS.SET_MENU, this.onSetMenu);
      ps.on(ps.EVENTS.PROGRESS, this.onUeProgress);
      ps.on(ps.EVENTS.USER_INFO, this.onUeUserInfo);
    },
    unbindUeEvents() {
      const ps = this.$pixelStream;
      ps.off(ps.EVENTS.SELECT_MESH, this.onUeSelectMesh);
      ps.off(ps.EVENTS.CANCEL_SELECTED_MESH, this.onUeCancelSelectedMesh);
      ps.off(ps.EVENTS.SHOW_DETAILS, this.onUeShowDetails);
      ps.off(ps.EVENTS.SHOW_ONLINE_MONITORING, this.onUeShowOnlineMonitoring);
      ps.off(ps.EVENTS.SET_MENU, this.onSetMenu);
      ps.off(ps.EVENTS.PROGRESS, this.onUeProgress);
      ps.off(ps.EVENTS.USER_INFO, this.onUeUserInfo);
    },
    onUeUserInfo() {
      const name =
        sessionStorage.getItem("user") ||
        sessionStorage.getItem("userName") ||
        "admin";
      this.$pixelStream.send("userInfo", {
        id: name,
        name: name,
        fullName: name
      });
    },
    onUeProgress(data) {
      this.progress = Number(data) || 0;
    },
    isSuccessCode(code) {
      return code === 0 || code === "0";
    },
    getMeshId(node, fallback) {
      return (
        this.$pixelStream.getNodeMeshId(node) ||
        this.$pixelStream.normalizeMeshId(fallback)
      );
    },
    findNodePath(nodes, id, path) {
      const list = Array.isArray(nodes) ? nodes : [];
      for (let i = 0; i < list.length; i++) {
        const node = list[i];
        const next = path.concat(node);
        if (String(node.id) === String(id)) return next;
        const found = this.findNodePath(node.children || [], id, next);
        if (found) return found;
      }
      return null;
    },
    updateDirectoryPath(directoryId) {
      this.directoryPath = directoryId
        ? this.findNodePath(this.treeData, directoryId, []) || []
        : [];
    },
    pickPipeline(records, node, meshId) {
      const list = Array.isArray(records) ? records : [];
      if (!list.length) return null;
      const code = this.getMeshId(node, meshId);
      if (code) {
        const matched = list.find(item => {
          return (
            this.$pixelStream.normalizeMeshId(item.pipelineNo) === code ||
            this.$pixelStream.normalizeMeshId(item.modelCode) === code ||
            this.$pixelStream.normalizeMeshId(item.modelNo) === code ||
            this.$pixelStream.normalizeMeshId(item.pipelineName) === code ||
            (node &&
              (item.pipelineName === node.name ||
                item.pipelineName === node.nodeName ||
                item.pipelineNo === node.name ||
                item.pipelineNo === node.nodeName))
          );
        });
        if (matched) return matched;
      }
      if (node && (node.name || node.nodeName)) {
        const name = node.nodeName || node.name;
        const matched = list.find(
          item => item.pipelineName === name || item.pipelineNo === name
        );
        if (matched) return matched;
      }
      return list[0];
    },
    onSetMenu(data) {
      const menu = String(data == null ? "" : data)
        .replace(/\0/g, "")
        .replace(/^["']+|["']+$/g, "")
        .trim();
      const showPlant =
        menu === this.$pixelStream.MENUS.PIPELINE_NETWORK_PLANT;
      this.treeVisible = showPlant;
      if (!showPlant) {
        this.detailVisible = false;
        this.$refs.treePanel && this.$refs.treePanel.clearCurrent();
      }
    },
    goAdminBackend() {
      const route = this.$router.resolve({ path: "/pipeDatabase" });
      window.open(route.href, "_blank");
    },
    applyPendingDetail() {
      const pending = this.$pixelStream.consumePendingDetail();
      if (!pending) return;
      this.openDetailPanel(pending.meshId, pending.tab);
    },
    onTreeLoaded(treeData) {
      this.treeData = treeData || [];
      const pending = this.$pixelStream.pendingDetail;
      const meshId =
        (pending && pending.meshId) ||
        this.currentMeshId ||
        this.$pixelStream.selectedMeshId;
      if (meshId) {
        this.syncTreeByMeshId(meshId);
        if (pending) this.applyPendingDetail();
        return;
      }
      this.bootstrapPipeline();
    },
    onTreeSelect(node, meshId) {
      const id = this.getMeshId(node, meshId);
      this.currentNode = node;
      if (this.syncingFromUe) {
        this.currentMeshId = id;
        return;
      }
      if (this.currentMeshId && this.currentMeshId !== id) {
        this.$pixelStream.sendCancelSelectedMesh(this.currentMeshId);
      }
      this.currentMeshId = id;
      this.$pixelStream.sendSelectMesh(id);
      this.loadPipelineByDirectory(node, id);
    },
    onTreeUnselect(node, meshId) {
      const id = this.getMeshId(node, meshId) || this.currentMeshId;
      this.currentNode = null;
      if (this.syncingFromUe) {
        this.currentMeshId = "";
        return;
      }
      this.$pixelStream.sendCancelSelectedMesh(id);
      this.currentMeshId = "";
    },
    onTreeClose() {
      this.treeVisible = false;
      this.$refs.treePanel && this.$refs.treePanel.clearCurrent();
    },
    syncTreeByMeshId(meshId) {
      const id = this.$pixelStream.normalizeMeshId(meshId);
      if (!this.$refs.treePanel) return null;
      if (!id) {
        this.$refs.treePanel.clearCurrent();
        return null;
      }
      return this.$refs.treePanel.selectByMeshId(id);
    },
    onUeSelectMesh(data) {
      const meshId = this.$pixelStream.normalizeMeshId(data);
      this.syncingFromUe = true;
      this.currentMeshId = meshId;
      this.$pixelStream.selectedMeshId = meshId;
      const node = this.syncTreeByMeshId(meshId);
      this.currentNode = node;
      this.syncingFromUe = false;
    },
    onUeCancelSelectedMesh(data) {
      const meshId = this.$pixelStream.normalizeMeshId(data);
      if (meshId && this.currentMeshId && meshId !== this.currentMeshId) return;
      this.syncingFromUe = true;
      this.currentMeshId = "";
      this.currentNode = null;
      this.$pixelStream.selectedMeshId = "";
      this.$refs.treePanel && this.$refs.treePanel.clearCurrent();
      this.syncingFromUe = false;
    },
    onUeShowDetails(data) {
      this.openDetailPanel(data, "basic");
    },
    onUeShowOnlineMonitoring(data) {
      this.openDetailPanel(data, "related");
    },
    openDetailPanel(meshId, tab) {
      const id = this.$pixelStream.normalizeMeshId(meshId) || this.currentMeshId;
      this.detailVisible = true;
      this.$nextTick(() => {
        this.$refs.detailPanel && this.$refs.detailPanel.setActiveTab(tab || "basic");
      });
      if (id) {
        this.currentMeshId = id;
        this.$pixelStream.selectedMeshId = id;
        this.syncingFromUe = true;
        const node = this.syncTreeByMeshId(id);
        this.currentNode = node;
        this.syncingFromUe = false;
        if (node) this.loadPipelineByDirectory(node, id);
        else this.loadPipelineByMeshId(id);
      }
    },
    bootstrapPipeline() {
      api
        .pagePipelines({ current: 1, size: 1 })
        .then(res => {
          if (!this.isSuccessCode(res && res.code)) return;
          const record = this.pickPipeline((res.data && res.data.records) || []);
          if (!record) return;
          this.pipelineId = record.id;
          if (record.directoryId) {
            this.updateDirectoryPath(record.directoryId);
            this.$refs.treePanel &&
              this.$refs.treePanel.setCurrentKey(record.directoryId);
          }
        })
        .catch(() => {});
    },
    loadPipelineByDirectory(node, meshId) {
      if (!node || !node.id) {
        this.loadPipelineByMeshId(meshId);
        return;
      }
      this.updateDirectoryPath(node.id);
      api
        .pagePipelines({
          directoryId: node.id,
          current: 1,
          size: 50
        })
        .then(res => {
          if (!this.isSuccessCode(res && res.code)) {
            this.loadPipelineByMeshId(meshId, node);
            return;
          }
          const target = this.pickPipeline(
            (res.data && res.data.records) || [],
            node,
            meshId
          );
          if (target) {
            this.pipelineId = target.id;
            if (target.directoryId) this.updateDirectoryPath(target.directoryId);
            return;
          }
          this.loadPipelineByMeshId(meshId, node);
        })
        .catch(() => {
          this.loadPipelineByMeshId(meshId, node);
        });
    },
    loadPipelineByMeshId(meshId, node) {
      const id = this.getMeshId(node, meshId);
      if (!id) return;
      api
        .pagePipelines({
          keyword: id,
          current: 1,
          size: 50
        })
        .then(res => {
          if (!this.isSuccessCode(res && res.code)) return;
          const target = this.pickPipeline(
            (res.data && res.data.records) || [],
            node,
            id
          );
          if (!target) return;
          this.pipelineId = target.id;
          if (target.directoryId) this.updateDirectoryPath(target.directoryId);
        })
        .catch(() => {});
    }
  }
};
</script>

<style lang="less" scoped>
.screen-page {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #000;
}
.screen-scene {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1;
  overflow: hidden;
  background: #000;
}
.videoWrapper {
  position: relative;
  width: 100%;
  height: 100%;
}
.pixelStream {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: fill;
  background: #000;
}
.screen-left {
  position: absolute;
  left: 30px;
  top: 90px;
  bottom: 80px;
  width: 318px;
  z-index: 2;
  pointer-events: auto;
}
.screen-right {
  position: absolute;
  left: 428px;
  top: 100px;
  bottom: 160px;
  z-index: 2;
  pointer-events: auto;
}
</style>
<style lang="less">
.screen-page .admin-entry {
  position: fixed !important;
  top: 70px !important;
  right: 17px !important;
  z-index: 4000 !important;
  box-sizing: border-box;
  width: 110px;
  height: 36px;
  padding: 0 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  border: 0.5px solid #d0d0d0;
  background: rgba(13, 36, 53, 0.6);
  color: #ffffff;
  font-size: 14px;
  line-height: 1;
  letter-spacing: 0;
  white-space: nowrap;
  cursor: pointer;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  font-family: Microsoft YaHei, "PingFang SC", sans-serif;
  pointer-events: auto;
}
.screen-page .admin-entry-icon {
  display: inline-block;
  width: 18px;
  height: 18px;
  margin-right: 6px;
  flex-shrink: 0;
  background-color: #84deff;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-position: center;
  -webkit-mask-size: contain;
  mask-size: contain;
}
/* 动态插入的 video 没有 scoped data-v 属性，必须用非 scoped 才能铺满 */
.screen-page .videoWrapper {
  position: relative;
  width: 100%;
  height: 100%;
}
.screen-page .videoWrapper video,
.screen-page video.pixelStream,
.screen-page video[is="peer-stream"] {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  display: block !important;
  object-fit: fill !important;
  background: #000;
}
</style>
