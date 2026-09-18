/**
 * TM05 第二类小支管振动速度限值系数计算
 * 公式来源：第二类小支管振动速度限值系数说明
 */
const TM05_CALC = {};

  const END_CONDITION_MAP = {
    'STRAIGHT': 1.0,
    'CANTILEVER': 1.33,
    'Z_BEND': 0.74,
    'U_BEND': 0.83
  };

  const END_CONDITION_LABELS = {
    'STRAIGHT': '直管段',
    'CANTILEVER': '简支悬臂',
    'Z_BEND': 'Z型弯头',
    'U_BEND': 'U型弯头'
  };

  function num(v) {
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
  }

  function round(v, d) {
    if (!isFinite(v) || isNaN(v)) return '-';
    return v.toFixed(d == null ? 4 : d);
  }

  function calcSegment(Do, tp, Lp) {
    Do = num(Do);
    tp = num(tp);
    Lp = num(Lp);
    const Di = Math.max(0, Do - 2 * tp);
    const Asp = Math.PI * (Do * Do - Di * Di) / 4;
    const Asf = Math.PI * Di * Di / 4;
    return { Do, tp, Lp, Di, Asp, Asf };
  }

  function calcInsulation(Do, tin) {
    Do = num(Do);
    tin = num(tin);
    const Dout = Do + 2 * tin;
    const Asin = Math.PI * (Dout * Dout - Do * Do) / 4;
    return { Dout, Asin };
  }

  TM05_CALC.compute = function (params) {
    const errs = [];
    const segs = [];
    const vals = [];

    for (let i = 0; i < 3; i++) {
      const Do = num(params.Do && params.Do[i]);
      const tp = num(params.tp && params.tp[i]);
      const Lp = num(params.Lp && params.Lp[i]);
      const mv = num(params.mv && params.mv[i]);
      vals.push({ Do, tp, Lp, mv });

      if (Do <= 0) errs.push('管段 ' + (i + 1) + ' 外径 Do 必须 > 0');
      if (tp < 0) errs.push('管段 ' + (i + 1) + ' 壁厚 tp 不能为负');
      if (tp >= Do / 2) errs.push('管段 ' + (i + 1) + ' 壁厚 tp 应小于外径的一半');
      if (Lp < 0) errs.push('管段 ' + (i + 1) + ' 长度 Lp 不能为负');

      const seg = calcSegment(Do, tp, Lp);
      seg.mv = mv;
      segs.push(seg);
    }

    const rho_p = num(params.rho_p);
    const rho_f = num(params.rho_f);
    const rho_in = num(params.rho_in);
    const tin = num(params.tin);

    if (rho_p <= 0) errs.push('管材密度 ρp 必须 > 0');
    if (rho_f < 0) errs.push('流体密度 ρf 不能为负');
    if (rho_in < 0) errs.push('保温层密度 ρin 不能为负');
    if (tin < 0) errs.push('保温层厚度 tin 不能为负');

    const ins = calcInsulation(segs[0].Do, tin);

    for (let i = 0; i < 3; i++) {
      const seg = segs[i];
      seg.msp = 1e-9 * rho_p * seg.Asp * seg.Lp;
      seg.msf = 1e-9 * rho_f * seg.Asf * seg.Lp;
      seg.msin = 1e-9 * rho_in * ins.Asin * seg.Lp;
      seg.Asin = ins.Asin;
      seg.AspDisp = seg.Asp;
      seg.AsfDisp = seg.Asf;
    }

    const activeSegs = segs.filter(s => s.Lp > 0);
    if (activeSegs.length === 0) {
      errs.push('至少有一个管段长度 Lp > 0');
    }

    const lp = activeSegs.reduce((sum, s) => sum + s.Lp, 0);
    const sumMsp = segs.reduce((sum, s) => sum + s.msp, 0);
    const sumMsf = segs.reduce((sum, s) => sum + s.msf, 0);
    const sumMsin = segs.reduce((sum, s) => sum + s.msin, 0);
    const sumMv = vals.reduce((sum, v) => sum + v.mv, 0);

    let mp0 = 0, mf0 = 0, min0 = 0;
    if (lp > 0) {
      mp0 = 1000 * sumMsp / lp;
      mf0 = 1000 * sumMsf / lp;
      min0 = 1000 * sumMsin / lp;
    }

    if (lp <= 0) errs.push('有效管长 lp 必须 > 0');

    let Cm = 0;
    if (sumMsp > 0) {
      Cm = sumMv / sumMsp;
    }

    const C1 = Cm === 0 ? 1 : 0.529 * Math.pow(Cm, -0.46);

    let C3 = 1;
    if (mp0 > 0) {
      C3 = Math.sqrt(1 + (mf0 + min0) / mp0);
    } else {
      errs.push('mp0 必须 > 0，请检查管段参数');
    }

    const weldType = params.weldType || 'BUTTERFLY_WELDING';
    const C2K2 = weldType === 'SOCKET_WELDING' ? 4.2 : 2.0;

    const endCondition = params.endCondition || 'STRAIGHT';
    const C4 = END_CONDITION_MAP[endCondition] || 1.0;

    const C5 = num(params.C5) || 1.0;
    const C0 = num(params.C0) || 3.5;
    const beta = num(params.beta) || 13.42;
    const Sa_T = num(params.Sa_T);

    if (C5 <= 0) errs.push('系数 C5 必须 > 0');
    if (C0 <= 0) errs.push('系数 C0 必须 > 0');
    if (beta <= 0) errs.push('系数 β 必须 > 0');
    if (Sa_T <= 0) errs.push('运行温度下疲劳极限 Sa_T 必须 > 0');

    const V_peak_allow = (beta * C1 * C4 * Sa_T) / (C2K2 * C3 * C5);
    const V_rms_allow = V_peak_allow / C0;

    return {
      errors: errs,
      segs: segs,
      lp: lp,
      mp0: mp0,
      mf0: mf0,
      min0: min0,
      Cm: Cm,
      C1: C1,
      C3: C3,
      C2K2: C2K2,
      C4: C4,
      C5: C5,
      C0: C0,
      beta: beta,
      Sa_T: Sa_T,
      V_peak_allow: V_peak_allow,
      V_rms_allow: V_rms_allow,
      ins: ins,
      sumMv: sumMv
    };
  };

  TM05_CALC.round = round;
  TM05_CALC.END_CONDITION_LABELS = END_CONDITION_LABELS;
export default TM05_CALC;
