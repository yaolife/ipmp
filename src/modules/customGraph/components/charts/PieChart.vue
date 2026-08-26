<template>
  <div ref="chartContainer" class="chart-container">
    <div v-if="loading" class="empty-state">
      <i class="el-icon-loading"></i>
      <p>正在加载...</p>
    </div>
    <div v-else-if="!hasData" class="empty-state">
      <i class="el-icon-data-analysis"></i>
      <p>请配置图表数据或数据源</p>
    </div>
  </div>
</template>

<script>
import * as echarts from "echarts";
import { postDataUrl } from "@/modules/customPortal/api/pageManagement";

/**
 * 饼图组件
 *
 * 基于ECharts实现的环形饼图组件，用于展示数据占比分布情况
 * 特性：
 * - 支持环形和实心饼图展示
 * - 自适应容器大小，响应式布局
 * - 支持自定义配置主题、颜色、标签等样式
 * - 内置动画效果和交互事件
 * - 支持通过事件总线与其他组件通信
 * - 自动处理窗口大小变化和容器尺寸变化
 *
 * @component
 * @example
 * <pie-chart
 *   id="visitor-source"
 *   :config="{
 *     title: { text: '访问来源' },
 *     data: [
 *       { value: 335, name: '直接访问' },
 *       { value: 310, name: '邮件营销' }
 *     ]
 *   }"
 * />
 */
export default {
  name: "PieChart",
  props: {
    /**
     * 图表唯一标识符
     * 用于在多图表场景下区分不同图表，实现精确的事件处理和状态管理
     */
    id: {
      type: String,
      required: true
    },
    /**
     * 图表配置对象
     * 用于自定义图表的各项配置，包括标题、数据、样式等
     * @example
     * {
     *   title: { text: '访问来源' },
     *   data: [{ value: 335, name: '直接访问' }],
     *   radius: ['50%', '70%'],
     *   label: { show: true }
     * }
     */
    config: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    /**
     * 判断是否有数据
     * @returns {boolean}
     */
    hasData() {
      const config = this.config || {};
      const dataSource = config.dataSource || {};
      const configData = config.data || [];
      const sourceData = dataSource.data || [];

      // 只有当实际有数据时才返回true，不再根据URL判断
      return (
        sourceData.length > 0 ||
        configData.length > 0 ||
        (this.chartData && this.chartData.length > 0)
      );
    }
  },
  data() {
    return {
      /** @type {echarts.ECharts} ECharts实例对象 */
      chart: null,
      /** @type {ResizeObserver} 容器大小变化观察器 */
      observer: null,
      /** 是否正在加载数据 */
      loading: false,
      /** 数据加载错误信息 */
      error: null,
      /** 图表数据 */
      chartData: [],
      /**
       * 默认图表配置选项
       * 定义了饼图的基础样式、交互和布局设置
       */
      defaultOption: {
        title: {
          show: false,
          text: "",
          left: "center",
          top: "20",
          textStyle: {
            fontSize: 14,
            fontWeight: "normal"
          }
        },
        tooltip: {
          trigger: "item",
          formatter: "{b} : {c} ({d}%)",
          textStyle: {
            fontSize: 12
          }
        },
        legend: {
          show: false,
          orient: "horizontal",
          bottom: "10",
          left: "center",
          itemWidth: 10,
          itemHeight: 10,
          textStyle: {
            fontSize: 12
          },
          data: []
        },
        series: [
          {
            name: "",
            type: "pie",
            radius: ["0%", "75%"], // 默认使用实心饼图
            // center: ["50%", "50%"],
            avoidLabelOverlap: true,
            itemStyle: {
              borderRadius: 4,
              borderWidth: 2,
              borderColor: "#fff"
            },
            label: {
              show: false,
              position: "outside",
              formatter: "{b}: {d}%",
              fontSize: 12
            },
            labelLine: {
              show: false,
              length: 10,
              length2: 10
            },
            data: [],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: "rgba(0, 0, 0, 0.5)"
              }
            }
          }
        ]
      }
    };
  },
  watch: {
    config: {
      handler(newConfig, oldConfig) {
        // 检查数据源相关的变化
        const dataSourceChanged =
          (newConfig.dataSource && oldConfig && oldConfig.dataSource
            ? newConfig.dataSource.type !== oldConfig.dataSource.type
            : false) ||
          (newConfig.dataSource && oldConfig && oldConfig.dataSource
            ? newConfig.dataSource.url !== oldConfig.dataSource.url
            : false) ||
          (newConfig.dataSource && oldConfig && oldConfig.dataSource
            ? newConfig.dataSource.dataUrl !== oldConfig.dataSource.dataUrl
            : false) ||
          (newConfig.dataSource && oldConfig && oldConfig.dataSource
            ? newConfig.dataSource.data !== oldConfig.dataSource.data
            : false);

        if (dataSourceChanged) {
          // 如果是动态数据源，直接调用loadData
          if (newConfig.dataSource && newConfig.dataSource.type === "dynamic") {
            this.loadData();
          } else {
            this.updateChart(newConfig);
          }
        } else {
          // 其他配置变化直接更新图表
          this.updateChart(newConfig);
        }
      },
      deep: true,
      immediate: true
    }
  },
  /**
   * 组件挂载后的生命周期钩子
   * 初始化图表、设置事件监听器、加载初始数据
   */
  mounted() {
    // 创建ResizeObserver来监听容器大小变化
    if (window.ResizeObserver) {
      this.observer = new ResizeObserver(() => {
        if (this.chart) {
          this.chart.resize();
        }
      });
      this.observer.observe(this.$refs.chartContainer);
    }

    // 监听数据源变化事件
    this.$bus.on("data-source-change", this.handleDataSourceChange);
  },

  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose();
      this.chart = null;
    }
    window.removeEventListener("resize", this.resizeHandler);
    // 移除事件监听
    this.$bus.off("chart-resize", this.handleChartResize);
    this.$bus.off("data-source-change", this.handleDataSourceChange);
    // 清理ResizeObserver
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  },
  methods: {
    /**
     * 处理数据源变化事件
     * 根据数据源类型更新图表数据，支持静态和动态数据源
     *
     * @param {Object} payload 事件数据，包含componentId和dataSource
     * @emits static-data-updated 当静态数据更新时触发
     * @emits dynamic-data-loaded 当动态数据加载完成时触发
     * @emits data-error 当数据加载失败时触发
     */
    handleDataSourceChange(payload) {
      if (!payload || payload.componentId !== this.id) return;
      // 创建新的数据源对象，确保响应式更新
      const newDataSource = {
        ...payload.dataSource,
        // 根据类型清空互斥的数据
        ...(payload.dataSource.type === "static"
          ? { url: "", dataUrl: "" }
          : {}),
        ...(payload.dataSource.type === "dynamic" ? { data: [] } : {})
      };

      // 更新配置中的数据源
      if (!this.config.dataSource) {
        this.$set(this.config, "dataSource", {});
      }
      Object.assign(this.config.dataSource, newDataSource);

      // 根据数据源类型处理数据
      this.$nextTick(() => {
        if (newDataSource.type === "static") {
          if (newDataSource.data && newDataSource.data.length > 0) {
            this.chartData = newDataSource.data;
            this.updateChartWithData(this.chartData);
          } else {
            this.chartData = [];
            if (this.chart) this.chart.clear();
          }
        } else if (newDataSource.type === "dynamic") {
          const url = newDataSource.dataUrl || newDataSource.url;
          if (url) {
            this.loadData();
          } else {
            this.chartData = [];
            if (this.chart) this.chart.clear();
          }
        }
      });
    },

    /**
     * 加载数据源数据
     * 支持静态和动态两种数据源类型：
     * - 静态数据源：直接从配置中获取数据
     * - 动态数据源：通过API请求获取数据
     *
     * @returns {Promise<void>}
     * @throws {Error} 当数据加载失败时抛出错误
     */
    async loadData() {
      if (!this.config || !this.config.dataSource) return;

      this.loading = true;
      this.error = null;

      try {
        if (this.config.dataSource.type === "dynamic") {
          // 动态数据源 - 使用mock数据模拟请求
          if (this.config.dataSource.url || this.config.dataSource.dataUrl) {
            // 支持dataUrl和url两种属性名
            const url =
              this.config.dataSource.dataUrl || this.config.dataSource.url;
            const data = await this.fetchDynamicData(url);
            this.chartData = data;

            // 确保在更新图表时应用环状图配置
            this.updateChartWithData(data);
          } else {
            // URL为空时清空数据
            this.chartData = [];
            if (this.chart) {
              this.chart.clear();
            }
          }
        } else {
          // 静态数据源
          this.chartData = this.config.dataSource.data || [];
          this.updateChartWithData(this.chartData);
        }
      } catch (err) {
        // 加载数据失败
        this.error = err.message || "数据加载失败";
        // 加载失败时清空图表
        if (this.chart) {
          this.chart.clear();
        }
        throw err; // 重新抛出错误以便调用者处理
      } finally {
        this.loading = false;
      }
    },

    /**
     * 获取动态数据(目前mock实现，后期可替换为真实接口)
     * 根据URL返回不同的模拟数据，用于开发和测试
     *
     * @param {string} url 数据源URL，用于区分不同类型的数据
     * @returns {Promise<Array>} 解析为图表数据数组的Promise
     * @emits data-loaded 当数据成功加载时触发
     * @emits data-error 当数据加载失败时触发
     * @throws {Error} 当URL为空或请求失败时抛出错误
     */
    async fetchDynamicData(url) {
      try {
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 500));

        if (!url) {
          throw new Error("URL不能为空");
        }
        const { data, code } = await postDataUrl(url.trim());
        if (code !== "1") {
          this.$message.error("API请求失败");
          return;
        }
        return data;
      } catch (error) {
        this.error = error.message || "数据加载失败";
        throw error; // 重新抛出错误以便调用者处理
      }
    },

    /**
     * 转换API数据为图表所需格式(示例)
     * @param {Object} apiData
     * @returns {Array}
     */
    transformApiData(apiData) {
      // 这里实现API数据到图表数据格式的转换
      // 示例: 假设apiData是{ items: [...] }格式
      return apiData.items.map(item => ({
        value: item.value,
        name: item.label,
        itemStyle: { color: item.color || this.getRandomColor() }
      }));
    },

    /**
     * 生成随机颜色(示例)
     * @returns {String}
     */
    getRandomColor() {
      const colors = ["#409EFF", "#67C23A", "#E6A23C", "#F56C6C", "#909399"];
      return colors[Math.floor(Math.random() * colors.length)];
    },

    /**
     * 使用数据更新图表
     * 将新数据应用到图表配置中，并处理以下内容：
     * - 确保图表实例存在
     * - 处理空数据情况
     * - 为数据项添加默认颜色
     * - 应用所有配置选项（标题、图例、边距等）
     * - 强制重绘图表
     *
     * @param {Array} data 图表数据数组
     */
    updateChartWithData(data) {
      if (!this.chart) {
        this.initChart();
        if (!this.chart) {
          console.error("图表初始化失败，无法更新数据");
          return;
        }
      }

      // 检查数据是否为空
      if (!data || data.length === 0) {
        this.chart.clear();
        return;
      }
      // 确保每个数据项都有颜色
      const colors = ["red", "#67C23A", "#E6A23C", "#F56C6C", "#909399"];
      const processedData = data.map((item, index) => {
        // 如果没有颜色，添加默认颜色
        if (!item.itemStyle || !item.itemStyle.color) {
          return {
            ...item,
            itemStyle: {
              ...item.itemStyle,
              color: item.color || colors[index % colors.length]
            }
          };
        }
        return item;
      });

      // 创建图表选项
      const option = {
        ...this.defaultOption,
        series: [
          {
            ...this.defaultOption.series[0],
            data: processedData
          }
        ]
      };

      // 更新图例数据
      option.legend.data = processedData.map(item => item.name);
      // 有数据时显示标签和标签线
      option.series[0].label.show = true;
      option.series[0].labelLine.show = true;

      // 图例
      option.legend.show = false;

      // 应用配置中的标题（如果有）
      if (this.config && this.config.title) {
        option.title = {
          ...option.title,
          ...this.config.title,
          show: false
        };
      }
      if (this.config && this.config.isDonut) {
        option.series[0].radius = [
          `${this.config.innerRadius}%`,
          `${this.config.outerRadius}%`
        ];
      } else {
        // 使用默认配置
        option.series[0].radius = ["0%", "75%"];
      }
      // 应用边距配置
      if (
        (this.config && this.config.marginLeft !== undefined) ||
        (this.config && this.config.marginRight !== undefined) ||
        (this.config && this.config.marginTop !== undefined) ||
        (this.config && this.config.marginBottom !== undefined)
      ) {
        const marginLeft = this.config.marginLeft || 0;
        const marginRight = this.config.marginRight || 0;
        const marginTop = this.config.marginTop || 0;
        const marginBottom = this.config.marginBottom || 0;

        const centerX = 50 + (marginLeft - marginRight) / 2;
        const centerY = 50 + (marginTop - marginBottom) / 2;

        option.series[0].center = [`${centerX}%`, `${centerY}%`];
        option.grid = option.grid || {};
        Object.assign(option.grid, {
          left: marginLeft + "%",
          right: marginRight + "%",
          top: marginTop + "%",
          bottom: marginBottom + "%",
          containLabel: true
        });
      }

      // 应用其他配置
      if (this.config && this.config.legend) {
        Object.assign(option.legend, this.config.legend);
      }
      if (this.config && this.config.tooltip) {
        Object.assign(option.tooltip, this.config.tooltip);
      }
      if (this.config && this.config.label) {
        Object.assign(option.series[0].label, this.config.label);
      }
      if (this.config && this.config.itemStyle) {
        Object.assign(option.series[0].itemStyle, this.config.itemStyle);
      }

      this.chart.setOption(option, true);

      // 强制触发一次重绘
      this.$nextTick(() => {
        if (this.chart) {
          this.chart.resize();
        }
      });
    },

    handleChartResize(id) {
      // 检查是否是当前图表需要重绘
      if (id === this.id) {
        this.$nextTick(() => {
          this.resizeHandler();
        });
      }
    },
    /**
     * 初始化图表实例
     * 创建ECharts实例并应用初始配置，包括：
     * - 检查容器尺寸
     * - 检查数据有效性
     * - 销毁现有实例（如果存在）
     * - 创建新实例并设置初始选项
     * - 应用所有配置（边距、标题、图例等）
     * - 注册图表点击事件
     */
    initChart() {
      // 确保容器存在且有尺寸
      if (
        !this.$refs.chartContainer ||
        !this.$refs.chartContainer.offsetWidth ||
        !this.$refs.chartContainer.offsetHeight
      ) {
        // 如果容器不存在或尺寸为0，延迟初始化
        setTimeout(() => {
          this.initChart();
        }, 100);
        return;
      }

      // 检查是否有实际数据
      const hasRealData = this.chartData && this.chartData.length > 0;
      const config = this.config || {};
      console.log('config', config)
      const dataSource = config.dataSource || {};
      const configData = config.data || [];
      const sourceData = dataSource.data || [];

      if (!hasRealData && !sourceData.length && !configData.length) {
        // 如果已经存在图表实例，销毁它
        if (this.chart) {
          this.chart.dispose();
          this.chart = null;
        }
        return;
      }

      // 如果已经存在图表实例，先销毁
      if (this.chart) {
        this.chart.dispose();
        this.chart = null;
      }

      // 创建新的图表实例
      this.chart = echarts.init(this.$refs.chartContainer);

      // 设置初始选项
      const initialOption = JSON.parse(JSON.stringify(this.defaultOption));

      // 使用实际数据
      const data =
        this.chartData.length > 0
          ? this.chartData
          : sourceData.length > 0
          ? sourceData
          : configData;

      if (data.length > 0) {
        initialOption.series[0].data = data;
        initialOption.legend.data = data.map(item => item.name);
        initialOption.legend.show = false;
        initialOption.series[0].label.show = true;
        initialOption.series[0].labelLine.show = true;
      }

      if (config.isDonut) {
        initialOption.series[0].radius = [
          `${config.innerRadius}%`,
          `${config.outerRadius}%`
        ];
      } else {
        // 使用默认配置
        initialOption.series[0].radius = ["0%", "75%"];
      }

      // 应用边距配置
      if (
        config.marginLeft !== undefined ||
        config.marginRight !== undefined ||
        config.marginTop !== undefined ||
        config.marginBottom !== undefined
      ) {
        const marginLeft = config.marginLeft || 0;
        const marginRight = config.marginRight || 0;
        const marginTop = config.marginTop || 0;
        const marginBottom = config.marginBottom || 0;

        const centerX = 50 + (marginLeft - marginRight) / 2;
        const centerY = 50 + (marginTop - marginBottom) / 2;

        initialOption.series[0].center = [`${centerX}%`, `${centerY}%`];
        initialOption.grid = initialOption.grid || {};
        Object.assign(initialOption.grid, {
          left: marginLeft + "%",
          right: marginRight + "%",
          top: marginTop + "%",
          bottom: marginBottom + "%",
          containLabel: true
        });
      }

      // 应用其他配置
      if (config.title) {
        Object.assign(initialOption.title, config.title);
        initialOption.title.show = true;
      }
      if (config.legend) {
        Object.assign(initialOption.legend, config.legend);
      }
      if (config.tooltip) {
        Object.assign(initialOption.tooltip, config.tooltip);
      }
      if (config.label) {
        Object.assign(initialOption.series[0].label, config.label);
      }
      if (config.itemStyle) {
        Object.assign(initialOption.series[0].itemStyle, config.itemStyle);
      }
      console.log('initialOption', initialOption)
      this.chart.setOption(initialOption);
    },

    resizeHandler() {
      // 只有在有实际数据时才初始化图表
      if (!this.chart && this.hasData) {
        this.initChart();
        return;
      }

      // 确保图表存在且容器有尺寸
      if (
        this.chart &&
        this.$refs.chartContainer &&
        this.$refs.chartContainer.offsetWidth &&
        this.$refs.chartContainer.offsetHeight
      ) {
        this.chart.resize();
      }
    },

    /**
     * 根据新配置更新图表
     * 处理以下情况：
     * - 动态数据源：加载数据后更新图表
     * - 静态数据源：直接使用配置数据
     * - 直接配置数据：直接使用数据
     * - 空数据情况：清除图表
     *
     * @param {Object} newConfig 新的图表配置
     * @throws {Error} 当更新失败时抛出错误
     */
    async updateChart(newConfig) {
      try {
        // 检查是否有实际数据
        let hasData = false;
        if (newConfig.dataSource && newConfig.dataSource.type === "dynamic") {
          const url = newConfig.dataSource.dataUrl || newConfig.dataSource.url;
          if (url) {
            if (this.config.dataList) {
              this.chartData = this.config.dataList || [];
              this.updateChartWithData(this.chartData);
              hasData = this.config.dataList && this.config.dataList.length > 0;
            } else {
              // 对于动态数据源，先加载数据
              await this.loadData();
              this.$set(this.config, "dataList", this.chartData);
              hasData = this.chartData && this.chartData.length > 0;
            }


            // 动态数据源加载完成后，确保应用所有配置
            if (hasData && this.chart && this.$route.meta !== "customPreview") {
              // 保存当前配置到this.config
              Object.assign(this.config, newConfig);

              const mergedOption = this.mergeConfig(
                this.defaultOption,
                this.config
              );

              // 处理边距配置
              if (
                this.config.marginLeft !== undefined ||
                this.config.marginRight !== undefined ||
                this.config.marginTop !== undefined ||
                this.config.marginBottom !== undefined
              ) {
                const marginLeft = this.config.marginLeft || 0;
                const marginRight = this.config.marginRight || 0;
                const marginTop = this.config.marginTop || 0;
                const marginBottom = this.config.marginBottom || 0;

                const centerX = 50 + (marginLeft - marginRight) / 2;
                const centerY = 50 + (marginTop - marginBottom) / 2;

                mergedOption.series[0].center = [`${centerX}%`, `${centerY}%`];
                mergedOption.grid = mergedOption.grid || {};
                Object.assign(mergedOption.grid, {
                  left: marginLeft + "%",
                  right: marginRight + "%",
                  top: marginTop + "%",
                  bottom: marginBottom + "%",
                  containLabel: true
                });
              }

              // 设置数据
              mergedOption.series[0].data = this.chartData;
              this.chart.clear();
              this.chart.setOption(mergedOption, true);
              this.chart.resize();
            }
            return;
          }
        } else if (
          newConfig.dataSource &&
          newConfig.dataSource.type === "static" &&
          newConfig.dataSource &&
          newConfig.dataSource.data
        ) {
          this.chartData = newConfig.dataSource.data;
          hasData = this.chartData && this.chartData.length > 0;
        } else if (newConfig.data) {
          this.chartData = newConfig.data;
          hasData = this.chartData && this.chartData.length > 0;
        } else if (this.chartData && this.chartData.length > 0) {
          hasData = true;
        }

        // 如果没有数据，清除图表并显示空状态
        if (!hasData) {
          if (this.chart) {
            this.chart.clear();
            this.chart.dispose();
            this.chart = null;
          }
          return;
        }

        // 确保图表已初始化
        if (!this.chart) {
          this.initChart();
          if (!this.chart) {
            return;
          }
        }

        // 合并新配置与默认配置
        const mergedOption = this.mergeConfig(this.defaultOption, newConfig);

        // 设置数据
        mergedOption.series[0].data = this.chartData;
        if (newConfig.isDonut) {
          mergedOption.series[0].radius = [
            `${newConfig.innerRadius}%`,
            `${newConfig.outerRadius}%`
          ];
        } else {
          // 使用默认配置
          mergedOption.series[0].radius = ["0%", "75%"];
        }

        // 强制清除并重新设置选项
        this.chart.clear();
        this.chart.setOption(mergedOption, true);

        // 强制重绘
        this.$nextTick(() => {
          if (this.chart) {
            this.chart.resize();
          }
        });
      } catch (error) {
        // 更新图表失败
        this.error = error.message;
        throw error;
      }
    },

    /**
     * 合并默认配置和用户自定义配置
     * 处理以下配置项：
     * - 标题配置
     * - 数据源配置
     * - 图例配置
     * - 边距配置
     * - 半径配置
     * - 提示框配置
     * - 标签配置
     * - 样式配置
     * - 动画配置
     *
     * @param {Object} defaultConfig 默认配置
     * @param {Object} newConfig 用户自定义配置
     * @returns {Object} 合并后的配置对象
     */
    mergeConfig(defaultConfig, newConfig) {
      // 创建默认配置的深拷贝
      const result = JSON.parse(JSON.stringify(defaultConfig));

      // 合并配置
      if (newConfig.title) {
        Object.assign(result.title, newConfig.title);
        // 如果有标题，显示标题
        result.title.show = true;
      }

      // 处理数据源
      if (newConfig.dataSource) {
        if (
          newConfig.dataSource.type === "static" &&
          newConfig.dataSource.data &&
          newConfig.dataSource.data.length > 0
        ) {
          // 静态数据源
          result.series[0].data = newConfig.dataSource.data;
          // 更新图例数据
          result.legend.data = newConfig.dataSource.data.map(item => item.name);
          // 显示标签和标签线
          result.series[0].label.show = true;
          result.series[0].labelLine.show = true;
        }
      } else if (newConfig.data) {
        // 兼容旧版配置
        result.series[0].data = newConfig.data;
        // 更新图例数据
        result.legend.data = newConfig.data.map(item => item.name);
        // 显示标签和标签线
        result.series[0].label.show = true;
        result.series[0].labelLine.show = true;
      }

      if (newConfig.legend && newConfig.legend.data) {
        result.legend.data = newConfig.legend.data;
      }

      if (newConfig.name) {
        result.series[0].name = newConfig.name;
      }

      // 处理边距配置
      if (
        newConfig.marginLeft !== undefined ||
        newConfig.marginRight !== undefined ||
        newConfig.marginTop !== undefined ||
        newConfig.marginBottom !== undefined
      ) {
        // 计算饼图中心位置，考虑边距
        const marginLeft = newConfig.marginLeft || 0;
        const marginRight = newConfig.marginRight || 0;
        const marginTop = newConfig.marginTop || 0;
        const marginBottom = newConfig.marginBottom || 0;

        const centerX = 50 + (marginLeft - marginRight) / 2;
        const centerY = 50 + (marginTop - marginBottom) / 2;

        // 设置饼图中心位置
        result.series[0].center = [`${centerX}%`, `${centerY}%`];

        // 保留grid配置用于其他图表类型
        result.grid = result.grid || {};
        Object.assign(result.grid, {
          left: marginLeft + "%",
          right: marginRight + "%",
          top: marginTop + "%",
          bottom: marginBottom + "%",
          containLabel: true
        });
      }

      // 处理半径配置（优先级：自定义radius > isDonut > 默认值）
      if (newConfig.radius) {
        // 使用自定义半径
        result.series[0].radius = Array.isArray(newConfig.radius)
          ? newConfig.radius
          : ["0%", newConfig.radius];
      } else if (newConfig.isDonut) {
        // 使用默认环形图配置
        result.series[0].radius = ["50%", "70%"];
      } else {
        // 使用默认配置
        result.series[0].radius = ["0%", "75%"];
      }

      // 处理图例配置
      if (newConfig.legend) {
        Object.assign(result.legend, newConfig.legend);
        // 如果有图例配置，显示图例
        result.legend.show = true;
      }

      // 处理提示框配置
      if (newConfig.tooltip) {
        Object.assign(result.tooltip, newConfig.tooltip);
      }

      // 处理标签配置
      if (newConfig.label) {
        Object.assign(result.series[0].label, newConfig.label);
        // 如果配置了标签，同时也要显示引导线
        if (newConfig.label.show) {
          result.series[0].labelLine.show = true;
        }
      }

      // 处理样式配置
      if (newConfig.itemStyle) {
        Object.assign(result.series[0].itemStyle, newConfig.itemStyle);
      }

      // 处理强调样式配置
      if (newConfig.emphasis) {
        Object.assign(result.series[0].emphasis, newConfig.emphasis);
      }

      // 处理动画配置
      if (newConfig.animation !== undefined) {
        result.animation = newConfig.animation;
      }

      // 处理动画时长
      if (newConfig.animationDuration !== undefined) {
        result.animationDuration = newConfig.animationDuration;
      }

      // 处理动画缓动效果
      if (newConfig.animationEasing) {
        result.animationEasing = newConfig.animationEasing;
      }

      return result;
    }
  }
};
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
  min-height: 300px;
  position: relative;
}

.empty-state {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  /* background-color: #f5f7fa; */
  border-radius: 4px;
  color: #909399;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .chart-container {
    min-height: 250px;
  }

  .empty-state i {
    font-size: 36px;
  }
}

@media screen and (max-width: 480px) {
  .chart-container {
    min-height: 200px;
  }

  .empty-state i {
    font-size: 32px;
  }

  .empty-state p {
    font-size: 12px;
  }
}
</style>
