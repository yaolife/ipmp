<template>
  <el-dialog :visible.sync="modelIsOpen" :title="title" destroyOnClose width="600px" @close="closeDialog"
    :close-on-click-modal='false'>
    <el-alert type="error" v-if="errorMsg">{{errorMsg}}</el-alert>
    <el-form ref="editRoleForm" :model="editModel" label-width="190px" label-suffix=":" :rules="ruleValidate" @validate="onValidate">
      <el-row>
        <el-col :span="20" class="cud__col20">
          <el-form-item label="员工号" prop="userId">
            <el-input size="small" v-model="editModel.userId" :placeholder="$t('dataAuth.pleaseEnter')" :maxlength="64"
              clearable></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="20" class="cud__col20">
          <el-form-item label="员工姓名" prop="userName">
            <el-input size="small" v-model="editModel.userName" :placeholder="$t('dataAuth.pleaseEnter')" :maxlength="64"
              clearable></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="20" class="cud__col20">
          <el-form-item label="性别" prop="userSex">
            <el-input size="small" v-model="editModel.userSex" :placeholder="$t('dataAuth.pleaseEnter')" :maxlength="32"
              :disabled="isNotAble" clearable></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="20" class="cud__col20">
          <el-form-item label="状态" prop="userStatus">
            <el-select size="small" v-model="editModel.userStatus">
              <el-option :label="this.$t('dataAuth.enabled')" value="1"></el-option>
              <el-option :label="this.$t('dataAuth.disabled')" value="0"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="20" class="cud__col20">
          <el-form-item label="手机号">
            <el-input size="small" v-model="editModel.cellphoneNo" :placeholder="$t('dataAuth.pleaseEnter')" :maxlength="164"
              clearable></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="20" class="cud__col20">
          <el-form-item label="座机号">
            <el-input size="small" v-model="editModel.telephoneNo" :placeholder="$t('dataAuth.pleaseEnter')" :maxlength="164"
              clearable></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="20" class="cud__col20">
          <el-form-item label="用户密码">
            <el-input size="small" v-model="editModel.password" :placeholder="$t('dataAuth.pleaseEnter')" :maxlength="164"
              clearable></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div slot="footer" class="dialog-footer">
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
  import api from '../api/index'

  export default {
    name: 'editUser',
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
        console.log(1)
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
        editModel: {
          userId: '',
          userName: '',
          userStatus: '',
          userSex: '',
          cellphoneNo: '',
          telephoneNo: ''
        },
        ruleValidate: {
          userId: [
            { required: true, message: this.$t('cm.tiprequired') },
            { required: true, validator: colNameValidate, trigger: "blur" }
          ],
          userName: [
            { required: true, message: this.$t('cm.tiprequired') },
            { required: true, validator: colNameValidate, trigger: "blur" }
          ],
          userStatus: [
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
    props: {
      title: {
        type: String
      },
      modelType: {
        type: String
      }
    },
    methods: {
      getData: function(data) {
        let isAdmin;
        if (data.isAdminRole === '是') {
          isAdmin = '1';
        } else {
          isAdmin = '0';
        }
        this.editModel.userId = data.userId
        this.editModel.userName = data.userName
        this.editModel.userStatus = data.userStatus
        this.editModel.userSex = data.userSex
        this.editModel.cellphoneNo = data.cellphoneNo
        this.editModel.telephoneNo = data.telephoneNo
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
              console.log(that.editModel)
              let param = {
                userId: that.editModel.userId,
                userName: that.editModel.userName,
                userSex: that.editModel.userSex,
                userStatus: that.editModel.userStatus,
                cellphoneNo: that.editModel.cellphoneNo,
                telephoneNo: that.editModel.telephoneNo,
              }
              api.addUser(param).then(function(response) {
                if (response.data.code !== '0') {
                  that.errorMsg = response.data.msg;
                  that.$message.error(response.data.msg)
                } else {
                  that.$message({
                    message: response.data.msg,
                    type: 'success'
                  });
                  that.closeDialog()
                  that.$parent.getList()
                  that.modelIsOpen = false
                }
              }).catch(function(error) {

              })
            } else {
              // 编辑
              let param = {
                userId: that.editModel.userId,
                userName: that.editModel.userName,
                userSex: that.editModel.userSex,
                userStatus: that.editModel.userStatus,
                cellphoneNo: that.editModel.cellphoneNo,
                telephoneNo: that.editModel.telephoneNo,
              }
              api.updUser(param).then(function(response) {
                if (response.data.code !== '0') {
                  that.$message.error(response.data.msg)
                } else {
                  that.$message({
                    message: response.data.msg,
                    type: 'success'
                  });
                  that.closeDialog()
                  that.$parent.getList()
                  that.modelIsOpen = false
                }
              }).catch(function(error) {})
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
        this.editModel.userId = ''
        this.editModel.userName = ''
        this.editModel.userStatus = ''
        this.editModel.userSex = ''
        this.editModel.cellphoneNo = ''
        this.editModel.telephoneNo = ''
      },
      getRoleGroupList: function() {
        let that = this
        api.roleGroupList().then(function(response) {
          that.roleGroupList = response.data.data
        })
      },
      handleReset: function() {
        if (this.modelType !== 'add') {
          this.editModel.userName = ''
        } else {
          this.editModel.userId = ''
          this.editModel.userName = ''
          this.editModel.userStatus = ''
          this.editModel.userSex = ''
          this.editModel.cellphoneNo = ''
          this.editModel.telephoneNo = ''
        }
      },
    },
    created() {
      if (this.modelType === 'add') {
        this.editModel.userId = ''
        this.editModel.userName = ''
        this.editModel.userStatus = ''
        this.editModel.userSex = ''
        this.editModel.cellphoneNo = ''
        this.editModel.telephoneNo = ''
      }
    }
  }
</script>
