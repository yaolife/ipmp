<template>
  <div class="cud-commom-form-style">
    <div class="brand">
      <breadcrumb :arrayName="brand" :hasIcon="hasIcon"></breadcrumb>
    </div>
    <div class="cud__scroll--div" v-loading.fullscreen.lock="fullscreenLoading">
      <el-card>
        <el-form label-width="110px" label-position="top">
          <el-row class="cud__search--rowhigh cud-senior-search">
            <el-col :span="6">
              <el-form-item :label="$t('dataAuth.nameOrCode')+'：'">
                <el-input :placeholder="$t('cm.pleaseEnter')" maxlength="32" v-model="model.roleName" size="small">
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item :label="$t('dataAuth.staffNo')+'：'">
                <el-input :placeholder="$t('cm.pleaseEnter')" maxlength="32" v-model="model.staffNo" size="small">
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6" class="btn_float">
              <el-form-item label="  " class="btn_float">
                <el-button size="small" @click="resetData">{{$t('cm.reset')}}</el-button>
                <el-button type="primary" size="small" @click="search">{{$t('cm.query')}}</el-button>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row class="cud__search--rowhigh">
            <div class="cud__divider"></div>
          </el-row>
          <el-row class="cud__table--list cud__table--list-padding fssc-div-block">
            <el-tabs v-model="activeName" @tab-click="handleClick">
              <!-- <el-tab-pane :label="$t('dataAuth.personDimension')" name="personDimension">
                <el-table highlight-current-row header-row-class-name="cud-office-table-header" class="cud-office-table"
                  v-loading="loading" :height="maxTableHeight" ref="personTable" :data="tableDataPerson"
                  tooltip-effect="dark" @selection-change="handleSelectionChange">
                  <el-table-column type="selection" width="55">
                  </el-table-column>
                  <el-table-column type="index" :label="$t('dataAuth.number')" min-width="100">
                  </el-table-column>
                  <el-table-column prop="staffName" :label="$t('dataAuth.personName')" min-width="200">
                  </el-table-column>
                  <el-table-column prop="roleName" :label="$t('dataAuth.roleName')" min-width="250">
                  </el-table-column>
                  <el-table-column prop="roleCode" :label="$t('dataAuth.roleCode')" min-width="200">
                  </el-table-column>
                  <el-table-column prop="appName" :label="$t('dataAuth.applyLimit')" min-width="100">
                  </el-table-column> -->
                  <!-- <el-table-column fixed="right" width="280" :label="$t('dataAuth.operate')">
                    <template slot-scope="scope">
                      <el-button type="text" class="cud-common-operate-edit" size="small" @click="authCopy(scope.row)">
                        {{$t('cm.copy')}}</el-button>
                      <el-button type="text" class="cud-common-operate-edit" size="small" @click="authMove(scope.row)">
                        {{$t('dataAuth.dataAuthMove')}}</el-button>
                      <el-button type="text" class="cud-common-operate-edit" size="small"
                        @click="editAuth(scope.row,'1')">{{$t('cm.edit')}}</el-button>
                      <el-button type="text" class="cud-common-operate-edit" size="small" @click="getPerson(scope.row)">
                        {{$t('dataAuth.personDrillDown')}}</el-button>
                      <el-button type="text" class="cud-common-operate-delete" size="small" @click="delData(scope.row)">
                        {{$t('cm.delete')}}</el-button>
                    </template>
                  </el-table-column> -->
                <!-- </el-table>
              </el-tab-pane> -->
              <el-tab-pane :label="$t('dataAuth.roleDimension')" name="roleDimension">
                <el-table v-loading="loading" :height="maxTableHeight"
                  header-row-class-name="cud-office-table-header" highlight-current-row class="cud-office-table"
                  :empty-text="$t('cm.nodata')" ref="roleTable" :data="tableDataRole" tooltip-effect="dark"
                  @selection-change="handleSelectionChange">
                  <el-table-column type="selection" width="55">
                  </el-table-column>

                  <el-table-column type="index" :label="$t('dataAuth.number')" width="60">
                  </el-table-column>
                  <el-table-column prop="appName" :label="$t('dataAuth.applyname')" width="120">
                  </el-table-column>
                  <el-table-column prop="roleName" :label="$t('dataAuth.roleName')" width="200">
                  </el-table-column>
                  <el-table-column prop="roleCode" :label="$t('dataAuth.roleCode')" width="200">
                  </el-table-column>
                  <el-table-column prop="objTypeDesc" :label="$t('dataAuth.authType')" width="120">
                  </el-table-column>
                  <!-- <el-table-column prop="objectNameDesc" :label="$t('dataAuth.authLimit')" width="100">
                  </el-table-column> -->
                  <el-table-column prop="functionName" :label="$t('dataAuth.effectDimension')" min-width="200"
                    show-overflow-tooltip>
                  </el-table-column>
                  <!-- <el-table-column prop="dataRules" :label="$t('dataAuth.dataRole')" width="200">
                  </el-table-column> -->
                  <el-table-column prop="authState" :label="$t('dataAuth.authStatus')" width="100">
                  </el-table-column>
                  <el-table-column prop="operate" width="100" :label="$t('dataAuth.operate')">
                    <template slot-scope="scope">
                      <!-- <el-button type="text" size="small" class="cud-common-operate-edit" @click="updateData(scope.row)">{{$t('cm.copy')}}</el-button>
                    <el-button type="text" size="small" class="cud-common-operate-edit" @click="updateData(scope.row)">{{$t('cm.edit')}}</el-button>
                    <el-button type="text" size="small" class="cud-common-operate-delete" @click="delData(scope.row)">{{$t('cm.delete')}}</el-button> -->
                      <!-- <el-button type="text" class="cud-common-operate-edit" size="small" @click="editRole(scope.row)">
                        {{$t('cm.edit')}}</el-button>
                      <el-button type="text" class="cud-common-operate-edit" size="small" @click="getRole(scope.row)">
                        {{$t('dataAuth.roleDrillDown')}}</el-button> -->
                      <el-button type="text" class="cud-common-operate-delete" size="small" @click="delData(scope.row)">
                        {{$t('cm.delete')}}</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>
              <!-- <el-tab-pane :label="$t('dataAuth.groupDimension')" name="groupDimension">
                <el-table v-loading="loading" :height="maxTableHeight" ref="groupTable" :data="tableDataGroup"
                  tooltip-effect="dark" style="width: 100%" fit @selection-change="handleSelectionChange">
                  <el-table-column type="selection" width="55">
                  </el-table-column>
                  <el-table-column type="index" prop="name" :label="$t('dataAuth.number')" width="60">
                  </el-table-column>
                  <el-table-column prop="groupName" :label="$t('dataAuth.groupName')" width="120">
                  </el-table-column>
                  <el-table-column prop="remark" :label="$t('dataAuth.groupDescribe')" width="120">
                  </el-table-column>
                  <el-table-column prop="appName" :label="$t('dataAuth.applyname')" width="120">
                  </el-table-column>
                  <el-table-column prop="groupLimit" :label="$t('dataAuth.groupLimit')" width="300">
                  </el-table-column>
                  <el-table-column prop="authState" :label="$t('dataAuth.authStatus')" width="120">
                  </el-table-column>
                  <el-table-column prop="remark" :label="$t('dataAuth.authDescribe')" width="260">
                  </el-table-column>
                  <el-table-column prop="operate" :label="$t('dataAuth.operate')" width="200">
                    <template slot-scope="scope">
                      <el-button type="text" size="small" class="cud__button--edit" @click="editAuth(scope.row,'2')">
                        {{$t('cm.edit')}}</el-button>
                      <el-button type="text" class="cud-common-operate-edit" size="small" @click="getGroup(scope.row)">
                        {{$t('dataAuth.groupDrillDown')}}</el-button>
                      <el-button type="text" class="cud-common-operate-delete" size="small" @click="delData(scope.row)">
                        {{$t('cm.delete')}}</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane> -->
              <!-- <el-tab-pane :label="$t('dataAuth.formDimension')" name="formDimension">
                <el-table :height="maxTableHeight" v-loading="loading" ref="formTable" :data="tableDataForm"
                  tooltip-effect="dark" style="width: 100%" fit @selection-change="handleSelectionChange">
                  <el-table-column type="selection" width="55">
                  </el-table-column>
                  <el-table-column type="index" :label="$t('dataAuth.number')" width="55">
                  </el-table-column>
                  <el-table-column prop="orgId" :label="$t('dataAuth.branchNumber')" width="200">
                  </el-table-column>
                  <el-table-column prop="orgName" :label="$t('dataAuth.formName')" width="120">
                  </el-table-column>
                  <el-table-column prop="appName" :label="$t('dataAuth.applyname')" width="120">
                  </el-table-column>
                  <el-table-column prop="roleName" :label="$t('dataAuth.roleName')" width="120">
                  </el-table-column>
                  <el-table-column prop="authEffect" :label="$t('dataAuth.authEffect')" width="260">
                  </el-table-column>
                  <el-table-column prop="authState" :label="$t('dataAuth.authStatus')" width="120">
                  </el-table-column>
                  <el-table-column prop="authDescribe" :label="$t('dataAuth.authDescribe')" width="220">
                  </el-table-column>
                  <el-table-column prop="operate" :label="$t('dataAuth.operate')" width="200">
                    <template slot-scope="scope"> -->
                      <!-- <el-button type="text" size="small" class="cud-common-operate-edit" @click="updateData(scope.row)">{{$t('cm.edit')}}</el-button> -->
                      <!-- <el-button type="text" size="small" class="cud-common-operate-delete" @click="delData(scope.row)">{{$t('cm.delete')}}</el-button> -->
                      <!-- <el-button type="text" size="small" class="cud__button--edit" @click="editAuth(scope.row,'4')">
                        {{$t('cm.edit')}}</el-button>
                      <el-button type="text" class="cud-common-operate-edit" size="small" @click="getOrg(scope.row)">
                        {{$t('dataAuth.formDrillDown')}}</el-button>
                      <el-button type="text" class="cud-common-operate-delete" size="small" @click="delData(scope.row)">
                        {{$t('cm.delete')}}</el-button>
                    </template>
                  </el-table-column> -->
                </el-table>
              </el-tab-pane>
              <!-- <el-tab-pane :label="$t('dataAuth.postDimension')" name="postDimension">
                <el-table :height="maxTableHeight" v-loading="loading" ref="jobTable" :data="tableDataJob"
                  tooltip-effect="dark" style="width: 100%" fit @selection-change="handleSelectionChange">
                  <el-table-column type="selection" width="55">
                  </el-table-column>
                  <el-table-column type="index" :label="$t('dataAuth.number')" width="55">
                  </el-table-column>
                  <!-- <el-table-column
                  prop="jobName"
                  :label="$t('dataAuth.jobName')"
                  width="120">
                </el-table-column>
                  <el-table-column prop="postName" :label="$t('dataAuth.jobName')" width="120">
                  </el-table-column>
                  <el-table-column prop="roleName" :label="$t('dataAuth.roleName')" width="120">
                  </el-table-column>
                  <el-table-column prop="effectLimit" :label="$t('dataAuth.effectLimit')" width="120">
                  </el-table-column>
                  <el-table-column prop="authState" :label="$t('dataAuth.authStatus')" width="120">
                  </el-table-column>
                  <el-table-column prop="authDescribe" :label="$t('dataAuth.authDescribe')" width="260">
                  </el-table-column>
                  <el-table-column prop="operate" :label="$t('dataAuth.operate')" width="200">
                    <template slot-scope="scope">
                      <el-button type="text" size="small" class="cud__button--edit" @click="editAuth(scope.row,'3')">
                        {{$t('cm.edit')}}</el-button>
                      <el-button type="text" class="cud-common-operate-edit" size="small" @click="getPost(scope.row)">
                        {{$t('dataAuth.postDrillDown')}}</el-button>
                      <el-button type="text" class="cud-common-operate-delete" size="small" @click="delData(scope.row)">
                        {{$t('cm.delete')}}</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane> -->
              <!-- <el-tab-pane :label="$t('dataAuth.effectDimension')" name="effectDimension">
                <el-table v-loading="loading" ref="effectTable" :data="tableDataEffect" tooltip-effect="dark"
                  style="width: 100%" fit @selection-change="handleSelectionChange">
                  <el-table-column type="selection" width="55">
                  </el-table-column>
                  <el-table-column type="index" prop="name" :label="$t('dataAuth.number')" width="120">
                  </el-table-column>
                  <el-table-column prop="effectLimit" :label="$t('dataAuth.effectLimit')" width="300">
                  </el-table-column>
                  <el-table-column prop="role" :label="$t('dataAuth.role')" width="120">
                  </el-table-column>
                  <el-table-column prop="groupLimit" :label="$t('dataAuth.groupLimit')" width="260">
                  </el-table-column>
                  <el-table-column prop="form" :label="$t('dataAuth.form')" width="120">
                  </el-table-column>
                  <el-table-column prop="job" :label="$t('dataAuth.job')" width="120">
                  </el-table-column>
                  <el-table-column prop="operate" :label="$t('dataAuth.operate')" width="200">
                    <template slot-scope="scope">
                      <el-button type="text" size="small" class="cud-common-operate-edit" @click="updateData(scope.row)">{{$t('cm.edit')}}</el-button> -->
                      <!-- <el-button type="text" size="small" class="cud-common-operate-delete" @click="delData(scope.row)">{{$t('cm.delete')}}</el-button>
                      <el-button type="text" class="cud-common-operate-edit" size="small" @click="getGroup(scope.row)">
                        {{$t('dataAuth.effectDrillDown')}}</el-button>
                      <el-button type="text" class="cud-common-operate-delete" size="small" @click="delData(scope.row)">
                        {{$t('cm.delete')}}</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane> -->
            </el-tabs>
            <el-row>
              <div class="cud-special-pagination cud-special-pagination-button">
                <div class="pagination-button">
                  <el-button size="small" type="primary" @click="exportFile()" v-if="hasPermission('data_statics_export')">{{$t('cm.export')}}</el-button>
                  <!-- <el-button  size="small" @click="authMove()">{{$t('dataAuth.dataAuthTransfer')}}</el-button> -->
                  <!-- <el-button  size="small" @click="authCopy()">{{$t('dataAuth.dataAuthCopy')}}</el-button> -->
                  <!-- <el-button  size="small" @click="resetData">{{$t('te.delete')}}</el-button> -->
                </div>
                <el-pagination popper-class="cud-pager-dropdown" ref="pager" class="cud__page" @size-change="changeSize"
                  @current-change="changeCurrentPage" :current-page="current" :page-sizes="[10, 20, 30, 40]"
                  :page-size="size" layout="total, sizes, prev, pager, next, jumper" :total="total">
                </el-pagination>
              </div>
            </el-row>
          </el-row>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script>
  import data_statics from '../js/data_statics.js'
  export default data_statics
</script>


<style lang="less" scoped>
  //
  // .cud__scroll--div {
  //   background: #f8f8f8;
  // }
  // .cud__table--list {
  //   background: #f8f8f8;
  // }
  // /deep/ .data-auth-search .el-tabs__active-bar {
  //   left: 0 !important;
  // }
  // .hidden-btn {
  //   display: none;
  // }
  /deep/ .el-tabs__active-bar {
    left: 0 !important;
  }

  .btn_float {
    float: right;
  }
</style>
