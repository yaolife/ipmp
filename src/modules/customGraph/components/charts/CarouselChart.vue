<template>
  <div class="carousel-chart" ref="carouselContainer">
    <el-carousel
      v-if="
        internalConfig &&
        internalConfig.items &&
        internalConfig.items.length > 0
      "
      :height="carouselHeight + 'px'"
      :interval="internalConfig.interval"
      :autoplay="internalConfig.autoplay"
      :type="internalConfig.type"
      :arrow="internalConfig.arrow"
      :indicator-position="internalConfig.indicatorPosition"
    >
      <el-carousel-item
        v-for="(item, index) in internalConfig.items"
        :key="index"
      >
        <div
          class="carousel-item"
          :style="{
            backgroundColor: item.bgColor,
            height: carouselHeight + 'px',
            cursor: item.linkUrl ? 'pointer' : 'default',
          }"
          @click="handleItemClick(item)"
        >
          <div v-if="item.image" class="item-image">
            <img :src="item.image" :alt="item.title || '轮播图片'" />
          </div>
          <div class="item-content">
            <h3 v-if="item.title" class="item-title">{{ item.title }}</h3>
            <p v-if="item.description" class="item-description">
              {{ item.description }}
            </p>
          </div>
        </div>
      </el-carousel-item>
    </el-carousel>
    <div v-else class="empty-placeholder">
      <i class="el-icon-picture-outline"></i>
      <p v-if="readonly">暂无轮播内容</p>
      <p v-else>请添加轮播项</p>
    </div>
  </div>
</template>

<script>
/**
 * 轮播图组件
 *
 * 基于Element UI的el-carousel组件实现的轮播图
 * 用于展示多张图片、广告或重要信息的轮播效果
 * 特性：
 * - 支持自定义轮播项（图片、标题、描述）
 * - 可配置轮播间隔、自动播放、指示器位置等
 * - 响应式设计，自动适应容器大小变化
 * - 支持空状态展示
 * - 通过事件总线与其他组件通信，实现联动效果
 */
export default {
  name: "CarouselChart",
  props: {
    /**
     * 图表唯一标识符
     * 用于在多图表场景下区分不同的图表实例
     * 在事件通信和图表更新时使用
     */
    id: {
      type: String,
      required: true,
    },
    /**
     * 是否为只读模式
     * 在只读模式下，不显示编辑相关的UI元素
     * 适用于展示场景
     */
    readonly: {
      type: Boolean,
      default: false,
    },
    /**
     * 轮播图配置对象
     * 用于自定义轮播图的展示效果和内容
     * @example
     * {
     *   height: 300,                // 轮播图高度（像素）
     *   interval: 3000,             // 自动切换间隔（毫秒）
     *   autoplay: true,             // 是否自动播放
     *   type: "card",               // 轮播类型：""(默认)|"card"
     *   arrow: "hover",             // 箭头显示时机："always"|"hover"|"never"
     *   indicatorPosition: "outside", // 指示器位置："outside"|"inside"|"none"
     *   items: [                    // 轮播项数组
     *     {
     *       title: "标题1",         // 轮播项标题
     *       description: "描述1",   // 轮播项描述
     *       imageUrl: "/img/1.jpg", // 图片URL
     *       bgColor: "#f5f7fa",     // 背景颜色
     *       link: "/page1"          // 点击跳转链接
     *     }
     *   ]
     * }
     */
    config: {
      type: Object,
      default: () => ({
        height: 300,
        interval: 2000, // 默认2秒
        autoplay: true,
        type: "",
        arrow: "hover",
        indicatorPosition: "outside",
        items: [],
      }),
    },
  },
  data() {
    return {
      containerHeight: 0,
      internalConfig: this.config,
    };
  },
  computed: {
    carouselHeight() {
      // 如果配置了固定高度，使用配置的高度
      if (this.internalConfig && this.internalConfig.height) {
        return Math.min(
          this.internalConfig.height,
          this.containerHeight || this.internalConfig.height
        );
      }
      // 否则使用容器高度
      return this.containerHeight || 300;
    },
  },
  methods: {
    updateConfig(newConfig) {
      this.internalConfig = { ...this.internalConfig, ...newConfig };
    },
    handleResize() {
      if (this.$refs.carouselContainer) {
        this.containerHeight = this.$refs.carouselContainer.clientHeight;
      }
    },
    handleItemClick(item) {
      // 如果有链接URL，则进行跳转
      if (item.linkUrl && item.linkUrl.trim() !== "") {
        let url = item.linkUrl;

        // 如果URL不包含协议，添加http://前缀
        if (!/^https?:\/\//i.test(url)) {
          url = "http://" + url;
        }

        // 根据配置决定是在新窗口打开还是当前窗口打开
        if (item.openInNewWindow) {
          window.open(url, "_blank", "noopener,noreferrer");
        } else {
          window.location.href = url;
        }
      }
    },
  },
  watch: {
    config: {
      handler(newConfig) {
        this.internalConfig = { ...this.internalConfig, ...newConfig };
      },
      deep: true,
    },
  },
  mounted() {
    // 监听图表更新事件
    this.$bus.on("chart-update", (id) => {
      if (id === this.id) {
        // 从布局中获取最新的配置
        let layout = [];
        if (
          this.$parent &&
          this.$parent.$parent &&
          this.$parent.$parent.layout
        ) {
          layout = this.$parent.$parent.layout;
        }
        const item = layout.find((item) => item.i === this.id);
        if (item && item.config) {
          this.internalConfig = {
            ...this.config, // 保留原始props中的默认值
            ...item.config, // 应用新的配置
          };
        }
      }
    });

    // 监听图表大小调整事件
    this.$bus.on("chart-resize", (id) => {
      if (id === this.id) {
        this.$nextTick(() => {
          this.handleResize();
        });
      }
    });

    // 初始化大小
    this.$nextTick(() => {
      this.handleResize();
      // 确保有默认高度
      if (
        !this.containerHeight &&
        (!this.internalConfig || !this.internalConfig.height)
      ) {
        this.containerHeight = 300;
      }
    });
  },
  beforeDestroy() {
    // 移除事件监听
    this.$bus.off("chart-update");
    this.$bus.off("chart-resize");
  },
};
</script>

<style lang="less" scoped>
.carousel-chart {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;

  :deep(.el-carousel) {
    height: 100%;
    flex: 1;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    .el-carousel__container {
      height: 100%;
    }

    .el-carousel__item {
      overflow: hidden;
      padding: 0;
    }
  }

  .carousel-item {
    width: 100%;
    height: 100%;
    padding: 0;
    box-sizing: border-box;
    position: relative;
    overflow: hidden;

    .item-image {
      width: 100%;
      height: 100%;
      overflow: hidden;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 1;
      display: flex;
      justify-content: center;
      align-items: center;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
    }

    .item-content {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 2;
      padding: 20px;
      background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
      text-align: left;

      .item-title {
        margin: 0 0 8px;
        font-size: 18px;
        color: #fff;
        font-weight: 500;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
      }

      .item-description {
        margin: 0;
        font-size: 14px;
        color: rgba(255, 255, 255, 0.9);
        line-height: 1.4;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
      }
    }
  }

  .empty-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: #909399;

    i {
      font-size: 48px;
      margin-bottom: 16px;
    }

    p {
      margin: 0;
      font-size: 14px;
    }
  }

  :deep(.el-carousel) {
    .el-carousel__mask {
      display: none;
    }

    .el-carousel__arrow {
      background-color: rgba(0, 0, 0, 0.3);
      z-index: 3;

      &:hover {
        background-color: rgba(0, 0, 0, 0.5);
      }
    }

    .el-carousel__indicators {
      z-index: 3;

      &--outside {
        position: absolute;
        bottom: 12px;
        left: 50%;
        transform: translateX(-50%);
        margin: 0;
        padding: 8px 0;
        background-color: rgba(0, 0, 0, 0.3);
        border-radius: 12px;
      }

      &--inside {
        bottom: 12px;
      }

      .el-carousel__button {
        background-color: rgba(255, 255, 255, 0.7);

        &:hover {
          background-color: rgba(255, 255, 255, 0.9);
        }
      }
    }
  }

  .carousel-items-list {
    max-height: calc(2 * 120px); /* 2条数据的高度，每条60px */
    overflow-y: auto;
    padding: 0;
    margin: 0;

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
  }

  .carousel-item-wrapper {
    height: 120px; /* 每个item的固定高度 */
    padding: 10px;
    box-sizing: border-box;
    border-bottom: 1px solid #ebeef5;

    &:last-child {
      border-bottom: none;
    }
  }
}
</style>
