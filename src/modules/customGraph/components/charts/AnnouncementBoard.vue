<template>
  <div
    class="announcement-board"
    :class="themeClass"
    v-loading="loading"
    :style="{ 'padding-right': config.imageWidth === '1' ? '16px' : 0 }"
    element-loading-text="正在获取公告数据..."
  >
    <div
      :class="['content', { 'content-box': config.imageWidth === '1' }]"
      v-if="
        (config &&
          Array.isArray(config.announcements) &&
          config.announcements.length > 0) ||
          (config && config.dataUrl) ||
          (config && config.image)
      "
    >
      <template v-if="config.showImage">
        <div
          class="left-image"
          v-if="config.imageWidth !== '0'"
          :style="imageWidthStyle"
        >
          <img
            :src="config.image || ''"
            alt="公告图片"
            v-if="config.image"
            @error="handleImageError"
          />
          <div class="default-image" v-else>图片</div>
        </div>
      </template>

      <div class="right-content" :style="contentWidthStyle">
        <div
          v-for="(item, index) in displayAnnouncements"
          :key="index"
          class="announcement-item"
          :style="announcementItemStyle"
        >
          <div class="img-container">
            <div
              class="left-image"
              v-if="config.imageWidth !== '0' && config.theme === 'simple'"
              :style="imageWidthStyle"
            >
              <img
                :src="config.image || ''"
                alt="公告图片"
                v-if="config.image"
                @error="handleImageError"
              />
              <div class="default-image" v-else>图片</div>
            </div>
          </div>
          <el-tooltip
            effect="light"
            placement="top"
            :disabled="!isTextOverflow"
            :content="item.content || ''"
          >
            <div
              class="description"
              ref="description"
              @mouseenter="checkTextOverflow($event)"
              :style="descriptionStyle"
            >
              {{ item.content || "" }}
            </div>
          </el-tooltip>
          <div class="date">{{ item.date || "" }}</div>
        </div>
      </div>
    </div>
    <div class="empty-content" v-else>
      <div class="empty-text">
        <template v-if="loading">
          <i class="el-icon-loading"></i> 正在加载数据...
        </template>
        <template v-else-if="config && config.dataUrl">
          <i class="el-icon-connection"></i> 等待数据加载
        </template>
        <template v-else>
          <i class="el-icon-edit"></i> 请配置公告内容或数据源
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { dataUrl } from "@/modules/customPortal/api/pageManagement";

/**
 * 公告栏组件
 *
 * 用于展示系统公告、重要通知等信息
 * 可通过config配置公告内容、样式和展示方式
 * 支持滚动展示、置顶公告等功能
 */
export default {
  data() {
    return {
      isTextOverflow: false,
      loadedAnnouncements: [],
      loading: false,
      updateTrigger: 0, // 添加更新触发器
      dataSourceType: "static" // 数据源类型：static 或 dynamic
    };
  },
  computed: {
    filteredAnnouncements() {
      if (
        !this.config ||
        !this.config.announcements ||
        !Array.isArray(this.config.announcements)
      ) {
        return [];
      }
      return this.config.announcements
        .filter(item => !!item)
        .map(item => ({
          ...item,
          type: item.type || "normal"
        }));
    },
    themeClass() {
      return `theme-${this.config.theme || "default"}`;
    },
    imageWidthStyle() {
      const width = parseFloat(this.config.imageWidth || 0.25) * 100;
      console.log("width", this.config.imageWidth);
      return {
        width: `${width}%`
      };
    },
    contentWidthStyle() {
      const imageWidth = parseFloat(this.config.imageWidth || 0.25);
      const contentWidth = (1 - imageWidth) * 100;
      return {
        width: this.config.showImage ? `calc(${contentWidth}% - 8px)` : "100%"
      };
    },
    announcementItemStyle() {
      return {
        // lineHeight: `${this.config.lineHeight || 20}px`
      };
    },
    descriptionStyle() {
      return {
        lineHeight: `${this.config.lineHeight || 20}px`,
        color: this.config.textColor || "#333333"
      };
    },
    displayAnnouncements() {
      // 使用updateTrigger确保计算属性在配置更新时重新计算
      this.updateTrigger; // 仅用于触发计算属性重新计算

      // 根据数据源类型返回不同的数据
      if (this.dataSourceType === "dynamic") {
        // 动态数据源：如果正在加载，返回空数组
        if (this.loading) {
          return [];
        }
        // 使用从API加载的数据
        return this.loadedAnnouncements.slice(0, this.config.maxLines || 5);
      } else {
        // 静态数据源：直接使用配置中的数据
        return this.filteredAnnouncements.slice(0, this.config.maxLines || 5);
      }
    }
  },
  watch: {
    "config.dataUrl": {
      immediate: true,
      handler(newUrl) {
        if (newUrl) {
          // 设置为动态数据源
          this.dataSourceType = "dynamic";
          if (this.config.dataList) {
            this.loadedAnnouncements = this.config.dataList;
          } else {
            this.fetchAnnouncementData(newUrl);
          }
        } else {
          // 如果dataUrl被清空，切换到静态数据源
          this.dataSourceType = "static";
          this.loadedAnnouncements = [];
          this.updateTrigger++;
        }
      }
    },
    "config.image": {
      immediate: true,
      handler(newImage) {
        if (newImage) {
          // 强制组件重新渲染以显示新图片
          this.$forceUpdate();
        }
      }
    },
    "config.announcements": {
      deep: true,
      handler() {
        // 当announcements配置变化时，确保组件更新
        if (this.dataSourceType === "static") {
          this.updateTrigger++;
        }
      }
    }
  },
  methods: {
    checkTextOverflow(event) {
      const element = event.target;
      this.isTextOverflow = element.scrollWidth > element.clientWidth;
    },
    // 强制刷新组件
    refreshComponent() {
      this.$forceUpdate();
    },
    // 处理图片加载错误
    handleImageError(e) {
      // 显示错误消息
      this.$message({
        message: "公告图片加载失败，请检查图片链接",
        type: "warning",
        duration: 3000
      });
      // 隐藏错误的图片
      e.target.style.display = "none";
      // 显示默认的占位符
      const parentElement = e.target.parentElement;
      if (parentElement) {
        const defaultImage = document.createElement("div");
        defaultImage.className = "default-image";
        defaultImage.textContent = "图片加载失败";
        parentElement.appendChild(defaultImage);
      }
    },
    // 初始化数据源类型
    initDataSourceType() {
      if (this.config && this.config.dataUrl) {
        this.dataSourceType = "dynamic";
      } else {
        this.dataSourceType = "static";
      }
    },

    // 更新数据源类型
    updateDataSourceType() {
      const newType = this.config && this.config.dataUrl ? "dynamic" : "static";
      if (this.dataSourceType !== newType) {
        this.dataSourceType = newType;
        // 切换数据源类型时清空已加载的数据
        this.loadedAnnouncements = [];
      }
    },

    async fetchAnnouncementData(url) {
      if (!url || this.dataSourceType !== "dynamic") return;

      this.loading = true;
      try {
        try {
          const response = await dataUrl(this.config.dataUrl.trim(), false);
          if (response.data && Array.isArray(response.data.list)) {
            this.loadedAnnouncements = response.data.list;
            this.$set(this.config, "dataList", this.loadedAnnouncements);
          } else {
            throw new Error("返回数据格式不正确");
          }
        } catch (apiError) {
          this.loadedAnnouncements = [];
        }
      } catch (error) {
        // this.$message.error("获取公告数据失败");
      } finally {
        this.loading = false;
      }
    }
  },
  name: "AnnouncementBoard",
  mounted() {
    // 初始化数据源类型
    this.initDataSourceType();

    // 监听图表更新事件
    this.$bus.on(`chart-update`, chartId => {
      if (chartId === this.id) {
        // 更新数据源类型
        this.updateDataSourceType();

        // 根据数据源类型处理数据
        if (this.dataSourceType === "dynamic") {
          // 动态数据源：重新获取数据
          if (this.config && this.config.dataUrl) {
            this.fetchAnnouncementData(this.config.dataUrl);
          }
        } else {
          // 静态数据源：清空已加载数据，让组件使用新的静态数据
          this.loadedAnnouncements = [];
          this.updateTrigger++;
        }

        // 显示配置已保存的消息
        this.$message({
          message: "配置已保存",
          type: "success",
          duration: 2000
        });
      }
    });

    // 初始化时，如果有图片或数据源，确保组件正确显示
    this.$nextTick(() => {
      if (this.config && (this.config.image || this.config.dataUrl)) {
        this.refreshComponent();
      }
    });
  },
  beforeDestroy() {
    // 移除事件监听
    this.$bus.off(`chart-update`);
  },
  props: {
    id: {
      type: String,
      required: true
    },
    config: {
      type: Object,
      required: true,
      validator: value => {
        // 如果announcements不存在或不是数组，我们会在组件内部处理
        if (!value.announcements) {
          return true; // 允许announcements不存在
        }

        // 检查announcements是否为数组
        if (!Array.isArray(value.announcements)) {
          return false;
        }

        // 如果数组为空，允许通过验证
        if (value.announcements.length === 0) {
          return true;
        }

        // 如果数组不为空，检查每个公告项是否包含content属性
        return value.announcements.every(item => {
          if (!item || !item.content) {
            return false;
          }
          return true;
        });
      },
      default: () => ({
        title: "",
        theme: "default",
        lineHeight: 1.4,
        textColor: "#333333",
        maxLines: 5,
        image: "",
        imageWidth: "0.25",
        moreUrl: "",
        showImage: false,
        dataUrl: "",
        announcements: []
      })
    }
  }
};
</script>

<style lang="less" scoped>
.chart-component {
  box-sizing: border-box;
}
.announcement-board {
  // width: 100%;
  padding: 16px 0 16px 16px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  .content-box {
    display: block !important;
    overflow-x: hidden;
    overflow-y: auto;
    .left-image {
      margin-bottom: 12px;
      height: 50% !important;
    }
    .right-content {
      width: 100% !important;
    }
  }
  .content {
    width: 100%;
    height: 100%;
    display: flex;
    margin: 0 !important;
    .left-image {
      background: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      flex-shrink: 0;
      margin-right: 8px;
      min-height: 120px;
      height: 100%;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .default-image {
        color: #999;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        background-color: #f5f5f5;
        border: 1px dashed #ddd;
        border-radius: 4px;
        font-size: 14px;
      }
    }

    .right-content {
      display: flex;
      flex-direction: column;
      padding-right: 16px;
      overflow-y: scroll;
      gap: 12px;

      .announcement-item {
        padding-bottom: 12px;
        border-bottom: 1px dashed #f0f0f0;
        display: flex;
        justify-content: space-between;
        &:last-child {
          padding-bottom: 0;
          border-bottom: none;
        }

        .description {
          font-size: 14px;
          color: #333;
          line-height: 20px;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          width: calc(100% - 67px);
        }

        .date {
          font-size: 12px;
          color: #999;
          text-align: right;
          margin-top: 3px;
          width: 67px;
        }
      }
    }
  }

  // 主题样式
  &.theme-default {
    .img-container {
      display: none;
    }
    // background: #fff;
    // box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &.theme-simple {
    .content {
      &>.left-image {
        display: none !important;
      }
    }
    .img-container {
      width: 60px;
      height: 60px;
      margin-right: 10px;
      .left-image {
        width: 100% !important;
        height: 100% !important;
        min-height: auto !important;
      }
    }
    .right-content {
      width: 100% !important;
    }
    .description {
      width: calc(100% - 140px) !important;
    }
  }

  &.theme-dark {
    .left-image {
      display: none !important;
    }
    .right-content {
      width: 100% !important;
    }
    // background: #2c3e50;
    // color: #fff;
    // box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

    // .header {
    //   border-bottom-color: #34495e;

    //   h3 {
    //     color: #fff;
    //   }

    //   .more-link {
    //     color: #3498db;
    //   }
    // }

    // .announcement-item {
    //   border-bottom-color: #34495e;

    //   .description {
    //     color: #ecf0f1;
    //   }

    //   .date {
    //     color: #bdc3c7;
    //   }
    // }

    // .left-image {
    //   background: #34495e;

    //   .default-image {
    //     color: #bdc3c7;
    //   }
    // }
  }

  .empty-content {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;

    .empty-text {
      color: #999;
      font-size: 14px;
    }
  }
}
</style>
