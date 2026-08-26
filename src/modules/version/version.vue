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
              @click="handleAddVersion"
              v-if="btnShow('version_create')"
              >创建</el-button
            >
            <el-button
              type="primary"
              size="small"
              @click="handleVersionComparison"
              v-if="btnShow('version_comparison')"
              >版本比对</el-button
            >
            <el-button
              size="small"
              @click="batchDel()"
              v-if="btnShow('version_delete')"
              :disabled="selectnum == '0'"
              >删除</el-button
            >
            <el-button
              type="primary"
              style="float: right;"
              size="small"
              @click="backPage"
              >返回</el-button
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
                prop="version"
                label="版本号"
              ></el-table-column>
              <el-table-column
                show-overflow-tooltip
                align="left"
                prop="parentVersion"
                label="父级版本"
              ></el-table-column>
              <el-table-column
                show-overflow-tooltip
                align="left"
                prop="personInCharge"
                label="负责人"
              ></el-table-column>
              <el-table-column
                show-overflow-tooltip
                align="left"
                prop="publishTime"
                label="版本发布日期"
              ></el-table-column>
              <el-table-column
                align="left"
                :label="$t('tm.operate')"
                width="250"
                fixed="right"
              >
                <template slot-scope="scope">
                  <el-button
                    @click="handleEditVersion(scope.row)"
                    type="text"
                    size="small"
                    v-if="btnShow('version_edit')"
                    class="cud-common-operate-edit"
                    >编辑</el-button
                  >
                  <el-button
                    @click="handleVersionRecord(scope.row)"
                    type="text"
                    size="small"
                    v-if="btnShow('version_record')"
                    class="cud-common-operate-edit"
                    >版本调整记录</el-button
                  >
                  <el-button
                    @click="delClick(scope.row)"
                    type="text"
                    size="small"
                    :disabled="scope.row.parent"
                    v-if="btnShow('version_delete')"
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
      <addVersion
        ref="addVersionRef"
        @handleConfirm="resetData"
        :detailObj="detailObj"
        :isDisabled="isDisabled"
        :title="title"
      ></addVersion>
    </div>
  </div>
</template>

<script>
import version from "./js/version";
export default version;
</script>
<style lang="less" scoped>
/deep/ .el-card__body {
  padding: 15px 15px 0;
}
/deep/ .noEdit {
  color: #c0c4cc;
}
</style>
