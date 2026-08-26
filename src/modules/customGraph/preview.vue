<!--
  图表预览组件
  功能：
  - 展示保存的图表布局
  - 支持图表自适应大小
  - 提供只读的配置面板查看
  - 处理加载、错误和空状态展示
-->
<template>
  <div class="graph-box" :class="{ 'home-class': isHome }">
    <div class="graph-container">
      <!-- 预览容器 -->
      <div
        class="preview-container"
        :class="{ 'with-config-panel': selectedItem }"
      >
        <!-- 标题栏 -->
        <div class="preview-header">
          <span class="title">{{
            $route.meta === "customEditView" ? "编辑查看" : "编辑预览"
          }}</span>
        </div>
        <!-- 主体内容区域 -->
        <div class="content-wrapper">
          <!-- 画布区域 -->
          <div class="canvas-area">
            <!-- 加载状态 -->
            <!-- <div v-if="loading" class="loading-overlay">
              <i class="el-icon-loading"></i>
              <span>加载中...</span>
            </div> -->

            <!-- 错误状态提示 -->
            <div v-if="error" class="error-state">
              <i class="el-icon-warning-outline"></i>
              <p>{{ error }}</p>
              <!-- <el-button type="primary" size="small" @click="retryInit"
                >重试</el-button
              > -->
            </div>

            <!-- 空状态提示 -->
            <div
              v-else-if="!loading && (!layout || layout.length === 0)"
              class="empty-state"
            >
              <i class="el-icon-data-analysis"></i>
              <p>暂无可预览的图表</p>
            </div>

            <grid-layout
              v-else-if="!error"
              v-model="layout"
              :layout="layout"
              :col-num="12"
              :row-height="30"
              :is-draggable="false"
              :is-resizable="false"
              :vertical-compact="true"
              :use-css-transforms="true"
              :margin="[10, 10]"
              class="grid-layout"
            >
              <grid-item
                v-for="item in layout"
                :key="item.i"
                :x="item.x"
                :y="item.y"
                :w="item.w"
                :h="item.h"
                :i="item.i"
                @click.native="handleItemClick(item)"
              >
                <div class="grid-item-content">
                  <div v-if="item.config.showTitile" class="item-header">
                    <div class="item-title">
                      <!-- <i :class="item.icon"></i> -->
                      <span class="bar-box"></span>
                      <span>{{ item.name }}</span>
                    </div>
                    <div class="item-actions">
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
                      :is="getComponentName(item.type)"
                      :id="item.i"
                      :config="getComponentConfig(item)"
                      class="chart-component"
                    ></component>
                  </div>
                </div>
              </grid-item>
            </grid-layout>
          </div>
          <!-- 右侧可编辑配置面板 -->
          <!-- 移动设备上的遮罩层 -->
          <div
            v-if="selectedItem && isMobileView"
            class="mobile-overlay"
            @click="handleConfigPanelClose"
          ></div>

          <config-panel
            v-if="selectedItem"
            class="config-panel readonly"
            :class="{ show: true }"
            :selected-chart="selectedItem"
            readonly="false"
            @close="handleConfigPanelClose"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import { GridLayout, GridItem } from "vue-grid-layout";
import BarChart from "./components/charts/BarChart.vue";
import PieChart from "./components/charts/PieChart.vue";
import LineChart from "./components/charts/LineChart.vue";
import CarouselChart from "./components/charts/CarouselChart.vue";
import AnnouncementBoard from "./components/charts/AnnouncementBoard.vue";
import ConfigPanel from "./components/config-panel/Index.vue";
import ConsultList from "./components/charts/ConsultList.vue";
import TodoIndicatorsChart from "./components/charts/TodoIndicators.vue";
import TodoList from "./components/charts/TodoList.vue";
import QuickStorage from "./components/charts/QuickStorage.vue";
import TaskCount from "./components/charts/TaskCount.vue";
import RadarChart from "./components/charts/RadarChart.vue";
import FunnelChart from "./components/charts/FunnelChart.vue";
import MetricCard from "./components/charts/MetricCard.vue";
import DataList from "./components/charts/DataList.vue";
import Entrance from "./components/charts/Entrance.vue";
import ProcessList from "./components/charts/ProcessList.vue";
import EfficiencyAnalysis from "./components/charts/EfficiencyAnalysis.vue";
import TaskNumber from "./components/charts/TaskNumber.vue";
import Schedule from "./components/charts/Schedule.vue";
import PersonalInfo from "./components/charts/PersonalInfo.vue";
import OnlineUsers from "./components/charts/OnlineUsers.vue";
import {
  getViewData,
  getPageDetail,
} from "@/modules/customPortal/api/pageManagement";
export default {
  name: "GraphPreview",
  props: ["firstDataId"],
  components: {
    // GridLayout,
    // GridItem,
    BarChart,
    PieChart,
    LineChart,
    CarouselChart,
    AnnouncementBoard,
    ConfigPanel,
    ConsultList,
    TodoList,
    TodoIndicatorsChart,
    Entrance,
    DataList,
    EfficiencyAnalysis,
    ProcessList,
    TaskNumber,
    FunnelChart,
    MetricCard,
    RadarChart,
    QuickStorage,
    TaskCount,
    Schedule,
    PersonalInfo,
    OnlineUsers,
  },

  /**
   * 组件数据
   * @property {Array} layout - 图表布局数据，从localStorage获取
   * @property {Object|null} selectedItem - 当前选中的图表项
   * @property {number|null} resizeTimer - 用于防抖的定时器ID
   * @property {boolean} loading - 加载状态标识
   * @property {string|null} error - 错误信息
   */
  data() {
    return {
      layout: [], // 图表布局数据
      selectedItem: null, // 当前选中的图表项
      resizeTimer: null, // 用于防抖的定时器ID
      loading: true, // 加载状态
      error: null, // 错误信息
      isMobileView: false, // 是否为移动设备视图
    };
  },

  /**
   * 计算属性
   */
  computed: {
    /**
     * 判断是否为移动设备视图
     * @returns {boolean} 是否为移动设备视图
     */
    isMobileDevice() {
      return window.innerWidth <= 768;
    },
    isHome() {
      return this.$route.meta === "welcome";
    },
  },
  methods: {
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
    /**
     * 处理图表项点击事件
     * @param {Object} item - 被点击的图表项
     */
    handleItemClick(item) {
      if (this.$route.meta === "customEditView") {
        this.selectedItem = item;
      }
    },

    /**
     * 初始化布局数据
     * 从localStorage获取保存的布局数据并进行验证
     */
    async initLayoutData() {
      console.log("是否是首页", this.isHome);
      this.loading = true;
      this.error = null; // 重置错误状态
      let savedLayout = {};
      try {
        let id = this.$route.query.id;
        if (this.isHome) {
          id = this.firstDataId || this.$route.params.id;
        }
        if (id) {
          // 从首页里面加载
          if (this.isHome) {
            const responseData = await getPageDetail({ pageId: id });
            const { data, code, msg } = responseData.data;
            // console.log(data, code, msg, "responseData", responseData);
            if (code === "1") {
              return;
            }
            // 接口请求数据
            savedLayout = data.config ? JSON.parse(data.config).layout : {};
          } else {
            // 从版本点击查看
            const responseData = await getViewData(id);
            const { data, code, msg } = responseData;
            if (code === "1") {
              return;
            }
            // 接口请求数据
            savedLayout = data.pageConfig
              ? JSON.parse(data.pageConfig).layout
              : {};
          }
        } else {
          // 从编辑直接点击预览
          savedLayout = JSON.parse(
            localStorage.getItem(`graphLayout-${this.$route.query.indexId}`)
          );
        }
        // savedLayout = localStorage.getItem("graphLayout");

        if (!savedLayout) {
          throw new Error("未找到布局数据");
        }

        const parsedLayout = savedLayout; //JSON.parse(savedLayout);
        // console.log("初始化数据", parsedLayout);
        if (!Array.isArray(parsedLayout)) {
          throw new Error("布局数据格式无效，请检查编辑内容");
        }

        // 验证布局数据的有效性
        const validLayout = parsedLayout.filter((item) => {
          return (
            item &&
            typeof item === "object" &&
            "x" in item &&
            "y" in item &&
            "w" in item &&
            "h" in item &&
            "i" in item
          );
        });

        if (validLayout.length === 0) {
          throw new Error("未找到有效的布局项");
        }

        this.layout = validLayout;
        this.$nextTick(this.resizeAllCharts);
      } catch (error) {
        this.error = error.message || "加载布局数据失败";
        this.layout = [];
      } finally {
        setTimeout(() => {
          this.loading = false;
        }, 500);
      }
    },

    /**
     * 重新渲染所有图表
     * 通过事件总线触发每个图表的重绘
     */
    resizeAllCharts() {
      if (!this.layout || !this.layout.length) return;

      // 使用 setTimeout 确保在 DOM 更新后执行
      setTimeout(() => {
        this.layout.forEach((item) => {
          this.$bus.emit("chart-resize", item.i);
        });
      }, 200);
    },

    /**
     * 处理窗口大小变化
     * 使用防抖优化性能
     */
    handleResize() {
      if (this.resizeTimer) {
        clearTimeout(this.resizeTimer);
      }
      this.resizeTimer = setTimeout(() => {
        this.resizeAllCharts();
        // 更新移动设备视图状态
        this.isMobileView = this.isMobileDevice;
      }, 300);
    },

    /**
     * 重试初始化
     * 当加载失败时可以重新尝试
     */
    retryInit() {
      this.initLayoutData();
    },

    /**
     * 获取组件名称
     * @param {string} type - 组件类型
     * @returns {string} 组件名称
     */
    getComponentName(type) {
      // 特殊处理公告栏组件
      if (type === "announcement" || type === "announcement-board") {
        return "AnnouncementBoard";
      }
      // 特殊处理资讯列表组件
      if (type === "consult-list") {
        return "ConsultList";
      }
      if (type === "todo-list") {
        return "TodoList";
      }
      if (type === "entrance") {
        return "Entrance";
      }
      if (type === "data-list") {
        return "DataList";
      }
      if (type === "process-list") {
        return "ProcessList";
      }
      if (type === "efficiency-analysis") {
        return "EfficiencyAnalysis";
      }
      if (type === "task-number") {
        return "TaskNumber";
      }
      if (type === "metric-card") {
        return "MetricCard";
      }
      if (type === "online-users") {
        return "OnlineUsers";
      }
      if (type === "schedule") {
        return "Schedule";
      }
      if (type === "personal-info") {
        return "PersonalInfo";
      }
      //
      // 其他图表组件
      return type.endsWith("-chart") ? type : `${type}-chart`;
    },

    /**
     * 获取组件配置
     * @param {Object} item - 布局项
     * @returns {Object} 组件配置
     */
    getComponentConfig(item) {
      const baseConfig = {
        ...(item.config || {}),
        height: item.h * 50, // 根据网格高度计算实际高度
      };

      // 特殊处理公告栏组件
      if (item.type === "announcement" || item.type === "announcement-board") {
        return baseConfig;
      }

      // 其他图表组件的配置
      const configItem = (item.config && item.config.items) || [];
      return {
        ...baseConfig,
        items:
          configItem.map((configItem) => ({
            ...configItem,
            image: configItem.image ? configItem.image : null,
            imageUrl: configItem.image ? configItem.image : null,
            // imageUrl: configItem.imageUrl ? configItem.imageUrl : null,
          })) || [],
      };
    },

    /**
     * 处理配置面板关闭事件
     * 清除当前选中的图表项，关闭配置面板
     */
    handleConfigPanelClose() {
      this.selectedItem = null;
    },
  },
  watch: {
    $route: {
      handler(a, b) {
        this.initLayoutData();
      },
      immediate: true,
    },
  },
  /**
   * 组件挂载后的钩子
   * 初始化布局数据并添加窗口大小变化监听
   */
  mounted() {
    window.addEventListener("resize", this.handleResize);
  },

  /**
   * 组件销毁前的钩子
   * 清理事件监听和定时器
   */
  beforeDestroy() {
    window.removeEventListener("resize", this.handleResize);
    if (this.resizeTimer) {
      clearTimeout(this.resizeTimer);
    }
  },
};
</script>

<style lang="less" scoped>
/deep/ .el-tabs {
  width: 100%;
}
/deep/ .announcement-item .date {
  width: 67px !important;
}
/deep/ .announcement-item .description {
  width: calc(100% - 67px);
}
/deep/ .consult-content {
  width: 100%;
  box-sizing: border-box;
}
/deep/ .content {
  height: 100%;
  margin: 0 !important;
}
.home-class {
  padding: 0 !important;
  height: calc(100vh) !important;
  .preview-header {
    display: none !important;
  }
  /deep/ .grid-layout {
    border: none !important;
  }
}
.graph-box {
  padding: 12px;
  width: 100%;
  height: calc(100vh - 91px);
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}
.graph-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;

  /* 组件样式已移至 TopModule.vue */
}
/**
 * 预览容器样式
 */
.preview-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background-color: #f5f7fa;

  /**
   * 内容包装器样式
   */
  .content-wrapper {
    display: flex;
    flex: 1;
    overflow: hidden;
    height: calc(100vh - 50px); // 减去标题栏高度
  }

  /**
   * 当配置面板显示时的样式
   */
  &.with-config-panel {
    .canvas-area {
      width: calc(100% - 320px); // 减去配置面板宽度
      transition: all 0.3s ease;

      @media screen and (max-width: 1200px) {
        width: calc(100% - 280px); // 在较小屏幕上减小配置面板宽度
      }

      @media screen and (max-width: 768px) {
        width: 100%; // 在移动设备上全宽显示
        margin-right: 0;
      }
    }

    .config-panel {
      @media screen and (max-width: 1200px) {
        width: 280px; // 较小屏幕上减小宽度
        min-width: 280px;
      }

      @media screen and (max-width: 768px) {
        position: fixed; // 在移动设备上使用固定定位
        right: 0;
        top: 50px; // 标题栏高度
        bottom: 0;
        width: 100%;
        max-width: 320px;
        z-index: 1000;
        transform: translateX(0);
        transition: transform 0.3s ease;

        &:not(.show) {
          transform: translateX(100%);
        }
      }
    }
  }

  /**
   * 预览标题栏样式
   */
  .preview-header {
    height: 50px;
    display: flex;
    align-items: center;
    padding: 0 20px;
    background-color: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    z-index: 10;

    .title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }

  /**
   * 画布区域样式
   */
  .canvas-area {
    flex: 1;
    width: 100%; // 默认宽度
    overflow: visible auto;
    background-color: #fff;
    position: relative;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: width 0.3s ease; // 添加宽度变化的过渡效果

    // 滚动行为优化
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;

    // 内容区域样式优化
    & > .grid-layout {
      flex: 1;
      width: 100% !important;
      margin: 0;
      border: none;
      background-color: transparent;
      box-shadow: none;

      & > .vue-grid-item {
        transition: transform 0.2s ease;

        .grid-item-content {
          margin: 10px;
          height: 100%;
        }
      }
    }

    /**
     * 加载状态样式
     */
    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background-color: rgba(255, 255, 255, 0.7);
      z-index: 10;

      span {
        margin-top: 10px;
        color: #409eff;
        font-size: 14px;
      }
    }

    /**
     * 错误状态样式
     */
    .error-state {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;

      i {
        font-size: 48px;
        color: #f56c6c;
      }

      p {
        margin: 10px 0;
        color: #f56c6c;
        font-size: 16px;
      }
    }

    /**
     * 空状态样式
     */
    .empty-state {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;

      i {
        font-size: 48px;
        color: #c0c4cc;
      }

      p {
        margin-top: 10px;
        color: #909399;
        font-size: 16px;
      }
    }

    /**
     * 网格布局样式
     */
    .grid-layout {
      background-color: #fff;
      border: 1px solid #e6e6e6;
      border-radius: 4px;
      position: relative;
      z-index: 1;
      min-height: fit-content;
      height: auto !important;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
      overflow-y: auto !important; // 确保网格布局允许内容溢出
      width: 100% !important;
      margin-top: -20px;

      // 响应式调整
      @media screen and (max-width: 1200px) {
        width: calc(100% - 20px) !important;
        margin: 10px;
        padding: 10px;
      }

      @media screen and (max-width: 768px) {
        width: 100% !important;
        margin: 0;
        padding: 10px 5px;
        border-radius: 0;
      }
    }

    /**
     * 网格项样式
     */
    .vue-grid-item {
      background: transparent;
      border: none;
      overflow: visible !important;
      z-index: 1;

      .grid-item-content {
        height: 100%;
        display: flex;
        flex-direction: column;
        background-color: #fff;
        border: 1px solid #ebeef5;
        border-radius: 4px;
        overflow: visible;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
        transition: all 0.3s ease;
        margin: 5px;

        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        /**
         * 项目头部样式
         */
        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          // background-color: #f5f7fa;
          // border-bottom: 1px solid #dcdfe6;
          height: 40px;
          min-height: 40px;
          box-sizing: border-box;
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
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              max-width: 200px;
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

        /**
         * 项目主体样式
         */
        .item-body {
          flex: 1;
          position: relative;
          overflow: visible; // 修改为visible，允许内容溢出以显示指示器
          min-height: 0; // 防止flex子项溢出
          padding-bottom: 30px; // 为指示器预留空间

          .chart-component {
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            justify-content: center;

            // 轮播图组件特殊样式
            &.carousel-chart {
              min-height: 200px; // 减小最小高度以适应新布局
              height: 100% !important;
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;

              // 修复指示器显示问题
              /deep/ .el-carousel {
                width: 100%;
                height: 100%;

                .el-carousel__container {
                  height: 100%;
                }

                .el-carousel__indicators {
                  z-index: 10; // 提高z-index确保可见

                  &--outside {
                    bottom: 12px; // 与CarouselChart.vue中保持一致
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  /**
   * 移动设备遮罩层样式
   */
  .mobile-overlay {
    display: none; // 默认隐藏

    @media screen and (max-width: 768px) {
      display: block;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 999; // 确保在配置面板之下
      animation: fadeIn 0.3s ease;
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  /**
   * 配置面板样式
   */
  .config-panel {
    width: 320px;
    padding: 20px;
    background-color: #fff;
    border-left: 1px solid #e6e6e6;
    overflow-y: auto;
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.05);
    z-index: 5; // 确保在画布区域之上

    /**
     * 只读模式样式
     */
    // &.readonly {
    //   /deep/ .el-form-item {
    //     .el-input,
    //     .el-select,
    //     .el-input-number,
    //     .el-radio-group,
    //     .el-checkbox-group,
    //     .el-switch {
    //       pointer-events: none;
    //       opacity: 0.8;
    //     }
    //   }
    // }

    @media screen and (max-width: 1200px) {
      width: 280px; // 较小屏幕上减小宽度
    }

    @media screen and (max-width: 768px) {
      position: fixed; // 在移动设备上使用固定定位
      right: 0;
      top: 50px; // 标题栏高度
      bottom: 0;
      width: 100%;
      max-width: 320px;
      transform: translateX(0);
      transition: transform 0.3s ease;

      &:not(.show) {
        transform: translateX(100%);
      }
    }
  }
}
</style>
