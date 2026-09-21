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
        v-if="!commonUseOdd || commonUseOdd.length === 0"
        class="empty-content"
      >
        <div class="empty-text">
          <template v-if="loading">
            <i class="el-icon-loading"></i> 正在加载数据...
          </template>
          <template v-else-if="config.dataList.length != 0 && config.dataUrl">
            <i class="el-icon-connection"></i> 等待数据加载
          </template>
          <template v-else>
            <i class="el-icon-chat-line-round"></i> 暂无常用流程内容
          </template>
        </div>
      </div>
      <div v-else class="consult-items">
        <div
          v-for="(item, index) in commonUseOdd"
          :key="index"
          class="consult-item"
          @click="handleItemClick(item)"
        >
          <div :style="lineSpacingStyle" class="name">
            <span class="blue-ball"></span>
            <el-tooltip :content="item.procName" placement="top">
              <span>{{ item.procName }}</span>
            </el-tooltip>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { commonlyUseListAPI } from "@/modules/customPortal/api/pageManagement";
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
      commonUseOdd: [],
      fontIcon: [
        {
          icon: "icon-icon_process_contract",
          process: "cud-table-process-pic-blue",
          color: "cud3-icon-blue",
        },
        {
          icon: "icon-icon_process_purchase",
          process: "cud-table-process-pic-light-blue",
          color: "cud3-icon-light-blue",
        },
        {
          icon: "icon-icon_process_administration",
          process: "cud-table-process-pic-green",
          color: "cud3-icon-green",
        },
        {
          icon: "icon-icon_process_marketing",
          process: "cud-table-process-pic-orange",
          color: "cud3-icon-orange",
        },
      ],
    };
  },
  computed: {
    lineSpacingStyle() {
      const lineHeight = parseFloat(this.config.lineHeight || 16);
      const fontSize = parseFloat(this.config.nameSize || 14);
      return {
        height: `${lineHeight}px`,
        fontSize: `${fontSize}px`,
      };
    },
  },
  watch: {
    "config.maxLine": {
      immediate: true,
      handler(newConfig) {
        this.getCommonlyUsed();
      },
    },
  },
  methods: {
    //跳转到具体流程内
    handleItemClick(item) {
      console.log(item, "item===");
      item.procNode = 1;
      sessionStorage.removeItem("procItem");
      sessionStorage.setItem("procItem", JSON.stringify(item));
      if (item.customForm === 1 && item.customFormPath) {
        //打开页签
        this.$router.push({
          path: item.customFormPath,
          query: {
            actId: item.actId,
            procNode: item.procNode,
            procVersion: item.procVersion,
            procId: item.procId,
            procName: item.procName,
            r: Math.random(),
          },
        });
      } else {
        //打开页签
        this.openTab({
          path: "/workbench/view",
          query: {
            item,
            procName: item.procName,
            r: Math.random(),
          },
        });
      }
    },

    // 强制刷新组件
    refreshComponent() {
      this.$forceUpdate();
    },
    // 获取常用流程
    async getCommonlyUsed() {
      const _this = this;
      this.loading = true;
      await commonlyUseListAPI({}).then((res) => {
        this.commonUseOdd = [];
        if (res.code === "0") {
          if (res.data.length > 0) {
            //将常用流程从原来的分类中合并到一起
            res.data.forEach(function (item, index) {
              if (item.processDtoList.length > 0) {
                _this.commonUseOdd = [
                  ..._this.commonUseOdd,
                  ...item.processDtoList,
                ];
              }
            });
            const num = parseFloat(this.config.maxLine || 5);
            console.log("this.commonUseOdd", this.commonUseOdd);
            this.commonUseOdd = this.commonUseOdd.splice(0, num);
          }
          this.$set(this.config, "dataList", this.commonUseOdd);
        } else {
          this.$message({
            message: "获取资讯数据失败",
            type: "error",
            duration: 2000,
          });
        }
        console.log(this.commonUseOdd);
      });
      this.loading = false;
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
      this.getCommonlyUsed();
      this.firstLoad = false;
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
.name {
  display: flex;
  align-items: center;
}
.blue-ball {
  display: block;
  width: 8px;
  height: 8px;
  background-color: blue;
  border-radius: 50%;
  margin: 0 10px;
}
</style>
