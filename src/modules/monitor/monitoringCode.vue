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
              @click="handleAddMonitoringCode"
              v-if="btnShow('monitoring_code_create')"
              >创建</el-button
            >
            <el-button
              size="small"
              @click="batchUpdateEffective('', 'Y')"
              v-if="btnShow('monitoring_code_take_effect')"
              :disabled="selectnum == '0'"
              >生效</el-button
            >
            <el-button
              size="small"
              @click="batchUpdateEffective('', 'N')"
              v-if="btnShow('monitoring_code_take_effect')"
              :disabled="selectnum == '0'"
              >失效</el-button
            >
            <el-button
              size="small"
              @click="batchDel()"
              :disabled="selectnum == '0'"
              v-if="btnShow('monitoring_code_delete')"
              >删除</el-button
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
              size="small"
              @click="downloadTemplate"
            >
              下载模板
            </el-button>

            <!-- 数据导出 -->
            <el-button class="marginLeft10" size="small" @click="exportData">
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
              @selection-change="handleSelectionChange"
              v-loading="loading"
              :max-height="computedTableHeight"
              highlight-current-row
              :row-key="row => row.id"
              header-row-class-name="cud-office-table-header"
              :default-sort="{ prop: 'updateDate', order: 'descending' }"
              class="cud-office-table"
            >
              <el-table-column
                align="center"
                type="selection"
                reserve-selection
                :selectable="selectableMethod"
                width="55"
              ></el-table-column>
              <el-table-column
                show-overflow-tooltip
                align="left"
                prop="name"
                label="监控码名称"
              ></el-table-column>
              <el-table-column
                show-overflow-tooltip
                align="left"
                min-width="160"
                prop="code"
                label="监控码"
              >
                <template slot-scope="scope">
                  <div class="code-box">
                    <span>{{ scope.row.code }} </span>
                    <i
                      v-if="scope.row.code"
                      class="el-icon-document-copy"
                      @click="copyToClipboard(scope.row.code)"
                    ></i>
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                show-overflow-tooltip
                align="left"
                prop="target"
                label="监控目标"
              >
                <template slot-scope="scope">
                  <span>{{ getTarget(scope.row.target) }}</span>
                </template>
              </el-table-column>
              <el-table-column
                show-overflow-tooltip
                align="left"
                prop="createUserName"
                label="创建人"
              ></el-table-column>
              <el-table-column
                show-overflow-tooltip
                align="left"
                prop="createDateTimeStr"
                label="创建时间"
              ></el-table-column>
              <el-table-column
                show-overflow-tooltip
                align="center"
                prop="effective"
                label="使用状态"
                width="80"
              >
                <template slot-scope="scope">
                  <span
                    :style="{
                      color: scope.row.effective === 'Y' ? '#67c23a' : '#f56c6c'
                    }"
                    >{{ getEffective(scope.row.effective) }}</span
                  >
                </template>
              </el-table-column>
              <el-table-column
                align="center"
                :label="$t('tm.operate')"
                width="150"
                fixed="right"
              >
                <template slot-scope="scope">
                  <template v-if="scope.row.createdMethod === 'PAGE_CREATED'">
                    <el-button
                      @click="handleEditMonitoringCode(scope.row)"
                      type="text"
                      size="small"
                      :disabled="scope.row.createdMethod === 'PAGE_CREATED'"
                      :class="
                        scope.row.createdMethod === 'PAGE_CREATED'
                          ? 'noEdit'
                          : 'cud-common-operate-edit'
                      "
                      v-if="btnShow('monitoring_code_edit')"
                      >编辑</el-button
                    ></template
                  >
                  <template v-else>
                    <el-button
                      @click="handleEditMonitoringCode(scope.row)"
                      type="text"
                      size="small"
                      :disabled="
                        !scope.row.createdMethod && scope.row.effective === 'Y'
                      "
                      :class="
                        !scope.row.createdMethod && scope.row.effective === 'Y'
                          ? 'noEdit'
                          : 'cud-common-operate-edit'
                      "
                      v-if="btnShow('monitoring_code_edit')"
                      >编辑</el-button
                    ></template
                  >

                  <el-button
                    v-show="scope.row.effective === 'N'"
                    @click="batchUpdateEffective(scope.row, 'Y')"
                    type="text"
                    size="small"
                    class="cud-common-operate-edit"
                    v-if="btnShow('monitoring_code_take_effect')"
                    >生效</el-button
                  >
                  <el-button
                    v-show="scope.row.effective === 'Y'"
                    @click="batchUpdateEffective(scope.row, 'N')"
                    type="text"
                    size="small"
                    class="cud-common-operate-edit"
                    v-if="btnShow('monitoring_code_take_effect')"
                    >失效</el-button
                  >
                  <el-button
                    @click="delClick(scope.row)"
                    type="text"
                    size="small"
                    :disabled="scope.row.createdMethod === 'PAGE_CREATED'"
                    v-if="btnShow('monitoring_code_delete')"
                    :class="
                      scope.row.createdMethod === 'PAGE_CREATED'
                        ? 'noEdit'
                        : 'cud-common-operate-delete'
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
      <addMonitoringCode
        ref="monitoringCodeRef"
        @handleConfirm="resetData"
        :detailObj="detailObj"
        :targetList="targetList"
        :title="title"
      ></addMonitoringCode>
    </div>
  </div>
</template>

<script>
import monitoringCode from "./js/monitoringCode";
export default monitoringCode;
</script>
<style lang="less" scoped>
.code-box {
  width: 100%;
  span {
    display: inline-block;
    max-width: (100% - 20px);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
/deep/ .el-card__body {
  padding: 15px 15px 0;
}
/deep/ .noEdit {
  color: #c0c4cc;
  margin-right: 8px;
}
.cud-common-operate-edit {
  margin-right: 8px;
}
.el-icon-document-copy {
  cursor: pointer;
}

.table-button {
  display: flex;
}
.marginLeft10 {
  margin-left: 2px;
}
/deep/ .el-table-column--selection .cell {
  display: flex;
  justify-content: center;
}
/deep/ .el-checkbox:last-of-type {
  margin-right: 1px;
}
</style>
