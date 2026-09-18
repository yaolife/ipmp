export function clone(obj) {
  return JSON.parse(JSON.stringify(obj || {}));
}

export function num(v, def) {
  const n = parseFloat(v);
  if (isFinite(n)) return n;
  return def == null ? 0 : def;
}

export function pickNum(v, fallback) {
  if (v == null || v === "") return fallback;
  const n = parseFloat(v);
  return isFinite(n) ? n : fallback;
}

/**
 * 根据管段跨距和外径判定支撑刚度类型，与 LOF 原型中的分区曲线保持一致。
 * 参数缺失或不是正数时不返回类型，避免无效尺寸参与后续评估。
 */
export function calculateSupportType(span, outerDiameter) {
  const length = Number(span);
  const diameter = Number(outerDiameter);
  if (!isFinite(length) || length <= 0 || !isFinite(diameter) || diameter <= 0) {
    return "";
  }
  const boundary1 = -1.2346 * diameter * diameter / 100000 + 0.02 * diameter + 2.0563;
  const boundary2 = -1.1886 * diameter * diameter / 100000 + 0.025262 * diameter + 3.3601;
  const boundary3 = -1.5968 * diameter * diameter / 100000 + 0.033583 * diameter + 4.429;
  if (length <= boundary1) return "刚性";
  if (length <= boundary2) return "中刚";
  if (length <= boundary3) return "中等";
  return "柔性";
}

export function fmt(v, d) {
  if (v == null || v === "") return "-";
  const n = Number(v);
  if (!isFinite(n)) return "-";
  return n.toFixed(d == null ? 4 : d);
}

export function fmtExp(v) {
  if (v == null || !isFinite(v)) return "-";
  const absV = Math.abs(v);
  if (absV >= 1e6 || (absV > 0 && absV < 1e-3)) return Number(v).toExponential(4);
  return Number(v).toFixed(4);
}

export function riskLevel(lof) {
  if (lof >= 0.7) return "High";
  if (lof >= 0.3) return "Medium";
  return "Low";
}

export function riskBadgeClass(level) {
  if (level === "High" || level === "3") return "badge-high";
  if (level === "Medium" || level === "2") return "badge-medium";
  if (level === "Low" || level === "0" || level === "1") return "badge-low";
  return "badge-na";
}

export function controlAdvice(lof) {
  if (lof >= 1.0) return "管线重设计/加固支撑、专业振动监测、全量SBC评估、现场目视核查";
  if (lof >= 0.5) return "建议加固、振动监测、开展SBC评估、现场巡检";
  if (lof >= 0.3) return "仅需SBC评估+常规目视检查";
  return "仅常规目视巡检";
}

export function isSuccessCode(code) {
  return code === 0 || code === "0";
}

export function unwrapList(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.records)) return data.records;
  if (data && Array.isArray(data.list)) return data.list;
  return [];
}
