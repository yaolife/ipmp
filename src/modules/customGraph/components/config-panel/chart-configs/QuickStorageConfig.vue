<template>
  <div class="quick-storage-config">
    <h3>快捷入库组件配置</h3>
    <el-tabs type="border-card">
      <!-- 基本配置 -->
      <el-tab-pane label="基本配置">
        <el-form label-position="top">
          <el-form-item label="组件标题">
            <el-input
              v-model="config.title"
              placeholder="例如：快捷入库"
            ></el-input>
          </el-form-item>

          <el-form-item label="布局方式">
            <el-select v-model="config.layout" placeholder="请选择布局方式">
              <el-option label="垂直" value="vertical"></el-option>
              <el-option label="水平" value="horizontal"></el-option>
              <el-option label="网格" value="grid"></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="主题">
            <el-select v-model="config.theme" placeholder="请选择主题">
              <el-option label="浅色" value="light"></el-option>
              <el-option label="深色" value="dark"></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="提交按钮文本">
            <el-input
              v-model="config.submitButtonText"
              placeholder="例如：提交入库"
            ></el-input>
          </el-form-item>

          <el-form-item label="显示重置按钮">
            <el-switch v-model="config.showReset"></el-switch>
          </el-form-item>

          <el-form-item label="重置按钮文本" v-if="config.showReset">
            <el-input
              v-model="config.resetButtonText"
              placeholder="例如：重置"
            ></el-input>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 表单字段配置 -->
      <el-tab-pane label="表单字段">
        <el-button @click="addField" type="primary">添加字段</el-button>
        <el-table :data="config.fields" border style="width: 100%">
          <el-table-column
            prop="label"
            label="字段标签"
            width="180"
          ></el-table-column>
          <el-table-column
            prop="name"
            label="字段名称"
            width="120"
          ></el-table-column>
          <el-table-column prop="type" label="字段类型" width="120">
            <template #default="{ row }">
              <el-tag>{{ row.type }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="required" label="必填" width="80">
            <template #default="{ row }">
              <el-switch v-model="row.required" disabled></el-switch>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template #default="{ row, $index }">
              <el-button size="mini" @click="editField(row, $index)"
                >编辑</el-button
              >
              <el-button size="mini" type="danger" @click="removeField($index)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 操作按钮配置 -->
      <el-tab-pane label="操作按钮">
        <el-form label-position="top">
          <el-form-item label="显示扫码功能">
            <el-switch v-model="config.showScanCode"></el-switch>
          </el-form-item>

          <el-form-item label="显示批量导入">
            <el-switch v-model="config.showBatchImport"></el-switch>
          </el-form-item>

          <el-form-item label="额外操作按钮">
            <el-button @click="addAction" type="primary"
              >添加操作按钮</el-button
            >
            <el-table :data="config.actions" border style="width: 100%">
              <el-table-column
                prop="text"
                label="按钮文本"
                width="180"
              ></el-table-column>
              <el-table-column prop="type" label="按钮类型" width="120">
                <template #default="{ row }">
                  <el-tag :type="row.type">{{ row.type }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column
                prop="icon"
                label="图标"
                width="120"
              ></el-table-column>
              <el-table-column label="操作">
                <template #default="{ row, $index }">
                  <el-button size="mini" @click="editAction(row, $index)"
                    >编辑</el-button
                  >
                  <el-button
                    size="mini"
                    type="danger"
                    @click="removeAction($index)"
                    >删除</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 入库流程配置 -->
      <el-tab-pane label="入库流程">
        <el-form label-position="top">
          <el-form-item label="默认仓库">
            <el-select
              v-model="config.storage.warehouseId"
              placeholder="请选择默认仓库"
            >
              <el-option label="主仓库" value="main"></el-option>
              <el-option label="临时仓库" value="temp"></el-option>
              <el-option label="成品仓库" value="finished"></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="必须选择库位">
            <el-switch v-model="config.storage.locationRequired"></el-switch>
          </el-form-item>

          <el-form-item label="必须输入批次号">
            <el-switch v-model="config.storage.batchRequired"></el-switch>
          </el-form-item>

          <el-form-item label="自动生成批次号">
            <el-switch v-model="config.storage.autoGenerateBatch"></el-switch>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 验证和提示 -->
      <el-tab-pane label="验证和提示">
        <el-form label-position="top">
          <el-form-item label="启用自动完成">
            <el-switch v-model="config.autoComplete"></el-switch>
          </el-form-item>

          <el-form-item label="字段变化时验证">
            <el-switch v-model="config.validateOnChange"></el-switch>
          </el-form-item>

          <el-form-item label="提交时确认">
            <el-switch v-model="config.submitConfirm"></el-switch>
          </el-form-item>

          <el-form-item label="确认提示文本" v-if="config.submitConfirm">
            <el-input
              v-model="config.confirmMessage"
              placeholder="例如：确认提交入库？"
            ></el-input>
          </el-form-item>

          <el-form-item label="成功提示文本">
            <el-input
              v-model="config.successMessage"
              placeholder="例如：入库成功"
            ></el-input>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
export default {
  name: "QuickStorageConfig",
  props: {
    value: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      config: {
        title: "快捷入库",
        theme: "light",
        layout: "vertical",
        submitButtonText: "提交入库",
        showReset: true,
        resetButtonText: "重置",
        showScanCode: true,
        showBatchImport: true,
        autoComplete: true,
        validateOnChange: false,
        submitConfirm: true,
        confirmMessage: "确认提交入库？",
        successMessage: "入库成功",
        storage: {
          warehouseId: "main",
          locationRequired: true,
          batchRequired: false,
          autoGenerateBatch: true,
        },
        fields: [
          {
            label: "物品名称",
            name: "itemName",
            type: "input",
            required: true,
            placeholder: "请输入物品名称",
            rules: [
              { required: true, message: "请输入物品名称" },
              { min: 2, max: 20, message: "长度在 2 到 20 个字符" },
            ],
            defaultValue: "",
            disabled: false,
          },
          {
            label: "数量",
            name: "quantity",
            type: "number",
            min: 1,
            max: 9999,
            step: 1,
            precision: 0,
            controls: true,
          },
        ],
        actions: [
          {
            text: "扫码录入",
            type: "primary",
            icon: "el-icon-camera",
          },
        ],
      },
    };
  },
  watch: {
    value: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.config = { ...this.defaultConfig, ...newVal };
        }
      },
    },
    config: {
      deep: true,
      handler(newVal) {
        this.$emit("input", newVal);
      },
    },
  },
  methods: {
    addField() {
      this.config.fields.push({
        label: "",
        name: "",
        type: "input",
        required: false,
        placeholder: "",
        rules: [],
        defaultValue: "",
        disabled: false,
      });
    },
    editField(row) {
      // 实际项目中这里应该打开一个对话框进行详细编辑
      this.$message.info(`编辑字段: ${row.label}`);
    },
    removeField(index) {
      this.config.fields.splice(index, 1);
    },
    addAction() {
      this.config.actions.push({
        text: "",
        type: "primary",
        icon: "",
      });
    },
    editAction(row) {
      // 实际项目中这里应该打开一个对话框进行详细编辑
      this.$message.info(`编辑操作按钮: ${row.text}`);
    },
    removeAction(index) {
      this.config.actions.splice(index, 1);
    },
  },
};
</script>

<style lang="less" scoped>
.quick-storage-config {
  padding: 20px;
}
</style>
