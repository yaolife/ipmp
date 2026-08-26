<template>
  <div>
    <query-form
      :queryFormId="'dept_users'"
      :queryFields="queryFields"
      @resize="initMaxHeight"
      @submit="search"
      ref="queryForm"
      class="cud-commom-form-search">
    </query-form>
    <el-row class="cud__table--list cud__table--list-padding fssc-div-block">
        <el-table v-loading="loading" ref="childTable" row-id="id" :data="tableData" :empty-text="$t('cm.nodata')"
          :height="maxTableHeight" highlight-current-row header-row-class-name="cud-office-table-header" class="cud-office-table">
          <el-table-column align="left" :label="$t('cm.no')" type="index" min-width="50"></el-table-column>
          <el-table-column label="员工号" align="left" prop="userId" min-width="100"></el-table-column>
          <el-table-column label="员工姓名" align="left" prop="userName" min-width="100"></el-table-column>
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
          <el-table-column fixed="right" :label="$t('cm.operate')" width="150">
            <template slot-scope="scope">
              <el-button type="text" class="cud-common-operate-edit" size="small" @click="dataEdit(scope.row)">{{ $t("cm.update") }}</el-button>
              <el-button class="cud-common-operate-delete" type="text" size="small" @click="dataDel(scope.row)">{{ $t("cm.delete") }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-col :span="24">
          <div class="cud-special-pagination cud-special-pagination-button">
            <div class="pagination-button"></div>
            <el-pagination popper-class="cud-pager-dropdown" ref="pager" class="cud__page" @size-change="changeSize"
              @current-change="changeCurrentPage" :current-page="tablePage.current" :page-sizes="[10, 20, 30, 40]"
              :page-size="tablePage.size" layout="total, sizes, prev, pager, next, jumper"
              :total="tablePage.total">
            </el-pagination>
          </div>
        </el-col>
      </el-row>
    </div>
</template>

<script>
  import deptUsers from "../js/dept_users";
  export default deptUsers
</script>
<style lang="less" scoped>
  .btn_distance {
    display: inline;
  }

  .btn_float {
    float: right;
  }
</style>
