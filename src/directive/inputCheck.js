import { sanitizeInput } from "@/utils/inputValidation";

/** 在原控件处理input前清理用户输入，不监听或改写历史回显、文件和选择结果。 */
function bindInput(el, binding, vnode) {
  if (!binding.value) return;
  const options = binding.value;
  const state = el.__inputCheckState || { inputs: [], lastNotice: 0 };
  state.options = options;
  state.context = vnode.context;
  el.__inputCheckState = state;
  const inputs = /^(INPUT|TEXTAREA)$/.test(el.tagName) ? [el] : Array.from(el.querySelectorAll("input,textarea"));
  inputs.forEach(input => {
    if (["file", "password", "checkbox", "radio", "color", "hidden"].indexOf(input.type) !== -1) return;
    let attached = state.inputs.find(item => item.input === input);
    if (!attached) {
      attached = { input, originalMax: input.getAttribute("maxlength"), composing: false };
      const sanitize = () => {
        if (input.disabled || input.readOnly) return;
        const before = input.value;
        const after = sanitizeInput(before, attached.rule);
        if (before === after) return;
        const caret = input.selectionStart;
        input.value = after;
        // 文本框恢复清理后的光标；number控件不支持selection API。
        if (caret !== null && typeof input.setSelectionRange === "function") {
          const position = sanitizeInput(before.slice(0, caret), attached.rule).length;
          input.setSelectionRange(position, position);
        }
        if (state.context && state.context.$message && Date.now() - state.lastNotice > 1500) {
          state.lastNotice = Date.now();
          const lengthTip = attached.rule.maxBytes ? attached.rule.maxBytes + "字节" : attached.rule.maxLength + "个字符";
          state.context.$message.warning("已限制非法字符或超长输入，当前字段最多" + lengthTip);
        }
      };
      attached.onInput = event => {
        if (!attached.composing && !event.isComposing && !input.composing) sanitize();
      };
      attached.onCompositionStart = () => { attached.composing = true; };
      attached.onCompositionEnd = () => {
        attached.composing = false;
        sanitize();
        // 原生v-model在组合输入结束前不会提交值；先清理，再交还给原控件的输入处理。
        input.composing = false;
        const event = document.createEvent("HTMLEvents");
        event.initEvent("input", true, false);
        input.dispatchEvent(event);
      };
      input.addEventListener("input", attached.onInput, true);
      input.addEventListener("compositionstart", attached.onCompositionStart, true);
      input.addEventListener("compositionend", attached.onCompositionEnd, true);
      state.inputs.push(attached);
    }
    const isNumber = input.type === "number" || (vnode.componentOptions && vnode.componentOptions.Ctor.options.name === "ElInputNumber");
    // 所有字段上限由控件直接传入；这里只复用事件处理，不识别业务字段名。
    attached.rule = Object.assign({ maxLength: isNumber ? 32 : 255, kind: isNumber ? "number" : "text" }, options);
    if (!attached.rule.kind) attached.rule.kind = isNumber ? "number" : "text";
    if (!attached.rule.maxLength) attached.rule.maxLength = isNumber ? 32 : 255;
    if (attached.rule.kind === "number") attached.rule.maxLength = Math.min(attached.rule.maxLength, 32);
    const existing = Number(attached.originalMax);
    if (existing > 0) attached.rule.maxLength = Math.min(attached.rule.maxLength, existing);
    if (input.type !== "number") input.setAttribute("maxlength", String(attached.rule.maxLength));
  });
}

export default {
  inserted: bindInput,
  componentUpdated: bindInput,
  unbind(el) {
    const state = el.__inputCheckState;
    if (!state) return;
    state.inputs.forEach(item => {
      item.input.removeEventListener("input", item.onInput, true);
      item.input.removeEventListener("compositionstart", item.onCompositionStart, true);
      item.input.removeEventListener("compositionend", item.onCompositionEnd, true);
      if (item.originalMax === null) item.input.removeAttribute("maxlength");
      else item.input.setAttribute("maxlength", item.originalMax);
    });
    delete el.__inputCheckState;
  }
};
