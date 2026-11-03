/* 在隔离环境执行真实画布引擎，验证绘图指令及回溯替换，不访问接口或数据库。 */
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const root = path.resolve(__dirname, "../src/modules/onlineMonitor");
const operations = [];
const pending = [];
function canvas() {
  const element = { width: 960, height: 360, addEventListener() {}, removeEventListener() {} };
  const context = { canvas: element, measureText(text) { return { width: String(text).length * 7 }; } };
  ["beginPath", "closePath", "moveTo", "lineTo", "stroke", "fill", "arc",
    "fillRect", "strokeRect", "clearRect", "drawImage", "fillText", "save",
    "restore", "translate", "setLineDash", "dashedLine"].forEach(name => {
    context[name] = (...args) => { operations.push({ name, args }); };
  });
  element.getContext = () => context;
  return element;
}
const target = canvas();
const sandbox = { console, document: { getElementById() { return target; }, createElement: canvas },
  setTimeout(fn) { pending.push(fn); return pending.length; }, clearInterval() {}, clearTimeout() {},
  addEventListener() {}, removeEventListener() {} };
sandbox.window = sandbox;
vm.createContext(sandbox);
["runtimeShim.js", "trendCanvasPC.js"].forEach(file => {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), sandbox, { filename: file });
});
const group = new sandbox.defaultTrendGroup("test-canvas");
group.containerWidthFn = () => 960;
group.containerHeightFn = () => 360;
group.isDialog = true;
sandbox.trendGroup = group;
const state = sandbox.thisVue = { typeSelected: "实时", dateHistory: [], pointVisibilityByGN: {} };
group.on("pointInfoLoad", rows => { state.rows = rows; });
function display(points, history, upper = 30, lower = 0) {
  state.typeSelected = history ? "回溯" : "实时";
  state.dateHistory = history ? ["2026-08-26 11:00:00", "2026-08-26 12:00:00"] : [];
  const series = {};
  points.forEach(point => {
    (series[point.name] || (series[point.name] = [])).push({ x: new Date("2026/08/26 " + point.time).getTime(), y: point.value });
  });
  state.reloadDatas = { data: Object.keys(series).map(name => ({ ID: name, GN: name, TV: upper, BV: lower,
    ATV: upper, ABV: lower, FM: 3, RT: 0, LW: 2 })) };
  state.coordData = { value: { value: series } };
  // 测试数据与引擎采用同一本地时区，避免测试机器时区影响区间过滤。
  group.addPointList(Object.keys(series), "2026-08-26 11:00:00", "2026-08-26 12:00:00");
  while (pending.length) pending.shift()();
  return group.opTrend.trendArray;
}
const sample = (name, time, value) => ({ name, time, value });
assert.strictEqual(sandbox.$TREND_GAUGE, undefined);
let lines = display([sample("A", "11:46:35", 15)], false);
assert.strictEqual(lines.length, 1);
assert(operations.some(op => op.name === "arc"), "单个真实样本必须绘制点标记");
assert(operations.filter(op => op.name === "arc").every(op => op.args.every(Number.isFinite)));
lines = display([sample("A", "11:25:44", 21), sample("B", "11:25:44", 14),
  sample("A", "11:24:44", 19)], true);
assert.strictEqual(lines.length, 2, "不同测点必须分别绘制");
assert.strictEqual(JSON.stringify(lines[0].data.map(p => p[1])), "[19,21]", "历史按timestamp升序绘制");
assert.strictEqual(lines[1].data.length, 1, "另一测点的单样本仍可显示");
assert(operations.some(op => op.name === "lineTo"), "多样本必须生成折线绘制指令");
lines = display([sample("A", "11:26:44", 22)], true);
assert.strictEqual(lines.length, 1);
assert.strictEqual(lines[0].data.length, 1, "新回溯结果替换旧曲线");
lines = display([sample("A", "11:26:44", 22)], true, 25, 20);
assert.strictEqual(Number(lines[0].topLimit), 25, "未手动设置时，历史量程必须更新");
assert.strictEqual(Number(lines[0].lowLimit), 20);
const manual = group.trendConfigInfoMap.get("A");
manual.rangeManuallySet = true;
manual.ATV = 100;
manual.ABV = -10;
lines = display([sample("A", "11:26:44", 22)], true, 25, 20);
assert.strictEqual(Number(lines[0].topLimit), 100, "用户手工范围应保留");
assert.strictEqual(Number(lines[0].lowLimit), -10);
sandbox.$TREND_GAUGE = true;
assert.doesNotThrow(() => group.opTrend.repaint(group.defaultTrendString), "配置标尺时仍可正常绘制");
sandbox.$TREND_GAUGE = false;
assert.doesNotThrow(() => group.opTrend.repaint(group.defaultTrendString));
console.log("真实画布引擎验证通过：未配置标尺、单点标记、逐测点曲线、历史排序及替换、标尺开关。");
