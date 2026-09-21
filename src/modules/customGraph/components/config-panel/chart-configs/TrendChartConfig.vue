<template>
  <div class="chart-config">
    <h3>趋势图配置</h3>
    <el-form label-position="top">
      <el-form-item label="图表标题">
        <el-input
          v-model="config.title"
          placeholder="例如：销售趋势"
        ></el-input>
      </el-form-item>

      <el-form-item label="图表类型">
        <el-select v-model="config.type" placeholder="请选择图表类型">
          <el-option label="折线图" value="line"></el-option>
          <el-option label="柱状图" value="bar"></el-option>
          <el-option label="面积图" value="area"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item
        label="是否平滑曲线"
        v-if="config.type === 'line' || config.type === 'area'"
      >
        <el-switch v-model="config.smooth"></el-switch>
      </el-form-item>

      <el-form-item label="是否堆叠显示">
        <el-switch v-model="config.stack"></el-switch>
      </el-form-item>

      <el-form-item label="显示图例">
        <el-switch v-model="config.showLegend"></el-switch>
      </el-form-item>

      <el-form-item label="图例位置" v-if="config.showLegend">
        <el-select v-model="config.legendPosition" placeholder="请选择图例位置">
          <el-option label="顶部" value="top"></el-option>
          <el-option label="底部" value="bottom"></el-option>
          <el-option label="左侧" value="left"></el-option>
          <el-option label="右侧" value="right"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="颜色配置">
        <el-color-picker
          v-for="(color, index) in config.colors"
          :key="index"
          v-model="config.colors[index]"
          show-alpha
        ></el-color-picker>
        <el-button @click="addColor">添加颜色</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "TrendChartConfig",
  props: {
    value: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      config: {
        title: "销售趋势",
        subTitle: "",
        type: "line",
        smooth: true,
        stack: false,
        showLegend: true,
        legendPosition: "top",
        showTooltip: true,
        showDataLabels: false,
        showAxisLabels: true,
        xAxisType: "time",
        yAxisName: "数值",
        timeGranularity: "day",
        colors: ["#409EFF", "#67C23A", "#E6A23C"],
        showCompare: true,
        compareType: "yoy",
        showTarget: false,
        targetValue: 0,
        targetLabel: "目标值",
        responsive: true,
        height: "300px",
        animation: true,
        showDownload: false,
        showFullscreen: false,
        data: {
          labels: [],
          datasets: [],
        },
      },
    };
  },
  watch: {
    value: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.config = { ...this.defaultConfig, ...newVal };
        }
      },
    },
    config: {
      deep: true,
      handler(newVal) {
        this.$emit("input", newVal);
      },
    },
  },
  methods: {
    addColor() {
      this.config.colors.push("#000000");
    },
  },
};
</script>

<style lang="less" scoped>
.chart-config {
  padding: 20px;
}
</style>
