<template>
  <div class="bar-chart-config">
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

      <!-- 柱宽配置 -->
      <el-form-item label="柱宽">
        <el-input-number
          v-model="localConfig.barWidth"
          :min="1"
          :max="50"
          :step="1"
        />
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
        <el-input
          type="textarea"
          v-model="tempStaticDataStr"
          :rows="16"
          resize="none"
          :placeholder="editDataTip"
          class="data-input"
        ></el-input>
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
  name: "BarChartConfig",
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
      tempStaticDataStr: "",
      editDataTip: `示例：
      {
    "yAxis": {
        "name": "销售额"
    },
    "xAxis": {
        "data": [
            "1月",
            "2月",
            "3月",
            "4月",
            "5月",
            "6月"
        ]
    },
    "legend": {
        "data": [
            "直接访问",
            "邮件营销",
            "联盟广告"
        ]
    },
    "series": [
        {
            "data": [
                100,
                110,
                120,
                130,
                140,
                150
            ],
            "color": "#409EFF",
            "name": "直接访问"
        },
        {
            "data": [
                80,
                100,
                90,
                100,
                100,
                130
            ],
            "color": "#67C23A",
            "name": "邮件营销"
        },
        {
            "data": [
                500,
                510,
                515,
                525,
                530,
                550
            ],
            "color": "#E6A23C",
            "name": "联盟广告"
        }
    ],
    "title": {
        "text": "销售趋势"
    }
}`,
      localConfig: {
        title: "",
        showTitile: true,
        marginLeft: 30,
        marginRight: 30,
        marginBottom: 30,
        marginTop: 50,
        barWidth: 20,
        dataSourceType: "dynamic",
        dataUrl: "",
        tempStaticDataStr: "",
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
        this.localConfig.tempStaticDataStr = null;
      } else {
        this.localConfig.dataUrl = "";
        // 如果没有静态数据，使用默认数据
        if (!this.localConfig.tempStaticDataStr) {
          this.localConfig.tempStaticDataStr =
            this.$data.localConfig.tempStaticDataStr;
        }
      }
      // 触发数据源变化事件
      this.$bus.emit("data-source-change", {
        componentId: this.item.id,
      });
    },

    // 打开编辑数据对话框
    openEditDialog() {
      try {
        // 将静态数据转换为格式化的JSON字符串
        if (
          this.localConfig.tempStaticDataStr ||
          this.$data.localConfig.tempStaticDataStr
        ) {
          this.tempStaticDataStr = JSON.stringify(
            this.localConfig.tempStaticDataStr ||
              this.$data.localConfig.tempStaticDataStr,
            null,
            2
          );
        }
      } catch (error) {
        this.tempStaticDataStr = "";
        console.error("数据格式化错误:", error);
      }
      this.dialogVisible = true;
    },

    // 处理对话框关闭
    handleDialogClose() {
      this.dialogVisible = false;
      // 重置临时数据
      this.tempStaticDataStr = "";
    },

    // 处理对话框确认
    handleDialogConfirm() {
      try {
        // 尝试解析JSON字符串
        const parsedData = JSON.parse(this.tempStaticDataStr);
        // 更新配置中的静态数据
        this.localConfig.tempStaticDataStr = parsedData;
        this.dialogVisible = false;
        // 触发数据源变化事件
        this.$bus.emit("data-source-change", {
          componentId: this.item.id,
        });
      } catch (error) {
        this.$message.error("JSON格式错误，请检查输入");
      }
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
        (!this.localConfig.tempStaticDataStr ||
          !this.localConfig.tempStaticDataStr.series)
      ) {
        this.$message.error("请编辑静态数据");
        return;
      }

      // 构建完整配置
      const configToSave = {
        ...this.localConfig,
      };

      // 发送配置更新事件
      this.$emit("update", configToSave, true);

      // 发送数据源变化事件
      this.$bus.emit("data-source-change", {
        componentId: this.item.id,
      });

      // 发送配置保存事件
      this.$bus.emit("chart-config-saved", {
        id: this.item.id,
        config: configToSave,
      });

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
            marginLeft: 30,
            marginRight: 30,
            marginBottom: 30,
            marginTop: 50,
            barWidth: 20,
            showTitile: true,
            dataSourceType: "dynamic",
            dataUrl: "",
            tempStaticDataStr: "",
          };
          this.$message.success("已重置");
          // 触发数据源变化事件
          this.$bus.emit("data-source-change", {
            componentId: this.item.id,
          });
        })
        .catch(() => {});
    },
  },
};
</script>

<style lang="less" scoped>
.checkbox-info {
  line-height: 32px;
}
.bar-chart-config {
  padding: 10px;

  .left-aligned-form {
    .el-form-item {
      margin-bottom: 18px;
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
    .data-input {
      height: 400px;

      /deep/.el-textarea__inner {
        height: 400px !important;
        font-family: monospace;
        font-size: 14px;
        line-height: 1.5;
      }
    }
  }
}
</style>
