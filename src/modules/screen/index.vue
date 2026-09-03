<template>
  <div class="screen-page">
    <div class="screen-scene"></div>
    <div class="screen-left">
      <model-tree-panel
        ref="treePanel"
        @loaded="onTreeLoaded"
        @select="onTreeSelect"
      ></model-tree-panel>
    </div>
    <div class="screen-right">
      <asset-detail-panel
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

export default {
  name: "DigitalTwinScreen",
  components: {
    ModelTreePanel,
    AssetDetailPanel
  },
  data() {
    return {
      treeData: [],
      currentNode: null,
      directoryPath: [],
      pipelineId: "",
      detailVisible: true
    };
  },
  methods: {
    isSuccessCode(code) {
      return code === 0 || code === "0";
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
    pickPipeline(records, node) {
      const list = Array.isArray(records) ? records : [];
      if (!list.length) return null;
      if (node && node.name) {
        const matched = list.find(
          item => item.pipelineName === node.name || item.pipelineNo === node.name
        );
        if (matched) return matched;
      }
      return list[0];
    },
    onTreeLoaded(treeData) {
      this.treeData = treeData || [];
      this.bootstrapPipeline();
    },
    onTreeSelect(node) {
      this.currentNode = node;
      this.detailVisible = true;
      this.loadPipelineByDirectory(node);
    },
    bootstrapPipeline() {
      api
        .pagePipelines({ current: 1, size: 1 })
        .then(res => {
          if (!this.isSuccessCode(res && res.code)) return;
          const record = this.pickPipeline((res.data && res.data.records) || []);
          if (!record) return;
          this.pipelineId = record.id;
          this.detailVisible = true;
          if (record.directoryId) {
            this.updateDirectoryPath(record.directoryId);
            this.$refs.treePanel && this.$refs.treePanel.setCurrentKey(record.directoryId);
          }
        })
        .catch(() => {});
    },
    loadPipelineByDirectory(node) {
      if (!node || !node.id) return;
      api
        .pagePipelines({
          directoryId: node.id,
          current: 1,
          size: 50
        })
        .then(res => {
          if (!this.isSuccessCode(res && res.code)) return;
          const target = this.pickPipeline((res.data && res.data.records) || [], node);
          if (!target) return;
          this.updateDirectoryPath(node.id);
          this.pipelineId = target.id;
        })
        .catch(() => {});
    }
  }
};
</script>

<style lang="less" scoped>
.screen-page {
  position: relative;
  height: calc(100vh - 130px);
  min-height: 620px;
  overflow: visible;
  background: #7fbbf1;
}
.screen-scene {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: #7fbbf1;
}
.screen-left {
  position: absolute;
  left: 30px;
  top: 20px;
  bottom: 80px;
  width: 318px;
  z-index: 2;
}
.screen-right {
  position: absolute;
  left: 428px;
  top: 100px;
  bottom: 160px;
  z-index: 2;
}
</style>
