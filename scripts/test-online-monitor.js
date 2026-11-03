/* 使用现有Babel和Vue验证采样适配与真实Vue状态代理，无浏览器、网络或新增依赖。 */
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const babel = require("babel-core");
const Vue = require("vue");
const root = path.resolve(__dirname, "../src/modules/onlineMonitor");

function load(source, dependency) {
  const compiled = babel.transform(source, {
    babelrc: false,
    presets: [["env", { targets: { node: "current" }, modules: "commonjs" }]]
  }).code;
  const module = { exports: {} };
  new Function("require", "module", "exports", compiled)(dependency, module, module.exports);
  return module.exports;
}

const samples = load(fs.readFileSync(path.join(root, "trendSamples.js"), "utf8"), require);
function point(name, time, value) {
  return { pointName: name, pointId: name, timestamp: "2026-08-26 " + time, value: String(value) };
}

let cache = samples.mergeRealtimeSamples([], [point("A", "11:46:35", 10)]);
cache = samples.mergeRealtimeSamples(cache, [point("A", "11:46:35", 12)]);
assert.strictEqual(cache.length, 1, "相同测点、时间戳重复轮询不得增加采样数");
assert.strictEqual(cache[0].value, "12", "相同时间戳的修正值应覆盖旧值");
cache = samples.mergeRealtimeSamples(cache, [point("A", "11:47:35", 14), point("B", "11:46:35", 0),
  point("A", "11:45:35", 8), point("A", "11:47:36", "bad"), { pointName: "A", value: "3" }]);
assert.deepStrictEqual(cache.filter(p => p.pointName === "A").map(p => p.value), ["8", "12", "14"]);
assert.strictEqual(cache.filter(p => p.pointName === "B")[0].value, "0");
cache = samples.mergeRealtimeSamples(cache, [point("A", "12:00:00", 20)]);
assert.strictEqual(cache.filter(p => p.pointName === "A").length, 1, "超出十分钟的旧采样应裁剪");
assert.strictEqual(cache.filter(p => p.pointName === "B").length, 1, "不同测点不得相互覆盖");
const dense = Array.from({ length: 2100 }, (_, i) => ({ pointName: "A", timestamp: new Date(1791546000000 + i), value: "1" }));
// 当前接口精度到秒；使用可解析的毫秒ISO时间验证内存上限。
const denseSamples = dense.map(p => Object.assign({}, p, { timestamp: p.timestamp.toISOString().replace(/-/g, "/").replace("T", " ").replace("Z", "") }));
assert.strictEqual(samples.mergeRealtimeSamples([], denseSamples).length, 2000);

global.window = {};
const calls = [];
let response;
const api = {
  getPoint(payload, token, history) {
    calls.push({ payload, history });
    return Promise.resolve({ code: "0", data: { code: "200", data: response, demo: true } });
  },
  createCancelSource() { return { token: {}, cancel() {} }; },
  isCancel() { return false; }
};
const component = fs.readFileSync(path.join(root, "OnlineMonitor.vue"), "utf8").split("<script>")[1].split("</script>")[0];
const options = load(component, name => {
  if (name === "./trendSamples") return samples;
  if (name === "./trendEngine") return {};
  if (name === "./api") return api;
  throw new Error("Unexpected dependency: " + name);
}).default;
const vm = new Vue(Object.assign({}, options, { watch: {} }));
const errors = [];
let painted = 0;
vm.$message = { error(message) { errors.push(message); } };
vm.trendGroup = { addPointList() { painted++; }, removePoint() {} };
const selected = { pointID: ["A"], pointName: ["A"] };
async function obtain(points, history) {
  response = points;
  vm.typeSelected = history ? "回溯" : "实时";
  vm.obtainPoint(selected, "2026-08-26 11:00:00", "2026-08-26 12:00:00");
  await new Promise(resolve => setImmediate(resolve));
}

(async function() {
  assert.strictEqual(vm.requestSeq, 0, "请求状态必须由Vue代理，不能声明为下划线开头data属性");
  await obtain([Object.assign(point("A", "11:46:35", 10), { average: 10 })], false);
  await obtain([Object.assign(point("A", "11:47:35", 20), { average: 20 })], false);
  assert.deepStrictEqual(calls[0].payload, { names: "A" }, "实时请求不得携带历史时间范围");
  assert.strictEqual(vm.coordData.value.value.A.length, 2);
  assert.strictEqual(vm.reloadDatas.data[0].AVGV, 15, "实时统计必须基于累计样本，不能沿用最新单点平均值");
  await obtain([point("A", "11:47:35", 20)], false);
  assert.strictEqual(vm.coordData.value.value.A.length, 2);
  await obtain([point("A", "11:25:44", 21), point("B", "11:25:44", 14), point("A", "11:24:44", 19)], true);
  assert.strictEqual(calls[calls.length - 1].history, true);
  assert.strictEqual(calls[calls.length - 1].payload.startTime, "2026-08-26 11:00:00");
  assert.deepStrictEqual(vm.coordData.value.value.A.map(p => p.y), [19, 21], "历史按采样时间排序且不得混入实时缓存");
  assert.strictEqual(vm.coordData.value.value.B.length, 1);
  assert.strictEqual(vm.reloadDatas.data[0].AVGV, 20);
  await obtain([point("A", "11:25:44", 21)], true);
  assert.strictEqual(vm.coordData.value.value.A.length, 1, "新的历史查询必须替换旧范围");
  assert.deepStrictEqual(errors, []);
  assert.strictEqual(painted, 5, "有效回包必须触发重绘");
  assert.strictEqual(vm.inflightKey, "");
  vm.pointOriginalList = [{ ID: "A", GN: "A" }];
  vm.typeSelected = "实时";
  vm.realtimeSamples = [point("A", "11:46:35", 10)];
  vm.dateHistory = ["2026-08-26 11:00:00", "2026-08-26 12:00:00"];
  vm.startMark = setInterval(() => {}, 1000);
  vm.dateHistoryChange();
  await new Promise(resolve => setImmediate(resolve));
  assert.strictEqual(vm.typeSelected, "回溯", "实时页点击时间查询也必须进入回溯");
  assert.strictEqual(calls[calls.length - 1].history, true);
  assert.strictEqual(vm.startMark, null, "查询历史时必须停止实时轮询");
  assert.strictEqual(vm.realtimeSamples.length, 0);
  vm.typeSelected = "实时";
  vm.dateHistory = ["2026-08-26 11:10:00", "2026-08-26 11:40:00"];
  vm.changeTime();
  await new Promise(resolve => setImmediate(resolve));
  assert.strictEqual(vm.typeSelected, "回溯", "框选时间也必须进入回溯");
  assert.strictEqual(calls[calls.length - 1].payload.startTime, "2026-08-26 11:10:00");
  vm.timeScrolling(true);
  await new Promise(resolve => setImmediate(resolve));
  assert.strictEqual(calls[calls.length - 1].history, true, "前后滚动查询历史接口");
  const removed = [];
  vm.trendGroup.removePoint = name => removed.push(name);
  vm.pointOriginalList = [{ ID: "A", GN: "A" }, { ID: "B", GN: "B" }];
  await obtain([], true);
  assert.deepStrictEqual(removed, ["A", "B"], "空历史必须清除所有旧曲线");
  assert.strictEqual(vm.trendPointListData.length, 0, "空历史不能展示上次统计");
  assert.deepStrictEqual(vm.getSelectedPoint().pointName, ["A", "B"], "空历史仍可调整时间重查");
  assert.deepStrictEqual(errors, []);
  console.log("在线监测验证通过：实时累计/去重/裁剪、历史分组/排序/替换、累计统计、时间查询/框选/滚动调用历史接口。");
})().catch(error => { console.error(error); process.exitCode = 1; });
