/* 复用现有Vue/Babel依赖，验证材料输入的异步边界；不调用网络或修改数据库。 */
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const babel = require("babel-core");
const Vue = require("vue");
const compiler = require("vue-template-compiler");
const root = path.resolve(__dirname, "../src/modules/lof");

function load(source, dependency) {
  const compiled = babel.transform(source, {
    babelrc: false,
    presets: [["env", { targets: { node: "current" }, modules: "commonjs" }]]
  }).code;
  const module = { exports: {} };
  new Function("require", "module", "exports", compiled)(dependency, module, module.exports);
  return module.exports;
}
function source(file) {
  return compiler.parseComponent(fs.readFileSync(path.join(root, file), "utf8"));
}
const utils = load(fs.readFileSync(path.join(root, "utils.js"), "utf8"), require);
const component = source("components/MaterialElasticModulusInput.vue");
const page = source("quantitativeAssessment.vue");
for (const sfc of [component, page]) {
  assert.deepStrictEqual(compiler.compile(sfc.template.content).errors, [], "模板必须能编译");
}

let candidates = [];
let search = () => Promise.resolve({ code: 0, data: candidates });
let resolveValue = () => Promise.resolve({ code: 0, data: { elasticModulus: 206.123456, matchType: 0, message: "Pa" } });
const requests = [];
const api = {
  matchMaterialLibrary(keyword) { requests.push(["material", keyword]); return search(keyword); },
  getMaterialElasticModulus(id, temperature) { requests.push(["value", id, temperature]); return resolveValue(id, temperature); }
};
const options = load(component.script.content, name => {
  if (name === "../api") return api;
  if (name === "../utils") return utils;
  throw new Error("未预期的依赖：" + name);
}).default;

function tick() { return new Promise(resolve => setImmediate(resolve)); }
function deferred() {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
}
function create() {
  const vm = new Vue(Object.assign({}, options, {
    propsData: { contextKey: "segment-a", material: "碳钢", temperature: 25, value: 123.45 }
  }));
  vm.$on("input", value => { vm.value = value; });
  return vm;
}

(async function() {
  candidates = [{ id: "a", subcategory: "碳钢" }];
  const vm = create();
  await tick();
  assert.strictEqual(requests.length, 0, "默认输入框不得自动请求");
  vm.temperature = 50;
  await tick();
  assert.strictEqual(requests.length, 0, "未打开弹窗，温度变化不触发查询");
  assert.strictEqual(vm.value, 123.45);
  vm.openMatcher();
  await tick();
  assert.strictEqual(vm.materialId, "a");
  assert.strictEqual(vm.preview.value, 206.123456, "预览按Pa原值，不换算");
  assert.strictEqual(vm.value, 123.45, "预览不得直接覆盖输入值");
  assert.strictEqual(vm.canConfirm, true);
  assert.deepStrictEqual(requests.slice(0, 2), [["material", "碳钢"], ["value", "a", 50]]);
  vm.closeDialog();
  assert.strictEqual(vm.value, 123.45, "取消保留原值");
  vm.openMatcher();
  await tick();
  vm.confirmValue();
  assert.strictEqual(vm.value, 206.123456, "确认后才回填原值");
  assert.strictEqual(vm.dialogVisible, false);

  const stale = deferred();
  resolveValue = () => stale.promise;
  vm.openMatcher();
  await tick();
  assert.strictEqual(vm.canConfirm, false, "查询期间不得确认");
  resolveValue = () => Promise.resolve({ code: 0, data: { elasticModulus: 190, matchType: 1 } });
  vm.temperature = 75;
  assert.strictEqual(vm.canConfirm, false, "温度变化后即使watch尚未执行也不能确认旧预览");
  await tick();
  stale.resolve({ code: 0, data: { elasticModulus: 999 } });
  await tick();
  assert.strictEqual(vm.preview.value, 190, "旧温度慢响应不得覆盖新预览");
  assert.strictEqual(vm.value, 206.123456, "温度重新匹配未确认时保留原值");
  vm.temperature = "";
  await tick();
  assert.strictEqual(vm.preview, null);
  assert.strictEqual(vm.canConfirm, false);
  vm.temperature = 0;
  await tick();
  assert.strictEqual(requests[requests.length - 1][2], 0, "零温度可查询");
  vm.confirmValue();
  assert.strictEqual(vm.value, 190);
  vm.onManualInput({ target: { value: "321.123" } });
  vm.temperature = -50;
  vm.material = "晚到的材质";
  await tick();
  assert.strictEqual(vm.value, 321.123, "温度和晚到材质不会覆盖普通输入");
  vm.restoreHistory();
  assert.strictEqual(vm.value, 321.123, "历史回显保留快照");
  vm.$destroy();

  candidates = [{ id: "a" }, { id: "b" }];
  const multi = create();
  multi.openMatcher();
  await tick();
  assert.strictEqual(multi.materialId, "", "多材料不能默认选首条");
  assert.strictEqual(multi.preview, null);
  multi.materialId = "b";
  multi.resolveValue();
  await tick();
  assert.strictEqual(requests[requests.length - 1][1], "b", "只能查询所选材料");
  multi.onKeywordInput("新材料");
  multi.confirmValue();
  assert.strictEqual(multi.preview, null);
  assert.strictEqual(multi.value, 123.45, "改关键词后旧预览不得填入");
  multi.materialId = "b";
  resolveValue = () => Promise.resolve({ code: 0, data: { elasticModulus: null, message: "超出范围" } });
  await multi.resolveValue();
  assert.strictEqual(multi.canConfirm, false);
  assert.strictEqual(multi.status, "超出范围");
  assert.strictEqual(multi.value, 123.45, "无取值时不清空原输入");
  resolveValue = () => Promise.reject(new Error("请求失败"));
  await multi.resolveValue();
  assert.strictEqual(multi.resolving, false);
  assert.strictEqual(multi.canConfirm, false);
  assert.strictEqual(multi.value, 123.45);
  multi.$destroy();

  const closedValue = deferred();
  candidates = [{ id: "a" }];
  resolveValue = () => closedValue.promise;
  const closing = create();
  closing.openMatcher();
  await tick();
  closing.closeDialog();
  closedValue.resolve({ code: 0, data: { elasticModulus: 999 } });
  await tick();
  assert.strictEqual(closing.preview, null, "关闭后慢响应不得恢复预览");
  assert.strictEqual(closing.value, 123.45);
  closing.$destroy();

  const oldSearch = deferred();
  search = () => oldSearch.promise;
  const changing = create();
  changing.openMatcher();
  changing.contextKey = "segment-b";
  await tick();
  oldSearch.resolve({ code: 0, data: [{ id: "old" }] });
  await tick();
  assert.strictEqual(changing.dialogVisible, false, "切管段关闭弹窗");
  assert.strictEqual(changing.materialId, "", "旧管段查询不能污染当前选择");
  assert.strictEqual(changing.value, 123.45);
  changing.$destroy();

  // 用页面真实方法验证历史回显顺序及原有youngModulus请求字段。
  let historyCalls = 0;
  const pageOptions = load(page.script.content, name => {
    if (name === "./utils") return utils;
    if (name === "./api") return { getTm02Detail() { historyCalls++; return Promise.resolve({ code: 0, data: { inputs: {} } }); } };
    return {};
  }).default;
  const detail = deferred();
  const historyContext = {
    _segmentDetailPromise: detail.promise,
    captureSegmentRequest: () => () => true,
    isSuccessCode: utils.isSuccessCode,
    applyHistoryInputs() { this.applied = true; },
    applyBackendResult() {},
    $message: { error(message) { throw new Error(message); } }
  };
  pageOptions.methods.loadHistoryDetail.call(historyContext, { id: "history-a" });
  await tick();
  assert.strictEqual(historyCalls, 0, "历史应等待管段详情回填完成");
  detail.resolve();
  await tick();
  assert.strictEqual(historyContext.applied, true);
  const pageVm = new Vue(Object.assign({}, pageOptions, { mixins: [] }));
  pageVm.$refs.thermoModulus = { restoreHistory() {} };
  pageVm.applyHistoryInputs({ thermowell: { youngModulus: 321.123, temperature: 50 } });
  assert.strictEqual(pageVm.thermo.Etw, 321.123, "历史快照原值回显");
  assert.strictEqual(pageVm.buildPayload().thermowell.youngModulus, 321.123, "LOF原请求字段及值保持一致");
  pageVm.$destroy();
  console.log("材料取值验证通过：默认输入、主动查询、确认回填、取消保留、单/多候选、温度变化、慢响应、历史快照及原计算请求。");
})().catch(error => { console.error(error); process.exitCode = 1; });