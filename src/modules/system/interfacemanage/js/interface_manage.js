import breadcrumb from "@/components/common/breadcrumb";
import interfaceApi from "../api";
import { throttle } from "@/utils/funcUtil";
import * as funcUtil from "@/utils/funcUtil";
import { hasPermission } from "@/permission/btn";
import queryForm from "@/components/common/queryForm";
import { calcHeight } from "@/utils/funcUtil";

export default {
  components: {
    breadcrumb,
    queryForm
  },
  data: function() {
    return {
      filters: funcUtil.splitTime,
      hasIcon: false,
      brand: [{ name: "sys.system_manage" }, { name: "sys.interface_manage" }],
      isTreeCollapse: false,
      maxTreeHeight: 0,
      maxTableHeight: 0,
      maxRightHeight: 0,
      clearnode: true,
      otherSize: 10,
      otherCurrent: 1,
      otherTotal: 0,
      localSize: 10,
      localCurrent: 1,
      localTotal: 0,
      callBackInterSize: 10,
      callBackInterCurrent: 1,
      callBackInterTotal: 0,
      otherAddLocalSize: 10,
      otherAddLocalCurrent: 1,
      otherAddLocalTotal: 0,
      show: false,
      isLocalSystem: true,
      appFilterText: "",
      interDialogTitle: "",
      interfaceEditFlag: true, //页面字段可编辑：true
      appDialogVisible: false,
      interDialogVisible: false,
      callBackInterDialogVisible: false,
      otherAddLocalDialogVisible: false,
      tabName: "localSysInter",
      nodeKey: "",
      currentLocalAppCode: "",

      appDataList: [],
      idpEnable: "", //idp开关，在后台配置文件中配置interfaceManager.registApp.appcode.getidp.enable，不配置默认为true
      idpAppList: [],
      otherInterfaceTableData: [],
      localInterfaceTableData: [],
      callBackInterTableData: [],
      otherAddLocalTableData: [],
      appTreeOption: {
        children: "children",
        label: "appName"
      },
      currentTreeNode: {},
      callBackInterSelectData: {},
      otherAddLocalSelectData: [],

      otherInterfaceQueryModel: {
        appCode: "",
        interScope: "",
        interName: "",
        interUrl: ""
      },
      localInterfaceQueryModel: {
        appCode: "",
        interScope: "",
        interName: "",
        interUrl: ""
      },
      callBackInterQueryModel: {
        appCode: "",
        interScope: "0",
        interCode: "",
        interName: "",
        interUrl: ""
      },
      otherAddLocalQueryModel: {
        appCode: "",
        interScope: "0",
        interName: "",
        interUrl: "",
        excludeFlag: true,
        dexAppCode: ""
      },
      appData: {
        registAppId: "",
        appCode: "",
        appName: "",
        authType: "",
        authClasspath: "",
        appDesc: ""
      },
      interfaceData: {
        registInterId: "",
        interCode: "",
        interName: "",
        interScope: "",
        interType: "",
        interStatus: "",
        paramType: "",
        requestType: "",
        interactionType: "",
        wsdlUrl: "",
        interUrl: "",
        interDesc: "",
        ifCallback: "",
        subAppCode: "",
        subInterCode: "",
        subInterName: "",
        subInterUrl: "",
        fieldType: "",
        fieldKey: "",
        appCode: ""
      },

      appRules: {
        appCode: [
          {
            required: true,
            message: this.$t("cm.tiprequired"),
            trigger: "blur"
          }
        ],
        appName: [
          {
            required: true,
            message: this.$t("cm.tiprequired"),
            trigger: "blur"
          }
        ],
        authType: [
          {
            required: true,
            message: this.$t("cm.tiprequired"),
            trigger: "blur"
          }
        ],
        appDesc: [
          {
            required: true,
            message: this.$t("cm.tiprequired"),
            trigger: "blur"
          }
        ]
      },
      interRules: {
        interName: [
          {
            required: true,
            message: this.$t("cm.tiprequired"),
            trigger: "blur"
          }
        ],
        interCode: [
          {
            required: true,
            message: this.$t("cm.tiprequired"),
            trigger: "blur"
          }
        ],
        interType: [
          {
            required: true,
            message: this.$t("cm.tiprequired"),
            trigger: "blur"
          }
        ],
        paramType: [
          {
            required: true,
            message: this.$t("cm.tiprequired"),
            trigger: "blur"
          }
        ],
        requestType: [
          {
            required: true,
            message: this.$t("cm.tiprequired"),
            trigger: "blur"
          }
        ],
        interactionType: [
          {
            required: true,
            message: this.$t("cm.tiprequired"),
            trigger: "blur"
          }
        ],
        subInterCode: [
          {
            required: true,
            message: this.$t("cm.tiprequired"),
            trigger: "blur"
          }
        ],
        wsdlUrl: [
          {
            required: true,
            message: this.$t("cm.tiprequired"),
            trigger: "blur"
          }
        ],
        interUrl: [
          {
            required: true,
            message: this.$t("cm.tiprequired"),
            trigger: "blur"
          }
        ],
        interDesc: [
          {
            required: true,
            message: this.$t("cm.tiprequired"),
            trigger: "blur"
          }
        ]
      },
      callBackRules: {
        fieldType: [
          {
            required: true,
            message: this.$t("cm.tiprequired"),
            trigger: "blur"
          }
        ]
        // fieldKey: [
        //   { required: true, message: this.$t('cm.tiprequired'), trigger: 'blur' }
        // ]
      },
      // 认证类型 0 无认证;1 4A认证;2 域认证;3 自定义'
      authTypeOption: [
        {
          value: "0",
          label: "无认证"
        },
        {
          value: "1",
          label: "4A认证"
        },
        // {
        //   value: '2',
        //   label: '域认证'
        // },
        {
          value: "3",
          label: "自定义"
        }
      ],
      interTypeOption: [
        {
          value: "0",
          label: "http"
        },
        {
          value: "1",
          label: "https"
        },
        {
          value: "2",
          label: "webservice"
        },
        // {
        //   value: '3',
        //   label: 'MQ'
        // },
        {
          value: "5",
          label: "中台"
        },
        {
          value: "4",
          label: "自定义"
        }
      ],
      paramTypeOption: [
        {
          value: "1",
          label: "query"
        },
        {
          value: "2",
          label: "body"
        }
      ],
      requestTypeOption: [
        {
          value: "1",
          label: "GET"
        },
        {
          value: "2",
          label: "POST"
        }
      ],
      interactionTypeOption: [],
      fieldTypeOption: [
        {
          value: "1",
          label: "header"
        },
        {
          value: "2",
          label: "param"
        }
      ],
      //新增标识
      addStatus: false,
      //搜索字段
      queryFields: [
        { name: 'interName', label: '', labelKey: 'sys.interface_name', value: '', type: 'input', display: true, order: 1 },
        { name: 'interUrl', label: '', labelKey: 'sys.interface_url', value: '', type: 'input', display: true, order: 2 },
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
  mounted() {
    // 初始化
    this.initTree();
    this.initIdpAppList();
    this.initMaxHeight();
    // throttleFunc记录当前的节流方法，用于在页面销毁时释放
    this.throttleFunc = throttle(this.initMaxHeight, 500);
    window.addEventListener("resize", this.throttleFunc);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.throttleFunc);
  },
  watch: {
    // 树动态过滤
    appFilterText(val) {
      //除去搜索条件前后空格内容
      this.appFilterText = this.appFilterText.trim();
      val = val.trim();
      this.$refs.appTree.filter(val);
    },
    nodeKey(val) {
      if (val) {
        this.$nextTick(() => {
          this.$refs.appTree.setCurrentKey(val);
          this.$nextTick(() => {
            document.querySelector(".is-current").firstChild.click();
          });
        });
      }
    }
  },
  methods: {
    showBtn(btn) {
      return hasPermission(btn);
    },
    // 动态计算高度
    initMaxHeight() {
      calcHeight(this);
    },
    toggleTreeExpand() {
      this.isTreeCollapse = !this.isTreeCollapse;
    },
    // 树过滤器设置
    filterAppTreeNode(value, data) {
      if (!value) return true;
      return data.appName.indexOf(value) !== -1;
    },
    initTree() {
      let _this = this;
      _this.clearnode = true;
      let params = {
        appName: _this.appFilterText
      };
      const loading = _this.$loading({
        target: "el-main",
        lock: true,
        text: "加载中",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)"
      });
      _this.appFilterText = "";
      interfaceApi.getRegistAppTreeAPI(params).then(res => {
        if (res.code === "0") {
          _this.appDataList = res.data;
          _this.idpEnable = res.customData.idpEnable;
          for (let i = 0, len = _this.appDataList.length; i < len; i++) {
            if (_this.appDataList[i].appName === "本系统") {
              _this.currentLocalAppCode = _this.appDataList[i].appCode;
              // 初始化选择
              _this.nodeKey = _this.appDataList[i].registAppId;
              loading.close();
              break;
            }
          }
        } else {
          loading.close();
          _this.$message({
            message: res.msg,
            type: "error"
          });
        }
      });
    },
    initIdpAppList() {
      let _this = this;
      interfaceApi.idpAPPListAPI().then(res => {
        if (res.code === "0") {
          _this.idpAppList = res.data;
        }
      });
    },
    //切换tab页
    toggleTab(tab, event) {
      this.resetActivePosition(this.$refs.tabs.$el);
      let _this = this;
      _this.tabName = tab.name;
      if (_this.tabName === "localSysInter") {
        _this.isLocalSystem = true;
        _this.localInterfaceQueryModel.interScope = "0";
      } else if (_this.tabName === "otherSysInter") {
        _this.isLocalSystem = false;
        _this.otherInterfaceQueryModel.interScope = "1";
      }
      _this.initMaxHeight();
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
    // 点击应用名称做列表查询
    // to//do 这里的变量名需要根据数据库后台做调整
    appTreeNodeClick(data) {
      let _this = this;
      _this.clearnode = false;
      _this.currentTreeNode = _this.$refs.appTree.getCurrentNode();
      _this.initMaxHeight();
      if (_this.currentTreeNode.appCode === _this.currentLocalAppCode) {
        // 本系统
        _this.localInterfaceTableData = [];
        _this.otherInterfaceTableData = [];
        _this.tabName = "localSysInter";
        _this.isLocalSystem = true;
        _this.localInterfaceQueryModel.appCode = data.appCode;
        _this.localInterfaceQueryModel.interScope = "0"; // 内部接口
        _this.localCurrent = 1;
        _this.localSize = 10;
        _this.localTotal = 0;
        _this.otherCurrent = 1;
        _this.otherSize = 10;
        _this.otherTotal = 0;
        _this.localSearch();
      } else {
        // 外部系统
        _this.otherInterfaceTableData = [];
        _this.localInterfaceTableData = [];
        _this.tabName = "otherSysInter";
        _this.isLocalSystem = false;

        _this.localCurrent = 1;
        _this.localSize = 10;
        _this.localTotal = 0;
        _this.callBackInterQueryModel.appCode = data.appCode;
        _this.otherInterfaceQueryModel.appCode = data.appCode;
        _this.otherInterfaceQueryModel.interScope = "1"; // 外部接口
        _this.otherSearch();

        _this.otherCurrent = 1;
        _this.otherSize = 10;
        _this.otherTotal = 0;
        _this.localInterfaceQueryModel.appCode = data.appCode;
        _this.localInterfaceQueryModel.interScope = "0"; // 内部接口
        _this.localSearch();

        // 初始化弹窗中内部接口查询条件
        _this.otherAddLocalQueryModel.dexAppCode = data.appCode;
        _this.otherAddLocalQueryModel.appCode = _this.currentLocalAppCode;
      }
    },
    intOp() {
      if (this.isLocalSystem) {
        this.interactionTypeOption = [
          {
            value: "1",
            label: "同步方式"
          }
        ];
      } else {
        this.interactionTypeOption = [
          {
            value: "1",
            label: "同步方式"
          },
          {
            value: "2",
            label: "异步方式"
          }
        ];
      }
    },
    addAppFamily() {
      this.clearAppData();
      this.appDialogVisible = true;
      this.addStatus = true;
    },
    udpAppFamily() {
      let _this = this;
      _this.addStatus = false;
      if (_this.clearnode === true) {
        _this.$message({
          message: this.$t("sys.choose_app"),
          type: "warning"
        });
      } else {
        let currentTreeNode = _this.currentTreeNode;
        if (currentTreeNode === null) {
          _this.$message({
            message: this.$t("sys.choose_app"),
            type: "warning"
          });
        } else {
          _this.appDialogVisible = true;
          _this.appData.registAppId = currentTreeNode.registAppId;
          _this.appData.appCode = currentTreeNode.appCode;
          _this.appData.appName = currentTreeNode.appName;
          _this.appData.authType = currentTreeNode.authType;
          _this.appData.authClasspath = currentTreeNode.authClasspath;
          _this.appData.appDesc = currentTreeNode.appDesc;
        }
      }
    },
    removeAppFamily() {
      let _this = this;
      if (_this.clearnode === true) {
        _this.$message({
          message: this.$t("sys.choose_app"),
          type: "warning"
        });
      } else {
        let currentTreeNode = _this.currentTreeNode;
        if (currentTreeNode.children && currentTreeNode.children.length > 0) {
          _this.$message({
            message: thi.$t("sys.interface_delNode_op"),
            type: "warning"
          });
          return false;
        }
        if (currentTreeNode === null) {
          _this.$message({
            message: this.$t("sys.choose_app"),
            type: "warning"
          });
        } else {
          if (currentTreeNode.appCode === _this.currentLocalAppCode) {
            _this.$message({
              message: this.$t("sys.not_dele_app"),
              type: "warning"
            });
            return false;
          }
          _this
            .$confirm(this.$t("sys.confirm_delete"), _this.$t("cm.tips"), {
              type: "warning",
              confirmButtonText: _this.$t("cm.confirm"),
              cancelButtonText: _this.$t("cm.cancel"),
              cancelButtonClass: "btn-second",
              confirmButtonClass: "btn-default"
            })
            .then(() => {
              let param = {};
              param = Object.assign(param, currentTreeNode);
              interfaceApi
                .delRegistAppAPI(param)
                .then(res => {
                  if (res.code === "0") {
                    _this.initTree();
                    _this.clearAppData();
                    _this.$nextTick(() => {
                      _this.$refs["appForm"].clearValidate();
                    });
                    _this.$message({
                      type: "success",
                      message: this.$t("cm.operator_success")
                    });
                  } else {
                    _this.$message({ type: "error", message: res.msg });
                  }
                })
                .catch(err => {
                  _this.$message({ type: "error", message: err.msg });
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

    // 新增和编辑
    saveAppClick() {
      let _this = this;
      _this.$refs["appForm"].validate(valid => {
        if (valid) {
          const loading = _this.$loading({
            target: "el-main",
            lock: true,
            text: "加载中",
            spinner: "el-icon-loading",
            background: "rgba(0, 0, 0, 0.7)"
          });
          if (_this.addStatus) {
            interfaceApi
              .addRegistAppAPI(_this.appData)
              .then(res => {
                if (res.code === "0") {
                  if (_this.appData.appCode !== _this.currentLocalAppCode) {
                    _this.nodeKey = "";
                  }

                  _this.initTree();
                  _this.clearAppData();
                  _this.$nextTick(() => {
                    _this.$refs["appForm"].clearValidate();
                  });
                  _this.appDialogVisible = false;
                  loading.close();
                  _this.$message({
                    type: "success",
                    message: this.$t("cm.operator_success")
                  });
                } else {
                  loading.close();
                  _this.$message({ type: "error", message: res.msg });
                }
              })
              .catch(err => {
                loading.close();
                _this.$message({ type: "error", message: err.msg });
              });
          } else {
            interfaceApi
              .updRegistAppAPI(_this.appData)
              .then(res => {
                if (res.code === "0") {
                  if (_this.appData.appCode !== _this.currentLocalAppCode) {
                    _this.nodeKey = "";
                  }
                  _this.initTree();
                  _this.clearAppData();
                  _this.$nextTick(() => {
                    _this.$refs["appForm"].clearValidate();
                  });
                  _this.appDialogVisible = false;
                  loading.close();
                  _this.$message({
                    type: "success",
                    message: this.$t("cm.operator_success")
                  });
                } else {
                  loading.close();
                  _this.$message({ type: "error", message: res.msg });
                }
              })
              .catch(err => {
                loading.close();
                _this.$message({ type: "error", message: err.msg });
              });
          }
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    clearAppData() {
      let _this = this;
      _this.appData.registAppId = "";
      _this.appData.appCode = "";
      _this.appData.appName = "";
      _this.appData.authType = "";
      _this.appData.authClasspath = "";
      _this.appData.appDesc = "";
    },
    //关闭弹窗
    appDialogHandleClose() {
      this.$refs["appForm"].resetFields();
      this.clearAppData();
      this.appDialogVisible = false;
    },
    idpAppChange(data) {
      let _this = this;
      _this.appData.appCode = data.code;
      _this.appData.appName = data.name;
    },
    authTypeChange(data) {
      let _this = this;
      // to、do 无用方法
    },
    fieldTypeChange(data) {},

    //==============================================================================================================================//
    // 改变每页显示数
    handleOtherSizeChange(size) {
      let _this = this;
      let params = {
        current: 1,
        size: size
      };
      _this.otherSize = size;
      _this.otherCurrent = 1;
      params = Object.assign(params, _this.otherInterfaceQueryModel);
      _this.getOtherInterfaceList(params);
    },
    // 翻页
    handleOtherCurrentChange(current) {
      let _this = this;
      let params = {
        current: current,
        size: _this.otherSize
      };
      _this.otherCurrent = current;
      params = Object.assign(params, _this.otherInterfaceQueryModel);
      _this.getOtherInterfaceList(params);
    },
    // 改变每页显示数
    handleLocalSizeChange(size) {
      let _this = this;
      let params = {
        current: 1,
        size: size
      };
      _this.localSize = size;
      _this.localCurrent = 1;
      params = Object.assign(params, _this.localInterfaceQueryModel);
      _this.getLocalInterfaceList(params);
    },
    // 翻页
    handleLocalCurrentChange(current) {
      let _this = this;
      let params = {
        current: current,
        size: _this.localSize
      };
      _this.localCurrent = current;
      params = Object.assign(params, _this.localInterfaceQueryModel);
      _this.getLocalInterfaceList(params);
    },
    refreshTab() {
      let _this = this;
      if (_this.tabName === "localSysInter") {
        _this.localSearch();
      } else if (_this.tabName === "otherSysInter") {
        _this.otherSearch();
      }
    },
    //普通搜索
    otherSearch() {
      let _this = this;
      _this.otherCurrent = 1;
      _this.otherSize = 10;
      _this.otherTotal = 0;
      let params = {
        pageIndex: 1,
        size: _this.otherSize
      };
      //除去搜索条件前后空格内容
      _this.otherInterfaceQueryModel.interName = _this.otherInterfaceQueryModel.interName.trim();
      _this.otherInterfaceQueryModel.interUrl = _this.otherInterfaceQueryModel.interUrl.trim();
      params = Object.assign(params, _this.otherInterfaceQueryModel);
      _this.getOtherInterfaceList(params);
    },
    // 重置查询条件
    otherReset() {
      this.otherInterfaceQueryModel.interName = "";
      this.otherInterfaceQueryModel.interUrl = "";
    },
    //普通搜索
    localSearch() {
      let _this = this;
      _this.localCurrent = 1;
      _this.localSize = 10;
      _this.localTotal = 0;
      let params = {
        pageIndex: 1,
        size: _this.otherSize
      };
      let queryForm = this.$refs.queryForm.getQueryForm();
      //除去搜索条件前后空格内容
      _this.localInterfaceQueryModel.interName = queryForm.interName.trim();
      _this.localInterfaceQueryModel.interUrl = queryForm.interUrl.trim();
      params = Object.assign(params, _this.localInterfaceQueryModel);
      _this.getLocalInterfaceList(params);
    },
    // 重置查询条件
    localReset() {
      let _this = this;
      _this.localInterfaceQueryModel.interName = "";
      _this.localInterfaceQueryModel.interUrl = "";
    },
    //获取接口列表
    getOtherInterfaceList(params) {
      let _this = this;
      if (!params) {
        params = {
          current: _this.otherCurrent,
          size: _this.otherSize
        };
        params = Object.assign(params, _this.otherInterfaceQueryModel);
      }
      const loading = _this.$loading({
        target: "el-main",
        lock: true,
        text: "加载中",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)"
      });
      interfaceApi.pageListAPI(params).then(res => {
        if (res.code === "0") {
          _this.otherInterfaceTableData = res.records;
          _this.otherTotal = res.total;
          loading.close();
        }
      });
    },
    //获取接口列表
    getLocalInterfaceList(params) {
      let _this = this;
      if (!params) {
        params = {
          current: _this.localCurrent,
          size: _this.localSize
        };
        params = Object.assign(params, _this.localInterfaceQueryModel);
      }
      const loading = _this.$loading({
        target: "el-main",
        lock: true,
        text: "加载中",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)"
      });
      interfaceApi.pageListAPI(params).then(res => {
        if (res.code === "0") {
          _this.localInterfaceTableData = res.records;
          _this.localTotal = res.total;
          loading.close();
        }
      });
    },
    // 更多菜单事件
    moreCommandHandler(command) {
      let param = command.param;
      switch (command.optFlag) {
        // case 'deleteInterface': this.deleteInterface(param); break;
        case "enableInterface":
          this.enableInterface(param);
          break;
        case "fobiddenInterface":
          this.fobiddenInterface(param);
          break;
        case "interfaceParams":
          this.openParamsDialog(param);
          break;
        default:
          break;
      }
    },
    beforeMoreCommandHandler(optFlag, param) {
      return {
        optFlag: optFlag,
        param: param
      };
    },
    // 打开新增接口弹窗
    addOtherInterface() {
      let _this = this;
      let currentTreeNode = _this.currentTreeNode;
      if (currentTreeNode === null) {
        _this.$message({
          message: this.$t("sys.choose_app"),
          type: "warning"
        });
      } else {
        _this.interDialogTitle = "sys.add_interface";
        _this.interfaceEditFlag = true;
        _this.clearInterData();
        _this.intOp();
        _this.interDialogVisible = true;
      }
    },
    // 打开新增接口弹窗
    addLocalInterface() {
      let _this = this;
      let currentTreeNode = _this.currentTreeNode;
      if (currentTreeNode === null) {
        _this.$message({
          message: this.$t("sys.choose_app"),
          type: "warning"
        });
      } else {
        console.info("内部接口新增");
        if (currentTreeNode.appCode === _this.currentLocalAppCode) {
          // 如果是本地系统，正常新增接口
          _this.addOtherInterface();
        } else {
          // 如果是外部系统，增弹窗选择本地系统接口
          let _this = this;
          _this.otherAddLocalDialogVisible = true;
          _this.otherAddLocalSearch();
        }
      }
    },
    // 详情页面打开
    handleClick(row) {
      let _this = this;
      _this.interfaceData = _this.deepClone(row);
      _this.interDialogTitle = "sys.detail_interface";
      _this.interfaceEditFlag = false;
      _this.interDialogVisible = true;
    },
    handleSubClick(row) {
      let _this = this;
      _this.interDialogTitle = "sys.detail_interface";
      _this.interfaceEditFlag = false;
      let param = {
        interCode: row.subInterCode,
        interName: row.subInterName,
        interUrl: row.subInterUrl,
        appCode: row.subAppCode
      };
      interfaceApi
        .queryRegistInterfaceInfoAPI(param)
        .then(res => {
          if (res.code === "0") {
            _this.interfaceData = _this.deepClone(res.data);
            _this.interDialogVisible = true;
          } else {
            _this.$message({ type: "error", message: res.msg });
          }
        })
        .catch(err => {
          _this.$message({ type: "error", message: err.msg });
        });
    },
    editOtherInterface(row) {
      let _this = this;
      _this.interfaceData = _this.deepClone(row);
      _this.interDialogTitle = "sys.edit_interface";
      _this.interfaceEditFlag = true;
      _this.intOp();
      _this.interDialogVisible = true;
    },

    interDialogHandleClose() {
      let _this = this;
      _this.interDialogVisible = false;
      _this.$refs["interForm"].resetFields();
      _this.clearInterData();
      _this.callBackInterSelectData = {};
    },
    selectInterClick() {
      let _this = this;
      _this.callBackInterDialogVisible = true;
      _this.callBackInterSearch();
    },
    interTypeChange(value) {
      let _this = this;
      if (value != "0" && value != "1" && value != "5") {
        _this.interfaceData.ifCallback = "0";
      }
    },
    paramTypeChange(value) {},
    requestTypeChange(value) {},
    interactionTypeChange(value) {
      let _this = this;
      if (value === "2") {
        _this.interfaceData.ifCallback = "1";
      } else {
        _this.interfaceData.ifCallback = "0";
      }
    },
    clearInterData() {
      let _this = this;
      _this.interfaceData.registInterId = "";
      _this.interfaceData.interCode = "";
      _this.interfaceData.interName = "";
      _this.interfaceData.interScope = "";
      _this.interfaceData.interType = "";
      _this.interfaceData.interStatus = "";
      _this.interfaceData.paramType = "";
      _this.interfaceData.requestType = "";
      _this.interfaceData.interactionType = "";
      _this.interfaceData.wsdlUrl = "";
      _this.interfaceData.interUrl = "";
      _this.interfaceData.interDesc = "";
      _this.interfaceData.ifCallback = "";
      _this.interfaceData.subAppCode = "";
      _this.interfaceData.subInterCode = "";
      _this.interfaceData.subInterName = "";
      _this.interfaceData.subInterUrl = "";
      _this.interfaceData.fieldType = "";
      _this.interfaceData.fieldKey = "";
      _this.interfaceData.appCode = "";
    },
    // 接口新增和编辑提交
    saveInterClick() {
      let _this = this;
      if (
        _this.interfaceData.interactionType === "2" &&
        _this.interfaceData.ifCallback === "1" &&
        (_this.interfaceData.subAppCode === "" ||
          _this.interfaceData.subInterCode === "" ||
          _this.interfaceData.subInterName === "")
      ) {
        _this.$message({ type: "warning", message: "请选择回调接口" });
        return false;
      }
      _this.$refs["interForm"].validate(valid => {
        if (valid) {
          const loading = _this.$loading({
            target: "el-main",
            lock: true,
            text: "加载中",
            spinner: "el-icon-loading",
            background: "rgba(0, 0, 0, 0.7)"
          });
          console.info(_this.interDialogTitle);
          if (_this.interDialogTitle === "sys.add_interface") {
            if (_this.tabName === "localSysInter") {
              _this.interfaceData.interScope =
                _this.localInterfaceQueryModel.interScope;
            } else if (_this.tabName === "otherSysInter") {
              _this.interfaceData.interScope =
                _this.otherInterfaceQueryModel.interScope;
            }
            if (_this.interfaceData.interactionType === "1") {
              _this.interfaceData.ifCallback = "0";
            }
            _this.interfaceData.interStatus = "1";
            _this.interfaceData.appCode = _this.currentTreeNode.appCode;
            interfaceApi
              .addRegistInterfaceAPI(_this.interfaceData)
              .then(res => {
                if (res.code === "0") {
                  // TO//DO 刷新当前tab页数据
                  _this.refreshTab();
                  _this.clearInterData();
                  _this.$nextTick(() => {
                    _this.$refs["interForm"].clearValidate();
                  });
                  _this.interDialogVisible = false;
                  _this.callBackInterSelectData = {};
                  loading.close();
                  _this.$message({
                    type: "success",
                    message: this.$t("cm.operator_success")
                  });
                } else {
                  loading.close();
                  _this.$message({ type: "error", message: res.msg });
                }
              })
              .catch(err => {
                loading.close();
                _this.$message({ type: "error", message: err.msg });
              });
          } else if (_this.interDialogTitle === "sys.edit_interface") {
            interfaceApi
              .updRegistInterfaceAPI(_this.interfaceData)
              .then(res => {
                if (res.code === "0") {
                  // TO//DO 刷新当前tab页数据
                  _this.refreshTab();
                  _this.clearInterData();
                  _this.$nextTick(() => {
                    _this.$refs["interForm"].clearValidate();
                  });
                  _this.interDialogVisible = false;
                  _this.callBackInterSelectData = {};
                  loading.close();
                  _this.$message({
                    type: "success",
                    message: this.$t("cm.operator_success")
                  });
                } else {
                  loading.close();
                  _this.$message({ type: "error", message: res.msg });
                }
              })
              .catch(err => {
                loading.close();
                _this.$message({ type: "error", message: err.msg });
              });
          }
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    deleteInterface(rowData) {
      let _this = this;

      _this
        .$confirm(this.$t("sys.confirm_delete_inter"), _this.$t("cm.tips"), {
          type: "warning",
          confirmButtonText: _this.$t("cm.confirm"),
          cancelButtonText: _this.$t("cm.cancel"),
          cancelButtonClass: "btn-second",
          confirmButtonClass: "btn-default"
        })
        .then(() => {
          let param = {};
          param = Object.assign(param, rowData);
          interfaceApi
            .delRegistInterfaceAPI(param)
            .then(res => {
              if (res.code === "0") {
                // TO//DO 刷新当前tab页数据
                _this.refreshTab();
                _this.clearInterData();
                _this.$nextTick(() => {
                  _this.$refs["interForm"].clearValidate();
                });
                _this.$message({
                  type: "success",
                  message: this.$t("cm.operator_success")
                });
              } else {
                _this.$message({ type: "error", message: res.msg });
              }
            })
            .catch(err => {
              _this.$message({ type: "error", message: err.msg });
            });
        })
        .catch(() => {
          _this.$message({
            type: "info",
            message: _this.$t("cm.deletecancel")
          });
        });
    },
    enableInterface(rowData) {
      let _this = this;
      _this
        .$confirm("确定启用此接口吗", _this.$t("cm.tips"), {
          type: "warning",
          confirmButtonText: _this.$t("cm.confirm"),
          cancelButtonText: _this.$t("cm.cancel"),
          cancelButtonClass: "btn-second",
          confirmButtonClass: "btn-default"
        })
        .then(() => {
          let param = {};
          param = Object.assign(param, rowData);
          param.interStatus = "1";
          interfaceApi
            .updRegistInterfaceAPI(param)
            .then(res => {
              if (res.code === "0") {
                // TO//DO 刷新当前tab页数据
                _this.refreshTab();
                _this.clearInterData();
                _this.$nextTick(() => {
                  _this.$refs["interForm"].clearValidate();
                });
                _this.$message({
                  type: "success",
                  message: this.$t("cm.operator_success")
                });
              } else {
                _this.$message({ type: "error", message: res.msg });
              }
            })
            .catch(err => {
              _this.$message({ type: "error", message: err.msg });
            });
        })
        .catch(() => {
          _this.$message({
            type: "info",
            message: "操作取消"
          });
        });
    },
    fobiddenInterface(rowData) {
      let _this = this;
      _this
        .$confirm(this.$t("sys.confirm_disable_inter"), _this.$t("cm.tips"), {
          type: "warning",
          confirmButtonText: _this.$t("cm.confirm"),
          cancelButtonText: _this.$t("cm.cancel"),
          cancelButtonClass: "btn-second",
          confirmButtonClass: "btn-default"
        })
        .then(() => {
          let param = {};

          param = Object.assign(param, rowData);
          param.interStatus = "0";
          interfaceApi
            .updRegistInterfaceAPI(param)
            .then(res => {
              if (res.code === "0") {
                // TO//DO 刷新当前tab页数据
                _this.refreshTab();
                _this.clearInterData();
                _this.$nextTick(() => {
                  _this.$refs["interForm"].clearValidate();
                });
                _this.$message({
                  type: "success",
                  message: this.$t("cm.operator_success")
                });
              } else {
                _this.$message({ type: "error", message: res.msg });
              }
            })
            .catch(err => {
              _this.$message({ type: "error", message: err.msg });
            });
        })
        .catch(() => {
          _this.$message({
            type: "info",
            message: "操作取消"
          });
        });
    },

    //====================================================================================================================================//
    // 改变每页显示数
    handleCallBackInterSizeChange(size) {
      let _this = this;
      let params = {
        current: 1,
        size: size
      };
      _this.callBackInterSize = size;
      _this.callBackInterCurrent = 1;
      params = Object.assign(params, _this.callBackInterQueryModel);
      _this.callBackInterSearch(params);
    },
    // 翻页
    handleCallBackInterCurrentChange(current) {
      let _this = this;
      let params = {
        current: current,
        size: _this.callBackInterSize
      };
      _this.callBackInterCurrent = current;
      params = Object.assign(params, _this.callBackInterQueryModel);
      _this.callBackInterSearch(params);
    },
    callBackInterSearch(params) {
      let _this = this;
      if (!params) {
        params = {
          current: _this.callBackInterCurrent,
          size: _this.callBackInterSize,
          interStatus: "1" //外部接口添加回调内部接口时，只展示未禁用的应用内部接口 接口状态 0 禁用 1 启用
        };
        params = Object.assign(params, _this.callBackInterQueryModel);
      }
      const loading = _this.$loading({
        target: "el-main",
        lock: true,
        text: "加载中",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)"
      });
      interfaceApi.pageListAPI(params).then(res => {
        if (res.code === "0") {
          _this.callBackInterTableData = res.records;
          _this.callBackInterTotal = res.total;
          loading.close();
        }
      });
    },
    callBackInterReset() {
      let _this = this;
      _this.callBackInterQueryModel.interName = "";
      _this.callBackInterQueryModel.interCode = "";
      _this.callBackInterQueryModel.interUrl = "";
    },
    submitCallBackInterClick() {
      let _this = this;
      console.info(_this.callBackInterSelectData);
      if (
        _this.callBackInterSelectData.appCode === null ||
        _this.callBackInterSelectData.appCode === undefined ||
        _this.callBackInterSelectData.appCode === ""
      ) {
        _this.$message({
          type: "warning",
          message: this.$t("sys.choose_inter")
        });
        return;
      }
      if (_this.interfaceData.fieldType === "") {
        _this.$message({
          type: "warning",
          message: this.$t("sys.choose_type")
        });
        return;
      }
      // if(_this.interfaceData.fieldKey === ''){
      //   _this.$message({type: 'warning', message: "请输入请求表示key！"})
      //   return
      // }
      //_this.$refs['callBackForm'].validate((valid) => {
      //  if (valid) {
      // 用选中的数据赋值
      //_this.interfaceData.subAppCode = _this.deepClone(_this.callBackInterSelectData.appCode)
      _this.interfaceData.subAppCode = _this.deepClone(
        _this.currentLocalAppCode
      );
      _this.interfaceData.subInterCode = _this.deepClone(
        _this.callBackInterSelectData.interCode
      );
      _this.interfaceData.subInterName = _this.deepClone(
        _this.callBackInterSelectData.interName
      );
      _this.interfaceData.subInterUrl = _this.deepClone(
        _this.callBackInterSelectData.interUrl
      );
      _this.callBackInterDialogHandleClose();
      //  }else{
      //    _this.$message({type: 'warning', message: "请检查必填数据！"})
      //  }
      //})
    },
    callBackInterDialogHandleClose() {
      let _this = this;
      _this.callBackInterDialogVisible = false;

      _this.callBackInterReset();
      _this.callBackInterSize = 10;
      _this.callBackInterCurrent = 1;
      _this.callBackInterTotal = 0;
      _this.callBackInterTableData = [];
      _this.callBackInterSelectData.appCode = "";
      _this.callBackInterSelectData.interCode = "";
      _this.callBackInterSelectData.interName = "";
      _this.callBackInterSelectData.interUrl = "";
    },

    //====================================================================================================================================//
    // 改变每页显示数
    handleOtherAddLocalSizeChange(size) {
      let _this = this;
      let params = {
        current: 1,
        size: size
      };
      _this.otherAddLocalSize = size;
      _this.otherAddLocalCurrent = 1;
      params = Object.assign(params, _this.otherAddLocalQueryModel);
      _this.otherAddLocalSearch(params);
    },
    // 翻页
    handleOtherAddLocalCurrentChange(current) {
      let _this = this;
      let params = {
        current: current,
        size: _this.otherAddLocalSize
      };
      _this.otherAddLocalCurrent = current;
      params = Object.assign(params, _this.otherAddLocalQueryModel);
      _this.otherAddLocalSearch(params);
    },
    otherAddLocalSearch(params) {
      let _this = this;
      if (!params) {
        params = {
          current: _this.otherAddLocalCurrent,
          size: _this.otherAddLocalSize,
          interStatus: "1" //外部接口添加内部接口时，只展示未禁用的内部接口 接口状态 0 禁用 1 启用
        };
        params = Object.assign(params, _this.otherAddLocalQueryModel);
      }
      const loading = _this.$loading({
        target: "el-main",
        lock: true,
        text: "加载中",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)"
      });
      interfaceApi.pageListAPI(params).then(res => {
        if (res.code === "0") {
          _this.otherAddLocalTableData = res.records;
          _this.otherAddLocalTotal = res.total;
          loading.close();
        }
      });
    },
    otherAddLocalReset() {
      let _this = this;
      _this.otherAddLocalQueryModel.interName = "";
      _this.otherAddLocalQueryModel.interUrl = "";
    },
    submitOtherAddLocalClick() {
      let _this = this;
      console.info(_this.otherAddLocalSelectData);
      if (_this.otherAddLocalSelectData.length === 0) {
        _this.$message({
          type: "warning",
          message: this.$t("sys.choose_inter_data")
        });
        return false;
      }
      let params = {
        insertDatas: _this.otherAddLocalSelectData,
        appCode: _this.currentTreeNode.appCode,
        interScope: _this.tabName === "localSysInter" ? "0" : "1"
      };
      interfaceApi
        .batchInsertInterfaceAPI(params)
        .then(res => {
          if (res.code === "0") {
            // TO//DO 刷新当前tab页数据
            _this.otherAddLocalDialogHandleClose();
            _this.otherAddLocalSelectData = [];
            _this.refreshTab();
            _this.$nextTick(() => {
              _this.$refs["interForm"].clearValidate();
            });
            _this.$message({
              type: "success",
              message: this.$t("cm.operator_success")
            });
          } else {
            _this.$message({ type: "error", message: res.msg });
          }
        })
        .catch(err => {
          _this.$message({ type: "error", message: err.msg });
        });
    },
    otherAddLocalDialogHandleClose() {
      let _this = this;
      _this.otherAddLocalDialogVisible = false;

      _this.otherAddLocalReset();
      _this.otherAddLocalSize = 10;
      _this.otherAddLocalCurrent = 1;
      _this.otherAddLocalTotal = 0;
      _this.otherAddLocalTableData = [];
    },
    dateFormat: function(time) {
      var date = new Date(time);
      var year = date.getFullYear();
      var month =
        date.getMonth() + 1 < 10
          ? "0" + (date.getMonth() + 1)
          : date.getMonth() + 1;
      var day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
      var hours =
        date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
      var minutes =
        date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
      var seconds =
        date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
      var milSeconds =
        date.getMilliseconds() < 10
          ? "0" + date.getMilliseconds()
          : date.getMilliseconds();
      // 拼接
      return (
        year +
        "-" +
        month +
        "-" +
        day +
        " " +
        hours +
        ":" +
        minutes
        //  +
        // ":" +
        // seconds +
        // ":" +
        // milSeconds
      );
    },

    //=======================================================================//
    openParamsDialog(rowData) {
      console.info(rowData);
    },

    // 处理树形节点字段过长，页面显示不全问题
    ellipsis(value, len) {
      if (!value) {
        return "";
      }
      if (value.length > len) {
        return value.slice(0, len) + "…";
      }
      return value;
    }
  }
};
