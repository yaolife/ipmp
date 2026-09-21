<template>
  <div
    class="consult-list"
    v-loading="loading"
    element-loading-text="正在获取资讯数据..."
    :class="[`theme-${config.theme || 'default'}`]"
  >
    <!-- 内容区域 -->
    <div class="top" v-if="loadedConsultObj && loadedConsultObj.task">
      <el-form label-width="80px" size="small">
        <el-form-item label="统计维度">
          <el-select
            v-model="config.dimension"
            placeholder="请选择数据源类型"
            @change="changeDimension"
          >
            <el-option label="近一周" value="1" />
            <el-option label="近两周" value="2" />
            <el-option label="近一月" value="3" />
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <div class="consult-content">
      <div
        v-if="!loadedConsultObj || !loadedConsultObj.task"
        class="empty-content"
      >
        <div class="empty-text">
          <template v-if="loading">
            <i class="el-icon-loading"></i> 正在加载数据...
          </template>
          <template v-else-if="config && config.dataUrl">
            <i class="el-icon-connection"></i> 等待数据加载
          </template>
          <template v-else>
            <i class="el-icon-chat-line-round"></i> 暂无任务数量内容
          </template>
        </div>
      </div>
      <div v-else class="consult-items">
        <div class="left">
          <div class="num" :style="numStyle">
            {{ loadedConsultObj.task.number }}
          </div>
          <div class="name" :style="nameStyle">
            {{ loadedConsultObj.task.name }}
          </div>
        </div>
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
      loadedConsultObj: null,
    };
  },
  computed: {
    numStyle() {
      const margin = parseFloat(this.config.topSpacing || 40);
      const fontSize = parseFloat(this.config.numSize || 20);
      return {
        marginTop: `${margin}px`,
        fontSize: `${fontSize}px`,
      };
    },
    nameStyle() {
      const margin = parseFloat(this.config.lineSpacing || 20);
      const fontSize = parseFloat(this.config.nameSize || 14);
      return {
        marginTop: `${margin}px`,
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
              this.fetchConsultData(newUrl.dataUrl, newUrl.dimension);
            } else {
              this.loadedConsultObj = newUrl.loadedConsultObj || {};
            }
          } else {
            this.loadedConsultObj = {};
          }
        }
      },
    },
  },
  methods: {
    changeDimension(val) {
      this.fetchConsultData(this.config.dataUrl, val);
    },
    // 强制刷新组件
    refreshComponent() {
      this.$forceUpdate();
    },

    // 从API获取资讯数据
    async fetchConsultData(url, type) {
      if (!url) return;

      this.loading = true;
      let newUrl = `${url}?range=${type}`;
      try {
        const response = await dataUrl(newUrl, false);
        if (response.code !== "1") {
          return;
        }
        this.loadedConsultObj = response.data;
        this.$set(this.config, "loadedConsultObj", this.loadedConsultObj);
      } catch (error) {
        this.$message({
          message: "获取资讯数据失败",
          type: "error",
          duration: 2000,
        });
        // 出错时使用默认数据
        this.loadedConsultObj = {};
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
  display: inherit !important;
  height: calc(100% - 32px) !important;
  padding: 16px;
  width: calc(100% - 32px) !important;
  .top {
    height: 10%;
    /deep/.el-form-item__content {
      width: 30%;
    }
  }

  .consult-content {
    flex: 1;
    width: 100%;
    height: 90%;

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
      width: 100%;
      display: flex;
      .left {
        text-align: center;
        width: 50%;
      }
      .right {
        text-align: center;
        width: 50%;
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
