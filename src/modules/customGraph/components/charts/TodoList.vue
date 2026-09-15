<template>
  <div class="todo-list-container">
    <el-tabs v-model="activeTab" @tab-click="handleTabClick" :key="activeTab">
      <el-tab-pane v-if="showTab('pending')" label="待办" name="pending">
        <div class="todo-items" v-loading="loading" @scroll="handleScroll">
          <transition-group name="todo-list" tag="div">
            <div
              v-for="(item, index) in pendingItems"
              :key="item.id + index"
              class="todo-item"
              @click="handleItemClick(item, 'taskList')"
            >
              <div class="todo-item-title" :style="todoListStyle">
                {{ item.title }}
                <!-- <span v-if="item.delay" class="delay-tag"
                  >（延期{{ item.delay }}天）</span
                > -->
              </div>
              <div class="todo-item-info" :style="todoListStyle">
                <span>发起人：{{ item.creator }}</span>
                <!-- <el-tooltip
                  :content="'发起时间：' + item.createTime"
                  placement="top"
                > -->
                <span class="create-time">发起时间：{{ item.createTime }}</span>
                <!-- </el-tooltip> -->
                <!-- <span>类型：{{ item.type }}</span> -->
              </div>
            </div>
          </transition-group>
          <div v-if="pendingItems.length === 0" class="empty-text">
            暂无数据
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane v-if="showTab('completed')" label="已办" name="completed">
        <div class="todo-items" v-loading="loading" @scroll="handleScroll">
          <div
            v-for="(item, index) in completedItems"
            :key="item.id || index"
            class="todo-item"
            @click="handleItemClick(item, 'taskHistList')"
          >
            <div class="todo-item-title" :style="todoListStyle">
              {{ item.title }}
              <!-- <span v-if="item.delay" class="delay-tag"
                >（延期{{ item.delay }}天）</span
              > -->
            </div>
            <div class="todo-item-info" :style="todoListStyle">
              <span>发起人：{{ item.creator }}</span>
              <!-- <el-tooltip
                :content="'发起时间：' + item.createTime"
                placement="top"
              > -->
              <span class="create-time">发起时间：{{ item.createTime }}</span>
              <!-- </el-tooltip> -->
              <!-- <span>类型：{{ item.type }}</span> -->
            </div>
          </div>
          <div v-if="completedItems.length === 0" class="empty-text">
            暂无数据
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane v-if="showTab('cc')" label="待阅" name="cc">
        <div class="todo-items" v-loading="loading" @scroll="handleScroll">
          <div
            v-for="(item, index) in ccItems"
            :key="item.id || index"
            class="todo-item"
            @click="handleItemClick(item, 'taskCcList')"
          >
            <div class="todo-item-title" :style="todoListStyle">
              {{ item.title }}
              <!-- <span v-if="item.delay" class="delay-tag"
                >（延期{{ item.delay }}天）</span
              > -->
            </div>
            <div class="todo-item-info" :style="todoListStyle">
              <span>发起人：{{ item.creator }}</span>
              <!-- <el-tooltip
                :content="'发起时间：' + item.createTime"
                placement="top"
              > -->
              <span class="create-time">发起时间：{{ item.createTime }}</span>
              <!-- </el-tooltip> -->
              <!-- <span>类型：{{ item.type }}</span> -->
            </div>
          </div>
          <div v-if="ccItems.length === 0" class="empty-text">暂无数据</div>
        </div>
      </el-tab-pane>
      <el-tab-pane v-if="showTab('created')" label="已阅" name="created">
        <div class="todo-items" v-loading="loading" @scroll="handleScroll">
          <transition-group name="todo-list" tag="div">
            <div
              v-for="(item, index) in createdItems"
              :key="item.id || index"
              class="todo-item"
              @click="handleItemClick(item, 'taskCcHistList')"
            >
              <div class="todo-item-title" :style="todoListStyle">
                {{ item.title }}
                <!-- <span v-if="item.delay" class="delay-tag"
                  >（延期{{ item.delay }}天）</span
                > -->
              </div>
              <div class="todo-item-info" :style="todoListStyle">
                <span>发起人：{{ item.creator }}</span>
                <!-- <el-tooltip
                  :content="'发起时间：' + item.createTime"
                  placement="top"
                > -->
                <span class="create-time">发起时间：{{ item.createTime }}</span>
                <!-- </el-tooltip> -->
                <!-- <span>类型：{{ item.type }}</span> -->
              </div>
            </div>
          </transition-group>
          <div v-if="createdItems.length === 0" class="empty-text">
            暂无数据
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import {
  queryTask,
  queryTaskCCHist,
  queryTaskHist,
  queryTaskWaiting,
} from "@/modules/customPortal/api/pageManagement";
import ApiTask from "@/components/cgnTask/common/ApiTask";
export default {
  name: "TodoList",
  props: {
    id: {
      type: String,
      required: true,
    },
    config: {
      type: Object,
      default: () => ({
        title: "我的待办",
        maxRows: 10,
        rowHeight: 35, // 行高
        rowPadding: 3, // 内边距
        fontSize: 12, // 字体大小（最小12）
        todoTypes: ["pending", "created", "completed", "cc"], // 至少选择一项
        // refreshInterval: 5, // 刷新间隔，单位分钟
      }),
    },
  },
  data() {
    return {
      loading: false,
      activeTab: "pending",
      pendingItems: [],
      createdItems: [],
      completedItems: [],
      ccItems: [],
      refreshTimer: null,
      appliedConfig: null, // 存储已应用的配置
      refreshIndex: 0,
      pageSize: this.config.maxRows || 10,
      pageIndex: 1,
      total: 0,
    };
  },
  mounted() {
    this.getQueryTask();
  },
  methods: {
    fetchTodoData(type) {
      this.pendingItems = [];
      this.createdItems = [];
      this.completedItems = [];
      this.ccItems = [];
      const exampleData = {
        pending: this.getQueryTask,
        created: this.getQueryTaskList,
        completed: this.getQueryTaskHist,
        cc: this.getQueryTaskCC,
      };

      exampleData[type]() || [];
    },

    // 待办
    async getQueryTask() {
      const params = {
        taskOrderBy: "0",
        pageIndex: this.pageIndex,
        pageSize: this.pageSize,
        priority: "",
        procSubject: "",
        startUserId: "",
        startDeptId: "",
        procDefName: "",
        startAssignTime: "",
        endAssignTime: "",
        procCategoryId: "",
      };
      if (this.total === 0 || this.pendingItems.length < this.total) {
        this.loading = true;
        const { data, code } = await queryTask(params, false);
        console.log(data, code);
        this.loading = false;
        if (code !== "0" && !data.page && !data.page.records) {
          return;
        }
        // this.pendingItems = (data.page.records || [])
        data.page.records.forEach((item) => {
          Object.assign(item, {
            title: item.procSubject,
            createTime: item.startTime,
            creator: item.startUserIdName,
          });
        });
        this.pendingItems = [...this.pendingItems, ...data.page.records];
        this.total = data.page.total;
        console.log(this.pendingItems, "===");
        // .slice(0, this.config.maxRows);
        // console.log(this.config.maxRows, "item111111111111", this.pendingItems);
        this.$set(this.config, "dataList", this.pendingItems);
      }
    },
    // 已阅
    async getQueryTaskList() {
      const str = sessionStorage.getItem("user");

      const regex = /\[(.*?)\]/;
      const params = {
        taskOrderBy: "0",
        procName: "",
        procSubject: "",
        //startUserId: str.match(regex)[1],
        status: "",
        startTimeBegin: "",
        startTimeEnd: "",
        dataSource: "",
        pageIndex: this.pageIndex,
        pageSize: this.pageSize,
      };
      if (this.total === 0 || this.createdItems.length < this.total) {
        this.loading = true;
        const { data, code } = await queryTaskCCHist(params, false);
        this.loading = false;
        if (code !== "0" && !data.page && !data.page.records) {
          return;
        }
        console.log("已阅", data.page.records);
        // this.createdItems = (data.page.records || [])
        data.page.records.forEach((item) => {
          Object.assign(item, {
            title: item.procSubject,
            createTime: item.startTime,
            creator: item.startUserIdName,
          });
        });

        this.createdItems = [...this.createdItems, ...data.page.records];
        this.total = data.page.total;
        // .slice(0, this.config.maxRows);
        this.$set(this.config, "dataList", this.createdItems);
      }
    },
    //  已办
    async getQueryTaskHist() {
      const params = {
        taskOrderBy: "0",
        pageIndex: this.pageIndex,
        pageSize: this.pageSize,
        priority: "",
        procSubject: "",
        startUserId: "",
        startDeptId: "",
        procDefName: "",
        startAssignTime: "",
        endAssignTime: "",
        startCompletedTime: "",
        endCompletedTime: "",
        procInstStatus: "",
        procCategoryId: "",
        dataSource: "",
      };
      if (this.total === 0 || this.completedItems.length < this.total) {
        this.loading = true;
        const { data, code } = await queryTaskHist(params, false);
        this.loading = false;
        if (code !== "0" && !data.page && !data.page.records) {
          return;
        }
        data.page.records.forEach((item) => {
          Object.assign(item, {
            title: item.procSubject,
            createTime: item.startTime,
            creator: item.startUserIdName,
          });
        });
        this.completedItems = [...this.completedItems, ...data.page.records];
        this.total = data.page.total;
        console.log(data.page.records, 1122, this.completedItems);
        this.$set(this.config, "dataList", this.completedItems);
      }
    },
    // 待阅
    async getQueryTaskCC() {
      const params = {
        taskOrderBy: "0",
        pageIndex: this.pageIndex,
        pageSize: this.pageSize,
        priority: "",
        procSubject: "",
        startUserId: "",
        startDeptId: "",
        procDefName: "",
        startAssignTime: "",
        endAssignTime: "",
        procCategoryId: "",
      };
      if (this.total === 0 || this.ccItems.length < this.total) {
        this.loading = true;
        const { data, code } = await queryTaskWaiting(params, false);
        this.loading = false;
        if (code !== "0" && !data.page && !data.page.records) {
          return;
        }
        // this.ccItems = (data.page.records || [])
        data.page.records.forEach((item) => {
          Object.assign(item, {
            title: item.procSubject,
            createTime: item.startTime,
            creator: item.startUserIdName,
          });
        });
        this.ccItems = [...this.ccItems, ...data.page.records];
        this.total = data.page.total;
        // .slice(0, this.config.maxRows);
        this.$set(this.config, "dataList", this.ccItems);
      }
    },
    // 处理配置更新
    handleConfigUpdate(newConfig) {
      this.appliedConfig = JSON.parse(JSON.stringify(newConfig));
      this.pageSize = this.appliedConfig.maxRows;
    },
    showTab(tabName) {
      const config = this.appliedConfig || this.config;
      const todoTypes = config.todoTypes || [
        "pending",
        "created",
        "completed",
        "cc",
      ];
      return todoTypes.includes(tabName);
    },
    handleTabClick() {
      this.pageIndex = 1;
      this.total = 0;
      this.fetchTodoData(this.activeTab);
    },
    handleItemClick(item, tab) {
      item.dataType = tab;
      const dataType = {
        draft: 4,
        taskList: 2,
        taskHistList: 3,
        taskCcList: 5,
        taskCcHistList: 6,
      };
      let dataInfo = {
        // 流程ID
        procId: item.procDefId,
        // 流程版本
        procVersion: item.taskExtend01,
        // 流程名
        procName: item.procDefName,
        // 流程实例ID
        procInstId: item.procInstId,
        // 类型 // 1 发起页面 / 2 待办页面 / 3 已办页面 / 4 草稿页面
        procNode: dataType[tab],
        // 活动ID
        actId: item.procActId,
        // 活动实例ID
        actInstId: item.procActInstId,
        // 活动名
        actName: item.procActName,
        // 上一操作流程环节id
        sentByProcActId: item.sentByProcActId,
        // 流程模型ID
        procModelId: item.procModelId,
        // 任务ID
        procTaskId: item.id,
        // 会签ID
        cosignItemCode: item.cosignItemCode,
        procInstStatus: item.procInstStatus,
        endTime: item.endTime,
        actCode: item.actCode,
        // 流程状态
        flowStatus: "2",
      };
      sessionStorage.removeItem("procItem");
      sessionStorage.setItem("procItem", JSON.stringify(dataInfo));
      // 待办列表，验证任务是否被任务，被处理刷新列表，未被处理打开新页面
      if (tab === "taskList") {
        let params = {
          procId: item.procDefId,
          procTaskId: item.id,
        };
        this.loading = true;
        ApiTask.checkTask(params)
          .then((res) => {
            this.loading = false;
            if (res.data.code === "0") {
              if (item.formUrl) {
                this.$router.push({
                  path: item.formUrl,
                  query: {
                    actId: dataInfo.actId,
                    procNode: dataInfo.procNode,
                    procVersion: dataInfo.procVersion,
                    procId: dataInfo.procId,
                    id: dataInfo.procTaskId,
                    actInstId: dataInfo.actInstId,
                    procInstId: dataInfo.procInstId,
                    procName: dataInfo.procName,
                    r: Math.random(),
                    // 流程状态
                    flowStatus: "2",
                    sentByProcActId: item.sentByProcActId,
                  },
                });
              } else {
                //打开页签
                this.openTab({
                  path: "/workbench/view",
                  query: {
                    procName: dataInfo.procName,
                    r: Math.random(),
                  },
                });
              }
            } else {
              this.$alert(res.data.msg);
              // 更新任务数量
              this.getQueryTask();
            }
          })
          .catch((err) => {
            this.loading = false;
          });
      } else {
        if (item.formUrl) {
          this.$router.push({
            path: item.formUrl,
            query: {
              actId: dataInfo.actId,
              procNode: dataInfo.procNode,
              procVersion: dataInfo.procVersion,
              procId: dataInfo.procId,
              id: dataInfo.procTaskId,
              actInstId: dataInfo.actInstId,
              procInstId: dataInfo.procInstId,
              procName: dataInfo.procName,
              r: Math.random(),
              // 流程状态
              flowStatus: "2",
            },
          });
        } else {
          //打开页签
          this.openTab({
            path: "/workbench/view",
            query: {
              // item: dataInfo
              procName: dataInfo.procName,
              r: Math.random(),
            },
          });
        }
      }
    },
    // 滚动触底判断
    handleScroll(e) {
      const el = e.target;
      // 滚动条到底：滚动高度+可视高度 >= 总高度（留10px阈值防抖动）
      if (
        el.scrollTop + el.clientHeight >= el.scrollHeight - 10 &&
        !this.loading
      ) {
        this.pageIndex++;
        if (this.activeTab === "pending") {
          this.getQueryTask();
        } else if (this.activeTab === "created") {
          this.getQueryTaskList();
        } else if (this.activeTab === "completed") {
          this.getQueryTaskHist();
        } else if (this.activeTab === "cc") {
          this.getQueryTaskCC();
        }
      }
    },
  },
  computed: {
    todoListStyle() {
      const config = this.config || {};
      return {
        "--row-height": `${config.rowHeight || 35}px`,
        "--margin-bottom": `${config.rowPadding || 3}px`,
        "--margin-top": `${config.rowPadding || 3}px`,
        "--font-size": `${config.fontSize || 14}px`,
      };
    },
    limitedPendingItems() {
      return this.pendingItems.length > 0
        ? this.pendingItems.slice(0, this.config.maxRows)
        : [];
    },
    limitedCreatedItems() {
      return this.createdItems.length > 0
        ? this.createdItems.slice(0, this.config.maxRows)
        : [];
    },
    limitedCompletedItems() {
      return this.completedItems.length > 0
        ? this.completedItems.slice(0, this.config.maxRows)
        : [];
    },
    limitedCcItems() {
      return this.ccItems.length > 0
        ? this.ccItems.slice(0, this.config.maxRows)
        : [];
    },
  },
  watch: {
    config: {
      handler(newVal) {
        this.handleConfigUpdate(newVal);
      },
      deep: true,
    },
    "appliedConfig.todoTypes": {
      handler(newVal) {
        const todoTypes = newVal || [];

        // 仅在当前activeTab不在新配置的todoTypes中时，才选择第一个可用的tab
        if (todoTypes.length > 0 && !todoTypes.includes(this.activeTab)) {
          this.activeTab = todoTypes[0];
        }
        if (this.config.dataList) {
          // console.log("数据", this.config.dataList);
          // const objMap = {
          //   pending: "pendingItems",
          //   created: "createdItems",
          //   completed: "completedItems",
          //   cc: "ccItems"
          // };
          // this[objMap[this.activeTab]] = this.config.dataList.slice(
          //   0,
          //   this.config.maxRows
          // );
          // console.log(this.activeTab, objMap[this.activeTab]);
          // console.log(this.createdItems);
        } else {
          // 强制重新加载数据
          this.fetchTodoData(this.activeTab);
        }
        this.refreshIndex++;
        // 强制更新视图
        this.$forceUpdate();
      },
      deep: true,
    },
  },
  created() {
    // 初始化时加载数据
    this.appliedConfig = JSON.parse(JSON.stringify(this.config));

    // 如果配置中没有todoTypes，则设置默认包含所有类型
    if (!this.appliedConfig.todoTypes) {
      this.appliedConfig.todoTypes = ["pending", "created", "completed", "cc"];
    }

    // 确保activeTab是有效的类型
    if (!this.appliedConfig.todoTypes.includes(this.activeTab)) {
      this.activeTab = this.appliedConfig.todoTypes.includes("pending")
        ? "pending"
        : this.appliedConfig.todoTypes[0] || "pending";
    }
    // 设置定时刷新
    // this.setupRefreshTimer();
  },
  beforeDestroy() {
    // 组件销毁前清除定时器
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
  },
};
</script>

<style lang="less" scoped>
.todo-list-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border-radius: 4px;
  overflow: hidden;

  /deep/ .el-tabs__item {
    padding: 0 12px !important;
  }

  /deep/ .el-tabs {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 0px 15px 0 15px;
    height: 100%;
    overflow-x: hidden;
    // width: auto;
    box-sizing: border-box;
    .el-tabs__header {
      margin-bottom: 0px;
    }

    .el-tabs__content {
      flex: 1;
      overflow: hidden;
      padding: 0;
      height: calc(100% - 40px);
      display: flex;
      flex-direction: column;
    }

    .el-tabs__nav-wrap {
      padding-bottom: 5px;

      &::after {
        display: none;
      }
    }

    .el-tab-pane {
      height: 100%;
      overflow-y: auto;
      display: flex;
      overflow-x: hidden;
      flex-direction: column;

      /* 自定义滚动条样式 */
      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 3px;
      }

      &::-webkit-scrollbar-thumb {
        background: #c0c4cc;
        border-radius: 3px;
      }

      &::-webkit-scrollbar-thumb:hover {
        background: #909399;
      }
    }
  }
}

/deep/ .todo-items {
  flex: 1;
  overflow-y: auto;
  padding: 4px 12px 4px 8px;
  margin: 0 -8px;
  min-height: 0; /* 重要：防止flex子项溢出 */

  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c0c4cc;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #909399;
  }

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #e0e0e0;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: #c0c0c0;
  }

  &::-webkit-scrollbar-track {
    background-color: transparent;
  }

  .todo-item {
    padding: var(--row-padding, 6px 8px);
    border-radius: 2px;
    margin-bottom: 4px;
    border: 1px solid transparent;
    transition: all 0.2s ease;
    cursor: pointer;
    position: relative;

    &:hover {
      background-color: #f5f7fa;
      border-color: #ebeef5;
      box-shadow: 0 1px 6px 0 rgba(0, 0, 0, 0.1);
    }

    &:last-child {
      margin-bottom: 0;
    }

    .todo-item-title {
      font-size: var(--font-size, 12px);
      color: #303133;
      margin-bottom: 4px;
      font-weight: 500;
      line-height: var(--row-height, 1.2);

      .delay-tag {
        color: #f56c6c;
        margin-left: 4px;
        font-weight: normal;
        font-size: calc(var(--font-size, 12px) - 1px);
      }
    }

    .todo-item-info {
      font-size: calc(var(--font-size, 12px) - 1px);
      color: #909399;
      display: flex;
      justify-content: space-between;
      white-space: nowrap;
      overflow: hidden;

      span {
        margin-right: 8px;

        &:last-child {
          margin-right: 0;
        }
      }

      .create-time {
        text-align: right;
        overflow: hidden;
        text-overflow: ellipsis;
        flex: 1;
        min-width: 0;
      }
    }
  }

  .empty-text {
    width: 100%;
    height: 100%;
    text-align: center;
    color: #909399;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    &::before {
      // content: "📋";
      font-size: 24px;
      margin-bottom: 8px;
    }
  }

  @media screen and (max-width: 768px) {
    .todo-item {
      .todo-item-info {
        flex-direction: column;
        gap: 4px;

        span {
          margin-right: 0;
        }
      }
    }
  }
}
</style>
