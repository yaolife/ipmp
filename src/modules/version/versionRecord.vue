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
          labelWidth="120px"
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
              v-if="btnShow('version_record_create')"
              >创建</el-button
            >
            <el-button
              size="small"
              @click="batchDel()"
              :disabled="selectnum == '0'"
              v-if="btnShow('version_record_delete')"
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
                width="55"
              ></el-table-column>
              <el-table-column
                show-overflow-tooltip
                align="left"
                prop="describe"
                min-width="150"
                label="版本调整说明"
              ></el-table-column>
              <el-table-column
                show-overflow-tooltip
                align="left"
                prop="adjustDate"
                label="调整日期"
              ></el-table-column>
              <el-table-column
                show-overflow-tooltip
                align="left"
                prop="personInCharge"
                label="负责人"
              ></el-table-column>
              <el-table-column
                align="left"
                prop="linkResources"
                label="调整资源"
              >
                <template slot-scope="scope">
                  <div class="linkResources">{{ scope.row.linkResources }}</div>
                </template>
              </el-table-column>
              <el-table-column
                show-overflow-tooltip
                align="left"
                prop="influenceItem"
                width="250"
                label="调整影响"
              >
                <template slot-scope="scope">
                  <div>{{ scope.row.influenceItem }}</div>
                </template>
              </el-table-column>
              <el-table-column
                show-overflow-tooltip
                align="left"
                prop="codeMount"
                label="调整代码量"
              ></el-table-column>
              <el-table-column
                align="left"
                :label="$t('tm.operate')"
                width="200"
                fixed="right"
              >
                <template slot-scope="scope">
                  <el-button
                    @click="handleEditVersion(scope.row)"
                    type="text"
                    size="small"
                    v-if="btnShow('version_record_edit')"
                    class="cud-common-operate-edit"
                    >编辑</el-button
                  >
                  <el-button
                    @click="handleImpactItems(scope.row)"
                    type="text"
                    size="small"
                    v-if="btnShow('version_record_edit_impact')"
                    class="cud-common-operate-edit"
                    >编辑影响项</el-button
                  >
                  <el-button
                    @click="delClick(scope.row)"
                    type="text"
                    size="small"
                    v-if="btnShow('version_record_delete')"
                    class="cud-common-operate-delete"
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
      <addVersionCord
        ref="addVersionCordRef"
        @handleConfirm="resetData"
        :detailObj="detailObj"
        :isDisabled="isDisabled"
        :title="title"
      ></addVersionCord>
      <impactItems
        ref="impactItemsRef"
        :impactTypeList="impactTypeList"
        @handleConfirm="resetData"
        :detailObj="detailimpactItemsObj"
      ></impactItems>
    </div>
  </div>
</template>

<script>
import versionRecord from "./js/versionRecord";
export default versionRecord;
</script>
<style lang="less" scoped>
/deep/ .el-card__body {
  padding: 15px 15px 0;
}
/deep/ .el-input__inner {
  // width: 251px;
}
.linkResources {
  white-space: pre-wrap;
}
</style>
