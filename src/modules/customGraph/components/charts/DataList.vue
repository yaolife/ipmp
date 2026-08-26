<template>
  <div
    class="consult-list"
    v-loading="loading"
    element-loading-text="正在获取资讯数据..."
    :class="[`theme-${config.theme || 'default'}`]"
  >
    <!-- 内容区域 -->
    <div class="consult-content">
      <div
        v-if="!loadedConsultList || loadedConsultList.length === 0"
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
            <i class="el-icon-chat-line-round"></i> 暂无数据列表内容
          </template>
        </div>
      </div>
      <div v-else class="consult-items">
        <div
          v-for="(item, index) in loadedConsultList"
          :key="index"
          class="consult-item"
          @click="handleItemClick(item)"
        >
          <div :style="lineSpacingStyle">
            {{ item.name }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { dataUrl } from "@/modules/customPortal/api/pageManagement";

export default {
  name: "DataList",
  props: {
    id: {
      type: String,
      required: true,
    },
    config: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      firstLoad: true,
      loading: false,
      loadedConsultList: [],
    };
  },
  computed: {
    lineSpacingStyle() {
      const margin = parseFloat(this.config.lineSpacing || 16);
      const fontSize = parseFloat(this.config.nameSize || 14);
      return {
        marginBottom: `${margin}px`,
        fontSize: `${fontSize}px`,
      };
    },
  },
  watch: {
    config: {
      immediate: true,
      handler(newUrl) {
        if (newUrl) {
          if (newUrl && newUrl.dataUrl) {
            if (!this.firstLoad) {
              this.fetchConsultData(newUrl.dataUrl);
            } else {
              this.loadedConsultList = newUrl.dataList || [];
            }
          } else {
            this.loadedConsultList = [];
          }
        }
      },
    },
  },
  methods: {
    handleItemClick(item) {
      // 如果配置了详情链接，则跳转
      if (item.url) {
        // 判断链接是否包含协议，如果不包含则添加http://
        let url = item.url;
        if (!/^https?:\/\//i.test(url)) {
          url = "http://" + url;
        }
        window.open(url, "_blank", "noopener,noreferrer");
      }
    },

    // 强制刷新组件
    refreshComponent() {
      this.$forceUpdate();
    },

    // 从API获取资讯数据
    async fetchConsultData(url) {
      if (!url) return;

      this.loading = true;
      try {
        const response = await dataUrl(this.config.dataUrl, false);
        if (response.code !== "1") {
          return;
        }
        const num = parseFloat(this.config.maxLine || 5);
        this.loadedConsultList = response.data.splice(0, num);
        this.$set(this.config, "dataList", this.loadedConsultList);
      } catch (error) {
        this.$message({
          message: "获取资讯数据失败",
          type: "error",
          duration: 2000,
        });
        // 出错时使用默认数据
        this.loadedConsultList = [];
      } finally {
        this.loading = false;
      }
    },
  },
  mounted() {
    // 监听图表更新事件
    this.$bus.on(`chart-update`, (chartId) => {
      this.firstLoad = false;
      if (chartId === this.id) {
        // 强制刷新组件以应用新配置
        this.refreshComponent();
      }
    });

    // 初始化时，如果有数据源，确保组件正确显示
    this.$nextTick(() => {
      this.refreshComponent();
    });
  },
  beforeDestroy() {
    // 移除事件监听
    this.$bus.off(`chart-update`);
  },
};
</script>

<style lang="less" scoped>
.consult-list {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;

  .consult-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;

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
      .consult-item {
        cursor: pointer;
        background: #f5f8ff;
        margin-bottom: 8px;
        border-radius: 2px;
        line-height: 20px;
      }
    }
  }

  // 加载状态样式
  &.el-loading-parent--relative {
    .el-loading-mask {
      background-color: rgba(255, 255, 255, 0.9);
    }
  }

  // 滚动条样式
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  ::-webkit-scrollbar-thumb {
    background: #dcdfe6;
    border-radius: 3px;
  }

  ::-webkit-scrollbar-track {
    background: #f5f7fa;
    border-radius: 3px;
  }
}
.contentImg {
  width: 50px;
  height: 50px;
}
.contentName {
  text-align: center;
}
</style>
