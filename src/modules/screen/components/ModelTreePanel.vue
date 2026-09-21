<template>
  <div class="model-tree-panel">
    <div class="panel-header">
      <span class="panel-header-title">{{ $t("lang.screen_tree_title") }}</span>
    </div>
    <div class="panel-search">
      <el-input
        v-model="filterText"
        :placeholder="$t('lang.screen_tree_search')"
        maxlength="32"
        suffix-icon="el-icon-search"
        size="small"
        clearable
      ></el-input>
    </div>
    <div class="panel-tree" v-loading="loading">
      <el-tree
        ref="resourceTree"
        node-key="id"
        :data="treeData"
        :props="treeProps"
        highlight-current
        default-expand-all
        :expand-on-click-node="false"
        :filter-node-method="filterTreeNode"
        :empty-text="$t('cm.nodata')"
        @node-click="onNodeClick"
      >
        <span class="tree-node" slot-scope="{ node, data }">
          <span class="tree-node-label" :title="node.label">{{ node.label }}</span>
          <button
            v-show="iconVisible"
            type="button"
            class="tree-showcase-btn"
            :data-showcase="getShowcaseModelNo(data, node)"
            :data-node-id="data && data.id"
            @click.stop.prevent="onShowcaseClick($event, data, node)"
            @mousedown.stop="onShowcaseClick($event, data, node)"
          >
            <img class="tree-showcase-icon" :src="showcaseIcon" alt="" />
          </button>
        </span>
      </el-tree>
    </div>
  </div>
</template>

<script>
import api from "@/modules/drafts/api";
import { getNodeMeshId, normalizeMeshId } from "@/utils/pixelStream";
import showcaseIcon from "@/assets/img/showcase-icon.png";

const PIPE_DIRECTORY_TYPE = 0;

function getNodeLabel(item) {
  return (item && (item.nodeName || item.name)) || "";
}

function normalizeTree(list) {
  if (!Array.isArray(list)) return [];
  return list.map(item => {
    const node = Object.assign({}, item, {
      nodeName: getNodeLabel(item),
      name: getNodeLabel(item)
    });
    node.children = normalizeTree(item && item.children);
    return node;
  });
}

export default {
  name: "ModelTreePanel",
  props: {
    iconVisible: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      loading: false,
      filterText: "",
      treeData: [],
      treeProps: {
        children: "children",
        label: "nodeName"
      },
      currentNodeId: null,
      currentMeshId: "",
      showcaseIcon: showcaseIcon,
      lastShowcaseAt: 0
    };
  },
  watch: {
    filterText(val) {
      const keyword = (val || "").trim();
      this.$refs.resourceTree && this.$refs.resourceTree.filter(keyword);
    }
  },
  mounted() {
    this.loadTree();
    window.addEventListener("ipmp-showcase", this.onWindowShowCase);
  },
  beforeDestroy() {
    window.removeEventListener("ipmp-showcase", this.onWindowShowCase);
  },
  methods: {
    isSuccessCode(code) {
      return code === 0 || code === "0";
    },
    filterTreeNode(value, data) {
      if (!value) return true;
      const keyword = value.toLowerCase();
      return getNodeLabel(data).toLowerCase().indexOf(keyword) !== -1;
    },
    pickShowcaseText(value) {
      return String(value == null ? "" : value)
        .replace(/\0/g, "")
        .replace(/^["']+|["']+$/g, "")
        .trim();
    },
    getShowcaseModelNo(data, node) {
      const source = data || (node && node.data) || {};
      const label = (node && node.label) || getNodeLabel(source);
      const candidates = [
        source.pipelineNo,
        source.modelCode,
        source.modelNo,
        source.kks,
        source.kksCode,
        source.pipeNo,
        source.sysName,
        source.pipelineName,
        source.modelName,
        source.resourceName,
        source.directoryName,
        source.nodeName,
        source.name,
        source.code,
        label,
        source.id
      ];
      for (let i = 0; i < candidates.length; i++) {
        const text = this.pickShowcaseText(candidates[i]);
        if (text) return text;
      }
      return "";
    },
    onShowcaseClick(e, data, node) {
      if (e) {
        if (typeof e.stopPropagation === "function") e.stopPropagation();
        if (typeof e.preventDefault === "function") e.preventDefault();
      }
      const payload = data || (node && node.data) || {};
      const modelNo = this.getShowcaseModelNo(payload, node);
      this.dispatchShowCase(payload, modelNo);
    },
    onWindowShowCase(e) {
      const id = this.pickShowcaseText(e && e.detail);
      const now = Date.now();
      if (this.lastShowcaseAt && now - this.lastShowcaseAt < 400) return;
      this.lastShowcaseAt = now;
      const payload = this.findNodeByMeshId(id) || {};
      this.$emit("showcase", payload, id);
    },
    dispatchShowCase(payload, modelNo) {
      const now = Date.now();
      if (this.lastShowcaseAt && now - this.lastShowcaseAt < 400) return;
      this.lastShowcaseAt = now;
      const id = this.pickShowcaseText(modelNo);
      if (typeof window.sendShowCase === "function") {
        window.sendShowCase(id);
      } else if (this.$pixelStream && this.$pixelStream.sendShowCase) {
        this.$pixelStream.sendShowCase(id);
      }
      this.$emit("showcase", payload, id);
    },
    loadTree() {
      this.loading = true;
      api
        .getResourceDirectoryTree({ moduleType: PIPE_DIRECTORY_TYPE })
        .then(res => {
          this.loading = false;
          if (this.isSuccessCode(res && res.code)) {
            this.treeData = normalizeTree(res.data);
          } else {
            this.treeData = [];
          }
          this.$emit("loaded", this.treeData);
        })
        .catch(() => {
          this.loading = false;
          this.treeData = [];
          this.$emit("loaded", []);
        });
    },
    onNodeClick(data) {
      const meshId = getNodeMeshId(data);
      const sameNode =
        this.currentNodeId != null && String(this.currentNodeId) === String(data && data.id);
      if (sameNode) {
        this.clearCurrent();
        this.$emit("unselect", data, meshId);
        return;
      }
      this.currentNodeId = data && data.id;
      this.currentMeshId = meshId;
      this.setCurrentKey(this.currentNodeId);
      this.$emit("select", data, meshId);
    },
    clearCurrent() {
      this.currentNodeId = null;
      this.currentMeshId = "";
      this.setCurrentKey(null);
    },
    findNodeByMeshId(meshId, list) {
      const id = this.pickShowcaseText(meshId);
      if (!id) return null;
      const nodes = Array.isArray(list) ? list : this.treeData;
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (!node) continue;
        const keys = [
          getNodeMeshId(node),
          node.pipelineNo,
          node.modelCode,
          node.modelNo,
          node.pipelineName,
          node.modelName,
          node.nodeName,
          node.name,
          node.code,
          node.id
        ];
        if (keys.some(item => this.pickShowcaseText(item) === id)) return node;
        const found = this.findNodeByMeshId(id, node.children || []);
        if (found) return found;
      }
      return null;
    },
    selectByMeshId(meshId) {
      const node = this.findNodeByMeshId(meshId);
      if (!node) return null;
      this.currentNodeId = node.id;
      this.currentMeshId = getNodeMeshId(node) || normalizeMeshId(meshId);
      this.setCurrentKey(node.id);
      return node;
    },
    setCurrentKey(id) {
      this.$nextTick(() => {
        if (this.$refs.resourceTree) {
          this.$refs.resourceTree.setCurrentKey(id || null);
        }
      });
    }
  }
};
</script>

<style lang="less" scoped>
.model-tree-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 12px 12px 10px;
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.3);
  -webkit-backdrop-filter: blur(5.5px);
  backdrop-filter: blur(5.5px);
  color: #ffffff;
  overflow: hidden;
}
.panel-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  height: 36px;
  line-height: 36px;
  padding: 0 4px 8px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 1px;
  color: #ffffff;
}
.panel-header-title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.panel-search {
  flex-shrink: 0;
  margin-bottom: 10px;
  /deep/ .el-input__inner {
    height: 32px;
    line-height: 32px;
    background: rgba(0, 0, 0, 0.35);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: #ffffff;
    border-radius: 2px;
  }
  /deep/ .el-input__inner::placeholder {
    color: rgba(255, 255, 255, 0.45);
  }
  /deep/ .el-input__icon,
  /deep/ .el-input__suffix {
    color: rgba(255, 255, 255, 0.7);
  }
}
.panel-tree {
  flex: 1;
  min-height: 0;
  overflow: auto;
  /deep/ .el-loading-mask {
    background: rgba(0, 0, 0, 0.35);
  }
  /deep/ .el-tree {
    background: transparent;
    color: rgba(255, 255, 255, 0.88);
  }
  /deep/ .el-tree-node__content {
    height: 32px;
    background: transparent;
    display: flex;
    align-items: center;
    padding-right: 8px;
    overflow: visible;
  }
  /deep/ .el-tree-node__content:hover {
    background: rgba(255, 255, 255, 0.08);
  }
  /deep/ .el-tree--highlight-current
    .el-tree-node.is-current
    > .el-tree-node__content {
    background: #1677ff;
    color: #ffffff;
  }
  /deep/ .el-tree-node__expand-icon {
    color: rgba(255, 255, 255, 0.7);
  }
  /deep/ .el-tree-node__expand-icon.is-leaf {
    color: transparent;
  }
  /deep/ .el-tree__empty-text {
    color: rgba(255, 255, 255, 0.45);
  }
}
.panel-tree::-webkit-scrollbar,
.panel-tree /deep/ .el-tree::-webkit-scrollbar {
  width: 6px;
}
.panel-tree::-webkit-scrollbar-thumb,
.panel-tree /deep/ .el-tree::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.28);
  border-radius: 3px;
}
.tree-node {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  width: 0;
  font-size: 13px;
}
.tree-node-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tree-showcase-btn {
  flex-shrink: 0;
  box-sizing: border-box;
  width: 22px;
  height: 22px;
  min-width: 22px;
  min-height: 22px;
  margin-left: 8px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  z-index: 2;
  pointer-events: auto;
  position: relative;
}
.tree-showcase-icon {
  width: 18px;
  height: 18px;
  display: block;
  filter: brightness(0) invert(1);
  opacity: 0.92;
  pointer-events: none;
}
.tree-showcase-btn:hover .tree-showcase-icon {
  opacity: 1;
}
/deep/ .el-tree-node.is-current .tree-showcase-icon {
  opacity: 1;
}
</style>
<style lang="less">
.model-tree-panel .tree-node {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  width: 0;
  font-size: 13px;
}
.model-tree-panel .tree-node-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.model-tree-panel .tree-showcase-btn {
  flex-shrink: 0;
  box-sizing: border-box;
  width: 22px;
  height: 22px;
  min-width: 22px;
  min-height: 22px;
  margin-left: 8px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}
.model-tree-panel .tree-showcase-icon {
  width: 18px;
  height: 18px;
  display: block;
  filter: brightness(0) invert(1);
  pointer-events: none;
}
</style>
