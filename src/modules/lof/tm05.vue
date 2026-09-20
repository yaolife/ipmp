<template>
  <div class="cud-commom-form-style">
    <div class="cud__scroll--div">
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
            <div class="mt-12" style="display: flex; gap: 8px; align-items: center">
              <el-button
                type="primary"
                size="small"
                :loading="evaluating"
                :disabled="!segmentId || saving"
                @click="evaluateTm05"
              >执行 TM05 振动校核</el-button>
              <el-button
                type="success"
                size="small"
                :loading="saving"
                :disabled="!segmentId || evaluating"
                @click="saveTm05"
              >保存校核版本</el-button>
              <span class="text-sm text-muted">执行校核只预览结果，保存时由后端重新计算并生成版本历史。</span>
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
              <div class="result-item" @click="openResultMetric('allowVp')">
                <div class="label">许用峰值速度 V(allow,pk)</div>
                <div class="value">{{ grade.allowVpText }}</div>
              </div>
              <div class="result-item" @click="openResultMetric('allowVr')">
                <div class="label">许用 RMS 速度 V(allow,rms)</div>
                <div class="value">{{ grade.allowVrText }}</div>
              </div>
              <div class="result-item" @click="openResultMetric('ratioPeak')">
                <div class="label">峰值速度超标倍率 Ratio_pk</div>
                <div class="value">{{ grade.ratioPeakText }}</div>
              </div>
              <div class="result-item" @click="openResultMetric('ratioRms')">
                <div class="label">RMS 倍率 ratio_rms</div>
                <div class="value">{{ grade.ratioRmsText }}</div>
              </div>
              <div class="result-item" @click="openResultMetric('kInterp')">
                <div class="label">插值 K 值</div>
                <div class="value">{{ fmt(disp.k, 4) }}</div>
              </div>
              <div class="result-item" @click="openResultMetric('deltaN')">
                <div class="label">名义位移 δn (μm)</div>
                <div class="value">{{ grade.deltaNText }}</div>
              </div>
              <div class="result-item" @click="openResultMetric('allowDp')">
                <div class="label">允许位移峰值 δ(allow) (μm)</div>
                <div class="value">{{ grade.allowDpText }}</div>
              </div>
              <div class="result-item" @click="openResultMetric('deltaTest')">
                <div class="label">实测挠度 δ(test) (μm)</div>
                <div class="value">{{ grade.deltaTestText }}</div>
              </div>
              <div class="result-item" @click="openResultMetric('ratioDisp')">
                <div class="label">位移法 Ratio_δ</div>
                <div class="value">{{ grade.ratioDispText }}</div>
              </div>
              <div class="result-item" @click="openResultMetric('ratioFinal')">
                <div class="label">最终定级基准倍率 Ratio_final</div>
                <div class="value">{{ grade.ratioFinalText }}</div>
              </div>
              <div class="result-item" @click="openResultMetric('gradeBadge')">
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
                <input type="number" step="0.1" v-model.number="stress.actual" @input="scheduleStressCalc">
              </div>
              <div class="form-group">
                <label>疲劳限值 σ_limit (MPa)</label>
                <input type="number" step="0.1" v-model.number="stress.limit" @input="scheduleStressCalc">
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
            <div class="card-title">正式校核与版本保存</div>
          </div>
          <div class="card-body">
            <div class="form-row form-row-2">
              <div class="form-group">
                <label>评估备注</label>
                <input type="text" v-model="remarks" placeholder="可填写现场振动校核说明">
              </div>
              <div class="form-group"></div>
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
                    <th>许用峰值速度</th>
                    <th>许用RMS速度</th>
                    <th>是否超限</th>
                    <th>风险等级</th>
                    <th>创建时间</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="!history.length">
                    <td colspan="6" class="text-muted" style="text-align:center">暂无保存记录</td>
                  </tr>
                  <tr
                    v-for="row in history"
                    :key="row.id"
                    style="cursor: pointer"
                    @click="loadHistoryDetail(row)"
                  >
                    <td>V{{ row.versionNo }}</td>
                    <td>{{ fmt(row.vpeakAllow != null ? row.vpeakAllow : row.vPeakAllow, 3) }}</td>
                    <td>{{ fmt(row.vrmsAllow != null ? row.vrmsAllow : row.vRmsAllow, 3) }}</td>
                    <td>{{ String(row.overLimit) === '1' ? '是' : '否' }}</td>
                    <td>{{ riskText(row.riskLevel) }}</td>
                    <td>{{ row.createDate || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="mt-12" style="text-align: right" v-if="historyTotal > historySize">
              <el-pagination
                layout="prev, pager, next"
                :current-page="historyCurrent"
                :page-size="historySize"
                :total="historyTotal"
                @current-change="onHistoryPageChange"
              ></el-pagination>
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

      <lof-trace-drawer
        :visible.sync="drawerVisible"
        :trace="drawerTrace"
      ></lof-trace-drawer>
    </div>
  </div>
</template>

<script>
import LofTraceDrawer from "./components/LofTraceDrawer";
import directoryMixin from "./directoryMixin";
import api from "./api";
import { num, pickNum, fmt } from "./utils";
import "./lof.css";

const VPK_TO_RMS = 3.5;

const SMALL_PIPE_METRICS = {
  lp: { name: "有效长度 lp", meaning: "参与小支管振动计算的各有效管段长度之和。", formula: "lp = ΣLp,i（仅统计 Lp,i > 0 的管段）" },
  mp0: { name: "管段单位长度质量 mp0", meaning: "小支管管材沿有效长度折算的单位长度质量。", formula: "mp0 = 1000 × Σmsp,i / lp" },
  mf0: { name: "流体单位长度质量 mf0", meaning: "管内流体沿有效长度折算的单位长度质量。", formula: "mf0 = 1000 × Σmsf,i / lp" },
  min0: { name: "保温层单位长度质量 min0", meaning: "保温材料沿有效长度折算的单位长度质量。", formula: "min0 = 1000 × Σmsin,i / lp" },
  Cm: { name: "阀门质量修正系数 Cm", meaning: "附加阀门质量与小支管自身质量的比值。", formula: "Cm = Σmv,i / Σmsp,i" },
  C1: { name: "质量修正系数 C1", meaning: "根据阀门附加质量修正许用振动速度。", formula: "Cm = 0 时 C1 = 1；Cm > 0 时 C1 = 0.529 × Cm^-0.46" },
  C3: { name: "密度修正系数 C3", meaning: "考虑流体和保温层附加质量的修正系数。", formula: "C3 = √(1 + (mf0 + min0) / mp0)" },
  C2K2: { name: "焊缝类型修正系数 C2K2", meaning: "按照小支管根部焊缝形式选取的疲劳修正系数。", formula: "承插焊取4.2；对焊或其他形式取2.0。" },
  C4: { name: "端部条件修正系数 C4", meaning: "根据小支管结构端部条件选取的修正系数。", formula: "直管段1.00；简支悬臂1.33；Z型弯头0.74；U型弯头0.83。" }
};

const RESULT_METRICS = {
  allowVp: { name: "许用峰值速度 V(allow,pk)", meaning: "当前管段在速度法下允许的峰值振动速度。", formula: "V(allow,pk) = (C1 × C4 / (C3 × C5)) × (β × Sel / C2K2)" },
  allowVr: { name: "许用 RMS 速度 V(allow,rms)", meaning: "由许用峰值速度换算得到的许用均方根速度。", formula: "V(allow,rms) = V(allow,pk) / 3.5" },
  ratioPeak: { name: "峰值速度超标倍率 Ratio_pk", meaning: "实测峰值速度相对于许用峰值速度的倍率。", formula: "Ratio_pk = Vpk(test) / V(allow,pk)" },
  ratioRms: { name: "RMS 倍率 Ratio_rms", meaning: "实测RMS速度相对于许用RMS速度的倍率。", formula: "Ratio_rms = Vrms(test) / V(allow,rms)" },
  kInterp: { name: "插值 K 值", meaning: "根据结构构型和双跨跨比选取或插值得到的位移系数。", formula: "常规直管单跨0.003；纯悬臂直管0.027；悬臂弯头自由端0.030；导向端0.012；双跨弯头按跨比r分段插值。" },
  deltaN: { name: "名义位移 δn", meaning: "由结构系数、管长和外径计算的名义振动位移。", formula: "δn = K × L² / (Do × 144)" },
  allowDp: { name: "允许位移峰值 δ(allow)", meaning: "结合材料疲劳限值和焊缝修正后的允许位移。", formula: "δ(allow) = Sel × δn / (C2K2 × σn)，其中σn = 68.95 MPa" },
  deltaTest: { name: "实测挠度 δ(test)", meaning: "现场振动测量或历史监测录入的实际位移峰值。", formula: "δ(test) = 人工录入的实测挠度" },
  ratioDisp: { name: "位移法 Ratio_δ", meaning: "实测挠度相对于允许位移峰值的倍率。", formula: "Ratio_δ = δ(test) / δ(allow)" },
  ratioFinal: { name: "最终定级基准倍率 Ratio_final", meaning: "速度法和位移法各倍率中的最大值，是振动等级的最终判定依据。", formula: "Ratio_final = max(Ratio_pk, Ratio_rms, Ratio_δ)" },
  gradeBadge: { name: "振动等级", meaning: "按照最终倍率划分的0至3级振动风险。", formula: "Ratio_final≤0.7为0安全；≤1.0为1关注；≤1.5为2预警；>1.5为3高危。" }
};

function defaultForm() {
  return {
    Do: [null, null, null],
    tp: [null, null, null],
    Lp: [null, null, null],
    mv: [null, null, null],
    rho_p: null,
    rho_f: null,
    rho_in: null,
    tin: null,
    hfRoot: false,
    weldType: "",
    endCondition: "",
    operatingTemp: null,
    Sa_T: null,
    C5: null,
    C0: null,
    beta: null,
    measuredPeak: null,
    measuredRms: null
  };
}

export default {
  mixins: [directoryMixin],
  components: { LofTraceDrawer },
  data() {
    const form = defaultForm();
    return {
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
        config: "",
        l1: null,
        l2: null,
        rText: "-",
        k: null,
        fn: null,
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
        actual: null,
        limit: null,
        result: "-",
        warn: "-"
      },
      showStress: false,
      drawerVisible: false,
      drawerTrace: { title: "计算追溯详情", sections: [] },
      remarks: "",
      evaluating: false,
      saving: false,
      history: [],
      historyCurrent: 1,
      historySize: 10,
      historyTotal: 0
    };
  },
  methods: {
    fmt: fmt,
    round(value, digits) {
      const number = Number(value);
      if (!isFinite(number)) return "-";
      return Number(number.toFixed(digits == null ? 4 : digits));
    },
    onSegmentChange(id) {
      const form = defaultForm();
      this.form = form;
      this.kks = "";
      this.measure = {
        position: "",
        vp: null,
        vr: null,
        freq: ""
      };
      this.disp = {
        config: "",
        l1: null,
        l2: null,
        rText: "-",
        k: null,
        fn: null,
        deltaTest: ""
      };
      this.resetEvaluationResult();
      this.history = [];
      this.historyCurrent = 1;
      this.historyTotal = 0;
      this.loadSegmentDetail(id);
      if (id) {
        this.loadLatestMainLof();
        this.loadHistoryPage();
      }
    },
    onSegmentLoaded(detail) {
      this.applySegment(detail);
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
      this.disp.l2 = pickNum(detail.l2, null);
      this.disp.config = this.autoConfigFromSegment(detail);
    },
    autoConfigFromSegment(seg) {
      const support = (seg && (seg.supportType || seg.support || seg.stiffnessGrade)) || "";
      if (String(support).indexOf("刚性") >= 0) return "straight";
      if (String(support).indexOf("中刚") >= 0) return "elbowGuided";
      if (String(support).indexOf("中等") >= 0) return "cantilever";
      if (String(support).indexOf("柔性") >= 0) return "elbowFree";
      return "";
    },
    scheduleCalc() {
      this.resetEvaluationResult();
    },
    scheduleStressCalc() {
      const keepStressVisible = this.showStress;
      this.resetEvaluationResult();
      this.showStress = keepStressVisible;
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
      this.resetEvaluationResult();
    },
    /**
     * 清除上一次后端校核结果，防止参数修改后继续展示失效结果。
     */
    resetEvaluationResult() {
      this.calcResult = null;
      this.calcErrors = [];
      this.grade = {
        allowVpText: "-",
        allowVrText: "-",
        ratioPeakText: "待评估",
        ratioRmsText: "待评估",
        deltaNText: "-",
        allowDpText: "-",
        deltaTestText: "待评估",
        ratioDispText: "-",
        ratioFinalText: "待评估",
        badgeClass: "badge-na",
        badgeText: "请执行 TM05 振动校核"
      };
      this.showStress = false;
      this.stress.result = "-";
      this.stress.warn = "-";
    },
    errorMessage(error, fallback) {
      const data = error && error.response && error.response.data;
      return (data && data.msg) || (error && error.msg) || fallback;
    },
    riskText(level) {
      const labels = ["Low", "Medium", "High"];
      return labels[Number(level)] || "-";
    },
    buildPayload() {
      return {
        segmentId: this.segmentId,
        parameters: {
          do1: this.form.Do[0],
          tp1: this.form.tp[0],
          lp1: this.form.Lp[0],
          mv1: this.form.mv[0],
          do2: this.form.Do[1],
          tp2: this.form.tp[1],
          lp2: this.form.Lp[1],
          mv2: this.form.mv[1],
          do3: this.form.Do[2],
          tp3: this.form.tp[2],
          lp3: this.form.Lp[2],
          mv3: this.form.mv[2],
          materialDensity: this.form.rho_p,
          fluidDensity: this.form.rho_f,
          insulationDensity: this.form.rho_in,
          insulationThickness: this.form.tin,
          weldType: this.form.weldType,
          endCondition: this.form.endCondition,
          operatingTemperature: this.form.operatingTemp,
          fatigueLimit: this.form.Sa_T,
          c5: this.form.C5,
          c0: this.form.C0,
          beta: this.form.beta
        },
        measuredVibration: {
          position: this.measure.position,
          peakVelocity: this.measure.vp,
          rmsVelocity: this.measure.vr,
          measuredFrequency: this.measure.freq
        },
        displacement: {
          configuration: this.disp.config,
          firstSpan: this.disp.l1,
          secondSpan: this.disp.l2,
          naturalFrequency: this.disp.fn,
          pipeLength: this.currentSegment
            ? pickNum(this.currentSegment.pipeLength || this.currentSegment.length, num(this.form.Lp[0], null) / 1000)
            : num(this.form.Lp[0], null) / 1000,
          outerDiameter: this.form.Do[0],
          allowableStress: this.form.Sa_T,
          c2k2: null,
          measuredDisplacement: this.disp.deltaTest
        },
        dynamicStress: {
          actualStress: this.stress.actual,
          stressLimit: this.stress.limit
        },
        remarks: this.remarks || null
      };
    },
    applyBackendResult(data) {
      if (!data) return;
      const result = data.results || {};
      const segments = (result.segments || []).map(item => Object.assign({}, item, {
        AspDisp: item.Asp,
        AsfDisp: item.Asf
      }));
      this.calcResult = Object.assign({}, result, {
        segs: segments,
        V_peak_allow: data.vpeakAllow != null ? data.vpeakAllow : data.vPeakAllow,
        V_rms_allow: data.vrmsAllow != null ? data.vrmsAllow : data.vRmsAllow
      });
      this.calcErrors = [];
      this.remarks = data.remarks || "";
      const displacement = result.displacement || {};
      const dynamicStress = result.dynamicStress || {};
      const ratioFinal = result.ratioFinal;
      const vibrationGrade = result.vibrationGrade;
      this.disp.k = displacement.K != null ? displacement.K : null;
      this.disp.rText = displacement.spanRatio != null
        ? Number(displacement.spanRatio).toFixed(3)
        : "-";
      this.grade.allowVpText = this.calcResult.V_peak_allow != null
        ? Number(this.calcResult.V_peak_allow).toFixed(3)
        : "-";
      this.grade.allowVrText = this.calcResult.V_rms_allow != null
        ? Number(this.calcResult.V_rms_allow).toFixed(3)
        : "-";
      this.grade.ratioPeakText = result.ratioPeak != null
        ? Number(result.ratioPeak).toFixed(3)
        : "待录入";
      this.grade.ratioRmsText = result.ratioRms != null
        ? Number(result.ratioRms).toFixed(3)
        : "待录入";
      this.grade.deltaNText = displacement.nominalDisplacement != null
        ? Number(displacement.nominalDisplacement).toFixed(3)
        : "-";
      this.grade.allowDpText = displacement.allowableDisplacement != null
        ? Number(displacement.allowableDisplacement).toFixed(3)
        : "-";
      this.grade.deltaTestText = displacement.measuredDisplacement != null
        ? Number(displacement.measuredDisplacement).toFixed(3)
        : "待录入";
      this.grade.ratioDispText = displacement.ratioDisplacement != null
        ? Number(displacement.ratioDisplacement).toFixed(3)
        : "-";
      this.grade.ratioFinalText = ratioFinal != null
        ? Number(ratioFinal).toFixed(3)
        : "待录入";
      const gradeLabels = [
        { text: "0 安全", cls: "badge-low" },
        { text: "1 关注", cls: "badge-low" },
        { text: "2 预警", cls: "badge-medium" },
        { text: "3 高危", cls: "badge-high" }
      ];
      const gradeLabel = vibrationGrade != null ? gradeLabels[Number(vibrationGrade)] : null;
      this.grade.badgeClass = gradeLabel ? gradeLabel.cls : "badge-na";
      this.grade.badgeText = gradeLabel ? gradeLabel.text : "待录入振动数据";
      this.showStress = vibrationGrade != null && Number(vibrationGrade) >= 2;
      if (this.showStress) {
        if (dynamicStress.qualified === true) {
          this.stress.result = "σ_test ≤ σ_limit，疲劳性能合格";
          this.stress.warn = "按对应振动等级常规管控";
        } else if (dynamicStress.qualified === false) {
          this.stress.result = "σ_test > σ_limit，疲劳高风险";
          this.stress.warn = "自动升级为 3 级高危，LOF 强制上调至 ≥0.8";
        } else {
          this.stress.result = "待录入";
          this.stress.warn = "请录入动应力实测值和疲劳限值后重新执行校核";
        }
      }
    },
    evaluateTm05() {
      if (!this.segmentId) {
        this.$message.warning("请选择管段");
        return;
      }
      this.evaluating = true;
      api.evaluateTm05(this.buildPayload()).then(res => {
        this.evaluating = false;
        if (!this.isSuccessCode(res && res.code)) {
          this.$message.error((res && res.msg) || "TM05校核失败");
          return;
        }
        this.applyBackendResult(res.data);
        this.$message.success((res && res.msg) || "TM05校核完成");
      }).catch(error => {
        this.evaluating = false;
        this.$message.error(this.errorMessage(error, "TM05校核失败"));
      });
    },
    saveTm05() {
      if (!this.segmentId) {
        this.$message.warning("请选择管段");
        return;
      }
      this.$confirm("保存后将生成新的 TM05 校核版本，是否继续？", "保存确认", {
        type: "warning"
      }).then(() => {
        this.saving = true;
        return api.saveTm05(this.buildPayload());
      }).then(res => {
        this.saving = false;
        if (!this.isSuccessCode(res && res.code)) {
          this.$message.error((res && res.msg) || "保存失败");
          return;
        }
        this.applyBackendResult(res.data);
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
      api.pageTm02History({
        segmentId: this.segmentId,
        current: 1,
        size: 1
      }).then(res => {
        if (!this.isSuccessCode(res && res.code)) return;
        const records = this.unwrapList(res.data);
        this.mainLofText = records.length && records[0].maxLof != null
          ? String(records[0].maxLof)
          : "-";
      }).catch(() => {
        this.mainLofText = "-";
      });
    },
    loadHistoryPage() {
      if (!this.segmentId) return;
      api.pageTm05History({
        segmentId: this.segmentId,
        current: this.historyCurrent,
        size: this.historySize
      }).then(res => {
        if (!this.isSuccessCode(res && res.code)) return;
        const data = res.data || {};
        this.history = this.unwrapList(data);
        this.historyTotal = Number(data.total || this.history.length || 0);
      }).catch(error => {
        this.$message.error(this.errorMessage(error, "版本历史加载失败"));
      });
    },
    onHistoryPageChange(page) {
      this.historyCurrent = page;
      this.loadHistoryPage();
    },
    loadHistoryDetail(row) {
      if (!row || !row.id) return;
      api.getTm05Detail(row.id).then(res => {
        if (!this.isSuccessCode(res && res.code)) {
          this.$message.error((res && res.msg) || "历史详情加载失败");
          return;
        }
        this.applyHistoryInputs(res.data && res.data.inputs);
        this.applyBackendResult(res.data);
      }).catch(error => {
        this.$message.error(this.errorMessage(error, "历史详情加载失败"));
      });
    },
    applyHistoryInputs(inputs) {
      if (!inputs) return;
      const parameters = inputs.parameters || {};
      const measured = inputs.measuredVibration || {};
      const displacement = inputs.displacement || {};
      const dynamicStress = inputs.dynamicStress || {};
      this.form.Do = [parameters.do1, parameters.do2, parameters.do3];
      this.form.tp = [parameters.tp1, parameters.tp2, parameters.tp3];
      this.form.Lp = [parameters.lp1, parameters.lp2, parameters.lp3];
      this.form.mv = [parameters.mv1, parameters.mv2, parameters.mv3];
      Object.assign(this.form, {
        rho_p: parameters.materialDensity,
        rho_f: parameters.fluidDensity,
        rho_in: parameters.insulationDensity,
        tin: parameters.insulationThickness,
        weldType: parameters.weldType,
        endCondition: parameters.endCondition,
        operatingTemp: parameters.operatingTemperature,
        Sa_T: parameters.fatigueLimit,
        C5: parameters.c5,
        C0: parameters.c0,
        beta: parameters.beta
      });
      Object.assign(this.measure, {
        position: measured.position,
        vp: measured.peakVelocity,
        vr: measured.rmsVelocity,
        freq: measured.measuredFrequency
      });
      Object.assign(this.disp, {
        config: displacement.configuration || "",
        l1: displacement.firstSpan,
        l2: displacement.secondSpan,
        fn: displacement.naturalFrequency,
        deltaTest: displacement.measuredDisplacement
      });
      Object.assign(this.stress, {
        actual: dynamicStress.actualStress,
        limit: dynamicStress.stressLimit
      });
    },
    traceRows(value, prefix) {
      const rows = [];
      Object.keys(value || {}).forEach(key => {
        const item = value[key];
        if (item != null && typeof item === "object" && !Array.isArray(item)) {
          rows.push.apply(rows, this.traceRows(item, (prefix ? prefix + " / " : "") + key));
          return;
        }
        rows.push({
          label: (prefix ? prefix + " / " : "") + key,
          value: item
        });
      });
      return rows;
    },
    smallPipeProcessRows(name) {
      const result = this.calcResult || {};
      const segments = result.segs || [];
      const baseRows = [
        { label: "有效长度 lp", value: result.lp == null ? "-" : result.lp + " mm" },
        { label: "管段单位长度质量 mp0", value: result.mp0 },
        { label: "流体单位长度质量 mf0", value: result.mf0 },
        { label: "保温层单位长度质量 min0", value: result.min0 },
        { label: "阀门质量修正系数 Cm", value: result.Cm },
        { label: "焊缝类型", value: this.form.weldType || "-" },
        { label: "端部条件", value: this.form.endCondition || "-" }
      ];
      if (["lp", "mp0", "mf0", "min0", "Cm"].indexOf(name) >= 0) {
        segments.forEach((segment, index) => {
          baseRows.push({ label: "管段" + (index + 1) + "长度 Lp", value: this.form.Lp[index] == null ? "-" : this.form.Lp[index] + " mm" });
          baseRows.push({ label: "管段" + (index + 1) + "管材质量 msp", value: segment.msp });
          baseRows.push({ label: "管段" + (index + 1) + "流体质量 msf", value: segment.msf });
          baseRows.push({ label: "管段" + (index + 1) + "保温质量 msin", value: segment.msin });
          baseRows.push({ label: "管段" + (index + 1) + "阀门质量 mv", value: this.form.mv[index] });
        });
      }
      return baseRows;
    },
    openMetric(name, value) {
      const meta = SMALL_PIPE_METRICS[name] || { name: name, meaning: "小支管振动计算中间参数。", formula: "由当前小支管输入参数计算。" };
      this.drawerTrace = {
        title: meta.name + " 计算详情",
        sections: [
          { title: "指标含义", text: meta.meaning },
          { title: "计算公式 / 取值依据", type: "formula", text: meta.formula },
          { title: "本次输入与中间量", rows: this.smallPipeProcessRows(name) },
          { title: "当前结果", rows: [{ label: meta.name, value: value }] }
        ]
      };
      this.drawerVisible = true;
    },
    resultMetricRows(name) {
      const result = this.calcResult || {};
      const displacement = result.displacement || {};
      const rows = {
        allowVp: [
          { label: "C1", value: result.C1 }, { label: "C3", value: result.C3 },
          { label: "C4", value: result.C4 }, { label: "C5", value: this.form.C5 },
          { label: "β", value: this.form.beta }, { label: "Sel", value: this.form.Sa_T },
          { label: "C2K2", value: result.C2K2 }
        ],
        allowVr: [{ label: "许用峰值速度", value: this.grade.allowVpText }, { label: "换算系数", value: VPK_TO_RMS }],
        ratioPeak: [{ label: "实测峰值速度", value: this.measure.vp }, { label: "许用峰值速度", value: this.grade.allowVpText }],
        ratioRms: [{ label: "实测RMS速度", value: this.measure.vr }, { label: "许用RMS速度", value: this.grade.allowVrText }],
        kInterp: [{ label: "结构构型", value: this.disp.config }, { label: "第一跨 L1", value: this.disp.l1 }, { label: "第二跨 L2", value: this.disp.l2 }, { label: "跨比 r", value: this.disp.rText }],
        deltaN: [{ label: "K", value: this.disp.k }, { label: "管长 L", value: displacement.pipeLength }, { label: "外径 Do", value: this.form.Do[0] }],
        allowDp: [{ label: "Sel", value: this.form.Sa_T }, { label: "名义位移 δn", value: this.grade.deltaNText }, { label: "C2K2", value: result.C2K2 }, { label: "σn", value: "68.95 MPa" }],
        deltaTest: [{ label: "测点位置", value: this.measure.position }, { label: "实测挠度", value: this.grade.deltaTestText }],
        ratioDisp: [{ label: "实测挠度", value: this.grade.deltaTestText }, { label: "允许位移", value: this.grade.allowDpText }],
        ratioFinal: [{ label: "Ratio_pk", value: this.grade.ratioPeakText }, { label: "Ratio_rms", value: this.grade.ratioRmsText }, { label: "Ratio_δ", value: this.grade.ratioDispText }],
        gradeBadge: [{ label: "Ratio_final", value: this.grade.ratioFinalText }, { label: "动应力校核结果", value: this.stress.result }]
      };
      return rows[name] || this.traceRows(result);
    },
    resultMetricValue(name) {
      const values = {
        allowVp: this.grade.allowVpText,
        allowVr: this.grade.allowVrText,
        ratioPeak: this.grade.ratioPeakText,
        ratioRms: this.grade.ratioRmsText,
        kInterp: this.disp.k,
        deltaN: this.grade.deltaNText,
        allowDp: this.grade.allowDpText,
        deltaTest: this.grade.deltaTestText,
        ratioDisp: this.grade.ratioDispText,
        ratioFinal: this.grade.ratioFinalText,
        gradeBadge: this.grade.badgeText
      };
      return values[name];
    },
    openResultMetric(name) {
      const meta = RESULT_METRICS[name];
      if (!meta) return;
      this.drawerTrace = {
        title: meta.name + " 计算详情",
        sections: [
          { title: "指标含义", text: meta.meaning },
          { title: "计算公式 / 分级依据", type: "formula", text: meta.formula },
          { title: "本次计算过程", rows: this.resultMetricRows(name) },
          { title: "当前结果", rows: [{ label: meta.name, value: this.resultMetricValue(name) }] }
        ]
      };
      this.drawerVisible = true;
    }
  }
};
</script>
