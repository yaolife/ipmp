import ht from "@/api/http";
import api from "../api";
import PersonSelect from '@/components/asc/PersonSelect'
// import wfTestManageAPI from "../../../../cudcomponents/workflowModule/workflow/wfTestManage/api";
import _ from "lodash";
import { calcHeight } from "@/utils/funcUtil";
import { arrayLastIndexOf } from "xe-utils";
export default {
  components: {
    PersonSelect,
  },
  // watch: {
  //   groupRulesRelDM: {
  //     handler(n, o) {
  //       this.actList = [];
  //       this.validateError = false;
  //       this.rulesRelDM.map(item => {
  //         let obj = _.find(n, { "mockName": item.mockName });
  //         if (obj) {
  //           item.mockValue = obj.mockValue
  //         }
  //       })
  //       if (this.testType == 0) {
  //         this.getNextActRouterConfig(this.currentActId);
  //       }
  //       if (o.length == 0) {
  //         this.filedEscape();
  //       }

  //     },

  //     deep: true,
  //   }
  // },
  mounted() {
    this.setTestType();
    this.queryList();
  },
  computed: {
    computedTableHeight() {
      return this.maxTableHeight;
    }
  },
  data() {
    return {
      rulesList: [],
      currentUser: sessionStorage.getItem("user"),
      tableData: [],
      userData: [],
      maxTableHeight: 0,
      simulationParamsForm: {},
      listLoading: false,
      pageIndex: 1,
      pageSize: 10,
      total: 10,
      testType: 0,
      step: 1,
      rulesRelDM: [],
      groupRulesRelDM: [],
      rulesRelFuncs: [],
      procTestId: "",
      procInfo: {
        procId: "",
        procVersion: "",
        procName: "",
      },
      actTabData: [],
      procTemplateData: {},
      searchModel: {},
      fullLoading: null,
      currPreActId: '',
      currentActId: '',
      currentActName: '',
      rulesTest: new Map(),
      formModel: new Map(),
      isShowSelectAct: false,//下一环节为多节点
      changeSelect: false,//是否选择
      selectActData: {},//下一环节为多节点并行时手动选中环节 
      mutilnextActData: [],//自动测试记录多环节 

      nextActData: [],
      nextPreActData: [],
      isEnd: false,
      actIds: [],
      actPreConfigIds: [],
      routeMap: {},
      picMap: {},
      finalResult: false,
      defaultAct: null,
      defaultNextAct: null,
      targetActName: "",
      targetActType: 2,
      targetActId: "",
      targetActPreConfigId: "",
      activeName1: ["tab1", "tab2", "tab3", "tab4", "tab5"],
      activeName2: ["tab1"],
      activeName3: ["tab1"],
      activeName4: [],
      submitType: "1",
      userNo: "",
      userName: "",
      nextActRouterConfigMap: new Map(),
      endAct: {},
      actList: [],
      showActParticipantDialog: false,
      disabled: true,
      sendBackConfig: {
        actsBackAllow: [],
        actBackRule: 0,
        actEditBackRuleFlag: 0,
        handleJavaClass: null
      },
      actBackRule: "0",
      actBackId: "",
      actBackInfo: {
        isBackAct: false,
        actBackRule: "",
        currentActId: "",
        currentActName: "",
        currentActPreConfigId: "",
        backActId: "",
        backActPreConfigId: "",
        backActName: "",
      },
      row: {},
      index: -1,
      preActUser: "",
      procLog: 0,
      processTestSubInfoId: null,
      processTestSubInfoArray: [],
      ruleParamList: [],
      actArr: [],
      actId: "",
      validateError: false,
      validateMsg: false,
      loading: false,
      participantType: null,
      fieldMap: new Map(),
      funcMap: new Map(),
      respParamDtos: [],
      processTestList: [],
      currentActType: 0,
      autoFlag: false
    }
  },
  methods: {
    //计算高度
    initMaxHeight() {
      calcHeight(this);
    },
    openActParticipantFunc(row) {
      if (row && row.$index > -1) {
        this.index = row.$index;

        let userArray = row.row.userName.split(",");
        this.userNo = userArray.map(item => {
          return item.replace("[", "").split("]")[0]
        }).join(",");
      }
      this.showActParticipantDialog = true;
    },
    closeActParticipantFunc() {
      this.showActParticipantDialog = false;
    },
    // 选人员组件提交执行函数
    async commitActParticipantFunc() {
      let that = this;
      let actParticipantData = this.$refs.wfCommPersonComponentId.getData();
      let peopleParticipant = [];
      let userData = [];
      let orgData = [];
      let groupData = [];
      let dynamicRoleData = [];
      let stationData = [];
      if (actParticipantData) {
        userData = actParticipantData.get("userData");
        orgData = actParticipantData.get("orgData");
        groupData = actParticipantData.get("groupData");
        dynamicRoleData = actParticipantData.get("dynamicRoleData");
        stationData = actParticipantData.get("stationData");

        if (userData && userData.length === 8) {
          // 判断用户信息是否为空，不为空才插入数据
          if (userData[1] && userData[1].length === 2 && userData[1][0] !== "") {
            let userDataIdsStr = userData[1][0];
            let userDataNamesStr = userData[1][1];
            let userDataIds = userDataIdsStr.split(";");
            let userDataNames = userDataNamesStr.split(";");
            for (let i = 0; i < userDataIds.length; i++) {
              let participantData = {};
              participantData.participantType = 0;
              // that.participantType = 1;
              participantData.participantId = userDataIds[i];
              participantData.participantName = userDataNames[i];
              participantData.userDetail = `[${participantData.participantId}]${participantData.participantName}`;
              participantData.participantOrder = peopleParticipant.length + 1;
              peopleParticipant.push(participantData);
            }
          }
        }

        // 组织
        if (orgData && orgData.length > 0) {
          let company = orgData[1];
          let size = company.find(c => c != "");
          if (size != undefined) {
            peopleParticipant = [];
            let companyNo = company[0].split(";");
            let companyName = company[4].split(";");

            companyNo.map((item, index) => {
              let participantData = {};
              participantData.participantType = 1;
              participantData.participantId = item;
              participantData.participantName = companyName[index];
              peopleParticipant.push(participantData);
            })
          }
        }

        // 流程组数据
        if (groupData && groupData.length > 0) {
          peopleParticipant = [];
          for (let i = 0; i < groupData.length; i++) {
            let data = groupData[i];
            let participantId = data.participantId.split("|");

            let participantData = {};
            that.participantType = data.participantType;
            participantData.participantId = participantId[0];
            participantData.participantName = data.participantName;
            let userDetail = await this.getUserGroupInfo("[" + participantData.participantId + "]" + participantData.participantName, 3, null, null);
            participantData.userDetail = userDetail;
            peopleParticipant.push(participantData);


            // let params = {};
            // params.id = participantId[0];
            // let res = await api.groupDetailAPI(params);
            // if (res.code === "0") {
            //   let data = res.data;
            //   let groupDefaultRelationDtos = data.groupDefaultRelationDtos;
            //    if(groupDefaultRelationDtos && groupDefaultRelationDtos.length > 0){
            //      groupDefaultRelationDtos.map(item=>{
            //        let userList = item.userNameList.split(",");
            //        userList.map(user=>{
            //          let participantData = {};
            //          let userInfo = user.replace("[","").split("]");
            //          participantData.participantId = userInfo[0];
            //          participantData.participantName = userInfo[1];
            //          peopleParticipant.push(participantData);
            //        })
            //      })
            //    }
            // }
          }
        }
      }
      that.userName = "";
      that.userNo = "";
      that.userData = [];
      let userDetail = "";
      peopleParticipant.map(item => {
        let obj = {
          account: item.participantId,
          name: item.participantName
        };
        that.userData.push(obj);
        that.userName = that.userName + "[" + item.participantId + "]" + item.participantName + ",";
        userDetail = userDetail + item.userDetail + ",";
      })

      if (userDetail) {
        userDetail = userDetail.substr(0, userDetail.length - 1);
      }

      that.userName = that.userName.substr(0, that.userName.length - 1);
      if (that.index > -1) {
        that.actList[that.index].userName = that.userName;
        that.actList[that.index].participantType = that.participantType;
        that.actList[that.index].userDetail = userDetail;
      }
      that.userNo = that.userData.map(m => {
        return m.account
      }).join(",");
      this.showActParticipantDialog = false;
    },

    async setTestType() {
      if (this.$route.query.testType) {
        this.testType = this.$route.query.testType;
        this.procInfo.procId = this.$route.query.procId;
        this.procInfo.procVersion = this.$route.query.procVersion;
        this.procInfo.procName = this.$route.query.procName;
        this.procTestId = this.$route.query.procTestId;
        if (this.$route.query.procLog) {
          this.procLog = this.$route.query.procLog;
          let procTestName = this.$route.query.procTestName;
          if (procTestName) {
            this.procInfo.procName = procTestName.split("-")[0];
          }
        }
        await this.getModelByProcTestId();
        //获取流程模板
        await this.getProcTemplBaseInfoAPI();
      }

    },
    async autoExecute() {
      let that = this;

      that.fullLoading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      if (this.validateError) {
        that.fullLoading.close();
        that.loading = false;
        this.$message({ type: "warning", message: that.validateMsg });
        return false;
      }

      // 自动执行保存参数
      that.saveProcessTestSubInfo(that.currentActId, null);
      await api.autoExecute({ processTestList: this.processTestList }).then(async (res) => {
        if (res.code === '0') {
          this.queryList();
          api.processTestExecuteStatusApi({
            procId: this.procInfo.procId,
            procVersion: this.procInfo.procVersion,
            procTestId: this.procTestId,
          }).then(_res => {
            if (_res.data == 1) {
              this.autoFlag = false
            } else {
              this.autoFlag = true
            }
          })
          that.$message({
            message: '操作成功！',
            type: 'success'
          })
        }
      })
      that.fullLoading.close();
    },
    getProcessRouteList(data, start) {
      const activities = {};
      for (const key in data) {
        const actList = data[key];
        for (const act of actList) {
          activities[act.actId] = {
            ...act,
            nextActs: []
          };
        }
      }

      // 构建流程图
      for (const key in data) {
        const actList = data[key];
        for (const act of actList) {
          if (activities[act.toActId]) {
            activities[act.actId].nextActs.push(activities[act.toActId]);
          }
        }
      }

      //开始节点
      const startActId = start.actId

      // 深度优先遍历生成所有完整路径
      const paths = [];

      function dfs(actId, path = []) {
        const act = activities[actId];
        path.push(act);
        if (act.nextActs.length === 0) {
          paths.push([...path]);
        } else {
          for (const nextAct of act.nextActs) {
            dfs(nextAct.actId, path);
          }
        }
        path.pop();
      }

      dfs(startActId);

      const list = []
      paths.forEach(path => {
        list.push(path.map(act => act.actId))
      });
      return list
    },
    // 无用
    async getParams() {
      let that = this;
      that.loading = true;


      let params = {
        processTestList: [],
      };


      try {
        //发起环节
        let currentAct = _.find(that.procTemplateData.actDef, { "actType": 1 });
        // let endAct = _.find(that.procTemplateData.actDef,{"actType":5}) 

        // let arrs = []
        // let paths = that.getProcessRouteList(that.routeMap,currentAct)

        // for (let o of paths) {
        //   o.push(endAct.actId)
        // } 


        let actDef = that.procTemplateData.actDef;

        // for (let i = 0; i < paths.length; ) {
        //   let o = []
        //   for (let j = 0; j < paths[i].length; j++) {
        //     o.push(actDef.find(e=>e.actId===paths[i][j]))
        //     if(j==paths[i].length-1){ 
        //       arrs.push(o)
        //     }

        //   }
        //   i++
        // }



        for (let i = 0; i < actDef.length; i++) {
          //结束环节
          if (currentAct.actType == "5") {
            let index = that.actList.find(k => {
              return k.actId == currentAct.actId;
            })
            if (!index) {
              let obj = {
                actId: currentAct.actId,
                actName: currentAct.actName,
                userName: "",
                actType: 5,
              };
              that.actList.push(obj);
            }
            // break;
          }
          let formModel = that.formModel.get(currentAct.actId);
          if (!formModel) {
            formModel = {
              formId: "",
              formName: "",
              version: 1
            }
          }
          let nextActRouterConfig = that.nextActRouterConfigMap.get(currentAct.actId);
          let currentActRoute = that.routeMap[currentAct.actId];

          let defaultAct = _.find(currentActRoute, { "actRouteConditionId": null });

          let size = _.filter(that.rulesRelDM, { "mockValue": "" });
          let ruleParamList = [];
          if (currentActRoute.length > 1 && size.length == 0) {
            for (let i = 0; i < currentActRoute.length; i++) {
              let equationData = currentActRoute[i].actRouteConditionContent;
              if (equationData) {
                ruleParamList = that.rulesRelDM.filter(item => {
                  if (item.mockValue != null && item.mockValue != "" && equationData == item.ruleExpression && formModel.formId == item.formId) {

                    if (["Integer", "Long", "Double"].includes(item.mockType)) {
                      if (isNaN(Number(item.mockValue))) {
                        that.validateError = true;
                        that.validateMsg = "参数值" + item.mockValue + "与参数类型" + item.mockType + "不匹配，请重新输入";
                      }
                    }

                    return { 'mockCode': item.mockCode, 'mockName': item.mockName, 'mockType': item.mockType, 'mockValue': item.mockValue }
                  }
                });

                let param = {
                  equationData: equationData,
                  fieldParamList: [],
                  funcList: [],
                  ruleParamList: ruleParamList,
                  wfParamList: []
                };

                if (ruleParamList.length > 0) {
                  let res = await api.expressionCheck(param);
                  if (res.code === "0") {
                    if (res.data.resultType == 0) {
                      that.finalResult = res.data.bolResult;
                    } else if (res.data.resultType == 1) {
                      that.finalResult = JSON.stringify(res.data.objResult);
                    }

                    if (that.finalResult) {
                      defaultAct = currentActRoute[i];
                      break;
                    }
                  } else {
                    that.validateError = true;
                    that.validateMsg = res.msg;
                    that.$message({ type: "error", message: res.msg });
                  }
                }
              }
            }
          }

          if (this.validateError) {
            that.fullLoading.close();
            that.loading = false;
            that.actList = [];
            this.$message({ type: "error", message: that.validateMsg });
            return false;
          }


          let nextActData = _.find(nextActRouterConfig.actInfos, { "actId": defaultAct.toActId });
          let nextPreActData = _.find(nextActRouterConfig.actPreInfos, { "actId": defaultAct.toActId });


          let paramData = {
            testCaseInfo: {
              actId: currentAct.actId,
              formId: formModel,
              actName: currentAct.actName,
              actSCTypeId: "",
              actPreId: currentAct.actPreConfigId,
              actSCItemId: "",
              rulesTest: []
            },
            actInfo: {
              actId: currentAct.actId,
              actName: currentAct.actName,
              expectData: {
                customAct: nextActData.actId,
                customPreAct: nextPreActData.actPreConfigId,
                customActParticipant: "",
                customSCType: "",
                customActAssignType: 1,
                customActSCItemId: ""
              },
              actSCItemId: "",
              actPreId: currentAct.actPreConfigId,
              execStatus: 0
            },
            processTestLogModel: {
              procTestId: this.procTestId,
              nodeName: currentAct.actName,
              approvedBy: "",
              serialNumber: i + that.total,
              procName: this.$route.query.procName,
            }
          }

          let actUser = that.actList.find(f => {
            return f.actId == nextActData.actId
          });
          let approvedUser = that.actList.find(f => {
            return f.actId == currentAct.actId
          });
          if (approvedUser != undefined) {
            // 读取自定义人员
            let nextActUser = that.actList.find(f => {
              // return f.actId == nextActData.actId
              return f.actId == nextActData.actId
            });
            let userArr = nextActUser.userName.split(",");
            paramData.actInfo.expectData.customActParticipant = userArr.map(m => {
              return m.replace("[", "").split("]")[0]
            }).join();
            paramData.actInfo.expectData.customActAssignType = nextActUser.participantType;
            paramData.processTestLogModel.approvedBy = approvedUser.userName;
          } else {
            // 读取默认人员
            let peopleParticipant = that.picMap[nextActData.actId];
            let preActUsers = that.picMap[currentAct.actId];

            let userName = "";
            if (peopleParticipant && peopleParticipant.length > 0) {
              var participant = peopleParticipant.find(item => item.participantOrder == 1 || !item.participantOrder);
              let participantId = this.splitParticipantId(participant);
              userName = `[${participantId}]${participant.participantName}`;
              paramData.actInfo.expectData.customActParticipant = participantId;

              // let user = []
              // let userId = []
              // peopleParticipant.forEach(e=>{
              //   user.push(`[${e.participantId}]${e.participantName}`)
              //   userId.push(e.participantId)
              // }) 
              // userName = user.join(',');
              // paramData.actInfo.expectData.customActParticipant = userId.join(',');
            }

            if (preActUsers && preActUsers.length > 0) {
              var participant = preActUsers.find(item => item.participantOrder == 1 || !item.participantOrder);
              let participantId = participant.participantId.split("|")
              let preActUser = `[${participantId[0]}]${participant.participantName}`;
              that.participantType = participant.participantType;
              paramData.actInfo.expectData.customActAssignType = participant.participantType;
              let obj = {
                actId: currentAct.actId,
                actName: currentAct.actName,
                userName: preActUser,
                actType: currentAct.actType,
                participantType: participant.participantType,
              };

              let userDetail = await this.getUserGroupInfo(obj.userName, obj.participantType, currentAct.actId, currentAct.actName);
              obj.userDetail = userDetail;
              //环节列表
              that.actList.push(obj);
            }
            that.actList[0].userDetail = that.currentUser;

            // 修改用户组注释
            // let userName = "";
            // if(peopleParticipant){
            //   let users = peopleParticipant.map(item => {
            //     userName = userName + "[" + item.participantId + "]" + item.participantName + ","
            //     return item.participantId;
            //   })
            //   paramData.actInfo.expectData.customActParticipant = users.join(",");
            // }
            //
            // let preActUser = that.picMap[currentAct.actId].map(item => {
            //   return "[" + item.participantId + "]" + item.participantName;
            // }).join(",");
            // let obj = {
            //   actId: currentAct.actId,
            //   actName: currentAct.actName,
            //   userName: preActUser,
            //   actType: currentAct.actType
            // };
            // that.actList.push(obj);

            paramData.processTestLogModel.approvedBy = preActUsers;
          }
          let rulesTest = that.rulesTest.get(formModel.formId);
          if (rulesTest) {
            let rules = _.filter(rulesTest, { "ruleExpression": defaultAct.actRouteConditionContent })
            paramData.testCaseInfo.rulesTest = rules;

            if (paramData.testCaseInfo.rulesTest.length > 0) {
              paramData.testCaseInfo.rulesTest[0].ruleParamValues = ruleParamList;
            }
          }
          params.processTestList.push(paramData);
          currentAct = _.find(that.procTemplateData.actDef, { "actId": defaultAct.toActId });
        }
      } catch (e) {
        that.loading = false;
      }
      that.loading = false;
      return params;
    },
    async getProc() {
      let that = this;
      that.loading = true;


      this.processTestList = []
      try {
        let actDef = that.procTemplateData.actDef;
        // 重新排序
        let elementItems = JSON.parse(this.$route.query.elementItems)
        let elementArr = []
        elementItems.forEach(item => {
          actDef.forEach(_item => {
            if (item.actId === _item.actId) {
              elementArr.push(_item)
            }
          })
        })
        actDef = elementArr
        for (let i = 0; i < actDef.length; i++) {
          //结束环节
          if (actDef[i].actType == "5") {
            let index = that.actList.find(k => {
              return k.actId == actDef[i].actId;
            })
            if (!index) {
              let obj = {
                actId: actDef[i].actId,
                actName: actDef[i].actName,
                userName: "",
                actType: 5,
              };
              that.actList.push(obj);
            }
            break;
          }
          let formModel = that.formModel.get(actDef[i].actId);
          if (!formModel) {
            formModel = {
              formId: "",
              formName: "",
              version: 1
            }
          }
          let nextActRouterConfig = that.nextActRouterConfigMap.get(actDef[i].actId);
          let currentActRoute = that.routeMap[actDef[i].actId];
          let defaultAct = _.find(currentActRoute, { "actRouteConditionId": null });
          if (!defaultAct) {
            defaultAct = currentActRoute[0]
          }
          let size = _.filter(that.rulesRelDM, { "mockValue": "" });
          let ruleParamList = [];
          if (currentActRoute.length > 1 && size.length == 0) {
            for (let _i = 0; _i < currentActRoute.length; _i++) {
              let equationData = currentActRoute[_i].actRouteConditionContent;
              if (equationData) {
                ruleParamList = that.rulesRelDM.filter(item => {
                  if (item.mockValue != null && item.mockValue != "" && equationData == item.ruleExpression && formModel.formId == item.formId) {

                    if (["Integer", "Long", "Double"].includes(item.mockType)) {
                      if (isNaN(Number(item.mockValue))) {
                        that.validateError = true;
                        that.validateMsg = "参数值" + item.mockValue + "与参数类型" + item.mockType + "不匹配，请重新输入";
                      }
                    }

                    return { 'mockCode': item.mockCode, 'mockName': item.mockName, 'mockType': item.mockType, 'mockValue': item.mockValue }
                  }
                });

                let param = {
                  equationData: equationData,
                  fieldParamList: [],
                  funcList: [],
                  ruleParamList: ruleParamList,
                  wfParamList: []
                };

                if (ruleParamList.length > 0) {
                  let res = await api.expressionCheck(param);
                  if (res.code === "0") {
                    if (res.data.resultType == 0) {
                      that.finalResult = res.data.bolResult;
                    } else if (res.data.resultType == 1) {
                      that.finalResult = JSON.stringify(res.data.objResult);
                    }

                    if (that.finalResult) {
                      defaultAct = currentActRoute[_i];
                      break;
                    }
                  } else {
                    that.validateError = true;
                    that.validateMsg = res.msg;
                    that.$message({ type: "error", message: res.msg });
                  }
                }
              }
            }
          }
          if (this.validateError) {
            that.fullLoading.close();
            that.loading = false;
            that.actList = [];
            this.$message({ type: "error", message: that.validateMsg });
            return false;
          }
          let nextActData = _.find(nextActRouterConfig.actInfos, { "actId": defaultAct.toActId });
          let nextPreActData = _.find(nextActRouterConfig.actPreInfos, { "actId": defaultAct.toActId });
          let paramData = {
            testCaseInfo: {
              actId: actDef[i].actId,
              formId: formModel,
              actName: actDef[i].actName,
              actSCTypeId: "",
              actPreId: actDef[i].actPreConfigId,
              actSCItemId: "",
              rulesTest: []
            },
            actInfo: {
              actId: actDef[i].actId,
              actName: actDef[i].actName,
              expectData: {
                customAct: nextActData.actId,
                customPreAct: nextPreActData.actPreConfigId,
                customActParticipant: "",
                customSCType: "",
                customActAssignType: 1,
                customActSCItemId: ""
              },
              actSCItemId: "",
              actPreId: actDef[i].actPreConfigId,
              execStatus: 0,
              procId: this.$route.query.procId
            },
            processTestLogModel: {
              procTestId: this.procTestId,
              nodeName: actDef[i].actName,
              approvedBy: "",
              serialNumber: i + that.total,
              procName: this.$route.query.procName,
            }
          }
          let approvedUser = that.actList.find(f => {
            return f.actId == nextActData.actId
          });
          if (approvedUser != undefined) {
            // 读取自定义人员
            let nextActUser = that.actList.find(f => {
              // return f.actId == nextActData.actId
              return f.actId == nextActData.actId
            });
            let userArr = nextActUser.userName.split(",");
            paramData.actInfo.expectData.customActParticipant = userArr.map(m => {
              return m.replace("[", "").split("]")[0]
            }).join();
            paramData.actInfo.expectData.customActAssignType = nextActUser.participantType;
            paramData.processTestLogModel.approvedBy = approvedUser.userName;
          } else {
            // 读取默认人员 
            let peopleParticipant = that.picMap[nextActData.actId];
            let preActUsers = that.picMap[actDef[i].actId];
            let userName = "";
            if (peopleParticipant && peopleParticipant.length > 0) {
              var participant = peopleParticipant.find(item => item.participantOrder == 1 || !item.participantOrder);
              let participantId = this.splitParticipantId(participant);
              // userName = `[${participantId}]${participant.participantName}`;
              // paramData.actInfo.expectData.customActParticipant = participantId; 

              let user = []
              let userId = []
              peopleParticipant.forEach(e => {
                if (e.participantType === 0) {
                  user.push(`[${e.participantId}]${e.participantName}`)
                } else {
                  user.push(`${e.participantName}`)
                }
                userId.push(e.participantId)
              })
              user = [...new Set(user)]
              userName = user.join(',');
              paramData.actInfo.expectData.customActParticipant = userId.join(',');
            }
            if (nextActData.actType == 5) {
              paramData.actInfo.expectData.customActParticipant = 'end';
            }
            let name
            if (preActUsers && preActUsers.length > 0) {
              var participant = preActUsers.find(item => item.participantOrder == 1 || !item.participantOrder);
              let participantId = participant.participantId.split("|")
              let user = []
              let userId = []
              preActUsers.forEach(e => {
                if (e.participantType === 0) {
                  user.push(`[${e.participantId}]${e.participantName}`)
                } else {
                  user.push(`${e.participantName}`)
                }
                userId.push(e.participantId)
              })
              // user = new Map(user)
              user = [...new Set(user)]
              name = user.join(',');
              that.participantType = participant.participantType;
              paramData.actInfo.expectData.customActAssignType = participant.participantType;
              let obj = {
                actId: actDef[i].actId,
                actName: actDef[i].actName,
                userName: name,
                actType: actDef[i].actType,
                participantType: 3,
              };
              //环节列表
              that.actList.push(obj);
            } else {
              let obj = {
                actId: actDef[i].actId,
                actName: actDef[i].actName,
                userName: "",
                actType: actDef[i].actType,
                participantType: 3,
              };
              //环节列表
              that.actList.push(obj);

            }
            // that.actList[0].userDetail = that.currentUser;
            paramData.processTestLogModel.approvedBy = name;
          }
          let rulesTest = that.rulesTest.get(formModel.formId);
          if (rulesTest) {
            let rules = _.filter(rulesTest, { "ruleExpression": defaultAct.actRouteConditionContent })
            paramData.testCaseInfo.rulesTest = rules;

            if (paramData.testCaseInfo.rulesTest.length > 0) {
              paramData.testCaseInfo.rulesTest[0].ruleParamValues = ruleParamList;
            }
          }
          this.processTestList.push(paramData);
        }
      } catch (error) {
        that.loading = false;

      }
      that.loading = false;
    },
    //自动测试多分支选中执行分支
    changeSelectActive(val) {
    },
    // 获取日志列表
    queryList() {
      this.listLoading = true;
      let params = {
        current: this.pageIndex,
        size: this.pageSize,
        procTestId: this.procTestId,
      };

      api.getProcessTestLogPage(params).then(res => {
        this.listLoading = false;
        if (res.code === "0") {
          this.tableData = res.records;
          this.total = res.total;
          if (this.currentActType == 5) {
            this.autoFlag = true
          } else {
            this.autoFlag = false
          }
        }
      })
    },

    addUser() {
      this.$refs.personSelect.show();
    },
    callName: function (value) {
      let that = this;
      if (value && value.length > 0) {
        that.userData = [];
        value.map(item => {
          let user = item.replace("[", "").split("]");
          let obj = {
            account: user[0],
            name: user[1]
          };
          that.userData.push(obj);
        })
      }
    },
    // 弃用
    // 获取流程规则与规则参数
    getProcFormRules1() {
      let that = this;
      // let params = {
      //   procId: this.procInfo.procId,
      //   procVersion: this.procInfo.procVersion,
      // };
      // ht.post("/wf/processRule/getSimuProcAllRules", params).then(async res => {


      let params = {
        actId: this.targetActId,
        actPreConfigId: this.targetActPreConfigId
      };
      ht.post("/wf/procTestCase/getModelRelationByActId", params).then(async res => {
        // ht.post("/wf/processRule/getSimuProcRules", params).then(async res => {}
        if (res.data.code === '0') {

          let tData = res.data.data
          this.rulesList = res.data.data[0] ? res.data.data[0].ruleDetails : []
          this.rulesList.forEach((row, idx) => {
            this.activeName4.push(idx)
          })
          // 数据模型
          let rulesRelDM = []
          // 规则函数
          let rulesRelFuncs = []
          for (let i = 0; i < tData.length; i++) {
            let rulesRelFuncsTemp = []
            // 表单
            let formId = tData[i].formId
            if (!this.fieldMap.has(formId)) {
              await api.getModleDataById({ id: formId }).then(result => {
                if (result.code === '0') {
                  this.fieldMap.set(formId, result.data);
                }
              })
            }
            if (tData[i].ruleDetails && tData[i].ruleDetails.length > 0) {
              //表单规则列表
              let ruleDetails = tData[i].ruleDetails
              that.rulesList = tData[i].ruleDetails
              // this.fieldMap.set(formId, result.data);
              for (let j = 0; j < ruleDetails.length; j++) {
                let ruleDetail = {}
                ruleDetail.ruleDetailId = ruleDetails[j].ruleDetailId
                ruleDetail.ruleMasterId = ruleDetails[j].ruleMasterId
                ruleDetail.ruleExpression = ruleDetails[j].ruleExpression
                ruleDetail.ruleMasterName = ruleDetails[j].ruleMasterName
                ruleDetail.wfParamList = []

                if (ruleDetails[j].ruleParamList && ruleDetails[j].ruleParamList.length > 0) {
                  // 规则参数列表
                  let ruleParamList = ruleDetails[j].ruleParamList
                  let currrulesRelDMTemp = []
                  for (let k = 0; k < ruleParamList.length; k++) {
                    //解析所有的规则依赖的数据模型
                    let sameIndex = _.findIndex(rulesRelDM, { 'mockCode': ruleParamList[k].mockCode })
                    if (sameIndex < 0) {
                      rulesRelDM.push({ 'mockCode': ruleParamList[k].mockCode, 'mockName': ruleParamList[k].mockName, 'mockType': ruleParamList[k].mockType, 'mockValue': ruleParamList[k].mockValue, 'ruleExpression': ruleDetails[j].ruleExpression, 'formId': formId })
                    }
                    currrulesRelDMTemp.push({ 'mockCode': ruleParamList[k].mockCode, 'mockName': ruleParamList[k].mockName, 'mockType': ruleParamList[k].mockType, 'mockValue': '' })
                  }
                  ruleDetail.ruleParamValues = currrulesRelDMTemp
                } else {
                  ruleDetail.ruleParamValues = []
                }
                if (ruleDetails[j].funcList.length > 0) {
                  this.funcMap.set(ruleDetail.ruleDetailId, ruleDetail.ruleParamValues);
                  let respParamDtos = [];
                  ruleDetails[j].funcList.map(item => {
                    respParamDtos.push(...item.respParamDtos);
                  });
                  this.respParamDtos.push(...respParamDtos);
                }

                if (ruleDetails[j].funcList && ruleDetails[j].funcList.length > 0) {
                  // 规则函数
                  let funcList = ruleDetails[j].funcList
                  for (let l = 0; l < funcList.length; l++) {
                    funcList[l].functionVal = ''
                    funcList[l].formId = formId
                  }
                  ruleDetail.ruleFuncValues = funcList
                } else {
                  ruleDetail.ruleFuncValues = []
                }
                rulesRelFuncs.push(ruleDetail)
                rulesRelFuncsTemp.push(ruleDetail)
              }

            }
            this.rulesTest.set(formId, rulesRelFuncsTemp)
          }
          this.rulesRelFuncs = rulesRelFuncs
          this.rulesRelDM = rulesRelDM;
          this.paramGroup();
        } else {
          that.$message({
            message: res.data.msg,
            type: 'warning'
          })
        }
      })
    },
    // 获取流程规则与规则参数 
    getProcFormRules() {
      // let actId,actPreConfigId
      // currentAct.forEach(item=>{
      //   if (item.actId===currentActId) {
      //     actId = item.actId
      //     actPreConfigId = item.actPreConfigId
      //   }
      // })
      let that = this;
      let _params = {
        actId: this.targetActId,
        actPreConfigId: this.targetActPreConfigId
      };
      // 查询当前环节路由组件
      let params = {
        actId: this.currentActId,
        actPreConfigId: this.currPreActId
      };
      ht.post("/wf/procTestCase/getModelRelationByActId", params).then(async res => {
        if (res.data.code === '0') {
          // 数据模型
          let rulesRelDM = []
          let tData = res.data.data
          tData.forEach(item => {
            if (item.ruleParamList && item.ruleParamList.length > 0) {
              item.ruleParamList.forEach(_item => {
                rulesRelDM.push(_item)
              })
            } else if (item.scList && item.scList.length > 0) {
              item.scList.forEach(_item => {
                rulesRelDM.push(_item)
              })
            }
          })
          // 查询下一环节动态角色组件
          ht.post("/wf/procTestCase/getModelRelationByActId", _params).then(async _res => {
            if (res.data.code === '0') {
              // 数据模型 
              let _tData = _res.data.data
              _tData.forEach(items => {
                if (items.funcList && items.funcList.length > 0) {
                  items.funcList.forEach(_item => {
                    rulesRelDM.push(_item)
                  })
                }
              })
            }
            this.rulesRelDM = rulesRelDM;
            this.paramGroup();
          })
        }
      })
    },
    // 获取流程规则与规则参数 
    getProcFormRulesSelect() {
      // let actId,actPreConfigId
      // currentAct.forEach(item=>{
      //   if (item.actId===currentActId) {
      //     actId = item.actId
      //     actPreConfigId = item.actPreConfigId
      //   }
      // })
      let that = this;
      let _params = {
        actId: that.selectActData.actId,
        actPreConfigId: that.selectActData.actPreConfigId
      };
      // 查询当前环节路由组件
      let params = {
        actId: this.currentActId,
        actPreConfigId: this.currPreActId
      };
      ht.post("/wf/procTestCase/getModelRelationByActId", params).then(async res => {
        if (res.data.code === '0') {
          // 数据模型
          let rulesRelDM = []
          let tData = res.data.data
          tData.forEach(item => {
            if (item.ruleParamList && item.ruleParamList.length > 0) {
              item.ruleParamList.forEach(_item => {
                rulesRelDM.push(_item)
              })
            } else if (item.scList && item.scList.length > 0) {
              item.scList.forEach(_item => {
                rulesRelDM.push(_item)
              })
            }
          })
          // 查询下一环节动态角色组件
          ht.post("/wf/procTestCase/getModelRelationByActId", _params).then(async _res => {
            if (res.data.code === '0') {
              // 数据模型 
              let _tData = _res.data.data
              _tData.forEach(items => {
                if (items.funcList && items.funcList.length > 0) {
                  items.funcList.forEach(_item => {
                    rulesRelDM.push(_item)
                  })
                }
              })
            }
            this.rulesRelDM = rulesRelDM;
            this.paramGroup('change');
          })
        }
      })
    },
    getProcTemplBaseInfoAPI() {
      let that = this;
      that.searchModel = {
        procId: this.procInfo.procId,
        procVersion: this.procInfo.procVersion,
      }

      that.fullLoading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      api.getProcTemplBaseInfoAPI(that.searchModel).then(async (result) => {
        if (result.code === '0') {
          that.procTemplateData = result.data
          let actTabData = result.data.actDef
          for (let i = 0; i < actTabData.length; i++) {
            if (actTabData[i].actType == 1) {
              //发起环节
              that.currentActId = actTabData[i].actId;
              that.currentActName = actTabData[i].actName;
              that.currentActType = actTabData[i].actType;
              actTabData[i].actSCTypeId = ''
              actTabData[i].actSCItemId = ''
              that.currPreActId = actTabData[i].actPreConfigId
              that.actTabData.push(actTabData[i]);

              let userName = [];
              that.userData = [];
              that.procTemplateData.procDef.procCreator.map(item => {
                let obj = {
                  account: item.participantId,
                  name: item.participantName
                };
                that.userData.push(obj);
                userName.push("[" + item.participantId + "]" + item.participantName);
              })
              that.preActUser = userName.join(",");
              that.userNo = that.userData.map(m => {
                return m.account
              }).join(",");
            }
            if (actTabData[i].actType == 5) {
              //结束环节
              that.endAct = actTabData[i];
            }
            if (actTabData[i].actType != 5) {
              that.actIds.push(actTabData[i].actId);
              that.actPreConfigIds.push(actTabData[i].actPreConfigId);
              that.getFormModel(actTabData[i].actId, actTabData[i].actFormBind.formId, actTabData[i].actFormBind.formVersion);
              if (that.testType == 1) {
                that.setNextActRouterConfigMap(actTabData[i].actId);
              }
            }
          }
          await that.listRouteConfig();
          await that.listPicConfig();
          // await that.getProcFormRules();
          if (that.procLog == 0) {
            // await that.getProcFormRules(that.searchModel);
          } else {
            let processTestSubInfo = _.find(that.processTestSubInfoArray, { "actId": that.currentActId });
            if (processTestSubInfo) {
              that.rulesRelDM = processTestSubInfo.params;
              that.actList = processTestSubInfo.actList;
              that.userData = processTestSubInfo.user;
              that.procInfo.procName = processTestSubInfo.procName;
              // that.paramGroup();
            }
          }
          await that.getNextActRouterConfig(that.currentActId);
          setTimeout(() => {
            if (that.testType == 1) {
              that.createProcAct();
            }
            that.fullLoading.close();
          }, 5000)
        } else {
          this.$message({
            message: result.msg,
            type: 'warning'
          })
        }
      })
    },
    getFormModel(actId, baseId, version) {
      let that = this
      let param = { 'baseId': baseId, 'version': version, 'actId': actId }
      api.getFormAPI(param).then((result) => {
        if (result.code === '0') {
          if (!result.data) {
            that.formModel.set(actId, { 'formId': "", 'formName': "", 'version': 1 })
          } else {
            that.formModel.set(actId, { 'formId': result.data.formId, 'formName': result.data.formName, 'version': result.data.version })
          }
        } else {
          that.$message({
            message: result.msg,
            type: 'warning'
          })
        }
      })
    },
    //选中下一环节
    handlerChangeTargetAct(val) {
      this.changeSelect = true
      const currAct = _.find(this.nextActData, { actId: val })
      //目标环节执行人
      let peopleParticipant = this.picMap[currAct.actId]
      this.setUserInfo(peopleParticipant);
      this.selectActData = currAct
      this.targetActType = currAct.actType
      this.getProcFormRulesSelect()
    },
    async setDefaultNextAct(currentActId) {
      let that = this;
      let currentAct = that.routeMap[currentActId];
      console.log(currentAct, 'currentAct=', currentActId)
      that.defaultAct = _.find(currentAct, { "actRouteConditionId": null });
      if (!that.defaultAct) {
        that.defaultAct = currentAct[0]
      }
      let nextActId = that.defaultAct ? that.defaultAct.toActId : null;
      if (currentAct.length > 1) {
        for (var i = 0; i < currentAct.length; i++) {
          let equationData = currentAct[i].actRouteConditionContent;
          if (equationData && !this.finalResult) {
            await that.mockTestSubmit(equationData);
            if (that.finalResult) {
              that.defaultAct = currentAct[i];
              nextActId = currentAct[i].toActId;
            }
          }
        }
        this.finalResult = false;
      }
      that.defaultNextAct = _.find(that.nextActData, { "actId": nextActId });
      that.actArr.push(that.defaultAct);

      if (that.procLog == 0) {
        if (that.actBackRule == 1 && that.actBackInfo.isBackAct == true) {
          that.targetActName = that.actBackInfo.currentActName;
          that.targetActType = 2;
          let peopleParticipant = that.picMap[that.actBackInfo.currentActId];
          // 由于用户类型只支持一直，按照优先级获取第一个
          that.setUserInfo(peopleParticipant);

        } else {
          //下一节点多分支并行
          // if(that.nextActData.length>1){
          //   let targetActName = []
          //   that.nextActData.forEach(e=>targetActName.push(e.actName))
          //   that.targetActName = targetActName.join(',')
          // }else{
          that.targetActName = that.defaultNextAct.actName;
          that.targetActId = that.defaultNextAct.actId;
          that.targetActPreConfigId = that.defaultNextAct.actPreConfigId;
          // }
          that.targetActType = that.defaultNextAct.actType;

          if (that.targetActType != 5) {
            let peopleParticipant = that.picMap[nextActId];
            // let peopleParticipant = that.picMap[currentAct[0].actId] 
            that.setUserInfo(peopleParticipant);
            that.userNo = that.userData.map(m => {
              return m.account
            }).join(",");
          }
        }
      } else {
        // let processTestSubInfo = _.find(that.processTestSubInfoArray,{"actId":currentActId});
        // if(processTestSubInfo){
        that.targetActType = that.defaultNextAct.actType;
        that.targetActName = that.defaultNextAct.actName;
        that.targetActId = that.defaultNextAct.actId;
        that.targetActPreConfigId = that.defaultNextAct.actPreConfigId;
        // if(that.targetActType != 5){
        //   that.userName = processTestSubInfo.userName;
        //   that.userData = processTestSubInfo.user;
        // }

        if (that.targetActType != 5) {
          let peopleParticipant = that.picMap[nextActId];

          that.setUserInfo(peopleParticipant);

          that.userNo = that.userData.map(m => {
            return m.account
          }).join(",");
        }
        // }
      }
      that.getProcFormRules()
    },
    splitParticipantId(participant) {
      let participantId = participant.participantId;
      if (participant.participantType == 3) {
        participantId = participant.participantId.split("|")[0];
      }
      return participantId;
    },
    setUserInfo(peopleParticipant) {
      let that = this;
      that.userData = [];
      that.userName = "";
      if (peopleParticipant && peopleParticipant.length > 0) {
        // let participant = _.find(peopleParticipant, { "participantOrder": 1 });
        // let participantId = this.splitParticipantId(participant);
        // that.userData.push({
        //   account: participantId,
        //   name: participant.participantName
        // });
        // that.userName = `[${participantId}]${participant.participantName}`;
        // that.participantType = participant.participantType;
        let user = []
        peopleParticipant.forEach((e, i) => {
          let participant = e
          let participantId = this.splitParticipantId(e);
          that.userData.push({
            account: participantId,
            name: participant.participantName
          });
          if (e.participantType === 0) {
            user.push(`[${participantId}]${participant.participantName}`)
          } else {
            user.push(`${participant.participantName}`)
          }
          that.participantType = participant.participantType;
        })
        user = [...new Set(user)]
        that.userName = user.join(',')
      } else {
        that.$message.warning("流程环节未配置负责人");
      }
    },
    // 获取下一环节路由配置
    getNextActRouterConfig(actId, scItemId, currentActPreConfigId, currentActSCTypeId) {
      if (!actId) {
        return false;
      }

      let that = this
      let param = {
        'currActId': actId,
        'scItemId': scItemId,
        'actPreId': currentActPreConfigId,
        'actSCTypeId': currentActSCTypeId
      }
      api.getSimuActNextRouterAPI(param).then((result) => {
        if (result.code === '0') {
          result.data.actInfos.forEach(item => {
            Object.assign(item, {
              disabled: false
            })
          })
          // 下一环节信息
          that.nextActData = result.data.actInfos;
          //下一环节是否多条分支 
          that.isShowSelectAct = that.nextActData.length > 1
          // 下一环节配置信息
          that.nextPreActData = result.data.actPreInfos;
          that.setDefaultNextAct(actId);
        } else {
          that.$message({
            message: result.msg,
            type: 'warning'
          })
        }
      })
    },
    // 获取下一环节路由配置
    setNextActRouterConfigMap(actId, scItemId, currentActPreConfigId, currentActSCTypeId) {
      let that = this
      let param = {
        'currActId': actId,
        'scItemId': scItemId,
        'actPreId': currentActPreConfigId,
        'actSCTypeId': currentActSCTypeId
      }
      api.getSimuActNextRouterAPI(param).then(async (result) => {
        if (result.code === '0') {
          that.nextActRouterConfigMap.set(actId, result.data);
        } else {
          that.$message({
            message: result.msg,
            type: 'warning'
          })
        }
      })
    },
    // 执行提交
    async execOnceStepFunc() {
      let that = this
      that.fullLoading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      let paramDataFn = that.getParamData()
      let paramData = paramDataFn.paramData
      let nextActData = paramDataFn.nextActData
      let nextPreActData = paramDataFn.nextPreActData
      let userName = paramDataFn.userName
      api.manualExecute(paramData).then(async (result) => {
        setTimeout(() => {
          that.fullLoading.close();
        }, 1000);
        if (result.code === '0') {
          let resultData = result.data
          if (resultData.expactCode) {
            if (resultData.expactCode === 0) {
              that.$message({
                message: '数据有误',
                type: 'warning'
              })
            } else if (resultData.expactCode === 10) {
              that.$message({
                message: '规则执行失败，函数或者数据模型数据填写错误！',
                type: 'warning'
              })
            } else if (resultData.expactCode === 2) {
              that.$message({
                message: '不符合预期环节',
                type: 'warning'
              })
            } else if (resultData.expactCode === 3) {
              that.$message({
                message: '不符合预期处理人',
                type: 'warning'
              })
            } else if (resultData.expactCode === 4) {
              that.$message({
                message: '不符合预期会签类型',
                type: 'warning'
              })
            } else if (resultData.expactCode === 6) {
              that.$message({
                message: '不符合预期前置规则',
                type: 'warning'
              })
            } else if (resultData.expactCode === 5) {
              that.saveProcessTestSubInfo(that.currentActId, paramData.testCaseInfo.rulesTest);

              that.isEnd = true;
              that.$message({
                message: '模拟测试结束！',
                type: 'success'
              })

              that.currentActName = nextActData.actName;
              this.currentActType = nextActData.actType
            } else {
              if (that.actBackRule == 1 && that.actBackInfo.isBackAct == true) {
                that.currentActId = that.actBackInfo.currentActId;
                that.currentActName = that.actBackInfo.currentActName;
                that.currPreActId = that.actBackInfo.currentActPreConfigId;

                await that.getNextActRouterConfig(that.actBackInfo.currentActId);
              } else {
                that.saveProcessTestSubInfo(that.currentActId, paramData.testCaseInfo.rulesTest);
                that.currentActId = nextActData.actId;
                that.currentActName = nextActData.actName;
                this.currentActType = nextActData.actType
                that.currPreActId = nextPreActData.actPreConfigId;

                await that.getNextActRouterConfig(nextActData.actId);
              }
              that.actBackInfo.isBackAct = false;
              that.actBackRule = 0;
              that.preActUser = userName;
              that.$message({
                message: '操作成功！',
                type: 'success'
              })
              // that.getProcFormRules()
              that.getSendBackConfig();
            }
          }
        } else {
          that.$message({
            message: result.msg,
            type: 'warning'
          })
        }

        this.queryList();
      })
    },
    removeRow(row) {
      this.userData.splice(row.$index, 1);
    },
    // 保存各环节执行参数
    saveProcessTestSubInfo(actId, rulesTest) {
      let that = this;
      if (that.procLog == 0) {
        let obj = {
          actId: actId,
          params: this.rulesRelDM,
          user: this.userData,
          userName: this.userName,
          procName: this.procInfo.procName,
          actList: this.actList,
          rulesTest: rulesTest,
        }
        let index = that.processTestSubInfoArray.findIndex(item => {
          return item.actId == actId;
        })
        if (index > -1) {
          that.processTestSubInfoArray.splice(index, 1);
        }
        this.processTestSubInfoArray.push(obj);
        let param = {
          id: this.processTestSubInfoId,
          procTestId: this.procTestId,
          testData: JSON.stringify(this.processTestSubInfoArray),
        };
        api.saveProcessTestSubInfo(param).then(res => {
          if (res.code == "0") {
            that.processTestSubInfoId = res.data;
          }
        })
      }
    },
    // 获取路由配置
    listRouteConfig() {
      let that = this;
      let param = {
        actIds: that.actIds
      }
      api.listRouteConfig(param).then(res => {
        if (res.code == "0") {
          that.routeMap = res.data;
        }
      })
    },
    // 获取流程处理人配置
    listPicConfig() {
      let that = this;
      let param = {
        actIds: that.actIds,
        actPreConfigIds: that.actPreConfigIds,
      }

      api.listPicConfig(param).then(res => {
        if (res.code == "0") {
          that.picMap = res.data;
        }
      })
    },
    //模拟测试验证路由规则结果
    async mockTestSubmit(equationData) {
      let _this = this;
      if (_this.finalResult) {
        return;
      }
      let formModel = _this.formModel.get(_this.currentActId);
      if (!formModel) {
        formModel = {
          formId: "",
          formName: "",
          version: 1
        }
      }
      _this.ruleParamList = _this.rulesRelDM.filter(item => {
        if (item.mockValue != null && item.mockValue != "" && equationData == item.ruleExpression && formModel.formId == item.formId) {

          if (["Integer", "Long", "Double"].includes(item.mockType)) {
            if (isNaN(Number(item.mockValue))) {
              _this.validateError = true;
              _this.validateMsg = "参数值" + item.mockValue + "与参数类型" + item.mockType + "不匹配，请重新输入";
            }
          }

          return { 'mockCode': item.mockCode, 'mockName': item.mockName, 'mockType': item.mockType, 'mockValue': item.mockValue }
        }
      });
      let param = {
        equationData: equationData,
        fieldParamList: [],
        funcList: [],
        ruleParamList: _this.ruleParamList,
        wfParamList: []
      };
      if (_this.ruleParamList.length > 0) {
        let res = await api.expressionCheck(param);
        if (res.code === "0") {
          if (res.data.resultType == 0) {
            _this.finalResult = res.data.bolResult;
          } else if (res.data.resultType == 1) {
            _this.finalResult = JSON.stringify(res.data.objResult);
          }
        } else {
          _this.validateError = true;
          _this.validateMsg = res.msg;
          _this.loading = false;
          _this.$message({ type: "error", message: res.msg });
        }
      }
    },
    // 获取可退回配置
    getSendBackConfig() {
      let that = this;
      let currentAct = _.find(this.procTemplateData.actDef, { "actId": this.currentActId });
      this.currPreActId = currentAct.actPreConfigId
      let param = {
        actId: this.currentActId,
        actPreConfigId: currentAct.actPreConfigId
      };
      api.getSendBackConfig(param).then((res) => {
        if (res.code === "0") {
          that.sendBackConfig = res.data;
          if (that.sendBackConfig.actBackRule) {
            that.actBackRule = that.sendBackConfig.actBackRule.toString();
          }
        }
      })
    },
    // 退回
    sendBack() {
      let that = this;

      let index = that.processTestSubInfoArray.findIndex(item => {
        return item.actId == that.actBackId;
      })
      if (index == -1) {
        that.$message({ type: "warning", message: "退回失败，该环节未执行" });
        return;
      }

      if (!that.actBackId) {
        that.$message({ type: "warning", message: "请选择退回环节" });
        return;
      }

      let currentAct = _.find(this.procTemplateData.actDef, { "actId": that.currentActId });
      let backAct = _.find(this.procTemplateData.actDef, { "actId": that.actBackId });
      let preAct = _.find(this.procTemplateData.actDef, { "actId": that.actId });


      let backPeopleParticipant = that.picMap[that.actBackId];
      let approvedBy = "";
      backPeopleParticipant.map(item => {
        approvedBy = approvedBy + "[" + item.participantId + "]" + item.participantName + ",";
      })

      let param = {
        actId: that.currentActId,
        actPreConfigId: currentAct.actPreConfigId,
        actBackRule: that.actBackRule,
        actBackId: that.actBackId,
        processTestLogModel: {
          procTestId: that.procTestId,
          nodeName: backAct.actName,
          approvedBy: approvedBy.substr(0, approvedBy.length - 1),
          procName: this.$route.query.procName,
        }
      };
      api.sendBack(param).then(async (res) => {
        if (res.code === "0") {
          if (res.data) {
            that.$message({ type: "success", message: '操作成功', });
            that.actBackInfo.isBackAct = true,
              that.actBackInfo.currentActId = that.currentActId;
            that.actBackInfo.currentActName = currentAct.actName;
            that.actBackInfo.currentActPreConfigId = currentAct.actPreConfigId;
            that.actBackInfo.actBackRule = that.actBackRule;
            that.actBackInfo.backActId = backAct.actId;
            that.actBackInfo.backActPreConfigId = backAct.actPreConfigId;
            that.actBackInfo.backActName = backAct.actName;
            // that.actBackInfo.actId = that.actId;
            that.currentActId = backAct.actId;
            that.currentActName = backAct.actName;
            this.currentActType = backAct.actType
            this.currPreActId = backAct.actPreConfigId
            that.submitType = "1";
            that.actBackId = "";
            if (that.actBackRule == 1) {
              await that.getNextActRouterConfig(that.actId);
            } else {
              await that.getNextActRouterConfig(that.actBackInfo.backActId);
            }
          }
          that.getSendBackConfig();
          that.queryList();
        }
      })
    },
    // 执行按钮触发
    submitProcTest() {
      if (this.validateError) {
        this.$message({ type: "error", message: this.validateMsg });
        return false;
      }

      if (this.submitType == 1) {
        this.execOnceStepFunc();
      } else {
        this.sendBack();
      }
    },
    async getModelByProcTestId() {
      let that = this;
      if (that.procLog == 1) {
        let param = that.procTestId;
        let result = await api.getModelByProcTestId(param);
        if (result.code === "0" && result.data) {
          that.processTestSubInfoArray = JSON.parse(result.data.testData);
        }
      }
    },
    // 参数分组
    paramGroup(type) {
      let that = this;
      let groupRulesRelDM = [];
      that.rulesRelDM.map(item => {
        let index = _.findIndex(groupRulesRelDM, { "mockCode": item.mockCode });
        if (index == -1) {
          let obj = {
            mockName: item.mockName,
            mockType: item.mockType,
            mockValue: item.mockValue,
            mockCode: item.mockCode,
            mockCode_before: item.mockCode.split('.')[0],
            mockCode_after: item.mockCode.split('.')[1],
            label: item.label ? item.label : item.mockName
          }
          groupRulesRelDM.push(obj);
        }
      })
      groupRulesRelDM.forEach(item => {
        this.groupRulesRelDM.forEach(_item => {
          if (item.mockCode === _item.mockCode) {
            item.mockValue = _item.mockValue
          }
        })
      })
      this.groupRulesRelDM = groupRulesRelDM
      // if (that.groupRulesRelDM.length > 0 && type !== 'change') {
      //   this.nextActData.forEach(item => {
      //     item.disabled = true
      //   })
      // }
      console.log(that.rulesRelDM, ' that.rulesRelDM')
    },
    preview(row) {
      let that = this;
      let actInfo = _.find(that.procTemplateData.actDef, { "actName": row.row.nodeName });
      if (actInfo) {
        let formModel = this.formModel.get(actInfo.actId);
        if (!formModel) {
          formModel = {
            formId: "",
            formName: "",
            version: 1
          }
        }
        let query = {
          categoryId: "",
          categoryName: "",
          createDate: "",
          createUserName: "",
          dataModelId: "",
          dataModelName: "",
          formId: formModel.formId,
          formName: "",
          remark: "",
          status: "",
          version: ""
        };

        let route = this.$router.resolve({ path: '/formPreview', query: query });
        window.open(route.href)
      }
    },
    //改变每页显示多少条数据
    changeSize(pageSize) {
      this.pageSize = pageSize;
      this.pageIndex = 1;
      this.queryList();
    },
    //改变页数
    changeCurrentPage(current) {
      this.pageIndex = current;
      this.queryList();
    },
    async createProcAct() {
      this.actList = [];
      await this.getNextActRouterConfig(this.currentActId);
      await this.getProc();
    },
    // 获取用户组信息
    async getUserGroupInfo(userName, participantType, actId, actName) {
      let that = this;
      let user = userName.split(",");
      var userDetail = [];
      if (participantType == 3) {
        for (let i = 0; i < user.length; i++) {
          let userNo = user[i].replace("[", "").split("]");
          let param = { groupId: userNo[0] };
          await api.processGroupCustormers(param).then(res => {
            if (res.code == "0") {
              const groupDefaultRelationDtos = res.data.groupDefaultRelationDtos;
              groupDefaultRelationDtos.map(item => {
                const userNameList = item.userNameList.split(",");
                userDetail.push(...userNameList);
              })
            }
          })
        }
        return userDetail.join(",");
      } else if (participantType == 4) {

        for (let i = 0; i < user.length; i++) {
          let userNo = user[i].replace("[", "").split("]")[0];
          if (that.funcMap.has(userNo)) {
            let funcList = that.funcMap.get(userNo);
            let param = {};
            let paramObj = {};
            funcList.map(item => {
              let groupRule = that.groupRulesRelDM.find(group => group.mockCode == item.mockCode);
              if (groupRule) {
                paramObj[item.mockName] = groupRule.mockValue;
              }
            })
            param.participantId = userNo;
            param.paramObj = paramObj;
            param.actId = actId;
            param.actName = actName;
            await api.getApproverByParticipantId(param).then(res => {
              if (res.code == "0") {
                let data = res.data;
                data.map(item => {
                  let participant = `[${item.participantId}]${item.participantName}`;
                  userDetail.push(participant)
                })
              }
            })
          }
        }
        return userDetail.join(",");
      }
      return "";
    },
    // 规则英文名称转义
    filedEscape() {
      this.groupRulesRelDM.map(item => {
        this.fieldMap.forEach((value, key) => {
          let field = value.find(v => item.mockCode == v.fieldCode);
          if (field) {
            item.mockName = field.dbFieldName;
          }
        });
        let respParam = this.respParamDtos.find(dto => dto.paramName == item.mockName);
        if (respParam) {
          item.mockName = respParam.paramDesc;
        }
      })
    },
    filterUserNo(user) {
      let userList = user.split(",");
      let userInfo = [];
      userList.map(item => {
        let userName = "";
        if (item.indexOf("[P") < 0) {
          userName = item.replace("[", "").split("]")[1];
        } else {
          userName = item;
        }
        userInfo.push(userName);
      })
      return userInfo.join(",");
    },
    getParamData() {
      let that = this
      let nextActData = {};
      let nextPreActData = {};
      if (that.actBackInfo.isBackAct) {
        that.currentActId = that.actBackInfo.backActId;
        that.currentActName = that.actBackInfo.backActName;
        that.currPreActId = that.actBackInfo.backActPreConfigId;
        if (that.actBackInfo.actBackRule == 1) {
          let arr = _.find(that.actArr, { "toActId": that.defaultAct.toActId });

          if (arr) {
            let actInfo = _.find(that.procTemplateData.actDef, { "actId": arr.actId });
            that.currentActId = arr.actId;
            that.currentActName = actInfo.actName;
            that.currPreActId = arr.actPreConfigId;
          } else {
            that.$message({
              message: '提交失败，未找到返回环节！',
              type: 'warning'
            })
            return false;
          }
        }
      }


      let formModel = that.formModel.get(that.currentActId);
      if (!formModel) {
        formModel = {
          formId: "",
          formName: "",
          version: 1
        }
      }
      //下一环节有多个并行任务时取选中环节
      if (!this.isShowSelectAct || !this.changeSelect) {
        nextActData = _.find(that.nextActData, { "actId": that.defaultAct.toActId });
        nextPreActData = _.find(that.nextPreActData, { "actId": that.defaultAct.toActId });
      } else {
        nextActData = _.find(that.nextActData, { "actId": that.selectActData.actId });
        nextPreActData = _.find(that.nextPreActData, { "actId": that.selectActData.actId });
      }
      // nextActData = that.nextActData
      // nextPreActData = that.nextPreActData

      that.actId = that.defaultAct.actId;
      // 将第一个环节作为下一环节
      let paramData = {
        testCaseInfo: {
          actId: that.currentActId,
          formId: formModel.formId,
          actName: that.currentActName,
          actSCTypeId: "",
          actPreId: that.currPreActId,
          actSCItemId: "",
          rulesTest: []
        },
        actInfo: {
          actId: that.currentActId,
          actName: that.currentActName,
          // expectData: [],
          expectData: {},
          actSCItemId: "",
          actPreId: that.currPreActId,
          execStatus: 0
        },
        processTestLogModel: {
          procId: that.procInfo.procId,
          procTestId: that.procTestId,
          nodeName: that.currentActName,
          approvedBy:
            that.defaultNextAct &&
              that.defaultNextAct.actType != 5 &&
              that.submitType == 1 &&
              !that.isEnd ? that.userName : "",
          serialNumber: that.total,
          procName: this.$route.query.procName,
        }
      }

      // if(that.nextActData.length>1){
      //   for (let i = 0; i < that.nextActData.length; i++) {
      //     let obj = {
      //       customAct: nextActData[i].actId,
      //       customPreAct: nextPreActData[i].actPreConfigId,
      //       customActParticipant: "",
      //       customSCType: "",
      //       customActAssignType: that.participantType,
      //       customActSCItemId: ""
      //     }
      //     paramData.actInfo.expectData.push(obj)
      //   }
      // }else {
      // paramData.actInfo.expectData.push({
      //   customAct: nextActData[0].actId,
      //   customPreAct: nextPreActData[0].actPreConfigId,
      //   customActParticipant: "",
      //   customSCType: "",
      //   customActAssignType: that.participantType,
      //   customActSCItemId: ""
      // })
      // }
      paramData.actInfo.expectData = {
        customAct: nextActData.actId,
        customPreAct: nextPreActData.actPreConfigId,
        customActParticipant: "",
        customSCType: "",
        customActAssignType: that.participantType,
        customActSCItemId: ""
      }

      if (this.isEnd) {
        paramData.processTestLogModel.nodeName = that.endAct.actName;
      }

      let userName = "";
      if (that.actBackInfo.isBackAct && that.actBackInfo.actBackRule == 1) {

        let peopleParticipant = that.picMap[that.defaultAct.toActId];
        that.userName = "";
        that.userData = [];

        let participant = _.find(peopleParticipant, { "participantOrder": 1 });
        let participantId = this.splitParticipantId(participant);

        let obj = {
          account: participantId,
          name: item.participantName
        };
        that.userData.push(obj);
        that.userName = `[${participantId}]${participant.participantName}`;

        let backPeopleParticipant = that.picMap[that.actBackInfo.backActId];
        let participant2 = _.find(backPeopleParticipant, { "participantOrder": 1 });
        let participantId2 = this.splitParticipantId(participant2);
        userName = `[${participantId2}]${participantId2.participantName}`;

        // peopleParticipant.map(item=>{
        //   let obj = {
        //     account:item.participantId,
        //     name:item.participantName
        //   };
        //   that.userData.push(obj);
        //   that.userName = that.userName+"["+item.participantId+"]"+item.participantName+",";
        // })
        // userName = that.userName.substr(0,that.userName.length - 1);
        // that.userName = that.userName.substr(0,that.userName.length - 1);
        //
        // let backPeopleParticipant = that.picMap[that.actBackInfo.backActId];
        // let approvedBy = [];
        // backPeopleParticipant.map(item=>{
        //   approvedBy.push("["+item.participantId+"]"+item.participantName);
        // })
        // paramData.processTestLogModel.nodeName = that.actBackInfo.backActName;
        // paramData.processTestLogModel.approvedBy = approvedBy.join(",");
        // userName = approvedBy.join(",");
      } else {
        that.userData.map(m => {
          userName = userName + "[" + m.account + "]" + m.name;
        });
      }

      let rulesTest = this.rulesTest.get(formModel.formId);
      if (rulesTest) {
        let rules = _.filter(rulesTest, { "ruleExpression": that.defaultAct.actRouteConditionContent })
        paramData.testCaseInfo.rulesTest = rules;

        if (paramData.testCaseInfo.rulesTest.length > 0) {
          paramData.testCaseInfo.rulesTest[0].ruleParamValues = that.ruleParamList;
        }
      }
      paramData.actInfo.expectData.customActParticipant = that.userData.map(m => {
        return m.account;
      }).join(",");
      if (nextActData.actType == 5) {
        paramData.actInfo.expectData.customActParticipant = 'end';
      }
      if (this.groupRulesRelDM && this.groupRulesRelDM.length > 0) {
        let modelRelation = []
        this.groupRulesRelDM.forEach(item => {
          modelRelation.push({
            entityNm: item.mockCode_before,
            fields: []
          })
        })
        let map = new Map()
        for (let item of modelRelation) {
          map.set(item.entityNm, item)
        }
        modelRelation = [...map.values()]
        this.groupRulesRelDM.forEach(item => {
          modelRelation.forEach(_item => {
            if (_item.entityNm === item.mockCode_before) {
              _item.fields.push({
                entityColumn: item.mockCode_after,
                value: item.mockValue
              })
              // let _map = new Map()
              // for (let _item of _item.fields) {
              //   _map.set(_item.entityNm, _item)
              // }
              // _item.fields = [..._map.values()]
            }
          })
        })
        Object.assign(paramData, {
          modelRelation: modelRelation
        })
      }
      return { userName: userName, nextActData: nextActData, paramData: paramData, nextPreActData: nextPreActData }
    },
    blurRulesRelDm() {
      let paramData = this.getParamData()
      api.getProcessSteps(paramData.paramData).then(async (result) => {
        if (result.code === '0' && result.data && result.data.length > 0) {
          // 判断是否切换
          console.log(this.targetActName, '========= this.targetActName====')
          let flag
          result.data.forEach(item => {
            if (item.actID === this.targetActName) {
              flag = true
              if (item.assigneeList && item.assigneeList.length > 0) {
                let user = []
                item.assigneeList.forEach(_item => {
                  if (_item.userID) {
                    user.push("[" + _item.userID + "]" + _item.userName);
                  }
                })
                console.log(user, 'user1')
                if (user.length > 0) {
                  this.userName = user.join(',')
                }
              } else if (item.cosignItemList && item.cosignItemList.length > 0) {
                let user = []
                item.cosignItemList.forEach(_item => {
                  if (_item.cosignerList[0]) {
                    user.push("[" + _item.cosignerList[0].userID + "]" + _item.cosignerList[0].userName);
                  }
                })
                if (user.length > 0) {
                  this.userName = user.join(',')
                }
              }
            }
          })
          if (!flag) {
            console.log(result.data, '============================result.data===========================')
            this.targetActName = result.data[0].actID
            this.handlerChangeTargetAct(result.data[0].actID)
            if (result.data[0].assigneeList && result.data[0].assigneeList.length > 0) {
              let user = []
              result.data[0].assigneeList.forEach(item => {
                if (item.userID) {
                  user.push("[" + item.userID + "]" + item.userName);
                }
              })
              if (user.length > 0) {
                this.userName = user.join(',')
              }
            } else if (result.data[0].cosignItemList && result.data[0].cosignItemList.length > 0) {
              let user = []
              result.data[0].cosignItemList.forEach(_item => {
                if (_item.cosignerList[0]) {
                  user.push("[" + _item.cosignerList[0].userID + "]" + _item.cosignerList[0].userName);
                }
              })
              if (user.length > 0) {
                this.userName = user.join(',')
              }
            }
          }
        }
      })
    }
  },
}



