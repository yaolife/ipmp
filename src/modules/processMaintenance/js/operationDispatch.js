//引入组件
import breadcrumb from "@/components/common/breadcrumb";
import ApiTask from "@/components/cgnTask/common/ApiTask";
import TaskViewShowDialog from "@/components/cgnTask/components/dialog/TaskViewShowDialog";
import cmsg from "@/components/common/message";
import { throttle } from "@/utils/funcUtil";
import * as Utils from "@/utils/Utils";
import osUtil from "@/utils/osUtil";
import api from '../api'
// import personSelect from "@@/components/easy-cud-person-select";
import { calcHeight } from "@/utils/funcUtil";
import queryForm from "@/components/common/queryForm";
import workflowManageAPI from "../api";
import TaskTransferDialog from "@/components/cgnTask/components/dialog/TaskTransferDialog";
import TaskDetegateDialog from "@/components/cgnTask/components/dialog/TaskDetegateDialog";
import TaskSendBackDialog from "@/components/cgnTask/components/dialog/TaskSendBackDialog";
import flowDetail from "@/components/cgnTask/components/dialog/flowDetail";
import flowRecord from "@/components/cgnTask/components/dialog/flowRecord";
import Vue from "vue";
export default {
  provide() {
    let that = this;
    return {
      indexProvide: new Vue({
        data() {
          return {
            ascUrl: that.ascUrl // 中台选人控件地址
          };
        }
      })
    };
  },
  components: {
    breadcrumb,
    TaskViewShowDialog,
    // personSelect,
    queryForm,
    TaskTransferDialog,
    TaskDetegateDialog,
    TaskSendBackDialog,
    flowDetail,
    flowRecord
  },
  //初始化树和查询流程模板
  mounted() {
    this.queryProcessList(true);
    window.refreshTask = this.queryProcessList;
    // throttleFunc记录当前的节流方法，用于在页面销毁时释放
    this.throttleFunc = throttle(this.initMaxHeight, 500);
    window.addEventListener("resize", this.throttleFunc);
    window.addEventListener('visibilitychange', this.onVisibilityChange);
    this.resetActivePosition(this.$refs.tabs.$el);
    // this.getHuiQianList()
  },
  computed: {
    getComputedHeight() {
      return this.computedHeight;
    },
  },

  beforeDestroy() {
    window.removeEventListener("resize", this.throttleFunc);
    window.removeEventListener('visibilitychange', this.onVisibilityChange);
  },
  data() {
    var cosignItemTypeFn = (rule, value, callback) => {
      console.log(this.ReqUpdateTaskDto.actCountersignItem, '===')
      if (this.ReqUpdateTaskDto.actCountersignItem.cosignItemType !== 1 && this.ReqUpdateTaskDto.actCountersignItem.cosignItemType !== 0) {
        return callback(new Error('必填'));
      } else {
        callback();
      }
    };
    var scItemCofCodeFn = (rule, value, callback) => {
      console.log(this.ReqUpdateTaskDto.actCountersignItem, '===')
      if (!this.ReqUpdateTaskDto.actCountersignItem.scItemCofCode) {
        return callback(new Error('必填'));
      } else {
        callback();
      }
    };
    return {
      filters: Utils.Filters.splitTime,
      computedHeight: 0,
      hasIcon: false,
      brand: [
        { name: "流程运维" },
        { name: "运维调度" }
      ],
      height: 0,
      loading: false,
      listLoading: false,
      //流程模板列表属性
      processTemplateVo: {
        procName: "",
        procStatus: "",
        procCategory: ""
      },
      tableData: [],
      //分页
      tablePage: {
        pageNum: 1,
        pageSize: 10,
        total: 0
      },
      //表格选中
      // mulSelect: [],
      isTreeCollapse: false,
      maxTableHeight: 0,
      maxRightHeight: 0,
      //搜索字段
      queryTaskData: {
        "taskOrderBy": "0",
        "pageNum": 1,
        "pageSize": 10,
        "priority": "",
        "procSubject": "",
        "startUserId": "",
        "startDeptId": "",
        "procDefName": "",
        "assignTimeBegin": "",
        "assignTimeEnd": "",
        "procCategoryId": "",
        "status": "",
        "statusList": ["0", "2"],
        "orderType": 1
      },
      //流程状态
      options: {
        procInstStatus: Utils.Options.procInstStatus,
      },

      taskViewShowDialog: {
        // 任务撤销弹窗
        isOpen: false,
        procInstId: "", // 流程实例ID
        procDefId: "" // 流程ID
      },

      queryForm: {
        // 查询表单
        priority: "", // 优先级
        taskOrderBy: "0" // 任务开始时间排序
      },
      //激活弹窗条件
      isActive: false,
      activeForm: { input: '' },
      //退回弹窗条件
      isSendBack: false,
      sendBackForm: { input: '', txt: '' },
      isChange: 0,
      //选择环节弹窗条件
      isSelectProcess: false,
      //挂起流程弹窗条件
      // isHangHp: false,
      hangHpForm: { input: '' },
      //更换处理人弹窗条件
      isChangeCompleterName: false,
      changeCompleterNameForm: {
        input: '',
        txt: '',
        assigneeObj: { userId: "", userName: "" },
        noticeMethods: []
      },
      canSendBack: [],
      hangupItem: {},
      canSendBackItem: [],
      isHidden: false, // 页面是否被隐藏
      isToTask: false, // 是否打开新页面

      activeName: 'db',
      queryFields: [
        {
          name: "procSubject",
          label: "",
          labelKey: "工作主题",
          value: "",
          type: "input",
          display: true,
          order: 2
        },
        {
          name: "assignTimeBegin",
          label: "",
          labelKey: "到达时间",
          relation: "assignTimeEnd",
          value: "",
          type: "dateRange",
          display: true,
          order: 2
        },
        {
          name: "startUserId",
          label: "",
          labelKey: "pm.startUserIdName",
          value: "",
          type: "personal",
          display: true,
          order: 2
        },
      ],
      ReqUpdateTaskDto: {
        id: "",
        completerName: "",
        completerId: "",
        completerDeptName: "",
        completerDeptId: "",
        completerDeptPath: "",
        procDefName: "",
        procActName: "",
        creatorId: "",
        creatorName: "",
        createTime: "",
        approvalComment: "",
        // notify: "",
        noticeMethods: [],
        userID: "",
        userName: "",
        procActId: "",
        procInstId: "",
        actPreConfigId: "",
        actTaskType: 1,
        assignType: 1,
        actCountersignItem: { scItemCofCode: "", cosignItemType: null, name: "", scItemCofEn: "" }
      },
      addSignDialogVisible: false,
      ReqGotoActivityDto: {
        actListDto: [],
        procInsID: "",
        procActInstId: "",
        targetActList: [],
        assigneeList: [],
        killDefKeys: [],
        clearTaskType: 0,
        comment: "",
        procDefName: "",
        procActName: "",
        actId: "",
        approvalMode: "",
        processId: "",
        actCountersignItem: { scItemCofCode: "", cosignItemType: null, name: "", scItemCofEn: "" }
      },
      jumpDialogVisible: false,
      showSelectUser: false,
      fullscreenLoading: false,
      selectUserTitle: "",
      isUserMultiple: false,
      initUserId: "",
      selectUserRef: "",
      jumpRules: {
        actId: [
          {
            required: true,
            message: this.$t("cm.tiprequired"),
            trigger: "blur"
          }
        ],
        approvalMode: [
          {
            required: true,
            message: this.$t("cm.tiprequired"),
            trigger: "blur"
          }
        ],
        assigneeList: [
          {
            required: true,
            message: this.$t("cm.tiprequired"),
            trigger: "blur"
          }
        ],
        comment: [
          {
            required: true,
            message: this.$t("cm.tiprequired"),
            trigger: "blur"
          }
        ],
        // notify: [
        //   {
        //     required: true,
        //     message: this.$t("cm.tiprequired"),
        //     trigger: "blur"
        //   }
        // ]
      },
      AppendTaskAssigneeRequestDto: {
        taskId: "",
        userInfo: {
          userID: "",
          userName: "",
          deptID: "",
          deptName: "",
          deptPath: "",
          postID: "",
          postName: ""
        },
        actionUserInfo: {
          userID: "",
          userName: ""
        },
        procActId: "",
        procInstId: "",
        actPreConfigId: "",
        actTaskType: 1,
        assignType: 1,
        actCountersignItem: { scItemCofCode: "", cosignItemType: null, name: "", scItemCofEn: "" }
      },
      completerUser: "",
      addSignFormRules: {
        notify: [
          {
            required: true,
            message: this.$t("cm.tiprequired"),
            trigger: "blur"
          }
        ],
        completerName: [
          {
            required: true,
            message: this.$t("cm.tiprequired"),
            trigger: "blur"
          }
        ],
        scItemCofCode: [
          {
            required: true,
            validator: scItemCofCodeFn,
            trigger: "blur"
          }
        ],
        cosignItemType: [
          {
            required: true,
            validator: cosignItemTypeFn,
            trigger: "blur"
          }
        ]
      },
      taskTransferDialog: {
        // 任务转办弹窗
        isOpen: false,
        isPromptSuccess: false, // 是否提示成功信息（设置不提示，由工具条调用方提示）
        procTaskId: "", // 任务ID，必填
        procActId: "", // 环节ID，必填
        procInstId: "", // 流程实例id，必填 
        userId: "",
        userName: ""
      },
      taskDetegateDialog: {
        // 任务委托弹窗
        isOpen: false,
        isPromptSuccess: false, // 是否提示成功信息（设置不提示，由工具条调用方提示）
        procTaskId: "", // 任务ID，必填
        procActId: "", // 环节ID，必填
        procInstId: "", // 流程实例id，必填
        userId: "",
        userName: ""
      },
      taskCcDialog: {
        // 任务抄送弹窗
        isOpen: false,
        isPromptSuccess: false, // 是否提示成功信息（设置不提示，由工具条调用方提示）
        procInstId: "", // 流程实例ID，必填
        procActInstId: "", // 流程环节实例ID，必填
        procTaskId: "", // 任务ID，必填
        procActId: "", // 流程实例id，必填  
        userId: "",
        userName: "", 
      },
      selectDialog: {
        // 选择弹窗
        visible: false,
        src: "", // iframe Url
        selected: [], // 默认选中值
      },
      taskSendBackDialog: {
        // 任务退回弹窗
        isOpen: false,
        isPromptSuccess: false, // 是否提示成功信息（设置不提示，由工具条调用方提示）
        procInstId: "", // 流程实例ID，必填
        procActInstId: "", // 任务ID，必填
        procTaskId: "", // 流程环节实例ID，必填
        processId: "", // 流程ID
        procVersion: "", // 流程版本
        procActId: "", // 当前环节ID
        procActName: "", // 当前环节名称
        procActEnName: "", // 当前环节英文名
        approval: false,
        approvalAction: 0,
        backActOptions: [],
        newUserId: "",
        newUserName: ""
      },
      taskWithdrawDialog: {
        // 任务撤销弹窗
        isOpen: false,
        procDefId: "", // 流程ID
        procTaskId: "", // 流程任务ID
        procInstId: "", // 流程任务ID
        procActId: "",
        cosignItemCode: "",
        cosignItemName: "",
        userId: "",
        userName: "", 
      },
      isShow: false,
      flowRecordShow: false,
      row: null,
      scItemCofList: []
    };
  },
  methods: {
    // 动态计算目录树和表格高度
    initMaxHeight() {
      calcHeight(this);
    },
    toggleTreeExpand() {
      this.isTreeCollapse = !this.isTreeCollapse;
    },
    //流程模板列表
    queryProcessList(init) {
      this.listLoading = true;

      if (init) {
        this.queryTaskData.pageNum = 1;
        this.queryTaskData.pageSize = 10;
      } else {
        this.queryTaskData.pageNum = this.tablePage.pageNum;
        this.queryTaskData.pageSize = this.tablePage.pageSize;
      }

      if (this.activeName == 'db') {
        Object.assign(
          this.queryTaskData,
          this.$refs.queryDialog1.getQueryForm()
        );
        this.queryTaskData.statusList = ["0", "2"]
        //-w
        api.queryTask(this.queryTaskData).then(result => {
          this.listLoading = false;
          if (result.data.code == "0") {

            if (result.data.records) {
              this.toPageApi(result.data);
              this.tableData = result.data.records;
            } else {
              this.tableData = [];
              this.toPageApi({
                current: this.queryTaskData.pageNum,
                size: this.queryTaskData.pageSize,
                total: 0,
              });
            }
          } else {
            this.$message({
              message: result.data.msg,
              type: "warning"
            });
            this.tableData = [];
            this.toPageApi({
              current: this.queryTaskData.pageNum,
              size: this.queryTaskData.pageSize,
              total: 0,
            });
          }
        }).catch(err => {
          this.$message({
            message: err,
            type: "warning"
          });
          this.tableData = [];
          this.toPageApi({
            current: this.queryTaskData.pageNum,
            size: this.queryTaskData.pageSize,
            total: 0,
          });
        });
        //-w
      } else {
        Object.assign(
          this.queryTaskData,
          this.$refs.queryDialog2.getQueryForm()
        );
        this.queryTaskData.status = "1"
        this.queryTaskData.statusList = []
        api.queryTask(this.queryTaskData).then(result => {
          this.listLoading = false;
          if (result.data.code == "0") {
            if (result.data.records) {
              this.toPageApi(result.data);
              this.tableData = result.data.records;
            } else {
              this.tableData = [];
              this.toPageApi({
                current: this.queryTaskData.pageNum,
                size: this.queryTaskData.pageSize,
                total: 0,
              });
            }
            // this.toPageApi(result.data.data.page);
            // this.tableData = result.data.data.page.records;
          } else {
            this.$message({
              message: result.data.msg,
              type: "warning"
            });
            this.tableData = [];
            this.toPageApi({
              current: this.queryTaskData.pageNum,
              size: this.queryTaskData.pageSize,
              total: 0,
            });
          }
        }).catch(err => {
          this.$message({
            message: err,
            type: "warning"
          });
          this.tableData = [];
          this.toPageApi({
            current: this.queryTaskData.pageNum,
            size: this.queryTaskData.pageSize,
            total: 0,
          });
        });

      }

    },
    //点击查询按钮
    searchProcessTemplates() {
      this.tablePage.pageNum = 1;
      this.queryProcessList(true);
    },
    //点击重置按钮
    resetProcessTemplate() {
      this.queryTaskData = {
        "taskOrderBy": "0",
        "pageNum": 1,
        "pageSize": 10,
        "priority": "",
        "procSubject": "",
        "startUserId": "",
        "startDeptId": "",
        "procDefName": "",
        "assignTimeBegin": "",
        "assignTimeEnd": "",
        "procCategoryId": "",
        "status": "",
        "statusList": ["0", "2"],
        "orderType": 1
      }
      this.processTemplateVo.procName = ""
      // this.$refs.personSelectC.clear();
    },
    //改变每页显示多少条数据
    changeSize(pageSize) {
      this.tablePage.pageSize = pageSize;
      this.tablePage.pageNum = 1;
      this.queryProcessList();
    },
    //改变页数
    changeCurrentPage(current) {
      this.tablePage.pageNum = current;
      this.queryProcessList();
    },
    //接口赋值分页数据
    toPageApi(res) {
      this.tablePage.pageNum = res.current;
      this.tablePage.pageSize = res.size;
      this.tablePage.total = res.total;
    },
    //显示流程状态
    showStatusApi(val) {
      let txt = '';
      this.options.procInstStatus.forEach((item) => {
        if (val == item.value) {
          txt = this.$t(item.labelKey)
        }
      })
      return txt
    },
    //任务操作：查看流程图
    onTaskViewFlowChart(row) {
      this.taskViewShowDialog.procInstId = row.procInstId;
      this.taskViewShowDialog.procDefId = row.procDefId;
      this.taskViewShowDialog.isOpen = true;
    },
    //关闭流程图弹窗
    closeTaskViewShowDialog() {
      this.taskViewShowDialog.isOpen = false;
    },
    //获取请求API实例
    getRequestApi(callback) {
      if (callback) {
        let isEnLanguage = Utils.isEnLanguage(this.$i18n);
        let languageType = isEnLanguage ? 1 : 0;

        let basicInfo = {
          tenantID: this.tenantId,
          appId: this.appId,
          actionUserInfo: this.actionUserInfo
        };
        let extData = {
          // 其他数据
          priority: this.queryForm.priority, // 优先级
          taskOrderBy: this.queryForm.taskOrderBy, // 任务开始时间排序
          languageType: languageType // 语言类型，0-中文，1-英文
        };
        callback(ApiTask, basicInfo, extData);
      }
    },

    /**
 * 任务操作：打开任务表单
 * @param datasType taskList(待办列表)/taskHistList(已办列表)/taskCcList(待阅列表)/taskCcHistList(已阅列表)/taskShareList(共享列表)
 */
    onOpenTaskForm(datasType, row) {
      // TODO 加个枚举
      row.dataType = datasType;
      const dataType = {
        draft: 4,
        taskList: 2,
        taskHistList: 3,
        taskCcList: 3,
        taskCcHistList: 3
      };

      this.isToTask = true;

      let dataInfo = {
        // 流程ID
        procId: row.procDefId,
        // 流程版本
        procVersion: "",
        // 流程名
        procName: row.procDefName,
        // 流程实例ID
        procInstId: row.procInstId,
        // 类型 // 1 发起页面 / 2 待办页面 / 3 已办页面 / 4 草稿页面
        procNode: dataType[datasType],
        // 活动ID
        actId: row.procActId,
        // 活动实例ID
        actInstId: row.procActInstId,
        // 活动名
        actName: row.procActName,
        // 流程模型ID
        procModelId: row.procModelId,
        // 任务ID
        procTaskId: row.id,
        // 会签ID
        cosignItemCode: row.cosignItemCode,
        procInstStatus: row.procInstStatus,
        endTime: row.endTime,
        actCode: row.actCode,
        // 流程状态
        flowStatus: "2"
      };
      sessionStorage.removeItem("procItem");
      sessionStorage.setItem("procItem", JSON.stringify(dataInfo));
      // 待办列表，验证任务是否被任务，被处理刷新列表，未被处理打开新页面
      if (datasType === "taskList") {
        let params = {
          procId: row.procDefId,
          procTaskId: row.id
        };
        ApiTask.checkTask(params).then(res => {
          if (res.data.code === "0") {
            //判断是否为IE浏览器还是其他浏览器
            // if (osUtil.getBrowserInfo().browser.indexOf("IE") === 0) {
            //   // 非新建窗口，通过路由跳转走下面步骤
            //   // this.$router.push({
            //   //   path: "/workbench/view",
            //   //   query: {
            //   //     item: dataInfo
            //   //   }
            //   // });
            // } else {
            //   // 新建浏览器窗口
            //   window.open(this.$getDomainPathFunc() + `/formView.html`);
            //   // this.$router.push({path: "/workbench/view", query: {item: dataInfo}})
            // }
            this.openTab({
              path: '/workbench/view',
              query: {
                procName: dataInfo.procName,
                r: Math.random()
              }
            });
          } else {
            this.$alert(res.data.msg);
            // 更新任务数量
            this.refreshAllTaskCount();
            // 更新代办任务列表
            this.$refs.taskList.queryTaskList();
          }
        });
      } else {
        //判断是否为IE浏览器还是其他浏览器
        // if (osUtil.getBrowserInfo().browser.indexOf("IE") === 0) {
        //   // 非新建窗口，通过路由跳转走下面步骤
        //   this.$router.push({
        //     path: "/workbench/view",
        //     query: {
        //       item: dataInfo
        //     }
        //   });
        // } else {
        //   // 新建浏览器窗口
        //   window.open(this.$getDomainPathFunc() + `/formView.html`);
        //   // this.$router.push({path: "/workbench/view", query: {item: dataInfo}})
        // }

        this.openTab({
          path: '/workbench/view',
          query: {
            procName: dataInfo.procName,
            r: Math.random()
          }
        });
      }
    },

    //打开前历史数据清空
    digest(row) {
      this.clearFormData();
      this.formData.selectedMode = "1";
      this.formData.cosignItemCode = row.cosignItemCode;
      this.formData.procInstId = row.procInstId;
      this.formData.actId = row.procActId;
      this.formData.actName = row.procActName;
      this.formData.taskId = row.id;
      this.formData.procId = row.procDefId;
      this.formData.procName = row.procDefName;
      this.formData.procVersion = row.taskExtend01;
      (this.formData.noticeMethods =
        this.noticeMethods && this.noticeMethods.length > 0
          ? this.noticeMethods.join(",")
          : ""), // 通知方式
        (this.loading = true);
      // 请求获取审批人信息
      api.quickApprove(this.formData).then(res => {
        this.loading = false;
        this.aproverUsers = [];
        this.cosignList = [];
        this.isCosign = false;
        this.delActPerson = false;
        this.addActPerson = false;
        this.delAssigneePerson = false;
        this.addAssigneePerson = false;
        if (res.status === 200 && res.data.code === "0") {
          this.digestVisible = true;
          // 读取下一环节数据
          const submit = res.data.data.submit;
          if (submit.code === "0") {
            this.delActPerson = submit.data.delActPerson;
            this.addActPerson = submit.data.addActPerson;
            this.delAssigneePerson = submit.data.delAssigneePerson;
            this.addAssigneePerson = submit.data.addAssigneePerson;
            this.formData.targetActList = submit.data.targetActList;
            this.formData.end = submit.data.end;
            if (!submit.data.end) {
              this.actIndex = 0;
              this.cosignIndex = 0;
              if (
                this.formData.targetActList[0].procActType ==
                this.ACT_TYPE.GENERAL
              ) {
                for (
                  let i = 0;
                  i < this.formData.targetActList[0].assigneeList.length;
                  i++
                ) {
                  this.aproverUsers.push(
                    "[" +
                    this.formData.targetActList[0].assigneeList[i].userID +
                    "]" +
                    this.formData.targetActList[0].assigneeList[i].userName
                  );
                }
              }
              if (
                this.formData.targetActList[0].procActType ==
                this.ACT_TYPE.COSIGN
              ) {
                this.isCosign = true;
                for (
                  let i = 0;
                  i < this.formData.targetActList[0].cosignItemList.length;
                  i++
                ) {
                  this.cosignList.push(
                    this.formData.targetActList[0].cosignItemList[i]
                  );
                }
                for (
                  let i = 0;
                  i < this.cosignList[0].cosignerList.length;
                  i++
                ) {
                  this.aproverUsers.push(
                    "[" +
                    this.cosignList[0].cosignerList[i].userID +
                    "]" +
                    this.cosignList[0].cosignerList[i].userName
                  );
                }
              }
            }
            this.formData.dataKey = submit.data.dataKey;
          }
          const back = res.data.data.back;
          if (back.code === "0") {
            // 任务ID
            this.currentProcAct.id = row.id;
            // 流程ID
            this.currentProcAct.processId = row.procDefId;
            // 版本号
            this.currentProcAct.procVersion = row.taskExtend01;
            // 环节ID
            this.currentProcAct.procActId = row.procActId;
            // 环节名
            this.currentProcAct.procActName = row.procActName;
            // 环节英文名
            this.currentProcAct.procActEnName = row.procActEnName;
            // 流程实例ID
            this.currentProcAct.procInstId = row.procInstId;
            // 环节实例ID
            this.currentProcAct.procActInstId = row.procActInstId;
            // 可退回环节表列
            this.goBackActOptions = back.data.targActList;

            this.radioDisable = false;
          } else {
            this.radioDisable = true;
          }
        } else {
          this.$message.error(res.data.message);
        }
      });
    },

    //激活弹窗
    openActiveDialog() {

      if (this.mulSelect.length > 0) {
        this.isActive = !this.isActive;
        this.activeForm.input = '';
        this.$refs.activeForm.resetFields();
      } else {
        this.$message({
          message: '请选择一条数据！',
          type: "warning"
        });
      }

    },
    //激活弹窗--提交
    activeSubmitProcess(name) {
      this.$refs[name].validate((valid) => {
        if (valid) {

          this.mulSelect.forEach((item) => {
            this.procInstRecover(item);
          })

        } else {
          return false
        }
      })
    },
    //关闭 激活弹窗 回调
    closeActiveDialog() {
      this.mulSelect = []
      this.activeForm.input = ''
      this.$refs.table.clearSelection();
      this.$refs['changeCompleterNameForm'].resetFields();
    },

    // 关闭 更换处理人弹窗
    closeCompleterDialog() {
      this.changeCompleterNameForm = {
        input: '',
        txt: '',
        assigneeObj: { userId: "", userName: "" },
        noticeMethods: []
      }
      this.$refs['changeCompleterNameForm'].resetFields();
      this.$refs['personSelectC'].clear();
      this.isChangeCompleterName = false
    },

    //退回弹窗
    openSendBackDialog(row) {
      this.currentRow = row;
      // this.sendBackForm = { input: '', txt: '' };
      this.queryGoBackActIdSelList();
      // this.isChange = 0;
    },

    //退回-选择环节
    selectBackNode(row) {

      this.canSendBackItem = [row];
      this.sendBackForm.input = this.canSendBackItem[0].actName
      this.isSelectProcess = false;

    },

    //退回弹窗--提交
    sendBackSubmitProcess(name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          //alert('true')
          this.sendBackRes();
        } else {
          return false
        }
      })
    },

    //查询退回上一环节的数据
    queryGoBackActIdSelList() {
      let it = this.currentRow

      let requestParams = {
        processId: it.procDefId,
        procVersion: it.taskExtend01,
        actId: it.procActId,
        actName: it.procActName,
        procInstId: it.procInstId,
        taskId: it.id,
        consign: it.consign
      };

      this.listLoading = true;

      api.queryGoBackActIdSelList(requestParams).then(result => {
        this.listLoading = false;

        if (result.data.code == "0") {

          // this.isSendBack = true;
          this.canSendBack = result.data.data.targActList;
          this.sendBackForm.input = this.canSendBack[0].actName
          this.canSendBackItem = []
          this.canSendBackItem.push(this.canSendBack[0])
          this.taskSendBackDialog.procInstId = this.currentRow.procInstId;
          this.taskSendBackDialog.procActInstId = this.currentRow.procActInstId;
          this.taskSendBackDialog.procTaskId = this.currentRow.id;
          this.taskSendBackDialog.processId = this.currentRow.procId;
          this.taskSendBackDialog.procVersion = !this.currentRow.taskExtend01 ? '' : this.currentRow.taskExtend01;
          this.taskSendBackDialog.procActId = this.currentRow.procActId;
          this.taskSendBackDialog.procActName = this.currentRow.procActName;
          if (result.data.data.backRuleFlag === 0) {
            this.taskSendBackDialog.approval = true;
          } else {
            this.taskSendBackDialog.approval = false;
          }
          this.taskSendBackDialog.approvalAction = result.data.data.actBackRule;
          this.taskSendBackDialog.backActOptions = this.canSendBack;
          this.taskSendBackDialog.comment = this.sendBackForm.txt;
          this.taskSendBackDialog.attachment = [];
          this.taskSendBackDialog.isShowComment = false;
          this.taskSendBackDialog.modelRelation = [];
          this.taskSendBackDialog.newUserId = this.currentRow.assigneeId;
          this.taskSendBackDialog.newUserName = this.currentRow.assigneeName;
          this.taskSendBackDialog.isOpen = true;

        } else {

          this.$refs.table.clearSelection();

          this.$message({
            message: result.data.msg,
            type: "warning"
          });
        }

      }).catch(err => {
        this.listLoading = false;
        this.$message({
          message: err,
          type: "warning"
        });
      });
    },

    //退回接口
    sendBackRes() {
      let it = this.currentRow
      let requestParams = {
        procInstId: it.procInstId,
        processId: it.procDefId,
        procCode: "",
        taskId: it.id, // 任务id
        approvalAction: 0, // 退回方式
        comment: this.sendBackForm.txt, // 审批意见
        actId: it.procActId,
        actName: it.procActName,
        targetActList: this.canSendBackItem, // 目标环节列表（目前只支持一笔）
        cosignItem: null, // 退回会签项
        ccList: [], // 抄送人列表
        noticeMethods: '',// 通知方式
        backReasonList: [],
        currentUser: null,
        attachment: [],
        procTitle: "",
        topic: "",
        modelRelation: [],
        customForm: 0
      };

      api.sendBack(requestParams).then(result => {
        this.listLoading = false;

        if (result.data.code == "0") {
          this.$message({
            message: result.data.msg,
            type: "success"
          });

          this.isSendBack = false;
          this.clearTable();
          setTimeout(() => {
            this.queryProcessList(true);
          }, 300)

        } else {
          this.$message({
            message: result.data.msg,
            type: "warning"
          });
        }
      }).catch(err => {
        this.$message({
          message: err,
          type: "warning"
        });
      });
    },

    //点击-上一环节-按钮
    prevLink() {
      this.isChange = 1;
      if (this.canSendBack.length > 1) {
        let obj = this.canSendBack[this.canSendBack.length - 1];
        this.canSendBackItem = [];
        this.canSendBackItem.push(obj)
        this.sendBackForm.input = obj.actName
      }
    },

    //挂起弹窗
    // hangHpDialog() {
    //   if (this.mulSelect.length == 1) {
    //     this.isHangHp = !this.isHangHp;
    //     this.hangHpForm.input = '';

    //     this.mulSelect.forEach((item) => {
    //       this.getProcInst(item)
    //     })

    //   } else {
    //     this.$message({
    //       message: '请选择一条数据！',
    //       type: "warning"
    //     });
    //   }
    // },
    //挂起提交
    // hanghpSubmitProcess(name) {
    //   this.$refs[name].validate((valid) => {
    //     if (valid) {


    //       this.procInstHangup()


    //     } else {
    //       return false
    //     }
    //   })
    // },

    //更换处理人弹窗
    changeCompleterNameDialog(row) {
      this.currentRow = row;
      this.isChangeCompleterName = !this.isChangeCompleterName;
      this.changeCompleterNameForm.input = '';
      this.changeCompleterNameForm.txt = '';
      this.changeCompleterNameForm.assigneeObj.userId = row.assigneeId;
      this.changeCompleterNameForm.assigneeObj.userName = '[' + row.assigneeId + ']' + row.assigneeName;
      setTimeout(() => {
        this.$refs.personSelectC.clear();
      }, 500);
    },

    //更换处理人-提交按钮
    changeCompleterSubmitProcess(name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          this.detegateTask(this.currentRow)
        } else {
          return false
        }
      })
    },

    callName: function (value) {
      //this.changeCompleterNameForm.input = value[0];
      this.$refs['changeCompleterNameForm'].clearValidate('input')
    },


    // 流程实例-挂起
    // procInstHangup(row) {

    //   this.$confirm("确定挂起此流程？", "提示", {
    //     type: "warning",
    //     confirmButtonText: "确定",
    //     cancelButtonText: "取消",
    //     cancelButtonClass: "btn-second",
    //     confirmButtonClass: "btn-default"
    //   }).then(() => {
    //     let param = {};
    //     param = this.hangupItem;
    //     param.procInsID = this.hangupItem.id;

    //     api.hangupProcInstAPI(param).then(res => {
    //       let data = res;
    //       if (data.code === "0") {

    //         this.$message({
    //           showClose: true,
    //           message: data.msg,
    //           type: "success"
    //         });

    //         this.isHangHp = false;
    //         this.queryProcessList(true);

    //       } else {
    //         this.isHangHp = false;
    //         this.$message({
    //           showClose: true,
    //           message: data.msg,
    //           type: "warning"
    //         });
    //       }
    //     }).catch(e => {
    //       //cmsg.httpCatchErrorMessage(this);
    //     });
    //   }).catch(() => {
    //     cmsg.cancelMessage(this);
    //   });
    // },

    // 流程实例-恢复
    procInstRecover(row) {
      if (row.status == 2) {
        this.$message.error("流程实例为已完成状态，不能恢复");
        return;
      }
      this.$confirm("确定激活此流程实例？", "提示", {
        type: "warning",
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        cancelButtonClass: "btn-second",
        confirmButtonClass: "btn-default"
      }).then(() => {
        let param = {};
        param = { ...row };
        param.procInsID = row.id;

        api.recoverProcInstAPI(param).then(res => {
          let data = res;
          if (data.code === "0") {
            this.$message({
              showClose: true,
              message: data.msg,
              type: "success"
            });
            this.isActive = false;
            this.queryProcessList()

          } else {
            this.$message({
              showClose: true,
              message: data.msg,
              type: "warning"
            });
          }
        }).catch(e => {
          cmsg.httpCatchErrorMessage(this);
        });
      }).catch(() => {
        cmsg.cancelMessage(this);
      });
    },

    // table 选中清空
    clearTable() {
      this.$refs.table.clearSelection();
      //this.queryProcessList()
    },

    // 更换处理人
    detegateTask(row) {
      // let userId = this.getPNumber(this.changeCompleterNameForm.input);
      let userName = this.changeCompleterNameForm.input.userName.split(']')[1];

      let data = {
        // old
        // "procTaskId": row.id,
        // "approvalComment": this.changeCompleterNameForm.txt,
        // "assigneeList": [{ "userID": this.changeCompleterNameForm.input.userId, "userName": userName }],
        // "procInsID": row.procInstId,
        // "actId": row.procActId,
        // "noticeMethods": "",

        "id": row.id,
        "procInstId": row.procInstId,
        "assigneeId": this.changeCompleterNameForm.input.userId,
        "assigneeName": userName,
        "assigneeDeptId": row.assigneeDeptId,
        "assigneeDeptName": row.assigneeDeptId,
        "assigneeDeptPath": row.assigneeDeptPath,
        "completerId": row.completerId,
        "completerName": row.completerId,
        "completerDeptId": row.completerDeptId,
        "completerDeptName": row.completerDeptName,
        "completerDeptPath": row.completerDeptName,
        "assignTime": row.assignTime,
        "openTime": row.openTime,
        "completedTime": row.completedTime,
        "approvalComment": this.changeCompleterNameForm.txt,
        "creatorId": row.creatorId,
        "creatorName": row.creatorName,
        "createTime": row.createTime,
        "approvalAction": 0,
        "rev": row.rev,
        "processId": row.procId,
        "shareFlag": true,
        "reqProcInstLogInfoDto": row,
        "noticeMethods": this.changeCompleterNameForm.noticeMethods,
        "procActId": row.procActId,
        // "actName":row.procActName,
        // "procInsName":''
      }

      api.detegateTask(data).then(res => {

        if (res.data.code === "0") {
          this.$message({
            showClose: true,
            message: res.data.msg,
            type: "success"
          });

          this.isChangeCompleterName = false;
          this.queryProcessList(true);

        } else {
          this.$message({
            showClose: true,
            message: res.data.msg,
            type: "warning"
          });
        }
      }).catch(e => {
        cmsg.httpCatchErrorMessage(this);
      });
    },

    getPNumber(val) {
      let reg = /\[(.+?)\]/g
      let str = val.match(reg)
      return str = RegExp.$1
    },

    // 挂起前置查询接口
    getProcInst(item) {

      let data = {
        id: item.procInstId
      };

      api.getProcInst(data).then(res => {

        if (res.data.code === "0") {

          this.hangupItem = {};
          this.hangupItem = res.data.data;


        } else {
          this.$message({
            showClose: true,
            message: res.data.msg,
            type: "warning"
          });
        }
      }).catch(e => {
        cmsg.httpCatchErrorMessage(this);
      });
    },

    // 监听当前页被隐藏-打开
    onVisibilityChange() {
      this.isHidden = document.hidden;
      if (this.isHidden) {
      } else {
        if (this.isToTask) {

          setTimeout(() => {
            this.queryProcessList(true);
          }, 1000)

          this.isToTask = false;
        }

      }
    },

    // 点击 title
    handleClick(tab) {
      this.resetActivePosition(this.$refs.tabs.$el);
      this.activeName = tab.name;

      // this.mulSelect = [];
      this.clearTable();
      this.resetProcessTemplate();

      // if (tab.name === "db") {
      //   // 待办
      //   this.queryProcessList(true);
      // }

      // if (tab.name === "yb") {
      //   // 已办
      //   this.queryProcessList(true);
      // }
      this.queryProcessList(true);
    },

    // 设置样式
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

    // 显示-当前处理人-字段
    handleShowUser(item) {
      let txt = ''

      if (item.task == '1') {
        // 委托-状态
        //txt = `[${item.toUserIdTransfer || item.sentByUserId }]${item.toUserNameTransfer || item.sentByUserName}`

        if (!!item.toUserIdTransfer) {
          txt = `${item.startUserIdName} / [${item.toUserIdTransfer}]${item.toUserNameTransfer}`
        } else {
          txt = `[${item.startUserIdName}]`
        }
      }

      if (item.task == '0') {
        // 0-普通
        if (item.assigneeName && item.assigneeName.length > 8) {
          txt = item.assigneeName
        } else {
          txt = `[${item.assigneeId}]${item.assigneeName}`
        }

        if (!!item.toUserIdTransfer) {
          txt = `${txt} / [${item.toUserIdTransfer}]${item.toUserNameTransfer}`
        }

      }

      return txt
    },

    getRowProority(priority) {
      switch (priority) {
        case "0":
          return "cgnTask.priority.low";
        case "1":
          return "cgnTask.priority.middle";
        case "2":
          return "cgnTask.priority.high";
      }
    },
    // 加签实例
    taskInstAddSign(row) {
      let taskId = row.id;
      let procDefName = row.procDefName;
      let procActName = row.procActName;
      let params = {};
      params.taskId = taskId;
      params.procInsID = row.procInstId;
      params.procActInstId = row.procActInstId;
      params.assigneeId = row.assigneeId;
      let _this = this;
      _this.listLoading = true;
      _this.currentRow = row;
      workflowManageAPI.queryDetailTaskInstAPI(params).then(res => {
        _this.listLoading = false;
        if (res.code === "0" && !res.data) {
          _this.$message('当前任务已变更！')
          _this.queryProcessList();
        } else if (res.code === "0") {
          _this.ReqUpdateTaskDto.creatorId = res.data.creatorId;
          _this.ReqUpdateTaskDto.creatorName = res.data.creatorName;
          _this.ReqUpdateTaskDto.createTime = res.data.createTime;
          _this.ReqUpdateTaskDto.id = res.data.id;
          _this.ReqUpdateTaskDto.procDefName = procDefName;
          _this.ReqUpdateTaskDto.procActName = procActName;
          _this.ReqUpdateTaskDto.userID = row.assigneeId;
          _this.ReqUpdateTaskDto.userName = row.assigneeName;
          _this.ReqUpdateTaskDto.procActId = row.procActId
          _this.ReqUpdateTaskDto.procInstId = row.procInstId
          _this.ReqUpdateTaskDto.actPreConfigId = row.actPreConfigId
          _this.ReqUpdateTaskDto.actTaskType = row.actTaskType
          _this.ReqUpdateTaskDto.assignType = row.assignType
          _this.addSignDialogVisible = true;
        } else {
          _this.$message({
            message: res.msg,
            type: "warning"
          });
        }
      }).catch(() => {
        _this.listLoading = false;
      });
    },
    // 加签提交
    addSign() {
      this.$refs.addSignForm.validate(valid => {
        if (valid) {
          this.AppendTaskAssigneeRequestDto.taskId = this.ReqUpdateTaskDto.id;
          // this.AppendTaskAssigneeRequestDto.notify = this.ReqUpdateTaskDto.notify;
          this.AppendTaskAssigneeRequestDto.noticeMethods = this.ReqUpdateTaskDto.noticeMethods.join(',');
          this.AppendTaskAssigneeRequestDto.userInfo.userName = this.ReqUpdateTaskDto.completerName;
          this.AppendTaskAssigneeRequestDto.userInfo.userID = this.ReqUpdateTaskDto.completerId;
          this.AppendTaskAssigneeRequestDto.userInfo.deptName = this.ReqUpdateTaskDto.completerDeptName;
          this.AppendTaskAssigneeRequestDto.userInfo.deptID = this.ReqUpdateTaskDto.completerDeptId;
          this.AppendTaskAssigneeRequestDto.userInfo.deptPath = this.ReqUpdateTaskDto.completerDeptPath;
          this.AppendTaskAssigneeRequestDto.actionUserInfo.userID = this.ReqUpdateTaskDto.userID;
          this.AppendTaskAssigneeRequestDto.actionUserInfo.userName = this.ReqUpdateTaskDto.userName;
          this.AppendTaskAssigneeRequestDto.procActId = this.ReqUpdateTaskDto.procActId;
          this.AppendTaskAssigneeRequestDto.procInstId = this.ReqUpdateTaskDto.procInstId;
          this.AppendTaskAssigneeRequestDto.actPreConfigId = this.ReqUpdateTaskDto.actPreConfigId;
          this.AppendTaskAssigneeRequestDto.actTaskType = this.ReqUpdateTaskDto.actTaskType;
          this.AppendTaskAssigneeRequestDto.assignType = this.ReqUpdateTaskDto.assignType;
          this.AppendTaskAssigneeRequestDto.actCountersignItem.scItemCofCode = this.ReqUpdateTaskDto.actCountersignItem.scItemCofCode
          this.AppendTaskAssigneeRequestDto.actCountersignItem.cosignItemType = this.ReqUpdateTaskDto.actCountersignItem.cosignItemType
          this.AppendTaskAssigneeRequestDto.actCountersignItem.name = this.ReqUpdateTaskDto.actCountersignItem.name
          this.AppendTaskAssigneeRequestDto.actCountersignItem.scItemCofEn = this.ReqUpdateTaskDto.actCountersignItem.scItemCofEn
          let request = this.AppendTaskAssigneeRequestDto;
          request.reqProcInstLogInfoDto = this.currentRow;
          this.fullscreenLoading = true;
          let _this = this;
          workflowManageAPI.addSignTaskInstAPI(request).then(res => {
            _this.fullscreenLoading = false;
            if (res.code === "0") {
              _this.$message({
                message: this.$t("cm.savesuccess"),
                type: "success"
              });
              _this.addSignClose();
            } else {
              _this.$message({ message: res.msg, type: "warning" });
            }
          });
        } else {
          return false;
        }
      });
    },
    //加签关闭
    addSignClose: function () {
      this.addSignDialogVisible = false;
      this.cleanReqUpdateTaskDto();
      this.AppendTaskAssigneeRequestDto = {
        taskId: "",
        userInfo: {
          userID: "",
          userName: "",
          deptID: "",
          deptName: "",
          deptPath: "",
          postID: "",
          postName: ""
        },
        actionUserInfo: {
          userID: "",
          userName: ""
        },
        procActId: "",
        procInstId: "",
        actPreConfigId: "",
        actTaskType: 1,
        assignType: 1,
        actCountersignItem: {
          scItemCofCode: "",
          cosignItemType: null,
          scItemCofEn: "",
          name: ""
        }
      };
      this.$refs.addSignForm.resetFields();
    },
    cleanReqUpdateTaskDto() {
      this.ReqUpdateTaskDto = {
        id: "",
        completerName: "",
        completerId: "",
        completerDeptName: "",
        completerDeptId: "",
        completerDeptPath: "",
        procDefName: "",
        procActName: "",
        creatorId: "",
        creatorName: "",
        createTime: "",
        approvalComment: "",
        noticeMethods: [],
        userID: "",
        userName: "",
        procActId: "",
        procInstId: "",
        actPreConfigId: "",
        actTaskType: 1,
        assignType: 1,
        actCountersignItem: {
          scItemCofCode: "",
          cosignItemType: null,
          scItemCofEn: "",
          name: ""
        }
      };
      this.completerUser = "";
    },
    // 跳转实例
    taskInstJump: function (row) {
      let _this = this;
      let procDefName = row.procDefName;
      let procActName = row.procActName;
      let procInsID = row.procInstId;
      let procActInstId = row.procActInstId;
      let processId = row.procId;
      let params = {};
      params.procId = row.procId;
      params.procInstId = row.procInstId;
      params.procActId = row.procActId;
      _this.listLoading = true;
      _this.currentRow = row;
      workflowManageAPI.jumpSelListTaskInstAPI(params).then(res => {
        _this.listLoading = false;
        if (res.code === "0") {
          _this.ReqGotoActivityDto.actListDto = res.records;
          _this.ReqGotoActivityDto.procDefName = procDefName;
          _this.ReqGotoActivityDto.procActName = procActName;
          _this.ReqGotoActivityDto.procInsID = procInsID;
          _this.ReqGotoActivityDto.processId = processId;
          _this.ReqGotoActivityDto.procActInstId = procActInstId;
          _this.jumpDialogVisible = true;
        } else {
          _this.$message({
            message: res.msg,
            type: "warning"
          });
        }
      }).catch(() => {
        _this.listLoading = false;
      });
    },
    // 跳转关闭
    jumpClose() {
      this.jumpDialogVisible = false;
      this.ReqGotoActivityDto = {
        actListDto: [],
        procInsID: "",
        procActInstId: "",
        targetActList: [],
        assigneeList: [],
        killDefKeys: [],
        clearTaskType: 0,
        comment: "",
        procDefName: "",
        procActName: "",
        actId: "",
        approvalMode: "",
        processId: ""
      };
      this.$refs.jumpForm.resetFields();
    },
    // 跳转提交
    jumpCommit() {
      this.$refs.jumpForm.validate(valid => {
        if (valid) {
          let actId = this.ReqGotoActivityDto.actId;
          let ActAssigneeInfo = {};
          let actDtos = this.ReqGotoActivityDto.actListDto.filter(
            item => item.actID == actId
          );
          if (actDtos && actDtos.length > 0) {
            ActAssigneeInfo = actDtos[0];
          } else {
            return;
          }
          ActAssigneeInfo.approvalMode = this.ReqGotoActivityDto.approvalMode;
          ActAssigneeInfo.assigneeList = this.ReqGotoActivityDto.assigneeList;
          this.ReqGotoActivityDto.targetActList = [];
          this.ReqGotoActivityDto.targetActList.push(ActAssigneeInfo);
          let request = {
            notify: this.ReqGotoActivityDto.notify,
            processId: this.ReqGotoActivityDto.processId,
            procInsID: this.ReqGotoActivityDto.procInsID,
            procActInstId: this.ReqGotoActivityDto.procActInstId,
            targetActList: this.ReqGotoActivityDto.targetActList,
            killDefKeys: this.ReqGotoActivityDto.killDefKeys,
            clearTaskType: this.ReqGotoActivityDto.clearTaskType,
            comment: this.ReqGotoActivityDto.comment
          };
          request.reqProcInstLogInfoDto = this.currentRow;
          this.fullscreenLoading = true;
          let _this = this;
          workflowManageAPI.jumpTaskInstAPI(request).then(res => {
            _this.fullscreenLoading = false;
            if (res.code === "0") {
              _this.$message({
                message: this.$t("cm.savesuccess"),
                type: "success"
              });
              _this.jumpClose();
            } else {
              _this.$message({ message: res.msg, type: "warning" });
            }
          });
        } else {
          return false;
        }
      });
    },

    // 编辑实例
    updateData: function (row) {
      let query = {
        taskId: row.id,
        procInsID: row.procInstId,
        procActInstId: row.procActInstId,
        assigneeId: row.assigneeId,
        processId: row.procId,
        procDefName: row.procDefName,
        procActName: row.procActName,
        shareType: row.shareType,
        status: row.status,
        procSubject: row.procSubject,
      }
      //打开页签
      this.openTab({
        path: "/wf_task_instance_manage_update",
        query: query
      });
    },
    lookDetail(row) {
      // let disabled = true
      window.localStorage.setItem("taskData", JSON.stringify(row));
      //打开页签
      this.openTab({
        path: "/wf_task_instance_manage_update",
        query: {
          disabled: true
        }
      });
    },
    showSelectUserDialog(ref) {
      this.selectUserRef = ref;
      this.$refs[ref].blur();
      if (ref === "startUserInput") {
        this.initUserId = this.ReqProcInstTaskDto.startUserId;
        this.selectUserTitle = "wm.start_user";
        this.isUserMultiple = false;
      } else if (ref === "assigneeInput") {
        this.initUserId = this.ReqProcInstTaskDto.assigneeId;
        this.selectUserTitle = "wm.assignee_name";
        this.isUserMultiple = false;
      } else if (ref === "completerInput") {
        this.initUserId = this.ReqUpdateTaskDto.completerId;
        this.selectUserTitle = "flow.completerName";
        this.isUserMultiple = false;
      } else if (ref === "transferCompleterInput") {
        this.initUserId = this.ReqUpdateTaskDto.completerId;
        this.selectUserTitle = "flow.transferComplaterName";
        this.isUserMultiple = true;
      } else if (ref === "assigneeListInput") {
        // let ids = ''
        // this.ReqGotoActivityDto.assigneeList.forEach((item,index) =>{
        //   ids += (index === 0 ? '' : ',') + item.userID
        // })
        // this.initUserId = ids
        this.selectUserTitle = "flow.completerName";
        this.isUserMultiple = true;
      }
      this.showSelectUser = true;
    },
    //删除跳转操作的处理人
    handleDelPerson(index) {
      this.ReqGotoActivityDto.assigneeList.splice(index, 1);
    },
    closeSelectUserDialog() {
      this.showSelectUser = false;
      this.initUserId = "";
      this.$refs.selectUser.init();
    },
    commitSelectUser() {
      let actParticipantData = this.$refs.selectUser.getData();
      if (this.selectUserRef === "startUserInput") {
        this.startUser = "";
        this.ReqProcInstTaskDto.startUserId = "";
      } else if (this.selectUserRef === "assigneeInput") {
        this.assigneeUser = "";
        this.ReqProcInstTaskDto.assigneeId = "";
      } else if (this.selectUserRef === "completerInput") {
        this.completerUser = "";
        this.ReqUpdateTaskDto.completerId = "";
      } else if (this.selectUserRef === "transferCompleterInput") {
        this.completerUser = "";
        this.ReqUpdateTaskDto.completerId = "";
      } else if (this.selectUserRef === "assigneeListInput") {
        // this.assigneeUsers = ''
        // this.ReqGotoActivityDto.assigneeList = []
      }
      if (actParticipantData) {
        let userData = actParticipantData.get("userData");
        if (userData && userData.length === 8) {
          // 判断用户信息是否为空，不为空才插入数据
          if (
            userData[1] &&
            userData[1].length === 2 &&
            userData[1][0] !== ""
          ) {
            let userDataIdsStr = userData[1][0];
            let userDataNamesStr = userData[1][1];
            let userDataIds = userDataIdsStr.split(";");
            let userDataNames = userDataNamesStr.split(";");
            let ids = "";
            let users = "";
            let userNames = "";
            for (let i = 0; i < userDataIds.length; i++) {
              ids += (i === 0 ? "" : ",") + userDataIds[i];
              users +=
                (i === 0 ? "" : ",") +
                "[" +
                userDataIds[i] +
                "]" +
                userDataNames[i];
              userNames += (i === 0 ? "" : ",") + userDataNames[i];
              if (this.selectUserRef === "assigneeListInput") {
                let setData = true;
                this.ReqGotoActivityDto.assigneeList.forEach(data => {
                  if (data.userID === userDataIds[i]) {
                    setData = false;
                  }
                });
                if (setData) {
                  this.ReqGotoActivityDto.assigneeList.push({
                    userID: userDataIds[i],
                    userName: userDataNames[i]
                  });
                }
              }
            }
            if (this.selectUserRef === "startUserInput") {
              this.startUser = users;
              this.ReqProcInstTaskDto.startUserId = ids;
            } else if (this.selectUserRef === "assigneeInput") {
              this.assigneeUser = users;
              this.ReqProcInstTaskDto.assigneeId = ids;
            } else if (this.selectUserRef === "completerInput") {
              this.completerUser = users;
              this.ReqUpdateTaskDto.completerId = ids;
              this.ReqUpdateTaskDto.completerName = userNames;
              this.$refs.addSignForm.validateField("completerName");
            } else if (this.selectUserRef === "transferCompleterInput") {
              this.completerUser = users;
              this.ReqUpdateTaskDto.completerId = ids;
              this.ReqUpdateTaskDto.completerName = userNames;
              this.$refs.transferForm.validateField("completerName");
            } else if (this.selectUserRef === "assigneeListInput") {
              // this.assigneeUsers = users
              this.$refs.jumpForm.validateField("assigneeList");
            }
            this.initUserId = ids;
          }
        }
      }
      this.closeSelectUserDialog();
    },
    dataFormat(time) {
      let date = new Date(time);
      let month = date.getMonth() + 1;
      let str =
        date.getFullYear() +
        "-" +
        month +
        "-" +
        date.getDate() +
        " " +
        date.getHours() +
        ":" +
        date.getMinutes() +
        ":" +
        date.getSeconds();
      return str;
    },
    onEntrust(item) {
      this.taskDetegateDialog.procInstId = item.procInstId; // 流程实例ID
      this.taskDetegateDialog.procTaskId = item.id;
      (this.taskDetegateDialog.procActId = item.procActId), // 环节ID，必填
        (this.taskDetegateDialog.isOpen = true);
      this.taskDetegateDialog.userId = item.assigneeId;
      this.taskDetegateDialog.userName = item.assigneeName;
      this.taskDetegateDialog.isPromptSuccess = true;
    },
    onTransition(item) {
      this.taskTransferDialog.procInstId = item.procInstId; // 流程实例ID
      this.taskTransferDialog.procTaskId = item.id;
      (this.taskTransferDialog.procActId = item.procActId), // 环节ID，必填
        (this.taskTransferDialog.isOpen = true);
      this.taskTransferDialog.userId = item.assigneeId;
      this.taskTransferDialog.userName = item.assigneeName;
      this.taskTransferDialog.isPromptSuccess = true;
    },
    /**
     * 打开任务抄送弹窗
     */
    openTaskCcDialog(item) {
      this.taskCcDialog.procInstId = item.procInstId; // 流程实例ID
      this.taskCcDialog.procActInstId = item.procActInstId; // 流程环节实例ID
      this.taskCcDialog.procTaskId = item.id; // 任务ID
      this.taskCcDialog.procActId = item.procActId; // 环节ID，必填
      this.taskCcDialog.userId = item.assigneeId; // 环节ID，必填
      this.taskCcDialog.userName = item.assigneeName; // 环节ID，必填
      this.taskCcDialog.isOpen = true;
      this.taskCcDialog.isPromptSuccess = true;
    },

    /**
     * 关闭任务委托弹窗
     */
    closeTaskDetegateDialog(isSubmitSuccess, responseData) {
      this.taskDetegateDialog.isOpen = false;
      if (isSubmitSuccess) {
        this.queryProcessList(true);
      }
    },
    /**
     * 关闭任务转办弹窗
     */
    closeTaskTransferDialog(isSubmitSuccess, responseData) {
      this.taskTransferDialog.isOpen = false;
      if (isSubmitSuccess) {
        this.queryProcessList(true);
      }
    },
    /**
     * 关闭任务撤销弹窗
     */
    closeTaskWithdrawDialog(isSubmitted) {
      this.taskWithdrawDialog.isOpen = false;
      if (isSubmitted) {
        this.queryProcessList(true);
      }
    },
    /**
     * 关闭任务抄送弹窗
     */
    closeTaskCcDialog(isSubmitSuccess, responseData) {
      this.taskCcDialog.isOpen = false;
      if (isSubmitSuccess) {
        this.queryProcessList(true);
      }
    },
    /**
     * 关闭任务退回弹窗
     */
    closeTaskSendBackDialog(isSubmitSuccess, responseData) {
      this.taskSendBackDialog.isOpen = false;
      if (isSubmitSuccess) {
        this.queryProcessList(true);
      }
    },

    // 更多菜单事件
    moreCommandHandler(command) {
      let param = command.param;
      switch (command.optFlag) {
        case "openSendBackDialog":
          this.openSendBackDialog(param);
          break;
        case "changeCompleterNameDialog":
          this.changeCompleterNameDialog(param);
          break;
        case "onEntrust":
          this.onEntrust(param);
          break;
        case "onTransition":
          this.onTransition(param);
          break;
        case "openTaskCcDialog":
          this.openTaskCcDialog(param);
          break;
        case "flowDetailFn":
          this.flowDetailFn(param);
          break;
        case "flowRecordFn":
          this.flowRecordFn(param);
          break;
        case "taskInstAddSign":
          this.taskInstAddSign(param);
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
    /**
     * 勾选数据撤销
     */
    SelectedwithdrawTask(row) {
      if (row.procInstStatus == "1") {
        this.$message.warning(this.$t("cgnTask.tips.withdrawSuspended"));
        return;
      }

      if (row.procInstStatus == "2") {
        this.$message.warning(this.$t("cgnTask.tips.withdrawEndProcess"));
        return;
      }

      if (row.procInstStatus == "3") {
        this.$message.warning(this.$t("cgnTask.tips.withdrawCancelled"));
        return;
      }

      if (row.procInstStatus == "4") {
        this.$message.warning(this.$t("cgnTask.tips.withdrawTermination"));
        return;
      }

      this.taskWithdrawDialog.procDefId = row.procId;
      this.taskWithdrawDialog.procTaskId = row.id;
      this.taskWithdrawDialog.procInstId = row.procInstId;
      this.taskWithdrawDialog.procActId = row.procActId;
      this.taskWithdrawDialog.cosignItemCode = row.cosignItemCode;
      this.taskWithdrawDialog.cosignItemName = row.cosignItemName;
      this.taskWithdrawDialog.userId = row.assigneeId;
      this.taskWithdrawDialog.userName = row.assigneeName;
      this.taskWithdrawDialog.isOpen = true;
    },
    flowDetailFn(row) {
      this.row = row
      this.isShow = true
    },
    closeFlowDetailDialog() {
      this.isShow = false
    },
    flowRecordFn(row) {
      this.row = row
      this.flowRecordShow = true
    },
    closeFlowRecordDialog() {
      this.flowRecordShow = false
    },
    view(row) {
      let dataInfo = {
        // 流程ID
        procId: row.procId,
        // 流程版本
        procVersion: row.taskExtend01,
        // 流程名
        procName: row.procDefName,
        // 流程实例ID
        procInstId: row.procInstId,
        // 类型 // 1 发起页面 / 2 待办页面 / 3 已办页面 / 4 草稿页面
        procNode: 3,
        // 活动ID
        actId: row.procActId,
        // 活动实例ID
        actInstId: row.procActInstId,
        // 活动名
        actName: row.procActName,
        // 上一操作流程环节id
        sentByProcActId: row.sentByProcActId,
        // 流程模型ID
        procModelId: row.pscModelId,
        // 任务ID
        procTaskId: row.id,
        // 会签ID
        cosignItemCode: row.cosignItemCode,
        procInstStatus: row.procInstStatus,
        endTime: row.endTime,
        actCode: row.actCode,
        // 流程状态
        flowStatus: "2"
      };
      sessionStorage.removeItem("procItem");
      sessionStorage.setItem("procItem", JSON.stringify(dataInfo));
      //打开页签
      this.openTab({
        path: "/workbench/view",
        query: {
          // item: dataInfo
          procName: dataInfo.procName,
          r: Math.random()
        }
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

    //会签下拉改变
    selectScChange(val, row) {
      this.scItemCofList.forEach((i) => {
        if (val === i.scItemCofCode) {
          row.name = i.scItemCof;
          row.scItemCofCode = i.scItemCofCode;
          row.scItemCofEn = i.scItemCofEn;
        }
      });
    },
    //---===
  }
};
