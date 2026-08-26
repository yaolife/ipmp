<template>
  <div
    class="radar-chart-container"
    v-loading="loading"
    element-loading-text="正在获取数据..."
  >
    <!-- 初始提示界面 -->
    <div v-if="!hasData" class="empty-state-box">
      <div class="empty-state">
        <i class="el-icon-data-analysis"></i>
        <p>请配置数据源</p>
      </div>
    </div>
    <!-- 图表容器 -->
    <div v-show="!loading" v-else ref="chart" style="width: 100%;height: 100%"></div>
  </div>
</template>

<script>
import * as echarts from "echarts";
import { postDataUrl } from "@/modules/customPortal/api/pageManagement";
export default {
  name: "RadarChart",
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
      loading:false,
      chart: null,
      resizeTimer: null,
      observer: null, // 添加ResizeObserver引用
      hasData: false, // 添加数据状态标记
      ajaxIndex: 0
    };
  },
  watch: {
    config: {
      handler(newVal) {
        // console.log("newVal", newVal);
        if (!newVal.dataSourceType) {
          return;
        }
        this.updateChartWithConfig(newVal);
      },
      immediate: true,
      deep: true
    }
  },
  mounted() {
    this.$nextTick(() => {
      setTimeout(() => {
        this.initChart();
        window.addEventListener("resize", this.resizeHandler);
        this.$bus.on("chart-resize", this.handleChartResize);
        this.$bus.on("chart-update", this.handleChartUpdate);
        this.$bus.on("chart-config-saved", this.handleChartUpdate);
        this.$bus.on("data-source-change", this.handleDataSourceChange);

        // 初始化ResizeObserver来监听容器大小变化
        if (window.ResizeObserver) {
          this.observer = new ResizeObserver(() => {
            this.handleResize();
          });
          // 监听图表容器的大小变化
          if (this.$refs.chart) {
            this.observer.observe(this.$refs.chart);
          }
        }

        this.resizeHandler();
      }, 100);
    });
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose();
      this.chart = null;
    }
    window.removeEventListener("resize", this.resizeHandler);
    this.$bus.off("chart-resize", this.handleChartResize);
    this.$bus.off("chart-update", this.handleChartUpdate);
    this.$bus.off("chart-config-saved", this.handleChartUpdate);
    this.$bus.off("data-source-change", this.handleDataSourceChange);

    // 清理ResizeObserver
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    clearTimeout(this.resizeTimer);
  },
  methods: {
    async handleDataSourceChange({ componentId }) {
      if (componentId === this.id) {
        await this.updateChartWithConfig(this.config);
      }
    },

    async updateChartWithConfig(config) {
      if (!config) return;

      try {
        let chartData;
        if (config.dataSourceType === "dynamic") {
          if (!config.dataUrl) {
            throw new Error("动态数据源URL不能为空");
          }
          // 从动态数据源获取数据
          chartData = await this.fetchDynamicData(config.dataUrl);
        } else if (config.dataSourceType === "static") {
          if (
            !config.tempStaticDataStr ||
            !config.tempStaticDataStr.indicator ||
            !config.tempStaticDataStr.series
          ) {
            throw new Error("静态数据不完整");
          }
          // 使用静态数据
          chartData = config.tempStaticDataStr;
        }
        // 验证数据格式
        if (!chartData || !chartData.indicator || !chartData.series) {
          // throw new Error("数据格式不正确");
        }

        this.hasData = true;
        this.renderChartWithData(chartData);
      } catch (error) {
        console.error("更新图表数据失败:", error);
        // this.$message.error(error.message || "更新图表数据失败");
        this.hasData = false;
        this.resetChart();
      }
    },

    async fetchDynamicData(url) {
      if (this.config.dataList) {
        return this.config.dataList;
      } else {
        this.loading = true;
        const { data, code } = await postDataUrl(url.trim(), false);
        this.loading = false;
        if (code !== "1") {
          this.$message.error("API请求失败");
          return;
        }
        this.$set(this.config, "dataList", data);
        return data;
      }
    },

    initChart() {
      if (!this.$refs.chart) {
        setTimeout(() => {
          this.initChart();
        }, 100);
        return;
      }

      this.chart = echarts.init(this.$refs.chart);

      // 初始化时检查是否有配置数据
      if (this.config) {
        this.updateChartWithConfig(this.config);
      }
    },

    renderChartWithData(data) {
      if (!this.chart) return;

      this.chart.clear();

      const config = { ...this.config };
      const option = {
        title: {
          show: false,
          text: config.title
        },
        tooltip: {
          trigger: "item"
        },
        legend: {
          show: false
        },
        radar: {
          shape: "circle",
          center: [`${config.marginLeft}%`, `${config.marginTop}%`], // 根据marginLeft和marginTop调整中心点位置
          radius: "70%", // 控制雷达图大小
          indicator: data.indicator || []
        },
        series: data.series.map(series => ({
          type: "radar",
          data: series.data || []
        }))
      };

      this.chart.setOption(option);
    },

    renderChart() {
      // 兼容旧的调用方式，转发到新的数据处理方法
      this.updateChartWithConfig(this.config);
    },

    resetChart() {
      if (this.chart) {
        this.chart.clear();
      }
      this.hasData = false;
    },

    handleResize() {
      if (this.chart) {
        clearTimeout(this.resizeTimer);
        this.resizeTimer = setTimeout(() => {
          this.chart.resize({
            animation: {
              duration: 300
            }
          });
        }, 100);
      }
    },

    resizeHandler() {
      // 如果图表不存在，则初始化图表
      if (!this.chart) {
        this.initChart();
        return;
      }

      // 确保图表存在且容器有尺寸
      if (
        this.chart &&
        this.$refs.chart &&
        this.$refs.chart.offsetWidth &&
        this.$refs.chart.offsetHeight
      ) {
        // 调用已有的handleResize方法来处理图表大小调整
        this.handleResize();
      }
    },

    handleChartResize(id) {
      if (id === this.id) {
        this.resizeHandler();
      }
    },

    handleChartUpdate(id) {
      if (id === this.id || id.id === this.id) {
        this.updateChartWithConfig(this.config);
      }
    }
  }
};
</script>

<style scoped>
.radar-chart-container {
  width: 100%;
  height: 100%;
  padding: 10px;
  box-sizing: border-box;
  position: relative;
}
.empty-state-box {
  position: relative;
  width: 100%;
  height: 100%;
  background: #fff;
}
.empty-state {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
}
.empty-state i {
  font-size: 48px;
  margin-bottom: 10px;
}

.empty-state p {
  font-size: 14px;
  margin: 0;
}
</style>
