import breadcrumb from "@/components/common/breadcrumb";
import queryForm from "@/components/common/queryForm";
import { throttle } from "@/utils/funcUtil";
import { calcHeight } from "@/utils/funcUtil";
import api from "../api";

const PIPE_DIRECTORY_TYPE = 0;

export default {
  components: {
    breadcrumb,
    queryForm
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
      allList: [],
      tableData: [],
      queryFields: [
        {
          name: "keyword",
          label: "",
          labelKey: "lang.resource_keyword",
          value: "",
          type: "input",
          display: true,
          order: 1
        },
        {
          name: "modelPreview",
          label: "",
          labelKey: "lang.model_preview",
          value: "",
          type: "select",
          display: true,
          order: 2,
          fieldMap: [
            { label: "", labelKey: "lang.model_preview_3d", value: "3d" },
            { label: "", labelKey: "lang.model_preview_2d", value: "2d" },
            { label: "", labelKey: "lang.model_preview_none", value: "none" }
          ]
        }
      ],
      current: 1,
      size: 10,
      total: 0,
      multipleSelection: [],
      loading: false
    };
  },
  computed: {
    computedTreeHeight() {
      return this.maxTreeHeight;
    },
    computedTableHeight() {
      return this.maxTableHeight;
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
    collectNodeIds(node) {
      const ids = [node.id];
      (node.children || []).forEach(child => {
        ids.push.apply(ids, this.collectNodeIds(child));
      });
      return ids;
    },
    onTreeNodeClick(data) {
      this.currentNode = data;
      this.current = 1;
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
      return {
        keyword: (queryForm.keyword || "").trim(),
        modelPreview: queryForm.modelPreview || ""
      };
    },
    search() {
      this.current = 1;
      this.getList();
    },
    getList() {
      this.loading = true;
      const { keyword, modelPreview } = this.getQueryParams();
      const nodeIds = this.currentNode ? this.collectNodeIds(this.currentNode) : [];
      const filtered = this.allList.filter(item => {
        const matchTree = !nodeIds.length ? true : nodeIds.indexOf(item.treeId) !== -1;
        const matchKeyword = !keyword
          ? true
          : [item.code, item.pipeName, item.owner]
              .join(" ")
              .toLowerCase()
              .indexOf(keyword.toLowerCase()) !== -1;
        const matchModel = !modelPreview ? true : item.modelPreview === modelPreview;
        return matchTree && matchKeyword && matchModel;
      });
      this.total = filtered.length;
      const start = (this.current - 1) * this.size;
      this.tableData = filtered.slice(start, start + this.size);
      this.loading = false;
    },
    previewRow(row) {
      this.$message.info(this.$t("cm.preview") + "：" + row.code);
    },
    downloadRow(row) {
      this.$message.success(this.$t("cm.download") + "：" + row.code);
    },
    handleMore(command, row) {
      if (command === "edit") {
        this.$message.info(this.$t("cm.edit") + "：" + row.code);
        return;
      }
      if (command === "delete") {
        this.$confirm(this.$t("cm.delete") + " " + row.code + " ?", this.$t("cm.tips"), {
          confirmButtonText: this.$t("cm.confirm"),
          cancelButtonText: this.$t("cm.cancel"),
          type: "warning"
        })
          .then(() => {
            this.allList = this.allList.filter(item => item.id !== row.id);
            if ((this.current - 1) * this.size >= this.allList.length && this.current > 1) {
              this.current -= 1;
            }
            this.getList();
            this.$message.success(this.$t("cm.success"));
          })
          .catch(() => {});
      }
    },
    exportList() {
      if (!this.tableData.length) {
        this.$message.warning(this.$t("cm.nodata"));
        return;
      }
      this.$message.success(this.$t("cm.export") + this.$t("cm.success"));
    },
    triggerImport() {
      this.$refs.importInput && this.$refs.importInput.click();
    },
    onImportFile(e) {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      this.$message.success(this.$t("lang.batch_import") + this.$t("cm.success"));
      e.target.value = "";
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
