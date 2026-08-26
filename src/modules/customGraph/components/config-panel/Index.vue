<template>
  <div class="config-panel">
    <div class="config-header">
      <div class="config-box">配置面板</div>
      <i class="el-icon-close close-btn" @click="handleClose"></i>
    </div>
    <component
      :is="currentConfigComponent"
      v-if="selectedChart && selectedChart.type"
      :item="selectedChart"
      :config="selectedChart.config"
      :readonly="readonly"
      @update="handleConfigUpdate"
    />
    <div v-else class="empty-tip">请先选择一个图表进行配置</div>
  </div>
</template>

<script>
import BarChartConfig from "./chart-configs/BarChartConfig.vue";
import LineChartConfig from "./chart-configs/LineChartConfig.vue";
import PieChartConfig from "./chart-configs/PieChartConfig.vue";
import CarouselChartConfig from "./chart-configs/CarouselChartConfig.vue";
import AnnouncementBoardConfig from "./chart-configs/AnnouncementBoardConfig.vue";
import ConsultListConfig from "./chart-configs/ConsultListConfig.vue";
import QuickStorageConfig from "./chart-configs/QuickStorageConfig.vue";
import TaskCountConfig from "./chart-configs/TaskCountConfig.vue";
import TodoIndicatorsConfig from "./chart-configs/TodoIndicatorsConfig.vue";
import TodoListConfig from "./chart-configs/TodoListConfig.vue";
import TrendChartConfig from "./chart-configs/TrendChartConfig.vue";
import EntranceConfig from "./chart-configs/EntranceConfig.vue";
import DataListConfig from "./chart-configs/DataListConfig.vue";
import ProcessListConfig from "./chart-configs/ProcessListConfig.vue";
import EfficiencyAnalysisConfig from "./chart-configs/EfficiencyAnalysisConfig.vue";
import TaskNumberConfig from "./chart-configs/TaskNumberConfig.vue";
import RadarChartConfig from "./chart-configs/RadarChartConfig.vue";
import FunnelChartConfig from "./chart-configs/FunnelChartConfig.vue";
import MetricCardConfig from "./chart-configs/MetricCardConfig.vue";
import ScheduleConfig from "./chart-configs/ScheduleConfig.vue";
import PersonalInfoConfig from "./chart-configs/PersonalInfoConfig.vue";
import OnlineUsersConfig from "./chart-configs/OnlineUsersConfig.vue";

export default {
  name: "ConfigPanel",
  components: {
    BarChartConfig,
    LineChartConfig,
    PieChartConfig,
    CarouselChartConfig,
    AnnouncementBoardConfig,
    ConsultListConfig,
    QuickStorageConfig,
    TaskCountConfig,
    TodoIndicatorsConfig,
    TodoListConfig,
    TrendChartConfig,
    EntranceConfig,
    DataListConfig,
    ProcessListConfig,
    EfficiencyAnalysisConfig,
    TaskNumberConfig,
    RadarChartConfig,
    FunnelChartConfig,
    MetricCardConfig,
    ScheduleConfig,
    PersonalInfoConfig,
    OnlineUsersConfig,
  },
  props: {
    selectedChart: {
      type: [Object, null],
      required: false,
      default: null,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    currentConfigComponent() {
      if (!this.selectedChart) return null;

      switch (this.selectedChart.type) {
        case "carousel":
          return "CarouselChartConfig";
        case "bar-chart":
          return "BarChartConfig";
        case "line-chart":
          return "LineChartConfig";
        case "pie-chart":
          return "PieChartConfig";
        case "radar-chart":
          return "RadarChartConfig";
        case "funnel-chart":
          return "FunnelChartConfig";
        case "metric-card":
          return "MetricCardConfig";
        case "announcement-board":
          return "AnnouncementBoardConfig";
        case "consult-list":
          return "ConsultListConfig";
        case "quick-storage":
          return "QuickStorageConfig";
        case "task-count":
          return "TaskCountConfig";
        case "todo-indicators":
          return "TodoIndicatorsConfig";
        case "todo-list":
          return "TodoListConfig";
        case "trend-chart":
          return "TrendChartConfig";
        case "entrance":
          return "EntranceConfig";
        case "data-list":
          return "DataListConfig";
        case "process-list":
          return "ProcessListConfig";
        case "efficiency-analysis":
          return "EfficiencyAnalysisConfig";
        case "task-number":
          return "TaskNumberConfig";
        case "schedule":
          return "ScheduleConfig";
        case "personal-info":
          return "PersonalInfoConfig";
        case "online-users":
          return "OnlineUsersConfig";
        default:
          return null;
      }
    },
  },
  methods: {
    handleConfigUpdate(config, isSave = false) {
      // 创建新的对象而不是修改prop
      const updatedChart = {
        ...this.selectedChart,
        config,
      };
      this.$emit("update", updatedChart, isSave);
    },
    handleClose() {
      // 发出关闭事件，通知父组件清除选中的图表项
      this.$emit("close");
    },
  },
};
</script>

<style lang="less" scoped>
/deep/ .el-form-item__label {
  line-height: 32px !important;
}
.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.config-box {
  color: #606266;
  font-size: 14px;
  padding-left: 8px;
  border-left: 3px solid #409eff;
  font-weight: 600;
  line-height: 20px;
}

.close-btn {
  cursor: pointer;
  font-size: 18px;
  color: #909399;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #409eff;
}

.config-panel > component {
  width: 100%;
  padding: 16px;
}

.empty-tip {
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}
</style>
