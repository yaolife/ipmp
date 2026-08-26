<template>
  <div
    class="customFlow"
    ref="customFlow"
    v-loading.fullscreen.lock="fullLoading"
  >
    <el-collapse v-model="activeNames">
      <el-collapse-item
        name="1"
        title="流程基本信息"
        class="baseInfoCollapseItem"
      >
        <customFlow-process-base-info
          v-model="form.baseInfo"
          :rowSpan="12"
          :workThemeCanEdit="false"
        />
      </el-collapse-item>
      <el-collapse-item name="2" title="我的表单">
        <el-form ref="form" :model="form" label-width="120px">
          <el-row>
            <el-col :span="12">
              <el-form-item label="名称">
                <el-input
                  size="small"
                  v-model="form.customFormMasterDto.name"
                ></el-input> </el-form-item
            ></el-col>
            <el-col :span="12">
              <el-form-item label="编码">
                <el-input
                  size="small"
                  v-model="form.customFormMasterDto.code"
                ></el-input> </el-form-item></el-col
          ></el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="开始时间">
                <el-date-picker
                  size="small"
                  v-model="form.customFormMasterDto.startData"
                  type="date"
                  placeholder="选择日期"
                >
                </el-date-picker> </el-form-item
            ></el-col>
            <el-col :span="12">
              <el-form-item label="结束时间">
                <el-date-picker
                  size="small"
                  v-model="form.customFormMasterDto.endDate"
                  type="date"
                  placeholder="选择日期"
                >
                </el-date-picker> </el-form-item></el-col
          ></el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="金额">
                <el-input
                  type="number"
                  size="small"
                  v-model="form.customFormMasterDto.je"
                ></el-input> </el-form-item></el-col
          ></el-row>
        </el-form>
      </el-collapse-item>
      <el-collapse-item name="3" title="流程附件">
        <customFlow-proc-attachment
          :enableAdd="true"
          v-model="form.attachment"
          :procActName="form.baseInfo.currentLink"
          @input="upLoadAttachment"
        />
      </el-collapse-item>
      <el-collapse-item
        name="4"
        v-if="$route.query.procNode !== '1'"
        title="审批日志"
      >
        <customFlow-journal />
      </el-collapse-item>
      <el-collapse-item
        name="5"
        title="审批意见"
        v-if="$route.query.procNode !== '1'"
      >
        <customFlow-comment
          ref="comment"
          :currentLink="form.baseInfo.currentLink"
        />
      </el-collapse-item>
    </el-collapse>
    <!-- 流程工具条 -->
    <customFlow-examine-tool
      :buttons="buttons"
      @onReset="onReset"
      @onSave="onSave"
      @onPrint="onPrint"
      @onProcDiagram="onProcDiagram"
      @onHaveRead="onHaveRead"
      @onConcern="onConcern"
      @onCancelConcern="onCancelConcern"
      @onSendBack="onSendBack"
      @onTransition="onTransition"
      @offEntrust="offEntrust"
      @onEntrust="onEntrust"
      @onCancellation="onCancellation"
      @onInitiate="onInitiate"
      @onSubmit="onSubmit"
    />
    <!-- 查看流程图弹窗 -->
    <el-dialog
      class="task-dialog task-submit-dialog body-fullscreen-dialog"
      :title="$t('cgnTask.operate.viewFlowChart')"
      append-to-body
      :withHeader="false"
      :visible.sync="configflowDialogVisible"
      :fullscreen="false"
      direction="rtl"
      destroy-on-close
      :close-on-press-escape="false"
      :wrapperClosable="false"
      v-dragMove="{
        DragButton: '.el-dialog__header',
        DragWindow: '.el-dialog'
      }"
    >
      <cgn-bpmn-map ref="bpmn" v-bind="flowVO" v-if="configflowDialogVisible">
      </cgn-bpmn-map>
      <div
        slot="footer"
        align="center"
        style="position: fixed; bottom: 15px; right: 0; left: 0; margin: auto"
      >
        <el-button
          @click="configflowDialogVisible = false"
          color="#fff"
          size="small"
        >
          {{ $t("workbench.closeProcess") }}
        </el-button>
      </div>
    </el-dialog>
    <task-read-dialog
      v-if="taskReadDialog.isOpen"
      v-bind="taskReadDialog"
      @closeDialog="closeTaskReadDialog"
    >
    </task-read-dialog>
    <cgn-task-toolbar
      v-if="toolbar"
      v-bind="taskToolbar"
      @submitSuccess="onToolbarSubmitSuccess"
      @closeDialog="closeDialog"
      :ccShow="taskToolbar.ccShow"
      :emailMessageShow="taskToolbar.emailMessageShow"
      :shortMessageShow="taskToolbar.shortMessageShow"
      :dingMessageShow="taskToolbar.dingMessageShow"
      :emailMessageTrue="taskToolbar.emailMessageTrue"
      :shortMessageTrue="taskToolbar.shortMessageTrue"
      :dingMessageTrue="taskToolbar.dingMessageTrue"
      :messageAllHide="taskToolbar.messageAllHide"
      :printConfig="taskToolbar.printConfig"
      :dialogAutoSubmit="taskToolbar.dialogAutoSubmit"
      @saveFn="saveFn"
    ></cgn-task-toolbar>
  </div>
</template>

<script>
import { Filters } from "@/utils/Utils";
import api from "./api";
import customFlowProcessBaseInfo from "./components/customFlow-process-base-info";
import customFlowJournal from "./components/customFlow-journal";
import customFlowComment from "./components/customFlow-comment";
import customFlowExamineTool from "./components/customFlow-examine-tool";
import customFlowProcAttachment from "./components/customFlow-proc-attachment";
import { CgnBpmnMap, CgnBpmnDesigner } from "psc-module";
import CgnTaskToolbar from "@/components/cgnTask/Toolbar";
export default {
  name: "customFlow",
  components: {
    customFlowProcessBaseInfo,
    customFlowJournal,
    customFlowComment,
    customFlowExamineTool,
    CgnBpmnMap,
    CgnBpmnDesigner,
    CgnTaskToolbar,
    customFlowProcAttachment
  },
  data() {
    return {
      toolbar: false,
      //会签事项名称配置
      scItemCofList: [],
      fullLoading: false,
      // 折叠栏激活状态
      activeNames: ["1", "2", "3", "4", "5"],
      // 表单信息
      form: {
        baseInfo: {
          workTheme: "",
          processName: "",
          priority: "0",
          createUser: "",
          createDateTime: "",
          currentLink: ""
        },
        customFormMasterDto: {
          name: "",
          code: "",
          je: "",
          startData: "",
          endDate: "",
          id: ""
        },
        attachment: []
      },
      backMode: null,
      procInfo: null,
      targetActList: null,
      dataKey: "",
      initData: null,
      buttons: [
        { buttonName: "查看流程图", buttonType: "VIEW_FLOWCHART_BUTTON" },
        { buttonName: "保存", buttonType: "SAVE_BUTTON" },
        { buttonName: "打印", buttonType: "PRINT_BUTTON" },
        { buttonName: "作废", buttonType: "DELETE_BUTTON" },
        { buttonName: "抄送", buttonType: "COPY_BUTTON" },
        { buttonName: "转办", buttonType: "TRANSFER_BUTTON" },
        { buttonName: "委托", buttonType: "ENTRUST_BUTTON" },
        { buttonName: "取消委托", buttonType: "CANCEL_ENTRUST_BUTTON" },
        { buttonName: "退回", buttonType: "RETURN_BUTTON" },
        { buttonName: "发起", buttonType: "START_PROC_BUTTON" },
        { buttonName: "提交", buttonType: "COMMIT_PROC_BUTTON" },
        { buttonName: "已阅", buttonType: "READED_BUTTON" },
        { buttonName: "关注", buttonType: "CONCERN_BUTTON" },
        { buttonName: "取消关注", buttonType: "CANCEL_CONCERN_BUTTON" },
        { buttonName: "关闭", buttonType: "CLOSEPAGE_BUTTON" },
        { buttonName: "重置", buttonType: "RESET_BUTTON" }
      ],
      configflowDialogVisible: false,
      designerVO: {
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
          userID: "", // 用户id
          userName: "", // 用户名称
          deptID: "", // 部门ID
          deptName: "", // 部门名称
          deptPath: "", // 部门全路径
          postID: "", // 岗位ID
          postName: "" // 岗位名称
        },
        value: {}
      },
      flowVO: {
        pscUrl: envConfig.PSC_ROOT || "/api",
        procInstId: "",
        accessToken: "",
        tenantId: "",
        appId: "",
        procDefId: ""
      },
      taskReadDialog: {
        // 任务已阅弹窗
        isOpen: false,
        procTaskIds: [] // 流程任务ID列表，必填
      },
      taskToolbar: {
        dialogType: "", // 打开窗口类型
        processId: "19088f61-9877-0e92-9f54-3f33f06d999d", // 流程ID，必填
        procInstId: "", // 流程实例ID，审批模式/查看模式必填
        procActInstId: "", // 流程环节实例ID，审批模式/查看模式必填
        procTaskId: "", // 任务ID，审批模式/查看模式必填
        actionUserInfo: {
          // 操作人信息（userID/userName必填）
          userID: "P621122", // 用户id P626341/宋隹燕   P623231/黄振荣
          userName: "张霄", // 用户名称
          deptID: "", // 部门ID
          deptName: "", // 部门名称
          deptPath: "", // 部门全路径
          postID: "", // 岗位ID
          postName: "" // 岗位名称
        },
        backData: {
          approvalAction: "",
          approvalFlg: false,
          goBackActOptions: [],
          isShow: false
        },
        abandonData: {
          comment: ""
        },
        scItemCofList: [], // 会签事项名称配置
        dataUpdateFlag: "",
        ccShow: false, //是否显示抄送
        shortMessageShow: false, // 提交时是否显示短信
        emailMessageShow: false, // 提交时是否显示邮箱
        dingMessageShow: false, // 提交时是否显示鹭钉
        emailMessageTrue: false, // 提交时邮箱是否勾选
        shortMessageTrue: false, // 提交时短信是否勾选
        dingMessageTrue: false, // 提交时鹭钉是否勾选
        messageAllHide: "", // 提交时对应环节通知信息隐藏
        printConfig: "", // 打印模式配置
        dialogAutoSubmit: "" // 预提交弹框自动提交
      }
    };
  },
  created() {
    let obj;
    // 新增页面
    if (this.$route.query.procNode === "1") {
      obj = {
        actId: this.$route.query.actId,
        procNode: this.$route.query.procNode,
        procVersion: this.$route.query.procVersion,
        procId: this.$route.query.procId,
        customForm: 1
      };
    } else {
      obj = {
        actId: this.$route.query.actId,
        procNode: this.$route.query.procNode,
        procVersion: this.$route.query.procVersion,
        procId: this.$route.query.procId,
        customForm: 1,
        procInstId: this.$route.query.procInstId
      };
    }
    //流程初始化
    api.initProcessApi(obj).then(res => {
      if (res.data.code === "0") {
        this.initData = res.data.data;
        if (this.$route.query.procNode === "4") {
          this.initData.flowStatus = "1";
        } else {
          this.initData.flowStatus = "2";
        }
        // 获取流程基本信息数据
        this.form.baseInfo.workTheme =
          res.data.data.procInfo.startUserName +
          "-" +
          res.data.data.procInfo.procDefName;
        this.form.baseInfo.processName = res.data.data.procInfo.procDefName;
        this.form.baseInfo.priority = res.data.data.procInfo.priority;
        this.form.baseInfo.createUser = res.data.data.procInfo.startUserName;
        this.form.baseInfo.createDateTime = res.data.data.procInfo.startTime
          ? res.data.data.procInfo.startTime
          : Filters.timeFormat(new Date(), "yyyy-MM-dd HH:mm:ss");
        if (
          res.data.data.procInfo.attachmentStr &&
          res.data.data.procInfo.attachmentStr !== "[]"
        ) {
          this.form.attachment = JSON.parse(
            res.data.data.procInfo.attachmentStr
          );
        }
        this.form.baseInfo.currentLink = res.data.data.actName;
        if (this.$route.query.procNode !== "1") {
          // 获取自定义表单数据
          api
            .queryByProcInstIdApi({
              procInstId: this.$route.query.procInstId
            })
            .then(_res => {
              console.log(_res, "======2=======");
              this.form.customFormMasterDto =
                _res.data.data.customFormMasterDto;
            });
        }
      }
    });
    this.getHuiQianList();
  },
  methods: {
    //返回
    closeWindow: function(backrouter) {
      //关闭页签
      this.closeTab(backrouter);
    },
    // 提交
    onSubmit() { 
      console.log(this.initData,'this.initData.backMode')
      if (
        // this.dataInfo.flowStatus !== "" && // 邮件进入时,获取不到flowStatus 暂时注释
        this.initData.flowStatus !== "1" &&
        this.$refs.comment.commentText === ""
      ) {
        this.$message.warning(this.$t("cgnTask.tips.submitCommentNotEmpty"));
        return;
      }
      this.fullLoading = true;
      // 提交流程时,是否显示短信,邮件通知按钮.
      this.getEmailShortShow();
      if (this.initData.backMode === 1) {
        if (!this.initData.procInstId) {
          this.initData.procInstId = this.$route.query.procInstId
        }
        if (!this.initData.sentByProcActId) {
          this.initData.sentByProcActId = this.$route.query.sentByProcActId
        }
        if (!this.initData.procTaskId) {
          this.initData.procTaskId = this.$route.query.id
        }
        if (!this.initData.procInfo.comments) {
          this.initData.procInfo.comments = this.$refs.comment ? this.$refs.comment.commentText : ""
        } 
        Object.assign(this.initData,{customForm:1})
        api
          .sendSubmitProcess(this.initData)
          .then(resp => {
            this.fullLoading = false;
            if (resp.code === "0") {
              this.$message.success(
                this.$t("cgnTask.tips.submitProcessSuccess")
              );
              setTimeout(() => {
                this.closeWindow("/office");
              }, 2000);
            } else if (resp.code === "1001") {
              const data = this.getTipData(resp.msg);
            } else {
              this.$message.error(resp.msg);
            }
          })
          .catch(() => {
            this.fullLoading = false;
          });
      } else {
        this.openProcessSubmitDialog();
      }
    },
    // 业务数据保存
    async saveFn(procInstId) {
      let formData = {
        customFormMasterDto: {
          name: this.form.customFormMasterDto.name,
          code: this.form.customFormMasterDto.code,
          je: this.form.customFormMasterDto.je,
          startData: this.form.customFormMasterDto.startData,
          endDate: this.form.customFormMasterDto.endDate,
          id: this.form.customFormMasterDto.id,
          procInstId: procInstId ? procInstId : this.$route.query.procInstId
        }
      };
      let last_res = await api.saveOrUpdateApi({
        formData: JSON.stringify(formData),
        procInstId: formData.customFormMasterDto.procInstId,
        actId: this.$route.query.actId,
        customForm: 1, //自定义表单固定值1
        router: this.$route.path,
        orderNo: "123456789", //根据业务规则生成
        saveDraftsFlag: false
      });
      if (last_res.data.code !== "0") {
        this.$message("提交失败");
      }
    },
    // 保存草稿
    onSave() {
      api
        .saveDraftsApi({
          procInstId:
            this.$route.query.procNode === "1"
              ? null
              : this.$route.query.procInstId,
          procId: this.$route.query.procId,
          procVersion: this.$route.query.procVersion,
          procName: this.initData.procInfo.procDefName,
          procNode: this.$route.query.procNode,
          actId: this.$route.query.actId,
          actCode: this.initData.actCode,
          procCode: this.initData.procCode,
          actName: this.initData.actName,
          flowStatus: 1,
          procInfo: {
            priority: 0,
            workTheme: this.form.baseInfo.workTheme,
            saveDrafts: true,
            comments: this.$refs.comment ? this.$refs.comment.commentText : "",
            attachment: this.form.attachment
          },
          customForm: 1
        })
        .then(res => {
          // 业务数据保存
          let formData = {
            customFormMasterDto: {
              name: this.form.customFormMasterDto.name,
              code: this.form.customFormMasterDto.code,
              je: this.form.customFormMasterDto.je,
              startData: this.form.customFormMasterDto.startData,
              endDate: this.form.customFormMasterDto.endDate,
              id: this.form.customFormMasterDto.id,
              procInstId: res.data.data
            }
          };
          api
            .saveOrUpdateApi({
              formData: JSON.stringify(formData),
              procInstId: formData.customFormMasterDto.procInstId,
              actId: this.$route.query.actId,
              customForm: 1, //自定义表单固定值1
              router: this.$route.path,
              orderNo: "123456789", //根据业务规则生成
              saveDraftsFlag: true
            })
            .then(_res => {
              if (_res.data.code === "0") {
                this.$message.success("保存成功");
                this.$router.back();
              } else {
                this.$message("保存失败");
              }
            });
        });
    },
    // 退回
    onSendBack() {
      console.log(this.initData, "====");
      if (this.initData.backMode === 1) {
        this.$message.success("只能退回一次！");
        return;
      }
      if (!this.$route.query.procInstId) {
        this.$message({ message: "当前环节不能退回！", type: "error" });
        return;
      }
      this.fullLoading = true;
      api
        .queryGoBackActIdSelListApi({
          actId: this.$route.query.actId,
          actName: this.initData.actName,
          procInstId: this.$route.query.procInstId,
          procVersion: this.$route.query.procVersion,
          processId: this.$route.query.procId,
          taskId: this.$route.query.id
        })
        .then(res => {
          this.fullLoading = false;
          if (res.status == 200 && res.data.code == 0) {
            // 如果表单存在审批意见，获取审批意见内的信息给退回意见
            if (this.$refs.comment) {
              if (this.$refs.comment.selectedMode === "1") {
                this.taskToolbar.backData.comment =
                  this.$refs.comment.commentText || "退回,请重新修改";
              } else {
                this.taskToolbar.backData.comment = this.$refs.comment.commentText;
              }
              this.taskToolbar.backData.attachment = this.$refs.comment.attachment;
            }
            this.taskToolbar.backData.isShowComment =
              this.$refs.comment.isShowComment || false;
            this.taskToolbar.backData.goBackActOptions =
              res.data.data.targActList;
            if (res.data.data.backRuleFlag === 0) {
              this.taskToolbar.backData.approvalFlg = true;
            } else {
              this.taskToolbar.backData.approvalFlg = false;
            }
            this.taskToolbar.backData.approvalAction =
              res.data.data.actBackRule;

            // 流程ID
            this.taskToolbar.processId = this.$route.query.procId;
            // 流程实例ID
            this.taskToolbar.procInstId = this.$route.query.procInstId;
            this.taskToolbar.procActInstId = this.$route.query.actInstId;
            this.taskToolbar.procTaskId = this.$route.query.id;
            this.taskToolbar.procVersion = this.$route.query.procVersion;
            this.taskToolbar.procActId = this.$route.query.actId;
            this.taskToolbar.procActName = this.$route.query.actName;
            this.taskToolbar.dialogType = "3";
            this.toolbar = true;
            this.getEmailShortShow();
          } else {
            this.$message.error(res.data.message);
          }
        });
    },
    // 重置
    onReset() {
      this.form.customFormMasterDto.name = "";
      this.form.customFormMasterDto.code = "";
      this.form.customFormMasterDto.je = "";
      this.form.customFormMasterDto.startData = "";
      this.form.customFormMasterDto.endDate = "";
    },
    // 打印
    onPrint() {
      this.$nextTick(() => {
        this.fullLoading = true;
        this.$print(this.$refs.customFlow);
        setTimeout(() => {
          this.fullLoading = false;
        }, 6000);
      });
    },
    // 查看流程图
    onProcDiagram() {
      console.log(">>>>>>>>");
      this.getFwAuth();
    },
    // 获取权限数据,调用后查看流程图
    setProcDiagram() {
      if (
        this.$route.query.procNode === 1 ||
        this.$route.query.flowStatus === 1
      ) {
        this.designerVO.procDefId = this.$route.query.procId;
        // this.designerVO.procModelId = this.dataInfo.pscModelId;
      } else {
        this.flowVO.procDefId = this.$route.query.procId;
        // this.flowVO.procModelId = this.dataInfo.pscModelId;
        if (this.$route.query.procInstId && this.$route.query.flowStatus != 1) {
          this.flowVO.procInstId = this.$route.query.procInstId;
        }
        this.configflowDialogVisible = true;
      }
    },
    // 权限信息取得
    getFwAuth() {
      let _this = this;
      api.postWfAuthAPI().then(res => {
        if (res.code === "0") {
          let data = res.data;
          if (
            this.$route.query.procNode === 1 ||
            this.$route.query.flowStatus === 1
          ) {
            let user = sessionStorage.getItem("user");
            _this.designerVO.tenantId = data.tenantId; // 租户ID
            _this.designerVO.appId = data.appId; // 应用ID，必填
            _this.designerVO.accessToken = data.accessToken; // 访问Token，必填
            // _this.designerVO.pscUrl = "/api";
            if (user.indexOf("[") > -1) {
              let temp = user.split("[")[1];
              temp = temp.split("]");
              let userId = temp[0];
              let userName = temp[1];
              _this.designerVO.actionUserInfo.userID = userId;
              _this.designerVO.actionUserInfo.userName = userName;
            } else {
              _this.designerVO.actionUserInfo.userID = user;
            }
          } else {
            _this.flowVO.tenantId = data.tenantId; // 租户ID
            _this.flowVO.appId = data.appId; // 应用ID，必填
            _this.flowVO.accessToken = data.accessToken; // 访问Token，必填
          }
          _this.setProcDiagram();
        } else {
          _this.$message({
            message: res.msg,
            type: "warning"
          });
        }
      });
    },
    // 已阅
    onHaveRead() {
      this.taskReadDialog.isOpen = true;
    },
    closeTaskReadDialog() {
      this.taskReadDialog.isOpen = false;
    },
    // 关注
    onConcern() {
      const user = this.form.baseInfo.createUser.split("]");
      let params = {
        procInstId: this.$route.query.procInstId,
        procActId: this.$route.query.actId,
        procDefId: this.$route.query.procId,
        procSubject: this.initData.procInfo.procSubject,
        procDefName: this.initData.procInfo.procDefName,
        procActName: this.form.baseInfo.currentLink,
        startUserId: user[0].replace("[", ""),
        startUserName: user[1],
        startTime: this.form.baseInfo.createDateTime
      };
      api
        .addConcernUrl(params)
        .then(result => {
          if (result.data.code == "0") {
            this.$message({
              message: result.data.msg,
              type: "success"
            });
          } else {
            this.$message({
              message: result.data.msg,
              type: "warning"
            });
          }
        })
        .catch(err => {
          this.$message({
            message: err,
            type: "warning"
          });
        });
    },
    // 取消关注
    onCancelConcern() {
      let params = {
        ids: this.$route.query.processInfoId
      };
      api
        .deleteMyConcern(params)
        .then(result => {
          if (result.code == "0") {
            this.$message({
              message: result.msg,
              type: "success"
            });
            this.closeWindow("/concern");
          } else {
            this.$message({
              message: result.msg,
              type: "warning"
            });
          }
        })
        .catch(err => {
          this.$message({
            message: err,
            type: "warning"
          });
        });
    },
    // 转办
    onTransition() {
      this.taskToolbar.procInstId = this.$route.query.procInstId;
      this.taskToolbar.procTaskId = this.$route.query.id;
      this.taskToolbar.procActId = this.$route.query.actId;
      this.taskToolbar.dialogType = "7";
      this.toolbar = true;
      this.getEmailShortShow();
    },
    // 取消委托
    offEntrust() {
      this.taskToolbar.procTaskId = this.$route.query.id;
      this.taskToolbar.procActId = this.$route.query.actId;
      this.taskToolbar.dialogType = "6";
      this.toolbar = true;
    },
    // 委托
    onEntrust() {
      this.taskToolbar.procInstId = this.$route.query.procInstId;
      this.taskToolbar.procTaskId = this.$route.query.id;
      this.taskToolbar.procActId = this.$route.query.actId;
      this.taskToolbar.dialogType = "5";
      this.toolbar = true;
      this.getEmailShortShow();
    },
    // 作废
    onCancellation() {
      if (!this.$route.query.procInstId) {
        this.$message({ message: "当前环节不能作废！", type: "error" });
        return;
      }
      this.fullLoading = true;
      api.queryIsAbandon(this.$route.query).then(res => {
        this.fullLoading = false;
        if (res.data.code === "0") {
          // 流程实例ID
          this.taskToolbar.procInstId = this.$route.query.procInstId;
          this.taskToolbar.processId = this.$route.query.procId;
          this.taskToolbar.procActId = this.$route.query.actId;
          this.taskToolbar.abandonData.comment = this.$t(
            "cudComponents.invalid"
          );
          this.taskToolbar.dialogType = "8";
          this.toolbar = true;
        } else {
          this.fullLoading = false;
          this.$message.error(res.data.msg);
        }
      });
    },
    // 提交后返回
    onBeboreBack() {
      if (window.getPageList) {
        // this.$router.back();
        window.getPageList();
      } else if (window.opener && window.opener.getPageList) {
        window.opener.getPageList();
        window.opener.getPageList = null;
        // window.close();
      } else {
        if (!window.close) {
          this.$router.push("/office");
        } else {
          // 新建浏览器窗口
          if (window.opener && window.opener.refreshAllTaskCount) {
            window.opener.refreshAllTaskCount();
            window.opener.refreshAllTaskCount = null;
          }
          // 创建一个名为 "my_channel" 的广播频道
          const myChannel = new BroadcastChannel("my_channel");
          // 向该频道发送消息
          myChannel.postMessage("refreshOffice");
          // 当完成后断开与频道链接
          myChannel.close();
        }
      }
      //关闭页签
      this.closeTab("/office");
    },
    // 自定义邮件,短信，钉钉显隐、是否默认勾选
    getEmailShortShow() {
      this.taskToolbar.emailMessageTrue = false;
      this.taskToolbar.shortMessageTrue = false;
      this.taskToolbar.dingMessageTrue = false;
    },
    // 流程发起
    onInitiate() {
      if (
        this.form.baseInfo.workTheme === undefined ||
        this.form.baseInfo.workTheme === null ||
        this.form.baseInfo.workTheme === ""
      ) {
        this.$message.warning(this.$t("cgnTask.tips.submitSubjectNotEmpty"));
        return;
      }
      this.fullLoading = true;
      // // 提交流程时,是否显示短信,邮件通知按钮.
      this.getEmailShortShow();
      this.openProcessSubmitDialog();
      return;
    },
    /**
     * 流程工具条提交成功事件
     * @actionName 操作名称。abandonTask-任务作废，ccTask-任务抄送，transferTask-任务转办，detegateTask-任务委托，
     *                      undetegateTask-任务取消委托，sendBackTask-任务退回，readTask-任务已阅，
     *                      startProcess-流程发起，submitProcess-流程提交
     */
    onToolbarSubmitSuccess(actionName, responseData) {
      this.toolbar = false;
      this.onBeboreBack();
    },
    closeDialog() {
      this.toolbar = false;
    },
    openProcessSubmitDialog() {
      // 调用后台获取下一环节审批信息
      Object.assign(this.initData.procInfo, {
        attachment: this.form.attachment //流程附件
      });
      api
        .prepareSubmitApi({
          actId: this.$route.query.actId,
          procNode: this.$route.query.procNode,
          procVersion: this.$route.query.procVersion,
          procId: this.$route.query.procId,
          customForm: 1,
          procInfo: this.initData.procInfo
        })
        .then(res => {
          this.fullLoading = false;
          if (res.data.code === "0") {
            this.taskToolbar.scItemCofList = this.scItemCofList; // 会签事项名称配置
            // 初始化提交组件数据
            this.taskToolbar.submitData = res.data.data;
            this.taskToolbar.submitData.subject = this.form.baseInfo.workTheme;
            this.taskToolbar.submitData.end = res.data.data.end;
            this.taskToolbar.submitData.end = res.data.data.end;
            if (this.$refs.comment) {
              this.taskToolbar.submitData.comment = this.$refs.comment.commentText; 
            }
            // 缓存KEY
            this.taskToolbar.dataKey = res.data.data.dataKey;
            //数据更新标识
            this.taskToolbar.dataUpdateFlag = this.initData.dataUpdateFlag;
            this.taskToolbar.modelName = this.initData.modelName;
            // 流程实例ID
            this.taskToolbar.procInstId = this.$route.query.procInstId;
            console.log(this.initData, "===initData==");
            if (this.$route.query.procInstId && this.initData.flowStatus != 1) {
              // 流程ID
              this.taskToolbar.processId = this.$route.query.procId;
              this.taskToolbar.procActInstId = this.$route.query.actInstId;
              this.taskToolbar.procTaskId = this.$route.query.id;
              this.taskToolbar.dialogType = "2";
            } else {
              const item = JSON.parse(sessionStorage.getItem("procItem")) || {};
              this.taskToolbar.processId = item.procId;
              this.taskToolbar.dialogType = "1";
            }
            this.toolbar = true;
          } else if (res.data.code === "1001") {
            const data = this.getTipData(res.data.msg);
            this.$refs.formPreview.getTipsMessage(data);
          } else {
            this.$alert(res.data.message, this.$t("cm.warning"));
          }
        })
        .catch(err => {
          this.fullLoading = false;
        });
    },
    getHuiQianList() {
      let param = {
        compRdataCode: "SC_ITEM_COF_T",
        compRdataName: "会签事项名称配置表"
      };
      api
        .getDataItemManTableListAPI(param)
        .then(res => {
          if (res.code != "0") {
            this.$message.warning("查询会签事项名称配置表复杂参数错误！");
          } else {
            this.scItemCofList = res.data;
          }
        })
        .catch(error => {
          cmsg.httpCatchErrorMessage(this);
        });
    },
    // 文件上传
    upLoadAttachment(data) {
      this.form.attachment = data;
    }
  }
};
</script>

<style scoped lang="less">
// 必须引入
@import "./css/index.less";
</style>
