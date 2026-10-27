<template>
  <div class="cud-commom-form-style pipeline-data-library-page">
    <div class="cud__scroll--div">
      <el-card class="library-toolbar-card">
        <el-form :inline="true" :model="query" size="small" @submit.native.prevent>
          <el-form-item v-if="libraryType === 'material'" label="管材牌号">
            <el-input v-model.trim="query.materialGrade" clearable placeholder="请输入管材牌号" @keyup.enter.native="search"></el-input>
          </el-form-item>
          <el-form-item v-if="libraryType === 'material'" label="UNS编号">
            <el-input v-model.trim="query.unsNo" clearable placeholder="请输入UNS编号" @keyup.enter.native="search"></el-input>
          </el-form-item>
          <el-form-item v-if="libraryType === 'material'" label="材料大类">
            <el-input v-model.trim="query.category" clearable placeholder="请输入材料大类" @keyup.enter.native="search"></el-input>
          </el-form-item>
          <el-form-item v-if="libraryType === 'operating'" label="工况编码">
            <el-input v-model.trim="query.conditionCode" clearable placeholder="请输入工况编码" @keyup.enter.native="search"></el-input>
          </el-form-item>
          <el-form-item v-if="libraryType === 'operating'" label="所属机组">
            <el-select v-model="query.unitNo" clearable placeholder="请选择机组" @change="search">
              <el-option label="5号机" :value="5"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="search">搜索</el-button>
            <el-button @click="reset">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <el-card>
        <div class="library-actions">
          <el-button type="primary" size="small" icon="el-icon-plus" @click="openCreate">新增</el-button>
          <el-button size="small" icon="el-icon-upload2" @click="openImport">导入Excel</el-button>
          <el-button size="small" icon="el-icon-download" @click="downloadTemplate">下载模板</el-button>
          <el-button size="small" icon="el-icon-document" @click="exportExcel">导出Excel</el-button>
          <el-button size="small" type="danger" icon="el-icon-delete" :disabled="!selected.length" @click="removeSelected">批量删除</el-button>
          <input ref="fileInput" type="file" accept=".xls,.xlsx" style="display:none" @change="importExcel">
        </div>
        <el-table v-loading="loading" :data="records" border stripe size="small" @selection-change="selected = $event">
          <el-table-column type="selection" width="50" align="center"></el-table-column>
          <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
          <template v-for="column in columns">
            <el-table-column :key="column.prop" :prop="column.prop" :label="column.label" :min-width="column.width || 120" :formatter="column.prop === 'unitNo' ? formatUnitNo : undefined" show-overflow-tooltip></el-table-column>
          </template>
          <el-table-column label="操作" width="130" fixed="right" align="center">
            <template slot-scope="scope">
              <el-button type="text" size="small" @click="openEdit(scope.row)">编辑</el-button>
              <el-button type="text" size="small" class="cud-common-operate-delete" @click="removeRow(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="library-pagination">
          <el-pagination
            background
            layout="total, sizes, prev, pager, next, jumper"
            :current-page="query.current"
            :page-size="query.size"
            :page-sizes="[10, 20, 50, 100]"
            :total="total"
            @size-change="changeSize"
            @current-change="changePage"
          ></el-pagination>
        </div>
      </el-card>

      <el-dialog :title="editing ? '编辑' : '新增'" :visible.sync="dialogVisible" width="760px" append-to-body>
        <el-form ref="form" :model="form" label-width="150px" size="small" class="library-form">
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
                <el-input-number v-else v-model="form[field.prop]" :controls="false" :min="field.min" :max="field.max" :precision="field.precision === undefined ? 8 : field.precision" style="width:100%"></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <span slot="footer">
          <el-button size="small" @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" size="small" :loading="saving" @click="save">保存</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import api from "./api";

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

export default {
  name: "PipelineDataLibrary",
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
      form: {}
    };
  },
  computed: {
    fields() { return this.libraryType === "material" ? MATERIAL_FIELDS : OPERATING_FIELDS; },
    columns() { return this.fields.map(item => ({ prop: item[0], label: item[1], width: item[2] === "number" ? 140 : 130 })); },
    formFields() { return this.fields.map(item => ({ prop: item[0], label: item[1], type: item[2], precision: item[3] })); },
    pageTitle() { return this.libraryType === "material" ? "材料信息库" : "运行工况库"; }
  },
  watch: {
    "$route.path"() { this.switchType(); }
  },
  mounted() { this.switchType(); },
  methods: {
    // 机组编号仅在列表展示时转换名称，筛选和保存仍使用数字编号。
    formatUnitNo(row, column, value) {
      return value === null || value === undefined || value === "" ? "-" : value + "号机";
    },
    emptyQuery() { return { current: 1, size: 10, materialGrade: "", unsNo: "", category: "", conditionCode: "", unitNo: null }; },
    switchType() { this.libraryType = this.$route.meta && this.$route.meta.libraryType || (this.$route.path.indexOf("operating") >= 0 ? "operating" : "material"); this.query = this.emptyQuery(); this.load(); },
    load() {
      this.loading = true;
      api.page(this.libraryType, this.query).then(res => {
        const data = res && res.data && res.data.data;
        this.records = data && data.records || [];
        this.total = data && data.total || 0;
      }).catch(() => { this.$message.error("查询失败，请稍后重试"); }).finally(() => { this.loading = false; });
    },
    search() { this.query.current = 1; this.load(); },
    reset() { this.query = this.emptyQuery(); this.load(); },
    changeSize(size) { this.query.size = size; this.query.current = 1; this.load(); },
    changePage(page) { this.query.current = page; this.load(); },
    openCreate() { this.editing = false; this.form = {}; this.dialogVisible = true; },
    openEdit(row) { this.editing = true; this.form = Object.assign({}, row); this.dialogVisible = true; },
    save() {
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
.pipeline-data-library-page { padding-bottom: 20px; }
.library-actions { text-align: right; margin-bottom: 12px; }
.library-pagination { padding: 16px 0 4px; text-align: right; }
.library-form /deep/ .el-input-number { text-align: left; }
.library-toolbar-card { margin-bottom: 12px; }
</style>
