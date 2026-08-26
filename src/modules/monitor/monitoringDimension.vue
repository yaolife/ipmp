<template>
  <div class="cud-commom-form-style">
    <div class="brand">
      <breadcrumb :arrayName="brand" :hasIcon="hasIcon"></breadcrumb>
    </div>
    <div class="cud__scroll--div">
      <el-card>
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
              v-if="btnShow('monitoring_dimension_create')"
              @click="handleAddMonitoringDimension('')"
              >创建</el-button
            >

            <!-- 数据导入 -->
            <el-upload
              ref="upload"
              class="upload-demo marginLeft10"
              action=""
              :show-file-list="false"
              accept=".xlsx,.xls"
              :http-request="handUpLoad"
              :limit="1"
            >
              <el-button type="primary" size="small"> 导入 </el-button>
            </el-upload>
            <!-- 模板下载 -->
            <el-button
              class="marginLeft10"
              @click="downloadTemplate"
              size="small"
            >
              下载模板
            </el-button>

            <!-- 数据导出 -->
            <el-button class="marginLeft10" @click="exportData" size="small">
              导出
            </el-button>
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
              v-loading="loading"
              :max-height="computedTableHeight"
              highlight-current-row
              row-key="id"
              :tree-props="{ children: 'children' }"
              header-row-class-name="cud-office-table-header"
              :default-sort="{ prop: 'updateDate', order: 'descending' }"
              class="cud-office-table"
            >
              <el-table-column
                show-overflow-tooltip
                align="left"
                prop="id"
                label="维度ID"
              >
                <template slot-scope="scope">
                  <span class="single-line">{{ scope.row.id }}</span>
                </template>
              </el-table-column>
              <el-table-column
                show-overflow-tooltip
                align="left"
                prop="parentId"
                label="父维度ID"
              >
                <template slot-scope="scope">
                  <span class="single-line">{{ scope.row.parentId }}</span>
                </template>
              </el-table-column>
              <el-table-column
                show-overflow-tooltip
                align="left"
                prop="name"
                label="维度名称"
              ></el-table-column>
              <el-table-column
                show-overflow-tooltip
                align="left"
                prop="monitorCode"
                label="监控码"
              >
                <template slot-scope="scope">
                  <span class="monitor-code-row">
                    <span style="width:calc(100% - 40px)" class="single-line">{{
                      scope.row.monitorCode
                    }}</span>
                    <i
                      v-if="scope.row.monitorCode"
                      class="el-icon-document-copy"
                      @click="copyToClipboard(scope.row.monitorCode)"
                    ></i
                  ></span>
                </template>
              </el-table-column>
              <el-table-column
                show-overflow-tooltip
                align="left"
                prop="orderCode"
                label="顺序编码"
              ></el-table-column>
              <el-table-column
                align="left"
                :label="$t('tm.operate')"
                width="200"
                fixed="right"
              >
                <template slot-scope="scope">
                  <el-button
                    @click="handleAddMonitoringDimension(scope.row.id)"
                    v-if="btnShow('monitoring_dimension_create')"
                    type="text"
                    size="small"
                    :disabled="!scope.row.addFlag"
                    :class="
                      !scope.row.addFlag ? 'noEdit' : 'cud-common-operate-edit'
                    "
                    >新增子维度</el-button
                  >
                  <el-button
                    @click="handleEditMonitoringDimension(scope.row)"
                    type="text"
                    size="small"
                    class="cud-common-operate-edit"
                    v-if="btnShow('monitoring_dimension_edit')"
                    >编辑</el-button
                  >
                  <el-button
                    @click="delClick(scope.row)"
                    type="text"
                    size="small"
                    v-if="btnShow('monitoring_dimension_delete')"
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
      <addMonitoringDimension
        ref="monitoringDimensionRef"
        @handleConfirm="search"
        :detailObj="detailObj"
        :codeList="codeList"
        :parentId="parentId"
        :title="title"
      ></addMonitoringDimension>
    </div>
  </div>
</template>

<script>
import monitoringDimension from "./js/monitoringDimension";
export default monitoringDimension;
</script>
<style lang="less" scoped>
/deep/ .el-card__body {
  padding: 15px 15px 0;
}
/deep/ .noEdit {
  color: #c0c4cc;
}
/deep/ .el-table .cell {
  display: flex;
}
.monitor-code-row {
  display: flex;
  justify-content: center;
  align-items: center;
}
.single-line {
  width: 100%;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.table-button {
  display: flex;
}
.marginLeft10 {
  margin-left: 2px;
}
</style>
