<template>
  <div>
    <div :id="id" :style="{ width: width, height: height }"></div>
  </div>
</template>

<script>
import { mixinsComp } from "@/mixins/index";
import  * as echarts from "echarts"
export default {
  mixins: [mixinsComp],
  name: "chart",
  props: {
    width: {
      type: String,
      default: "300px"
    },
    height: {
      type: String,
      default: "300px"
    },
    id: {
      type: String
    },
    //数据
    options: {
      type: Object,
      default: {}
    }
  },
  data() {
    return {
      mixinsCmptCode: "chart",
      mixinsCmptName: "图形"
    };
  },
  mounted() {
    this.initChart();
  },
  methods: {
    /**
     * 初始化图标
     */
    initChart() {
      // 初始化echarts实例
      let chart = echarts.init(document.getElementById(this.id));
      // 绘制图表  options 具体配置项
      chart.setOption(this.options);
    }
  },
  destroyed() {
    echarts.dispose();
    echarts.clear();
  }
};
</script>

<style scoped></style>
