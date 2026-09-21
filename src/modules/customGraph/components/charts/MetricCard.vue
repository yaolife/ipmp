<template>
  <div class="chart-wrapper">
    <!-- 初始提示界面 -->
    <div v-if="!hasData" class="empty-state">
      <i class="el-icon-data-board"></i>
      <p>请配置指标数据</p>
    </div>
    <!-- 加载状态 -->
    <div v-else-if="loading" class="loading-state">
      <i class="el-icon-loading"></i>
      <p>加载中...</p>
    </div>
    <!-- 指标卡列表容器 -->
    <div v-else class="metric-cards-list">
      <div
        v-for="(item, index) in metricItems"
        :key="index"
        class="metric-card-item"
        :style="{ backgroundColor: mergedConfig.backgroundColor }"
      >
        <!-- 左侧图标 -->
        <div v-if="showIcon" class="metric-icon">
          <img v-if="item.imageUrl" :src="item.imageUrl" />
        </div>
        <!-- 右侧内容 -->
        <div class="metric-content">
          <!-- 指标值 -->
          <div class="metric-value" :style="valueStyle">
            {{ item.value }}
          </div>
          <!-- 指标名称 -->
          <div class="metric-title" :style="titleStyle" :title="item.valueName">
            {{ item.valueName }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * 指标卡组件
 *
 * 用于展示关键业务指标的卡片组件
 * 特性：
 * - 支持自定义标题、值、描述文本
 * - 支持趋势显示（上升/下降）
 * - 支持自定义颜色
 * - 响应式设计，自动适应容器大小变化
 * - 支持通过config属性进行深度定制
 */
import { postDataUrl } from "@/modules/customPortal/api/pageManagement";
export default {
  name: "MetricCard",
  props: {
    id: {
      type: String,
      required: true
    },
    config: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      observer: null,
      resizeTimer: null,
      hasData: false,
      loading: false,
      dynamicData: []
    };
  },
  computed: {
    mergedConfig() {
      return { ...this.config };
    },
    metricItems() {
      // 如果是动态数据源且有数据，则使用动态数据
      if (
        this.mergedConfig.dataSourceType === "dynamic" &&
        this.dynamicData.length > 0
      ) {
        return this.dynamicData;
      }

      // 如果是静态数据源且有静态数据，则使用静态数据
      if (
        this.mergedConfig.dataSourceType === "static" &&
        this.mergedConfig.staticData &&
        this.mergedConfig.staticData.length > 0
      ) {
        return this.mergedConfig.staticData;
      }

      // 默认返回单个指标项
      return [
        {
          valueName: this.mergedConfig.title || "指标名称",
          value: this.mergedConfig.value || "0",
          imageUrl: ""
        }
      ];
    },
    showIcon() {
      return this.mergedConfig.showIcon || false;
    },
    titleStyle() {
      return {
        fontSize: `${this.mergedConfig.titleFontSize || 16}px`,
        color: this.mergedConfig.titleColor || "#606266"
      };
    },
    valueStyle() {
      return {
        fontSize: `${this.mergedConfig.valueFontSize || 36}px`,
        color: this.mergedConfig.valueColor || "#409EFF"
      };
    }
  },
  watch: {
    config: {
      handler() {
        // 不直接设置hasData，而是通过loadData来判断
        this.$nextTick(() => {
          this.updateCardStyle();
          this.loadData();
        });
      },
      deep: true,
      immediate: true
    }
  },
  mounted() {
    // 初始状态设为无数据，等待loadData判断是否真的有数据
    this.hasData = false;
    // this.updateCardStyle();
    // this.loadData();

    // 设置响应式调整
    this.setupResizeObserver();

    // 添加窗口大小变化监听
    window.addEventListener("resize", this.handleResize);

    // 监听数据源变化事件（防御性编程）
    if (this.$bus && typeof this.$bus.$on === "function") {
      this.$bus.$on("data-source-change", this.handleDataSourceChange);
    }
  },
  beforeDestroy() {
    // 清理观察器
    if (this.observer) {
      this.observer.disconnect();
    }

    // 移除窗口大小变化监听
    window.removeEventListener("resize", this.handleResize);

    // 清除计时器
    if (this.resizeTimer) {
      clearTimeout(this.resizeTimer);
    }

    // 移除数据源变化事件监听（防御性编程）
    if (this.$bus && typeof this.$bus.$off === "function") {
      this.$bus.$off("data-source-change", this.handleDataSourceChange);
    }
  },
  methods: {
    // 加载数据
    loadData() {
      if (!this.mergedConfig) {
        this.hasData = false;
        return;
      }

      // 根据数据源类型加载数据
      if (this.mergedConfig.dataSourceType === "dynamic") {
        if (this.mergedConfig.dataList) {
          this.hasData = true;
          this.dynamicData = this.mergedConfig.dataList;
        } else {
          this.loadDynamicData();
        }

        // hasData将在loadDynamicData中设置
      } else {
        // 静态数据处理
        if (
          this.mergedConfig.staticData &&
          this.mergedConfig.staticData.length > 0 &&
          this.hasValidStaticData()
        ) {
          // 有有效的静态数据
          this.hasData = true;
          // 清空动态数据，确保使用静态数据
          this.dynamicData = [];
        } else {
          // 没有有效的静态数据
          this.hasData = false;
        }
      }
    },

    // 检查是否有有效的静态数据
    hasValidStaticData() {
      if (
        !this.mergedConfig.staticData ||
        this.mergedConfig.staticData.length === 0
      ) {
        return false;
      }

      // 至少有一个指标项有名称或值
      return this.mergedConfig.staticData.some(
        item =>
          (item.valueName && item.valueName.trim() !== "") ||
          (item.value && item.value.toString().trim() !== "")
      );
    },

    // 加载动态数据
    async loadDynamicData() {
      // 设置加载状态
      this.loading = true;
      this.hasData = false; // 加载过程中不显示数据
      const { data, code } = await postDataUrl(
        this.mergedConfig.dataUrl.trim()
      );
      this.loading = false;

      if (code !== "1") {
        this.$message.error("API请求失败");
        return;
      }
      this.hasData = true;
      this.dynamicData = data;
      this.$set(this.config, "dataList", data);
    },

    // 处理数据源变化事件
    handleDataSourceChange(event) {
      if (event && event.componentId === this.id) {
        // 重新加载数据
        this.loadData();

        // 如果配置中包含静态数据，确保hasData为true
        if (
          this.mergedConfig.staticData &&
          this.mergedConfig.staticData.length > 0
        ) {
          this.hasData = true;
        }
      }
    },

    updateCardStyle() {
      const container = this.$el.querySelector(".metric-card-container");
      if (container && this.mergedConfig.backgroundColor) {
        container.style.backgroundColor = this.mergedConfig.backgroundColor;
      }
    },
    setupResizeObserver() {
      if (window.ResizeObserver) {
        this.observer = new ResizeObserver(this.handleResize);
        const container = this.$el.querySelector(".metric-card-container");
        if (container) {
          this.observer.observe(container);
        }
      }
    },
    handleResize() {
      // 使用防抖处理resize事件
      if (this.resizeTimer) {
        clearTimeout(this.resizeTimer);
      }
      this.resizeTimer = setTimeout(() => {
        this.updateCardStyle();
      }, 200);
    }
  }
};
</script>

<style lang="less" scoped>
.chart-wrapper {
  width: 100%;
  height: 100%;
  padding: 10px;
  box-sizing: border-box;
  overflow-y: auto;
}

/* 自定义滚动条样式 */
.chart-wrapper::-webkit-scrollbar {
  width: 4px;
}

.chart-wrapper::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.chart-wrapper::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 2px;
}

.chart-wrapper::-webkit-scrollbar-thumb:hover {
  background: #909399;
}

.empty-state,
.loading-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  min-height: 120px;
  color: #909399;
}

.empty-state i,
.loading-state i {
  font-size: 32px;
  margin-bottom: 10px;
}

.loading-state i {
  color: #409eff;
}

.metric-cards-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  width: 100%;
  justify-content: flex-start;
}

/* 当只有一个指标卡时，让它居左显示 */
.metric-cards-list:only-child {
  justify-content: flex-start;
}

.metric-card-item {
  flex: 1 1 calc(50% - 6px);
  min-width: calc(50% - 6px);
  max-width: calc(50% - 6px);
  height: 120px;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #ebeef5;
  display: flex;
  align-items: center;
  box-sizing: border-box;
}

.metric-icon {
  font-size: 24px;
  margin-right: 15px;
  color: #409eff;
  flex-shrink: 0;
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.metric-icon img {
  width: 100%;
  height: 100%;
}

.metric-content {
  flex: 1;
  min-width: 0;
}

.metric-value {
  font-weight: bold;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.metric-title {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty-state {
  width: 100%;
  text-align: center;
  font-size: 14px;
}

@media (max-width: 768px) {
  .metric-card-item {
    flex: 1 1 100%;
    min-width: 100%;
    max-width: 100%;
  }
}
</style>
