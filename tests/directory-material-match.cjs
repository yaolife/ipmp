// 使用实际 Vue 组件和受控网络响应验证乱序请求，不启动服务或读写业务数据。
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const Vue = require('vue');
const compiler = require('vue-template-compiler');
const babel = require('babel-core');

const source = fs.readFileSync(path.join(__dirname, '../src/modules/drafts/components/directoryDetail.vue'), 'utf8');
const sfc = compiler.parseComponent(source);
const template = compiler.compile(sfc.template.content);
assert.deepStrictEqual(template.errors, [], '组件模板应能正常编译');

const detailRequests = [];
const matchRequests = [];
function deferred(queue, key) {
  return new Promise((resolve, reject) => queue.push({ key, resolve, reject }));
}
const api = {
  getResourceDirectoryDetail: id => deferred(detailRequests, id),
  matchMaterialLibrary: keyword => deferred(matchRequests, keyword)
};
const mocks = {
  '../api': api,
  '@/utils/directFileAccess': {
    authenticatedPreviewMixin: { methods: { releaseFilePreviews() {}, loadAuthenticatedImages() {} } }
  },
  '../naturalFrequency': { readFrequencyParams: () => ({}), writeFrequencyParams: () => ({}), frequencySupportOptions: [] },
  '@/utils/funcUtil': { debounce: fn => fn },
  '@/constant/componentType': { getComponentTypeItem: () => null }
};
const sandbox = { exports: {}, TabSvg: {}, require: name => {
  if (Object.prototype.hasOwnProperty.call(mocks, name)) return mocks[name];
  if (name.endsWith('.vue')) return {};
  throw new Error('未声明的测试依赖：' + name);
} };
vm.runInNewContext(babel.transform(sfc.script.content, {
  babelrc: false, plugins: ['transform-es2015-modules-commonjs']
}).code, sandbox);
const component = sandbox.exports.default;
const flush = async () => { await Vue.nextTick(); await new Promise(resolve => setImmediate(resolve)); };
const success = data => ({ code: 0, data });
const candidate = id => ({ id, materialGrade: id, elasticModulus: 200, poissonRatio: 0.3,
  materialDensity: 7800, yieldStrength: 250, fatigueLimit: 100 });

function create() {
  const messages = [];
  const instance = new Vue(Object.assign({}, component, {
    propsData: { directoryId: 'pipe-A' },
    beforeCreate() {
      this.$t = text => text;
      this.$message = Object.fromEntries(['error', 'warning', 'info', 'success']
        .map(type => [type, text => messages.push({ type, text })]));
    }
  }));
  return { instance, messages };
}
async function ready() {
  const context = create();
  detailRequests.shift().resolve(success({ id: 'pipe-A', material: 'A' }));
  await flush();
  assert.strictEqual(context.instance.loading, false);
  return context;
}

(async () => {
  let { instance: page, messages } = await ready();
  let promise = page.queryMaterialMatches();
  matchRequests.shift().resolve(success([candidate('material-A')]));
  await promise;
  assert.strictEqual(page.form.elasticModulus, '', '查询不应直接回填');
  page.applyMaterialMatch(page.materialMatchResults[0]);
  assert.strictEqual(page.form.elasticModulus, 200, '当前候选选择后正常回填');
  assert.strictEqual(page.form.materialDensity, 7800);
  assert.strictEqual(page.materialMatchVisible, false);
  page.$destroy();
  console.log('通过：正常查询、选择及回填');

  ({ instance: page, messages } = await ready());
  promise = page.queryMaterialMatches();
  const oldMatch = matchRequests.shift();
  page.directoryId = 'pipe-B';
  await flush();
  detailRequests.shift().resolve(success({ id: 'pipe-B', material: 'B' }));
  await flush();
  oldMatch.resolve(success([candidate('material-A')]));
  await promise;
  assert.strictEqual(page.materialMatchVisible, false, '旧管道响应不得弹出候选');
  assert.strictEqual(page.form.material, 'B');
  assert.strictEqual(page.form.elasticModulus, '');
  page.$destroy();
  console.log('通过：切换管道后丢弃旧匹配响应');

  ({ instance: page } = create());
  const oldDetail = detailRequests.shift();
  page.directoryId = 'pipe-B';
  await flush();
  detailRequests.shift().resolve(success({ id: 'pipe-B', material: 'B' }));
  await flush();
  oldDetail.resolve(success({ id: 'pipe-A', material: 'A' }));
  await flush();
  assert.strictEqual(page.detail.id, 'pipe-B');
  assert.strictEqual(page.form.material, 'B', '旧详情不得覆盖当前匹配所用材质');
  page.$destroy();
  console.log('通过：详情响应乱序不覆盖当前管道');

  ({ instance: page, messages } = await ready());
  const firstPromise = page.queryMaterialMatches();
  const first = matchRequests.shift();
  page.form.material = 'B';
  await flush();
  const secondPromise = page.queryMaterialMatches();
  const second = matchRequests.shift();
  first.reject(new Error('旧请求失败'));
  await firstPromise;
  assert.strictEqual(page.materialMatchLoading, true, '旧请求结束不能取消新请求的加载状态');
  assert.strictEqual(messages.length, 0, '旧请求失败不应提示错误');
  second.resolve(success([candidate('material-B')]));
  await secondPromise;
  assert.strictEqual(page.materialMatchKeyword, 'B');
  assert.strictEqual(page.materialMatchResults[0].id, 'material-B');
  const selected = page.materialMatchResults[0];
  page.form.material = 'C';
  // 在 Vue watcher 执行前也必须拒绝旧候选。
  page.applyMaterialMatch(selected);
  assert.strictEqual(page.form.elasticModulus, '');
  await flush();
  assert.strictEqual(page.materialMatchVisible, false);
  page.$destroy();
  console.log('通过：连续查询状态隔离、修改材质后拒绝旧候选');

  ({ instance: page } = await ready());
  const olderPromise = page.queryMaterialMatches();
  const older = matchRequests.shift();
  const newerPromise = page.queryMaterialMatches();
  matchRequests.shift().resolve(success([candidate('newer')]));
  await newerPromise;
  older.resolve(success([candidate('older')]));
  await olderPromise;
  assert.strictEqual(page.materialMatchResults[0].id, 'newer', '相同关键词重查也不得被旧响应覆盖');
  page.onMaterialMatchVisibilityChange(false);
  assert.strictEqual(page.materialMatchResults.length, 0);
  page.$destroy();
  console.log('通过：相同关键词响应乱序及弹窗关闭');

  for (const action of ['cancelMaterialMatches', '$destroy']) {
    ({ instance: page, messages } = await ready());
    promise = page.queryMaterialMatches();
    const pending = matchRequests.shift();
    page[action]();
    pending.resolve(success([candidate('late')]));
    await promise;
    assert.strictEqual(page.materialMatchVisible, false);
    assert.strictEqual(page.materialMatchResults.length, 0);
    assert.strictEqual(messages.length, 0);
    if (action !== '$destroy') page.$destroy();
  }
  assert.strictEqual(detailRequests.length, 0);
  assert.strictEqual(matchRequests.length, 0);
  console.log('通过：取消或销毁后慢响应不会重新打开弹窗');
})().catch(error => { console.error(error); process.exitCode = 1; });
