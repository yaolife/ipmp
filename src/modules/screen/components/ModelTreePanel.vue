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
        <span class="tree-node" slot-scope="{ node }">
          <span class="tree-node-label" :title="node.label">{{ node.label }}</span>
        </span>
      </el-tree>
    </div>
  </div>
</template>

<script>
import api from "@/modules/drafts/api";
import { getNodeMeshId, normalizeMeshId } from "@/utils/pixelStream";

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
      currentMeshId: ""
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
    loadTree() {
      this.loading = true;
      api
        .getResourceDirectoryTree({ type: PIPE_DIRECTORY_TYPE })
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
      const id = normalizeMeshId(meshId);
      if (!id) return null;
      const nodes = Array.isArray(list) ? list : this.treeData;
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (!node) continue;
        const nodeMeshId = getNodeMeshId(node);
        if (nodeMeshId && nodeMeshId === id) return node;
        if (node.id != null && String(node.id) === id) return node;
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
  width: 318px;
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
  display: inline-flex;
  align-items: center;
  min-width: 0;
  font-size: 13px;
}
.tree-node-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
