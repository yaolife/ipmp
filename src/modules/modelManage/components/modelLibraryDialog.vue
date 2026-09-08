<template>
  <el-dialog
    :visible.sync="dialogVisible"
    width="92%"
    top="1vh"
    custom-class="model-library-dialog"
    append-to-body
    :close-on-click-modal="false"
    @close="onClose"
  >
    <div slot="title" class="library-title">
      <span>{{ dialogTitle }}</span>
      <el-button type="text" size="small" @click="openEditModel">{{
        $t("lang.edit_model_info")
      }}</el-button>
    </div>
    <div class="library-body" v-loading="pageLoading">
      <div class="library-tree">
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
        <div class="tree-title">{{ $t("lang.resource_catalog") }}</div>
        <el-tree
          ref="resourceTree"
          node-key="id"
          :data="treeData"
          :props="treeProps"
          highlight-current
          default-expand-all
          :expand-on-click-node="false"
          :filter-node-method="filterTreeNode"
          class="cud_tree library-tree-list"
          v-loading="treeLoading"
          @node-click="onTreeNodeClick"
        >
          <span class="custom-tree-node" slot-scope="{ node }">
            <span>{{ node.label }}</span>
          </span>
        </el-tree>
      </div>
      <div class="library-main">
        <div class="library-toolbar">
          <el-input
            v-model="keyword"
            :placeholder="$t('lang.resource_search_placeholder')"
            size="small"
            clearable
            class="library-keyword"
            @keyup.enter.native="search"
          ></el-input>
          <el-input
            v-model="descKeyword"
            :placeholder="$t('lang.resource_desc_placeholder')"
            size="small"
            clearable
            class="library-keyword"
            @keyup.enter.native="search"
          ></el-input>
          <el-button type="primary" size="small" @click="search">{{
            $t("cm.query")
          }}</el-button>
          <div class="library-actions">
            <el-button size="small" @click="batchDownload">{{
              $t("lang.batch_download")
            }}</el-button>
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
            border
            stripe
            height="100%"
            row-key="rowKey"
            header-row-class-name="cud-office-table-header"
            class="cud-office-table"
            @selection-change="handleSelectionChange"
          >
            <el-table-column
              type="selection"
              width="50"
              align="center"
              reserve-selection
            ></el-table-column>
            <el-table-column
              align="center"
              prop="modelName"
              :label="$t('lang.model_name')"
              min-width="220"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              align="center"
              :label="$t('cm.operate')"
              width="160"
              fixed="right"
            >
              <template slot-scope="scope">
                <el-button
                  type="text"
                  size="small"
                  class="cud-common-operate-edit"
                  @click="previewRow(scope.row)"
                  >{{ $t("cm.preview") }}</el-button
                >
                <el-button
                  type="text"
                  size="small"
                  class="cud-common-operate-edit"
                  @click="downloadRow(scope.row)"
                  >{{ $t("cm.download") }}</el-button
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
      nodeMap: {},
      currentNode: null,
      keyword: "",
      descKeyword: "",
      allFileRows: [],
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
    flattenTree(list, map) {
      (list || []).forEach(item => {
        if (item && item.id) map[item.id] = item;
        if (item && item.children) this.flattenTree(item.children, map);
      });
      return map;
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
    getModelFileById(fileId) {
      if (!fileId) return null;
      return ((this.model && this.model.files) || []).find(
        item => item && String(item.id) === String(fileId)
      );
    },
    getNodeFiles(node) {
      if (!node) return [];
      if (Array.isArray(node.attachments) && node.attachments.length) {
        return node.attachments.filter(Boolean);
      }
      const fromModel = this.getModelFileById(node.fileId);
      if (fromModel) return [fromModel];
      if (node.absoluteFileUrl || node.fileUrl || node.filePath) {
        return [node];
      }
      if (!(node.children && node.children.length)) {
        return [node];
      }
      return [];
    },
    getFirstFile(row) {
      const files = (row && row.files) || [];
      return files[0] || null;
    },
    mapItemRow(item) {
      const node = this.nodeMap[item.resourceDirectoryId] || {};
      const file =
        this.getFirstFile(item) ||
        (node.attachments && node.attachments[0]) ||
        this.getModelFileById(splitFileIds(item.fileIds)[0]) ||
        {};
      return {
        rowKey: item.id || file.id || node.id,
        id: item.id,
        nodeId: node.id || item.resourceDirectoryId,
        resourceDirectoryId: item.resourceDirectoryId || node.id,
        modelNo: node.nodeName || item.id || "",
        modelName:
          file.originalName ||
          node.nodeName ||
          node.pipelineName ||
          item.remark ||
          item.id ||
          "",
        remark: item.remark || file.remark || "",
        originalName: file.originalName || "",
        fileSuffix: file.fileSuffix || "",
        fileSize: file.fileSize,
        fileId: file.id || splitFileIds(item.fileIds)[0] || "",
        fileIds: splitFileIds(item.fileIds),
        absoluteFileUrl: file.absoluteFileUrl || file.filePath || "",
        fileUrl: file.fileUrl || file.filePath || "",
        versionNo: item.versionNo || this.model.versionNo || ""
      };
    },
    mapFileRow(node, file) {
      const source = file || {};
      const fileId = source.id || node.fileId || "";
      return {
        rowKey: [node.id, fileId || source.originalName || source.absoluteFileUrl]
          .filter(Boolean)
          .join("_"),
        id: fileId || node.id,
        nodeId: node.id,
        resourceDirectoryId: node.id,
        modelNo: node.nodeName || source.originalName || "",
        modelName:
          source.originalName ||
          node.nodeName ||
          node.pipelineName ||
          node.pipelineNo ||
          "",
        remark: source.remark || node.remark || "",
        originalName: source.originalName || node.nodeName || "",
        fileSuffix: source.fileSuffix || "",
        fileSize: source.fileSize,
        fileId,
        fileIds: fileId ? [fileId] : splitFileIds(node.fileIds),
        absoluteFileUrl: source.absoluteFileUrl || source.filePath || "",
        fileUrl: source.fileUrl || source.filePath || "",
        versionNo: this.model.versionNo || ""
      };
    },
    collectFileRows(nodes, acc) {
      (nodes || []).forEach(node => {
        this.getNodeFiles(node).forEach(file => {
          acc.push(this.mapFileRow(node, file));
        });
        if (node && node.children && node.children.length) {
          this.collectFileRows(node.children, acc);
        }
      });
      return acc;
    },
    open(detail) {
      this.model = detail || {};
      this.filterText = "";
      this.keyword = "";
      this.descKeyword = "";
      this.current = 1;
      this.currentNode = null;
      this.multipleSelection = [];
      this.dialogVisible = true;
      this.$nextTick(() => {
        this.clearSelection();
        this.applyTree(this.model.resourceDirectoryTree);
        this.loadTree();
      });
    },
    close() {
      this.dialogVisible = false;
    },
    onClose() {
      this.model = {};
      this.treeData = [];
      this.tableData = [];
      this.allFileRows = [];
      this.currentNode = null;
      this.multipleSelection = [];
    },
    applyTree(tree) {
      this.treeData = Array.isArray(tree) ? tree : [];
      this.nodeMap = this.flattenTree(this.treeData, {});
      if (this.currentNode && this.currentNode.id) {
        this.currentNode = this.nodeMap[this.currentNode.id] || this.currentNode;
      }
      this.getList();
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
    onTreeNodeClick(data) {
      this.currentNode = data;
      this.current = 1;
      this.clearSelection();
      this.getList();
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
    matchKeyword(row) {
      const nameKey = (this.keyword || "").trim().toLowerCase();
      const descKey = (this.descKeyword || "").trim().toLowerCase();
      if (nameKey) {
        const text = [
          row.modelName,
          row.modelNo,
          row.originalName,
          row.fileId
        ]
          .join(" ")
          .toLowerCase();
        if (text.indexOf(nameKey) === -1) return false;
      }
      if (descKey && (row.remark || "").toLowerCase().indexOf(descKey) === -1) {
        return false;
      }
      return true;
    },
    applyPagedRows(rows) {
      const list = (rows || []).filter(item => this.matchKeyword(item));
      this.allFileRows = list;
      this.total = list.length;
      const maxPage = Math.max(1, Math.ceil(this.total / this.size) || 1);
      if (this.current > maxPage) this.current = maxPage;
      const start = (this.current - 1) * this.size;
      this.tableData = list.slice(start, start + this.size);
    },
    collectFilteredTreeRows() {
      const roots = this.currentNode ? [this.currentNode] : this.treeData;
      return this.collectFileRows(roots, []);
    },
    mergeFileRows(treeRows, itemRows) {
      const merged = [];
      const seen = {};
      (treeRows || []).concat(itemRows || []).forEach(row => {
        const key =
          row.rowKey ||
          row.fileId ||
          row.absoluteFileUrl ||
          row.id ||
          row.modelName;
        if (!key || seen[key]) return;
        seen[key] = true;
        merged.push(row);
      });
      return merged;
    },
    getList() {
      const treeRows = this.collectFilteredTreeRows();
      if (!this.model.id) {
        this.applyPagedRows(treeRows);
        return;
      }
      this.loading = true;
      const params = {
        current: 1,
        size: 500,
        modelResourceId: this.model.id,
        keyword: (this.keyword || "").trim()
      };
      if (this.currentNode && this.currentNode.id) {
        params.resourceDirectoryId = this.currentNode.id;
      }
      api
        .pageModelResourceItems(params)
        .then(res => {
          this.loading = false;
          const records =
            this.isSuccessCode(res && res.code) && res.data
              ? res.data.records || []
              : [];
          const itemRows = records.map(item => this.mapItemRow(item));
          this.applyPagedRows(this.mergeFileRows(treeRows, itemRows));
        })
        .catch(() => {
          this.loading = false;
          this.applyPagedRows(treeRows);
        });
    },
    openEditModel() {
      this.$emit("edit-model", this.model);
    },
    updateModel(detail) {
      if (detail) this.model = Object.assign({}, this.model, detail);
    },
    getFileUrl(row) {
      return (row && (row.absoluteFileUrl || row.fileUrl)) || "";
    },
    previewRow(row) {
      const url = this.getFileUrl(row);
      if (!url) {
        this.$message.warning(this.$t("lang.no_file_to_preview"));
        return;
      }
      window.open(url, "_blank");
    },
    downloadByUrl(url, filename) {
      if (!url) {
        return Promise.reject({ msg: this.$t("lang.no_file_to_download") });
      }
      const link = document.createElement("a");
      link.href = url;
      link.download = filename || "模型文件";
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return Promise.resolve();
    },
    downloadByRow(row) {
      const url = this.getFileUrl(row);
      const filename = (row && (row.originalName || row.modelName)) || "模型文件";
      return this.downloadByUrl(url, filename);
    },
    downloadRow(row) {
      this.downloadByRow(row).catch(err => {
        this.$message.error((err && err.msg) || this.$t("cm.fail"));
      });
    },
    batchDownload() {
      if (!this.multipleSelection.length) {
        this.$message.warning(this.$t("lang.select_download_model"));
        return;
      }
      const tasks = this.multipleSelection.map(row => this.downloadByRow(row));
      Promise.all(tasks)
        .then(() => {
          this.$message.success(this.$t("cm.download") + this.$t("cm.success"));
        })
        .catch(err => {
          this.$message.error((err && err.msg) || this.$t("cm.fail"));
        });
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
          this.loadTree();
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
      api
        .updateModelResourceItem({
          id: payload.id,
          modelResourceId: this.model.id,
          resourceDirectoryId:
            payload.resourceDirectoryId ||
            (this.currentNode && this.currentNode.id) ||
            "",
          fileIds: payload.fileIds || [],
          remark: payload.remark || ""
        })
        .then(res => {
          dialog && dialog.finishSave();
          if (this.isSuccessCode(res && res.code)) {
            dialog && dialog.close();
            this.$message.success(this.$t("cm.edit_succ"));
            this.loadTree();
          } else {
            this.$message.error((res && res.msg) || this.$t("cm.fail"));
          }
        })
        .catch(() => {
          dialog && dialog.finishSave();
        });
    }
  }
};
</script>

<style lang="less">
.model-library-dialog {
  margin-top: 1vh !important;
  height: 98vh;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  overflow: hidden;
  .el-dialog__header {
    flex-shrink: 0;
    padding: 12px 20px;
  }
  .el-dialog__headerbtn {
    top: 14px;
  }
  .el-dialog__body {
    flex: 1;
    min-height: 0;
    padding: 0 16px 12px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
}
</style>
<style lang="less" scoped>
.library-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-right: 24px;
}
.library-body {
  display: flex;
  flex: 1;
  min-height: 0;
  height: 100%;
}
.library-tree {
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 4px 12px 0 0;
  border-right: 1px solid #ebeef5;
}
.tree-search-box {
  flex-shrink: 0;
}
.tree-title {
  flex-shrink: 0;
  margin: 12px 0 8px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}
.library-tree-list {
  flex: 1;
  min-height: 0;
  overflow: auto;
}
.library-main {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding-left: 16px;
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
  font-size: 14px;
}
</style>
