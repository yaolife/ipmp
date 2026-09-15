<template>
  <div>
    <el-dialog title="人员配置" :visible.sync="modelIsOpen" v-loading="loading">
      <el-form label-width="120px" label-position="left" label-suffix=":" :model="addDataAuth" ref="role" :rules="roleRules">
        <el-row type="flex" justify="center" class="cud__mtb-10">
          <el-col :span="24">
            <!-- <el-row :gutter="20">
              <el-col :span="10">
                <el-form-item :label="$t('dataAuth.selectapplication')" prop="appId" label-width="130px">
                  <el-select v-model="addDataAuth.appId" :placeholder="$t('cm.pselect')" @change="handleChangeApp" :disabled="isdisabled" size="small">
                    <el-option v-for="item in appList" :key="item.appId" :label="item.appName" :value="item.appId">
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row> -->
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item :label="$t('dataAuth.role_person')">
                  <el-input size="small" v-model="roleName" disabled></el-input>
                  <!-- <el-select v-model="addDataAuth.roleId" :placeholder="$t('cm.pselect')" size="small" disabled>
                    <el-option v-for="item in roleList" :key="item.roleId" :label="item.roleName"
                      :value="item.roleId">
                    </el-option>
                  </el-select> -->
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item :label="$t('dataAuth.begin_time')">
                  <el-date-picker style="width: 100%;" size="small" prop="dataAuthTime" v-model="dataAuthTime" type="datetimerange"
                    range-separator="至" format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss" start-placeholder="开始日期" end-placeholder="结束日期">
                  </el-date-picker>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item :label="$t('dataAuth.auth_description')">
                  <el-input size="small" :placeholder="$t('cm.pleaseEnter')" v-model="addDataAuth.remark">
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>

            <el-tabs v-model="activeName">
              <el-tab-pane label="人员授权" name="person" style="padding-top: 10px;">
                <el-button size="small" type="primary" @click="showSelectUser = true">选择人员</el-button>
                <el-table :data="addDataAuth.userList" :height="200" style="margin-top: 10px;">
                  <el-table-column label="用户ID" prop="userId"></el-table-column>
                  <el-table-column label="用户姓名" prop="userName"></el-table-column>
                </el-table>
              </el-tab-pane>
              <el-tab-pane label="组织授权" name="org" style="padding-top: 10px;">
                <el-button size="small" type="primary" @click="showSelectOrg = true">选择组织</el-button>
                <el-table :data="addDataAuth.deptList" :height="200" style="margin-top: 10px;">
                  <el-table-column label="组织ID" prop="orgCode"></el-table-column>
                  <el-table-column label="组织名称" prop="orgName"></el-table-column>
                </el-table>
              </el-tab-pane>
            </el-tabs>

          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer" align="center">
        <el-button size="small" @click="modelIsOpen = false">{{ $t("cm.cancel") }}</el-button>
        <el-button size="small" type="primary" @click="handleSubmit">{{ $t("cm.commit") }}</el-button>
      </div>
    </el-dialog>
    <el-dialog width="50%" :visible.sync="showSelectUser" :destory-on-close="true" :title="$t('dataAuth.select_person')">
      <person ref="userComponent" init-org-id="00888888" :IDS="initUserId"></person>
      <div slot="footer" class="dialog-footer" align="center">
        <el-button size="small" @click="showSelectUser = !showSelectUser">{{ $t("cm.cancel") }}</el-button>
        <el-button size="small" type="primary" @click="userSubmit">{{ $t("cm.commit") }}</el-button>
      </div>
    </el-dialog>
    <el-dialog width="50%" :visible.sync="showSelectOrg" :destory-on-close="true" :title="$t('dataAuth.select_person')">
      <organization ref="orgComponent" initOrgId="00888888" :showCheckBox="true" :rightMenuItems="initOrgList"></organization>
      <div slot="footer" class="dialog-footer" align="center">
        <el-button size="small" @click="showSelectOrg = !showSelectOrg">{{ $t("cm.cancel") }}</el-button>
        <el-button size="small" type="primary" @click="orgSubmit">{{ $t("cm.commit") }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import api from "../api/appApi";
  import person from '@/components/cudCommPersonComponent/msingle.vue'
  import organization from '@/components/cudCommPersonComponent/organization.vue'

  export default {
    components: {
      person,
      organization
    },
    props: {
      roleName: {
        type: String
      }
    },
    data() {
      return {
        modelIsOpen: false,
        loading: false,

        roleList: [],
        appList: [],

        activeName: 'person',
        userData: [],
        orgData: [],
        rightMenuItems: [],
        showSelectUser: false,
        showSelectOrg: false,

        addDataAuth: {
          roleId: "",
          validStartDate: "",
          validEndDate: "",
          remark: "",
          userIds: [],
          orgIds: [],
        },
        // 用于暂存时间
        dataAuthTime: [],
        treedata: [],

        // 存储菜单id
        functionCode: "",

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
        initOrgList: [],
        // 回显意见选择的人员
        initUserId: ''
      };
    },
    created() {
      // this.getAppList();
    },
    mounted() {
      // this.getTreeDetail();
    },
    methods: {
      // 回显页面
      getAuthDetail(roleId) {
        this.loading = true;
        let params = { roleId: roleId };
        api.getDataAuthDetail(params)
          .then(res => {
            this.loading = false;

            this.addDataAuth.userList = res.data.userList ? res.data.userList : [];
            this.addDataAuth.deptList = res.data.deptList ? res.data.deptList : [];

            // 处理人员数据
            this.initUserId = [];
            if (res.data.userList) {
              res.data.userList.forEach((item) => {
                this.initUserId.push(item.userId);
              })
            }
            this.initUserId = this.initUserId.join(',');

            // 处理组织数据
            this.initOrgList = [];
            if (res.data.deptList) {
              res.data.deptList.forEach((item) => {
                this.initOrgList.push({
                  id: item.deptId,
                  label: item.orgName
                })
              })
            }

            this.addDataAuth.remark = res.data.remark;
            this.addDataAuth.roleId = res.data.roleId;
            this.addDataAuth.dataAuthId = res.data.dataAuthId;

            this.dataAuthTime = [];
            let startDate = res.data.validStartDate;
            if (startDate) {
              // startDate = startDate.replace(/\-/g, '/');
              this.dataAuthTime.push(startDate);
            }
            let endDate = res.data.validEndDate;
            if (endDate) {
              // endDate = endDate.replace(/\-/g, '/');
              this.dataAuthTime.push(endDate);
            }
          })
          .catch(err => {
            this.loading = false;
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
      // 提交
      handleSubmit() {
        if (this.addDataAuth.userList.length === 0 && this.addDataAuth.deptList.length === 0) {
          this.$message.error("请至少选择一个人员维度");
          return;
        }

        let insertDataAuth = {
          appId: this.addDataAuth.appId,
          roleId: this.addDataAuth.roleId,
          dataAuthId: this.addDataAuth.dataAuthId,
          remark: this.addDataAuth.remark,
          validStartDate: this.dataAuthTime[0],
          validEndDate: this.dataAuthTime[1],
          userList: this.addDataAuth.userList,
          deptList: this.addDataAuth.deptList,
        };

        this.$refs.role.validate(valid => {
          if (valid) {
            const loading = this.$loading();
            api.saveDataAuth(insertDataAuth).then(res => {
              loading.close();
              this.$message.success(res.msg);
              this.handleClose();
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
      // 关闭
      handleClose() {
        this.modelIsOpen = false;
      },
      // 选人员
      userSubmit() {
        this.addDataAuth.userList = [];
        let userData = this.$refs.userComponent.getData();
        if (userData) {
          // 处理选人数据
          if (userData && userData.length > 6) {
            let userNumArr = userData[1][0].split(';')
            let userNameArr = userData[1][1].split(';')
            for (let i = 0; i < userNumArr.length; i++) {
              this.initUserId += (i === 0 ? '' : ',') + userNumArr[i]
              this.addDataAuth.userList.push({
                userId: userNumArr[i],
                userName: userNameArr[i]
              })
            }
          }
          this.showSelectUser = false;
        }
      },
      //选组织
      orgSubmit() {
        this.addDataAuth.deptList = []
        let orgData = this.$refs.orgComponent.getData();
        if (orgData) {
          if (orgData[1][1] != "") {
            let deptIdArr = orgData[1][1].split(';')
            let deptPathArr = orgData[1][2].split(';')
            let orgNumArr = orgData[1][1].split(';')
            let orgNameArr = orgData[1][5].split(';')
            for (let i = 0; i < orgNumArr.length; i++) {
              this.addDataAuth.deptList.push({
                deptId: deptIdArr[i],
                deptIdPath: deptPathArr[i],
                orgCode: orgNumArr[i],
                orgName: orgNameArr[i]
              })
              this.rightMenuItems.push({
                id: orgNumArr[i],
                label: orgNameArr[i]
              })
            }
          }
          this.showSelectOrg = false;
        }
      },
    }
  };

</script>

<style>
  .select_item {
    /*margin-left: 30px;*/
    word-break: all;
    line-height: 40px;
  }

  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
  }
</style>
