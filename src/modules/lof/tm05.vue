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
                <input type="text" :value="kks" readonly>
              </div>
              <div class="form-group">
                <label>当前 Main_LOF</label>
                <input type="text" :value="mainLofText" readonly>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-title">第二类小支管许用速度计算</div>
          </div>
          <div class="card-body">
            <div class="tabs">
              <div class="tab" :class="{ active: smallTab === 'input' }" @click="smallTab = 'input'">输入参数</div>
              <div class="tab" :class="{ active: smallTab === 'result' }" @click="smallTab = 'result'">中间参数与结果</div>
            </div>

            <div v-show="smallTab === 'input'" class="tab-panel">
              <div class="section-title">管段几何与集中质量</div>
              <div class="form-row form-row-equal-4" v-for="(row, index) in pipeRows" :key="'pipe-' + index">
                <div class="form-group">
                  <label>管段{{ index + 1 }} 外径 Do (mm)</label>
                  <input type="number" step="0.01" v-model.number="form.Do[index]" @input="scheduleCalc">
                </div>
                <div class="form-group">
                  <label>管段{{ index + 1 }} 壁厚 tp (mm)</label>
                  <input type="number" step="0.01" v-model.number="form.tp[index]" @input="scheduleCalc">
                </div>
                <div class="form-group">
                  <label>管段{{ index + 1 }} 长度 Lp (mm)</label>
                  <input type="number" step="1" v-model.number="form.Lp[index]" @input="scheduleCalc">
                </div>
                <div class="form-group">
                  <label>管段{{ index + 1 }} 阀门集中质量 mv (kg)</label>
                  <input type="number" step="0.01" v-model.number="form.mv[index]" @input="scheduleCalc">
                </div>
              </div>

              <div class="section-title">材料 / 流体 / 保温</div>
              <div class="form-row form-row-equal-4">
                <div class="form-group">
                  <label>管材密度 ρp (kg/m³)</label>
                  <input type="number" step="1" v-model.number="form.rho_p" @input="scheduleCalc">
                </div>
                <div class="form-group">
                  <label>流体密度 ρf (kg/m³)</label>
                  <input type="number" step="0.1" v-model.number="form.rho_f" @input="scheduleCalc">
                </div>
                <div class="form-group">
                  <label>保温层密度 ρin (kg/m³)</label>
                  <input type="number" step="1" v-model.number="form.rho_in" @input="scheduleCalc">
                </div>
                <div class="form-group">
                  <label>保温层厚度 tin (mm)</label>
                  <input type="number" step="0.1" v-model.number="form.tin" @input="scheduleCalc">
                </div>
              </div>

              <div class="section-title">焊缝 / 形状</div>
              <div class="form-row form-row-equal-4">
                <div class="form-group">
                  <label>根部焊缝 hfRoot</label>
                  <select v-model="form.hfRoot" @change="scheduleCalc">
                    <option :value="false">否</option>
                    <option :value="true">是</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>焊缝类型</label>
                  <select v-model="form.weldType" @change="scheduleCalc">
                    <option value="BUTTERFLY_WELDING">对焊</option>
                    <option value="SOCKET_WELDING">承插焊</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>端部条件</label>
                  <select v-model="form.endCondition" @change="scheduleCalc">
                    <option value="STRAIGHT">直管段</option>
                    <option value="CANTILEVER">简支悬臂</option>
                    <option value="Z_BEND">Z型弯头</option>
                    <option value="U_BEND">U型弯头</option>
                  </select>
                </div>
                <div class="form-group"></div>
              </div>

              <div class="section-title">运行参数</div>
              <div class="form-row form-row-equal-4">
                <div class="form-group">
                  <label>运行温度 (℃)</label>
                  <input type="number" step="0.1" v-model.number="form.operatingTemp" @input="scheduleCalc">
                </div>
                <div class="form-group">
                  <label>运行温度下疲劳极限 Sa_T (MPa)</label>
                  <input type="number" step="0.1" v-model.number="form.Sa_T" @input="scheduleCalc">
                </div>
                <div class="form-group"></div>
                <div class="form-group"></div>
              </div>

              <div class="section-title">默认系数</div>
              <div class="form-row form-row-equal-4">
                <div class="form-group">
                  <label>系数 C5</label>
                  <input type="number" step="0.01" v-model.number="form.C5" @input="scheduleCalc">
                </div>
                <div class="form-group">
                  <label>峰值/RMS 换算系数 C0</label>
                  <input type="number" step="0.01" v-model.number="form.C0" @input="scheduleCalc">
                </div>
                <div class="form-group">
                  <label>系数 β</label>
                  <input type="number" step="0.01" v-model.number="form.beta" @input="scheduleCalc">
                </div>
                <div class="form-group"></div>
              </div>

              <div class="section-title">实测速度（用于超标判定）</div>
              <div class="form-row form-row-equal-4">
                <div class="form-group">
                  <label>实测峰值速度 Vpk(test) (mm/s)</label>
                  <input type="number" step="0.01" v-model.number="form.measuredPeak" @input="scheduleCalc">
                </div>
                <div class="form-group">
                  <label>实测 RMS 速度 Vrms(test) (mm/s)</label>
                  <input type="number" step="0.01" v-model.number="form.measuredRms" @input="scheduleCalc">
                </div>
                <div class="form-group"></div>
                <div class="form-group"></div>
              </div>
            </div>

            <div v-show="smallTab === 'result'" class="tab-panel">
              <div class="section-title">各管段截面积与质量</div>
              <div class="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>管段</th>
                      <th>Asp (mm²)</th>
                      <th>Asf (mm²)</th>
                      <th>Asin (mm²)</th>
                      <th>msp (kg)</th>
                      <th>msf (kg)</th>
                      <th>msin (kg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="!calcResult || !calcResult.segs || !calcResult.segs.length">
                      <td colspan="7" class="text-muted" style="text-align:center">请输入完整参数后自动显示</td>
                    </tr>
                    <tr v-for="(seg, index) in (calcResult && calcResult.segs) || []" :key="'seg-row-' + index">
                      <td>管段{{ index + 1 }}</td>
                      <td>{{ round(seg.AspDisp, 4) }}</td>
                      <td>{{ round(seg.AsfDisp, 4) }}</td>
                      <td>{{ round(seg.Asin, 4) }}</td>
                      <td>{{ round(seg.msp, 6) }}</td>
                      <td>{{ round(seg.msf, 6) }}</td>
                      <td>{{ round(seg.msin, 6) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="section-title">中间参数</div>
              <div class="result-box" v-if="calcResult">
                <div class="result-item" @click="openMetric('lp', calcResult.lp)">
                  <div class="label">有效长度 lp (mm)</div>
                  <div class="value">{{ round(calcResult.lp, 1) }}</div>
                </div>
                <div class="result-item" @click="openMetric('mp0', calcResult.mp0)">
                  <div class="label">mp0</div>
                  <div class="value">{{ round(calcResult.mp0, 6) }}</div>
                </div>
                <div class="result-item" @click="openMetric('mf0', calcResult.mf0)">
                  <div class="label">mf0</div>
                  <div class="value">{{ round(calcResult.mf0, 6) }}</div>
                </div>
                <div class="result-item" @click="openMetric('min0', calcResult.min0)">
                  <div class="label">min0</div>
                  <div class="value">{{ round(calcResult.min0, 6) }}</div>
                </div>
                <div class="result-item" @click="openMetric('Cm', calcResult.Cm)">
                  <div class="label">Cm</div>
                  <div class="value">{{ round(calcResult.Cm, 4) }}</div>
                </div>
                <div class="result-item" @click="openMetric('C1', calcResult.C1)">
                  <div class="label">C1</div>
                  <div class="value">{{ round(calcResult.C1, 4) }}</div>
                </div>
                <div class="result-item" @click="openMetric('C3', calcResult.C3)">
                  <div class="label">C3</div>
                  <div class="value">{{ round(calcResult.C3, 4) }}</div>
                </div>
                <div class="result-item" @click="openMetric('C2K2', calcResult.C2K2)">
                  <div class="label">C2K2</div>
                  <div class="value">{{ round(calcResult.C2K2, 1) }}</div>
                </div>
                <div class="result-item" @click="openMetric('C4', calcResult.C4)">
                  <div class="label">C4</div>
                  <div class="value">{{ round(calcResult.C4, 2) }}</div>
                </div>
              </div>
            </div>
            <div v-if="calcErrors.length" class="help-text mt-12" style="background: var(--danger-light); border-left-color: var(--danger); color: var(--danger)">
              {{ calcErrors.join("；") }}
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-title">速度法实测振动数据</div>
          </div>
          <div class="card-body">
            <div class="form-row form-row-equal-4">
              <div class="form-group">
                <label>测点位置</label>
                <input type="text" v-model="measure.position" placeholder="如：弯头外侧 / 支管根部">
              </div>
              <div class="form-group">
                <label>实测峰值速度 Vpk(test) (mm/s)</label>
                <input type="number" step="0.01" v-model.number="measure.vp" @input="onVpInput" @blur="autoFill('vp')">
              </div>
              <div class="form-group">
                <label>实测 RMS 速度 Vrms(test) (mm/s)</label>
                <input type="number" step="0.01" v-model.number="measure.vr" @input="onVrInput" @blur="autoFill('vr')">
              </div>
              <div class="form-group">
                <label>实测主频 fmeas (Hz)</label>
                <input type="number" step="0.1" v-model.number="measure.freq" @input="scheduleCalc">
              </div>
            </div>
            <div class="help-text">
              提示：实测峰值速度 Vpk(test) 与实测 RMS 速度 Vrms(test) 满足 Vpk(test) = Vrms(test) × 3.5。仅输入其中一项时，系统将在失去焦点后自动补齐另一项。未录入实测数据时，分级结果将显示“待录入”。
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-title">位移法自动计算</div>
          </div>
          <div class="card-body">
            <div class="form-row form-row-equal-4">
              <div class="form-group">
                <label>结构构型</label>
                <select v-model="disp.config" disabled>
                  <option value="straight">常规直管单跨（两端支撑）</option>
                  <option value="cantilever">纯悬臂直管</option>
                  <option value="elbowFree">悬臂弯头面内自由端结构</option>
                  <option value="elbowGuided">悬臂弯头导向端结构</option>
                  <option value="elbowTwoSpan">弯头双跨结构</option>
                </select>
              </div>
              <div class="form-group">
                <label>长跨 L1 (m)</label>
                <input type="text" :value="fmt(disp.l1, 2)" readonly>
              </div>
              <div class="form-group">
                <label>短跨 L2 (m)</label>
                <input type="text" :value="fmt(disp.l2, 2)" readonly>
              </div>
              <div class="form-group">
                <label>跨比 r</label>
                <input type="text" :value="disp.rText" readonly>
              </div>
            </div>
            <div class="form-row form-row-equal-4">
              <div class="form-group">
                <label>插值 K 值</label>
                <input type="text" :value="fmt(disp.k, 4)" readonly>
              </div>
              <div class="form-group">
                <label>使用频率 fn (Hz)</label>
                <input type="text" :value="fmt(disp.fn, 2)" readonly>
              </div>
              <div class="form-group">
                <label>实测挠度 δ(test) (μm)</label>
                <input type="number" step="0.1" v-model.number="disp.deltaTest" @input="scheduleCalc">
              </div>
              <div class="form-group"></div>
            </div>
            <div class="help-text">
              提示：位移法 K 值、结构构型、L1/L2、fn 均由管段模型自动判定；弯头双跨结构时按跨比 r 分段线性插值 K。实测挠度 δ(test) 可人工录入，ratio_d = δ(test) / δ(allow)。
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-title">分级计算结果</div>
          </div>
          <div class="card-body">
            <div class="result-box">
              <div class="result-item">
                <div class="label">许用峰值速度 V(allow,pk)</div>
                <div class="value">{{ grade.allowVpText }}</div>
              </div>
              <div class="result-item">
                <div class="label">许用 RMS 速度 V(allow,rms)</div>
                <div class="value">{{ grade.allowVrText }}</div>
              </div>
              <div class="result-item">
                <div class="label">峰值速度超标倍率 Ratio_pk</div>
                <div class="value">{{ grade.ratioPeakText }}</div>
              </div>
              <div class="result-item">
                <div class="label">RMS 倍率 ratio_rms</div>
                <div class="value">{{ grade.ratioRmsText }}</div>
              </div>
              <div class="result-item">
                <div class="label">插值 K 值</div>
                <div class="value">{{ fmt(disp.k, 4) }}</div>
              </div>
              <div class="result-item">
                <div class="label">名义位移 δn (μm)</div>
                <div class="value">{{ grade.deltaNText }}</div>
              </div>
              <div class="result-item">
                <div class="label">允许位移峰值 δ(allow) (μm)</div>
                <div class="value">{{ grade.allowDpText }}</div>
              </div>
              <div class="result-item">
                <div class="label">实测挠度 δ(test) (μm)</div>
                <div class="value">{{ grade.deltaTestText }}</div>
              </div>
              <div class="result-item">
                <div class="label">位移法 Ratio_δ</div>
                <div class="value">{{ grade.ratioDispText }}</div>
              </div>
              <div class="result-item">
                <div class="label">最终定级基准倍率 Ratio_final</div>
                <div class="value">{{ grade.ratioFinalText }}</div>
              </div>
              <div class="result-item">
                <div class="label">振动等级</div>
                <div class="value">
                  <span class="badge" :class="grade.badgeClass">{{ grade.badgeText }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card" v-if="showStress">
          <div class="card-header">
            <div class="card-title">动应力校核（2/3 级时启用）</div>
          </div>
          <div class="card-body">
            <div class="form-row form-row-equal-4">
              <div class="form-group">
                <label>动应力实测值 σ_d (MPa)</label>
                <input type="number" step="0.1" v-model.number="stress.actual" @input="scheduleCalc">
              </div>
              <div class="form-group">
                <label>疲劳限值 σ_limit (MPa)</label>
                <input type="number" step="0.1" v-model.number="stress.limit" @input="scheduleCalc">
              </div>
              <div class="form-group">
                <label>判定结果</label>
                <input type="text" :value="stress.result" readonly>
              </div>
              <div class="form-group">
                <label>升级提示</label>
                <input type="text" :value="stress.warn" readonly>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-title">多测点评级逻辑说明</div>
          </div>
          <div class="card-body">
            <div class="help-text">
              同一管段存在多个振动测点时，分别计算每个测点的 Ratio_final，取所有测点中的最大 Ratio_final 作为该管段最终评定依据。即：Ratio_final = max(ratio_v, ratio_d) 按测点计算，管段等级 = max(各测点等级)。
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
import TM05_CALC from "./calc/tm05-calc";
import { clone, num, pickNum, fmt } from "./utils";
import "./lof.css";

const VPK_TO_RMS = 3.5;

function defaultForm() {
  const d = clone(MockData.tm05SmallPipe || {});
  return {
    Do: (d.Do || [0, 0, 0]).slice(),
    tp: (d.tp || [0, 0, 0]).slice(),
    Lp: (d.Lp || [0, 0, 0]).slice(),
    mv: (d.mv || [0, 0, 0]).slice(),
    rho_p: d.rho_p,
    rho_f: d.rho_f,
    rho_in: d.rho_in,
    tin: d.tin,
    hfRoot: !!d.hfRoot,
    weldType: d.weldType || "BUTTERFLY_WELDING",
    endCondition: d.endCondition || "STRAIGHT",
    operatingTemp: d.operatingTemp,
    Sa_T: d.Sa_T,
    C5: d.C5 != null ? d.C5 : 1.0,
    C0: d.C0 != null ? d.C0 : 3.5,
    beta: d.beta != null ? d.beta : 13.42,
    measuredPeak: d.measuredPeak,
    measuredRms: d.measuredRms
  };
}

export default {
  mixins: [directoryMixin],
  components: { breadcrumb },
  data() {
    const form = defaultForm();
    return {
      hasIcon: false,
      brand: [
        { name: "lang.analysis_govern" },
        { name: "lang.lof" },
        { name: "lang.lof_tm05" }
      ],
      smallTab: "input",
      pipeRows: [0, 1, 2],
      form: form,
      kks: "",
      mainLofText: "-",
      calcResult: null,
      calcErrors: [],
      measure: {
        position: "",
        vp: form.measuredPeak,
        vr: form.measuredRms,
        freq: ""
      },
      disp: {
        config: "elbowTwoSpan",
        l1: 8,
        l2: 4,
        rText: "-",
        k: 0,
        fn: 10,
        deltaTest: ""
      },
      grade: {
        allowVpText: "-",
        allowVrText: "-",
        ratioPeakText: "待录入",
        ratioRmsText: "待录入",
        deltaNText: "-",
        allowDpText: "-",
        deltaTestText: "待录入",
        ratioDispText: "-",
        ratioFinalText: "待录入",
        badgeClass: "badge-na",
        badgeText: "待录入振动数据"
      },
      stress: {
        actual: 45,
        limit: 155,
        result: "-",
        warn: "-"
      },
      showStress: false,
      calcTimer: null,
      drawerVisible: false,
      drawerTitle: "",
      drawerBody: ""
    };
  },
  mounted() {
    this.calculate();
  },
  beforeDestroy() {
    if (this.calcTimer) clearTimeout(this.calcTimer);
  },
  methods: {
    fmt: fmt,
    round: TM05_CALC.round,
    onSegmentChange(id) {
      this.loadSegmentDetail(id);
    },
    onSegmentLoaded(detail) {
      this.applySegment(detail);
      this.calculate();
    },
    applySegment(detail) {
      if (!detail) return;
      this.kks = detail.pipeStandardKks || detail.nodeName || detail.kks || "";
      this.mainLofText = detail.mainLof != null ? String(detail.mainLof) : "-";
      this.form.Do.splice(0, 1, pickNum(detail.outerDiameter, this.form.Do[0]));
      this.form.tp.splice(0, 1, pickNum(detail.wallThickness, this.form.tp[0]));
      const lengthM = pickNum(detail.pipeLength || detail.length, null);
      if (lengthM != null) this.form.Lp.splice(0, 1, lengthM * 1000);
      this.form.rho_f = pickNum(detail.fluidDensity, this.form.rho_f);
      this.form.operatingTemp = pickNum(
        detail.designTemperature || detail.operatingTemperature || detail.temperature,
        this.form.operatingTemp
      );
      this.disp.fn = pickNum(detail.naturalFrequency || detail.fn, this.disp.fn);
      this.disp.l1 = pickNum(detail.l1 || detail.crossing || detail.pipeLength || detail.length, this.disp.l1);
      this.disp.l2 = pickNum(detail.l2, this.disp.l1 * 0.5);
      this.disp.config = this.autoConfigFromSegment(detail);
    },
    autoConfigFromSegment(seg) {
      const support = (seg && (seg.supportType || seg.support || seg.stiffnessGrade)) || "";
      if (String(support).indexOf("刚性") >= 0) return "straight";
      if (String(support).indexOf("中刚") >= 0) return "elbowGuided";
      if (String(support).indexOf("中等") >= 0) return "cantilever";
      if (String(support).indexOf("柔性") >= 0) return "elbowFree";
      return "elbowTwoSpan";
    },
    computeK(config, l1, l2) {
      switch (config) {
        case "straight":
          return { k: 0.003, r: null };
        case "cantilever":
          return { k: 0.027, r: null };
        case "elbowFree":
          return { k: 0.03, r: null };
        case "elbowGuided":
          return { k: 0.012, r: null };
        default: {
          const r = l1 > 0 ? l2 / l1 : 0;
          const clampedR = Math.max(0, Math.min(r, 1));
          let k;
          if (clampedR <= 0.5) k = 0.005 + 0.008 * clampedR;
          else k = 0.009 + 0.014 * (clampedR - 0.5);
          return { k: k, r: clampedR };
        }
      }
    },
    scheduleCalc() {
      if (this.calcTimer) clearTimeout(this.calcTimer);
      this.calcTimer = setTimeout(() => {
        this.calculate();
      }, 250);
    },
    onVpInput() {
      this.form.measuredPeak = this.measure.vp;
      this.scheduleCalc();
    },
    onVrInput() {
      this.form.measuredRms = this.measure.vr;
      this.scheduleCalc();
    },
    autoFill(source) {
      const vp = parseFloat(this.measure.vp);
      const vr = parseFloat(this.measure.vr);
      if (source === "vp" && isFinite(vp) && !isFinite(vr)) {
        this.measure.vr = Number((vp / VPK_TO_RMS).toFixed(3));
        this.form.measuredRms = this.measure.vr;
      } else if (source === "vr" && isFinite(vr) && !isFinite(vp)) {
        this.measure.vp = Number((vr * VPK_TO_RMS).toFixed(3));
        this.form.measuredPeak = this.measure.vp;
      }
      this.calculate();
    },
    gradeName(ratio) {
      if (ratio === 0) return "NA";
      if (ratio <= 0.7) return "0";
      if (ratio <= 1.0) return "1";
      if (ratio <= 1.5) return "2";
      return "3";
    },
    gradeLabel(ratio) {
      if (ratio === 0) return { text: "NA", cls: "badge-na" };
      if (ratio <= 0.7) return { text: "0 安全", cls: "badge-low" };
      if (ratio <= 1.0) return { text: "1 关注", cls: "badge-low" };
      if (ratio <= 1.5) return { text: "2 预警", cls: "badge-medium" };
      return { text: "3 高危", cls: "badge-high" };
    },
    calculate() {
      const r = TM05_CALC.compute({
        Do: this.form.Do,
        tp: this.form.tp,
        Lp: this.form.Lp,
        mv: this.form.mv,
        rho_p: this.form.rho_p,
        rho_f: this.form.rho_f,
        rho_in: this.form.rho_in,
        tin: this.form.tin,
        weldType: this.form.weldType,
        endCondition: this.form.endCondition,
        C5: this.form.C5,
        C0: this.form.C0,
        beta: this.form.beta,
        Sa_T: this.form.Sa_T
      });
      this.calcErrors = (r.errors && r.errors.length) ? r.errors : [];
      this.calcResult = r;
      this.applyGrade(r);
    },
    applyGrade(r) {
      const allowVp = r && r.V_peak_allow > 0 ? r.V_peak_allow : 0;
      const allowVr = r && r.V_rms_allow > 0 ? r.V_rms_allow : 0;
      const vp = parseFloat(this.measure.vp);
      const vr = parseFloat(this.measure.vr);
      const hasVel = isFinite(vp) || isFinite(vr);
      this.grade.allowVpText = allowVp ? allowVp.toFixed(3) : "-";
      this.grade.allowVrText = allowVr ? allowVr.toFixed(3) : "-";
      let ratioPeak = 0;
      let ratioRms = 0;
      if (!hasVel) {
        this.grade.ratioPeakText = "待录入";
        this.grade.ratioRmsText = "待录入";
      } else {
        ratioPeak = isFinite(vp) && allowVp ? vp / allowVp : 0;
        ratioRms = isFinite(vr) && allowVr ? vr / allowVr : 0;
        this.grade.ratioPeakText = ratioPeak.toFixed(3);
        this.grade.ratioRmsText = ratioRms.toFixed(3);
      }

      const seg = this.currentSegment || {};
      const length = pickNum(seg.pipeLength || seg.length, num(this.form.Lp[0]) / 1000 || 1);
      const od = pickNum(seg.outerDiameter, this.form.Do[0] || 100);
      const fn = pickNum(seg.naturalFrequency || seg.fn, this.disp.fn);
      const l1 = this.disp.l1 || length || 8;
      const l2 = this.disp.l2 || l1 * 0.5;
      const kRes = this.computeK(this.disp.config, l1, l2);
      this.disp.k = kRes.k;
      this.disp.fn = fn;
      this.disp.rText = kRes.r != null ? kRes.r.toFixed(3) : "-";
      const L_in = length * 39.37007874;
      const Do_in = od / 25.4;
      const delta_n_in = Do_in ? (kRes.k * L_in * L_in) / (Do_in * 144) : 0;
      const sigma_n = 68.95;
      const c2k2 = r && r.C2K2 ? r.C2K2 : 1;
      const sel = r && r.Sa_T ? r.Sa_T : 1;
      const delta_allow_in = (sel * delta_n_in) / (c2k2 * sigma_n);
      const allow_um = delta_allow_in * 25400;
      if (this.disp.deltaTest === "" || this.disp.deltaTest == null) {
        this.disp.deltaTest = Number((allow_um * 0.6).toFixed(3));
      }
      const deltaTest = num(this.disp.deltaTest);
      const ratioDisp = allow_um ? deltaTest / allow_um : 0;
      this.grade.deltaNText = (delta_n_in * 25400).toFixed(3);
      this.grade.allowDpText = allow_um.toFixed(3);
      this.grade.deltaTestText = deltaTest.toFixed(3);
      this.grade.ratioDispText = ratioDisp.toFixed(3);

      if (!hasVel && !ratioDisp) {
        this.grade.ratioFinalText = "待录入";
        this.grade.badgeClass = "badge-na";
        this.grade.badgeText = "待录入振动数据";
        this.showStress = false;
        return;
      }
      const ratioFinal = Math.max(hasVel ? Math.max(ratioPeak, ratioRms) : 0, ratioDisp);
      this.grade.ratioFinalText = ratioFinal.toFixed(3);
      const badge = this.gradeLabel(ratioFinal);
      this.grade.badgeClass = badge.cls;
      this.grade.badgeText = badge.text;
      const g = this.gradeName(ratioFinal);
      this.showStress = g === "2" || g === "3";
      if (this.showStress) {
        const sa = num(this.stress.actual);
        const sl = num(this.stress.limit, 1);
        if (sa <= sl) {
          this.stress.result = "σ_test ≤ σ_limit，疲劳性能合格";
          this.stress.warn = "按对应振动等级常规管控";
        } else {
          this.stress.result = "σ_test > σ_limit，疲劳高风险";
          this.stress.warn = "自动升级为 3 级高危，LOF 强制上调至 ≥0.8";
        }
      }
    },
    openMetric(name, value) {
      this.drawerTitle = "中间参数 · " + name;
      this.drawerBody = JSON.stringify({ name: name, value: value, result: this.calcResult }, null, 2);
      this.drawerVisible = true;
    }
  }
};
</script>
