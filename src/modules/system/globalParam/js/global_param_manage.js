/*
 * @Author: P624219
 * @Date: 2021-09-10 15:23:34
 * @LastEditors: [P631038]杨旭
 * @LastEditTime: 2024-07-15 14:17:04
 * @Description: 全局参数
 */
//引入组件
import breadcrumb from "@/components/common/breadcrumb";
import globalParamManageAPI from "../api";
import cmsg from "@/components/common/message";
import { throttle } from "@/utils/funcUtil";
import queryForm from "@/components/common/queryForm";
import { calcHeight } from "@/utils/funcUtil";

export default {
  components: {
    breadcrumb,
    globalParamManageAPI,
    queryForm
  },
  watch: {
    paramTypeFilterText(val) {
      //除去搜索条件前后空格内容
      this.paramTypeFilterText = this.paramTypeFilterText.trim();
      val = val.trim();
      this.$refs.paramTypeTree.filter(val);
    }
  },
  mounted() {
    this.initParamTypeTreeData();
    this.queryParamList(true);
    this.initMaxHeight();
    // throttleFunc记录当前的节流方法，用于在页面销毁时释放
    this.throttleFunc = throttle(this.initMaxHeight, 500);
    window.addEventListener("resize", this.throttleFunc);
  },
  data() {
    //自定义校验规则
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
    let paramTypeCodeOnLyValidate = (rule, value, callback) => {
      let _this = this;
      let params = {
        paramTypeCode: value,
        paramTypeId: _this.paramTypeVo.paramTypeId
      };
      globalParamManageAPI
        .checkParamTypeCodeOnLyAPI(params)
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
    let paramTypeNameOnLyValidate = (rule, value, callback) => {
      let _this = this;
      let params = {
        paramTypeName: value,
        paramTypeId: _this.paramTypeVo.paramTypeId
      };
      globalParamManageAPI
        .checkParamTypeNameOnLyAPI(params)
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
    let paramCodeOnLyValidate = (rule, value, callback) => {
      let _this = this;
      let params = {
        paramCode: value,
        paramTypeId: _this.paramVo.paramTypeId,
        paramId: _this.paramVo.paramId
      };
      globalParamManageAPI
        .checkParamCodeOnLyAPI(params)
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
    let paramNameOnLyValidate = (rule, value, callback) => {
      let _this = this;
      let params = {
        paramName: value,
        paramTypeId: _this.paramVo.paramTypeId,
        paramId: _this.paramVo.paramId
      };
      globalParamManageAPI
        .checkParamNameOnLyAPI(params)
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
      brand: [{ name: "sys.system_manage" }, { name: "sys.global_param" }],
      height: 0,
      treeLoading: true,
      //分类树属性
      paramTypeTreeData: [],
      paramType: {},
      paramTypeTreeOption: {
        children: "children",
        label: "label"
      },
      paramTypeFilterText: "",
      clearnode: true,
      //全局参数列表查询条件
      searchParamVo: {
        paramName: "",
        paramCode: "",
        paramTypeId: ""
      },
      globalParamTableData: [],
      //分页
      tablePage: {
        pageIndex: 1,
        pageSize: 10,
        total: 0
      },
      // 表格加载状态
      listLoading: false,
      //表格选中
      mulSelect: [],
      // 参数类型保存弹出框是否是新增
      paramTypeSaveIsAdd: true,
      // 参数类型保存弹出框是否显示
      paramTypeSaveDialogVisible: false,
      // 参数类型保存弹出框数据绑定
      paramTypeVo: {
        paramTypeId: "",
        paramTypeCode: "",
        paramTypeName: "",
        parentName: "",
        paramTypeOrder: "1",
        paramTypeComment: "",
        paramTypeParentId: ""
      },
      // 参数类型保存弹出框数据校验规则
      paramTypeRules: {
        paramTypeCode: [
          {
            required: true,
            message: this.$t("sys.dict_dcode"),
            trigger: "blur"
          },
          { validator: codeValidate, trigger: "blur" },
          { validator: paramTypeCodeOnLyValidate, trigger: "blur" }
        ],
        paramTypeName: [
          {
            required: true,
            message: this.$t("sys.dict_dname"),
            trigger: "blur"
          },
          { validator: nameValidate, trigger: "blur" },
          { validator: paramTypeNameOnLyValidate, trigger: "blur" }
        ],
        paramTypeOrder: [{ validator: isNumberValidate, trigger: "blur" }]
      },

      // 参数类型保存弹出框是否是新增
      paramSaveIsAdd: true,
      // 参数类型保存弹出框是否显示
      paramSaveDialogVisible: false,
      // 参数类型保存弹出框数据绑定
      paramVo: {
        paramId: "",
        paramTypeId: "",
        paramTypeIdLabel: "",
        paramCode: "",
        paramName: "",
        paramType: "",
        paramTypeLabel: "",
        paramValue: "",
        paramOrder: "1",
        paramComment: ""
      },
      // 参数类型保存弹出框数据校验规则
      paramRules: {
        paramTypeIdLabel: [
          {
            required: true,
            message: this.$t("sys.param_category_required"),
            trigger: "change"
          }
        ],
        paramCode: [
          {
            required: true,
            message: this.$t("sys.param_code_required"),
            trigger: "blur"
          },
          { validator: codeValidate, trigger: "blur" },
          { validator: paramCodeOnLyValidate, trigger: "blur" }
        ],
        paramName: [
          {
            required: true,
            message: this.$t("sys.param_name_required"),
            trigger: "blur"
          },
          { validator: nameValidate, trigger: "blur" },
          { validator: paramNameOnLyValidate, trigger: "blur" }
        ],
        paramTypeLabel: [
          {
            required: true,
            message: this.$t("sys.param_type_required"),
            trigger: "change"
          }
        ],
        paramValue: [
          {
            required: true,
            message: this.$t("sys.param_value_required"),
            trigger: "change"
          }
        ],
        paramOrder: [{ validator: isNumberValidate, trigger: "blur" }]
      },
      paramValueList: [
        { key: 0, value: "0", label: this.$t("cm.false") },
        { key: 1, value: "1", label: this.$t("cm.true") }
      ],
      fullscreenLoading: false,
      isTreeCollapse: false,
      maxTreeHeight: 0,
      maxTableHeight: 0,
      maxRightHeight: 0,
      //搜索字段
      queryFields: [
        { name: 'paramCode', label: '', labelKey: 'sys.param_item_code', value: '', type: 'input', display: true, order: 1 },
        { name: 'paramName', label: '', labelKey: 'sys.param_item_name', value: '', type: 'input', display: true, order: 2 },
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
  methods: {
    // 动态计算目录树和表格高度
    initMaxHeight() {
      calcHeight(this);
    },
    toggleTreeExpand() {
      this.isTreeCollapse = !this.isTreeCollapse;
    },
    //分类树方法
    initParamTypeTreeData() {
      this.treeLoading = true;
      globalParamManageAPI
        .paramTypeTreeAPI({})
        .then(res => {
          if (res.code === "0") {
            this.paramTypeTreeData = res.data;
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
    paramTypeTreeNodeClick(data) {
      this.paramType = data;
      if ("***" !== data.supId && data.children.length > 0) {
        return;
      }
      if ("***" === data.supId) {
        this.searchParamVo.paramTypeId = "";
      } else {
        this.searchParamVo.paramTypeId = data.id;
      }
      this.queryParamList(true);
    },
    // 搜索分类
    filterParamTypeTreeNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    //流程模板列表
    queryParamList(init) {
      this.listLoading = true;
      this.treeLoading = true;
      let params = {};
      if (init) {
        this.tablePage.pageIndex = 1;
      }
      params.current = this.tablePage.pageIndex;
      params.size = this.tablePage.pageSize;
      //除去搜索条件前后空格内容
      this.searchParamVo.paramName = this.searchParamVo.paramName.trim();
      this.searchParamVo.paramCode = this.searchParamVo.paramCode.trim();
      params = Object.assign(params, this.searchParamVo);
      let _this = this;
      globalParamManageAPI
        .getListAPI(params)
        .then(result => {
          //填充数据
          if (result.code === "0") {
            let data = result.data;
            _this.globalParamTableData = data.records;
            _this.tablePage.pageIndex = data.current;
            _this.tablePage.pageSize = data.size;
            _this.tablePage.total = data.total;
          } else {
            this.$message({ message: result.msg, type: "error" });
          }
          _this.listLoading = false;
          _this.treeLoading = false;
        })
        .catch(error => {
          cmsg.httpCatchErrorMessage(this);
          _this.listLoading = false;
          _this.treeLoading = false;
        });
    },
    // 点击查询
    searchParam() {
      let queryForm = this.$refs.queryForm.getQueryForm();
      this.searchParamVo.paramName = queryForm.paramName;
      this.searchParamVo.paramCode = queryForm.paramCode;
      this.queryParamList(true);
    },
    // 点击重置，重置查询条件
    resetParam() {
      this.searchParamVo.paramName = "";
      this.searchParamVo.paramCode = "";
    },
    // 列表选中变更
    selectChange(val) {
      this.mulSelect = val;
      console.log(this.mulSelect);
    },
    // 变更每页条数
    changeSize(pageSize) {
      this.tablePage.pageSize = pageSize;
      this.tablePage.pageIndex = 1;
      this.queryParamList();
    },
    // 变更当前页
    changeCurrentPage: function(current) {
      this.tablePage.pageIndex = current;
      this.queryParamList();
    },
    // 添加参数分类
    saveParamType: function(isUpdate) {
      let _this = this;
      _this.paramTypeSaveIsAdd = !isUpdate;
      if (_this.paramType.id !== undefined) {
        if (_this.paramType.paramTypeStatus === 1) {
          _this.$message({
            message: _this.$t("sys.system_level_check"),
            type: "warning"
          });
          return;
        }
        if (isUpdate) {
          if (_this.paramType.supId === "***") {
            _this.$message({
              message: _this.$t("sys.root_check"),
              type: "warning"
            });
            return;
          }
          _this.paramTypeVo.paramTypeId = _this.paramType.id;
          _this.paramTypeVo.paramTypeCode = _this.paramType.code;
          _this.paramTypeVo.paramTypeName = _this.paramType.label;
          _this.paramTypeVo.paramTypeOrder = _this.paramType.paramTypeIndex;
          _this.paramTypeVo.paramTypeComment = _this.paramType.comment;
          _this.paramTypeVo.paramTypeParentId = _this.paramType.supId;
          _this.paramTypeVo.parentName = _this.paramType.label;
        } else {
          _this.paramTypeVo.paramTypeParentId = _this.paramType.id;
          _this.paramTypeVo.parentName = _this.paramType.label;
        }
        this.paramTypeSaveDialogVisible = true;
      } else {
        if (!isUpdate) {
          let paramType = this.paramTypeTreeData[0];
          _this.paramTypeVo.paramTypeParentId = paramType.id;
          _this.paramTypeVo.parentName = paramType.label;
          this.paramTypeSaveDialogVisible = true;
        } else {
          _this.$message({
            message: _this.$t("sys.no_select_check"),
            type: "warning"
          });
        }
      }
    },
    // 保存参数分类弹出框提交
    paramTypeSaveSubmit: function() {
      let _this = this;
      const loading = this.$loading();
      _this.$refs["paramTypeSave"].validate(valid => {
        loading.close();
        if (valid) {
          _this.fullscreenLoading = true;
          globalParamManageAPI
            .saveParamTypeAPI(_this.paramTypeVo)
            .then(result => {
              _this.fullscreenLoading = false;
              if (result.code === "0") {
                this.paramTypeSaveClose();
                this.initParamTypeTreeData();
              }
              _this.$message({
                dangerouslyUseHTMLString: true,
                message: result.msg,
                type: result.code === "0" ? "success" : "error"
              });
            })
            .catch(error => {
              _this.fullscreenLoading = false;
              cmsg.httpCatchErrorMessage(this);
            });
        } else {
          _this.$message({
            message: _this.$t("sys.fill_in_error"),
            type: "warning"
          });
          return false;
        }
      });
    },
    // 保存参数分类弹出框关闭
    paramTypeSaveClose: function() {
      this.paramTypeSaveDialogVisible = false;
      this.$refs["paramTypeSave"].resetFields();
      this.cleanParamTypeVO();
    },
    // 清空保存参数分类弹出框绑定数据
    cleanParamTypeVO() {
      this.paramTypeVo = {
        paramTypeId: "",
        paramTypeCode: "",
        paramTypeName: "",
        paramTypeOrder: "1",
        paramTypeComment: "",
        paramTypeParentId: ""
      };
    },
    // 删除分类数据
    deleteParamType: function() {
      let _this = this;
      if (_this.paramType.id !== undefined) {
        if (_this.paramType.paramTypeStatus === 1) {
          _this.$message({
            message: _this.$t("sys.system_level_check"),
            type: "warning"
          });
          return;
        }
        if (_this.paramType.children.length !== 0) {
          _this.$message({
            message: _this.$t("sys.has_child_check"),
            type: "warning"
          });
          return;
        }
        if (_this.tablePage.total !== 0) {
          _this.$message({
            message: _this.$t("sys.has_param_check"),
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
              paramTypeId: _this.paramType.id
            };
            globalParamManageAPI
              .deleteParamTypeAPI(params)
              .then(result => {
                if (result.code === "0") {
                  this.initParamTypeTreeData();
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
      } else {
        _this.$message({
          message: _this.$t("sys.no_select_check"),
          type: "warning"
        });
      }
    },
    // 添加参数
    saveParam: function(data) {
      let _this = this;
      if (data.paramId !== undefined) {
        _this.paramVo.paramId = data.paramId;
        _this.paramVo.paramCode = data.paramCode;
        _this.paramVo.paramName = data.paramName;
        _this.paramVo.paramType = data.paramType;
        _this.paramVo.paramTypeLabel =
          data.paramType === 0
            ? _this.$t("sys.system_level")
            : _this.$t("sys.user_defined");
        _this.paramVo.paramTypeId = data.paramTypeId;
        _this.paramVo.paramValue = data.paramValue;
        _this.paramVo.paramOrder = data.paramOrder;
        _this.paramVo.paramComment = data.paramComment;
        let params = {
          paramTypeId: data.paramTypeId
        };
        globalParamManageAPI
          .getParamTypeByIdAPI(params)
          .then(result => {
            if (result.code === "0") {
              _this.paramVo.paramTypeIdLabel = result.data;
            }
          })
          .catch(error => {
            cmsg.httpCatchErrorMessage(this);
          });
        _this.paramSaveIsAdd = false;
      } else {
        if (
          _this.paramType.id !== undefined &&
          _this.paramType.paramTypeStatus !== 1 &&
          _this.paramType.supId !== "***"
        ) {
          _this.paramVo.paramTypeId = _this.paramType.id;
          _this.paramVo.paramTypeIdLabel = _this.paramType.label;
        }
        _this.paramVo.paramType = 1;
        _this.paramVo.paramTypeLabel = _this.$t("sys.user_defined");
        _this.paramSaveIsAdd = true;
      }
      _this.paramSaveDialogVisible = true;
    },
    // 保存参数分类弹出框提交
    paramSaveSubmit: function() {
      let _this = this;
      _this.fullscreenLoading = true;
      _this.$refs["paramSave"].validate(valid => {
        if (valid) {
          globalParamManageAPI
            .saveParamAPI(_this.paramVo)
            .then(result => {
              _this.fullscreenLoading = false;
              if (result.code === "0") {
                this.paramSaveClose();
                this.queryParamList(true);
              }
              _this.$message({
                dangerouslyUseHTMLString: true,
                message: result.msg,
                type: result.code === "0" ? "success" : "error"
              });
            })
            .catch(error => {
              _this.fullscreenLoading = false;
              cmsg.httpCatchErrorMessage(this);
            });
        } else {
          _this.fullscreenLoading = false;
          _this.$message({
            message: _this.$t("sys.fill_in_error"),
            type: "warning"
          });
          return false;
        }
      });
    },
    // 保存参数弹出框关闭
    paramSaveClose: function() {
      this.paramSaveDialogVisible = false;
      this.$refs["paramSave"].resetFields();
      this.cleanParamVO();
    },
    // 清空保存参数分类弹出框绑定数据
    cleanParamVO() {
      this.paramVo = {
        paramId: "",
        paramTypeId: "",
        paramTypeIdLabel: "",
        paramCode: "",
        paramName: "",
        paramType: "",
        paramTypeLabel: "",
        paramValue: "",
        paramOrder: "1",
        paramComment: ""
      };
    },
    // 删除参数
    deleteParam: function(id) {
      let _this = this;
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
            paramId: id
          };
          globalParamManageAPI
            .deleteParamAPI(params)
            .then(result => {
              if (result.code === "0") {
                _this.queryParamList(true);
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
    }
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.throttleFunc);
  }
};
