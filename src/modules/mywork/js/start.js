import breadcrumb from "@/components/common/breadcrumb";
import api from "../api";
import { CgnBpmnDesigner, CgnBpmnMap } from "psc-module";
import { hasPermission } from "@/permission/btn";
import osUtil from "@/utils/osUtil";
import * as Utils from "@/utils/Utils";
import { throttle } from "@/utils/funcUtil";
import axios from "axios";
import { calcHeight } from "@/utils/funcUtil";

export default {
  components: {
    breadcrumb,
    CgnBpmnDesigner,
    CgnBpmnMap
  },
  data: function () {
    return {
      hasIcon: false,
      brand: [
        { name: "workbench.workbench" },
        { name: "workbench.initiating_process" }
      ],
      fontIcon: [
        {
          icon: "icon-icon_process_contract",
          process: "cud-table-process-pic-blue",
          color: "cud3-icon-blue"
        },
        {
          icon: "icon-icon_process_purchase",
          process: "cud-table-process-pic-light-blue",
          color: "cud3-icon-light-blue"
        },
        {
          icon: "icon-icon_process_administration",
          process: "cud-table-process-pic-green",
          color: "cud3-icon-green"
        },
        {
          icon: "icon-icon_process_marketing",
          process: "cud-table-process-pic-orange",
          color: "cud3-icon-orange"
        }
      ],
      //图标库数据
      iconFontList: [],
      family_name: "",
      showDev: false,
      loading: false,
      processOdd: [],
      processEven: [],
      favoritesOdd: [],
      favoritesEven: [],
      commonUseOdd: [],
      commonUseEven: [],
      respFavoriteDtos: [],
      activeName: "all_process",
      class: "",
      model: {
        procName: ""
      },
      delModel: {
        ids: ""
      },
      saveModel: {
        procId: "",
        procName: ""
      },
      flowVO: {
        mode: "readonly", //this.getWFDesignOpt(),//"create",
        pscUrl: envConfig.PSC_ROOT || "/api", // 指定psc域名地址，必填
        accessToken: "", // 访问Token，必填
        tenantId: "", // 租户ID
        appId: "", // 应用ID，必填
        categoryName: "", // 流程模型分类名称，选填
        procDefId: "", // 流程ID，选填
        version: "",
        procModelId: "", // 流程模型ID，必填
        sourceProcModelId: "", // 来源流程模型ID，必填
        showFunctionBtn: "autoPlaceVertical,subProcessFieldMap", // 显示的工具条按钮信息，选填，可多笔，多笔时用英文逗号分隔无空格。如“exportBpmnModel,importBpmnModel,exportBpmnSvg,backBpmn,redoBpmn,autoPlaceVertical”
        showSetting: false, // 是否显示默认的设置弹窗
        settingTabType: "", // 设置弹窗页签类型，选填。（"": 简洁风格，"card": 选项卡样式，"border-card": 卡片化）
        actionUserInfo: {
          // 操作人信息（userID/userName必填）
          userID: "P621122", // 用户id
          userName: "张霄", // 用户名称
          deptID: "", // 部门ID
          deptName: "", // 部门名称
          deptPath: "", // 部门全路径
          postID: "", // 岗位ID
          postName: "" // 岗位名称
        },
        value: {}
      },
      //流程参数
      pscUrl: envConfig.PSC_ROOT || "/api", // 指定psc域名地址，必填
      configflowDialogVisible: false,
      canViewProcess: true, //用户是否有权限 查看流程图
      clickedItemProcId: "", // 流程项点击唯一唯一id
      categoryIds: {},
      maxTableHeight: 0
    };
  },

  mounted() {
    this.resetActivePosition(this.$refs.tabs.$el);
    let _this = this;
    axios.get("/static/fontfamilys/fontfamily.json", {}).then(response => {
      _this.family_name = response.data.family_name;
      let fontFilePath = response.data.font_file_path;
      axios.get(fontFilePath, {}).then(response => {
        _this.iconFontList = response.data.glyphs;
        _this.getProcList({});
        _this.getFwAuth();
      });
    });
    this.initMaxHeight();
    // throttleFunc记录当前的节流方法，用于在页面销毁时释放
    this.throttleFunc = throttle(this.initMaxHeight, 500);
    window.addEventListener("resize", this.throttleFunc);
    // 获取当前激活的tab页
    let tabFromRoute=this.$route.query.activeName
    this.handleClick({name:tabFromRoute})
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.throttleFunc);
  },
  methods: {
    showBtn(btn) {
      return hasPermission(btn);
    },
    handleCollect(fItem) {
      if (fItem.defProcId === null || fItem.defProcId === undefined) {
        this.saveData(fItem);
      } else {
        this.delData(fItem);
      }
    },

    //查看流程图,为支持多语言，把原先的设计图改成运行图
    showFlow(row) {
      if (row.isProcBeginDiagram === "1") {
        this.flowVO.procDefId = row.procId;
        this.flowVO.procModelId = row.pscModelId; //row.procModelId
        this.flowVO.sourceProcModelId = row.pscModelId;
        this.configflowDialogVisible = true;
      }
    },
    // 权限信息取得
    getFwAuth() {
      let _this = this;
      let user = sessionStorage.getItem("user");

      api.postWfAuthAPI().then(res => {
        if (res.code === "0") {
          let data = res.data;
          _this.flowVO.tenantId = data.tenantId; // 租户ID
          _this.flowVO.appId = data.appId; // 应用ID，必填

          _this.flowVO.accessToken = data.accessToken; // 访问Token，必填
          // _this.flowVO.pscUrl = "/api";
          if (user.indexOf("[") > -1) {
            let temp = user.split("[")[1];
            temp = temp.split("]");
            let userId = temp[0];
            let userName = temp[1];
            _this.flowVO.actionUserInfo.userID = userId;
            _this.flowVO.actionUserInfo.userName = userName;
          } else {
            _this.flowVO.actionUserInfo.userID = user;
          }
        } else {
          _this.$message({
            message: res.msg,
            type: "warning"
          });
        }
      });
    },

    handleClick(tab) {
      this.resetActivePosition(this.$refs.tabs.$el);
      this.clickedItemProcId = "";
      this.categoryIds = {};
      this.model.procName = "";
      if (tab.name === "my_favorite") {
        let params = {};
        this.activeName = "my_favorite";
        this.getFavoriteList(params);
      }
      if (tab.name === "all_process") {
        let params = {};
        this.activeName = "all_process";
        this.getProcList(params);
      }
      if (tab.name === "commonly_used") {
        let params = {};
        this.activeName = "commonly_used";
        this.getCommonlyUseList(params);
      }
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

    saveData(flow) {
      this.loading = true;
      let params = {};
      this.saveModel.procId = flow.procId;
      this.saveModel.procName = flow.procName;
      params = Object.assign(params, this.saveModel);
      api
        .savefavorit(params)
        .then(result => {
          this.loading = false;
          if (result.code == "0") {
            this.$message({
              message: this.$t("cgnTask.tips.favoriteSuccess"),
              type: "success"
            });
            if (this.activeName === "my_favorite") {
            } else {
              this.class = "el-icon-star-on";
              flow.defProcId = flow.procId;
            }
          } else {
            this.$message({
              message: result.msg,
              type: "warning"
            });
          }
        })
        .catch(err => {
          this.loading = false;
          this.$message({
            message: err,
            type: "warning"
          });
        });
    },

    delData(flow) {
      this.loading = true;
      let params = {};
      this.delModel.ids = flow.procId;
      params = Object.assign(params, this.delModel);
      api
        .deletefavorit(params)
        .then(result => {
          this.loading = false;
          if (result.code == "0") {
            this.$message({
              message: this.$t("cgnTask.tips.cancelFavoriteSuccess"),
              type: "success"
            });
            //_this.resetData();
            if (this.activeName === "my_favorite") {
              this.getFavoriteList(params);
            } else {
              flow.defProcId = null;
              this.class = "el-icon-star-off";
            }
          } else {
            this.$message({
              message: result.msg,
              type: "warning"
            });
          }
        })
        .catch(err => {
          this.loading = false;
          this.$message({
            message: err,
            type: "warning"
          });
        });
    },
    // 检索
    commonSearch: function () {
      let _this = this;

      let params = {};
      //除去搜索条件前后空格内容
      _this.model.procName = _this.model.procName.trim();
      params = Object.assign(params, _this.model);
      if (this.activeName === "my_favorite") {
        this.getFavoriteList(params);
      }
      if (this.activeName === "all_process") {
        this.getProcList(params);
      }
      if (this.activeName === "commonly_used") {
        this.getCommonlyUseList(params);
      }
    },
    //获取收藏列表
    getFavoriteList: function (params) {
      let _this = this;
      this.loading = true;
      api.favoriteListAPI(params).then(res => {
        this.loading = false;
        _this.favoritesEven = [];
        _this.favoritesOdd = [];
        if (res.code === "0") {
          if (res.data.length > 0) {
            res.data.forEach(function (item, index) {
              let shuffled = Math.floor(Math.random() * 4);
              item.color = _this.fontIcon[shuffled].color;
              item.icon = _this.fontIcon[shuffled].icon;
              item.process = _this.fontIcon[shuffled].process;
              // if (index % 2 === 1) {
              //   _this.favoritesEven.push(item);
              // } else {
              _this.favoritesOdd.push(item);
              // }
            });
          }
        }
      });
    },

    //获取全部流程列表
    getProcList: function (params) {
      let _this = this;
      this.loading = true;
      api.procListAPI(params).then(res => {
        this.loading = false;
        _this.processEven = [];
        _this.processOdd = [];
        if (res.code === "0") {
          if (res.data.length > 0) {
            res.data.forEach(function (item, index) {
              let shuffled = Math.floor(Math.random() * 4);
              item.color = _this.fontIcon[shuffled].color;
              item.icon = _this.fontIcon[shuffled].icon;
              item.process = _this.fontIcon[shuffled].process;
              // if (index % 2 === 1) {
              //   _this.processEven.push(item);
              // } else {
              _this.processOdd.push(item);
              // }
            });
          }
        }
      });
    },

    //获取常用流程列表
    getCommonlyUseList: function (params) {
      let _this = this;
      this.loading = true;
      api.commonlyUseListAPI(params).then(res => {
        this.loading = false;
        this.commonUseEven = [];
        this.commonUseOdd = [];
        if (res.code === "0") {
          if (res.data.length > 0) {
            res.data.forEach(function (item, index) {
              let shuffled = Math.floor(Math.random() * 4);
              item.color = _this.fontIcon[shuffled].color;
              item.icon = _this.fontIcon[shuffled].icon;
              item.process = _this.fontIcon[shuffled].process;
              // if (index % 2 === 1) {
              //   _this.commonUseEven.push(item);
              // } else {
              _this.commonUseOdd.push(item);
              // }
            });
          }
        }
      });
    },
    procClick(item) {
      console.log(item, 'item===')
      item.procNode = 1;
      sessionStorage.removeItem("procItem");
      sessionStorage.setItem("procItem", JSON.stringify(item));
      if (item.customForm === 1 && item.customFormPath) {
        //打开页签
        this.$router.push({
          path: item.customFormPath,
          query: {
            actId: item.actId,
            procNode: item.procNode,
            procVersion: item.procVersion,
            procId: item.procId,
            procName: item.procName,
            r: Math.random()
          },
        });
      } else {
        //打开页签
        this.openTab({
          path: "/workbench/view",
          query: {
            item,
            procName: item.procName,
            r: Math.random()
          },
        });

      }
    },
    /* //颜色动态设置
    getColor(color){
      let _this = this;
      let returnClass = '';
      let tempList =  _this.iconFontList;
      if (tempList.length>0){
        returnClass = 'iconColor' + color;
      }
      return returnClass;
    },*/
    handleCollect1(data) {
      let dv = document.getElementById(data);
      if (dv.style.display === "none") {
        dv.style.display = "";
      } else {
        dv.style.display = "none";
      }
    },
    onRenderComplete(actInstTrack) {
      console.log("onRenderComplete", actInstTrack);
    },
    onElementEvent() { },
    addShadow(procId) {
      this.clickedItemProcId = procId;
    },
    handleCollapseClick(procCategoryId) {
      let _this = this;
      _this.clickedItemProcId = "";
      if (_this.categoryIds.hasOwnProperty(procCategoryId)) {
        _this.$set(
          _this.categoryIds,
          procCategoryId,
          !_this.categoryIds[procCategoryId]
        );
      } else {
        _this.$set(_this.categoryIds, procCategoryId, true);
      }
    },
    asyncTest() {
      let param = {
        identification: "",
        procId: "363f3a72fe2fce32a3feaf8104c4f404",
        procName: "测试在途流程修改配置",
        procVersion: "V1.0",
        actId: "D2102DE630474D338A0BE3EA8B9D7CF1",
        actName: "010发起环节",
        data:
          '{"testOrderLjx1206":{"formId":"","modifyDate":"","procId":"","createUserNo":"","createUserName":"","procInstId":"","orderTheme":"","modifyUserNo":"","deleteFlag":"","orderDatetime":"","modifyUserName":"","orderTime":"","orderCode":"","orderPrice":"","testOrderLjx1206Id":"","orderDate":"","orderName":"","createDate":""}}',
        userInfo: {
          userID: "PXMWWAH",
          userName: "王辉"
        },
        subject: "测试外部发起接口",
        dataModelId: "30a0ce4090f64e64b5501cd9408870d1"
      };
      api.asyncTest(param).then(ret => {
        this.$alert(ret.data.data);
      });
    },
    initMaxHeight() {
      calcHeight(this, -88);
    }
  },

  filters: Utils.Filters,

  computed: {
    computedTableHeight() {
      return this.maxTableHeight;
    }
  }
};
