<template>
  <div class="cud-commom-form-style pipeline-data-library-page">
    <div class="cud__scroll--div">
      <el-card>
        <query-form
          :key="libraryType"
          :queryFormId="libraryType === 'material' ? 'materialLibrary' : 'operatingConditionLibrary'"
          :queryFields="queryFields"
          :loading="loading"
          :showMoreSetting="false"
          labelWidth="80px"
          @resize="initMaxHeight"
          @submit="search"
          ref="queryForm"
          class="cud-commom-form-search"
        ></query-form>
      </el-card>

      <el-card>
        <div class="table-button library-actions">
          <el-button type="primary" size="small" icon="el-icon-plus" @click="openCreate">新增</el-button>
          <el-button size="small" icon="el-icon-upload2" @click="openImport">导入Excel</el-button>
          <el-button size="small" icon="el-icon-download" @click="downloadTemplate">下载模板</el-button>
          <el-button size="small" icon="el-icon-document" @click="exportExcel">导出Excel</el-button>
          <el-button size="small" type="danger" icon="el-icon-delete" :disabled="!selected.length" @click="removeSelected">批量删除</el-button>
          <input ref="fileInput" type="file" accept=".xls,.xlsx" style="display:none" @change="importExcel">
        </div>
        <el-row class="cud__table--list" :style="{ height: computedTableHeight + 'px' }">
          <el-table
            :data="records"
            v-loading="loading"
            :empty-text="$t('cm.nodata')"
            highlight-current-row
            border
            stripe
            :max-height="computedTableHeight"
            header-row-class-name="cud-office-table-header"
            class="cud-office-table"
            @selection-change="selected = $event"
          >
          <el-table-column type="selection" width="50" align="center"></el-table-column>
          <el-table-column type="index" label="序号" width="60" align="center" :index="indexMethod"></el-table-column>
          <template v-for="column in columns">
            <el-table-column :key="column.prop" :prop="column.prop" :label="column.label" :min-width="column.width || 120" :formatter="column.formatter" align="center" header-align="center" show-overflow-tooltip></el-table-column>
          </template>
          <el-table-column label="操作" width="130" fixed="right" align="center">
            <template slot-scope="scope">
              <el-button type="text" size="small" @click="openEdit(scope.row)">编辑</el-button>
              <el-button type="text" size="small" class="cud-common-operate-delete" @click="removeRow(scope.row)">删除</el-button>
            </template>
          </el-table-column>
          </el-table>
        </el-row>
        <el-row>
        <div class="library-pagination cud-special-pagination cud-special-pagination-button">
          <el-pagination
            background
            layout="total, sizes, prev, pager, next, jumper"
            :current-page="query.current"
            :page-size="query.size"
            :page-sizes="[10, 20, 30, 40]"
            :total="total"
            @size-change="changeSize"
            @current-change="changePage"
          ></el-pagination>
        </div>
        </el-row>
      </el-card>

      <el-dialog :title="editing ? '编辑' : '新增'" :visible.sync="dialogVisible" :width="libraryType === 'material' ? '96%' : '760px'" :fullscreen="libraryType === 'material'" append-to-body>
        <template v-if="libraryType === 'material'">
          <div class="material-editor-toolbar">
            <div>
              <strong>{{ form.materialGrade || '新材料' }}</strong>
              <span>{{ form.productForm || '' }} <template v-if="form.unsNo">| UNS {{ form.unsNo }}</template></span>
            </div>
            <el-button type="primary" size="small" :loading="saving || materialDetailLoading" :disabled="materialDetailLoading" @click="save">保存</el-button>
          </div>
          <el-tabs v-model="materialTab" class="material-editor-tabs" v-loading="materialDetailLoading">
            <el-tab-pane label="基本信息" name="basic">
              <el-form ref="form" :model="form" label-width="170px" size="small" class="library-form material-basic-form">
                <el-row :gutter="16">
                  <el-col v-for="field in materialBaseFields" :key="field.prop" :span="field.span || 8">
                    <el-form-item :label="field.label">
                      <el-input v-if="field.type !== 'number'" v-model="form[field.prop]" :placeholder="field.placeholder || '请输入'"></el-input>
                      <el-input-number v-else v-model="form[field.prop]" :controls="false" :precision="field.precision === undefined ? 3 : field.precision" style="width:100%"></el-input-number>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </el-tab-pane>
            <el-tab-pane label="力学性能（S / Sm / Su / Sy）" name="mechanical" lazy>
              <el-alert type="info" :closable="false" show-icon title="参数按温度维护；温度范围列 -30~40℃ 在该温区内使用同一数值。尺寸/厚度留空表示通用，仅作为默认条件。" class="curve-help"></el-alert>
              <div v-for="property in mechanicalProperties" :key="property.key" class="curve-section">
                <div class="curve-section-heading">
                  <div><strong>{{ property.title }}</strong><span>{{ property.source }}</span></div>
                  <div class="curve-actions">
                    <el-button size="mini" icon="el-icon-plus" @click="addMechanicalRow(property.key)">添加行</el-button>
                    <el-button size="mini" type="danger" icon="el-icon-delete" :disabled="!curveRows(property.key).length" @click="removeMechanicalRow(property.key)">删除末行</el-button>
                  </div>
                </div>
                <div class="curve-table-wrap">
                  <table class="material-curve-table">
                    <thead><tr><th class="condition-column">尺寸/厚度 (mm)</th><th v-for="temperature in property.temperatures" :key="temperature">{{ temperature }}℃</th></tr></thead>
                    <tbody>
                      <tr v-for="(row, rowIndex) in curveRows(property.key)" :key="property.key + '-' + rowIndex">
                        <td class="condition-column"><el-input :value="row && row.sizeCondition" size="mini" placeholder="通用" @input="setSizeCondition(row, $event)" @change="validateSizeCondition(row)"></el-input></td>
                        <td v-for="temperature in property.temperatures" :key="temperature"><el-input-number :value="getCurveCell(row, temperature)" size="mini" :controls="false" :precision="3" placeholder="" @input="setCurveCell(row, temperature, $event)"></el-input-number></td>
                      </tr>
                      <tr v-if="!curveRows(property.key).length"><td :colspan="property.temperatures.length + 1" class="curve-empty">暂无数据行，点击“添加行”维护</td></tr>
                    </tbody>
                  </table>
                </div>
                <div class="curve-preview">
                  <strong>{{ property.title }}预览</strong>
                  <el-input-number v-model="preview.designTemperature" size="small" :controls="false" :precision="3" placeholder="设计温度(℃)"></el-input-number>
                  <el-input-number v-model="preview.thickness" size="small" :controls="false" :precision="3" placeholder="厚度(mm)"></el-input-number>
                  <el-button size="small" type="primary" @click="previewMechanical(property.key)">计算</el-button>
                  <span>{{ previewResult.mechanical && previewResult.mechanical[property.key] || '输入温度和厚度后查看插值结果' }}</span>
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="热物性（α / k / ρ）" name="thermal" lazy>
              <el-alert type="info" :closable="false" show-icon title="按材料温度录入热膨胀系数、导热系数和密度。空单元格表示该温度点没有数据。" class="curve-help"></el-alert>
              <div class="curve-section">
                <div class="curve-section-heading"><div><strong>热物性</strong><span>α：×10⁻⁶/℃；k：W/(m·℃)；ρ：kg/m³</span></div></div>
                <div class="curve-table-wrap">
                  <table class="material-curve-table">
                    <thead><tr><th class="condition-column">参数</th><th v-for="temperature in thermalTemperatures" :key="temperature">{{ temperature }}℃</th></tr></thead>
                    <tbody><tr v-for="property in thermalProperties" :key="property.key"><th class="condition-column">{{ property.label }}</th><td v-for="temperature in thermalTemperatures" :key="temperature"><el-input-number :value="getThermalCell(property.key, temperature)" size="mini" :controls="false" :precision="3" placeholder="" @input="setThermalCell(property.key, temperature, $event)"></el-input-number></td></tr></tbody>
                  </table>
                </div>
                <div class="curve-preview">
                  <strong>温度插值预览</strong><el-input-number v-model="preview.designTemperature" size="small" :controls="false" :precision="3" placeholder="设计温度(℃)"></el-input-number>
                  <el-button size="small" type="primary" @click="previewThermal">计算</el-button><span>{{ previewResult.thermal || '输入温度后查看可用参数' }}</span>
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="弹性模量 E" name="elastic" lazy>
              <el-alert type="info" :closable="false" show-icon title="按温度维护弹性模量，表格单位为 GPa；温度超出已有数据范围时不外推。" class="curve-help"></el-alert>
              <div class="curve-section">
                <div class="curve-section-heading"><div><strong>弹性模量 E（GPa）</strong><span>ASME BPVC Section II Part D · Table TM-1</span></div></div>
                <div class="curve-table-wrap">
                  <table class="material-curve-table">
                    <thead><tr><th class="condition-column">参数</th><th v-for="temperature in elasticTemperatures" :key="temperature">{{ temperature }}℃</th></tr></thead>
                    <tbody><tr><th class="condition-column">E (GPa)</th><td v-for="temperature in elasticTemperatures" :key="temperature"><el-input-number :value="getElasticCell(temperature)" size="mini" :controls="false" :precision="3" placeholder="" @input="setElasticCell(temperature, $event)"></el-input-number></td></tr></tbody>
                  </table>
                </div>
                <div class="curve-preview">
                  <strong>温度插值预览</strong><el-input-number v-model="preview.designTemperature" size="small" :controls="false" :precision="3" placeholder="设计温度(℃)"></el-input-number>
                  <el-button size="small" type="primary" @click="previewElastic">计算</el-button><span>{{ previewResult.elastic || '输入温度后查看插值结果' }}</span>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </template>
        <el-form v-else ref="form" :model="form" label-width="150px" size="small" class="library-form">
          <el-row :gutter="16">
            <el-col v-for="field in formFields" :key="field.prop" :span="field.span || 12">
              <el-form-item :label="field.label">
                <el-select v-if="field.type === 'unit'" v-model="form[field.prop]" placeholder="请选择机组" style="width:100%">
                  <el-option label="5号机" :value="5"></el-option>
                </el-select>
                <el-select v-else-if="field.type === 'level'" v-model="form[field.prop]" placeholder="请选择等级" style="width:100%">
                  <el-option label="低" :value="0"></el-option>
                  <el-option label="中" :value="1"></el-option>
                  <el-option label="高" :value="2"></el-option>
                </el-select>
                <el-input v-else-if="field.type !== 'number'" v-model="form[field.prop]" :placeholder="field.placeholder || '请输入'"></el-input>
                <el-input-number v-else v-model="form[field.prop]" :controls="false" :min="field.min" :max="field.max" :precision="field.precision === undefined ? 3 : field.precision" style="width:100%"></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <span slot="footer">
          <el-button size="small" @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" size="small" :loading="saving || materialDetailLoading" :disabled="materialDetailLoading" @click="save">保存</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import api from "./api";
import queryForm from "@/components/common/queryForm";
import { calcHeight, throttle } from "@/utils/funcUtil";

const MATERIAL_FIELDS = [
  ["materialGrade", "管材牌号"], ["unsNo", "UNS编号"], ["category", "材料大类"],
  ["subcategory", "材料子类"], ["productForm", "产品形式"], ["specificationNo", "规范号"],
  ["pNo", "P-No"], ["groupNo", "Group No."], ["tensileStrength", "抗拉强度Su(MPa)", "number"],
  ["yieldStrength", "屈服强度Sy(MPa)", "number"], ["elasticModulus", "弹性模量E(MPa)", "number"],
  ["poissonRatio", "泊松比", "number"], ["materialDensity", "材料密度(kg/m³)", "number"],
  ["fatigueLimit", "疲劳极限(MPa)", "number"],
  ["minDesignTemperature", "最低设计温度(℃)", "number"], ["maxDesignTemperature", "最高设计温度(℃)", "number"],
  ["remarks", "备注"]
];
const OPERATING_FIELDS = [
  ["conditionCode", "工况编码"], ["unitNo", "所属机组", "unit"],
  ["annualUnplannedStops", "年非计划停运次数", "number", 0], ["annualStartStops", "年启停次数", "number", 0],
  ["periodicOperation", "是否周期性操作"], ["annualFastValveActions", "年快阀动作次数", "number", 0],
  ["c2Level", "C2腐蚀侵蚀管控等级", "level"], ["lastInspectionDate", "上次探伤日期"],
  ["corrosionRate", "腐蚀速率(mm/a)", "number"], ["coatingStatus", "涂层状态"],
  ["chlorideContent", "氯离子含量(ppm)", "number"], ["c3Level", "C3周期负荷波动等级", "level"],
  ["dailyLoadFluctuation", "日负荷波动率(%)", "number"], ["monthlyStartStop", "月度启停次数", "number"],
  ["remarks", "备注"]
];
const TEMPERATURE_AXES = {
  s: ["-30~40", 65, 100, 125, 150, 175, 200, 225, 250, 275, 300, 325, 350, 375, 400, 425, 450, 475, 500, 525, 550, 575, 600, 625, 650],
  sm: ["-30~40", 65, 100, 125, 150, 175, 200, 225, 250, 275, 300, 325, 350, 375, 400, 425, 450, 475, 500, 525],
  su: ["-30~40", 100, 150, 200, 250, 300, 325, 350, 375, 400, 425, 450, 475, 500, 525],
  sy: ["-30~40", 65, 100, 125, 150, 175, 200, 225, 250, 275, 300, 325, 350, 375, 400, 425, 450, 475, 500, 525],
  thermal: [20, 50, 75, 100, 125, 150, 175, 200, 225, 250, 275, 300, 325, 350, 375, 400, 425, 450, 475, 500, 525, 550, 575, 600, 625, 650, 675, 700, 725, 750, 775, 800, 825],
  elastic: [-200, -125, -75, 25, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700]
};
const emptyValues = temperatures => temperatures.reduce((result, temperature) => { result[String(temperature)] = null; return result; }, {});
// 表头按单行宽度留出左右内边距，避免中文表头被挤成两行。
const columnMinWidth = label => {
  const width = Array.from(String(label || "")).reduce((sum, char) => sum + (char.charCodeAt(0) > 127 ? 16 : 9), 40);
  return Math.max(100, Math.ceil(width));
};
const newMaterialForm = () => ({
  mechanicalCurveRows: {
    s: [{ sizeCondition: null, values: emptyValues(TEMPERATURE_AXES.s) }],
    sm: [{ sizeCondition: null, values: emptyValues(TEMPERATURE_AXES.sm) }],
    su: [{ sizeCondition: null, values: emptyValues(TEMPERATURE_AXES.su) }],
    sy: [{ sizeCondition: null, values: emptyValues(TEMPERATURE_AXES.sy) }]
  },
  thermalCurveValues: {
    alpha: emptyValues(TEMPERATURE_AXES.thermal),
    conductivity: emptyValues(TEMPERATURE_AXES.thermal),
    density: emptyValues(TEMPERATURE_AXES.thermal)
  },
  elasticModulusCurveValues: emptyValues(TEMPERATURE_AXES.elastic)
});
const normalizeMaterialForm = source => {
  const parseStructure = value => {
    if (typeof value !== "string") return value;
    try { return JSON.parse(value); } catch (error) { return null; }
  };
  const target = Object.assign(newMaterialForm(), source || {});
  target.mechanicalCurveRows = parseStructure(target.mechanicalCurveRows);
  target.thermalCurveValues = parseStructure(target.thermalCurveValues);
  target.elasticModulusCurveValues = parseStructure(target.elasticModulusCurveValues);
  const blank = newMaterialForm();
  if (!target.mechanicalCurveRows || typeof target.mechanicalCurveRows !== "object") {
    target.mechanicalCurveRows = newMaterialForm().mechanicalCurveRows;
  }
  Object.keys(blank.mechanicalCurveRows).forEach(key => {
    const rows = target.mechanicalCurveRows && target.mechanicalCurveRows[key];
    target.mechanicalCurveRows[key] = (Array.isArray(rows) ? rows : newMaterialForm().mechanicalCurveRows[key]).map(row => ({
      sizeCondition: row && row.sizeCondition || null,
      values: Object.assign({}, emptyValues(TEMPERATURE_AXES[key]), row && row.values || {})
    }));
  });
  if (!target.thermalCurveValues || typeof target.thermalCurveValues !== "object") {
    target.thermalCurveValues = newMaterialForm().thermalCurveValues;
  }
  Object.keys(blank.thermalCurveValues).forEach(key => {
    target.thermalCurveValues[key] = Object.assign({}, emptyValues(TEMPERATURE_AXES.thermal), target.thermalCurveValues && target.thermalCurveValues[key] || {});
  });
  if (!target.elasticModulusCurveValues || typeof target.elasticModulusCurveValues !== "object") {
    target.elasticModulusCurveValues = newMaterialForm().elasticModulusCurveValues;
  }
  target.elasticModulusCurveValues = Object.assign({}, emptyValues(TEMPERATURE_AXES.elastic), target.elasticModulusCurveValues || {});
  return target;
};

export default {
  name: "PipelineDataLibrary",
  components: { queryForm },
  data() {
    return {
      libraryType: this.$route.meta && this.$route.meta.libraryType || "material",
      query: this.emptyQuery(),
      records: [],
      selected: [],
      total: 0,
      loading: false,
      saving: false,
      dialogVisible: false,
      editing: false,
      form: newMaterialForm(),
      materialTab: "basic",
      materialDetailLoading: false,
      materialDetailRequestId: 0,
      maxTableHeight: 0,
      preview: { designTemperature: null, thickness: null },
      previewResult: { mechanical: {}, thermal: "", elastic: "" },
      materialBaseFields: [
        { prop: "materialGrade", label: "管材牌号" }, { prop: "unsNo", label: "UNS编号" }, { prop: "category", label: "材料大类" },
        { prop: "subcategory", label: "材料子类" }, { prop: "productForm", label: "产品形式" }, { prop: "specificationNo", label: "规范号" },
        { prop: "pNo", label: "P-No" }, { prop: "groupNo", label: "Group No." }, { prop: "tensileStrength", label: "常温抗拉强度 Su (MPa)", type: "number" },
        { prop: "yieldStrength", label: "常温屈服强度 Sy (MPa)", type: "number" }, { prop: "elasticModulus", label: "常温弹性模量 E (MPa)", type: "number" },
        { prop: "poissonRatio", label: "泊松比", type: "number" }, { prop: "materialDensity", label: "常温密度 ρ (kg/m³)", type: "number" },
        { prop: "fatigueLimit", label: "疲劳极限 (MPa)", type: "number" }, { prop: "minDesignTemperature", label: "最低设计温度 (℃)", type: "number" },
        { prop: "maxDesignTemperature", label: "最高设计温度 (℃)", type: "number" }, { prop: "remarks", label: "备注", span: 24 }
      ],
      mechanicalProperties: [
        { key: "s", title: "最大许用应力 S (MPa)", source: "ASME II-D Table 1A / 1B", temperatures: TEMPERATURE_AXES.s },
        { key: "sm", title: "设计应力强度 Sm (MPa)", source: "ASME II-D Table 5A / 5B", temperatures: TEMPERATURE_AXES.sm },
        { key: "su", title: "抗拉强度 Su (MPa)", source: "ASME II-D Table U", temperatures: TEMPERATURE_AXES.su },
        { key: "sy", title: "屈服强度 Sy (MPa)", source: "ASME II-D Table Y", temperatures: TEMPERATURE_AXES.sy }
      ],
      thermalProperties: [
        { key: "alpha", label: "热膨胀系数 α (×10⁻⁶/℃)", precision: 5 },
        { key: "conductivity", label: "导热系数 k (W/(m·℃))", precision: 5 },
        { key: "density", label: "密度 ρ (kg/m³)", precision: 3 }
      ],
      thermalTemperatures: TEMPERATURE_AXES.thermal,
      elasticTemperatures: TEMPERATURE_AXES.elastic
    };
  },
  computed: {
    fields() { return this.libraryType === "material" ? MATERIAL_FIELDS : OPERATING_FIELDS; },
    columns() {
      return this.fields.map(item => ({
        prop: item[0],
        label: item[1],
        width: columnMinWidth(item[1]),
        formatter: item[0] === "unitNo" ? this.formatUnitNo : (item[2] === "number" ? this.formatNumber : undefined)
      }));
    },
    formFields() { return this.fields.map(item => ({ prop: item[0], label: item[1], type: item[2], precision: item[3] })); },
    pageTitle() { return this.libraryType === "material" ? "材料信息库" : "运行工况库"; },
    computedTableHeight() { return this.maxTableHeight; },
    queryFields() {
      if (this.libraryType === "operating") {
        return [
          { name: "conditionCode", label: "工况编码", value: "", type: "input", display: true, order: 1 },
          { name: "unitNo", label: "所属机组", value: "", type: "select", display: true, order: 2, fieldMap: [{ label: "5号机", value: 5 }] }
        ];
      }
      return [
        { name: "materialGrade", label: "管材牌号", value: "", type: "input", display: true, order: 1 },
        { name: "unsNo", label: "UNS编号", value: "", type: "input", display: true, order: 2 },
        { name: "category", label: "材料大类", value: "", type: "input", display: true, order: 3 }
      ];
    }
  },
  watch: {
    "$route.path"() {
      this.switchType();
      this.$nextTick(this.initMaxHeight);
    }
  },
  mounted() {
    this.switchType();
    this.initMaxHeight();
    this.throttleFunc = throttle(this.initMaxHeight, 500);
    window.addEventListener("resize", this.throttleFunc);
  },
  beforeDestroy() { window.removeEventListener("resize", this.throttleFunc); },
  methods: {
    // 机组编号仅在列表展示时转换名称，筛选和保存仍使用数字编号。
    formatUnitNo(row, column, value) {
      return value === null || value === undefined || value === "" ? "-" : value + "号机";
    },
    // 页面统一保留三位小数，接口和保存数据仍保留原始精度。
    formatNumber(row, column, value) {
      if (value === null || value === undefined || value === "") return "-";
      const number = Number(value);
      return Number.isFinite(number) ? number.toFixed(3) : value;
    },
    emptyQuery() { return { current: 1, size: 10, materialGrade: "", unsNo: "", category: "", conditionCode: "", unitNo: null }; },
    initMaxHeight() { calcHeight(this); },
    indexMethod(index) { return (this.query.current - 1) * this.query.size + index + 1; },
    switchType() { this.libraryType = this.$route.meta && this.$route.meta.libraryType || (this.$route.path.indexOf("operating") >= 0 ? "operating" : "material"); this.query = this.emptyQuery(); this.selected = []; this.load(); },
    load() {
      this.loading = true;
      api.page(this.libraryType, this.query).then(res => {
        const data = res && res.data && res.data.data;
        this.records = data && data.records || [];
        this.total = data && data.total || 0;
      }).catch(() => { this.$message.error("查询失败，请稍后重试"); }).finally(() => { this.loading = false; });
    },
    search(form) {
      const next = this.emptyQuery();
      next.size = this.query.size;
      if (form && typeof form === "object") {
        ["materialGrade", "unsNo", "category", "conditionCode"].forEach(key => {
          if (form[key] !== undefined && form[key] !== null) next[key] = String(form[key]).trim();
        });
        if (form.unitNo !== undefined && form.unitNo !== "" && form.unitNo !== null) next.unitNo = form.unitNo;
      }
      this.query = next;
      this.load();
    },
    reset() { this.query = this.emptyQuery(); this.load(); },
    changeSize(size) { this.query.size = size; this.query.current = 1; this.load(); },
    changePage(page) { this.query.current = page; this.load(); },
    openCreate() {
      this.materialDetailRequestId += 1;
      this.materialDetailLoading = false;
      this.editing = false;
      this.materialTab = "basic";
      this.form = this.libraryType === "material" ? newMaterialForm() : {};
      this.resetPreview();
      this.dialogVisible = true;
    },
    openEdit(row) {
      if (this.libraryType !== "material") {
        this.editing = true;
        this.form = Object.assign({}, row);
        this.dialogVisible = true;
        return;
      }
      // 先用列表行打开弹窗，基础信息可立即展示；曲线大字段在后台详情请求完成后再替换。
      const requestId = ++this.materialDetailRequestId;
      this.editing = true;
      this.materialTab = "basic";
      this.form = normalizeMaterialForm(row);
      this.resetPreview();
      this.dialogVisible = true;
      this.materialDetailLoading = true;
      api.find("material", row.id).then(res => {
        if (requestId !== this.materialDetailRequestId) return;
        const result = res && res.data && res.data.data;
        if (!result) throw new Error("材料记录不存在");
        this.form = normalizeMaterialForm(result);
        this.resetPreview();
      }).catch(error => {
        if (requestId === this.materialDetailRequestId) this.$message.error(error.message || "材料详情查询失败");
      }).finally(() => {
        if (requestId === this.materialDetailRequestId) this.materialDetailLoading = false;
      });
    },
    curveRows(key) { return this.form.mechanicalCurveRows && this.form.mechanicalCurveRows[key] || []; },
    setSizeCondition(row, value) {
      if (row) this.$set(row, "sizeCondition", value);
    },
    getCurveCell(row, temperature) {
      return row && row.values ? row.values[temperature] : null;
    },
    setCurveCell(row, temperature, value) {
      if (!row) return;
      if (!row.values || typeof row.values !== "object") this.$set(row, "values", {});
      this.$set(row.values, temperature, value);
    },
    getThermalCell(key, temperature) {
      const values = this.form && this.form.thermalCurveValues && this.form.thermalCurveValues[key];
      return values ? values[temperature] : null;
    },
    setThermalCell(key, temperature, value) {
      if (!this.form.thermalCurveValues || typeof this.form.thermalCurveValues !== "object") this.$set(this.form, "thermalCurveValues", {});
      if (!this.form.thermalCurveValues[key] || typeof this.form.thermalCurveValues[key] !== "object") this.$set(this.form.thermalCurveValues, key, {});
      this.$set(this.form.thermalCurveValues[key], temperature, value);
    },
    getElasticCell(temperature) {
      return this.form && this.form.elasticModulusCurveValues ? this.form.elasticModulusCurveValues[temperature] : null;
    },
    setElasticCell(temperature, value) {
      if (!this.form.elasticModulusCurveValues || typeof this.form.elasticModulusCurveValues !== "object") this.$set(this.form, "elasticModulusCurveValues", {});
      this.$set(this.form.elasticModulusCurveValues, temperature, value);
    },
    addMechanicalRow(key) {
      this.$set(this.form.mechanicalCurveRows, key, this.curveRows(key).concat([{ sizeCondition: null, values: emptyValues(TEMPERATURE_AXES[key]) }]));
    },
    removeMechanicalRow(key) {
      const rows = this.curveRows(key);
      if (!rows.length) return;
      this.form.mechanicalCurveRows[key] = rows.slice(0, -1);
    },
    validateSizeCondition(row) {
      const value = (row.sizeCondition || "").trim();
      if (value && !/^(<=|>=|<|>|=)\s*\d+(\.\d+)?$/.test(value)) {
        this.$message.warning("尺寸/厚度仅填写比较条件，例如 >20、>=20、<=20 或 =20");
        row.sizeCondition = null;
      } else {
        row.sizeCondition = value || null;
      }
    },
    resetPreview() {
      this.preview = { designTemperature: null, thickness: null };
      this.previewResult = { mechanical: {}, thermal: "", elastic: "" };
    },
    setMechanicalPreview(key, value) {
      if (!this.previewResult) this.$set(this, "previewResult", { mechanical: {}, thermal: "", elastic: "" });
      if (!this.previewResult.mechanical) this.$set(this.previewResult, "mechanical", {});
      this.$set(this.previewResult.mechanical, key, value);
    },
    interpolateCurve(values, temperature) {
      if (temperature === null || temperature === undefined || temperature === "") return null;
      const target = Number(temperature);
      if (!Number.isFinite(target)) return null;
      const rangeKey = Object.keys(values || {}).find(key => key.indexOf("~") >= 0 && values[key] !== null && values[key] !== undefined && values[key] !== "");
      let rangePoint = null;
      if (rangeKey) {
        const bounds = rangeKey.split("~").map(Number);
        rangePoint = { temperature: bounds[1], value: Number(values[rangeKey]) };
        if (target >= bounds[0] && target <= bounds[1]) return rangePoint.value;
        if (target < bounds[0]) return null;
      }
      const pointSet = Object.keys(values || {})
        .filter(key => key.indexOf("~") < 0)
        .map(key => ({ temperature: Number(key), value: values[key] }))
        .filter(point => Number.isFinite(point.temperature) && point.value !== null && point.value !== undefined && point.value !== "")
        .concat(rangePoint ? [rangePoint] : [])
        .sort((a, b) => a.temperature - b.temperature)
        .filter((point, index, points) => index === 0 || point.temperature !== points[index - 1].temperature);
      if (!pointSet.length) return null;
      if (pointSet.some(point => point.temperature === target)) return pointSet.find(point => point.temperature === target).value;
      const lower = pointSet.filter(point => point.temperature < target).pop();
      const upper = pointSet.find(point => point.temperature > target);
      if (!lower || !upper) return null;
      return Number(lower.value) + (Number(upper.value) - Number(lower.value)) * (target - lower.temperature) / (upper.temperature - lower.temperature);
    },
    previewMechanical(key) {
      const rows = this.curveRows(key);
      const thickness = Number(this.preview.thickness);
      if (!Number.isFinite(thickness) || thickness <= 0) { this.setMechanicalPreview(key, "请输入有效厚度"); return; }
      const matching = rows.filter(row => this.matchesSizeCondition(row.sizeCondition, thickness));
      const generic = rows.find(row => !row.sizeCondition);
      const selected = matching.length === 1 ? matching[0] : (matching.length > 1 ? null : generic);
      if (!selected) { this.setMechanicalPreview(key, matching.length > 1 ? "尺寸条件重叠，无法唯一选择" : "没有匹配的尺寸条件或通用行"); return; }
      const result = this.interpolateCurve(selected.values, this.preview.designTemperature);
      this.setMechanicalPreview(key, result === null ? "温度超出数据范围或缺少相邻温度数据" : `${key.toUpperCase()} (${this.preview.designTemperature}℃) = ${result.toFixed(3)} MPa`);
    },
    matchesSizeCondition(condition, thickness) {
      if (!condition) return false;
      const match = condition.match(/^(<=|>=|<|>|=)\s*(\d+(?:\.\d+)?)$/);
      if (!match) return false;
      const limit = Number(match[2]);
      return { "<": thickness < limit, "<=": thickness <= limit, ">": thickness > limit, ">=": thickness >= limit, "=": thickness === limit }[match[1]];
    },
    previewThermal() {
      const temperature = this.preview.designTemperature;
      const values = this.form.thermalCurveValues;
      const alpha = this.interpolateCurve(values.alpha, temperature);
      const conductivity = this.interpolateCurve(values.conductivity, temperature);
      const density = this.interpolateCurve(values.density, temperature);
      this.previewResult.thermal = [alpha === null ? null : `α ${alpha.toFixed(3)} ×10⁻⁶/℃`, conductivity === null ? null : `k ${conductivity.toFixed(3)} W/(m·℃)`, density === null ? null : `ρ ${density.toFixed(3)} kg/m³`].filter(Boolean).join("；") || "该温度附近没有可插值数据";
    },
    previewElastic() {
      const result = this.interpolateCurve(this.form.elasticModulusCurveValues, this.preview.designTemperature);
      this.previewResult.elastic = result === null ? "温度超出数据范围或缺少相邻温度数据" : `E (${this.preview.designTemperature}℃) = ${result.toFixed(3)} GPa`;
    },
    save() {
      if (this.materialDetailLoading) return;
      this.saving = true;
      const request = this.editing ? api.update(this.libraryType, this.form) : api.create(this.libraryType, this.form);
      request.then(res => {
        if (res.data && res.data.code === 0) { this.$message.success("保存成功"); this.dialogVisible = false; this.load(); }
        else this.$message.error(res.data && res.data.msg || "保存失败");
      }).catch(() => { this.$message.error("保存失败，请稍后重试"); }).finally(() => { this.saving = false; });
    },
    removeRow(row) { this.removeIds([row.id]); },
    removeSelected() { this.removeIds(this.selected.map(row => row.id)); },
    removeIds(ids) {
      this.$confirm("删除后记录将不再出现在列表中，是否继续？", "提示", { type: "warning" }).then(() => api.remove(this.libraryType, { ids: ids })).then(res => {
        if (res.data && res.data.code === 0) { this.$message.success("删除成功"); this.load(); this.selected = []; }
        else this.$message.error(res.data && res.data.msg || "删除失败");
      }).catch(() => {});
    },
    openImport() { this.$refs.fileInput.value = ""; this.$refs.fileInput.click(); },
    importExcel(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      const data = new FormData(); data.append("file", file);
      api.importExcel(this.libraryType, data).then(res => {
        if (res.data && res.data.code === 0) { this.$message.success("导入成功，共导入" + res.data.data + "条"); this.load(); }
        else this.$message.error(res.data && res.data.msg || "导入失败");
      }).catch(() => { this.$message.error("导入失败，请检查Excel格式"); });
    },
    downloadTemplate() { api.template(this.libraryType).then(res => this.downloadBlob(res, this.pageTitle + "导入模板.xlsx")); },
    exportExcel() { api.exportExcel(this.libraryType, this.query).then(res => this.downloadBlob(res, this.pageTitle + ".xlsx")); },
    downloadBlob(res, name) {
      const blob = new Blob([res.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = name; link.style.display = "none";
      document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(link.href);
    }
  }
};
</script>

<style lang="less" scoped>
.el-card.is-always-shadow { margin-left: 15px; }
/deep/ .el-button--text { user-select: unset; }
.table-button { text-align: right; }
/deep/ .el-form-item__label { white-space: nowrap; }
/deep/ .cud-commom-form-search .el-form-item { display: flex; align-items: center; padding-right: 12px; }
/deep/ .cud-commom-form-search .el-form-item__label { width: auto !important; float: none; padding-right: 8px; line-height: 32px; flex-shrink: 0; }
/deep/ .cud-commom-form-search .el-form-item__content { margin-left: 0 !important; flex: none; float: none; width: 50%; max-width: 220px; min-width: 0; }
/deep/ .cud-commom-form-search .el-input,
/deep/ .cud-commom-form-search .el-select { width: 100%; }
/deep/ .el-card:first-child .el-card__body { padding-left: 10px; padding-right: 10px; }
.pipeline-data-library-page { padding-bottom: 20px; }
.library-actions { text-align: right; margin-bottom: 12px; }
.library-pagination { padding: 16px 0 4px; text-align: right; }
.library-form /deep/ .el-input-number { text-align: left; }
.library-form /deep/ .el-input-number .el-input__inner { text-align: left; }
/deep/ .cud-office-table th > .cell,
/deep/ .cud-office-table td > .cell { display: block; text-align: center; }
/deep/ .cud-office-table th > .cell { white-space: nowrap; word-break: keep-all; }
.material-editor-toolbar { display:flex; align-items:center; justify-content:space-between; padding:0 0 12px; border-bottom:1px solid #ebeef5; }
.material-editor-toolbar > div { display:flex; flex-direction:column; gap:4px; }
.material-editor-toolbar strong { font-size:16px; color:#303133; }
.material-editor-toolbar span { color:#909399; font-size:12px; }
.material-editor-tabs { margin-top:8px; }
.curve-help { margin-bottom:12px; }
.curve-section { margin:0 0 20px; border:1px solid #ebeef5; border-radius:4px; background:#fff; }
.curve-section-heading { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:12px 14px; background:#f7f9fc; border-bottom:1px solid #ebeef5; }
.curve-section-heading > div:first-child { display:flex; flex-direction:column; gap:4px; }
.curve-section-heading strong { color:#303133; font-size:14px; }
.curve-section-heading span { color:#909399; font-size:12px; }
.curve-actions { display:flex; gap:8px; flex-shrink:0; }
.curve-table-wrap { width:100%; overflow:auto; }
.material-curve-table { width:max-content; min-width:100%; border-collapse:collapse; font-size:12px; }
.material-curve-table th,.material-curve-table td { min-width:92px; padding:6px; border-right:1px solid #ebeef5; border-bottom:1px solid #ebeef5; text-align:center; white-space:nowrap; }
.material-curve-table th { color:#606266; background:#fafafa; font-weight:600; }
.material-curve-table .condition-column { position:sticky; left:0; z-index:1; min-width:150px; background:#fff; }
.material-curve-table thead .condition-column { z-index:2; background:#f5f7fa; }
.material-curve-table /deep/ .el-input,.material-curve-table /deep/ .el-input-number { width:100px; }
.material-curve-table /deep/ .el-input-number .el-input__inner { padding-left:5px; padding-right:5px; text-align:right; }
.curve-preview { display:flex; align-items:center; flex-wrap:wrap; gap:10px; padding:12px 14px; }
.curve-preview strong { margin-right:4px; color:#606266; }
.curve-preview > span { color:#606266; line-height:1.5; }
.curve-empty { color:#909399; padding:24px !important; }
@media (max-width:768px) {
  .curve-section-heading { align-items:flex-start; flex-direction:column; }
  .curve-preview { align-items:flex-start; }
  .material-basic-form /deep/ .el-form-item__label { width:120px !important; }
  .material-basic-form /deep/ .el-form-item__content { margin-left:120px !important; }
}
</style>
