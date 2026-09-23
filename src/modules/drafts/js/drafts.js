import breadcrumb from "@/components/common/breadcrumb";
import queryForm from "@/components/common/queryForm";
import { throttle } from "@/utils/funcUtil";
import { calcHeight } from "@/utils/funcUtil";
import axios from "@/api/http";
import api from "../api";
import pipeDetail from "../components/pipeDetail.vue";
import directoryDetail from "../components/directoryDetail.vue";
import { getComponentTypeLabel } from "@/constant/componentType";

export default {
  components: {
    breadcrumb,
    queryForm,
    pipeDetail,
    directoryDetail
  },
  data: function () {
    return {
      hasIcon: false,
      brand: [{ name: "lang.asset_manage" }, { name: "lang.pipe_database" }],
      filterText: "",
      treeData: [],
      treeProps: {
        children: "children",
        label: "nodeName"
      },
      currentNode: null,
      treeLoading: false,
      isTreeCollapse: false,
      maxTreeHeight: 0,
      maxTableHeight: 0,
      maxRightHeight: 0,
      treeBlockHeight: 0,
      tableBlockHeight: 0,
      tableData: [],
      childrenAll: [],
      listFromChildren: false,
      queryFields: [
        {
          name: "keyword",
          label: "",
          labelKey: "lang.pipe_keyword",
          value: "",
          type: "input",
          display: true,
          order: 1
        },
        {
          name: "responsiblePerson",
          label: "",
          labelKey: "lang.pipe_owner",
          value: "",
          type: "input",
          display: true,
          order: 2
        }
      ],
      current: 1,
      size: 10,
      total: 0,
      multipleSelection: [],
      loading: false,
      detailVisible: false,
      detailMode: "pipeline",
      currentPipelineId: "",
      currentDirectoryId: ""
    };
  },
  computed: {
    computedTreeHeight() {
      return this.maxTreeHeight;
    },
    computedTableHeight() {
      return this.maxTableHeight;
    },
    computedDetailHeight() {
      return this.maxRightHeight > 0 ? this.maxRightHeight + 185 : 560;
    }
  },
  watch: {
    filterText(val) {
      this.filterText = (val || "").trim();
      this.$refs.resourceTree && this.$refs.resourceTree.filter(this.filterText);
    }
  },
  methods: {
    initMaxHeight() {
      calcHeight(this);
    },
    indexMethod(index) {
      return (this.current - 1) * this.size + index + 1;
    },
    toggleTreeExpand() {
      this.isTreeCollapse = !this.isTreeCollapse;
      this.$nextTick(() => {
        this.initMaxHeight();
      });
    },
    filterTreeNode(value, data) {
      if (!value) return true;
      const keyword = value.toLowerCase();
      return (data.nodeName || "").toLowerCase().indexOf(keyword) !== -1;
    },
    isSuccessCode(code) {
      return code === 0 || code === "0";
    },
    findTreeNode(list, id) {
      if (!id || !Array.isArray(list)) return null;
      for (let i = 0; i < list.length; i++) {
        const item = list[i];
        if (item && item.id === id) return item;
        const found = this.findTreeNode(item && item.children, id);
        if (found) return found;
      }
      return null;
    },
    getTreeList(options) {
      const keepCurrent = options && options.keepCurrent;
      const skipList = options && options.skipList;
      const prevId = keepCurrent && this.currentNode ? this.currentNode.id : "";
      this.treeLoading = true;
      axios
        .get("/api/model-resource-directories/tree/latest-enabled-model", {
          apiTitle: "查询最新启用模型资源目录树"
        })
        .then(response => response.data)
        .then(res => {
          this.treeLoading = false;
          if (this.isSuccessCode(res && res.code)) {
            this.treeData = Array.isArray(res.data) ? res.data : [];
            const nextNode = prevId
              ? this.findTreeNode(this.treeData, prevId)
              : null;
            this.currentNode = nextNode;
            this.$nextTick(() => {
              if (this.$refs.resourceTree) {
                this.$refs.resourceTree.setCurrentKey(
                  nextNode ? nextNode.id : null
                );
              }
            });
            if (!skipList) {
              if (nextNode) {
                this.getList();
              } else {
                this.clearTable();
              }
            }
          } else {
            this.treeData = [];
            this.currentNode = null;
            this.$message.error((res && res.msg) || this.$t("cm.fail"));
            this.clearTable();
          }
          this.$nextTick(() => {
            this.initMaxHeight();
          });
        })
        .catch(() => {
          this.treeLoading = false;
          this.treeData = [];
          this.currentNode = null;
          this.clearTable();
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
      if (this.getNodeLevel(data) === 5) {
        this.openDirectoryDetail(data.id);
        return;
      }
      this.loadChildrenToTable(data);
    },
    loadChildrenToTable(node) {
      if (!node || !node.id) return;
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
            this.childrenAll = children;
            this.applyChildrenList();
          } else {
            this.childrenAll = [];
            this.tableData = [];
            this.total = 0;
            this.$message.error((res && res.msg) || this.$t("cm.fail"));
          }
          this.$nextTick(() => {
            this.initMaxHeight();
          });
        })
        .catch(() => {
          this.loading = false;
          this.childrenAll = [];
          this.tableData = [];
          this.total = 0;
        });
    },
    mapDirectoryRow(item) {
      return Object.assign({}, item, {
        nodeName: item.nodeName || "",
        name: item.name || "",
        pipelineName: item.pipelineName || "",
        pipelineNo: item.pipelineNo || "",
        specCode: item.specCode || "",
        componentType: item.componentType
      });
    },
    formatComponentType(row, column, cellValue) {
      return getComponentTypeLabel(cellValue, this.$t.bind(this));
    },
    applyChildrenList() {
      const queryForm = this.$refs.queryForm
        ? this.$refs.queryForm.getQueryForm()
        : {};
      const keyword = (queryForm.keyword || "").trim().toLowerCase();
      const person = (queryForm.responsiblePerson || "").trim().toLowerCase();
      let list = this.childrenAll.map(item => this.mapDirectoryRow(item));
      if (keyword) {
        list = list.filter(item => {
          const text = [
            item.nodeName,
            item.name,
            item.pipelineNo,
            item.pipelineName,
            item.specCode,
            getComponentTypeLabel(item.componentType, this.$t.bind(this))
          ]
            .join(" ")
            .toLowerCase();
          return text.indexOf(keyword) !== -1;
        });
      }
      if (person) {
        list = list.filter(item =>
          (item.responsiblePerson || "").toLowerCase().indexOf(person) !== -1
        );
      }
      this.total = list.length;
      const maxPage = Math.max(1, Math.ceil(this.total / this.size) || 1);
      if (this.current > maxPage) {
        this.current = maxPage;
      }
      const start = (this.current - 1) * this.size;
      this.tableData = list.slice(start, start + this.size);
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
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
    getQueryParams() {
      const queryForm = this.$refs.queryForm
        ? this.$refs.queryForm.getQueryForm()
        : {};
      const params = {
        current: this.current,
        size: this.size
      };
      if (this.currentNode && this.currentNode.id) {
        params.directoryId = this.currentNode.id;
      }
      const keyword = (queryForm.keyword || "").trim();
      const responsiblePerson = (queryForm.responsiblePerson || "").trim();
      if (keyword) params.keyword = keyword;
      if (responsiblePerson) params.responsiblePerson = responsiblePerson;
      return params;
    },
    search() {
      this.current = 1;
      this.getList();
    },
    resetList() {
      this.currentNode = null;
      this.current = 1;
      this.listFromChildren = false;
      this.childrenAll = [];
      this.$nextTick(() => {
        if (this.$refs.resourceTree) {
          this.$refs.resourceTree.setCurrentKey(null);
        }
        this.getList();
      });
    },
    clearTable() {
      this.listFromChildren = false;
      this.childrenAll = [];
      this.tableData = [];
      this.total = 0;
      this.$nextTick(() => {
        this.initMaxHeight();
      });
    },
    getList() {
      if (this.listFromChildren) {
        this.applyChildrenList();
        this.$nextTick(() => {
          this.initMaxHeight();
        });
        return;
      }
      if (
        this.currentNode &&
        this.currentNode.id &&
        this.getNodeLevel(this.currentNode) !== 5
      ) {
        this.loadChildrenToTable(this.currentNode);
        return;
      }
      this.clearTable();
    },
    viewRow(row) {
      this.openDirectoryDetail(row.id);
    },
    openDirectoryDetail(id) {
      if (!id) return;
      this.detailMode = "directory";
      this.currentDirectoryId = id;
      this.currentPipelineId = "";
      this.detailVisible = true;
    },
    closeDetail() {
      this.detailVisible = false;
      this.detailMode = "pipeline";
      this.currentPipelineId = "";
      this.currentDirectoryId = "";
      this.$nextTick(() => {
        if (this.currentNode && this.$refs.resourceTree) {
          this.$refs.resourceTree.setCurrentKey(this.currentNode.id);
        } else if (this.$refs.resourceTree) {
          this.$refs.resourceTree.setCurrentKey(null);
        }
        this.initMaxHeight();
      });
    },
    downloadRow(row) {
      const nodeName = row && row.nodeName;
      if (!nodeName) {
        this.$message.warning(this.$t("lang.select_delete_item"));
        return;
      }
      api
        .exportResourceDirectoryData(
          {
            nodeNames: [nodeName]
          },
          nodeName + ".xlsx"
        )
        .then(() => {
          this.$message.success(this.$t("cm.export") + this.$t("cm.success"));
        })
        .catch(err => {
          this.$message.error((err && err.msg) || this.$t("cm.fail"));
        });
    },
    deleteRow(row) {
      this.deleteDirectories(
        [row.id],
        row.name || row.pipelineName || row.specCode,
        true
      );
    },
    deleteDirectories(ids, displayName, keepCurrent) {
      if (!ids || !ids.length) {
        this.$message.warning(this.$t("lang.select_delete_item"));
        return;
      }
      const message =
        ids.length > 1
          ? this.$t("lang.delete_resource_batch_confirm")
          : this.$t("lang.delete_resource_confirm") +
            (displayName ? "（" + displayName + "）" : "");
      this.$confirm(message, this.$t("cm.tips"), {
        confirmButtonText: this.$t("cm.confirm"),
        cancelButtonText: this.$t("cm.cancel"),
        type: "warning"
      })
        .then(() => {
          return api.deleteResourceDirectories({ ids });
        })
        .then(res => {
          if (this.isSuccessCode(res && res.code)) {
            this.$message.success(this.$t("cm.deletesuccess"));
            this.getTreeList(keepCurrent ? { keepCurrent: true } : undefined);
          } else {
            this.$message.error((res && res.msg) || this.$t("cm.fail"));
          }
        })
        .catch(() => {});
    },
    exportList() {
      const params = {
        nodeNames: []
      };
      if (this.multipleSelection.length) {
        const nodeNames = this.multipleSelection
          .map(item => item.nodeName)
          .filter(name => !!name);
        if (!nodeNames.length) {
          this.$message.warning(this.$t("lang.select_delete_item"));
          return;
        }
        params.nodeNames = nodeNames;
      }
      api
        .exportResourceDirectoryData(params, "管道数据.xlsx")
        .then(() => {
          this.$message.success(this.$t("cm.export") + this.$t("cm.success"));
        })
        .catch(err => {
          this.$message.error((err && err.msg) || this.$t("cm.fail"));
        });
    },
    downloadTemplate() {
      api
        .downloadResourceDirectoryTemplate()
        .then(() => {
          this.$message.success(this.$t("cm.download") + this.$t("cm.success"));
        })
        .catch(err => {
          this.$message.error((err && err.msg) || this.$t("cm.fail"));
        });
    },
    triggerImport() {
      if (!this.currentNode || !this.currentNode.nodeName) {
        this.$message.warning(this.$t("lang.select_resource_node"));
        return;
      }
      this.$refs.importInput && this.$refs.importInput.click();
    },
    onImportFile(e) {
      const file = e.target.files && e.target.files[0];
      e.target.value = "";
      if (!file) return;
      const nodeName = this.currentNode && this.currentNode.nodeName;
      if (!nodeName) {
        this.$message.warning(this.$t("lang.select_resource_node"));
        return;
      }
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", nodeName);
      this.loading = true;
      api
        .importResourceDirectoryData(formData)
        .then(res => {
          this.loading = false;
          if (this.isSuccessCode(res && res.code)) {
            const data = res.data || {};
            this.$message.success(
              this.$t("lang.import_result") +
                " " +
                (data.successCount || 0) +
                "/" +
                (data.total || 0)
            );
            this.current = 1;
            this.listFromChildren = false;
            this.childrenAll = [];
            this.getList();
          } else {
            this.$message.error((res && res.msg) || this.$t("cm.fail"));
          }
        })
        .catch(err => {
          this.loading = false;
          this.$message.error((err && err.msg) || this.$t("cm.fail"));
        });
    }
  },
  mounted() {
    this.initMaxHeight();
    this.throttleFunc = throttle(this.initMaxHeight, 500);
    window.addEventListener("resize", this.throttleFunc);
    this.getTreeList();
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.throttleFunc);
  }
};
