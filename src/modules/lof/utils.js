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

export function fmt(v, d) {
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
