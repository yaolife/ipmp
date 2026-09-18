<template>
  <div class="cud-commom-form-style">
    <div class="cud__scroll--div">
      <breadcrumb :arrayName="brand" :hasIcon="hasIcon"></breadcrumb>
      <div class="lof-page" v-loading="pageLoading">
        <div class="card">
          <div class="card-header">
            <div class="card-title">管段选择</div>
          </div>
          <div class="card-body">
            <div class="form-row form-row-3">
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
                <label>KKS 编码</label>
                <input type="text" :value="params.kks" readonly>
              </div>
              <div class="form-group">
                <label>当前风险等级</label>
                <input type="text" :value="mainLevel" readonly>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-title">定量评估参数</div>
          </div>
          <div class="card-body">
            <div class="tabs">
              <div
                class="tab"
                :class="{ active: paramTab === 'pipe' }"
                @click="paramTab = 'pipe'"
              >管段参数</div>
              <div
                class="tab"
                :class="{ active: paramTab === 'hfa' }"
                @click="paramTab = 'hfa'"
              >高频声学</div>
              <div
                class="tab"
                :class="{ active: paramTab === 'sbc' }"
                @click="paramTab = 'sbc'"
              >SBC 小管</div>
              <div
                class="tab"
                :class="{ active: paramTab === 'thermo' }"
                @click="paramTab = 'thermo'"
              >热电偶套管</div>
            </div>

            <div v-show="paramTab === 'pipe'" class="tab-panel">
              <div class="form-row form-row-equal-4">
                <div class="form-group">
                  <label>外径 OD (mm)</label>
                  <input type="number" v-model.number="params.od" @input="scheduleRecalc">
                </div>
                <div class="form-group">
                  <label>壁厚 Thickness (mm)</label>
                  <input type="number" v-model.number="params.thickness" @input="scheduleRecalc">
                </div>
                <div class="form-group">
                  <label>跨距 Span (m)</label>
                  <input type="number" step="0.1" v-model.number="params.span" @input="scheduleRecalc">
                </div>
                <div class="form-group">
                  <label>支撑类型</label>
                  <input type="text" :value="params.support" readonly>
                </div>
              </div>
              <div class="form-row form-row-equal-4">
                <div class="form-group">
                  <label>一阶固有频率 fn (Hz)</label>
                  <input type="number" step="0.1" v-model.number="params.fn" @input="scheduleRecalc">
                </div>
                <div class="form-group">
                  <label>X 计算值</label>
                  <input type="text" :value="xValue" readonly>
                </div>
                <div class="form-group">
                  <label>阈值 X1 / X2 / X3</label>
                  <input type="text" :value="xThresholdsText" readonly>
                </div>
                <div class="form-group">
                  <label>&nbsp;</label>
                  <button class="btn btn-primary" type="button" @click="recalc">重新计算</button>
                </div>
              </div>
            </div>

            <div v-show="paramTab === 'hfa'" class="tab-panel">
              <div class="form-row form-row-equal-4">
                <div class="form-group">
                  <label>压力 P (MPa)</label>
                  <input type="number" step="0.001" v-model.number="hfa.P" @input="scheduleRecalc">
                </div>
                <div class="form-group">
                  <label>温度 TP (℃)</label>
                  <input type="number" step="0.1" v-model.number="hfa.TP" @input="scheduleRecalc">
                </div>
                <div class="form-group">
                  <label>声速 c (m/s)</label>
                  <input type="number" step="0.1" v-model.number="hfa.c" @input="scheduleRecalc">
                </div>
                <div class="form-group">
                  <label>分子量 Mw</label>
                  <input type="number" v-model.number="hfa.Mw" @input="scheduleRecalc">
                </div>
              </div>
              <div class="form-row form-row-equal-4">
                <div class="form-group">
                  <label>主管外径 Dext (mm)</label>
                  <input type="number" v-model.number="hfa.Dext" @input="scheduleRecalc">
                </div>
                <div class="form-group">
                  <label>主管壁厚 T (mm)</label>
                  <input type="number" v-model.number="hfa.T" @input="scheduleRecalc">
                </div>
                <div class="form-group">
                  <label>质量流量 Q (kg/s)</label>
                  <input type="number" step="0.01" v-model.number="hfa.Q" @input="scheduleRecalc">
                </div>
                <div class="form-group">
                  <label>流体密度 ρ (kg/m³)</label>
                  <input type="number" step="0.01" v-model.number="hfa.rho" @input="scheduleRecalc">
                </div>
              </div>
              <div class="divider"></div>
              <div class="form-row form-row-equal-4">
                <div class="form-group">
                  <label>声源名称</label>
                  <input type="text" v-model="hfa.srcName" @input="scheduleRecalc">
                </div>
                <div class="form-group">
                  <label>是否为安装降噪构件的阀门</label>
                  <select v-model="hfa.hasSilencer" @change="scheduleRecalc">
                    <option :value="true">是</option>
                    <option :value="false">否</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>降噪量 (dB)</label>
                  <input type="number" v-model.number="hfa.reduction" @input="scheduleRecalc">
                </div>
                <div class="form-group">
                  <label>是否存在音速流动条件</label>
                  <select v-model="hfa.sonic" @change="scheduleRecalc">
                    <option :value="true">是</option>
                    <option :value="false">否</option>
                  </select>
                </div>
              </div>
              <div class="form-row form-row-3">
                <div class="form-group">
                  <label>上游压力 P1 (Pa)</label>
                  <input type="number" v-model.number="hfa.P1" @input="scheduleRecalc">
                </div>
                <div class="form-group">
                  <label>下游压力 P2 (Pa)</label>
                  <input type="number" v-model.number="hfa.P2" @input="scheduleRecalc">
                </div>
                <div class="form-group">
                  <label>上游温度 Te (K)</label>
                  <input type="number" step="0.1" v-model.number="hfa.Te" @input="scheduleRecalc">
                </div>
              </div>
              <div class="divider"></div>
              <div class="form-row form-row-3">
                <div class="form-group">
                  <label>支管外径 dext (mm)</label>
                  <input type="number" v-model.number="hfa.branchOd" @input="scheduleRecalc">
                </div>
                <div class="form-group">
                  <label>支管壁厚 t (mm)</label>
                  <input type="number" v-model.number="hfa.branchT" @input="scheduleRecalc">
                </div>
                <div class="form-group">
                  <label>距离 Ldis (m)</label>
                  <input type="number" step="0.001" v-model.number="hfa.Ldis" @input="scheduleRecalc">
                </div>
              </div>
              <div class="form-row form-row-2">
                <div class="form-group">
                  <label>对焊管座</label>
                  <select v-model="hfa.weldedBoss" @change="scheduleRecalc">
                    <option :value="false">否</option>
                    <option :value="true">是</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>双相钢材料</label>
                  <select v-model="hfa.duplexSteel" @change="scheduleRecalc">
                    <option :value="false">否</option>
                    <option :value="true">是</option>
                  </select>
                </div>
              </div>
              <div class="result-box mt-12" v-if="hfaResult">
                <div class="result-item" @click="openMetric('Dint', hfaResult.Dint)">
                  <div class="label">内径 Dint (mm)</div>
                  <div class="value">{{ fmt(hfaResult.Dint, 2) }}</div>
                </div>
                <div class="result-item" @click="openMetric('A', hfaResult.A)">
                  <div class="label">流通面积 A (mm²)</div>
                  <div class="value">{{ fmt(hfaResult.A, 2) }}</div>
                </div>
                <div class="result-item" @click="openMetric('v', hfaResult.v)">
                  <div class="label">流速 v (m/s)</div>
                  <div class="value">{{ fmt(hfaResult.v, 3) }}</div>
                </div>
                <div class="result-item" @click="openMetric('PWL', hfaResult.PWL)">
                  <div class="label">声源 PWL (dB)</div>
                  <div class="value">{{ fmt(hfaResult.PWL, 4) }}</div>
                </div>
                <div class="result-item" @click="openMetric('totalPWL', hfaResult.totalPWL)">
                  <div class="label">不连续点总 PWL (dB)</div>
                  <div class="value">{{ fmt(hfaResult.totalPWL, 4) }}</div>
                </div>
                <div class="result-item" @click="openMetric('LOF', hfaResult.LOF)">
                  <div class="label">高频声学 LOF</div>
                  <div class="value" style="color: var(--danger)">{{ fmt(hfaResult.LOF, 2) }}</div>
                </div>
              </div>
            </div>

            <div v-show="paramTab === 'sbc'" class="tab-panel">
              <div class="form-row form-row-2">
                <div class="form-group">
                  <label>小管类型</label>
                  <select v-model.number="sbc.type" @change="scheduleRecalc">
                    <option :value="1">Type 1：仪表引压管</option>
                    <option :value="2">Type 2：放空/排液管</option>
                    <option :value="3">Type 3：较短支管</option>
                    <option :value="4">Type 4：阀门执行机构连接管</option>
                  </select>
                </div>
              </div>
              <div class="form-row form-row-2">
                <div class="form-group">
                  <label>外径 d (mm)</label>
                  <input type="number" v-model.number="sbc.od" @input="scheduleRecalc">
                </div>
                <div class="form-group">
                  <label>壁厚 t (mm)</label>
                  <input type="number" v-model.number="sbc.t" @input="scheduleRecalc">
                </div>
              </div>
              <div class="form-row form-row-2">
                <div class="form-group">
                  <label>悬臂长度 L (mm)</label>
                  <input type="number" v-model.number="sbc.l" @input="scheduleRecalc">
                </div>
                <div class="form-group">
                  <label>支撑间距 S (mm)</label>
                  <input type="number" v-model.number="sbc.s" @input="scheduleRecalc">
                </div>
              </div>
              <div class="result-box mt-12">
                <div class="result-item">
                  <div class="label">SBC_LOF</div>
                  <div class="value">{{ fmt(sbcResult.lof, 3) }}</div>
                </div>
                <div class="result-item">
                  <div class="label">等级</div>
                  <div class="value">
                    <span class="badge" :class="riskBadgeClass(sbcResult.level)">{{ sbcResult.level }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div v-show="paramTab === 'thermo'" class="tab-panel">
              <div class="form-row form-row-2">
                <div class="form-group">
                  <label>压力 P (MPa)</label>
                  <input type="number" step="0.01" v-model.number="thermo.P" @input="scheduleRecalc">
                </div>
                <div class="form-group">
                  <label>温度 TP (℃)</label>
                  <input type="number" step="0.1" v-model.number="thermo.TP" @input="scheduleRecalc">
                </div>
              </div>
              <div class="form-row form-row-equal-4">
                <div class="form-group">
                  <label>外径 Dext (mm)</label>
                  <input type="number" v-model.number="thermo.Dext" @input="scheduleRecalc">
                </div>
                <div class="form-group">
                  <label>壁厚 T (mm)</label>
                  <input type="number" v-model.number="thermo.T" @input="scheduleRecalc">
                </div>
                <div class="form-group">
                  <label>Sch 等级</label>
                  <input type="number" step="0.1" v-model.number="thermo.Sch" @input="scheduleRecalc">
                </div>
                <div class="form-group">
                  <label>开孔补强情况</label>
                  <select v-model="thermo.reinforcement" @change="scheduleRecalc">
                    <option value="不带补强">不带补强</option>
                    <option value="带90°间隔补强">带90°间隔补强</option>
                  </select>
                </div>
              </div>
              <div class="form-row form-row-3">
                <div class="form-group">
                  <label>流体密度 ρf (kg/m³)</label>
                  <input type="number" step="0.001" v-model.number="thermo.rhoF" @input="scheduleRecalc">
                </div>
                <div class="form-group">
                  <label>流速 v (m/s)</label>
                  <input type="number" step="0.001" v-model.number="thermo.v" @input="scheduleRecalc">
                </div>
                <div class="form-group">
                  <label>粘度 μ (Pa·s)</label>
                  <input type="number" step="0.000001" v-model.number="thermo.mu" @input="scheduleRecalc">
                </div>
              </div>
              <div class="divider"></div>
              <div class="form-row form-row-2">
                <div class="form-group">
                  <label>套管类型</label>
                  <select v-model="thermo.twType" @change="scheduleRecalc">
                    <option value="straight">直型</option>
                    <option value="tapered">锥型</option>
                    <option value="stepped">台阶型</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>支撑点到尖端长度 Ltw (m)</label>
                  <input type="number" step="0.001" v-model.number="thermo.Ltw" @input="scheduleRecalc">
                </div>
              </div>
              <div class="form-row form-row-3">
                <div class="form-group">
                  <label>内孔直径 dtw (mm)</label>
                  <input type="number" v-model.number="thermo.dtw" @input="scheduleRecalc">
                </div>
                <div class="form-group">
                  <label>杨氏模量 Etw (Pa)</label>
                  <input type="number" v-model.number="thermo.Etw" @input="scheduleRecalc">
                </div>
                <div class="form-group">
                  <label>套管材料密度 ρtw (kg/m³)</label>
                  <input type="number" v-model.number="thermo.rhoTw" @input="scheduleRecalc">
                </div>
              </div>
              <div v-if="thermo.twType === 'straight'" class="form-row form-row-2">
                <div class="form-group">
                  <label>直型外径 Dtw (mm)</label>
                  <input type="number" v-model.number="thermo.Dtw" @input="scheduleRecalc">
                </div>
              </div>
              <div v-if="thermo.twType === 'tapered'" class="form-row form-row-3">
                <div class="form-group">
                  <label>底座外径 D1 (mm)</label>
                  <input type="number" v-model.number="thermo.D1" @input="scheduleRecalc">
                </div>
                <div class="form-group">
                  <label>尖端外径 D2 (mm)</label>
                  <input type="number" v-model.number="thermo.D2" @input="scheduleRecalc">
                </div>
              </div>
              <div v-if="thermo.twType === 'stepped'">
                <div class="form-row form-row-3">
                  <div class="form-group">
                    <label>底座外径 D1 (mm)</label>
                    <input type="number" v-model.number="thermo.D1" @input="scheduleRecalc">
                  </div>
                  <div class="form-group">
                    <label>尖端外径 D2 (mm)</label>
                    <input type="number" v-model.number="thermo.D2" @input="scheduleRecalc">
                  </div>
                </div>
                <div class="form-row form-row-2">
                  <div class="form-group">
                    <label>大直径段长度 L1 (m)</label>
                    <input type="number" step="0.001" v-model.number="thermo.L1" @input="scheduleRecalc">
                  </div>
                  <div class="form-group">
                    <label>小直径段长度 L2 (m)</label>
                    <input type="number" step="0.001" v-model.number="thermo.L2" @input="scheduleRecalc">
                  </div>
                </div>
              </div>
              <div class="result-box mt-12" v-if="thermoResult">
                <div class="result-item">
                  <div class="label">内径 Dint (mm)</div>
                  <div class="value">{{ fmt(thermoResult.Dint, 2) }}</div>
                </div>
                <div class="result-item">
                  <div class="label">雷诺数 Re</div>
                  <div class="value">{{ fmtExp(thermoResult.Re) }}</div>
                </div>
                <div class="result-item">
                  <div class="label">固有频率 fn (Hz)</div>
                  <div class="value">{{ fmt(thermoResult.fn, 2) }}</div>
                </div>
                <div class="result-item">
                  <div class="label">Fe / fn</div>
                  <div class="value">{{ fmt(thermoResult.FeFn, 4) }}</div>
                </div>
                <div class="result-item">
                  <div class="label">涡激 LOF</div>
                  <div class="value" style="color: var(--danger)">{{ fmt(thermoResult.LOF, 2) }}</div>
                </div>
                <div class="result-item">
                  <div class="label">风险等级</div>
                  <div class="value">
                    <span class="badge" :class="riskBadgeClass(thermoLevel)">{{ thermoLevel }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-title">激励分项 LOF</div>
          </div>
          <div class="card-body">
            <div class="grid grid-4">
              <div
                class="score-card"
                v-for="(item, index) in factors"
                :key="item.id"
                :style="factorCardStyle(item)"
                @click="openFactor(item)"
              >
                <div class="score-header">
                  <span class="score-name">激励{{ index + 1 }}: {{ item.name }}</span>
                  <span v-if="item.isMax" class="badge badge-high">最大贡献</span>
                </div>
                <div class="result-item">
                  <div class="label">LOF</div>
                  <div
                    class="value"
                    :style="{ color: item.isMax ? 'var(--danger)' : 'var(--text)', fontSize: '20px' }"
                  >{{ fmt(item.LOF, 2) }}</div>
                </div>
                <div class="score-reason">{{ item.note }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-title">综合 LOF 与管控建议</div>
          </div>
          <div class="card-body">
            <div class="result-box">
              <div class="result-item">
                <div class="label">综合 LOF</div>
                <div class="value">{{ fmt(mainLof, 2) }}</div>
              </div>
              <div class="result-item">
                <div class="label">风险等级</div>
                <div class="value">
                  <span class="badge" :class="riskBadgeClass(mainLevel)">{{ mainLevel }}</span>
                </div>
              </div>
              <div class="result-item" style="min-width: 360px">
                <div class="label">管控建议</div>
                <div class="value" style="font-size: 14px; font-weight: 500">{{ advice }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <el-drawer
        :title="drawerTitle"
        :visible.sync="drawerVisible"
        size="480px"
        append-to-body
      >
        <pre class="drawer-pre">{{ drawerBody }}</pre>
      </el-drawer>
    </div>
  </div>
</template>

<script>
import breadcrumb from "@/components/common/breadcrumb";
import directoryMixin from "./directoryMixin";
import MockData from "./calc/mockTables";
import TM02_CALC from "./calc/tm02-calc";
import {
  clone,
  num,
  pickNum,
  fmt,
  fmtExp,
  riskLevel,
  riskBadgeClass,
  controlAdvice
} from "./utils";
import "./lof.css";

const FACTOR_NOTES = {};
(MockData.tm02Factors || []).forEach(item => {
  FACTOR_NOTES[item.id] = item.note;
});

function defaultHfa() {
  const src = (MockData.tm02ValidationInputs && MockData.tm02ValidationInputs.highFreqAcoustic) || {};
  const source = (src.sources && src.sources[0]) || {};
  const dis = (src.discontinuities && src.discontinuities[0]) || {};
  return {
    P: src.P,
    TP: src.TP,
    c: src.c,
    Mw: src.Mw,
    Dext: src.Dext,
    T: src.T,
    Q: src.Q,
    rho: src.rho,
    srcName: source.name || "",
    hasSilencer: source.hasSilencer !== false,
    reduction: source.reduction,
    sonic: source.sonic !== false,
    P1: source.P1,
    P2: source.P2,
    Te: source.Te,
    branchOd: dis.branchOd,
    branchT: dis.branchT,
    Ldis: dis.Ldis,
    weldedBoss: !!dis.weldedBoss,
    duplexSteel: !!dis.duplexSteel
  };
}

function defaultThermo() {
  const src = (MockData.tm02ValidationInputs && MockData.tm02ValidationInputs.thermowell) || {};
  return clone(src);
}

function defaultParams() {
  const fit = (MockData.tm02ValidationInputs && MockData.tm02ValidationInputs.flowInducedTurbulence) || {};
  const mech = (MockData.tm02ValidationInputs && MockData.tm02ValidationInputs.mechanical) || {};
  return {
    kks: "",
    od: fit.Dext,
    thickness: fit.T,
    span: fit.Lspan,
    support: fit.support || "刚性",
    fn: fit.fn,
    rho: fit.rho,
    v: fit.v,
    pressure: fit.P,
    temperature: fit.TP,
    massFlow: fit.Q,
    viscosity: fit.mu,
    fluid: "",
    equipmentType: mech.equipmentType || "无"
  };
}

export default {
  mixins: [directoryMixin],
  components: { breadcrumb },
  data() {
    return {
      hasIcon: false,
      brand: [
        { name: "lang.analysis_govern" },
        { name: "lang.lof" },
        { name: "lang.lof_tm02" }
      ],
      paramTab: "pipe",
      params: defaultParams(),
      hfa: defaultHfa(),
      thermo: defaultThermo(),
      sbc: { type: 1, od: 21.3, t: 2.8, l: 250, s: 120 },
      factors: [],
      hfaResult: null,
      thermoResult: null,
      sbcResult: { lof: 0, level: "-" },
      mainLof: 0,
      recalcTimer: null,
      drawerVisible: false,
      drawerTitle: "",
      drawerBody: ""
    };
  },
  computed: {
    xValue() {
      const d = num(this.params.od) / 1000;
      if (!d) return "-";
      return (num(this.params.span) / d).toFixed(2);
    },
    xThresholds() {
      const od = num(this.params.od);
      if (od >= 400) return [20, 40, 60];
      if (od >= 200) return [16, 32, 48];
      return [12, 24, 36];
    },
    xThresholdsText() {
      return this.xThresholds.join(" / ");
    },
    mainLevel() {
      return riskLevel(this.mainLof);
    },
    thermoLevel() {
      return this.thermoResult ? riskLevel(this.thermoResult.LOF) : "-";
    },
    advice() {
      return controlAdvice(this.mainLof);
    }
  },
  mounted() {
    this.recalc();
  },
  beforeDestroy() {
    if (this.recalcTimer) clearTimeout(this.recalcTimer);
  },
  methods: {
    fmt: fmt,
    fmtExp: fmtExp,
    riskBadgeClass: riskBadgeClass,
    onSegmentChange(id) {
      this.loadSegmentDetail(id);
    },
    onSegmentLoaded(detail) {
      this.applySegment(detail);
      this.recalc();
    },
    applySegment(detail) {
      if (!detail) return;
      const fit = (MockData.tm02ValidationInputs && MockData.tm02ValidationInputs.flowInducedTurbulence) || {};
      const mech = (MockData.tm02ValidationInputs && MockData.tm02ValidationInputs.mechanical) || {};
      this.params.kks = detail.pipeStandardKks || detail.nodeName || detail.kks || "";
      this.params.od = pickNum(detail.outerDiameter, this.params.od || fit.Dext);
      this.params.thickness = pickNum(detail.wallThickness, this.params.thickness || fit.T);
      this.params.span = pickNum(
        detail.pipeLength || detail.length || detail.spanActual,
        this.params.span || fit.Lspan
      );
      this.params.support =
        detail.supportType ||
        detail.support ||
        detail.stiffnessGrade ||
        this.params.support ||
        fit.support ||
        "刚性";
      this.params.fn = pickNum(detail.naturalFrequency || detail.fn, this.params.fn || fit.fn);
      this.params.rho = pickNum(detail.fluidDensity, this.params.rho || fit.rho);
      this.params.v = pickNum(detail.maxVelocity || detail.velocity, this.params.v || fit.v);
      this.params.pressure = pickNum(
        detail.designPressure || detail.operatingPressure || detail.pressure,
        this.params.pressure || fit.P
      );
      this.params.temperature = pickNum(
        detail.designTemperature || detail.operatingTemperature || detail.temperature,
        this.params.temperature || fit.TP
      );
      this.params.massFlow = pickNum(detail.massFlow, this.params.massFlow || fit.Q);
      this.params.viscosity = pickNum(detail.viscosity, this.params.viscosity || fit.mu);
      this.params.fluid = detail.fluidMedium || detail.mediumName || detail.fluid || "";
      this.params.equipmentType = detail.equipmentType || this.params.equipmentType || mech.equipmentType;
      this.hfa.Dext = this.params.od;
      this.hfa.T = this.params.thickness;
      this.hfa.rho = this.params.rho;
      this.thermo.Dext = this.params.od;
      this.thermo.T = this.params.thickness;
      this.thermo.P = this.params.pressure;
      this.thermo.TP = this.params.temperature;
      this.thermo.rhoF = this.params.rho;
      this.thermo.v = this.params.v;
    },
    buildSeg() {
      const rho = num(this.params.rho);
      const v = num(this.params.v);
      return {
        id: this.segmentId,
        kks: this.params.kks,
        od: num(this.params.od),
        thickness: num(this.params.thickness),
        length: num(this.params.span),
        spanActual: num(this.params.span),
        support: this.params.support,
        fn: num(this.params.fn),
        rho: rho,
        v: v,
        rhoV2: rho * v * v,
        pressure: num(this.params.pressure),
        temperature: num(this.params.temperature),
        massFlow: num(this.params.massFlow),
        viscosity: num(this.params.viscosity),
        fluid: this.params.fluid,
        equipmentType: this.params.equipmentType
      };
    },
    buildVi() {
      const vi = clone(MockData.tm02ValidationInputs);
      vi.highFreqAcoustic = Object.assign({}, vi.highFreqAcoustic, {
        P: this.hfa.P,
        TP: this.hfa.TP,
        c: this.hfa.c,
        Mw: this.hfa.Mw,
        Dext: this.hfa.Dext,
        T: this.hfa.T,
        Q: this.hfa.Q,
        rho: this.hfa.rho,
        sources: [
          {
            name: this.hfa.srcName,
            hasSilencer: this.hfa.hasSilencer,
            reduction: this.hfa.reduction,
            Te: this.hfa.Te,
            P1: this.hfa.P1,
            P2: this.hfa.P2,
            sonic: this.hfa.sonic,
            SFF: 6
          }
        ],
        discontinuities: [
          {
            name: "GPV0001YP",
            branchOd: this.hfa.branchOd,
            branchT: this.hfa.branchT,
            Ldis: this.hfa.Ldis,
            weldedBoss: this.hfa.weldedBoss,
            duplexSteel: this.hfa.duplexSteel
          }
        ]
      });
      vi.thermowell = clone(this.thermo);
      vi.mechanical = Object.assign({}, vi.mechanical, {
        equipmentType: this.params.equipmentType
      });
      return vi;
    },
    calcSbc() {
      const type = num(this.sbc.type, 1);
      const l = num(this.sbc.l, 250);
      const d = num(this.sbc.od, 21.3);
      const t = num(this.sbc.t, 2.8);
      const s = num(this.sbc.s, 120);
      const base = l / 1000 / (d / 1000) * 0.18;
      const typeFactor = [0, 1.0, 1.1, 0.85, 1.2][type] || 1;
      const lof = Math.min(base * typeFactor * (300 / s) * (3 / t), 1.0);
      this.sbcResult = { lof: lof, level: riskLevel(lof) };
      return lof;
    },
    scheduleRecalc() {
      if (this.recalcTimer) clearTimeout(this.recalcTimer);
      this.recalcTimer = setTimeout(() => {
        this.recalc();
      }, 250);
    },
    recalc() {
      const seg = this.buildSeg();
      const vi = this.buildVi();
      const list = TM02_CALC.computeAll(seg, vi) || [];
      let maxVal = 0;
      list.forEach(item => {
        const lof = num(item.LOF);
        if (lof > maxVal) maxVal = lof;
      });
      this.factors = list.map(item =>
        Object.assign({}, item, {
          note: FACTOR_NOTES[item.id] || "",
          isMax: num(item.LOF) === maxVal && maxVal > 0
        })
      );
      this.hfaResult = TM02_CALC.computeHighFreqAcoustic(seg, vi.highFreqAcoustic);
      this.thermoResult = TM02_CALC.computeThermowell(seg, this.thermo);
      this.calcSbc();
      this.mainLof = maxVal;
    },
    factorCardStyle(item) {
      if (item.isMax) return { borderLeft: "4px solid var(--danger)", cursor: "pointer" };
      return { cursor: "pointer" };
    },
    openFactor(item) {
      this.drawerTitle = item.name + " 计算详情";
      this.drawerBody = JSON.stringify(item, null, 2);
      this.drawerVisible = true;
    },
    openMetric(name, value) {
      this.drawerTitle = "高频声学 · " + name;
      this.drawerBody = JSON.stringify({ name: name, value: value, detail: this.hfaResult }, null, 2);
      this.drawerVisible = true;
    }
  }
};
</script>
