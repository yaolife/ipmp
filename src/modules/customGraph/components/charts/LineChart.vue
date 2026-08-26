<template>
  <!-- 图表容器包装 -->
  <div class="chart-wrapper">
    <!-- 初始提示界面 - 当没有数据时显示 -->
    <div v-if="!hasData" class="empty-state">
      <i class="el-icon-data-analysis"></i>
      <p>请配置数据源</p>
    </div>
    <!-- 图表容器 - 有数据时显示 -->
    <div v-else ref="chartContainer" class="chart-container"></div>
  </div>
</template>

<script>
/**
 * 折线图组件
 *
 * 基于ECharts实现的折线图可视化组件，用于展示数据趋势变化，支持多系列数据展示
 *
 * 主要功能：
 * 1. 支持静态数据和动态API数据两种数据源
 * 2. 支持通过config属性深度定制图表样式和行为
 * 3. 自动响应容器大小变化
 * 4. 通过事件总线实现与其他组件的通信
 *
 * 特性：
 * - 支持自定义标题、图例、背景色等
 * - 响应式设计，自动适应容器大小变化
 * - 支持显示数据标签
 * - 可通过config属性进行深度定制
 * - 支持事件总线通信，实现组件间协同
 *
 * 使用示例：
 * <LineChart id="chart1" :config="chartConfig" />
 *
 * 注意事项：
 * 1. 必须提供唯一的id属性
 * 2. 动态数据源需要配置dataUrl
 * 3. 静态数据需要配置tempStaticDataStr
 */
import * as echarts from "echarts";
import { postDataUrl } from "@/modules/customPortal/api/pageManagement";
export default {
  name: "LineChart",
  props: {
    /**
     * 图表唯一标识符
     * - 用于事件总线通信中识别图表
     * - 必须保证在父组件中唯一
     */
    id: {
      type: String,
      required: true
    },
    /**
     * 图表配置对象
     * - 控制图表的数据源、样式和行为
     * - 支持动态更新，修改后会触发图表重绘
     *
     * 配置项说明：
     * - dataSourceType: 'static'|'dynamic' - 数据源类型
     * - dataUrl: String - 动态数据API地址
     * - tempStaticDataStr: Object - 静态数据
     * - marginLeft/Right/Top/Bottom: Number - 图表边距
     * - smooth: Boolean - 是否平滑曲线
     * - lineWidth: Number - 线条宽度
     */
    config: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      // ECharts实例
      chart: null,
      // ResizeObserver实例，用于监听容器大小变化
      observer: null,
      // 是否有数据标志位
      hasData: false,
      // 默认配置项
      defaultConfig: {
        backgroundColor: "#ffffff", // 图表背景色
        showLegend: true, // 是否显示图例
        showTitle: true, // 是否显示标题
        showValue: false, // 是否显示数值
        smooth: false, // 是否平滑曲线
        lineWidth: 3 // 线条宽度
      },
      defaultOption: {
        title: {
          show: false,
          text: "趋势数据",
          left: "center",
          top: "10px",
          textStyle: {
            fontSize: 16
          }
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            label: {
              backgroundColor: "#6a7985"
            }
          }
        },
        legend: {
          data: ["预期", "实际", "目标"],
          bottom: "5",
          textStyle: {
            fontSize: 12
          },
          itemWidth: 15,
          itemHeight: 10
        },
        grid: {
          top: "50px",
          left: "40px",
          right: "20px",
          bottom: "40px",
          containLabel: true
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: ["1月", "2月", "3月", "4月", "5月", "6月", "7月"],
          axisLabel: {
            interval: 0,
            fontSize: 12,
            rotate: 0
          }
        },
        yAxis: {
          type: "value",
          name: "数值",
          nameTextStyle: {
            padding: [0, 0, 0, 0],
            fontSize: 12
          },
          axisLabel: {
            fontSize: 12
          },
          splitLine: {
            lineStyle: {
              type: "dashed"
            }
          }
        },
        series: []
      }
    };
  },
  // 监听配置变化
  watch: {
    /**
     * 监听config对象变化
     * - 深度监听，任何嵌套属性变化都会触发
     * - 当配置变化时，自动更新图表
     */
    config: {
      handler(newConfig, oldConfig) {
        if (newConfig.dataList) {
          this.hasData = true;
          this.updateChartWithData(newConfig.dataList);
        } else {
          this.updateChartWithConfig(newConfig);
        }
        if (newConfig && oldConfig && newConfig.dataUrl !== oldConfig.dataUrl) {
          this.$set(this.config, "dataList", null);
        }
      },
      immediate: true,
      deep: true // 深度监听
    }
  },
  mounted() {
    this.$nextTick(() => {
      setTimeout(() => {
        this.initChart();
        window.addEventListener("resize", this.resizeHandler);
        this.$bus.on("chart-resize", this.handleChartResize);
        this.$bus.on("chart-update", this.handleChartUpdate);
        this.$bus.on("data-source-change", this.handleDataSourceChange);
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
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  },
  methods: {
    /**
     * 处理数据源变化事件
     * @param {Object} payload - 事件对象
     * @param {String} payload.componentId - 触发事件的组件ID
     */
    async handleDataSourceChange({ componentId }) {
      if (componentId === this.id) {
        await this.updateChartWithConfig(this.config);
      }
    },

    /**
     * 根据配置更新图表
     * @param {Object} config - 图表配置对象
     * @returns {Promise<void>}
     */
    async updateChartWithConfig(config) {
      if (!config) return;

      try {
        let chartData;
        if (config.dataSourceType === "dynamic" && config.dataUrl) {
          // 从动态数据源获取数据
          chartData = await this.fetchDynamicData(config.dataUrl);
        } else if (
          config.dataSourceType === "static" &&
          config.tempStaticDataStr
        ) {
          // 使用静态数据
          chartData = config.tempStaticDataStr;
          this.$set(this.config, "dataList", config.tempStaticDataStr);
        }

        if (chartData) {
          // this.hasData = true;
          this.updateChartWithData(chartData);
        } else {
          // this.hasData = false;
        }
      } catch (error) {
        console.error("更新图表数据失败:", error);
        // this.hasData = false;
      }
    },

    /**
     * 获取动态数据
     * @param {String} url - API地址
     * @returns {Promise<Object>} 图表数据对象
     */
    async fetchDynamicData(url) {
      const response = await postDataUrl(url.trim());
      if (response && response.code !== "1") {
        this.$message.error("API请求失败");
        return;
      }
      this.$set(this.config, "dataList", response && response.data);
      return response && response.data;
    },

    updateChartWithData(data) {
      if (!this.chart) return;

      const option = {
        ...this.defaultOption,
        title: {
          ...this.defaultOption.title,
          ...data.title,
          show: false
        },
        legend: {
          ...this.defaultOption.legend,
          data: data.legend.data
        },
        grid: {
          ...this.defaultOption.grid,
          left: `${this.config.marginLeft}px`,
          right: `${this.config.marginRight}px`,
          top: `${this.config.marginTop}px`,
          bottom: `${this.config.marginBottom}px`
        },
        xAxis: {
          ...this.defaultOption.xAxis,
          data: data.xAxis.data,
          axisTick: {
            alignWithLabel: true
          },
          axisLabel: {
            ...this.defaultOption.xAxis.axisLabel,
            margin: 10
          }
        },
        yAxis: {
          ...this.defaultOption.yAxis,
          name: data.yAxis ? data.yAxis.name : "数值"
        },
        series: data.series.map(series => ({
          ...series,
          type: "line",
          smooth: this.config.smooth || false,
          lineStyle: {
            width: this.config.lineWidth || 3
          },
          symbol: "circle",
          symbolSize: 6,
          itemStyle: {
            color: series.itemStyle ? series.itemStyle.color : series.color
          }
        }))
      };

      // 更新图表配置
      this.chart.setOption(option, true);
    },

    handleChartResize(id) {
      if (id === this.id) {
        this.$nextTick(() => {
          this.resizeHandler();
        });
      }
    },

    initChart() {
      if (
        !this.$refs.chartContainer ||
        !this.$refs.chartContainer.offsetHeight ||
        !this.$refs.chartContainer.offsetWidth
      ) {
        setTimeout(() => {
          this.initChart();
        }, 100);
        return;
      }

      if (!this.chart) {
        this.chart = echarts.init(this.$refs.chartContainer);

        if (window.ResizeObserver) {
          this.observer = new ResizeObserver(() => {
            if (this.chart) {
              this.chart.resize();
            }
          });
          this.observer.observe(this.$refs.chartContainer);
        }
      }

      if (this.config) {
        if (this.config.dataList) {
          this.hasData = true;
          this.updateChartWithData(this.config.dataList);
        } else {
          this.updateChartWithConfig(this.config);
        }
      }
    },

    resizeHandler() {
      if (this.chart) {
        if (
          this.$refs.chartContainer &&
          this.$refs.chartContainer.offsetHeight &&
          this.$refs.chartContainer.offsetWidth
        ) {
          this.chart.resize();
        } else {
          this.initChart();
        }
      } else {
        this.initChart();
      }
    },

    handleChartUpdate(id) {
      if (id === this.id && this.chart) {
        // this.updateChartWithConfig(this.config);
      }
    }
  }
};
</script>

<style lang="less" scoped>
.chart-wrapper {
  width: 100%;
  height: 100%;
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

.empty-state {
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
