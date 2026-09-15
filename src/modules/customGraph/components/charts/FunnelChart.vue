<template>
  <div
    class="funnel-chart-container"
    v-loading="loading"
    element-loading-text="正在获取数据..."
    :key="num"
  >
    <!-- 初始提示界面 -->
    <div v-if="!hasData" class="empty-state-box">
      <div class="empty-state">
        <i class="el-icon-data-analysis"></i>
        <p>请配置数据源</p>
      </div>
    </div>
    <!-- 加载状态 -->
    <!-- <div v-else-if="loading" class="loading-state">
      <i class="el-icon-loading"></i>
      <p>数据加载中...</p>
    </div> -->
    <!-- 图表容器 -->
    <div v-show="!loading" v-else ref="chart" class="chart-container"></div>
  </div>
</template>

<script>
import * as echarts from "echarts";
import { postDataUrl } from "@/modules/customPortal/api/pageManagement";
export default {
  name: "FunnelChart",
  props: {
    id: String,
    config: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      num: 0,
      chart: null,
      resizeTimer: null,
      observer: null,
      hasData: false,
      loading: false,
      defaultConfig: {
        title: "漏斗图",
        seriesData: [],
        color: [],
        dataSourceType: "dynamic", // 默认为动态数据源
        dataUrl: "" // 默认动态数据源URL
      }
    };
  },
  watch: {
    config: {
      handler() {
        this.renderChart();
      },
      immediate: true,
      deep: true
    }
  },
  mounted() {
    console.log(123123);
    this.$nextTick(() => {
      setTimeout(() => {
        this.initChart();
        window.addEventListener("resize", this.resizeHandler);
        this.$bus.on("chart-resize", this.handleChartResize);
        this.$bus.on("chart-update", this.handleChartUpdate);
        this.$bus.on("data-source-change", this.handleDataSourceChange);
        this.$bus.on(`chart-reset-${this.id}`, this.resetChart);
        // 添加ResizeObserver监听容器大小变化
        if (window.ResizeObserver) {
          this.observer = new ResizeObserver(this.resizeHandler);
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
    this.$bus.off("data-source-change", this.handleDataSourceChange);
    this.$bus.off(`chart-reset-${this.id}`, this.resetChart);
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    clearTimeout(this.resizeTimer);
  },
  methods: {
    initChart() {
      if (!this.$refs.chart) {
        setTimeout(() => {
          this.initChart();
        }, 100);
        return;
      }
      this.chart = echarts.init(this.$refs.chart);
      this.renderChart();
    },
    async renderChart() {
      const config = { ...this.config };

      // 如果是动态数据源，尝试获取数据
      if (config.dataSourceType === "dynamic" && config.dataUrl) {
        await this.fetchDynamicData(config);
      } else if (
        config.dataSourceType === "static" &&
        config.tempStaticDataStr
      ) {
        // 使用静态数据
        config.seriesData = config.tempStaticDataStr.seriesData || [];
        config.color = config.tempStaticDataStr.color;
      }

      // 检查是否有数据
      if (!config.seriesData || config.seriesData.length === 0) {
        this.hasData = false;
        return;
      }
      this.hasData = true;

      // 检查图表实例是否存在，如果不存在则尝试重新初始化
      if (!this.chart && this.$refs.chart) {
        try {
          this.chart = echarts.init(this.$refs.chart);
        } catch (error) {
          console.error("图表初始化失败:", error);
          return;
        }
      }

      // 如果图表实例仍然不存在，则退出
      if (!this.chart) {
        console.warn("图表实例不存在，无法设置选项");
        return;
      }

      const option = {
        title: {
          show: false,
          text: config.title,
          left: "center",
          textStyle: {
            color: "#303133"
          }
        },
        tooltip: {
          trigger: "item",
          formatter: "{a} <br/>{b} : {c}%"
        },
        series: [
          {
            name: "漏斗图",
            type: "funnel",
            left:
              config.marginLeft === 50
                ? "center"
                : `${config.marginLeft / 2.5}%`,
            top: config.marginTop || 20,
            // right:
            //   config.marginRight === 50
            //     ? "center"
            //     : `${config.marginRight / 2.5}%`,
            bottom: config.marginBottom || 20,
            center: ["50%", "50%"],
            min: 0,
            max: 100,
            width: "75%",
            minSize: "0%",
            maxSize: "100%",
            sort: "descending",
            gap: 2,
            label: {
              show: true,
              position: "inside",
              fontSize: 12,
              color: "#fff"
            },
            labelLine: {
              length: 10,
              lineStyle: {
                width: 1,
                type: "solid"
              }
            },
            itemStyle: {
              borderColor: "#fff",
              borderWidth: 1
            },
            emphasis: {
              label: {
                fontSize: 12
              }
            },
            data: config.seriesData,
            color: config.color
          }
        ]
      };

      try {
        this.chart.setOption(option);
      } catch (error) {
        console.error("设置图表选项失败:", error);
      }
    },
    resetChart() {
      if (this.chart) {
        this.chart.clear();
      }
    },
    handleChartResize(id) {
      if (id === this.id) {
        this.$nextTick(() => {
          this.resizeHandler();
        });
      }
    },

    handleChartUpdate(id) {
      if (id === this.id && this.chart) {
        this.renderChart();
      }
    },

    async handleDataSourceChange({ componentId }) {
      if (componentId === this.id) {
        this.renderChart();
      }
    },

    // 获取动态数据源数据
    async fetchDynamicData(config) {
      try {
        let mockResponse = {
          seriesData: [],
          mockResponse: []
        };
        if (config.dataList) {
          mockResponse = config.dataList;
        } else {
          this.loading = true;
          const { data, code } = await postDataUrl(config.dataUrl, false);
          if (code !== "1") {
            this.$message.error("API请求失败");
            return;
          }
          mockResponse = data;
          this.$set(this.config, "dataList", data);
          this.loading = false;
        }

        // 更新配置
        config.seriesData = mockResponse.seriesData;
        config.color = mockResponse.color;
      } catch (error) {
        console.error("获取动态数据失败:", error);
        this.loading = false;

        // 显示错误提示
        // this.$message && this.$message.error("获取数据失败，已使用默认数据");
      }
    },

    resizeHandler() {
      if (this.chart) {
        if (
          this.$refs.chart &&
          this.$refs.chart.offsetHeight &&
          this.$refs.chart.offsetWidth
        ) {
          this.num++;
          this.chart.resize({
            animation: {
              duration: 300
            }
          });
          setTimeout(() => {
            this.initChart();
          }, 50);
        } else {
          this.initChart();
        }
      } else {
        this.initChart();
      }
    }
  }
};
</script>

<style lang="less" scoped>
.funnel-chart-container {
  width: 100%;
  height: 100%;
  padding: 10px;
  box-sizing: border-box;
  position: relative;
}
.chart-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
.empty-state-box {
  position: relative;
  width: 100%;
  height: 100%;
  background: #fff;
}
.empty-state,
.loading-state {
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
  // position: absolute;
  // top: 0;
  // left: 0;
  // right: 0;
  // bottom: 0;
  background-color: #fff;
  z-index: 10;
  margin: 0;
  padding: 0;
}

.empty-state i,
.loading-state i {
  font-size: 48px;
  margin-bottom: 10px;
}

.loading-state i {
  color: #409eff;
  animation: spin 1.5s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.empty-state p,
.loading-state p {
  font-size: 14px;
  margin: 0;
}
</style>
