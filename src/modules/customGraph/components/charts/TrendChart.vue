<template>
  <div class="trend-chart">
    <div class="chart-header" v-if="config.title">
      <el-icon class="trend-icon"><i class="el-icon-data-line"></i></el-icon>
      <span class="chart-title">{{ config.title }}</span>
      <span class="chart-subtitle" v-if="config.subTitle">{{
        config.subTitle
      }}</span>
    </div>
    <div class="chart-container">趋势图组件</div>
  </div>
</template>

<script>
/**
 * @description 趋势图组件
 * 用于展示数据随时间变化的趋势，支持多种趋势展示方式，如折线、柱状、面积等
 * 可用于展示销售趋势、用户增长、业务指标变化等数据
 *
 * @example
 * <trend-chart :config="trendConfig"></trend-chart>
 *
 * @displayName TrendChart
 * @group 图表组件
 * @status stable
 */
export default {
  name: "TrendChart",
  props: {
    /**
     * 组件配置对象
     * 用于自定义趋势图的展示效果和数据
     * @example
     * {
     *   title: '销售趋势',           // 图表标题
     *   subTitle: '最近30天',        // 图表副标题
     *   type: 'line',              // 图表类型：'line'|'bar'|'area'
     *   smooth: true,              // 是否平滑曲线（line/area类型）
     *   stack: false,              // 是否堆叠显示（多系列时）
     *   showLegend: true,          // 是否显示图例
     *   legendPosition: 'top',     // 图例位置：'top'|'bottom'|'left'|'right'
     *   showTooltip: true,         // 是否显示提示框
     *   showDataLabels: false,     // 是否显示数据标签
     *   showAxisLabels: true,      // 是否显示坐标轴标签
     *   xAxisType: 'time',         // X轴类型：'time'|'category'|'value'
     *   yAxisName: '销售额',        // Y轴名称
     *   timeGranularity: 'day',    // 时间粒度：'hour'|'day'|'week'|'month'|'year'
     *   colors: ['#409EFF', '#67C23A', '#E6A23C'], // 系列颜色
     *   showCompare: true,         // 是否显示同比/环比
     *   compareType: 'yoy',        // 比较类型：'yoy'(同比)|'mom'(环比)
     *   showTarget: true,          // 是否显示目标线
     *   targetValue: 1000,         // 目标值
     *   targetLabel: '目标销售额',   // 目标线标签
     *   data: {                    // 图表数据
     *     labels: ['1月', '2月', '3月', '4月', '5月'],
     *     datasets: [
     *       {
     *         name: '今年',
     *         data: [120, 132, 101, 134, 90]
     *       },
     *       {
     *         name: '去年',
     *         data: [110, 122, 91, 124, 85]
     *       }
     *     ]
     *   },
     *   responsive: true,          // 是否响应式
     *   height: '300px',           // 图表高度
     *   animation: true,           // 是否启用动画
     *   showDownload: false,       // 是否显示下载按钮
     *   showFullscreen: false      // 是否显示全屏按钮
     * }
     */
    config: {
      type: Object,
      default: () => ({}),
    },
  },
};
</script>

<style lang="less" scoped>
.trend-chart {
  width: 100%;
  min-height: 300px;
  padding: 20px;
  box-sizing: border-box;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.chart-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.trend-icon {
  font-size: 18px;
  color: #409eff;
  margin-right: 8px;
}

.chart-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  line-height: 1;
}

.chart-subtitle {
  font-size: 12px;
  color: #909399;
  margin-left: 8px;
  line-height: 1;
}

.chart-container {
  width: 100%;
  height: calc(100% - 30px);
}
</style>
