<template>
  <div class="cud-commom-form-style">
    <div class="cud__scroll--div">
      <el-card>
        <query-form
          :queryFormId="'fupportInfoForm'"
          :queryFields="queryFields"
          :loading="tableLoading"
          :showMoreSetting="false"
          labelWidth="80px"
          @resize="initMaxHeight"
          @submit="search"
          ref="queryForm"
          class="cud-commom-form-search"
        >
        </query-form>
      </el-card>
      <el-card>
        <div class="table-button">
<!--          <el-button type="primary" size="small" icon="el-icon-plus" @click="goAdd">新增</el-button>-->

          <el-button
            type="success"
            size="small"
            icon="el-icon-upload2"
            @click="triggerImport"
            :loading="triggerLoading"
            v-if="showBtn('fupp_batch_input')"
          >
            批量导入
          </el-button>

          <input
            ref="importInput"
            type="file"
            accept=".xls,.xlsx,.csv"
            style="display: none"
            @change="onImportFile"
          />
          <el-button
            type="info"
            plain
            size="small"
            icon="el-icon-download"
            @click="downloadImportTemplate"
            v-if="showBtn('fupp_downloadTemplate')"
          >
            下载导入模板
          </el-button>
          <el-button
            type="primary"
            plain
            size="small"
            icon="el-icon-top-right"
            @click="exportFupport"
            :loading="reportLoading"
            v-if="showBtn('fupp_export')"
          >导出</el-button>
          <el-button
            type="danger" size="small"
            icon="el-icon-delete"
            @click="deleteFupportInfoBatch"
            :loading="deleteLoading"
            v-if="showBtn('fupp_delete')"
          >
            删除
          </el-button>
        </div>
        <el-row
          class="cud__table--list"
          :style="{ height: computedTableHeight + 'px' }"
        >
          <el-table
            :data="tableData"
            ref="multipleSelection"
            @selection-change="handleSelectionChange"
            v-loading="tableLoading"
            :empty-text="$t('cm.nodata')"
            highlight-current-row
            border
            stripe
            :max-height="computedTableHeight"
            header-row-class-name="cud-office-table-header"
            class="cud-office-table"
          >
            <el-table-column
              align="center"
              type="selection"
              width="55"
            ></el-table-column>
            <el-table-column
              align="center"
              type="index"
              label="序号"
              width="60"
              :index="indexMethod"
            ></el-table-column>
            <!-- 支吊架编号改为可点击的蓝色链接样式，点击直接跳转到详情页 -->
            <el-table-column
              align="center"
              prop="hangerNo"
              label="支吊架编号"
              min-width="160"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <el-link
                  class="hanger-no-link"
                  :underline="false"
                  @click="goFupportDetail(scope.row)"
                >
                  {{ scope.row.hangerNo }}
                </el-link>
              </template>
            </el-table-column>
            <el-table-column
              align="center"
              prop="unitNumber"
              label="机组号"
              min-width="100"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              align="center"
              prop="systemNumber"
              label="系统编号"
              min-width="100"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              align="center"
              prop="roomNumber"
              label="房间号"
              min-width="100"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              align="center"
              prop="nuclearIslandConventionalIsland"
              label="核岛/常规岛"
              min-width="120"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              align="center"
              prop="installationArea"
              label="安装区域"
              min-width="100"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              align="center"
              prop="supportHangerClassification"
              label="支吊架分类"
              min-width="120"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              align="center"
              prop="hangerType"
              label="支吊架类型"
              min-width="120"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              align="center"
              prop="createDate"
              label="创建时间"
              min-width="170"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              align="center"
              label="操作"
              width="160"
              fixed="right"
            >
              <template slot-scope="scope">
                <el-button
                  type="text"
                  size="small"
                  class="cud-common-operate-edit"
                  @click="viewRow(scope.row)"
                >查看</el-button
                >

                <el-button
                  type="text"
                  size="small"
                  class="cud-common-operate-edit"
                  @click="delFupportInfo(scope.row)"
                  v-if="showBtn('fupp_delete')"
                >删除</el-button
                >

<!--                <el-button-->
<!--                  type="text"-->
<!--                  size="small"-->
<!--                  class="cud-common-operate-edit"-->
<!--                  @click="updateRow(scope.row)"-->
<!--                >编辑</el-button-->
<!--                >-->
<!--                <el-dropdown-->
<!--                  trigger="click"-->
<!--                  @command="cmd => handleMore(cmd, scope.row)"-->
<!--                >-->
<!--                  <el-button type="text" size="small">更多<i class="el-icon-arrow-down el-icon&#45;&#45;right"></i>-->
<!--                  </el-button>-->
<!--                  <el-dropdown-menu slot="dropdown">-->
<!--                    <el-dropdown-item command="export">导出</el-dropdown-item>-->
<!--                    <el-dropdown-item command="delete">删除</el-dropdown-item>-->
<!--                  </el-dropdown-menu>-->
<!--                </el-dropdown>-->
              </template>
            </el-table-column>
          </el-table>
        </el-row>
        <el-row>
          <div class="cud-special-pagination cud-special-pagination-button">
            <el-pagination
              popper-class="cud-pager-dropdown"
              ref="pager"
              class="cud__page"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="currentNo"
              :page-sizes="[10, 20, 30, 40]"
              :page-size="sizeNo"
              layout="total,sizes, prev, pager, next"
              :pager-count="5"
              :total="total"
              :disabled="tableLoading"
            >
            </el-pagination>
          </div>
        </el-row>
      </el-card>
    </div>
  </div>
</template>

<script>
import fupportInfo from "./js/fupportInfo.js";
export default fupportInfo;
</script>
<style lang="less" scoped>
/deep/ .el-button--text {
  user-select: unset;
}
.table-button {
  text-align: right;
}
/deep/ .el-form-item__label {
  white-space: nowrap;
}
/deep/ .cud-commom-form-search .el-form-item {
  display: flex;
  align-items: center;
  padding-right: 12px;
}
/deep/ .cud-commom-form-search .el-form-item__label {
  width: auto !important;
  float: none;
  padding-right: 8px;
  line-height: 32px;
  flex-shrink: 0;
}
/deep/ .cud-commom-form-search .el-form-item__content {
  margin-left: 0 !important;
  flex: 1;
  float: none;
  min-width: 0;
}
/deep/ .el-card:first-child .el-card__body {
  padding-left: 10px;
  padding-right: 10px;
}
// 加/deep/深度穿透，避免scoped样式不生效
/deep/ .hanger-no-link {
  color: #409EFF !important;
  font-weight: 500;
  cursor: pointer;
  // hover时自动显示下划线，还原系统原生链接交互
  &:hover {
    color: #66b1ff !important;
    text-decoration: underline !important;
  }
}
</style>
