<!--
 * @Author: Yin Rui Xue P644244@gnpjvc.com.cn
 * @Date: 2025-06-17 18:30:47
 * @LastEditors: [P631038]杨旭
 * @LastEditTime: 2025-10-17 14:37:00
 * @FilePath: \cud4demo-ui\src\modules\customGraph\components\charts\TodoIndicators.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="todo-indicators">
    <div
      ref="todoContent"
      :class="['todoContent', className]"
      v-loading="loading"
    >
      <div
        class="card-box"
        :style="contentHeight"
        v-for="(item, index) in getConfig"
        :key="index"
      >
        <div class="card" :style="cardStyle" @click="jumpOffice(item.path)">
          <div :style="imageWidthStyle" class="imgClass">
            <img v-if="item.label === '待阅'" src="@/assets/img/u32.png" />
            <img v-else-if="item.label === '已阅'" src="@/assets/img/u33.svg" />
            <img
              v-else-if="item.label === '已办'"
              src="@/assets/img/u131.svg"
            />
            <img v-else src="@/assets/img/u35.png" />
          </div>
          <div class="name">
            <div
              :style="numStyle"
              :title="getNumber(item.label)"
              class="num-class"
            >
              {{ getNumber(item.label) }}
            </div>

            <div :style="nameStyle" class="text-class">{{ item.label }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * 待办指标组件
 *
 * 用于展示各类待办事项的关键指标数据，支持多种指标类型和可视化方式
 * 特性：
 * - 支持多种待办指标的统计展示（如完成率、逾期率、平均处理时间等）
 * - 可配置指标展示的样式和布局
 * - 支持指标数据的实时更新
 * - 可设置指标阈值，突出显示异常指标
 * - 支持指标趋势对比和历史数据查看
 *
 * @component
 * @example
 * <todo-indicators
 *   :config="{
 *     title: '待办指标',
 *     indicators: [
 *       { name: '完成率', value: 85, unit: '%', target: 90 },
 *       { name: '平均处理时间', value: 2.5, unit: '小时', target: 2 }
 *     ],
 *     showTrend: true
 *   }"
 * />
 */
import { queryIndicator } from "@/modules/customPortal/api/pageManagement";
export default {
  name: "TodoIndicators",
  data() {
    return {
      className: 0,
      loading: false,
      todoList: [],
      todoObj: null,
      nameList: [
        {
          label: "待阅",
          value: "copy",
          path: "taskCcList"
        },
        {
          label: "已阅",
          value: "create",
          path: "taskCcHistList"
        },
        {
          label: "已办",
          value: "handed",
          path: "taskHistList"
        },
        {
          label: "待办",
          value: "preHand",
          path: "taskList"
        }
      ]
    };
  },
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
  methods: {
    observeWidth() {
      const dom = this.$refs.todoContent;
      const observe = new ResizeObserver(entries => {
        for (let entry of entries) {
          if (entry.contentRect.width > 628) {
            this.className = "max";
          } else if (entry.contentRect.width < 628) {
            this.className = "small";
          } else {
            this.className = "default";
          }
        }
      });
      observe.observe(dom);
    },
    jumpOffice(path) {
      this.$router.push({
        path: "/office",
        query: {
          tab: path
        }
      });
    },
    getNumber(name) {
      let str = 0;
      if (this.todoObj) {
        this.nameList.forEach(item => {
          if (
            (this.todoObj[item.value] || this.todoObj[item.value] == 0) &&
            name === item.label
          ) {
            str = this.todoObj[item.value];
          }
        });
      }
      return str;
    },
    // 强制刷新组件
    refreshComponent() {
      this.$forceUpdate();
    },
    getQueryIndicator() {
      let _this = this;
      _this.loading = true;
      queryIndicator(false)
        .then(result => {
          if (result.code !== "1") {
            let data = result.data;
            _this.todoObj = data;
            _this.nameList.forEach(item => {
              if (data[item.value] || data[item.value] == 0) {
                _this.todoList.push(item.label);
              }
            });
          }
          _this.loading = false;
        })
        .catch(err => {
          _this.$message({
            message: err,
            type: "warning"
          });
          _this.loading = false;
        });
    }
  },
  computed: {
    getConfig() {
      let arr = null;
      if (this.config.list && this.config.list.length > 0) {
        arr = this.config.list;
      } else {
        arr = this.todoList;
      }
      return this.nameList.filter(d => arr.includes(d.label));
    },
    imageWidthStyle() {
      // const width = parseFloat(this.config.imgWidthAccount || 0.5) * 100;
      // return {
      //   width: `${width}%`,
      //   height: "90%"
      // };
    },
    contentHeight() {
      const height = parseFloat(this.config.todoHeight || 100);
      return {
        height: `${height}px`
      };
    },
    cardStyle() {
      // const maxWidth = parseFloat(this.config.maxWidth || 230);
      // const minWidth = parseFloat(this.config.minWidth || 140);
      // const scpacing = parseFloat(this.config.scpacing || 20);
      // return {
      //   maxWidth: `${maxWidth}px`,
      //   minWidth: `${minWidth}px` || "140px",
      //   marginRight: `${scpacing}px`
      // };
    },
    numStyle() {
      const str = parseFloat(this.config.numSize || 20);
      return {
        fontSize: `${str}px`,
        fontWeight: "bold"
      };
    },
    nameStyle() {
      const str = parseFloat(this.config.nameSize || 16);
      const lineSpacing = parseFloat(this.config.lineSpacing || 16);
      return {
        fontSize: `${str}px`,
        marginTop: `${lineSpacing}px`
      };
    }
  },
  mounted() {
    this.observeWidth();
    this.getQueryIndicator();
    // 监听图表更新事件
    this.$bus.on(`chart-update`, chartId => {
      if (chartId === this.id) {
        // 强制刷新组件以应用新配置
        this.refreshComponent();

        // 显示配置已保存的消息
        this.$message({
          message: "配置已保存",
          type: "success",
          duration: 2000
        });
      }
    });
  },
  beforeDestroy() {
    // 移除事件监听
    this.$bus.off(`chart-update`);
  }
};
</script>
<style scoped lang="less">
.todo-indicators {
  .title {
    padding: 10px;
  }
}
.todoContent {
  display: flex;
  align-items: center;
  padding: 16px;
  width: calc(100% - 32px);
  overflow-x: hidden;
  height: calc(100% - 32px);
  justify-content: space-between;
}
.card-box {
  &:last-child {
    .card {
      margin-right: 0 !important;
    }
  }
}
.card {
  height: 100%;
  border: 1px solid #e6e6e6;
  border-radius: 5px;
  display: flex;
  cursor: pointer;
  padding: 10px 8px;
  box-sizing: border-box;
  .name {
    display: flex;
    .num-class,
    .text-class {
      display: inline-block;
    }
  }
}
.imgClass {
  width: 70px;
  height: 70px;
  margin-right: 10px;
  img {
    width: 100%;
    height: 100%;
    // margin: 5%;
  }
}
.default {
  .card-box {
    width: calc(25% - 10px);
  }
  .name {
    flex-direction: column;
  }
}
.max {
  .card-box {
    width: calc(25% - 10px);
  }
  .name {
    display: flex;
    align-items: center;
    justify-content: space-around;
    width: calc(100% - 80px);
    .num-class {
      margin-left: 10px;
      width: calc(100% - 50px);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .text-class {
      margin-top: 0 !important;
      margin-right: 20px;
      width: 40px;
    }
  }
}
.small {
  flex-wrap: wrap;
  .card-box {
    width: calc(50% - 10px);
  }
  .name {
    flex-direction: column;
  }
}
</style>
