<template>
  <div class="cud-commom-form-style">
    <div class="cud__scroll--div">
      <breadcrumb :arrayName="brand" :hasIcon="hasIcon"></breadcrumb>
      <div class="lof-page" v-loading="pageLoading">
        <div class="card">
          <div class="card-header">
            <div class="card-title">评估设置</div>
          </div>
          <div class="card-body">
            <div class="form-row lof-form-row-4">
              <div class="form-group">
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
                <div class="form-row form-row-2">
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
                  <router-link class="btn btn-primary" to="/lof/tm02">一键批量执行 TM02</router-link>
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

    <el-drawer
      :title="drawerTitle"
      :visible.sync="drawerVisible"
      size="460px"
      append-to-body
    >
      <div style="padding: 0 20px 20px">
        <pre class="drawer-pre">{{ drawerBody }}</pre>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import breadcrumb from "@/components/common/breadcrumb";
import api from "./api";
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

export default {
  components: { breadcrumb },
  data() {
    return {
      hasIcon: false,
      brand: [
        { name: "lang.analysis_govern" },
        { name: "lang.lof" },
        { name: "lang.lof_tm01" }
      ],
      incentives: INCENTIVES,
      conditions: CONDITIONS,
      scoreOptions: SCORE_OPTIONS,
      segments: [],
      segmentId: "",
      assessmentType: "new",
      currentSegment: null,
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
      drawerTitle: "",
      drawerBody: ""
    };
  },
  computed: {
    mainLofText() {
      return this.riskMeta(this.result.riskLevel).text === "-"
        ? ""
        : this.riskMeta(this.result.riskLevel).text;
    },
    supportText() {
      const seg = this.currentSegment || {};
      return (
        seg.supportType ||
        seg.support ||
        seg.hangerType ||
        seg.stiffnessGrade ||
        ""
      );
    },
    quantitativeText() {
      if (this.result.riskLevel == null && !this.result.id) return "-";
      if (this.result.quantitativeRequired === true) return "是";
      if (this.result.quantitativeRequired === false) return "否";
      return "-";
    },
    requiredMechanisms() {
      const list = this.result.requiredMechanisms;
      return Array.isArray(list) ? list : [];
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
  methods: {
    scoreClass,
    riskMeta,
    isSuccessCode(code) {
      return code === 0 || code === "0";
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
    displayScore(score) {
      return score == null || score === "" ? "-" : score;
    },
    incentiveReason(id) {
      const remarks = (this.result.remarks || {})[id];
      if (remarks) return remarks;
      const detail = this.result.calculationDetail || {};
      const item = detail[id];
      if (item && typeof item === "object") {
        return item.reason || item.rule || item.desc || JSON.stringify(item);
      }
      if (typeof item === "string") return item;
      if (this.autoScore(id) == null) return "执行评估后显示自动判定依据";
      return "自动评分 " + this.autoScore(id);
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
        .getResourceDirectoryTree()
        .then(res => {
          this.pageLoading = false;
          if (!this.isSuccessCode(res && res.code)) {
            this.$message.error((res && res.msg) || "管段列表加载失败");
            return;
          }
          const tree = Array.isArray(res.data) ? res.data : this.unwrapList(res.data);
          this.segments = this.flattenDirectoryNodes(tree, "");
        })
        .catch(() => {
          this.pageLoading = false;
          this.$message.error("管段列表加载失败");
        });
    },
    onSegmentChange(id) {
      this.currentSegment = this.segments.find(item => item.id === id) || null;
      this.applyResult(null);
      this.history = [];
      this.historyTotal = 0;
      this.historyCurrent = 1;
      if (!id) return;
      api
        .getResourceDirectoryDetail(id)
        .then(res => {
          if (this.isSuccessCode(res && res.code) && res.data) {
            this.currentSegment = Object.assign({}, this.currentSegment || {}, res.data);
          }
        })
        .catch(() => {});
      this.loadHistoryPage();
      this.evaluate();
    },
    onAssessmentTypeChange() {
      if (this.segmentId) this.evaluate();
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
        .catch(() => {
          this.evaluating = false;
          this.$message.error("评估失败");
        });
    },
    save() {
      if (!this.segmentId) {
        this.$message.warning("请选择管段");
        return;
      }
      this.saving = true;
      api
        .save(this.buildPayload())
        .then(res => {
          this.saving = false;
          if (!this.isSuccessCode(res && res.code)) {
            this.$message.error((res && res.msg) || "保存失败");
            return;
          }
          this.applyResult(res.data);
          this.$message.success((res && res.msg) || "保存成功");
          this.loadHistoryPage();
        })
        .catch(() => {
          this.saving = false;
          this.$message.error("保存失败");
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
        .catch(() => {});
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
        .catch(() => {
          this.$message.error("详情加载失败");
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
      this.evaluate();
    },
    formatDetail(value) {
      if (value == null || value === "") return "暂无计算过程";
      if (typeof value === "string") return value;
      try {
        return JSON.stringify(value, null, 2);
      } catch (e) {
        return String(value);
      }
    },
    openIncentiveDrawer(item) {
      const detail = (this.result.calculationDetail || {})[item.id];
      this.drawerTitle = item.name + " 判定详情";
      this.drawerBody = this.formatDetail(
        detail || {
          autoScore: this.autoScore(item.id),
          manualScore: (this.result.manualScores || {})[item.id],
          remark: (this.result.remarks || {})[item.id]
        }
      );
      this.drawerVisible = true;
    },
    openConditionDrawer(item) {
      const detail = (this.result.calculationDetail || {})[item.id];
      this.drawerTitle = item.id.toUpperCase() + " " + item.name;
      this.drawerBody = this.formatDetail(
        detail || {
          score: (this.result.conditionScores || {})[item.id],
          source: item.source
        }
      );
      this.drawerVisible = true;
    },
    openLevelDrawer() {
      const detail = (this.result.calculationDetail || {}).level || this.result.calculationDetail;
      this.drawerTitle = "整体等级计算详情";
      this.drawerBody = this.formatDetail(detail);
      this.drawerVisible = true;
    }
  }
};
</script>
