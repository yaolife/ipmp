import breadcrumb from "@/components/common/breadcrumb";
import api from "../api";
import procTree from "../procTree.vue";
import { formatTimeDate } from "@/utils/datetime";
// import wfCommPersonComponent from "@@/components/cudCommPersonComponent/wfCommPersonComponent.vue";
import _ from "lodash";
import WfCheckboxSelect from "@/components/wfSelect/wf-checkbox-select.vue";
import WfCheckboxShow from "@/components/wfSelect/wf-checkbox-show.vue";
// import personSelect from "@@/components/easy-cud-person-select";
import * as Utils from "@/utils/Utils";
import queryForm from "@/components/common/queryForm";
import { throttle } from "@/utils/funcUtil";
import { calcHeight } from "@/utils/funcUtil";

export default {
  components: {
    breadcrumb,
    procTree,
    WfCheckboxSelect,
    WfCheckboxShow,
    // personSelect
    queryForm
  },
  data: function () {
    return {
      selectUserTitle: "",
      showFlag: false,
      checkedPressList: [],
      checkedPressShowList: [],
      initUserId: "",
      hasIcon: false,
      brand: [
        { name: "workbench.workbench" },
        { name: "workbench.my_delegation" }
      ],
      ascUrl: envConfig.ASC_ROOT,
      tableData: [],
      showDialog: false,
      showDialogType: "",
      showUserMultiple: false, // 选人组件是否多选
      sendTreeData: {
        id: "",
        label: "",
        delegationDetailId: ""
      },
      data: [11, 22, 33],
      //新增编辑对象
      model: {
        procName: "",
        fromUserId: "",
        toUserId: "",
        delegationDate: [],
        startTime: "",
        endTime: "",
        description: ""
      },
      queryFields: [
        { name: 'procName', label: '', labelKey: 'workbench.process_name', value: '', type: 'input', display: true, order: 1 },
        { name: 'toUserId', label: '', labelKey: 'workbench.delegation_user', value: '', type: 'personal', display: true, order: 2 },
        { name: 'startTime', label: '', labelKey: 'workbench.delegation_date', relation: 'endTime', value: '', type: 'dateRange', display: true, order: 3 },
      ],
      //查询条件对象
      modelV0: {
        description: "",
        delegationStatus: 0,
        procName: "",
        fromUserId: "",
        startTime: "",
        endTime: "",
        pageIndex: 1,
        pageSize: 10
      },
      userInfo: {
        userID: "",
        userName: ""
      },

      delModel: {
        delegationId: ""
      },
      flowVO: {
        showFromUser: "",
        showToUser: "",
        delegationId: "",
        delegationDate: [],
        startTime: "",
        fromUserId: "",
        toUserId1: [],
        fromUserName: "",
        toUserId: "",
        toUserName: "",
        endTime: "",
        assigneeList: {},
        delegatedUser: {
          userID: "",
          userName: ""
        }, //被代理人
        authorization: 1,
        delegationDetail: [],
        nearUser: [],
        delegateScope: 0,
        detailSize: "",
        assigneeLists: [],
        description: "",
        procCheckBoxSelect: ""
      },
      delegationData: {
        procId: "",
        procName: ""
      },
      userProp: {
        userID: "",
        userName: ""
      },
      treeData: [],
      currentPage: 1,
      current: 1,
      pageSize: 10,
      size: 10,
      total: 0,
      multipleSelection: [],
      show: false,
      loading: false,
      fullscreenLoading: false,
      maxTableHeight: 0,
      saveIsAdd: "1",
      initProcName: "",
      configflowDialogVisible: false,
      checkData: [],
      titleType: "",
      checkAll: true,
      userModel: [],
      flowRules: {
        delegationDate: [
          {
            type: "array",
            required: true,
            message: this.$t("cm.required"),
            fields: {
              0: {
                type: "string",
                required: true,
                message: this.$t("cm.required")
              },
              1: {
                type: "string",
                required: true,
                message: this.$t("cm.required")
              }
            }
          }
        ],
        toUserId1: [
          { required: true, message: this.$t("cm.required"), trigger: "change" }
        ],
        procCheckBoxSelect: [
          { required: true, message: this.$t("cm.required"), trigger: "change" }
        ],
        description: [
          { required: true, message: this.$t("cm.required"), trigger: "change" }
        ]
      },
      paramList: [],
      activeName: "delegation1"
    };
  },
  computed: {
    computedTableHeight() {
      return this.maxTableHeight;
    }
  },

  methods: {
    //删除空格
    trimDescription() {
      this.flowVO.description = this.flowVO.description.trim();
    },
    /**
     * 接受子组件调用的关闭弹出框方法
     */
    closeChildDialog() {
      this.showFlag = false;
    },
    processCheckCallback(data) {
      var delegationDetailList = [];
      this.checkedPressList = [];
      for (let index in data) {
        let proc = { procId: data[index].id, procName: data[index].label };
        this.checkedPressList.push(data[index].id);
        delegationDetailList.push(proc);
      }
      this.flowVO.delegationDetail = delegationDetailList;
    },
    // 部分流程选择
    procCheckClick() {
      this.delegateScope = this.flowVO.delegateScope;
      this.flowVO.procCheckBoxSelect = "";
      this.initProcName = "";
      this.checkedPressList = [];
      this.flowVO.delegationDetail = [];
    },
    // format
    dateTimeFormat(data) {
      return formatTimeDate(data);
    },
    splitTime(data){
      return data.split(" ")[0]
    },
    setDetailSize(data) {
      if (data == undefined || data.length == 0) {
        return this.$t("workbench.all_process");
      }
      var procename = "";
      for (var index in data) {
        if (procename == "") {
          procename = Utils.Filters.processName(
            data[index],
            this.$i18n,
            "procName",
            "procEnName"
          );
        } else {
          procename =
            procename +
            "," +
            Utils.Filters.processName(
              data[index],
              this.$i18n,
              "procName",
              "procEnName"
            );
        }
      }
      return procename;
    },
    clickUser(item) {
      let setData = true;
      this.flowVO.toUserId1.forEach(data => {
        if (data.userID === item.userID) {
          setData = false;
        }
      });
      if (setData) {
        let participantData = {};
        participantData.userID = item.userID;
        participantData.userName = item.userName;
        this.flowVO.toUserId1.push(participantData);
      }
      let ids = "";
      let users = "";
      for (let i = 0; i < this.flowVO.toUserId1.length; i++) {
        ids += (i === 0 ? "" : ",") + this.flowVO.toUserId1[i].userID;
        users +=
          (i === 0 ? "" : ",") +
          "[" +
          this.flowVO.toUserId1[i].userID +
          "]" +
          this.flowVO.toUserId1[i].userName;
      }
      this.initUserId = ids;
      this.flowVO.showFromUser = users;
    },
    //计算天数
    getDateNumber(data1, data2) {
      let date1 = this.splitTime(data1);
      let date2 = this.splitTime(data2);
      let starDate = Date.parse(date1.replace(/-/g, '/'));
      let endDate = Date.parse(date2.replace(/-/g, '/'));
      return (endDate - starDate) / (1 * 24 * 60 * 60 * 1000) + 1;
    },
    // 查看时部分流程回显
    handleClick(row) {
      this.checkedPressShowList = [];
      if (row.delegateScope == 1) {
        for (let i = 0; i < row.delegationDetail.length; i++) {
          this.checkedPressShowList.push(row.delegationDetail[i].procId);
        }
      } else {
        //选中全部
        this.checkedPressShowList.push("****");
      }
      this.showFlag = true;
    },
    // 动态计算高度
    initMaxHeight() {
      calcHeight(this);
    },
    //新增/编辑关闭
    configFlowDialogHandleClose() {
      this.clearflowVO();
      this.configflowDialogVisible = false;
    },
    //新增/编辑关闭时情况数据
    clearflowVO() {
      this.configflowDialogVisible = false;
      this.flowVO.authorization = 1;
      this.flowVO.delegateScope = 0;
      this.flowVO.delegationDate = [];
      this.flowVO.fromUserId = "";
      this.flowVO.fromUserName = "";
      this.flowVO.startTime = "";
      this.flowVO.endTime = "";
      this.flowVO.showFromUser = "";
      this.flowVO.description = "";
      this.flowVO.procCheckBoxSelect = "";
      this.flowVO.delegationDetail = [];
      this.flowVO.toUserId1 = [];
      this.flowVO.assigneeLists = [];
      this.flowVO.nearUser = [];
      this.flowVO.paramList = [];
      this.initUserId = "";
      this.checkedPressList = [];
      this.$refs.itemForm.resetFields()
    },

    //添加打开子画面
    add() {
      this.saveIsAdd = "1";
      this.configflowDialogVisible = true;
      this.titleType = this.$t("workbench.add_delegation");
      let _this = this;
      _this.loading = true;
      api
        .getRecentUserAPI()
        .then(result => {
          _this.loading = false;
          if (result.code === "0") {
            _this.flowVO.nearUser = result.data;
          } else {
            _this.$message({
              message: result.msg,
              type: "warning"
            });
          }
        })
        .catch(err => {
          _this.$message({
            message: err,
            type: "warning"
          });
        });
    },

    //更新打开子画面
    updateOrCopyClick(row, saveIsAdd) {
      this.saveIsAdd = saveIsAdd;
      this.configflowDialogVisible = true;
      this.titleType = this.$t("workbench.save_delegation");
      this.flowVO.delegationId = row.delegationId;
      this.flowVO.delegationDate = [];
      this.flowVO.delegationDate.push(this.splitTime(row.startTime));
      this.flowVO.delegationDate.push(this.splitTime(row.endTime));
      this.flowVO.delegationDetail = row.delegationDetail;
      this.flowVO.fromUserId = row.fromUserId;
      this.flowVO.fromUserName = row.fromUserName;
      this.flowVO.toUserId = row.toUserId;
      this.flowVO.toUserName = row.toUserName;
      this.flowVO.description = row.description;
      this.flowVO.showFromUser = "[" + row.toUserId + "]" + row.toUserName;
      this.flowVO.toUserId1 = [];
      let participantData = {};
      participantData.userID = row.toUserId;
      participantData.userName = row.toUserName;
      this.flowVO.toUserId1.push(participantData);
      this.flowVO.delegateScope = row.delegateScope;
      this.checkedPressList = [];
      this.initProcName = "";
      if (row.delegateScope == 1) {
        let showLable = [];
        for (let index in row.delegationDetail) {
          this.checkedPressList.push(row.delegationDetail[index].procId);
          showLable.push(row.delegationDetail[index].procName);
        }
        this.initProcName = showLable.join(",");
        this.flowVO.procCheckBoxSelect = this.checkedPressList.join(",");
      }
      this.loading = true;
      // let _this = this;
      // let params = {};
      // params = Object.assign(params, _this.flowVO);
      // api
      //   .getTransFinancalAPI(params)
      //   .then(result => {
      //     _this.loading = false;
      //     if (result.code === "0") {
      //       _this.flowVO.authorization = result.data;
      //     } else {
      //       _this.$message({
      //         message: result.msg,
      //         type: "warning"
      //       });
      //     }
      //   })
      //   .catch(err => {
      //     _this.$message({
      //       message: err,
      //       type: "warning"
      //     });
      //   });
      if (saveIsAdd == "1") {
        this.flowVO.delegationId = "";
        this.add();
      }
    },

    // 我的代理新增和编辑的保存
    save: function (rows) {
      //进行保存
      let _this = this;
      _this.$refs["itemForm"].validate(valid => {
        if (valid) {
          if (_this.saveIsAdd === "1") {
            let s =
              _this.flowVO.delegationDate[0] + " 00:00:00"
            let startDate = Date.parse(s.replace(/-/g, '/'));
            let n = formatTimeDate(new Date()) + " 00:00:00"
            let nowDate = Date.parse(n.replace(/-/g, '/'));
            console.log(startDate, nowDate, 'startDate')
            if (nowDate.valueOf() > startDate.valueOf()) {
              _this.$message({
                message: this.$t("workbench.delegation_date_limit"),
                type: "warning"
              });
              return;
            }
          }
          _this
            .$confirm(
              this.$t("workbench.do_add_delegation"),
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
              if (_this.saveIsAdd === "1") {
                _this.flowVO.assigneeLists = this.flowVO.toUserId1;
              } else {
                _this.userInfo.userID = _this.flowVO.toUserId;
                _this.userInfo.userName = _this.flowVO.toUserName;
                _this.flowVO.assigneeLists = [];
                _this.flowVO.assigneeList = _this.userInfo; //修改操作
                _this.flowVO.assigneeLists.push(_this.userInfo);
              }

              // _this.flowVO.delegatedUser = _this.userInfo;//被代理人的处理，预留
              let s = _this.flowVO.delegationDate[0] + " 00:00:00"
              _this.flowVO.startTime = Date.parse(
                s.replace(/-/g, '/')
              );
              let e = _this.flowVO.delegationDate[1] + " 23:59:59"
              _this.flowVO.endTime = Date.parse(
                e.replace(/-/g, '/')
              );
              _this.flowVO.authorization = parseInt(_this.flowVO.authorization);
              _this.flowVO.delegateScope = parseInt(_this.flowVO.delegateScope);
              _this.fullscreenLoading = true;
              if (_this.saveIsAdd === "1") {
                api
                  .saveAPI(_this.flowVO)
                  .then(result => {
                    _this.fullscreenLoading = false;
                    if (result.code === "0") {
                      _this.configFlowDialogHandleClose();
                      let params = {};
                      _this.modelV0.pageIndex = _this.current;
                      _this.modelV0.pageSize = _this.size;
                      _this.$message({
                        message: result.msg,
                        type: "success"
                      });
                      _this.resetData();
                      params = Object.assign(params, _this.modelV0);
                      _this.clearflowVO();
                      _this.getFlowList(params);
                    } else {
                      _this.$message({
                        message: result.msg,
                        type: "warning"
                      });
                    }
                  })
                  .catch(err => {
                    _this.$message({
                      message: err,
                      type: "warning"
                    });
                  });
              } else {
                api
                  .updateAPI(_this.flowVO)
                  .then(result => {
                    _this.fullscreenLoading = false;
                    if (result.code === "0") {
                      _this.configFlowDialogHandleClose();
                      let params = {};
                      _this.modelV0.pageIndex = _this.current;
                      _this.modelV0.pageSize = _this.size;
                      _this.$message({
                        message: result.msg,
                        type: "success"
                      });
                      _this.resetData();
                      _this.getFlowList(params);
                      _this.clearflowVO();
                      params = Object.assign(params, _this.modelV0);
                    } else {
                      _this.$message({
                        message: result.msg,
                        type: "warning"
                      });
                    }
                  })
                  .catch(err => {
                    _this.$message({
                      message: err,
                      type: "warning"
                    });
                  });
              }
            })
            .catch(() => {
              //取消操作
            });
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },

    //改变每页显示数
    handleSizeChange: function (size) {
      this.modelV0.pageIndex = this.current;
      this.modelV0.pageSize = size;
      let params = {
        current: 1,
        size: size
      };

      params = Object.assign(params, this.modelV0);
      this.getFlowList(params);
    },

    //翻页
    handleCurrentChange: function (current) {
      this.modelV0.pageIndex = current;
      this.modelV0.pageSize = this.size;
      let params = {
        current: current,
        size: this.size
      };
      params = Object.assign(params, this.modelV0);
      this.getFlowList(params);
    },
    //删除代理
    delClick(row) {
      let _this = this;
      _this
        .$confirm(_this.$t("cm.is_cancel"), _this.$t("cm.tips"), {
          type: "warning",
          confirmButtonText: _this.$t("cm.confirm"),
          cancelButtonText: _this.$t("cm.cancel"),
          cancelButtonClass: "btn-second",
          confirmButtonClass: "btn-default"
        })
        .then(() => {
          let params = {};
          _this.delModel.delegationId = row.delegationId;
          params = Object.assign(params, _this.delModel);
          this.fullscreenLoading = true;
          api
            .deleteAPI(params)
            .then(result => {
              _this.fullscreenLoading = false;
              if (result.code === "0") {
                _this.search(0);
              } else {
                _this.$message({
                  message: result.msg,
                  type: "warning"
                });
              }
            })
            .catch(err => {
              _this.$message({
                message: err,
                type: "warning"
              });
            });
        })
        .catch(() => {
          //取消操作
        });
    },

    //普通搜索
    search: function (val) {
      let queryForm;
      if (val == 0) {
        queryForm = this.$refs.queryForm1.getQueryForm();
      } else {
        queryForm = this.$refs.queryForm2.getQueryForm();
      }
      //除去搜索条件前后空格内容
      this.modelV0.procName = queryForm.procName.trim();
      this.modelV0.toUserId = queryForm.toUserId;
      this.modelV0.startTime = queryForm.startTime;
      this.modelV0.endTime = queryForm.endTime;

      this.modelV0.delegationStatus = val; //0有效，9无效代理

      let params = {
        pageIndex: 1,
        size: this.size
      };
      this.current = 1;
      params = Object.assign(params, this.modelV0);
      this.getFlowList(params);
    },
    // 有效代理和无效代理切换
    handleTabClick() {
      this.resetActivePosition(this.$refs.tabs.$el);
      this.resetData();
      let params = {};
      this.current = 1;
      this.modelV0.pageIndex = this.current;
      this.modelV0.size = this.size;
      if (this.activeName === "delegation1") {
        this.modelV0.delegationStatus = 0;
        params = Object.assign(params, this.modelV0);
        this.getFlowList(params);
      } else {
        this.modelV0.delegationStatus = 9;
        params = Object.assign(params, this.modelV0);
        this.getFlowList(params);
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
    //重置操作
    resetData() {
      // this.$refs.personSelectcompFirst.clear()
      // this.$refs.personSelectcompSecond.clear()
      this.model.procName = "";
      this.model.fromUserId = "";
      this.model.toUserId = {
        userId: "",
        userName: ""
      };
      this.model.delegationDate = [];
      this.model.description = "";
      // this.modelV0.fromUserId = '';
      this.modelV0.toUserId = "";
      this.modelV0.startTime = "";
      this.modelV0.endTime = "";
      this.modelV0.description = "";

      // document.getElementById("fromUserId").value = "";
    },

    //获取列表
    getFlowList: function (params) {
      this.values = false;
      this.loading = true;
      if (!params) {
        params = {
          current: this.current,
          size: this.size
        };
      }
      let _this = this;
      api.pageListAPI(params).then(res => {
        _this.loading = false;
        if (res.code === "0") {
          _this.tableData = res.records;
          _this.total = res.total;
        }
      });
    },
    // 打开代理人模态框
    openCreatorFunc(type, isMultiple) {
      this.showDialogType = type;
      this.showUserMultiple = isMultiple;
      this.showDialog = true;
    },
    // 关闭代理人模态框
    closeCreatorFunc() {
      this.showDialog = false;
    },
    // 选代理人回调
    commitCreatorFunc() {
      let _this = this;
      let userData = [];
      let creatorData = this.$refs.wfCommPersonComponentId.getData();
      if (creatorData) {
        userData = creatorData.get("userData");
        if (userData && userData.length > 0) {
          // 判断用户信息是否为空，不为空才插入数据
          if (
            userData[1] &&
            userData[1].length === 2 &&
            userData[1][0] !== ""
          ) {
            if (this.showDialogType === "searchFrom") {
              this.modelV0.fromUserId = userData[1][0]; //用于查询
              this.model.fromUserId = `[${userData[1][0]}]${userData[1][1]}`;
            } else if (this.showDialogType === "searchTo") {
              this.modelV0.toUserId = userData[1][0]; //用于查询
              this.model.toUserId = `[${userData[1][0]}]${userData[1][1]}`;
            } else if (this.showDialogType === "add") {
              let userDataIdsStr = userData[1][0];
              let userDataNamesStr = userData[1][1];
              let userDataIds = userDataIdsStr.split(";");
              let userDataNames = userDataNamesStr.split(";");
              let ids = "";
              let users = "";
              this.flowVO.toUserId1 = [];
              for (let i = 0; i < userDataIds.length; i++) {
                ids += (i === 0 ? "" : ",") + userDataIds[i];
                users +=
                  (i === 0 ? "" : ",") +
                  "[" +
                  userDataIds[i] +
                  "]" +
                  userDataNames[i];
                // 判断发起人的表格中是否存在添加过来的人
                let participantData = {};
                participantData.userID = userDataIds[i];
                participantData.userName = userDataNames[i];
                this.flowVO.toUserId1.push(participantData);
              }
              this.initUserId = ids;
              this.flowVO.showFromUser = users;
            }
          }
        }
      }
      this.showDialog = false;
    }
  },

  mounted() {
    let params = {
      current: 1,
      size: 10,
      delegationStatus: 0, //默认查询有效代理
      fromUserId: ""
    };
    //被代理人默认取登陆账号
    let user = sessionStorage.getItem("user");
    //切换用户的时候进入此页面获取不到用户信息，通过调后台接口获取
    if (user == null) {
      //获取当前用户
      api.getUserInfo({ t: Math.random() }).then(result => {
        sessionStorage.setItem("user", result.data.data.nowUserName);
        user = result.data.data.nowUserName;
        if (user.indexOf("[") > -1) {
          let temp = user.split("[")[1];
          temp = temp.split("]");
          this.modelV0.fromUserId = temp[0];
          params.fromUserId = this.modelV0.fromUserId;
        }
        this.getFlowList(params);
      });
    } else {
      if (user.indexOf("[") > -1) {
        let temp = user.split("[")[1];
        temp = temp.split("]");
        this.modelV0.fromUserId = temp[0];
        params.fromUserId = this.modelV0.fromUserId;
      }
      this.getFlowList(params);
    }
    this.initMaxHeight();
    // throttleFunc记录当前的节流方法，用于在页面销毁时释放
    this.throttleFunc = throttle(this.initMaxHeight, 500);
    window.addEventListener("resize", this.throttleFunc);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.throttleFunc);
  }
};
