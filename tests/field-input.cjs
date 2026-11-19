// 执行：node tests/field-input.cjs。只验证输入规则与事件，不访问业务服务。
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const babel = require('babel-core');
const iconv = require('iconv-lite');

function load(relative, mocks) {
  const source = fs.readFileSync(path.join(__dirname, '..', relative), 'utf8');
  const sandbox = { exports: {}, Set, Uint8Array, TextDecoder,
    document: { createEvent: () => ({ initEvent(type) { this.type = type; } }) },
    require: name => {
      if (!Object.prototype.hasOwnProperty.call(mocks, name)) throw new Error('未声明测试依赖：' + name);
      return mocks[name];
    }
  };
  vm.runInNewContext(babel.transform(source, {
    babelrc: false, plugins: ['transform-es2015-modules-commonjs']
  }).code, sandbox);
  return sandbox.exports;
}

const policy = load('src/utils/inputValidation.js', {});
const directive = load('src/directive/inputCheck.js', { '@/utils/inputValidation': policy }).default;
const clean = (rule, text) => policy.sanitizeInput(text, Object.assign({ kind: 'text' }, rule));

// 对照现有编码库验证GB18030计数，包括4字节字符，避免只按汉字固定2字节估计。
for (const value of ['ABP-5', '碳钢（304L）φ108×5.0 ± ℃', 'Ā', '😀', '𠀀']) {
  assert.strictEqual(policy.inputTextBytes(value), iconv.encode(value, 'GB18030').length, value);
}
assert.strictEqual(clean({ maxLength: 100, kind: "text", maxBytes: 100 }, '中'.repeat(51)), '中'.repeat(50));
assert.strictEqual(clean({ maxLength: 64, kind: "text", maxBytes: 64 }, 'A'.repeat(65)), 'A'.repeat(64));
assert.strictEqual(clean({ maxLength: 50, kind: "text", maxBytes: 50 }, '中'.repeat(26)), '中'.repeat(25));
assert.strictEqual(clean({ maxLength: 255, kind: "text", maxBytes: 255 }, 'A'.repeat(255)), 'A'.repeat(255));
console.log('通过：字段长度、中文和多字节存储边界');

const expected = 'Q235-B / 304L（φ108×5.0）±℃';
assert.strictEqual(clean({ maxLength: 255, kind: "text", maxBytes: 255 }, expected), expected);
assert.strictEqual(clean({ maxLength: 32, kind: "expression" }, '<= 25.5'), '<= 25.5');
assert.strictEqual(clean({ maxLength: 32, kind: "number" }, '-2.5e-3'), '-2.5e-3');
assert.strictEqual(clean({ maxLength: 1000, kind: "multiline", maxBytes: 1000 }, '第一行\r\n第二行'), '第一行\r\n第二行');
assert.strictEqual(clean({ maxLength: 1000, kind: "multiline", maxBytes: 1000 }, '温度<50℃，压力>1MPa'), '温度<50℃，压力>1MPa');
assert.strictEqual(clean({ maxLength: 1000, kind: "multiline", maxBytes: 1000 }, '<script>异常标签</script>'), '异常标签');
assert.strictEqual(clean({ maxLength: 100, kind: "text", maxBytes: 100 }, '碳\t\n钢'), '碳钢');
for (const bad of ['\0', '\u007f', '\u00ad', '\u034f', '\u200b', '\u202e', '\u2066', '\ufeff', '\ufffd', '\ud800', '\udfff', '<', '>', '`']) {
  assert.strictEqual(clean({ maxLength: 100, kind: "text", maxBytes: 100 }, '碳' + bad + '钢'), '碳钢');
}
assert.throws(() => policy.validateInputText('中'.repeat(51), { maxLength: 100, kind: "text", maxBytes: 100 }, '材料子类'));
assert.throws(() => policy.validateInputText('碳\u200b钢', { maxLength: 100, kind: "text", maxBytes: 100 }, '材料子类'));
console.log('通过：合法牌号、比较符、负数和科学计数法保留，非法字符被限制');

// 只模拟标准DOM事件的捕获/冒泡顺序，以验证指令先于原有v-model和组件处理输入。
function input(type = 'text') {
  const attributes = {};
  const handlers = [];
  return { tagName: 'INPUT', type, value: '', disabled: false, readOnly: false, composing: false,
    get selectionStart() { return type === 'number' ? null : this.value.length; },
    getAttribute: name => Object.prototype.hasOwnProperty.call(attributes, name) ? attributes[name] : null,
    setAttribute: (name, value) => { attributes[name] = value; },
    removeAttribute: name => { delete attributes[name]; },
    setSelectionRange() {},
    addEventListener: (event, handler, capture) => handlers.push({ event, handler, capture: !!capture }),
    removeEventListener(event, handler) {
      const index = handlers.findIndex(item => item.event === event && item.handler === handler);
      if (index >= 0) handlers.splice(index, 1);
    },
    dispatchEvent(event) {
      event.target = this;
      handlers.filter(item => item.event === event.type).sort((a, b) => Number(b.capture) - Number(a.capture))
        .forEach(item => item.handler(event));
    }
  };
}
const vnode = { context: { $message: { warning() {} } } };
let element = input();
let model = '';
element.value = '历史回显\u200b内容';
directive.inserted(element, { value: { maxLength: 100, kind: "text", maxBytes: 100 } }, vnode);
assert.strictEqual(element.value, '历史回显\u200b内容', '挂载时不能修改已有业务数据');
element.addEventListener('input', () => { model = element.value; });
element.value = '中'.repeat(51) + '\u200b';
element.dispatchEvent({ type: 'input' });
assert.strictEqual(model, '中'.repeat(50), '原有输入处理必须接收已约束内容');
directive.unbind(element);
assert.strictEqual(element.getAttribute('maxlength'), null);
console.log('通过：历史回显不改写、粘贴先清理再提交、销毁后释放监听');

element = input();
directive.inserted(element, { value: { maxLength: 100, kind: "text", maxBytes: 100 } }, vnode);
model = '';
element.addEventListener('compositionstart', () => { element.composing = true; });
element.addEventListener('input', () => { if (!element.composing) model = element.value; });
element.dispatchEvent({ type: 'compositionstart' });
element.value = 'zhong';
element.dispatchEvent({ type: 'input', isComposing: true });
assert.strictEqual(model, '');
element.value = '中文\u200b';
element.dispatchEvent({ type: 'compositionend' });
assert.strictEqual(model, '中文');
console.log('通过：中文组合输入过程中不干扰，确认后才应用限制');

element = input('number');
directive.inserted(element, { value: { maxLength: 32, kind: "number" } }, vnode);
element.value = '1'.repeat(40);
element.dispatchEvent({ type: 'input' });
assert.strictEqual(element.value.length, 32, '原生number不支持maxlength，仍需拦截长度');
element.value = '-2.1e+11';
element.dispatchEvent({ type: 'input' });
assert.strictEqual(element.value, '-2.1e+11');
console.log('通过：数字输入长度受限，原有负号和科学计数法不变');
