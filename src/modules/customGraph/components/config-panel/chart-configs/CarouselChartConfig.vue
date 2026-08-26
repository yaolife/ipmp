<template>
  <div class="carousel-chart-config">
    <el-form label-width="80px" size="small" class="left-aligned-form">
      <el-form-item label="显示标题">
        <el-checkbox
          class="checkbox-info"
          :disabled="readonly"
          v-model="localConfig.showTitile"
        ></el-checkbox>
      </el-form-item>
      <!-- 基础配置 -->
      <div class="inline-form-items">
        <el-form-item label="自动播放">
          <el-checkbox
            class="checkbox-info"
            v-model="localConfig.autoplay"
            @change="handleConfigChange"
            :disabled="readonly"
          ></el-checkbox>
        </el-form-item>

        <el-form-item label="轮播间隔">
          <el-input-number
            v-model="localConfig.intervalSeconds"
            :min="1"
            :max="10"
            :step="0.5"
            @change="handleIntervalChange"
            :disabled="readonly"
          />
          <!-- <span class="unit-text">秒</span> -->
        </el-form-item>
      </div>

      <!-- 轮播图片管理 -->
      <div class="carousel-items-section">
        <div class="section-header">
          <h3>轮播图片</h3>
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-plus"
            @click="addCarouselItem"
            v-if="!readonly"
          ></el-button>
        </div>

        <div class="carousel-items-list">
          <div
            v-for="(item, index) in localConfig.items"
            :key="index"
            class="carousel-item"
          >
            <div class="carousel-item-content">
              <el-form-item label="图片">
                <div class="image-upload-container">
                  <div class="image-preview-wrapper" v-if="item.image">
                    <el-upload
                      :ref="`upload-${index}`"
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
                        <img :src="item.image" alt="轮播图片预览" />
                        <!-- <img :src="getUrl(item)" alt="轮播图片预览" /> -->
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
                    :ref="`upload-${index}`"
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
              </el-form-item>

              <el-form-item label="链接地址">
                <el-input
                  v-model="item.linkUrl"
                  placeholder="请输入链接地址"
                  @change="handleConfigChange"
                  :disabled="readonly"
                />
              </el-form-item>

              <div class="link-options">
                <el-form-item label="在新窗口打开">
                  <el-checkbox
                    v-model="item.openInNewWindow"
                    @change="handleConfigChange"
                    :disabled="readonly"
                  ></el-checkbox>
                </el-form-item>

                <div class="item-actions" v-if="!readonly">
                  <el-button
                    size="mini"
                    icon="el-icon-top"
                    :disabled="index === 0"
                    @click="moveItem(index, index - 1)"
                  ></el-button>
                  <el-button
                    size="mini"
                    icon="el-icon-bottom"
                    :disabled="index === localConfig.items.length - 1"
                    @click="moveItem(index, index + 1)"
                  ></el-button>
                  <el-button
                    type="danger"
                    size="mini"
                    icon="el-icon-delete"
                    @click="removeCarouselItem(index)"
                  ></el-button>
                </div>
              </div>
            </div>
          </div>

          <div class="empty-list" v-if="localConfig.items.length === 0">
            <el-empty description="暂无轮播图片，请点击新增按钮添加"></el-empty>
          </div>
        </div>
      </div>

      <!-- 保存和重置按钮 -->
      <el-form-item class="form-buttons">
        <el-button
          type="primary"
          size="small"
          @click="saveConfig"
          :disabled="readonly"
          >保存</el-button
        >
        <el-button size="small" @click="resetConfig" :disabled="readonly"
          >重置</el-button
        >
      </el-form-item>
    </el-form>
  </div>
</template>


<script>
import upload from "@/mixins/upload";
export default {
  name: "CarouselChartConfig",
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
  mixins: [upload],
  data() {
    return {
      config: {
        interval: 2000, // 默认2秒
        intervalSeconds: 2, // 用于显示
        autoplay: true,
        showTitile: true,
        items: [],
      },
      originalConfig: null, // 用于重置功能
      localConfig: null, // 用于存储本地修改，只有在保存时才会同步到画布
    };
  },
  watch: {
    "item.config": {
      handler(newConfig) {
        if (newConfig) {
          // 保存原始配置用于重置
          this.originalConfig = JSON.parse(JSON.stringify(newConfig));

          // 合并配置，保持默认值
          const mergedConfig = { ...this.config, ...newConfig };

          // 确保interval和intervalSeconds同步
          mergedConfig.intervalSeconds = mergedConfig.interval / 1000;

          // 确保items数组存在且至少有一个空项
          if (!mergedConfig.items || !Array.isArray(mergedConfig.items)) {
            mergedConfig.items = [];
          }

          // 确保每个轮播项都有必要的属性
          mergedConfig.items = mergedConfig.items.map((item) => ({
            imageUrl: "",
            image:"",
            linkUrl: "",
            imageId: "",
            openInNewWindow: false,
            ...item,
          }));

          // 如果没有任何项，添加一个空项
          if (mergedConfig.items.length === 0) {
            mergedConfig.items.push({
              imageUrl: "",
              image:"",
              linkUrl: "",
              imageId: "",
              openInNewWindow: false,
            });
          }

          this.config = mergedConfig;
          // 初始化本地配置
          this.localConfig = JSON.parse(JSON.stringify(mergedConfig));

          // console.log("[ this.localConfig ]-247", this.localConfig);
          // this.localConfig.items.forEach((item) => {
          //   if (this.checkHasHttp(item.imageId)) {
          //     item.imageUrl = item.imageId;
          //   }
          // });

          // console.log("[ 初始化 ]-247", this.localConfig);
        }
      },
      immediate: true,
      deep: true,
    },
  },
  mounted() {

    console.log('[ 我进来啦了 ]-263', )
    // 确保至少有一条图片项
    if (
      !this.localConfig ||
      !this.localConfig.items ||
      this.localConfig.items.length === 0
    ) {
      this.addCarouselItem();
    }
  },
  methods: {
    // 正则表达式：匹配包含 http 或 https 的字符串（不区分大小写）
    checkHasHttp(str) {
      const hasHttpReg = /http/i;
      return hasHttpReg.test(str);
    },
    // 更新配置方法
    updateConfig(isSave = false) {
      // 创建更新后的配置对象
      const updatedConfig = JSON.parse(JSON.stringify(this.localConfig));

      // 确保interval和intervalSeconds同步
      updatedConfig.interval = this.localConfig.intervalSeconds * 1000;

      // 确保items数组存在
      updatedConfig.items = updatedConfig.items || [];

      // 只有在保存时才触发更新事件，否则只更新本地配置
      if (isSave) {
        this.$emit("update", updatedConfig, isSave);
        this.$message.success("保存成功");
      }
    },

    // 只更新本地配置，不触发画布更新
    handleConfigChange() {
      // 只更新本地配置，不触发画布更新
      // 注释：修改后只更新本地配置，不触发画布更新
    },

    handleIntervalChange(value) {
      this.localConfig.intervalSeconds = value;
      // 只更新本地配置，不触发画布更新
      // 注释：修改后只更新本地配置，不触发画布更新
    },

    addCarouselItem() {
      this.localConfig.items.push({
        imageUrl: "",
        image:"",
        imageId: "",
        linkUrl: "",
        openInNewWindow: false,
      });
      // 只更新本地配置，不触发画布更新
      // 注释：修改后只更新本地配置，不触发画布更新
    },

    removeCarouselItem(index) {
      this.$confirm("确定要删除这个轮播图片吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.localConfig.items.splice(index, 1);
          // 只更新本地配置，不触发画布更新
          // 注释：修改后只更新本地配置，不触发画布更新
          this.$message({
            type: "success",
            message: "删除成功",
          });
        })
        .catch(() => {});
    },

    moveItem(fromIndex, toIndex) {
      const item = this.localConfig.items.splice(fromIndex, 1)[0];
      this.localConfig.items.splice(toIndex, 0, item);
      // 只更新本地配置，不触发画布更新
      // 注释：修改后只更新本地配置，不触发画布更新
    },

    handleUploadSuccess(res, index) {
      // 直接使用base64图片数据
      this.localConfig.items[index].imageUrl = res.data.base64;
      this.$message.success("图片上传成功");
    },

    beforeUpload(file) {
      // 验证文件类型
      const isJPG = file.type === "image/jpeg";
      const isPNG = file.type === "image/png";
      if (!isJPG && !isPNG) {
        this.$message.error("只能上传 JPG 或 PNG 格式的图片!");
        return false;
      }

      // 验证文件大小（限制为2MB）
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        this.$message.error("图片大小不能超过2MB!");
        return false;
      }

      return true;
    },

    async handleCustomUpload(options, index) {
      let self = this;
      const file = options.file;
      await self.upfile(file).then((res) => {
        this.localConfig.items[index].imageId = res.data[0].fileId;
        this.localConfig.items[index].imageUrl = res.data[0].fileUrl;
        this.localConfig.items[index].image = res.data[0].fileUrl;
      });
    },
    checkHasHttp(str) {
      const hasHttpReg = /http/i;
      return hasHttpReg.test(str);
    },
    // base64代码
    // handleCustomUpload(options, index) {
    //   const file = options.file;
    //   const reader = new FileReader();
    //   reader.readAsDataURL(file);
    //   reader.onload = () => {
    //     // 直接将base64设置为图片URL
    //     this.localConfig.items[index].imageUrl = reader.result;
    //     // 调用onSuccess回调
    //     options.onSuccess && options.onSuccess();
    //     this.$message.success("图片上传成功");
    //   };
    //   reader.onerror = error => {
    //     this.$message.error("图片上传失败，请重试");
    //     options.onError && options.onError(error);
    //   };
    // },

    removeImage(index) {
      this.$confirm("确定要删除这张图片吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.localConfig.items[index].imageUrl = "";
          this.localConfig.items[index].image = "";
          // 只更新本地配置，不触发画布更新
          // 注释：修改后只更新本地配置，不触发画布更新
          this.$message({
            type: "success",
            message: "图片已删除",
          });
        })
        .catch(() => {});
    },

    resetConfig() {
      this.$confirm("确认重置所有配置？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          // 重置为初始配置，只保留默认值
          this.localConfig = {
            interval: 2000, // 默认2秒
            intervalSeconds: 2, // 用于显示
            autoplay: true,
            showTitile: true,
            items: [
              {
                imageUrl: "",
                imageId: "",
                linkUrl: "",
                image:"",
                openInNewWindow: false,
              },
            ],
          };

          this.$message.success("已重置为默认配置");
        })
        .catch(() => {});
    },

    saveConfig() {
      // 将本地配置同步到config
      this.config = JSON.parse(JSON.stringify(this.localConfig));

      // 确保interval和intervalSeconds同步
      this.config.interval = this.localConfig.intervalSeconds * 1000;

      // 触发更新
      this.$emit("update", this.config, true);
      this.$message.success("保存成功");
    },
  },
};
</script>

<style lang="less" scoped>
.checkbox-info {
  line-height: 32px;
}
.carousel-chart-config {
  /deep/ .el-icon-delete {
    color: #fff;
  }
  /deep/ .el-button--mini {
    height: auto !important;
  }

  /* 确保所有表单项的标签左对齐 */
  .left-aligned-form {
    padding-top: 10px;
    /deep/.el-form-item__label {
      text-align: left;
    }
  }
  .inline-form-items {
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
    margin-top: 20px;

    .el-form-item {
      margin-right: 20px;

      /* 覆盖Element UI的默认样式，使标签左对齐 */
      /deep/.el-form-item__label {
        text-align: left;
        font-size: 14px;
      }
    }
  }

  .carousel-items-section {
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
      font-weight: 600;
      h3 {
        margin: 0;
        font-size: 14px;
        color: #333333;
        font-weight: 600;
      }
    }
  }

  .carousel-items-list {
    max-height: 500px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #c0c4cc #f1f1f1;
    margin-bottom: 20px;
    padding: 10px 0;

    /* 自定义滚动条样式 */
    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: #c0c4cc;
      border-radius: 3px;

      &:hover {
        background: #909399;
      }
    }

    /* Firefox滚动条样式 */
    scrollbar-width: thin;
    scrollbar-color: #c0c4cc #f1f1f1;
    .image-uploader {
      width: 100%;
      height: 100%;
    }
    .carousel-item {
      margin-bottom: 8px;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      overflow: hidden;
      /* 移除固定高度，让内容自然撑开 */

      .carousel-item-content {
        padding: 12px;
        background-color: #f5f7fa;

        .image-upload-container {
          width: 100%;
          margin-bottom: 12px;
          /deep/ .el-upload {
            width: 100%;
            height: 100%;
          }
          .image-preview-wrapper {
            position: relative;
            width: 120px;
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
                padding: 4px;
                border: none;
                background-color: rgba(0, 0, 0, 0.5);

                &:hover {
                  background-color: rgba(0, 0, 0, 0.7);
                }

                i {
                  color: #fff;
                  font-size: 12px;
                }
              }
            }
          }

          .upload-placeholder {
            width: 120px;
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
            box-sizing: border-box;
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

        .link-options {
          display: flex;
          justify-content: space-between;
          align-items: center;

          /deep/ .el-form-item {
            margin-bottom: 0;
            min-width: 160px; /* 增加最小宽度，防止文本换行 */

            .el-form-item__label {
              white-space: nowrap; /* 强制文本不换行 */
              width: 90px !important; /* 设置标签宽度为90px */
            }

            .el-form-item__content {
              margin-left: 90px !important; /* 设置内容区域的左边距为90px */
              .el-checkbox {
                height: 30px;
                vertical-align: sub;
              }
            }
          }

          .item-actions {
            display: flex;
            gap: 5px;
            align-items: center;

            /deep/ .el-button {
              padding: 4px 6px;
              margin: 0;
              min-height: 24px;
              height: 24px;
              line-height: 1;

              &.el-button--danger {
                margin-left: 0;
              }

              .el-icon-top,
              .el-icon-bottom,
              .el-icon-delete {
                margin-right: 0;
                font-size: 12px;
              }
            }
          }

          /* 调整表单项之间的间距 */
          & + .el-form-item {
            margin-top: 8px !important;
          }
        }
      }
    }

    .empty-list {
      padding: 24px 0;
      background-color: #f5f7fa;
      border-radius: 4px;
    }
  }

  .action-buttons {
    margin-top: 24px;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }

  /deep/.el-form-item__label {
    padding-bottom: 4px;
    font-size: 13px;
  }
}
</style>
