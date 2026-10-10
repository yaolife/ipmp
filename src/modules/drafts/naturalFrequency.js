// 沿用后端现有JSON存储契约，页面只暴露业务输入，保留来源等扩展信息。
export const frequencySupportOptions = ["刚性", "中刚", "中等", "柔性"].map(label => ({ label, value: label }));

export function readFrequencyParams(detail) {
  let params = {};
  try {
    const raw = detail.naturalFrequencyParams;
    const parsed = typeof raw === "string" ? JSON.parse(raw || "{}") : raw;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) params = parsed;
  } catch (error) {
    // 兼容历史自由文本；普通表单不展示无法解析的技术内容。
  }
  return {
    naturalFrequency: detail.naturalFrequency != null ? detail.naturalFrequency : (params.frequency != null ? params.frequency : ""),
    frequencySupportType: detail.supportType != null ? detail.supportType : (params.supportType || "")
  };
}

export function writeFrequencyParams(form) {
  let params = {};
  try {
    const parsed = JSON.parse(form.naturalFrequencyParams || "{}");
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) params = parsed;
  } catch (error) {
    // 旧自由文本在用户保存后转换为规范结构。
  }
  const frequency = form.naturalFrequency;
  if (frequency === "" || frequency == null) delete params.frequency;
  else {
    const number = Number(frequency);
    if (!Number.isFinite(number) || number < 0) throw new Error("固有频率请输入大于或等于0的有效数值");
    params.frequency = number;
  }
  if (form.frequencySupportType) params.supportType = form.frequencySupportType;
  else delete params.supportType;
  return Object.keys(params).length ? JSON.stringify(params) : "";
}
