<template>
  <div class="metric-card-config">
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
      <el-form-item label="指标名称">
        <el-input v-model="localConfig.title" placeholder="请输入指标名称" />
      </el-form-item>

      <!-- 指标值字体大小 -->
      <el-form-item label="值字体">
        <el-input-number
          v-model="localConfig.valueFontSize"
          :min="16"
          :max="48"
          :step="1"
        />
      </el-form-item>

      <!-- 指标值字体颜色 -->
      <el-form-item label="值颜色">
        <el-color-picker v-model="localConfig.valueColor" />
      </el-form-item>

      <!-- 指标名称字体大小 -->
      <el-form-item label="名称字体">
        <el-input-number
          v-model="localConfig.titleFontSize"
          :min="12"
          :max="24"
          :step="1"
        />
      </el-form-item>

      <!-- 指标名称颜色配置 -->
      <el-form-item label="名称颜色">
        <el-color-picker v-model="localConfig.titleColor" />
      </el-form-item>

      <!-- 是否使用图标 -->
      <el-form-item label="显示图标">
        <el-checkbox v-model="localConfig.showIcon"></el-checkbox>
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

        <div class="static-data" v-if="localConfig.dataSourceType === 'static'">
          <div class="config-header">
            <span class="label">静态指标配置</span>
            <div class="action-buttons">
              <el-button
                type="primary"
                size="small"
                icon="el-icon-plus"
                class="add-button"
                @click="addStaticDataItem"
              ></el-button>
            </div>
          </div>
          <!-- 静态数据列表 -->
          <div
            v-for="(item, index) in staticDataItems"
            :key="index"
            class="static-data-box"
          >
            <div class="box-header">
              <span class="box-title">指标 {{ index + 1 }}</span>
            </div>
            <div class="config-row">
              <span class="label">指标名称</span>
              <el-input v-model="item.valueName" placeholder="请输入指标名称" />
            </div>
            <div class="config-row">
              <span class="label">指标值</span>
              <el-input-number
                v-model="item.value"
                :min="0"
                :max="9999999"
                :step="1"
              />
              <!-- <el-input v-model.number="item.value" type="number" placeholder="请输入指标值" /> -->
            </div>
            <div class="config-row image-row">
              <span class="label">图片</span>
              <div class="image-content-wrapper">
                <div class="image-upload-container">
                  <div class="image-preview-wrapper" v-if="item.imageUrl">
                    <el-upload
                      class="image-uploader"
                      :action="''"
                      :show-file-list="false"
                      :http-request="
                        (options) => handleCustomUpload(options, index)
                      "
                      :before-upload="beforeUpload"
                      :disabled="readonly"
                    >
                      <div class="image-preview">
                        <img :src="item.imageUrl" alt="图片预览" />
                        <div class="image-hover-mask">
                          <i class="el-icon-plus"></i>
                          <span>点击更换图片</span>
                        </div>
                      </div>
                    </el-upload>
                    <div class="image-actions">
                      <el-button
                        type="danger"
                        size="mini"
                        icon="el-icon-delete"
                        circle
                        @click="removeImage(index)"
                        :disabled="readonly"
                      ></el-button>
                    </div>
                  </div>
                  <el-upload
                    v-else
                    class="image-uploader"
                    :action="''"
                    :show-file-list="false"
                    :http-request="
                      (options) => handleCustomUpload(options, index)
                    "
                    :before-upload="beforeUpload"
                    :disabled="readonly"
                  >
                    <div
                      class="upload-placeholder"
                      :class="{ disabled: readonly }"
                    >
                      <i class="el-icon-plus"></i>
                      <span>上传图片</span>
                    </div>
                  </el-upload>
                </div>
                <div class="item-actions">
                  <el-button
                    size="small"
                    icon="el-icon-top"
                    @click="moveItemUp(index)"
                    :disabled="index === 0"
                  ></el-button>
                  <el-button
                    size="small"
                    icon="el-icon-bottom"
                    @click="moveItemDown(index)"
                    :disabled="index === staticDataItems.length - 1"
                  ></el-button>
                  <el-button
                    size="small"
                    type="danger"
                    icon="el-icon-delete"
                    @click="deleteItem(index)"
                    :disabled="staticDataItems.length <= 1"
                  ></el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 保存和重置按钮 -->
      <el-form-item class="form-buttons">
        <el-button type="primary" size="small" @click="handleSave"
          >保存</el-button
        >
        <el-button size="small" @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import upload from "@/mixins/upload";
export default {
  name: "MetricCardConfig",
  props: {
    item: {
      type: Object,
      required: true,
    },
    config: {
      type: Object,
      default: () => ({}),
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  },
  mixins: [upload],
  data() {
    return {
      localConfig: {
        title: "",
        titleFontSize: 16,
        titleColor: "#606266",
        valueFontSize: 36,
        showTitile: true,
        valueColor: "#409EFF",
        showIcon: true, // 默认勾选显示图标
        dataSourceType: "dynamic", // 默认数据源改为动态
        dataUrl: "",
      },
      staticDataItems: [],
    };
  },
  created() {
    // 初始化配置
    this.initConfig();
  },
  methods: {
    initConfig() {
      if (this.config) {
        // 合并配置
        this.localConfig = { ...this.localConfig, ...this.config };

        // 处理静态数据项
        if (this.config.staticData) {
          // 如果原配置是单个对象，转换为数组
          if (!Array.isArray(this.config.staticData)) {
            this.staticDataItems = [{ ...this.config.staticData }];
          } else {
            this.staticDataItems = [...this.config.staticData];
          }
        }
      }
    },
    switchDataSource(type) {
      this.localConfig.dataSourceType = type;

      // 实现数据源互斥
      if (type === "dynamic") {
        // 选择动态数据源时，清空静态数据源
        this.staticDataItems = [];
      } else {
        // 选择静态数据源时，清空动态数据源URL
        this.localConfig.dataUrl = "";
      }

      // 触发数据源变化事件，通知组件更新
      if (this.$bus && typeof this.$bus.emit === "function") {
        this.$bus.emit("data-source-change", {
          componentId: this.item.id,
        });
      }
    },
    // 添加新的静态数据项
    addStaticDataItem() {
      this.staticDataItems.push({
        valueName: "",
        value: "0",
        imageUrl: "",
      });
    },
    // 上移项目
    moveItemUp(index) {
      if (index > 0) {
        const temp = this.staticDataItems[index];
        this.$set(this.staticDataItems, index, this.staticDataItems[index - 1]);
        this.$set(this.staticDataItems, index - 1, temp);
      }
    },
    // 下移项目
    moveItemDown(index) {
      if (index < this.staticDataItems.length - 1) {
        const temp = this.staticDataItems[index];
        this.$set(this.staticDataItems, index, this.staticDataItems[index + 1]);
        this.$set(this.staticDataItems, index + 1, temp);
        this.autoSaveConfig();
      }
    },
    // 删除项目
    deleteItem(index) {
      if (this.staticDataItems.length > 1) {
        this.staticDataItems.splice(index, 1);
        this.autoSaveConfig();
      } else {
        this.$message.warning("至少保留一个指标项");
      }
    },
    // 自动保存配置，不触发更新
    autoSaveConfig() {
      // 仅更新本地配置，不触发任何事件
      return {
        ...this.localConfig,
        dataList: null,
        staticData: [...this.staticDataItems],
      };
    },

    handleSave() {
      // 验证数据源配置
      if (this.localConfig.dataSourceType === "dynamic") {
        if (
          !this.localConfig.dataUrl ||
          this.localConfig.dataUrl.trim() === ""
        ) {
          this.$message.error("请填写动态数据源URL");
          return;
        }
      } else {
        // 检查静态数据是否有效
        const hasValidData = this.staticDataItems.some(
          (item) =>
            (item.valueName && item.valueName.trim() !== "") ||
            (item.value && item.value.toString().trim() !== "")
        );

        if (!hasValidData) {
          this.$message.error("请添加有效的静态数据");
          return;
        }
      }

      const configToSave = this.autoSaveConfig();
      // 触发更新事件
      this.$emit("update", configToSave, true);

      // 发送数据源变化事件
      this.$bus &&
        this.$bus.emit("data-source-change", {
          componentId: this.item.id,
        });

      // 发送配置保存事件
      this.$bus &&
        this.$bus.emit("chart-config-saved", {
          id: this.item.id,
          config: configToSave,
        });

      this.$message.success("配置已保存");
    },
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
            titleFontSize: 16,
            titleColor: "#606266",
            valueFontSize: 36,
            valueColor: "#409EFF",
            showIcon: true,
            showTitile: true,
            dataSourceType: "dynamic",
            dataUrl: "",
          };

          // 清空静态数据项
          this.staticDataItems = [];

          this.$message.success("已重置");

          // 触发数据源变化事件
          if (this.$bus) {
            if (typeof this.$bus.emit === "function") {
              this.$bus.emit("data-source-change", {
                componentId: this.item.id,
              });
            }
          }
        })
        .catch(() => {
          // 取消重置不做任何操作
        });
    },
    // 图片上传前的验证
    beforeUpload(file) {
      const isImage = file.type.startsWith("image/");
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isImage) {
        this.$message.error("只能上传图片文件!");
        return false;
      }
      if (!isLt2M) {
        this.$message.error("图片大小不能超过 2MB!");
        return false;
      }
      return true;
    },
    // 处理自定义上传
    async handleCustomUpload(options, index) {
      let self = this;
      const file = options.file;
      await self.upfile(file).then((res) => {
        self.$set(self.staticDataItems[index], "imageUrl", res.data[0].fileUrl);
        self.$set(self.staticDataItems[index], "imageId", res.data[0].fileId);

        // 触发数据源变化事件
        self.$bus &&
          self.$bus.emit("data-source-change", {
            componentId: self.item.id,
          });
      });
    },

    // 处理自定义上传 ---base64代码
    //  handleCustomUpload(options, index) {
    //   const file = options.file;
    //   // 创建一个FileReader来读取文件
    //   const reader = new FileReader();
    //   reader.onload = e => {
    //     // 设置图片URL为base64编码的数据
    //     this.$set(this.staticDataItems[index], "imageUrl", e.target.result);

    //     // 触发数据源变化事件
    //     this.$bus &&
    //       this.$bus.emit("data-source-change", {
    //         componentId: this.item.id
    //       });
    //   };
    //   // 读取文件为DataURL
    //   reader.readAsDataURL(file);
    // },

    // 删除图片
    removeImage(index) {
      this.$set(this.staticDataItems[index], "imageUrl", "");

      // 触发数据源变化事件
      this.$bus &&
        this.$bus.emit("data-source-change", {
          componentId: this.item.id,
        });
    },
  },
  watch: {
    config: {
      handler(newConfig) {
        if (newConfig) {
          this.localConfig = { ...this.localConfig, ...newConfig };

          // 处理静态数据项
          if (newConfig.staticData) {
            // 如果原配置是单个对象，转换为数组
            if (!Array.isArray(newConfig.staticData)) {
              this.staticDataItems = [{ ...newConfig.staticData }];
            } else {
              this.staticDataItems = [...newConfig.staticData];
            }
          }
        }
      },
      deep: true,
      immediate: true,
    },
  },
};
</script>
<style>
.metric-card-config.el-icon-edit,
.metric-card-config .el-icon-delete {
  color: #fff !important;
}
</style>
<style lang="less" scoped>
.checkbox-info {
  line-height: 32px;
}
.metric-card-config {
  padding: 10px;

  .left-aligned-form {
    .el-form-item {
      margin-bottom: 18px;
    }
  }
  /deep/ .el-checkbox {
    vertical-align: sub;
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
    }
  }

  .unit-label {
    margin-left: 8px;
    color: #606266;
  }

  .static-data {
    .config-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;

      .label {
        font-size: 14px;
        color: #606266;
        font-weight: 600;
      }

      .action-buttons {
        display: flex;
        align-items: center;

        .el-button {
          height: 28px;
          padding: 6px;
          margin-left: 5px;
        }

        .add-button {
          margin-left: 0;
        }
      }
    }

    .config-row {
      display: flex;
      align-items: center;
      margin-bottom: 18px;

      .label {
        width: 80px;
        font-size: 14px;
        color: #606266;
        text-align: right;
        padding-right: 12px;
      }
      /deep/ .el-input__inner,
      /deep/ .el-input-number {
        height: 32px;
        line-height: 32px;
      }

      .el-input {
        flex: 1;
      }
    }
    .static-data-box {
      border: 1px solid #e4e7ed;
      border-radius: 4px;
      padding: 20px 15px 20px 10px;
      margin-bottom: 15px;
      position: relative;

      // 盒子标题
      .box-header {
        position: absolute;
        top: -10px;
        left: 10px;
        background-color: #fff;
        padding: 0 8px;

        .box-title {
          font-size: 13px;
          color: #409eff;
          font-weight: 500;
        }
      }

      // 图片行特殊样式
      .image-row {
        margin-bottom: 0px;
        align-items: flex-start;

        .image-content-wrapper {
          display: flex;
          flex: 1;
          align-items: flex-start;
          justify-content: space-between;
        }
      }
    }

    .item-actions {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-left: 10px;

      .el-button {
        padding: 5px;
        margin-left: 0;
        margin-bottom: 5px;
        height: 26px;
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }

  .image-upload-container {
    .image-preview-wrapper {
      position: relative;
      width: 100px;
      height: 80px;
      border-radius: 4px;
      overflow: hidden;

      .image-preview {
        width: 100%;
        height: 100%;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        overflow: hidden;
        background-color: #fff;
        position: relative;
        cursor: pointer;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .image-hover-mask {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s;
          color: #fff;

          i {
            font-size: 20px;
            margin-bottom: 4px;
          }

          span {
            font-size: 12px;
          }
        }

        &:hover .image-hover-mask {
          opacity: 1;
        }
      }

      .image-actions {
        position: absolute;
        top: 4px;
        right: 4px;
        z-index: 1;

        .el-button {
          background-color: #f56c6c;
          border-color: #f56c6c;
          color: #fff;

          &:hover,
          &:focus {
            background-color: #f78989;
            border-color: #f78989;
          }

          &:disabled {
            background-color: #fab6b6;
            border-color: #fab6b6;
          }
        }
      }
    }

    .image-uploader {
      .upload-placeholder {
        width: 100px;
        height: 80px;
        border: 1px dashed #dcdfe6;
        border-radius: 4px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s;
        background-color: #fff;
        padding: 8px;
        gap: 4px;

        &:hover {
          border-color: #409eff;
          color: #409eff;
        }

        &.disabled {
          cursor: not-allowed;
          opacity: 0.6;

          &:hover {
            border-color: #dcdfe6;
            color: inherit;
          }
        }

        i {
          font-size: 16px;
          margin-bottom: 4px;
          color: #909399;
          line-height: 1;
        }

        span {
          font-size: 12px;
          color: #909399;
          line-height: 1.2;
        }
      }
    }
  }

  .form-buttons {
    margin-top: 20px;
    display: flex;
    justify-content: center;
    ::v-deep .el-form-item__content {
      margin-left: 0 !important;
    }
  }
}
</style>
