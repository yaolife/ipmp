<!--
  可视化编辑器组件
  功能：
  - 提供基础信息和项目编排两个主要功能模块
  - 支持项目的保存、发布、预览功能
  - 包含版本管理功能
  - 支持编辑操作的撤销和重做
-->
<template>
  <!-- 整体容器 -->
  <div class="graph-box">
    <div class="graph-container">
      <!-- 顶部模块组件 -->
      <top-module
        :page-title="pageTitle"
        :active-tab="activeTab"
        :can-undo="canUndo"
        :can-redo="canRedo"
        :has-content="hasContent"
        @update:activeTab="activeTab = $event"
        @undo="handleUndo"
        @redo="handleRedo"
        @save="handleSave"
        @publish="publishDialogVisible = true"
        @preview="handlePreview"
        @version-command="handleVersionCommand"
      />

      <!-- 基础信息页面 -->
      <basic-info v-show="activeTab === 'basicInfo'" ref="basicInfo" />

      <!-- 项目编排内容页面 -->
      <graph-edit
        v-show="activeTab === 'graphEditor'"
        ref="graphEdit"
        @history-change="updateUndoRedoState"
      />
    </div>
    <!-- 发布说明弹窗 -->
    <publish-dialog
      @saveData="handleSave"
      :visible.sync="publishDialogVisible"
      :page-ids="selectedPublishPageIds"
    />
    <!-- 版本历史弹窗 -->
    <version-dialog
      :visible.sync="versionDialogVisible"
      :page-id="currentVersionPageId"
      :page-name="currentVersionPageName"
    />
  </div>
</template>

<script>
import BasicInfo from "./components/BasicInfo.vue";
import GraphEdit from "./components/EditGraph.vue";
import TopModule from "./components/TopModule.vue";
import PublishDialog from "@/modules/customPortal/components/PublishDialog";
import VersionDialog from "@/modules/customPortal/components/VersionDialog";
import {
  updatePageInfo,
  getPageDetail,
  savePage,
} from "@/modules/customPortal/api/pageManagement";
export default {
  name: "GraphEditor",
  components: {
    BasicInfo,
    GraphEdit,
    TopModule,
    PublishDialog,
    VersionDialog,
  },
  // props: {
  //   id: {
  //     type: [String, Number],
  //     default: null
  //   },
  //   pathParam: {
  //     type: String,
  //     default: null
  //   }
  // },
  /**
   * 组件数据
   * @property {string} activeTab - 当前激活的标签页，默认为项目编排页面
   * @property {string} pageTitle - 页面标题
   * @property {boolean} canUndo - 是否可以执行撤销操作
   * @property {boolean} canRedo - 是否可以执行重做操作
   * @property {boolean} hasContent - 画布是否有内容，用于控制按钮禁用状态
   */
  data() {
    return {
      selectedPublishPageIds: [this.$route.params.id],
      publishDialogVisible: false,
      versionDialogVisible: false,
      currentVersionPageId: "",
      currentVersionPageName: "",
      activeTab: "graphEditor", // 默认显示项目编排页面
      pageTitle: "可视化编辑器", // 页面标题
      canUndo: false,
      canRedo: false,
      hasContent: false, // 画布是否有内容
      // 存储两个标签页的数据状态
      pageData: {
        basicInfo: null, // 基础信息数据
        graphEditor: null, // 项目编排数据
      },
      // 记录数据是否已经初始化
      isDataInitialized: false,
    };
  },
  /**
   * 计算属性
   * @property {Array} graphLayout - 获取图形编辑器的布局数据
   */
  computed: {
    graphLayout() {
      return this.$refs.graphEdit && this.$refs.graphEdit.layout;
    },
  },
  /**
   * 监听器
   * 监听graphLayout变化，当布局数据变化时检查内容状态和更新撤销/重做按钮状态
   * 监听activeTab变化，在标签页切换时保存和恢复数据
   */
  watch: {
    graphLayout: {
      handler() {
        this.checkContent();
        this.updateUndoRedoState();
      },
      deep: true, // 深度监听对象变化
    },
    // 监听标签页切换
    activeTab: {
      handler(newTab, oldTab) {
        if (!this.isDataInitialized) return; // 初始化前不处理

        // 保存上一个标签页的数据
        if (oldTab === "basicInfo" && this.$refs.basicInfo) {
          this.$refs.basicInfo
            .getFormData()
            .then((data) => {
              this.pageData.basicInfo = data;
            })
            .catch((err) => {
              this.$message.error("保存基础信息数据失败:", err);
            });
        } else if (oldTab === "graphEditor" && this.$refs.graphEdit) {
          this.pageData.graphEditor = this.$refs.graphEdit.getLayoutData();
        }

        // 恢复当前标签页的数据
        this.$nextTick(() => {
          if (
            newTab === "basicInfo" &&
            this.$refs.basicInfo &&
            this.pageData.basicInfo
          ) {
            this.$refs.basicInfo.setFormData(this.pageData.basicInfo);
          } else if (
            newTab === "graphEditor" &&
            this.$refs.graphEdit &&
            this.pageData.graphEditor
          ) {
            this.$refs.graphEdit.setLayoutData(this.pageData.graphEditor);
            this.updateUndoRedoState();
          }
        });
      },
    },
  },
  /**
   * 生命周期钩子 - 组件挂载完成
   * 初始化时检查画布内容状态和撤销/重做按钮状态
   * 获取并初始化数据
   */
  mounted() {
    // 初始检查画布内容
    this.checkContent();
    // 初始化撤销/重做按钮状态
    this.updateUndoRedoState();
    // 获取数据并初始化
    this.fetchGraphData()
      .then(() => {
        // 数据加载完成后，根据当前标签页初始化组件数据
        this.$nextTick(() => {
          if (
            this.activeTab === "basicInfo" &&
            this.$refs.basicInfo &&
            this.pageData.basicInfo
          ) {
            this.$refs.basicInfo.setFormData(this.pageData.basicInfo);
          } else if (
            this.activeTab === "graphEditor" &&
            this.$refs.graphEdit &&
            this.pageData.graphEditor
          ) {
            this.$refs.graphEdit.setLayoutData(this.pageData.graphEditor);
            this.updateUndoRedoState();
          }
        });
      })
      .catch((error) => {
        this.$message.error("数据加载失败");
      });
  },

  methods: {
    /**
     * 获取图形数据
     * 根据路由参数获取已有的布局数据，并进行回显
     * 这里使用mock数据模拟接口请求
     */
    async fetchGraphData() {
      try {
        // 获取路由参数中的ID
        const pageId = this.$route.params.id;
        const responseData = await getPageDetail({ pageId });
        const { data, code, msg } = responseData.data;
        if (code === "1") {
          this.$message.error(msg || "失败");
          return;
        }
        const response = {
          basicInfo: {
            pageName: data.pageName,
            pageType: data.type,
            roleIds: data.roleIds,
            routePath: data.route,
            monitorCode: data.monitorCode,
          },
          graphData: data.config ? JSON.parse(data.config) : {},
        };

        // 保存数据到页面数据状态中
        this.pageData.basicInfo = response.basicInfo;
        this.pageData.graphEditor = response.graphData;
        this.pageTitle = response.basicInfo.pageName;
        // 标记数据已初始化
        this.isDataInitialized = true;

        // 确保当前是项目编排页面
        if (this.activeTab !== "graphEditor") {
          this.activeTab = "graphEditor";
        }

        // 等待下一个DOM更新周期，确保graphEdit组件已经渲染
        this.$nextTick(() => {
          // 调用graphEdit组件的setLayoutData方法进行数据回显
          if (this.$refs.graphEdit) {
            this.$refs.graphEdit.setLayoutData(response.graphData);
            // 更新撤销/重做按钮状态和内容检查
            this.updateUndoRedoState();
          }
        });
      } catch (error) {
        this.$message.error("获取图形数据失败");
      }
    },

    /**
     * 处理保存操作
     * 保存两个标签页的完整数据
     * 无论当前在哪个标签页，都会保存完整的项目数据
     */
    async handleSave(status) {
      try {
        let basicData = this.pageData.basicInfo;
        let graphData = this.pageData.graphEditor;

        // 获取当前激活标签页的最新数据
        if (this.activeTab === "basicInfo") {
          // 如果在基础信息页面，先验证并获取表单数据
          basicData = await this.$refs.basicInfo.getFormData();
          // 使用已保存的项目编排数据
          graphData = this.pageData.graphEditor;
        } else {
          // 如果在项目编排页面，获取最新的布局数据
          graphData = await this.$refs.graphEdit.getLayoutData();
          // 使用已保存的基础信息数据
          if (this.pageData.basicInfo) {
            basicData = this.pageData.basicInfo;
          } else if (this.$refs.basicInfo) {
            // 如果没有保存的基础信息，尝试从组件获取
            try {
              basicData = await this.$refs.basicInfo.getFormData();
            } catch (error) {
              this.$message.error(error);
            }
          }
        }



         //设置为空
        for (let i = 0; i < graphData.layout.length; i++) {
          let e = graphData.layout[i]
            if (e.config.dataList) {
              e.config.dataList = []
            }
        }

        
        /** 解决图片15分钟失效问题 , 传递id给后端获取刷新 */
        // 把json中所有的image字段删除,包括值
        let result = JSON.stringify(graphData).replace(
          /"image":"[^"]*",?/g,
          ""
        );
        // 2. 处理可能出现的多余逗号
        let result2 = result.replace(/,(\s*[}\]])/g, "$1");
        // 3. 新增逻辑：为每个 imageId 创建对应的 image 字段
        // 使用更精确的正则来匹配 "imageId":"值" 的模式
        let newJsonString = result2.replace(
          /"imageId":"([^"]*)"/g,
          '"imageId":"$1","image":"$1"'
        );

        this.pageData.basicInfo = basicData;
        this.pageData.graphEditor = newJsonString;

        // this.pageData.graphEditor = graphData;
        // 构建完整的保存数据
        const saveData = {
          basicInfo: basicData,
          graphData: graphData,
        };

        if (this.activeTab === "basicInfo") {
          // 更新基本信息
          const params = {
            id: this.$route.params.id,
            ...this.pageData.basicInfo,
          };
          await updatePageInfo(params);
          this.$message.success("更新成功");
        } else {
          // 画布保存
          const params = {
            id: this.$route.params.id,
            config: this.pageData.graphEditor,
            // config: JSON.stringify(this.pageData.graphEditor),
          };

          await savePage(params);
          status && this.$message.success("保存成功");
        }
      } catch (error) {
        this.$message.error(error.message || "保存失败");
      }
    },

    /**
     * 处理预览操作
     * 获取当前布局数据，保存到localStorage，然后在新窗口打开预览页面
     */
    async handlePreview() {
      console.log(this.$route.params.id);
      try {
        if (this.activeTab === "graphEditor") {
          // 获取当前布局数据
          const graphData = await this.$refs.graphEdit.getLayoutData();
          // 保存完整的layout数组到localStorage中供预览页面使用
          // 确保包含所有必要的组件属性（类型、配置等）
          localStorage.removeItem(`graphLayout-${this.$route.params.id}`);
          localStorage.setItem(
            `graphLayout-${this.$route.params.id}`,
            JSON.stringify(graphData.layout)
          );
        }
        // 打开预览页面
        this.$router.push({
          path: "/customPreview",
          query: {
            indexId: this.$route.params.id,
          },
        });
      } catch (error) {
        this.$message.error(error.message || "获取预览数据失败");
      }
    },

    // 版本操作处理
    handleVersionCommand() {
      this.versionDialogVisible = true;
      this.currentVersionPageId = this.$route.params.id;
      this.currentVersionPageName = this.pageData.basicInfo.pageName;
    },

    // 撤销操作
    handleUndo() {
      if (this.activeTab === "graphEditor") {
        this.$refs.graphEdit.undo();
        this.updateUndoRedoState();
      }
    },

    // 重做操作
    handleRedo() {
      if (this.activeTab === "graphEditor") {
        this.$refs.graphEdit.redo();
        this.updateUndoRedoState();
      }
    },

    /**
     * 检查画布内容
     * 判断项目编排页面是否有内容，用于控制按钮的禁用状态
     */
    checkContent() {
      if (this.activeTab === "graphEditor") {
        if (this.$refs.graphEdit && this.$refs.graphEdit.layout) {
          this.hasContent = this.$refs.graphEdit.layout.length > 0;
        } else {
          this.hasContent = false;
        }
      }
    },

    /**
     * 更新撤销/重做按钮状态
     * 从图形编辑器组件获取当前的撤销/重做状态
     */
    updateUndoRedoState() {
      if (this.activeTab === "graphEditor") {
        this.canUndo = this.$refs.graphEdit.canUndo();
        this.canRedo = this.$refs.graphEdit.canRedo();
        this.checkContent();
      }
    },
  },
};
</script>

<style lang="less" scoped>
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
</style>
