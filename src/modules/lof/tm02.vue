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
            <div class="mt-12" style="display: flex; gap: 8px; align-items: center">
              <el-button
                type="primary"
                size="small"
                :loading="evaluating"
                :disabled="!segmentId || saving"
                @click="evaluateTm02"
              >执行定量评估</el-button>
              <el-button
                type="success"
                size="small"
                :loading="saving"
                :disabled="!segmentId || evaluating"
                @click="saveTm02"
              >保存评估版本</el-button>
              <span class="text-sm text-muted">执行评估只预览结果，保存时由后端重新计算并生成版本历史。</span>
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
              <div
                class="tab"
                :class="{ active: paramTab === 'other' }"
                @click="paramTab = 'other'"
              >其他激励参数</div>
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
              <div class="form-row form-row-2 hfa-count-row">
                <div class="form-group">
                  <label>声源数</label>
                  <select v-model.number="hfa.sourceCount" @change="syncHfaSourceCount">
                    <option v-for="count in hfaCountOptions" :key="'source-count-' + count" :value="count">{{ count }}</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>不连续点数</label>
                  <select v-model.number="hfa.discontinuityCount" @change="syncHfaDiscontinuityCount">
                    <option v-for="count in hfaCountOptions" :key="'point-count-' + count" :value="count">{{ count }}</option>
                  </select>
                </div>
              </div>
              <div class="divider"></div>
              <div class="section-title">声源配置</div>
              <div v-for="(source, index) in hfa.sources" :key="'source-' + index" class="parameter-block">
                <div class="parameter-block-title">声源 {{ index + 1 }}</div>
                <div class="form-row form-row-equal-4">
                  <div class="form-group">
                    <label>声源名称</label>
                    <input type="text" v-model="source.name" @input="scheduleRecalc">
                  </div>
                  <div class="form-group">
                    <label>安装降噪构件</label>
                    <select v-model="source.hasSilencer" @change="scheduleRecalc">
                      <option :value="null" disabled>请选择</option>
                      <option :value="true">是</option>
                      <option :value="false">否</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>降噪量 (dB)</label>
                    <input type="number" v-model.number="source.reduction" @input="scheduleRecalc">
                  </div>
                  <div class="form-group">
                    <label>存在音速流动条件</label>
                    <select v-model="source.sonic" @change="scheduleRecalc">
                      <option :value="null" disabled>请选择</option>
                      <option :value="true">是</option>
                      <option :value="false">否</option>
                    </select>
                  </div>
                </div>
                <div class="form-row form-row-equal-4">
                  <div class="form-group">
                    <label>上游压力 P1 (Pa)</label>
                    <input type="number" v-model.number="source.upstreamPressure" @input="scheduleRecalc">
                  </div>
                  <div class="form-group">
                    <label>下游压力 P2 (Pa)</label>
                    <input type="number" v-model.number="source.downstreamPressure" @input="scheduleRecalc">
                  </div>
                  <div class="form-group">
                    <label>上游温度 Te (K)</label>
                    <input type="number" step="0.1" v-model.number="source.upstreamTemperature" @input="scheduleRecalc">
                  </div>
                </div>
              </div>

              <div class="divider"></div>
              <div class="section-title">焊接不连续点配置</div>
              <div v-for="(point, index) in hfa.discontinuities" :key="'point-' + index" class="parameter-block">
                <div class="parameter-block-title">不连续点 {{ index + 1 }}</div>
                <div class="form-row form-row-equal-4">
                  <div class="form-group">
                    <label>不连续点名称</label>
                    <input type="text" v-model="point.name" @input="scheduleRecalc">
                  </div>
                  <div class="form-group">
                    <label>支管外径 dext (mm)</label>
                    <input type="number" v-model.number="point.branchOuterDiameter" @input="scheduleRecalc">
                  </div>
                  <div class="form-group">
                    <label>支管壁厚 t (mm)</label>
                    <input type="number" v-model.number="point.branchThickness" @input="scheduleRecalc">
                  </div>
                </div>
                <div class="parameter-subtitle">各声源到当前不连续点的距离</div>
                <div class="form-row form-row-equal-4">
                  <div v-for="(source, sourceIndex) in hfa.sources" :key="'distance-' + index + '-' + sourceIndex" class="form-group">
                    <label>{{ source.name || ('声源 ' + (sourceIndex + 1)) }} 距离 Ldis (m)</label>
                    <input type="number" min="0" step="0.001" v-model.number="point.sourceDistances[sourceIndex]" @input="scheduleRecalc">
                  </div>
                </div>
                <div class="form-row form-row-3">
                  <div class="form-group">
                    <label>对焊管座</label>
                    <select v-model="point.weldedBoss" @change="scheduleRecalc">
                      <option :value="null" disabled>请选择</option>
                      <option :value="false">否</option>
                      <option :value="true">是</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>双相钢材料</label>
                    <select v-model="point.duplexSteel" @change="scheduleRecalc">
                      <option :value="null" disabled>请选择</option>
                      <option :value="false">否</option>
                      <option :value="true">是</option>
                    </select>
                  </div>
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
                <div class="result-item" @click="openMetric('sources', (hfaResult.sources || []).length)">
                  <div class="label">声源数量</div>
                  <div class="value">{{ (hfaResult.sources || []).length }}</div>
                </div>
                <div class="result-item" @click="openMetric('discontinuities', (hfaResult.discontinuities || []).length)">
                  <div class="label">不连续点数量</div>
                  <div class="value">{{ (hfaResult.discontinuities || []).length }}</div>
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
                  <label>SBC 结构类型</label>
                  <select v-model.number="sbc.type" @change="scheduleRecalc">
                    <option :value="null" disabled>请选择</option>
                    <option :value="1">Type 1：悬臂支管</option>
                    <option :value="2">Type 2：同主管连续支管</option>
                    <option :value="3">Type 3：带中间支撑连续支管</option>
                    <option :value="4">Type 4：跨不同主管连续支管</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>接头型式</label>
                  <select v-model="sbc.fitting" @change="scheduleRecalc">
                    <option value="" disabled>请选择</option>
                    <option v-for="item in sbcFittings" :key="item.value" :value="item.value">{{ item.label }}</option>
                  </select>
                </div>
              </div>
              <div class="form-row form-row-equal-4">
                <div class="form-group">
                  <label>支管外径 d (mm)</label>
                  <input type="number" v-model.number="sbc.od" @input="scheduleRecalc">
                </div>
                <div class="form-group">
                  <label>支管壁厚等级 Sch</label>
                  <select v-model="sbc.sbcSchedule" @change="scheduleRecalc"><option value="" disabled>请选择</option><option v-for="value in sbcSchedules" :key="value" :value="value">{{ value }}</option></select>
                </div>
                <div class="form-group">
                  <label>支管总长度 L (mm)</label>
                  <input type="number" v-model.number="sbc.l" @input="scheduleRecalc">
                </div>
                <div class="form-group">
                  <label>阀门数量</label>
                  <input type="number" min="0" step="1" v-model.number="sbc.valveCount" @input="scheduleRecalc">
                </div>
              </div>
              <div class="form-row form-row-equal-4">
                <div class="form-group">
                  <label>主管外径 Dext (mm)</label>
                  <input type="number" v-model.number="sbc.mainOd" @input="scheduleRecalc">
                </div>
                <div class="form-group">
                  <label>主管壁厚等级 Sch</label>
                  <select v-model="sbc.mainSchedule" @change="scheduleRecalc"><option value="" disabled>请选择</option><option v-for="value in sbcSchedules" :key="value" :value="value">{{ value }}</option></select>
                </div>
                <div class="form-group">
                  <label>主管 LOF</label>
                  <input type="number" min="0" max="1" step="0.01" v-model.number="sbc.mainLof" @input="scheduleRecalc">
                </div>
                <div class="form-group">
                  <label>支管在主管上的位置</label>
                  <select v-model="sbc.location" @change="scheduleRecalc">
                    <option value="" disabled>请选择</option><option value="valve">阀门/变径/弯头/三通附近 ±10D</option><option value="mid_span">跨中</option><option value="partial_support">部分限位支撑 ±2D</option><option value="fixed_support">固定支撑 ±2D</option>
                  </select>
                </div>
              </div>
              <div class="form-row form-row-2">
                <div class="form-group"><label>ANSI 900 及以上阀门</label><select v-model="sbc.ansi900plus" @change="scheduleRecalc"><option :value="null" disabled>请选择</option><option :value="false">否</option><option :value="true">是</option></select></div>
              </div>
              <div v-if="sbc.type === 2 || sbc.type === 3" class="form-row form-row-equal-4">
                <div class="form-group"><label>第一侧/第一跨长度 (mm)</label><input type="number" v-model.number="sbc.firstSpanLength" @input="scheduleRecalc"></div>
                <div class="form-group"><label>第二侧/后续跨长度 (mm)</label><input type="number" v-model.number="sbc.subSpanLength" @input="scheduleRecalc"></div>
                <div v-if="sbc.type === 2" class="form-group"><label>第二侧阀门数</label><input type="number" min="0" step="1" v-model.number="sbc.sideBValveCount" @input="scheduleRecalc"></div>
                <template v-if="sbc.type === 3">
                  <div class="form-group"><label>第一跨有未支撑质量</label><select v-model="sbc.hasMass" @change="scheduleRecalc"><option :value="null" disabled>请选择</option><option :value="true">是</option><option :value="false">否</option></select></div>
                  <div class="form-group"><label>后续跨有未支撑质量</label><select v-model="sbc.hasMassSub" @change="scheduleRecalc"><option :value="null" disabled>请选择</option><option :value="true">是</option><option :value="false">否</option></select></div>
                </template>
              </div>
              <div v-if="sbc.type === 4" class="form-row form-row-2">
                <div class="form-group"><label>端部 A 长度 (mm)</label><input type="number" v-model.number="sbc.endALength" @input="scheduleRecalc"></div>
                <div class="form-group"><label>端部 B 长度 (mm)</label><input type="number" v-model.number="sbc.endBLength" @input="scheduleRecalc"></div>
              </div>
              <div class="result-box mt-12">
                <div class="result-item" @click="openSbcMetric('lofGeom')"><div class="label">LOF_GEOM</div><div class="value">{{ fmt(sbcResult.lofGeom, 3) }}</div></div>
                <div class="result-item" @click="openSbcMetric('lofLoc')"><div class="label">LOF_LOC</div><div class="value">{{ fmt(sbcResult.lofLoc, 3) }}</div></div>
                <div v-if="sbc.type === 3" class="result-item" @click="openSbcMetric('modifierFirst')"><div class="label">第一跨 Modifier</div><div class="value">{{ fmt(sbcResult.modifierFirst, 3) }}</div></div>
                <div v-if="sbc.type === 3" class="result-item" @click="openSbcMetric('modifierSub')"><div class="label">后续跨 Modifier</div><div class="value">{{ fmt(sbcResult.modifierSub, 3) }}</div></div>
                <div class="result-item" @click="openSbcMetric('modifier')"><div class="label">SBC Modifier</div><div class="value">{{ fmt(sbcResult.modifier, 3) }}</div></div>
                <div class="result-item" @click="openSbcMetric('mainLof')"><div class="label">主管 LOF</div><div class="value">{{ fmt(sbcResult.mainLof, 3) }}</div></div>
                <div class="result-item" @click="openSbcMetric('LOF')">
                  <div class="label">SBC_LOF</div>
                  <div class="value">{{ fmt(sbcResult.lof, 3) }}</div>
                </div>
                <div class="result-item" @click="openSbcMetric('level')">
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
                    <option value="" disabled>请选择</option>
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
                    <option value="" disabled>请选择</option>
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
                <div class="result-item" @click="openThermoMetric('Dint')">
                  <div class="label">内径 Dint (mm)</div>
                  <div class="value">{{ fmt(thermoResult.Dint, 2) }}</div>
                </div>
                <div class="result-item" @click="openThermoMetric('Re')">
                  <div class="label">雷诺数 Re</div>
                  <div class="value">{{ fmtExp(thermoResult.Re) }}</div>
                </div>
                <div class="result-item" @click="openThermoMetric('fn')">
                  <div class="label">固有频率 fn (Hz)</div>
                  <div class="value">{{ fmt(thermoResult.fn, 2) }}</div>
                </div>
                <div class="result-item" @click="openThermoMetric('FeFn')">
                  <div class="label">Fe / fn</div>
                  <div class="value">{{ fmt(thermoResult.FeFn, 4) }}</div>
                </div>
                <div class="result-item" @click="openThermoMetric('LOF')">
                  <div class="label">涡激 LOF</div>
                  <div class="value" style="color: var(--danger)">{{ fmt(thermoResult.LOF, 2) }}</div>
                </div>
                <div class="result-item" @click="openThermoMetric('level')">
                  <div class="label">风险等级</div>
                  <div class="value">
                    <span class="badge" :class="riskBadgeClass(thermoLevel)">{{ thermoLevel }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-show="paramTab === 'other'" class="tab-panel">
              <div class="section-title">往复脉动</div>
              <div class="form-row form-row-equal-4">
                <div class="form-group"><label>设备功率 (kW)</label><input type="number" v-model.number="other.reciprocating.power" @input="scheduleRecalc"></div>
                <div class="form-group"><label>排放压力 (bar)</label><input type="number" v-model.number="other.reciprocating.pressure" @input="scheduleRecalc"></div>
                <div class="form-group"><label>具有脉动分析报告</label><select v-model="other.reciprocating.hasReport" @change="scheduleRecalc"><option :value="null" disabled>请选择</option><option :value="true">是</option><option :value="false">否</option></select></div>
                <div class="form-group"><label>通过 API 618 分析</label><select v-model="other.reciprocating.passApi618" @change="scheduleRecalc"><option :value="null" disabled>请选择</option><option :value="true">是</option><option :value="false">否</option></select></div>
              </div>
              <div class="section-title">离心旋转失速</div>
              <div class="form-row form-row-3">
                <div class="form-group"><label>失速特性已知</label><select v-model="other.rotatingStall.known" @change="scheduleRecalc"><option :value="null" disabled>请选择</option><option :value="true">是</option><option :value="false">否</option></select></div>
                <div class="form-group"><label>存在失速特性</label><select v-model="other.rotatingStall.hasStall" @change="scheduleRecalc"><option :value="null" disabled>请选择</option><option :value="true">是</option><option :value="false">否</option></select></div>
                <div class="form-group"><label>处于低流量工况</label><select v-model="other.rotatingStall.lowFlow" @change="scheduleRecalc"><option :value="null" disabled>请选择</option><option :value="true">是</option><option :value="false">否</option></select></div>
              </div>
              <div class="section-title">死支管涡激</div>
              <div class="form-row form-row-equal-4">
                <div class="form-group"><label>死支管外径 (mm)</label><input type="number" v-model.number="other.deadBranch.branchDiameter" @input="scheduleRecalc"></div>
                <div class="form-group"><label>死支管长度 (m)</label><input type="number" v-model.number="other.deadBranch.branchLength" @input="scheduleRecalc"></div>
                <div class="form-group"><label>雷诺数 Re（自动）</label><input type="number" :value="other.deadBranch.reynolds" readonly></div>
                <div class="form-group"><label>临界管径 dcrit (mm)（自动）</label><input type="number" :value="other.deadBranch.criticalDiameter" readonly></div>
                <div class="form-group"><label>频率比 Fe/Fs（自动）</label><input type="number" step="0.001" :value="other.deadBranch.frequencyRatio" readonly></div>
              </div>
              <div class="section-title">阀门水锤</div>
              <div class="form-row form-row-equal-4">
                <div class="form-group"><label>工况类型</label><select v-model="other.waterHammer.type" @change="scheduleRecalc"><option value="">请选择</option><option value="干气阀门快速打开">干气阀门快速打开</option><option value="液体或多相阀打开">液体或多相阀打开</option><option value="液体或多相阀关闭">液体或多相阀关闭</option></select></div>
                <div class="form-group"><label>最大冲击力 Fmax（自动）</label><input type="number" :value="other.waterHammer.maxImpactForce" readonly></div>
                <div class="form-group"><label>公称壁厚 (mm)</label><input type="number" v-model.number="other.waterHammer.nominalThickness" @input="scheduleRecalc"></div>
                <div class="form-group"><label>允许荷载 Flim（自动）</label><input type="number" :value="other.waterHammer.loadLimit" readonly></div>
              </div>
              <div class="section-title">空化闪蒸</div>
              <div class="form-row form-row-equal-4">
                <div class="form-group"><label>上游压力 P1 (Pa)</label><input type="number" v-model.number="other.cavitation.upstreamPressure" @input="scheduleRecalc"></div>
                <div class="form-group"><label>下游压力 P2 (Pa)</label><input type="number" v-model.number="other.cavitation.downstreamPressure" @input="scheduleRecalc"></div>
                <div class="form-group"><label>饱和蒸汽压 Pv (Pa)（按温度自动）</label><input type="number" :value="other.cavitation.vaporPressure" readonly></div>
                <div class="form-group"><label>压力恢复系数 FL（按阀门类型自动）</label><input type="number" step="0.001" :value="other.cavitation.pressureRecoveryFactor" readonly></div>
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
              <div class="result-item" @click="openOverallTrace">
                <div class="label">综合 LOF</div>
                <div class="value">{{ hasEvaluationResult ? fmt(mainLof, 2) : "-" }}</div>
              </div>
              <div class="result-item" @click="openOverallTrace">
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

        <div class="card">
          <div class="card-header">
            <div class="card-title">正式评估与版本保存</div>
          </div>
          <div class="card-body">
            <div class="form-row form-row-2">
              <div class="form-group">
                <label>关联定性评估版本</label>
                <input type="text" :value="tm01AssessmentId || '未保存定性评估版本'" readonly>
              </div>
              <div class="form-group">
                <label>评估备注</label>
                <input type="text" v-model="remarks" placeholder="可填写本次定量评估说明">
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
                    <th>Main_LOF</th>
                    <th>风险等级</th>
                    <th>创建时间</th>
                    <th>备注</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="!history.length">
                    <td colspan="5" class="text-muted" style="text-align:center">暂无保存记录</td>
                  </tr>
                  <tr
                    v-for="row in history"
                    :key="row.id"
                    style="cursor: pointer"
                    @click="loadHistoryDetail(row)"
                  >
                    <td>V{{ row.versionNo }}</td>
                    <td>{{ fmt(row.maxLof, 4) }}</td>
                    <td>{{ riskText(row.riskLevel) }}</td>
                    <td>{{ row.createDate || '-' }}</td>
                    <td>{{ row.remarks || '-' }}</td>
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
      </div>

      <lof-trace-drawer
        :visible.sync="drawerVisible"
        :trace="drawerTrace"
      ></lof-trace-drawer>
    </div>
  </div>
</template>

<script>
import breadcrumb from "@/components/common/breadcrumb";
import LofTraceDrawer from "./components/LofTraceDrawer";
import directoryMixin from "./directoryMixin";
import api from "./api";
import {
  num,
  pickNum,
  fmt,
  fmtExp,
  riskLevel,
  riskBadgeClass,
  controlAdvice,
  calculateSupportType
} from "./utils";
import "./lof.css";

const FACTOR_DEFINITIONS = [
  { id: "f1", name: "流动湍流", note: "按管段工况参数计算" },
  { id: "f2", name: "高频声学", note: "按声源和不连续点参数计算" },
  { id: "f3", name: "机械激励", note: "按配套设备类型查表" },
  { id: "f4", name: "往复脉动", note: "按功率、压力、脉动报告和 API 618 结论计算" },
  { id: "f5", name: "离心旋转失速", note: "按失速特性和低流量工况计算" },
  { id: "f6", name: "死支管涡激", note: "先比较支管直径与临界管径，再判断 Fe/Fs" },
  { id: "f7", name: "阀门水锤", note: "按工况判断，通常取 Fmax / Flim" },
  { id: "f8", name: "空化闪蒸", note: "由压降和蒸汽压判断是否发生及机理" }
];

const FACTOR_TRACE = {
  f1: { meaning: "流动介质湍流脉动对管道产生的振动失效可能性。", formula: "LOF = ρ × v² × FVF / Fv" },
  f2: { meaning: "节流、压降和音速流形成的高频声学能量对不连续点的影响。", formula: "按各声源PWL、沿程衰减、不连续点修正和材料修正计算LOF。" },
  f3: { meaning: "配套旋转或往复设备传递到管道的机械振动风险。", formula: "根据设备类型对应的机械激励LOF表取值。" },
  f4: { meaning: "往复泵或压缩机产生的压力脉动风险。", formula: "根据设备功率、排放压力、脉动报告及API 618/674符合性分级。" },
  f5: { meaning: "离心设备在低流量或失速工况下产生的激励风险。", formula: "特性未知取1.0；已知且无失速取0.2；已知有失速时，低流量取1.0，否则取0.4。" },
  f6: { meaning: "封闭死支管内声学驻波与主管激励耦合产生的风险。", formula: "支管直径小于临界管径取0.2；否则Fe/Fs≥1取1.0，低于1取0.29。" },
  f7: { meaning: "快动阀动作造成瞬态压力冲击的风险。", formula: "通常LOF=Fmax/Flim；液体或多相阀关闭且由原始参数计算时，另按关阀工况条件判定。Ψ已用于Flim，不再重复相乘。" },
  f8: { meaning: "阀后压力低于饱和蒸汽压时产生空化或闪蒸的风险。", formula: "压降/判定阈值＜1取0；否则下游压力≥饱和蒸汽压为空化取0.7，低于饱和蒸汽压为闪蒸取1.0。" }
};

const HFA_METRICS = {
  Dint: { name: "内径 Dint", meaning: "主管的有效流通内径。", formula: "Dint = Dext - 2 × T" },
  A: { name: "流通面积 A", meaning: "介质流经主管内孔的截面积。", formula: "A = π × Dint² / 4" },
  v: { name: "流速 v", meaning: "由质量流量、密度和流通面积换算得到的介质速度。", formula: "v = Q / (ρ × A)" },
  sources: { name: "声源数量", meaning: "参与本次高频声学计算的独立声源数量。", formula: "读取高频声学配置中的有效声源列表并计数。" },
  discontinuities: { name: "不连续点数量", meaning: "接受声学能量并参与风险判定的管道不连续点数量。", formula: "读取高频声学配置中的有效不连续点列表并计数。" },
  LOF: { name: "高频声学 LOF", meaning: "多声源在管道不连续点形成的高频声学失效可能性。", formula: "由PWL、距离衰减、几何与材料修正后的最大不连续点结果确定。" }
};

/** 高频声学配置数量上限，避免一次生成过多表单和距离组合。 */
const HFA_COUNT_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const SBC_METRICS = {
  lofGeom: { name: "LOF_GEOM", meaning: "按结构类型及接头、壁厚、跨距等求得的几何风险。", formula: "Type 1 五项评分均值；Type 2 两侧取较大值；Type 3/4 按跨距曲线和端部评分取较大值。" },
  lofLoc: { name: "LOF_LOC", meaning: "主管位置与壁厚对应的位置风险。", formula: "主管 LOF 达到 1 时取 1，否则取位置评分和主管 Sch 评分的平均值。" },
  modifier: { name: "SBC Modifier", meaning: "用于修正主管 LOF 的小管系数。", formula: "min(LOF_GEOM, LOF_LOC)" },
  modifierFirst: { name: "第一跨 SBC Modifier", meaning: "Type 3 第一跨的独立修正因子。", formula: "min(LOF_GEOM(first span), LOF_LOC)" },
  modifierSub: { name: "后续跨 SBC Modifier", meaning: "Type 3 后续跨的独立修正因子。", formula: "min(LOF_GEOM(subsequent spans), LOF_LOC)" },
  mainLof: { name: "主管 LOF", meaning: "本次 SBC 评估输入的主管失效可能性。", formula: "由主管评估结果填写；不得使用包含 SBC 的综合结果循环代入。" },
  LOF: { name: "SBC_LOF", meaning: "小管连接的失效可能性。", formula: "SBC_LOF = min(1, 主管 LOF × SBC Modifier)" },
  level: { name: "SBC风险等级", meaning: "根据SBC_LOF映射得到的风险等级。", formula: "LOF≥0.8为High；0.5≤LOF＜0.8为Medium；LOF＜0.5为Low。" }
};

const SBC_FITTINGS = [
  ["short_contoured_body", "短轮廓体三通"], ["contoured_body", "标准轮廓体三通"],
  ["forged_reducing_tee", "锻制异径三通"], ["welded_tee", "对焊三通"],
  ["weldolet", "对焊支管台"], ["threadolet_fbw", "螺纹支管台（全背焊）"],
  ["screwed_fbw", "螺纹接头（全背焊）"], ["threadolet", "螺纹支管台"],
  ["screwed", "螺纹接头"], ["sockolet", "承插支管台"],
  ["threadolet_pbw", "螺纹支管台（部分背焊）"], ["screwed_pbw", "螺纹接头（部分背焊）"],
  ["set_on", "安置式支管台"], ["set_in", "嵌入式支管台"], ["set_thru", "贯穿式支管台"]
].map(([value, label]) => ({ value, label }));

function defaultSbc() {
  return {
    type: null, od: null, l: null, fitting: "", sbcSchedule: "", valveCount: null,
    mainOd: null, mainSchedule: "", mainLof: null, location: "", ansi900plus: null,
    firstSpanLength: null, subSpanLength: null, sideBValveCount: null,
    hasMass: null, hasMassSub: null, endALength: null, endBLength: null
  };
}

const THERMO_METRICS = {
  Dint: { name: "内径 Dint", meaning: "热电偶套管安装位置处的主管流通内径。", formula: "Dint = Dext - 2 × T" },
  Re: { name: "雷诺数 Re", meaning: "表征套管位置流体流动状态的无量纲参数。", formula: "Re = ρf × v × Dint / μ" },
  fn: { name: "固有频率 fn", meaning: "热电偶套管悬臂结构的一阶固有频率。", formula: "根据套管类型、几何尺寸、弹性模量和材料密度计算。" },
  FeFn: { name: "频率比 Fe/fn", meaning: "涡流激励频率与套管固有频率之比。", formula: "Fe/fn" },
  LOF: { name: "热电偶套管涡激 LOF", meaning: "套管发生涡激共振的失效可能性。", formula: "Fe/fn≥0.8时LOF=1.0，否则LOF=0.29。" },
  level: { name: "热电偶套管风险等级", meaning: "根据涡激LOF映射得到的风险等级。", formula: "LOF≥0.8为High；0.5≤LOF＜0.8为Medium；LOF＜0.5为Low。" }
};

function defaultHfa() {
  return {
    P: null,
    TP: null,
    c: null,
    Mw: null,
    Dext: null,
    T: null,
    Q: null,
    rho: null,
    sourceCount: 1,
    discontinuityCount: 1,
    sources: [defaultHfaSource()],
    discontinuities: [defaultHfaDiscontinuity(1)]
  };
}

function defaultHfaSource() {
  return {
    name: "",
    hasSilencer: null,
    reduction: null,
    sonic: null,
    upstreamPressure: null,
    downstreamPressure: null,
    upstreamTemperature: null
  };
}

function defaultHfaDiscontinuity(sourceCount) {
  return {
    name: "",
    branchOuterDiameter: null,
    branchThickness: null,
    distance: null,
    sourceDistances: Array(Number(sourceCount) || 1).fill(null),
    weldedBoss: null,
    duplexSteel: null
  };
}

function defaultOtherMechanisms() {
  return {
    reciprocating: {
      power: null,
      pressure: null,
      hasReport: null,
      passApi618: null
    },
    rotatingStall: {
      known: null,
      hasStall: null,
      lowFlow: null
    },
    deadBranch: {
      branchDiameter: null,
      branchLength: null,
      reynolds: null,
      criticalDiameter: null,
      frequencyRatio: null
    },
    waterHammer: {
      type: "",
      maxImpactForce: null,
      nominalThickness: null,
      loadLimit: null
    },
    cavitation: {
      upstreamPressure: null,
      downstreamPressure: null,
      pressureDrop: null,
      vaporPressure: null,
      valveType: "",
      pressureRecoveryFactor: null,
      delta: null,
      mechanism: ""
    }
  };
}

function defaultThermo() {
  return {
    P: null,
    TP: null,
    Dext: null,
    T: null,
    Sch: null,
    reinforcement: "",
    rhoF: null,
    v: null,
    mu: null,
    twType: "",
    Ltw: null,
    dtw: null,
    Etw: null,
    rhoTw: null,
    Dtw: null,
    D1: null,
    D2: null,
    L1: null,
    L2: null
  };
}

function defaultParams() {
  return {
    kks: "",
    od: null,
    thickness: null,
    span: null,
    support: "",
    fn: null,
    rho: null,
    v: null,
    pressure: null,
    temperature: null,
    massFlow: null,
    viscosity: null,
    fluid: "",
    equipmentType: ""
  };
}

export default {
  mixins: [directoryMixin],
  components: { breadcrumb, LofTraceDrawer },
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
      other: defaultOtherMechanisms(),
      thermo: defaultThermo(),
      sbc: defaultSbc(),
      hfaCountOptions: HFA_COUNT_OPTIONS,
      sbcFittings: SBC_FITTINGS,
      sbcSchedules: ["10S", "20", "30", "40", "60", "80", "120", "160", ">160", "STD", "XS", "XXS"],
      factors: [],
      hfaResult: null,
      thermoResult: null,
      sbcResult: { lof: null, level: "-" },
      mainLof: 0,
      hasEvaluationResult: false,
      drawerVisible: false,
      drawerTrace: { title: "计算追溯详情", sections: [] },
      tm01AssessmentId: "",
      remarks: "",
      evaluating: false,
      saving: false,
      history: [],
      historyCurrent: 1,
      historySize: 10,
      historyTotal: 0
    };
  },
  computed: {
    xValue() {
      const outerDiameter = num(this.params.od);
      const span = num(this.params.span);
      if (outerDiameter <= 0 || span <= 0) return "-";
      return (span / (outerDiameter / 1000)).toFixed(2);
    },
    xThresholds() {
      const od = num(this.params.od);
      if (od <= 0) return [];
      if (od >= 400) return [20, 40, 60];
      if (od >= 200) return [16, 32, 48];
      return [12, 24, 36];
    },
    xThresholdsText() {
      return this.xThresholds.length ? this.xThresholds.join(" / ") : "-";
    },
    mainLevel() {
      return this.hasEvaluationResult ? riskLevel(this.mainLof) : "-";
    },
    thermoLevel() {
      return this.thermoResult ? riskLevel(this.thermoResult.LOF) : "-";
    },
    advice() {
      return this.hasEvaluationResult ? controlAdvice(this.mainLof) : "请先执行定量评估";
    }
  },
  methods: {
    fmt: fmt,
    fmtExp: fmtExp,
    riskBadgeClass: riskBadgeClass,
    onSegmentChange(id) {
      this.tm01AssessmentId = "";
      this.history = [];
      this.historyCurrent = 1;
      this.historyTotal = 0;
      this.params = defaultParams();
      this.hfa = defaultHfa();
      this.other = defaultOtherMechanisms();
      this.thermo = defaultThermo();
      this.sbc = defaultSbc();
      this.hfaResult = null;
      this.thermoResult = null;
      this.sbcResult = { lof: null, level: "-" };
      this.mainLof = 0;
      this.hasEvaluationResult = false;
      this.loadSegmentDetail(id);
      if (id) {
        this.loadLatestTm01();
        this.loadHistoryPage();
      }
    },
    onSegmentLoaded(detail) {
      this.applySegment(detail);
    },
    applySegment(detail) {
      if (!detail) return;
      this.params.kks = detail.pipeStandardKks || detail.nodeName || detail.kks || "";
      this.params.od = pickNum(detail.outerDiameter, null);
      this.params.thickness = pickNum(detail.wallThickness, null);
      this.params.span = pickNum(detail.spanReference, null);
      this.refreshSupportType();
      this.params.fn = pickNum(detail.naturalFrequency, null);
      this.params.rho = pickNum(detail.fluidDensity, null);
      this.params.v = pickNum(detail.maxVelocity, null);
      this.params.pressure = pickNum(detail.operatingPressure, null);
      this.params.temperature = pickNum(detail.operatingTemperature, null);
      this.params.massFlow = pickNum(detail.massFlow, null);
      this.params.viscosity = pickNum(detail.viscosity, null);
      this.params.fluid = detail.fluidMedium || detail.mediumName || detail.fluid || "";
      this.params.fluid = detail.workingMedium || this.params.fluid;
      this.params.equipmentType = detail.equipmentType || "";
      this.hfa.P = this.params.pressure;
      this.hfa.TP = this.params.temperature;
      this.hfa.Dext = this.params.od;
      this.hfa.T = this.params.thickness;
      this.hfa.rho = this.params.rho;
      this.thermo.Dext = this.params.od;
      this.thermo.T = this.params.thickness;
      this.thermo.P = this.params.pressure;
      this.thermo.TP = this.params.temperature;
      this.thermo.rhoF = this.params.rho;
      this.thermo.v = this.params.v;
      this.thermo.mu = this.params.viscosity;
    },
    /**
     * 用户修改输入后清除上一次后端评估结果，避免旧结果被误认为是当前参数的计算结果。
     */
    scheduleRecalc() {
      this.refreshSupportType();
      this.factors = [];
      this.hfaResult = null;
      this.thermoResult = null;
      this.sbcResult = { lof: null, level: "-" };
      this.mainLof = 0;
      this.hasEvaluationResult = false;
    },
    /**
     * 按当前页面输入的跨距和外径实时更新支撑类型。
     * 无效尺寸清空类型，防止沿用上一次管段或测试数据中的旧值。
     */
    refreshSupportType() {
      this.params.support = calculateSupportType(this.params.span, this.params.od);
    },
    /**
     * 按声源数调整声源表单和每个不连续点的距离数组，缩减时保留前面的已填数据。
     */
    syncHfaSourceCount() {
      const targetCount = Number(this.hfa.sourceCount) || 1;
      while (this.hfa.sources.length < targetCount) {
        this.hfa.sources.push(defaultHfaSource());
      }
      if (this.hfa.sources.length > targetCount) {
        this.hfa.sources.splice(targetCount);
      }
      this.hfa.discontinuities.forEach(point => {
        const legacyDistance = point.distance;
        const distances = Array.isArray(point.sourceDistances)
          ? point.sourceDistances.slice(0, targetCount)
          : [];
        while (distances.length < targetCount) {
          distances.push(legacyDistance == null ? null : legacyDistance);
        }
        this.$set(point, "sourceDistances", distances);
      });
      this.scheduleRecalc();
    },
    /**
     * 按不连续点数调整配置块，新增点同时创建与当前声源数一致的距离数组。
     */
    syncHfaDiscontinuityCount() {
      const targetCount = Number(this.hfa.discontinuityCount) || 1;
      while (this.hfa.discontinuities.length < targetCount) {
        this.hfa.discontinuities.push(defaultHfaDiscontinuity(this.hfa.sourceCount));
      }
      if (this.hfa.discontinuities.length > targetCount) {
        this.hfa.discontinuities.splice(targetCount);
      }
      this.scheduleRecalc();
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
        tm01AssessmentId: this.tm01AssessmentId || null,
        segmentParameters: {
          span: this.params.span,
          naturalFrequency: this.params.fn,
          supportType: this.params.support,
          outerDiameter: this.params.od,
          thickness: this.params.thickness,
          fluidDensity: this.params.rho,
          velocity: this.params.v,
          viscosity: this.params.viscosity,
          massFlow: this.params.massFlow,
          pressure: this.params.pressure,
          temperature: this.params.temperature,
          workingMedium: this.params.fluid,
          equipmentType: this.params.equipmentType
        },
        highFrequencyAcoustic: {
          pressure: this.hfa.P,
          temperature: this.hfa.TP,
          soundSpeed: this.hfa.c,
          molecularWeight: this.hfa.Mw,
          outerDiameter: this.hfa.Dext,
          thickness: this.hfa.T,
          massFlow: this.hfa.Q,
          fluidDensity: this.hfa.rho,
          sources: this.hfa.sources,
          discontinuities: this.hfa.discontinuities.map(point => Object.assign({}, point, {
            // 旧版后端和历史快照仍可读取首个距离；新算法使用完整距离数组。
            distance: point.sourceDistances && point.sourceDistances.length
              ? point.sourceDistances[0]
              : point.distance
          }))
        },
        sbc: {
          type: this.sbc.type,
          outerDiameter: this.sbc.od,
          cantileverLength: this.sbc.l,
          fitting: this.sbc.fitting,
          sbcSchedule: this.sbc.sbcSchedule,
          valveCount: this.sbc.valveCount,
          mainOuterDiameter: this.sbc.mainOd,
          mainSchedule: this.sbc.mainSchedule,
          mainLof: this.sbc.mainLof,
          location: this.sbc.location,
          ansi900plus: this.sbc.ansi900plus,
          firstSpanLength: this.sbc.firstSpanLength,
          subSpanLength: this.sbc.subSpanLength,
          sideBValveCount: this.sbc.sideBValveCount,
          hasMass: this.sbc.hasMass,
          hasMassSub: this.sbc.hasMassSub,
          endALength: this.sbc.endALength,
          endBLength: this.sbc.endBLength
        },
        thermowell: {
          pressure: this.thermo.P,
          temperature: this.thermo.TP,
          outerDiameter: this.thermo.Dext,
          thickness: this.thermo.T,
          schedule: this.thermo.Sch,
          reinforcement: this.thermo.reinforcement,
          fluidDensity: this.thermo.rhoF,
          velocity: this.thermo.v,
          viscosity: this.thermo.mu,
          type: this.thermo.twType,
          length: this.thermo.Ltw,
          boreDiameter: this.thermo.dtw,
          youngModulus: this.thermo.Etw,
          materialDensity: this.thermo.rhoTw,
          outerDiameterStraight: this.thermo.Dtw,
          baseDiameter: this.thermo.D1,
          tipDiameter: this.thermo.D2,
          largeSectionLength: this.thermo.L1,
          smallSectionLength: this.thermo.L2
        },
        reciprocating: Object.assign({}, this.other.reciprocating),
        rotatingStall: Object.assign({}, this.other.rotatingStall),
        deadBranch: Object.assign({}, this.other.deadBranch, {
          soundSpeed: this.hfa.c,
          mainInnerDiameter: this.params.od != null && this.params.thickness != null
            ? Number(this.params.od) - 2 * Number(this.params.thickness)
            : null,
          velocity: this.params.v,
          fluidDensity: this.params.rho,
          viscosity: this.params.viscosity
        }),
        waterHammer: Object.assign({}, this.other.waterHammer, {
          fluidDensity: this.params.rho,
          velocity: this.params.v,
          outerDiameter: this.params.od,
          thickness: this.params.thickness,
          span: this.params.span
        }),
        cavitation: Object.assign({}, this.other.cavitation, {
          temperature: this.params.temperature
        }),
        remarks: this.remarks || null
      };
    },
    applyBackendResult(data) {
      if (!data) return;
      const factorResults = data.factorResults || {};
      const maxLof = num(data.maxLof);
      this.factors = FACTOR_DEFINITIONS.map(definition => {
        const backend = factorResults[definition.id] || {};
        return Object.assign({}, definition, backend, {
          LOF: backend.LOF != null ? Number(backend.LOF) : null,
          note: backend.note || definition.note,
          isMax: backend.LOF != null && Number(backend.LOF) === maxLof
        });
      });
      if (factorResults.f2) this.hfaResult = factorResults.f2;
      if (factorResults.tm03) {
        const lof = factorResults.tm03.LOF != null
          ? Number(factorResults.tm03.LOF)
          : null;
        this.sbcResult = {
          lof: lof,
          lofGeom: factorResults.tm03.lofGeom,
          lofLoc: factorResults.tm03.lofLoc,
          modifierFirst: factorResults.tm03.modifierFirst,
          modifierSub: factorResults.tm03.modifierSub,
          modifier: factorResults.tm03.modifier,
          mainLof: factorResults.tm03.mainLof,
          level: lof != null ? riskLevel(lof) : "-"
        };
      }
      if (factorResults.tm04) this.thermoResult = factorResults.tm04;
      const f6 = factorResults.f6 || {};
      Object.assign(this.other.deadBranch, {
        reynolds: f6.reynolds,
        criticalDiameter: f6.criticalDiameter,
        frequencyRatio: f6.frequencyRatio
      });
      const f7 = factorResults.f7 || {};
      Object.assign(this.other.waterHammer, {
        maxImpactForce: f7.maxImpactForce,
        loadLimit: f7.loadLimit
      });
      const f8 = factorResults.f8 || {};
      Object.assign(this.other.cavitation, {
        pressureDrop: f8.pressureDrop,
        vaporPressure: f8.vaporPressure,
        pressureRecoveryFactor: f8.pressureRecoveryFactor,
        delta: f8.delta,
        mechanism: f8.mechanism
      });
      this.mainLof = maxLof;
      this.hasEvaluationResult = true;
      this.remarks = data.remarks || "";
    },
    evaluateTm02() {
      if (!this.segmentId) {
        this.$message.warning("请选择管段");
        return;
      }
      this.evaluating = true;
      api.evaluateTm02(this.buildPayload()).then(res => {
        this.evaluating = false;
        if (!this.isSuccessCode(res && res.code)) {
          this.$message.error((res && res.msg) || "定量评估失败");
          return;
        }
        this.applyBackendResult(res.data);
        this.$message.success((res && res.msg) || "定量评估完成");
      }).catch(error => {
        this.evaluating = false;
        this.$message.error(this.errorMessage(error, "定量评估失败"));
      });
    },
    saveTm02() {
      if (!this.segmentId) {
        this.$message.warning("请选择管段");
        return;
      }
      this.$confirm("保存后将生成新的定量评估版本，是否继续？", "保存确认", {
        type: "warning"
      }).then(() => {
        this.saving = true;
        return api.saveTm02(this.buildPayload());
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
    loadLatestTm01() {
      api.pageHistory({
        segmentId: this.segmentId,
        current: 1,
        size: 1
      }).then(res => {
        if (!this.isSuccessCode(res && res.code)) return;
        const records = this.unwrapList(res.data);
        this.tm01AssessmentId = records.length ? records[0].id : "";
      }).catch(() => {
        this.tm01AssessmentId = "";
      });
    },
    loadHistoryPage() {
      if (!this.segmentId) return;
      api.pageTm02History({
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
      api.getTm02Detail(row.id).then(res => {
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
      const segment = inputs.segmentParameters || {};
      const hfa = inputs.highFrequencyAcoustic || {};
      const sbc = inputs.sbc || {};
      const thermo = inputs.thermowell || {};
      const sourceList = Array.isArray(hfa.sources) && hfa.sources.length
        ? hfa.sources.map(source => Object.assign(defaultHfaSource(), source))
        : [defaultHfaSource()];
      const discontinuityList = Array.isArray(hfa.discontinuities) && hfa.discontinuities.length
        ? hfa.discontinuities.map(point => {
          const normalized = Object.assign(defaultHfaDiscontinuity(sourceList.length), point);
          const configuredDistances = Array.isArray(point.sourceDistances)
            ? point.sourceDistances.slice(0, sourceList.length)
            : [];
          while (configuredDistances.length < sourceList.length) {
            configuredDistances.push(point.distance == null ? null : point.distance);
          }
          normalized.sourceDistances = configuredDistances;
          return normalized;
        })
        : [defaultHfaDiscontinuity(sourceList.length)];
      Object.assign(this.params, {
        span: segment.span,
        fn: segment.naturalFrequency,
        support: segment.supportType,
        od: segment.outerDiameter,
        thickness: segment.thickness,
        rho: segment.fluidDensity,
        v: segment.velocity,
        viscosity: segment.viscosity,
        massFlow: segment.massFlow,
        pressure: segment.pressure,
        temperature: segment.temperature,
        fluid: segment.workingMedium,
        equipmentType: segment.equipmentType
      });
      this.refreshSupportType();
      Object.assign(this.hfa, {
        P: hfa.pressure,
        TP: hfa.temperature,
        c: hfa.soundSpeed,
        Mw: hfa.molecularWeight,
        Dext: hfa.outerDiameter,
        T: hfa.thickness,
        Q: hfa.massFlow,
        rho: hfa.fluidDensity,
        sourceCount: sourceList.length,
        discontinuityCount: discontinuityList.length,
        sources: sourceList,
        discontinuities: discontinuityList
      });
      Object.assign(this.sbc, {
        type: sbc.type,
        od: sbc.outerDiameter,
        l: sbc.cantileverLength,
        fitting: sbc.fitting || "",
        sbcSchedule: sbc.sbcSchedule || "",
        valveCount: sbc.valveCount,
        mainOd: sbc.mainOuterDiameter,
        mainSchedule: sbc.mainSchedule || "",
        mainLof: sbc.mainLof,
        location: sbc.location || "",
        ansi900plus: sbc.ansi900plus,
        firstSpanLength: sbc.firstSpanLength,
        subSpanLength: sbc.subSpanLength,
        sideBValveCount: sbc.sideBValveCount,
        hasMass: sbc.hasMass,
        hasMassSub: sbc.hasMassSub,
        endALength: sbc.endALength,
        endBLength: sbc.endBLength
      });
      Object.assign(this.thermo, {
        P: thermo.pressure,
        TP: thermo.temperature,
        Dext: thermo.outerDiameter,
        T: thermo.thickness,
        Sch: thermo.schedule,
        reinforcement: thermo.reinforcement,
        rhoF: thermo.fluidDensity,
        v: thermo.velocity,
        mu: thermo.viscosity,
        twType: thermo.type,
        Ltw: thermo.length,
        dtw: thermo.boreDiameter,
        Etw: thermo.youngModulus,
        rhoTw: thermo.materialDensity,
        Dtw: thermo.outerDiameterStraight,
        D1: thermo.baseDiameter,
        D2: thermo.tipDiameter,
        L1: thermo.largeSectionLength,
        L2: thermo.smallSectionLength
      });
      this.other = {
        reciprocating: Object.assign({}, defaultOtherMechanisms().reciprocating, inputs.reciprocating || {}),
        rotatingStall: Object.assign({}, defaultOtherMechanisms().rotatingStall, inputs.rotatingStall || {}),
        deadBranch: Object.assign({}, defaultOtherMechanisms().deadBranch, inputs.deadBranch || {}),
        waterHammer: Object.assign({}, defaultOtherMechanisms().waterHammer, inputs.waterHammer || {}),
        cavitation: Object.assign({}, defaultOtherMechanisms().cavitation, inputs.cavitation || {})
      };
    },
    factorCardStyle(item) {
      if (item.isMax) return { borderLeft: "4px solid var(--danger)", cursor: "pointer" };
      return { cursor: "pointer" };
    },
    traceRows(detail) {
      const labels = {
        LOF: "当前LOF", rawLof: "原始LOF", rhoV2: "ρv²", fluidDensity: "流体密度",
        velocity: "流速", FVF: "流体粘度因子FVF", Fv: "振动修正系数Fv",
        Dint: "内径Dint", A: "流通面积A", Re: "雷诺数Re", fn: "固有频率fn",
        Fe: "涡流激励频率Fe", FeFn: "频率比Fe/fn", dcrit: "临界管径dcrit",
        ratio: "计算倍率", excluded: "是否被定性评估排除", tm01Key: "对应定性评估激励",
        note: "计算说明", level: "风险等级", typeFactor: "类型系数",
        base: "基础项", K: "修正系数K", FM: "母管壁厚修正系数FM"
      };
      const hidden = { id: true, name: true, meaning: true, formula: true, isMax: true };
      return Object.keys(detail || {})
        .filter(key => !hidden[key])
        .map(key => ({ label: labels[key] || key, value: detail[key] }));
    },
    openFactor(item) {
      const meta = FACTOR_TRACE[item.id] || {};
      this.drawerTrace = {
        title: item.name + " 计算详情",
        sections: [
          { title: "指标含义", text: meta.meaning || item.note },
          { title: "计算公式 / 判定依据", type: "formula", text: meta.formula || item.note },
          { title: "本次输入与中间量", rows: this.traceRows(item) },
          {
            title: "当前结果",
            rows: [
              { label: "LOF", value: item.LOF == null ? "/" : this.fmt(item.LOF, 4) },
              { label: "是否最大贡献", value: item.isMax ? "是" : "否" },
              { label: "说明", value: item.note }
            ]
          }
        ]
      };
      this.drawerVisible = true;
    },
    openMetric(name, value) {
      const meta = HFA_METRICS[name] || { name: name, meaning: "高频声学计算中间指标。", formula: "按高频声学公式链计算。" };
      this.drawerTrace = {
        title: "高频声学 · " + meta.name,
        sections: [
          { title: "指标含义", text: meta.meaning },
          { title: "计算公式 / 取值依据", type: "formula", text: meta.formula },
          { title: "本次计算参数", rows: this.traceRows(this.hfaResult || {}) },
          { title: "当前结果", rows: [{ label: meta.name, value: value }] }
        ]
      };
      this.drawerVisible = true;
    },
    openSbcMetric(name) {
      const meta = SBC_METRICS[name];
      const result = (this.factors || []).find(item => item.id === "tm03") || {};
      this.drawerTrace = {
        title: meta.name,
        sections: [
          { title: "指标含义", text: meta.meaning },
          { title: "计算公式 / 分级依据", type: "formula", text: meta.formula },
          { title: "本次输入与中间量", rows: this.traceRows(result) },
          { title: "当前结果", rows: [
            { label: "SBC_LOF", value: this.sbcResult.lof },
            { label: "风险等级", value: this.sbcResult.level }
          ] }
        ]
      };
      this.drawerVisible = true;
    },
    openThermoMetric(name) {
      const meta = THERMO_METRICS[name];
      const value = name === "level" ? this.thermoLevel : (this.thermoResult || {})[name];
      this.drawerTrace = {
        title: meta.name,
        sections: [
          { title: "指标含义", text: meta.meaning },
          { title: "计算公式 / 分级依据", type: "formula", text: meta.formula },
          { title: "本次输入与中间量", rows: this.traceRows(this.thermoResult || {}) },
          { title: "当前结果", rows: [{ label: meta.name, value: value }] }
        ]
      };
      this.drawerVisible = true;
    },
    openOverallTrace() {
      this.drawerTrace = {
        title: "综合 LOF 计算详情",
        sections: [
          {
            title: "综合规则",
            text: "仅参与本次定量评估的激励进入比较，综合Main_LOF取各分项LOF的最大值。定性评估评分为低的关联机理不参与计算。"
          },
          {
            title: "各分项结果",
            rows: (this.factors || []).map(item => ({
              label: item.name,
              value: item.LOF == null ? "/（未参与）" : this.fmt(item.LOF, 4)
            }))
          },
          {
            title: "当前结果",
            rows: [
              { label: "Main_LOF", value: this.hasEvaluationResult ? this.fmt(this.mainLof, 4) : "-" },
              { label: "风险等级", value: this.mainLevel },
              { label: "管控建议", value: this.advice }
            ]
          }
        ]
      };
      this.drawerVisible = true;
    }
  }
};
</script>
