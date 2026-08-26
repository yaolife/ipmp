<template>
  <el-dialog :visible.sync="modelIsOpen" :title="title" destroyOnClose width="600px" @close="closeDialog"
    :close-on-click-modal='false'>
    <el-alert type="error" v-if="errorMsg">{{errorMsg}}</el-alert>
    <el-form ref="editRoleForm" :model="editRoleModel" label-width="190px" :rules="ruleValidate" @validate="onValidate">
      <el-row>
        <!-- <el-col :span="20" class="cud__col20">
          <el-form-item :label="$t('dataAuth.rolegroup')">
            <el-select size="small" v-model="editRoleModel.roleGroupCode" :disabled="isNotAble">
              <el-option v-for="role in roleGroupList" :value="role.roleGroupCode" :key="role.roleGroupCode"
                :label="role.roleGroupName"></el-option>
            </el-select>
          </el-form-item>
        </el-col> -->
        <!-- <el-col :span="20" class="cud__col20">
          <el-form-item :label="$t('dataAuth.selectapplication')">
            <el-select size="small" v-model="editRoleModel.appId" :disabled="isNotAble">
              <el-option v-for="app in appList" :value="app.appId" :key="app.appId" :label="app.appName"></el-option>
            </el-select>
          </el-form-item>
        </el-col> -->
        <el-col :span="20" class="cud__col20">
          <el-form-item :label="$t('dataAuth.rolename')" prop="roleName">
            <el-input size="small" v-model="editRoleModel.roleName" :placeholder="$t('dataAuth.pleaseEnter')" :maxlength="64"
              clearable></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="20" class="cud__col20">
          <el-form-item :label="$t('dataAuth.rolecode')" prop="roleCode">
            <el-input size="small" v-model="editRoleModel.roleCode" :placeholder="$t('dataAuth.pleaseEnter')" :maxlength="32"
              :disabled="isNotAble" clearable></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="20" class="cud__col20">
          <el-form-item :label="$t('dataAuth.isadminrole')" prop="isAdminrole">
            <el-select size="small" v-model="editRoleModel.isAdminrole" :disabled="isNotAble">
              <el-option :label="this.$t('dataAuth.yes')" value="1"></el-option>
              <el-option :label="this.$t('dataAuth.no')" value="0"></el-option>
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="20" class="cud__col20">
          <el-form-item :label="$t('dataAuth.rolestate')" prop="state">
            <el-select size="small" v-model="editRoleModel.state">
              <el-option label="启用" value="1"></el-option>
              <el-option label="禁用" value="0"></el-option>
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="20" class="cud__col20">
          <el-form-item :label="$t('dataAuth.roleDesp')">
            <el-input size="small" v-model="editRoleModel.roleDesp" :placeholder="$t('dataAuth.pleaseEnter')" :maxlength="164"
              clearable></el-input>
          </el-form-item>
        </el-col>

      </el-row>
    </el-form>
    <div slot="footer" class="dialog-footer" align="center">
      <el-button class="cud__button--reset" v-if="ifDisplayReset" size="small" @click="handleReset">{{$t('cm.reset')}}
      </el-button>
      <el-button class="cud__button--reset" v-if="ifReturn" size="small" @click="closeWindow">{{$t('dataAuth.return')}}
      </el-button>
      <el-button class="cud__button--search" v-if="ifDisplay" size="small" type="primary" @click="handleSubmit('editRoleForm')">
        {{$t('cm.commit')}}
      </el-button>
    </div>
  </el-dialog>
</template>
<script>
  import rolesApi from '../api/appApi'

  export default {
    name: 'editRoles',
    props: {
      title: {
        type: String
      },
      modelType: {
        type: String
      },
      appList: {
        type: Array
      }
    },
    data: function() {
      let colCodeValidate = (rule, value, callback) => {
        let reg = /^[\-_a-zA-Z0-9]+$/
        if (!value) {
          callback(new Error(this.$t('cm.tiprequired')))
        } else {
          if (!reg.test(value)) {
            callback(new Error(this.$t('dataAuth.code_valid')))
          } else {
            callback()
          }
        }
      };
      let colNameValidate = (rule, value, callback) => {
        let reg = /^[a-zA-Z0-9\u4e00-\u9fa5-\_]+$/g
        if (!value) {
          callback(new Error(this.$t('cm.tiprequired')))
        } else {
          if (!reg.test(value)) {
            callback(new Error(this.$t('dataAuth.name_valid')))
          } else {
            callback()
          }
        }
      };
      return {
        modelIsOpen: false,
        isNotAble: false,
        roleGroupList: [],
        editRoleModel: {
          roleId: '',
          roleName: '',
          roleCode: '',
          isAdminrole: '',
          appId: '',
          roleGroupCode: '',
          isAppRootRole: '',
          state: '',
          roleDesp: ''
        },
        ruleValidate: {
          roleName: [
            { required: true, message: this.$t('cm.tiprequired') },
            { required: true, validator: colNameValidate, trigger: "blur" }
          ],
          roleCode: [
            { required: true, message: this.$t('cm.tiprequired') },
            { required: true, validator: colCodeValidate, trigger: "blur" }
          ],
          isAdminrole: [
            { required: true, message: this.$t('cm.tiprequired') }
          ],
          roleGroupCode: [
            { required: true, message: this.$t('cm.tiprequired') }
          ],
          state: [
            { required: true, message: this.$t('cm.tiprequired') }
          ],

        },
        errorMsg: '',
      }
    },
    computed: {
      ifReturn() {
        if (this.modelType === 'view' || this.modelType === 'edit') {
          return true;
        } else {
          return false;
        }
      },
      ifDisplay() {
        if (this.modelType != 'view') {
          return true;
        } else {
          return false;
        }
      },
      ifDisplayReset() {
        if (this.modelType === 'add') {
          return true;
        } else {
          return false;
        }
      }
    },
    mounted: function() {
      //this.getRoleGroupList()
    },
    methods: {
      getData: function(data) {
        let isAdmin;
        if (data.isAdminRole === '是') {
          isAdmin = '1';
        } else {
          isAdmin = '0';
        }
        this.editRoleModel.id = data.roleId
        this.editRoleModel.roleId = data.roleId
        this.editRoleModel.roleName = data.roleName
        this.editRoleModel.roleCode = data.roleCode
        this.editRoleModel.isAdminrole = isAdmin;
        this.editRoleModel.appId = data.appId
        this.editRoleModel.roleGroupCode = data.roleGroupCode
        this.editRoleModel.roleDesp = data.roleDesp
        this.editRoleModel.state = data.state
        this.isNotAble = true
      },
      // 取消错误提示
      onValidate: function() {
        this.errorMsg = ''
      },
      closeWindow: function() {
        this.modelIsOpen = false;
      },
      handleSubmit: function(name) {

        let that = this
        // 数据传递
        that.$refs[name].validate(function(valid) {
          if (valid) {
            // 新增
            if (that.modelType === 'add') {
              // console.log(that.editRoleModel)
              let param = {
                roleName: that.editRoleModel.roleName,
                roleCode: that.editRoleModel.roleCode,
                isAdminrole: that.editRoleModel.isAdminrole,
                roleGroupCode: that.editRoleModel.roleGroupCode,
                appId: that.editRoleModel.appId ? that.editRoleModel.appId : that.appList[0].appId,
                roleDesp: that.editRoleModel.roleDesp,
                state: that.editRoleModel.state
              }
              const loading = that.$loading();
              rolesApi.rolesInfoAdd(param).then(function(response) {
                loading.close();
                if (response.data.code !== '0') {
                  that.errorMsg = response.data.msg;
                  that.$message.error(response.data.msg)
                } else {
                  that.$message({
                    message: response.data.msg,
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
              // 编辑
              let param = {
                roleId: that.editRoleModel.id,
                roleName: that.editRoleModel.roleName,
                roleCode: that.editRoleModel.roleCode,
                appId: that.editRoleModel.appId,
                roleGroupCode: that.editRoleModel.roleGroupCode,
                roleDesp: that.editRoleModel.roleDesp,
                state: that.editRoleModel.state,
                isAdminrole: that.editRoleModel.isAdminrole
              }
              const loading = that.$loading();
              rolesApi.rolesInfoUpdate(param).then(function(response) {
                loading.close();
                if (response.data.code !== '0') {
                  that.$message.error(response.data.msg)
                } else {
                  that.$message({
                    message: response.data.msg,
                    type: 'success'
                  });
                  that.closeDialog()
                  that.$parent.roleInfo()
                  that.modelIsOpen = false
                }
              }).catch(function(error) {
                loading.close();
              })
            }
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
        this.editRoleModel.roleGroupCode = '-1'
        this.editRoleModel.id = ''
        this.editRoleModel.roleName = ''
        this.editRoleModel.roleCode = ''
        this.editRoleModel.isAdminrole = ''
        this.editRoleModel.roleDesp = ''
      },
      getRoleGroupList: function() {
        let that = this
        rolesApi.roleGroupList().then(function(response) {
          that.roleGroupList = response.data.data
        })
      },
      handleReset: function() {
        if (this.modelType !== 'add') {
          this.editRoleModel.roleName = ''
        } else {
          this.editRoleModel.id = ''
          this.editRoleModel.roleName = ''
          this.editRoleModel.roleCode = ''
          this.editRoleModel.isAdminrole = ''
          this.editRoleModel.state = ''
          this.editRoleModel.roleGroupCode = ''
          this.editRoleModel.roleDesp = ''
        }
      },
    },
    created() {
      if (this.modelType === 'add') {
        this.editRoleModel.id = ''
        this.editRoleModel.roleName = ''
        this.editRoleModel.roleCode = ''
        this.editRoleModel.isAdminrole = ''
        this.editRoleModel.state = ''
        this.editRoleModel.roleGroupCode = '-1'
        this.editRoleModel.roleDesp = 'aa'
      }
    }
  }
</script>
