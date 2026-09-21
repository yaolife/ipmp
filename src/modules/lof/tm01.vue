<template>
  <div class="cud-commom-form-style">
    <div class="cud__scroll--div">
      <div class="lof-page" v-loading="pageLoading">
        <div class="card">
          <div class="card-header">
            <div class="card-title">评估设置</div>
          </div>
          <div class="card-body">
            <div class="form-row lof-form-row-4">
              <div class="form-group form-group-active-select">
                <label>管段选择</label>
                <el-select
                  v-model="segmentId"
                  filterable
                  clearable
                  placeholder="请选择管段"
                  size="small"
                  style="width: 100%"
                  @change="onSegmentChange"
                >
                  <el-option
                    v-for="item in segments"
                    :key="item.id"
                    :label="segmentLabel(item)"
                    :value="item.id"
                  ></el-option>
                </el-select>
              </div>
              <div class="form-group">
                <label>评估类型</label>
                <div class="radio-group">
                  <input id="modeNew" type="radio" value="new" v-model="assessmentType" @change="onAssessmentTypeChange">
                  <label for="modeNew">new（新设计/新建管线）</label>
                  <input id="modeOperate" type="radio" value="operate" v-model="assessmentType" @change="onAssessmentTypeChange">
                  <label for="modeOperate">operate（在役运行机组管线）</label>
                </div>
              </div>
              <div class="form-group">
                <label>当前管段 Main_LOF</label>
                <input type="text" :value="mainLofText" readonly>
              </div>
              <div class="form-group">
                <label>支撑类型</label>
                <input type="text" :value="supportText" readonly>
              </div>
            </div>
            <div class="mt-12" style="display: flex; gap: 8px; align-items: center">
              <el-button
                type="primary"
                size="small"
                :loading="evaluating"
                :disabled="!segmentId || saving"
                @click="evaluate"
              >执行定性评估</el-button>
              <el-button
                type="success"
                size="small"
                :loading="saving"
                :disabled="!segmentId || evaluating"
                @click="save"
              >保存评估版本</el-button>
              <span class="text-sm text-muted">执行评估只预览结果，保存时由后端重新计算并生成版本历史。</span>
            </div>
            <div class="help-text mt-12" v-if="missingFields.length">
              当前管段缺少以下参数，补充完成后才能执行评估：{{ missingFields.join('、') }}
            </div>
          </div>
        </div>

        <div class="grid lof-grid-2">
          <div class="card">
            <div class="card-header">
              <div class="card-title">10 项激励评分</div>
            </div>
            <div class="card-body">
              <div
                class="score-card"
                v-for="(item, index) in incentives"
                :key="item.id"
              >
                <div class="score-header">
                  <div class="score-name" @click="openIncentiveDrawer(item)">
                    激励{{ index + 1 }}: {{ item.name }}
                  </div>
                  <div class="flex gap-8">
                    <div>
                      自动：
                      <span class="badge" :class="scoreClass(autoScore(item.id))">
                        {{ displayScore(autoScore(item.id)) }}
                      </span>
                    </div>
                    <div class="flex gap-4">
                      <span>修正：</span>
                      <select
                        class="score-select"
                        :value="currentScore(item.id)"
                        @change="onManualScoreChange(item, $event)"
                      >
                        <option value="" disabled>请评估</option>
                        <option
                          v-for="opt in scoreOptions"
                          :key="opt.value"
                          :value="opt.value"
                        >{{ opt.label }}</option>
                      </select>
                      <button
                        v-if="hasManualScore(item.id)"
                        class="btn btn-xs btn-secondary"
                        type="button"
                        @click="clearManualScore(item)"
                      >恢复自动</button>
                    </div>
                  </div>
                </div>
                <div class="score-reason" @click="openIncentiveDrawer(item)">
                  判定依据：{{ incentiveReason(item.id) }}
                </div>
              </div>
            </div>
          </div>

          <div>
            <div class="card">
              <div class="card-header">
                <div class="card-title">C1~C4 工况因子（只读）</div>
              </div>
              <div class="card-body">
                <div class="form-row">
                  <div
                    class="form-group"
                    v-for="item in conditions"
                    :key="item.id"
                    style="cursor: pointer"
                    @click="openConditionDrawer(item)"
                  >
                    <label>{{ item.id.toUpperCase() }}：{{ item.name }}</label>
                    <input type="text" :value="conditionText(item)" readonly style="cursor: pointer">
                  </div>
                </div>
                <div class="help-text mt-12">
                  工况因子取自管道台账、腐蚀管理台账、运行工况库及年度运行记录，用于修正最终风险等级。
                </div>
              </div>
            </div>

            <div class="card">
              <div class="card-header">
                <div class="card-title">统计与定级</div>
              </div>
              <div class="card-body">
                <div class="result-box">
                  <div class="result-item" @click="openLevelDrawer">
                    <div class="label">风险等级</div>
                    <div class="value">
                      <span class="badge" :class="riskMeta(result.riskLevel).cls">
                        {{ riskMeta(result.riskLevel).text }}
                      </span>
                    </div>
                  </div>
                  <div class="result-item">
                    <div class="label">版本号</div>
                    <div class="value">{{ result.versionNo != null ? 'V' + result.versionNo : '-' }}</div>
                  </div>
                  <div class="result-item">
                    <div class="label">是否需定量</div>
                    <div class="value">{{ quantitativeText }}</div>
                  </div>
                  <div class="result-item">
                    <div class="label">高/中/低计数</div>
                    <div class="value">{{ scoreCounts.high }} / {{ scoreCounts.medium }} / {{ scoreCounts.low }}</div>
                  </div>
                </div>
                <div class="mt-12" v-if="result.quantitativeRequired">
                  <router-link class="btn btn-primary" :to="tm02Route">执行定量评估</router-link>
                </div>
              </div>
            </div>

            <div class="card">
              <div class="card-header">
                <div class="card-title">需定量评估的激励机制</div>
              </div>
              <div class="card-body">
                <div class="help-text" v-if="!requiredMechanisms.length">暂无需定量评估的激励项</div>
                <div v-else>
                  <span
                    class="badge badge-high"
                    style="margin: 0 6px 6px 0"
                    v-for="(name, idx) in requiredMechanisms"
                    :key="idx"
                  >{{ name }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-title">版本历史</div>
          </div>
          <div class="card-body">
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>版本</th>
                    <th>时间</th>
                    <th>管段</th>
                    <th>操作人</th>
                    <th>等级</th>
                    <th>备注</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="!history.length">
                    <td colspan="6" class="text-muted">暂无历史记录</td>
                  </tr>
                  <tr
                    v-for="row in history"
                    :key="row.id"
                    :class="{ active: result.id === row.id }"
                    @click="loadHistory(row)"
                  >
                    <td>{{ row.versionNo != null ? 'V' + row.versionNo : '-' }}</td>
                    <td>{{ row.createDate || '-' }}</td>
                    <td>{{ segmentLabelById(row.segmentId) }}</td>
                    <td>{{ row.createUserName || row.createUserNo || '-' }}</td>
                    <td>
                      <span class="badge" :class="riskMeta(row.riskLevel).cls">
                        {{ riskMeta(row.riskLevel).text }}
                      </span>
                    </td>
                    <td>{{ remarksText(row.remarks) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="mt-12" style="text-align: right" v-if="historyTotal > historySize">
              <el-pagination
                small
                layout="prev, pager, next"
                :current-page="historyCurrent"
                :page-size="historySize"
                :total="historyTotal"
                @current-change="onHistoryPageChange"
              ></el-pagination>
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-dialog title="填写修正备注" :visible.sync="remarkVisible" width="480px" append-to-body>
      <el-form label-width="90px" size="small">
        <el-form-item label="激励项">
          <el-input :value="pendingRemark.name" disabled></el-input>
        </el-form-item>
        <el-form-item label="修正分值">
          <el-input :value="pendingRemark.score" disabled></el-input>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            type="textarea"
            :rows="4"
            v-model="pendingRemark.text"
            placeholder="请说明修正依据..."
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button size="small" @click="cancelRemark">取消</el-button>
        <el-button type="primary" size="small" @click="confirmRemark">确认</el-button>
      </div>
    </el-dialog>

    <lof-trace-drawer
      :visible.sync="drawerVisible"
      :trace="drawerTrace"
    ></lof-trace-drawer>
  </div>
</template>

<script>
import LofTraceDrawer from "./components/LofTraceDrawer";
import api from "./api";
import { calculateSupportType } from "./utils";
import {
  INCENTIVES,
  CONDITIONS,
  SCORE_OPTIONS,
  scoreClass,
  riskMeta
} from "./constants";
import "./lof.css";

function emptyResult() {
  return {
    id: "",
    versionNo: null,
    riskLevel: null,
    quantitativeRequired: false,
    requiredMechanisms: [],
    autoScores: {},
    manualScores: {},
    conditionScores: {},
    remarks: {},
    calculationDetail: {}
  };
}

const INCENTIVE_RULES = {
  s1: "ρv²＜5000为低，5000≤ρv²＜20000为中，ρv²≥20000为高。",
  s2: "存在阻塞或音速流为高；仅存在节流件为中；两者均不存在为低。",
  s3: "配套往复泵、压缩机、柴油机等往复设备为高，否则为低。",
  s4: "配套往复设备时存在往复流体脉动激励，判定为高，否则为低。",
  s5: "配套离心设备且低流量运行占比大于30%为中，否则为低。",
  s6: "存在空化或闪蒸可能为高，否则为低。",
  s7: "存在快开或快关阀门为高，否则为低。",
  s8: "存在热电偶套管或取样探头等侵入元件为高，否则为低。",
  s9: "存在段塞两相流为高，否则为低。",
  s10: "无历史记录为低；轻微异响为中；疲劳、泄漏或剧烈振动为高。"
};

const CONDITION_RULES = {
  c1: "施工制造标准等级按照管道制造、焊接和检验标准综合确定。",
  c2: "腐蚀与介质侵蚀管控等级按照腐蚀管理和防护状态确定。",
  c3: "周期性间歇负荷等级按照运行模式和负荷波动情况确定。",
  c4: "年度启停与工况切换等级按照年度启停频次确定。"
};

export default {
  components: { LofTraceDrawer },
  data() {
    return {
      incentives: INCENTIVES,
      conditions: CONDITIONS,
      scoreOptions: SCORE_OPTIONS,
      segments: [],
      segmentId: "",
      assessmentType: "new",
      currentSegment: null,
      mainLof: null,
      result: emptyResult(),
      history: [],
      historyCurrent: 1,
      historySize: 10,
      historyTotal: 0,
      pageLoading: false,
      evaluating: false,
      saving: false,
      remarkVisible: false,
      pendingRemark: { id: "", name: "", score: "", text: "", prev: 1 },
      drawerVisible: false,
      drawerTrace: { title: "计算追溯详情", sections: [] }
    };
  },
  computed: {
    mainLofText() {
      if (this.mainLof == null || this.mainLof === "") return "-";
      const value = Number(this.mainLof);
      return isFinite(value) ? value.toFixed(4) : "-";
    },
    supportText() {
      const seg = this.currentSegment || {};
      const calculated = calculateSupportType(
        seg.spanReference != null ? seg.spanReference : seg.spanActual,
        seg.outerDiameter != null ? seg.outerDiameter : seg.od
      );
      if (calculated) return calculated + "（自动判定）";
      const stored = (
        seg.supportType ||
        seg.support ||
        seg.hangerType ||
        seg.stiffnessGrade ||
        ""
      );
      if (stored) return stored;
      return "-";
    },
    missingFields() {
      const segment = this.currentSegment;
      if (!segment) return [];
      const fields = [
        ["fluidDensity", "介质密度"],
        ["maxVelocity", "最大流速"],
        ["isChokedFlow", "阻塞或音速流"],
        ["hasThrottlingElement", "节流件"],
        ["hasReciprocatingEquipment", "往复设备"],
        ["hasCentrifugalEquipment", "离心设备"],
        ["lowFlowRatio", "低流量运行占比"],
        ["hasFlashingCavitation", "闪蒸或空化"],
        ["fastActingValveType", "快动阀类型"],
        ["hasThermowellProbe", "热电偶或取样探头"],
        ["hasSlugFlow", "段塞两相流"],
        ["vibrationFailureHistory", "历史振动失效"],
        ["c1Level", "C1施工制造标准等级"],
        ["c2Level", "C2腐蚀侵蚀管控等级"],
        ["c3Level", "C3周期负荷波动等级"],
        ["c4Level", "C4启停频次等级"]
      ];
      return fields
        .filter(item => segment[item[0]] == null || segment[item[0]] === "")
        .map(item => item[1]);
    },
    quantitativeText() {
      if (this.result.riskLevel == null && !this.result.id) return "-";
      if (this.result.quantitativeRequired === true) return "是";
      if (this.result.quantitativeRequired === false) return "否";
      return "-";
    },
    requiredMechanisms() {
      const list = this.result.requiredMechanisms;
      if (!Array.isArray(list)) return [];
      return list.map(id => {
        const item = this.incentives.find(incentive => incentive.id === id);
        return item ? id.toUpperCase() + " " + item.name : id;
      });
    },
    tm02Route() {
      return {
        path: "/lof/tm02",
        query: this.segmentId ? { segmentId: this.segmentId } : {}
      };
    },
    scoreCounts() {
      let high = 0;
      let medium = 0;
      let low = 0;
      this.incentives.forEach(item => {
        const score = Number(this.currentScore(item.id));
        if (score === 3) high += 1;
        else if (score === 2) medium += 1;
        else if (score === 1) low += 1;
      });
      return { high, medium, low };
    }
  },
  created() {
    this.loadSegments();
  },
  /**
   * 多页签使用 keep-alive 缓存页面；重新切回 TM01 时刷新关联的最新评估结果。
   * 这样在其他页签保存 TM02 新版本后，当前管段 Main_LOF 不会继续显示旧版本值。
   */
  activated() {
    if (!this.segmentId) return;
    this.loadLatestMainLof();
    this.loadHistoryPage();
  },
  methods: {
    scoreClass,
    riskMeta,
    isSuccessCode(code) {
      return code === 0 || code === "0";
    },
    errorMessage(error, fallback) {
      const data = error && error.response && error.response.data;
      return (data && data.msg) || (error && error.msg) || fallback;
    },
    segmentLabel(item) {
      if (!item) return "-";
      if (item.labelPath) return item.labelPath;
      const no = item.pipelineNo || item.segmentNo || item.nodeName || item.kks || "";
      const name = item.pipelineName || item.segmentName || item.name || "";
      if (no && name && no !== name) return no + "（" + name + "）";
      return no || name || item.id || "-";
    },
    flattenDirectoryNodes(nodes, path) {
      const list = [];
      (nodes || []).forEach(node => {
        if (!node) return;
        const name = node.nodeName || node.pipelineName || node.name || "";
        const nextPath = path ? (name ? path + " / " + name : path) : name;
        const children = Array.isArray(node.children) ? node.children : [];
        const isLeaf = !children.length;
        const isLevel5 = Number(node.levelNo) === 5;
        const nameText = String(node.nodeName || "").trim();
        if (
          (isLeaf || isLevel5) &&
          node.id != null &&
          node.id !== "" &&
          nameText &&
          nameText !== "0"
        ) {
          list.push(
            Object.assign({}, node, {
              id: String(node.id),
              labelPath: nextPath || String(node.id)
            })
          );
        }
        if (children.length) {
          list.push.apply(list, this.flattenDirectoryNodes(children, nextPath));
        }
      });
      return list;
    },
    segmentLabelById(id) {
      const found = this.segments.find(item => item.id === id);
      return found ? this.segmentLabel(found) : id || "-";
    },
    unwrapList(data) {
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.records)) return data.records;
      if (data && Array.isArray(data.list)) return data.list;
      return [];
    },
    autoScore(id) {
      const scores = this.result.autoScores || {};
      return scores[id];
    },
    currentScore(id) {
      const manual = (this.result.manualScores || {})[id];
      if (manual != null && manual !== "") return Number(manual);
      const auto = this.autoScore(id);
      if (auto != null && auto !== "") return Number(auto);
      return "";
    },
    hasManualScore(id) {
      const manual = this.result.manualScores || {};
      return manual[id] != null && manual[id] !== "";
    },
    displayScore(score) {
      return score == null || score === "" ? "-" : score;
    },
    incentiveReason(id) {
      const remarks = (this.result.remarks || {})[id];
      if (remarks) return "人工修正：" + remarks;
      const detail = this.result.calculationDetail || {};
      const item = detail[id];
      if (item && typeof item === "object") {
        return item.reason || item.rule || item.desc || JSON.stringify(item);
      }
      if (typeof item === "string") return item;
      if (this.autoScore(id) == null) return "执行评估后显示自动判定依据";
      return this.autoScoreReason(id);
    },
    autoScoreReason(id) {
      const segment = this.currentSegment || {};
      const value = this.autoScore(id);
      const yes = code => Number(code) === 1;
      const reasons = {
        s1: "介质密度 × 最大流速²决定流动湍流等级",
        s2: yes(segment.isChokedFlow)
          ? "存在阻塞或音速流"
          : (yes(segment.hasThrottlingElement) ? "存在节流件" : "未识别阻塞流或节流件"),
        s3: yes(segment.hasReciprocatingEquipment) ? "配套往复设备" : "未配套往复设备",
        s4: yes(segment.hasReciprocatingEquipment) ? "配套往复设备，存在流体脉动激励" : "未配套往复设备",
        s5: yes(segment.hasCentrifugalEquipment)
          ? "配套离心设备，结合低流量运行占比判断"
          : "未配套离心设备",
        s6: yes(segment.hasFlashingCavitation) ? "存在闪蒸或空化" : "未识别闪蒸或空化",
        s7: Number(segment.fastActingValveType) > 0 ? "存在快动阀" : "未识别快动阀",
        s8: yes(segment.hasThermowellProbe) ? "存在热电偶或取样探头" : "未识别侵入元件",
        s9: yes(segment.hasSlugFlow) ? "存在段塞两相流" : "未识别段塞两相流",
        s10: "根据历史振动失效等级判断"
      };
      return (reasons[id] || "后端规则自动判定") + "，自动评分 " + value;
    },
    conditionText(item) {
      const score = (this.result.conditionScores || {})[item.id];
      if (score == null || score === "") return "来源：" + item.source;
      return score + "（来源：" + item.source + "）";
    },
    remarksText(remarks) {
      if (!remarks) return "-";
      if (typeof remarks === "string") return remarks || "-";
      const values = Object.keys(remarks)
        .map(key => remarks[key])
        .filter(Boolean);
      return values.length ? values.join("；") : "-";
    },
    buildPayload() {
      const manualScores = {};
      const remarks = {};
      const auto = this.result.autoScores || {};
      const manual = this.result.manualScores || {};
      const remarkMap = this.result.remarks || {};
      this.incentives.forEach(item => {
        if (manual[item.id] != null && Number(manual[item.id]) !== Number(auto[item.id])) {
          manualScores[item.id] = Number(manual[item.id]);
        }
        if (remarkMap[item.id]) remarks[item.id] = remarkMap[item.id];
      });
      const payload = {
        segmentId: this.segmentId,
        assessmentType: this.assessmentType
      };
      if (Object.keys(manualScores).length) payload.manualScores = manualScores;
      if (Object.keys(remarks).length) payload.remarks = remarks;
      return payload;
    },
    applyResult(data) {
      const next = emptyResult();
      if (!data) {
        this.result = next;
        return;
      }
      next.id = data.id || "";
      next.versionNo = data.versionNo;
      next.riskLevel = data.riskLevel;
      next.quantitativeRequired = data.quantitativeRequired;
      next.requiredMechanisms = data.requiredMechanisms || [];
      next.autoScores = data.autoScores || {};
      next.manualScores = data.manualScores || {};
      next.conditionScores = data.conditionScores || {};
      next.remarks = data.remarks || {};
      next.calculationDetail = data.calculationDetail || {};
      this.result = next;
    },
    loadSegments() {
      this.pageLoading = true;
      api
        .getResourceDirectoryTree({ componentType: 0 })
        .then(res => {
          this.pageLoading = false;
          if (!this.isSuccessCode(res && res.code)) {
            this.$message.error((res && res.msg) || "管段列表加载失败");
            return;
          }
          const tree = Array.isArray(res.data) ? res.data : this.unwrapList(res.data);
          this.segments = this.flattenDirectoryNodes(tree, "");
          const routeQuery = (this.$route && this.$route.query) || {};
          const requestedId = routeQuery.segmentId || routeQuery.segment;
          if (requestedId && this.segments.some(item => item.id === String(requestedId))) {
            this.segmentId = String(requestedId);
            this.onSegmentChange(this.segmentId);
          }
        })
        .catch(error => {
          this.pageLoading = false;
          this.$message.error(this.errorMessage(error, "管段列表加载失败"));
        });
    },
    onSegmentChange(id) {
      this.currentSegment = this.segments.find(item => item.id === id) || null;
      this.applyResult(null);
      this.history = [];
      this.historyTotal = 0;
      this.historyCurrent = 1;
      this.mainLof = null;
      if (!id) return;
      api
        .getResourceDirectoryDetail(id)
        .then(res => {
          if (this.isSuccessCode(res && res.code) && res.data) {
            this.currentSegment = Object.assign({}, this.currentSegment || {}, res.data);
          }
        })
        .catch(error => {
          this.$message.error(this.errorMessage(error, "管段详情加载失败"));
        });
      this.loadLatestMainLof();
      this.loadHistoryPage();
    },
    onAssessmentTypeChange() {
      this.applyResult(null);
    },
    evaluate() {
      if (!this.segmentId) {
        this.$message.warning("请选择管段");
        return;
      }
      this.evaluating = true;
      api
        .evaluate(this.buildPayload())
        .then(res => {
          this.evaluating = false;
          if (!this.isSuccessCode(res && res.code)) {
            this.$message.error((res && res.msg) || "评估失败");
            return;
          }
          this.applyResult(res.data);
          this.$message.success((res && res.msg) || "评估完成");
          this.loadHistoryPage();
        })
        .catch(error => {
          this.evaluating = false;
          this.$message.error(this.errorMessage(error, "评估失败"));
        });
    },
    save() {
      if (!this.segmentId) {
        this.$message.warning("请选择管段");
        return;
      }
      this.$confirm("保存后将生成新的定性评估版本，是否继续？", "保存确认", {
        type: "warning"
      }).then(() => {
        this.saving = true;
        return api.save(this.buildPayload());
      }).then(res => {
        this.saving = false;
        if (!this.isSuccessCode(res && res.code)) {
          this.$message.error((res && res.msg) || "保存失败");
          return;
        }
        this.applyResult(res.data);
        this.$message.success((res && res.msg) || "保存成功");
        this.historyCurrent = 1;
        this.loadHistoryPage();
      }).catch(error => {
        this.saving = false;
        if (error !== "cancel" && error !== "close") {
          this.$message.error(this.errorMessage(error, "保存失败"));
        }
      });
    },
    loadLatestMainLof() {
      if (!this.segmentId) {
        this.mainLof = null;
        return;
      }
      api.pageTm02History({
        segmentId: this.segmentId,
        current: 1,
        size: 1
      }).then(res => {
        if (!this.isSuccessCode(res && res.code)) return;
        const records = this.unwrapList(res.data);
        this.mainLof = records.length ? records[0].maxLof : null;
      }).catch(() => {
        this.mainLof = null;
      });
    },
    loadHistoryPage() {
      if (!this.segmentId) return;
      api
        .pageHistory({
          segmentId: this.segmentId,
          current: this.historyCurrent,
          size: this.historySize
        })
        .then(res => {
          if (!this.isSuccessCode(res && res.code)) return;
          const data = res.data || {};
          this.history = this.unwrapList(data);
          this.historyTotal = Number(data.total || this.history.length || 0);
        })
        .catch(error => {
          this.$message.error(this.errorMessage(error, "版本历史加载失败"));
        });
    },
    onHistoryPageChange(page) {
      this.historyCurrent = page;
      this.loadHistoryPage();
    },
    loadHistory(row) {
      if (!row || !row.id) return;
      api
        .getDetail(row.id)
        .then(res => {
          if (!this.isSuccessCode(res && res.code)) {
            this.$message.error((res && res.msg) || "详情加载失败");
            return;
          }
          this.applyResult(res.data);
          if (res.data && res.data.assessmentType) {
            this.assessmentType = res.data.assessmentType;
          }
        })
        .catch(error => {
          this.$message.error(this.errorMessage(error, "详情加载失败"));
        });
    },
    onManualScoreChange(item, event) {
      const next = Number(event.target.value);
      const prev = this.currentScore(item.id);
      event.target.value = prev;
      this.pendingRemark = {
        id: item.id,
        name: item.name,
        score: next,
        text: (this.result.remarks || {})[item.id] || "",
        prev: prev
      };
      this.remarkVisible = true;
    },
    cancelRemark() {
      this.remarkVisible = false;
      this.pendingRemark = { id: "", name: "", score: "", text: "", prev: 1 };
    },
    confirmRemark() {
      const text = (this.pendingRemark.text || "").trim();
      if (!text) {
        this.$message.warning("备注为必填项");
        return;
      }
      const id = this.pendingRemark.id;
      this.$set(this.result.manualScores, id, Number(this.pendingRemark.score));
      this.$set(this.result.remarks, id, text);
      this.remarkVisible = false;
      this.invalidateEvaluationResult();
    },
    clearManualScore(item) {
      if (!item) return;
      this.$delete(this.result.manualScores, item.id);
      this.$delete(this.result.remarks, item.id);
      this.invalidateEvaluationResult();
    },
    /**
     * 保留用户人工修正内容并清除旧的综合结果，等待用户主动执行后端评估。
     */
    invalidateEvaluationResult() {
      this.result.id = "";
      this.result.versionNo = null;
      this.result.riskLevel = null;
      this.result.quantitativeRequired = false;
      this.result.requiredMechanisms = [];
      this.result.conditionScores = {};
      this.result.calculationDetail = {};
    },
    scoreText(score) {
      const labels = { 1: "Low（低）", 2: "Medium（中）", 3: "High（高）" };
      return labels[Number(score)] || "-";
    },
    incentiveParameterRows(id) {
      const segment = this.currentSegment || {};
      const yesNo = value => value == null ? "-" : (Number(value) === 1 ? "是" : "否");
      const rows = {
        s1: [
          { label: "介质密度 ρ", value: segment.fluidDensity == null ? "-" : segment.fluidDensity + " kg/m³" },
          { label: "最大流速 v", value: segment.maxVelocity == null ? "-" : segment.maxVelocity + " m/s" },
          { label: "ρv²", value: segment.fluidDensity != null && segment.maxVelocity != null
            ? (Number(segment.fluidDensity) * Math.pow(Number(segment.maxVelocity), 2)).toFixed(4)
            : "-" }
        ],
        s2: [
          { label: "是否含节流件", value: yesNo(segment.hasThrottlingElement) },
          { label: "是否阻塞或音速流", value: yesNo(segment.isChokedFlow) }
        ],
        s3: [{ label: "是否配套往复设备", value: yesNo(segment.hasReciprocatingEquipment) }],
        s4: [{ label: "是否配套往复设备", value: yesNo(segment.hasReciprocatingEquipment) }],
        s5: [
          { label: "是否配套离心设备", value: yesNo(segment.hasCentrifugalEquipment) },
          { label: "低流量运行占比", value: segment.lowFlowRatio == null ? "-" : segment.lowFlowRatio + "%" }
        ],
        s6: [{ label: "是否存在闪蒸或空化", value: yesNo(segment.hasFlashingCavitation) }],
        s7: [{ label: "快动阀类型编码", value: segment.fastActingValveType }],
        s8: [{ label: "是否存在热电偶或取样探头", value: yesNo(segment.hasThermowellProbe) }],
        s9: [{ label: "是否存在段塞两相流", value: yesNo(segment.hasSlugFlow) }],
        s10: [{ label: "历史振动失效等级", value: segment.vibrationFailureHistory }]
      };
      return rows[id] || [];
    },
    openIncentiveDrawer(item) {
      const autoScore = this.autoScore(item.id);
      const manualScore = (this.result.manualScores || {})[item.id];
      const effectiveScore = this.currentScore(item.id);
      this.drawerTrace = {
        title: item.name + " 判定详情",
        sections: [
          { title: "判定规则", text: INCENTIVE_RULES[item.id] || "按照管段台账参数自动判定。" },
          { title: "数据来源", rows: [{ label: "来源", value: "PIMS_DATA_RESOURCE_DIRECTORY 管段台账" }] },
          { title: "读取的自动参数", rows: this.incentiveParameterRows(item.id) },
          {
            title: "本次判定过程",
            text: this.incentiveReason(item.id) + "；自动评分=" + this.displayScore(autoScore)
          },
          {
            title: "当前结果",
            rows: [
              { label: "自动评分", value: this.displayScore(autoScore) + " / " + this.scoreText(autoScore) },
              { label: "人工修正", value: manualScore == null ? "未修正" : manualScore + " / " + this.scoreText(manualScore) },
              { label: "最终采用", value: this.displayScore(effectiveScore) + " / " + this.scoreText(effectiveScore) },
              { label: "修正说明", value: (this.result.remarks || {})[item.id] || "-" }
            ]
          }
        ]
      };
      this.drawerVisible = true;
    },
    openConditionDrawer(item) {
      const score = (this.result.conditionScores || {})[item.id];
      const segment = this.currentSegment || {};
      const fieldMap = {
        c1: [{ label: "制造标准", value: segment.manufacturingStandard }, { label: "C1等级", value: segment.c1Level }],
        c2: [{ label: "C2腐蚀侵蚀管控等级", value: segment.c2Level }],
        c3: [{ label: "周期性操作说明", value: segment.periodicOperation }, { label: "C3周期负荷等级", value: segment.c3Level }],
        c4: [
          { label: "年启停次数", value: segment.annualStartStops },
          { label: "年非计划停运次数", value: segment.annualUnplannedStops },
          { label: "年快阀动作次数", value: segment.annualFastValveActions },
          { label: "C4启停频次等级", value: segment.c4Level }
        ]
      };
      this.drawerTrace = {
        title: item.id.toUpperCase() + " " + item.name,
        sections: [
          { title: "判定规则", text: CONDITION_RULES[item.id] },
          { title: "数据来源", rows: [{ label: "来源", value: item.source }] },
          { title: "读取参数", rows: fieldMap[item.id] || [] },
          { title: "当前结果", rows: [{ label: "工况评分", value: this.displayScore(score) + " / " + this.scoreText(score) }] }
        ]
      };
      this.drawerVisible = true;
    },
    openLevelDrawer() {
      const detail = this.result.calculationDetail || {};
      const effective = detail.effectiveScores || {};
      this.drawerTrace = {
        title: "整体等级计算详情",
        sections: [
          {
            title: "定级规则",
            text: detail.rule || "High优先于Medium，C1～C4最高档计入综合等级；S1～S9评分为2或3时建议进入定量评估。"
          },
          {
            title: "评分统计",
            rows: [
              { label: "High数量", value: detail.highCount },
              { label: "Medium数量", value: detail.mediumCount },
              { label: "C1～C4最高档", value: detail.conditionMax },
              { label: "各激励最终评分", value: effective }
            ]
          },
          {
            title: "当前结果",
            rows: [
              { label: "风险等级", value: this.riskMeta(this.result.riskLevel).text },
              { label: "是否需要定量评估", value: this.quantitativeText },
              { label: "需定量评估的激励", value: this.requiredMechanisms }
            ]
          }
        ]
      };
      this.drawerVisible = true;
    }
  }
};
</script>
