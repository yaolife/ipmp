<template>
  <div class="graph-editor-content">
    <!-- 左侧组件列表 -->
    <div class="components-list">
      <!-- 业务组件 -->
      <div class="component-category">
        <div class="category-title">业务组件</div>
        <div class="component-grid">
          <div
            v-for="(item, index) in businessComponents"
            :key="'business-' + index"
            class="component-item"
            draggable="true"
            @dragstart="handleDragStart($event, item)"
            @dragend="handleDragEnd"
          >
            <div class="component-icon">
              <i :class="item.icon"></i>
            </div>
            <div class="component-name">{{ item.name }}</div>
          </div>
        </div>
      </div>

      <!-- 自定义组件 -->
      <div class="component-category">
        <div class="category-title">自定义组件</div>
        <div class="component-grid">
          <div
            v-for="(item, index) in customComponents"
            :key="'custom-' + index"
            class="component-item"
            draggable="true"
            @dragstart="handleDragStart($event, item)"
            @dragend="handleDragEnd"
          >
            <div class="component-icon">
              <i :class="item.icon"></i>
            </div>
            <div class="component-name">{{ item.name }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 画布区域 -->
    <div class="canvas-area" @dragover="handleDragOver" @drop="handleDrop">
      <div v-if="layout.length === 0" class="empty-canvas-hint">
        <p>请从左侧拖拽组件到此处</p>
      </div>
      <grid-layout
        v-model="layout"
        :layout="layout"
        :col-num="12"
        :row-height="30"
        :is-draggable="true"
        :is-resizable="true"
        :vertical-compact="true"
        :use-css-transforms="true"
        :margin="[20, 20]"
        style="min-height: 100vh"
        @moved="handleLayoutChange"
        @resized="handleLayoutChange"
      >
        <grid-item
          v-for="item in layout"
          :key="item.i"
          :x="item.x"
          :y="item.y"
          :w="item.w"
          :h="item.h"
          :i="item.i"
        >
          <div
            :class="[
              'grid-item-content',
              { 'grid-item-active': selectedItem === item },
            ]"
            @click="handleItemClick(item)"
          >
            <div class="item-header">
              <div class="item-title">
                <!-- <i :class="item.icon"></i> -->
                <span class="bar-box"></span>
                <span>{{ item.name }}</span>
              </div>
              <div class="item-actions">
                <el-tooltip effect="dark" content="设置" placement="top">
                  <i
                    class="el-icon-setting"
                    @click.stop="handleItemClick(item)"
                  ></i>
                </el-tooltip>
                <el-tooltip effect="dark" content="删除" placement="top">
                  <i
                    class="el-icon-delete"
                    @click.stop="removeItem(item.i)"
                  ></i>
                </el-tooltip>
                <el-tooltip
                  v-if="
                    [
                      'consult-list',
                      'announcement-board',
                      'data-list',
                      'process-list',
                    ].includes(item.type)
                  "
                  effect="dark"
                  content="更多"
                  placement="top"
                >
                  <i
                    class="el-icon-more"
                    @click.stop="showMoreOptions(item)"
                  ></i>
                </el-tooltip>
              </div>
            </div>
            <div class="item-body">
              <component
                :is="item.type"
                :id="item.i"
                :config="item.config"
                class="chart-component"
              ></component>
            </div>
          </div>
        </grid-item>
      </grid-layout>
    </div>

    <!-- 右侧配置面板 -->
    <config-panel
      v-if="showConfigPanel"
      class="config-panel"
      :selected-chart="selectedItem"
      @update="handleConfigUpdate"
      @close="clearSelectedItem"
    />
  </div>
</template>

<script>
import BarChart from "./charts/BarChart.vue";
import PieChart from "./charts/PieChart.vue";
import LineChart from "./charts/LineChart.vue";
import CarouselChart from "./charts/CarouselChart.vue";
import AnnouncementBoard from "./charts/AnnouncementBoard.vue";
import ConsultList from "./charts/ConsultList.vue";
import QuickStorage from "./charts/QuickStorage.vue";
import TaskCount from "./charts/TaskCount.vue";
import TodoIndicators from "./charts/TodoIndicators.vue";
import TodoList from "./charts/TodoList.vue";
import TrendChart from "./charts/TrendChart.vue";
import Entrance from "./charts/Entrance.vue";
import RadarChart from "./charts/RadarChart.vue";
import FunnelChart from "./charts/FunnelChart.vue";
import MetricCard from "./charts/MetricCard.vue";
import ConfigPanel from "./config-panel/Index.vue";
import DataList from "./charts/DataList.vue";
import ProcessList from "./charts/ProcessList.vue";
import EfficiencyAnalysis from "./charts/EfficiencyAnalysis.vue";
import TaskNumber from "./charts/TaskNumber.vue";
import Schedule from "./charts/Schedule.vue";
import PersonalInfo from "./charts/PersonalInfo.vue";
import OnlineUsers from "./charts/OnlineUsers.vue";

export default {
  name: "GraphEdit",
  components: {
    // GridLayout,
    // GridItem,
    BarChart,
    PieChart,
    LineChart,
    carousel: CarouselChart,
    AnnouncementBoard,
    ConsultList,
    QuickStorage,
    TaskCount,
    TodoIndicators,
    TodoList,
    trend: TrendChart,
    ConfigPanel,
    Entrance,
    DataList,
    ProcessList,
    EfficiencyAnalysis,
    TaskNumber,
    RadarChart,
    FunnelChart,
    MetricCard,
    Schedule,
    PersonalInfo,
    OnlineUsers,
  },
  data() {
    return {
      businessComponents: [
        {
          name: "待办指标",
          icon: "el-icon-s-flag",
          type: "todo-indicators",
        },
        {
          name: "待办列表",
          icon: "el-icon-s-order",
          type: "todo-list",
        },
        {
          name: "公告栏",
          icon: "el-icon-notebook-2",
          type: "announcement-board",
        },
        {
          name: "资讯列表",
          icon: "el-icon-chat-line-round",
          type: "consult-list",
        },
        {
          name: "快捷入口",
          icon: "el-icon-monitor",
          type: "entrance",
        },
        {
          name: "数据列表",
          icon: "el-icon-data-analysis",
          type: "data-list",
        },
        {
          name: "常用流程",
          icon: "el-icon-c-scale-to-original",
          type: "process-list",
        },
        {
          name: "流程效率分析",
          icon: "el-icon-picture-outline-round",
          type: "efficiency-analysis",
        },
        {
          name: "任务数量",
          icon: "el-icon-notebook-1",
          type: "task-number",
        },
        {
          name: "轮播图",
          icon: "el-icon-picture-outline",
          type: "carousel",
        },
        {
          name: "柱状图",
          icon: "el-icon-data-analysis",
          type: "bar-chart",
        },
        {
          name: "饼图",
          icon: "el-icon-pie-chart",
          type: "pie-chart",
        },
        {
          name: "折线图",
          icon: "el-icon-data-line",
          type: "line-chart",
        },
        {
          name: "指标卡",
          icon: "el-icon-data-board",
          type: "metric-card",
        },
        {
          name: "雷达图",
          icon: "el-icon-s-data",
          type: "radar-chart",
        },
        {
          name: "漏斗图",
          icon: "el-icon-s-release",
          type: "funnel-chart",
        },
        {
          name: "日程表",
          icon: "el-icon-date",
          type: "schedule",
        },
        {
          name: "个人信息",
          icon: "el-icon-user",
          type: "personal-info",
        },
        {
          name: "在线用户",
          icon: "el-icon-coin",
          type: "online-users",
        },
      ],
      customComponents: [
        {
          name: "自定义1",
          icon: "el-icon-star-off",
          type: "custom1",
        },
        {
          name: "自定义2",
          icon: "el-icon-star-off",
          type: "custom2",
        },
        {
          name: "自定义3",
          icon: "el-icon-star-off",
          type: "custom3",
        },
        {
          name: "自定义4",
          icon: "el-icon-star-off",
          type: "custom4",
        },
        {
          name: "自定义5",
          icon: "el-icon-star-off",
          type: "custom5",
        },
        {
          name: "自定义6",
          icon: "el-icon-star-off",
          type: "custom6",
        },
      ],
      layout: [],
      nextId: 1,
      dragItem: null,
      selectedItem: {},
      // 控制配置面板显示
      showConfigPanel: false,
      // 操作历史记录
      historyStack: [],
      // 当前历史位置
      historyPosition: -1,
    };
  },
  methods: {
    // 获取布局数据的方法，供父组件调用
    getLayoutData() {
      return {
        layout: this.layout,
        selectedItem: this.selectedItem,
      };
    },

    // 设置布局数据的方法，用于数据回显
    setLayoutData(data) {
      if (data && data.layout && Array.isArray(data.layout)) {
        // 设置布局数据
        this.layout = data.layout;

        // 如果有选中项，也设置选中项
        if (data.selectedItem) {
          this.selectedItem = data.selectedItem;
        }

        // 更新nextId，确保新添加的组件ID不会重复
        const maxId = Math.max(
          ...this.layout.map((item) => parseInt(item.i, 10)),
          0
        );
        this.nextId = maxId + 1;

        // 触发图表重新渲染
        this.$nextTick(() => {
          this.layout.forEach((item) => {
            this.$bus.emit("chart-resize", item.i);
          });
        });
      }
    },

    handleDragStart(e, item) {
      this.dragItem = { ...item };

      const originalRect = e.target.getBoundingClientRect();
      const dragImage = e.target.cloneNode(true);

      // 获取原始元素的计算样式
      const computedStyle = window.getComputedStyle(e.target);
      console.log(originalRect);
      // 设置拖拽镜像的基本样式
      dragImage.style.width = `${originalRect.width}px`;
      dragImage.style.height = `${originalRect.height}px`;
      dragImage.style.backgroundColor = computedStyle.backgroundColor;
      dragImage.style.border = computedStyle.border;
      dragImage.style.borderRadius = computedStyle.borderRadius;
      dragImage.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
      dragImage.style.padding = computedStyle.padding;

      // 确保布局正确
      dragImage.style.display = "flex";
      dragImage.style.flexDirection = "column";
      dragImage.style.alignItems = "center";
      dragImage.style.justifyContent = "center";

      // 确保内部元素样式正确
      const iconElement = dragImage.querySelector(".component-icon");
      const nameElement = dragImage.querySelector(".component-name");

      if (iconElement) {
        iconElement.style.display = "flex";
        iconElement.style.justifyContent = "center";
        iconElement.style.alignItems = "center";
        iconElement.style.width = "40px";
        iconElement.style.height = "40px";
        iconElement.style.marginBottom = "8px";
        iconElement.style.borderRadius = "50%";
        iconElement.style.backgroundColor = "#fff";
        iconElement.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.05)";

        const iconI = iconElement.querySelector("i");
        if (iconI) {
          iconI.style.fontSize = "20px";
          iconI.style.color = "#409eff";
        }
      }

      if (nameElement) {
        nameElement.style.fontSize = "12px";
        nameElement.style.color = "#606266";
        nameElement.style.textAlign = "center";
      }

      // 设置拖拽镜像的位置和透明度
      dragImage.style.position = "absolute";
      dragImage.style.top = "-1000px";
      dragImage.style.opacity = "0.9";
      dragImage.style.transform = "scale(1.05)"; // 稍微放大一点，增强视觉效果
      dragImage.style.transition = "none"; // 防止过渡效果影响拖拽
      document.body.appendChild(dragImage);

      // 设置拖拽图像，偏移值可以调整拖拽时鼠标相对于图像的位置
      e.dataTransfer.setDragImage(dragImage, originalRect.width / 2, 20);

      // 使用完后移除拖拽镜像
      setTimeout(() => document.body.removeChild(dragImage), 0);
    },

    handleDragEnd() {
      this.dragItem = null;
    },

    handleDrop(e) {
      e.preventDefault();
      if (!this.dragItem) return;

      const rect = e.target.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / (rect.width / 12));
      const y = Math.floor((e.clientY - rect.top) / 30);

      const newItemId = this.nextId.toString();

      const newItem = {
        x: Math.min(x, 12 - 6),
        y: y,
        w: 6,
        h: 8,
        i: newItemId,
        name: this.dragItem.name,
        icon: this.dragItem.icon,
        type: this.dragItem.type,
        config: {}, // 使用空对象，让组件自己提供默认配置
      };

      // 记录操作历史
      this.historyStack = this.historyStack.slice(0, this.historyPosition + 1);
      this.historyStack.push({
        type: "add",
        item: JSON.parse(JSON.stringify(newItem)),
        layout: JSON.parse(JSON.stringify(this.layout)),
      });
      this.historyPosition = this.historyStack.length - 1;

      this.layout.push(newItem);
      this.nextId++;

      this.$nextTick(() => {
        this.$bus.emit("chart-resize", newItemId);
        // 通知父组件更新撤销/重做按钮状态
        this.$emit("history-change");
      });
    },

    // 撤销操作
    undo() {
      if (this.historyPosition < 0) return;

      const action = this.historyStack[this.historyPosition];
      if (action.type === "add") {
        // 撤销添加操作就是移除该元素
        const index = this.layout.findIndex((item) => item.i === action.item.i);
        if (index !== -1) {
          // 如果撤销添加的是当前正在配置的组件，关闭配置面板
          if (this.selectedItem && this.selectedItem.i === action.item.i) {
            this.clearSelectedItem();
          }
          this.layout.splice(index, 1);
        }
      } else if (action.type === "remove") {
        // 撤销删除操作就是重新添加该元素
        this.layout.push(JSON.parse(JSON.stringify(action.item)));
      }
      this.historyPosition--;

      // 通知父组件更新撤销/重做按钮状态
      this.$emit("history-change");
    },

    // 重做操作
    redo() {
      if (this.historyPosition >= this.historyStack.length - 1) return;

      this.historyPosition++;
      const action = this.historyStack[this.historyPosition];
      if (action.type === "add") {
        // 重做添加操作就是重新添加该元素
        this.layout.push(JSON.parse(JSON.stringify(action.item)));
      } else if (action.type === "remove") {
        // 重做删除操作就是移除该元素
        const index = this.layout.findIndex((item) => item.i === action.item.i);
        if (index !== -1) {
          // 如果重做删除的是当前正在配置的组件，关闭配置面板
          if (this.selectedItem && this.selectedItem.i === action.item.i) {
            this.clearSelectedItem();
          }
          this.layout.splice(index, 1);
        }
      }

      // 通知父组件更新撤销/重做按钮状态
      this.$emit("history-change");
    },

    // 是否可以撤销 -- 父级有使用
    canUndo() {
      return this.historyPosition >= 0;
    },

    // 是否可以重做 -- 父级有使用
    canRedo() {
      return this.historyPosition < this.historyStack.length - 1;
    },

    removeItem(id) {
      const index = this.layout.findIndex((item) => item.i === id);
      if (index !== -1) {
        // 记录操作历史
        this.historyStack = this.historyStack.slice(
          0,
          this.historyPosition + 1
        );
        this.historyStack.push({
          type: "remove",
          item: JSON.parse(JSON.stringify(this.layout[index])),
          layout: JSON.parse(JSON.stringify(this.layout)),
        });
        this.historyPosition = this.historyStack.length - 1;
        // 如果删除的是当前正在配置的组件，关闭配置面板
        if (this.selectedItem && this.selectedItem.i === id) {
          this.clearSelectedItem();
        }
        // 移除元素
        this.layout.splice(index, 1);

        // 通知父组件更新撤销/重做按钮状态
        this.$emit("history-change");
      }
    },

    showMoreOptions(item) {
      // 检查是否配置了更多链接
      if (item.config && item.config.moreUrl) {
        // 如果链接存在且不为空，则进行跳转
        if (item.config.moreUrl.trim() !== "") {
          // // 判断链接是否包含协议，如果不包含则添加http://
          // let url = item.config.moreUrl;
          // if (!/^https?:\/\//i.test(url)) {
          //   url = "http://" + url;
          // }

          // // 在新窗口打开链接
          // window.open(url, "_blank");
          //页面内跳转
          this.$router.push("/" + item.config.moreUrl);
          return;
        }
      }

      // 如果没有配置链接，提示用户去配置
      this.$message({
        type: "warning",
        message: "未配置更多链接，请点击设置图标进行配置",
      });

      // 自动打开配置面板
      // this.handleItemClick(item);
    },

    handleDragOver(event) {
      event.preventDefault();
      event.stopPropagation();
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.dropEffect = "move";

      const target = event.target;
      target.style.outline = "none";
      target.style.backgroundColor = "";

      return false;
    },

    handleLayoutChange(layout, oldLayout, item) {
      setTimeout(() => {
        this.$nextTick(() => {
          this.$bus.emit("chart-resize", item.i);
        });
      }, 50);
    },

    handleItemClick(item) {
      this.selectedItem = item;
      this.showConfigPanel = true;
    },

    handleConfigUpdate(updatedChart, isSave = false) {
      const index = this.layout.findIndex((item) => item.i === updatedChart.i);
      if (index !== -1) {
        // 只有在保存时才更新layout中的配置并触发图表更新
        if (isSave) {
          // 更新配置
          this.layout[index].config = updatedChart.config;

          // 如果配置中包含标题，同时更新组件的name属性
          if (
            updatedChart &&
            updatedChart.config &&
            updatedChart.config.title
          ) {
            this.layout[index].name = updatedChart.config.title;
          }

          // 触发组件更新
          this.$bus.emit("chart-update", updatedChart.i);
        }
      }
    },

    clearSelectedItem() {
      // 清除选中的图表项
      this.selectedItem = null;
      // 隐藏配置面板
      this.showConfigPanel = false;
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.layout.forEach((item) => {
        this.$bus.emit("chart-resize", item.i);
      });
    });
  },
  watch: {
    layout: {
      handler(newLayout) {
        this.$nextTick(() => {
          newLayout.forEach((item) => {
            this.$bus.emit("chart-resize", item.i);
          });
        });
      },
      deep: true,
    },
    showConfigPanel: {
      handler(e) {
        this.$nextTick(() => {
          console.log("eeee", e);

          this.layout.forEach((item) => {
            console.log("item", item);
            this.$bus.emit("chart-resize", item.i);
          });
        });
      },
    },
  },
};
</script>

<style lang="less" scoped>
.grid-item-active {
  border: 1px solid #00a2e9 !important;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1) !important;
}
.graph-editor-content {
  display: flex;
  height: 100%;
  overflow: hidden;

  .components-list {
    width: 280px;
    padding: 20px;
    background-color: #fff;
    border-right: 1px solid #e6e6e6;
    overflow-y: auto;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);

    .component-category {
      margin-bottom: 16px;

      .category-title {
        font-size: 14px;
        color: #606266;
        margin-bottom: 12px;
        padding-left: 8px;
        border-left: 3px solid #409eff;
        font-weight: 500;
      }
    }

    .component-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }

    .component-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: calc(33.33% - 27px);
      padding: 12px 8px;
      background-color: #f5f7fa;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      cursor: move;
      transition: all 0.3s;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

      &:hover {
        background-color: #ecf5ff;
        border-color: #409eff;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }

      .component-icon {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 40px;
        height: 40px;
        margin-bottom: 8px;
        border-radius: 50%;
        background-color: #fff;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);

        i {
          font-size: 20px;
          color: #409eff;
        }
      }

      .component-name {
        font-size: 12px;
        color: #606266;
        text-align: center;
      }
    }
  }

  .canvas-area {
    flex: 1;
    overflow: auto;
    background-color: #f5f7fa;
    position: relative;
    cursor: default;

    .empty-canvas-hint {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      color: #c0c4cc;
      font-size: 16px;
      z-index: 10;

      p {
        margin: 0;
        font-weight: 400;
      }
    }

    &::-webkit-drag,
    &::-moz-drag-over,
    &::before,
    &::after {
      display: none;
    }

    &.drag-over {
      outline: none;
      box-shadow: none;
    }

    &[draggable="true"] {
      -webkit-user-drag: none;
      -khtml-user-drag: none;
      -moz-user-drag: none;
      -o-user-drag: none;
      user-drag: none;
    }

    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
      background-size: 20px 20px;
      pointer-events: none;
      opacity: 0.3;
    }

    .vue-grid-layout {
      background-color: #fff;
      // border: 1px solid #e6e6e6;
      height: 100%;
      position: relative;
      z-index: 1;
    }

    .vue-grid-item {
      background: transparent;
      border: none;

      &:not(.vue-grid-placeholder) {
        background: transparent;
        border: none;
      }

      &.vue-grid-placeholder {
        background: rgba(64, 158, 255, 0.2);
        border: 2px dashed #409eff;
        border-radius: 4px;
      }

      &.vue-draggable-dragging {
        .grid-item-content {
          opacity: 0.8;
          box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
        }
      }

      .grid-item-content {
        height: 100%;
        display: flex;
        flex-direction: column;
        background-color: #fff;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        transition: all 0.3s;
        overflow: hidden;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

        &:hover {
          border-color: #c0c4cc;
          box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
        }

        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          // background-color: #f5f7fa;
          // border-bottom: 1px solid #dcdfe6;

          .item-title {
            display: flex;
            align-items: center;
            .bar-box {
              width: 6px;
              height: 16px;
              border-radius: 6px;
              background: #409eff;
              margin-right: 8px;
            }
            i {
              margin-right: 8px;
              font-size: 16px;
              color: #409eff;
            }

            span {
              color: #303133;
              font-weight: 500;
              font-size: 14px;
            }
          }

          .item-actions {
            display: flex;
            gap: 8px;

            i {
              cursor: pointer;
              color: #909399;
              font-size: 16px;
              transition: color 0.3s;

              &:hover {
                color: #409eff;
              }

              &.el-icon-delete:hover {
                color: #f56c6c;
              }
            }
          }
        }

        .item-body {
          flex: 1;
          position: relative;
          overflow: hidden;

          .chart-component {
            width: 100%;
            height: 100%;
            position: relative;
          }
        }
      }
    }
  }

  .config-panel {
    width: 320px;
    padding: 20px;
    background-color: #fff;
    border-left: 1px solid #e6e6e6;
    overflow-y: auto;
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.05);
  }
}
</style>
