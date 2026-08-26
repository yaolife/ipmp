<template>
  <div class="chart-wrapper">
    <!-- 初始提示界面 -->
    <div v-if="!hasData" class="empty-state">
      <i class="el-icon-data-analysis"></i>
      <p>请配置数据源</p>
    </div>
    <!-- 图表容器 -->
    <div v-else ref="chartContainer" class="chart-container"></div>
  </div>
</template>

<script>
/**
 * 柱状图组件
 *
 * 基于ECharts实现的柱状图可视化组件
 * 用于展示分类数据的对比分析，支持多系列数据展示
 * 特性：
 * - 支持自定义标题、图例、背景色等
 * - 响应式设计，自动适应容器大小变化
 * - 支持显示数据标签
 * - 可通过config属性进行深度定制
 * - 支持事件总线通信，实现组件间协同
 */
import * as echarts from "echarts";
import { postDataUrl } from "@/modules/customPortal/api/pageManagement";

export default {
  name: "BarChart",
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
      chart: null,
      observer: null,
      resizeTimer: null, // 添加用于防抖的计时器
      hasData: false,
      defaultConfig: {
        backgroundColor: "#ffffff",
        showLegend: true,
        showTitle: true,
        barColors: ["#409EFF", "#67C23A", "#E6A23C"],
        showValue: false
      },
      defaultOption: {
        title: {
          show: false,
          text: "销售数据",
          left: "center",
          top: "10px",
          textStyle: {
            fontSize: 16
          }
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow"
          }
        },
        legend: {
          data: ["直接访问", "邮件营销", "联盟广告"],
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
          data: ["1月", "2月", "3月", "4月", "5月", "6月"],
          axisLabel: {
            interval: 0,
            fontSize: 12,
            rotate: 0
          }
        },
        yAxis: {
          type: "value",
          name: "销售额",
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
  watch: {
    config: {
      handler(newConfig, oldConfig) {
        console.log('hahah')
        if (newConfig && oldConfig && newConfig.dataUrl !== oldConfig.dataUrl) {
          this.$set(this.config, "dataList", null);
        }
        this.updateChartWithConfig(newConfig);
      },
      immediate: true,
      deep: true
    }
  },
  mounted() {
    console.log('mounted')
    this.$nextTick(() => {
      setTimeout(() => {
        this.initChart();
        window.addEventListener("resize", this.resizeHandler);
        this.$bus.on("chart-resize", this.handleChartResize);
        this.$bus.on("chart-update", this.handleChartUpdate);
        this.$bus.on("data-source-change", this.handleDataSourceChange);

        // 初始化ResizeObserver来监听容器大小变化
        if (window.ResizeObserver) {
          this.observer = new ResizeObserver(() => {
            if (this.chart) {
              // 使用防抖处理的resize
              clearTimeout(this.resizeTimer);
              this.resizeTimer = setTimeout(() => {
                if (
                  this.$refs.chartContainer &&
                  this.$refs.chartContainer.offsetWidth &&
                  this.$refs.chartContainer.offsetHeight
                ) {
                  this.chart.resize({
                    animation: {
                      duration: 300
                    }
                  });
                }
              }, 100);
            }
          });

          // 观察外层容器的大小变化
          const wrapper = this.$el;
          if (wrapper) {
            console.log('xsasdf')
            this.observer.observe(wrapper);
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
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    // 清理防抖计时器
    clearTimeout(this.resizeTimer);
  },
  methods: {
    async handleDataSourceChange({ componentId }) {
      console.log('456567')
      if (componentId === this.id) {
        await this.updateChartWithConfig(this.config);
      }
    },

    async updateChartWithConfig(config) {
      if (!config) return;

      try {
        let chartData;
        if (config.dataSourceType === "dynamic" && config.dataUrl) {
          // 从动态数据源获取数据
          if (config.dataList && config.dataList.series.length > 0) {
            chartData = config.dataList;
          } else {
            chartData = await this.fetchDynamicData(config.dataUrl);
          }
        } else if (
          config.dataSourceType === "static" &&
          config.tempStaticDataStr
        ) {
          // 使用静态数据
          chartData = config.tempStaticDataStr;
        }
        if (chartData) {
          this.hasData = true;
          this.updateChartWithData(chartData);
        } else {
          this.hasData = false;
        }
      } catch (error) {
        // this.hasData = false;
      }
    },

    async fetchDynamicData(url) {
      const { data = {}, code = "2" } = await postDataUrl(url.trim());
      if (code !== "1") {
        this.$message.error("API请求失败");
        return;
      }
      this.$set(this.config, "dataList", data);
      return data;
    },

    updateChartWithData(data) {
      if (!this.chart) return;

      const barGap = "10%"; // seriesCount > 2 ? "30%" : barWidth > 15 ? "50%" : "30%";

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
          // 确保类目轴有足够的空间
          axisTick: {
            alignWithLabel: true
          },
          // 增加轴线间距
          axisLabel: {
            ...this.defaultOption.xAxis.axisLabel,
            margin: 10
          }
        },
        yAxis: {
          ...this.defaultOption.yAxis,
          name: data.yAxis.name
        },
        series: data.series.map(series => ({
          ...series,
          type: "bar",
          barWidth: `${this.config.barWidth / 1.7}%`,
          // 设置柱子间距，避免重叠
          barGap: barGap,
          // 设置不同类目间的间距
          barCategoryGap: "10%",
          itemStyle: {
            color: series.color
          }
        }))
      };

      // 更新图表配置
      this.chart.setOption(option, true);
    },

    handleChartResize(id) {
      console.log('朱光图')
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
          // this.initChart();
        }, 100);
        return;
      }

      if (!this.chart) {
        this.chart = echarts.init(this.$refs.chartContainer);
      }

      // 初始化时检查是否有配置数据
      if (this.config) {
        const chartData = this.config.tempStaticDataStr || this.config.dataList;
        this.hasData = true;
        this.updateChartWithData(chartData);
      }
    },

    resizeHandler() {
      console.log('12334')
      if (this.chart) {
        if (
          this.$refs.chartContainer &&
          this.$refs.chartContainer.offsetHeight &&
          this.$refs.chartContainer.offsetWidth
        ) {
          this.chart.resize();
        } else {
          console.log(123123123)
          this.initChart();
        }
      } else {
        console.log(66666)
        this.initChart();
      }
    },

    handleChartUpdate(id) {
      console.log('朱光图1')
      if (id === this.id && this.chart) {
        this.updateChartWithConfig(this.config);
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
