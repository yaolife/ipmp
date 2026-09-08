<template>
  <el-dialog
    :visible.sync="dialogVisible"
    width="92%"
    top="4vh"
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
            :placeholder="$t('lang.model_keyword_placeholder')"
            size="small"
            clearable
            class="library-keyword"
            @keyup.enter.native="search"
          ></el-input>
          <el-button type="primary" size="small" @click="search">{{
            $t("cm.query")
          }}</el-button>
          <div class="library-actions">
            <el-button type="primary" size="small" @click="triggerAdd">{{
              $t("cm.add")
            }}</el-button>
            <el-button type="primary" size="small" @click="triggerImport">{{
              $t("lang.batch_import")
            }}</el-button>
            <input
              ref="addInput"
              type="file"
              :accept="acceptAttr"
              style="display: none"
              @change="onAddFile"
            />
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
        <el-table
          :data="tableData"
          ref="itemTable"
          v-loading="loading"
          :empty-text="$t('cm.nodata')"
          border
          stripe
          height="460"
          header-row-class-name="cud-office-table-header"
          class="cud-office-table"
        >
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
            width="220"
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
                @click="editItem(scope.row)"
                >{{ $t("cm.edit") }}</el-button
              >
              <el-button
                type="text"
                size="small"
                class="cud-common-operate-edit"
                @click="downloadRow(scope.row)"
                >{{ $t("cm.download") }}</el-button
              >
              <el-button
                type="text"
                size="small"
                class="cud-common-operate-delete"
                @click="deleteRow(scope.row)"
                >{{ $t("cm.delete") }}</el-button
              >
            </template>
          </el-table-column>
        </el-table>
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

const PIPE_DIRECTORY_TYPE = 0;
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
      importing: false,
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
      tableData: [],
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
      return (data.nodeName || "").toLowerCase().indexOf(value.toLowerCase()) !== -1;
    },
    getFirstFile(row) {
      const files = (row && row.files) || [];
      return files[0] || {};
    },
    mapItemRow(item) {
      const node = this.nodeMap[item.resourceDirectoryId] || {};
      const file = this.getFirstFile(item);
      return Object.assign({}, item, {
        modelNo: node.nodeName || item.id || "",
        displayName:
          node.name || file.originalName || item.remark || item.id || "",
        originalName: file.originalName || "",
        fileSuffix: file.fileSuffix || "",
        fileSize: file.fileSize,
        fileId: file.id || splitFileIds(item.fileIds)[0] || "",
        fileIds: this.getFileIds(item),
        absoluteFileUrl: file.absoluteFileUrl || "",
        fileUrl: file.fileUrl || "",
        versionNo: item.versionNo || this.model.versionNo || ""
      });
    },
    open(detail) {
      this.model = detail || {};
      this.filterText = "";
      this.keyword = "";
      this.current = 1;
      this.currentNode = null;
      this.dialogVisible = true;
      this.$nextTick(() => {
        this.loadTree();
        this.getList();
      });
    },
    close() {
      this.dialogVisible = false;
    },
    onClose() {
      this.model = {};
      this.treeData = [];
      this.tableData = [];
      this.currentNode = null;
    },
    loadTree() {
      this.treeLoading = true;
      api
        .getResourceDirectoryTree({ type: PIPE_DIRECTORY_TYPE })
        .then(res => {
          this.treeLoading = false;
          if (this.isSuccessCode(res && res.code)) {
            this.treeData = Array.isArray(res.data) ? res.data : [];
            this.nodeMap = this.flattenTree(this.treeData, {});
            this.tableData = this.tableData.map(item => this.mapItemRow(item));
          } else {
            this.treeData = [];
            this.nodeMap = {};
            this.$message.error((res && res.msg) || this.$t("cm.fail"));
          }
        })
        .catch(() => {
          this.treeLoading = false;
          this.treeData = [];
          this.nodeMap = {};
        });
    },
    onTreeNodeClick(data) {
      this.currentNode = data;
      this.current = 1;
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
    getList() {
      if (!this.model.id) return;
      this.loading = true;
      const params = {
        current: this.current,
        size: this.size,
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
          if (this.isSuccessCode(res && res.code)) {
            const data = res.data || {};
            this.total = data.total || 0;
            this.tableData = (data.records || []).map(item => this.mapItemRow(item));
          } else {
            this.tableData = [];
            this.total = 0;
            this.$message.error((res && res.msg) || this.$t("cm.fail"));
          }
        })
        .catch(() => {
          this.loading = false;
          this.tableData = [];
          this.total = 0;
        });
    },
    openEditModel() {
      this.$emit("edit-model", this.model);
    },
    updateModel(detail) {
      if (detail) this.model = Object.assign({}, this.model, detail);
    },
    getFileIds(row) {
      const fromFiles = ((row && row.files) || [])
        .map(item => item && item.id)
        .filter(Boolean);
      if (fromFiles.length) return fromFiles;
      return splitFileIds(row && row.fileIds);
    },
    previewRow(row) {
      if (!row || !row.id) return;
      api
        .getModelResourceItemDetail(row.id)
        .then(res => {
          if (!this.isSuccessCode(res && res.code) || !res.data) {
            this.$message.error((res && res.msg) || this.$t("cm.fail"));
            return;
          }
          const detail = this.mapItemRow(res.data);
          const url = detail.absoluteFileUrl || detail.fileUrl;
          if (!url) {
            this.$message.warning(this.$t("lang.no_file_to_preview"));
            return;
          }
          window.open(url, "_blank");
        })
        .catch(err => {
          this.$message.error((err && err.msg) || this.$t("cm.fail"));
        });
    },
    downloadByRow(row) {
      const fileId = this.getFileIds(row)[0];
      const filename = row.originalName || row.displayName || "模型文件";
      if (fileId) {
        return api.downloadSysFile(fileId, filename);
      }
      const url = row.absoluteFileUrl || row.fileUrl;
      if (!url) {
        return Promise.reject({ msg: this.$t("lang.no_file_to_download") });
      }
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return Promise.resolve();
    },
    downloadRow(row) {
      this.downloadByRow(row).catch(err => {
        this.$message.error((err && err.msg) || this.$t("cm.fail"));
      });
    },
    triggerAdd() {
      if (!this.currentNode || !this.currentNode.id) {
        this.$message.warning(this.$t("lang.select_resource_node"));
        return;
      }
      this.$refs.addInput && this.$refs.addInput.click();
    },
    onAddFile(e) {
      const file = e.target.files && e.target.files[0];
      e.target.value = "";
      if (file) this.onImportFiles({ target: { files: [file], value: "" } });
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
          this.getList();
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
    editItem(row) {
      if (!row || !row.id) return;
      api
        .getModelResourceItemDetail(row.id)
        .then(res => {
          if (!this.isSuccessCode(res && res.code) || !res.data) {
            this.$message.error((res && res.msg) || this.$t("cm.fail"));
            return;
          }
          const detail = this.mapItemRow(res.data);
          this.$refs.replaceDialog && this.$refs.replaceDialog.open(detail);
        })
        .catch(err => {
          this.$message.error((err && err.msg) || this.$t("cm.fail"));
        });
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
            this.getList();
          } else {
            this.$message.error((res && res.msg) || this.$t("cm.fail"));
          }
        })
        .catch(() => {
          dialog && dialog.finishSave();
        });
    },
    deleteRow(row) {
      this.$confirm(
        this.$t("lang.delete_model_item_confirm"),
        this.$t("cm.tips"),
        {
          confirmButtonText: this.$t("lang.confirm_delete"),
          cancelButtonText: this.$t("cm.cancel"),
          type: "warning"
        }
      )
        .then(() => api.deleteModelResourceItems({ ids: [row.id] }))
        .then(res => {
          if (this.isSuccessCode(res && res.code)) {
            this.$message.success(this.$t("cm.deletesuccess"));
            this.getList();
          } else {
            this.$message.error((res && res.msg) || this.$t("cm.fail"));
          }
        })
        .catch(() => {});
    }
  }
};
</script>

<style lang="less">
.model-library-dialog {
  border-radius: 8px;
  .el-dialog__body {
    padding: 8px 16px 16px;
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
  min-height: 560px;
}
.library-tree {
  width: 260px;
  flex-shrink: 0;
  padding-right: 12px;
  border-right: 1px solid #ebeef5;
}
.tree-title {
  margin: 10px 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}
.library-tree-list {
  height: 480px;
  overflow: auto;
}
.library-main {
  flex: 1;
  min-width: 0;
  padding-left: 16px;
}
.library-toolbar {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}
.library-keyword {
  width: 240px;
  margin-right: 8px;
}
.library-actions {
  margin-left: auto;
}
.custom-tree-node {
  font-size: 14px;
}
</style>
