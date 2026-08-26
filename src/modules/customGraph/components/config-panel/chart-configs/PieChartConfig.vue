<template>
  <div class="pie-chart-config">
    <!-- 基础配置 -->
    <el-form label-width="110px" size="small" class="left-aligned-form">
      <el-form-item label="显示标题">
        <el-checkbox
          class="checkbox-info"
          :disabled="readonly"
          v-model="localConfig.showTitile"
        ></el-checkbox>
      </el-form-item>
      <!-- 标题配置 -->
      <el-form-item label="组件标题">
        <el-input
          v-model="localConfig.title"
          placeholder="请输入组件顶部显示的标题"
        />
      </el-form-item>

      <!-- 图表边距配置 -->
      <el-form-item label="图左边距">
        <el-input-number
          v-model="localConfig.marginLeft"
          :min="0"
          :max="50"
          :step="1"
        />
      </el-form-item>

      <el-form-item label="图右边距">
        <el-input-number
          v-model="localConfig.marginRight"
          :min="0"
          :max="50"
          :step="1"
        />
      </el-form-item>

      <el-form-item label="图上边距">
        <el-input-number
          v-model="localConfig.marginTop"
          :min="0"
          :max="50"
          :step="1"
        />
      </el-form-item>

      <el-form-item label="图下边距">
        <el-input-number
          v-model="localConfig.marginBottom"
          :min="0"
          :max="50"
          :step="1"
        />
      </el-form-item>

      <!-- 环形图配置 -->
      <el-form-item label="是否是环状图">
        <el-checkbox v-model="localConfig.isDonut"></el-checkbox>
      </el-form-item>

      <el-form-item v-if="localConfig.isDonut" label="外环占比">
        <el-slider
          v-model="localConfig.outerRadius"
          :min="50"
          :max="100"
          :step="5"
          :format-tooltip="(value) => value + '%'"
        ></el-slider>
      </el-form-item>

      <el-form-item v-if="localConfig.isDonut" label="内环占比">
        <el-slider
          v-model="localConfig.innerRadius"
          :min="0"
          :max="90"
          :step="5"
          :format-tooltip="(value) => value + '%'"
        ></el-slider>
      </el-form-item>

      <!-- 数据源配置 -->
      <el-form-item class="data-source-config" label="数据来源">
        <template #label>
          <span>数据来源</span>
          <el-tooltip
            effect="dark"
            content="动态数据源: 从API接口获取数据; 静态数据源: 手动输入数据"
            placement="top"
          >
            <i class="el-icon-question help-icon"></i>
          </el-tooltip>
        </template>
        <div class="custom-tabs">
          <div
            class="tab-item"
            :class="{ active: localConfig.dataSourceType === 'dynamic' }"
            @click="switchDataSource('dynamic')"
          >
            动态数据源
          </div>
          <div
            class="tab-item"
            :class="{ active: localConfig.dataSourceType === 'static' }"
            @click="switchDataSource('static')"
          >
            静态数据源
          </div>
        </div>
      </el-form-item>
      <div class="data-source-content">
        <el-form-item
          label="动态数据源"
          v-if="localConfig.dataSourceType === 'dynamic'"
        >
          <el-input
            v-model="localConfig.dataUrl"
            placeholder="请输入数据源链接"
          />
        </el-form-item>

        <el-form-item
          label="静态数据源"
          v-if="localConfig.dataSourceType === 'static'"
        >
          <el-button type="primary" size="small" @click="openEditDialog">
            编辑数据
          </el-button>
        </el-form-item>
      </div>

      <!-- 保存和重置按钮 -->
      <el-form-item class="form-buttons">
        <el-button type="primary" size="small" @click="handleSave"
          >保存</el-button
        >
        <el-button size="small" @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 编辑数据弹窗 -->
    <el-dialog
      title="编辑数据"
      :visible.sync="dialogVisible"
      :before-close="handleDialogClose"
      :close-on-click-modal="false"
      append-to-body
    >
      <div class="dialog-content">
        <!-- 表格操作按钮 -->
        <div class="table-actions">
          <el-button type="primary" size="small" @click="addDataItem">
            <i class="el-icon-plus"></i>
            新增数据
          </el-button>
        </div>

        <!-- 数据表格 -->
        <el-table
          :data="tempStaticData"
          style="width: 100%"
          border
          :row-class-name="tableRowClassName"
        >
          <el-table-column
            type="index"
            label="序号"
            width="60"
            align="center"
          ></el-table-column>
          <el-table-column prop="name" label="名称">
            <template #default="{ row }">
              <el-input
                v-if="row.isEdit"
                v-model="row.name"
                placeholder="请输入名称"
                class="edit-input"
              ></el-input>
              <span v-else>{{ row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="value" label="数值">
            <template #default="{ row }">
              <el-input-number
                v-if="row.isEdit"
                v-model="row.value"
                :min="0"
                :step="1"
                size="small"
                style="width: 100%"
              ></el-input-number>
              <span v-else>{{ row.value }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="color" label="颜色">
            <template #default="{ row }">
              <el-color-picker
                v-if="row.isEdit"
                v-model="row.color"
                size="small"
              ></el-color-picker>
              <span v-else>
                <div
                  class="color-block"
                  :style="{ backgroundColor: row.color }"
                ></div>
                {{ row.color }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" align="center">
            <template #default="{ row, $index }">
              <el-button
                v-if="!row.isEdit"
                type="primary"
                size="mini"
                icon="el-icon-edit"
                circle
                @click="startEdit($index)"
              ></el-button>
              <el-button
                v-if="row.isEdit"
                type="success"
                size="mini"
                icon="el-icon-check"
                circle
                @click="confirmEdit($index)"
              ></el-button>
              <el-button
                v-if="row.isEdit"
                type="info"
                size="mini"
                icon="el-icon-close"
                circle
                @click="cancelEdit($index)"
              ></el-button>
              <el-button
                type="danger"
                size="mini"
                icon="el-icon-delete"
                circle
                @click="removeDataItem($index)"
              ></el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="handleDialogClose">取 消</el-button>
        <el-button size="small" type="primary" @click="handleDialogConfirm"
          >确 定</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "PieChartConfig",
  props: {
    item: {
      type: Object,
      required: true,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      dialogVisible: false,
      tempStaticData: [],
      localConfig: {
        title: "",
        marginLeft: 0,
        marginRight: 0,
        marginBottom: 10,
        marginTop: 0,
        showTitile: true,
        isDonut: false,
        outerRadius: 80,
        innerRadius: 60,
        dataSourceType: "dynamic",
        dataUrl: "",
        staticData: [],
      },
    };
  },
  created() {
    // 如果传入的item有配置，则使用传入的配置
    if (this.item.config) {
      this.localConfig = {
        ...this.localConfig,
        ...this.item.config,
      };
    }
  },
  methods: {
    // 切换数据源类型
    switchDataSource(type) {
      this.localConfig.dataSourceType = type;
      // 根据类型清空互斥的数据
      if (type === "dynamic") {
        this.localConfig.staticData = [];
      } else {
        this.localConfig.dataUrl = "";
      }
    },

    // 打开编辑数据对话框
    openEditDialog() {
      this.tempStaticData = JSON.parse(
        JSON.stringify(this.localConfig.staticData)
      );
      this.dialogVisible = true;
    },

    // 处理对话框关闭
    handleDialogClose() {
      this.dialogVisible = false;
    },

    // 处理对话框确认
    handleDialogConfirm() {
      this.dialogVisible = false;
    },

    // 添加数据项
    addDataItem() {
      const newItem = {
        name: `类别${this.tempStaticData.length + 1}`,
        value: 0,
        isEdit: true, // 新增数据默认进入编辑状态
        color: this.getRandomColor(),
      };
      // 确保其他行退出编辑状态
      this.tempStaticData.forEach((item) => {
        item.isEdit = false;
      });
      this.tempStaticData.push(newItem);
    },

    // 开始编辑行
    startEdit(index) {
      // 先取消所有行的编辑状态
      this.tempStaticData.forEach((item) => {
        item.isEdit = false;
      });
      // 设置当前行编辑状态
      this.$set(this.tempStaticData, index, {
        ...this.tempStaticData[index],
        isEdit: true,
      });
    },

    // 确认编辑
    confirmEdit(index) {
      this.$set(this.tempStaticData, index, {
        ...this.tempStaticData[index],
        isEdit: false,
      });
    },

    // 取消编辑
    cancelEdit(index) {
      this.$set(this.tempStaticData, index, {
        ...this.tempStaticData[index],
        isEdit: false,
      });
    },

    // 移除数据项
    removeDataItem(index) {
      this.$confirm("确认删除该数据项？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.tempStaticData.splice(index, 1);
        })
        .catch(() => {});
    },

    // 获取随机颜色
    getRandomColor() {
      const colors = ["#409EFF", "#67C23A", "#E6A23C", "#F56C6C", "#909399"];
      return colors[Math.floor(Math.random() * colors.length)];
    },

    // 表格行的类名
    tableRowClassName({ row }) {
      return row.isEdit ? "editing-row" : "";
    },

    // 保存配置
    handleSave() {
      // 验证数据
      if (
        this.localConfig.dataSourceType === "dynamic" &&
        !this.localConfig.dataUrl
      ) {
        this.$message.error("请填写动态数据源URL");
        return;
      }

      if (
        this.localConfig.dataSourceType === "static" &&
        this.tempStaticData.length === 0 &&
        this.localConfig.staticData.length === 0
      ) {
        this.$message.error("请添加静态数据");
        return;
      }
      if (this.tempStaticData.length > 0) {
        // 更新静态数据，确保颜色数据正确传递
        this.localConfig.staticData = this.tempStaticData.map((item) => ({
          name: item.name,
          value: item.value,
          color: item.color,
          itemStyle: {
            color: item.color,
          },
        }));
      }

      // 构建数据源配置
      const dataSource = {
        type: this.localConfig.dataSourceType,
        url:
          this.localConfig.dataSourceType === "dynamic"
            ? this.localConfig.dataUrl
            : "",
        data:
          this.localConfig.dataSourceType === "static"
            ? this.localConfig.staticData
            : [],
      };

      // 构建完整配置
      const configToSave = {
        ...this.localConfig,
        dataSource,
      };

      // 发送配置更新事件
      this.$emit("update", configToSave, true);

      // 发送数据源变化事件
      this.$bus.emit("data-source-change", {
        componentId: this.item.id,
        dataSource: dataSource,
      });

      // 发送配置保存事件
      this.$bus.emit("chart-config-saved", {
        id: this.item.id,
        config: configToSave,
      });
      console.log("1111", configToSave);
      this.$message.success("配置已保存");
    },

    // 重置配置
    handleReset() {
      this.$confirm("确认重置所有配置？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          // 重置为初始配置，只保留默认值
          this.localConfig = {
            title: "",
            marginLeft: 0,
            marginRight: 0,
            marginBottom: 10,
            marginTop: 0,
            showTitile: true,
            isDonut: false,
            outerRadius: 80,
            innerRadius: 60,
            dataSourceType: "dynamic",
            dataUrl: "",
            staticData: [],
          };

          // 重置临时数据
          this.tempStaticData = [];

          // 触发数据源变化事件
          this.$bus.emit("data-source-change", {
            componentId: this.item.id,
            dataSource: {
              type: "dynamic",
              url: "",
              data: [],
            },
          });

          this.$message.success("已重置");
        })
        .catch(() => {});
    },
  },
};
</script>
<style>
.pie-chart-config .el-icon-edit,
.pie-chart-config .el-icon-delete {
  color: #fff !important;
}
</style>
<style lang="less" scoped>
.checkbox-info {
  line-height: 32px;
}
/deep/ .el-form-item__content {
  .el-checkbox {
    vertical-align: sub;
  }
}
/deep/ .el-dialog__body {
  padding: 20px 30px 20px;
  .item-actions,
  .cell {
    text-align: center;
  }
  .el-input__inner {
    height: 35px;
    line-height: 35px;
  }
  th {
    padding: 5px 0 !important;
  }
  td {
    padding: 10px 0 !important;
  }
  .el-button + .el-button {
    margin-left: 8px;
  }
}
.pie-chart-config {
  padding: 10px;

  .left-aligned-form {
    .el-form-item {
      // height: 30px;
    }
  }

  .data-source-config {
    margin-bottom: 2px !important;

    /deep/ .el-form-item__label {
      display: flex;
      align-items: center;
      gap: 4px;
      justify-content: right;
      .help-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 1px solid #c0c4cc;
        color: #c0c4cc;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          border-color: #409eff;
          color: #409eff;
        }
      }
    }
  }

  .custom-tabs {
    display: flex;
    width: 100%;
    justify-content: space-between;
    margin-bottom: 15px;

    .tab-item {
      width: 50%;
      padding: 0px 6px;
      font-size: 13px;
      color: #606266;
      background-color: #f5f7fa;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 32px;
      transition: all 0.3s;
      white-space: nowrap;

      &:first-child {
        border-radius: 4px 0 0 4px;
      }
      &:last-child {
        border-radius: 0 4px 4px 0;
      }

      &.active {
        background-color: #ffffff;
        color: #409eff;
        border: 1px solid #e4e7ed;
        border-radius: 4px;
      }
    }
  }

  .data-source-content {
    width: 100%;
    margin-bottom: 3px;

    .el-input {
      width: 100%;
      height: 35px;
      margin-left: auto;
    }
  }

  .form-buttons {
    margin-top: 20px;
    display: flex;
    justify-content: flex-start;

    .el-button {
      margin-right: 10px;
    }
  }

  .dialog-content {
    .table-actions {
      margin-bottom: 16px;
    }

    .color-block {
      display: inline-block;
      width: 16px;
      height: 16px;
      margin-right: 8px;
      vertical-align: middle;
      border-radius: 2px;
    }

    .edit-input {
      width: 100%;
    }
  }
}

// 编辑行样式
:deep(.editing-row) {
  background-color: #ecf5ff !important;
}

// 确保颜色选择器在表格中正确显示
:deep(.el-color-picker__trigger) {
  border: none;
  padding: 0;
}
</style>
