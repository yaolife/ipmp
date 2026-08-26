<template>
  <div class="cud-commom-form-style">
    <!-- <div class="brand">
      <breadcrumb :arrayName="brand" :hasIcon="hasIcon"></breadcrumb>
    </div> -->
    <div class="cud__scroll--div">
      <el-card>
        <query-form
          :queryFormId="'drafts'"
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
        <div class="table-button">
          <el-button
            size="small"
            @click="batchDel(tableData)"
            :disabled="selectnum == '0'"
            v-loading.fullscreen.lock="fullscreenLoading"
            >{{ $t("cm.delete") }}</el-button
          >
        </div>
        <el-row
          class="cud__table--list"
          :style="{ height: computedTableHeight + 'px' }"
        >
          <el-table
            :data="tableData"
            ref="multipleSelection"
            @selection-change="handleSelectionChange"
            v-loading="loading"
            :empty-text="$t('cm.nodata')"
            highlight-current-row
            border
            stripe
            :max-height="computedTableHeight"
            :default-sort="{ prop: 'createDate', order: 'descending' }"
            header-row-class-name="cud-office-table-header"
            class="cud-office-table"
          >
            <el-table-column
              align="center"
              type="selection"
              width="55"
            ></el-table-column>
            <div style="display: inline-block" v-if="show">
              <el-table-column
                align="left"
                prop="processInfoId"
                :label="$t('workbench.process_info_id')"
                width="55"
              ></el-table-column>
              <el-table-column
                align="left"
                prop="createUserNo"
                :label="$t('workbench.process_info_id')"
                width="55"
              ></el-table-column>
            </div>
            <el-table-column
              align="left"
              prop="procTitle"
              :label="$t('workbench.work_title')"
            >
              <template slot-scope="scope">
                <el-button
                  size="small"
                  type="text"
                  @click="handleClick(scope.row)"
                  >{{ scope.row.procTitle }}</el-button
                >
              </template>
            </el-table-column>
            <el-table-column
              align="left"
              prop="procName"
              :label="$t('workbench.process_name')"
            ></el-table-column>
            <el-table-column align="left" :label="$t('workbench.create_user')">
              <template slot-scope="scope">
                {{ scope.row.createUserName }}
              </template>
            </el-table-column>
            <el-table-column
              align="left"
              :label="$t('workbench.create_date')"
              prop="createDate"
              sortable
            >
              <!-- <template slot-scope="scope">
                {{ dateGet(scope.row.createDate) }}
              </template> -->
            </el-table-column>
            <el-table-column align="left" :label="$t('tm.operate')" width="160">
              <template slot-scope="scope">
                <el-button
                  type="text"
                  size="small"
                  class="cud-common-operate-delete"
                  @click="delClick(scope.row)"
                >
                  {{ $t("cm.delete") }}</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-row>
        <el-row>
          <div class="cud-special-pagination cud-special-pagination-button">
            <el-pagination popper-class="cud-pager-dropdown"
              ref="pager"
              class="cud__page"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="current"
              :page-sizes="[10, 20, 30, 40]"
              :page-size="size"
              layout="total,sizes, prev, pager, next"
              :pager-count="5"
              :total="total"
              :disabled="loading"
            >
            </el-pagination>
          </div>
        </el-row>
      </el-card>
    </div>
  </div>
</template>

<script>
import drafts from "./js/drafts.js";
export default drafts;
</script>
<style lang="less" scoped>
// @import "src/assets/css/style";
.el-card.is-always-shadow {
  margin-left: 15px;
}
/deep/ .el-button--text {
  user-select: unset  // 设置按钮text类型的时候可以复制
}
</style>
