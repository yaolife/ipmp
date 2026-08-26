<template>
  <div class="role-permission-detail  cud-commom-form-style">
    <div class="el-card" style="margin:0 !important;height: 60px;overflow: hidden;">
      <!-- 工号查询 -->
      <div class="job-number-search cud-query-form cud-commom-form-search ">
        <queryForm
          :queryFields="queryFields"
          @submit="handleJobNumberSearch"
          @reset="resetJobNumberSearch"
          :labelWidth="'80px'"
          ref="form"
          class="cud-commom-form-search"
          :queryFormId="'user-data-permission'"
        />
      </div>
    </div>

    <!-- 下半部分：左侧数据资产列表 + 右侧权限管理 -->
    <div style="position:relative">
      <div class="el-card mask" v-if="!roleInfo.userName">
        <div>请先输入用户工号，进行数据权限查询</div>
      </div>
      <!-- 基础属性区域 -->
      <div class="el-card basic-info-card" v-loading="loading.roleInfo">
        <div class="common-title-text">基础信息</div>
        <el-row style="margin-top:8px;">
          <el-col :span="6">
            <label class="title">用户姓名：</label
            >{{ roleInfo.userName || "-" }}
          </el-col>
          <el-col :span="6">
            <label class="title">工号：</label>{{ roleInfo.userId || "-" }}
          </el-col>
          <el-col :span="12">
            <label class="title"> 已分配角色：</label>{{ roleInfo.desc || "-" }}
          </el-col>
        </el-row>
      </div>
      <div class="content-layout">
        <!-- 左侧：数据资产列表 -->
        <div class="el-card left-panel">
          <div class="data-asset-card" v-loading="loading.assetList">
            <div class="card-header">
              <div class="common-title-text">可控权实体列表</div>
              <el-input
                v-model="assetSearchKeyword"
                size="small"
                placeholder="请输入名称或编码搜索"
                style="width: 100%;"
                clearable
                @input="handleAssetSearch"
              >
                <i slot="prefix" class="el-input__icon el-icon-search"></i>
              </el-input>
            </div>
            <div class="asset-list">
              <div
                v-for="asset in filteredAssetList"
                :key="asset.code"
                class="asset-item"
                :class="{
                  active: selectedAsset && selectedAsset.code === asset.code
                }"
                @click="handleAssetSelect(asset)"
              >
                <!-- <i class="el-icon-document"></i> -->
                <span>{{ asset.name }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：权限管理 -->
        <div class="el-card right-panel">
          <div v-if="selectedAsset" v-loading="loading.permissions">
            <!-- 行数据权限 -->
            <div class="permission-card">
              <div class="table-card-header">
                <div class="common-title-text">行数据权限</div>
              </div>
              <div class="card-content">
                <el-table :data="rowPermissions" border stripe>
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
                        >查看</el-button
                      >
                      <!-- <el-button type="text" @click="handleEditRowPermission(scope.row)">编辑</el-button> -->
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
                  stripe
                  v-loading="loading.columnUpdate"
                >
                  <el-table-column label="字段名称" width="150">
                    <template slot-scope="scope">
                      <div>
                        <div style="font-weight: 500;">
                          {{ scope.row.fieldName }}
                        </div>
                        <div style="font-size: 12px; color: #909399;">
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
                        :disabled="true"
                      >
                        <!-- :disabled="loading.columnUpdate" -->
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
              class="empty-tips"
              :image="noDataImg"
            ></el-empty>
          </div>
        </div>
      </div>
    </div>

    <!-- 行数据权限授权弹窗 -->
    <el-dialog
      title="行数据权限授权"
      :visible.sync="addRowPermissionVisible"
      width="800px"
    >
      <div class="row-permission-dialog">
        <!-- 授予全部权限按钮 -->
        <!-- <div class="grant-all-section">
          <el-button type="primary" @click="handleGrantAllPermissions">授予全部权限</el-button>
        </div> -->

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
                <div style="font-weight: 500;">{{ scope.row.fieldName }}</div>
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
                      :disabled="true"
                    >
                      {{ method.name }}
                      <!-- <i v-if="(method.code === 'custom' || method.code === 'appoint')"
                        class="el-icon-setting setting-icon"
                        @click.stop="handleOpenPermissionConfig(scope.row, method.code,scope.row.entityField.dataType)">
                      </i> -->
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
          <el-radio-group v-model="operationPermission" :disabled="true">
            <el-radio label="modify">可修改</el-radio>
            <el-radio label="read">仅查看</el-radio>
          </el-radio-group>
        </div>
      </div>
    </el-dialog>

    <!-- 指定范围配置弹窗 -->
    <el-dialog
      :title="
        `请为 ${(currentConfigField.entityField &&
          currentConfigField.entityField.fieldName) ||
          ''} 字段指定范围`
      "
      :visible.sync="specifiedConfigVisible"
      width="400px"
    >
      <el-select
        v-model="specifiedValues"
        multiple
        placeholder="请选择范围值"
        style="width: 100%;"
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
      :title="
        `请为 ${(currentConfigField.entityField &&
          currentConfigField.entityField.fieldName) ||
          ''} 字段设置条件`
      "
      :visible.sync="customConfigVisible"
      width="500px"
    >
      <div class="custom-config-form">
        <div class="field-type-info">
          字段类型：{{ currentConfigField.type || "text" }}
        </div>

        <el-form label-width="80px" style="margin-top: 12px;">
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
  </div>
</template>

<script>
import userDataPermissionMixin from "./js/user_data_permission";

export default {
  name: "RolePermissionDetail",
  mixins: [userDataPermissionMixin]
};
</script>

<style scoped>
.job-number-box {
  display: flex;
  flex-direction: column;
  row-gap: 6px;
}
.role-permission-detail {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.job-number-search {
  padding: 12px 12px 0 12px;
}

.mask {
  position: absolute;
  z-index: 10;
  background: rgba(255,255,255,0.7);
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin:0 !important;
}
.basic-info-card {
  flex: none;
  padding: 12px;
  margin: 0 0 12px 0 !important;
}

.card-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: hidden;
  padding: 12px 12px;
  border-bottom: 1px solid #ebeef5;
  font-weight: 500;
  font-size: 12px;
  border: none;
}

.table-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  font-weight: 500;
  font-size: 12px;
  border: none;
}

.card-content {
  padding: 0 12px;
  border: none;
}

.content-layout {
  height: calc(100vh / var(--zoom-value) - 276px);
  gap: 12px;
  display: flex;
  overflow: hidden;
}

.left-panel {
  width: 300px;
  display: flex;
  flex-direction: column;
  margin: 0 !important;
}

.right-panel {
  flex: 1;
  overflow: auto;
  margin: 0 !important;
}

.data-asset-card {
  height: 100%;
  border: 1px solid #ebeef5;
  display: flex;
  flex-direction: column;
}

.asset-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 12px;
}

.asset-item {
  padding: 8px 12px;
  /* border: 1px solid #ebeef5; */
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.asset-item:hover {
  background-color: #e6edff;
}

.asset-item.active {
  background-color: #e6edff;
  color: #0665db;
  /* border-color: #409eff; */
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
}

.range-display {
  margin-top: 4px;
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

.title {
  font-weight: 600;
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
