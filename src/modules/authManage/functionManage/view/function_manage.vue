<template>
  <div class="cud-commom-form-style">
    <div class="brand">
      <breadcrumb :arrayName="brand" :hasIcon="hasIcon"></breadcrumb>
    </div>
    <div class="cud__scroll--div" v-loading.fullscreen.lock="fullscreenLoading">
      <!-- <el-card>
        <query-form
          :queryFormId="'function_manage'"
          :queryFields="queryFields"
          @submit="search"
          ref="queryForm"
          class="cud-commom-form-search"
        ></query-form>
      </el-card> -->
      <el-card v-if="appList && appList.length > 1">
        <el-row style="padding-bottom: 10px;">
          <el-col :span="3">
            <label class="cud__label">{{$t('dataAuth.selectapplication')}}：</label>
          </el-col>
          <el-col :span="9">
            <el-select size="small" v-model="appModel.appId" @change="appChange" filterable>
              <el-option v-for="app in appList" :value="app.appId" :key="app.appId" :label="app.appName"></el-option>
            </el-select>
          </el-col>
        </el-row>
      </el-card>
      <el-card>
        <div class="table-button">
          <el-button type="primary" @click="addFirstFunc" size="small">{{ $t("cm.add") }}</el-button>
          <!-- <el-button type="default" @click="delFunc" size="small">{{ $t("cm.delete") }}</el-button> -->
        </div>
        <el-row class="cud__table--list">
          <el-table :data="funcTreeData" :tree-props="{ children: 'children', hasChildren: true }" :height="maxTableHeight" ref="menuTable" row-key="id">
            <el-table-column prop="name" :label="$t('dataAuth.functionname')"></el-table-column>
            <el-table-column prop="functionCode" :label="$t('dataAuth.functionCode')"></el-table-column>
            <el-table-column prop="type" :label="$t('dataAuth.functiontype')" width="100">
              <template slot-scope="scope">
                <span v-if="scope.row.type == 0">菜单</span>
                <span v-if="scope.row.type == 1">按钮</span>
              </template>
            </el-table-column>
            <el-table-column prop="state" :label="$t('dataAuth.functionstatus')" width="100">
              <template slot-scope="scope">
                <span v-if="scope.row.state == 1">可用</span>
                <span v-if="scope.row.state == 0">不可用</span>
              </template>
            </el-table-column>
            <el-table-column prop="functionDesc" :label="$t('dataAuth.functiondescript')" :show-overflow-tooltip="true"></el-table-column>
            <el-table-column prop="createDate" :label="$t('cm.creat_time')"></el-table-column>
            <el-table-column width="150" :label="$t('cm.operate')" fixed="right">
              <template slot-scope="scope">
                <el-button size="small" type="text" class="cud-common-operate-edit" @click="editFunc(scope.row)">{{ $t("cm.update") }}</el-button>
                <el-button size="small" type="text" class="cud-common-operate-edit" @click="addFunc(scope.row)">{{ $t("cm.add") }}</el-button>
                <el-button size="small" type="text" class="cud-common-operate-delete" @click="delFunc(scope.row)"> {{$t("cm.delete")}}</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-row>
        <el-row>
          <div class="cud-special-pagination cud-special-pagination-button" style="height: 50px;">

          </div>
        </el-row>
      </el-card>
      <!--编辑菜单-->
      <el-dialog width="800px" title="编辑菜单" :visible.sync="showDialog">
        <el-form ref="functionForm" :model="functionModel" label-width="150px" :rules="ruleValidate">
          <el-row>
            <el-col :span="22" class="cud__col20">
              <el-form-item :label="$t('dataAuth.superiornode')" prop="parentName">
                <el-input size="small" v-model="functionModel.parentName" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="22" class="cud__col20">
              <el-form-item :label="$t('dataAuth.functionname')" prop="functionName">
                <el-input size="small" v-model="functionModel.functionName" :maxlength="50"
                  :placeholder="$t('dataAuth.pleaseEnter')" clearable></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="22" style="position: relative;" class="cud__col20">
              <el-form-item :label="$t('dataAuth.functionCode')" prop="functionCode">
                <el-input size="small" v-model="functionModel.functionCode" :maxlength="50"
                  :placeholder="$t('dataAuth.pleaseEnter')" clearable></el-input>
                <div class="tipText">需要进行权限过滤模块需要配置此功能编码，且需保证唯一</div>
              </el-form-item>
            </el-col>
            <el-col :span="22" class="cud__col20">
              <el-form-item :label="$t('dataAuth.functiontype')" prop="functionType">
                <el-select size="small" v-model="functionModel.functionType" @change="functionChange">
                  <el-option value="0" :label="$t('dataAuth.menulocal')"></el-option>
                  <el-option value="1" :label="$t('dataAuth.button')"></el-option>
                  <!-- <el-option value="2" :label="$t('dataAuth.webservice')"></el-option> -->
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="22" class="cud__col20">
              <el-form-item :label="$t('dataAuth.functionstatus')" prop="state">
                <el-select size="small" v-model="functionModel.state">
                  <el-option value="1" :label="$t('dataAuth.available')"></el-option>
                  <el-option value="0" :label="$t('dataAuth.notavailable')"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="22" class="cud__col20">
              <el-form-item :label="$t('dataAuth.functiondescript')" prop="functionDesc">
                <el-input size="small" v-model="functionModel.functionDesc" :maxlength="256"
                  :placeholder="$t('dataAuth.pleaseEnter')" clearable></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="22" class="cud__col20">
              <el-form-item :label="$t('dataAuth.urladdress')">
                <el-input size="small" type="url" v-model="functionModel.functionUrl" :maxlength="100"
                  :placeholder="$t('dataAuth.pleaseEnter')" clearable></el-input>
                <div class="tipText" style="bottom: -15px;">需要进行权限过滤的接口需要配置此后端访问地址</div>
              </el-form-item>
            </el-col>
            <el-col :span="22" class="cud__col20">
              <el-form-item :label="$t('dataAuth.nodesorting')">
                <el-input-number size="small" :max="1000" :min="1" v-model="functionModel.displaySeq">
                </el-input-number>
              </el-form-item>
            </el-col>
            <el-col :span="22" style="position: relative;" class="cud__col20">
              <el-form-item :label="$t('dataAuth.isAuthReq')">
                <el-radio-group size="small" v-model="functionModel.isAuthReq">
                  <el-radio label="1">是</el-radio>
                  <el-radio label="0">否</el-radio>
                </el-radio-group>
                <div class="tipText">勾选是，则该功能菜单为用户默认系统功能，即不需要进行系统授权便可以使用</div>
              </el-form-item>
            </el-col>
            <el-col :span="22" class="cud__col20">
              <el-form-item :label="$t('dataAuth.universalFunc')">
                <el-checkbox-group size="small" v-model="functionModel.universalFunc">
                  <el-checkbox label="add">{{$t('dataAuth.universalAdd')}}</el-checkbox>
                  <el-checkbox label="update">{{$t('dataAuth.universalUpdate')}}</el-checkbox>
                  <el-checkbox label="delete">{{$t('dataAuth.universalDel')}}</el-checkbox>
                  <el-checkbox label="import">{{$t('dataAuth.universalImport')}}</el-checkbox>
                  <el-checkbox label="export">{{$t('dataAuth.universalExport')}}</el-checkbox>
                </el-checkbox-group>
                <div class="tipText">勾选则创建该菜单时同步创建对应按钮</div>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col>&nbsp;</el-col>
          </el-row>
        </el-form>
        <div slot="footer" align="center">
          <el-button size="small" @click="showDialog = !showDialog">{{$t('cm.cancel')}}</el-button>
          <el-button size="small" type="primary" @click="handleSubmit">{{$t('cm.commit')}}</el-button>
        </div>
      </el-dialog>
      <!--复制应用-->
      <el-dialog :visible.sync="showCopyFunc" :title="$t('dataAuth.selectapplication')" width="600px">
        <div>
          <el-form label-position="left" label-width="180px">
            <el-form-item :label="$t('dataAuth.copyFromApp') + ':'">
              <el-select v-model="copyFromAppId" size="small">
                <!-- <el-option :label="copyFromAppName" :value="copyFromAppId"></el-option> -->
                <el-option v-for="item in appList" :key="item.appId" :label="item.appName" :value="item.appId"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('dataAuth.copyToApp') + ':'">
              <el-select v-model="copyToAppId" size="small" disabled>
                <el-option :label="copyToAppName" :value="copyToAppId"></el-option>
              </el-select>
            </el-form-item>
            <p><span style="color: red">注意：复制功能会完全覆盖现有应用的功能菜单！</span></p>
          </el-form>
        </div>
        <div slot="footer" align="center">
          <el-button size="small" @click="copyFuncClose">{{$t('cm.cancel')}}</el-button>
          <el-button size="small" type="primary" @click="copyFuncSubmit">{{$t('cm.commit')}}</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>
<script>
  import functionManage from '../js/function_manage';
  export default functionManage;
</script>
<style lang="less" scoped>
  .el-checkbox+.el-checkbox {
    margin-left: 10px;
  }
  .cud__label {
    padding-top: 5px;
  }
</style>
