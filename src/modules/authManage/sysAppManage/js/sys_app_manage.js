import sysAppApi from "../api/appApi";
  import editSysInfo from "../view/sys_app_edit";
  import breadcrumb from "@/components/common/breadcrumb";
  import queryForm from "@/components/common/queryForm";
  import { throttle } from "@/utils/funcUtil";
  import { calcHeight } from "@/utils/funcUtil";

  export default {
    name: "sysAppManage",
    components: {
      "edit-sys-info": editSysInfo,
      breadcrumb,
      queryForm
    },
    data() {
      return {
        loading: false,
        hasIcon: false,
        brand: [{ name: "dataAuth.auth_manage" }, { name: "dataAuth.system_manage" }], //面包屑
        is_collapse: false,
        activeName: [],
        advSearch: "展开",
        advShow: '',
        tableData: [],
        isSelected: [],
        mulSelect: [],
        showDisabled: true,
        sysQueryVO: {
          // appNameOrCode: "",
          appCode: "",
          appName: "",
          // appDomain: "",
          appIp: "",
          appDesc: "",
          state: "",
          appDomain: '',
          appPath: '',
          appPathType: '',
        },
        tablePage: {
          pageIndex: 1,
          pageSize: 10,
          total: 0,
        },
        editTitle: "",
        modelType: "",
        statuss: [
          { key: "-1", label: "全部", value: -1 },
          { key: "0", label: "不可用", value: 0 },
          { key: "1", label: "可用", value: 1 },
        ],
        addressTypeArr: [
          { label: "默认类型", value: 1 },
          { label: "域名类型", value: 2 },
        ],
        maxTableHeight: 0,
        fullscreenLoading: false,
        //搜索字段
        queryFields: [
          { name: 'appCode', label: '', labelKey: 'dataAuth.applycode', value: '', type: 'input', display: true, order: 1 },
          { name: 'appDomain', label: '', labelKey: 'dataAuth.applydomain', value: '', type: 'input', display: true, order: 2 },
          { name: 'appIp', label: '', labelKey: 'dataAuth.applyip', value: '', type: 'input', display: true, order: 3 },
          { name: 'appPath', label: '', labelKey: 'dataAuth.applyrootaddress', value: '', type: 'input', display: true, order: 4 },
          { name: 'appPathType', label: '', labelKey: 'dataAuth.applyaddresstype', value: '', type: 'select', display: true, order: 5, fieldMap: [
            { label: "默认类型", value: '1' },
            { label: "域名类型", value: '2' },
          ] },
          { name: 'state', label: '', labelKey: 'dataAuth.state', value: '', type: 'select', display: true, order: 6, fieldMap: [
            { label: "全部", value: '-1' },
            { label: "不可用", value: '0' },
            { label: "可用", value: '1' },
          ] },
        ],
      };
    },
    methods: {
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
      //搜索
      search: function() {
        let queryForm = this.$refs.queryForm.getQueryForm();
        this.sysQueryVO.appCode = queryForm.appCode;
        this.sysQueryVO.appDomain = queryForm.appDomain;
        this.sysQueryVO.appIp = queryForm.appIp;
        this.sysQueryVO.appPath = queryForm.appPath;
        this.sysQueryVO.appPathType = queryForm.appPathType;
        this.sysQueryVO.state = queryForm.state;
        this.query();
      },
      query() {
        this.loading = true
        let params = Object.assign(this.sysQueryVO, this.tablePage);
        sysAppApi.query(params).then((response) => {
          this.tableData = response.data.records;
          this.tablePage.total = response.data.total;
          this.loading = false
        });
      },
      //重置数据
      resetData: function() {
        for (let key in this.sysQueryVO) {
          this.sysQueryVO[key] = ''
        }
        this.query()
      },

      //改变每页显示数
      changeSize: function(pageSize) {
        this.tablePage.pageSize = pageSize;
        this.query();
      },
      //翻页
      changeCurrentPage: function(current) {
        this.tablePage.pageIndex = current;
        this.query();
      },
      //上一页
      // prePage:function(current){
      //     let params = {
      //         pageIndex:current,
      //         pageSize:this.pageSize
      //     }
      //     params = Object.assign(params,this.searchParams);
      //     this.getFlowList(params);
      // },
      // //下一页
      // nextPage:function(current){
      //     let params = {
      //         pageIndex:current,
      //         pageSize:this.pageSize
      //     }
      //     params = Object.assign(params,this.searchParams);
      //     this.getFlowList(params);
      // },
      //每行的删除操作
      delData: function(row) {
        let _this = this;
        if (row.appId === "1") {
          _this.$message({
            message: "系统应用不允许删除",
            type: "warning",
          });
          return;
        }
        _this
          .$confirm(_this.$t("dataAuth.ifdelete"), _this.$t("cm.tips"), {
            confirmButtonText: _this.$t("cm.confirm"),
            cancelButtonText: _this.$t("cm.cancel"),
            cancelButtonClass: "cud__button--reset",
            confirmButtonClass: "cud__button--search",
            type: "warning",
          })
          .then(() => {
            const loading = _this.$loading();
            sysAppApi
              .sysAppInfoDel(row.appId)
              .then(function(response) {
                loading.close();
                if (response.data.code === "0") {
                  _this.$message({
                    message: response.data.msg,
                    type: "success",
                  });
                  _this.query();
                } else {
                  _this.$message.error(response.data.msg);
                }
              })
              .catch(function(error) {
                loading.close();
              });
          })
          .catch(function() {});
      },
      batchDelete: function() {
        let _this = this;
        _this
          .$confirm(_this.$t("dataAuth.ifdelete"), _this.$t("cm.tips"), {
            confirmButtonText: _this.$t("cm.confirm"),
            cancelButtonText: _this.$t("cm.cancel"),
            cancelButtonClass: "cud__button--reset",
            confirmButtonClass: "cud__button--search",
            type: "warning",
          })
          .then(() => {
            let delRows = "";
            _this.mulSelect.forEach(function(item, index) {
              delRows = delRows + item.appId + ",";
            });
            sysAppApi
              .sysAppInfoDel(delRows)
              .then(function(response) {
                if (response.data.code === "0") {
                  _this.$message({
                    message: response.data.msg,
                    type: "success",
                  });
                  _this.query();
                } else {
                  _this.$message.error(response.data.msg);
                }
              })
              .catch(function() {});
          })
          .catch(function() {});
      },
      addData: function() {
        this.modelType = "add";
        this.editTitle = this.$t("dataAuth.addsystemapply");
        let ref = this.$refs.editSysInfo;
        ref.modelIsOpen = true;
        ref.editAppModel.state = "1";
        ref.editAppModel.appPathType = "1";
        ref.clearModdel();
      },
      updateData: function(row) {
        this.modelType = "edit";
        this.editTitle = this.$t("dataAuth.editsystemapply");
        let ref = this.$refs.editSysInfo;
        // 赋值
        ref.modelIsOpen = true;
        ref.editAppModel.appCode = row.appCode;
        ref.editAppModel.appName = row.appName;
        ref.editAppModel.appDomain = row.appDomain;
        ref.editAppModel.appPath = row.appPath;
        ref.editAppModel.appPathType = row.appPathType;
        ref.editAppModel.appIp = row.appIp;
        ref.editAppModel.appDesc = row.appDesc;
        ref.editAppModel.state = row.state;
        ref.editAppModel.appId = row.appId;
      },
      showDetails(row) {
        this.modelType = "view";
        this.editTitle = this.$t("dataAuth.showsystemapply");
        let ref = this.$refs.editSysInfo;
        // 赋值
        ref.ifDisabled = true;
        ref.modelIsOpen = true;
        ref.editAppModel.appCode = row.appCode;
        ref.editAppModel.appName = row.appName;
        ref.editAppModel.appDomain = row.appDomain;
        ref.editAppModel.appPath = row.appPath;
        ref.editAppModel.appPathType = row.appPathType;
        ref.editAppModel.appIp = row.appIp;
        ref.editAppModel.appDesc = row.appDesc;
        ref.editAppModel.state = row.state;
        ref.editAppModel.appId = row.appId;
      },
      //全选或者取消全选
      checkSelected: function(val) {
        //val 为更新后的值
        if (val == true) {
          let rows = this.tableData;
          rows.forEach((row) => {
            this.$refs.dsTable.toggleRowSelection(row, true);
          });
        } else {
          this.$refs.dsTable.clearSelection();
        }
      },
      //点击修改按钮
      updData: function() {
        let _this = this;
        if (this.mulSelect.length == 1) {
          this.updateData(this.mulSelect[0]);
        } else {
          this.$alert(this.$t("dataAuth.seconemodify"), this.$t("cm.tips"));
        }
      },
      //用于全选操作
      selectChange: function(val) {
        this.mulSelect = val;
      },
      //显示按钮
      showBtn(btn) {
        return true;
      },
    },
    mounted() {
      this.query();
      this.initMaxHeight()
      // throttleFunc记录当前的节流方法，用于在页面销毁时释放
      this.throttleFunc = throttle(this.initMaxHeight, 500);
      window.addEventListener("resize", this.throttleFunc);
    },
    beforeDestroy() {
      window.addEventListener("resize", this.throttleFunc);
    },
    computed: {
      changeCollapse: function() {
        //用于对话框的对齐
        return this.$root.COLLAPSE;
      },
    },
    watch: {
      //监听 是否显示修改按钮
      mulSelect: function() {
        if (this.mulSelect.length === 0) {
          this.showDisabled = true;
        } else {
          this.showDisabled = false;
        }
      },
    },
  };
