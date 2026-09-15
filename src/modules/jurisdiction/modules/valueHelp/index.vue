<template>
  <div class="el-card value-help">
    <div class="value-help-container">
      <!-- 表格区域 -->
      <DataTable
        ref="tableRef"
        :search-config="searchConfig"
        :table-columns="tableColumns"
        :operation-config="operationConfig"
        :load-data="loadTableData"
        :toolbarButtons="toolbarButtons"
        :queryFormId="'value-help-list'"
      />
      <!-- 新建/修改弹窗 -->
      <el-dialog
        width="80vw"
        height="500px"
        :title="dialogTitle"
        :visible.sync="dialogVisible"
        :destroy-on-close="true"
        :close-on-click-modal="false"
        @close="handleDialogClose"
      >
        <div class="eidt-container">
          <div v-if="!!isDisabled">
            <el-alert type="warning" :closeable="fasle"
              >当前属性值已被使用，部分参数不允许修改</el-alert
            >
          </div>
          <el-form
            ref="dialogFormRef"
            label-position="top"
            :rules="rules"
            :model="currentRow"
          >
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="名称" prop="compName">
                  <el-input
                    v-model="currentRow.compName"
                    placeholder="请输入"
                    size="small"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="编码" prop="compCode">
                  <el-input
                    :disabled="dialogType === 'edit'"
                    v-model="currentRow.compCode"
                    placeholder="请输入"
                    size="small"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="数据来源" prop="dataSource">
              <el-radio-group
                v-model="currentRow.dataSource"
                :disabled="!!isDisabled"
                size="small"
              >
                <el-radio label="URL">URL</el-radio>
                <el-radio label="DICT">字典</el-radio>
              </el-radio-group>
            </el-form-item>
            <div v-if="currentRow.dataSource === 'URL'">
              <el-form-item label="URL地址" prop="dataUrl">
                <el-input
                  v-model="currentRow.dataUrl"
                  placeholder="请输入"
                  :disabled="!!isDisabled"
                  size="small"
                />
              </el-form-item>
              <el-row gutter="20">
                <el-col :span="8">
                  <el-form-item label="请求方式" prop="requestType">
                    <el-select
                      style="width: 100%;"
                      v-model="currentRow.requestType"
                      placeholder="请选择"
                      :disabled="!!isDisabled"
                      size="small"
                    >
                      <el-option key="GET" label="GET" value="GET"></el-option>
                      <el-option
                        key="POST"
                        label="POST"
                        value="POST"
                      ></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="16">
                  <el-form-item label="请求参数" prop="requestParams">
                    <el-input
                      v-model="currentRow.requestParams"
                      :disabled="!!isDisabled"
                      size="small"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <div class="test-btn">
                <div class="return-label">返回结构</div>
                <el-button :disabled="!!isDisabled" @click="handleTest"
                  >测试</el-button
                >
              </div>
              <div class="return-container">
                <MyJson v-model="returnContextData" :readonly="true" />
                <!-- <div class="return-json" v-if="returnContextData" v-highlightjs> 
                <pre ><code class="json">{{ returnContextData ||'{}' }}</code></pre>
              </div> -->
                <!-- <el-input 
                v-else
                type="textarea" 
                placeholder="单击【测试】自动返回结构"
                :disabled="true" 
              /> -->
              </div>
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="显示值" prop="viewContent">
                    <el-cascader
                      style="width: 100%;"
                      v-model="currentRow.viewContent"
                      :options="viewContentData"
                      :show-all-levels="false"
                      :disabled="!!isDisabled"
                      size="small"
                    >
                    </el-cascader>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="返回值" prop="saveContent">
                    <el-cascader
                      style="width: 100%;"
                      v-model="currentRow.saveContent"
                      :options="viewContentData"
                      :show-all-levels="false"
                      :disabled="!!isDisabled"
                      size="small"
                    >
                    </el-cascader>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
            <el-form-item v-else label="字典类型" prop="dictCode">
              <el-cascader
                v-model="currentRow.dictCode"
                :props="cascaderProps"
                :options="dictionaryTypeData"
                :show-all-levels="false"
                :disabled="!!isDisabled"
                size="small"
              >
              </el-cascader>

              <!-- <el-select v-model="currentRow.dictCode" placeholder="请选择">
              <el-option
                v-for="item in dictionaryTypeData" 
                :key="item.dictCode"
                :label="item.dictName"
                :value="item.dictCode"
              />
            </el-select> -->
            </el-form-item>
          </el-form>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button @click="handleDialogClose">取消</el-button>
          <el-button
            type="primary"
            @click="handleDialogConfirm"
            :loading="dialogBtnLoading"
            >确定</el-button
          >
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import valueHelpMixin from "./js/value_help.js";

export default {
  name: "ValueHelp",
  mixins: [valueHelpMixin]
};
</script>

<style scoped>
.search-form-container {
  display: flex;
  align-items: end;
  justify-content: space-between;
}

.test-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.value-help-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}


.return-json {
  flex: 1;
}

pre code {
  background: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  display: block;
  overflow: auto;
  max-height: 300px;
}

.value-help {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  height: calc(100vh / var(--zoom-value) - 138px);
}

.page-header {
  flex: none;
  background: #fff;
  border-radius: 4px;
  border: 1px solid #ebeef5;
  padding: 12px;
}

.page-header h3 {
  margin: 0;
  color: #303133;
  font-size: 18px;
  font-weight: 500;
}

.search-card {
  flex: none;
  background: #fff;
  border-radius: 4px;
  padding: 12px 12px 0px 12px;
  margin-bottom: 12px;
}

.search-form {
  margin: 0;
}

.table-card {
  flex: 1;
  background: #fff;
  border-radius: 4px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  border-radius: 4px;
}

.table-toolbar {
  margin-bottom: 12px;
}

.pagination-wrapper {
  margin-top: 12px;
  text-align: right;
}

.dialog-content {
  padding: 20px 0;
  text-align: center;
  color: #909399;
}

.dialog-footer {
  text-align: right;
}
.filter-fields {
  display: flex;
  gap: 12px;
}
:deep(.el-table__cell) {
  padding: 0 !important;
}
</style>
