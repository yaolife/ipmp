<template>
  <div class="cud-commom-form-style">
    <div class="brand">
      <breadcrumb :arrayName="brand" :hasIcon="hasIcon"></breadcrumb>
    </div>
    <div class="cud__scroll--div" v-loading.fullscreen.lock="fullscreenLoading">
      <el-card>
        <query-form
          :queryFormId="'sys_app_manage'"
          :queryFields="queryFields"
          @resize="initMaxHeight"
          @submit="search"
          ref="queryForm"
          class="cud-commom-form-search">
        </query-form>
      </el-card>
      <el-card>
        <div class="table-button">
          <el-button type="primary" @click="addData" size="small" v-if="hasPermission('system_manage_add')">{{ $t("cm.add") }}</el-button>
        </div>
        <el-row class="cud__table--list">
          <el-table tooltip-effect="dark" :data="tableData" ref="dsTable" row-key="appId"
            @selection-change="selectChange" highlight-current-row header-row-class-name="cud-office-table-header"
            class="cud-office-table" v-loading="loading" :height="maxTableHeight">
            <el-table-column align="left" :label="$t('cm.no')" type="index" width="50"></el-table-column>
            <el-table-column align="left" prop="appName" :label="$t('dataAuth.applyname')" show-overflow-tooltip width="150">
            </el-table-column>
            <el-table-column align="left" prop="appCode" :label="$t('dataAuth.applycode')" show-overflow-tooltip>
            </el-table-column>
            <el-table-column align="left" prop="appDomain" :label="$t('dataAuth.applydomain')" show-overflow-tooltip>
            </el-table-column>
            <el-table-column align="left" prop="appPath" :label="$t('dataAuth.applyrootaddress')" width="120">
            </el-table-column>
            <el-table-column align="left" prop="appPathType" :label="$t('dataAuth.applyaddresstype')" width="120">
              <template slot-scope="scope">
                <span v-if="scope.row.appPathType === '1'">{{
                  $t("dataAuth.defaulttype")
                }}</span>
                <span v-if="scope.row.appPathType === '2'">{{
                  $t("dataAuth.domaintype")
                }}</span>
              </template>
            </el-table-column>
            <el-table-column align="left" prop="appIp" :label="$t('dataAuth.applyip')" width="200"></el-table-column>
            <el-table-column align="left" prop="appDesc" :label="$t('dataAuth.applydescribe')" show-overflow-tooltip width="150"></el-table-column>
            <el-table-column align="left" prop="state" :label="$t('dataAuth.state')" width="115">
              <template slot-scope="scope">
                <span v-if="scope.row.state === '0'">{{
                  $t("dataAuth.notavailable")
                }}</span>
                <span v-if="scope.row.state === '1'">{{
                  $t("dataAuth.available")
                }}</span>
              </template>
            </el-table-column>
            <el-table-column fixed="right" :label="$t('cm.operate')" width="170">
              <template slot-scope="scope">
                <el-button class="cud-common-operate-edit" type="text" size="small" @click="showDetails(scope.row)">
                  {{ $t("cm.look") }}
                </el-button>
                <el-button class="cud-common-operate-edit" type="text" size="small" @click="updateData(scope.row)" v-if="hasPermission('system_manage_edit')">
                  {{ $t("cm.update") }}
                </el-button>
                <el-button class="cud-common-operate-delete" type="text" size="small" @click="delData(scope.row)" v-if="hasPermission('system_manage_del')">
                  {{ $t("cm.delete") }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-row>
        <el-row>
          <div class="cud-special-pagination cud-special-pagination-button">
            <el-pagination popper-class="cud-pager-dropdown" ref="pager" class="cud__page" @size-change="changeSize" @current-change="changeCurrentPage"
              :current-page="tablePage.pageIndex" :page-sizes="[10, 20, 30, 40]" :page-size="tablePage.pageSize"
              layout="total, sizes, prev, pager, next, jumper" :total="tablePage.total">
            </el-pagination>
          </div>
        </el-row>
      </el-card>
    </div>

    <edit-sys-info ref="editSysInfo" :title="editTitle" :model-type="modelType"></edit-sys-info>
  </div>
</template>

<script>
  import sysAppManage from "../js/sys_app_manage";
  export default sysAppManage
</script>
<style lang="less" scoped>
  /deep/.cud__search .el-form-item__content .el-input {
    width: 100%;
  }
</style>
