<template>
  <div class="asset-detail-panel" v-show="visible">
    <div class="panel-tabs">
      <div
        v-for="tab in tabs"
        :key="tab.name"
        class="panel-tab"
        :class="{ active: activeTab === tab.name }"
        @click="activeTab = tab.name"
      >
        {{ $t(tab.labelKey) }}
      </div>
      <i class="el-icon-close panel-close" @click="$emit('close')"></i>
    </div>
    <div class="panel-common">
      <h2 class="panel-title">{{ displayTitle }}</h2>
      <span v-if="hasDetail" class="status-badge">{{
        $t("lang.screen_status_normal")
      }}</span>
    </div>
    <div class="panel-body" v-loading="loading">
      <template v-if="activeTab === 'basic'">
        <div
          v-for="section in basicSections"
          :key="section.titleKey"
          class="info-section"
        >
          <div class="section-title">{{ $t(section.titleKey) }}</div>
          <div class="info-grid">
            <div
              v-for="item in section.fields"
              :key="item.labelKey"
              class="info-item"
            >
              <span class="info-label">{{ $t(item.labelKey) }}</span>
              <span class="info-value">{{ item.value }}</span>
            </div>
          </div>
        </div>
      </template>
      <div v-else class="empty-tab">{{ $t("cm.nodata") }}</div>
    </div>
  </div>
</template>

<script>
import api from "@/modules/drafts/api";

export default {
  name: "AssetDetailPanel",
  props: {
    visible: {
      type: Boolean,
      default: true
    },
    pipelineId: {
      type: [String, Number],
      default: ""
    },
    directoryPath: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  data() {
    return {
      loading: false,
      activeTab: "basic",
      detail: {},
      tabs: [
        { name: "basic", labelKey: "lang.screen_tab_basic" },
        { name: "maintenance", labelKey: "lang.screen_tab_maintenance" },
        { name: "related", labelKey: "lang.screen_tab_related" },
        { name: "safety", labelKey: "lang.screen_tab_safety" },
        { name: "predict", labelKey: "lang.screen_tab_predict" }
      ]
    };
  },
  computed: {
    hasDetail() {
      return !!(this.detail && (this.detail.id || this.detail.pipelineName || this.detail.pipelineNo));
    },
    displayTitle() {
      return (
        this.detail.pipelineName ||
        this.detail.pipelineNo ||
        this.$t("lang.pipe_detail")
      );
    },
    basicSections() {
      return [
        {
          titleKey: "lang.screen_equip_id",
          fields: [
            { labelKey: "lang.screen_device_name", value: this.displayVal(this.detail.pipelineName) },
            { labelKey: "lang.screen_device_code", value: this.displayVal(this.detail.pipelineNo) },
            { labelKey: "lang.screen_base", value: this.pickFromPath("基地") },
            { labelKey: "lang.screen_unit", value: this.pickFromPath("机组") },
            { labelKey: "lang.screen_plant", value: this.pickFromPath("厂房") },
            { labelKey: "lang.screen_system", value: this.systemName },
            { labelKey: "lang.screen_location_id", value: this.displayVal(this.detail.isoCode) }
          ]
        },
        {
          titleKey: "lang.spec_material",
          fields: [
            { labelKey: "lang.screen_diameter", value: this.formatDiameter(this.detail.nominalDiameter) },
            { labelKey: "lang.material", value: this.displayVal(this.detail.material) },
            { labelKey: "lang.screen_model", value: this.displayVal(this.detail.specCode) },
            { labelKey: "lang.screen_standard", value: this.displayVal("") }
          ]
        },
        {
          titleKey: "lang.screen_design_params",
          fields: [
            {
              labelKey: "lang.form_design_temperature",
              value: this.formatWithUnit(this.detail.designTemperature, "℃")
            },
            {
              labelKey: "lang.form_design_pressure",
              value: this.formatWithUnit(this.detail.designPressure, "MPa")
            },
            {
              labelKey: "lang.screen_design_flow",
              value: this.displayVal("")
            },
            {
              labelKey: "lang.screen_design_life",
              value: this.displayVal("")
            }
          ]
        },
        {
          titleKey: "lang.screen_install_om",
          fields: [
            { labelKey: "lang.screen_commission", value: this.formatDate(this.detail.createDate) },
            { labelKey: "lang.screen_install_site", value: this.installLocation },
            { labelKey: "lang.screen_specialty", value: this.displayVal(this.detail.responsiblePerson) },
            { labelKey: "lang.screen_warranty", value: this.displayVal("") },
            { labelKey: "lang.screen_last_inspect", value: this.formatDate(this.detail.modifyDate) }
          ]
        }
      ];
    },
    systemName() {
      const path = this.directoryPath || [];
      const found = path
        .slice()
        .reverse()
        .find(item => /系统/.test(item.name || ""));
      if (found && found.name) return found.name;
      const last = path[path.length - 1];
      return last && last.name ? last.name : "--";
    },
    installLocation() {
      const start = this.detail.startPoint;
      const end = this.detail.endPoint;
      if (start && end) return start + " → " + end;
      return this.displayVal(start || end);
    }
  },
  watch: {
    pipelineId: {
      immediate: true,
      handler(val) {
        if (val) {
          this.loadDetail();
        } else {
          this.detail = {};
        }
      }
    }
  },
  methods: {
    isSuccessCode(code) {
      return code === 0 || code === "0";
    },
    displayVal(val) {
      if (val === 0) return 0;
      if (val === null || val === undefined || val === "") return "--";
      if (typeof val === "number") {
        return Number.isInteger(val) ? val : parseFloat(val.toFixed(6));
      }
      if (/^-?\d+\.\d+$/.test(String(val))) {
        return String(Number(val));
      }
      return val;
    },
    formatDate(val) {
      if (!val) return "--";
      return String(val).slice(0, 10);
    },
    formatDiameter(val) {
      if (val === 0) return "DN0";
      if (val === null || val === undefined || val === "") return "--";
      const text = String(val);
      if (/^DN/i.test(text)) return text;
      return "DN" + text;
    },
    formatWithUnit(val, unit) {
      const text = this.displayVal(val);
      if (text === "--") return "--";
      return text + " " + unit;
    },
    pickFromPath(keyword) {
      const found = (this.directoryPath || []).find(
        item => (item.name || "").indexOf(keyword) !== -1
      );
      return found && found.name ? found.name : "--";
    },
    loadDetail() {
      if (!this.pipelineId) return;
      this.loading = true;
      api
        .getPipelineDetail(this.pipelineId)
        .then(res => {
          this.loading = false;
          if (this.isSuccessCode(res && res.code)) {
            this.detail = res.data || {};
          } else {
            this.detail = {};
            this.$message.error((res && res.msg) || this.$t("cm.fail"));
          }
        })
        .catch(() => {
          this.loading = false;
          this.detail = {};
        });
    }
  }
};
</script>

<style lang="less" scoped>
.asset-detail-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 1064px;
  height: 100%;
  max-height: 100%;
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.3);
  -webkit-backdrop-filter: blur(5.5px);
  backdrop-filter: blur(5.5px);
  color: #e8f4ff;
  overflow: hidden;
}
.panel-tabs {
  position: relative;
  display: flex;
  align-items: center;
  height: 38px;
  min-height: 38px;
  padding: 0 40px 0 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.18);
}
.panel-tab {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  height: 38px;
  padding: 0 16px;
  font-size: 14px;
  line-height: 1;
  color: rgba(255, 255, 255, 0.55);
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
}
.panel-tab.active {
  color: #ffffff;
  font-weight: 600;
  background: linear-gradient(180deg, rgba(7, 61, 95, 0) 0%, #00c2ec 100%);
}
.panel-close {
  position: absolute;
  right: 16px;
  top: 50%;
  margin-top: -8px;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
}
.panel-close:hover {
  color: #ffffff;
}
.panel-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 12px 20px 20px;
  overflow: auto;
  /deep/ .el-loading-mask {
    background: rgba(0, 0, 0, 0.25);
  }
}
.panel-body::-webkit-scrollbar {
  width: 6px;
}
.panel-body::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.28);
  border-radius: 3px;
}
.panel-common {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  min-height: 56px;
  padding: 12px 20px 8px;
  background: rgba(255, 255, 255, 0.04);
}
.panel-title {
  margin: 0 12px 0 0;
  font-size: 22px;
  font-weight: 600;
  line-height: 32px;
  color: #ffffff;
}
.status-badge {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 10px;
  border-radius: 11px;
  background: rgba(46, 204, 113, 0.22);
  border: 1px solid rgba(72, 220, 128, 0.75);
  color: #5de392;
  font-size: 12px;
}
.status-badge::before {
  content: "";
  width: 6px;
  height: 6px;
  margin-right: 6px;
  border-radius: 50%;
  background: #5de392;
}
.info-section {
  margin-bottom: 12px;
  padding: 12px 16px 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.3);
}
.section-title {
  margin-bottom: 12px;
  padding-left: 10px;
  font-size: 14px;
  font-weight: 600;
  line-height: 16px;
  color: #ffffff;
  border-left: 3px solid #3ec6ff;
}
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 48px;
  row-gap: 12px;
}
.info-item {
  display: flex;
  align-items: flex-start;
  min-width: 0;
  font-size: 13px;
  line-height: 20px;
}
.info-label {
  width: 108px;
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.55);
  white-space: nowrap;
}
.info-value {
  color: #ffffff;
  word-break: break-all;
}
.empty-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.45);
}
</style>
