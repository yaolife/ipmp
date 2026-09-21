import breadcrumb from "@/components/common/breadcrumb";
import logManageApi from "./api";
import { throttle } from "@/utils/funcUtil";
import queryForm from "@/components/common/queryForm";
import { calcHeight } from "@/utils/funcUtil";

export default {
  components: {
    breadcrumb,
    queryForm
  },
  data: function () {
    let isNumberValidate = (rule, value, callback) => {
      let reg = /^[0-9]*$/;
      if (!reg.test(value)) {
        callback(new Error(this.$t("sys.number_only")));
      } else {
        callback();
      }
    };
    let codeValidate = (rule, value, callback) => {
      let reg = /^[a-zA-Z][_a-zA-Z0-9]*$/;
      if (!reg.test(value)) {
        callback(new Error(this.$t("sys.code_valid_message")));
      } else {
        callback();
      }
    };
    let nameValidate = (rule, value, callback) => {
      let reg = /^[\u4e00-\u9fa5_a-zA-Z0-9]*$/;
      if (!reg.test(value)) {
        callback(new Error(this.$t("sys.name_valid_message")));
      } else {
        callback();
      }
    };
    let typeCodeOnLyValidate = (rule, value, callback) => {
      let _this = this;
      let params = {
        code: value,
        id: _this.typeVo.id,
        parentId: _this.typeVo.parentId
      };
      logManageApi
        .checkTypeCodeOnLyAPI(params)
        .then(result => {
          if (result.code === "0" && result.data) {
            callback();
          }
          callback(new Error(_this.$t("sys.code_only_message")));
        })
        .catch(error => {
          cmsg.httpCatchErrorMessage(this);
          callback(new Error(_this.$t("sys.code_only_message")));
        });
    };
    let typeNameOnLyValidate = (rule, value, callback) => {
      let _this = this;
      let params = {
        name: value,
        id: _this.typeVo.id,
        parentId: _this.typeVo.parentId
      };
      logManageApi
        .checkTypeNameOnLyAPI(params)
        .then(result => {
          if (result.code === "0" && result.data) {
            callback();
          }
          callback(new Error(_this.$t("sys.name_only_message")));
        })
        .catch(error => {
          cmsg.httpCatchErrorMessage(this);
          callback(new Error(_this.$t("sys.name_only_message")));
        });
    };
    return {
      hasIcon: false,
      brand: [
        { name: "sys.system_manage" },
        { name: "sys.data_log_manage" }
      ],
      maxTreeHeight: 0,
      maxTableHeight: 0,
      maxRightHeight: 0,
      treeLoading: true,
      //分类树属性
      isTreeCollapse: false,
      treeData: [],
      typeData: {},
      treeOption: {
        children: "children",
        label: "label"
      },
      filterText: "",
      fullscreenLoading: false,
      // 类型保存弹出框是否是新增
      typeSaveIsAdd: true,
      // 类型保存弹出框是否显示
      typeSaveDialogVisible: false,
      // 类型保存弹出框数据绑定
      typeVo: {
        id: "", //id
        code: "", //编码
        name: "", //名称
        parentId: "", //父级id
        parentName: "", //父级名称
        categoryDesc: "", //描述
        categoryIndex: "0" //排序
      },
      // 类型保存弹出框数据校验规则
      typeRules: {
        code: [
          {
            required: true,
            message: this.$t("sys.dict_dcode"),
            trigger: "blur"
          },
          { validator: codeValidate, trigger: "blur" },
          { validator: typeCodeOnLyValidate, trigger: "blur" }
        ],
        name: [
          {
            required: true,
            message: this.$t("sys.dict_dname"),
            trigger: "blur"
          },
          { validator: nameValidate, trigger: "blur" },
          { validator: typeNameOnLyValidate, trigger: "blur" }
        ],
        categoryIndex: [{ validator: isNumberValidate, trigger: "blur" }]
      },
      // 分页数据
      pageSize: 10,
      pageCurrent: 1,
      pageTotal: 0,
      detailDialogVisible: false,
      advSearch: "cm.unfold",
      iconArrow: "el-icon-arrow-down",
      tableData: [],
      //搜索字段
      queryModel: {
        "createUserNo": "", //操作人
        "year": new Date().getFullYear().toString(), //年
        "month": (new Date().getMonth() + 1).toString().padStart(2, '0'), //月
        "content": "", //关键搜索内容
      },
      // 详情弹窗数据集
      logData: {},
      interactionTypeOption: [
        {
          value: "GET",
          label: "GET"
        },
        {
          value: "POST",
          label: "POST"
        }
      ],
      logDialogTitle: "",
      listLoading: false,
      //搜索字段
      queryFields: [
        { name: 'createUserNo', label: '', labelKey: 'sys.request_user', value: '', type: 'personal', display: true, order: 1 },
        { name: 'year', label: '', labelKey: 'sys.log_year', value: new Date().getFullYear().toString(), type: 'dateYear', display: true, order: 2 },
        { name: 'month', label: '', labelKey: 'sys.log_month', value: (new Date().getMonth() + 1).toString().padStart(2, '0'), type: 'dateMonth', display: true, order: 3 },
      ],
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
      //除去搜索条件前后空格内容
      this.filterText = this.filterText.trim();
      val = val.trim();
      this.$refs.typeTree.filter(val);
    }
  },
  mounted() {
    // 初始化
    this.initMaxHeight();
    this.initTreeData();
    this.logSearch();
    // throttleFunc记录当前的节流方法，用于在页面销毁时释放
    this.throttleFunc = throttle(this.initMaxHeight, 500);
    window.addEventListener("resize", this.throttleFunc);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.throttleFunc);
  },
  methods: {
    //分类树方法
    initTreeData() {
      this.treeLoading = true;
      logManageApi
        .typeTreeAPI({})
        .then(res => {
          if (res.code === "0") {
            this.treeData = res.data;
            this.treeLoading = false;
          } else {
            this.$message({ message: res.msg, type: "error" });
          }
        })
        .catch(error => {
          cmsg.httpCatchErrorMessage(this);
        });
    },
    // 点击分类树
    treeClick(data) {
      this.typeData = data;
      if (data.id === "****") {
        this.queryModel.categoryCode = "";
      } else {
        this.queryModel.categoryCode = data.code;
      }
      this.logSearch();
    },
    // 搜索分类
    filterTreeNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    // 收缩展开
    toggleTreeExpand() {
      this.isTreeCollapse = !this.isTreeCollapse;
    },
    // 添加/修改分类
    saveType: function(isUpdate) {
      let _this = this;
      _this.typeSaveIsAdd = !isUpdate;

      if (!_this.typeData.id && isUpdate) {
        _this.$message({
          message: _this.$t("sys.no_select_check"),
          type: "warning"
        });
        return;
      }
      if (isUpdate) {
        // 修改
        if (_this.typeData.id === "****") {
          _this.$message({
            message: _this.$t("sys.data_root_check"),
            type: "warning"
          });
          return;
        }
        _this.typeVo.parentId = _this.typeData.parentId;
        _this.typeVo.parentName = _this.typeData.parentName;
        _this.typeVo.id = _this.typeData.id;
        _this.typeVo.code = _this.typeData.code;
        _this.typeVo.name = _this.typeData.name;
        _this.typeVo.categoryIndex = _this.typeData.categoryIndex;
        _this.typeVo.categoryDesc = _this.typeData.categoryDesc;
      } else {
        // 新增
        _this.typeVo.id = '';
        if (!_this.typeData.id) {
          _this.typeVo.parentId = '****';
          _this.typeVo.parentName = '根节点';
        } else {
          _this.typeVo.parentId = _this.typeData.id;
          _this.typeVo.parentName = _this.typeData.name;
        }
        _this.typeVo.code = '';
        _this.typeVo.name = '';
        _this.typeVo.categoryDesc = '';
        _this.typeVo.categoryIndex = 0;
      }
      _this.typeSaveDialogVisible = true;
    },
    // 保存分类弹出框提交
    saveTypeSubmit: function() {
      let _this = this;
      const loading = _this.$loading();
      _this.$refs["typeSave"].validate(valid => {
        if (valid) {
          let api;
          if (_this.typeSaveIsAdd) {
            //新增
            api = logManageApi.addTypeAPI;
          } else {
            //修改
            api = logManageApi.saveTypeAPI;
          }
          api(_this.typeVo)
            .then(result => {
              loading.close();
              if (result.code === "0") {
                this.saveTypeClose();
                this.initTreeData();
              }
              _this.$message({
                dangerouslyUseHTMLString: true,
                message: result.msg,
                type: result.code === "0" ? "success" : "error"
              });
            })
            .catch(error => {
              loading.close();
              cmsg.httpCatchErrorMessage(this);
            });
        } else {
          loading.close();
          _this.$message({
            message: _this.$t("sys.fill_in_error"),
            type: "warning"
          });
          return false;
        }
      });
    },
    // 保存分类弹出框关闭
    saveTypeClose: function() {
      this.typeSaveDialogVisible = false;
      this.$refs["typeSave"].resetFields();
    },
    // 删除分类数据
    deleteType: function() {
      let _this = this;
      if (!_this.typeData.id) {
        _this.$message({
          message: _this.$t("sys.no_select_check"),
          type: "warning"
        });
        return;
      }
      if (_this.typeData.id === '****') {
        _this.$message({
          message: _this.$t("sys.data_root_check"),
          type: "warning"
        });
        return;
      }
      if (_this.typeData.children && _this.typeData.children.length !== 0) {
        _this.$message({
          message: _this.$t("sys.data_children_check"),
          type: "warning"
        });
        return;
      }
      if (_this.pageTotal !== 0) {
        _this.$message({
          message: _this.$t("sys.data_has_check"),
          type: "warning"
        });
        return;
      }
      _this
        .$confirm(_this.$t("cm.is_delete"), _this.$t("cm.tips"), {
          type: "warning",
          confirmButtonText: _this.$t("cm.confirm"),
          cancelButtonText: _this.$t("cm.cancel"),
          cancelButtonClass: "btn-second",
          confirmButtonClass: "btn-default"
        })
        .then(() => {
          _this.fullscreenLoading = true;
          let params = {
            id: _this.typeData.id
          };
          logManageApi
            .deleteTypeAPI(params)
            .then(result => {
              if (result.code === "0") {
                this.initTreeData();
              }
              _this.fullscreenLoading = false;
              _this.$message({
                message: result.msg,
                type: result.code === "0" ? "success" : "error"
              });
            })
            .catch(error => {
              cmsg.httpCatchErrorMessage(this);
              _this.fullscreenLoading = false;
            });
        });
    },
    cleanTypeVo() {
      this.typeVo = {};
    },
    // 动态计算高度
    initMaxHeight() {
      calcHeight(this);
    },
    //高级搜索展开
    advanceSearch: function (val) {
      let _this = this;
      _this.advSearch = val ? "cm.fold" : "cm.unfold";
      _this.iconArrow = val ? "el-icon-arrow-up" : "el-icon-arrow-down";
      let timer = setTimeout(() => {
        _this.initMaxHeight();
        clearTimeout(timer)
      }, 335);
    },
    //高级搜索
    search: function () {
      //除去搜索条件前后空格内容
      this.formName = this.formName.trim();
      this.searchParams = {
        categoryIds: [],
        formName: this.formName,
        status: this.status,
        createDateFrom: this.formDate === null ? "" : this.formDate[0],
        createDateTo: this.formDate === null ? "" : this.formDate[1],
        dataModelName: this.dataModelName,
        searchType: "2"
      };
      this.logListQuery();
    },
    logSearch() {
      let _this = this;
      let params = {
        current: 1,
        size: _this.pageSize
      };
      let queryForm = this.$refs.queryForm.getQueryForm();
      //除去搜索条件前后空格内容
      _this.queryModel.createUserNo = queryForm.createUserNo;
      // _this.queryModel.content = queryForm.content.trim();
      _this.queryModel.year = queryForm.year;
      _this.queryModel.month = queryForm.month;
      params = Object.assign(params, _this.queryModel);
      _this.logListQuery(params);
    },
    logReset() {
      let _this = this;
      _this.queryModel.createUserNo = "";
      _this.queryModel.content = "";
    },
    pageSizeChange(size) {
      let _this = this;
      let params = {
        current: 1,
        size: size
      };
      _this.pageSize = size;
      _this.pageCurrent = 1;
      params = Object.assign(params, _this.queryModel);
      _this.logListQuery(params);
    },
    pageCurrentChange(current) {
      let _this = this;
      let params = {
        current: current,
        size: _this.pageSize
      };
      _this.pageCurrent = current;
      params = Object.assign(params, _this.queryModel);
      _this.logListQuery(params);
    },
    logListQuery(params) {
      let _this = this;
      if (!params) {
        params = {
          current: _this.pageCurrent,
          size: _this.pageSize
        };
        params = Object.assign(params, _this.queryModel);
      }
      _this.listLoading = true;
      _this.treeLoading = true;
      logManageApi.pageLogListAPI(params).then(res => {
        if (res.code === "0") {
          if (res.data) _this.tableData = res.data.records;
          if (res.data) _this.pageTotal = res.data.total;
          _this.listLoading = false;
          _this.treeLoading = false;
        } else {
          _this.$message({
            message: res.msg,
            type: "warning"
          });
          _this.listLoading = false;
          _this.treeLoading = false;
          _this.tableData = [];
          _this.pageSize = 10;
          _this.pageCurrent = 1;
          _this.pageTotal = 0;
        }
      });
    },
    // 详情页面打开
    handleClick(row) {
      let _this = this;
      _this.fullscreenLoading = true;
      let params = {
        id: row.id,
        year: this.queryModel.year,
        month: this.queryModel.month
      }
      logManageApi.getLogDetailAPI(params).then(res => {
        if (res.code === "0") {
          _this.fullscreenLoading = false;
          _this.logDialogTitle = "sys.data_log_detail";
          _this.detailDialogVisible = true;
          _this.logData = _this.deepClone(row);
          //随机数
          const random = () => {
            return Math.floor(Math.random()*10000);
          }
          //转换数据格式
          const format = (data) => {
            let result = [];
            for(var name in data) {
              let field = {};
              //生成随机key
              field.id = name + random();
              if (Array.isArray(data)) {
                // field.name = '第' + (parseInt(name) + 1) + '行';
                let row = parseInt(name);
                if (data[row].hasOwnProperty('businessLogOptionFlag')) {
                  let option = data[row].businessLogOptionFlag;
                  field.option = option;
                  if (option == 'ADD') {
                    field.name = '[新增行]';
                  } else if (option == 'UPDATE') {
                    field.name = '[修改行]';
                  } else if (option == 'DELETE') {
                    field.name = '[删除行]';
                  }
                }
              } else {
                field.name = name;
              }
              if (data[name].hasOwnProperty('oldValue') && data[name].hasOwnProperty('newValue')) {
                field.oldValue = data[name].oldValue || '--';
                field.newValue = data[name].newValue || '--';
              } else if (typeof data[name] == 'object') {
                field.children = format(data[name]);
              }
              if (name !== 'businessLogOptionFlag') result.push(field);
            }
            return result;
          }
          //防止返回的不是json数据
          try {
            let json = JSON.parse(res.data);
            _this.logData.tableData = format(json);
          } catch(e) {
            console.error(e);
          }
        } else {
          _this.fullscreenLoading = false;
          _this.$message({
            message: res.msg,
            type: "warning"
          });
        }
      }).catch((err) => {
        _this.fullscreenLoading = false;
        _this.$message({
          message: err,
          type: "warning"
        });
      });
    },
    //单据号点击
    handleDetailClick(data) {
      let params = {
        id: data.id,
        month: this.queryModel.month,
        year: this.queryModel.year
      }
      //关闭当前弹窗
      this.detailDialogVisible = false;
      logManageApi.getLogJumpAPI(params).then((res) => {
        if (res.code === '0') {
          let dataInfo = res.data;
          this.openTab({
            path: '/' + dataInfo.router,
            query: {
              procId: dataInfo.procId,
              procName: dataInfo.procName,
              actId: dataInfo.actId,
              actName: dataInfo.actName,
              procNode: 3,
              procInstId: dataInfo.businessId,
              r: Math.random()
            }
          });
        } else {
          this.$message({ message: res.msg, type: "error" });
        }
      }).catch((err) => {
        this.$message({ message: err, type: "error" });
      })
    },
    //关闭弹窗
    logDetailClose() {
      let _this = this;
      _this.$refs["logDetailForm"].resetFields();
      _this.clearLogData();
      _this.detailDialogVisible = false;
    },
    clearLogData() {
      let _this = this;
      _this.logData = {};
    },
  }
};
