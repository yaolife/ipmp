<template>
  <div class="task-count-config">
    <h3>任务数量组件配置</h3>
    <el-form label-position="top">
      <el-form-item label="组件标题">
        <el-input
          v-model="config.title"
          placeholder="例如：任务统计"
        ></el-input>
      </el-form-item>

      <el-form-item label="展示样式">
        <el-select v-model="config.style" placeholder="请选择展示样式">
          <el-option label="卡片" value="card"></el-option>
          <el-option label="列表" value="list"></el-option>
          <el-option label="简洁" value="simple"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="布局方式">
        <el-select v-model="config.layout" placeholder="请选择布局方式">
          <el-option label="水平" value="horizontal"></el-option>
          <el-option label="垂直" value="vertical"></el-option>
          <el-option label="网格" value="grid"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="显示总数">
        <el-switch v-model="config.showTotal"></el-switch>
      </el-form-item>

      <el-form-item label="总数位置" v-if="config.showTotal">
        <el-select v-model="config.totalPosition" placeholder="请选择总数位置">
          <el-option label="顶部" value="top"></el-option>
          <el-option label="底部" value="bottom"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="显示趋势">
        <el-switch v-model="config.showTrend"></el-switch>
      </el-form-item>

      <el-form-item label="趋势天数" v-if="config.showTrend">
        <el-input-number
          v-model="config.trendDays"
          :min="1"
          :max="30"
        ></el-input-number>
      </el-form-item>

      <el-form-item label="任务类型配置">
        <el-button @click="addTaskType">添加任务类型</el-button>
        <div
          v-for="(type, index) in config.types"
          :key="index"
          class="type-item"
        >
          <el-input v-model="type.label" placeholder="类型名称"></el-input>
          <el-input v-model="type.key" placeholder="类型标识"></el-input>
          <el-input v-model="type.icon" placeholder="图标类名"></el-input>
          <el-color-picker v-model="type.color" show-alpha></el-color-picker>
          <el-button @click="removeTaskType(index)" type="danger"
            >删除</el-button
          >
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "TaskCountConfig",
  props: {
    value: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      config: {
        title: "任务统计",
        subTitle: "",
        types: [
          {
            key: "pending",
            label: "待处理",
            icon: "el-icon-time",
            color: "#FF9800",
            description: "需要处理的任务",
          },
          {
            key: "processing",
            label: "进行中",
            icon: "el-icon-loading",
            color: "#2196F3",
          },
          {
            key: "completed",
            label: "已完成",
            icon: "el-icon-success",
            color: "#4CAF50",
          },
        ],
        counts: [0, 0, 0],
        style: "card",
        layout: "horizontal",
        showTotal: true,
        totalPosition: "top",
        showTrend: true,
        trendDays: 7,
        showPercentage: true,
        animation: true,
        refreshInterval: 300,
        showEmpty: true,
        emptyText: "暂无任务",
        sorting: "desc",
        filter: {
          enabled: true,
          options: [
            { label: "全部", value: "all" },
            { label: "今日", value: "today" },
            { label: "本周", value: "week" },
          ],
        },
        permission: {
          view: ["user"],
          export: ["admin"],
        },
        exportConfig: {
          enabled: true,
          fileName: "任务统计",
          format: "xlsx",
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
    addTaskType() {
      this.config.types.push({
        key: "pending",
        label: "",
        icon: "",
        color: "#000000",
      });
    },
    removeTaskType(index) {
      this.config.types.splice(index, 1);
    },
  },
};
</script>

<style lang="less" scoped>
.task-count-config {
  padding: 20px;
}
.type-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.type-item > * {
  margin-right: 10px;
}
</style>
