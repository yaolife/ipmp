<template>
  <div class="notice-list-container">
    <div class="header">
      <div class="title">通知单列表（Mock）</div>
      <div class="desc">数据为本地模拟，不调用接口</div>
    </div>

    <DataTable
      :search-config="[]"
      :table-columns="displayColumns"
      :operation-config="operationConfig"
      :load-data="loadData"
      :immediate="true"
    />
  </div>
</template>

<script>
import DataTable from "@/modules/jurisdiction/components/DataTable.vue";
import { getFormColPermissions, getRowDataPermissions } from "./api";

// 模拟通知单数据
const MOCK_NOTICES = [
  {
    bianhao_0: "NT-202501-001",
    plant: "华能一厂",
    status: "已创建",
    priority: "高",
    fuzeren_4: "张三"
  },
  {
    bianhao_0: "NT-202501-002",
    plant: "华电二厂",
    status: "进行中",
    priority: "中",
    fuzeren_4: "李四"
  },
  {
    bianhao_0: "NT-202501-003",
    plant: "国电三厂",
    status: "已完成",
    priority: "低",
    fuzeren_4: "王五"
  },
  {
    bianhao_0: "NT-202501-004",
    plant: "大唐四厂",
    status: "已创建",
    priority: "高",
    fuzeren_4: "赵六"
  },
  {
    bianhao_0: "NT-202501-005",
    plant: "华能一厂",
    status: "进行中",
    priority: "中",
    fuzeren_4: "钱七"
  },
  {
    bianhao_0: "NT-202501-006",
    plant: "华电二厂",
    status: "已完成",
    priority: "低",
    fuzeren_4: "孙八"
  },
  {
    bianhao_0: "NT-202501-007",
    plant: "国电三厂",
    status: "已创建",
    priority: "高",
    fuzeren_4: "周九"
  },
  {
    bianhao_0: "NT-202501-008",
    plant: "大唐四厂",
    status: "进行中",
    priority: "中",
    fuzeren_4: "吴十"
  },
  {
    bianhao_0: "NT-202501-009",
    plant: "华能一厂",
    status: "已完成",
    priority: "低",
    fuzeren_4: "郑十一"
  },
  {
    bianhao_0: "NT-202501-010",
    plant: "华电二厂",
    status: "已创建",
    priority: "高",
    fuzeren_4: "冯十二"
  },
  {
    bianhao_0: "NT-202501-011",
    plant: "国电三厂",
    status: "进行中",
    priority: "中",
    fuzeren_4: "陈十三"
  },
  {
    bianhao_0: "NT-202501-012",
    plant: "大唐四厂",
    status: "已完成",
    priority: "低",
    fuzeren_4: "褚十四"
  },
  {
    bianhao_0: "NT-202501-013",
    plant: "华能一厂",
    status: "已创建",
    priority: "高",
    fuzeren_4: "卫十五"
  },
  {
    bianhao_0: "NT-202501-014",
    plant: "华电二厂",
    status: "进行中",
    priority: "中",
    fuzeren_4: "蒋十六"
  },
  {
    bianhao_0: "NT-202501-015",
    plant: "国电三厂",
    status: "已完成",
    priority: "低",
    fuzeren_4: "沈十七"
  }
];

export default {
  name: "NoticeList",
  components: { DataTable },
  data() {
    return {
      displayColumns: [],
      tableColumns: [
        { prop: "bianhao_0", label: "通知单编号", width: 200 },
        { prop: "plant", label: "电厂", width: 180 },
        { prop: "status", label: "状态", width: 140 },
        { prop: "priority", label: "优先级", width: 120 },
        { prop: "fuzeren_4", label: "负责人", width: 160 }
      ],
      operationConfig: {
        width: 200,
        actions: [
          {
            text: "编辑",
            type: "text",
            event: row => this.goEdit(row),
            condition: row => this.isRowEditable(row)
          },
          { text: "详情", type: "text", event: row => this.goDetail(row) }
        ]
      },
      // 控权相关
      entityCode: "notice_mock",
      fieldAliases: {
        bianhao_0: ["operatorCode"],
        fuzeren_4: ["operatorName"]
      },
      permSets: {
        visible: new Set(),
        editable: new Set(),
        control: new Set(),
        masking: new Set()
      },
      permsLoaded: false,
      // 行权限（可编辑记录的唯一键集合）
      editableKeys: new Set(),
      uniqueKey: "bianhao_0"
    };
  },
  mounted() {
    this.loadPerms();
  },
  methods: {
    async loadData(params) {
      const pageIndex = Number(params.pageIndex || 1);
      const pageSize = Number(params.pageSize || 10);
      const start = (pageIndex - 1) * pageSize;
      const data = MOCK_NOTICES.slice(start, start + pageSize);
      // 在返回数据前，调用后端行权限接口，更新 editableKeys
      await this.updateRowEditPermissions(data);
      return { data, total: MOCK_NOTICES.length };
    },
    async updateRowEditPermissions(currentPageRows) {
      try {
        const values = currentPageRows
          .map(r => r[this.uniqueKey])
          .filter(v => v != null);
        console.log(values, currentPageRows, "xxxx");
        // 若当前页没有数据，清空即可
        if (values.length === 0) {
          this.editableKeys = new Set();
          return;
        }
        const reqBody = [
          { entityCode: this.entityCode, uniqueKey: this.uniqueKey, values }
        ];
        const resp = await getRowDataPermissions(reqBody);
        const list = (resp && resp.data && (resp.data.data || resp.data)) || [];
        const item = Array.isArray(list)
          ? list.find(
              x =>
                x &&
                (x.entityCode === this.entityCode || x.code === this.entityCode)
            )
          : null;
        const editableValues = (item && item.values) || [];
        this.editableKeys = new Set(
          Array.isArray(editableValues) ? editableValues : []
        );
      } catch (e) {
        console.error("行权限查询失败", e);
        this.$message && this.$message.error("行权限查询失败");
        // 失败时默认不显示编辑按钮
        this.editableKeys = new Set();
      }
    },
    isRowEditable(row) {
      const key = row && row[this.uniqueKey];
      if (key == null) return false;
      return this.editableKeys.has(key);
    },
    goEdit(row) {
      if (!row || !row.bianhao_0) {
        this.$message && this.$message.warning("缺少通知单编号");
        return;
      }
      this.$router.push({
        name: "NoticeEdit",
        query: { bianhao_0: row.bianhao_0 }
      });
    },
    goDetail(row) {
      if (!row || !row.bianhao_0) {
        this.$message && this.$message.warning("缺少通知单编号");
        return;
      }
      this.$router.push({
        name: "NoticeDetail",
        query: { bianhao_0: row.bianhao_0 }
      });
    },
    async loadPerms() {
      try {
        const resp = await getFormColPermissions([this.entityCode]);
        const list = (resp && resp.data && (resp.data.data || resp.data)) || [];
        const item = Array.isArray(list)
          ? list.find(
              x =>
                x &&
                (x.entityCode === this.entityCode || x.code === this.entityCode)
            )
          : null;
        const visibleFields = (item && item.visibleFields) || [];
        const editableFields = (item && item.editableFields) || [];
        const controlFields = (item && item.controlFields) || [];
        const dataMaskingFields = (item && item.dataMaskingFields) || [];
        this.permSets.visible = new Set(
          (Array.isArray(visibleFields) ? visibleFields : []).concat(
            Array.isArray(dataMaskingFields) ? dataMaskingFields : []
          )
        );
        this.permSets.editable = new Set(
          Array.isArray(editableFields) ? editableFields : []
        );
        this.permSets.control = new Set(
          Array.isArray(controlFields) ? controlFields : []
        );
        this.permSets.masking = new Set(
          Array.isArray(dataMaskingFields) ? dataMaskingFields : []
        );
        this.permsLoaded = !!item;

        if (!this.permsLoaded) {
          this.displayColumns = this.tableColumns;
        }
        // 过滤不可见列，并对需要脱敏的列注入 formatter
        this.displayColumns = this.tableColumns
          .filter(col => this.canView(col.prop))
          .map(col => {
            if (this.isMasked(col.prop)) {
              return {
                ...col,
                formatter: val => this.maskedValue(val, col.prop)
              };
            }
            return col;
          });
      } catch (e) {
        console.error("拉取控权失败", e);
        this.$message && this.$message.error("拉取控权失败");
      }
    },
    hasAny(set, field) {
      const alias = this.fieldAliases[field];
      if (set.has(field)) return true;
      if (!alias) return false;
      if (Array.isArray(alias)) {
        return alias.some(a => set.has(a));
      }
      return set.has(alias);
    },
    isControlled(field) {
      if (!this.permsLoaded) return false;
      return this.hasAny(this.permSets.control, field);
    },
    canView(field) {
      if (!this.permsLoaded) return true;
      const isControlled = this.hasAny(this.permSets.control, field);
      if (!isControlled) return true;
      // 控权字段>=可见字段：受控字段只有在可见集合中才显示
      return this.hasAny(this.permSets.visible, field);
    },
    isMasked(field) {
      // 可见字段>=脱敏字段：仅对可见字段判断是否脱敏
      if (!this.permsLoaded) return false;
      if (!this.hasAny(this.permSets.visible, field)) return false;
      return this.hasAny(this.permSets.masking, field);
    },
    maskedValue(value, field) {
      return "***";
    }
  }
};
</script>

<style scoped>
.notice-list-container {
  padding: 16px;
}
.header-card {
  margin-bottom: 10px;
}
.header {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 30px;
  background: #fff;
  padding: 0 16px;
}
.header .title {
  font-weight: 600;
  font-size: 16px;
}
.header .desc {
  color: #909399;
  font-size: 13px;
}
</style>
