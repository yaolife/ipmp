<template>
  <div
    class="consult-list"
    v-loading="loading"
    element-loading-text="正在获取咨讯数据..."
    :class="[`theme-${config.theme || 'default'}`]"
  >
    <!-- 内容区域 -->
    <div class="consult-content">
      <div
        v-if="!loadedConsultList || loadedConsultList.length === 0"
        class="empty-content"
      >
        <div class="empty-text">
          <template v-if="loading">
            <!-- <i class="el-icon-loading"></i> 正在加载数据... -->
          </template>
          <template v-else-if="config && config.dataUrl">
            <i class="el-icon-connection"></i> 等待数据加载
          </template>
          <template v-else>
            <i class="el-icon-chat-line-round"></i> 暂无咨讯内容
          </template>
        </div>
      </div>
      <div v-else class="consult-items">
        <div
          v-for="(item, index) in displayConsultList"
          :key="index"
          class="consult-item"
          @click="handleItemClick(item)"
          :class="{
            'vertical-layout': shouldUseVerticalLayout(config.imageWidth),
          }"
          :style="{
            'margin-bottom': `${config.lineHeight || 8}`,
          }"
        >
          <div
            v-if="config.showImage !== false"
            class="item-image"
            :style="{
              width: getImageWidth(config.imageWidth),
            }"
          >
            <img
              :src="item.image"
              :alt="item.title"
              @error="handleImageError"
            />
          </div>
          <div
            class="item-content"
            :class="{
              'vertical-layout': shouldUseVerticalLayout(config.imageWidth),
            }"
          >
            <div
              v-if="config.theme !== 'dark'"
              class="content-title"
              :style="{
                fontSize: `${config.titleFontSize || 14}px`,
                color: config.titleColor || '#303133',
              }"
            >
              <el-tooltip :content="item.title" placement="top" effect="light">
                <span> {{ item.title }}</span>
              </el-tooltip>
            </div>

            <div
              class="content-desc"
              :style="{
                fontSize: `${config.descFontSize || 13}px`,
                color: config.descColor || '#606266',
              }"
            >
              <span
                v-if="config.theme === 'dark'"
                :style="{
                  fontSize: `${config.titleFontSize || 13}px`,
                  color: config.titleColor || '#303133',
                  display: 'inline-block',
                }"
                >{{ item.title }}:</span
              >
              <el-tooltip :content="item.content" placement="top" effect="light"
                ><span>{{ item.content }} </span>
              </el-tooltip>
            </div>

            <div class="content-footer">
              <el-tooltip :content="item.author" placement="top" effect="light">
                <span class="author" v-if="item.author">{{ item.author }}</span>
              </el-tooltip>
              <el-tooltip :content="item.date" placement="top" effect="light">
                <span class="time">{{ item.date }}</span>
              </el-tooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { dataUrl } from "@/modules/customPortal/api/pageManagement";

export default {
  name: "ConsultList",
  props: {
    id: {
      type: String,
      required: true,
    },
    config: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      loading: false,
      loadedConsultList: [],
    };
  },
  computed: {
    displayConsultList() {
      if (!this.loadedConsultList) return [];

      // 如果设置了最大显示数量，则限制显示的条目数
      if (this.config.maxItems && this.config.maxItems > 0) {
        return this.loadedConsultList.slice(0, this.config.maxItems);
      }

      return this.loadedConsultList;
    },
  },
  watch: {
    "config.dataUrl": {
      immediate: true,
      handler(newUrl) {
        if (newUrl && this.config.dataSourceType === "dynamic") {
          if (this.config.dataList) {
            this.loadedConsultList = this.config.dataList;
          } else {
            this.fetchConsultData(newUrl);
          }
        }
      },
    },
    "config.consultList": {
      immediate: true,
      handler(newList) {
        if (
          this.config.dataSourceType === "static" &&
          newList &&
          newList.length > 0
        ) {
          this.loadedConsultList = [...newList];
        }
      },
    },
    "config.dataSourceType": {
      handler(newType) {
        if (newType === "dynamic" && this.config.dataUrl) {
          this.fetchConsultData(this.config.dataUrl);
        } else if (newType === "static" && this.config.consultList) {
          this.loadedConsultList = [...this.config.consultList];
        }
      },
    },
  },
  methods: {
    handleItemClick(item) {
      // 处理点击事件，可以跳转到详情页或显示详细信息
      console.log("点击咨讯项:", item);

      // 如果配置了详情链接，则跳转
      if (item.detailLink) {
        // 判断链接是否包含协议，如果不包含则添加http://
        let url = item.detailLink;
        if (!/^https?:\/\//i.test(url)) {
          url = "http://" + url;
        }
        window.open(url, "_blank", "noopener,noreferrer");
      }
    },

    // 计算图片宽度
    getImageWidth(width) {
      // if (!width) return "25%";
      // return width * 100 + "%";
    },

    // 判断是否应该使用垂直布局
    shouldUseVerticalLayout(width) {
      // 当width为0.75或1时，使用垂直布局
      if (!width) return false;

      // 转换为数字进行比较，处理可能的字符串输入
      const numWidth = Number(width);

      // 使用接近比较来处理浮点数精度问题
      return Math.abs(numWidth - 1) < 0.01 || Math.abs(numWidth - 0.75) < 0.01;
    },

    // 处理图片加载错误
    handleImageError(e) {
      console.error("咨讯图片加载失败");
      // 隐藏错误的图片
      e.target.style.display = "none";
      // 显示默认的占位符
      const parentElement = e.target.parentElement;
      if (parentElement) {
        const defaultImage = document.createElement("div");
        defaultImage.className = "default-image";
        defaultImage.textContent = "图片";
        parentElement.appendChild(defaultImage);
      }
    },

    // 强制刷新组件
    refreshComponent() {
      this.$forceUpdate();
    },

    // 从API获取咨讯数据
    async fetchConsultData(url) {
      if (!url) return;

      this.loading = true;
      try {
        const response = await dataUrl(this.config.dataUrl, false);
        if (response.code === "1") {
          return;
        }
        this.loadedConsultList = response.data;
        this.$set(this.config, "dataList", this.loadedConsultList);
      } catch (error) {
        this.$message({
          message: "获取咨讯数据失败",
          type: "error",
          duration: 2000,
        });
        // 出错时使用默认数据
        this.loadedConsultList = [];
      } finally {
        this.loading = false;
      }
    },
  },
  mounted() {
    // 监听图表更新事件
    this.$bus.on(`chart-update`, (chartId) => {
      if (chartId === this.id) {
        // 强制刷新组件以应用新配置
        this.refreshComponent();

        // 根据数据源类型处理数据
        if (this.config.dataSourceType === "dynamic" && this.config.dataUrl) {
          this.fetchConsultData(this.config.dataUrl);
        } else if (
          this.config.dataSourceType === "static" &&
          this.config.consultList
        ) {
          this.loadedConsultList = [...this.config.consultList];
        }
      }
    });

    // 监听重置事件
    this.$bus.on(`chart-reset`, (chartId) => {
      if (chartId === this.id) {
        // 清空当前数据
        this.loadedConsultList = [];
      }
    });
  },
  beforeDestroy() {
    // 移除所有事件监听
    this.$bus.off(`chart-update`);
    this.$bus.off(`chart-reset`);
  },
};
</script>

<style lang="less" scoped>
.consult-list {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  &.theme-default {
    .item-image {
      width: 25%;
    }
  }
  // 简约主题样式
  &.theme-simple {
    .item-image {
      display: none !important;
    }
    // background-color: #f9f9f9;
    // color: #303133;

    // .consult-item {
    //   border-bottom: 1px solid #e0e0e0;
    //   background-color: #ffffff;
    //   margin-bottom: 8px;
    //   border-radius: 4px;
    //   box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

    //   &:hover {
    //     background-color: #f5f7fa;
    //     box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    //   }
    // }
  }

  // 深色主题样式
  &.theme-dark {
    .content-desc {
      -webkit-line-clamp: 1 !important;
    }
    .consult-item {
      overflow: hidden;
      display: block !important;
    }
    .item-content {
      width: calc(100% - 60px);
    }
    .item-content {
      float: left;
    }
    .item-image {
      margin-right: 0px !important;
      float: right;
      width: 50px;
      height: 50px !important;
    }
    // background-color: #1e1e1e;
    // color: #e0e0e0;

    // .consult-content {
    //   background-color: #1e1e1e;
    // }

    // .consult-item {
    //   border-bottom: 1px solid #333333;
    //   background-color: #2d2d2d;
    //   padding: 1.5px 0px;

    //   &:hover {
    //     background-color: #383838;
    //   }

    //   .content-title {
    //     color: #e0e0e0;

    //     &:hover {
    //       color: #409eff;
    //     }
    //   }

    //   .content-desc {
    //     color: #b0b0b0;
    //   }

    //   .content-footer {
    //     color: #909090;

    //     .author {
    //       color: #b0b0b0;
    //     }

    //     .time {
    //       color: #909090;
    //     }
    //   }
    // }

    // .empty-content {
    //   color: #909090;
    // }
  }
  .consult-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;

    .empty-content {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #909399;
      font-size: 14px;

      .empty-text {
        text-align: center;

        i {
          font-size: 20px;
          margin-right: 8px;
          vertical-align: middle;
        }
      }
    }

    .consult-items {
      .consult-item {
        display: flex;
        padding: 12px;
        border-bottom: 1px solid #ebeef5;
        cursor: pointer;
        transition: all 0.3s;
        border-radius: 4px;
        margin-bottom: 8px;
        &.vertical-layout {
          flex-direction: column;
          padding: 16px !important; /* 增加内边距 */
          margin-bottom: 16px; /* 增加项目之间的间距 */
          border: 1px solid #ebeef5; /* 添加边框 */
        }

        &:hover {
          background-color: #f5f7fa;
          transform: translateY(-1px);
          box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
        }

        &:active {
          transform: translateY(0);
        }

        &:last-child {
          border-bottom: none;
        }

        .item-image {
          height: 80px;
          margin-right: 12px;
          border-radius: 4px;
          overflow: hidden;
          flex-shrink: 0;
          background-color: #f5f7fa;
          position: relative;
          justify-content: center;
          align-items: center;
          display: flex;
          .vertical-layout & {
            width: 100% !important;
            height: 200px; /* 增加高度以获得更好的显示效果 */
            margin-right: 0;
            margin-bottom: 16px; /* 增加底部间距 */
            border-radius: 6px; /* 增加圆角 */
          }

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
          }

          .default-image {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #f5f7fa;
            color: #909399;
            font-size: 14px;
          }

          &:hover img {
            transform: scale(1.05);
          }
        }

        .item-content {
          flex: 1;
          min-width: 0; // 防止文本溢出
          display: flex;
          flex-direction: column;
          justify-content: space-between;

          // 当图片宽度为75%或100%时，采用垂直布局
          &.vertical-layout {
            margin-top: 16px;
            width: 100%;
          }

          .content-title {
            font-size: 16px;
            font-weight: 500;
            color: #303133;
            margin-bottom: 8px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            line-height: 1.4;

            .vertical-layout & {
              font-size: 18px; /* 垂直布局时增加标题字体大小 */
              margin-bottom: 12px; /* 增加底部间距 */
            }

            &:hover {
              color: #409eff;
            }
          }

          .content-desc {
            font-size: 14px;
            color: #606266;
            margin-bottom: 8px;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            line-height: 1.5;
            max-height: 3em; /* 确保最多显示2行 */

            .vertical-layout & {
              -webkit-line-clamp: 3; /* 垂直布局时显示3行 */
              max-height: 4.5em; /* 3行的高度 */
              margin-bottom: 12px; /* 增加底部间距 */
            }
          }

          .content-footer {
            display: flex;
            justify-content: flex-start;
            align-items: center;
            font-size: 12px;
            color: #909399;
            margin-top: auto;

            .author {
              color: #606266;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              max-width: calc(100% - 75px);
              margin-right: 10px;
              &::before {
                content: "";
                display: inline-block;
                width: 4px;
                height: 4px;
                border-radius: 50%;
                background-color: #409eff;
                margin-right: 6px;
                flex-shrink: 0;
              }
            }

            .time {
              color: #909399;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              width: 60px;
            }
          }
        }
      }
    }
  }

  // 加载状态样式
  &.el-loading-parent--relative {
    .el-loading-mask {
      background-color: rgba(255, 255, 255, 0.9);
    }
  }

  // 滚动条样式
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  ::-webkit-scrollbar-thumb {
    background: #dcdfe6;
    border-radius: 3px;
  }

  ::-webkit-scrollbar-track {
    background: #f5f7fa;
    border-radius: 3px;
  }
}
</style>
