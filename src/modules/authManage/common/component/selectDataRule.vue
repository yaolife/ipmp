<template>
  <div>
    <el-tabs v-model="activeTabName" class="border-bottom-card">
      <el-tab-pane :label="$t('dataAuth.select_user_name')" name="userTab" v-if="showUserTab">
        <person ref="userComponent" :IDS="initUserId" :buttonGroup="buttonGroup"
          :showCheckBox="showCheckbox" :appCode="appCode" :lang="lang" :init-org-id="initOrgId"></person>
      </el-tab-pane>
      <el-tab-pane :label="$t('dataAuth.select_department')" name="orgTab" v-if="showOrgTab">
        <organization ref="orgComponent" :buttonGroup="buttonGroup" :showCheckBox="orgShowCheckbox"
          :initOrgList="initOrgList" initOrgId="00888888" :appCode="appCode" :lang="lang" :rightMenuItems="rightMenuItems"></organization>
      </el-tab-pane>
      <!-- <el-tab-pane :label="$t('dataAuth.select_user_group')" name="userGroupTab" v-if="showUserGroupTab">
        <el-row style="padding: 10px 10px;">
          <el-col :span="20" v-if="groupRuleBindingData.ruleContext" style="padding-top: 5px;">
            {{$t('dataAuth.select_route_binding_context')}}：[{{groupRuleBindingData.ruleName}}]-{{groupRuleBindingData.ruleContext}}
          </el-col>
        </el-row>
        <el-row class="usergroup">
          <el-transfer ref="transferGroup" filterable :filter-placeholder="$t('dataAuth.select_enter_group_name')"
            :titles="queryData" :props="{ key: 'groupId', label: 'groupName' }" v-model="transferGroupData"
            @change="transferGroupChangeFunc" :data="transferGroupAllData" :render-content="renderGroupShow">
          </el-transfer>
        </el-row>
      </el-tab-pane> -->
      <!-- 不需要反显示 -->
      <!-- <el-tab-pane :label="$t('dataAuth.select_post')" name="stationTab" v-if="showStationTab">
        <el-form ref="showStationTabForm" size="small" label-position="top" label-suffix="：" label-width="110px">
          <el-row>
            <el-col :span="24">
              <el-form-item :label="$t('dataAuth.select_company')" prop="companyName">
                <el-input :placeholder="$t('dataAuth.select_company')" disabled v-model="stationSelCompany.companyName">
                  <el-button type="primary" class="el-button--half" slot="append" icon="el-icon-search"
                    @click="openCompanyDialogFun"></el-button>
                </el-input>
              </el-form-item>
            </el-col>
            <el-transfer :titles="stationTransferTitles" v-model="stationSelData" :data="stationTypeConfig"
              :props="{key: 'postCode', label: 'postName'}" @change="transferPostFunc"></el-transfer>
          </el-row>
        </el-form>
      </el-tab-pane> -->
    </el-tabs>
    <!-- 公司选择弹出框 -->
    <div class="companyDialog">
      <el-dialog :visible.sync="showCompanyDialog" v-if="showCompanyDialog" custom-class="company-dialog" :modal="false"
        :destory-on-close="true" :title="$t('flow.company_dialog_title')" :close-on-click-modal="false"
        @opened="opendCompanyDialogFun" @close="closedCompanyDialogFun">
        <div class="companyDialogBody el-dialog-div">
          <cud-commm-org-component ref="stationOrgDialogComponent" :init-org-id="initOrgId"
            :buttonGroup="stationOrgDialogComponentOption.buttonGroup"
            :showCheckbox="stationOrgDialogComponentOption.showCheckbox"
            :appCode="stationOrgDialogComponentOption.appCode" :lang="stationOrgDialogComponentOption.lang">
          </cud-commm-org-component>
        </div>
        <div slot="footer" class="dialog-footer" align="center">
          <el-button @click="closeCompanyDialog" round>{{$t('cm.close')}}</el-button>
          <el-button type="primary" @click="commitCompanyDialogBinding" round>{{$t('cm.commit')}}</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
  import person from '@/components/cudCommPersonComponent/msingle.vue'
  import organization from '@/components/cudCommPersonComponent/organization.vue'
  import API from './api'
  // import ruleApi from '@/components/ruleComponent/api'
  // import ruleBinding from '@/components/ruleComponent/rule-binding/ruleBinding'
  import constant from '@/components/cudCommPersonComponent/constant.js'
  import cmsg from '@/components/common/message'
  import _ from 'lodash'
  export default {
    name: 'selectDataRule',
    props: {
      showUserMultiple: {
        type: Boolean,
        default: true
      },
      showUserTab: {
        type: Boolean,
        default: true
      },
      showOrgTab: {
        type: Boolean,
        default: true
      },
      showUserGroupTab: {
        type: Boolean,
        default: true
      },
      showDynRoleTab: {
        type: Boolean,
        default: true
      },
      showStationTab: {
        type: Boolean,
        default: true
      },
      orgShowCheckbox: {
        type: Boolean,
        default: true
      },
      initOrgId: {
        type: String,
        default: '00888888'
      },
      //部门回显
      initOrgList: {
        type: Array,
        default: () => {
          return [];
        }
      },
      initUserId: {
        type: String,
        default: ''
      }
    },
    components: {
      person,
      organization,
    },
    data() {
      return {
        activeTabName: 'userTab',
        /*********************************选人和选组织组件(userTab,orgTab) BEGIN*************************************************/
        IDS: "", // 回显人员
        buttonGroup: false,
        showCheckbox: true,
        //orgShowCheckbox: false,
        appCode: 'cud',
        lang: 'zh_CN',
        // initOrgId: '00888888',
        // 搜索框标题
        queryData: [this.$t('dataAuth.select_all_group'), this.$t('dataAuth.select_group')],
        /*********************************选人和选组织组件 END*************************************************/

        /*******************************流程组（groupTab） BEGIN************************************************************/
        transferGroupAllData: [], //组全部数据
        transferGroupData: [], //流程组穿梭框选择的数据
        groupData: [], //流程组选中的数据
        groupRuleBindType: constant.ruleFunType.currency, //流程组绑定规则的规则类型
        groupRuleBindingData: {}, //绑定的通用角色的规则
        /*******************************流程组 END************************************************************/
        dynamicRoleRuleType: constant.ruleFunType.dynamic, //动态角色规则绑定类型
        //绑定的动态角色的规则
        dynamicRoleData: [],
        /*******************************动态角色 END*****************************************************/

        /*********************职位Tab(stationTab) BEGIN***************************************************** */
        stationTransferTitles: ['全部岗位', '已选岗位'],
        // 选择公司绑定对象
        stationSelCompany: {
          companyId: '',
          companyName: ''
        },
        // 职位选择的对象
        stationSelData: [],
        // 公司选择窗口选择
        showCompanyDialog: false,
        stationOrgDialogComponentOption: {
          buttonGroup: false,
          showCheckbox: false,
          appCode: 'cud',
          lang: 'zh_CN',
        },
        stationData: [],
        stationTypeConfig: [],
        // 当前选择的公司职位信息数据
        currSelStationPersonData: {
          deptNo: '',
          header1: '',
          header1Str: '',
          header2: '',
          header2Str: '',
          assistantBugget: '',
          assistantBuggetId: '',
          hrAssistantBuggetId: '',
          hrAssistantBugget: ''
        },
        showStateionPersons: '',
        stationTypeData: [],
        stationTypeMultipleSelection: [],
        selStationTypeMultipleSelection: [],
        selStationTypeData: {},
        /*********************职位Tab END***************************************************** */
        rightMenuItems: [],
      }
    },
    computed: {
      initOrgIdNew() {
        if (this.initOrgId === '') {
          return '00888888'
        }
        return this.initOrgId
      }
    },
    watch: {
      initOrgId: {
        handler(newValue, oldValue) {
          if (this.showUserTab === true) {
            this.$nextTick(() => {
              this.$refs.userComponent.initOrgTree()
            })
          }

        },
        deep: true
      },
    },
    mounted() {
      if (this.showUserTab === true) {
        this.activeTabName = 'userTab'
      } else if (this.showOrgTab === true) {
        this.activeTabName = 'orgTab'
      } else if (this.showUserGroupTab === true) {
        this.activeTabName = 'userGroupTab'
      } else if (this.showDynRoleTab === true) {
        this.activeTabName = 'dynRoleTab'
      } else if (this.showStationTab === true) {
        this.activeTabName = 'stationTab'
      }
      this.init()
      //回显
      if (this.initOrgList) {
        let orgIds = this.initOrgList[1][0].split(';') || [];
        let orgName = this.initOrgList[1][5].split(';') || [];
        let rightMenuItems = [];
        orgIds.forEach((item, index) => {
          rightMenuItems[index] = {
            id: item,
            label: orgName[index]
          }
        })
        this.rightMenuItems = rightMenuItems;
      }
    },
    methods: {
      init() {
        //初始化流程组 获取流程组相关的规则列表
        if (this.showUserGroupTab === true) {
          this.initWFGroupList()
        }
      },
      /************************** 流程组 BEGIN ******************************************************/
      //组选中数据收集
      transferGroupChangeFunc(value) {
        let _this = this;
        _this.postData = [];
        _this.groupData = []
        this.transferGroupAllData.find((item) => {
          if (value.indexOf(item.groupId) > -1) {
            let selGroupData = {}
            selGroupData.participantType = 3
            selGroupData.participantId = item.groupId
            selGroupData.participantName = item.groupName
            _this.groupData.push(selGroupData);
          }
        });
      },
      //获取组列表
      initWFGroupList() {
        let _this = this;
        API.getGroupListAPI({}).then(res => {
          if (res.code === '0') {
            _this.transferGroupAllData = res.data
          }
        }).catch((error) => {
          cmsg.httpCatchErrorMessage(_this)
        })
      },
      // 用于显示流程组内容的渲染
      // renderGroupShow(h, option) {
      //   let groupDesc = option.groupDesc
      //   if (option.groupDesc && option.groupDesc.length > 20) {
      //     return <span title = { option.groupDesc } > { option.groupName } [{ option.groupDesc.substring(0, 20) }...] <
      //       /span>
      //   } else if (option.groupDesc && option.groupDesc.length <= 20) {
      //     return <span title = { option.groupDesc } > { option.groupName } [{ option.groupDesc }] < /span>
      //   } else {
      //     return <span > { option.groupName } < /span>
      //   }
      // },
      // 通用组绑定规则回调
      groupRuleBindCallback(data) {
        this.groupRuleBindingData = {
          ruleId: data.actRouteConditionId,
          ruleContext: data.actRouteConditionContent,
          ruleName: data.ruleName,
        }
      },
      //显示通用角色规则弹窗
      bindGroupRuleFunc() {
        let formId = this.$store.state.workflow.actFormId;
        // if(!formId || formId === '') {
        //     this.$message({
        //         message: '请先配置表单之后再选择规则',
        //         type: 'warning'
        //     })
        //     return;
        // }

        this.$refs.ruleCurrencyBinding.dialogVisible = true;
        this.$refs.ruleCurrencyBinding.dialogType = 'currencyTab';
        let ruleBindingData = { actRouteConditionId: this.groupRuleBindingData.ruleId }
        this.$refs.ruleCurrencyBinding.formId = formId
        this.$refs.ruleCurrencyBinding.getBindingRule(ruleBindingData);
      },
      /************************** 流程组 END ******************************************************/

      /*************************** 动态角色 BEGIN****************************************************** */
      //显示动态角色规则弹窗
      bindDynamicRoleRuleFunc() {
        let formId = this.$store.state.workflow.actFormId;
        // if(!formId || formId === '') {
        //     this.$message({
        //         message: '请先配置表单之后再选择规则！',
        //         type: 'warning'
        //     })
        //     return
        // }
        this.$refs.ruleDynamicBinding.dialogVisible = true;
        this.$refs.ruleDynamicBinding.dialogType = 'dynamicTab';
        let ruleBindingData = {}
        this.$refs.ruleDynamicBinding.formId = formId
        this.$refs.ruleDynamicBinding.getBindingRule(ruleBindingData);
      },
      // 动态角色绑定规则回调
      bindingDynamicRoleRuleCallback(data) {
        for (let item in this.dynamicRoleData) {
          if (this.dynamicRoleData[item].ruleName == data.ruleName) {
            this.$message({
              message: '该规则已绑定',
              type: 'warning'
            })
            return
          }
        }
        this.dynamicRoleData.push({
          participantType: 4,
          participantId: data.actRouteConditionId,
          participantName: data.ruleName,
        })

      },
      delDynaRule(row, index) {
        this.dynamicRoleData.splice(index, 1)
      },
      /*********************************动态角色 END***************************************************** */

      /*********************************职位/岗位 BEGIN************************************ */
      // 收集岗位数据
      transferPostFunc() {
        this.selStationTypeData = {}
        this.selStationTypeData.code = this.stationSelData
        this.selStationTypeData.data = this.stationTypeConfig
      },
      // 选择公司对话框方法
      openCompanyDialogFun() {
        this.showCompanyDialog = true
      },
      // 打开选择公司窗口
      opendCompanyDialogFun() {},
      // 关闭选择公司窗口
      closedCompanyDialogFun() {

      },
      // 关闭选择公司窗口
      closeCompanyDialog() {
        this.showCompanyDialog = false
      },
      //提交公司选择窗口
      commitCompanyDialogBinding() {
        let selCompanyData = this.$refs.stationOrgDialogComponent.getData()
        console.log(selCompanyData[1][0])
        API.getPostDataAPI({ companyId: selCompanyData[1][0] }).then(res => {
          this.stationTypeConfig = res.data
          this.closeCompanyDialog()
        }).catch(err => {
          console.log(err)
        })
        // let selCompanyData = this.$refs.stationOrgDialogComponent.getData()
        // console.log(selCompanyData)
        // if(selCompanyData && selCompanyData[0] && selCompanyData[0] === 'orgTree') {
        //     if(selCompanyData[1] && selCompanyData[1][0] && selCompanyData[1][0] != '' && selCompanyData[1][1] != '') {
        //         this.stationSelCompany.companyId = selCompanyData[1][1]
        //         this.stationSelCompany.companyName = selCompanyData[1][5]
        //         this._queryOrgStation()
        //         this.closeCompanyDialog()
        //     }else if(selCompanyData[1] && selCompanyData[1][0] && selCompanyData[1][0] === '' && selCompanyData[1][1] === '') {
        //         this.stationSelCompany.companyId = ''
        //         this.stationSelCompany.companyName = ''
        //     }else {
        //         this.$message({
        //             message: '中台选人组件返回的数据格式错误，请联系管理员，选择项将被清空！',
        //             type: 'warning'
        //         })
        //         this.stationSelCompany.companyId = ''
        //         this.stationSelCompany.companyName = ''
        //     }
        // }else {
        //     this.$message({
        //         message: '中台选人组件返回的数据格式错误，请联系管理员，选择项将被清空！',
        //         type: 'warning'
        //     })
        //     this.stationSelCompany.companyId = ''
        //     this.stationSelCompany.companyName = ''
        // }
      },
      // 查询组织下的职位信息
      _queryOrgStation() {
        let param = { 'deptId': this.stationSelCompany.companyId }
        let that = this
        API.queryStationPersonAPI(param).then((result) => {
          if (result.code != '0') {
            that.$message({
              message: result.msg,
              type: 'warning'
            });
          } else {
            // that._initStationTypeConfig()
            // let index = -1
            // if(!result.data['header1'] || result.data['header1'] === '') {
            //     index = that.stationTypeConfig.findIndex((n) => {
            //         return n.value === '1'
            //     })
            //     if(index >= 0) {
            //         that.stationTypeConfig.splice(index, 1)
            //     }

            // }
            // if(!result.data['header2'] || result.data['header2'] === '') {
            //     index = that.stationTypeConfig.findIndex((n) => {
            //         return n.value === '2'
            //     })
            //     if(index >= 0) {
            //         that.stationTypeConfig.splice(index, 1)
            //     }
            // }
            // if(!result.data['assistantBugget'] || result.data['assistantBugget'] === '') {
            //     index = that.stationTypeConfig.findIndex((n) => {
            //         return n.value === '3'
            //     })
            //     if(index >= 0) {
            //         that.stationTypeConfig.splice(index, 1)
            //     }
            // }
            // if(!result.data['hrAssistantBugget'] || result.data['hrAssistantBugget'] === '') {
            //     index = that.stationTypeConfig.findIndex((n) => {
            //         return n.value === '5'
            //     })
            //     if(index >= 0) {
            //         that.stationTypeConfig.splice(index, 1)
            //     }
            // }

            that.currSelStationPersonData = result.data
            that.stationTypeData = []

            if (result.data) {
              if (result.data['header1'] && result.data['header1'] !== '') {
                let stationPersonData = {}
                stationPersonData.stationType = '1'
                stationPersonData.stationTypePersons = result.data['header1Str']
                stationPersonData.stationTypePersonIds = result.data['header1']
                that.stationTypeData.push(stationPersonData)
              }
              if (result.data['header2'] && result.data['header2'] !== '') {
                let stationPersonData = {}
                stationPersonData.stationType = '2'
                stationPersonData.stationTypePersons = result.data['header2Str']
                stationPersonData.stationTypePersonIds = result.data['header2']
                that.stationTypeData.push(stationPersonData)
              }
              if (result.data['assistantBuggetId'] && result.data['assistantBuggetId'] !== '') {
                let stationPersonData = {}
                stationPersonData.stationType = '5'
                stationPersonData.stationTypePersons = result.data['assistantBugget']
                stationPersonData.stationTypePersonIds = result.data['assistantBuggetId']
                that.stationTypeData.push(stationPersonData)
              }
              if (result.data['deptSecretaryId'] && result.data['deptSecretaryId'] !== '') {
                let stationPersonData = {}
                stationPersonData.stationType = '3'
                stationPersonData.stationTypePersons = result.data['deptSecretary']
                stationPersonData.stationTypePersonIds = result.data['deptSecretaryId']
                that.stationTypeData.push(stationPersonData)
              }
            }
          }
        }).catch((error) => {
          cmsg.httpCatchErrorMessage(that)
        })
      },
      // 职位类型表格
      stationTypeHandleSelectionChange(val) {
        this.stationTypeMultipleSelection = val;
      },
      selStationTypeHandleSelectionChange(val) {
        this.selStationTypeMultipleSelection = val;
      },
      addStationType() {
        let companyId = this.stationSelCompany.companyId
        let companyName = this.stationSelCompany.companyName
        let selStationTypeObj = {}
        for (let i = 0; i < this.stationTypeMultipleSelection.length; i++) {
          selStationTypeObj = {}
          let stationTypeSelection = this.stationTypeMultipleSelection[i]
          let sameIndex = _.findIndex(this
        .selStationTypeData, { 'stationOrgId': companyId, 'stationType': stationTypeSelection
              .stationType, 'stationTypePersonIds': stationTypeSelection.stationTypePersonIds })
          if (sameIndex < 0) {
            selStationTypeObj.stationOrgName = companyName
            selStationTypeObj.stationOrgId = companyId
            selStationTypeObj.stationType = stationTypeSelection.stationType
            let findStationTypeName = _.find(constant.stationType, { 'value': stationTypeSelection.stationType })
            if (findStationTypeName) {
              selStationTypeObj.stationTypeName = findStationTypeName.label
            } else {
              selStationTypeObj.stationTypeName = ''
            }
            selStationTypeObj.stationTypePersonIds = stationTypeSelection.stationTypePersonIds
            selStationTypeObj.stationTypePersons = stationTypeSelection.stationTypePersons
            this.selStationTypeData.push(selStationTypeObj)
          }

        }
      },
      delStationType() {
        for (let i = 0; i < this.selStationTypeMultipleSelection.length; i++) {
          let selStationTypeSelection = this.selStationTypeMultipleSelection[i]
          let sameIndex = _.findIndex(this.selStationTypeData, { 'stationOrgId': selStationTypeSelection
            .stationOrgId, 'stationType': selStationTypeSelection
            .stationType, 'stationTypePersonIds': selStationTypeSelection.stationTypePersonIds })
          if (sameIndex >= 0) {
            this.selStationTypeData.splice(sameIndex, 1)
          }
        }
      },
      /*************************职位/岗位 END************************************ */
      // 获取组件的数据方法
      getData() {
        let map = new Map()
        if (this.showUserTab === true) {
          let userData = this.$refs.userComponent.getData()
          map.set("userData", userData)
        }
        if (this.showOrgTab === true) {
          let orgData = this.$refs.orgComponent.getData()
          map.set("orgData", orgData)
        }
        if (this.showUserGroupTab === true) {
          let groupData = this.groupData
          map.set("groupData", groupData)
        }
        if (this.showDynRoleTab === true) {
          let dynamicRoleData = this.dynamicRoleData
          map.set("dynamicRoleData", dynamicRoleData)
        }
        if (this.showStationTab === true) {
          let stationData = this.selStationTypeData
          map.set("stationData", stationData)
        }
        // map.set("userData", userData)
        // map.set("orgData", orgData)
        // map.set("stationData", stationData)
        // map.set("groupData", groupData)
        // map.set("dynamicData", dynamicData)
        return map
      },
    }
  }
</script>

<style scoped>
  .usergroup>>>.el-transfer {
    text-align: center;
    clear: both;
  }

  .usergroup>>>.el-transfer-panel {
    width: 37% !important;
    text-align: left;
  }

  .usergroup>>>.el-transfer-panel__filter {
    margin: 0px !important;
    padding: 10px !important;
  }

  .stationTransfer>>>.el-transfer {
    text-align: center;
    clear: both;
  }

  .stationTransfer>>>.el-transfer-panel {
    width: 42% !important;
    text-align: left;
  }

  .stationTransfer>>>.el-transfer-panel__filter {
    margin: 0px !important;
    padding: 10px !important;
  }

  .companyDialog>>>.el-dialog>>>.el-dialog__body {
    height: 100px;
  }

  .el-button--mini {
    padding: 7px 10px;
  }

  .el-dialog__body {
    padding: 5px;
  }

  .el-dialog__footer {
    padding: 5px 20px 5px;
  }

  >>>.el-transfer-panel {
    border: 3px solid #F4F6F9;
    border-radius: 20px;
    overflow: hidden;
    background: #FFF;
    display: inline-block;
    vertical-align: middle;
    width: 37%;
    text-align: left;
    max-height: 100%;
    box-sizing: border-box;
    position: relative;
  }

  >>>.el-transfer-panel .el-transfer-panel__header {
    height: 50px;
    line-height: 50px;
    background: #fff;
    margin: 0;
    padding-left: 15px;
    border-bottom: 2px solid #F4F6F9;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    color: #333333;
  }

  >>>.el-transfer-panel .el-transfer-panel__header .el-checkbox {
    line-height: 50px;
  }

  >>>.el-transfer-panel__filter .el-input__inner {
    height: 32px;
    width: 100%;
    font-size: 12px;
    display: inline-block;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    border-radius: 10px;
    padding-right: 10px;
    padding-left: 30px;
  }

  >>>.el-transfer__button {
    border-radius: 4px;
    padding: 7px 10px;
  }

  >>>.el-transfer-panel__filter .el-input__icon {
    margin-top: 20px;
  }

  .cud-common-operate-delete {
    color: #EC6C00;
    margin-right: 10px;
    font-weight: 500;
    font-size: 14px;
  }

  .el-table__body-wrapper tr td {
    border-top: 1px solid #F4F6F9;
    box-shadow: initial;
  }
</style>
