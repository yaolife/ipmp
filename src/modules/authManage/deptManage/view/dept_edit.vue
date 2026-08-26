<template>
  <div v-loading="loading">
    <el-form ref="editForm" :model="editModel" label-width="120px" label-suffix=":" label-position="left" :rules="ruleValidate">
      <el-row>
        <el-col :span="12">
          <el-form-item label="组织ID" prop="deptId">
            <el-input size="small" v-model="editModel.deptId" :disabled="isNotAble"
              :placeholder="$t('dataAuth.pleaseEnter')" clearable></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="组织名称" prop="deptName">
            <el-input size="small" v-model="editModel.deptName" :placeholder="$t('dataAuth.pleaseEnter')" clearable>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="组织简称">
            <el-input size="small" v-model="editModel.deptNameShort" :placeholder="$t('dataAuth.pleaseEnter')"
              clearable></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="英文名称">
            <el-input size="small" v-model="editModel.deptNameEng" :placeholder="$t('dataAuth.pleaseEnter')" clearable>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="组织编码" prop="deptCode">
            <el-input size="small" v-model="editModel.deptCode" :placeholder="$t('dataAuth.pleaseEnter')" clearable>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="组织级别">
            <el-select size="small" v-model="editModel.deptRankId" @change="deptRankChange">
              <el-option v-for="rank in deptRankList" :key="rank.id" :label="rank.label" :value="rank.value"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="上级组织" prop="deptParentName">
            <el-input size="small" v-model="editModel.deptParentName" disabled :placeholder="$t('dataAuth.pleaseEnter')"
              clearable></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="deptStatus">
            <el-select size="small" v-model="editModel.deptStatus">
              <el-option label="正常" value="正常"></el-option>
              <el-option label="失效" value="失效"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="生效时间">
            <el-date-picker size="small" v-model="editModel.deptBuildDate" type="date"
              :placeholder="$t('dataAuth.pleaseEnter')"></el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="失效时间">
            <el-date-picker size="small" v-model="editModel.deptCancelDate" type="date"
              :placeholder="$t('dataAuth.pleaseEnter')"></el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="第一负责人">
            <el-input size="small" v-model="editModel.header1Name" :placeholder="$t('dataAuth.pleaseEnter')"
              @click.native="userSelect(userCallback1, editModel.header1)" readonly suffix-icon="el-icon-tickets"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="第二负责人">
            <el-input size="small" v-model="editModel.header2Name" :placeholder="$t('dataAuth.pleaseEnter')"
              @click.native="userSelect(userCallback2, editModel.header2)" readonly suffix-icon="el-icon-tickets"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="组织秘书">
            <el-input size="small" v-model="editModel.deptSecretaryName" :placeholder="$t('dataAuth.pleaseEnter')"
              @click.native="userSelect(userCallback3, editModel.deptSecretaryId)" readonly suffix-icon="el-icon-tickets"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="预算协调员">
            <el-input size="small" v-model="editModel.assistantBugget" :placeholder="$t('dataAuth.pleaseEnter')"
              @click.native="userSelect(userCallback4, editModel.assistantBuggetId)" readonly suffix-icon="el-icon-tickets"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="组织助理">
            <el-input size="small" v-model="editModel.assistantDeptName" :placeholder="$t('dataAuth.pleaseEnter')"
              @click.native="userSelect(userCallback5, editModel.assistantDeptId)" readonly suffix-icon="el-icon-tickets"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="培训工程师">
            <el-input size="small" v-model="editModel.assistantTrainName" :placeholder="$t('dataAuth.pleaseEnter')"
              @click.native="userSelect(userCallback6, editModel.assistantTrainId)" readonly suffix-icon="el-icon-tickets"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="资产协调员">
            <el-input size="small" v-model="editModel.assistantAssetName" :placeholder="$t('dataAuth.pleaseEnter')"
              @click.native="userSelect(userCallback7, editModel.assistantAssetId)" readonly suffix-icon="el-icon-tickets"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="信息协调员">
            <el-input size="small" v-model="editModel.assistantInfoName" :placeholder="$t('dataAuth.pleaseEnter')"
              @click.native="userSelect(userCallback8, editModel.assistantInfoId)" readonly suffix-icon="el-icon-tickets"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div slot="footer" class="dialog-footer" align="center">
      <el-button class="cud__button--reset" size="small" @click="handleClose">{{$t('cm.cancel')}}</el-button>
      <!-- <el-button class="cud__button--reset" v-if="showReset" size="small" @click="handleReset">{{$t('cm.reset')}}</el-button> -->
      <el-button class="cud__button--search" size="small" type="primary" @click="handleSubmit">{{$t('cm.save')}}</el-button>
    </div>
    <!--选人组件-->
    <el-dialog :visible.sync="userVisible" title="选择人员" destroyOnClose width="800px" @close="selectClose" :close-on-click-modal="false" append-to-body>
      <person ref="userComponent" :IDS="userList"></person>
      <div slot="footer" class="dialog-footer" align="center">
        <el-button size="small" @click="selectClose">{{$t('cm.close')}}</el-button>
        <el-button size="small" type="primary" @click="selectSubmit">{{$t('cm.commit')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import deptEdit from "../js/dept_edit";
  export default deptEdit;
</script>

<style scoped>
  /deep/.el-form-item .el-form-item__content {
    padding-bottom: 0.5em !important;
  }
  .dialog-footer {
    padding: 20px 0;
  }
</style>
