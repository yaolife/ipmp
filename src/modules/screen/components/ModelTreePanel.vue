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
        :key="treeRenderKey"
        node-key="id"
        :data="treeData"
        :props="treeProps"
        :lazy="treeLazy"
        :load="treeLazy ? loadTreeNode : undefined"
        highlight-current
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
      treeLazy: true,
      treeRenderKey: 0,
      treeProps: {
        children: "children",
        label: "nodeName",
        isLeaf: "leaf"
      },
      currentNodeId: null,
      currentMeshId: "",
      showcaseIcon: showcaseIcon,
      lastShowcaseAt: 0
    };
  },
  watch: {
    filterText() {
      // 输入变化时立即使旧请求失效，避免清空搜索后旧的全量结果覆盖根节点。
      const requestId = ++this._treeRequestId;
      clearTimeout(this._treeSearchTimer);
      this._treeSearchTimer = setTimeout(() => {
        if (this.filterText.trim()) {
          this.showFullTree(requestId);
        } else {
          this.loadTree(false);
        }
      }, 250);
    }
  },
  created() {
    // 大树缓存和索引不参与 Vue 深度响应；只有当前展示的树交给 Element UI。
    this._treeRequestId = 0;
    this._selectionRequestId = 0;
    this._nodeLookup = Object.create(null);
    this._fullTree = null;
    this._fullTreePromise = null;
  },
  mounted() {
    this.loadTree();
    window.addEventListener("ipmp-showcase", this.onWindowShowCase);
  },
  beforeDestroy() {
    clearTimeout(this._treeSearchTimer);
    this._treeRequestId += 1;
    this._selectionRequestId += 1;
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
    /**
     * 仅加载启用模型的根节点，避免首次打开时请求并展开整个模型。
     * @param notifyLoaded 首次加载时通知场景恢复选中；清空搜索时不触发全树反选。
     */
    loadTree(notifyLoaded) {
      const requestId = ++this._treeRequestId;
      this.loading = true;
      return api
        .getLatestEnabledModelTreeRoots()
        .then(res => {
          if (requestId !== this._treeRequestId) return;
          if (!this.isSuccessCode(res && res.code)) throw new Error((res && res.msg) || this.$t("cm.fail"));
          // 完整树已经用于定位选中节点时，不再用根节点把列表盖掉。
          if (!this.treeLazy) return;
          this.treeLazy = true;
          this.treeRenderKey += 1;
          this.treeData = normalizeTree(res.data);
          this.indexNodes(this.treeData);
          this.setCurrentKey(this.currentNodeId);
          if (notifyLoaded !== false) this.$emit("loaded", this.treeData);
        })
        .catch(error => {
          if (requestId !== this._treeRequestId) return;
          this.treeData = [];
          this.$message.error(error.message || this.$t("cm.fail"));
        })
        .finally(() => {
          if (requestId === this._treeRequestId) this.loading = false;
        });
    },
    /** 按展开节点查询直接子节点，保留节点的定位和详情联动字段。 */
    loadTreeNode(node, resolve) {
      // Element UI 在新建懒加载树时也会请求虚拟根节点，必须回填已取得的根数据。
      if (node && node.level === 0) {
        resolve(this.treeData);
        return;
      }
      const data = node && node.data;
      if (!data || !data.id) {
        resolve([]);
        return;
      }
      const renderKey = this.treeRenderKey;
      api.getLatestEnabledModelTreeChildren(data.id).then(res => {
        if (renderKey !== this.treeRenderKey || this._isDestroyed) return;
        if (!this.isSuccessCode(res && res.code)) throw new Error((res && res.msg) || this.$t("cm.fail"));
        const children = normalizeTree(res.data);
        this.indexNodes(children);
        resolve(children);
        this.setCurrentKey(this.currentNodeId);
      }).catch(error => {
        if (renderKey !== this.treeRenderKey || this._isDestroyed) return;
        resolve([]);
        // 加载失败不永久标为叶节点，用户可再次展开重试。
        node.loaded = false;
        node.isLeaf = false;
        this.$message.error(error.message || this.$t("cm.fail"));
      });
    },
    /** 搜索或场景反选时才获取完整轻量树，并复用同一请求和缓存。 */
    getFullTree() {
      if (this._fullTree) return Promise.resolve(this._fullTree);
      if (this._fullTreePromise) return this._fullTreePromise;
      this._fullTreePromise = api.getLatestEnabledModelTree().then(res => {
        if (!this.isSuccessCode(res && res.code)) throw new Error((res && res.msg) || this.$t("cm.fail"));
        const tree = normalizeTree(res.data);
        if (!this._isDestroyed) {
          this._fullTree = tree;
          this.indexNodes(tree);
        }
        return tree;
      }).finally(() => {
        this._fullTreePromise = null;
      });
      return this._fullTreePromise;
    },
    /** 切换为普通树后再过滤，确保能够搜到尚未展开的深层节点。 */
    showFullTree(requestId, silent) {
      if (!silent) this.loading = true;
      return this.getFullTree().then(tree => {
        if (requestId !== this._treeRequestId) return;
        if (this.treeLazy) {
          this.treeLazy = false;
          this.treeRenderKey += 1;
        }
        this.treeData = tree;
        return this.$nextTick(() => {
          if (requestId !== this._treeRequestId) return;
          const resourceTree = this.$refs.resourceTree;
          if (resourceTree) resourceTree.filter(this.filterText.trim());
          this.setCurrentKey(this.currentNodeId);
        });
      }).catch(error => {
        if (requestId === this._treeRequestId) this.$message.error(error.message || this.$t("cm.fail"));
      }).finally(() => {
        if (!silent && requestId === this._treeRequestId) this.loading = false;
      });
    },
    /** 索引懒加载节点及其模型别名，供场景选中和展示命令快速查找。 */
    indexNodes(list) {
      (list || []).forEach(node => {
        [getNodeMeshId(node), node.pipelineNo, node.modelCode, node.modelNo,
          node.pipelineName, node.modelName, node.nodeName, node.name, node.code, node.id
        ].forEach(value => {
          const key = this.pickShowcaseText(value);
          if (key && !this._nodeLookup[key]) this._nodeLookup[key] = node;
        });
        this.indexNodes(node.children);
      });
    },
    onNodeClick(data) {
      this._selectionRequestId += 1;
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
      this._selectionRequestId += 1;
      this.currentNodeId = null;
      this.currentMeshId = "";
      this.setCurrentKey(null);
    },
    findNodeByMeshId(meshId) {
      const id = this.pickShowcaseText(meshId);
      return id ? this._nodeLookup[id] || null : null;
    },
    selectByMeshId(meshId) {
      const selectionId = ++this._selectionRequestId;
      const node = this.findNodeByMeshId(meshId);
      const tree = this.$refs.resourceTree;
      if (!node || !tree || !tree.getNode(node.id)) {
        // UE 可直接选中未展开的元件；此时按需获取整树，只展开选中节点的祖先。
        const requestId = this._treeRequestId;
        return this.getFullTree().then(() => {
          if (selectionId !== this._selectionRequestId || requestId !== this._treeRequestId) return null;
          const matched = this.findNodeByMeshId(meshId);
          if (!matched) return null;
          this.currentNodeId = matched.id;
          this.currentMeshId = getNodeMeshId(matched) || normalizeMeshId(meshId);
          return this.showFullTree(requestId, true).then(() => matched);
        }).catch(error => {
          if (selectionId === this._selectionRequestId && !this._isDestroyed) {
            this.$message.error(error.message || this.$t("cm.fail"));
          }
          return null;
        });
      }
      this.currentNodeId = node.id;
      this.currentMeshId = getNodeMeshId(node) || normalizeMeshId(meshId);
      this.setCurrentKey(node.id);
      return node;
    },
    setCurrentKey(id) {
      this.$nextTick(() => {
        if (this.$refs.resourceTree) {
          const tree = this.$refs.resourceTree;
          tree.setCurrentKey(id || null);
          let parent = id && tree.getNode(id);
          // 不再全部展开；反选时只打开祖先路径，避免大量节点同时渲染。
          while (parent && parent.parent) {
            parent = parent.parent;
            parent.expanded = true;
          }
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
  padding: 0;
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #49eafc;
  -webkit-backdrop-filter: blur(5.5px);
  backdrop-filter: blur(5.5px);
  color: #ffffff;
  overflow: hidden;
}
.panel-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  height: 34px;
  line-height: 34px;
  padding: 0 12px;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 1px;
  color: #ffffff;
  text-align: center;
  border-bottom: 0;
  position: relative;
}
.panel-header::after {
  content: "";
  position: absolute;
  left: 4px;
  right: 4px;
  bottom: 0;
  height: 1px;
  background: #49eafc;
}
.panel-header-title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.panel-search {
  flex-shrink: 0;
  margin: 10px 12px;
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
  padding: 0 0 0 12px;
  overflow: auto;
  scrollbar-width: thin;
  scrollbar-color: #ffffff rgba(255, 255, 255, 0.16);
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
  width: 8px;
  height: 20px;
}
.panel-tree::-webkit-scrollbar-track,
.panel-tree /deep/ .el-tree::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.16);
}
.panel-tree::-webkit-scrollbar-thumb,
.panel-tree /deep/ .el-tree::-webkit-scrollbar-thumb {
  background: #ffffff;
  border-radius: 3px;
  min-height: 20px;
}
.panel-tree::-webkit-scrollbar-thumb:hover,
.panel-tree /deep/ .el-tree::-webkit-scrollbar-thumb:hover {
  background: #f2f2f2;
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
