<template>
  <div class="data-permission-register">
    <!-- 主体内容：左侧数据模型 + 右侧字段权限配置 -->
    <div class="content-layout">
      <!-- 左侧：数据模型列表 -->
      <div class="el-card left-panel">
        <div class="entity-card" v-loading="loading.entityList">
          <div class="card-header">
            <div class="header-top">
              <div class="common-title-text">数据模型</div>
              <el-radio-group
                v-model="entityType"
                size="mini"
                @change="handleEntityTypeChange"
                :disabled="editList.length"
              >
                <el-radio-button label="all">可控权实体</el-radio-button>
                <el-radio-button label="permed">已控权实体</el-radio-button>
              </el-radio-group>
            </div>
            <el-input
              v-model="entitySearchKeyword"
              placeholder="请输入名称或编码搜索"
              size="mini"
              clearable
              @input="handleEntitySearch"
            >
              <i slot="prefix" class="el-input__icon el-icon-search"></i>
            </el-input>
          </div>
          <div class="entity-list">
            <div
              v-for="entity in filteredEntityList"
              :key="entity.entityCode"
              class="entity-item"
              :class="{
                active:
                  selectedEntity &&
                  selectedEntity.entityCode === entity.entityCode
              }"
              @click="handleEntitySelect(entity)"
            >
              <el-tooltip :content="entity.entityName">
                <!-- <i class="el-icon-document"></i> -->
                <div>
                  <span>{{ entity.entityName }}</span>
                  <span class="entity-code">({{ entity.entityCode }})</span>
                </div>
              </el-tooltip>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：可控权字段配置 -->
      <div class="el-card right-panel">
        <div v-if="selectedEntity" v-loading="loading.fieldList">
          <div class="field-permission-card">
            <div class="card-header">
              <div class="common-title-text">
                可控权字段 - {{ selectedEntity.entityName }}
              </div>
            </div>
            <div class="card-content">
              <el-table
                :data="fieldPermissionList"
                border
                v-loading="loading.permissionUpdate"
              >
                <el-table-column label="字段编码" width="120">
                  <template slot-scope="scope">
                    <div style="font-weight: 500;">
                      {{ scope.row.fieldCode }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="字段名称" width="120">
                  <template slot-scope="scope">
                    <div>{{ scope.row.fieldName }}</div>
                  </template>
                </el-table-column>
                <el-table-column label="行权限控制" width="150" align="center">
                  <template slot-scope="scope">
                    <el-switch
                      v-model="scope.row.rowPermissionEnable"
                      @change="handleRowPermissionChange(scope.row, $event)"
                      :disabled="
                        loading.permissionUpdate ||
                          !editList.includes(scope.row.fieldCode)
                      "
                    >
                    </el-switch>
                  </template>
                </el-table-column>
                <el-table-column label="关联属性值" width="150">
                  <template slot-scope="scope">
                    <el-select
                      size="small"
                      v-model="scope.row.rowPermControlType"
                      placeholder="请选择"
                      :disabled="
                        !scope.row.rowPermissionEnable ||
                          !editList.includes(scope.row.fieldCode)
                      "
                    >
                      <el-option
                        v-for="value in rowPermControlTypeList"
                        :key="value.code"
                        :label="value.name"
                        :value="value.code"
                      />
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column label="列权限控制" width="150" align="center">
                  <template slot-scope="scope">
                    <el-switch
                      v-model="scope.row.colPermissionEnable"
                      @change="handleColPermissionChange(scope.row, $event)"
                      :disabled="
                        loading.permissionUpdate ||
                          !editList.includes(scope.row.fieldCode)
                      "
                    >
                    </el-switch>
                  </template>
                </el-table-column>
                <el-table-column label="列权限无权样式" width="150">
                  <template slot-scope="scope">
                    <el-select
                      v-model="scope.row.colDataDisplayCode"
                      size="small"
                      placeholder="请选择"
                      :disabled="
                        !scope.row.colPermissionEnable ||
                          !editList.includes(scope.row.fieldCode)
                      "
                    >
                      <el-option label="隐藏" value="hide" />
                      <el-option label="***" value="three_stars" />
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column label="操作" align="left">
                  <template slot-scope="scope">
                    <el-button
                      type="text"
                      @click="handleEditFieldPermission(scope.row)"
                    >
                      {{
                        !editList.includes(scope.row.fieldCode)
                          ? "修改"
                          : "确认"
                      }}
                    </el-button>
                    <el-button
                      type="text"
                      @click="cancelEditFieldPermission(scope.row)"
                      v-if="editList.includes(scope.row.fieldCode)"
                    >
                      取消
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </div>
        <div v-else class="no-entity-selected">
          <el-empty description="请选择左侧数据模型查看字段权限配置"></el-empty>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import dataPermissionRegisterMixin from "./js/data_permission_register.js";

export default {
  name: "DataPermissionRegister",
  mixins: [dataPermissionRegisterMixin]
};
</script>

<style scoped>
.data-permission-register {
  display: flex;
  flex-direction: column;
}

.content-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.left-panel {
  width: 300px;
  display: flex;
  flex-direction: column;
  height: calc(100vh / var(--zoom-value) - 114px);
}

.right-panel {
  flex: 1;
  overflow: auto;
  background: #fff;
  height: calc(100vh / var(--zoom-value) - 114px);
  margin: 12px 12px 12px 0 !important;
}

.right-panel >>> .el-empty__image {
  width: 160px;
  margin: 0 auto;
}
.entity-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background: #fff;
  font-weight: 500;
  font-size: 12px;
  border-radius: 4px;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-content {
  padding: 12px;
  background: #fff;
}

.entity-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 12px;
}

.entity-item {
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #181818;
  overflow: hidden;
}

.entity-item:hover {
  background-color: #e6edff;
  border-radius: 4px;
}

.entity-item.active {
  background-color: #e6edff;
  border-radius: 4px;
  color: #0665db;
}

.entity-code {
  font-size: 12px;
  margin-left: auto;
}

.entity-item.active .entity-code {
  color: #0665db;
}

.field-permission-card {
  background: #fff;
  border-radius: 4px;
}

.no-entity-selected {
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 4px;
}
</style>
