<template>
  <div class="role-permission-detail cud-commom-form-style">
    <!-- 基础属性区域 -->
    <div class="el-card basic-info-card" v-loading="loading.roleInfo">
      <div class="event-name-box">
        <span class="event-name-line"></span>角色权限详情:
        <span class="event-name">{{ roleInfo.roleName }}</span>
        <return-button />
      </div>
      <el-form v-model="roleInfo" disabled label-position="top">
        <el-row :gutter="20">
          <el-col span="6">
            <el-form-item label="角色名称" prop="roleName">
              {{ roleInfo.roleName }}
            </el-form-item>
          </el-col>
          <el-col span="6">
            <el-form-item label="角色编码" prop="roleCode">
              {{ roleInfo.roleCode }}
            </el-form-item>
          </el-col>
          <el-col span="6">
            <el-form-item label="状态" prop="roleStatus">
              {{ roleInfo.roleStatus == 1 ? "已启用" : "已停用" }}
            </el-form-item>
          </el-col>
          <el-col span="6">
            <el-form-item label="描述" prop="roleDesc">
              {{ roleInfo.roleDesc }}
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <!-- <el-descriptions title="角色基础信息" :column="2" border>
        <el-descriptions-item label="角色名称">{{ roleInfo.roleName }}</el-descriptions-item>
        <el-descriptions-item label="角色编码">{{ roleInfo.roleCode }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="roleInfo.roleStatus === '1' ? 'success' : 'danger'">
            {{ roleInfo.roleStatus === '1' ? '已启用' : '已停用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="描述">{{ roleInfo.roleDesc || '暂无描述' }}</el-descriptions-item>
      </el-descriptions> -->
    </div>

    <el-tabs
      style="
        background-color: #fff;
        border: 1px solid #ebeef5;
        margin: 0 !important;
        height: calc(100vh / var(--zoom-value) - 204px);
        padding: 0 12px;
      "
      v-model="activeName"
      class="el-card"
    >
      <el-tab-pane
        label="数据权限"
        name="1"
        style="padding-top: 12px; display: flex"
      >
      </el-tab-pane>
      <el-tab-pane label="已分配岗位" name="2">
        <el-button
          v-if="activeName == '2'"
          @click="handleAssignRole"
          style="margin-top: 8px"
          size="mini"
          type="primary"
          >分配岗位</el-button
        >
        <DataTable
          v-if="activeName == '2'"
          :table-columns="tableColumns"
          :operation-config="operationConfig"
          :load-data="loadData"
          ref="dataTableRef"
          style="padding: 12px 0; height: 100%"
        />
      </el-tab-pane>
      <!-- el-tabs弹窗渲染冲突的解决方案 -->
      <!-- 下半部分：左侧数据资产列表 + 右侧权限管理 -->
      <div class="content-layout" v-show="activeName == '1'">
        <!-- 左侧：数据资产列表 -->
        <div class="left-panel">
          <div class="data-asset-card" v-loading="loading.assetList">
            <div class="card-header">
              <div class="common-title-text">实体</div>
              <el-input
                v-model="assetSearchKeyword"
                size="small"
                placeholder="请输入名称或编码搜索"
                clearable
                @input="handleAssetSearch"
              >
                <i slot="prefix" class="el-input__icon el-icon-search"></i>
              </el-input>
            </div>
            <div class="asset-list">
              <div
                v-for="asset in filteredAssetList"
                :key="asset.id"
                class="asset-item"
                :class="{
                  active: selectedAsset && selectedAsset.id === asset.id,
                }"
                @click="handleAssetSelect(asset)"
              >
                <div>
                  <i class="el-icon-document" />
                  <span>{{ asset.name }}</span>
                </div>
                <el-tooltip content="已授权" v-if="asset.hasPermission">
                  <i class="el-icon-star-on" style="color: #edac19" />
                </el-tooltip>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：权限管理 -->
        <div class="right-panel">
          <div v-if="selectedAsset" v-loading="loading.permissions">
            <!-- 行数据权限 -->
            <div class="permission-card">
              <div class="table-card-header">
                <div style="margin-bottom: 12px" class="common-title-text">
                  行数据权限
                </div>
                <el-button
                  v-if="
                    entityPermPoints &&
                    entityPermPoints.rowPermPointList &&
                    entityPermPoints.rowPermPointList.length > 0
                  "
                  @click="handleAddRowPermission"
                  size="mini"
                  type="primary"
                >
                  新增
                </el-button>
              </div>
              <div class="card-content">
                <el-table :data="rowPermissions" border>
                  <el-table-column label="权限关系" width="100" align="center">
                    <template slot-scope="scope">
                      <span v-if="scope.$index > 0">或</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="数据行" min-width="200">
                    <template slot-scope="scope">
                      <div class="data-row-content">
                        <div class="condition-text">
                          {{ scope.row.displayName }}
                        </div>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column label="行操作" width="120" align="center">
                    <template slot-scope="scope">
                      <el-tag
                        :type="
                          scope.row.operationLevel === 1 ? 'info' : 'success'
                        "
                      >
                        {{
                          scope.row.operationLevel === 1 ? "仅查看" : "可修改"
                        }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="150" align="center">
                    <template slot-scope="scope">
                      <el-button
                        type="text"
                        @click="handleEditRowPermission(scope.row)"
                        >编辑</el-button
                      >
                      <el-button
                        type="text"
                        style="color: #f56c6c; margin-left: 4px"
                        @click="handleDeleteRowPermission(scope.$index)"
                        >删除</el-button
                      >
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>

            <!-- 列数据权限 -->
            <div class="permission-card">
              <div class="card-header">
                <div class="common-title-text">列数据权限</div>
              </div>
              <div class="card-content">
                <el-table
                  :data="columnPermissions"
                  border
                  v-loading="loading.columnUpdate"
                >
                  <el-table-column label="字段名称" width="150">
                    <template slot-scope="scope">
                      <div>
                        <div style="font-weight: 500">
                          {{ scope.row.fieldName }}
                        </div>
                        <div style="font-size: 12px; color: #909399">
                          {{ scope.row.fieldCode }}
                        </div>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column label="列权限">
                    <template slot-scope="scope">
                      <el-radio-group
                        v-model="scope.row.operationLevel"
                        @change="handleColumnPermissionChange(scope.row)"
                        :disabled="loading.columnUpdate"
                      >
                        <el-radio :label="3">可编辑</el-radio>
                        <el-radio :label="1">仅查看</el-radio>
                        <el-radio :label="0">无权限</el-radio>
                      </el-radio-group>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </div>
          <div v-else class="no-asset-selected">
            <el-empty
              description="请选择左侧实体查看权限详情"
              :image="noDataImg"
              class="empty-tips"
            ></el-empty>
          </div>
        </div>
      </div>
    </el-tabs>

    <!-- 行数据权限授权弹窗 -->
    <el-dialog
      title="行数据权限授权"
      :visible.sync="addRowPermissionVisible"
      width="800px"
    >
      <div class="row-permission-dialog">
        <!-- 授予全部权限按钮 -->
        <div class="grant-all-section">
          <el-button @click="handleGrantAllPermissions">授予全部权限</el-button>
        </div>

        <!-- 字段权限配置表格 -->
        <div class="field-permissions-section">
          <el-table :data="tempPermissionSelections" border>
            <el-table-column label="权限关系" width="100" align="center">
              <template slot-scope="scope">
                <span v-if="scope.$index > 0">且</span>
              </template>
            </el-table-column>
            <el-table-column label="字段名称" width="150">
              <template slot-scope="scope">
                <div style="font-weight: 500">{{ scope.row.fieldName }}</div>
              </template>
            </el-table-column>
            <el-table-column label="范围" min-width="300">
              <template slot-scope="scope">
                <div class="range-config">
                  <el-radio-group
                    :value="scope.row.selectedMethod"
                    @input="handleRangeTypeChange(scope.row, $event)"
                  >
                    <el-radio
                      v-for="method in (scope.row.rowPermControlType &&
                        scope.row.rowPermControlType.rowPermControlMethods) ||
                      []"
                      :key="method.code"
                      :label="method.code"
                    >
                      {{ method.name }}
                      <i
                        v-if="
                          method.code === 'custom' ||
                          method.code === 'appoint' ||
                          method.code === 'customize_sql_condition'
                        "
                        class="el-icon-setting setting-icon"
                        @click.stop="
                          handleOpenPermissionConfig(
                            scope.row,
                            method.code,
                            scope.row.entityField.dataType
                          )
                        "
                      >
                      </i>
                    </el-radio>
                  </el-radio-group>

                  <!-- 显示已配置的条件 -->
                  <div v-if="scope.row.config" class="range-display">
                    <span class="range-text">{{ scope.row.display }}</span>
                  </div>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 操作权限选择 -->
        <div class="operation-section">
          <div class="operation-label">操作权限（上面的行范围）</div>
          <el-radio-group v-model="operationPermission">
            <el-radio label="modify">可修改</el-radio>
            <el-radio label="read">仅查看</el-radio>
          </el-radio-group>
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="addRowPermissionVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveRowPermission"
          >确定</el-button
        >
      </div>
    </el-dialog>

    <!-- 指定范围配置弹窗 -->
    <el-dialog
      :title="`请为 ${
        (currentConfigField.entityField &&
          currentConfigField.entityField.fieldName) ||
        ''
      } 字段指定范围`"
      :visible.sync="specifiedConfigVisible"
      width="400px"
    >
      <el-select
        v-model="specifiedValues"
        multiple
        placeholder="请选择范围值"
        style="width: 100%"
        @change="handleSpecifiedValuesChange"
      >
        <el-option
          v-for="option in currentFieldOptions"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        >
        </el-option>
      </el-select>
      <div slot="footer" class="dialog-footer">
        <el-button @click="specifiedConfigVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveSpecifiedConfig"
          >确定</el-button
        >
      </div>
    </el-dialog>

    <!-- 自定义条件配置弹窗 -->
    <el-dialog
      :title="`请为 ${
        (currentConfigField.entityField &&
          currentConfigField.entityField.fieldName) ||
        ''
      } 字段设置条件`"
      :visible.sync="customConfigVisible"
      width="500px"
    >
      <div class="custom-config-form">
        <el-alert type="success" style="margin-bottom: 6px">
          <template slot="title">
            请查看<a
              href="/operate-help.pdf"
              target="_blank"
              rel="noopener noreferrer"
              >帮助文档</a
            >
          </template>
        </el-alert>
        <div class="field-type-info">
          字段类型：{{ currentConfigField.type || "text" }}
        </div>

        <el-form label-width="80px" style="margin-top: 12px">
          <el-form-item label="条件">
            <el-select
              v-model="customCondition.operator"
              placeholder="请选择条件"
            >
              <el-option
                v-for="operator in getOperatorsByFieldType(
                  currentConfigField.fieldCode
                )"
                :key="operator.code"
                :label="operator.name"
                :value="operator.code"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="条件值">
            <el-input
              v-model="customCondition.value"
              type="textarea"
              :rows="3"
              placeholder="请输入条件值，多个值用逗号分隔"
            >
            </el-input>
          </el-form-item>
          <el-form-item label="sql信息">
            <el-input
              placeholder="请输入内容"
              type="textarea"
              :value="
                currentConfigField.fieldCode +
                ' ' +
                (customCondition.operator || '') +
                ' ' +
                (customCondition.value || '')
              "
              :disabled="true"
            >
            </el-input>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button
          @click="customConfigVisible = false"
          :disabled="customConfigSaving"
          >取消</el-button
        >
        <el-button
          type="primary"
          @click="handleSaveCustomConfig"
          :loading="customConfigSaving"
        >
          {{ customConfigSaving ? "校验中..." : "确定" }}
        </el-button>
      </div>
    </el-dialog>

    <!-- 岗位分配弹窗 -->
    <el-dialog
      title="分配岗位"
      :visible.sync="dialogTableVisible"
      :width="'80vw'"
    >
      <DataTable
        height="100%"
        :table-columns="tableColumns"
        :search-config="searchConfig"
        :load-data="loadAssignRoleData"
        :labelWidth="'60px'"
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
import rolePermissionDetailMixin from "./js/role_permission_detail.js";

export default {
  name: "RolePermissionDetail",
  mixins: [rolePermissionDetailMixin],
};
</script>

<style scoped>
.role-permission-detail {
  height: calc(100vh / var(--zoom-value) - 90px);
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-sizing: border-box;
  padding: 12px;
}

.basic-info-card {
  flex: none;
  background: #fff;
  border: 1px solid #ebeef5;
  padding: 12px;
  margin: 0 !important;
  position: relative;
}

.card-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: hidden;
  padding: 8px 12px;
  background: #fff;
  font-weight: 500;
  font-size: 12px;
}

.table-card-header {
  padding: 12px;
  background: #fff;
  font-weight: 500;
  font-size: 12px;
}

.card-content {
  padding: 0 12px;
  background: #fff;
}

.content-layout {
  display: flex;
  gap: 12px;
  flex: 1;
  overflow: hidden;
  border: 1px solid #dcdcdc;
}

.left-panel {
  width: 300px;
  display: flex;
  flex-direction: column;
  height: calc(100vh / var(--zoom-value) - 320px);
}

.right-panel {
  flex: 1;
  overflow: auto;
  height: calc(100vh / var(--zoom-value) - 320px);
}

.data-asset-card {
  height: 100%;
  background: #fff;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #dcdcdc;
}

.asset-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 12px;
}

.asset-item {
  padding: 8px 12px;
  border-radius: 4px;
  margin-bottom: 4px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 4px;
  color: #181818;
  justify-content: space-between;
}

.asset-item:hover {
  background-color: #e6edff;
  border-radius: 4px;
}

.asset-item.active {
  background-color: #e6edff;
  border-radius: 4px;
  color: #0665db;
}

.permission-card {
  margin-bottom: 12px;
  background: #fff;
  border-radius: 4px;
}

.no-asset-selected {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.dialog-footer {
  text-align: right;
}

.data-row-content {
  padding: 4px 0;
}

.condition-text {
  font-size: 14px;
  color: #303133;
  line-height: 1.4;
  margin-bottom: 4px;
}

.description-text {
  font-size: 12px;
  color: #909399;
  line-height: 1.3;
}

.row-permission-dialog {
  padding: 8px 0;
}

.grant-all-section {
  margin-bottom: 12px;
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.field-permissions-section {
  margin-bottom: 12px;
}

.range-config {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 0;
}

.range-text {
  font-size: 12px;
  color: #606266;
  background-color: #f0f2f5;
  padding: 4px 8px;
  border-radius: 2px;
}

.operation-section {
  padding: 12px;
  background-color: #f9f9f9;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.operation-label {
  font-weight: 500;
  color: #606266;
  margin-bottom: 8px;
}

.custom-config-form {
  padding: 8px 0;
}

.field-type-info {
  font-size: 14px;
  color: #606266;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.setting-icon {
  margin-left: 4px;
  color: #409eff;
  cursor: pointer;
  font-size: 14px;
  transition: color 0.3s;
}

.setting-icon:hover {
  color: #66b1ff;
}
.event-name-box {
  display: flex;
  font-size: 18px;
  font-family: 500;
  align-items: center;
  color: rgba(24, 24, 24, 1);
  border-bottom: 1px solid #dcdcdc;
  padding-bottom: 12px;
  margin-bottom: 12px;
}
.event-name {
  margin: 0px 12px;
}
.event-name-line {
  width: 5px;
  height: 18px;
  margin-top: 4px;
  margin-right: 8px;
  border-radius: 6px;
  display: inline-block;
  background: rgba(6, 101, 219, 1);
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

<style>
.data-table {
  margin-top: 12px;
}
.data-table .table-card {
  width: 100%;
}
</style>
