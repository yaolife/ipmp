import MockData from './mockTables';

/**
 * TM02 定量评估各激励机制实时计算
 * 依据：LOF分析算法和说明-2026.8.19.xlsx 各工作表示例
 */
const TM02_CALC = {};

  function num(v, def) {
    const n = parseFloat(v);
    return isFinite(n) ? n : (def || 0);
  }

  // 判断是否为气体介质
  function isGas(seg) {
    if (!seg || !seg.fluid) return false;
    const f = String(seg.fluid);
    return f.indexOf('汽') >= 0 || f.indexOf('气') >= 0 || seg.rho < 100;
  }

  // 1. 流动诱导湍流：LOF = ρv² · FVF / Fv
  //    FVF(气体)=√(1000·μ)，液体/多相流=1
  //    Fv = α · (Dext/T)^β
  TM02_CALC.computeFlowInducedTurbulence = function (seg, vi) {
    vi = vi || {};
    const P = num(seg && seg.pressure != null ? seg.pressure : vi.P);
    const TP = num(seg && seg.temperature != null ? seg.temperature : vi.TP);
    const Dext = num(seg && seg.od != null ? seg.od : vi.Dext);
    const T = num(seg && seg.thickness != null ? seg.thickness : vi.T);
    const Q = num(seg && seg.massFlow != null ? seg.massFlow : vi.Q);
    const rho = num(seg && seg.rho != null ? seg.rho : vi.rho);
    const v = num(seg && seg.v != null ? seg.v : vi.v);
    const rhoV2 = num(seg && seg.rhoV2 != null ? seg.rhoV2 : vi.rhoV2);
    const mu = num(seg && seg.viscosity != null ? seg.viscosity : vi.mu);
    const Lspan = num(seg && seg.spanActual != null ? seg.spanActual : vi.Lspan);
    const support = (seg && seg.support) || vi.support || '刚性';

    const sp = (MockData.flowSupportParams && MockData.flowSupportParams[support]) || MockData.flowSupportParams['刚性'];
    const fn = num(seg && seg.fn != null ? seg.fn : (sp && sp.fn != null ? sp.fn : vi.fn));
    const alpha = (sp && sp.alpha != null) ? sp.alpha : vi.alpha;
    const beta = (sp && sp.beta != null) ? sp.beta : vi.beta;

    const FVF = isGas(seg) ? Math.sqrt(1000 * mu) : 1.0;
    const ratio = Dext / T;
    const Fv = alpha * Math.pow(ratio, beta);
    const LOF = rhoV2 * FVF / Fv;

    return {
      P: P, TP: TP, Dext: Dext, T: T, Q: Q,
      rho: rho, v: v, rhoV2: rhoV2, mu: mu, Lspan: Lspan,
      support: support, fn: fn, alpha: alpha, beta: beta,
      FVF: FVF, Fv: Fv,
      LOF: Math.min(Math.max(LOF, 0), 1.0)
    };
  };

  // 2. 机械激励：按设备类型查表
  TM02_CALC.computeMechanical = function (seg, vi) {
    vi = vi || {};
    const equipmentType = (seg && seg.equipmentType) || vi.equipmentType || '无';
    const table = MockData.mechanicalLofTable || {};
    let LOF = table[equipmentType];
    // 若设备类型不在查表范围内，视为无识别振源；仅当显式传入 vi.LOF 且设备类型与 vi 一致时才回退使用
    if (LOF == null) {
      LOF = (equipmentType === vi.equipmentType) ? num(vi.LOF, 0) : 0;
    }
    return { equipmentType: equipmentType, LOF: LOF };
  };

  // 3. 往复式&容积泵/压缩机脉动
  TM02_CALC.computeReciprocating = function (seg, vi) {
    vi = vi || {};
    const power = num(vi.power);
    const pressure = num(vi.pressure);
    const hasReport = !!vi.hasReport;
    const passAPI = !!vi.passAPI;
    let LOF = vi.LOF;
    if (LOF == null) {
      if (!hasReport) LOF = 1.0;
      else if (power < 112 && pressure < 35) LOF = 0.4;
      else if (passAPI) LOF = 0.4;
      else LOF = 1.0;
    }
    return { power: power, pressure: pressure, hasReport: hasReport, passAPI: passAPI, LOF: LOF };
  };

  // 4. 离心旋转失速
  TM02_CALC.computeRotatingStall = function (seg, vi) {
    vi = vi || {};
    const known = !!vi.known;
    const hasStall = !!vi.hasStall;
    const lowFlow = !!vi.lowFlow;
    let LOF = vi.LOF;
    if (LOF == null) {
      if (!known || !hasStall) LOF = 0.2;
      else if (!lowFlow) LOF = 0.4;
      else LOF = 1.0;
    }
    return { known: known, hasStall: hasStall, lowFlow: lowFlow, LOF: LOF };
  };

  // 5. 死支管涡激（侧支管周期性流体激励）
  TM02_CALC.computeDeadBranch = function (seg, vi) {
    vi = vi || {};
    const dBranch = num(vi.dBranch);
    const Re = num(vi.Re);
    const dcrit = num(vi.dcrit);
    const FeFs = num(vi.FeFs);
    let LOF = vi.LOF;
    if (LOF == null) {
      if (FeFs > 1.0) LOF = 1.0;
      else if (FeFs > 0.5) LOF = 0.29;
      else LOF = 0.2;
    }
    return { dBranch: dBranch, Re: Re, dcrit: dcrit, FeFs: FeFs, LOF: LOF };
  };

  // 6. 阀门水锤：LOF = Fmax · Ψ / Flim（示例值直接采用 Excel 给出 LOF）
  TM02_CALC.computeWaterHammer = function (seg, vi) {
    vi = vi || {};
    const type = vi.type || 'liquid_close';
    const rho = num(vi.rho);
    const v = num(vi.v);
    const Dext = num(vi.Dext);
    const T = num(vi.T);
    const Lspan = num(vi.Lspan);
    const Fmax = num(vi.Fmax);
    const psi = num(vi.psi);
    const Flim = num(vi.Flim) || 1;
    let LOF = vi.LOF;
    if (LOF == null) LOF = Fmax * psi / Flim;
    return {
      type: type, rho: rho, v: v, Dext: Dext, T: T, Lspan: Lspan,
      Fmax: Fmax, psi: psi, Flim: Flim,
      LOF: Math.min(Math.max(LOF, 0), 1.0)
    };
  };

  // 7. 空化和闪蒸：闪蒸=1.0，空化=0.7
  TM02_CALC.computeCavitation = function (seg, vi) {
    vi = vi || {};
    const P1 = num(vi.P1);
    const P2 = num(vi.P2);
    const dP = num(vi.dP != null ? vi.dP : (P1 - P2));
    const Pv = num(vi.Pv);
    const valveType = vi.valveType || '';
    const FL = num(vi.FL);
    const delta = num(vi.delta);
    const mechanism = vi.mechanism || '闪蒸';
    let LOF = vi.LOF;
    if (LOF == null) LOF = mechanism === '闪蒸' ? 1.0 : 0.7;
    return {
      P1: P1, P2: P2, dP: dP, Pv: Pv,
      valveType: valveType, FL: FL, delta: delta,
      mechanism: mechanism, LOF: LOF
    };
  };

  // 8. 高频声激励（气体）：按 LOF分析算法和说明-2026.8.19.xlsx 高频声激励示例实现
  // 支持多声源、多焊接不连续点，自动从 seg 取基础库参数，从 vi 取声源/不连续点台账
  TM02_CALC.computeHighFreqAcoustic = function (seg, vi) {
    vi = vi || {};

    // 基础管段参数：优先用 vi（验证/交互输入），其次用 seg 基础库
    const P = num(vi.P != null ? vi.P : (seg && seg.pressure));
    const TP = num(vi.TP != null ? vi.TP : (seg && seg.temperature));
    const Dext = num(vi.Dext != null ? vi.Dext : (seg && seg.od));
    const T = num(vi.T != null ? vi.T : (seg && seg.thickness));
    const Q = num(vi.Q != null ? vi.Q : (seg && seg.massFlow));
    const rho = num(vi.rho != null ? vi.rho : (seg && seg.rho));
    const c = num(vi.c != null ? vi.c : (seg && seg.soundSpeed));
    const Mw = num(vi.Mw) || 18;

    // 几何中间量
    const Dint = Dext - 2 * T;
    const A = Dint > 0 ? (Math.PI * Dint * Dint) / 4 : 0;
    const v = Dint > 0 && rho > 0 ? (Q / rho) / (A * 1e-6) : 0;

    // 声源：默认提供一个与 Excel 示例一致的阀门声源
    let sources = Array.isArray(vi.sources) && vi.sources.length ? vi.sources : [{
      name: vi.sourceName || '阀门1',
      hasSilencer: vi.hasSilencer != null ? vi.hasSilencer : true,
      reduction: num(vi.reduction) || 10,
      Te: num(vi.sourceTe) || null,
      P1: num(vi.sourceP1) || null,
      P2: num(vi.sourceP2) || 1.67e6,
      sonic: vi.sonic != null ? vi.sonic : true,
      SFF: num(vi.SFF) || null
    }];

    // 焊接不连续点：默认提供一个与 Excel 示例一致的支管不连续
    let discontinuities = Array.isArray(vi.discontinuities) && vi.discontinuities.length ? vi.discontinuities : [{
      name: '支管1',
      branchOd: num(vi.branchOd) || 16,
      branchT: num(vi.branchT) || 3,
      Ldis: num(vi.Ldis) || 10,
      weldedBoss: vi.weldedBoss != null ? vi.weldedBoss : false,
      duplexSteel: vi.duplexSteel != null ? vi.duplexSteel : false
    }];

    function computeSourcePWL(src) {
      const Te = src.Te != null ? src.Te : (TP + 273);
      const P1 = src.P1 != null ? src.P1 : (P * 1e6);
      const P2 = src.P2 != null ? src.P2 : 0;
      const SFF = src.SFF != null ? src.SFF : (src.sonic ? 6 : 0);
      const ratio = P1 > 0 ? (P1 - P2) / P1 : 0;
      const term = Math.pow(Math.max(ratio, 0), 3.6) * Q * Q * Math.pow(Te / Mw, 1.2);
      const PWL = 10 * Math.log10(Math.max(term, 1e-300)) + 126.1 + SFF - (src.hasSilencer ? num(src.reduction) : 0);
      return { name: src.name, hasSilencer: src.hasSilencer, reduction: num(src.reduction), Te, P1, P2, SFF, ratio, term, PWL };
    }

    function computeDiscontinuityPWL(dis, sourcePWLS) {
      const srcLevels = sourcePWLS.map(pwl => pwl - 60 * (dis.Ldis / Math.max(Dint, 1e-9)));
      const total = srcLevels.length ? 10 * Math.log10(srcLevels.reduce((sum, lvl) => sum + Math.pow(10, lvl / 10), 0)) : 0;
      return { srcLevels, total };
    }

    function computeLOF(dis, PWL_total) {
      const ratioDT = Dext / Math.max(T, 1e-9);
      const a = 3.28e-7 * Math.pow(ratioDT, 3) - 8.503e-5 * Math.pow(ratioDT, 2) + 7.063e-3 * ratioDT + 0.816;
      const s = 91.9 - ratioDT;
      const B = a * (PWL_total - 0.112762 * s - 0.001812 * s * s + 4.307277e-5 * Math.pow(s, 3));
      if (B <= 0 || !isFinite(B)) return { a, s, B, N: 0, ratio: 0, FLM1: 1, FLM2: 1, FLM3: 1, NR: 0, LfRaw: 0, Lf: 0, LOF: 0.29 };

      const N = Math.pow(10, 470711.5155 - 63075.1242 * Math.log10(B) + 183685.4368 / Math.sqrt(B) - 575094.3273 / Math.pow(B, 0.1));
      const ratio = Dext / Math.max(dis.branchOd, 1e-9);
      const FLM1 = ratio < 10
        ? -0.07 + 0.91 * ratio + 1.32 / ratio - 0.48 * Math.pow(ratio, 1.5) + 0.065 * ratio * ratio
        : 0.5;
      const FLM2 = dis.weldedBoss ? 0.29 + 0.09 * Math.tanh((PWL_total - 172) / 2.9) : 1.0;
      const FLM3 = dis.duplexSteel ? 0.263 + 0.087 * Math.tanh((PWL_total - 172) / 2.9) : 1.0;
      const NR = N * FLM1 * FLM2 * FLM3;
      const LfRaw = NR > 0 ? -0.1303 * Math.log(NR) + 3.1 : 0;
      const Lf = LfRaw <= 0 ? 0 : (LfRaw >= 1 ? 1 : LfRaw);
      const LOF = Lf >= 0.5 ? Lf : 0.29;
      return { a, s, B, N, ratio, FLM1, FLM2, FLM3, NR, LfRaw, Lf, LOF };
    }

    const sourceResults = sources.map(computeSourcePWL);
    const sourcePWLS = sourceResults.map(r => r.PWL);

    const discontinuityResults = discontinuities.map(dis => {
      const pwl = computeDiscontinuityPWL(dis, sourcePWLS);
      const lofRes = computeLOF(dis, pwl.total);
      return { name: dis.name, branchOd: dis.branchOd, branchT: dis.branchT, Ldis: dis.Ldis, weldedBoss: dis.weldedBoss, duplexSteel: dis.duplexSteel, srcLevels: pwl.srcLevels, totalPWL: pwl.total, ...lofRes };
    });

    // 管段最终 LOF 取所有不连续点最大值
    const finalLOF = discontinuityResults.length ? Math.max(...discontinuityResults.map(d => d.LOF)) : 0.29;

    return {
      P, TP, c, Dext, T, Dint, A, v, Mw, Q, rho,
      sources: sourceResults,
      discontinuities: discontinuityResults,
      LOF: finalLOF
    };
  };

  // 9. 段塞两相冲击（对应 TM01 s9，如触发则 LOF=1）
  TM02_CALC.computeSlug = function (seg, vi) {
    vi = vi || {};
    return { LOF: vi.LOF != null ? vi.LOF : 1.0 };
  };

  // 10. 热电偶套管涡激评估（TM04）
  // 依据：LOF分析算法和说明-2026.8.19.xlsx 热电偶套管示例
  // 从 seg 取主管基础库参数（P/TP/Dext/T/Sch/ρf/v/μ），从 vi/thermowell 台账取套管几何与材料参数
  TM02_CALC.computeThermowell = function (seg, vi) {
    vi = vi || {};

    // 主管段基础库参数：优先 vi（交互输入/验证示例），其次 seg
    const P = num(vi.P != null ? vi.P : (seg && seg.pressure));
    const TP = num(vi.TP != null ? vi.TP : (seg && seg.temperature));
    const Dext = num(vi.Dext != null ? vi.Dext : (seg && seg.od));
    const T = num(vi.T != null ? vi.T : (seg && seg.thickness));
    const Sch = num(vi.Sch != null ? vi.Sch : (seg && seg.sch));
    const rhoF = num(vi.rhoF != null ? vi.rhoF : (seg && seg.rho));
    const v = num(vi.v != null ? vi.v : (seg && seg.v));
    const mu = num(vi.mu != null ? vi.mu : (seg && seg.viscosity));

    // 套管台账/交互参数
    const twType = vi.twType || 'tapered';
    const reinforcement = vi.reinforcement || '不带补强';
    const Etw = num(vi.Etw) || 200e9;
    const rhoTw = num(vi.rhoTw) || 8000;
    const Ltw = num(vi.Ltw) || 0.115;
    const Dtw = num(vi.Dtw);
    const dtw = num(vi.dtw);
    const D1 = num(vi.D1);
    const D2 = num(vi.D2);
    const L1 = num(vi.L1);
    const L2 = num(vi.L2);

    // 中间计算
    const Dint = Dext - 2 * T;
    const Re = rhoF * v * Dint / mu;

    // 母管壁厚修正系数 FM
    let FM;
    if (Sch >= 160) {
      FM = reinforcement === '带90°间隔补强' ? 0.98 : 0.96;
    } else if (Sch >= 80) {
      FM = reinforcement === '带90°间隔补强' ? 0.96 : 0.93;
    } else if (Sch >= 40) {
      FM = reinforcement === '带90°间隔补强' ? 0.93 : 0.85;
    } else {
      FM = reinforcement === '带90°间隔补强' ? 0.85 : 0.42;
    }

    let I, A, k, delta, DA, deltaA, Dchar, fn;
    if (twType === 'straight') {
      // 直型：I(m^4), A(m^2)；Dtw/dtw 单位为 mm
      I = (Math.PI / Math.pow(10, 12)) * (Math.pow(Dtw, 4) - Math.pow(dtw, 4)) / 64;
      A = Math.PI * ((Math.pow(Dtw, 2) - Math.pow(dtw, 2)) / (4 * Math.pow(10, 6)));
      Dchar = Dtw;
      fn = (3.516 / (2 * Math.PI * Math.pow(Ltw, 2))) * Math.sqrt(Etw * I / (rhoTw * A));
    } else if (twType === 'tapered') {
      k = D2 / D1;
      delta = dtw / D1;
      Dchar = D2;
      const num = Math.pow(k, 4) + 5 * Math.pow(k, 3) + 15 * k * k + 35 * k + 70 - 126 * Math.pow(delta, 4);
      const den = 5353 * k * k + 2142 * k + 513 - 8008 * delta * delta;
      fn = (1.12 * D1 / (1000 * Math.pow(Ltw, 2))) * Math.sqrt((Etw / rhoTw) * (num / den));
    } else if (twType === 'stepped') {
      DA = (D1 * L1 + D2 * L2) / (L1 + L2);
      deltaA = dtw / DA;
      Dchar = D2;
      fn = (0.14 * DA / (1000 * Math.pow(Ltw, 2))) * Math.sqrt(Etw * (1 + Math.pow(deltaA, 4)) / rhoTw);
    }

    const S = 0.184 + 0.012 * Math.log10(Re);
    const Fe = 1000 * S * v / Dchar;
    const FeFn = Fe / fn;
    const LOF = FeFn >= 0.8 ? 1.0 : 0.29;

    return {
      P, TP, Dext, T, Sch, Dint, rhoF, v, mu, Re,
      twType, reinforcement, FM,
      Etw, rhoTw, Ltw,
      Dtw, dtw, D1, D2, L1, L2,
      I, A, k, delta, DA, deltaA, Dchar,
      fn, S, Fe, FeFn, LOF
    };
  };

  // 计算全部 8 张 TM02 因子卡片（与 tm02Factors 顺序一致）
  TM02_CALC.computeAll = function (seg, vi) {
    vi = vi || MockData.tm02ValidationInputs || {};
    return [
      { id: 'f1', name: '流动湍流', ...TM02_CALC.computeFlowInducedTurbulence(seg, vi.flowInducedTurbulence) },
      { id: 'f2', name: '高频声学', ...TM02_CALC.computeHighFreqAcoustic(seg, vi.highFreqAcoustic) },
      { id: 'f3', name: '机械激励', ...TM02_CALC.computeMechanical(seg, vi.mechanical) },
      { id: 'f4', name: '往复脉动', ...TM02_CALC.computeReciprocating(seg, vi.reciprocating) },
      { id: 'f5', name: '离心旋转失速', ...TM02_CALC.computeRotatingStall(seg, vi.rotatingStall) },
      { id: 'f6', name: '死支管涡激', ...TM02_CALC.computeDeadBranch(seg, vi.deadBranch) },
      { id: 'f7', name: '阀门水锤', ...TM02_CALC.computeWaterHammer(seg, vi.waterHammer) },
      { id: 'f8', name: '空化闪蒸', ...TM02_CALC.computeCavitation(seg, vi.cavitation) }
    ];
  };
export default TM02_CALC;
