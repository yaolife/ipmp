<template>
  <div class="position-permission-manage cud-commom-form-style">
    <div class="el-card left-container">
      <!-- 左侧搜索和岗位列表 -->
      <div class="position-list-card position-list-card-left">
        <div class="common-title-text" style="margin-bottom: 8px;">岗位</div>
        <div class="search-container">
          <el-input
            v-model="searchKeyword"
            placeholder="请输入名称"
            @input="handleSearch"
            clearable
          >
            <i
              slot="suffix"
              class="el-input__icon el-icon-search"
              @click="handleSearch"
            ></i>
          </el-input>
        </div>

        <el-table
          :data="positionList"
          v-loading="loading"
          highlight-current-row
          @row-click="handleRowClick"
          style="width: 100%; margin-top: 8px;height:calc(100vh / var(--zoom-value) - 254px);overflow:auto;"
          :header-cell-style="{ background: '#f5f7fa' }"
        >
          <el-table-column
            v-for="column in columns"
            :key="column.prop"
            :prop="column.prop"
            :label="column.label"
          ></el-table-column>
        </el-table>
        <el-pagination
          :current-page="pagination.currentPage"
          small
          :page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :pager-count="4"
          :total="pagination.total"
          layout="prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    <div class="el-card right-container">
      <!-- 右侧权限配置区域 -->
      <div class="position-list-table">
        <div class="common-title-text" style="margin:12px 0px 0px 12px;">
          数据权限授权
        </div>
        <el-button
          style="margin:12px 0px 0px 12px;"
          v-if="currentPosition"
          type="primary"
          @click="handleAssignRole"
          >分配角色</el-button
        >
        <DataTable
          v-if="currentPosition"
          :table-columns="tableColumns"
          :operation-config="operationConfig"
          :load-data="loadData"
          ref="dataTableRef"
        />
        <el-empty v-else description="请选择左侧岗位查看" :image="noDataImg"   class="empty-tips"></el-empty>
      </div>
      <!-- <el-card class="position-list-card" shadow="never">
          </el-card> -->
    </div>

    <!-- 弹窗 -->
    <el-dialog title="选择角色" :visible.sync="dialogTableVisible" width="80vw">
      <DataTable
        :table-columns="tableColumns"
        :search-config="searchConfig"
        :load-data="loadAssignRoleData"
        :selection="true"
        @selection-change="handleSelectionChange"
        ref="dialogDataTableRef"
      />
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogTableVisible = false">取 消</el-button>
        <el-button type="primary" @click="handlePostRoleRelation"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import positionPermissionMixin from "./js/position_permission.js";

export default {
  name: "PositionPermissionManage",
  mixins: [positionPermissionMixin]
};
</script>

<style scoped>
.position-permission-manage {
  display: flex;
}
.left-container {
  width: 300px;
  display: flex;
  flex-direction: column;
  background: #fff;
  height: calc(100vh / var(--zoom-value) - 114px);
  padding: 12px;
  box-sizing: border-box;
}

.right-container {
  flex: 1;
  overflow: auto;
  background: #fff;
  height: calc(100vh / var(--zoom-value) - 114px);
  margin-left: 0 !important;
}

.el-card__body {
  padding: 0 !important;
}

.position-list-table {
  min-height: calc(100vh / var(--zoom-value) - 130px);
  background: #fff;
  overflow: hidden;
}

.search-container {
  margin-bottom: 12px;
}

.position-detail {
  padding: 12px;
}

.empty-tips {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 40px 0;
  flex-direction: column;
}

</style>
