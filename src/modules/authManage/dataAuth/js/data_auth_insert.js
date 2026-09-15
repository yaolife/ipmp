import breadcrumb from "@/components/common/breadcrumb";
import { throttle } from "@/utils/funcUtil";
import api from "../api/appApi";
import selectDataRule from "@/modules/authManage/common/component/selectDataRule";
import { calcHeight } from "@/utils/funcUtil";

export default {
  components: {
    breadcrumb,
    selectDataRule
  },
  data() {
    return {
      hasIcon: false,
      brand: [
        { name: "dataAuth.auth_manage" },
        { name: "dataAuth.data_auth" }
        // { name: 'dataAuth.data_auth_insert' }
      ],
      maxTableHeight: 0,

      roleGroupList: [],
      roleList: [],
      appList: [],

      // 选人员身份
      actDefData: {
        actId: "",
        actCode: "",
        actName: "",
        actNameEn: "",
        actDesc: "",
        actType: "",
        actTaskType: 1,
        isCountersign: "",
        assignType: 1,
        assignRule: 0,
        actCommForm: {
          isActFormBaseInfo: 0,
          isActFormDaily: 0,
          isActFormSuggest: 0,
          actFormAttShowType: 0,
          actFormAttPriv: [],
          actFormBtnShowFlag: 0,
          actFormInitiateBtnShow: [],
          actFormBacklogBtnShow: [],
          actFormDoneBtnShow: [],
          actFormConcernBtnShow: []
        },
        actRollback: {
          actsBackAllow: [],
          actBackRule: 0,
          actEditBackRuleFlag: 0
        },
        actFormBind: {
          formBindType: 0,
          formBindCustContent: "",
          formCategoryId: "",
          formId: "",
          formVersion: "",
          paydateBindId: "",
          actupaydateBindId: "",
          formRuleType: 0,
          actFormConrule: [],
          printTempId: ""
        },
        actParticipant: [],
        actParticipantSC: [],
        actRouter: [],
        actConpriv: {
          // 上一环节进入本环节
          firstactEditCuractFlag: [],
          // 当前执行人可编辑的会签环节
          cuactEditCountersignFlag: [],
          // 前面环节跨环节选人
          firstactEditOtheractFlag: [],
          // 运行到当提前环节时权限配置
          curactEditFlag: [],
          countersignTipShowFlag: 0,
          countersignUserCheckFlag: 0,
          countersignMoveFlag: 0
        }
      },
      userData: [],
      orgData: [],
      groupData: [],
      stationData: [],
      addDataAuth: {
        roleGroupId: "",
        roleId: "",
        validStartDate: "",
        validEndDate: "",
        remark: "",
        userIds: [],
        orgIds: [],
        groupIds: [],
        postIds: [],
        dataAuthDtoList: []
      },
      // 用于暂存时间
      dataAuthTime: [],
      treedata: [],
      // 用于缓存数据
      treeNodeId: "",
      // 存储菜单id
      functionCode: "",
      defaultProps: {
        children: "children",
        label: "name"
      },
      treeQueryData: {
        searchType: "0",
        pageIndex: 1,
        pageSize: 10,
        entityName: "",
        businessType: "",
        entityDescribe: ""
      },
      treeTableData: {},

      showSelectRole: false,

      dataRule: {},
      dataAuthId: "",
      queryData: {
        searchType: "0",
        pageIndex: 1,
        pageSize: 10,
        entityName: "",
        businessType: "",
        entityDescribe: ""
      },
      insertDataRule: [],
      showSelectDataRule: false,

      roleRules: {
        roleGroupIds: [
          { required: true, message: "请选择授权角色组", trigger: "change" }
        ],
        roleId: [{ required: true, message: "请选择角色", trigger: "change" }],
        validStartDate: [
          { required: true, message: "请选择开始日期", trigger: "change" }
        ],
        validEndDate: [
          { required: true, message: "请选择结束日期", trigger: "change" }
        ]
      },

      treeLoading: false,
      tabelLoading: false,

      roleData: {},
      isdisabled: false,
      initOrgList: [],
      // 回显意见选择的人员
      initUserId: ''
    };
  },
  created() {
    this.getAppList();
    this.getRoleGroup();
    if (this.$route.query.disabled) {
      this.isdisabled = true;
      this.roleData = JSON.parse(window.localStorage.getItem("roleData"));
      this.dataAuthId = this.roleData.dataAuthId;
      this.getTreeDetail(this.roleData.dataAuthId, this.roleData.roleId);
    }
  },
  mounted() {
    this.initMaxHeight();
    // throttleFunc记录当前的节流方法，用于在页面销毁时释放
    this.throttleFunc = throttle(this.initMaxHeight, 500);
    window.addEventListener("resize", this.throttleFunc);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.throttleFunc);
    // window.localStorage.clear("roleData");
  },
  methods: {
    // 动态计算高度
    initMaxHeight() {
      calcHeight(this);
    },
    // 回显页面
    getTreeDetail(dataAuthId, roleId) {
      const loading = this.$loading();
      api.getDataAuthDetail({ dataAuthId: dataAuthId, roleId: roleId })
        .then(res => {
          loading.close();
          this.treedata = res.data.functionTree;
          // 处理选人数据
          if (res.data.personList.length > 1) {
            this.initUserId = res.data.personList[0]
            let userNumArr = res.data.personList[0].split(',')
            let userNameArr = res.data.personList[1].split(',')
            for (let i = 0; i < userNumArr.length; i++) {
              this.userData.push({
                userNum: userNumArr[i],
                userName: userNameArr[i]
              })
            }
            //this.addDataAuth.userIds.push('person', [userNumArr.join(';')])
          }
          // 处理组织数据
          this.initOrgList = [];
          if (res.data.orgList && res.data.orgList.length > 1) {
            let orgNumArr = res.data.orgList[1][1].split(';')
            let orgNameArr = res.data.orgList[1][5].split(';')
            for (let i = 0; i < orgNumArr.length; i++) {
              this.orgData.push({
                orgNum: orgNumArr[i],
                orgName: orgNameArr[i]
              })
            }
            this.initOrgList = res.data.orgList;
            //this.orgData.splice(-1,1)
          }

          this.groupData = res.data.groupList;
          this.stationData = res.data.postIds

          this.addDataAuth.userIds.push('person',res.data.personList)
          this.addDataAuth.orgIds = res.data.orgList
          this.addDataAuth.groupIds = res.data.groupList
          this.addDataAuth.postIds = res.data.postIds

          let startDate = res.data.dataAuthMain.validStartDate;
          if (startDate) {
            startDate = startDate.replace(/\-/g, '/');
            this.dataAuthTime.push(startDate);
          }
          let endDate = res.data.dataAuthMain.validEndDate;
          if (endDate) {
            endDate = endDate.replace(/\-/g, '/');
            this.dataAuthTime.push(endDate);
          }

          this.addDataAuth.remark = res.data.dataAuthMain.remark;
          //this.changeRoleGroup();
          this.addDataAuth.roleId = res.data.roleId
          this.addDataAuth.appId = res.data.appId
          this.changeApp(res.data.appId);
        })
        .catch(err => {
          loading.close();
          console.log(err)
        });
    },
    // 获取应用列表
    getAppList() {
      let that = this
      api.currUserAppList().then((response) => {
        that.appList = response.data;
      })
    },
    //应用列表选择
    handleChangeApp(appId) {
      api.getRoleListByAppId({ appId: appId }).then(res => {
        this.roleList = res.data;
        this.addDataAuth.roleId = ''
      }).catch(err => {
        this.$message.error(err.msg);
      });
    },
    changeApp(appId) {
      api.getRoleListByAppId({ appId: appId }).then(res => {
        this.roleList = res.data;
      }).catch(err => {
        this.$message.error(err.msg);
      });
    },
    // 获取授权角色组
    getRoleGroup() {
      api.queryRoleGroupByAppId({ roleGroup: "ttt" })
        .then(res => {
          this.roleGroupList = res.data;
          this.roleGroupList.unshift({ "roleGroupCode": "-2", "roleGroupName": "请选择" });
          if (this.$route.query.disabled) {
            let roleGroup = this.roleGroupList.find(item => {
              return item.roleGroupCode === this.roleData.roleGroupId;
            });
            this.addDataAuth.roleGroupId = roleGroup.roleGroupCode;
            //this.changeRoleGroup();
          } else {
            this.addDataAuth.roleGroupId = "-2";
          }
        })
        .catch(err => {
          //this.$message.error(err.msg);
        });
    },
    // 授权角色组联动角色
    changeRoleGroup() {
      api.getRoleListByGroup({ roleGroupCode: this.addDataAuth.roleGroupId })
        .then(res => {
          this.roleList = res.data;
          if (this.$route.query.disabled) {
            let role = this.roleList.find(item => {
              return item.roleId === this.roleData.roleId;
            });
            this.addDataAuth.roleId = role.roleId;
          }
          // this.checkRole();
        })
        .catch(err => {
          //this.$message.error(err.msg);
        });
    },
    handleChangeRoleGroup() {
      this.addDataAuth.roleId = '';
      api.getRoleListByGroup({ roleGroupCode: this.addDataAuth.roleGroupId })
        .then(res => {
          this.roleList = res.data;
          if (this.$route.query.disabled) {
            let role = this.roleList.find(item => {
              return item.roleId === this.roleData.roleId;
            });

          }
          // this.checkRole();
        })
        .catch(err => {
          //this.$message.error(err.msg);
        });
    },
    // 根据角色生成树
    checkRole() {
      //this.getTreeData();
    },
    // 选数据规则
    selectDataRule() {
      this.showSelectDataRule = true;
      this.getDataRule();
    },
    getDataRule() {
      api.getDataRulePageList(this.queryData)
        .then(res => {
          for (let i = 0; i < res.records.length; i++) {
            res.records[i].ruleOriginalContent = JSON.parse(res.records[i].ruleOriginalContent)
          }
          this.dataRule = res;

        })
        .catch(err => {
          this.$message.error(err.msg);
        });
    },
    // 选择数据规则后提交
    saveRoleData() {
      let dataRuleIdList = [];
      this.insertDataRule.map(item => {
        dataRuleIdList.push(item.dataRuleId);
      });

      let params = {
        dataAuthId: this.dataAuthId,
        functionCode: this.functionCode,
        dataRuleIdList: dataRuleIdList,
        ...this.addDataAuth
      };
      api.addFuncDataRule(params).then(res => {
          this.dataAuthId = res.data;
          this.$message.success(res.msg);
          this.getTreeTableData();
          this.showSelectDataRule = false;
        })
        .catch(err => {
          this.$message.error(err.msg);
        });
    },
    // 弹出框数据规则表格多选
    handleSelectionChange(val) {
      this.insertDataRule = val;
    },
    // 弹出框选数据规则分页
    changeCurrentPage(pageIndex) {
      this.queryData.pageIndex = pageIndex;
      this.getDataRule();
    },
    // 选数据规则页数
    changeSize(pageSize) {
      this.queryData.pageSize = pageSize;
      this.getDataRule();
    },
    // 获取树菜单
    getTreeData() {
      this.treeLoading = true;
      api.getDataAuthDetail({ roleId: this.addDataAuth.roleId })
        .then(res => {
          this.treedata = res.data.functionTree;
          // this.$refs.tree.setCheckedKeys(this.treedata);
          this.treeLoading = false;
        })
        .catch(err => {
          // this.$message.error(err.msg)
        });
    },
    saveTreeNodeData(data) {
      this.treeNodeId = data.id;
      this.functionCode = data.functionCode;
      this.getTreeTableData();
    },
    // 查询子节点的数据
    getTreeTableData() {
      this.tabelLoading = true;
      api.getDataRuleByFunctinCodeAndRole({
        dataAuthId: this.dataAuthId,
        functionCode: this.functionCode
      }).then(res => {
        for (let i = 0; i < res.data.length; i++) {
          res.data[i].ruleOriginalContent = JSON.parse(res.data[i].ruleOriginalContent)
        }
        this.treeTableData = res;
        this.addDataAuth.dataAuthDtoList = res.data
        this.tabelLoading = false;
      }).catch(err => {
        console.log(err);
      });
    },
    // 删除
    delRow(val) {
      this.$confirm("此操作将永久删除该数据, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        let params = {
          dataAuthId: val.dataAuthId,
          functionCode: val.functionCode,
          dataRuleId: val.dataRuleId
        };
        api.delFuncDataRule(params).then(res => {
          this.getTreeTableData();
          this.$message.success(res.msg);
        }).catch(err => {
          this.$message.error(err.msg);
        });
      });
    },
    insert() {
      if (this.addDataAuth.userIds.length === 0 && this.addDataAuth.orgIds.length === 0 && this.addDataAuth.groupIds
        .length === 0 && this.addDataAuth.postIds.length === 0) {
        this.$message.error("请至少选择一个人员维度");
        return;
      }
      // if (this.addDataAuth.orgIds[1][1] === "") {
      //   this.$message.error("组织不能为空");
      //   return;
      // }
      // if (this.addDataAuth.groupIds.length === 0) {
      //   this.$message.error("用户组不能为空");
      //   return;
      // }
      this.addDataAuth.validStartDate = this.dataAuthTime[0]
      this.addDataAuth.validEndDate = this.dataAuthTime[1]
      let dataAuthDtoList = [];
      this.addDataAuth.dataAuthDtoList = this.treeTableData.data;
      if (this.insertDataRule.length !== 0) {
        this.addDataAuth.dataAuthDtoList.map(item => {
          dataAuthDtoList.push({
            functionCode: this.functionCode,
            dataRuleId: item.dataRuleId
          });
        });
      }

      let insertDataAuth = {
        ...this.addDataAuth,
        dataAuthId: this.dataAuthId,
        personList: this.addDataAuth.userIds,
        dataAuthDtoList: dataAuthDtoList,
        treedata: this.treedata,
      };
      // 修改
      if (this.$route.query.disabled) {
        insertDataAuth.dataAuthId = this.dataAuthId;
        const loading = this.$loading();
        api.saveDataAuth(insertDataAuth).then(res => {
          loading.close();
          this.$message.success(res.msg);
          this.closeInsert();
        })
        .catch(err => {
          loading.close();
          this.$message.error(err.msg);
        });
        return;
      }
      // 新增
      this.$refs.role.validate(valid => {
        if (valid) {
          const loading = this.$loading();
          api.saveDataAuth(insertDataAuth).then(res => {
            loading.close();
            this.$message.success(res.msg);
            //this.getFlowList();
            this.closeInsert();
          })
          .catch(err => {
            loading.close();
            this.$message.error(err.msg);
          });
        } else {
          return false;
        }
      });
    },
    closeInsert() {
      this.$refs.role.resetFields();
      // this.$router.push("/dataAuth");
      //刷新列表
      if (window.refreshData) {
        window.refreshData();
      }
      //关闭页签
      this.closeTab('/dataAuth');
    },
    // 选人员身份
    closeCreatorFunc() {
      this.showSelectRole = false;
    },
    commitActParticipantFunc() {
      this.userData = []
      this.orgData = []
      this.initOrgList = []
      this.initUserId = ''
      let actParticipantData = this.$refs.selectDataRule.getData();
      this.stationData = []
      let userData = [];
      let orgData = [];
      let groupData = [];
      let stationData = [];
      if (actParticipantData) {
        userData = actParticipantData.get("userData");
        orgData = actParticipantData.get("orgData");
        this.initOrgList = orgData;
        groupData = actParticipantData.get("groupData");
        stationData = actParticipantData.get("stationData");
        // 组织职位数据
        if (stationData.data && stationData.data.length > 0) {
          this.stationData = [];
          for (let i = 0; i < stationData.code.length; i++) {
            for (let j = 0; j < stationData.data.length; j++) {
              if (stationData.data[j].postCode == stationData.code[i]) {
                this.stationData.push(stationData.data[j]);
              }
            }
          }
        }
        // 处理选人数据
        if (userData && userData.length > 6) {
          let userNumArr = userData[1][0].split(';')
          let userNameArr = userData[1][1].split(';')
          for (let i = 0; i < userNumArr.length; i++) {
            this.initUserId += (i === 0 ? '' : ',') + userNumArr[i]
            this.userData.push({
              userNum: userNumArr[i],
              userName: userNameArr[i]
            })
          }
        }
        // 处理组织数据
        if (orgData[1][1] != "") {
          let orgNumArr = orgData[1][1].split(';')
          let orgNameArr = orgData[1][5].split(';')
          for (let i = 0; i < orgNumArr.length; i++) {
            this.orgData.push({
              orgNum: orgNumArr[i],
              orgName: orgNameArr[i]
            })
          }
        }
        this.groupData = groupData;
        this.addDataAuth.userIds = userData;
        this.addDataAuth.orgIds = orgData;
        this.addDataAuth.groupIds = groupData;
        this.addDataAuth.postIds = stationData.code;
        this.closeCreatorFunc();
      }
    }
  }
};
