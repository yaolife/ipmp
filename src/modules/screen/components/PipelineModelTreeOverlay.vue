<template>
  <div
    class="pipeline-model-tree-overlay"
    v-show="overlayVisible"
  >
    <model-tree-panel
      v-if="visible"
      ref="treePanel"
      :icon-visible="showcaseIconVisible"
      @loaded="onTreeLoaded"
      @select="onTreeSelect"
      @unselect="onTreeUnselect"
      @showcase="onTreeShowcase"
      @close="visible = false"
    ></model-tree-panel>
  </div>
</template>

<script>
import ModelTreePanel from "./ModelTreePanel.vue";

export default {
  name: "PipelineModelTreeOverlay",
  components: {
    ModelTreePanel
  },
  data() {
    return {
      visible: false,
      showcaseIconVisible: false,
      syncingFromUe: false,
      currentMeshId: ""
    };
  },
  computed: {
    isDigitalTwinPage() {
      const path = this.$route.path || "";
      return (
        path === "/YJ3DVP" ||
        path.indexOf("/YJ3DVP/") === 0 ||
        path === "/screen" ||
        path.indexOf("/screen/") === 0
      );
    },
    overlayVisible() {
      return this.visible && !this.isDigitalTwinPage;
    }
  },
  created() {
    const ps = this.$pixelStream;
    ps.on(ps.EVENTS.SET_MENU, this.onSetMenu);
    ps.on(ps.EVENTS.EXIT_SHOW_CASE, this.onExitShowCase);
    ps.on(ps.EVENTS.SELECT_MESH, this.onUeSelectMesh);
    ps.on(ps.EVENTS.CANCEL_SELECTED_MESH, this.onUeCancelSelectedMesh);
    ps.on(ps.EVENTS.SHOW_DETAILS, this.onUeShowDetails);
    ps.on(ps.EVENTS.SHOW_ONLINE_MONITORING, this.onUeShowOnlineMonitoring);
  },
  mounted() {
    this.$pixelStream.bindWhenReady();
    window.addEventListener("ipmp-showcase", this.onDomShowCase);
  },
  beforeDestroy() {
    const ps = this.$pixelStream;
    ps.off(ps.EVENTS.SET_MENU, this.onSetMenu);
    ps.off(ps.EVENTS.EXIT_SHOW_CASE, this.onExitShowCase);
    ps.off(ps.EVENTS.SELECT_MESH, this.onUeSelectMesh);
    ps.off(ps.EVENTS.CANCEL_SELECTED_MESH, this.onUeCancelSelectedMesh);
    ps.off(ps.EVENTS.SHOW_DETAILS, this.onUeShowDetails);
    ps.off(ps.EVENTS.SHOW_ONLINE_MONITORING, this.onUeShowOnlineMonitoring);
    this.$pixelStream.stopBindWatch();
    window.removeEventListener("ipmp-showcase", this.onDomShowCase);
  },
  methods: {
    getMeshId(node, fallback) {
      return (
        this.$pixelStream.getNodeMeshId(node) ||
        this.$pixelStream.normalizeMeshId(fallback)
      );
    },
    onSetMenu(data) {
      const menu = String(data == null ? "" : data)
        .replace(/\0/g, "")
        .replace(/^["']+|["']+$/g, "")
        .trim();
      const showPlant = menu === this.$pixelStream.MENUS.PIPELINE_NETWORK_PLANT;
      this.visible = showPlant;
      if (showPlant) this.showcaseIconVisible = true;
    },
    onExitShowCase(data) {
      const modelNo = this.$pixelStream.normalizeMeshId(data);
      this.visible = true;
      this.showcaseIconVisible = true;
      if (!modelNo) return;
      this.syncingFromUe = true;
      this.currentMeshId = modelNo;
      this.$pixelStream.selectedMeshId = modelNo;
      this.syncTreeByMeshId(modelNo);
      this.syncingFromUe = false;
    },
    onTreeShowcase(node, modelNo) {
      const id = String(modelNo == null ? "" : modelNo).trim();
      this.currentMeshId = id;
      if (id) this.$pixelStream.selectedMeshId = id;
      this.visible = false;
      this.showcaseIconVisible = false;
    },
    onDomShowCase(e) {
      this.onTreeShowcase(null, e && e.detail);
    },
    onTreeLoaded() {
      const meshId = this.$pixelStream.selectedMeshId || this.currentMeshId;
      if (meshId) this.syncTreeByMeshId(meshId);
    },
    onTreeSelect(node, meshId) {
      const id = this.getMeshId(node, meshId);
      if (this.syncingFromUe) {
        this.currentMeshId = id;
        return;
      }
      if (this.currentMeshId && this.currentMeshId !== id) {
        this.$pixelStream.sendCancelSelectedMesh(this.currentMeshId);
      }
      this.currentMeshId = id;
      this.$pixelStream.sendSelectMesh(id);
    },
    onTreeUnselect(node, meshId) {
      const id = this.getMeshId(node, meshId) || this.currentMeshId;
      if (this.syncingFromUe) {
        this.currentMeshId = "";
        return;
      }
      this.$pixelStream.sendCancelSelectedMesh(id);
      this.currentMeshId = "";
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
      this.syncTreeByMeshId(meshId);
      this.syncingFromUe = false;
    },
    onUeCancelSelectedMesh(data) {
      const meshId = this.$pixelStream.normalizeMeshId(data);
      if (meshId && this.currentMeshId && meshId !== this.currentMeshId) return;
      this.syncingFromUe = true;
      this.currentMeshId = "";
      this.$pixelStream.selectedMeshId = "";
      this.$refs.treePanel && this.$refs.treePanel.clearCurrent();
      this.syncingFromUe = false;
    },
    onUeShowDetails(data) {
      this.openDigitalTwinDetail(data, "basic");
    },
    onUeShowOnlineMonitoring(data) {
      this.openDigitalTwinDetail(data, "related");
    },
    openDigitalTwinDetail(meshId, tab) {
      const id = this.$pixelStream.normalizeMeshId(meshId) || this.currentMeshId;
      if (this.isDigitalTwinPage) return;
      this.$pixelStream.setPendingDetail(id, tab);
      this.$router.push({ path: "/YJ3DVP" });
    }
  }
};
</script>

<style lang="less" scoped>
.pipeline-model-tree-overlay {
  position: fixed;
  left: 1.56%;
  top: 8.33%;
  bottom: 7.41%;
  width: 16.56%;
  z-index: 4000;
  pointer-events: auto;
}
</style>
