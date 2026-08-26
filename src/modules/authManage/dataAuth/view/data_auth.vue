<template>
  <div class="cud-commom-form-style">
    <div class="brand">
      <breadcrumb :arrayName="brand" :hasIcon="hasIcon"></breadcrumb>
    </div>
    <div class="cud__scroll--div" v-loading.fullscreen.lock="fullscreenLoading">
      <el-card>
        <query-form
          :queryFormId="'data_auth'"
          :queryFields="queryFields"
          @resize="initMaxHeight"
          @submit="search"
          ref="queryForm"
          class="cud-commom-form-search">
        </query-form>
      </el-card>
      <el-card>
        <el-row class="cud__table--list">
          <el-table :data="tableData" @selection-change="handleSelectionChange" ref="dsTable" v-loading="loading"
            :empty-text="$t('cm.nodata')" :height="maxTableHeight" highlight-current-row
            header-row-class-name="cud-office-table-header" class="cud-office-table">
            <el-table-column type="selection" width="55"> </el-table-column>
            <el-table-column align="left" :label="$t('cm.no')" type="index" width="100"></el-table-column>
            <el-table-column align="left" prop="roleName" :label="$t('dataAuth.role_name')" min-width="200">
              <!-- @click="handleClick(scope.row)" -->
              <!-- <template slot-scope="scope">
                <el-button type="text" size="small">{{scope.row.roleName}}</el-button>
              </template> -->
            </el-table-column>
            <el-table-column align="left" prop="roleCode" :label="$t('dataAuth.role_code')" min-width="200">
            </el-table-column>
            <el-table-column align="left" prop="authState" :label="$t('dataAuth.auth_state')" width="100">
            </el-table-column>
            <el-table-column align="left" prop="remark" :label="$t('dataAuth.auth_desp')" width="200" :show-overflow-tooltip="true">
            </el-table-column>
            <el-table-column fixed="right" :label="$t('cm.operate')" width="150">
              <template slot-scope="scope">
                <el-button type="text" size="small" class="cud-common-operate-edit" @click="updateData(scope.row)" v-if="hasPermission('data_auth_insert')">
                  {{$t('cm.edit')}}
                </el-button>
                <el-button type="text" size="small" class="cud-common-operate-delete" @click="delData(scope.row)" v-if="hasPermission('data_auth_del')">
                  {{$t('cm.delete')}}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-row>
            <div class="cud-special-pagination cud-special-pagination-button">
              <div class="pagination-button">
                <el-button type="primary" size="small" @click="goInsertData" v-if="hasPermission('data_auth_add')">{{$t('cm.new')}}</el-button>
                <!-- <el-upload class="btn_distance" :action="fileUploadUrl" :show-file-list="false" :with-credentials="true"
                  :file-list="fileList" :before-upload="beforeUpload" :on-success="upfileBack" :on-progress="loadingFile"
                  :on-error="uplofileError">
                  <el-button size="small">{{$t('cm.import')}}</el-button>
                </el-upload>
                <el-button size="small" @click="exportFile">{{$t('cm.export')}}</el-button> -->
                <!-- <el-button size="small" @click="updateAuthState">{{$t('dataAuth.updateState')}}</el-button> -->
              </div>
              <el-pagination popper-class="cud-pager-dropdown" ref="pager" class="cud__page" @size-change="changeSize"
                @current-change="changeCurrentPage" :current-page="current" :page-sizes="[10, 20, 30, 40]"
                :page-size="size" layout="total, sizes, prev, pager, next, jumper" :total="total">
              </el-pagination>
            </div>
          </el-row>
        </el-row>
      </el-card>
    </div>
    <el-dialog :visible.sync="detailDialogVisible">
      <div>{{$t('dataAuth.role_name')}}:{{dataAuthDetail.roleName}}</div>
      <div>{{$t('dataAuth.role_code')}}:{{dataAuthDetail.roleCode}}</div>
      <div>{{$t('dataAuth.function_auth')}}:{{dataAuthDetail.functionName}}</div>
      <div>{{$t('dataAuth.auth_desp')}}:{{dataAuthDetail.remark}}</div>
      <div>开始时间:{{dataAuthDetail.validStartDate}}</div>
      <div>结束时间:{{dataAuthDetail.validEndDate}}</div>
    </el-dialog>
  </div>
</template>

<script>
  import dataAuth from '../js/data_auth.js'
  export default dataAuth
</script>


<style lang="less" scoped>
  //  @import "src/assets/style/index";
  // .cud__scroll--div {
  //   background: #f8f8f8;
  // }
  // .cud__table--list {
  //   background: #f8f8f8;
  // }
  .btn_distance {
    display: inline;
  }
  .btn_float {
    float: right;
  }
</style>
