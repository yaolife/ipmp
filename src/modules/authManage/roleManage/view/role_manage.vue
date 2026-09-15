<template>
  <div class="cud-commom-form-style">
    <div class="brand">
      <breadcrumb :arrayName="brand" :hasIcon="hasIcon"></breadcrumb>
    </div>
    <div class="cud__scroll--div" v-loading.fullscreen.lock="fullscreenLoading">
      <el-card>
        <query-form
          :queryFormId="'role_manage'"
          :queryFields="queryFields"
          @resize="initMaxHeight"
          @submit="search"
          ref="queryForm"
          class="cud-commom-form-search">
        </query-form>
      </el-card>
      <el-card>
        <div class="table-button">
          <el-button type="primary" size="small" @click="addRole()" v-if="hasPermission('role_manage_add')">{{$t("cm.add")}}</el-button>
          <!-- <el-upload class="btn_distance" :show-file-list="false" :action="excelUpUrl" :with-credentials="true"
            :before-upload="beforeUpload" :on-success="upfileBack" :on-progress="loadingFile"
            :on-error="uplofileError">
            <el-button size="small" v-if="hasPermission('role_manage_import')">{{ $t("cm.import") }} </el-button>
          </el-upload> -->
          <!--导出-->
          <!-- <el-button size="small" :loading="loading1" @click="exportExcel" v-if="hasPermission('role_manage_export')">{{ $t("cm.export") }} -->
          </el-button>
          <!-- 下载模板-->
          <!-- <el-button size="small" :loading="loading2" @click="upload" v-if="hasPermission('role_manage_export_template')">{{$t("dataAuth.download")}}</el-button> -->
        </div>
        <el-row class="cud__table--list">
          <el-table v-loading="loading" ref="childTable" row-id="id"
            :data="tableData" :empty-text="$t('cm.nodata')" :height="maxTableHeight" highlight-current-row
            header-row-class-name="cud-office-table-header" class="cud-office-table">
            <el-table-column align="left" :label="$t('cm.no')" type="index" width="50"></el-table-column>
            <el-table-column :label="$t('dataAuth.rolename')" align="left" prop="roleName">
              <template slot-scope="scope">
                {{scope.row.roleName}}
              </template>
            </el-table-column>
            <el-table-column :label="$t('dataAuth.rolecode')" align="left" prop="roleCode"></el-table-column>
            <el-table-column :label="$t('dataAuth.isAdminroleDesp')" align="left" prop="isAdminRole"></el-table-column>
            <el-table-column :label="$t('dataAuth.rolestate')" align="left" prop="state">
              <template slot-scope="scope">
                <span v-if="scope.row.state === '0'">禁用</span>
                <span v-if="scope.row.state === '1'">启用</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('dataAuth.roleDesp')" align="left" prop="roleDesp" :show-overflow-tooltip="true"></el-table-column>
            <el-table-column  :label="$t('cm.operate')" width="150">
              <template slot-scope="scope">
                <el-button type="text" class="cud-common-operate-edit" size="small" @click="edit(scope.row)" v-if="hasPermission('role_manage_edit')">{{ $t("cm.update") }}</el-button>
                <el-button class="cud-common-operate-delete" type="text" size="small" @click="delBatch(scope.row)" v-if="hasPermission('role_manage_del')">{{ $t("cm.delete") }}</el-button>
                <!-- <el-button class="cud-common-operate-edit" type="text" size="small" @click="doRoleFunction(scope.row)" v-if="hasPermission('role_manage_function')">菜单配置</el-button>
                <el-button class="cud-common-operate-edit" type="text" size="small" @click="doRoleAuth(scope.row)" v-if="hasPermission('role_manage_auth')">人员配置</el-button>
                <el-button class="cud-common-operate-edit" type="text" size="small" @click="doDataAuth(scope.row)" v-if="hasPermission('role_data_auth')">数据权限</el-button> -->
                <el-dropdown @command="handleCommand" trigger="click" size="small" placement="top">
                  <span class="el-dropdown-link">{{ $t('cm.more') }}<i class="el-icon-arrow-down"></i></span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item :command="{command: 'function', params: scope.row}">菜单配置</el-dropdown-item>
                    <el-dropdown-item :command="{command: 'person', params: scope.row}">人员配置</el-dropdown-item>
                    <el-dropdown-item :command="{command: 'data', params: scope.row}">数据权限</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </template>
            </el-table-column>
          </el-table>
          <el-col :span="24">
            <div class="cud-special-pagination cud-special-pagination-button">
              <el-pagination popper-class="cud-pager-dropdown" ref="pager" class="cud__page" @size-change="changeSize"
                @current-change="changeCurrentPage" :current-page="tablePage.pageIndex" :page-sizes="[10, 20, 30, 40]"
                :page-size="tablePage.pageSize" layout="total, sizes, prev, pager, next, jumper"
                :total="tablePage.total">
              </el-pagination>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </div>
    <!-- 角色编辑 -->
    <edit-roles ref="editRoles" :title="model.title" :model-type="modelType" :appList="appList"></edit-roles>
    <!-- 菜单配置 -->
    <role-function ref="rolePrivilege"></role-function>
    <!-- 人员配置 -->
    <role-auth-edit ref="roleAuthEdit" :roleName="roleName"></role-auth-edit>
    <!-- 数据权限 -->
    <role-data-auth ref="roleDataAuth"></role-data-auth>
  </div>
</template>

<script>
  import roleManage from "../js/role_manage";
  export default roleManage
</script>
<style lang="less" scoped>
  .btn_distance {
    display: inline;
  }
  .btn_float {
    float: right;
  }
</style>
