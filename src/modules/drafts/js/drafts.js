import breadcrumb from "@/components/common/breadcrumb";
import queryForm from "@/components/common/queryForm";
import { throttle } from "@/utils/funcUtil";
import { calcHeight } from "@/utils/funcUtil";
import api from "../api";
import pipeDetail from "../components/pipeDetail.vue";
import directoryDetail from "../components/directoryDetail.vue";

const PIPE_DIRECTORY_TYPE = 0;

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
        label: "name"
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
      return (data.name || "").toLowerCase().indexOf(keyword) !== -1;
    },
    isSuccessCode(code) {
      return code === 0 || code === "0";
    },
    getTreeList() {
      this.treeLoading = true;
      api
        .getResourceDirectoryTree({ type: PIPE_DIRECTORY_TYPE })
        .then(res => {
          this.treeLoading = false;
          if (this.isSuccessCode(res && res.code)) {
            this.treeData = Array.isArray(res.data) ? res.data : [];
            this.currentNode = null;
            this.$nextTick(() => {
              if (this.$refs.resourceTree) {
                this.$refs.resourceTree.setCurrentKey(null);
              }
            });
            this.getList();
          } else {
            this.treeData = [];
            this.currentNode = null;
            this.$message.error((res && res.msg) || this.$t("cm.fail"));
            this.getList();
          }
          this.$nextTick(() => {
            this.initMaxHeight();
          });
        })
        .catch(() => {
          this.treeLoading = false;
          this.treeData = [];
          this.currentNode = null;
          this.getList();
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
      const level = this.getNodeLevel(data);
      if (level === 5) {
        this.openDirectoryDetail(data.id);
        return;
      }
      if (level === 4) {
        this.loadChildrenToTable(data);
        return;
      }
      this.listFromChildren = false;
      this.childrenAll = [];
      this.getList();
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
            this.$set(node, "children", children);
            this.applyChildrenList();
            this.$nextTick(() => {
              const treeNode =
                this.$refs.resourceTree &&
                this.$refs.resourceTree.getNode(node.id);
              if (treeNode) treeNode.expanded = true;
            });
            this.$nextTick(() => {
              const treeNode =
                this.$refs.resourceTree &&
                this.$refs.resourceTree.getNode(node.id);
              if (treeNode) treeNode.expanded = true;
            });
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
        pipelineName: item.pipelineName || item.name,
        pipelineNo: item.pipelineNo || "",
        specCode: item.specCode || item.name
      });
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
            item.pipelineNo,
            item.pipelineName,
            item.name,
            item.specCode
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
    getList() {
      if (this.listFromChildren) {
        this.applyChildrenList();
        this.$nextTick(() => {
          this.initMaxHeight();
        });
        return;
      }
      this.loading = true;
      api
        .pagePipelines(this.getQueryParams())
        .then(res => {
          this.loading = false;
          if (this.isSuccessCode(res && res.code)) {
            const data = res.data || {};
            this.tableData = data.records || [];
            this.total = data.total || 0;
          } else {
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
          this.tableData = [];
          this.total = 0;
        });
    },
    viewRow(row) {
      if (this.listFromChildren || this.getNodeLevel(row) === 5) {
        this.openDirectoryDetail(row.id);
        return;
      }
      this.detailMode = "pipeline";
      this.currentPipelineId = row.id;
      this.currentDirectoryId = "";
      this.detailVisible = true;
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
      api
        .exportPipelines({ ids: [row.id] }, (row.pipelineNo || "管道") + ".xlsx")
        .then(() => {
          this.$message.success(this.$t("cm.export") + this.$t("cm.success"));
        })
        .catch(err => {
          this.$message.error((err && err.msg) || this.$t("cm.fail"));
        });
    },
    deleteRow(row) {
      this.$confirm(
        this.$t("cm.delete") + " " + (row.pipelineNo || row.pipelineName) + " ?",
        this.$t("cm.tips"),
        {
          confirmButtonText: this.$t("cm.confirm"),
          cancelButtonText: this.$t("cm.cancel"),
          type: "warning"
        }
      )
        .then(() => {
          return api.deletePipelines({ ids: [row.id] });
        })
        .then(res => {
          if (this.isSuccessCode(res && res.code)) {
            if ((this.current - 1) * this.size >= this.total - 1 && this.current > 1) {
              this.current -= 1;
            }
            this.getList();
            this.$message.success(this.$t("cm.success"));
          } else {
            this.$message.error((res && res.msg) || this.$t("cm.fail"));
          }
        })
        .catch(() => {});
    },
    exportList() {
      const params = this.getQueryParams();
      if (this.multipleSelection.length) {
        params.ids = this.multipleSelection.map(item => item.id);
      }
      api
        .exportPipelines(params, "管道数据.xlsx")
        .then(() => {
          this.$message.success(this.$t("cm.export") + this.$t("cm.success"));
        })
        .catch(err => {
          this.$message.error((err && err.msg) || this.$t("cm.fail"));
        });
    },
    downloadTemplate() {
      api
        .downloadPipelineTemplate()
        .then(() => {
          this.$message.success(this.$t("cm.download") + this.$t("cm.success"));
        })
        .catch(err => {
          this.$message.error((err && err.msg) || this.$t("cm.fail"));
        });
    },
    triggerImport() {
      this.$refs.importInput && this.$refs.importInput.click();
    },
    onImportFile(e) {
      const file = e.target.files && e.target.files[0];
      e.target.value = "";
      if (!file) return;
      const formData = new FormData();
      formData.append("file", file);
      this.loading = true;
      api
        .importPipelines(formData)
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
            this.getList();
          } else {
            this.$message.error((res && res.msg) || this.$t("cm.fail"));
          }
        })
        .catch(() => {
          this.loading = false;
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
