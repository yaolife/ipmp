<template>
  <el-dialog
    :visible.sync="dialogVisible"
    width="calc(100% - 226px)"
    top="8px"
    custom-class="model-library-dialog"
    append-to-body
    :close-on-click-modal="false"
    @close="onClose"
  >
    <div slot="title" class="library-title">{{ dialogTitle }}</div>
    <div class="library-body" v-loading="pageLoading">
      <div class="library-tree library-panel">
        <div class="tree-title">{{ $t("lang.resource_catalog") }}</div>
        <div class="tree-search-box">
          <el-input
            v-model="filterText"
            :placeholder="$t('lang.resource_search_placeholder')"
            maxlength="32"
            suffix-icon="el-icon-search"
            size="small"
            clearable
          ></el-input>
        </div>
        <el-tree
          ref="resourceTree"
          node-key="id"
          :data="treeData"
          :props="treeProps"
          highlight-current
          default-expand-all
          :expand-on-click-node="false"
          :filter-node-method="filterTreeNode"
          class="library-tree-list"
          v-loading="treeLoading"
          @node-click="onTreeNodeClick"
        >
          <span class="custom-tree-node" slot-scope="{ node }">
            <i
              class="tree-node-icon"
              :class="node.isLeaf ? 'el-icon-document' : 'el-icon-folder'"
            ></i>
            <span class="tree-node-label" :title="node.label">{{ node.label }}</span>
          </span>
        </el-tree>
      </div>
      <div class="library-main library-panel">
        <div class="library-toolbar">
          <el-input
            v-model="keyword"
            :placeholder="$t('lang.search_model_no_placeholder')"
            size="small"
            clearable
            class="library-keyword"
            @keyup.enter.native="search"
          ></el-input>
          <el-button type="primary" size="small" @click="search">{{
            $t("cm.query")
          }}</el-button>
          <div class="library-actions">
            <el-button type="primary" size="small" @click="triggerImport">{{
              $t("lang.batch_import")
            }}</el-button>
            <input
              ref="importInput"
              type="file"
              multiple
              :accept="acceptAttr"
              style="display: none"
              @change="onImportFiles"
            />
          </div>
        </div>
        <div class="library-table-wrap">
          <el-table
            :data="tableData"
            ref="itemTable"
            v-loading="loading"
            :empty-text="$t('cm.nodata')"
            stripe
            height="100%"
            row-key="id"
            header-row-class-name="cud-office-table-header"
            class="cud-office-table"
            @selection-change="handleSelectionChange"
          >
            <el-table-column
              type="selection"
              width="50"
              align="center"
            ></el-table-column>
            <el-table-column
              align="center"
              prop="modelNo"
              :label="$t('lang.model_no')"
              min-width="220"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              align="center"
              :label="$t('cm.operate')"
              width="100"
              fixed="right"
            >
              <template slot-scope="scope">
                <el-button
                  type="text"
                  size="small"
                  class="cud-common-operate-edit"
                  @click="editItem(scope.row)"
                  >{{ $t("lang.replace") }}</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="cud-special-pagination">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="current"
            :page-sizes="[10, 20, 30, 40]"
            :page-size="size"
            layout="total, sizes, prev, pager, next"
            :pager-count="5"
            :total="total"
            :disabled="loading"
          ></el-pagination>
        </div>
      </div>
    </div>
    <replace-model-file-dialog
      ref="replaceDialog"
      @save="saveItem"
    ></replace-model-file-dialog>
  </el-dialog>
</template>

<script>
import api from "../api";
import replaceModelFileDialog from "./replaceModelFileDialog.vue";

const ACCEPT_EXTS = ["glb", "gltf", "obj", "fbx", "rvt", "ifc"];
const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024;
const FILE_DIRECTORY = "modelFile";

function getExt(name) {
  const matched = String(name || "")
    .trim()
    .match(/\.([^.]+)$/);
  return matched ? matched[1].toLowerCase() : "";
}

function splitFileIds(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value || "")
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);
}

export default {
  name: "ModelLibraryDialog",
  components: {
    replaceModelFileDialog
  },
  data() {
    return {
      dialogVisible: false,
      pageLoading: false,
      treeLoading: false,
      loading: false,
      model: {},
      filterText: "",
      treeData: [],
      treeProps: {
        children: "children",
        label: "nodeName"
      },
      currentNode: null,
      keyword: "",
      listFromChildren: false,
      childrenAll: [],
      tableData: [],
      multipleSelection: [],
      current: 1,
      size: 10,
      total: 0
    };
  },
  computed: {
    dialogTitle() {
      const name = this.model.modelName || this.$t("lang.model_manage");
      const version = this.model.versionNo ? " - " + this.model.versionNo : "";
      return name + version + " " + this.$t("lang.model_library");
    },
    acceptAttr() {
      return ACCEPT_EXTS.map(item => "." + item).join(",");
    }
  },
  watch: {
    filterText(val) {
      this.$refs.resourceTree && this.$refs.resourceTree.filter((val || "").trim());
    }
  },
  methods: {
    isSuccessCode(code) {
      return code === 0 || code === "0";
    },
    filterTreeNode(value, data) {
      if (!value) return true;
      const keyword = value.toLowerCase();
      return (
        (data.nodeName || "").toLowerCase().indexOf(keyword) !== -1 ||
        (data.pipelineNo || "").toLowerCase().indexOf(keyword) !== -1 ||
        (data.pipelineName || "").toLowerCase().indexOf(keyword) !== -1
      );
    },
    getNodeFileList(item) {
      if (Array.isArray(item && item.file)) return item.file.filter(Boolean);
      if (Array.isArray(item && item.files)) return item.files.filter(Boolean);
      return [];
    },
    getFirstFile(row) {
      return this.getNodeFileList(row)[0] || {};
    },
    mapDirectoryRow(item) {
      const fileList = this.getNodeFileList(item);
      const file = fileList[0] || {};
      return Object.assign({}, item, {
        file: fileList,
        modelNo: item.nodeName || item.name || item.modelNo || file.originalName || "",
        modelName:
          file.originalName ||
          item.nodeName ||
          item.pipelineName ||
          item.pipelineNo ||
          "",
        originalName: file.originalName || "",
        fileSuffix: file.fileSuffix || "",
        fileSize: file.fileSize,
        remark: item.remark || file.remark || "",
        fileId: file.id || item.fileId || splitFileIds(item.fileIds)[0] || "",
        absoluteFileUrl: file.absoluteFileUrl || "",
        fileUrl: file.fileUrl || file.filePath || "",
        versionNo: this.model.versionNo || ""
      });
    },
    open(detail) {
      this.model = detail || {};
      this.filterText = "";
      this.keyword = "";
      this.current = 1;
      this.currentNode = null;
      this.listFromChildren = false;
      this.childrenAll = [];
      this.tableData = [];
      this.total = 0;
      this.multipleSelection = [];
      this.dialogVisible = true;
      this.$nextTick(() => {
        this.clearSelection();
        this.applyTree(this.model.resourceDirectoryTree);
      });
    },
    close() {
      this.dialogVisible = false;
    },
    onClose() {
      this.model = {};
      this.treeData = [];
      this.tableData = [];
      this.childrenAll = [];
      this.currentNode = null;
      this.listFromChildren = false;
      this.multipleSelection = [];
    },
    applyTree(tree) {
      this.treeData = Array.isArray(tree) ? tree : [];
      this.$nextTick(() => {
        if (this.$refs.resourceTree) {
          this.$refs.resourceTree.setCurrentKey(
            this.currentNode && this.currentNode.id ? this.currentNode.id : null
          );
        }
      });
    },
    loadTree() {
      if (!this.model.id) {
        this.applyTree(this.model.resourceDirectoryTree);
        return;
      }
      this.treeLoading = true;
      api
        .getModelResourceDetail(this.model.id)
        .then(res => {
          this.treeLoading = false;
          if (this.isSuccessCode(res && res.code) && res.data) {
            this.model = Object.assign({}, this.model, res.data);
            this.applyTree(res.data.resourceDirectoryTree);
          } else {
            this.applyTree(this.model.resourceDirectoryTree);
            if (res && !this.isSuccessCode(res.code)) {
              this.$message.error((res && res.msg) || this.$t("cm.fail"));
            }
          }
        })
        .catch(() => {
          this.treeLoading = false;
          this.applyTree(this.model.resourceDirectoryTree);
        });
    },
    getNodeLevel(data) {
      if (!data) return -1;
      const level = Number(data.levelNo);
      return Number.isNaN(level) ? -1 : level;
    },
    onTreeNodeClick(data) {
      this.currentNode = data;
      this.current = 1;
      this.clearSelection();
      if (this.getNodeLevel(data) === 5) {
        this.loadDetailToTable(data);
        return;
      }
      this.loadChildrenToTable(data);
    },
    loadDetailToTable(node) {
      if (!node || !node.id) {
        this.clearTable();
        return;
      }
      this.loading = true;
      this.listFromChildren = true;
      api
        .getResourceDirectoryDetail(node.id)
        .then(res => {
          this.loading = false;
          if (this.isSuccessCode(res && res.code) && res.data) {
            this.childrenAll = [this.mapDirectoryRow(res.data)];
            this.applyChildrenList();
          } else {
            this.clearTable();
            this.$message.error((res && res.msg) || this.$t("cm.fail"));
          }
        })
        .catch(() => {
          this.loading = false;
          this.clearTable();
        });
    },
    loadChildrenToTable(node) {
      if (!node || !node.id) {
        this.clearTable();
        return;
      }
      this.loading = true;
      this.listFromChildren = true;
      api
        .getResourceDirectoryChildren(node.id)
        .then(res => {
          this.loading = false;
          if (this.isSuccessCode(res && res.code)) {
            const raw = res.data;
            const children = Array.isArray(raw)
              ? raw
              : raw && Array.isArray(raw.records)
                ? raw.records
                : [];
            this.childrenAll = children.map(item => this.mapDirectoryRow(item));
            this.applyChildrenList();
          } else {
            this.clearTable();
            this.$message.error((res && res.msg) || this.$t("cm.fail"));
          }
        })
        .catch(() => {
          this.loading = false;
          this.clearTable();
        });
    },
    matchKeyword(row) {
      const nameKey = (this.keyword || "").trim().toLowerCase();
      if (!nameKey) return true;
      const text = [row.modelNo, row.nodeName, row.pipelineNo]
        .join(" ")
        .toLowerCase();
      return text.indexOf(nameKey) !== -1;
    },
    applyChildrenList() {
      let list = (this.childrenAll || []).filter(item => this.matchKeyword(item));
      if (this.getNodeLevel(this.currentNode) === 5) {
        list = list.slice(0, 1);
      }
      this.total = list.length;
      const maxPage = Math.max(1, Math.ceil(this.total / this.size) || 1);
      if (this.current > maxPage) this.current = maxPage;
      const start = (this.current - 1) * this.size;
      this.tableData = list.slice(start, start + this.size);
    },
    clearTable() {
      this.listFromChildren = false;
      this.childrenAll = [];
      this.tableData = [];
      this.total = 0;
    },
    search() {
      this.current = 1;
      this.getList();
    },
    handleSizeChange(size) {
      this.size = size;
      this.current = 1;
      this.getList();
    },
    handleCurrentChange(current) {
      this.current = current;
      this.getList();
    },
    handleSelectionChange(val) {
      this.multipleSelection = val || [];
    },
    clearSelection() {
      this.$refs.itemTable && this.$refs.itemTable.clearSelection();
      this.multipleSelection = [];
    },
    getList() {
      if (this.listFromChildren) {
        this.applyChildrenList();
        return;
      }
      if (this.currentNode && this.currentNode.id) {
        this.reloadCurrentTable();
        return;
      }
      this.clearTable();
    },
    reloadCurrentTable() {
      if (!this.currentNode || !this.currentNode.id) {
        this.clearTable();
        return;
      }
      if (this.getNodeLevel(this.currentNode) === 5) {
        this.loadDetailToTable(this.currentNode);
        return;
      }
      this.loadChildrenToTable(this.currentNode);
    },
    updateModel(detail) {
      if (detail) this.model = Object.assign({}, this.model, detail);
    },
    editItem(row) {
      if (!row) return;
      this.$refs.replaceDialog &&
        this.$refs.replaceDialog.open(
          Object.assign({}, row, {
            versionNo: row.versionNo || this.model.versionNo || ""
          })
        );
    },
    triggerImport() {
      if (!this.currentNode || !this.currentNode.id) {
        this.$message.warning(this.$t("lang.select_resource_node"));
        return;
      }
      this.$refs.importInput && this.$refs.importInput.click();
    },
    onImportFiles(e) {
      const files = e.target.files ? Array.prototype.slice.call(e.target.files) : [];
      e.target.value = "";
      if (!files.length) return;
      if (!this.currentNode || !this.currentNode.id) {
        this.$message.warning(this.$t("lang.select_resource_node"));
        return;
      }
      const invalid = files.find(file => {
        const ext = getExt(file.name);
        return ACCEPT_EXTS.indexOf(ext) === -1 || file.size > MAX_FILE_SIZE;
      });
      if (invalid) {
        this.$message.warning(this.$t("lang.item_file_type_invalid"));
        return;
      }
      this.loading = true;
      this.uploadFiles(files)
        .then(fileIds => {
          const tasks = fileIds.map(fileId =>
            api.createModelResourceItem({
              modelResourceId: this.model.id,
              resourceDirectoryId: this.currentNode.id,
              fileIds: [fileId],
              remark: ""
            })
          );
          return Promise.all(tasks);
        })
        .then(results => {
          this.loading = false;
          const failed = (results || []).find(
            res => !this.isSuccessCode(res && res.code)
          );
          if (failed) {
            this.$message.error((failed && failed.msg) || this.$t("cm.fail"));
            return;
          }
          this.$message.success(this.$t("cm.success"));
          this.reloadCurrentTable();
        })
        .catch(err => {
          this.loading = false;
          this.$message.error((err && err.msg) || this.$t("cm.fail"));
        });
    },
    uploadFiles(files) {
      const tasks = files.map(file => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("directory", FILE_DIRECTORY);
        return api.uploadSysFile(formData).then(res => {
          if (!this.isSuccessCode(res && res.code) || !res.data || !res.data.id) {
            return Promise.reject(res || { msg: this.$t("cm.fail") });
          }
          return res.data.id;
        });
      });
      return Promise.all(tasks);
    },
    saveItem(payload) {
      const dialog = this.$refs.replaceDialog;
      if (!payload || !payload.nodeId || !payload.file) {
        dialog && dialog.finishSave();
        return;
      }
      const formData = new FormData();
      formData.append("nodeId", payload.nodeId);
      formData.append("file", payload.file);
      api
        .updateModelNodeFile(formData)
        .then(res => {
          dialog && dialog.finishSave();
          if (this.isSuccessCode(res && res.code)) {
            dialog && dialog.close();
            this.$message.success(this.$t("cm.success"));
            this.reloadCurrentTable();
          } else {
            this.$message.error((res && res.msg) || this.$t("cm.fail"));
          }
        })
        .catch(err => {
          dialog && dialog.finishSave();
          this.$message.error((err && err.msg) || this.$t("cm.fail"));
        });
    }
  }
};
</script>

<style lang="less">
.model-library-dialog {
  margin: 8px 16px 8px 210px !important;
  width: calc(100vw - 226px) !important;
  height: calc(100vh - 16px) !important;
  max-height: calc(100vh - 16px) !important;
  display: flex !important;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
  .el-dialog__header {
    flex-shrink: 0;
    padding: 12px 20px 8px;
    border-bottom: none;
  }
  .el-dialog__headerbtn {
    top: 14px;
  }
  .el-dialog__body {
    flex: 1 1 auto;
    height: calc(100% - 48px) !important;
    min-height: 0;
    padding: 0 16px 12px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .library-tree-list.el-tree {
    max-height: none;
    background: transparent;
  }
  .library-tree-list .el-tree-node__content {
    height: 32px;
    border-radius: 4px;
  }
  .library-tree-list.el-tree--highlight-current
    .el-tree-node.is-current
    > .el-tree-node__content {
    background: #ecf5ff;
    color: #409eff;
    position: relative;
  }
  .library-tree-list.el-tree--highlight-current
    .el-tree-node.is-current
    > .el-tree-node__content::before {
    content: "";
    position: absolute;
    left: 0;
    top: 6px;
    bottom: 6px;
    width: 3px;
    background: #409eff;
    border-radius: 2px;
  }
}
</style>
<style lang="less" scoped>
.library-title {
  padding-right: 28px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}
.library-body {
  display: flex;
  align-items: stretch;
  flex: 1;
  min-height: 0;
  height: 100%;
}
.library-panel {
  box-sizing: border-box;
  min-height: 0;
  height: 100%;
  border-radius: 12px;
  border: 1px solid #e5ebf3;
  background: #fff;
  box-shadow: 0 4px 14px 0 rgba(18, 41, 71, 0.08);
}
.library-tree {
  width: 320px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  margin-right: 16px;
  padding: 16px 12px;
}
.tree-title {
  flex-shrink: 0;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}
.tree-search-box {
  flex-shrink: 0;
  margin-bottom: 12px;
}
.library-tree-list {
  flex: 1;
  min-height: 0;
  overflow: auto;
  border: none;
  background: transparent;
}
.library-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: 16px;
}
.library-toolbar {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  margin-bottom: 12px;
}
.library-keyword {
  width: 220px;
  margin-right: 8px;
}
.library-actions {
  margin-left: auto;
}
.library-table-wrap {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
.cud-special-pagination {
  flex-shrink: 0;
  padding-top: 8px;
}
.custom-tree-node {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  font-size: 14px;
}
.tree-node-icon {
  margin-right: 6px;
  color: #909399;
  font-size: 14px;
}
.tree-node-icon.el-icon-folder {
  color: #f2c037;
}
.tree-node-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
