/* 运行：node tests/sapRelatedData.test.js；使用现有Vue/Babel依赖验证分页和竞态。 */
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const Module = require("module");
const Vue = require("vue");
const compiler = require("vue-template-compiler");
const babel = require("babel-core");

const calls = [];
const sourcePath = path.resolve(__dirname, "../src/modules/drafts/components/SapRelatedData.vue");
const source = compiler.parseComponent(fs.readFileSync(sourcePath, "utf8"));
const compiled = babel.transform(source.script.content, {
  babelrc: false,
  presets: [["env", { modules: "commonjs" }], "stage-2"],
  plugins: ["transform-runtime"]
}).code;
const componentModule = new Module(sourcePath, module);
componentModule.filename = sourcePath;
componentModule.paths = Module._nodeModulePaths(path.dirname(sourcePath));
componentModule.require = name => name === "../api" ? {
  getSapRelatedDataPage(params) {
    return new Promise((resolve, reject) => calls.push({ params, resolve, reject }));
  }
} : module.require(name);
componentModule._compile(compiled, sourcePath);
const Component = Vue.extend(componentModule.exports.default);
const flush = () => new Promise(resolve => setImmediate(resolve));
const ok = (id, total = 2) => ({ code: 0, data: { records: [{ id }], total } });

async function run() {
  const instance = new Component({ propsData: { nodeName: "5AHP008MT" } });
  assert.deepStrictEqual(calls[0].params, { nodeName: "5AHP008MT", current: 1, size: 10 });
  calls[0].resolve(ok("first"));
  await flush();
  assert.strictEqual(instance.records[0].id, "first");
  assert.strictEqual(instance.total, 2);
  assert.strictEqual(instance.isReferenceUnit, true);
  instance.changePage(2);
  assert.strictEqual(calls[1].params.current, 2);
  assert.strictEqual(instance.total, 2, "翻页期间保留总数，避免分页器自动退回第一页");
  calls[1].resolve(ok("second"));
  await flush();
  assert.strictEqual(instance.records[0].id, "second");
  instance.changeSize(20);
  assert.strictEqual(calls[2].params.current, 1);
  assert.strictEqual(calls[2].params.size, 20);
  calls[2].resolve(ok("larger-page"));
  await flush();

  // 更换管道时，上一管道未完成请求不得覆盖新管道结果。
  instance.loadPage();
  const oldCall = calls[3];
  instance.nodeName = "3RRA020MT";
  await Vue.nextTick();
  calls[4].resolve(ok("new-node", 1));
  await flush();
  oldCall.resolve(ok("wrong-old-node", 999));
  await flush();
  assert.strictEqual(instance.records[0].id, "new-node");
  assert.strictEqual(instance.total, 1);
  assert.strictEqual(instance.current, 1);
  assert.strictEqual(instance.isReferenceUnit, false);

  instance.loadPage();
  calls[5].reject(new Error("connection failed"));
  await flush();
  assert.strictEqual(instance.error, "connection failed");
  assert.strictEqual(instance.loading, false);
  assert.strictEqual(instance.records.length, 0);
  instance.loadPage();
  calls[6].resolve({ code: 0, data: { records: [], total: 0 } });
  await flush();
  assert.strictEqual(instance.total, 0);
  assert.strictEqual(instance.error, "");
  instance.loadPage();
  calls[7].resolve({ code: 500, msg: "查询失败" });
  await flush();
  assert.strictEqual(instance.error, "查询失败");
  instance.nodeName = "";
  await Vue.nextTick();
  assert.strictEqual(calls.length, 8);
  assert.strictEqual(instance.total, 0);
  instance.nodeName = "5AHP008MT";
  await Vue.nextTick();
  instance.$destroy();
  calls[8].resolve(ok("after-destroy"));
  await flush();
  assert.strictEqual(instance.records.length, 0);
  assert.strictEqual(instance.formatCell({}, {}, null), "-");
  assert.strictEqual(instance.formatCell({}, {}, 0), 0);

  for (const file of ["drafts/components/SapRelatedData.vue", "drafts/components/directoryDetail.vue", "screen/components/AssetDetailPanel.vue"]) {
    const component = compiler.parseComponent(fs.readFileSync(path.resolve(__dirname, "../src/modules", file), "utf8"));
    const template = compiler.compile(component.template.content);
    assert.deepStrictEqual(template.errors, [], file);
    babel.transform(component.script.content);
  }
  console.log("PASS: SAP分页、节点切换竞态、失败重试、空页、销毁保护及三个Vue组件编译");
}
run().catch(error => { console.error(error); process.exitCode = 1; });
