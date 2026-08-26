<template>
  <div class="consult-list-config">
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
          :disabled="readonly"
          placeholder="请输入组件顶部显示的标题"
        />
      </el-form-item>

      <!-- 主题样式 -->
      <el-form-item label="主题样式">
        <el-select
          v-model="localConfig.theme"
          :disabled="readonly"
          placeholder="请选择主题样式"
        >
          <el-option label="默认" value="default" />
          <el-option label="简约" value="simple" />
          <el-option label="明细" value="dark" />
        </el-select>
      </el-form-item>

      <!-- 行间距 -->
      <el-form-item label="行间距">
        <el-input-number
          :disabled="readonly"
          v-model="localConfig.lineHeight"
          :min="1"
          :max="30"
          :step="1"
        />
      </el-form-item>

      <!-- 标题字体大小 -->
      <el-form-item label="标题字体大小">
        <el-input-number
          :disabled="readonly"
          v-model="localConfig.titleFontSize"
          :min="12"
          :max="24"
          :step="1"
        />
      </el-form-item>

      <!-- 标题字体颜色 -->
      <el-form-item label="标题字体颜色">
        <el-color-picker
          :disabled="readonly"
          v-model="localConfig.titleColor"
          show-alpha
        />
      </el-form-item>

      <!-- 描述字体大小 -->
      <el-form-item label="描述字体大小">
        <el-input-number
          :disabled="readonly"
          v-model="localConfig.descFontSize"
          :min="12"
          :max="20"
          :step="1"
        />
      </el-form-item>

      <!-- 描述字体颜色 -->
      <el-form-item label="描述字体颜色">
        <el-color-picker
          :disabled="readonly"
          v-model="localConfig.descColor"
          show-alpha
        />
      </el-form-item>

      <!-- 显示咨讯图片 -->
      <el-form-item label="显示咨讯图片">
        <el-checkbox
          class="checkbox"
          :disabled="readonly"
          v-model="localConfig.showImage"
        ></el-checkbox>
      </el-form-item>

      <!-- 图片宽度 -->
      <el-form-item label="图片宽度" v-if="false">
        <el-select
          v-model="localConfig.imageWidth"
          placeholder="请选择图片宽度"
          :disabled="readonly"
        >
          <el-option label="1/4" value="0.25" />
          <el-option label="1/2" value="0.5" />
          <el-option label="3/4" value="0.75" />
          <el-option label="1" value="1" />
        </el-select>
      </el-form-item>

      <!-- 最大显示咨讯量 -->
      <el-form-item label="最大显示量">
        <el-input-number
          v-model="localConfig.maxItems"
          :disabled="readonly"
          :min="1"
          :max="20"
          :step="1"
        />
      </el-form-item>

      <!-- URL配置 -->
      <el-form-item label="更多链接">
        <el-input
          v-model="localConfig.moreUrl"
          :disabled="readonly"
          placeholder="请输入更多内容的链接"
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
            :disabled="readonly"
            placeholder="请输入数据源"
          />
        </el-form-item>

        <el-form-item
          label="静态数据源"
          v-if="localConfig.dataSourceType === 'static'"
        >
          <el-button
            type="primary  "
            :disabled="readonly"
            size="small"
            @click="openEditDialog"
          >
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
          <el-button type="primary" size="small" @click="addConsultItem">
            <i class="el-icon-plus"></i>
            新增咨讯
          </el-button>
          <el-button type="info" size="small" @click="editAllItems">
            <i class="el-icon-edit"></i>
            批量编辑
          </el-button>
        </div>

        <!-- 咨讯表格 -->
        <el-table
          :data="tempConsultList"
          border
          :row-class-name="tableRowClassName"
        >
          <el-table-column
            type="index"
            label="序号"
            width="60"
            align="center"
          ></el-table-column>
          <el-table-column prop="date" label="日期" width="160">
            <template #default="{ row, $index }">
              <el-date-picker
                v-if="editingRows.includes($index)"
                v-model="row.date"
                type="date"
                placeholder="选择日期"
                format="yyyy-MM-dd"
                value-format="yyyy-MM-dd"
                size="small"
                style="width: 100%"
              ></el-date-picker>
              <span v-else>{{ row.date }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="title" label="标题">
            <template #default="{ row, $index }">
              <el-input
                v-if="editingRows.includes($index)"
                v-model="row.title"
                placeholder="请输入咨讯标题"
                class="edit-input"
              ></el-input>
              <span v-else>{{ row.title }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="content" label="描述">
            <template #default="{ row, $index }">
              <el-input
                v-if="editingRows.includes($index)"
                v-model="row.content"
                placeholder="请输入咨讯描述"
                class="edit-input"
              ></el-input>
              <span v-else>{{ row.content }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="detailLink" label="详情链接">
            <template #default="{ row, $index }">
              <el-input
                v-if="editingRows.includes($index)"
                v-model="row.detailLink"
                placeholder="请输入咨讯描述"
                class="edit-input"
              ></el-input>
              <span v-else>{{ row.detailLink }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="author" label="作者">
            <template #default="{ row, $index }">
              <el-input
                v-if="editingRows.includes($index)"
                v-model="row.author"
                placeholder="请输入作者"
                class="edit-input"
              ></el-input>
              <span v-else>{{ row.author }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="image" label="图片" width="200">
            <template #default="{ row, $index }">
              <template v-if="editingRows.includes($index)">
                <div class="image-upload">
                  <el-upload
                    class="upload-component"
                    action="#"
                    :auto-upload="false"
                    :show-file-list="false"
                    accept="image/*"
                    :on-change="(file) => handleCustomUpload(file, $index)"
                  >
                    <img
                      v-if="row.image"
                      :src="row.image"
                      class="preview-image"
                    />
                    <el-button v-else size="small" type="primary"
                      >点击上传</el-button
                    >
                  </el-upload>
                  <el-button
                    v-if="row.image"
                    size="mini"
                    type="danger"
                    icon="el-icon-delete"
                    class="remove-image"
                    @click="removeImage($index)"
                  ></el-button>
                </div>
              </template>
              <img
                v-else-if="row.image"
                :src="row.image"
                class="preview-image"
              />
              <span v-else>暂无图片</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" align="center">
            <template #default="{ $index }">
              <div class="item-actions">
                <template v-if="editingRows.includes($index)">
                  <el-button
                    type="success"
                    icon="el-icon-check"
                    size="mini"
                    circle
                    @click="confirmEdit($index)"
                    title="确认"
                  ></el-button>
                </template>
                <template v-else>
                  <el-button
                    type="primary"
                    icon="el-icon-edit"
                    size="mini"
                    circle
                    @click="editConsultItem($index)"
                    title="编辑"
                  ></el-button>
                </template>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  circle
                  @click="removeConsultItem($index)"
                  title="删除"
                ></el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="handleDialogClose">取消</el-button>
        <el-button size="small" type="primary" @click="saveDialogData"
          >确定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import upload from "@/mixins/upload";
export default {
  name: "ConsultListConfig",
  props: {
    config: {
      type: Object,
      default: () => ({}),
      required: true,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      editingRows: [], // 正在编辑的行索引数组
      dialogVisible: false, // 控制编辑弹窗的显示
      localConfig: {
        showTitile: true,
        title: "",
        theme: "default",
        lineHeight: "8",
        titleFontSize: 16,
        titleColor: "#666666",
        descFontSize: 14,
        descColor: "#666666",
        showImage: true,
        imageWidth: "0.25",
        maxItems: 10,
        moreUrl: "",
        dataSourceType: "dynamic", // dynamic or static
        dataUrl: "",
        consultList: [], // 存储咨讯列表数据
      },
      tempConsultList: [], // 临时存储编辑中的咨讯列表数据
    };
  },
  mixins: [upload],
  watch: {
    config: {
      immediate: true,
      handler(newConfig) {
        console.log("newConfig", newConfig);
        if (!newConfig || !newConfig.consultList) {
          return;
        }
        this.localConfig = {
          ...this.localConfig,
          ...newConfig,
          consultList: [...(newConfig ? newConfig.consultList : [])],
        };

        // 确保每个咨讯项都有必要的字段
        this.localConfig.consultList = this.localConfig.consultList.map(
          (item) => ({
            id: item.id || this.generateId(),
            date: item.date || this.getCurrentDate(),
            title: item.title || "",
            content: item.content || "",
            detailLink: item.detailLink || "",
            image: item.image || "",
            author: item.author || "",
            time: item.time || "",
            imageId: item.imageId || "",
          })
        );
      },
    },
  },
  methods: {
    // 生成唯一ID
    generateId() {
      return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    },

    // 获取当前日期
    getCurrentDate() {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },

    updateConfig(isSave = false) {
      const updatedConfig = {
        ...this.localConfig,
        consultList: this.localConfig.consultList || [],
      };
      this.$emit("update", updatedConfig, isSave);
      this.$message({
        type: "success",
        message: "配置已保存",
      });
    },
    handleSave() {
      this.updateConfig(true);
    },
    switchDataSource(type) {
      if (this.localConfig.dataSourceType === type) return;

      // 切换数据源类型
      this.localConfig.dataSourceType = type;

      // 根据切换后的类型处理数据
      if (type === "static") {
        // 切换到静态数据源，清空动态数据URL
        this.localConfig.dataUrl = "";
      } else {
        // 切换到动态数据源，清空静态数据
        this.localConfig.consultList = [];
        this.tempConsultList = [];
      }
    },

    handleReset() {
      this.localConfig = {
        ...this.defaultConfig(),
      };
      this.$message({
        message: "配置已重置",
        type: "info",
      });
    },

    defaultConfig() {
      return {
        title: "",
        theme: "default",
        lineHeight: "1.5",
        titleFontSize: 16,
        titleColor: "#333333",
        descFontSize: 14,
        descColor: "#666666",
        showImage: true,
        showTitile: true,
        imageWidth: "0.25",
        maxItems: 10,
        moreUrl: "",
        dataSourceType: "dynamic",
        dataUrl: "",
        consultList: [],
      };
    },

    // 打开编辑弹窗
    openEditDialog() {
      // 创建临时数据的深拷贝，以便取消时不影响原数据
      this.tempConsultList = JSON.parse(
        JSON.stringify(this.localConfig.consultList)
      );
      // 重置编辑状态
      this.editingRows = [];
      this.dialogVisible = true;
    },

    // 关闭编辑弹窗
    handleDialogClose() {
      this.$confirm("确认关闭？未保存的数据将会丢失", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.dialogVisible = false;
        })
        .catch(() => {
          // 取消关闭
        });
    },

    // 保存弹窗数据
    saveDialogData() {
      this.editingRows = [];
      // 检查是否有未完成的编辑
      // if (this.editingRows.length > 0) {
      //   this.$message.warning("请先完成所有正在编辑的行");
      //   return;
      // }

      // 验证数据
      const invalidItems = this.tempConsultList.filter((item) => !item.title);
      if (invalidItems.length > 0) {
        this.$message.error("标题不能为空");
        return;
      }

      // 更新数据
      this.localConfig.consultList = [...this.tempConsultList];
      this.dialogVisible = false;
      this.$message.success("数据已保存");
    },

    // 删除咨讯项
    removeConsultItem(index) {
      if (this.dialogVisible) {
        // 从编辑状态数组中移除
        const editingIndex = this.editingRows.indexOf(index);
        if (editingIndex > -1) {
          this.editingRows.splice(editingIndex, 1);
        }

        // 删除行
        this.tempConsultList.splice(index, 1);

        // 更新编辑状态数组中的索引
        this.editingRows = this.editingRows.map((i) => {
          if (i > index) return i - 1;
          return i;
        });
      } else {
        this.localConfig.consultList.splice(index, 1);
      }
    },

    // 设置表格行的类名
    tableRowClassName({ rowIndex }) {
      return this.editingRows.includes(rowIndex) ? "editing-row" : "";
    },

    // 编辑单个咨讯项
    editConsultItem(index) {
      if (!this.editingRows.includes(index)) {
        this.editingRows.push(index);
      }
    },

    // 确认编辑
    confirmEdit(index) {
      const itemIndex = this.editingRows.indexOf(index);
      if (itemIndex > -1) {
        // 验证必填字段
        const item = this.tempConsultList[index];
        if (!item.title) {
          this.$message.error("标题不能为空");
          return;
        }
        this.editingRows.splice(itemIndex, 1);
      }
    },

    // 批量编辑
    editAllItems() {
      // 将所有行设置为编辑状态
      this.editingRows = this.tempConsultList.map((_, index) => index);
    },

    // 处理图片上传
    async handleCustomUpload(file, index) {
      let self = this;
      await self.upfile(file.raw).then((res) => {
        self.tempConsultList[index].image = res.data[0].fileUrl;
        self.tempConsultList[index].imageId = res.data[0].fileId;
      });
    },

    // 处理图片上传  ---base64代码
    //    handleImageUpload(file, index) {
    //   const reader = new FileReader();
    //   reader.onload = e => {
    //     // 更新对应行的图片为base64
    //     this.tempConsultList[index].image = e.target.result;
    //   };
    //   reader.readAsDataURL(file.raw);
    // },

    // 移除图片
    removeImage(index) {
      this.tempConsultList[index].image = "";
    },

    // 添加咨讯项
    addConsultItem() {
      const newItem = {
        id: this.generateId(),
        date: this.getCurrentDate(),
        title: "",
        content: "",
        detailLink: "",
        image: "",
        imageId: "",
        author: "",
        time: "",
      };

      if (this.dialogVisible) {
        const newIndex = this.tempConsultList.length;
        this.tempConsultList.push(newItem);
        // 将新添加的行设置为编辑状态
        this.editingRows.push(newIndex);
      } else {
        this.localConfig.consultList.push(newItem);
      }
    },
  },
};
</script>

<style lang="less" scoped>
.checkbox-info {
  line-height: 32px;
}
.checkbox {
  line-height: 32px;
}
/deep/.el-icon-edit,
/deep/.el-icon-delete {
  color: #fff !important;
}
/deep/ .el-dialog__body {
  padding: 20px 30px 20px;
  .item-actions {
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
// 弹窗样式
/deep/ .dialog-content {
  // padding: 10px;

  .table-actions {
    margin-bottom: 10px;
    display: flex;
    gap: 10px;
  }
}
/deep/ .el-input-number__decrease {
  left: 2px !important;
}
/deep/ .el-input__inner {
  height: 32px !important;
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
      &::before {
        line-height: 14px !important;
        height: 14px !important;
      }
      &:hover {
        border-color: #409eff;
        color: #409eff;
      }
    }
  }
}
.consult-list-config {
  padding: 10px;

  .left-aligned-form {
    text-align: left;

    .el-form-item {
      margin-bottom: 18px;
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

  .help-icon {
    margin-left: 5px;
    color: #909399;
    cursor: pointer;
    font-size: 14px;

    &:hover {
      color: #409eff;
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
    margin-bottom: 15px;
  }

  .el-table {
    margin-bottom: 15px;

    .el-table__row {
      background-color: #ffffff;
    }

    .item-actions {
      display: flex;
      justify-content: center;
      gap: 5px;
    }

    /deep/ .el-input__inner {
      height: 32px;
      line-height: 32px;
      border-radius: 4px;
    }

    /deep/ .el-input.is-disabled .el-input__inner {
      background-color: #f5f7fa;
      border-color: #e4e7ed;
      color: #606266;
      cursor: not-allowed;
    }

    /deep/ .el-table__cell {
      padding: 8px 0;
    }

    /deep/.el-date-editor.el-input {
      width: 100%;
    }
  }
}

// 编辑状态行样式
/deep/ .editing-row {
  background-color: #f5f7fa !important;

  td {
    background-color: #f5f7fa !important;
  }

  .el-input__inner {
    background-color: #ffffff;
  }
}

// 操作按钮样式
.item-actions {
  display: flex;
  justify-content: center;
  gap: 8px;

  .el-button {
    padding: 6px;
  }
}

// 弹窗全局样式
/deep/ .el-dialog__body {
  padding: 10px 20px;
}

/deep/ .el-dialog__header {
  padding: 15px 20px;
  border-bottom: 1px solid #e4e7ed;
}

/deep/ .el-dialog__footer {
  padding: 15px 20px;
  border-top: 1px solid #e4e7ed;
}

// 图片上传和预览样式
.image-upload {
  position: relative;
  display: inline-block;

  .upload-component {
    display: inline-block;
  }

  .remove-image {
    position: absolute;
    top: -2px;
    right: -8px;
    padding: 4px;
    transform: scale(0.8);
  }
}

.preview-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  cursor: pointer;

  &:hover {
    border-color: #409eff;
  }
}

// 表格样式优化
/deep/ .el-table {
  .el-input.is-disabled .el-input__inner {
    background-color: #f5f7fa;
    border-color: #e4e7ed;
    color: #606266;
    cursor: not-allowed;
  }

  .el-table__cell {
    padding: 8px;
  }

  .el-input__inner {
    transition: all 0.3s;
  }
}
</style>
