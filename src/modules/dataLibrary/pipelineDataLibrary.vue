<template>
  <div class="cud-commom-form-style">
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
        >
        </query-form>
      </el-card>
      <el-card>
        <div class="table-button">
          <el-button size="small" @click="openCreate">新增</el-button>
          <el-button size="small" @click="openImport">导入Excel</el-button>
          <el-button size="small" @click="downloadTemplate">下载模板</el-button>
          <el-button size="small" type="primary" @click="exportExcel">导出Excel</el-button>
          <el-button size="small" type="danger" :disabled="!selected.length" @click="removeSelected">批量删除</el-button>
          <input ref="fileInput" type="file" accept=".xls,.xlsx" style="display:none" @change="importExcel">
        </div>
        <el-row
          class="cud__table--list"
          :style="{ height: computedTableHeight + 'px' }"
        >
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
            <el-table-column align="center" type="selection" width="55"></el-table-column>
            <el-table-column
              align="center"
              type="index"
              label="序号"
              width="64"
              :index="indexMethod"
            ></el-table-column>
            <el-table-column
              v-for="column in columns"
              :key="column.prop"
              align="center"
              :prop="column.prop"
              :label="column.label"
              :min-width="column.width || 120"
              :label-class-name="column.nowrap ? 'library-header-nowrap' : ''"
              :formatter="column.prop === 'unitNo' ? formatUnitNo : undefined"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column label="操作" width="130" fixed="right" align="center">
              <template slot-scope="scope">
                <el-button type="text" size="small" class="cud-common-operate-edit" @click="openEdit(scope.row)">编辑</el-button>
                <el-button type="text" size="small" class="cud-common-operate-delete" @click="removeRow(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-row>
        <el-row>
          <div class="cud-special-pagination cud-special-pagination-button">
            <el-pagination
              popper-class="cud-pager-dropdown"
              ref="pager"
              class="cud__page"
              :current-page="query.current"
              :page-size="query.size"
              :page-sizes="[10, 20, 30, 40]"
              :pager-count="5"
              layout="total,sizes, prev, pager, next"
              :total="total"
              :disabled="loading"
              @size-change="changeSize"
              @current-change="changePage"
            ></el-pagination>
          </div>
        </el-row>
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

export default {
  name: "PipelineDataLibrary",
  components: {
    queryForm
  },
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
      form: {},
      maxTableHeight: 0
    };
  },
  computed: {
    fields() { return this.libraryType === "material" ? MATERIAL_FIELDS : OPERATING_FIELDS; },
    columns() {
      const nowrapProps = { c2Level: 196, c3Level: 188 };
      return this.fields.map(item => ({
        prop: item[0],
        label: item[1],
        width: nowrapProps[item[0]] || (item[2] === "number" ? 140 : 130),
        nowrap: !!nowrapProps[item[0]]
      }));
    },
    formFields() { return this.fields.map(item => ({ prop: item[0], label: item[1], type: item[2], precision: item[3] })); },
    pageTitle() { return this.libraryType === "material" ? "材料信息库" : "运行工况库"; },
    computedTableHeight() { return this.maxTableHeight; },
    queryFields() {
      if (this.libraryType === "operating") {
        return [
          { name: "conditionCode", label: "工况编码", value: "", type: "input", display: true, order: 1 },
          {
            name: "unitNo",
            label: "所属机组",
            value: "",
            type: "select",
            display: true,
            order: 2,
            fieldMap: [{ label: "5号机", value: 5 }]
          }
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
  beforeDestroy() {
    window.removeEventListener("resize", this.throttleFunc);
  },
  methods: {
    // 机组编号仅在列表展示时转换名称，筛选和保存仍使用数字编号。
    formatUnitNo(row, column, value) {
      return value === null || value === undefined || value === "" ? "-" : value + "号机";
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
.el-card.is-always-shadow {
  margin-left: 15px;
}
/deep/ .el-button--text {
  user-select: unset;
}
.table-button {
  text-align: right;
}
/deep/ .el-form-item__label {
  white-space: nowrap;
}
/deep/ .cud-commom-form-search .el-form-item {
  display: flex;
  align-items: center;
  padding-right: 12px;
}
/deep/ .cud-commom-form-search .el-form-item__label {
  width: auto !important;
  float: none;
  padding-right: 8px;
  line-height: 32px;
  flex-shrink: 0;
}
/deep/ .cud-commom-form-search .el-form-item__content {
  margin-left: 0 !important;
  flex: none;
  float: none;
  width: 50%;
  max-width: 220px;
  min-width: 0;
}
/deep/ .cud-commom-form-search .el-input,
/deep/ .cud-commom-form-search .el-select {
  width: 100%;
}
/deep/ .el-card:first-child .el-card__body {
  padding-left: 10px;
  padding-right: 10px;
}
.library-form /deep/ .el-input-number .el-input__inner {
  text-align: left;
}
/deep/ .cud-office-table th.library-header-nowrap > .cell {
  white-space: nowrap;
  word-break: keep-all;
}
</style>
