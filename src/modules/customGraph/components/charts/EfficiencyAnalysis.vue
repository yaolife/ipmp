<template>
  <div class="efficiencyAnalysis">
    <div class="consult-content">
      <div
        v-if="!loadedConsultObj || !loadedConsultObj.rate"
        class="empty-content"
      >
        <div class="empty-text">
          <template v-if="loading">
            <!-- <i class="el-icon-loading"></i> 正在加载数据... -->
          </template>
          <template v-else-if="config && config.dataUrl">
            <i class="el-icon-connection"></i> 等待数据加载
          </template>
          <template v-else>
            <i class="el-icon-chat-line-round"></i> 暂无流程效率分析内容
          </template>
        </div>
      </div>
      <div v-else class="consult-items">
        <div class="top">
          <el-form label-width="80px" size="small">
            <el-form-item label="统计维度">
              <el-select
                v-model="config.dimension"
                placeholder="请选择统计维度"
                @change="changeDimension"
              >
                <el-option label="近一周" value="1" />
                <el-option label="近两周" value="2" />
                <el-option label="近一月" value="3" />
              </el-select>
            </el-form-item>
          </el-form>
        </div>
        <div class="bottom">
          <div ref="chartContainer" class="chart-container"></div>
          <div class="right">
            <div class="num" :style="numStyle">
              {{ loadedConsultObj.rate.number }}
            </div>
            <div class="name" :style="nameStyle">
              {{ loadedConsultObj.rate.name }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from "echarts";
import { dataUrlPost } from "@/modules/customPortal/api/pageManagement";

export default {
  name: "PieChart",
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
      loadedConsultObj: null,
      chart: null,
      loading: false,
      firstLoad: true,
      observer: null
    };
  },
  computed: {
    numStyle() {
      const margin = parseFloat(this.config.numTopLineSpacing || 40);
      const marginBottom = parseFloat(this.config.lineSpacing || 20);
      const marginLeft = parseFloat(this.config.numLeftLineSpacing || 10);
      const marginRight = parseFloat(this.config.numRightLineSpacing || 15);
      const fontSize = parseFloat(this.config.numSize || 20);
      return {
        marginTop: `${margin}%`,
        fontSize: `${fontSize}px`,
        marginBottom: `${marginBottom}%`,
        marginLeft: `${marginLeft}%`,
        marginRight: `${marginRight}%`
      };
    },
    nameStyle() {
      const fontSize = parseFloat(this.config.nameSize || 14);
      return {
        fontSize: `${fontSize}px`
      };
    }
  },
  watch: {
    config: {
      immediate: true,
      handler(newUrl) {
        if (newUrl) {
          if (newUrl && newUrl.dataUrl) {
            if (!this.firstLoad) {
              this.fetchConsultData(newUrl.dataUrl, newUrl.dimension);
            } else {
              if (!this.chart) {
                this.loadedConsultObj = newUrl.dataList;
                this.refreshComponent();
              }
            }
          } else {
            this.loadedConsultObj = null;
          }
        }
      }
    }
  },
  mounted() {
    // 监听图表更新事件
    this.$bus.on(`chart-update`, chartId => {
      this.firstLoad = false;
      if (chartId === this.id) {
        // 强制刷新组件以应用新配置
        this.$forceUpdate();
      }
    });
    // 初始化时，如果有数据源，确保组件正确显示
    this.$nextTick(() => {
      this.$forceUpdate();
    });
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose();
      this.chart = null;
    }
    this.$bus.off(`chart-update`);
  },
  methods: {
    // 强制刷新组件
    refreshComponent() {
      // 使用nextTick确保DOM已经更新
      this.$nextTick(() => {
        // 延迟初始化以确保容器尺寸已经计算完成
        setTimeout(() => {
          this.initChart();
        }, 100);
      });
    },
    changeDimension(val) {
      this.fetchConsultData(this.config.dataUrl, val);
    },

    // 从API获取资讯数据
    async fetchConsultData(url, type) {
      if (!url) return;

      this.loading = true;
      try {
        const response = await dataUrlPost(`${url}/${type}`, false);
        if (response.code !== "1") {
          return;
        }
        this.loadedConsultObj = response.data;
        let loadedConsultObj = JSON.parse(
          JSON.stringify(this.loadedConsultObj)
        );
        this.$set(this.config, "dataList", loadedConsultObj);
        this.refreshComponent();
        // this.firstLoad = true;
      } catch (error) {
        this.$message({
          message: "获取资讯数据失败",
          type: "error",
          duration: 2000
        });
        // 出错时使用默认数据
        this.loadedConsultObj = {};
      } finally {
        this.loading = false;
      }
    },
    initChart() {
      // 如果已经存在图表实例，先销毁
      if (this.chart) {
        this.chart.dispose();
      }

      // 初始化图表
      this.chart = echarts.init(this.$refs.chartContainer);
      let left = parseFloat(this.config.leftLineSpacing || 40);
      let top = parseFloat(this.config.topLineSpacing || 40);
      let inRadio = parseFloat(this.config.inRadio || 50);
      let perRadio = parseFloat(this.config.perRadio || 70);
      let defaultOption = {
        tooltip: { trigger: "item" },
        series: [
          {
            type: "pie",
            center: [`${left}%`, `${top}%`],
            radius: [`${inRadio}%`, `${perRadio}%`], // 内半径40%，外半径70%
            label: { show: false },
            labelLine: { show: false }
          }
        ]
      };

      this.chart.setOption(defaultOption);

      this.loadData(); // 立即加载
    },
    loadData() {
      this.chart.setOption({ series: [{ data: this.loadedConsultObj.data }] });
    }
  }
};
</script>

<style lang="less" scoped>
.efficiencyAnalysis {
  display: inherit !important;
  width: 100%;
}
.num {
  display: inline-block;
}
.chart-container {
  width: 60%;
  height: 100%;
}
.top {
  padding: 10px;
  height: 10%;
  /deep/.el-form-item__content {
    width: 30%;
  }
}
.consult-content {
  height: 100%;
}
.empty-content {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 14px;

  .empty-text {
    text-align: center;

    i {
      font-size: 20px;
      margin-right: 8px;
      vertical-align: middle;
    }
  }
}
.consult-items {
  height: 100%;
}
.bottom {
  width: 100%;
  height: 90%;
  display: flex;
}
.name {
  text-align: center;
}
.right {
  width: 40%;
}
</style>
