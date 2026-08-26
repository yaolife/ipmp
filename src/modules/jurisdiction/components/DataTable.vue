<template>
  <div class="data-table-container" :style="{ height: height }">
    <!-- 搜索区域 -->
    <div class="search-card" v-if="searchConfig.length > 0">
      <queryForm
        :queryFields="queryFields"
        @submit="submitQueryForm"
        :labelWidth="labelWidth"
        ref="queryDialog"
        class="cud-commom-form-search"
        @resize="resizeTableHeight"
        :queryFormId="queryFormId"
      />
    </div>

    <div class="toolbar-table-container query-result cud__table--list">
      <!-- 工具栏按钮区域 -->
      <div class="toolbar-buttons" v-if="toolbarButtons.length > 0">
        <el-button
          v-for="(button, index) in toolbarButtons"
          :key="index"
          :type="button.type || 'primary'"
          :icon="button.icon"
          :disabled="button.disabled"
          @click="button.event"
        >
          {{ button.text }}
        </el-button>
      </div>

      <!-- 表格区域 -->
      <el-table
        ref="dataTable"
        :data="localPager ? localPageData : tableData"
        v-loading="loading"
        highlight-current-row
        header-row-class-name="cud-office-table-header"
        border
        stripe
        style="width: 100%;flex: 1;"
        class="cud-office-table"
        :max-height="getComputedHeight - 30"
        @selection-change="handleSelectionChange"
      >
        <el-table-column v-if="selection" type="selection" width="55">
        </el-table-column>
        <el-table-column
          v-for="column in tableColumns"
          :key="column.prop"
          :prop="column.prop"
          :label="column.label"
          :width="column.width || ''"
          :min-width="column.minWidth || '150'"
          :sortable="column.sortable"
          :fixed="column.fixed"
        >
          <template slot-scope="scope">
            <slot :name="`column-${column.prop}`" :row="scope.row">
              <el-tooltip
                effect="dark"
                placement="top"
                :disabled="
                  (function() {
                    var value = String(
                      column.formatter
                        ? column.formatter(scope.row[column.prop])
                        : scope.row[column.prop]
                    );
                    return value && value.length <= 20;
                  })()
                "
              >
                <div slot="content" class="tooltip-content">
                  {{
                    column.formatter
                      ? column.formatter(scope.row[column.prop])
                      : scope.row[column.prop]
                  }}
                </div>
                <div
                  :style="{
                    color:
                      (specialColorObj &&
                        specialColorObj[column.prop] &&
                        Array.isArray(specialColorObj[column.prop]) &&
                        specialColorObj[column.prop].find(
                          i => i.value == scope.row[column.prop]
                        ) &&
                        specialColorObj[column.prop].find(
                          i => i.value === scope.row[column.prop]
                        ).color) ||
                      (specialColorObj &&
                        specialColorObj[column.prop] &&
                        specialColorObj[column.prop].defaultColor) ||
                      '#606266'
                  }"
                >
                  <div v-if="column.formatType === 'status'">
                    <el-tag
                      class="cud-tb-tag"
                      v-if="scope.row[column.prop] === '1'"
                      type="success"
                    >
                      <i
                        class="cud-el-icon-point"
                        style="background: #41b048"
                      ></i>
                      已启用
                    </el-tag>
                    <el-tag
                      class="cud-tb-tag"
                      v-if="scope.row[column.prop] === '0'"
                      type="danger"
                    >
                      <i
                        class="cud-el-icon-point"
                        style="background: #e94848"
                      ></i>
                      已停用
                    </el-tag>
                  </div>
                  <div v-else>
                    {{
                      column.formatter
                        ? column.formatter(scope.row[column.prop])
                        : scope.row[column.prop]
                    }}
                  </div>
                </div>
              </el-tooltip>
            </slot>
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column
          v-if="operationConfig && operationConfig.actions.length > 0"
          label="操作"
          :width="operationConfig.width || 200"
          fixed="right"
        >
          <template slot-scope="scope">
            <div class="operation-buttons">
              <el-button
                v-for="(action, index) in getVisibleActions(scope.row)"
                :key="index"
                :type="action.type || 'primary'"
                :size="action.size || 'small'"
                :icon="action.icon"
                @click="handleAction(action.event, scope.row)"
                :style="{ color: action.color,margin:'0 8px 0 0' }"
              >
                {{ action.text }}
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div
        class="cud-special-pagination cud-special-pagination-button"
        v-if="pagination.total && pagination.total > 0"
        style="margin-bottom:10px"
      >
        <el-pagination
          popper-class="cud-pager-dropdown"
          ref="pager"
          class="cud__page"
          :page-sizes="[10, 20, 30, 40]"
          :pager-count="5"
          :current-page="pagination.currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          layout="total,sizes, prev, pager, next"
          :total="!localPager ? pagination.total : tableData.length"
        >
        </el-pagination>
      </div>

      <!-- <el-card class="table-card" shadow="never">
      </el-card> -->
    </div>
  </div>
</template>

<script>
import RemoteSelect from "./RemoteSelect.vue";
import queryForm from "@/components/common/queryForm";
import { throttle, calcHeight } from "@/utils/funcUtil";

export default {
  name: "DataTable",
  components: { RemoteSelect, queryForm },
  props: {
    labelWidth: {
      type: String,
      default: "120px"
    },
    queryFormId: {
      type: String,
      default: "cud-table-list"
    },
    localPager:{
      type: Boolean,
      default: false
    },
    // 搜索配置
    searchConfig: {
      type: Array,
      default: () => []
    },
    // 表格列配置
    tableColumns: {
      type: Array,
      default: () => []
    },
    // 操作列配置
    operationConfig: {
      type: Object,
      default: () => ({ actions: [] })
    },
    // 是否多选
    selection: {
      type: Boolean,
      default: false
    },
    // 数据加载函数
    loadData: {
      type: Function,
      required: true
    },
    // 是否立即加载数据
    immediate: {
      type: Boolean,
      default: true
    },
    // 工具栏按钮配置
    toolbarButtons: {
      type: Array,
      default: () => []
    },
    // 高度
    height: {
      type: String,
      default: "100%"
    },
    // 特殊字体颜色
    specialColorObj: {
      type: Object,
      default: () => {
        return {
          statusDesc: [
            { value: "启用", color: "#67C23A" },
            { value: "禁用", color: "#F56C6C" }
          ]
        };
      }
    }
  },

  data() {
    return {
      // 搜索表单
      computedHeight: 0,
      searchForm: {},
      // 分页配置
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      // 表格数据
      tableData: [],
      localPageData: [],
      loading: false,
      // queryFields: [
      //   {
      //     name: "procDefName",
      //     label: "",
      //     labelKey: "工作主题",
      //     value: "",
      //     type: "input",
      //     display: true,
      //     order: 1
      //   },
      //   {
      //     name: "startUserId",
      //     label: "",
      //     labelKey: "发起人",
      //     value: "",
      //     type: "personal",
      //     display: true,
      //     order: 2
      //   },
      // ],
      queryFields: []
    };
  },

  watch: {
    // 深度监听
    searchConfig: {
      deep: true,
      handler() {
        const arr = [];
        // dateRange
        this.searchConfig.forEach((item, index) => {
          const options = (item.options || []).map(item => {
            return {
              value: item.value,
              label: item.label || item.name
            };
          });
          arr.push({
            name: item.type === "datetimerange" ? "beginTime" : item.prop,
            label: "",
            labelKey: item.label,
            type:
              (item.type === "datetimerange" ? "dateRange" : item.type) ||
              "input",
            relation: item.type === "datetimerange" ? "endTime" : null,
            display: true,
            value: undefined,
            order: index,
            fieldMap: options || [],
            remote: item.remote,
            remoteMethod: item.api
          });
        });

        this.queryFields = arr;

        this.$forceUpdate();
        this.initSearchForm();
      },
      immediate: true
    }
  },
  computed: {
    getComputedHeight() {
      return this.computedHeight;
    }
  },
  mounted() {
    if (this.immediate) {
      this.loadTableData();
    }

    // 确保表格布局正确
    this.$nextTick(() => {
      if (this.$refs.dataTable) {
        this.$refs.dataTable.doLayout();
      }
    });
    // 监听窗口大小变化，重新计算表格布局
    window.addEventListener("resize", this.handleResize);
    this.throttleFunc = throttle(this.resizeTableHeight, 500);
    window.addEventListener("resize", this.throttleFunc);
  },
  beforeDestroy() {
    // 移除事件监听
    window.removeEventListener("resize", this.handleResize);
    window.removeEventListener("resize", this.throttleFunc);
  },

  methods: {
    resizeTableHeight() {
      calcHeight(this, 6);
    },
    submitQueryForm(params) {
      this.searchForm = params;
      this.pagination.currentPage = 1;
      this.loadTableData();
    },
    handlePublisherChange(val, prop) {
      this.searchForm[prop] = val;
    },
    // 初始化搜索表单
    initSearchForm() {
      const form = {};
      this.searchConfig.forEach(item => {
        form[item.prop] = item.defaultValue || "";
      });
      this.searchForm = form;
    },

    // 获取默认占位符
    getDefaultPlaceholder(item) {
      const placeholderMap = {
        input: `请输入${item.label}`,
        select: `请选择${item.label}`,
        date: `请选择${item.label}`,
        datetime: `请选择${item.label}`,
        datetimerange: `请选择${item.label}`,
        switch: ""
      };
      return placeholderMap[item.type] || `请输入${item.label}`;
    },

    // 获取组件类型
    getComponentType(type) {
      const componentMap = {
        input: "el-input",
        select: "el-select",
        date: "el-date-picker",
        datetime: "el-date-picker",
        datetimerange: "el-date-picker",
        switch: "el-switch",
        textarea: "el-input",
        number: "el-input-number",
        checkbox: "el-checkbox-group",
        radio: "el-radio-group"
      };
      return componentMap[type] || "el-input";
    },

    // 处理搜索
    handleSearch() {
      this.pagination.currentPage = 1;
      this.loadTableData();
    },

    // 处理选择
    handleSelectionChange(selection) {
      this.$emit("selection-change", selection);
    },

    // 处理重置
    handleReset() {
      // 手动重置所有表单字段，特别是处理日期时间范围选择器
      const form = {};
      this.searchConfig.forEach(item => {
        form[item.prop] =
          item.defaultValue || (item.type === "datetimerange" ? [] : "");
      });
      this.searchForm = form;
      this.handleSearch();
    },

    // 处理操作按钮点击
    handleAction(event, row) {
      event(row);
    },

    // 获取当前行可见的操作按钮
    getVisibleActions(row) {
      if (!this.operationConfig || !this.operationConfig.actions) {
        return [];
      }
      return this.operationConfig.actions.filter(action => {
        // 如果没有设置条件，默认显示
        if (!action.condition) {
          return true;
        }
        // 支持多种条件配置方式
        if (Array.isArray(action.condition)) {
          // 数组条件：[{ field: 'status', value: 'active' }, { field: 'type', value: 'user' }]
          return action.condition.every(cond => {
            return row[cond.field] === cond.value;
          });
        } else if (typeof action.condition === "function") {
          // 函数条件，返回值为真显示
          return action.condition(row);
        } else if (typeof action.condition === "string") {
          // 字符串条件：直接作为字段名，值为true时显示
          return !!row[action.condition];
        } else if (typeof action.condition === "object") {
          // 对象条件：{ field: 'status', value: 'active' }
          return row[action.condition.field] === action.condition.value;
        }

        return true;
      });
    },

    // 处理分页大小变化
    handleSizeChange(size) {
      this.pagination.pageSize = size;
      this.loadTableData();
    },

    // 处理当前页变化
    handleCurrentChange(page) {
      this.pagination.currentPage = page;
      this.loadTableData();
    },

    // 加载表格数据
    async loadTableData() {
      try {
        this.loading = true;

        // 过滤掉空值参数
        const filteredForm = {};
        Object.keys(this.searchForm).forEach(key => {
          const value = this.searchForm[key];
          // 保留有效值：非空字符串、非空数组、非零数字等
          if (value !== "" && value !== null && value !== undefined) {
            // 对于数组，确保不是空数组
            if (!Array.isArray(value) || value.length > 0) {
              filteredForm[key] = value;
            }
          }
        });

        // 处理搜索表单数据
        const params = {
          ...filteredForm,
          pageIndex: Number(this.pagination.currentPage),
          pageSize: Number(this.pagination.pageSize)
        };

        // 处理日期时间范围，将datetimerange类型的字段拆分为beginTime和endTime
        this.searchConfig.forEach(item => {
          if (
            item.type === "datetimerange" &&
            params[item.prop] &&
            Array.isArray(params[item.prop]) &&
            params[item.prop].length === 2
          ) {
            // 使用字段名作为前缀，例如：timeRange -> timeRangeBeginTime, timeRangeEndTime
            // 或者使用固定的beginTime和endTime
            params.beginTime = params[item.prop][0];
            params.endTime = params[item.prop][1];
            // 删除原始的时间范围字段
            delete params[item.prop];
          }
        });
        const result = await this.loadData(params);
        this.tableData = result.data || [];
        this.pagination.total = result.total || 0;
        if(this.localPageData){
          this.setLocalData();
        }
      } catch (error) {
        console.error("加载数据失败:", error);
        this.tableData = [];
        this.pagination.total = 0;
      } finally {
        this.loading = false;
      }
    },
    setLocalData(){
      const index = this.pagination.currentPage;
      const pageSize = this.pagination.pageSize;

      const startIndex = (index -1) * pageSize;
      const endIndex = startIndex + pageSize;

      this.localPageData = this.tableData.slice(startIndex,endIndex);
    },
    // 重新加载数据
    reload() {
      this.loadTableData();
    },

    // 重置表单和数据
    reset() {
      this.handleReset();
    },

    // 处理窗口大小变化
    handleResize() {
      if (this.$refs.dataTable) {
        this.$refs.dataTable.doLayout();
      }
    },

    getFilterParams() {
      // 过滤掉空值参数，与 loadTableData 方法保持一致
      const filteredForm = {};
      Object.keys(this.searchForm).forEach(key => {
        const value = this.searchForm[key];
        // 保留有效值：非空字符串、非空数组、非零数字等
        if (value !== "" && value !== null && value !== undefined) {
          // 对于数组，确保不是空数组
          if (!Array.isArray(value) || value.length > 0) {
            filteredForm[key] = value;
          }
        }
      });

      // 处理日期时间范围
      const params = {
        ...filteredForm,
        pageIndex: Number(this.pagination.currentPage),
        pageSize: Number(this.pagination.pageSize)
      };

      // 处理日期时间范围，将datetimerange类型的字段拆分为beginTime和endTime
      this.searchConfig.forEach(item => {
        if (
          item.type === "datetimerange" &&
          params[item.prop] &&
          Array.isArray(params[item.prop]) &&
          params[item.prop].length === 2
        ) {
          params.beginTime = params[item.prop][0];
          params.endTime = params[item.prop][1];
          delete params[item.prop];
        }
      });

      return params;
    }
  }
};
</script>

<style scoped>
.search-card {
  margin-bottom: 10px;
  border-radius: 4px;
}

.toolbar-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}

.table-card {
  margin-bottom: 10px;
}

.pagination-container {
  margin-top: 4px;
  text-align: right;
  margin-bottom: 4px;
}

.form-item-label {
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
  font-weight: 500;
  text-align: left;
}

.search-container {
  display: flex;
  align-items: center;
  width: 100%;
}

.search-fields-wrapper {
  flex: 1;
  margin-right: 20px;
}

.search-fields {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -10px; /* 抵消搜索项的左右边距 */
}

.search-item {
  width: calc(25% - 20px); /* 4个一行，减去左右margin */
  margin: 0 10px 10px 10px; /* 上右下左 */
  min-width: 200px; /* 确保最小宽度 */
}

.action-buttons-wrapper {
  display: flex;
  align-items: center;
}

.action-buttons {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-date-editor) {
  width: 100%;
}

/* 优化固定列样式 */
:deep(.el-table__fixed-right) {
  position: absolute;
  top: 0;
  right: 0;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
}

:deep(.el-table__fixed-right-patch) {
  background-color: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
}

/* 确保表格有足够的宽度触发横向滚动 */
:deep(.el-table__body) {
  min-width: 100%;
  table-layout: fixed;
}

/* 修复固定列滚动同步问题 */
:deep(.el-table__fixed-body-wrapper) {
  position: absolute;
  top: 50px !important; /* 与表头高度一致 */
  bottom: 0;
  overflow-y: hidden !important; /* 禁用固定列的独立滚动 */
}

/* 确保所有表头高度一致 */
:deep(.el-table__header-wrapper th),
:deep(.el-table__fixed-header-wrapper th),
:deep(.el-table__fixed-right-header-wrapper th) {
  height: 50px !important;
  line-height: 50px !important;
  padding: 0 !important;
  background-color: #f5f7fa !important;
}

/* 确保固定列表头与主表格表头对齐 */
:deep(.el-table__fixed-header-wrapper),
:deep(.el-table__fixed-right-header-wrapper) {
  height: 50px !important;
  overflow: hidden !important;
}

:deep(.el-table__fixed-header-wrapper .el-table__header),
:deep(.el-table__fixed-right-header-wrapper .el-table__header) {
  height: 50px !important;
}

/* 覆盖 Element UI 的一些默认样式，使布局更加紧凑 */
/* :deep(.el-card__body) {
  padding: 10px;
} */

:deep(.el-form) {
  margin-bottom: 0;
}

:deep(.el-table) {
  margin-bottom: 0;
}

:deep(.el-pagination) {
  padding: 0;
}

/* 动态调整表格高度，确保分页控件始终可见 */
:deep(.el-table__body-wrapper) {
  overflow-y: auto;
}

/* 添加表格容器样式，使用flex布局 */
.data-table-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 12px;
  border-radius: 4px;
}

.search-card,
.toolbar-buttons {
  flex-shrink: 0; /* 不允许搜索区域和工具栏缩小 */
}

.table-card {
  flex: 1; /* 表格区域占据剩余空间 */
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 防止溢出 */
}

:deep(.table-card .el-card__body) {
  /* height: 100%; */
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

:deep(.el-table) {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

:deep(.el-table__body-wrapper) {
  flex: 1;
  overflow-y: auto;
}

/* 确保表格内容区域有足够宽度 */
:deep(.el-table__body) {
  width: 100%;
}

/* 确保固定列正确显示 */
:deep(.el-table__fixed-right) {
  overflow: hidden;
}

.pagination-container {
  flex-shrink: 0; /* 分页区域不缩小 */
}

/* 操作按钮容器样式 */
.operation-buttons {
  padding-right: 10px; /* 添加左边距 */
  display: flex;
  flex-wrap: wrap;
}
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ellipsis-active {
  color: #67c23a;
}
.ellipsis-inactive {
  color: #f56c6c;
}

.tooltip-content {
  max-width: 400px;
}
.toolbar-table-container {
  background: #fff;
  /* height: 100%; */
  border-radius: 4px;
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
