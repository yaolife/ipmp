<template>
  <div
    class="sap-related-data"
    :class="{ 'is-stretch': stretch, 'is-panel': panel }"
    v-loading="loading"
  >
    <div class="sap-surface">
      <div class="sap-toolbar">
        <span class="sap-current">
          当前管道：{{ nodeName || "-" }}
          <span v-if="isReferenceUnit">（五号机暂关联一号机数据，实际功能位置见列表）</span>
        </span>
        <el-button size="small" :disabled="loading || !nodeName" @click="loadPage">刷新</el-button>
      </div>
      <el-form class="sap-filters" :inline="true" :model="filters" size="small" @submit.native.prevent="search">
        <el-form-item v-for="field in filterFields" :key="field.prop" :label="field.label">
          <el-input v-model="filters[field.prop]" clearable :placeholder="'请输入' + field.label" @keyup.enter.native="search"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :disabled="loading || !nodeName" @click="search">搜索</el-button>
          <el-button :disabled="loading || !nodeName" @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
      <el-alert
        v-if="error"
        :title="error"
        type="error"
        :closable="false"
        show-icon
        class="sap-error"
      ></el-alert>
      <div class="sap-table-wrap" ref="tableWrap">
        <div v-if="panel" class="sap-native-scroll">
          <table class="sap-native-table">
            <thead>
              <tr>
                <th
                  v-for="column in columns"
                  :key="column.prop"
                  :style="{ minWidth: column.width + 'px' }"
                >
                  {{ column.label }}
                </th>
              </tr>
            </thead>
            <tbody v-if="records.length">
              <tr v-for="(row, rowIndex) in records" :key="row.aufnr || rowIndex">
                <td v-for="column in columns" :key="column.prop">
                  {{ formatCell(row, null, row[column.prop]) }}
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="!records.length" class="sap-native-empty">暂无数据</div>
        </div>
        <el-table
          v-else
          :data="records"
          border
          size="small"
          :height="useFill ? fillHeight : null"
          :max-height="useFill ? null : 440"
          empty-text="暂无关联数据"
          class="sap-table"
        >
          <el-table-column
            v-for="column in columns"
            :key="column.prop"
            :prop="column.prop"
            :label="column.label"
            :min-width="column.width"
            align="center"
            header-align="center"
            :formatter="formatCell"
            show-overflow-tooltip
          ></el-table-column>
        </el-table>
      </div>
      <div class="sap-pagination">
        <el-pagination
          background
          :current-page="current"
          :page-size="size"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          :disabled="loading"
          :popper-class="panel ? 'sap-panel-pager-dropdown' : ''"
          @current-change="changePage"
          @size-change="changeSize"
        ></el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import api from "../api";

const emptyFilters = () => ({ aufnr: "", qmnum: "", ktext: "", asttx: "" });

// 与管道详情共用，所有分页均由后端执行，不把完整SAP记录集加载到浏览器。
export default {
  name: "SapRelatedData",
  props: {
    nodeName: { type: String, default: "" },
    stretch: { type: Boolean, default: false },
    panel: { type: Boolean, default: false }
  },
  data() {
    return {
      records: [],
      total: 0,
      current: 1,
      size: 10,
      loading: false,
      error: "",
      tableHeight: 0,
      filters: emptyFilters(),
      // 翻页和刷新沿用已查询条件，避免输入尚未提交就改变列表范围。
      appliedFilters: emptyFilters(),
      filterFields: [
        { prop: "aufnr", label: "工单号" },
        { prop: "qmnum", label: "通知单号" },
        { prop: "ktext", label: "描述" },
        { prop: "asttx", label: "状态" }
      ],
      // 请求序号隔离切换节点、翻页和组件销毁前的旧响应，避免串入其他管道记录。
      requestId: 0,
      columns: [
        { prop: "aufnr", label: "工单号", width: 140 },
        { prop: "qmnum", label: "通知单号", width: 140 },
        { prop: "ktext", label: "描述", width: 260 },
        { prop: "tplnr", label: "功能位置码", width: 230 },
        { prop: "asttx", label: "状态", width: 160 },
        { prop: "addat", label: "参考日期", width: 130 },
        { prop: "auart", label: "订单类型", width: 100 },
        { prop: "vaplz", label: "负责工作中心", width: 140 },
        { prop: "preparationEngineer", label: "准备工程师", width: 130 },
        { prop: "permitHolder", label: "许可证持有人", width: 140 },
        { prop: "revnr", label: "修订号", width: 110 },
        { prop: "etlTime", label: "数据同步时间", width: 170 }
      ]
    };
  },
  computed: {
    isReferenceUnit() {
      return /^(?:5[A-Z]{3}|YJ-5-)/i.test(this.nodeName.trim());
    },
    useFill() {
      return this.stretch || this.panel;
    },
    fillHeight() {
      return this.tableHeight || 480;
    }
  },
  watch: {
    nodeName: {
      immediate: true,
      handler() {
        this.current = 1;
        this.total = 0;
        this.filters = emptyFilters();
        this.appliedFilters = emptyFilters();
        this.loadPage();
      }
    },
    loading(value) {
      if (!value) this.scheduleTableHeight();
    }
  },
  mounted() {
    this.scheduleTableHeight();
    this.bindResize();
  },
  beforeDestroy() {
    this.requestId += 1;
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (typeof window !== "undefined") {
      window.removeEventListener("resize", this.updateTableHeight);
    }
  },
  methods: {
    bindResize() {
      if (this.panel || !this.stretch || typeof window === "undefined") return;
      this.$nextTick(() => {
        const wrap = this.$refs.tableWrap;
        if (window.ResizeObserver && wrap) {
          this.resizeObserver = new ResizeObserver(() => {
            this.updateTableHeight();
          });
          this.resizeObserver.observe(wrap);
        }
        window.addEventListener("resize", this.updateTableHeight);
      });
    },
    scheduleTableHeight() {
      this.$nextTick(() => {
        this.updateTableHeight();
        if (typeof window !== "undefined" && window.requestAnimationFrame) {
          window.requestAnimationFrame(() => this.updateTableHeight());
        }
      });
    },
    updateTableHeight() {
      if (this.panel || !this.stretch) return;
      const wrap = this.$refs.tableWrap;
      if (!wrap) return;
      const next = Math.floor(wrap.clientHeight);
      if (next > 80 && next !== this.tableHeight) {
        this.tableHeight = next;
      }
    },
    search() {
      if (this.loading || !this.nodeName) return;
      this.appliedFilters = Object.keys(this.filters).reduce((result, key) => {
        result[key] = this.filters[key].trim();
        return result;
      }, {});
      this.current = 1;
      this.loadPage();
    },
    resetFilters() {
      if (this.loading || !this.nodeName) return;
      this.filters = emptyFilters();
      this.search();
    },
    formatCell(row, column, value) {
      return value === null || value === undefined || value === "" ? "-" : value;
    },
    changePage(current) {
      this.current = current;
      this.loadPage();
    },
    changeSize(size) {
      this.size = size;
      this.current = 1;
      this.loadPage();
    },
    async loadPage() {
      const requestId = ++this.requestId;
      this.records = [];
      this.error = "";
      this.loading = false;
      if (!this.nodeName) return;
      this.loading = true;
      try {
        const res = await api.getSapRelatedDataPage(Object.assign({}, this.appliedFilters, {
          nodeName: this.nodeName,
          current: this.current,
          size: this.size
        }));
        if (requestId !== this.requestId) return;
        if (!res || (res.code !== 0 && res.code !== "0") || !res.data) {
          throw new Error((res && res.msg) || "关联数据查询失败，请点击刷新重试");
        }
        this.records = Array.isArray(res.data.records) ? res.data.records : [];
        this.total = Number(res.data.total) || 0;
      } catch (e) {
        if (requestId === this.requestId) {
          this.total = 0;
          this.error = e.message || "关联数据查询失败，请点击刷新重试";
        }
      } finally {
        if (requestId === this.requestId) this.loading = false;
      }
    }
  }
};
</script>

<style lang="less" scoped>
.sap-related-data {
  min-width: 0;
  padding: 16px 0;
  box-sizing: border-box;
}
.sap-related-data.is-stretch {
  height: 100%;
  padding: 0;
  display: flex;
  flex-direction: column;
}
.sap-surface {
  min-width: 0;
}
.sap-related-data.is-stretch .sap-surface {
  flex: 1;
  min-height: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.sap-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 13px;
  line-height: 1.6;
  flex-shrink: 0;
}
.sap-current {
  min-width: 0;
}
.sap-error {
  margin-bottom: 12px;
  flex-shrink: 0;
}
.sap-table-wrap {
  min-width: 0;
}
.sap-related-data.is-stretch .sap-table-wrap {
  flex: 1 1 auto;
  height: 0;
  min-height: 0;
  overflow: hidden;
}
.sap-filters {
  display: flex;
  flex-wrap: wrap;
  /deep/ .el-form-item {
    margin-bottom: 12px;
    margin-right: 16px;
  }
  /deep/ .el-input {
    width: 180px;
  }
}
.sap-pagination {
  margin-top: 8px;
  overflow-x: auto;
  text-align: right;
  flex-shrink: 0;
}
.sap-related-data.is-panel {
  color: #e8f4ff;
}
.sap-related-data.is-panel .sap-surface {
  padding: 12px 16px 10px;
  border-radius: 6px;
  border: 1px solid rgba(104, 190, 254, 0.35);
  background: rgba(8, 36, 59, 0.74);
}
.sap-related-data.is-panel .sap-toolbar {
  color: rgba(255, 255, 255, 0.85);
}
.sap-related-data.is-panel .sap-filters {
  align-items: center;
  column-gap: 20px;
  row-gap: 10px;
  margin-bottom: 16px;
}
.sap-related-data.is-panel .sap-filters /deep/ .el-form-item {
  display: inline-flex;
  align-items: center;
  margin: 0 0 0 0;
}
.sap-related-data.is-panel .sap-filters /deep/ .el-form-item:last-child {
  margin-left: 4px;
}
.sap-related-data.is-panel .sap-filters /deep/ .el-form-item__label {
  float: none;
  width: auto !important;
  padding-right: 8px;
  line-height: 32px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.55);
}
.sap-related-data.is-panel .sap-filters /deep/ .el-form-item__content {
  margin-left: 0 !important;
  line-height: 32px;
}
.sap-related-data.is-panel .sap-filters /deep/ .el-input {
  width: 168px;
}
.sap-related-data.is-panel .sap-filters /deep/ .el-input__inner {
  background: rgba(0, 0, 0, 0.28);
  border-color: rgba(104, 190, 254, 0.35);
  color: #ffffff;
}
.sap-related-data.is-panel .sap-filters /deep/ .el-input__inner::placeholder {
  color: rgba(255, 255, 255, 0.38);
}
.sap-related-data.is-panel /deep/ .el-button {
  background: transparent;
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.35);
}
.sap-related-data.is-panel /deep/ .el-button:hover,
.sap-related-data.is-panel /deep/ .el-button:focus {
  background: rgba(0, 194, 236, 0.16);
  color: #ffffff;
  border-color: #00c2ec;
}
.sap-native-scroll {
  height: 100%;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
}
.sap-native-scroll::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.sap-native-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.28);
  border-radius: 3px;
}
.sap-native-table {
  width: max-content;
  min-width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.sap-native-table th,
.sap-native-table td {
  padding: 8px 10px;
  border-bottom: 1px solid rgba(104, 190, 254, 0.22);
  text-align: center;
  white-space: nowrap;
  color: #ffffff;
}
.sap-native-table th {
  position: sticky;
  top: 0;
  z-index: 1;
  color: rgba(255, 255, 255, 0.55);
  font-weight: 500;
  background: #0c2c45;
}
.sap-native-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 72px;
  color: rgba(255, 255, 255, 0.45);
  font-size: 14px;
}
.sap-related-data.is-panel /deep/ .el-pagination,
.sap-related-data.is-panel /deep/ .el-pagination__total,
.sap-related-data.is-panel /deep/ .el-pagination .el-pagination__jump {
  color: rgba(255, 255, 255, 0.75);
}
.sap-related-data.is-panel /deep/ .el-pagination.is-background .btn-prev,
.sap-related-data.is-panel /deep/ .el-pagination.is-background .btn-next,
.sap-related-data.is-panel /deep/ .el-pagination.is-background .el-pager li {
  background: rgba(0, 0, 0, 0.28);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(104, 190, 254, 0.35);
}
.sap-related-data.is-panel /deep/ .el-pagination.is-background .el-pager li:not(.disabled).active {
  background: #00c2ec;
  color: #ffffff;
  border-color: #00c2ec;
}
.sap-related-data.is-panel /deep/ .el-pagination.is-background .btn-prev:disabled,
.sap-related-data.is-panel /deep/ .el-pagination.is-background .btn-next:disabled {
  color: rgba(255, 255, 255, 0.28);
  background: rgba(0, 0, 0, 0.18);
}
.sap-related-data.is-panel /deep/ .el-pagination .el-input__inner {
  background: rgba(0, 0, 0, 0.28);
  color: #ffffff;
  border-color: rgba(104, 190, 254, 0.35);
}
</style>

<style lang="less">
.sap-panel-pager-dropdown {
  background: #0d2438;
  border: 1px solid rgba(104, 190, 254, 0.35);
}
.sap-panel-pager-dropdown .el-select-dropdown__item {
  color: rgba(255, 255, 255, 0.85);
}
.sap-panel-pager-dropdown .el-select-dropdown__item.hover,
.sap-panel-pager-dropdown .el-select-dropdown__item:hover {
  background: rgba(0, 194, 236, 0.2);
}
.sap-panel-pager-dropdown .el-select-dropdown__item.selected {
  color: #00c2ec;
}
.sap-panel-pager-dropdown .popper__arrow,
.sap-panel-pager-dropdown .popper__arrow::after {
  border-bottom-color: #0d2438 !important;
  border-top-color: #0d2438 !important;
}
</style>
