<template>
  <div class="sap-related-data" v-loading="loading">
    <div class="sap-toolbar">
      <span>当前管道：{{ nodeName || "-" }}<span v-if="isReferenceUnit">（五号机暂关联一号机数据，实际功能位置见列表）</span></span>
      <el-button size="small" :disabled="loading || !nodeName" @click="loadPage">刷新</el-button>
    </div>
    <el-alert v-if="error" :title="error" type="error" :closable="false" show-icon class="sap-error"></el-alert>
    <el-table :data="records" border size="small" max-height="440" empty-text="暂无关联数据">
      <el-table-column
        v-for="column in columns"
        :key="column.prop"
        :prop="column.prop"
        :label="column.label"
        :min-width="column.width"
        :formatter="formatCell"
        show-overflow-tooltip
      ></el-table-column>
    </el-table>
    <div class="sap-pagination">
      <el-pagination
        background
        :current-page="current"
        :page-size="size"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next"
        :disabled="loading"
        @current-change="changePage"
        @size-change="changeSize"
      ></el-pagination>
    </div>
  </div>
</template>

<script>
import api from "../api";

// 与管道详情共用，所有分页均由后端执行，不把完整SAP记录集加载到浏览器。
export default {
  name: "SapRelatedData",
  props: {
    nodeName: { type: String, default: "" }
  },
  data() {
    return {
      records: [],
      total: 0,
      current: 1,
      size: 10,
      loading: false,
      error: "",
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
    }
  },
  watch: {
    nodeName: {
      immediate: true,
      handler() {
        this.current = 1;
        this.total = 0;
        this.loadPage();
      }
    }
  },
  beforeDestroy() {
    this.requestId += 1;
  },
  methods: {
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
        const res = await api.getSapRelatedDataPage({
          nodeName: this.nodeName,
          current: this.current,
          size: this.size
        });
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
}
.sap-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  font-size: 13px;
  line-height: 1.6;
}
.sap-error {
  margin-bottom: 12px;
}
.sap-pagination {
  margin-top: 16px;
  overflow-x: auto;
  text-align: right;
}
</style>
