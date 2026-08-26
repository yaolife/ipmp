//引入组件
import breadcrumb from "@/components/common/breadcrumb";
import ApiTask from "@/components/cgnTask/common/ApiTask";
import TaskViewShowDialog from "@/components/cgnTask/components/dialog/TaskViewShowDialog";
import cmsg from "@/components/common/message";
import { throttle } from "@/utils/funcUtil";
import * as Utils from "@/utils/Utils";
import osUtil from "@/utils/osUtil";
import api from '../api'
import personSelect from "@@/components/easy-cud-person-select";
import { calcHeight } from "@/utils/funcUtil";

export default {
  components: {
    breadcrumb,
    TaskViewShowDialog,
    personSelect
  },
  //初始化树和查询流程模板
  mounted() {
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
  },

  beforeDestroy() {
    window.removeEventListener("resize", this.throttleFunc);
  },
  data() {
    return {
      hasIcon: false,
      brand: [
        { name: "流程运维" },
        { name: "挂起任务" }
      ],
      height: 0,
      loading: false,
      listLoading: false,
      //流程模板列表属性
      processTemplateVo: {
        procName: "",
        procSubject: "",
        startTimeBegin: "",
        startTimeEnd:'',
        a_no: "",
        time:''
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

      maxTreeHeight: 0,
      maxTableHeight: 0,
      maxRightHeight: 0,

      //激活弹窗条件
      isActive: false,
      activeForm: { input: '' },

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
      let data = {
        "procName": "",// 流程名
        "procSubject": this.processTemplateVo.procSubject,
        "status": "1", // 1为挂起状态
        "startUserId": this.processTemplateVo.procName.userId, // 发起人ID
        "startTimeBegin": this.processTemplateVo.time !== '' ? this.processTemplateVo.time[0] : '',
        "startTimeEnd": this.processTemplateVo.time !== '' ? this.processTemplateVo.time[1] : '',
        "dataSource": "",
        "pageIndex": 1,
        "pageSize": 10
      };

      if (init) {
        data.pageIndex = 1;
        data.pageSize = 10;
      } else {
        data.pageIndex = this.tablePage.pageIndex;
        data.pageSize = this.tablePage.pageSize;
      }

      api.queryTaskList(data).then(result => {
        this.listLoading = false;

        if (result.data.code == "0") {
          // console.log('abcde', result.data)
          this.tableData = result.data.records;
          this.toPageApi(result.data);

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
    //点击查询按钮
    searchProcessTemplates() {
      this.queryProcessList(true);
    },
    //点击重置按钮
    resetProcessTemplate() {
      this.processTemplateVo = {
        procName: "",
        procSubject: "",
        startTimeBegin: "",
        startTimeEnd:'',
        a_no: "",
        time:''
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
    //接口赋值分页数据
    toPageApi(res) {
      this.tablePage.pageIndex = res.current;
      this.tablePage.pageSize = res.size;
      this.tablePage.total = res.total;
    },
    //激活弹窗
    openActiveDialog() {
      if (this.mulSelect.length > 0) {
        this.isActive = !this.isActive;
        this.activeForm.input = '';
        //this.$refs.activeForm.resetFields();
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

          this.$confirm("确定激活此流程实例？", "提示", {
            type: "warning",
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            cancelButtonClass: "btn-second",
            confirmButtonClass: "btn-default"
          }).then(() => {

            this.mulSelect.forEach((item) => {
              console.log(this.mulSelect)
              this.procInstRecover(item);
            })

          }).then(() => {

            setTimeout(() => {
              this.queryProcessList();
            }, 100)

          }).catch(() => {
            cmsg.cancelMessage(this);
          });



        } else {
          return false
        }
      })
    },

    // 流程实例-恢复
    procInstRecover(row) {
      if (row.status == 2) {
        this.$message.error("流程实例为已完成状态，不能恢复");
        return;
      }

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
          //this.queryProcessList();

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

    },

    //任务操作：查看流程图
    onTaskViewFlowChart(row) {
      this.taskViewShowDialog.procInstId = row.id;
      this.taskViewShowDialog.procDefId = row.processId;
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

    //点击table 激活图标
    handleActiveIcon(row) {
      this.isActive = true;
      this.mulSelect = [row]
    },

    //关闭 激活弹窗 回调
    closeActiveDialog() {
      this.mulSelect = []
      this.activeForm.input = ''
      this.$refs.table.clearSelection();
      this.$refs['activeForm'].resetFields();
    },

    dateFormat(str) {
      let day = 30 * 86400; // 30 * 一天的秒数
      let time = this.timeToNum(str) + day;

      const timer = new Date(Number(time) * 1000)
      const Y = timer.getFullYear()
      const M = timer.getMonth() + 1 >= 10 ? timer.getMonth() + 1 : '0' + (timer.getMonth() + 1)
      const D = timer.getDate() >= 10 ? timer.getDate() : '0' + timer.getDate()
      const h = timer.getHours() >= 10 ? timer.getHours() : '0' + timer.getHours()
      const m = timer.getMinutes() >= 10 ? timer.getMinutes() : '0' + timer.getMinutes()
      const s = timer.getSeconds() >= 10 ? timer.getSeconds() : '0' + timer.getSeconds()
      return `${Y}-${M}-${D} ${h}:${m}:${s}`
    },

    timeToNum(str){
      // 例 str = '2023-08-08 10:24:46'
      return Date.parse(new Date(str.replace('-','/'))) / 1000
    },

    showOperate(time){
      let val = true;
      let day = (this.timeToNum(time) + (30 * 86400)) * 1000;
      if(Date.now() > day){
        val = false
      }
      return val
    },

    checkBoxT(row,index){
      return this.showOperate(row.timeStamp)
    },

  }
};
