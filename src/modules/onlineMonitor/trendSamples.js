// 实时页只保留最近十分钟、每测点最多2000个有效样本，限制长时间打开页面的内存占用。
export const REALTIME_WINDOW_MS = 10 * 60 * 1000;
const MAX_POINT_SAMPLES = 2000;

/** 按设备采样时间解析；不能用浏览器轮询时间替代timestamp。 */
export function sampleTime(point) {
  return point && point.timestamp
    ? new Date(String(point.timestamp).replace(/-/g, "/")).getTime()
    : NaN;
}

/** 按pointName和timestamp合并最新值；同时间重复响应覆盖，乱序响应排序，各测点独立裁剪。 */
export function mergeRealtimeSamples(previous, incoming) {
  const grouped = Object.create(null);
  (previous || []).concat(incoming || []).forEach(function(point) {
    if (!point || !point.pointName || point.value == null || String(point.value).trim() === "") return;
    const time = sampleTime(point);
    if (!isFinite(time) || !isFinite(Number(point.value))) return;
    const samples = grouped[point.pointName] || (grouped[point.pointName] = Object.create(null));
    samples[time] = point;
  });
  let result = [];
  Object.keys(grouped).forEach(function(name) {
    const samples = Object.keys(grouped[name]).map(function(time) { return grouped[name][time]; });
    samples.sort(function(a, b) { return sampleTime(a) - sampleTime(b); });
    // 以该测点最新真实采样为窗口锚点，固定演示样例不会因电脑日期不同被丢弃。
    const cutoff = sampleTime(samples[samples.length - 1]) - REALTIME_WINDOW_MS;
    result = result.concat(samples.filter(function(point) { return sampleTime(point) >= cutoff; })
      .slice(-MAX_POINT_SAMPLES));
  });
  return result;
}
