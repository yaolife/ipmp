//引入组件
import breadcrumb from "@/components/common/breadcrumb";
import cmsg from "@/components/common/message";
import { throttle } from "@/utils/funcUtil";
import PersonSelect from '@/components/asc/PersonSelect'
import personSelect from "@@/components/easy-cud-person-select";
import api from '../api'
import ApiTask from "@/components/cgnTask/common/ApiTask";
import TaskViewShowDialog from "@/components/cgnTask/components/dialog/TaskViewShowDialog";
import * as Utils from "@/utils/Utils";
import osUtil from "@/utils/osUtil";
import { calcHeight } from "@/utils/funcUtil";

export default {
  components: {
    breadcrumb,
    PersonSelect,
    personSelect,
    TaskViewShowDialog

  },
  //初始化树和查询流程模板
  mounted() {
    this.queryProcessList(true);
    this.initMaxHeight();
    // throttleFunc记录当前的节流方法，用于在页面销毁时释放
    this.throttleFunc = throttle(this.initMaxHeight, 500);
    window.addEventListener("resize", this.throttleFunc);
    window.addEventListener('visibilitychange', this.onVisibilityChange);
  },
  computed: {
    computedTreeHeight() {
      return this.maxTreeHeight;
    },
    computedTableHeight() {
      return this.maxTableHeight;
    },
  },

  beforeDestroy() {
    window.removeEventListener("resize", this.throttleFunc);
    window.removeEventListener('visibilitychange', this.onVisibilityChange);
  },
  data() {
    return {
      hasIcon: false,
      brand: [
        { name: "流程运维" },
        { name: "异常任务" }
      ],
      height: 0,
      loading: false,
      listLoading: false,
      //流程模板列表属性
      processTemplateVo: {
        "user": '',
        "procTitle": "",
        "startUser": "",
        "startTime": "",
        "endTime": "",
        "dateFlag": "",
        "time": ''
      },
      tableData: [],
      //分页
      tablePage: {
        pageIndex: 1,
        pageSize: 10,
        total: 0
      },
      //表格选中
      mulSelect: [],
      isTreeCollapse: false,
      dialogVisible: false,
      maxTreeHeight: 0,
      maxTableHeight: 0,
      maxRightHeight: 0,

      simulationParamsForm: {
        input: '',
        txt: '',
      },

      AssList: [],

      isHidden: false, // 页面是否被隐藏
      isToTask: false, // 是否打开新页面

      //--
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
      //--
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
      //let params = {};

      let params = {
        "currentPage": "",
        "pageSize": "",
        "procTitle": this.processTemplateVo.procTitle,
        "startUser": this.processTemplateVo.startUser,
        "startTime": this.processTemplateVo.startTime,
        "endTime": this.processTemplateVo.endTime,
        "dateFlag": this.processTemplateVo.dateFlag, //超时=1，即将超时=2
        "dataType": ""
      }


      if (init) {
        params.currentPage = '1';
        params.pageSize = '10';
      } else {
        params.currentPage = this.tablePage.pageIndex + '';
        params.pageSize = this.tablePage.pageSize + '';
      }


      api.selectAaaList(params).then(result => {

        this.listLoading = false;

        if (result.data.code == "0") {

          if (result.data.data) {
            this.toPageApi(result.data.data);
            this.tableData = result.data.data.records;
            this.AssList = result.data.data.AssList;
          } else {
            this.tableData = []
            this.AssList = []
          }

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

    // 展示异常类型-字段
    showException(params) {
      let it = this.AssList.filter((item) => { return item.procInstId == params });
      let txt = '';

      if (!!it) {
        if (it[0].dateFlag == '1') {
          txt = '超时'
        }

        if (it[0].dateFlag == '2') {
          txt = '即将超时'
        }
      }

      return txt
    },

    //接口赋值分页数据
    toPageApi(res) {
      this.tablePage.pageIndex = res.current;
      this.tablePage.pageSize = res.size;
      this.tablePage.total = res.total;
    },

    //点击查询按钮
    searchProcessTemplates() {

      if (this.processTemplateVo.user !== '') {
        this.processTemplateVo.startUser = this.processTemplateVo.user.userId;
      }

      if (this.processTemplateVo.time.length > 0) {
        this.processTemplateVo.startTime = this.processTemplateVo.time[0]
        this.processTemplateVo.endTime = this.processTemplateVo.time[1]
      }

      this.tablePage.pageIndex = 1
      this.queryProcessList(true);

    },
    //点击重置按钮
    resetProcessTemplate() {
      this.processTemplateVo = {
        "user": '',
        "procTitle": "",
        "startUser": "",
        "startTime": "",
        "endTime": "",
        "dateFlag": "",
        "time": ''
      }
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

    callName: function (value) {
      this.simulationParamsForm.input = value;
      this.$refs['simulationForm'].clearValidate('input');
    },

    // 展示-处理情况
    showhandSit(params){
      let it = this.AssList.filter((item) => { return item.procInstId == params });
      return it[0].isRep
    },

    // 修复按钮
    addWfTemplateDesignFun() {
      if (this.mulSelect.length !== 1) {
        this.$message.warning('请选择一条数据！');
        return
      }

      let it = this.AssList.filter((item) => { return item.procInstId == this.mulSelect[0].procInstId });
      if (it[0].isRep == '1') {

        this.$confirm("当前数据已被修复，是否重新修复？", "提示", {
          type: "warning",
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          cancelButtonClass: "btn-second",
          confirmButtonClass: "btn-default"
        }).then(() => {

          this.dialogVisible = !this.dialogVisible
          this.simulationParamsForm = {
            input: '',
            txt: '',
          }

        }).catch(() => {
          cmsg.cancelMessage(this);
        });

      } else {

        this.dialogVisible = !this.dialogVisible
        this.simulationParamsForm = {
          input: '',
          txt: '',
        }

      }


    },

    // 修复-提交
    submitProcess(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {

          this.mulSelect.forEach((item) => {
            this.detegateTask(item)
          })

        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },

    getPNumber(val) {
      let reg = /\[(.+?)\]/g
      let str = val.match(reg)
      return RegExp.$1
    },

    // 更换处理人
    detegateTask(row) {
      let userId = this.getPNumber(this.simulationParamsForm.input[0]);
      let userName = this.simulationParamsForm.input[0].split(']')[1];

      let data = {
        "procTaskId": row.id,
        "approvalComment": this.simulationParamsForm.txt,
        "assigneeList": [{ "userID": userId, "userName": userName }],
        "procInsID": row.procInstId,
        "actId": row.procActId,
        "noticeMethods": ""
      }

      api.detegateTask(data).then(res => {

        if (res.data.code === "0") {
          this.$message({
            showClose: true,
            message: res.data.msg,
            type: "success"
          });

          this.dialogVisible = false;
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

    // 修复弹窗-关闭
    closedApi() {
      this.$refs['simulationForm'].resetFields();
    },

    getRowPriority(priority) {
      switch (priority) {
        case "0":
          return "cgnTask.priority.low";
        case "1":
          return "cgnTask.priority.middle";
        case "2":
          return "cgnTask.priority.high";
      }
    },

    //点击table 激活图标
    handleActiveIcon(row) {
      this.$refs.table.clearSelection();
      this.mulSelect = [];
      this.mulSelect.push(row);

      this.addWfTemplateDesignFun();
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


    // 监听当前页被隐藏-打开
    onVisibilityChange() {
      this.isHidden = document.hidden;
      if (this.isHidden) {
        //console.log('当前页被隐藏')
      } else {
        //console.log('当前页被打开')
        if (this.isToTask) {

          setTimeout(() => {
            this.queryProcessList(true);
          }, 300)

          this.isToTask = false;
        }

      }
    },

    timeFormat(time) {
      if (time) {
        var oDate = new Date(time * 1),
          oYear = oDate.getFullYear(),
          oMonth = oDate.getMonth() + 1,
          oDay = oDate.getDate(),
          oHour = oDate.getHours(),
          oMin = oDate.getMinutes(),
          oSen = oDate.getSeconds(),
          oTime = oYear + '-' + this.getBz(oMonth) + '-' + this.getBz(oDay) + ' ' + this.getBz(oHour) + ':' + this.getBz(oMin) + ':' + this.getBz(oSen);//拼接时间
        return oTime;
      } else {
        return "";
      }
    },

    getBz(num) {
      if (parseInt(num) < 10) {
        num = '0' + num;
      }
      return num;
    }

    //====
  }
};
