/*
 * @Author: P623437
 * @Date: 2021-09-10 08:43:07
 * @LastEditors: P623437
 * @LastEditTime: 2022-11-05 16:39:33
 * @Description: 添加流程模板
 */
import breadcrumb from "@/components/common/breadcrumb";
import { CgnBpmnDesigner } from "psc-module";
import DesignerCustomSetting from "@@/workflow/components/wfTemplateConfig/customWfTemplateSettingDialog";
import api from "./api";
import cmsg from "@@/components/common/message";
import wfConstant from '../../../../../cudcomponents/workflowModule/workflow/common/wfConstant.js'
import wfColleTemplateAPI from "@@/components/wfCollectionComponent/api/index";
import simulation from "../../api";

export default {
  name: "wfTemplateDesign",
  components: {
    CgnBpmnDesigner,
    DesignerCustomSetting,
    breadcrumb
  },
  data() {
    return {
      fullscreenLoading: false,
      processTemplateData: {},
      submitData: {},
      brand: [{ name: "wm.workflow_manage" }, { name: "wm.workflow_design" }],
      hasIcon: false,

      bpmnDesignerConfig: {
        showConfig: false, // 显示组件设置
        configData: "", // 组件设置内容
        show: true // 显示组件
      },
      bpmnDesigner: {
        mode: "", //this.getWFDesignOpt(),//"create",
        pscUrl: "/api", // 指定psc域名地址，必填
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
          userID: this.getCurrentUserCode(), // 用户id
          userName: this.getCurrentUserName(), // 用户名称
          deptID: "", // 部门ID
          deptName: "", // 部门名称
          deptPath: "", // 部门全路径
          postID: "", // 岗位ID
          postName: "" // 岗位名称
        }
      },
      bpmnDesignerExt: {
        showProcDefForm: false, // 是否显示流程表单
        settingDialog: {
          // 设定弹窗
          isOpen: false,
          selectedElementId: "", // 默认选中的元素ID
          readonly: false,
          tabType: "border-card", // 设置弹窗页签类型，选填。（"": 简洁风格，"card": 选项卡样式，"border-card": 卡片化）
          procConfigModel: {}
        },
        procModel: {
          categoryName: "", // 流程分类名称
          procVersion: "", // 版本号
          procDefId: "", // 流程ID
          procDefCode: "", // 流程编码
          procDefName: "", // 流程名称
          procDefEnName: "", // 流程英文名称
          procDefDescription: "", // 流程描述
          procModelId: "", // 流程模型ID
          modelStatus: "", // 流程模型状态
          modelFormUrl: "", // 表单地址
          routeList: [] //环节路由排序
        }
      },
      procTemplVO: {
        procId: "",
        procVersion: "",
        procName: "",
        procNameEn: "",
        procCategoryId: "",
        pscModelId: "",
        procStatus: "",
        actDef: []
      },
      actVO: {
        actId: "",
        actName: "",
        actNameEn: "",
        actType: "",
        actTaskType: ""
      },
      procCategoryId: "",
      procStatus: 0,
      procVersion: "",
      pscModelOldId: "",
      procUseStatus: -1,
      //判断流程模板是流程集内还是流程模板管理内
      wfTemplateStatusId: null,
      processColleCategoryId: "",
      headersOptions: {
        menuCode: sessionStorage.getItem("menuCode")
      },
      simulationForm:{
        testType:null,
      },
      dialogVisible:false,
    };
  },

  computed: {
    /**
     * 组件外接的按钮，需根据不同模式显示/隐藏
     */
    externalBtns() {
      let mode = this.bpmnDesigner.mode;
      let btns = [];
      if (mode == "create" || mode == "update" || mode == "copy") {
        // 创建模式/修改模式/复制模式：导入模型、撤销、恢复、保存草稿、发布、配置
        btns = [
          "importBpmnModel",
          "backBpmn",
          "redoBpmn",
          "saveProcModel",
          "publishProcModel",
          "configProcModel"
        ];
      } else if (mode == "readonly") {
        // 只读模式：导出模型、保存配置（查看）
        btns = ["exportBpmnModel", "updateProcModelConfig"];
      } else if (mode == "updateConfig") {
        // （发布后）修改设置模式：导出模型、保存配置
        btns = ["exportBpmnModel", "updateProcModelConfig","runTest"];
      }
      return btns;
    },
    // 通过store实现流程配置数据的传递
    procData() {
      return this.$store.state.workflow.procData;
    }
  },
  mounted() {
    let that = this;
    //获取授权信息
    this.getFwAuth();
    //初始化参数
    if (
      this.$route.query &&
      this.$route.query.opAct &&
      this.$route.query.opAct === "add"
    ) {
      // 添加流程图
      this.procCategoryId = this.$route.query.categoryId;
      this.procStatus = wfConstant.procStatus.saveProcDraft;
      this.bpmnDesigner.categoryName = this.$route.query.categoryPath;
      this.bpmnDesignerExt.procModel.categoryName = this.$route.query.categoryPath;
      //初始化流程设计器
      this.bpmnDesigner.mode = "create";
    } else if (
      this.$route.query &&
      this.$route.query.opAct &&
      this.$route.query.opAct === "upd"
    ) {
      // 修改流程图
      this.procCategoryId = this.$route.query.categoryId;
      this.procStatus = JSON.parse(this.$route.query.processData).procStatus;
      this.procVersion = JSON.parse(this.$route.query.processData).procVersion;
      this.pscModelId = JSON.parse(this.$route.query.processData).pscModelId;
      if (
        JSON.parse(this.$route.query.processData).pscModelOldId &&
        JSON.parse(this.$route.query.processData).pscModelOldId != ""
      ) {
        this.pscModelOldId = JSON.parse(
          this.$route.query.processData
        ).pscModelOldId;
      } else {
        this.pscModelOldId = JSON.parse(
          this.$route.query.processData
        ).pscModelId;
      }
      //初始化流程设计器
      this.bpmnDesigner.mode = "update";
      if (
        JSON.parse(this.$route.query.processData) &&
        JSON.parse(this.$route.query.processData).pscModelId &&
        JSON.parse(this.$route.query.processData).pscModelId != ""
      ) {
        this.bpmnDesigner.procModelId = JSON.parse(
          this.$route.query.processData
        ).pscModelId;
        this.bpmnDesigner.procDefId = JSON.parse(
          this.$route.query.processData
        ).procId;
        this.bpmnDesigner.categoryName = this.$route.query.categoryPath;
        this.bpmnDesignerExt.procModel.categoryName = this.$route.query.categoryPath;
        // this.bpmnDesignerExt.procModel.procVersion = JSON.parse(this.$route.query.processData).procVersion;
      }
    } else if (
      this.$route.query &&
      this.$route.query.opAct &&
      this.$route.query.opAct === "config"
    ) {
      // 配置流程图
      this.procCategoryId = this.$route.query.categoryId;
      this.procStatus = this.$route.query.procStatus;
      //初始化流程设计器
      this.bpmnDesigner.mode = "updateConfig";
      if (
        JSON.parse(this.$route.query.processData) &&
        JSON.parse(this.$route.query.processData).pscModelId &&
        JSON.parse(this.$route.query.processData).pscModelId != ""
      ) {
        this.bpmnDesigner.procModelId = JSON.parse(
          this.$route.query.processData
        ).pscModelId;
        this.bpmnDesigner.procDefId = JSON.parse(
          this.$route.query.processData
        ).procId;
        this.bpmnDesigner.version = JSON.parse(
          this.$route.query.processData
        ).procVersion;
        this.bpmnDesigner.categoryName = this.$route.query.categoryPath;
        this.bpmnDesignerExt.procModel.categoryName = this.$route.query.categoryPath;
        // 获取流程配置数据
        if (
          this.bpmnDesigner.procDefId &&
          this.bpmnDesigner.procDefId != "" &&
          this.bpmnDesigner.version &&
          this.bpmnDesigner.version != ""
        ) {
          let postParam = {};
          postParam.procId = this.bpmnDesigner.procDefId;
          postParam.procVersion = this.bpmnDesigner.version;
          api
            .getWorkflowTemplByUIAPI(postParam)
            .then(result => {
              if (result.code != "0") {
                that.$message({
                  message: result.msg,
                  type: "warning"
                });
              } else {
                this.processTemplateData = result.data;
              }
            })
            .catch(error => {
              cmsg.httpCatchErrorMessage(that);
            });
        }
      }
    } else if (
      this.$route.query &&
      this.$route.query.opAct &&
      this.$route.query.opAct === "copy"
    ) {
      // 修改流程图
      this.procCategoryId = this.$route.query.categoryId;
      this.procStatus = JSON.parse(this.$route.query.processData).procStatus;
      this.procVersion = JSON.parse(this.$route.query.processData).procVersion;
      this.pscModelId = JSON.parse(this.$route.query.processData).pscModelId;
      if (
        JSON.parse(this.$route.query.processData).pscModelOldId &&
        JSON.parse(this.$route.query.processData).pscModelOldId != ""
      ) {
        this.pscModelOldId = JSON.parse(
          this.$route.query.processData
        ).pscModelOldId;
        this.procUseStatus = JSON.parse(
          this.$route.query.processData
        ).procUseStatus;
        //初始化流程设计器
        this.bpmnDesigner.mode = "copy";
        if (
          JSON.parse(this.$route.query.processData) &&
          JSON.parse(this.$route.query.processData).pscModelId &&
          JSON.parse(this.$route.query.processData).pscModelId != ""
        ) {
          this.bpmnDesigner.procModelId = JSON.parse(
            this.$route.query.processData
          ).pscModelId;
          this.bpmnDesigner.procDefId = JSON.parse(
            this.$route.query.processData
          ).procId;
          this.bpmnDesigner.categoryName = this.$route.query.categoryPath;
          this.bpmnDesignerExt.procModel.categoryName = this.$route.query.categoryPath;
          this.bpmnDesigner.sourceProcModelId = JSON.parse(
            this.$route.query.processData
          ).pscModelOldId;
        }
      } else {
        this.$message({
          showClose: true,
          message: this.$t("wm.not_copy_temp"),
          type: "warning"
        });
        this.$router.push({ path: "workflow_temp_manage" });
      }
    } else if (
      this.$route.query &&
      this.$route.query.opAct &&
      this.$route.query.opAct === "addWFColleTemplate"
    ) {
      // 添加流程图
      this.wfTemplateStatusId = this.$route.query.processColleId;
      this.processColleCategoryId = this.$route.query.processColleCategoryId;
      //初始化流程设计器
      this.bpmnDesigner.mode = "create";
    } else if (
      this.$route.query &&
      this.$route.query.opAct &&
      this.$route.query.opAct === "updWFColleTemplate"
    ) {
      // 修改流程图
      this.procStatus = JSON.parse(this.$route.query.processData).procStatus;
      this.procVersion = JSON.parse(this.$route.query.processData).procVersion;
      this.pscModelId = JSON.parse(this.$route.query.processData).pscModelId;
      if (
        JSON.parse(this.$route.query.processData).pscModelOldId &&
        JSON.parse(this.$route.query.processData).pscModelOldId !== ""
      ) {
        this.pscModelOldId = JSON.parse(
          this.$route.query.processData
        ).pscModelOldId;
      } else {
        this.pscModelOldId = JSON.parse(
          this.$route.query.processData
        ).pscModelId;
      }
      this.wfTemplateStatusId = this.$route.query.processColleId;
      this.processColleCategoryId = this.$route.query.processColleCategoryId;
      //初始化流程设计器
      this.bpmnDesigner.mode = "update";
      if (
        JSON.parse(this.$route.query.processData) &&
        JSON.parse(this.$route.query.processData).pscModelId &&
        JSON.parse(this.$route.query.processData).pscModelId != ""
      ) {
        this.bpmnDesigner.procModelId = JSON.parse(
          this.$route.query.processData
        ).pscModelId;
        this.bpmnDesigner.procDefId = JSON.parse(
          this.$route.query.processData
        ).procId;
      }
    } else if (
      this.$route.query &&
      this.$route.query.opAct &&
      this.$route.query.opAct === "updWFColleTemplateConfig"
    ) {
      // 配置流程图
      this.procStatus = JSON.parse(this.$route.query.processData).procStatus;
      this.wfTemplateStatusId = this.$route.query.processColleId;
      this.processColleCategoryId = this.$route.query.processColleCategoryId;
      //初始化流程设计器
      this.bpmnDesigner.mode = "updateConfig";
      if (
        JSON.parse(this.$route.query.processData) &&
        JSON.parse(this.$route.query.processData).pscModelId &&
        JSON.parse(this.$route.query.processData).pscModelId != ""
      ) {
        this.bpmnDesigner.procModelId = JSON.parse(
          this.$route.query.processData
        ).pscModelId;
        this.bpmnDesigner.procDefId = JSON.parse(
          this.$route.query.processData
        ).procId;
        this.bpmnDesigner.version = JSON.parse(
          this.$route.query.processData
        ).procVersion;
        // 获取流程配置数据
        if (
          this.bpmnDesigner.procDefId &&
          this.bpmnDesigner.procDefId != "" &&
          this.bpmnDesigner.version &&
          this.bpmnDesigner.version != ""
        ) {
          let postParam = {};
          postParam.procId = this.bpmnDesigner.procDefId;
          postParam.procVersion = this.bpmnDesigner.version;
          postParam.pscModelId = this.bpmnDesigner.procModelId;
          wfColleTemplateAPI
            .getProcTemplate(postParam)
            .then(result => {
              if (result.code !== "0") {
                that.$message({
                  message: result.msg,
                  type: "warning"
                });
              } else {
                this.processTemplateData = result.data;
              }
            })
            .catch(error => {
              cmsg.httpCatchErrorMessage(that);
            });
        }
      }
    } else {
      this.$message({
        showClose: true,
        message: this.$t("wm.not_operate_temp"),
        type: "warning"
      });
      this.$router.push({ path: "workflow_temp_manage" });
    }
  },

  methods: {
    getCurrentUserCode() {
      let user = sessionStorage.getItem("user");
      if (user && user.length > 0) {
        let reg = /(\[).+(\])/g;
        let result = user.match(reg);
        if (result.length > 0) {
          return result[0].replace("[", "").replace("]", "");
        }
      }
      return "";
    },
    getCurrentUserName() {
      let user = sessionStorage.getItem("user");
      if (user && user.length > 0) {
        let reg = /(\]).+/g;
        let result = user.match(reg);
        if (result.length > 0) {
          return result[0].replace("[", "").replace("]", "");
        }
      }
      return "";
    },
    //获取流程图的mode
    getWFDesignOpt() {
      if (
        this.$route.query &&
        this.$route.query.opAct &&
        this.$route.query.opAct === "add"
      ) {
        return "create";
      } else if (
        this.$route.query &&
        this.$route.query.opAct &&
        this.$route.query.opAct === "upd"
      ) {
        return "update";
      } else {
        this.$message({
          showClose: true,
          message: this.$t("wm.not_operate_temp"),
          type: "warning"
        });
        this.$router.push({ path: "workflow_temp_manage" });
      }
    },
    getFwAuth() {
      let param = {};
      api.postWfAuthAPI(param).then(res => {
        if (res.code === "0") {
          let data = res.data;
          this.bpmnDesigner.accessToken = data.accessToken; // 访问Token，必填
          this.bpmnDesigner.tenantId = data.tenantId; // 租户ID
          this.bpmnDesigner.appId = data.appId; // 应用ID，必填
        } else {
          _this.$message({
            message: res.msg,
            type: "warning"
          });
        }
      });
    },
    onBpmnElementEvent({ event, element }) {
      // 若"是修改配置模式 and 双击元素"，则打开设定弹窗
      if (
        this.bpmnDesigner.mode == "updateConfig" &&
        event == "element.dblclick"
      ) {
        //开启遮罩
        let loading = this.$loading({
          target: "el-main",
          lock: true,
          text: "加载中",
          spinner: "el-icon-loading",
          background: "rgba(0, 0, 0, 0.7)"
        });
        if (
          this.bpmnDesigner.procModelId &&
          this.bpmnDesigner.procModelId != ""
        ) {
          let param = {};
          param.pscModelId = this.bpmnDesigner.procModelId;
          param.procId = this.bpmnDesigner.procDefId;
          param.procVersion = this.bpmnDesigner.version;
          let that = this;
          api
            .initWfConfigInfo(param)
            .then(result => {
              if (result.code != "0") {
                console.log("获取流程设计发布阶段内容失败！");
                //关闭遮罩
                loading.close();
                that.$message({
                  message: result.msg,
                  type: "warning"
                });
              } else {
                console.log("获取流程设计发布阶段内容成功！");
                that.$store.commit("clearAllActDefStatus", true);
                that.bpmnDesignerExt.procModel.procConfigModel = result.data;
                that.bpmnDesignerExt.settingDialog.selectedElementId =
                  element.id;
                that.bpmnDesignerExt.settingDialog.isOpen = true;
                that.$refs.settingDialog.procColleStatus =
                  that.wfTemplateStatusId;
                //关闭遮罩
                loading.close();
              }
            })
            .catch(error => {
              cmsg.httpCatchErrorMessage(that);
            });
        } else {
          //关闭遮罩
          loading.close();
          this.$message({
            message: this.$t("wm.not_psc_temp"),
            type: "warning"
          });
        }
        //pscModelId
      }
    },

    /**
     * 获取可设置元素列表
     */
    getSettingElements() {
      // this.$route.query.item 获取编辑数据
      // this.$refs.bpmn.getSettingElements = this.$route.query.item;
      return this.$refs.bpmn.getSettingElements();
    },
    /**
     * 修改元素属性
     */
    updateElementAttr(elementId, attrs) {
      return this.$refs.bpmn.updateElementAttr(elementId, attrs);
    },

    /**
     * 导出Bpmn模型
     */
    exportBpmnModel() {
      this.bpmnDesignerExt.showProcDefForm = false;
      this.fullscreenLoading = true;
      this.$refs.bpmn.exportBpmnModel();
      this.fullscreenLoading = false;
    },

    /**
     * 导入Bpmn模型
     */
    importBpmnModel(file) {
      this.$refs.bpmn.importBpmnModel(file);
      return false;
    },

    /**
     * Bpmn操作撤回
     */
    backBpmn() {
      this.bpmnDesignerExt.showProcDefForm = false;
      this.$refs.bpmn.backBpmn();
    },

    /**
     * Bpmn操作前进
     */
    redoBpmn() {
      this.bpmnDesignerExt.showProcDefForm = false;
      this.$refs.bpmn.redoBpmn();
    },

    /**
     * 保存流程模型
     */
    saveProcModel() {
      let that = this;
      // 环节名称超长限制
      let flag;
      let actNameArr = this.$refs.bpmn.$refs.canvas.innerText.split("\n");
      actNameArr.forEach(item => {
        let str = item.split("");
        if (str.length > 25) {
          flag = true;
        }
      });
      if (!flag) {
        that.$refs.procDefForm.validate(valid => {
          // 若验证失败，则打开弹窗显示验证信息，并直接返回
          if (!valid) {
            that.bpmnDesignerExt.showProcDefForm = true;
            return false;
          }
          // 否则保存流程模型表单
          that.bpmnDesignerExt.showProcDefForm = false;
          that.$refs.bpmn.saveProcModel(procModel => {
            //TODO 缺少错误补偿机制
            that._processHandler(procModel, "saveProcDraft");
          });
        });
      } else {
        this.$message.warning("环节名称仅限25个字符,请重新输入");
      }
    },

    /**
     * 发布流程模型
     */
    publishProcModel() {
      const loading = this.$loading({
        target: "el-main",
        lock: true,
        text: "加载中",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)"
      });
      let that = this;
      that.$refs.procDefForm.validate(valid => {
        loading.close();
        // 若验证失败，则打开弹窗显示验证信息，并直接返回
        let checkFlag = true;
        if (!valid) {
          that.bpmnDesignerExt.showProcDefForm = true;
          checkFlag = false;
        }
        if (checkFlag === true) {
          // 否则发布流程模型表单
          that.bpmnDesignerExt.showProcDefForm = false;
          //查询流程模板在PSC中的状态
          api
            .searchPSCProcessContent({
              pscModelId: that.bpmnDesigner.procModelId
            })
            .then(res => {
              if (res.data.status === 0) {
                // 先保存流程模板，用于处理在流程编辑状态下修改了流程环节名称
                //that.$refs.bpmn.saveProcModel((procModel) => {
                // 保存成功后在发布流程模板
                that.$refs.bpmn.publishProcModel(procModel => {
                  that._processHandler(procModel, "publishProcDraft");
                  that.$message.success(this.$t("wm.publish_success"));
                  //TODO 缺少错误补偿机制
                  //TODO 对于是版本一的情况下需要设置当前为激活版本
                  // 发布后切换至修改配置模式
                  // that.bpmnDesigner.mode = "updateConfig";
                  // that.$refs.bpmn.switchBpmnByMode(that.bpmnDesigner.mode);
                });
                //});
              } else {
                if (that.procStatus != 0) {
                  // 发布状态升版本
                  that.$refs.bpmn.publishProcModel(procModel => {
                    that._processHandler(procModel, "publishProcDraft");
                    that.$message.success(this.$t("wm.publish_success"));
                    //TODO 缺少错误补偿机制
                    //TODO 对于是版本一的情况下需要设置当前为激活版本
                    // 发布后切换至修改配置模式
                    // that.bpmnDesigner.mode = "updateConfig";
                    // that.$refs.bpmn.switchBpmnByMode(that.bpmnDesigner.mode);
                  });
                } else {
                  // psc状态为发布状态，当前流程为草稿状态
                  let procModel = {
                    appId: res.data.appId,
                    categoryName: res.data.categoryName,
                    procDefId: res.data.procId,
                    procDefCode: res.data.procDefCode,
                    procDefName: res.data.procName,
                    procDefEnName: res.data.procDefEnName,
                    procDefDescription: res.data.procDescription,
                    procModelId: res.data.id,
                    modelStatus: res.data.status,
                    modelFormUrl: res.data.formUrl,
                    version: res.data.version
                  };
                  that._processHandler(procModel, "publishProcDraft");
                }
              }
            });
        }
      });
    },

    /**
     * 保存流程模型配置
     */
    updateProcModelConfig() {
      let that = this;
      let param = {};
      param.pscModelId = this.bpmnDesigner.procModelId;
      const loading = this.$loading({
        target: "el-main",
        lock: true,
        text: "加载中",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)"
      });
      api
        .getWorkflowTemplByUIAPI(param)
        .then(result => {
          if (result.code != "0") {
            loading.close();
            console.log("获取流程配置发布阶段内容失败！");
            that.$message({
              message: result.msg,
              type: "warning"
            });
          } else {
            if (result.data["procDef"].procStatus === 2) {
              that.$message({
                message: "请保存每个环节配置再进行发布！",
                type: "warning"
              });
              loading.close();
              return;
            }
            loading.close();
            let flag = that.$refs.settingDialog.validateSubmit(result.data);
            if (flag) {
              that.processTemplateData = result.data;
              let continueFlag = true;
              that.bpmnDesignerExt.showProcDefForm = false;
              let publishActsData = that.processTemplateData.actDef; //this.$store.state.workflow.actData
              let wfNodes = that.$refs.bpmn.getSettingElements();
              console.log(wfNodes, "wfNodes");
              for (let i = 0; i < wfNodes.length; i++) {
                let node = wfNodes[i];
                let actData = publishActsData[node.actId][0].actDefData;
                if (actData && actData.actId != "") {
                  node.name = actData.actName;
                  node.enName = actData.actNameEn;
                  node.taskType = actData.actTaskType;
                  console.log(actData.actSubProcInfo, "actData.actSubProcInfo");
                  if (actData.actSubProcInfo.subProcConfigDtoList !== null) {
                    if (
                      actData.actSubProcInfo.subProcConfigDtoList.length !== 0
                    ) {
                      node.isSubProcessInitiate = "1";
                      node.subProcessInitiates = [];
                      actData.actSubProcInfo.subProcConfigDtoList.forEach(
                        item => {
                          node.subProcessInitiates.push({
                            procId: item.subProcId,
                            procName: item.subProcName,
                            triggerDescribe: ""
                          });
                        }
                      );
                    }
                  } else {
                    node.isSubProcessInitiate = "0";
                    node.subProcessInitiates = [];
                  }
                  if (actData.actSubProcInfo.subProcRecoveryList !== null) {
                    if (
                      actData.actSubProcInfo.subProcRecoveryList.length !== 0
                    ) {
                      node.isSubProcessRecycle = "1";
                      node.subProcessRecycles = [];
                      actData.actSubProcInfo.subProcRecoveryList.forEach(
                        item => {
                          node.subProcessRecycles.push({
                            procId: item.subProcId,
                            procName: item.subProcName,
                            flowSourceElementId: item.pscElementId
                          });
                        }
                      );
                    }
                  } else {
                    node.isSubProcessRecycle = "0";
                    node.subProcessRecycles = [];
                  }
                  console.log(node, "node");
                  that.$refs.bpmn.updateElementAttr(node.id, node);
                } else {
                  that.$message({
                    message: result.msg,
                    type: "warning"
                  });
                  continueFlag = false;
                  break;
                }
              }
              // 用于中断后续操作
              if (!continueFlag) {
                return;
              }
              that.bpmnDesignerExt.procModel.procDefCode =
                that.processTemplateData.procDef.procCode;
              that.bpmnDesignerExt.procModel.procDefName =
                that.processTemplateData.procDef.procName;
              that.bpmnDesignerExt.procModel.procDefEnName =
                that.processTemplateData.procDef.procNameEn;
              that.bpmnDesignerExt.procModel.procDefDescription =
                that.processTemplateData.procDef.procDesc;
              that.$refs.bpmn.updateProcModelConfig(function(procModel) {
                console.log("保存流程模型配置成功：procModel=", procModel);
                //that.$message.success('保存配置成功');
                //因为已经在弹窗做了保存操作，这个就不再次进行保存，直接进行发布
                // that._processHandler(procModel, 'publishProcConfigDraft')
                that._processHandler(procModel, "publishProcTemplOnlyStatus");
              });
            }
          }
        })
        .catch(error => {
          cmsg.httpCatchErrorMessage(that);
        });
    },

    _updateProcModelConfig() {
      this.bpmnDesignerExt.procModel.procDefCode = this.procData.procCode;
      this.bpmnDesignerExt.procModel.procDefName = this.procData.procName;
      this.bpmnDesignerExt.procModel.procDefEnName = this.procData.procNameEn;
      this.bpmnDesignerExt.procModel.procDefDescription = this.procData.procDesc;
      this.$refs.bpmn.updateProcModelConfig(function(procModel) {
        console.log("保存流程模型配置成功：procModel=", procModel);
        this.$message.success(this.$t("wm.save_psc_success"));
      });
    },

    _buildActRouter(currentActId, nextTasks) {
      let actsRouter = [];
      if (!nextTasks) {
        return null;
      }
      nextTasks.forEach((nextTask, index) => {
        let actRouter = {};
        actRouter.toActId = nextTask.actId;
        actRouter.actRoutePriority = 0;
        actRouter.actRouteOrder = index + 1;
        if (nextTasks.length === 1) {
          actRouter.isActRouteDefault = 1;
        } else {
          actRouter.isActRouteDefault = 0;
        }
        actsRouter.push(actRouter);
      });
      return actsRouter;
    },
    // 构建在设计模式下的流程对象
    _buildWFDesignModel(procModel, procOpt) {
      let that = this;
      //创建流程对象
      that.procTemplVO.procId = procModel.procDefId;
      if (!procModel.version || procModel.version === "") {
        if (that.procVersion != "" && that.procVersion != "SnapVer") {
          if (that.procVersion.indexOf("SnapVer") < 0) {
            that.procTemplVO.procVersion = that.procVersion + "-SnapVer";
          } else {
            that.procTemplVO.procVersion = that.procVersion;
          }
        } else {
          that.procTemplVO.procVersion = "SnapVer";
        }
      } else {
        that.procTemplVO.procVersion = procModel.version;
      }
      that.procTemplVO.procName = procModel.procDefName;
      that.procTemplVO.procNameEn = procModel.procDefEnName;
      that.procTemplVO.procCategoryId = that.procCategoryId;
      that.procTemplVO.pscModelId = procModel.procModelId;
      that.procTemplVO.procStatus = that.procStatus;
      if (!that.pscModelOldId || that.pscModelOldId == "") {
        that.procTemplVO.pscModelOldId = procModel.procModelId;
      } else {
        if (procModel.procModelId != that.pscModelId) {
          that.procTemplVO.pscModelOldId = that.pscModelId;
        } else {
          that.procTemplVO.pscModelOldId = that.pscModelOldId;
        }
      }
      that.procTemplVO.actDef = [];
      let wfNodes = that.$refs.bpmn.getSettingElements();
      console.log("-----wfNodes-----", wfNodes);
      let actVOArray = [];
      //创建环节对象
      wfNodes.forEach((wfNode, ind) => {
        let actPreConfigList = [];
        let actVO = {};
        if (
          procOpt === "publishProcDraft" ||
          procOpt === "saveProcConfigDraft" ||
          procOpt === "publishProcConfigDraft"
        ) {
          actVO.actId = wfNode.actId;
        } else {
          actVO.actId = wfNode.id;
        }
        actVO.id = wfNode.id;
        actVO.actName = wfNode.name;
        actVO.actNameEn = "";
        actVO.pscElementId = wfNode.id;

        if (
          wfConstant.actType[wfNode.type] &&
          wfConstant.actType[wfNode.type] != ""
        ) {
          actVO.actType = wfConstant.actType[wfNode.type];
        } else {
          actVO.actType = "";
        }
        // 结束环节没有拿到taskType
        if (actVO.actType == 5) {
          actVO.actTaskType = 1;
        } else {
          actVO.actTaskType = wfNode.taskType;
        }
        //构建路由
        if (procOpt === "publishProcDraft") {
          let actsRouter = that._buildActRouter(wfNode.actId, wfNode.nextTasks);
          if (actsRouter != null) {
            actVO.actRouter = actsRouter;
          }
        }
        let actPreConfig = {
          actId: actVO.actId,
          actConfigName: "默认配置",
          actConfigConditionId: "",
          actConfigConditionContent: "",
          actConfigOrder: 0,
          isActConfigDefault: 1,
          actDefData: actVO
        };
        actPreConfigList.push(actPreConfig);
        actVOArray.push(actPreConfigList);
      });
      let postParam = {};
      postParam.procDef = that.procTemplVO;
      postParam.actDef = actVOArray;
      return postParam;
    },
    //构建流程图保存和发布的对象
    _processHandler(procModel, procOpt) {
      let that = this;
      const loading = this.$loading({
        target: "el-main",
        lock: true,
        text: "加载中",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)"
      });
      if (procModel && procModel.procModelId && procModel.procModelId != "") {
        if (procOpt === "saveProcDraft") {
          //调用保存接口实现
          let postParam = this._buildWFDesignModel(procModel, procOpt);
          postParam.procDef.procStatus = wfConstant.procStatus.saveProcDraft;

          if (that.bpmnDesigner.mode === "copy") {
            postParam.procDef.procUseStatus = wfConstant.procUseStatus.copy;
          }
          if (that.wfTemplateStatusId !== null) {
            //保存流程集内流程模板信息
            postParam.procDef.procCategoryId =
              that.wfTemplateStatusId + that.processColleCategoryId;
            let param = {
              processColleId: that.wfTemplateStatusId,
              procDefAllInfoDto: postParam
            };
            wfColleTemplateAPI
              .addProcColleProcDef(param)
              .then(res => {
                if (res.code !== "0") {
                  loading.close();
                  console.log("保存流程图草稿失败！：procModel=", procModel);
                  that.$message({
                    message: res.msg,
                    type: "warning"
                  });
                } else {
                  loading.close();
                  console.log("保存流程模型成功：procModel=", procModel);
                  that.$message.success(that.$t("wm.save_draft_success"));
                  that.$router.push({
                    path: "workflow_col_design",
                    query: { procColleId: that.wfTemplateStatusId }
                  });
                  that.wfTemplateStatusId = null;
                }
              })
              .catch(error => {
                cmsg.httpCatchErrorMessage(that);
              });
          } else {
            //且当前流程模板状态不为设计草稿状态
            api
              .saveWorkflowDraftAPI(postParam)
              .then(result => {
                if (result.code != "0") {
                  loading.close();
                  console.log("保存流程图草稿失败！：procModel=", procModel);
                  that.$message({
                    message: result.msg,
                    type: "warning"
                  });
                } else {
                  loading.close();
                  console.log("保存流程模型成功：procModel=", procModel);
                  that.$message.success(that.$t("wm.save_draft_success"));
                  that.$router.push({ path: "workflow_temp_manage" });
                }
              })
              .catch(error => {
                cmsg.httpCatchErrorMessage(that);
              });
          }
        } else if (procOpt === "publishProcDraft") {
          // 升版本
          let postParam = this._buildWFDesignModel(procModel, procOpt);
          postParam.procDef.procStatus = wfConstant.procStatus.publishProcDraft;
          postParam.procDef.pscModelOldId = "";
          postParam.procDef.procUseStatus = wfConstant.procUseStatus.common;
          if (
            this.pscModelOldId != procModel.procModelId &&
            this.procStatus == 0 &&
            (this.procVersion.indexOf("-SnapVer") > 0 ||
              this.procUseStatus == wfConstant.procUseStatus.copy)
          ) {
            // 需要升版本操作
            //调用发布接口实现
            if (that.wfTemplateStatusId !== null) {
              //保存流程集内流程模板信息
              postParam.procDef.procCategoryId =
                that.wfTemplateStatusId + that.processColleCategoryId;
              let param = {
                id: this.$route.query.id,
                pubProcDefAllInfoDto: postParam
              };
              wfColleTemplateAPI
                .pubProcDraftUpVersion(param)
                .then(res => {
                  if (res.code !== "0") {
                    loading.close();
                    console.log(
                      "发布升版本流程图失败！：procModel=",
                      procModel
                    );
                    that.$message({
                      message: res.msg,
                      type: "warning"
                    });
                  } else {
                    loading.close();
                    console.log("发布流程图成功：procModel=", procModel);
                    that.$message.success(that.$t("wm.publish_proc_success"));
                    that.$router.push({
                      path: "workflow_col_design",
                      query: { procColleId: that.wfTemplateStatusId }
                    });
                  }
                })
                .catch(error => {
                  cmsg.httpCatchErrorMessage(that);
                });
            } else {
              api
                .upperpublishWorkflowConfigAPI(postParam)
                .then(result => {
                  if (result.code != "0") {
                    loading.close();
                    console.log(
                      "发布升版本流程图失败！：procModel=",
                      procModel
                    );
                    that.$message({
                      message: result.msg,
                      type: "warning"
                    });
                  } else {
                    loading.close();
                    console.log("发布流程图成功：procModel=", procModel);
                    that.$message.success(that.$t("wm.publish_proc_success"));
                    that.$router.push({ path: "workflow_temp_manage" });
                  }
                })
                .catch(error => {
                  cmsg.httpCatchErrorMessage(that);
                });
            }
          } else {
            if (that.wfTemplateStatusId !== null) {
              //发布流程集内流程模板信息
              postParam.procDef.procCategoryId =
                that.wfTemplateStatusId + that.processColleCategoryId;
              let param = {
                id: this.$route.query.id,
                pubProcDefAllInfoDto: postParam
              };
              wfColleTemplateAPI
                .publishProcessTemplateDraft(param)
                .then(res => {
                  if (res.code !== "0") {
                    loading.close();
                    console.log("发布流程图失败！：procModel=", procModel);
                    that.$message({
                      message: res.msg,
                      type: "warning"
                    });
                  } else {
                    loading.close();
                    console.log("发布流程图成功：procModel=", procModel);
                    that.$message.success(that.$t("wm.publish_proc_success"));
                    that.$router.push({
                      path: "workflow_col_design",
                      query: { procColleId: that.wfTemplateStatusId }
                    });
                    that.wfTemplateStatusId = null;
                  }
                })
                .catch(error => {
                  cmsg.httpCatchErrorMessage(that);
                });
            } else {
              //调用发布接口实现
              api
                .publishWorkflowAPI(postParam)
                .then(result => {
                  if (result.code != "0") {
                    loading.close();
                    console.log("发布流程图失败！：procModel=", procModel);
                    that.$message({
                      message: result.msg,
                      type: "warning"
                    });
                  } else {
                    loading.close();
                    console.log("发布流程图成功：procModel=", procModel);
                    that.$message.success(that.$t("wm.publish_proc_success"));
                    that.$router.push({ path: "workflow_temp_manage" });
                  }
                })
                .catch(error => {
                  cmsg.httpCatchErrorMessage(that);
                });
            }
          }
        } else if (procOpt === "saveProcConfigDraft") {
        } else if (procOpt === "publishProcConfigDraft") {
          let param = {};
          param.procId = procModel.procDefId;
          param.procVersion = procModel.version;
          api
            .publishWorkflowConfigAPI(param)
            .then(result => {
              if (result.code != "0") {
                loading.close();
                console.log("发布流程图失败！：procModel=", procModel);
                that.$message({
                  message: result.msg,
                  type: "warning"
                });
              } else {
                loading.close();
                console.log("发布流程图成功：procModel=", procModel);
                that.$message.success(that.$t("wm.publish_proc_success"));
                that.$router.push({ path: "workflow_temp_manage" });
              }
            })
            .catch(error => {
              cmsg.httpCatchErrorMessage(that);
            });
        } else if (procOpt === "publishProcTemplOnlyStatus") {
          let param = {};
          param.procId = procModel.procDefId;
          param.procVersion = procModel.version;
          param.verifyOrNot = 0;
          api
            .pubProcTemplOnlyStatus(param)
            .then(result => {
              if (result.code != "0") {
                loading.close();
                console.log("发布流程图失败！：procModel=", procModel);
                that.$message({
                  message: result.msg,
                  type: "warning"
                });
              } else {
                loading.close();
                console.log("发布流程图成功：procModel=", procModel);
                that.$message.success(that.$t("wm.publish_proc_success"));
                that.$router.push({ path: "workflow_temp_manage" });
              }
            })
            .catch(error => {
              cmsg.httpCatchErrorMessage(that);
            });
        } else {
          loading.close();
          that.$message({
            message: that.$t("wm.not_operate_temp"),
            type: "warning"
          });
        }
      } else {
        loading.close();
        that.$message({
          message: that.$t("wm.not_psc_temp"),
          type: "warning"
        });
      }
    },
    selectTestType(){
      this.dialogVisible = true;
    },
    simulationTest(){
      let date = new Date();

      let year = date.getFullYear();
      let month = date.getMonth() + 1;
      let monthStr = month < 10 ? "0" + month : month;
      let data = date.getDate()
      let dataStr = data < 10 ? "0" + data : data;
      let hours = date.getHours();
      let hoursStr = hours < 10 ? "0" + hours : hours;
      let minutes = date.getMinutes()
      let minutesStr = minutes < 10 ? "0" + minutes : minutes;
      let seconds = date.getSeconds();
      let secondsStr = seconds < 10 ? "0" + seconds : seconds;
      let milliseconds = date.getMilliseconds();
      let code = ""+year+monthStr+dataStr+hoursStr+minutesStr+secondsStr+milliseconds;
      let name = this.bpmnDesignerExt.procModel.procDefName+"-"+code;

      let param = {
        procTestCode:code,
        procTestName:name,
        procId:this.bpmnDesigner.procDefId,
        procVersion:this.bpmnDesigner.version,
        procTestType:this.simulationForm.testType
      }
      simulation.saveProcessTestInfo(param).then((result) => {
        // console.log(param);
        // console.log(result);
        if(result.code == 0){
          this.$router.push({path: '/processSimulation/runPage', query: {testType: this.simulationForm.testType,procId:this.bpmnDesigner.procDefId,procVersion:this.bpmnDesigner.version,procTestId:result.data,procName:this.bpmnDesignerExt.procModel.procDefName}});
        }
      })
    }
  }
};
