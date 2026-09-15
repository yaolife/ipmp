<template>
  <div class="announcement-board-config">
    <!-- 基础配置 -->
    <el-form label-width="110px" size="small" class="left-aligned-form">
      <!-- 是否显示公告栏图片 -->
      <el-form-item label="显示标题">
        <el-checkbox
          class="checkbox"
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
          <el-option label="明细" value="simple" />
          <el-option label="简约" value="dark" />
        </el-select>
      </el-form-item>

      <!-- 行间距 -->
      <el-form-item label="行间距">
        <el-input-number
          v-model="localConfig.lineHeight"
          :disabled="readonly"
          :min="1"
          :max="100"
          :step="1"
        />
      </el-form-item>

      <!-- 字体颜色 -->
      <el-form-item label="字体颜色">
        <el-color-picker
          :disabled="readonly"
          v-model="localConfig.textColor"
          show-alpha
        />
      </el-form-item>

      <!-- 最大公告行数 -->
      <el-form-item label="最大公告行数">
        <el-input-number
          v-model="localConfig.maxLines"
          :disabled="readonly"
          :min="1"
          :max="10"
          :step="1"
        />
      </el-form-item>

      <!-- 图片盒子宽度占比 -->
      <el-form-item v-if="false" label="图片宽度占比">
        <el-select
          v-model="localConfig.imageWidth"
          :disabled="readonly"
          placeholder="请选择宽度占比"
        >
          <el-option label="1/4" value="0.25" />
          <el-option label="1/2" value="0.5" />
          <el-option label="3/4" value="0.75" />
          <el-option label="1" value="1" />
        </el-select>
      </el-form-item>

      <!-- 公告栏图片 -->
      <el-form-item label="公告栏图片">
        <div class="image-upload-container">
          <div class="image-preview-wrapper">
            <img
              v-if="localConfig.image"
              class="imgage"
              :src="localConfig.image"
              alt=""
            />
            <el-upload
              action=""
              class="import-upload"
              :show-file-list="false"
              :http-request="handUpLoad"
            >
              <div class="upload-placeholder">
                <i class="el-icon-plus"></i>
                <span>上传图片</span>
              </div>
            </el-upload>
            <div class="image-actions">
              <el-button
                type="danger"
                size="mini"
                icon="el-icon-delete"
                circle
                :disabled="readonly"
                @click="removeImage"
              ></el-button>
            </div>
          </div>
        </div>
      </el-form-item>
      <!-- 是否显示公告栏图片 -->
      <el-form-item label="显示图片">
        <el-checkbox
          class="checkbox"
          :disabled="readonly"
          v-model="localConfig.showImage"
        ></el-checkbox>
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
            placeholder="请输入数据源链接"
            :disabled="readonly"
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
      append-to-body
      :before-close="handleDialogClose"
    >
      <div class="dialog-content">
        <!-- 表格操作按钮 -->
        <div class="table-actions">
          <el-button type="primary" size="small" @click="addAnnouncementItem">
            <i class="el-icon-plus"></i>
            新增公告
          </el-button>
          <el-button type="info" size="small" @click="editAllItems">
            <i class="el-icon-edit"></i>
            批量编辑
          </el-button>
        </div>

        <!-- 公告表格 -->
        <el-table
          :data="localConfig.announcements"
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
          <el-table-column prop="date" label="时间" width="160">
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
          <el-table-column prop="content" label="描述">
            <template #default="{ row, $index }">
              <el-input
                v-if="editingRows.includes($index)"
                v-model="row.content"
                placeholder="请输入公告内容"
                @keyup.enter="confirmEdit($index)"
                class="edit-input"
              ></el-input>
              <span v-else>{{ row.content }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" align="center">
            <template #default="{ $index }">
              <div class="item-actions">
                <el-button
                  v-if="!editingRows.includes($index)"
                  type="primary"
                  class="btn-edit"
                  icon="el-icon-edit"
                  size="mini"
                  circle
                  @click="editAnnouncementItem($index)"
                ></el-button>
                <el-button
                  v-else
                  type="success"
                  icon="el-icon-check"
                  size="mini"
                  circle
                  @click="confirmEdit($index)"
                ></el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  circle
                  @click="removeAnnouncementItem($index)"
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
  name: "AnnouncementBoardConfig",
  props: {
    config: {
      type: Object,
      required: true,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  },
  mixins: [upload],
  data() {
    return {
      editingRows: [], // 正在编辑的行索引数组
      dialogVisible: false, // 控制弹窗显示
      savedAnnouncements: [], // 保存静态数据源的公告列表
      localConfig: {
        title: "",
        theme: "default",
        lineHeight: 20,
        textColor: "#666",
        maxLines: 5,
        image: "",
        imageWidth: "0.25",
        moreUrl: "",
        showImage: false,
        showTitile: true,
        dataSourceType: "dynamic", // dynamic or static
        dataUrl: "",
        announcements: [],
      },
    };
  },
  watch: {
    config: {
      immediate: true,
      handler(newConfig) {
        if (!newConfig) {
          return;
        }
        // 保存之前的数据源类型
        const prevDataSourceType = this.localConfig.dataSourceType;

        // 确保 announcements 是数组而不是 undefined
        const announcements = Array.isArray(newConfig.announcements)
          ? newConfig.announcements
          : [];

        // 更新本地配置
        this.localConfig = {
          ...this.localConfig,
          ...newConfig,
          // image: newConfig ? newConfig.image : this.localConfig.image, // 保留默认图片URL
          announcements: [...announcements],
        };

        // 根据数据源类型处理数据
        if (this.localConfig.dataSourceType === "static") {
          // 如果是静态数据源
          if (
            !newConfig ||
            !newConfig.announcements ||
            newConfig.announcements.length === 0
          ) {
            // 如果没有公告数据，添加默认公告
            // this.localConfig.announcements = [
            //   {
            //     content: "示例公告内容",
            //     date: new Date().toISOString().split("T")[0],
            //     link: "",
            //     id: Date.now().toString(),
            //   },
            // ];
          } else {
            // 使用提供的公告数据
            this.localConfig.announcements = [...newConfig.announcements];
          }
          // 保存静态数据
          this.savedAnnouncements = [...this.localConfig.announcements];
        } else {
          // 如果是动态数据源
          this.localConfig.announcements = []; // 清空公告列表
        }

        // 如果数据源类型发生变化，确保数据正确切换
        if (prevDataSourceType !== this.localConfig.dataSourceType) {
          if (this.localConfig.dataSourceType === "static") {
            this.localConfig.dataUrl = ""; // 清空动态数据URL
          } else {
            this.localConfig.announcements = []; // 清空静态数据
          }
        }
      },
    },
  },
  methods: {
    updateConfig(isSave = false) {
      try {
        // 构建完整的配置对象
        const updatedConfig = {
          ...this.localConfig,
          // 基础配置字段验证和格式化
          title: this.localConfig.title ? this.localConfig.title.trim() : "",
          theme: this.localConfig.theme || "default",
          lineHeight: parseFloat(this.localConfig.lineHeight) || 1.4,
          textColor: this.localConfig.textColor || "#333333",
          maxLines: parseInt(this.localConfig.maxLines) || 5,
          imageWidth: this.localConfig.imageWidth || "0.25",
          showImage: this.localConfig.showImage,
          showTitile: this.localConfig.showTitile,
          moreUrl: this.localConfig.moreUrl
            ? this.localConfig.moreUrl.trim()
            : "",

          // 确保图片数据被正确保存（base64格式或URL）
          image: this.localConfig.image || "",

          // 确保数据源类型被正确保存
          dataSourceType: ["static", "dynamic"].includes(
            this.localConfig.dataSourceType
          )
            ? this.localConfig.dataSourceType
            : "dynamic",

          // 根据数据源类型处理相关数据
          dataUrl:
            this.localConfig.dataSourceType === "dynamic"
              ? (this.localConfig.dataUrl || "").trim()
              : "",

          // 处理公告数据
          announcements:
            this.localConfig.dataSourceType === "static"
              ? (this.localConfig.announcements || [])
                  .map((item) => ({
                    id:
                      item.id ||
                      Date.now().toString() +
                        Math.random().toString(36).substr(2, 5),
                    date: item.date || new Date().toISOString().split("T")[0],
                    content: item.content ? item.content.trim() : "",
                    link: item.link ? item.link.trim() : "",
                    isNew: item.isNew || false, // 保留新项标记
                  }))
                  .filter((item) => item.content) // 过滤掉空内容的公告
              : [],
        };

        // 数据验证
        if (isSave) {
          // 静态数据源验证
          if (updatedConfig.dataSourceType === "static") {
            if (!updatedConfig.announcements.length) {
              this.$message({
                type: "warning",
                message: "静态数据源至少需要添加一条公告",
              });
              return;
            }

            // 验证公告内容
            const invalidAnnouncements = updatedConfig.announcements.filter(
              (item) => !item.content || !item.date
            );
            if (invalidAnnouncements.length > 0) {
              this.$message({
                type: "warning",
                message: "存在无效的公告项，请确保内容和日期已填写",
              });
              return;
            }
          }

          // 动态数据源验证
          if (
            updatedConfig.dataSourceType === "dynamic" &&
            !updatedConfig.dataUrl
          ) {
            this.$message({
              type: "warning",
              message: "动态数据源需要填写数据源链接",
            });
            return;
          }
        }

        // 发送更新事件
        this.$emit("update", updatedConfig, isSave);
      } catch (error) {
        console.error("配置更新失败:", error);
      }
    },
    // 图片上传前的验证
    async handUpLoad(fileobj) {
      let self = this;
      const file = fileobj.file;
      const isImage = fileobj.file.type.startsWith("image/");
      const isLt2M = fileobj.file.size / 1024 / 1024 < 2;

      if (!isImage) {
        self.$message.error("只能上传图片文件!");
        return false;
      }
      if (!isLt2M) {
        self.$message.error("图片大小不能超过 2MB!");
        return false;
      }
      await self.upfile(file).then((res) => {
        self.localConfig.image = res.data[0].fileUrl;
        self.localConfig.imageId = res.data[0].fileId;
        self.updateConfig();
      });
    },
    // 图片上传前的验证 ---base64代码
    //   handUpLoad(fileobj) {
    //   const file = fileobj.file;
    //   const isImage = fileobj.file.type.startsWith("image/");
    //   const isLt2M = fileobj.file.size / 1024 / 1024 < 2;

    //   if (!isImage) {
    //     this.$message.error("只能上传图片文件!");
    //     return false;
    //   }
    //   if (!isLt2M) {
    //     this.$message.error("图片大小不能超过 2MB!");
    //     return false;
    //   }
    //   const reader = new FileReader();
    //   reader.onload = e => {
    //     this.localConfig.image = e.target.result;
    //     this.updateConfig();
    //   };
    //   reader.readAsDataURL(fileobj.file);
    // },

    // 移除图片
    removeImage() {
      this.$confirm("确定要删除此图片吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.localConfig.image = "";
          // 不立即更新配置，等待用户点击保存按钮
          // this.updateConfig();
          this.$message({
            type: "success",
            message: "删除成功!",
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },

    // 设置默认图片
    setDefaultImage() {
      // 这里可以设置一个默认图片，或者打开上传对话框
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "image/*";
      fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          this.beforeUpload(file);
        }
      };
      fileInput.click();
    },

    // 切换数据源类型
    switchDataSource(type) {
      // 如果类型没有变化，不做任何处理
      if (this.localConfig.dataSourceType === type) {
        return;
      }

      // 更新数据源类型
      this.localConfig.dataSourceType = type;

      // 根据数据源类型处理数据
      if (type === "dynamic") {
        // 完全清空静态数据源的公告列表，不再保存
        this.savedAnnouncements = [];
        this.localConfig.announcements = [];

        // 保持动态数据源URL为空，等待用户输入
        this.localConfig.dataUrl = "";
      } else {
        // 清空动态数据源的URL
        this.localConfig.dataUrl = "";

        // 清空静态数据源的公告列表，不再恢复之前的数据
        this.localConfig.announcements = [];
      }
    },

    // 打开编辑数据弹窗
    openEditDialog() {
      // 打开对话框
      this.dialogVisible = true;
    },

    // 关闭弹窗
    handleDialogClose() {
      this.dialogVisible = false;
      // 重置编辑状态
      this.editingRows = [];
    },

    // 保存弹窗数据
    saveDialogData() {
      // 验证所有公告项是否有内容
      const emptyItems = this.localConfig.announcements.filter(
        (item) => !item.content.trim()
      );

      if (emptyItems.length > 0) {
        this.$message({
          type: "warning",
          message: "有公告项内容为空，请填写完整",
        });
        return;
      }

      // 移除所有临时标记，但保留isNew标记直到下一次编辑
      this.localConfig.announcements = this.localConfig.announcements.map(
        (item) => {
          // 保留isNew标记，用于表格行样式
          return { ...item };
        }
      );

      // 关闭对话框
      this.dialogVisible = false;

      this.$message({
        type: "info",
        message: "数据已暂存，请点击保存按钮以应用更改",
      });
    },

    // 添加公告项
    addAnnouncementItem() {
      // 创建一个完整的公告项对象
      const newItem = {
        content: "",
        date: new Date().toISOString().split("T")[0],
        link: "",
        // 可以添加其他需要的字段
        id: Date.now().toString(), // 添加唯一ID便于后续操作
        isNew: true, // 标记为新添加的项
      };

      // 添加到公告列表
      this.localConfig.announcements.push(newItem);

      // 自动进入编辑模式
      this.editAnnouncementItem(this.localConfig.announcements.length - 1);

      // 不立即更新配置，等待用户点击保存按钮
      // this.updateConfig();
    },

    // 删除公告项
    removeAnnouncementItem(index) {
      this.$confirm("确定要删除此公告吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          // 从数组中删除指定索引的公告项
          this.localConfig.announcements.splice(index, 1);
          this.$message({
            type: "info",
            message: "已删除公告，请点击保存按钮以应用更改",
          });
          // 不立即更新配置，等待用户点击保存按钮
          // this.updateConfig();
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },

    // 编辑公告项
    editAnnouncementItem(index) {
      if (!this.editingRows.includes(index)) {
        this.editingRows.push(index);
      }
    },

    // 确认编辑
    confirmEdit(index) {
      const idx = this.editingRows.indexOf(index);
      if (idx !== -1) {
        // 验证当前编辑的公告项
        const currentItem = this.localConfig.announcements[index];

        if (!currentItem.content.trim()) {
          this.$message({
            type: "warning",
            message: "公告内容不能为空",
          });
          return;
        }

        // 移除编辑状态
        this.editingRows.splice(idx, 1);

        // 确保日期格式正确
        if (!currentItem.date) {
          currentItem.date = new Date().toISOString().split("T")[0];
        }

        // 如果是新添加的项，编辑后仍保持新项标记一段时间
        if (currentItem.isNew) {
          // 5秒后移除新项标记
          setTimeout(() => {
            if (this.localConfig.announcements[index]) {
              this.localConfig.announcements[index].isNew = false;
              this.$forceUpdate(); // 强制更新视图
            }
          }, 5000);
        }

        // 不立即更新配置，等待用户点击保存按钮
        // this.updateConfig();
      }
    },

    // 将所有项切换到编辑状态
    editAllItems() {
      // 清空当前编辑状态数组
      this.editingRows = [];
      // 将所有项的索引添加到编辑状态数组中
      this.localConfig.announcements.forEach((_, index) => {
        this.editingRows.push(index);
      });
    },

    // 表格行样式
    tableRowClassName({ row, rowIndex }) {
      if (this.editingRows.includes(rowIndex)) {
        return "editing-row";
      }
      if (row.isNew) {
        return "new-row";
      }
      return "";
    },

    handleSave() {
      // 数据验证
      if (this.localConfig.dataSourceType === "static") {
        // 验证静态数据源
        if (
          !this.localConfig.announcements ||
          this.localConfig.announcements.length === 0
        ) {
          this.$message({
            type: "warning",
            message: "静态数据源至少需要一条公告",
          });
          return;
        }

        // 验证公告内容
        const emptyItems = this.localConfig.announcements.filter(
          (item) => !item.content || !item.content.trim()
        );
        if (emptyItems.length > 0) {
          this.$message({
            type: "warning",
            message: "有公告项内容为空，请填写完整或删除",
          });
          return;
        }
      } else {
        // 验证动态数据源
        if (!this.localConfig.dataUrl || !this.localConfig.dataUrl.trim()) {
          this.$message({
            type: "warning",
            message: "动态数据源需要填写数据源链接",
          });
          return;
        }
      }

      // 保存配置
      this.updateConfig(true);

      this.$message({
        type: "success",
        message: "配置已保存",
      });
    },

    handleReset() {
      // 清除保存的临时数据
      this.savedAnnouncements = [];

      // 重置为初始配置，清空所有内容
      this.localConfig = {
        title: "",
        theme: "default",
        lineHeight: 20,
        showTitile: true,
        textColor: "#333333",
        maxLines: 5,
        image: "", // 清空上传的图片
        imageWidth: "0.25",
        moreUrl: "",
        dataSourceType: "dynamic",
        dataUrl: "",
        announcements: [],
      };

      // 清空编辑状态
      this.editingRows = [];
      // 关闭对话框
      this.dialogVisible = false;

      // 更新配置
      this.updateConfig();

      this.$message({
        message: "配置已重置",
        type: "info",
      });
    },
  },
};
</script>
<style>
.dialog-content .el-icon-edit,
.dialog-content .el-icon-delete {
  color: #fff !important;
}
</style>
<style lang="less" scoped>
.el-icon-edit,
.el-icon-delete {
  color: #fff !important;
}
.checkbox {
  line-height: 32px;
}
/deep/.el-input__inner {
  height: 35px !important;
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
/deep/ .el-input-number__decrease {
  left: 2px !important;
}
.edit-data-button {
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
}

.dialog-content {
  max-height: 70vh;
  overflow-y: auto;
}

.table-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
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
.announcement-board-config {
  padding: 10px;
  /deep/ .el-button--mini {
    height: auto !important;
  }
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

  .image-upload-container {
    width: 100%;
    margin-bottom: 12px;
    // .upload-placeholder {
    //   width: 100px;
    //   height: 80px;
    //   border: 1px dashed #dcdfe6;
    //   border-radius: 4px;
    //   display: flex;
    //   flex-direction: column;
    //   align-items: center;
    //   justify-content: center;
    //   cursor: pointer;
    //   transition: all 0.3s;
    //   background-color: #fff;
    //   padding: 8px;
    //   gap: 4px;

    //   &:hover {
    //     border-color: #409eff;
    //     color: #409eff;
    //   }

    //   &.disabled {
    //     cursor: not-allowed;
    //     opacity: 0.6;

    //     &:hover {
    //       border-color: #dcdfe6;
    //       color: inherit;
    //     }
    //   }

    //   i {
    //     font-size: 16px;
    //     margin-bottom: 4px;
    //     color: #909399;
    //     line-height: 1;
    //   }

    //   span {
    //     font-size: 12px;
    //     color: #909399;
    //     line-height: 1.2;
    //   }
    // }
    .image-preview-wrapper {
      position: relative;
      width: 120px;
      height: 100px;
      border-radius: 4px;
      overflow: hidden;
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .image-preview {
        width: 100%;
        height: 100%;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        overflow: hidden;
        background-color: #fff;
        position: relative;
        cursor: pointer;

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
          padding: 4px;
          border: none;
          background-color: rgba(0, 0, 0, 0.5);

          &:hover {
            background-color: rgba(0, 0, 0, 0.7);
          }
          /deep/ .el-icon-delete {
            color: #fff !important;
          }
          i {
            font-size: 12px;
          }
        }
      }
    }

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

  .image-uploader {
    display: block;
    width: 100%;
    height: 100%;
  }

  // 数据源配置相关样式
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

    .custom-button-group {
      display: flex;
      width: 100%;
      margin-bottom: 15px;
      gap: 6px;

      .add-btn,
      .batch-btn {
        width: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 12px;
        height: 32px;
        font-size: 13px;
        border-radius: 4px;
        cursor: pointer;
        background-color: #ffffff;
        border: 1px solid #dcdfe6;
        transition: all 0.3s;
        white-space: nowrap;

        &:hover {
          color: #409eff;
          border-color: #c6e2ff;
          background-color: #ecf5ff;
        }

        i {
          margin-right: 5px;
        }
      }
    }

    .announcement-items-list {
      margin-bottom: 15px;
      max-height: 300px;
      overflow-y: auto;

      .el-table {
        .el-table__row {
          background-color: #ffffff;

          &.editing-row {
            .el-input__inner {
              border-color: #409eff;
            }
          }

          &.new-row {
            background-color: #f0f9eb;
            transition: background-color 0.5s;
          }
        }

        .item-actions {
          display: flex;
          gap: 10px;
          color: #606266;
          cursor: pointer;

          i:hover {
            color: #409eff;
          }
        }

        ::v-deep .editing-row {
          .el-input__inner {
            height: 32px;
            line-height: 32px;
          }
        }
      }

      .edit-input {
        width: 100%;
      }
    }
  }
}
</style>
