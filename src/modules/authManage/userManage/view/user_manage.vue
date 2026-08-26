<template>
  <div class="cud-commom-form-style">
    <div class="brand">
      <breadcrumb :arrayName="brand" :hasIcon="hasIcon"></breadcrumb>
    </div>
    <div class="cud__scroll--div" v-loading.fullscreen.lock="fullscreenLoading">
      <el-card>
        <query-form
          :queryFormId="'user_manage'"
          :queryFields="queryFields"
          @resize="initMaxHeight"
          @submit="search"
          ref="queryForm"
          class="cud-commom-form-search">
        </query-form>
      </el-card>
      <el-card>
        <div class="table-button">
          <el-button type="primary" size="small" @click="dataAdd()" v-if="hasPermission('user_manage_add')">{{ $t("cm.add") }}</el-button>
          <el-upload class="btn_distance" :show-file-list="false" :action="uploadUrl" :with-credentials="true"
            :before-upload="uploadBefore" :on-success="uploadSuccess" :on-progress="uploading"
            :on-error="uplofileError" :headers="headers">
            <el-button size="small" v-if="hasPermission('user_manage_import')">{{ $t("cm.import") }} </el-button>
          </el-upload>
          <!--导出-->
          <el-button size="small" :loading="loading1" @click="exportList" v-if="hasPermission('user_manage_export')">{{ $t("cm.export") }}
          </el-button>
          <!-- 下载模板-->
          <el-button size="small" :loading="loading2" @click="exportTemplate" v-if="hasPermission('user_manage_export_template')">{{ $t("dataAuth.download") }}</el-button>
        </div>
        <el-row class="cud__table--list">
          <el-table v-loading="loading" ref="childTable" row-id="id" :data="tableData" :empty-text="$t('cm.nodata')"
            :height="maxTableHeight" highlight-current-row header-row-class-name="cud-office-table-header" class="cud-office-table">
            <el-table-column align="left" :label="$t('cm.no')" type="index" min-width="50"></el-table-column>
            <el-table-column label="员工号" align="left" prop="userId" min-width="100"></el-table-column>
            <el-table-column label="员工姓名" align="left" prop="userName" min-width="150" :show-overflow-tooltip="true"></el-table-column>
            <el-table-column label="性别" align="left" prop="userSex"></el-table-column>
            <el-table-column label="手机号" align="left" prop="cellphoneNo" min-width="150"></el-table-column>
            <el-table-column label="人员类型" align="left" prop="userClassId" min-width="100">
              <template slot-scope="scope">
                <span v-if="scope.row.userClassId === '0'">在编人员</span>
                <span v-if="scope.row.userClassId === '1'">非在编人员</span>
                <span v-if="scope.row.userClassId === '2'">其他</span>
              </template>
            </el-table-column>
            <el-table-column label="状态" align="left" prop="userStatus">
              <!-- <template slot-scope="scope">
                <span v-if="scope.row.userStatus === '0'">禁用</span>
                <span v-if="scope.row.userStatus === '1'">正常</span>
              </template> -->
            </el-table-column>
            <el-table-column label="公司" align="left" prop="companyName" min-width="150"></el-table-column>
            <el-table-column label="工作部门" align="left" prop="userWorkDeptEntity"  min-width="300" :show-overflow-tooltip="true">
              <template slot-scope="scope">
                {{scope.row.deptNamePath}}
              </template>
            </el-table-column>
            <!-- <el-table-column label="职位" align="left" prop="userPosiName" min-width="100" :show-overflow-tooltip="true"></el-table-column> -->
            <el-table-column fixed="right" :label="$t('cm.operate')" width="180">
              <template slot-scope="scope">
                <el-button type="text" class="cud-common-operate-edit" size="small" @click="dataEdit(scope.row)" v-if="hasPermission('user_manage_edit')">{{ $t("cm.update") }}</el-button>
                <el-button class="cud-common-operate-delete" type="text" size="small" @click="dataDel(scope.row)" v-if="hasPermission('user_manage_del')">{{ $t("cm.delete") }}</el-button>
                <el-button class="cud-common-operate-delete" type="text" size="small" @click="dataResetPsw(scope.row)" v-if="hasPermission('user_manage_reset')">重置密码</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-col :span="24">
            <div class="cud-special-pagination cud-special-pagination-button">
              <el-pagination popper-class="cud-pager-dropdown" ref="pager" class="cud__page" @size-change="changeSize"
                @current-change="changeCurrentPage" :current-page="tablePage.current" :page-sizes="[10, 20, 30, 40]"
                :page-size="tablePage.size" layout="total, sizes, prev, pager, next, jumper"
                :total="tablePage.total">
              </el-pagination>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </div>

    <edit-user ref="editUser" :title="model.title" :model-type="modelType"></edit-user>
  </div>
</template>

<script>
  import userManage from "../js/user_manage";
  export default userManage
</script>
<style lang="less" scoped>
  .btn_distance {
    display: inline;
  }

  .btn_float {
    float: right;
  }
</style>
