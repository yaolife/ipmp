import api from "../api";
import breadcrumb from "@/components/common/breadcrumb";
import { throttle } from "@/utils/funcUtil";
import editDept from "../view/dept_edit";
import deptUsers from "../view/dept_users";
import { calcHeight } from "@/utils/funcUtil";

export default {
  name: "deptManage",
  components: {
    breadcrumb,
    "edit-dept": editDept,
    "dept-users": deptUsers
  },
  data: function() {
    return {
      maxTableHeight: 0,
      loading: false,
      loading1: false,
      loading2: false,
      fullscreenLoading: false,
      hasIcon: false,
      brand: [{ name: "dataAuth.auth_manage" }, { name: "dataAuth.dept_manage" }], //面包屑
      advSearch: "展开",
      uploadUrl: envConfig.API_ROOT + "/cudAuth/dept/excelDept",
      iconArrow: "el-icon-arrow-down",
      tableData: [],
      //分页
      tablePage: {
        current: 1,
        size: 10,
        total: 0,
      },
      activeName: 'edit',
      queryVO: {
        deptId: '',
        deptName: '',
        deptNameEng: '',
        deptStatus: ''
      },
      modelTitle: '',
      modelType: '',
      //分类树
      filterText: '',
      isOptions: true,
      maxTreeHeight: '',
      maxRightHeight: '',
      treeData: [
        { id: "root", label: "全部", children: [] },
      ],
      currentNode: {},
      treeLoading: false,
      treeNodeHasChildren: false,
      isTreeCollapse: false,
      isDialog: false,
      selectedId: 0,
      selectedName: '',
      selectedCode: '',
      //编辑组件
      modelIsOpen: false,
      modelTitle: '',
      modelType: '',
    };
  },
  mounted() {
    //加载部门树
    this.getTree();
    this.initMaxHeight();
    // throttleFunc记录当前的节流方法，用于在页面销毁时释放
    this.throttleFunc = throttle(this.initMaxHeight, 500);
    window.addEventListener("resize", this.throttleFunc);
  },
  computed: {
    headers() {
      return {
        menuCode: sessionStorage.getItem('menuCode'),
        token: sessionStorage.getItem('token')
      }
    }
  },
  watch: {
    filterText(val) {
      //除去搜索条件前后空格内容
      this.filterText = this.filterText.trim();
      val = val.trim();
      this.$refs.categoryTree.filter(val);
    }
  },
  methods: {
    // 动态计算高度
    initMaxHeight() {
      calcHeight(this);
    },
    // 获取部门树
    getTree() {
      let parentId = this.selectedId;
      let param = { deptParentId: parentId };
      var _this = this;
      _this.treeLoading = true;
      api.getTreeList(param).then(response => {
        _this.treeLoading = false;
        let res = response.data
        if (res.code === "0") {
          let treeData = [];
          res.data.forEach((item) => {
            treeData.push({
              id: item.deptId,
              label: item.deptName,
              code: item.deptCode,
              children: []
            })
          });
          if (parentId === 0) {
            //根部门直接赋值
            _this.treeData = treeData;
            _this.$nextTick(() => {
              const firstNode = document.querySelector('.el-tree-node');
              firstNode.click();
            })
          } else {
            //子部门插入
            _this.currentNode.children = treeData;
          }
        } else {
          _this.$message({ type: "error", message: res.message });
        }
      }).catch(() => {
        _this.treeLoading = false;
      });
    },
    // 部门树点击
    treeClick(data, node) {
      this.selectedId = data.id;
      this.selectedName = data.label;
      this.queryVO.deptParentId = data.id;
      this.currentNode = this.$refs.categoryTree.getCurrentNode();
      this.getTree();
      //this.getDeptList();
      this.getTreeInfo();
    },
    // 搜索分类
    filterTreeNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    // 获取组织信息、组织人员
    getTreeInfo() {
      this.activeName = 'edit';
      this.$refs.editDeptMain.getDetail(this.selectedId);
      this.$refs.deptUsers.getList(this.selectedId);
    },
    // 查询数据
    getDeptList() {
      this.loading = true
      let _this = this;
      let params = Object.assign(_this.queryVO, _this.tablePage);
      api.getDeptList(params).then((response) => {
        _this.loading = false
        _this.tableData = response.data.records;
        _this.tablePage.total = response.data.total;
        _this.$nextTick(() => {
          _this.$refs.editDeptMain.getDetail(_this.selectedId);
        })
      });
    },
    // 高级搜索展开
    advanceSearch(val) {
      let _this = this;
      _this.advSearch = val ? "收起" : "展开";
      _this.iconArrow = val ? "el-icon-arrow-up" : "el-icon-arrow-down";
      setTimeout(() => {
        _this.initMaxHeight();
      }, 335);
    },
    // 重置数据
    resetData() {
      this.queryVO.deptId = "";
      this.queryVO.deptName = "";
      this.queryVO.deptNameEng = "";
      this.queryVO.deptStatus = "";
      this.getDeptList()
    },
    //改变每页显示数
    changeSize(size) {
      this.tablePage.size = size;
      this.getDeptList();
    },
    changeCurrentPage(current) {
      this.tablePage.current = current;
      this.getDeptList();
    },
    //子组件打开/关闭窗口
    modelOpen(isOpen) {
      this.modelIsOpen = isOpen;
    },
    //更新列表
    updateList() {
      this.getTree();
      this.getDeptList();
    },
    //添加
    dataAdd() {
      this.modelType = "add";
      this.modelIsOpen = true;
      this.modelTitle = '新增组织';
      this.$nextTick(()=>{
        this.$refs.editDept.clearModel();
        this.$refs.editDept.isNotAble = false;
        this.$refs.editDept.editModel.deptParentId = this.selectedId;
        this.$refs.editDept.editModel.deptParentName = this.selectedName;
      })
    },
    // 编辑
    dataEdit(data) {
      this.modelType = "edit";
      this.modelIsOpen = true;
      this.modelTitle = '编辑组织';
      this.$nextTick(()=>{
        if (data && data.deptId) {
          this.$refs.editDept.getDetail(data.deptId);
        } else {
          this.$refs.editDept.getDetail(this.selectedId);
        }
      })
    },
    // 删除
    dataDel(data) {
      let _this = this;
      _this.$confirm(_this.$t("dataAuth.ifdelete"), _this.$t("cm.tips"), {
          confirmButtonText: _this.$t("cm.confirm"),
          cancelButtonText: _this.$t("cm.cancel"),
          type: "warning",
        })
        .then(() => {
          let params;
          if (data && data.deptId) {
            params = { deptIdList: [data.deptId] };
          } else {
            params = { deptIdList: [this.selectedId] };
          }
          api.deptDel(params).then(function(response) {
            if (response.data.code === "0") {
              _this.$message({ message: response.data.msg, type: "success" });
              _this.getDeptList();
            } else {
              _this.$message.error(response.data.msg);
            }
          });
        })
        .catch(() => {
          let message = _this.$t("dataAuth.deletecancel");
          _this.$message({ type: "info", message: message });
        });
    },
    dataList(data) {
      this.$router.push('/userManage?deptId=' + data.deptId);
    },
    //导出数据
    exportList() {
      this.loading1 = true;
      let _this = this;
      let objs = [];
      let params = {};
      params = Object.assign(_this.queryVO, _this.tablePage);
      api.exportList(params).then((result) => {
        _this.loading1 = false;
        let blob = new Blob([result.data], {
          type: "application/vnd.ms-excel",
        });
        if ("download" in document.createElement("a")) {
          const link = document.createElement("a");
          link.style.display = "none";
          link.href = URL.createObjectURL(blob);
          link.setAttribute("download", "组织信息列表.xls");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          navigator.msSaveBlob(blob, "组织信息列表.xls");
        }
      });
    },
    //导出模板
    exportTemplate() {
      let _this = this;
      this.loading2 = true;
      api.exportTemplate().then((result) => {
        this.loading2 = false;
        let blob = new Blob([result.data], {
          type: "application/vnd.ms-excel",
        });
        if ("download" in document.createElement("a")) {
          const link = document.createElement("a");
          link.style.display = "none";
          link.href = URL.createObjectURL(blob);
          link.setAttribute("download", "组织信息列表模板.xls");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          navigator.msSaveBlob(blob, "组织信息列表模板.xls");
        }
      });
    },
    //上传之前判断是否为excel文件
    uploadBefore(file) {
      let type = file.name.substring(file.name.lastIndexOf(".") + 1);
      if (type != "xls" && type != "xlsx") {
        this.$alert("请输入正确的excel文件进行导入", this.$t("cm.tips"));
        return false;
      } else {
        return true;
      }
    },
    //显示 加载中...
    uploading() {
      this.loading = true;
    },
    //取消显示 加载中...
    uploadError() {
      this.loading = false;
    },
    //上传之后的回调
    uploadSuccess(response) {
      this.loading = false;
      if (response.code == "0") {
        this.$alert("导入成功!", this.$t("cm.tips"));
        //刷新列表页
        this.getDeptList();
      } else {
        this.$alert(response.msg, this.$t("cm.tips"));
      }
    },
    // TAB切换
    tabsClick(tab) {
      this.$nextTick(() => {
        if (this.$refs.deptUsers) {
          this.$refs.deptUsers.initMaxHeight();
        }
      })
    },
  },
  beforeDestroy() {
    window.addEventListener("resize", this.throttleFunc);
  },
};
