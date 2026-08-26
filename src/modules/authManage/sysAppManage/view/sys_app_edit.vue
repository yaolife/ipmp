<template>
<el-dialog :visible.sync="modelIsOpen"  :title="title" destroyOnClose width="800" @close="beforeCloseHandler">
    <el-form ref="editAppForm" :model="editAppModel" label-width="180px" :rules="ruleValidate" >
      <el-row>
        <el-col :span="21" class="cud__col20">
          <el-form-item  :label="$t('dataAuth.applyid')" prop="appId" v-if="showId">
              <el-input size="small" :disabled = "ifDisabled" v-model="editAppModel.appId" maxlength="21" :placeholder="$t('dataAuth.pleaseEnter')"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="21" class="cud__col20">
          <el-form-item  :label="$t('dataAuth.applycode')" prop="appCode" v-if="showFlag">
              <el-input size="small" :disabled = "ifDisabled" v-model="editAppModel.appCode" maxlength="21" :placeholder="$t('dataAuth.pleaseEnter')"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="21" class="cud__col20">
          <el-form-item  :label="$t('dataAuth.applyname')" prop="appName">
              <el-input size="small" :disabled = "ifDisabled" v-model="editAppModel.appName" maxlength="21" :placeholder="$t('dataAuth.pleaseEnter')"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="21" class="cud__col20">
          <el-form-item  :label="$t('dataAuth.applydomain')" prop="appDomain">
              <el-input size="small" :disabled = "ifDisabled" v-model="editAppModel.appDomain" maxlength="2048" :placeholder="$t('dataAuth.pleaseEnter')"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="21" class="cud__col20">
          <el-form-item  :label="$t('dataAuth.applyrootaddress')" prop="appPath">
              <el-input size="small" :disabled = "ifDisabled" v-model="editAppModel.appPath" maxlength="256" :placeholder="$t('dataAuth.pleaseEnter')"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="21" class="cud__col20">
          <el-form-item  :label="$t('dataAuth.applyaddresstype')" prop="appPathType">
              <el-select size="small" :disabled = "ifDisabled" v-model="editAppModel.appPathType">
                <el-option value="2" :label="$t('dataAuth.domaintype')"></el-option>
                <el-option value="1" :label="$t('dataAuth.defaulttype')"></el-option>
              </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="21" class="cud__col20">
          <el-form-item  :label="$t('dataAuth.applyip')"  prop="appIp">
              <el-input size="small" :disabled = "ifDisabled" v-model="editAppModel.appIp"  maxlength="256" :placeholder="$t('dataAuth.pleaseEnter')"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="21" class="cud__col20">
          <el-form-item  :label="$t('dataAuth.state')" prop="state">
              <el-select size="small" :disabled = "ifDisabled" v-model="editAppModel.state" :placeholder="$t('dataAuth.pleaseEnter')">
                  <el-option value="1" :label="$t('dataAuth.available')"></el-option>
                  <el-option value="0" :label="$t('dataAuth.notavailable')"></el-option>
              </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="21" class="cud__col20">
          <el-form-item  :label="$t('dataAuth.applydescribe')"  prop="appDesc">
              <el-input type="textarea" size="small" :disabled = "ifDisabled" v-model="editAppModel.appDesc" show-word-limit maxlength="246" :placeholder="$t('dataAuth.pleaseEnter')"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div slot="footer" class="dialog-footer">
        <el-button  size="small" @click="handleClose('editAppForm')">{{$t('cm.cancel')}}</el-button>
        <el-button  type="primary" size="small" v-if="!modelType || modelType !== 'view'" @click="handleSubmit('editAppForm')">{{$t('cm.save')}}</el-button>
        <!-- <el-button class="cud__button--search" size="small" v-if="!modelType || modelType !== 'view'" @click="handleReset('editAppForm')">{{$t('cm.reset')}}</el-button> -->
    </div>
</el-dialog>
</template>
<script>
import sysAppApi from '../api/appApi'
export default {
  name: 'editSysInfo',
  components: {
  },
  data: function () {
    let colCodeValidate = (rule, value, callback) => {
      let reg = /^[\-_a-zA-Z0-9]+$/
        if(!value) {
          callback(new Error(this.$t('cm.tiprequired')))
        } else {
          if(!reg.test(value)) {
            callback(new Error(this.$t('dataAuth.code_valid')))
          } else {
            callback()
          }
        }
    };
    let colNameValidate = (rule, value, callback) => {
      let reg = /^[a-zA-Z0-9\u4e00-\u9fa5-\_]+$/g
        if(!value) {
          callback(new Error(this.$t('cm.tiprequired')))
        } else {
          if(!reg.test(value)) {
            callback(new Error(this.$t('dataAuth.name_valid')))
          } else {
            callback()
          }
        }
    };
    let colDomainValidate = (rule, value, callback) => {
      let reg = /^(([-\u4E00-\u9FA5a-z0-9]{1,63})\.)+([\u4E00-\u9FA5a-z]{2,63})\.?$/
        if(!value) {
          callback(new Error(this.$t('cm.tiprequired')))
        } else {
          if(!reg.test(value)) {
            callback(new Error(this.$t('dataAuth.error_domain_tip')))
          } else {
            callback()
          }
        }
    };
    return {
      modelIsOpen: false,
      ifDisabled:false,
      ifLoading: false,
      editAppModel: {
        appCode: '',
        appName: '',
        appDomain: '',
        appPath: '',
        appPathType: '',
        appIp: '',
        appDesc: '',
        state: '1',
        appId: ''
      },
      ruleValidate: {
        appCode: [
          {required: true, message: this.$t('cm.tiprequired'), trigger: 'blur'},
          {required: true, validator: colCodeValidate, trigger: "blur"}
        ],
        appName: [
          {required: true, message:this.$t('cm.tiprequired'), trigger: 'blur'},
          {required: true, validator: colNameValidate, trigger: "blur"}
        ],
        appDomain: [
          {required: true, message:this.$t('cm.tiprequired'), trigger: 'blur'},
          // {required: true, validator: colDomainValidate, trigger: "blur"}
        ],
        appPathType: [
          {required: true, message: this.$t('cm.tiprequired'), trigger: 'change'}
        ]
      }
    }
  },
  props: {
    title: {
      type: String
    },
    modelType: {
      type: String
    }
  },
  computed: {
    showFlag: function () {
      // 新增
      if (this.modelType === 'add' || this.modelType === 'view') {
        return true
      } else { // 编辑
        return false
      }
    },
    showId() {
      return this.modelType == 'view' ? true : false;
    },
  },
  methods: {
    handleSubmit: function (name) {
      let that = this
      this.$refs[name].validate(function (valid) {
        if (valid) {
          let domain = that.editAppModel.appDomain;
          let appIp = that.editAppModel.appIp;
          // let appIpArray = appIp.split("\\");
          // let appIpNewArray=[];
          // for (let i = 0; i < appIpArray.length; i++) {
          //   if(!appIpNewArray.indexOf(appIpArray[i]) >=0){
          //     appIpNewArray.push(appIpArray[i]);
          //   }
          // }
          // if(appIpNewArray.length>10){
          //   that.$message({ message: that.$t('dataAuth.error_appip_count_tip'), type: 'warning' });
          //   return;
          // }
          if (that.modelType === 'add') {
            const loading = that.$loading();
            sysAppApi.sysAppInfoAdd(that.editAppModel).then(function (response) {
              loading.close();
              if (response.data.code === '0') {
                let sysAppInfo = that.$store.state.lightAuth.sysAppInfos;
                sysAppInfo.push(response.data.data)
                that.$store.commit('setSysAppInfos', sysAppInfo)
                that.$parent.query()
                that.$message({
                  message: response.data.msg,
                  type: 'success'
                });
                that.beforeCloseHandler()
                that.modelIsOpen = false
              } else {
                that.$message.error(response.data.msg)
              }
            }).catch(function (error) {
              loading.close();
            })
          } else {
            // 编辑
            const loading = that.$loading();
            sysAppApi.sysAppInfoUpdate(that.editAppModel).then(function (response) {
              loading.close();
              if (response.data.code === '0') {
                that.$parent.query()
                that.$message({
                  message: response.data.msg,
                  type: 'success'
                });
                that.beforeCloseHandler()
                that.modelIsOpen = false
              } else {
                that.$message.error(response.data.msg)
              }
            }).catch(function (error) {
              loading.close();
            })
          }
        } else {
          that.$message.error(that.$t('dataAuth.failedsave'))
        }
      })
    },
    handleReset: function (name) {
      this.$refs[name].resetFields()
    },
    handleClose: function (name) {
      this.modelIsOpen = false
    },
    beforeCloseHandler() {
      this.ifDisabled = false
      this.ifLoading = false
      this.clearModdel()
    },
    clearModdel() {
      this.editAppModel.appCode = ''
			this.editAppModel.appName = ''
			this.editAppModel.appDomain = ''
			this.editAppModel.appPath = ''
			this.editAppModel.appPathType = ''
			this.editAppModel.appIp = ''
			this.editAppModel.appDesc = ''
			this.editAppModel.state = '1'
			this.editAppModel.appId = ''
    }
  }

}
</script>
<style scoped>
.dialog-footer{
  text-align: center;
}
</style>
