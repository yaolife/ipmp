import api from "../api";
  import breadcrumb from "@/components/common/breadcrumb";
  import { throttle } from "@/utils/funcUtil";
  import editUser from "../view/user_edit_basic";
  import queryForm from "@/components/common/queryForm";
  import { calcHeight } from "@/utils/funcUtil";

  export default {
    name: "userManage",
    components: {
      breadcrumb,
      "edit-user": editUser,
      queryForm
    },
    data: function() {
      return {
        maxTableHeight: 0,
        loading: false,
        loading1: false,
        loading2: false,
        fullscreenLoading: false,
        hasIcon: false,
        brand: [{ name: "dataAuth.auth_manage" }, { name: "dataAuth.user_manage" }], //面包屑
        advSearch: "展开",
        uploadUrl:envConfig.API_ROOT + "/cudAuth/user/excelUserInfo",
        iconArrow: "el-icon-arrow-down",
        tableData: [],
        //分页
        tablePage: {
          current: 1,
          size: 10,
          total: 0,
        },
        tableShow: false,
        queryVO: {
          userId: "",
          userName: "",
          userStatus: "",
          cellphoneNo: ""
        },
        model: {
          userId: "",
          userName: "",
          userStatus: "",
          userSex: "",
          cellphoneNo: "",
          telephoneNo: ""
        },
        modelType: '',
        appModel: {
          appId: "",
        },
        //搜索字段
        queryFields: [
          { name: 'userId', label: '员工号', labelKey: '', value: '', type: 'input', display: true, order: 1 },
          { name: 'userName', label: '员工姓名', labelKey: '', value: '', type: 'input', display: true, order: 2 },
          { name: 'cellphoneNo', label: '手机号', labelKey: '', value: '', type: 'input', display: true, order: 3 },
        ],
      };
    },
    created() {
      this.getList();
    },
    mounted() {
      this.initMaxHeight();
      // throttleFunc记录当前的节流方法，用于在页面销毁时释放
      this.throttleFunc = throttle(this.initMaxHeight, 500);
      window.addEventListener("resize", this.throttleFunc);
    },
    beforeDestroy() {
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
    methods: {
      // 动态计算高度
      initMaxHeight() {
        calcHeight(this);
      },
      //高级搜索展开
      advanceSearch(val) {
        let _this = this;
        _this.advSearch = val ? "收起" : "展开";
        _this.iconArrow = val ? "el-icon-arrow-up" : "el-icon-arrow-down";
        setTimeout(() => {
          _this.initMaxHeight();
        }, 335);
      },

      //重置数据
      resetData() {
        this.queryVO.userId = "";
        this.queryVO.userName = "";
        this.queryVO.userStatus = "";
        this.queryVO.cellphoneNo = "";
        this.getList()
      },
      //改变每页显示数
      changeSize(size) {
        this.tablePage.size = size;
        this.getList();
      },
      changeCurrentPage(current) {
        this.tablePage.current = current;
        this.getList();
      },
      //搜索
      search: function() {
        let queryForm = this.$refs.queryForm.getQueryForm();
        this.queryVO.userId = queryForm.userId;
        this.queryVO.userName = queryForm.userName;
        this.queryVO.cellphoneNo = queryForm.cellphoneNo;
        this.getList();
      },
      //查询数据
      getList() {
        this.loading = true
        let _this = this;
        let params = Object.assign(_this.queryVO, _this.tablePage);
        if (_this.$route.query.deptId) {
          params['userDeptId'] = _this.$route.query.deptId;
        }
        api.userList(params).then((response) => {
          _this.tableData = response.data.records;
          _this.tablePage.total = response.data.total;
          _this.tableShow = true;
          _this.loading = false
        });
      },
      //添加
      dataAdd() {
        // this.modelType = "add";
        // this.$refs.editUser.modelIsOpen = true;
        // this.$refs.editUser.isNotAble = false;
        // this.$refs.editUser.clearModel();
        // this.model.title = '新增';
        // this.$router.push({ path: "/userManage/edit" });
        window.refreshData = () => {
          this.getList();
        }
        this.$router.push({ path: "/userManage/edit" });
      },
      // 编辑
      dataEdit(data) {
        // this.modelType = "edit";
        // this.$refs.editUser.getData(data);
        // this.$refs.editUser.modelIsOpen = true;
        // this.model.title = '编辑';
        // this.$router.push({ path: "/userManage/edit", query: { userId: data.userId } });
        window.refreshData = () => {
          this.getList();
        }
        this.$router.push({ path: "/userManage/edit", query: { userId: data.userId } });
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
            let params = { ids: [data.id] }
            api.userDel(params).then((response) => {
              if (response.data.code === "0") {
                _this.$message({
                  message: response.data.msg,
                  type: "success",
                });
                _this.getList();
              } else {
                _this.$message.error(response.data.msg);
              }
            });
          })
          .catch(() => {
            let message = _this.$t("dataAuth.deletecancel");
            _this.$message({
              type: "info",
              message: message,
            });
          });
      },
      //重置密码
      dataResetPsw(data) {
        let _this = this;
        _this.$confirm("确定要重置密码？", _this.$t("cm.tips"), {
            confirmButtonText: _this.$t("cm.confirm"),
            cancelButtonText: _this.$t("cm.cancel"),
            type: "warning",
          })
          .then(() => {
            let params = { id: data.id }
            api.userResetPsw(params).then((response) => {
              if (response.data.code === "0") {
                _this.$alert(`操作成功，新密码：${ response.data.data }`, '重置密码');
              } else {
                _this.$message.error(response.data.msg);
              }
            }).catch((err) => {
              //
            });
          });
      },
      //导出数据
      exportList() {
        this.loading1 = true;
        let _this = this;
        let objs = [];
        let params = {};
        _this.queryVO.appId = this.appModel.appId;
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
            link.setAttribute("download", "用户信息列表.xls");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } else {
            navigator.msSaveBlob(blob, "用户信息列表.xls");
          }
        }).catch(() => {
          _this.loading1 = false;
        });
      },
      //导出模板
      exportTemplate() {
        let _this = this;
        _this.loading2 = true;
        api.exportTemplate().then((result) => {
          _this.loading2 = false;
          let blob = new Blob([result.data], {
            type: "application/vnd.ms-excel",
          });
          if ("download" in document.createElement("a")) {
            const link = document.createElement("a");
            link.style.display = "none";
            link.href = URL.createObjectURL(blob);
            link.setAttribute("download", "用户信息模板.xls");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } else {
            navigator.msSaveBlob(blob, "用户信息模板.xls");
          }
        }).catch(() => {
          _this.loading2 = false;
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
      uplofileError() {
        this.loading = false;
      },
      //上传之后的回调
      uploadSuccess(response) {
        this.loading = false;
        if (response.code == "0") {
          this.$alert("导入成功!", this.$t("cm.tips"));
          //刷新列表页
          this.getList();
        } else {
          this.$alert(response.msg, this.$t("cm.tips"));
        }
      },
    },
    beforeDestroy() {
      window.addEventListener("resize", this.throttleFunc);
    },
  };
