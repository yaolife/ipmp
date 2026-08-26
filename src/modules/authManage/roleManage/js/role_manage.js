import rolesApi from "../api/appApi";
  import editRoles from "../view/role_edit";
  import roleFunction from "../view/role_function";
  import roleAuthEdit from "../view/role_auth_edit";
  import roleDataAuth from "../view/role_data_auth";
  import { exportRoleListExcel, downLoadTemplate } from "@/modules/authManage/common/component/api";

  import breadcrumb from "@/components/common/breadcrumb";
  import { throttle } from "@/utils/funcUtil";
  import queryForm from "@/components/common/queryForm";
  import { calcHeight } from "@/utils/funcUtil";

  export default {
    name: "rolesManage",
    components: {
      breadcrumb,
      "edit-roles": editRoles,
      "role-function": roleFunction,
      "role-auth-edit": roleAuthEdit,
      "role-data-auth": roleDataAuth,
      queryForm
    },
    data: function() {
      return {
        maxTableHeight: 0,
        loading: false,
        loading2: false,
        loading1: false,
        fullscreenLoading: false,
        hasIcon: false,
        brand: [{ name: "dataAuth.auth_manage" }, { name: "dataAuth.role_manage" }], //面包屑
        flag: false,
        excelUpUrl: envConfig.API_ROOT + "/role/importRoleInfo",
        advSearch: "展开",
        iconArrow: "el-icon-arrow-down",
        appList: [],
        statuss: [
          { key: "-1", label: "全部", value: -1 },
          { key: "1", label: "启用", value: 1 },
          { key: "0", label: "禁用", value: 0 }
        ],
        appModel: {
          appId: "",
        },
        appAdminBtnShow: false,
        normalAdminBtnShow: false,
        tableData: [],
        //分页
        tablePage: {
          pageIndex: 1,
          pageSize: 10,
          total: 0,
        },
        roleQueryVO: {
          appId: "",
          roleNameOrCode: "",
          roleCode: "",
          roleName: "",
          roleDesp: "",
          state: "",
          appId: "",
        },
        model: {
          roleId: "",
          roleName: "",
          roleCode: "",
          appName: "",
          isAdminrole: "",
          createBy: "",
          createDate: "",
          title: "",
        },
        modelType: "",
        height: "0px",
        tableShow: false,
        roleName: '',
        //搜索字段
        queryFields: [
          { name: 'roleName', label: '', labelKey: 'dataAuth.rolename', value: '', type: 'input', display: true, order: 1 },
          { name: 'roleCode', label: '', labelKey: 'dataAuth.rolecode', value: '', type: 'input', display: true, order: 2 },
          { name: 'state', label: '', labelKey: 'dataAuth.state', value: '', type: 'select', display: true, order: 3, fieldMap: [
            { label: "全部", value: '-1' },
            { label: "启用", value: '1' },
            { label: "禁用", value: '0' }
          ] },
        ],
      };
    },
    created() {
      this.roleInfo();
      this.currUserAppList();
    },
    mounted() {
      this.initMaxHeight();
      // throttleFunc记录当前的节流方法，用于在页面销毁时释放
      this.throttleFunc = throttle(this.initMaxHeight, 500);
      window.addEventListener("resize", this.throttleFunc);
    },
    computed: {
      //
    },
    methods: {
      //下载导入模板
      upload: function() {
        let _this = this;
        this.loading2 = true;
        downLoadTemplate().then((result) => {
          this.loading2 = false;
          let blob = new Blob([result.data], {
            type: "application/vnd.ms-excel",
          });
          if ("download" in document.createElement("a")) {
            const link = document.createElement("a");
            link.style.display = "none";
            link.href = URL.createObjectURL(blob);
            link.setAttribute("download", "角色信息列表模板.xls");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } else {
            navigator.msSaveBlob(blob, "角色信息列表模板.xls");
          }
        });
      },
      //上传之前判断是否为excel文件
      beforeUpload: function(file) {
        let type = file.name.substring(file.name.lastIndexOf(".") + 1);
        if (type != "xls" && type != "xlsx") {
          this.$alert("请输入正确的excel文件进行导入", this.$t("cm.tips"));
          return false;
        } else {
          return true;
        }
      },
      //显示 加载中...
      loadingFile: function() {
        this.loading = true;
      },
      //取消显示 加载中...
      uplofileError: function() {
        this.loading = false;
      },
      //上传之后的回调
      upfileBack: function(response) {
        this.loading = false;
        if (response.code == "0") {
          this.$alert("导入成功!", this.$t("cm.tips"));
          //刷新列表页
          this.roleInfo();
        } else {
          this.$alert(response.msg, this.$t("cm.tips"));
        }
      },
      inputEvent: function() {},
      // 动态计算高度
      initMaxHeight() {
        calcHeight(this);
      },
      //高级搜索展开
      advanceSearch: function(val) {
        let _this = this;
        _this.advSearch = val ? "收起" : "展开";
        _this.iconArrow = val ? "el-icon-arrow-up" : "el-icon-arrow-down";
        setTimeout(() => {
          _this.initMaxHeight();
        }, 335);
      },

      //重置数据
      resetData: function() {
        this.roleQueryVO.appId = "";
        this.roleQueryVO.roleNameOrCode = "";
        this.roleQueryVO.roleName = "";
        this.roleQueryVO.roleCode = "";
        this.roleQueryVO.roleDesp = "";
        this.roleQueryVO.state = "";
        this.roleInfo()
      },
      //导出excel 判断复选框是否选中，若选中复选框，则导出复选框选中的，若没选中复选框，那么导出全部
      exportExcel: function() {
        this.loading1 = true;
        let _this = this;
        let objs = [];
        let params = {};
        _this.roleQueryVO.appId = this.appModel.appId;
        params = Object.assign(_this.roleQueryVO, _this.tablePage);
        exportRoleListExcel(params).then((result) => {
          _this.loading1 = false;
          let blob = new Blob([result.data], {
            type: "application/vnd.ms-excel",
          });
          if ("download" in document.createElement("a")) {
            const link = document.createElement("a");
            link.style.display = "none";
            link.href = URL.createObjectURL(blob);
            link.setAttribute("download", "角色信息列表.xls");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } else {
            navigator.msSaveBlob(blob, "角色信息列表.xls");
          }
        });
      },
      //改变每页显示数
      changeSize: function(pageSize) {
        this.tablePage.pageSize = pageSize;
        this.roleInfo();
      },
      changeCurrentPage: function(current) {
        this.tablePage.pageIndex = current;
        this.roleInfo();
      },
      queryCurrUserTopAuthByAppId: function() {
        let that = this;
        rolesApi
          .queryCurrUserTopAuthByAppId(this.appModel.appId)
          .then(function(response) {
            if ("appAdmin" == response.data.data) {
              that.appAdminBtnShow = true;
              that.normalAdminBtnShow = false;
            } else if ("normalAdmin" == response.data.data) {
              that.normalAdminBtnShow = true;
              that.appAdminBtnShow = false;
            }
          });
      },
      currUserAppList: function() {
        let that = this;
        rolesApi.currUserAppList().then(function(response) {
          that.appList = response.data.data;
        });
      },
      roleInfo: function() {
        this.loading = true
        let that = this;
        let params = Object.assign(that.roleQueryVO, that.tablePage);
        rolesApi.roleInfo(params).then(function(response) {
          that.tableData = response.data.records;
          that.tablePage.total = response.data.total;
          that.tableShow = true;
          that.loading = false
        });
      },
      //搜索
      search: function() {
        let queryForm = this.$refs.queryForm.getQueryForm();
        this.roleQueryVO.roleCode = queryForm.roleCode;
        this.roleQueryVO.roleName = queryForm.roleName;
        this.roleQueryVO.state = queryForm.state;
        this.roleInfo();
      },
      // 添加
      addRole: function() {
        this.modelType = "add";
        this.$refs.editRoles.modelIsOpen = true;
        this.$refs.editRoles.isNotAble = false;
        // this.$refs.editRoles.editRoleModel.appId = this.appModel.appId;
        this.model.title = this.$t("dataAuth.addroles");
        this.$refs.editRoles.clearModel();
      },
      // 编辑
      edit: function(data) {
        this.modelType = "edit";
        this.$refs.editRoles.getData(data);
        this.$refs.editRoles.modelIsOpen = true;
        this.model.title = this.$t("dataAuth.editroles")
      },
      showDetails: function(data) {
        this.modelType = "view";
        this.$refs.editRoles.getData(data);
        this.$refs.editRoles.modelIsOpen = true;
        this.model.title = this.$t("dataAuth.viewroles")
      },
      // 删除
      delBatch: function(data) {
        let that = this;
        that
          .$confirm(that.$t("dataAuth.ifdelete"), that.$t("cm.tips"), {
            confirmButtonText: that.$t("cm.confirm"),
            cancelButtonText: that.$t("cm.cancel"),
            type: "warning",
          })
          .then(() => {
            rolesApi.rolesInfoDel(data.roleId).then(function(response) {
              if (response.data.code === "0") {
                that.$message({
                  message: response.data.msg,
                  type: "success",
                });
                that.roleInfo();
              } else {
                that.$message.error(response.data.msg);
              }
            });
          })
          .catch(() => {
            let message = that.$t("dataAuth.deletecancel");
            that.$message({
              type: "info",
              message: message,
            });
          });
      },
      // 配置角色
      configRole: function(data) {
        if (data.isAdminRole !== "管理角色") {
          this.$message.error(this.$t("dataAuth.noadmincannotconfigrole"));
          return;
        }
        if (data.isAppRootRole === "1") {
          this.$message.error(this.$t("dataAuth.appadminhavenotconfigrole"));
          return;
        }
        this.$refs.configRole.modelIsOpen = true;
        this.$refs.configRole.roleId = data.roleId;
        this.$refs.configRole.title = this.$t("dataAuth.configrole");
        this.$refs.configRole.appId = this.appModel.appId;
      },
      // 配置用户
      addUser: function(rowData) {
        let that = this;
        let data = rowData;
        let adminRoleId = this.$store.state.lightAuth.currentAdminRoleId;
        if (!data) {
          this.$message.error(this.$t("dataAuth.pleaseselectrecord"));
          return;
        }
        rolesApi.judAddUserPermissions(rowData.appId).then(function(result) {
          if (result.data.data == "1") {
            that.flag = true;
          }
          if (
            data.isAdminRole === "管理角色" &&
            adminRoleId.indexOf(data.roleId) > -1 &&
            !that.flag
          ) {
            that.$message.error(that.$t("dataAuth.supadmnotrole"));
            return;
          }

          that.$refs.addUser.modelIsOpen = true;
          that.$refs.addUser.roleId = data.roleId;
        });
      },
      // 配置组织
      addOrg: function(rowData) {
        let that = this;
        let data = rowData;
        let adminRoleId = this.$store.state.lightAuth.currentAdminRoleId;
        if (!data) {
          that.$message.error(that.$t("dataAuth.pleaseselectrecord"));
          return;
        }
        if (adminRoleId.indexOf(data.roleId) > -1) {
          that.$message.error(that.$t("dataAuth.supadmnotorg"));
          return;
        }
        this.$refs.addOrg.modelIsOpen = true;
        this.$refs.addOrg.roleId = data.roleId;
      },
      appClear: function() {
        this.tableShow = false;
      },
      // 功能配置
      doRoleFunction: function(rowData) {
        let data = rowData;
        if (!data) {
          this.$message.error(this.$t("dataAuth.pleaseselectrecord"));
          return;
        }
        // 赋值
        this.$refs.rolePrivilege.modelIsOpen = true;
        this.$refs.rolePrivilege.form.roleName = rowData.roleName;
        this.$refs.rolePrivilege.form.roleCode = rowData.roleCode;
        this.$refs.rolePrivilege.title = this.$t("dataAuth.businessauthorize");
        this.$refs.rolePrivilege.roleId = data.roleId;
        this.$refs.rolePrivilege.authType = "0";
        this.$refs.rolePrivilege.form.appId = data.appId;
        this.$refs.rolePrivilege.rolePrivilegeTreeData = [];
      },
      // 授权管理
      doRoleAuth: function(rowData) {
        this.$refs.roleAuthEdit.modelIsOpen = true;
        this.$refs.roleAuthEdit.addDataAuth.appId = rowData.appId;
        this.$refs.roleAuthEdit.getAuthDetail(rowData.roleId);
      },
      // 数据权限
      doDataAuth: function(rowData) {
        this.$refs.roleDataAuth.modelIsOpen = true;
        this.$refs.roleDataAuth.getRoleData(rowData);
      },
      roleFunction: function(rowData) {
        let data = rowData;
        this.$refs.roleFunction.modelIsOpen = true;
        this.$refs.roleFunction.title = this.$t("dataAuth.rolefunction");
        this.$refs.roleFunction.roleId = data.roleId;
        this.$refs.roleFunction.isAppRootRole = data.isAppRootRole;
        this.$refs.roleFunction.form.appId = data.appId;
      },
      // 更多
      handleCommand: function(command) {
        switch(command.command) {
          case 'function':
            this.doRoleFunction(command.params);
          break;
          case 'person':
            this.roleName = command.params.roleName;
            this.doRoleAuth(command.params);
          break;
          case 'data':
            this.doDataAuth(command.params);
          break;
        }
      }
    },
    beforeDestroy() {
      window.addEventListener("resize", this.throttleFunc);
    },
  };
