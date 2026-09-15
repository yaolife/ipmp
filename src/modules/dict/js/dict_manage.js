import { hasPermission } from "@/permission/btn";
import fixedbutton from "@/components/common/fixedbutton";
import breadcrumb from "@/components/common/breadcrumb";
import dictAPI from "../api";
import { mixinsPage } from "@/mixins/index";
import { throttle } from "@/utils/funcUtil";
import queryForm from "@/components/common/queryForm";
import { calcHeight } from "@/utils/funcUtil";

export default {
  mixins: [mixinsPage],
  components: {
    breadcrumb,
    "fixed-button": fixedbutton,
    queryForm
  },
  data() {
    let colNameValidate = (rule, value, callback) => {
      let reg = /^[\-_a-zA-Z0-9]+$/;
      if (!value) {
        callback(new Error(this.$t("cm.tiprequired")));
      } else {
        if (!reg.test(value)) {
          callback(new Error(this.$t("dict.dict_code_valid")));
        } else {
          callback();
        }
      }
    };
    return {
      flag: true,
      tableLoading: false,
      tableLoading2: false,
      hasIcon: false,
      brand: [{ name: "dict.dict_manage" }, { name: "dict.dict_brand" }],
      height: "0",
      selectnum: "0",
      activeName: "local",
      clearnode: true,
      is_collapse: false,
      advSearch: "cm.advance_search",
      dictItemTableData: [],
      dictItemTableDataRemote: [],
      isSelected: [],
      mulSelect: [],
      showDisabled: true,
      showDialog: false,
      loading: false,
      total: 0,
      currentPage: 0,
      pageCount: 0,
      pageSize: 10,
      totalRemote: 0,
      currentPageRemote: 0,
      pageCountRemote: 0,
      pageSizeRemote: 10,
      model: {
        rptOnlineCode: "",
        rptOnlineName: ""
      },
      dictQueryModel: {
        itemText: "",
        dictId: ""
      },
      dictQueryModelRemote: {
        itemCode: "",
        itemName: "",
        itemStatus: "",
        dictId: ""
      },
      loading1: false,
      loading2: false,
      //
      dictData: [],
      dictDataRemote: [],
      dictTreeOption: {
        children: "children",
        label: "dictName"
      },
      dictTreeOptionRemote: {
        children: "children",
        label: "dictName",
        isLeaf: "leaf"
      },
      dictFilterText: "",
      dictFilterTextRemote: "",
      dictItemVO: {
        id: "",
        dictId: "",
        itemCode: "",
        itemText: "",
        itemValue: "",
        itemDesc: "",
        itemSortOrder: 0,
        itemStatus: ""
      },
      dictVO: {
        id: "",
        dictName: "",
        dictCode: "",
        supDictId: "",
        supDictName: "",
        dictDesc: "",
        dictType: "0"
      },
      configDictItemShow: false,
      configDictDialogVisible: false,
      dictSaveAction: "",
      dictItemSaveAction: "",
      dictItemRules: {
        itemCode: [
          {
            required: true,
            message: this.$t("cm.tiprequired"),
            trigger: "blur"
          },
          {
            min: 1,
            max: 32,
            message: this.$t("dict.length_32"),
            trigger: "blur"
          },
          { required: true, validator: colNameValidate, trigger: "blur" }
        ],
        itemText: [
          {
            required: true,
            message: this.$t("cm.tiprequired"),
            trigger: "blur"
          },
          {
            min: 1,
            max: 64,
            message: this.$t("dict.length_64"),
            trigger: "blur"
          }
        ],
        itemValue: [
          {
            required: true,
            message: this.$t("cm.tiprequired"),
            trigger: "blur"
          },
          {
            min: 1,
            max: 128,
            message: this.$t("dict.length_128"),
            trigger: "blur"
          }
        ]
      },
      dictRules: {
        dictName: [
          {
            required: true,
            message: this.$t("cm.tiprequired"),
            trigger: "blur"
          },
          {
            min: 1,
            max: 64,
            message: this.$t("dict.length_64"),
            trigger: "blur"
          },
          { validator: this.validateDictName, trigger: "blur" }
        ],
        dictCode: [
          {
            required: true,
            message: this.$t("cm.tiprequired"),
            trigger: "blur"
          },
          {
            min: 1,
            max: 32,
            message: this.$t("dict.length_32"),
            trigger: "blur"
          },
          { validator: this.validateSameDictCode, trigger: "blur" },
          { validator: this.validateDictCode, trigger: "blur" }
        ]
      },
      isTreeCollapse: false,
      maxTreeHeight: 0,
      maxTableHeight: 0,
      maxRightHeight: 0,
      //数据字典树loading
      treeLoading: true,
      //搜索字段
      queryFields: [
        { name: 'itemText', label: '', labelKey: 'dict.dict_item_name', value: '', type: 'input', display: true, order: 1 },
      ],
      queryFields2: [
        { name: 'itemName', label: '', labelKey: 'dict.dict_item_name', value: '', type: 'input', display: true, order: 1 },
        { name: 'itemCode', label: '', labelKey: 'dict.dict_item_code', value: '', type: 'input', display: true, order: 2 },
      ],
    };
  },
  methods: {
    initMaxHeight() {
      calcHeight(this);
    },
    renderContent(h, { node, data, store }) {
      // // 如果节点有children且为空数组，不渲染箭头
      if (data.children && data.children.length === 0) {
        return (
          <span>{node.label}</span>
        );
      }
      // 否则渲染箭头
      return (
        <span>
          <span style="color:#e0e0e0 !important;position: relative;left: -5px;" class="el-tree-node__expand-icon el-icon-caret-right"></span>
          <span>{node.label}</span>
        </span>
      );
    },
    toggleTreeExpand() {
      this.isTreeCollapse = !this.isTreeCollapse;
    },
    handleClick(tab) {
      // this.resetActivePosition(this.$refs.tabs.$el);
      if (tab.name === "remote") {
        if (this.dictDataRemote.length > 0) return;
        this.dictQueryModelRemote.dictId = "";
        this.dictItemTableDataRemote = [];
        this.dictDataRemote = [];
        let param = {};
        param.supDictId = "0";
        dictAPI.DictTreeRemoteAPI(param).then(res => {
          if (res.code === "0") {
            this.dictDataRemote = res.data;
          }
        });
      }
      let timer = setTimeout(() => {
        clearTimeout(timer)
        this.initMaxHeight();
      }, 335);
    },
    resetActivePosition($el) {
      this.$nextTick(() => {
        const activeEl = $el.querySelector(".el-tabs__item.is-active");
        const lineEl = $el.querySelector(".el-tabs__active-bar");
        const style = getComputedStyle(activeEl);
        const pl = style.paddingLeft.match(/\d+/)[0] * 1;
        const pr = style.paddingRight.match(/\d+/)[0] * 1;
        const w = style.width.match(/\d+/)[0] * 1;
        lineEl.style.transform =
          "translateX(" + (activeEl.offsetLeft + pl - 6) + "px)";
        lineEl.style.width = w - pl - pr + "px";
      });
    },

    loadNode(node, resolve) {
      let param = {};
      param.supDictId = node.id;
      dictAPI.DictTreeRemoteAPI(param).then(res => {
        resolve(res.data);
      });
    },
    clearDictItemVO() {
      this.dictItemSaveAction = "";
      this.dictItemVO.id = "";
      this.dictItemVO.dictId = "";
      this.dictItemVO.itemCode = "";
      this.dictItemVO.itemText = "";
      this.dictItemVO.itemValue = "";
      this.dictItemVO.itemDesc = "";
      this.dictItemVO.itemSortOrder = 0;
      this.dictItemVO.itemStatus = "";
      this.$nextTick(() => {
        this.$refs.dictItemform.resetFields();
      });
    },
    // 校验dictCode的唯一性
    validateSameDictCode(rule, value, callback) {
      if (value === "") {
        callback(new Error(this.$t("dict.dict_dcode")));
      } else {
        // 判断是否存在重复的dictCode
        callback();
      }
    },
    validateDictCode(rule, value, callback) {
      const reg = /^[a-zA-Z0-9-\_]+$/g;
      if (reg.test(value)) {
        callback();
      } else {
        callback(new Error(this.$t("dict.dict_code_valid")));
      }
    },
    validateDictName(rule, value, callback) {
      const reg = /^[a-zA-Z0-9\u4e00-\u9fa5-\_]+$/g;
      if (reg.test(value)) {
        callback();
      } else {
        callback(new Error(this.$t("dict.dict_name_valid")));
      }
    },
    configDictDialogHandleClose() {
      this.$refs["dictForm"].resetFields();
      this.clearDictVO();
      this.configDictDialogVisible = false;
    },
    clearDictVO() {
      this.dictSaveAction = "";
      this.dictVO.id = "";
      this.dictVO.dictName = "";
      this.dictVO.dictCode = "";
      this.dictVO.supDictId = "";
      this.dictVO.supDictName = "";
      this.dictVO.dictDesc = "";
      this.$nextTick(() => {
        this.$refs.dictForm.resetFields();
      });
    },
    //添加同级节点
    insertDictAfter() {
      this.dictSaveAction = "add";
      this.dictVO = {
        id: "",
        dictName: "",
        dictCode: "",
        supDictId: "",
        supDictName: "",
        dictDesc: "",
        dictType: "0"
      };
      this.configDictDialogVisible = true;
      this.dictVO.supDictId = "****";
      this.dictVO.supDictName = "根节点";
    },
    //添加子节点
    appendDict() {
      this.dictVO = {
        id: "",
        dictName: "",
        dictCode: "",
        supDictId: "",
        supDictName: "",
        dictDesc: "",
        dictType: "0"
      };
      if (this.clearnode === true) {
        this.$message({
          message: this.$t("dict.dict_select"),
          type: "warning"
        });
      } else {
        let currentTreeNode = this.$refs.dictTree.getCurrentNode();
        if (currentTreeNode === null) {
          this.$message({
            message: this.$t("dict.dict_select"),
            type: "warning"
          });
        } else {
          this.configDictDialogVisible = true;
          this.dictVO.supDictId = currentTreeNode.id;
          this.dictVO.supDictName = currentTreeNode.dictName;
        }
      }
    },
    //删除节点
    removeDict() {
      let _this = this;
      if (_this.clearnode === true) {
        _this.$message({
          message: _this.$t("dict.dict_select"),
          type: "warning"
        });
      } else {
        let currentTreeNode = _this.$refs.dictTree.getCurrentNode();
        if (currentTreeNode.children && currentTreeNode.children.length > 0) {
          _this.$message({
            message: _this.$t("dict.dict_delnode_op"),
            type: "warning"
          });
          return false;
        }
        if (currentTreeNode === null) {
          _this.$message({
            message: _this.$t("dict.dict_select"),
            type: "warning"
          });
        } else {
          _this
            .$confirm(
              _this.$t("dict.dict_delete_continue"),
              _this.$t("cm.tips"),
              {
                type: "warning",
                confirmButtonText: _this.$t("cm.confirm"),
                cancelButtonText: _this.$t("cm.cancel"),
                cancelButtonClass: "btn-second",
                confirmButtonClass: "btn-default"
              }
            )
            .then(() => {
              let param = { id: currentTreeNode.id };
              dictAPI.deleteDictAPI(param).then(res => {
                if (res.code === "0") {
                  _this.$message({
                    type: "success",
                    message: _this.$t("dict.deletesuccess")
                  });
                  _this.initTree();
                  _this.search();
                } else {
                  _this.$message({
                    type: "warning",
                    message: res.msg
                  });
                  _this.initTree();
                  _this.search();
                }
              });
            })
            .catch(() => {
              _this.$message({
                type: "info",
                message: _this.$t("dict.deletecancel")
              });
            });
        }
      }
    },
    updateDict() {
      let _this = this;
      _this.dictSaveAction = "update";
      if (_this.clearnode === true) {
        _this.$message({
          message: _this.$t("dict.dict_select"),
          type: "warning"
        });
      } else {
        let currentTreeNode = _this.$refs.dictTree.getCurrentNode();
        if (currentTreeNode === null) {
          _this.$message({
            message: _this.$t("dict.dict_select"),
            type: "warning"
          });
        } else {
          _this.dictVO.id = currentTreeNode.id;
          _this.dictVO.dictName = currentTreeNode.dictName;
          _this.dictVO.dictCode = currentTreeNode.dictCode;
          _this.dictVO.dictDesc = currentTreeNode.dictDesc;
          _this.dictVO.supDictId = currentTreeNode.supDictId;

          if (currentTreeNode.supDictId === "****") {
            _this.configDictDialogVisible = true;
            _this.dictVO.supDictName = "根节点";
          } else {
            let parentTreeNode = _this.$refs.dictTree.getNode(
              currentTreeNode.supDictId
            );
            if (parentTreeNode === null) {
              _this.$message.error(_this.$t("dict.dict_unknown_error"));
            } else {
              _this.configDictDialogVisible = true;
              _this.dictVO.supDictName = parentTreeNode.data.dictName;
            }
          }
        }
      }
    },
    saveDictClick() {
      let _this = this;
      _this.$refs["dictForm"].validate(valid => {
        if (valid) {
          let confirm =
            _this.dictSaveAction === "update"
              ? _this.$t("dict.dict_update")
              : _this.$t("dict.dict_save");
          _this
            .$confirm(confirm, _this.$t("cm.tips"), {
              confirmButtonText: _this.$t("cm.confirm"),
              cancelButtonText: _this.$t("cm.cancel"),
              type: "warning",
              cancelButtonClass: "btn-second",
              confirmButtonClass: "btn-default"
            })
            .then(() => {
              //开启遮罩
              let loading = _this.$loading({
                target: "el-main",
                lock: true,
                text: "加载中",
                spinner: "el-icon-loading",
                background: "rgba(0, 0, 0, 0.7)"
              });
              let param = _this.dictVO;
              if (_this.dictSaveAction === "update") {
                dictAPI.updateDictAPI(param).then(res => {
                  if (res.code === "0") {
                    //关闭遮罩
                    loading.close();
                    _this.$message({
                      type: "success",
                      message: _this.$t("dict.dict_update_succ")
                    });
                    _this.configDictDialogHandleClose();
                    _this.initTree();
                  } else if (res.code === "1") {
                    //关闭遮罩
                    loading.close();
                    _this.$message({ type: "error", message: res.msg });
                  }
                });
              } else {
                dictAPI.saveDictAPI(param).then(res => {
                  if (res.code === "0") {
                    //关闭遮罩
                    loading.close();
                    _this.$message({
                      type: "success",
                      message: _this.$t("dict.savesuccess")
                    });
                    _this.configDictDialogHandleClose();
                    _this.initTree();
                  } else if (res.code === "1") {
                    //关闭遮罩
                    loading.close();
                    _this.$message({ type: "error", message: res.msg });
                  }
                });
              }
            })
            .catch(() => {
              let message =
                _this.dictSaveAction === "update"
                  ? _this.$t("dict.dict_update_cancel")
                  : _this.$t("dict.dict_save_cancel");
              _this.$message({
                type: "info",
                message: message
              });
            });
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    closeConfigDictItemShow() {
      this.configDictItemShow = false;
      this.clearDictItemVO();
    },
    configDictItemShowHandleClose() {
      this.configDictItemShow = false;
      this.clearDictItemVO();
    },
    dictTreeNodeClick(data) {
      this.clearnode = false;
      this.dictQueryModel.dictId = data.id;
      this.search();
    },
    dictTreeNodeRemoteClick(data) {
      this.dictQueryModelRemote.dictId = data.id;
      this.searchRemote();
    },
    filterDictTreeNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    filterDictTreeNodeRemote() {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    //获取列表
    queryDictItemList: function (params) {
      params.itemStatus = "0,1,2"
      params.itemCode = ""

      this.tableLoading = true
      this.treeLoading = true
      dictAPI.dictTreeItemAPI(params).then(res => {
        if (res.code === "0") {
          // this.dictItemTableData = res.data.row;
          this.dictItemTableData = res.data;
          // this.total = res.data.total;
          this.tableLoading = false
          this.treeLoading = false
        } else {
          this.$message({ type: "error", message: res.msg });
          this.tableLoading = false
          this.treeLoading = false
        }
      });
    },
    queryDictItemRemoteList(params) {
      this.tableLoading2 = true
      this.treeLoading = true
      dictAPI.dictTreeItemRemoteAPI(params).then(res => {
        if (res.code === "0") {
          this.dictItemTableDataRemote = res.data.data;
          this.totalRemote = res.data.total;
          this.tableLoading2 = false
          this.treeLoading = false
        } else {
          this.tableLoading2 = false
          this.treeLoading = false
        }
      });
    },
    //重置数据
    resetData: function () {
      this.dictQueryModel.itemText = "";
    },
    resetDataRemote: function () {
      this.dictQueryModelRemote.itemCode = "";
      this.dictQueryModelRemote.itemName = "";
      this.dictQueryModelRemote.itemStatus = "";
    },
    //高级搜索
    search: function () {
      let params = {
        pageIndex: 1,
        pageSize: 10
      };
      this.currentPage = 1;
      this.pageSize = 10;
      let queryForm = this.$refs.queryForm.getQueryForm();
      //除去搜索条件前后空格内容
      this.dictQueryModel.itemText = queryForm.itemText.trim();
      //合并
      params = Object.assign(params, this.dictQueryModel);
      this.queryDictItemList(params);
    },
    searchRemote: function () {
      let params = {
        pageIndex: 1,
        pageSize: 10
      };
      let queryForm = this.$refs.queryForm2.getQueryForm();
      //除去搜索条件前后空格内容
      this.dictQueryModelRemote.itemName = queryForm.itemName.trim();
      this.dictQueryModelRemote.itemCode = queryForm.itemCode.trim();
      //合并
      params = Object.assign(params, this.dictQueryModelRemote);
      this.queryDictItemRemoteList(params);
    },
    //改变每页显示数
    changeSize: function (pageSize) {
      let params = {
        pageIndex: 1,
        pageSize: pageSize
      };
      this.pageSize = pageSize;
      this.currentPage = 1;
      params = Object.assign(params, this.dictQueryModel);
      this.queryDictItemList(params);
    },
    changeSizeRemote: function (pageSize) {
      let params = {
        pageIndex: 1,
        pageSize: pageSize
      };
      this.pageSizeRemote = pageSize;
      this.currentPageRemote = 1;
      params = Object.assign(params, this.dictQueryModelRemote);
      this.queryDictItemRemoteList(params);
    },
    //翻页
    changeCurrentPage: function (current) {
      let params = {
        pageIndex: current,
        pageSize: this.pageSize
      };
      params = Object.assign(params, this.dictQueryModel);
      this.queryDictItemList(params);
    },
    changeCurrentPageRemote: function (current) {
      let params = {
        pageIndex: current,
        pageSize: this.pageSizeRemote
      };
      params = Object.assign(params, this.dictQueryModelRemote);
      this.queryDictItemRemoteList(params);
    },
    //每行的删除操作
    dictItemDelData: function (row) {
      let _this = this;
      _this
        .$confirm(_this.$t("dict.dict_del_one"), _this.$t("cm.tips"), {
          confirmButtonText: _this.$t("cm.confirm"),
          cancelButtonText: _this.$t("cm.cancel"),
          type: "warning",
          cancelButtonClass: "btn-second",
          confirmButtonClass: "btn-default"
        })
        .then(() => {
          let param = { id: row.id };
          dictAPI.deleteDictItemAPI(param).then(res => {
            if (res.code === "0") {
              _this.$message({
                type: "success",
                message: _this.$t("dict.deletesuccess")
              });
              _this.resetData();
              _this.search();
            } else {
              _this.$message({
                type: "error",
                message: res.msg
              });
              _this.resetData();
              _this.search();
            }
          });
        })
        .catch(() => {
          _this.$message({
            type: "info",
            message: _this.$t("dict.deletecancel")
          });
        });
    },
    addDictItem: function () {
      if (this.clearnode === true) {
        this.$message({
          message: this.$t("dict.dict_select_toitem"),
          type: "warning"
        });
      } else {
        let currentTreeNode = this.$refs.dictTree.getCurrentNode();
        if (!currentTreeNode === null) {
          this.$message({
            message: this.$t("dict.dict_select_toitem"),
            type: "warning"
          });
        } else {
          this.configDictItemShow = true;
          this.dictItemSaveAction = "add";
          (this.dictItemVO.id = ""),
            (this.dictItemVO.itemCode = ""),
            (this.dictItemVO.itemText = ""),
            (this.dictItemVO.itemValue = ""),
            (this.dictItemVO.itemDesc = ""),
            (this.dictItemVO.itemSortOrder = 0),
            (this.dictItemVO.itemStatus = "");
          this.dictItemVO.dictId = currentTreeNode.id;
          this.dictItemVO.supItemId = ""
        }
      }
    },
    // 新增子项
    addDictChildrenItem(row) {
      let currentTreeNode = this.$refs.dictTree.getCurrentNode();
      this.configDictItemShow = true;
      this.dictItemSaveAction = "addChild";
      (this.dictItemVO.id = ""),
        (this.dictItemVO.itemCode = ""),
        (this.dictItemVO.itemText = ""),
        (this.dictItemVO.itemValue = ""),
        (this.dictItemVO.itemDesc = ""),
        (this.dictItemVO.itemSortOrder = 0),
        (this.dictItemVO.itemStatus = "");
      this.dictItemVO.dictId = currentTreeNode.id;
      this.dictItemVO.supItemId = row.id;
    },
    saveDictItemClick() {
      var _this = this;
      _this.$refs["dictItemform"].validate(valid => {
        if (valid) {
          // let confirm =
          //   _this.dictItemSaveAction === "add"
          //     ? _this.$t("dict.dict_save")
          //     : _this.$t("dict.dict_edit");
          let confirm = ""
              if(_this.dictItemSaveAction === "add"){
                confirm = _this.$t("dict.dict_save")
              }else if(_this.dictItemSaveAction === "addChild"){
                confirm = '是否新增子项'
              }else {
                confirm =  _this.$t("dict.dict_edit");
              }

          _this
            .$confirm(confirm, _this.$t("cm.tips"), {
              confirmButtonText: _this.$t("cm.confirm"),
              cancelButtonText: _this.$t("cm.cancel"),
              type: "warning",
              cancelButtonClass: "btn-second",
              confirmButtonClass: "btn-default"
            })
            .then(() => {
              if (_this.dictItemVO.itemStatus === true) {
                _this.dictItemVO.itemStatus = "1";
              }
              if (_this.dictItemVO.itemStatus === false) {
                _this.dictItemVO.itemStatus = "0";
              }
              //开启遮罩
              let loading = _this.$loading({
                target: "el-main",
                lock: true,
                text: "加载中",
                spinner: "el-icon-loading",
                background: "rgba(0, 0, 0, 0.7)"
              });
              if (_this.dictItemSaveAction === "add") {
                dictAPI.saveDictItemAPI(_this.dictItemVO).then(res => {
                  if (res.code === "0") {
                    //关闭遮罩
                    loading.close();
                    _this.$message({
                      type: "success",
                      message: _this.$t("dict.savesuccess")
                    });
                    _this.closeConfigDictItemShow();
                    _this.resetData();
                    _this.search();
                  } else if (res.code === "1") {
                    //关闭遮罩
                    loading.close();
                    _this.$message({
                      type: "error",
                      message: _this.$t("dict.dict_duplicate")
                    });
                  }
                });
              } else if (_this.dictItemSaveAction === "addChild") {
                dictAPI.saveDictItemAPI(_this.dictItemVO).then(res => {
                  if (res.code === "0") {
                    //关闭遮罩
                    loading.close();
                    _this.$message({
                      type: "success",
                      message: _this.$t("dict.savesuccess")
                    });
                    _this.closeConfigDictItemShow();
                    _this.resetData();
                    _this.search();
                  } else if (res.code === "1") {

                    console.log('[ res ]', res)
                    //关闭遮罩
                    loading.close();
                    _this.$message({
                      type: "error",
                      message:res.msg
                    });
                  }
                });

              } else {
                dictAPI.updateDictItemAPI(_this.dictItemVO).then(res => {
                  if (res.code === "0") {
                    //关闭遮罩
                    loading.close();
                    _this.$message({
                      type: "success",
                      message: _this.$t("dict.dict_edit_succ")
                    });
                    _this.closeConfigDictItemShow();
                    _this.resetData();
                    _this.search();
                  } else if (res.code === "1") {
                    //关闭遮罩
                    loading.close();
                    _this.$message({
                      type: "error",
                      message: _this.$t("dict.dict_duplicate")
                    });
                  }
                });
              }
            })
            .catch(() => {
              let message =
                _this.dictItemSaveAction === "add"
                  ? _this.$t("dict.dict_save_cancel")
                  : _this.$t("dict.dict_edit_cancel");
              _this.$message({
                type: "info",
                message: message
              });
            });
        } else {
          return false;
        }
      });
    },
    checkduplicate() {
      let _this = this;
      let param = {};
      param.itemText = _this.dictItemVO.itemText;
      param.itemCode = _this.dictItemVO.itemCode;
      param.dictId = _this.dictItemVO.dictId;
      param.id = _this.dictItemVO.id;
      dictAPI.checkduplicate(param).then(res => {
        if (res.code === "0") {
          if (res.data) {
            _this.dictItemVO.itemText = "";
            _this.dictItemVO.itemCode = "";
            _this.$message({
              type: "error",
              message: "编码或名称重复"
            });
          }
        } else {
          _this.$message({
            type: "error",
            message: "编码或名称验证失败"
          });
        }
      });
    },
    dictItemBatchDel() {
      let _this = this;
      let objs = [];
      if (_this.mulSelect.length > 0) {
        for (let i = 0; i < _this.mulSelect.length; i++) {
          objs.push(_this.mulSelect[i].id);
        }
        _this
          .$confirm(_this.$t("dict.dict_delete_batch"), _this.$t("cm.tips"), {
            confirmButtonText: _this.$t("cm.confirm"),
            cancelButtonText: _this.$t("cm.cancel"),
            type: "warning",
            cancelButtonClass: "btn-second",
            confirmButtonClass: "btn-default"
          })
          .then(() => {
            dictAPI.batchDeleteDictItemAPI(objs).then(res => {
              if (res.code === "0") {
                _this.$message({
                  type: "success",
                  message: _this.$t("dict.deletesuccess")
                });
                _this.resetData();
                _this.search();
              } else {
                _this.$message({
                  type: "error",
                  message: res.msg
                });
                _this.resetData();
                _this.search();
              }
            });
          })
          .catch(() => {
            _this.$message({
              type: "info",
              message: _this.$t("dict.deletecancel")
            });
          });
      }
    },
    updateDictItemData: function (row) {
      this.configDictItemShow = true;
      this.dictItemSaveAction = "update";
      let currentTreeNode = this.$refs.dictTree.getCurrentNode();
      if (currentTreeNode === null) {
        this.$message({
          message: this.$t("dict.dict_select_toiteme"),
          type: "warning"
        });
      } else {
        this.dictItemVO.id = row.id;
        this.dictItemVO.dictId = currentTreeNode.id;
        this.dictItemVO.itemCode = row.itemCode;
        this.dictItemVO.itemText = row.itemText;
        this.dictItemVO.itemValue = row.itemValue;
        this.dictItemVO.itemDesc = row.itemDesc;
        this.dictItemVO.itemSortOrder = row.itemSortOrder;
        this.dictItemVO.supItemId = row.supItemId || ""
        if (row.itemStatus === "1") {
          this.dictItemVO.itemStatus = true;
        }
        if (row.itemStatus === "0") {
          this.dictItemVO.itemStatus = false;
        }
      }
    },
    //全选或者取消全选
    checkSelected: function (val) {
      //val 为更新后的值
      if (val == true) {
        let rows = this.tableData;
        rows.forEach(row => {
          this.$refs.dictItemTable.toggleRowSelection(row, true);
        });
      } else {
        this.$refs.dictItemTable.clearSelection();
      }
    },
    //点击修改按钮
    updDictItemData: function () {
      let _this = this;
      if (this.mulSelect.length == 1) {
        this.updateDictItemData(this.mulSelect[0]);
      } else {
        this.$message({
          message: this.$t("dict.dict_chooseone"),
          type: "warning"
        });
      }
    },
    //用于全选操作
    selectChange: function (val) {
      this.mulSelect = val;
      this.selectnum = val.length;
    },
    //显示按钮
    showBtn(btn) {
      return hasPermission(btn);
    },
    initTree() {
      let _this = this;
      _this.clearnode = true;
      _this.dictFilterText = "";
      let param = {};
      param.dictName = "";
      param.dictStatus = 1;
      _this.treeLoading = true;
      dictAPI.DictTreeAPI(param).then(res => {
        if (res.code === "0") {
          _this.treeLoading = false;
          _this.dictData = res.data;
          if (_this.flag) {
            _this.$nextTick(() => {
              _this.$refs.dictTree.setCurrentKey(_this.dictData[0].id);
              _this.dictQueryModel.dictId  = _this.dictData[0].id
              let params = {
                dictId: _this.dictData[0].id
              };
              _this.queryDictItemList(params);
              _this.flag = false
            });
          }

        } else {
          _this.treeLoading = false;
        }
      });
    },
    //高度设置
    setHeight: function () {
      this.height = window.innerHeight - 275;
    }
  },
  async mounted() {
    // this.resetActivePosition(this.$refs.tabs.$el);
    await this.initTree();
    let timer = setTimeout(() => {
      clearTimeout(timer)
      this.setHeight();
    }, 100);
    this.initMaxHeight();
    // throttleFunc记录当前的节流方法，用于在页面销毁时释放
    this.throttleFunc = throttle(this.initMaxHeight, 500);
    window.addEventListener("resize", this.throttleFunc);

  },
  beforeDestroy() {
    window.removeEventListener("resize", this.throttleFunc);
  },
  computed: {
    changeCollapse: function () {
      //用于对话框的对齐
      return this.$root.COLLAPSE;
    },
    computedTreeHeight() {
      return this.maxTreeHeight;
    },
    computedTableHeight() {
      return this.maxTableHeight;
    }
  },
  watch: {
    //监听 是否显示修改按钮
    mulSelect: function () {
      if (this.mulSelect.length != 1) {
        this.showDisabled = true;
      } else {
        this.showDisabled = false;
      }
    },
    dictFilterText(val) {
      //除去搜索条件前后空格内容
      val = val.trim();
      this.dictFilterText = this.dictFilterText.trim();
      this.$refs.dictTree.filter(val);
    },
    dictFilterTextRemote(val) {
      //除去搜索条件前后空格内容
      val = val.trim();
      this.dictFilterTextRemote = this.dictFilterTextRemote.trim();
      this.$refs.dictTreeRemote.filter(val);
    }
  }
};
