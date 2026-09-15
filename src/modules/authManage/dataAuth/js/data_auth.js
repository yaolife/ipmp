import { hasPermission } from "@/permission/btn";
import api from "../api/appApi";
import { throttle } from "@/utils/funcUtil";
import breadcrumb from "@/components/common/breadcrumb";
import queryForm from "@/components/common/queryForm";
import { calcHeight } from "@/utils/funcUtil";

export default {
  components: {
    breadcrumb,
    queryForm
  },
  data() {
    return {
      hasIcon: false,
      brand: [{ name: "dataAuth.auth_manage" }, { name: "dataAuth.data_auth" }],
      is_collapse: false,
      activeName: [],
      advSearch: "te.advance_search",
      tableData: [],
      isSelected: [],
      mulSelect: [],
      showDisabled: true,
      showDialog: false,
      loading: false,
      total: 0,
      values: true,
      current: 1,
      pageCount: 0,
      size: 10,
      entityDetailParam: {
        entityId: "",
        entityName: ""
      },
      model: {
        roleName: "",
        pageIndex: 1,
        pageSize: 10
      },
      searchParams: { searchType: "0" },
      maxTableHeight: 0,
      fullscreenLoading: false,
      // 上传文件
      fileList: [],
      disabledRecordFlag: false,
      fileUploadUrl: envConfig.API_ROOT + "/dataAuth/importDataAuthInfo",
      // 详情弹窗d
      detailDialogVisible: false,
      dataAuthDetail: {},
      // 多选数据
      checkboxAuthData: [],
      //搜索字段
      queryFields: [
        { name: 'roleName', label: '', labelKey: 'dataAuth.rolename', value: '', type: 'input', display: true, order: 1 },
        // { name: 'roleCode', label: '', labelKey: 'dataAuth.rolecode', value: '', type: 'input', display: true, order: 2 },
      ],
    };
  },
  methods: {
    // 动态计算高度
    initMaxHeight() {
      calcHeight(this);
    },
    //获取列表
    getFlowList(params) {
      this.values = false;
      this.loading = true;
      if (!params) {
        params = {
          current: this.current,
          size: this.size
        };
      }
      //合并
      api.pageListAPI(this.model).then(res => {
        this.loading = false;
        if (res.code === "0") {
          this.tableData = res.records;
          this.total = res.total;
          this.current = res.current;
          this.size = res.size;
        }
      });
    },
    dataFormat: function(time) {
      let date = new Date(time.createDate);
      let month = date.getMonth() + 1;
      let str =
        date.getFullYear() +
        "-" +
        month +
        "-" +
        date.getDate() +
        " " +
        date.getHours() +
        ":" +
        date.getMinutes() +
        ":" +
        date.getSeconds();
      return str;
    },

    //重置数据
    resetData: function() {
      this.model.roleName = "";
      this.getFlowList();
    },
    //高级搜索
    search() {
      let queryForm = this.$refs.queryForm.getQueryForm();
      this.model.roleCode = queryForm.roleCode;
      this.model.roleName = queryForm.roleName;
      this.getFlowList();
    },
    //改变每页显示数
    changeSize(size) {
      this.model.pageSize = size
      this.getFlowList();
    },

    //翻页
    changeCurrentPage(current) {
      this.model.pageIndex =current
      this.getFlowList();
    },

    //每行的删除操作
    delData: function(row) {
      let _this = this;
      _this
        .$confirm(_this.$t("cm.is_delete"), _this.$t("cm.tips"), {
          type: "warning",
          confirmButtonText: _this.$t("cm.confirm"),
          cancelButtonText: _this.$t("cm.cancel"),
          cancelButtonClass: "cud__button--reset",
          confirmButtonClass: "cud__button--search"
        })
        .then(() => {
          this.fullscreenLoading = true;
          let dataAuthIds = new Array();
          dataAuthIds.push(row.dataAuthId);
          api
            .batchDeleteAPI(dataAuthIds)
            .then(res => {
              if (res.code === "0") {
                _this.$message({
                  message: res.msg,
                  type: "success"
                });
                let params = {
                  businessType: "",
                  entityDescribe: "",
                  entityName: "",
                  pageIndex: 1,
                  pageSize: 10,
                  searchType: "0"
                };
                _this.getFlowList(params);
                this.fullscreenLoading = false;
              } else {
                _this.$message({
                  message: res.msg,
                  type: "warning"
                });
                this.fullscreenLoading = false;
              }
            })
            .catch(error => {
              this.fullscreenLoading = false;
            });
        })
        .catch(error => {});
    },
    goInsertData() {
      window.refreshData = () => {
        this.getFlowList();
      }
      this.$router.push({ path: "/dataAule/insert" });
    },
    //点击修改按钮
    updateData: function(row) {
      window.localStorage.setItem("roleData", JSON.stringify(row));
      window.refreshData = () => {
        this.getFlowList();
      }
      this.$router.push({ path: "/dataAule/insert", query: { disabled: "1", roleId: row.roleId } });
    },

    //打开引用详情
    entityDetail(param) {
      let _this = this;
      _this.entityDetailParam.entityId = param;
      _this.getRelationUnionIdType();
    },

    handleClick(row) {
      console.log(row);
      this.dataAuthDetail = row;
      this.detailDialogVisible = true;
      // this.$router.push({ path: "/dataAuth/view", query: { id: row.entityId } });
    },
    //显示按钮
    showBtn(btn) {
      return hasPermission(btn);
    },

    getRelationUnionIdType() {
      let _this = this;
      _this.loading = true;
      let param = _this.entityDetailParam;
      param = Object.assign(param, {
        current: _this.current,
        size: _this.size
      });
      api.entityDetailList(param).then(res => {
        _this.loading = false;
        if (res.code === "0") {
          alert(1);
          /*   _this.ruleDetailData = res.records
                       _this.ruleDetailTotal = res.total*/
        } else {
          _this.$message({ type: "error", message: res.msg });
        }
      });
    },
    handleChangeFile(file, fileList) {
      console.log(file);
      console.log(fileList);
      this.fileList = fileList;
      console.log("导入文件");
      let fd = new FormData();
      this.fileList.forEach(item => {
        //文件信息中raw才是真的文件
        fd.append("uploadFile", item.raw);
        // api.importDataAuthInfoUrl({file:item.raw}).then(res=>{
        //     console.log(res)
        // }).then(err=>{
        //     console.log(err)
        // })
      });
    },
    //上传之前判断是否为excel文件
    beforeUpload(file) {
      let type = file.name.substring(file.name.lastIndexOf(".") + 1);
      if (type != "xls" && type != "xlsx") {
        this.$alert("请输入正确的excel文件进行导入", this.$t("cm.tips"));
        return false;
      } else {
        return true;
      }
    },
    //上传之后的回调
    upfileBack(response) {
      this.loading = false;
      if (response.data.length == 0) {
        // let msg = []
        // for(let key in response.data){
        //     msg.push(response.data[key])
        // }
        this.$alert('导入成功', this.$t("cm.tips"));
        //刷新列表页
        this.getFlowList()
      } else {
        let msg = []
        for(let key in response.data[0]){
            msg.push(response.data[0][key])
        }
        this.$alert(msg.join(':'), this.$t("cm.tips"));
      }
    },
    //显示 加载中...
    loadingFile() {
      this.loading = true;
    },
    //取消显示 加载中...
    uplofileError() {
      this.loading = false;
    },
    // 导出
    exportFile() {
      console.log(this.checkboxAuthData);
      api
        .exportDataAuthInfo({})
        .then(res => {
          let elink = document.createElement("a");
          elink.download = "数据授权.xls";
          elink.style.display = "none";
          let blob = new Blob([res]);
          elink.href = URL.createObjectURL(blob);
          document.body.appendChild(elink);
          elink.click();
          document.body.removeChild(elink);
        })
        .catch(err => {
          console.log(err);
        });
    },
    handleSelectionChange(row) {
      this.checkboxAuthData = row;
    },
    updateAuthState() {
      if (this.checkboxAuthData.length > 1) {
        return this.$message.warning("每次只可更新一条数据状态");
      }
      this.loading = true;
      let checkDataObj = {
        dataAuthId: "",
        dataState: ""
      };
      checkDataObj.dataAuthId = this.checkboxAuthData[0].dataAuthId;
      checkDataObj.dataState = this.checkboxAuthData[0].dataState;
      api
        .updateAuthState(checkDataObj)
        .then(res => {
          this.loading = false;
        })
        .catch(err => {
          console.log(err);
        });
    }
  },

  mounted() {
    let params = {
      searchType: 0,
      pageIndex: 1,
      pageSize: 10
    };
    this.getFlowList(params);
    this.initMaxHeight();
    // throttleFunc记录当前的节流方法，用于在页面销毁时释放
    this.throttleFunc = throttle(this.initMaxHeight, 500);
    window.addEventListener("resize", this.throttleFunc);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.throttleFunc);
  },
  computed: {
    changeCollapse: function() {
      //用于对话框的对齐
      return this.$root.COLLAPSE;
    }
  },
  watch: {
    //监听 是否显示修改按钮
    mulSelect: function() {
      if (this.mulSelect.length === 0) {
        this.showDisabled = true;
      } else {
        this.showDisabled = false;
      }
    }
  }
};
