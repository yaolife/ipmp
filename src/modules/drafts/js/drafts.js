import breadcrumb from "@/components/common/breadcrumb";
import queryForm from "@/components/common/queryForm";
import { throttle } from "@/utils/funcUtil";
import { calcHeight } from "@/utils/funcUtil";
import api from "../api";
import pipeDetail from "../components/pipeDetail.vue";

const PIPE_DIRECTORY_TYPE = 0;

export default {
  components: {
    breadcrumb,
    queryForm,
    pipeDetail
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
      currentPipelineId: ""
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
            this.selectFirstTreeNode();
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
    selectFirstTreeNode() {
      this.$nextTick(() => {
        if (!this.treeData.length) {
          this.currentNode = null;
          this.getList();
          return;
        }
        const first = this.treeData[0];
        if (this.$refs.resourceTree) {
          this.$refs.resourceTree.setCurrentKey(first.id);
        }
        this.currentNode = first;
        this.getList();
      });
    },
    onTreeNodeClick(data) {
      this.currentNode = data;
      this.current = 1;
      this.closeDetail();
      this.getList();
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
    getList() {
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
      this.currentPipelineId = row.id;
      this.detailVisible = true;
    },
    closeDetail() {
      this.detailVisible = false;
      this.currentPipelineId = "";
      this.$nextTick(() => {
        if (this.currentNode && this.$refs.resourceTree) {
          this.$refs.resourceTree.setCurrentKey(this.currentNode.id);
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
