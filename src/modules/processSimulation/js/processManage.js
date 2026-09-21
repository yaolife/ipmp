/*
 * @Author: P623437
 * @Date: 2021-09-08 14:27:25
 * @LastEditors: P623437
 * @LastEditTime: 2022-05-19 11:00:19
 * @Description: 流程模板管理
 */
//引入组件
import breadcrumb from "@/components/common/breadcrumb";
import workflowManageAPI from "./api";
import cmsg from "@@/components/common/message";
import treeUtils from "@@/utils/treeUtils.js";
import { throttle } from "@@/utils/funcUtil";
import CodeDiff from "vue-code-diff";
import axios from "axios";
import { calcHeight } from "@/utils/funcUtil";

export default {
  components: {
    breadcrumb,
    workflowManageAPI,
    CodeDiff,
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
    // this.excelUpUrlSubComponent = this.$refs.templateImportSelect.excelUpUrl;
    // this.beforeUploadSubComponent = this.$refs.templateImportSelect.beforeUpload;
    // this.upfileBackSubComponent = this.$refs.templateImportSelect.upfileBack;
    // this.loadingFileSubComponent = this.$refs.templateImportSelect.loadingFile;
    // this.uplofileErrorSubComponent = this.$refs.templateImportSelect.uplofileError;
    let _this = this;
    axios.get("/static/fontfamilys/fontfamily.json", {}).then(response => {
      _this.family_name = response.data.family_name;
      let fontFilePath = response.data.font_file_path;
      axios.get(fontFilePath, {}).then(response => {
        _this.iconFontList = response.data.glyphs;
      });
    });
    this.initProcessTreeData();
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
    oldStrToCompare() {
      return JSON.stringify(this.dataCompare.oldStr, null, 2);
    },
    newStrToCompare() {
      return JSON.stringify(this.dataCompare.newStr, null, 2);
    }
  },

  beforeDestroy() {
    window.removeEventListener("resize", this.throttleFunc);
  },
  data() {
    //分类编码的唯一性检验
    let codeOnlyValidate = (rule, value, callback) => {
      let _this = this;
      let params = {
        procCategoryCode: value,
        procCategoryId: _this.flowCateVO.procCategoryId,
        procCategoryParentId: _this.flowCateVO.procCategoryParentId
      };
      workflowManageAPI
        .checkCodeOnlyAPI(params)
        .then(result => {
          if (result.code === "0" && result.data) {
            callback();
          }
          callback(new Error(_this.$t("cudLCCommon.code_only_message")));
        })
        .catch(error => {
          cmsg.httpCatchErrorMessage(this);
        });
    };
    //分类名称的唯一性检验
    let nameOnlyValidate = (rule, value, callback) => {
      let _this = this;
      let params = {
        procCategoryName: value,
        procCategoryId: _this.flowCateVO.procCategoryId,
        procCategoryParentId: _this.flowCateVO.procCategoryParentId
      };
      workflowManageAPI
        .checkNameOnlyAPI(params)
        .then(result => {
          if (result.code === "0" && result.data) {
            callback();
          }
          callback(new Error(_this.$t("cudLCCommon.name_only_message")));
        })
        .catch(error => {
          cmsg.httpCatchErrorMessage(this);
        });
    };
    return {
      // 导入zip包中子组件中的内容
      excelUpUrlSubComponent: "",
      beforeUploadSubComponent: "",
      upfileBackSubComponent: "",
      loadingFileSubComponent: "",
      uplofileErrorSubComponent: "",
      dataCompare: {
        oldStr: {},
        newStr: {},
        title: ""
      },
      importDialogCompareShow: false,
      //图标库数据
      iconFontList: [],
      family_name: "",
      hasIcon: false,
      brand: [
        { name: "wm.workflow_manage" },
        { name: "wm.workflow_temp_manage" }
      ],
      height: 0,
      loading: false,
      listLoading: true,
      treeLoading: true,
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
      //分类的弹框是否显示
      categoryDialogShow: false,
      //弹框的名字
      titleCategoryDialog: "",
      //添加或者编辑分类时输入内容的校验
      categoryFormRules: {
        //编码
        procCategoryCode: [
          {
            required: true,
            message: this.$t("cm.tiprequired"),
            trigger: "blur"
          },
          {
            min: 1,
            max: 32,
            message: this.$t("cudLCCommon.length_32"),
            trigger: "blur"
          },
          {
            pattern: /^[a-zA-Z][_a-zA-Z0-9]*$/,
            message: this.$t("cudLCCommon.code_valid_message"),
            trigger: "blur"
          },
          { validator: codeOnlyValidate, trigger: "blur" }
        ],
        //名称
        procCategoryName: [
          {
            required: true,
            message: this.$t("cm.tiprequired"),
            trigger: "blur"
          },
          {
            min: 1,
            max: 64,
            message: this.$t("cudLCCommon.length_64"),
            trigger: "blur"
          },
          {
            pattern: /^[a-zA-Z0-9\u4e00-\u9fa5-\_]+$/g,
            message: this.$t("cudLCCommon.name_valid"),
            trigger: "blur"
          },
          { validator: nameOnlyValidate, trigger: "blur" }
        ],
        //排序
        procCategoryIndex: [
          {
            pattern: /^[0-9]*$/,
            message: this.$t("cudLCCommon.flow_order_valid"),
            trigger: "blur"
          }
        ],
        //描述
        procCategoryDesc: [
          {
            required: true,
            message: this.$t("cm.tiprequired"),
            trigger: "blur"
          },
          {
            min: 1,
            max: 128,
            message: this.$t("cudLCCommon.length_128"),
            trigger: "blur"
          }
        ]
      },
      //流程分类的各个值
      flowCateVO: {
        procColour: "",
        procIcon: "",
        procCategoryName: "",
        procCategoryCode: "",
        procCategoryParentId: "",
        procCategoryParentName: "",
        procCategoryDesc: "",
        procCategoryIndex: "1"
      },
      //流程模板列表属性
      processTemplateVo: {
        procName: "",
        procStatus: "",
        procCategory: ""
      },
      //选择导入的流程模板信息
      importProcData: {
        procCategoryId: "",
        pscModelId: "",
        procId: "",
        procVersion: ""
      },
      processTableData: [],
      //分页
      tablePage: {
        pageIndex: 1,
        pageSize: 10,
        total: 0
      },
      //表格选中
      mulSelect: [],
      isTreeCollapse: false,
      maxTreeHeight: 0,
      maxTableHeight: 0,
      maxRightHeight: 0,
      //导入文件
      formDataFile: {},
      //导入数据信息
      importDialogShow: false,
      //导入内容
      importProc: {
        procName: "",
        procCategoryId: "", //流程分类ID
        procInfo: "", //流程配置
        addProcActList: [], //流程配置项新增
        updateProcActList: [], //流程配置项修改
        bpmn: 0, //PSC流程图
        addForms: [], //新增表单
        updateForms: [], //更新表单
        addDms: [], //新增数据模型
        updateDms: [], //更新数据模型
        addEntities: [], //新增子实体
        updateEntities: [], //更新子实体
        addRules: [], //新增规则
        updateRules: [], //更新规则
        addFuncs: [], // 新增函数
        updateFuncs: [] // 更新函数
      },
      //导出数据信息
      exportDialogShow: false,
      //导出内容
      exportProc: {
        procId: "",
        procVersion: "",
        exportChoice: {},
        exportSelect: "",
        procName: "",
        procInfo: 1,
        bpmn: 0, //是否导出流程图（PSC流程图） 0否 1是
        formIds: [],
        dmIds: [],
        entityIds: [],
        ruleIds: []
      },
      importChoiceDto: [
        {
          id: 0,
          label: "全部配置",
          children: [
            {
              id: 1,
              label: "流程(配置和流程图）",
              children: []
            },
            // {
            //   id: 2,
            //   label: 'PSC流程图',
            //   disabled: true,
            //   children: []
            // },
            {
              id: 3,
              label: "表单",
              children: []
            },
            {
              id: 4,
              label: "规则",
              children: []
            }
            // {
            //   id: 5,
            //   label: '自定义扩展',
            //   disabled: true,
            //   children: []
            // }
          ]
        }
      ],
      fileData: {},
      exportChoiceDto: [
        {
          id: 0,
          label: "全部配置",
          checked: true,
          children: [
            {
              id: 1,
              label: "流程(配置和流程图）",
              checked: true,
              children: []
            },
            // {
            //   id: 2,
            //   label: 'PSC流程图',
            //   disabled: true,
            //   children: []
            // },
            {
              id: 3,
              label: "表单",
              checked: true,
              children: []
            },
            {
              id: 4,
              label: "规则",
              checked: true,
              children: []
            }
            // {
            //   id: 5,
            //   label: '自定义扩展',
            //   disabled: true,
            //   children: []
            // }
          ]
        }
      ],

      defaultProps: {
        children: "children",
        label: "label"
      },
      headersOptions: {
        menuCode: sessionStorage.getItem("menuCode")
      },
      //
      findLevelTreeLevel:0,
    };
  },
  methods: {
    refresParentList() {
      this.queryProcessList(true);
    },
    // 动态计算目录树和表格高度
    initMaxHeight() {
      calcHeight(this);
    },
    toggleTreeExpand() {
      this.isTreeCollapse = !this.isTreeCollapse;
    },
    //分类树方法
    initProcessTreeData() {
      this.treeLoading = true;
      workflowManageAPI.flowTreeAPI({}).then(res => {
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
    processCategoryTreeNodeClick(data,node) {
      this.findLevelTreeLevel = node.level;
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
    //添加分类
    appendFlow() {
      this.flowCateVO = {
        procCategoryName: "",
        procCategoryCode: "",
        procCategoryParentId: "",
        procCategoryParentName: "",
        procCategoryDesc: "",
        procCategoryIndex: "1"
      };
      console.info(this.clearnode);
      if (this.clearnode === true) {
        this.titleCategoryDialog = "add";
        this.categoryDialogShow = true;
        this.flowCateVO.procCategoryParentId = "****";
        this.flowCateVO.procCategoryParentName = "根节点";
      } else {
        let currentTreeNode = this.$refs.processCategoryTree.getCurrentNode();


        if(this.findLevelTreeLevel > 2){
          // false
          this.$message({
            message:'创建层级限制3级！请重新选择层级！',
            type: "warning"
          });

          return;
        }


        if (currentTreeNode === null) {
          this.$message({
            message: this.$t("cudLCCommon.flow_select"),
            type: "warning"
          });
        } else {
          this.categoryDialogShow = true;
          this.titleCategoryDialog = "add";
          this.flowCateVO.procCategoryParentId = currentTreeNode.id;
          this.flowCateVO.procCategoryParentName = currentTreeNode.label;
        }
      }
    },

    //设置颜色选择框中颜色
    setSelectColor(value) {
      // let item = this.colorList.find(item=>{
      //   return item[this.value]===value
      // })
      //通过操作dom节点改变样式
      this.$nextTick(() => {
        let dom = this.$refs.colorSelect;
        if (dom) {
          dom = dom.$el.children[0];
          let inputDom = dom.querySelectorAll(".el-input__inner");
          let icon = dom.querySelectorAll(".el-input__icon");
          inputDom[0].style["background-color"] = "#" + value;
          icon[0].style["color"] = "black";
        }
      });
    },
    handleChange(val) {
      this.setSelectColor(val);
    },
    //编辑分类
    updateFlow() {
      let _this = this;
      _this.titleCategoryDialog = "update";
      if (_this.clearnode === true) {
        _this.$message({
          message: _this.$t("cudLCCommon.flow_select"),
          type: "warning"
        });
      } else {
        let currentTreeNode = _this.$refs.processCategoryTree.getCurrentNode();
        if (currentTreeNode === null) {
          _this.$message({
            message: _this.$t("cudLCCommon.flow_select"),
            type: "warning"
          });
        } else {
          _this.flowCateVO.procCategoryId = currentTreeNode.id;
          _this.flowCateVO.procCategoryName = currentTreeNode.label;
          _this.flowCateVO.procCategoryCode = currentTreeNode.procCategoryCode;
          _this.flowCateVO.procCategoryDesc = currentTreeNode.procCategoryDesc;
          _this.flowCateVO.procCategoryParentId =
            currentTreeNode.procCategoryParentId;
          _this.flowCateVO.procCategoryIndex = currentTreeNode.sort;
          _this.flowCateVO.procColour = currentTreeNode.procColour;
          _this.flowCateVO.procIcon = currentTreeNode.procIcon;
          _this.setSelectColor(currentTreeNode.procColour);

          if (currentTreeNode.procCategoryParentId === "****") {
            _this.categoryDialogShow = true;
            _this.flowCateVO.procCategoryParentName = "根节点";
          } else {
            let parentTreeNode = _this.$refs.processCategoryTree.getNode(
              currentTreeNode.id
            );
            if (parentTreeNode === null) {
              _this.$message.error(_this.$t("flow.flow_unknown_error"));
            } else {
              _this.categoryDialogShow = true;
              _this.flowCateVO.procCategoryParentName =
                parentTreeNode.data.procCategoryParentName;
            }
          }
        }
      }
    },
    //点击提交按钮
    saveFlowCateClick() {
      let _this = this;
      _this.$refs["flowCateAdd"].validate(valid => {
        if (valid) {
          let confirm =
            _this.titleCategoryDialog === "update"
              ? _this.$t("cm.is_update")
              : _this.$t("cm.is_save");
          _this
            .$confirm(confirm, _this.$t("cm.tips"), {
              confirmButtonText: _this.$t("cm.confirm"),
              cancelButtonText: _this.$t("cm.cancel"),
              type: "warning",
              cancelButtonClass: "btn-second",
              confirmButtonClass: "btn-default"
            })
            .then(() => {
              let param = _this.flowCateVO;
              //开启遮罩
              let loading = this.$loading({
                target: "el-main",
                lock: true,
                text: "加载中",
                spinner: "el-icon-loading",
                background: "rgba(0, 0, 0, 0.7)"
              });
              if (_this.titleCategoryDialog === "update") {
                workflowManageAPI.updateFlowAPI(param).then(res => {
                  if (res.code === "0") {
                    _this.$message({
                      type: "success",
                      message: _this.$t("cm.update_succ")
                    });
                    _this.closeCategoryDialog();
                    _this.initProcessTreeData();
                    //关闭遮罩
                    loading.close();
                  } else {
                    //关闭遮罩
                    loading.close();
                    _this.$message({ type: "error", message: res.msg });
                  }
                });
              } else {
                workflowManageAPI.saveFlowAPI(param).then(res => {
                  if (res.code === "0") {
                    _this.$message({
                      type: "success",
                      message: _this.$t("cm.savesuccess")
                    });
                    _this.closeCategoryDialog();
                    _this.initProcessTreeData();
                    //关闭遮罩
                    loading.close();
                  } else {
                    //关闭遮罩
                    loading.close();
                    _this.$message({ type: "error", message: res.msg });
                  }
                });
              }
            })
            .catch(() => {
              let message =
                _this.titleCategoryDialog === "update"
                  ? _this.$t("cm.update_cancel")
                  : _this.$t("cm.save_cancel");
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
    //删除分类
    removeFlow() {
      let _this = this;
      if (_this.clearnode === true) {
        _this.$message({
          message: _this.$t("cm.choose_select"),
          type: "warning"
        });
      } else {
        let currentTreeNode = _this.$refs.processCategoryTree.getCurrentNode();
        if (currentTreeNode.children && currentTreeNode.children.length > 0) {
          _this.$message({
            message: _this.$t("cm.del_node_op"),
            type: "warning"
          });
          return false;
        }
        if (currentTreeNode === null) {
          _this.$message({
            message: _this.$t("cm.choose_select"),
            type: "warning"
          });
        } else {
          _this
            .$confirm(
              _this.$t("cm.category_delete_continue"),
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
              let param = { procCategoryId: currentTreeNode.id };
              workflowManageAPI.deleteFlowAPI(param).then(res => {
                if (res.code === "0") {
                  _this.$message({
                    type: "success",
                    message: _this.$t("cm.deletesuccess")
                  });
                  _this.initProcessTreeData();
                  _this.searchProcessTemplates();
                  _this.clearnode = true;
                } else {
                  _this.$message({
                    type: "warning",
                    message: res.msg
                  });
                  _this.initProcessTreeData();
                  _this.searchProcessTemplates();
                  _this.clearnode = true;
                }
              });
            })
            .catch(() => {
              _this.$message({
                type: "info",
                message: _this.$t("cm.deletecancel")
              });
            });
        }
      }
    },
    //关闭弹出框
    closeCategoryDialog() {
      this.$refs["flowCateAdd"].resetFields();
      this.cleanFlowCateVO();
      this.categoryDialogShow = false;
    },
    //清空弹出框
    cleanFlowCateVO() {
      (this.titleCategoryDialog = ""),
        (this.flowCateVO.procCategoryName = ""),
        (this.flowCateVO.procCategoryCode = ""),
        (this.flowCateVO.procCategoryParentId = ""),
        (this.flowCateVO.procCategoryParentName = ""),
        (this.flowCateVO.procCategoryDesc = ""),
        (this.flowCateVO.procCategoryIndex = "1"),
        this.$nextTick(() => {
          this.$refs.flowCateAdd.resetFields();
        });
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
      //除去搜索条件前后空格内容
      this.processTemplateVo.procName = this.processTemplateVo.procName.trim();
      params = Object.assign(params, this.processTemplateVo);
      workflowManageAPI.getlistAPI(params).then(result => {
          this.listLoading = false;
          //填充数据
          this.processTableData = result.records;
          this.tablePage.pageIndex = result.current;
          this.tablePage.pageSize = result.size;
          this.tablePage.total = result.total;
        })
        .catch(error => {
          cmsg.httpCatchErrorMessage(this);
        });
    },
    //点击查询按钮
    searchProcessTemplates() {
      this.queryProcessList(true);
    },
    //点击重置按钮
    resetProcessTemplate() {
      this.processTemplateVo.procName = "";
      this.processTemplateVo.procStatus = "";
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
    // 更多菜单事件
    moreCommandHandler(command) {
      let param = command.param;
      switch (command.optFlag) {
        case "flowHistory":
          this.flowHistory(param);
          break;
        case "flowConfig":
          this.configlWfTemplateDesignFun(param);
          break;
        case "flowCopy":
          this.copyWfTemplateDesignFun(param);
          break;
        case "flowMaster":
          this.flowSetMaster(param);
          break;
        case "flowExport":
          this.flowExportSubComponent(param);
          break;
        case "flowImport":
          this.flowImportSubComponent(param);
          break;
        case "testCaseManage":
          this.testCaseManage(param);
          break;
        // case 'delData':  this.delWfTemplateDesignFun(param); break;
        default:
          break;
      }
    },
    flowExportSubComponent(rowData) {
      this.$refs.templateExportSelect.flowExport(rowData);
    },
    flowImportSubComponent(rowData) {
      this.$refs.templateImportSelect.flowImport(rowData);
    },
    beforeMoreCommandHandler(optFlag, param) {
      return {
        optFlag: optFlag,
        param: param
      };
    },
    //添加流程图
    addWfTemplateDesignFun() {
      let currentNode = this.$refs.processCategoryTree.getCurrentNode();
      if (currentNode && currentNode.procCategoryParentId) {
        let treePathLable = this.getCategoryPathById(currentNode.id);
        this.$router.push({
          // path: "workflow_temp_design",
          path: "/wf_template_design",
          query: {
            opAct: "add",
            categoryId: currentNode.id,
            categoryPath: treePathLable
          }
        });
      } else if (currentNode && !currentNode.procCategoryParentId) {
        this.$message({
          showClose: true,
          message: this.$t("wm.not_selected_topCategory"),
          type: "warning"
        });
      } else {
        this.$message({
          showClose: true,
          message: this.$t("wm.select_proc_category"),
          type: "warning"
        });
      }
    },
    //修改流程图
    editWfTemplateDesignFun(rowData) {
      let processData = {};
      if (rowData.pscModelId && rowData.procId && rowData.procVersion) {
        let treePathLable = this.getCategoryPathById(rowData.categoryId);
        processData.pscModelId = rowData.pscModelId;
        processData.procId = rowData.procId;
        processData.procVersion = rowData.procVersion;
        processData.procStatus = rowData.procStatus;
        processData.pscModelOldId = rowData.pscModelOldId;
        this.$router.push({
          path: "/wf_template_design",
          query: {
            opAct: "upd",
            categoryId: rowData.categoryId,
            processData: JSON.stringify(processData),
            categoryPath: treePathLable
          }
        });
      } else {
        this.$message({
          showClose: true,
          message: this.$t("wm.notEdit_loseData_contactAdmin"),
          type: "warning"
        });
      }
    },
    // 配置流程模板
    configlWfTemplateDesignFun(rowData) {
      let processData = {};
      if (rowData.pscModelId && rowData.procId && rowData.procVersion) {
        let treePathLable = this.getCategoryPathById(rowData.categoryId);
        processData.pscModelId = rowData.pscModelId;
        processData.procId = rowData.procId;
        processData.procVersion = rowData.procVersion;
        processData.procStatus = rowData.procStatus;
        this.$router.push({
          path: "/wf_template_design",
          query: {
            opAct: "config",
            categoryId: rowData.categoryId,
            processData: JSON.stringify(processData),
            categoryPath: treePathLable
          }
        });
      } else {
        this.$message({
          showClose: true,
          message: this.$t("wm.notEdit_loseData_contactAdmin"),
          type: "warning"
        });
      }
    },
    copyWfTemplateDesignFun(rowData) {
      let processData = {};
      if (rowData.pscModelId && rowData.procId && rowData.procVersion) {
        let treePathLable = this.getCategoryPathById(rowData.categoryId);
        processData.pscModelId = rowData.pscModelId;
        processData.procId = rowData.procId;
        processData.procVersion = rowData.procVersion;
        processData.pscModelOldId = rowData.pscModelId;
        processData.procUseStatus = rowData.procUseStatus;
        this.$router.push({
          path: "/wf_template_design",
          query: {
            opAct: "copy",
            categoryId: rowData.categoryId,
            processData: JSON.stringify(processData),
            categoryPath: treePathLable
          }
        });
      } else {
        this.$message({
          showClose: true,
          message: this.$t("wm.notCopy_loseData_contactAdmin"),
          type: "warning"
        });
      }
    },
    //设置当前流程模板版本号为主版本
    flowSetMaster(rowData) {
      let _this = this;
      let param = {
        procId: rowData.procId,
        procVersion: rowData.procVersion
      };
      workflowManageAPI
        .makeMainVerAPI(param)
        .then(res => {
          // console.info(res);
          if (res.code === "0") {
            this.$message({
              showClose: true,
              message: res.msg,
              type: "success"
            });
            //升级主版本后刷新列表数据
            _this.queryProcessList(false);
          } else {
            this.$message({
              showClose: true,
              message: res.msg,
              type: "warning"
            });
          }
        })
        .catch(e => {
          cmsg.httpCatchErrorMessage(this);
        });
    },
    // 删除流程模板，包括流程图和流程图配置
    delWfTemplateDesignFun(rowData) {
      this.$confirm(this.$t("wm.del_proc_template"), this.$t("cm.tips"), {
        type: "warning",
        confirmButtonText: this.$t("cm.confirm"),
        cancelButtonText: this.$t("cm.cancel"),
        cancelButtonClass: "btn-second",
        confirmButtonClass: "btn-default"
      })
        .then(() => {
          let delProcessVO = {};
          delProcessVO.procId = rowData.procId;
          delProcessVO.procVersion = rowData.procVersion;
          workflowManageAPI
            .deleteTempAPI(delProcessVO)
            .then(res => {
              let data = res;
              if (data.code === "0") {
                this.$message({
                  showClose: true,
                  message: data.msg,
                  type: "success"
                });
                // let object = {}
                // object = Object.assign({}, this.processQueryVO, this.processTablePage)
                // this.queryProcessList(object)
                this.queryProcessList();
              } else {
                this.$message({
                  showClose: true,
                  message: data.msg,
                  type: "warning"
                });
              }
            })
            .catch(e => {
              cmsg.httpCatchErrorMessage(this);
            });
        })
        .catch(() => {
          cmsg.cancelMessage(this);
        });
    },
    flowExport(data) {
      let _this = this;
      let _paramList = {
        procId: data.procId,
        procVersion: data.procVersion
      };
      _this.resetExportDialog();
      _this.exportProc.procId = data.procId;
      _this.exportProc.procVersion = data.procVersion;
      _this.exportProc.procName = data.procName;

      // let pscInfo = this.exportChoiceDto[0].children.find(item => item.label === "PSC流程图")
      // let customData = this.exportChoiceDto[0].children.find(item => item.label === "自定义扩展")
      let formInfo = _this.exportChoiceDto[0].children.find(
        item => item.label === "表单"
      );
      let ruleInfo = _this.exportChoiceDto[0].children.find(
        item => item.label === "规则"
      );
      _this.loading = true;
      workflowManageAPI.getProcessManageExportInfo(_paramList).then(res => {
        if (res.code === "0") {
          // 表单
          res.data.formInfo.forEach(item => {
            let entityChildren = [];
            let dmChildren = [];
            if (item.entityInfo) {
              item.entityInfo.forEach(ent => {
                entityChildren.push({
                  id: ent.entityId,
                  label: ent.entityName,
                  checked: true,
                  pid: "entityInfo"
                });
                _this.exportProc.entityIds.push(ent.entityId);
              });
            }
            if (item.dmId && item.dmName) {
              dmChildren = [
                {
                  id: item.dmId,
                  label: item.dmName,
                  checked: true,
                  pid: "dmInfo",
                  children: entityChildren
                }
              ];
            }
            formInfo.children.push({
              id: item.formId,
              label: item.formName,
              checked: true,
              pid: "formInfo",
              // children: dmChildren
              children: []
            });
            _this.exportProc.dmIds.push(item.dmId);
            _this.exportProc.formIds.push(item.formId);
          });
          // 规则
          res.data.ruleInfo.forEach(item => {
            ruleInfo.children.push({
              id: item.wfRuleMasterId,
              label: item.ruleName,
              checked: true,
              pid: "ruleInfo"
            });
            _this.exportProc.ruleIds.push(item.wfRuleMasterId);
          });
          // 自定义扩展
          // res.data.customData.forEach((item) => {
          //   customData.children.push({
          //     id: item.wfRuleMasterId,
          //     label: item.ruleName,
          //     pid: 'customData',
          //   })
          // })
          _this.exportDialogShow = true;
          _this.loading = false;
        } else {
          _this.$message({
            message: res.msg,
            type: "warning"
          });
          // _this.closeExportDialog();
          _this.loading = false;
        }
      });
    },

    flowImport(data) {
      let _this = this;
      _this.importProcData.procCategoryId = data.categoryId;
      _this.importProcData.pscModelId = data.pscModelId;
      _this.importProcData.procId = data.procId;
      _this.importProcData.procVersion = data.procVersion;
    },

    handleCheckChange(data) {
      let _this = this;
      // 表单checked为true，children表单要全部checked为true
      // if (data.label === '表单' && data.checked) {
      //   let info = _this.exportChoiceDto[0].children.find(item => item.label === '表单')
      //   info.children.forEach(child => {
      //     child.checked = true
      //     child.children.forEach(children => {
      //       children.checked = true
      //     })
      //   })
      // }
      if (data.id === 1 && data.label === "流程(配置和流程图）") {
        _this.exportProc.procInfo = data.checked ? 1 : 0;
      }
      if (data.pid === "formInfo") {
        let formIdsIndex = _this.exportProc.formIds.findIndex(
          item => item === data.id
        );
        if (formIdsIndex === -1) {
          if (data.checked) {
            _this.exportProc.formIds.push(data.id); //导出表单ID的集合
          }
        } else {
          if (!data.checked) {
            _this.exportProc.formIds.splice(formIdsIndex, 1);
          }
        }
      }
      if (data.pid === "dmInfo") {
        let dmIdsIndex = _this.exportProc.dmIds.findIndex(
          item => item === data.id
        );
        if (dmIdsIndex === -1) {
          if (data.checked) {
            _this.exportProc.dmIds.push(data.id); //导出数据模型ID的集合
          }
        } else {
          if (!data.checked) {
            _this.exportProc.dmIds.splice(dmIdsIndex, 1);
          }
        }
      }
      if (data.pid === "entityInfo") {
        let entityIdsIndex = _this.exportProc.entityIds.findIndex(
          item => item === data.id
        );
        if (entityIdsIndex === -1) {
          if (data.checked) {
            _this.exportProc.entityIds.push(data.id); //导出实体ID的集合
          }
        } else {
          if (!data.checked) {
            _this.exportProc.entityIds.splice(entityIdsIndex, 1);
          }
        }
      }
      if (data.pid === "ruleInfo") {
        let ruleIdsIndex = _this.exportProc.ruleIds.findIndex(
          item => item === data.id
        );
        if (ruleIdsIndex === -1) {
          if (data.checked) {
            _this.exportProc.ruleIds.push(data.id); //导出规则ID的集合
          }
        } else {
          if (!data.checked) {
            _this.exportProc.ruleIds.splice(ruleIdsIndex, 1);
          }
        }
      }
    },
    //关闭导入弹出框
    closeImportDialog() {
      let _this = this;
      //导入数据信息
      _this.importDialogShow = false;
      _this.resetImportDialog();
    },
    //打开差异化比较
    openDialogCompare(oldStr, newStr, title) {
      this.dataCompare.oldStr = oldStr;
      this.dataCompare.newStr = newStr;
      this.dataCompare.title = title;
      this.importDialogCompareShow = true;
    },
    //关闭导入差异比较弹出框
    closeImportDialogCompare() {
      let _this = this;
      //差异比较
      _this.importDialogCompareShow = false;
    },
    //重置导入弹出框数据
    resetImportDialog() {
      let _this = this;
      //导入内容
      _this.importProc = {
        procName: "",
        procCategoryId: "", //流程分类ID
        procInfo: "", //流程配置
        addProcActList: [], //流程配置项新增
        updateProcActList: [], //流程配置项修改
        bpmn: 0, //PSC流程图
        addForms: [], //新增表单
        updateForms: [], //更新表单
        addDms: [], //新增数据模型
        updateDms: [], //更新数据模型
        addEntities: [], //新增子实体
        updateEntities: [], //更新子实体
        addRules: [], //新增规则
        updateRules: [], //更新规则
        addFuncs: [], // 新增函数
        updateFuncs: [] // 更新函数
      };
      //导入tree结构
      _this.importChoiceDto = [
        {
          id: 0,
          label: "全部配置",
          children: [
            {
              id: 1,
              label: "流程(配置和流程图）",
              children: []
            },
            // {
            //   id: 2,
            //   label: 'PSC流程图',
            //   disabled: true,
            //   children: []
            // },
            {
              id: 3,
              label: "表单",
              children: []
            },
            {
              id: 4,
              label: "规则",
              children: []
            }
            // {
            //   id: 5,
            //   label: '自定义扩展',
            //   disabled: true,
            //   children: []
            // }
          ]
        }
      ];
    },
    //关闭导出弹出框
    closeExportDialog() {
      let _this = this;
      _this.exportDialogShow = false;
      _this.resetExportDialog();
    },
    //重置导出弹出框数据
    resetExportDialog() {
      let _this = this;
      //导出内容
      _this.exportProc = {
        procId: "",
        procVersion: "",
        exportChoice: {},
        exportSelect: "",
        procName: "",
        procInfo: 1,
        bpmn: 0, //是否导出流程图（PSC流程图） 0否 1是
        formIds: [],
        dmIds: [],
        entityIds: [],
        ruleIds: []
      };
      //导出tree结构
      _this.exportChoiceDto = [
        {
          id: 0,
          label: "全部配置",
          checked: true,
          children: [
            {
              id: 1,
              label: "流程(配置和流程图）",
              checked: true,
              children: []
            },
            // {
            //   id: 2,
            //   label: 'PSC流程图',
            //   disabled: true,
            //   children: []
            // },
            {
              id: 3,
              label: "表单",
              checked: true,
              children: []
            },
            {
              id: 4,
              label: "规则",
              checked: true,
              children: []
            }
            // {
            //   id: 5,
            //   label: '自定义扩展',
            //   disabled: true,
            //   children: []
            // }
          ]
        }
      ];
    },
    //导出流程信息
    exportFlowClick() {
      let _this = this;
      const loading = this.$loading({
        target: "el-main",
        lock: true,
        text: "加载中",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)"
      });
      let _paramList = {
        procId: _this.exportProc.procId, //流程ID
        procVersion: _this.exportProc.procVersion, //流程版本
        procInfo: _this.exportProc.procInfo, //是否导出流程模板（流程配置） 0否 1是
        bpmn: _this.exportProc.bpmn, //是否导出流程图（PSC流程图） 0否 1是
        formIds: _this.exportProc.formIds, //导出表单ID的集合
        dmIds: _this.exportProc.dmIds, //导出数据模型ID的集合
        entityIds: _this.exportProc.entityIds, //导出实体ID的集合
        ruleIds: _this.exportProc.ruleIds //导出规则ID的集合
      };
      if (
        _paramList.procInfo === 0 &&
        _paramList.bpmn === 0 &&
        _paramList.formIds.length === 0 &&
        _paramList.dmIds.length === 0 &&
        _paramList.entityIds.length === 0 &&
        _paramList.ruleIds.length === 0
      ) {
        _this.$message({ message: "请选择导出项", type: "warning" });
        loading.close();
        return;
      }
      workflowManageAPI.generateCodeAPI(_paramList).then(res => {
        let blob = new Blob([res], { type: "application/zip" });
        if ("msSaveOrOpenBlob" in navigator) {
          window.navigator.msSaveOrOpenBlob(
            blob,
            `${_this.exportProc.procName}_${_this.exportProc.procVersion}.zip`
          );
        }
        let downloadElement = document.createElement("a");
        let href = window.URL.createObjectURL(blob); // 创建下载的链接
        downloadElement.href = href;
        downloadElement.download = `${_this.exportProc.procName}_${_this.exportProc.procVersion}.zip`; // 下载后文件名
        document.body.appendChild(downloadElement);
        downloadElement.click(); // 点击下载
        document.body.removeChild(downloadElement); // 下载完成移除元素
        window.URL.revokeObjectURL(href); // 释放掉blob对象
        _this.closeExportDialog();
        loading.close();
      });
      // _this.exportProc.exportChoice[_this.exportProc.exportSelect] = 1
      // workflowManageAPI.exportProcessTemplate(_this.exportProc).then(res => {
      //   if (res.code === '0') {
      //     _this.$message({
      //       message: res.msg,
      //       type: 'success'
      //     });
      //     // _this.closeExportDialog();
      //   } else {
      //     _this.$message({
      //       message: res.msg,
      //       type: 'warning'
      //     });
      //     // _this.closeExportDialog();
      //   }
      // });
    },
    //获取流程分类路径，用于流程设计器获取传递给PSC
    getCategoryPathById(categoryId) {
      let treePathArray = treeUtils.getPathByKey(
        categoryId,
        "id",
        this.processCategoryTreeData
      );
      let treePathLabel = "/";
      treePathArray.forEach((treeNode, ind) => {
        if (treeNode.id != "1") {
          treePathLabel = treePathLabel + treeNode.label + "/";
        }
      });
      return treePathLabel.substr(0, treePathLabel.length - 1);
    },

    // 流程模板历史点击
    flowHistory(row) {
      this.$router.push({
        path: "/workflow_temp_history",
        query: { obj: row, procIdTemporary: row.procId }
      });
    },
    // 流程模板测试用例
    testCaseManage(row) {
      this.$router.push({ path: "/wf_test_case_manage", query: { obj: row } });
    },
    //上传之前判断是否为excel文件
    beforeUpload: function(file) {
      const formData = new FormData();
      formData.append("name", file.name);
      formData.append("file", file);
      this.formDataFile = formData;

      // if (this.processTemplateVo.procCategory === '') {
      //   this.$message({
      //     message: this.$t('wm.select_proc_category'),
      //     type: 'warning'
      //   })
      //   return false;
      // }
      let type = file.name.substring(file.name.lastIndexOf(".") + 1);
      if (type != "zip") {
        this.$message({
          message: "请正确导入zip文件",
          type: "warning"
        });
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
    upfileBack: function(response, file, fileList) {
      this.loading = false;
      if (response.code == "0") {
        if (response.data.verResult === 0) {
          this.$message({
            message: "文件完整性校验未通过",
            type: "warning"
          });
        } else if (response.data.verResult === 1) {
          let procInfo = this.importChoiceDto[0].children.find(
            item => item.label === "流程(配置和流程图）"
          );
          // let pscInfo = this.importChoiceDto[0].children.find(item => item.label === "PSC流程图")
          // let customData = this.importChoiceDto[0].children.find(item => item.label === "自定义扩展")
          let formInfo = this.importChoiceDto[0].children.find(
            item => item.label === "表单"
          );
          let ruleInfo = this.importChoiceDto[0].children.find(
            item => item.label === "规则"
          );
          this.importProc.procName = response.data.procName;
          // 文件数据
          this.fileData = response.data.importReadDataRedisKey;
          // let bpmn = response.data.bpmn;
          // if(bpmn && bpmn!=0) {
          //   let bpmnHasFlag =  bpmn && bpmn == 1 ? false : true //流程图存在true,不存在false
          //   let fileBpmnBean = response.data.fileBpmnBean;
          //   let currentBpmnBean = response.data.currentBpmnBean;
          //
          //   let pscModelId ="psc_bpmn_"+ fileBpmnBean.procModelResponse.id;
          //   let procBpmnNode = treeProcNode(pscModelId,"PSC流程图",bpmnHasFlag,
          //     'procBaseInfo',!bpmnHasFlag,bpmnHasFlag,fileBpmnBean,currentBpmnBean,
          //     [])
          //   procInfo.children.push(procBpmnNode)
          // }
          // 流程配置详细项
          if (response.data.wfConfig) {
            // 流程信息
            let procDefData = response.data.wfConfig.procDef;

            let importDefData = response.data.fileProDef.procDef;
            // 发起规则
            let importStartRule = importDefData.procStartRule;
            importDefData.procStartRule = [];

            let currentDefData = response.data.currentProDef.procDef;
            // 发起规则
            let currentStartRule = currentDefData.procStartRule;
            currentDefData.procStartRule = [];

            if (procDefData) {
              // 流程配置信息存在，说明该流程的流程图已经存在，不可选择流程图进行导入，如果流程配置数据不存在，必须导入流程图及各节点数据
              let pscModelId = "psc_bpmn_";
              let procBpmnNode = treeProcNode(
                pscModelId,
                "PSC流程图",
                procDefData.hasProc,
                "pscBpmn",
                !procDefData.hasProc,
                procDefData.hasProc,
                "",
                "",
                []
              );
              procInfo.children.push(procBpmnNode);

              let procActNodeId =
                "procInfo_" +
                procDefData.procId +
                "_" +
                procDefData.procVersion;
              let procActNode = treeProcNode(
                procActNodeId,
                "流程信息",
                procDefData.hasProc,
                "procBaseInfo",
                !procDefData.hasProc,
                procDefData.hasProc,
                importDefData,
                currentDefData,
                []
              );
              procInfo.children.push(procActNode);
            }
            // 流程环节信息
            let procActDefData = response.data.wfConfig.actDef;
            let importActDefData = response.data.fileProDef.actDef;
            let currentActDefData = response.data.currentProDef.actDef;
            if (procActDefData) {
              // 活动列表数据
              let actSortData = procActDefData.sort(function(a, b) {
                return a[0].actDefData.actName.localeCompare(
                  b[0].actDefData.actName,
                  "zh-Hans-CN"
                );
              });
              actSortData.forEach(item => {
                // 活动信息，前置条件不同
                let actInfo = item[0].actDefData;
                let actId = actInfo.actId; //活动id
                let actName = actInfo.actName; //活动名称
                let hasAct = actInfo.hasAct; // 是否有活动节点
                let actNode = {};
                let importAct = importActDefData.find(info => {
                  return info[0].actId == actId;
                });
                let currentAct = currentActDefData.find(info => {
                  return info[0].actId == actId;
                });
                if (actInfo.actType === 5) {
                  //结束环节
                  actNode = treeProcNode(
                    "act_end_" + actId,
                    actName,
                    hasAct,
                    "procChildren",
                    !hasAct,
                    hasAct,
                    importAct,
                    currentAct,
                    []
                  );
                } else if (actInfo.actType === 1) {
                  // 发起环节的发起规则处理
                  if (importAct && importAct.length > 0) {
                    importAct[0].actDefData["startRule"] = importStartRule;
                  }
                  if (currentAct && currentAct.length > 0) {
                    currentAct[0].actDefData["startRule"] = currentStartRule;
                  }
                  // 发起环节
                  actNode = treeProcNode(
                    "act_start_" + actId,
                    actName,
                    hasAct,
                    "procChildren",
                    !hasAct,
                    hasAct,
                    importAct,
                    currentAct,
                    []
                  );
                } else {
                  // 发起、结束环节之外的环节
                  actNode = treeProcNode(
                    "act_" + actId,
                    actName,
                    hasAct,
                    "procChildren",
                    !hasAct,
                    hasAct,
                    importAct,
                    currentAct,
                    []
                  );
                }
                procInfo.children.push(actNode);
              });
            }
          }

          // 流程树形节点定义
          function treeProcNode(
            nodeId,
            nodeName,
            isHasContent,
            pid,
            isAdd,
            isUpdate,
            importData,
            currentData,
            children
          ) {
            let node = {
              id: nodeId,
              label: nodeName,
              isHasContent: isHasContent,
              pid: pid,
              isAdd: isAdd,
              isUpdate: isUpdate,
              importData: importData,
              currentData: currentData,
              children: children
            };
            return node;
          }
          // 表单
          if (response.data.formInfo) {
            // console.log(response.data);
            let importFormDataStr = response.data.fileFormInfo;
            let importFormDataArr = [];
            if (importFormDataStr) {
              importFormDataArr = JSON.parse(importFormDataStr);
            }
            let currentFormDataStr = response.data.currentFormInfo;
            let currentFormDataArr = [];
            if (currentFormDataStr) {
              currentFormDataArr = JSON.parse(currentFormDataStr);
            }
            response.data.formInfo.forEach(item => {
              let importForm = importFormDataArr.find(info => {
                return info.formId == item.formId;
              });
              let currentForm = currentFormDataArr.find(info => {
                return info.formId == item.formId;
              });
              let entityChildren = [];
              let dmChildren = [];

              if (item.dmId && item.dmName) {
                let importDmDataStr = response.data.fileDmDtos;
                let importDmDataArr = [];
                if (importDmDataStr) {
                  importDmDataArr = JSON.parse(importDmDataStr);
                }
                let currentDmDataStr = response.data.currentDmDtos;
                let currentDmDataArr = [];
                if (currentDmDataStr) {
                  currentDmDataArr = JSON.parse(currentDmDataStr);
                }
                let importDm = importDmDataArr.find(info => {
                  return info.dataModelId == item.dmId;
                });
                let currentDm = currentDmDataArr.find(info => {
                  return info.dataModelId == item.dmId;
                });
                dmChildren = [
                  {
                    id: item.dmId,
                    label: item.dmName,
                    pid: "dmInfo",
                    hasDm: item.hasDm,
                    isAddDm: item.hasDm === 0 ? true : false,
                    isUpdateDm: item.hasDm === 1 ? true : false,
                    importData: importDm,
                    currentData: currentDm,
                    children: entityChildren
                  }
                ];

                // 实体类的导入导出
                if (importDm) {
                  let importEntityArr = importDm.respEntityDtoList;
                  let currentEntityArr = currentDm
                    ? currentDm.respEntityDtoList
                    : [];
                  if (item && item.entityInfo) {
                    item.entityInfo.forEach(ent => {
                      let importEntity = importEntityArr.find(info => {
                        return info.entityId == ent.entityId;
                      });
                      let currentEntity = currentEntityArr.find(info => {
                        return info.entityId == ent.entityId;
                      });
                      entityChildren.push({
                        id: ent.entityId,
                        label: ent.entityName,
                        pid: "entityInfo",
                        hasEntity: ent.hasEntity,
                        isAddEntity: ent.hasEntity === 0 ? true : false,
                        isUpdateEntity: ent.hasEntity === 1 ? true : false,
                        importData: importEntity,
                        currentData: currentEntity
                      });
                      // _this.importProc.entityIds.push(ent.entityId)
                    });
                  }
                }
              }
              formInfo.children.push({
                id: item.formId,
                label: item.formName,
                pid: "formInfo",
                hasForm: item.hasForm,
                isAddForm: item.hasForm === 0 ? true : false,
                isUpdateForm: item.hasForm === 1 ? true : false,
                importData: importForm,
                currentData: currentForm,
                children: dmChildren
              });
              // _this.importProc.dmIds.push(item.dmId)
              // _this.importProc.formIds.push(item.formId)
            });
          }
          // 规则
          if (null != response.data.ruleInfo) {
            response.data.ruleInfo.forEach(item => {
              let funcNodeList = [];
              let importRuleMasterDataStr = response.data.fileRuleMasterInfo;
              let importRuleMasterDataArr = [];
              if (importRuleMasterDataStr) {
                importRuleMasterDataArr = JSON.parse(importRuleMasterDataStr);
              }
              let currentRuleMasterDataStr =
                response.data.currentRuleMasterInfo;
              let currentRuleMasterDataArr = [];
              if (currentRuleMasterDataStr) {
                currentRuleMasterDataArr = JSON.parse(currentRuleMasterDataStr);
              }
              let importRuleMaster = importRuleMasterDataArr.find(info => {
                return info.wfRuleMasterId == item.wfRuleMasterId;
              });
              let currentRuleMaster = currentRuleMasterDataArr.find(info => {
                return info.wfRuleMasterId == item.wfRuleMasterId;
              });
              let importRuleDetailDataStr = response.data.fileRuleDetailInfo;
              let importRuleDetailDataArr = [];
              if (importRuleDetailDataStr) {
                importRuleDetailDataArr = JSON.parse(importRuleDetailDataStr);
              }
              let currentRuleDetailDataStr =
                response.data.currentRuleDetailInfo;
              let currentRuleDetailDataArr = [];
              if (currentRuleDetailDataStr) {
                currentRuleDetailDataArr = JSON.parse(currentRuleDetailDataStr);
              }
              let importRuleDetail = importRuleDetailDataArr.find(info => {
                return info.wfRuleMasterId == item.wfRuleMasterId;
              });
              let currentRuleDetail = currentRuleDetailDataArr.find(info => {
                return info.wfRuleMasterId == item.wfRuleMasterId;
              });
              if (importRuleMaster) {
                importRuleMaster["ruleDetails"] = importRuleDetail;
              }
              if (currentRuleMaster) {
                currentRuleMaster["ruleDetails"] = currentRuleDetail;
              }
              ruleInfo.children.push({
                id: item.wfRuleMasterId,
                label: item.ruleName,
                pid: "ruleInfo",
                hasRule: item.hasRule,
                isAddRule: item.hasRule === 0 ? true : false,
                isUpdateRule: item.hasRule === 1 ? true : false,
                importData: importRuleMaster,
                currentData: currentRuleMaster,
                children: funcNodeList
              });
              // _this.importProc.ruleIds.push(item.wfRuleMasterId)
              // 规则下的函数
              let ruleFuncList = item.ruleFuncList;
              // 规则下函数列表
              let importRuleFuncList =
                importRuleMaster && importRuleMaster.exportRespFuncDtoList
                  ? importRuleMaster.exportRespFuncDtoList
                  : [];
              let currentRuleFuncList =
                currentRuleMaster && currentRuleMaster.exportRespFuncDtoList
                  ? currentRuleMaster.exportRespFuncDtoList
                  : [];
              if (null != ruleFuncList) {
                for (let i = 0; i < ruleFuncList.length; i++) {
                  let funcInfo = ruleFuncList[i];
                  let importRuleFuncData = importRuleFuncList.find(info => {
                    return info.functionId == funcInfo.functionId;
                  });
                  let currentRuleFuncData = currentRuleFuncList.find(info => {
                    return info.functionId == funcInfo.functionId;
                  });
                  funcNodeList.push({
                    id: funcInfo.functionId,
                    label: funcInfo.functionName,
                    pid: "funcInfo",
                    hasFunc: funcInfo.hasFunction,
                    isAddFunc: funcInfo.hasFunction === 0 ? true : false,
                    isUpdateFunc: funcInfo.hasFunction === 1 ? true : false,
                    importData: importRuleFuncData,
                    currentData: currentRuleFuncData
                  });
                }
              }
            });
          }
          // 自定义扩展
          // response.data.customData.forEach((item) => {
          //   customData.children.push({
          //     id: item.wfRuleMasterId,
          //     label: item.ruleName,
          //     pid: 'customData',
          //   })
          // })
          this.importDialogShow = true;
        }

        // this.$alert("导入成功!",this.$t('cm.tips'));
        //刷新列表页
        // this.queryProcessList(true)
      } else {
        this.$message({
          message: response.msg,
          type: "warning"
        });
      }
    },
    //导入流程信息
    importFlowClick() {
      let _this = this;
      const loading = this.$loading({
        target: "el-main",
        lock: true,
        text: "加载中",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)"
      });
      _this.importProc.procCategoryId = _this.importProcData.procCategoryId; //流程分类ID
      _this.importProc.pscModelId = _this.importProcData.pscModelId; //流程pscMOdelId
      _this.importProc.procId = _this.importProcData.procId; //流程定义id
      _this.importProc.procVersion = _this.importProcData.procVersion; //流程版本
      _this.importProc.bpmn = 0; //PSC流程图
      let procInfo = this.importChoiceDto[0].children.find(
        item => item.label === "流程(配置和流程图）"
      );
      // _this.importProc.procInfo = procInfo.isAdd ? 1 : procInfo.isUpdate ? 2 : 0 //流程配置
      let formInfo = _this.importChoiceDto[0].children.find(
        item => item.label === "表单"
      );
      let ruleInfo = _this.importChoiceDto[0].children.find(
        item => item.label === "规则"
      );
      procInfo.children.forEach(item => {
        if (item.isAdd) {
          _this.importProc.addProcActList.push(item.id);
        }
        if (item.isUpdate) {
          _this.importProc.updateProcActList.push(item.id);
        }
      });
      formInfo.children.forEach(item => {
        if (item.isAddForm) {
          _this.importProc.addForms.push(item.id);
        }
        if (item.isUpdateForm) {
          _this.importProc.updateForms.push(item.id);
        }
        item.children.forEach(dm => {
          if (dm.isAddDm) {
            _this.importProc.addDms.push(dm.id);
          }
          if (dm.isUpdateDm) {
            _this.importProc.updateDms.push(dm.id);
          }
          dm.children.forEach(ent => {
            if (ent.isAddEntity) {
              _this.importProc.addEntities.push(ent.id);
            }
            if (ent.isUpdateEntity) {
              _this.importProc.updateEntities.push(ent.id);
            }
          });
        });
      });
      ruleInfo.children.forEach(item => {
        if (item.isAddRule) {
          _this.importProc.addRules.push(item.id);
        }
        if (item.isUpdateRule) {
          _this.importProc.updateRules.push(item.id);
        }
        item.children.forEach(func => {
          if (func.isAddFunc) {
            _this.importProc.addFuncs.push(func.id);
          }
          if (func.isUpdateFunc) {
            _this.importProc.updateFuncs.push(func.id);
          }
        });
      });
      // 获取树被选中的节点
      if (
        _this.importProc.addProcActList.length === 0 &&
        _this.importProc.updateProcActList.length === 0 &&
        _this.importProc.addForms.length === 0 &&
        _this.importProc.updateForms.length === 0 &&
        _this.importProc.addDms.length === 0 &&
        _this.importProc.updateDms.length === 0 &&
        _this.importProc.addEntities.length === 0 &&
        _this.importProc.updateEntities.length === 0 &&
        _this.importProc.addRules.length === 0 &&
        _this.importProc.updateRules.length === 0 &&
        _this.importProc.addFuncs.length === 0 &&
        _this.importProc.updateFuncs.length === 0
      ) {
        _this.$message({ message: "请选择导入项", type: "warning" });
        loading.close();
        return false;
      }
      _this.formDataFile.append("importDto", JSON.stringify(_this.importProc));
      _this.formDataFile.append("importReadDataRedisKey", _this.fileData);
      workflowManageAPI
        .processManageImportProcZip(_this.formDataFile)
        .then(res => {
          if (res.code === "0") {
            _this.$message({
              message: res.msg,
              type: "success"
            });
            _this.queryProcessList(true);
          } else {
            _this.$message({
              message: res.msg,
              type: "warning"
            });
          }
          _this.closeImportDialog();
          loading.close();
        });
    }
  }
};
