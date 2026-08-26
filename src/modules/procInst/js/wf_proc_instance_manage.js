/*
 * @Author: P623437
 * @Date: 2021-09-08 14:27:25
 * @LastEditors: P623437
 * @LastEditTime: 2022-04-15 14:29:50
 * @Description: 流程模板管理
 */
//引入组件
import ApiTask from "../../../components/cgnTask/common/ApiTask";
import breadcrumb from "@/components/common/breadcrumb";
// import wfCommPersonComponent from "@@/components/cudCommPersonComponent/wfCommPersonComponent";
import api from "../api";
import cmsg from "@/components/common/message";
import { CgnBpmnMap } from "psc-module";
import osUtil from "@/utils/osUtil";
import * as Utils from "@/utils/Utils";
// import personSelect from "@@/components/easy-cud-person-select";
import queryForm from "@/components/common/queryForm";
import { calcHeight } from "@/utils/funcUtil";

export default {
  components: {
    breadcrumb,
    api,
    CgnBpmnMap,
    // personSelect
    queryForm
  },
  //初始化查询任务实例
  mounted() {
    this.queryProcInstList(true);
    this.initMaxHeight();
    this.getDataBase();
    this.getFwAuth();
    window.queryProcInstList = this.queryProcInstList;
  },
  data() {
    return {
      filters: Utils.Filters.splitTime,
      hasIcon: false,
      brand: [
        { name: "wm.workflow_manage" },
        { name: "wm.proc_instance_manage" }
      ],
      listLoading: true,
      entityDialogVisible: false,
      //分类的弹框是否显示
      model: {
        comment: ""
      },
      procInstId: "",
      processId: "",
      user: "",
      //查询任务实例列表属性
      ReqProcInstDto: {
        procName: "", //流程名
        procSubject: "", //工作主题
        startUserId: "", //发起人ID
        status: "", //状态
        startTimeBegin: "", //流程发起时间-开始
        startTimeEnd: "", //流程发起时间-结束
        dataSource: "", //归档库
        pageIndex: 1, //当前页
        pageSize: 10 //每页条数
      },
      activeName: [],
      processTableData: [],
      dataSourceList: [],
      //分页
      tablePage: {
        pageIndex: 1,
        pageSize: 10,
        total: 0
      },
      options: [
        { value: "0", label: "flow.status_run" },
        { value: "1", label: "flow.status_suspend" },
        { value: "2", label: "flow.status_complete" },
        { value: "3", label: "flow.status_abandon" },
        { value: "4", label: "flow.status_terminate" }
      ],
      maxTreeHeight: 0,
      maxTableHeight: 0,
      maxRightHeight: 0,
      instDateStart: ["", ""],
      advSearch: "cm.unfold",
      iconArrow: "el-icon-arrow-down",
      flowVO: {
        pscUrl: envConfig.PSC_ROOT || "/api",
        procInstId: "",
        accessToken: "",
        tenantId: "",
        appId: "",
        procDefId: ""
      },
      configflowDialogVisible: false,
      showStartUser: false,
      initUserId: "",
      rules: {
        comment: [
          {
            required: true,
            message: this.$t("cgnTask.tips.abandonReasonNotEmpty"),
            trigger: ["blur", "change"]
          }
        ]
      },
      //搜索字段
      queryFields: [
        { name: 'procSubject', label: '', labelKey: 'wm.procSubject', value: '', type: 'input', display: true, order: 1 },
        { name: 'procName', label: '', labelKey: 'wm.procName', value: '', type: 'input', display: true, order: 2 },
        { name: 'startUserId', label: '', labelKey: 'wm.start_user', value: '', type: 'personal', display: true, order: 3 },
        { name: 'startTimeBegin', label: '', labelKey: 'wm.start_time', value: '', type: 'dateRange', relation: 'startTimeEnd', display: true, order: 4 },
        {
          name: 'status', label: '', labelKey: 'cm.state', value: '', type: 'select', display: true, order: 5, fieldMap: [
            { value: "0", labelKey: "flow.status_run" },
            { value: "1", labelKey: "flow.status_suspend" },
            { value: "2", labelKey: "flow.status_complete" },
            { value: "3", labelKey: "flow.status_abandon" },
            { value: "4", labelKey: "flow.status_terminate" }
          ]
        }
      ],
    };
  },
  methods: {
    initMaxHeight() {
      calcHeight(this);
    },

    showStartUserDialog() {
      this.$refs.startUserInput.blur();
      this.initUserId = this.ReqProcInstDto.startUserId;
      this.showStartUser = true;
    },

    closeStartUserDialog() {
      this.showStartUser = false;
      this.initUserId = "";
    },

    clearStartUser() {
      this.ReqProcInstDto.startUserId = "";
      this.showOperaterUser = false;
      this.initUserId = "";
    },

    commitStartUser() {
      let actParticipantData = this.$refs.startUserId.getData();
      this.user = "";
      this.ReqProcInstDto.startUserId = "";
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
            for (let i = 0; i < userDataIds.length; i++) {
              this.user +=
                (i === 0 ? "" : ",") +
                "[" +
                userDataIds[i] +
                "]" +
                userDataNames[i];
              this.ReqProcInstDto.startUserId +=
                (i === 0 ? "" : ",") + userDataIds[i];
            }
          }
        }
      }
      this.closeStartUserDialog();
    },

    //高级搜索展开
    advanceSearch: function (val) {
      let _this = this;
      _this.advSearch = val ? "cm.fold" : "cm.unfold";
      _this.iconArrow = val ? "el-icon-arrow-up" : "el-icon-arrow-down";
      let timer = setTimeout(() => {
        _this.initMaxHeight();
        clearTimeout(timer)
      }, 335);
    },

    //高级搜索
    search: function () {
      (this.ReqProcInstDto.startTimeBegin =
        this.instDateStart === null ? "" : this.instDateStart[0]), //流程发起时间-开始
        (this.ReqProcInstDto.startTimeEnd =
          this.instDateStart === null ? "" : this.instDateStart[1]), //流程发起时间-结束
        this.initForm();
    },

    initForm() {
      this.listLoading = true;
      this.queryProcInstList(true).then(res => {
        if (res.code === "0") {
          this.tableData = res.records;
          this.total = res.total;
          this.listLoading = false;
        }
      });
    },

    //查看流程图
    showFlow(row) {
      this.flowVO.procDefId = row.processId;
      this.flowVO.procInstId = row.id;
      this.configflowDialogVisible = true;
    },
    // 权限信息取得
    getFwAuth() {
      let _this = this;
      api.postWfAuthAPI().then(res => {
        if (res.code === "0") {
          let data = res.data;
          _this.flowVO.tenantId = data.tenantId; // 租户ID
          _this.flowVO.appId = data.appId; // 应用ID，必填
          _this.flowVO.accessToken = data.accessToken; // 访问Token，必填
          // _this.flowVO.pscUrl = "/api";
        } else {
          _this.$message({
            message: res.msg,
            type: "warning"
          });
        }
      });
    },
    onElementEvent(e) { },
    onRenderComplete(e) { },

    getDataBase() {
      api
        .getDataBaseConfigApi()
        .then(result => {
          if (result.data.code === "0") {
            if (result.data.data["dataSource"]) {
              this.dataSourceList = result.data.data["dataSource"];
            }
          }
        })
        .catch(error => {
          cmsg.httpCatchErrorMessage(this);
        });
    },

    //流程实例列表
    queryProcInstList(init) {
      this.listLoading = true;
      let params = {};
      if (init) {
        params.pageIndex = 1;
        params.pageSize = this.tablePage.pageSize;
      } else {
        params.pageIndex = this.tablePage.pageIndex;
        params.pageSize = this.tablePage.pageSize;
      }
      let p = { ...this.ReqProcInstDto, ...params };
      api
        .getProcInstlistAPI(p)
        .then(result => {
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
    searchTaskInstList() {
      let queryForm = this.$refs.queryForm.getQueryForm();
      this.ReqProcInstDto.procSubject = queryForm.procSubject.trim();
      this.ReqProcInstDto.procName = queryForm.procName.trim();
      this.ReqProcInstDto.startUserId = queryForm.startUserId;
      this.ReqProcInstDto.startTimeBegin = queryForm.startTimeBegin;
      this.ReqProcInstDto.startTimeEnd = queryForm.startTimeEnd;
      this.ReqProcInstDto.status = queryForm.status;
      this.queryProcInstList(true);
    },
    //点击重置按钮
    resetTaskInst() {
      this.ReqProcInstDto.procName = ""; //流程名
      this.ReqProcInstDto.procSubject = ""; //工作主题
      this.ReqProcInstDto.startUserId = ""; //发起人ID
      this.ReqProcInstDto.status = ""; //状态
      this.ReqProcInstDto.startTimeBegin = ""; //流程发起时间-开始
      this.ReqProcInstDto.startTimeEnd = ""; //流程发起时间-结束
      this.ReqProcInstDto.dataSource = ""; //归档库
      this.instDateStart = ["", ""];
      // this.user = "";
      this.$refs.personSelect.clear()
    },
    //改变每页显示多少条数据
    changeSize(pageSize) {
      this.tablePage.pageSize = pageSize;
      this.tablePage.pageIndex = 1;
      this.queryProcInstList();
    },
    //改变页数
    changeCurrentPage(current) {
      this.tablePage.pageIndex = current;
      this.queryProcInstList();
    },

    //关闭弹窗
    entityDialogHandleClose() {
      (this.model.comment = ""),
        (this.procInstId = ""),
        (this.processId = ""),
        (this.entityDialogVisible = false);
    },
    //打开弹窗
    abandonDialogHandleOpen(row) {
      if (row.status == 2) {
        this.$message.error("流程实例为已完成状态，不能作废");
        return;
      }
      this.procInstId = row.id;
      // this.processId = row.processId;
      this.entityDialogVisible = true;
    },
    cancel() {
      (this.model.comment = ""),
        (this.procInstId = ""),
        (this.processId = ""),
        (this.entityDialogVisible = false);
    },
    view(row) {
      // let dataInfo = {
      //   // 流程ID
      //   procId: row.processId,
      //   // 流程版本
      //   procVersion: row.taskExtend01,
      //   // 流程名
      //   procName: row.procName,
      //   // 流程实例ID
      //   procInstId: row.id,
      //   // 类型 // 1 发起页面 / 2 待办页面 / 3 已办页面 / 4 草稿页面
      //   procNode: 3,
      //   // 活动ID
      //   // actId: row.procActId,
      //   // 活动实例ID
      //   // actInstId: row.procActInstId,
      //   // 活动名
      //   // actName: row.procActName,
      //   // 上一操作流程环节id
      //   // sentByProcActId: row.sentByProcActId,
      //   // 流程模型ID
      //   procModelId: row.procModelId,
      //   // 任务ID
      //   procTaskId: row.id,
      //   // 会签ID
      //   // cosignItemCode: row.cosignItemCode,
      //   // procInstStatus: row.procInstStatus,
      //   endTime: row.endTime,
      //   // actCode: row.actCode,
      //   // 流程状态
      //   flowStatus: "2"
      // };

      let dataInfo = {
        // 流程ID
        procId: row.processId,
        // 流程名
        procName: row.procName,
        // 流程实例ID
        procInstId: row.id,
        // 类型 // 1 发起页面 / 2 待办页面 / 3 已办页面 / 4 草稿页面
        procNode: 3,
        // 活动ID
        // actId: row.procActId,
        // 活动实例ID
        // actInstId: row.procActInstId,
        // 活动名
        // actName: row.procActName,
        // 流程模型ID
        procModelId: row.procModelId,
        // 任务ID
        // procTaskId: row.id,
        // 会签ID
        // cosignItemCode: row.cosignItemCode,
        // procInstStatus: row.procInstStatus,
        endTime: row.endTime,
        // actCode: row.actCode,
        // 流程状态
        flowStatus: "2"
      };
      console.log(dataInfo, row, 'dataInfo')
      sessionStorage.removeItem("procItem");
      sessionStorage.setItem("procItem", JSON.stringify(dataInfo));
      // 待办列表，验证任务是否被任务，被处理刷新列表，未被处理打开新页面
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

    removeInvalidProcess: function (row) {
      this.$confirm("确定要删除吗？", "提示", {
        type: "warning",
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        cancelButtonClass: "btn-second",
        confirmButtonClass: "btn-default"
      }).then(() => {
        api.removeInvalidProcessAPI({
          appCode: row.appCode,
          appId: row.appId,
          id: row.id,
          priority: row.priority,
          processId: row.processId,
          tenantId: row.tenantId
        }).then(res => {

          if (res.code === "0") {
            this.queryProcInstList(false);
          }

        }).catch(e => {
          cmsg.httpCatchErrorMessage(this);
        })
      }).catch(() => {
        cmsg.cancelMessage(this);
      })
    },

    // 流程实例-编辑
    procInstUpdate: function (row) {
      let query = {
        appCode: row.appCode,
        appId: row.appId,
        createTime: row.createTime,
        creatorId: row.creatorId,
        creatorName: row.creatorName,
        endTime: row.endTime,
        id: row.id,
        parentProcInstId: row.parentProcInstId,
        priority: row.priority,
        procInstExtend01: row.procInstExtend01,
        procInstExtend02: row.procInstExtend02,
        procInstExtend03: row.procInstExtend03,
        procInstExtend04: row.procInstExtend04,
        procInstExtend05: row.procInstExtend05,
        procModelId: row.procModelId,
        procSubject: row.procSubject,
        processCode: row.processCode,
        processId: row.processId,
        rev: row.rev,
        sourceProcInstId: row.sourceProcInstId,
        startDeptId: row.startDeptId,
        startDeptName: row.startDeptName,
        startDeptpath: row.startDeptpath,
        startTime: row.startTime,
        startUserId: row.startUserId,
        startUserName: row.startUserName,
        status: row.status,
        tenantId: row.tenantId,
        timeStamp: row.timeStamp,
        updateTime: row.updateTime,
        updaterId: row.updaterId,
        updaterName: row.updaterName,
        procName: row.procName
      }
      //打开页签
      this.openTab({
        path: "/wf_proc_instance_manage_update",
        query: query
      });
    },
    // 流程实例-作废提交
    procInstAbandon: function () {
      const loading = this.$loading();
      this.$refs["ruleForm"].validate(valid => {
        if (valid) {
          let param = {};
          param = this.currentRow;
          param.comment = this.model.comment;
          param.procInsID = this.procInstId;
          api.abandonProcInstAPI(param).then(res => {
            loading.close();
            let data = res;
            if (data.code === "0") {
              this.$message({
                showClose: true,
                message: data.msg,
                type: "success"
              });
              this.cancel();
              this.queryProcInstList();
            } else {
              this.$message({
                showClose: true,
                message: data.msg,
                type: "warning"
              });
            }
          }).catch(() => {
            loading.close();
          });
        } else {
          loading.close();
        }
      });
    },

    // 流程实例 - 终止
    procInstTerminate(row) {
      if (row.status == 2) {
        this.$message.error("流程实例为已完成状态，不能终止");
        return;
      }
      this.$confirm("确定终止此流程实例？", "提示", {
        type: "warning",
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        cancelButtonClass: "btn-second",
        confirmButtonClass: "btn-default"
      })
        .then(() => {
          let param = {};
          param = this.currentRow;
          param.procInsID = row.id;
          api
            .terminateProcInstAPI(param)
            .then(res => {
              let data = res;
              if (data.code === "0") {
                this.$message({
                  showClose: true,
                  message: data.msg,
                  type: "success"
                });
                this.queryProcInstList();
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

    // 流程实例-挂起
    procInstHangup(row) {
      this.currentRow = row;
      if (row.status == 2) {
        this.$message.error("流程实例为已完成状态，不能挂起");
        return;
      }
      this.$confirm("确定挂起此流程实例？", "提示", {
        type: "warning",
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        cancelButtonClass: "btn-second",
        confirmButtonClass: "btn-default"
      })
        .then(() => {
          let param = {};
          param = this.currentRow;
          param.procInsID = row.id;
          api
            .hangupProcInstAPI(param)
            .then(res => {
              let data = res;
              if (data.code === "0") {
                this.$message({
                  showClose: true,
                  message: data.msg,
                  type: "success"
                });
                this.queryProcInstList();
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
    // 流程实例-恢复
    procInstRecover(row) {
      this.currentRow = row;
      if (row.status == 2) {
        this.$message.error("流程实例为已完成状态，不能恢复");
        return;
      }
      this.$confirm("确定恢复此流程实例？", "提示", {
        type: "warning",
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        cancelButtonClass: "btn-second",
        confirmButtonClass: "btn-default"
      })
        .then(() => {
          let param = {};
          param = this.currentRow;
          param.procInsID = row.id;
          api
            .recoverProcInstAPI(param)
            .then(res => {
              let data = res;
              if (data.code === "0") {
                this.$message({
                  showClose: true,
                  message: data.msg,
                  type: "success"
                });
                this.queryProcInstList();
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
    // 流程实例-激活
    procInstActive(row) {
      this.currentRow = row;
      if (row.status == 3) {
        this.$message.error("流程实例为作废状态，不能激活");
        return;
      }

      if (row.status == 2) {
        this.$message.error("流程实例为完成状态，不能激活");
        return;
      }

      this.$confirm("确定激活此流程实例？", "提示", {
        type: "warning",
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        cancelButtonClass: "btn-second",
        confirmButtonClass: "btn-default"
      })
        .then(() => {
          this.listLoading = true;
          let param = {};
          param = this.currentRow;
          param.procInstId = row.id;
          param.processId = row.processId;
          api
            .activeProcInstAPI(param)
            .then(res => {
              let data = res;
              if (data.code === "0") {
                setTimeout(() => {
                  this.$message({
                    showClose: true,
                    message: data.msg,
                    type: "success"
                  });
                  this.queryProcInstList(true);
                }, 3000);
              } else {
                this.listLoading = false;
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
    moreCommandHandler(command) {
      let param = command.param;
      this.currentRow = param;
      switch (command.optFlag) {
        case "abandon":
          this.abandonDialogHandleOpen(param);
          break;
        case "terminate":
          this.procInstTerminate(param);
          break;
        case "active":
          this.procInstActive(param);
          break;
        case "deleteProcess":
          this.deleteProcess(param);
          break;
        default:
          break;
      }
    },
    beforeMoreCommandHandler(optFlag, param) {
      // this.currentRow = param;
      return {
        optFlag: optFlag,
        param: param
      };
    },
    deleteProcess(row) {
      this.$confirm('此操作将删除该流程实例, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        api.deleteProcInstAPI([row.id]).then(res => {
          if (res.code === "0") {
            this.$message.success('删除成功')
            this.queryProcInstList(true);
          }
        })
      })
    }
  },
  computed: {
    computedTableHeight() {
      return this.maxTableHeight;
    }
  }
};
