/* 上线前页面逻辑回归：执行真实Vue脚本和请求状态逻辑，API用可控Promise替身；不连接业务服务。 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const babel = require('babel-core');
const root = path.resolve(__dirname, '..');
const cache = new Map();
const api = {};
const cases = [];
const failures = [];
const plain = value => JSON.parse(JSON.stringify(value));
function test(name, body) { cases.push({ name, body }); }
function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
async function flush() { for (let i = 0; i < 12; i++) await Promise.resolve(); }

// 只编译实际组件脚本；子组件视图和样式不参与本组无DOM测试。
function load(file, component) {
  file = path.resolve(root, file);
  if (cache.has(file)) return cache.get(file);
  let source = fs.readFileSync(file, 'utf8');
  if (file.endsWith('.vue')) source = source.split('<script>')[1].split('</script>')[0];
  const compiled = babel.transform(source, { babelrc: false, presets: [['env', { targets: { node: 'current' }, modules: 'commonjs' }], 'stage-2'] }).code;
  const module = { exports: {} };
  const localRequire = request => {
    if (request.endsWith('.css') || request.endsWith('.vue') || request.startsWith('./components/')) return {};
    if (request === './api') return { __esModule: true, default: api };
    let next = path.resolve(path.dirname(file), request);
    if (!path.extname(next)) next += '.js';
    return load(next);
  };
  vm.runInNewContext(compiled, { module, exports: module.exports, require: localRequire, Promise, console, setTimeout, clearTimeout }, { filename: file });
  cache.set(file, module.exports);
  return module.exports;
}
function mount(name) {
  const component = load('src/modules/lof/' + name + '.vue').default;
  const ctx = { $refs: {}, $route: { query: {} }, messages: [], $set: (obj, key, value) => { obj[key] = value; } };
  ctx.$message = {};
  ['warning', 'error', 'success'].forEach(key => { ctx.$message[key] = text => ctx.messages.push({ key, text }); });
  ctx.$confirm = () => Promise.resolve();
  function apply(options) {
    (options.mixins || []).forEach(apply);
    if (options.data) Object.assign(ctx, options.data.call(ctx));
    Object.keys(options.methods || {}).forEach(key => { ctx[key] = options.methods[key].bind(ctx); });
    Object.keys(options.computed || {}).forEach(key => {
      const getter = options.computed[key];
      Object.defineProperty(ctx, key, { configurable: true, get: () => (typeof getter === 'function' ? getter : getter.get).call(ctx) });
    });
  }
  apply(component);
  ctx.segmentId = 'segment-a';
  return ctx;
}
const pages = [
  { name: 'qualitativeAssessment', evaluate: 'evaluate', save: 'save', apply: 'applyResult', apiEvaluate: 'evaluate', apiSave: 'save', page: 'pageHistory', detail: 'getDetail', history: 'loadHistory' },
  { name: 'quantitativeAssessment', evaluate: 'evaluateTm02', save: 'saveTm02', apply: 'applyBackendResult', apiEvaluate: 'evaluateTm02', apiSave: 'saveTm02', page: 'pageTm02History', detail: 'getTm02Detail', history: 'loadHistoryDetail' },
  { name: 'vibrationCheck', evaluate: 'evaluateTm05', save: 'saveTm05', apply: 'applyBackendResult', apiEvaluate: 'evaluateTm05', apiSave: 'saveTm05', page: 'pageTm05History', detail: 'getTm05Detail', history: 'loadHistoryDetail' }
];

for (const p of pages) {
  test(p.name + '：计算正常回包及业务失败', async () => {
    const ctx = mount(p.name);
    const applied = [];
    ctx[p.apply] = data => applied.push(data);
    ctx.loadHistoryPage = () => {};
    for (const code of [0, '0', 400]) {
      const request = deferred();
      api[p.apiEvaluate] = () => request.promise;
      ctx[p.evaluate]();
      assert.equal(ctx.evaluating, true);
      request.resolve({ code, data: { marker: code }, msg: '结果' });
      await flush();
      assert.equal(ctx.evaluating, false);
    }
    assert.equal(applied.length, 2);
    assert.equal(ctx.messages.filter(item => item.key === 'error').length, 1);
  });
  test(p.name + '：慢计算、修改输入、切换管段和销毁不会回写旧结果', async () => {
    for (const scenario of ['newer', 'edit', 'segment', 'destroy']) {
      const ctx = mount(p.name);
      const old = deferred(), newer = deferred(), applied = [];
      let calls = 0;
      api[p.apiEvaluate] = () => (++calls === 1 ? old.promise : newer.promise);
      ctx[p.apply] = data => applied.push(data);
      ctx.loadHistoryPage = () => {};
      ctx[p.evaluate]();
      if (scenario === 'newer') {
        ctx[p.evaluate]();
        newer.resolve({ code: 0, data: 'new' });
        await flush();
      } else if (scenario === 'edit') {
        if (p.name === 'qualitativeAssessment') ctx.assessmentType = 'operate';
        else ctx.remarks = '用户已修改';
      } else {
        if (scenario === 'segment') ctx.segmentId = 'segment-b';
        ctx.invalidateSegmentRequests();
      }
      old.resolve({ code: 0, data: 'old' });
      await flush();
      assert.deepEqual(applied, scenario === 'newer' ? ['new'] : []);
      assert.equal(ctx.evaluating, false);
    }
  });
  test(p.name + '：确认保存及取消、重复点击、编辑中回包', async () => {
    for (const scenario of ['save', 'cancel', 'edit', 'switch-before-confirm']) {
      const ctx = mount(p.name);
      const confirmation = deferred(), request = deferred(), applied = [];
      let calls = 0, histories = 0;
      ctx.$confirm = () => confirmation.promise;
      ctx[p.apply] = data => applied.push(data);
      ctx.loadHistoryPage = () => { histories++; };
      api[p.apiSave] = () => { calls++; return request.promise; };
      ctx[p.save]();
      ctx[p.save]();
      if (scenario === 'cancel') {
        confirmation.reject('cancel');
      } else {
        if (scenario === 'switch-before-confirm') { ctx.segmentId = 'segment-b'; ctx.invalidateSegmentRequests(); }
        confirmation.resolve();
      }
      await flush();
      if (scenario === 'edit') {
        if (p.name === 'qualitativeAssessment') ctx.assessmentType = 'operate';
        else ctx.remarks = '继续修改';
      }
      request.resolve({ code: 0, data: { id: 'version-1' } });
      await flush();
      assert.equal(calls, ['cancel', 'switch-before-confirm'].includes(scenario) ? 0 : 1);
      assert.equal(applied.length, scenario === 'save' ? 1 : 0);
      assert.equal(histories, ['save', 'edit'].includes(scenario) ? 1 : 0);
      assert.equal(ctx.saving, false);
      assert.equal(ctx.messages.filter(item => item.key === 'error').length, 0);
    }
  });
  test(p.name + '：历史分页乱序及跨管段详情隔离', async () => {
    const ctx = mount(p.name), first = deferred(), last = deferred(), detail = deferred();
    let calls = 0;
    api[p.page] = () => (++calls === 1 ? first.promise : last.promise);
    ctx.loadHistoryPage();
    ctx.historyCurrent = 2;
    ctx.loadHistoryPage();
    last.resolve({ code: 0, data: { records: [{ id: 'page-2' }], total: 22 } });
    first.resolve({ code: 0, data: { records: [{ id: 'page-1' }], total: 22 } });
    await flush();
    assert.equal(ctx.history[0].id, 'page-2');
    assert.equal(ctx.historyTotal, 22);
    const applied = [];
    ctx[p.apply] = data => applied.push(data);
    api[p.detail] = () => detail.promise;
    ctx[p.history]({ id: 'version-1' });
    await flush();
    ctx.segmentId = 'segment-b';
    ctx.invalidateSegmentRequests();
    detail.resolve({ code: 0, data: { inputs: {} } });
    await flush();
    assert.deepEqual(applied, []);
  });
  test(p.name + '：网络失败恢复按钮并显示错误', async () => {
    const ctx = mount(p.name);
    api[p.apiEvaluate] = () => Promise.reject(new Error('断网'));
    ctx[p.evaluate]();
    await flush();
    assert.equal(ctx.evaluating, false);
    assert.equal(ctx.messages.filter(item => item.key === 'error').length, 1);
  });
}

test('TM01：人工分值及备注映射，未改变的分值不重复提交', () => {
  const ctx = mount('qualitativeAssessment');
  ctx.result.autoScores = { s1: 1, s2: 2 };
  ctx.result.manualScores = { s1: 3, s2: 2 };
  ctx.result.remarks = { s1: '工程复核' };
  const payload = plain(ctx.buildPayload());
  assert.deepEqual(payload.manualScores, { s1: 3 });
  assert.deepEqual(payload.remarks, { s1: '工程复核' });
});

test('TM02：历史多声源距离、旧hasReport和零值参数往返', () => {
  const ctx = mount('quantitativeAssessment');
  const inputs = {
    segmentParameters: { outerDiameter: 500, thickness: 10, velocity: 0, fluidDensity: 20, span: 5, supportType: '刚性' },
    highFrequencyAcoustic: { soundSpeed: 340, sources: [{ name: '源1' }, { name: '源2' }], discontinuities: [{ name: '点1', distance: 12 }, { name: '点2', sourceDistances: [2, 4] }] },
    reciprocating: { hasReport: false },
    cavitation: { pressureDropByValve: 0, pressureDrop: 123, vaporPressure: 456 }
  };
  ctx.applyHistoryInputs(inputs);
  const payload = plain(ctx.buildPayload());
  assert.equal(payload.segmentParameters.velocity, 0);
  assert.equal(payload.reciprocating.equipmentKnown, 0);
  assert.deepEqual(payload.highFrequencyAcoustic.discontinuities[0].sourceDistances, [12, 12]);
  assert.deepEqual(payload.highFrequencyAcoustic.discontinuities[1].sourceDistances, [2, 4]);
  assert.equal(payload.cavitation.pressureDropByValve, 0);
  assert.equal(payload.cavitation.pressureDrop, null);
  assert.equal(payload.cavitation.vaporPressure, null);
});

test('TM05：材料独立值优先、旧公共值兼容及响应字段回显', () => {
  const ctx = mount('vibrationCheck');
  ctx.applyHistoryInputs({ parameters: { do1: 60.3, tp1: 5.54, lp1: 800, materialDensity: 7980, materialDensity2: 2700, fluidDensity: 36.5, insulationDensity: 120, insulationThickness: 50, insulationThickness1: 0, weldType: 'BUTTERFLY_WELDING', endCondition: 'STRAIGHT', fatigueLimit: 100, c5: 0 }, measuredVibration: { peakVelocity: 0 } });
  const payload = ctx.buildPayload();
  assert.equal(payload.parameters.materialDensity1, 7980);
  assert.equal(payload.parameters.materialDensity2, 2700);
  assert.equal(payload.parameters.insulationThickness1, 0);
  assert.equal(payload.parameters.c5, 0);
  assert.equal(payload.measuredVibration.peakVelocity, 0);
  assert.equal(payload.parameters.weldType, 'BUTT_WELDING');
  for (const limits of [{ vpeakAllow: 100, vrmsAllow: 28 }, { vPeakAllow: 100, vRmsAllow: 28 }]) {
    ctx.applyBackendResult(Object.assign({ results: { vibrationGrade: 2, ratioFinal: 1.2, dynamicStress: {} } }, limits));
    assert.equal(ctx.grade.allowVpText, '100.000');
    assert.equal(ctx.grade.badgeText, '2 预警');
    assert.equal(ctx.showStress, true);
  }
});

test('TM05：慢管段详情不能覆盖已选择的历史输入', async () => {
  const ctx = mount('vibrationCheck'), segment = deferred(), history = deferred();
  api.getResourceDirectoryDetail = () => segment.promise;
  api.pageTm02History = () => Promise.resolve({ code: 0, data: { records: [] } });
  api.pageTm05History = () => Promise.resolve({ code: 0, data: { records: [] } });
  api.getTm05Detail = () => history.promise;
  ctx.onSegmentChange('segment-a');
  ctx.loadHistoryDetail({ id: 'version-1' });
  history.resolve({ code: 0, data: { inputs: { parameters: { do1: 88.9, tp1: 6.3, lp1: 1234, fatigueLimit: 90 } }, results: {} } });
  await flush();
  segment.resolve({ code: 0, data: { outerDiameter: 60.3, wallThickness: 5.54, spanReference: 2, fatigueLimit: 100 } });
  await flush();
  assert.equal(ctx.form.Do[0], 88.9);
  assert.equal(ctx.form.Lp[0], 1234);
  assert.equal(ctx.form.Sa_T, 90);
});

(async () => {
  for (const item of cases) {
    Object.keys(api).forEach(key => { delete api[key]; });
    try { await item.body(); process.stdout.write('PASS ' + item.name + '\n'); }
    catch (error) { failures.push(item.name); process.stdout.write('FAIL ' + item.name + '\n' + error.stack + '\n'); }
  }
  process.stdout.write(JSON.stringify({ groups: cases.length, passed: cases.length - failures.length, failed: failures.length }) + '\n');
  if (failures.length) process.exitCode = 1;
})();
