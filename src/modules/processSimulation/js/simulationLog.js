//引入组件
import breadcrumb from "@/components/common/breadcrumb";
import cmsg from "@/components/common/message";
import { throttle } from "@/utils/funcUtil";
import ht from "@/api/http";
// import workflowManageAPI from "../../../../cudcomponents/workflowModule/workflow/wfTemplateManage/api/index";
import PersonSelect from "@@/components/easy-cud-person-select";
import queryForm from "@/components/common/queryForm";
import { calcHeight } from "@/utils/funcUtil";

export default {
  components: {
    breadcrumb,
    PersonSelect,
    queryForm
  },
  //过滤流程分类的名称
  watch: {
    processCategoryFilterText(val) {
      //除去搜索条件前后空格内容
      val = val.trim();
      this.processCategoryFilterText = this.processCategoryFilterText.trim();
      this.$refs.processCategoryTree.filter(val);
    }
  },
  //初始化树和查询流程模板
  mounted() {
    // this.initProcessTreeData();
    this.queryProcessList(true);
    this.initMaxHeight();
    // throttleFunc记录当前的节流方法，用于在页面销毁时释放
    this.throttleFunc = throttle(this.initMaxHeight, 500);
    window.addEventListener("resize", this.throttleFunc);
  },
  computed: {
    computedTreeHeight() {
      return this.maxTreeHeight;
    },
    computedTableHeight() {
      return this.maxTableHeight;
    },
  },

  beforeDestroy() {
    window.removeEventListener("resize", this.throttleFunc);
  },
  data() {
    return {
      hasIcon: false,
      brand: [
        { name: "wm.workflow_manage" },
        { name: "流程模拟日志" }
      ],
      height: 0,
      loading: false,
      listLoading: true,
      treeLoading: false,
      //分类树属性
      processCategoryTreeData: [],
      processCategoryTreeOption: {
        children: "children",
        label: "label"
      },
      //关键字进行过滤的搜索值
      processCategoryFilterText: "",
      //树节点是否被选中
      clearnode: true,
      //流程模板列表属性
      processTemplateVo: {
        procTestName: "",
        userName: "",
        procStatus: "",
        procCategory: ""
      },
      tableData: [],
      //分页
      tablePage: {
        pageIndex: 1,
        pageSize: 10,
        total: 0
      },
      //表格选中
      mulSelect: [],
      isTreeCollapse: true,
      maxTreeHeight: 0,
      maxTableHeight: 0,
      maxRightHeight: 0,
      value: "",
      //搜索字段
      queryFields: [
        { name: 'procTestName', label: '测试名称', labelKey: '', value: '', type: 'input', display: true, order: 1 },
        { name: 'userName', label: '处理人', labelKey: '', value: '', type: 'personal', display: true, order: 2 }
      ],
    };
  },
  methods: {
    // 动态计算目录树和表格高度
    initMaxHeight() {
      calcHeight(this);
    },
    callName: function (value) {
      this.processTemplateVo.userName = value.userName;
    },
    toggleTreeExpand() {
      this.isTreeCollapse = !this.isTreeCollapse;
    },
    //分类树方法
    initProcessTreeData() {
      this.treeLoading = false;
      // workflowManageAPI
      //   .flowTreeAPI({})
      ht.post("/processCategory/getFlowTree", {})
        .then(res => {
          if (res.code === "0") {
            this.processCategoryTreeData = res.data;
            this.treeLoading = false;
          }
        })
        .catch(error => {
          cmsg.httpCatchErrorMessage(this);
        });
    },
    //点击树节点
    processCategoryTreeNodeClick(data) {
      let _this = this;
      this.clearnode = false;
      if ("****" != data.id) {
        _this.processTemplateVo.procCategory = data.id;
      } else {
        _this.processTemplateVo.procCategory = "";
      }
      _this.queryProcessList();
    },
    //树节点名称的过滤
    filterProcessCategoryTreeNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    //流程模板列表
    queryProcessList(init) {
      this.listLoading = true;
      let params = {};
      if (init) {
        params.current = 1;
        params.size = 10;
      } else {
        params.current = this.tablePage.pageIndex;
        params.size = this.tablePage.pageSize;
      }
      params.procTestId = "";
      params.procTestName = this.processTemplateVo.procTestName;
      params.userName = this.processTemplateVo.userName;

      ht.post("/ipm/processTest/getProcessTestPage", params).then(res => {
        this.listLoading = false;
        if (res.data.code === "0") {
          this.tableData = res.data.records;
          this.tablePage.total = res.data.total;
        }
      })
    },
    //点击查询按钮
    searchProcessTemplates() {
      let queryForm = this.$refs.queryForm.getQueryForm();
      this.processTemplateVo.procTestName = queryForm.procTestName;
      this.processTemplateVo.userName = queryForm.userName;
      this.queryProcessList(true);
    },
    //点击重置按钮
    resetProcessTemplate() {
      this.processTemplateVo.procTestName = "";
      this.processTemplateVo.userName = "";
      this.value = {};
      this.$refs.personSelect.clear();
    },
    //点击复选框
    selectChange(val) {
      this.mulSelect = val;
    },
    //改变每页显示多少条数据
    changeSize(pageSize) {
      this.tablePage.pageSize = pageSize;
      this.tablePage.pageIndex = 1;
      this.queryProcessList();
    },
    //改变页数
    changeCurrentPage(current) {
      this.tablePage.pageIndex = current;
      this.queryProcessList();
    },
    toRunPage(row) {
      this.$router.push({
        path: "/processSimulation/runPage",
        query: {
          testType: row.procTestType,
          procId: row.procId,
          procVersion: row.procVersion,
          procTestId: row.id,
          procLog: 1,
          procTestName: row.procTestName,
        }
      });
    },
  }
};
