<template>
  <div>
    <!-- 主弹框 -->
    <el-dialog :visible.sync="modelIsOpen" title="数据权限" destroyOnClose width="600px" @close="closeDialog"
      :close-on-click-modal='false'>
      <el-alert type="error" v-if="errorMsg">{{errorMsg}}</el-alert>
      <el-form ref="editRoleForm" :model="editRoleModel" label-width="120px" :rules="ruleValidate" @validate="onValidate">
        <el-row>
          <el-col :span="24" class="cud__col20">
            <el-form-item :label="$t('dataAuth.rolename')" prop="roleName">
              <el-input size="small" v-model="editRoleModel.roleName" :placeholder="$t('dataAuth.pleaseEnter')" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24" class="cud__col20">
            <el-form-item :label="$t('dataAuth.rolecode')" prop="roleCode">
              <el-input size="small" v-model="editRoleModel.roleCode" :placeholder="$t('dataAuth.pleaseEnter')" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24" class="cud__col20">
            <el-form-item label="权限范围" prop="roleRange">
              <el-select size="small" v-model="editRoleModel.roleRange">
                <el-option v-for="range in rangeList" :value="range.value" :key="range.value" :label="range.label"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24" class="cud__col20" v-if="editRoleModel.roleRange == 2">
            <el-form-item label="选择范围" prop="roleRange">
              <el-button size="small" type="primary" @click="showSelectOrg = true">选择组织</el-button>
              <el-table :data="orgData" :height="200" style="margin-top: 10px;">
                <el-table-column label="组织ID" prop="orgCode"></el-table-column>
                <el-table-column label="组织名称" prop="orgName"></el-table-column>
              </el-table>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer" align="center">
        <el-button size="small" @click="modelIsOpen = false">{{ $t("cm.cancel") }}</el-button>
        <el-button size="small" type="primary" @click="handleSubmit()">
          {{$t('cm.commit')}}
        </el-button>
      </div>
    </el-dialog>
    <!-- 选部门 -->
    <el-dialog width="50%" :visible.sync="showSelectOrg" :destory-on-close="true" :title="$t('dataAuth.select_person')">
      <organization ref="orgComponent" initOrgId="00888888" :showCheckBox="true" :rightMenuItems="rightMenuItems"></organization>
      <div slot="footer" class="dialog-footer" align="center">
        <el-button size="small" @click="showSelectOrg = !showSelectOrg">{{ $t("cm.cancel") }}</el-button>
        <el-button size="small" type="primary" @click="orgSubmit">{{ $t("cm.commit") }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import rolesApi from '../api/appApi'
  import organization from '@/components/cudCommPersonComponent/organization.vue'

  export default {
    name: 'dataAuth',
    components: {
      organization
    },
    props: {
      title: {
        type: String
      },
      modelType: {
        type: String
      },
    },
    data: function() {
      return {
        modelIsOpen: false,
        rangeList: [
          { label: '全部数据权限', value: 1 },
          { label: '自定义数据权限', value: 2 },
          { label: '本部门数据权限', value: 3 },
          { label: '本部门及以下数据权限', value: 4 },
          { label: '仅本人数据权限', value: 5 }
        ],
        editRoleModel: {
          roleName: '',
          roleCode: '',
          roleRange: ''
        },
        ruleValidate: {
          roleName: [
            { required: true, message: this.$t('cm.tiprequired') },
          ],
          roleCode: [
            { required: true, message: this.$t('cm.tiprequired') },
          ],
          roleRange: [
            { required: true, message: this.$t('cm.tiprequired') }
          ]
        },
        errorMsg: '',
        //选部门
        showSelectOrg: false,
        orgData: [],
        rightMenuItems: [],
      }
    },
    computed: {

    },
    mounted: function() {
      //this.getRoleGroupList()
    },
    methods: {
      getRoleData: function(data) {
        rolesApi.getRoleScopeInfo(data.roleId).then((res) => {
          this.editRoleModel.roleName = data.roleName;
          this.editRoleModel.roleCode = data.roleCode;
          this.editRoleModel.roleId = data.roleId;
          this.editRoleModel.scopeId = res.data.scopeId;
          this.editRoleModel.roleRange = res.data.scopeType;
          // 处理部门列表
          this.orgData = [];
          this.rightMenuItems = [];
          if (res.data.scopeDeptList) {
            res.data.scopeDeptList.forEach((item) => {
              this.orgData.push({
                orgCode: item.deptId,
                orgName: item.deptName
              })
              this.rightMenuItems.push({
                value: item.deptId,
                label: item.deptName
              })
            })
          }
        })
      },
      // 取消错误提示
      onValidate: function() {
        this.errorMsg = ''
      },
      closeWindow: function() {
        this.modelIsOpen = false;
      },
      // 提交
      handleSubmit: function() {
        let that = this
        // 数据传递
        that.$refs['editRoleForm'].validate(function(valid) {
          if (valid) {
            if (that.editRoleModel.roleRange == 2 && that.orgData.length < 1) {
              that.$message.error(that.$t('dataAuth.failedsave'))
              return;
            }
            let deptList = [];
            that.orgData.forEach((item) => {
              deptList.push({
                deptId: item.orgCode,
                deptName: item.orgName
              })
            })
            let params = {
              roleId: that.editRoleModel.roleId,
              scopeId: that.editRoleModel.scopeId,
              scopeType: that.editRoleModel.roleRange,
              scopeDeptList: deptList
            }
            const loading = that.$loading();
            rolesApi.editRoleScopeInfo(params).then(function(response) {
              loading.close();
              if (response.code !== '0') {
                that.errorMsg = response.msg;
                that.$message.error(response.msg)
              } else {
                that.$message({
                  message: response.msg,
                  type: 'success'
                });
                that.closeDialog()
                that.$parent.roleInfo()
                that.modelIsOpen = false
              }
            }).catch(function(error) {
              loading.close();
            })
          } else {
            that.$message.error(that.$t('dataAuth.failedsave'))
          }
        })
      },
      closeDialog() {
        this.clearModel();
        this.$refs['editRoleForm'].resetFields()
      },
      clearModel() {
        this.editRoleModel.roleName = ''
        this.editRoleModel.roleCode = ''
        this.editRoleModel.roleRange = ''
      },
      getRoleGroupList: function() {
        let that = this
        rolesApi.roleGroupList().then(function(response) {
          that.roleGroupList = response.data.data
        })
      },
      handleReset: function() {
        this.editRoleModel.roleName = ''
        this.editRoleModel.roleCode = ''
        this.editRoleModel.roleRange = ''
      },
      //选组织
      orgSubmit() {
        this.orgData = [];
        this.rightMenuItems = [];
        let orgData = this.$refs.orgComponent.getData();
        if (orgData) {
          if (orgData[1][1] != "") {
            let orgNumArr = orgData[1][1].split(';')
            let orgNameArr = orgData[1][5].split(';')
            for (let i = 0; i < orgNumArr.length; i++) {
              this.orgData.push({
                orgCode: orgNumArr[i],
                orgName: orgNameArr[i]
              })
              this.rightMenuItems.push({
                value: orgNumArr[i],
                label: orgNameArr[i]
              })
            }
          }
          this.showSelectOrg = false;
        }
      },
    },
  }
</script>
