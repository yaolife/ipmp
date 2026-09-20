<template>
  <div class="cud-commom-form-style">
    <div class="cud__scroll--div">
      <div class="lof-page lof-ledger" v-loading="pageLoading">
        <div class="ledger-layout">
          <div class="card ledger-tree-card">
            <div class="card-header">
              <div class="card-title">系统筛选树</div>
              <el-button size="mini" @click="resetTreeFilter">重置</el-button>
            </div>
            <div class="card-body ledger-tree-body">
              <el-tree
                ref="directoryTree"
                :data="directoryTree"
                node-key="id"
                :props="treeProps"
                :expand-on-click-node="false"
                :default-expand-all="false"
                highlight-current
                @node-click="onTreeNodeClick"
              ></el-tree>
            </div>
          </div>

          <div class="card ledger-table-card">
            <div class="card-header ledger-toolbar">
              <div class="card-title">管段台账</div>
              <div class="ledger-actions">
                <el-button size="small" @click="locateInThreeDimension">三维定位</el-button>
                <el-button
                  size="small"
                  :loading="batchAnalyzing"
                  :disabled="batchAnalyzing || !records.length"
                  @click="startBatchAnalysis"
                >一键自动分析</el-button>
                <el-button size="small" @click="syncLedger">批量同步</el-button>
                <el-button type="primary" size="small" @click="exportLedger">批量导出</el-button>
              </div>
              <div class="ledger-filters">
                <el-input
                  v-model.trim="query.keyword"
                  size="small"
                  clearable
                  placeholder="搜索 KKS / 管线 / 介质 / 支撑"
                  @keyup.enter.native="search"
                  @clear="search"
                ></el-input>
                <el-select v-model="query.riskLevel" size="small" clearable placeholder="风险等级" @change="search">
                  <el-option label="High" :value="2"></el-option>
                  <el-option label="Medium" :value="1"></el-option>
                  <el-option label="Low" :value="0"></el-option>
                  <el-option label="NA（未完成TM02）" :value="-1"></el-option>
                </el-select>
                <el-select v-model="query.completeness" size="small" clearable placeholder="数据完整性" @change="search">
                  <el-option label="完整" :value="1"></el-option>
                  <el-option label="缺失" :value="0"></el-option>
                </el-select>
                <el-select v-model="query.analysisStatus" size="small" clearable placeholder="分析状态" @change="search">
                  <el-option label="待分析" :value="0"></el-option>
                  <el-option label="已完成TM01" :value="1"></el-option>
                  <el-option label="已完成TM02" :value="2"></el-option>
                  <el-option label="已完成TM05" :value="3"></el-option>
                </el-select>
                <el-button type="primary" size="small" @click="search">查询</el-button>
              </div>
            </div>
            <div class="card-body ledger-table-body">
              <el-table
                :data="records"
                height="100%"
                border
                stripe
                @sort-change="onSortChange"
              >
                <el-table-column label="KKS" min-width="150">
                  <template slot-scope="scope">{{ kksText(scope.row) }}</template>
                </el-table-column>
                <el-table-column label="起止支撑" min-width="170">
                  <template slot-scope="scope">{{ supportRange(scope.row) }}</template>
                </el-table-column>
                <el-table-column prop="spanReference" label="跨距(m)" width="92"></el-table-column>
                <el-table-column prop="outerDiameter" label="外径(mm)" width="98"></el-table-column>
                <el-table-column prop="wallThickness" label="壁厚(mm)" width="98"></el-table-column>
                <el-table-column prop="workingMedium" label="介质" min-width="110"></el-table-column>
                <el-table-column label="介质类型" min-width="110">
                  <template slot-scope="scope">{{ mediumTypeText(scope.row.mediumType) }}</template>
                </el-table-column>
                <el-table-column prop="operatingPressure" label="压力(MPa)" width="105"></el-table-column>
                <el-table-column prop="operatingTemperature" label="温度(℃)" width="92"></el-table-column>
                <el-table-column label="质量流量(kg/s)" width="128">
                  <template slot-scope="scope">{{ numberText(scope.row.massFlow, 4) }}</template>
                </el-table-column>
                <el-table-column prop="supportType" label="支撑类型" width="100"></el-table-column>
                <el-table-column prop="mainLof" label="Main_LOF" width="105" sortable="custom">
                  <template slot-scope="scope">{{ numberText(scope.row.mainLof, 4) }}</template>
                </el-table-column>
                <el-table-column label="风险等级" width="100">
                  <template slot-scope="scope">
                    <span class="badge" :class="riskMeta(scope.row.riskLevel).className">
                      {{ riskMeta(scope.row.riskLevel).text }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column label="数据完整性" width="110">
                  <template slot-scope="scope">
                    <el-tooltip
                      :disabled="scope.row.completeness === 1"
                      :content="scope.row.missingFields || '存在缺失参数'"
                      placement="top"
                    >
                      <span class="badge" :class="scope.row.completeness === 1 ? 'badge-low' : 'badge-na'">
                        {{ scope.row.completeness === 1 ? '完整' : '缺失' }}
                      </span>
                    </el-tooltip>
                  </template>
                </el-table-column>
                <el-table-column label="分析状态" min-width="125">
                  <template slot-scope="scope">{{ analysisStatusText(scope.row.analysisStatus) }}</template>
                </el-table-column>
                <el-table-column label="操作" width="355">
                  <template slot-scope="scope">
                    <el-button type="text" size="mini" @click="openDetail(scope.row)">查看</el-button>
                    <el-button type="text" size="mini" @click="openEdit(scope.row)">编辑参数</el-button>
                    <el-button type="text" size="mini" @click="openHistory(scope.row)">分析历史</el-button>
                    <el-button type="text" size="mini" @click="goAssessment('tm01', scope.row)">TM01</el-button>
                    <el-button type="text" size="mini" @click="goAssessment('tm02', scope.row)">TM02</el-button>
                    <el-button type="text" size="mini" @click="goAssessment('tm05', scope.row)">TM05</el-button>
                  </template>
                </el-table-column>
              </el-table>
              <div class="ledger-pagination">
                <el-pagination
                  background
                  layout="total, sizes, prev, pager, next, jumper"
                  :current-page="query.current"
                  :page-size="query.size"
                  :page-sizes="[10, 20, 50, 100]"
                  :total="total"
                  @current-change="onCurrentChange"
                  @size-change="onSizeChange"
                ></el-pagination>
              </div>
            </div>
          </div>
        </div>
      </div>

      <el-drawer
        title="管段详情"
        :visible.sync="detailVisible"
        size="620px"
        append-to-body
      >
        <div class="ledger-drawer-body" v-loading="detailLoading">
          <template v-if="detail">
            <div class="ledger-detail-grid">
              <div v-for="item in detailItems" :key="item.label" class="ledger-detail-item">
                <div class="ledger-detail-label">{{ item.label }}</div>
                <div class="ledger-detail-value">{{ item.value }}</div>
              </div>
            </div>
            <div v-if="detail.missingFields" class="help-text mt-12 ledger-missing">
              缺失参数：{{ detail.missingFields }}
            </div>
          </template>
        </div>
      </el-drawer>

      <el-drawer
        title="分析历史"
        :visible.sync="historyVisible"
        size="720px"
        append-to-body
      >
        <div class="ledger-drawer-body" v-loading="historyLoading">
          <div class="section-title">TM01 定性评估历史</div>
          <el-table :data="history.tm01" border size="mini">
            <el-table-column prop="versionNo" label="版本" width="75"></el-table-column>
            <el-table-column label="风险等级" width="100">
              <template slot-scope="scope">{{ riskMeta(scope.row.riskLevel).text }}</template>
            </el-table-column>
            <el-table-column prop="assessmentType" label="评估类型"></el-table-column>
            <el-table-column prop="createDate" label="创建时间" width="160"></el-table-column>
          </el-table>
          <div class="section-title">TM02 定量评估历史</div>
          <el-table :data="history.tm02" border size="mini">
            <el-table-column prop="versionNo" label="版本" width="75"></el-table-column>
            <el-table-column prop="maxLof" label="Main_LOF"></el-table-column>
            <el-table-column label="风险等级" width="100">
              <template slot-scope="scope">{{ riskMeta(scope.row.riskLevel).text }}</template>
            </el-table-column>
            <el-table-column prop="createDate" label="创建时间" width="160"></el-table-column>
          </el-table>
          <div class="section-title">TM05 振动校核历史</div>
          <el-table :data="history.tm05" border size="mini">
            <el-table-column prop="versionNo" label="版本" width="75"></el-table-column>
            <el-table-column prop="vPeakAllow" label="许用峰值速度"></el-table-column>
            <el-table-column prop="overLimit" label="是否超限"></el-table-column>
            <el-table-column label="风险等级" width="100">
              <template slot-scope="scope">{{ riskMeta(scope.row.riskLevel).text }}</template>
            </el-table-column>
            <el-table-column prop="createDate" label="创建时间" width="160"></el-table-column>
          </el-table>
        </div>
      </el-drawer>

      <el-dialog
        title="编辑管段参数"
        :visible.sync="editVisible"
        width="860px"
        append-to-body
        :close-on-click-modal="false"
      >
        <el-form :model="editForm" label-width="150px" size="small">
          <el-row :gutter="16">
            <el-col :span="12"><el-form-item label="管线号"><el-input v-model="editForm.pipelineNo"></el-input></el-form-item></el-col>
            <el-col :span="12"><el-form-item label="管道名称"><el-input v-model="editForm.pipelineName"></el-input></el-form-item></el-col>
            <el-col :span="12"><el-form-item label="管道起始点"><el-input v-model="editForm.startPoint"></el-input></el-form-item></el-col>
            <el-col :span="12"><el-form-item label="管道终止点"><el-input v-model="editForm.endPoint"></el-input></el-form-item></el-col>
            <el-col :span="12"><el-form-item label="工作介质"><el-input v-model="editForm.workingMedium"></el-input></el-form-item></el-col>
            <el-col :span="12">
              <el-form-item label="介质类型">
                <el-select v-model="editForm.mediumType" clearable style="width:100%">
                  <el-option label="单相蒸汽" :value="0"></el-option>
                  <el-option label="单相水" :value="1"></el-option>
                  <el-option label="气液两相" :value="2"></el-option>
                  <el-option label="多相流" :value="3"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8"><el-form-item label="跨距(m)"><el-input-number v-model="editForm.spanReference" :controls="false"></el-input-number></el-form-item></el-col>
            <el-col :span="8"><el-form-item label="外径(mm)"><el-input-number v-model="editForm.outerDiameter" :controls="false"></el-input-number></el-form-item></el-col>
            <el-col :span="8"><el-form-item label="壁厚(mm)"><el-input-number v-model="editForm.wallThickness" :controls="false"></el-input-number></el-form-item></el-col>
            <el-col :span="8"><el-form-item label="运行压力(MPa)"><el-input-number v-model="editForm.operatingPressure" :controls="false"></el-input-number></el-form-item></el-col>
            <el-col :span="8"><el-form-item label="运行温度(℃)"><el-input-number v-model="editForm.operatingTemperature" :controls="false"></el-input-number></el-form-item></el-col>
            <el-col :span="8"><el-form-item label="介质密度(kg/m³)"><el-input-number v-model="editForm.fluidDensity" :controls="false"></el-input-number></el-form-item></el-col>
            <el-col :span="8"><el-form-item label="最大流速(m/s)"><el-input-number v-model="editForm.maxVelocity" :controls="false"></el-input-number></el-form-item></el-col>
            <el-col :span="8"><el-form-item label="低流量占比(%)"><el-input-number v-model="editForm.lowFlowRatio" :controls="false"></el-input-number></el-form-item></el-col>
            <el-col :span="8"><el-form-item label="年启停次数"><el-input-number v-model="editForm.annualStartStops" :controls="false"></el-input-number></el-form-item></el-col>
            <el-col v-for="field in booleanFields" :key="field.key" :span="8">
              <el-form-item :label="field.label">
                <el-select v-model="editForm[field.key]" clearable style="width:100%">
                  <el-option label="否" :value="0"></el-option>
                  <el-option label="是" :value="1"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <span slot="footer">
          <el-button @click="editVisible = false">取消</el-button>
          <el-button type="primary" :loading="saving" @click="saveEdit">保存</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import draftsApi from "@/modules/drafts/api";
import api from "./api";
import { isSuccessCode, unwrapList } from "./utils";
import "./lof.css";

function emptyEditForm() {
  return {
    id: "",
    pipelineNo: "",
    pipelineName: "",
    startPoint: "",
    endPoint: "",
    workingMedium: "",
    mediumType: null,
    spanReference: null,
    outerDiameter: null,
    wallThickness: null,
    operatingPressure: null,
    operatingTemperature: null,
    fluidDensity: null,
    maxVelocity: null,
    lowFlowRatio: null,
    annualStartStops: null,
    isChokedFlow: null,
    hasSlugFlow: null,
    hasThrottlingElement: null,
    hasReciprocatingEquipment: null,
    hasCentrifugalEquipment: null,
    hasFlashingCavitation: null,
    hasThermowellProbe: null,
    hasDeadBranch: null,
    naturalFrequencyParams: null
  };
}

export default {
  data() {
    return {
      pageLoading: false,
      batchAnalyzing: false,
      directoryTree: [],
      treeProps: { children: "children", label: "nodeName" },
      selectedNode: null,
      records: [],
      total: 0,
      query: {
        current: 1,
        size: 20,
        segmentIds: null,
        keyword: "",
        riskLevel: null,
        completeness: null,
        analysisStatus: null,
        mainLofSort: ""
      },
      detailVisible: false,
      detailLoading: false,
      detail: null,
      historyVisible: false,
      historyLoading: false,
      history: { tm01: [], tm02: [], tm05: [] },
      editVisible: false,
      saving: false,
      editForm: emptyEditForm(),
      booleanFields: [
        { key: "hasThrottlingElement", label: "含节流件" },
        { key: "isChokedFlow", label: "阻塞/音速流" },
        { key: "hasReciprocatingEquipment", label: "配套往复设备" },
        { key: "hasCentrifugalEquipment", label: "配套离心设备" },
        { key: "hasFlashingCavitation", label: "闪蒸/空化" },
        { key: "hasThermowellProbe", label: "热电偶/取样探头" },
        { key: "hasDeadBranch", label: "封闭死盲支管" },
        { key: "hasSlugFlow", label: "段塞两相流" }
      ]
    };
  },
  computed: {
    detailItems() {
      const row = this.detail || {};
      return [
        { label: "KKS", value: this.kksText(row) },
        { label: "管道名称", value: row.pipelineName || "-" },
        { label: "起止支撑", value: this.supportRange(row) },
        { label: "工作介质", value: row.workingMedium || "-" },
        { label: "介质类型", value: this.mediumTypeText(row.mediumType) },
        { label: "跨距", value: this.unitText(row.spanReference, "m") },
        { label: "外径", value: this.unitText(row.outerDiameter, "mm") },
        { label: "壁厚", value: this.unitText(row.wallThickness, "mm") },
        { label: "运行压力", value: this.unitText(row.operatingPressure, "MPa") },
        { label: "运行温度", value: this.unitText(row.operatingTemperature, "℃") },
        { label: "介质密度", value: this.unitText(row.fluidDensity, "kg/m³") },
        { label: "最大流速", value: this.unitText(row.maxVelocity, "m/s") },
        { label: "质量流量", value: this.unitText(row.massFlow, "kg/s") },
        { label: "支撑类型", value: row.supportType || "-" },
        { label: "一阶固有频率", value: this.unitText(row.naturalFrequency, "Hz") },
        { label: "Main_LOF", value: this.numberText(row.mainLof, 4) },
        { label: "风险等级", value: this.riskMeta(row.riskLevel).text },
        { label: "分析状态", value: this.analysisStatusText(row.analysisStatus) }
      ];
    }
  },
  created() {
    this.loadTree();
    this.loadPage();
  },
  methods: {
    isSuccessCode: isSuccessCode,
    unwrapList: unwrapList,
    loadTree() {
      api.getResourceDirectoryTree({ moduleType: 0 }).then(res => {
        if (!this.isSuccessCode(res && res.code)) {
          this.$message.error((res && res.msg) || "系统筛选树加载失败");
          return;
        }
        this.directoryTree = Array.isArray(res.data) ? res.data : this.unwrapList(res.data);
      }).catch(error => {
        this.$message.error(this.errorMessage(error, "系统筛选树加载失败"));
      });
    },
    loadPage() {
      this.pageLoading = true;
      api.pageLedger(this.query).then(res => {
        this.pageLoading = false;
        if (!this.isSuccessCode(res && res.code)) {
          this.$message.error((res && res.msg) || "三维台账加载失败");
          return;
        }
        const data = res.data || {};
        this.records = this.unwrapList(data);
        this.total = Number(data.total || this.records.length || 0);
      }).catch(error => {
        this.pageLoading = false;
        this.$message.error(this.errorMessage(error, "三维台账加载失败"));
      });
    },
    search() {
      this.query.current = 1;
      this.loadPage();
    },
    onCurrentChange(current) {
      this.query.current = current;
      this.loadPage();
    },
    onSizeChange(size) {
      this.query.current = 1;
      this.query.size = size;
      this.loadPage();
    },
    onSortChange(sort) {
      this.query.mainLofSort = sort.order === "ascending"
        ? "asc"
        : (sort.order === "descending" ? "desc" : "");
      this.search();
    },
    onTreeNodeClick(node) {
      this.selectedNode = node;
      const ids = this.collectAssessmentObjectIds(node);
      // 选择没有业务节点后代的普通目录时传一个不存在的占位值，避免空集合被解释为“查询全部”。
      this.query.segmentIds = ids.length ? ids : ["__EMPTY_TREE_SELECTION__"];
      this.search();
    },
    collectAssessmentObjectIds(node) {
      const ids = [];
      const visit = item => {
        if (!item) return;
        // componentType有值表示已识别的业务对象；不再限定必须为0-管道。
        if (item.componentType != null && item.id != null) {
          ids.push(String(item.id));
        }
        (item.children || []).forEach(visit);
      };
      visit(node);
      return ids;
    },
    resetTreeFilter() {
      this.selectedNode = null;
      this.query.segmentIds = null;
      if (this.$refs.directoryTree) {
        this.$refs.directoryTree.setCurrentKey(null);
      }
      this.search();
    },
    openDetail(row) {
      this.detailVisible = true;
      this.detailLoading = true;
      this.detail = Object.assign({}, row);
      draftsApi.getResourceDirectoryDetail(row.id).then(res => {
        this.detailLoading = false;
        if (this.isSuccessCode(res && res.code) && res.data) {
          this.detail = Object.assign({}, row, res.data);
        }
      }).catch(error => {
        this.detailLoading = false;
        this.$message.error(this.errorMessage(error, "管段详情加载失败"));
      });
    },
    openEdit(row) {
      this.editVisible = true;
      this.editForm = emptyEditForm();
      draftsApi.getResourceDirectoryDetail(row.id).then(res => {
        if (!this.isSuccessCode(res && res.code) || !res.data) {
          this.$message.error((res && res.msg) || "管段详情加载失败");
          return;
        }
        Object.keys(this.editForm).forEach(key => {
          if (Object.prototype.hasOwnProperty.call(res.data, key)) {
            this.$set(this.editForm, key, res.data[key]);
          }
        });
      }).catch(error => {
        this.$message.error(this.errorMessage(error, "管段详情加载失败"));
      });
    },
    saveEdit() {
      this.saving = true;
      draftsApi.updateResourceDirectory(this.editForm).then(res => {
        this.saving = false;
        if (!this.isSuccessCode(res && res.code)) {
          this.$message.error((res && res.msg) || "管段参数保存失败");
          return;
        }
        this.editVisible = false;
        this.$message.success((res && res.msg) || "管段参数保存成功");
        this.loadTree();
        this.loadPage();
      }).catch(error => {
        this.saving = false;
        this.$message.error(this.errorMessage(error, "管段参数保存失败"));
      });
    },
    locateInThreeDimension() {
      if (!this.selectedNode) {
        this.$message.info("请先在系统树中选择管段或系统节点");
        return;
      }
      this.$message.info("三维定位需要三维引擎页面配合，当前已定位到所选系统范围");
    },
    /**
     * 按原型逐条执行台账自动分析：先保存 TM01，再使用管段台账参数保存 TM02。
     * TM05 依赖小支管结构、实测振动和动应力参数，当前台账不包含这些数据，
     * 因此不能为了显示“已完成”而伪造 TM05 结果，后续由用户在 TM05 页面补充后保存。
     */
    startBatchAnalysis() {
      if (!this.records.length) {
        this.$message.warning("当前没有可分析的管段");
        return;
      }
      this.$confirm(
        "将对当前筛选范围内的全部管段逐条执行 TM01 和 TM02 自动分析并保存版本，是否继续？",
        "一键自动分析",
        { type: "warning" }
      ).then(() => {
        this.batchAnalyzing = true;
        return api.autoAnalyzeLedger(this.query);
      }).then(response => {
        this.batchAnalyzing = false;
        if (!this.isSuccessCode(response && response.code)) {
          throw new Error((response && response.msg) || "一键自动分析失败");
        }
        const summary = response.data || {};
        this.loadPage();
        this.$message({
          type: summary.skipped ? "warning" : "success",
          message: "自动分析完成：" + summary.success
            + " 条成功，" + summary.skipped + " 条因数据缺失或计算失败跳过"
        });
      }).catch(error => {
        this.batchAnalyzing = false;
        if (error !== "cancel" && error !== "close") {
          this.$message.error(this.errorMessage(error, "一键自动分析失败"));
        }
      });
    },
    syncLedger() {
      this.loadTree();
      this.loadPage();
      this.$message.success("台账数据已重新同步");
    },
    exportLedger() {
      this.$message.info("批量导出接口待接入统一报表服务");
    },
    openHistory(row) {
      this.historyVisible = true;
      this.historyLoading = true;
      this.history = { tm01: [], tm02: [], tm05: [] };
      const params = { segmentId: row.id, current: 1, size: 100 };
      Promise.all([
        api.pageHistory(params),
        api.pageTm02History(params),
        api.pageTm05History(params)
      ]).then(results => {
        this.historyLoading = false;
        this.history = {
          tm01: this.historyRecords(results[0]),
          tm02: this.historyRecords(results[1]),
          tm05: this.historyRecords(results[2])
        };
      }).catch(error => {
        this.historyLoading = false;
        this.$message.error(this.errorMessage(error, "分析历史加载失败"));
      });
    },
    historyRecords(res) {
      return this.isSuccessCode(res && res.code) ? this.unwrapList(res.data) : [];
    },
    goAssessment(moduleName, row) {
      this.$router.push({
        path: "/lof/" + moduleName,
        query: { segmentId: row.id }
      });
    },
    kksText(row) {
      return row.pipeStandardKks || row.pipelineNo || row.nodeName || "-";
    },
    supportRange(row) {
      const start = row.startPoint || "-";
      const end = row.endPoint || "-";
      return start + " → " + end;
    },
    mediumTypeText(value) {
      const labels = ["单相蒸汽", "单相水", "气液两相", "多相流"];
      return value == null ? "-" : (labels[Number(value)] || "-");
    },
    analysisStatusText(value) {
      const labels = ["待分析", "已完成TM01", "已完成TM02", "已完成TM05"];
      return labels[Number(value)] || "待分析";
    },
    riskMeta(level) {
      if (level == null || level === "") {
        return { text: "NA", className: "badge-na" };
      }
      const map = {
        0: { text: "Low", className: "badge-low" },
        1: { text: "Medium", className: "badge-medium" },
        2: { text: "High", className: "badge-high" }
      };
      return map[Number(level)] || { text: "NA", className: "badge-na" };
    },
    numberText(value, digits) {
      if (value == null || value === "") return "-";
      const number = Number(value);
      return isFinite(number) ? number.toFixed(digits == null ? 2 : digits) : "-";
    },
    unitText(value, unit) {
      return value == null || value === "" ? "-" : value + " " + unit;
    },
    errorMessage(error, fallback) {
      const data = error && error.response && error.response.data;
      return (data && data.msg) || (error && error.msg) || fallback;
    }
  }
};
</script>

<style scoped>
.lof-ledger {
  height: calc(100vh - 90px);
  min-height: 560px;
}

.ledger-layout {
  display: flex;
  height: 100%;
  gap: 10px;
}

.ledger-tree-card {
  display: flex;
  width: 280px;
  flex: 0 0 280px;
  flex-direction: column;
}

.ledger-tree-body {
  flex: 1;
  overflow: auto;
}

.ledger-table-card {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
}

.ledger-toolbar {
  gap: 12px;
  flex-wrap: wrap;
}

.ledger-actions {
  display: flex;
  gap: 6px;
}

.ledger-filters {
  display: flex;
  min-width: 0;
  flex: 1;
  justify-content: flex-end;
  gap: 8px;
}

.ledger-filters .el-input {
  width: 250px;
}

.ledger-filters .el-select {
  width: 145px;
}

.ledger-table-body {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
}

.ledger-table-body .el-table {
  flex: 1;
}

.ledger-pagination {
  padding-top: 14px;
  text-align: right;
}

.ledger-drawer-body {
  padding: 0 20px 24px;
}

.ledger-detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.ledger-detail-item {
  padding: 10px 12px;
  border: 1px solid #e0e4ea;
  border-radius: 6px;
}

.ledger-detail-label {
  color: #5f6b7a;
  font-size: 12px;
}

.ledger-detail-value {
  margin-top: 4px;
  color: #1a202c;
  font-size: 14px;
  word-break: break-word;
}

.ledger-missing {
  color: #d32f2f;
  border-left-color: #d32f2f;
  background: #ffebee;
}

@media (max-width: 1200px) {
  .ledger-layout {
    height: auto;
    flex-direction: column;
  }

  .ledger-tree-card {
    width: 100%;
    max-height: 280px;
    flex-basis: auto;
  }

  .ledger-table-card {
    min-height: 620px;
  }

  .ledger-toolbar,
  .ledger-filters,
  .ledger-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .ledger-filters .el-input,
  .ledger-filters .el-select {
    width: 100%;
  }
}
</style>
