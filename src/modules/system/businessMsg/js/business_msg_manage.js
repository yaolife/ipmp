//引入组件
import breadcrumb from "@/components/common/breadcrumb";
import businessMsgAPI from "../api";
import cmsg from "@/components/common/message";
import { throttle } from "@/utils/funcUtil";
import queryForm from "@/components/common/queryForm";
import { calcHeight } from "@/utils/funcUtil";

export default {
  components: {
    breadcrumb,
    businessMsgAPI,
    queryForm
  },
  data() {
    //自定义校验规则
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
    let categoryCodeOnLyValidate = (rule, value, callback) => {
      let _this = this;
      let params = {
        categoryCode: value,
        categoryId: _this.cateSaveVo.categoryId
      };
      businessMsgAPI
        .checkCateCodeOnLyAPI(params)
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
    let categoryNameOnLyValidate = (rule, value, callback) => {
      let _this = this;
      let params = {
        categoryName: value,
        categoryId: _this.cateSaveVo.categoryId
      };
      businessMsgAPI
        .checkCateNameOnLyAPI(params)
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
    let msgKeyOnLyValidate = (rule, value, callback) => {
      let _this = this;
      let params = {
        businessMsgId: _this.msgSaveVo.businessMsgId,
        msgKey: value,
        msgType: _this.msgSaveVo.msgType,
        langId: _this.msgSaveVo.langId,
      };
      businessMsgAPI
        .checkMsgKeyOnLyAPI(params)
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
    let msgNameOnLyValidate = (rule, value, callback) => {
      let _this = this;
      let params = {
        msgName: value,
        categoryId: _this.msgSaveVo.categoryId,
        msgId: _this.msgSaveVo.msgId
      };
      businessMsgAPI
        .checkMsgNameOnLyAPI(params)
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
      brand: [{ name: "sys.system_manage" }, { name: "sys.business_msg_manage" }],
      maxTreeHeight: 0,
      maxTableHeight: 0,
      maxRightHeight: 0,
      fullscreenLoading: false,
      isTreeCollapse: false,
      treeLoading: true,
      //分类树属性
      treeData: [],
      //选中分类
      treeSelected: {},
      treeOption: {
        children: "children",
        label: "name"
      },
      filterText: "",
      //搜索模型
      searchVo: {},
      //多语言列表
      langList: [],
      //表格数据
      tableData: [],
      //分页
      tablePage: {
        pageIndex: 1,
        pageSize: 10,
        total: 0
      },
      // 表格加载状态
      tableLoading: false,
      //表格选中
      tableSelected: [],
      // 分类保存弹出框是否是新增
      cateSaveIsAdd: true,
      // 分类保存弹出框是否显示
      cateSaveDialogVisible: false,
      // 分类保存弹出框数据绑定
      cateSaveVo: {
        parentId: "",
        parentName: "",
        categoryId: "",
        categoryCode: "",
        categoryName: "",
        categoryDesc: "",
      },
      // 分类保存弹出框数据校验规则
      cateRules: {
        categoryCode: [
          {
            required: true,
            message: this.$t("sys.dict_dcode"),
            trigger: "blur"
          },
          { validator: codeValidate, trigger: "blur" },
          { validator: categoryCodeOnLyValidate, trigger: "blur" }
        ],
        categoryName: [
          {
            required: true,
            message: this.$t("sys.dict_dname"),
            trigger: "blur"
          },
          { validator: nameValidate, trigger: "blur" },
          { validator: categoryNameOnLyValidate, trigger: "blur" }
        ],
      },
      // 保存弹出框是否是新增
      msgSaveIsAdd: true,
      // 保存弹出框是否显示
      msgSaveDialogVisible: false,
      // 保存弹出框数据绑定
      msgSaveVo: {
        businessMsgId: "",
        categoryId: "",
        categoryName: "",
        msgKey: "",
        msgValue: "",
        langId: "",
        msgLangName: "",
        msgType: "",
      },
      // 保存弹出框数据校验规则
      msgSaveRules: {
        msgKey: [
          {
            required: true,
            message: this.$t("sys.msg_code_required"),
            trigger: "blur"
          },
          { validator: codeValidate, trigger: "blur" },
          { validator: msgKeyOnLyValidate, trigger: "blur" }
        ],
        msgValue: [
          {
            required: true,
            message: this.$t("sys.msg_value_required"),
            trigger: "blur"
          }
        ],
        msgType: [
          {
            required: true,
            message: this.$t("sys.msg_type_required"),
            trigger: "blur"
          }
        ],
        langId: [
          {
            required: true,
            message: this.$t("sys.msg_lang_required"),
            trigger: "blur"
          }
        ],
      },
      //搜索字段
      queryFields: [
        { name: 'msgKey', label: '', labelKey: 'sys.msg_key', value: '', type: 'input', display: true, order: 1 },
        { name: 'msgType', label: '', labelKey: 'sys.msg_type', value: '', type: 'select', display: true, order: 2, fieldMap: [
          { value: "1", label: "后端消息" },
          { value: "2", label: "前端消息" }
        ] },
      ],
    };
  },
  mounted() {
    this.initTreeData();
    this.queryMsgList(true);
    this.getLangList();

    this.initMaxHeight();
    // throttleFunc记录当前的节流方法，用于在页面销毁时释放
    this.throttleFunc = throttle(this.initMaxHeight, 500);
    window.addEventListener("resize", this.throttleFunc);
  },
  watch: {
    filterText(val) {
      //除去搜索条件前后空格内容
      this.filterText = this.filterText.trim();
      val = val.trim();
      this.$refs.cateTree.filter(val);
    }
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
    //获取语言列表
    getLangList() {
      businessMsgAPI.getLangListAPI({ categoryCode: "" }).then((res) => {
        if (res.code === '0') {
          this.langList = [];
          res.data.forEach((item) => {
            this.langList.push({
              label: item.langName,
              value: item.langId,
              code: item.langCode
            })
          })
        }
      })
    },
    //分类树方法
    initTreeData() {
      this.treeLoading = true;
      businessMsgAPI
        .cateTreeAPI({ parentId: '-1' })
        .then(res => {
          if (res.code === "0") {
            this.treeData = res.data;
            this.treeLoading = false;
          } else {
            this.$message({ message: res.msg, type: "error" });
          }
        })
        .catch(error => {
          this.treeLoading = false;
          cmsg.httpCatchErrorMessage(this);
        });
    },
    // 点击分类树
    treeNodeClick(data) {
      this.treeSelected = data;
      if (data.parentId === "-1") {
        this.searchVo.categoryId = "";
      } else {
        this.searchVo.categoryId = data.categoryId;
      }
      this.queryMsgList(true);
    },
    // 搜索分类
    filterTreeNode(value, data) {
      if (!value) return true;
      return data.name.indexOf(value) !== -1;
    },
    //消息列表
    queryMsgList(init) {
      this.tableLoading = true;
      this.treeLoading = true;
      let params = {};
      if (init) {
        this.tablePage.pageIndex = 1;
      }
      params.current = this.tablePage.pageIndex;
      params.size = this.tablePage.pageSize;
      //除去搜索条件前后空格内容
      params = Object.assign(params, this.searchVo);
      let _this = this;
      businessMsgAPI
        .getListAPI(params)
        .then(result => {
          //填充数据
          if (result.code === "0") {
            let data = result;
            _this.tableData = data.records;
            _this.tablePage.pageIndex = data.current;
            _this.tablePage.pageSize = data.size;
            _this.tablePage.total = data.total;
          } else {
            this.$message({ message: result.msg, type: "error" });
          }
          _this.tableLoading = false;
          _this.treeLoading = false;
        })
        .catch(error => {
          cmsg.httpCatchErrorMessage(this);
          _this.tableLoading = false;
          _this.treeLoading = false;
        });
    },
    // 点击查询
    searchMsg() {
      let queryForm = this.$refs.queryForm.getQueryForm();
      //除去搜索条件前后空格内容
      this.searchVo.msgKey = queryForm.msgKey.trim();
      this.searchVo.msgType = queryForm.msgType;
      this.queryMsgList(true);
    },
    // 点击重置，重置查询条件
    resetMsg() {
      this.searchVo.msgKey = "";
      this.searchVo.msgType = "";
    },
    // 列表选中变更
    selectChange(val) {
      this.tableSelected = val;
      console.log(this.tableSelected);
    },
    // 变更每页条数
    changeSize(pageSize) {
      this.tablePage.pageSize = pageSize;
      this.tablePage.pageIndex = 1;
      this.queryMsgList();
    },
    // 变更当前页
    changeCurrentPage: function(current) {
      this.tablePage.pageIndex = current;
      this.queryMsgList();
    },
    //通过ID遍历搜索树
    searchTreeById: function(categoryId, node) {
      let result = null;
      let treeData = node ? node : this.treeData;
      // console.log('treeData', treeData);
      if (treeData && treeData.length > 0) {
        treeData.forEach((item) => {
          if (item.categoryId == categoryId) {
            result = item;
          } else if (item.children && item.children.length > 0) {
            let find = this.searchTreeById(categoryId, item.children);
            if (find) result = find;
          }
        })
      }
      return result;
    },
    // 编辑分类
    saveCate: function(isUpdate) {
      // console.log('isUpdate', isUpdate);
      let _this = this;
      _this.cateSaveIsAdd = !isUpdate;

      if (!_this.treeSelected || !_this.treeSelected.categoryId) {
        _this.$message({
          message: _this.$t("sys.msg_category_required"),
          type: "warning"
        });
        return;
      }
      if (isUpdate && _this.treeSelected.parentId == -1) {
        _this.$message({
          message: _this.$t("sys.msg_root_check"),
          type: "warning"
        });
        return;
      }

      if (isUpdate) {
        _this.cateSaveVo.categoryId = _this.treeSelected.categoryId;
        _this.cateSaveVo.categoryCode = _this.treeSelected.categoryCode;
        _this.cateSaveVo.categoryName = _this.treeSelected.categoryName;
        _this.cateSaveVo.categoryDesc = _this.treeSelected.categoryDesc;

        let node = _this.searchTreeById(_this.treeSelected.parentId);
        _this.cateSaveVo.parentId = _this.treeSelected.parentId;
        _this.cateSaveVo.parentName = node ? node.categoryName : '无';
      } else if (!isUpdate) {
        let node = _this.searchTreeById(_this.treeSelected.categoryId);
        _this.cateSaveVo.parentId = _this.treeSelected.categoryId;
        _this.cateSaveVo.parentName = node ? node.categoryName : '无';
      } else {
        return;
      }
      _this.cateSaveDialogVisible = true;
    },
    // 编辑分类弹出框提交
    saveCateSubmit: function() {
      let _this = this;
      const loading = _this.$loading();
      _this.$refs["cateSave"].validate(valid => {
        if (valid) {
          businessMsgAPI
            .saveCateAPI(_this.cateSaveVo)
            .then(result => {
              loading.close();
              if (result.code === "0") {
                this.saveCateClose();
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
    // 编辑分类弹出框关闭
    saveCateClose: function() {
      this.cateSaveDialogVisible = false;
      this.$refs["cateSave"].resetFields();
      this.cleanCateVo();
    },
    // 清空分类弹出框绑定数据
    cleanCateVo() {
      this.cateSaveVo = {
        categoryId: "",
        categoryCode: "",
        categoryName: "",
        categoryDesc: "",
        parentId: "",
        parentName: "",
      };
    },
    // 删除分类数据
    deleteCate: function() {
      let _this = this;
      if (_this.treeSelected.categoryId !== undefined) {
        if (_this.treeSelected.parentId == -1) {
          _this.$message({
            message: _this.$t("sys.msg_root_check"),
            type: "warning"
          });
          return;
        }
        if (_this.treeSelected.children && _this.treeSelected.children.length !== 0) {
          _this.$message({
            message: _this.$t("sys.has_child_check"),
            type: "warning"
          });
          return;
        }
        if (_this.tablePage.total !== 0) {
          _this.$message({
            message: _this.$t("sys.msg_has_check"),
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
              categoryId: _this.treeSelected.categoryId
            };
            businessMsgAPI
              .deleteCateAPI(params)
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
      } else {
        _this.$message({
          message: _this.$t("sys.no_select_check"),
          type: "warning"
        });
      }
    },
    // 编辑消息
    saveMsg: function(data) {
      let _this = this;
      if (data.businessMsgId !== undefined) {
        _this.msgSaveIsAdd = false;
        _this.msgSaveVo.businessMsgId = data.businessMsgId;
        _this.msgSaveVo.categoryId = data.categoryId;
        _this.msgSaveVo.categoryName = data.categoryName;
        _this.msgSaveVo.msgKey = data.msgKey;
        _this.msgSaveVo.msgValue = data.msgValue;
        _this.msgSaveVo.msgType = data.msgType;
        _this.msgSaveVo.langId = data.langId;
        _this.msgSaveVo.msgLangName = data.msgLangName;
      } else if (_this.treeSelected.categoryId) {
        _this.msgSaveIsAdd = true;
        _this.msgSaveVo.categoryId = _this.treeSelected.categoryId;
        _this.msgSaveVo.categoryName = _this.treeSelected.categoryName;
        _this.msgSaveVo.msgType = 1;
        let lang = _this.langList.find((item) => item.code === 'cn');
        if (lang) {
          _this.msgSaveVo.langId = lang.value;
          _this.msgSaveVo.msgLangName = lang.label;
        }
      } else {
        _this.$message({
          message: _this.$t('sys.msg_category_required'),
          type: "error"
        });
        return;
      }
      _this.msgSaveDialogVisible = true;
    },
    // 编辑消息弹出框提交
    saveMsgSubmit: function() {
      let _this = this;
      const loading = _this.$loading();
      _this.$refs["msgSave"].validate(valid => {
        if (valid) {
          businessMsgAPI
            .saveMsgAPI(_this.msgSaveVo)
            .then(result => {
              loading.close();
              if (result.code === "0") {
                //如果是前端消息，刷新这条缓存
                if (_this.msgSaveVo.msgType == 2) this.updateOneCache(result.data);
                this.saveMsgClose();
                this.queryMsgList(true);
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
    // 编辑消息弹出框关闭
    saveMsgClose: function() {
      this.msgSaveDialogVisible = false;
      this.$refs["msgSave"].resetFields();
      this.cleanMsgSaveVo();
    },
    // 清空弹出框绑定数据
    cleanMsgSaveVo: function() {
      this.msgSaveVo = {
        categoryId: "",
        categoryName: "",
        msgKey: "",
        msgValue: "",
        msgType: "",
        langId: "",
        msgLangName: "",
      };
    },
    // 删除消息
    deleteMsg: function(data) {
      let id = data.businessMsgId;
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
            ids: [id]
          };
          businessMsgAPI
            .deleteMsgAPI(params)
            .then(result => {
              if (result.code === "0") {
                //如果是前端消息，删除这条缓存
                if (data.msgType == '2') this.deleteOneCache(id);
                _this.queryMsgList(true);
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
    //更新单个消息缓存
    updateOneCache(msgId) {
      let params = { businessMsgId: msgId };
      businessMsgAPI.getOneMsgAPI(params).then((res) => {
        if (res.code === '0' && res.data) {
          let storage = localStorage.getItem('business_msg');
          let business_msg = JSON.parse(storage);
          let index = -1;
          business_msg.forEach((item, index1) => {
            if (item.businessMsgId == msgId) {
              index = index1;
            }
          });
          if (index >= 0) {
            business_msg[index] = res.data;
          } else {
            business_msg.push(res.data);
          }
          localStorage.setItem('business_msg', JSON.stringify(business_msg));
        }
      })
    },
    //删除单个消息缓存
    deleteOneCache(msgId) {
      let storage = localStorage.getItem('business_msg');
      let business_msg = JSON.parse(storage);
      business_msg = business_msg.filter((item) => item.businessMsgId !== msgId);
      localStorage.setItem('business_msg', JSON.stringify(business_msg));
    },
    //更新所有消息缓存
    updateAllCache() {
      businessMsgAPI.getAllMsgAPI().then((res) => {
        if (res.code === '0') {
          localStorage.setItem('business_msg', JSON.stringify(res.data));
        }
      })
    },
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.throttleFunc);
  }
};
