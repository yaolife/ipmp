<template>
  <div class="cud-commom-form-style">
    <div class="brand">
      <breadcrumb :arrayName="brand" :hasIcon="hasIcon"></breadcrumb>
    </div>
    <div class="cud__scroll--div">
      <el-card class="card-box">
        <query-form
          :queryFormId="'email_template'"
          :queryFields="queryFields"
          :loading="loading"
          @resize="initMaxHeight"
          @submit="search"
          ref="queryForm"
          class="cud-commom-form-search"
        >
        </query-form>
      </el-card>
      <el-card>
        <div class="cud__tree--right">
          <!--添加-->
          <div class="table-button">
            <el-button
              type="primary"
              size="small"
              @click="handleAddModule"
              v-if="btnShow('monitoring_module_create')"
              >创建</el-button
            >
            <el-button
              size="small"
              @click="batchDel()"
              :disabled="selectnum == '0'"
              v-if="btnShow('monitoring_module_delete')"
              >删除</el-button
            >
          </div>
          <div
            class="cud__table--list"
            :style="{ height: computedTableHeight + 'px' }"
          >
            <el-table
              :data="tableData"
              ref="multipleSelection"
              border
              stripe
              @selection-change="handleSelectionChange"
              v-loading="loading"
              :max-height="computedTableHeight"
              highlight-current-row
              header-row-class-name="cud-office-table-header"
              :default-sort="{ prop: 'updateDate', order: 'descending' }"
              class="cud-office-table"
            >
              <el-table-column
                align="center"
                type="selection"
                :selectable="selectableMethod"
                width="55"
              ></el-table-column>
              <el-table-column
                show-overflow-tooltip
                align="left"
                prop="name"
                label="模块名称"
              ></el-table-column>
              <el-table-column
                show-overflow-tooltip
                align="left"
                prop="description"
                label="描述"
              ></el-table-column>
              <el-table-column
                align="left"
                :label="$t('tm.operate')"
                width="200"
                fixed="right"
              >
                <template slot-scope="scope">
                  <el-button
                    @click="handleEditModule(scope.row)"
                    type="text"
                    size="small"
                    class="cud-common-operate-edit"
                    v-if="btnShow('monitoring_module_edit')"
                    >编辑</el-button
                  >
                  <el-button
                    @click="dimensionManage(scope.row)"
                    type="text"
                    size="small"
                    class="cud-common-operate-edit"
                    v-if="btnShow('dimension_manage')"
                    >维度管理</el-button
                  >
                  <el-button
                    @click="delClick(scope.row)"
                    type="text"
                    size="small"
                    v-if="btnShow('monitoring_module_delete')"
                    :disabled="scope.row.parent"
                    :class="
                      scope.row.parent ? 'noEdit' : 'cud-common-operate-delete'
                    "
                    >删除</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
          </div>
          <el-row>
            <div class="cud-special-pagination cud-special-pagination-button">
              <el-pagination
                popper-class="cud-pager-dropdown"
                class="cud__page float-right"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                @prev-click="prePage"
                @next-click="nextPage"
                :current-page.sync="currentPage"
                :page-sizes="[10, 20, 30, 40]"
                :page-size="pageSize"
                layout="total,sizes, prev, pager, next"
                :total="total"
                :pager-count="5"
                :disabled="loading"
              >
              </el-pagination>
            </div>
          </el-row>
        </div>
      </el-card>
      <addMonitoringModule
        ref="monitoringModuleRef"
        @handleConfirm="resetData"
        :detailObj="detailObj"
        :isDisabled="isDisabled"
        :title="title"
      ></addMonitoringModule>
    </div>
  </div>
</template>

<script>
import monitoringModule from "./js/monitoringModule";
export default monitoringModule;
</script>
<style lang="less" scoped>
/deep/ .el-card__body {
  padding: 15px 15px 0;
}
/deep/ .noEdit {
  color: #c0c4cc;
}
.card-box {
  /deep/ .el-input__inner {
    width: 251%;
  }
}
/deep/ .el-table-column--selection .cell {
  display: flex;
  justify-content: center;
}
/deep/ .el-checkbox:last-of-type {
  margin-right: 1px;
}
</style>
