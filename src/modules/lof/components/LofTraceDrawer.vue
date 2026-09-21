<template>
  <el-drawer
    :title="trace.title || '计算追溯详情'"
    :visible.sync="drawerVisible"
    size="520px"
    append-to-body
  >
    <div class="lof-trace-drawer">
      <div
        v-for="(section, index) in trace.sections || []"
        :key="section.title + '-' + index"
        class="lof-trace-section"
      >
        <div class="lof-trace-section-title">{{ section.title }}</div>

        <div
          v-if="section.text"
          class="lof-trace-text"
          :class="{ 'lof-trace-formula': section.type === 'formula' }"
        >{{ section.text }}</div>

        <div v-if="section.rows && section.rows.length" class="lof-trace-table-wrap">
          <table class="lof-trace-table">
            <tbody>
              <tr v-for="(row, rowIndex) in section.rows" :key="row.label + '-' + rowIndex">
                <th>{{ row.label }}</th>
                <td>{{ displayValue(row.value) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="!(trace.sections || []).length" class="lof-trace-empty">
        请先执行评估，生成可追溯的计算结果。
      </div>
    </div>
  </el-drawer>
</template>

<script>
export default {
  name: "LofTraceDrawer",
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    trace: {
      type: Object,
      default: function() {
        return { title: "计算追溯详情", sections: [] };
      }
    }
  },
  computed: {
    drawerVisible: {
      get: function() {
        return this.visible;
      },
      set: function(value) {
        this.$emit("update:visible", value);
      }
    }
  },
  deactivated: function() {
    this.$emit("update:visible", false);
  },
  beforeDestroy: function() {
    this.$emit("update:visible", false);
  },
  methods: {
    displayValue: function(value) {
      if (value == null || value === "") return "-";
      if (typeof value === "boolean") return value ? "是" : "否";
      if (Array.isArray(value)) {
        if (!value.length) return "-";
        return value
          .map(function(item) {
            return this.displayValue(item);
          }, this)
          .join("；");
      }
      if (typeof value === "object") {
        return Object.keys(value)
          .map(function(key) {
            return key + "：" + this.displayValue(value[key]);
          }, this)
          .join("；");
      }
      return value;
    }
  }
};
</script>
