<template>
  <div class="position-permission-manage">
    <div class="el-card left-container">
      <!-- 左侧搜索和岗位列表 -->
      <div class="position-list-card position-list-card-left" shadow="never">
        <div class="left-title common-title-text">实体</div>
        <div class="search-container">
          <el-input
            v-model="searchKeyword"
            size="small"
            placeholder="输入名称搜索"
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
        <div v-if="showList" class="asset-list">
          <div
            v-for="item in showList"
            :key="item.code"
            class="asset-item"
            :class="{ active: selectedAsset === item.code }"
            @click="handleAssetSelect(item.code)"
          >
            <span>{{ item.name }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="el-card right-container">
      <!-- 右侧权限配置区域 -->
      <div class="position-list-card" shadow="never">
        <!-- tab栏 -->
        <el-tabs v-model="activeTab" @tab-click="handleTabClick">
          <el-tab-pane label="已授权角色" name="authorized"></el-tab-pane>
          <el-tab-pane label="未授权角色" name="unauthorized"></el-tab-pane>
        </el-tabs>

        <DataTable
          height="80%"
          :labelWidth="'80px'"
          v-if="currentEntity"
          :search-config="searchConfig"
          :table-columns="tableColumns"
          :operation-config="operationConfig"
          :load-data="loadData"
          ref="dataTableRef"
        />

        <el-empty
          class="empty-tips"
          v-else
          description="请选择左侧实体查看"
        ></el-empty>
      </div>
    </div>
  </div>
</template>

<script>
import entityAuthorizationMixin from "./js/entityAuthorization.js";

export default {
  name: "PositionPermissionManage",
  mixins: [entityAuthorizationMixin]
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
  margin: 12px 12px 12px 0 !important;
}
.el-row {
  &:last-child {
    margin-bottom: 0;
  }
}

.el-col {
  border-radius: 4px;
}
.left-title {
  margin-bottom: 12px;
}

.position-list-card {
  overflow-y: hidden;
  height: calc(100vh / var(--zoom-value) - 150px);
}


.search-container {
  margin-bottom: 12px;
}

.position-detail {
  padding: 12px;
}
.asset-list {
  flex: 1;
  overflow-y: auto;
  height: calc(100% - 60px)
}

.asset-item {
  padding: 6px 12px;
  border-radius: 4px;
  margin-bottom: 6px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;

}

.asset-item:hover {
  background-color: #e6edff;
}

.asset-item.active {
  background-color: #e6edff;
  color: #0665db;
}
.search-card {
  border: none !important;
}
:deep(.el-col) {
  padding: 0 !important;
}
:deep(.el-row) {
  margin: 0 !important;
}

.empty-tips {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 40px 0;
  flex-direction: column;
}
.empty-tips >>> .el-empty__image {
  width: 160px;
}
</style>
