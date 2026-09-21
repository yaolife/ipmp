<template>
  <div class="cud-commom-form-style">
    <div class="cud__scroll--div">
      <div class="cud-commom-form-style">
        <div class="brand">
          <breadcrumb :arrayName="brand" :hasIcon="hasIcon"></breadcrumb>
        </div>
        <div class="cud__scroll--div">
          <el-card>
          <div :style="'height: ' + maxTableHeight + 'px'">
            <el-form label-width="120px" label-suffix=":" :model="model" ref="userForm" :rules="rules">
              <el-row class="cud__mtb-20">
                <el-col :span="16">
                  <el-row>
                    <el-col :span="12">
                      <el-form-item :label="$t('dataAuth.user_id')" prop="userId">
                        <el-input :disabled="isEdit" size="small" v-model="model.userId" :placeholder="$t('dataAuth.pleaseEnter')"></el-input>
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item :label="$t('dataAuth.user_name')" prop="userName">
                        <el-input :disabled="isEdit" size="small" v-model="model.userName" :placeholder="$t('dataAuth.pleaseEnter')"></el-input>
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item :label="$t('dataAuth.user_name_py')">
                        <el-input size="small" v-model="model.userNamePy" :placeholder="$t('dataAuth.pleaseEnter')"></el-input>
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item :label="$t('dataAuth.user_short_py')">
                        <el-input size="small" v-model="model.userShortPy" :placeholder="$t('dataAuth.pleaseEnter')"></el-input>
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item :label="$t('dataAuth.user_name_eng')">
                        <el-input size="small" v-model="model.userNameEng" :placeholder="$t('dataAuth.pleaseEnter')"></el-input>
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item :label="$t('dataAuth.user_sex')" prop="userSex">
                        <el-radio v-model="model.userSex" label="男">男</el-radio>
                        <el-radio v-model="model.userSex" label="女">女</el-radio>
                      </el-form-item>
                    </el-col>
                  </el-row>
                </el-col>
                <el-col :span="8">
                  <el-form-item :label="$t('dataAuth.user_photo')">
                    <div class="photo">
                      <el-upload disabled :show-file-list="false" :action="uploadUrl" :with-credentials="true"
                        :before-upload="uploadBefore" :on-success="uploadSuccess" :on-progress="uploading" :on-error="uploadError">
                        <img src="@/assets/img/addperson.png" alt="" width="42" height="46" />
                      </el-upload>
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="8">
                  <el-form-item :label="$t('dataAuth.cellphone_no')" prop="cellphoneNo">
                    <el-input size="small" v-model="model.cellphoneNo" :placeholder="$t('dataAuth.pleaseEnter')"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item :label="$t('dataAuth.telephone_no')">
                    <el-input size="small" v-model="model.telephoneNo" :placeholder="$t('dataAuth.pleaseEnter')"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item :label="$t('dataAuth.email')" prop="email">
                    <el-input size="small" v-model="model.email" :placeholder="$t('dataAuth.pleaseEnter')"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item :label="$t('dataAuth.user_ethnic')">
                    <el-select size="small" v-model="model.userEthnic" :placeholder="$t('dataAuth.pleaseEnter')">
                      <el-option v-for="item in nationList" :key="item.id" :label="item.label" :value="item.label"></el-option>
                      <el-option label="其他" value="其他"></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item :label="$t('dataAuth.user_pcode')">
                    <el-select size="small" v-model="model.userPcode" :placeholder="$t('dataAuth.pleaseEnter')">
                      <el-option label="群众" value="群众"></el-option>
                      <el-option label="团员" value="团员"></el-option>
                      <el-option label="预备党员" value="预备党员"></el-option>
                      <el-option label="党员" value="党员"></el-option>
                      <el-option label="无党派人士" value="无党派人士"></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item :label="$t('dataAuth.user_ctr_edu')">
                    <el-select size="small" v-model="model.userCtrEdu" :placeholder="$t('dataAuth.pleaseEnter')">
                      <el-option label="高中" value="高中"></el-option>
                      <el-option label="专科" value="专科"></el-option>
                      <el-option label="本科" value="本科"></el-option>
                      <el-option label="研究生" value="研究生"></el-option>
                      <el-option label="硕士" value="硕士"></el-option>
                      <el-option label="博士" value="博士"></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item :label="$t('dataAuth.user_birthday')">
                    <el-date-picker size="small" v-model="model.userBirthday" type="date" :placeholder="$t('dataAuth.pleaseEnter')"></el-date-picker>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item :label="$t('dataAuth.user_maritalstatus')">
                    <el-select size="small" v-model="model.userMaritalstatus" :placeholder="$t('dataAuth.pleaseEnter')">
                      <el-option label="未婚" value="未婚"></el-option>
                      <el-option label="已婚" value="已婚"></el-option>
                      <el-option label="离异" value="离异"></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item :label="$t('dataAuth.user_id_card')">
                    <el-input size="small" v-model="model.userIdCard" :placeholder="$t('dataAuth.pleaseEnter')"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item :label="$t('dataAuth.user_native')">
                    <el-input size="small" v-model="model.userNative" :placeholder="$t('dataAuth.pleaseEnter')"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item :label="$t('dataAuth.user_class_id')" prop="userClassId">
                    <el-select size="small" v-model="model.userClassId" :placeholder="$t('dataAuth.pleaseEnter')" @change="userClassChange">
                      <el-option v-for="item in userClassList" :key="item.id" :label="item.label" :value="item.value"></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item :label="$t('dataAuth.user_status')" prop="userStatus">
                    <el-select size="small" v-model="model.userStatus" :placeholder="$t('dataAuth.pleaseEnter')">
                      <el-option label="在职" value="在职"></el-option>
                      <el-option label="离职" value="离职"></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item :label="$t('dataAuth.user_join_date')" prop="userJoinDate">
                    <el-date-picker size="small" v-model="model.userJoinDate" type="date" :placeholder="$t('dataAuth.pleaseEnter')"></el-date-picker>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item :label="$t('dataAuth.user_left_date')" prop="userLeftDate" v-if="model.userStatus === '离职'">
                    <el-date-picker size="small" v-model="model.userLeftDate" type="date" :placeholder="$t('dataAuth.pleaseEnter')"></el-date-picker>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="8">
                  <el-form-item :label="$t('dataAuth.company_name')" prop="companyName">
                    <el-input size="small" v-model="model.companyName" :placeholder="$t('dataAuth.pleaseEnter')"
                    @click.native="companySelect(componyCallback1, model.companyId, model.companyName)" readonly suffix-icon="el-icon-tickets"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item :label="$t('dataAuth.user_dept')" prop="userDeptName">
                    <el-input size="small" v-model="model.userDeptName" :placeholder="$t('dataAuth.pleaseEnter')"
                    @click.native="companySelect(componyCallback2, model.userDeptId, model.userDeptName)" readonly suffix-icon="el-icon-tickets"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item :label="$t('dataAuth.work_dept')" prop="workDeptName">
                    <el-input size="small" v-model="model.workDeptName" :placeholder="$t('dataAuth.pleaseEnter')"
                    @click.native="companySelect(componyCallback3, model.workDeptId, model.workDeptName)" readonly suffix-icon="el-icon-tickets"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item :label="$t('dataAuth.user_posi_name')" prop="userPosiName">
                    <el-input size="small" v-model="model.userPosiName" :placeholder="$t('dataAuth.pleaseEnter')"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item :label="$t('dataAuth.user_dutyrank_name')">
                    <el-input size="small" v-model="model.userDutyrankName" :placeholder="$t('dataAuth.pleaseEnter')"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item :label="$t('dataAuth.user_title_name')">
                    <el-input size="small" v-model="model.userTitleName" :placeholder="$t('dataAuth.pleaseEnter')"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item :label="$t('dataAuth.contact_address')">
                    <el-input size="small" v-model="model.contactAddress" :placeholder="$t('dataAuth.pleaseEnter')"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
            <div class="cud-examine-tool">
              <el-row style="position: relative; left: 95%; transform: translateX(-95%);">
                <el-button size="small" @click="handleClose">{{ $t("cm.cancel") }}</el-button>
                <el-button size="small" type="primary" @click="handleSubmit">{{ $t("cm.commit") }}
                </el-button>
              </el-row>
            </div>
          </div>
          </el-card>
          <el-dialog :visible.sync="companyVisible" title="选择组织" >
            <organization :key="companyKey" ref="companyComponent" initOrgId="00888888" :initOrgList="companyIds" :buttonGroup="false" :showCheckbox="false" appCode="cud" lang="zh_CN"></organization>
            <div slot="footer" class="dialog-footer" align="center">
                <el-button size="small" @click="companyClose">{{$t('cm.close')}}</el-button>
                <el-button size="small" type="primary" @click="companySubmit">{{$t('cm.commit')}}</el-button>
            </div>
          </el-dialog>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import userEdit from "../js/user_edit";
  export default userEdit;
</script>

<style scoped>
  /deep/.el-form-item {
    padding-bottom: 1em !important;
  }
  /deep/.photo {
    position: relative;
    width: 100%;
    height: 140px;
    border: 1px solid #EEE;
    border-radius: 5px;
  }
  /deep/.photo img {
    position: absolute;
    padding-top: 30px;
    left: 50%;
    margin-left: -20px;
  }
  /deep/.el-date-editor .el-icon-date {
    margin-top: 10px;
  }
</style>
