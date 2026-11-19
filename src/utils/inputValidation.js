let gbTwoByteCharacters = null;

/** GB18030双字节表从浏览器已有解码器构造一次，避免引入整套额外编码依赖。 */
function gbCharacterBytes(character) {
  const code = character.codePointAt(0);
  if (code < 128) return 1;
  if (gbTwoByteCharacters === null) {
    gbTwoByteCharacters = new Set();
    if (typeof TextDecoder !== "undefined") {
      try {
        const bytes = [];
        for (let lead = 0x81; lead <= 0xfe; lead++) {
          for (let trail = 0x40; trail <= 0xfe; trail++) {
            if (trail !== 0x7f) bytes.push(lead, trail);
          }
        }
        for (const value of new TextDecoder("gb18030").decode(new Uint8Array(bytes))) {
          if (value !== "\ufffd") gbTwoByteCharacters.add(value);
        }
      } catch (error) {
        // 旧浏览器保留基本汉字的准确计数；其他未识别文字按四字节保守计算。
      }
    }
  }
  if (gbTwoByteCharacters.has(character) || (code >= 0x4e00 && code <= 0x9fa5)) return 2;
  return 4;
}

/** 按现有GB18030存储边界计数；字段是否限制字节及其上限由对应控件显式指定。 */
export function inputTextBytes(value) {
  let total = 0;
  for (const character of String(value)) {
    total += gbCharacterBytes(character);
  }
  return total;
}

/** 只拒绝明确的控制/格式字符、替换字符及非法Unicode，不猜测正常中文是否属于乱码。 */
export function isForbiddenCodePoint(code, multiline) {
  if (code === 10 || code === 13) return !multiline;
  if (code >= 0xd800 && code <= 0xdfff) return true;
  if ((code & 0xffff) >= 0xfffe) return true;
  return [[0, 9], [11, 12], [14, 31], [127, 160], [173, 173], [847, 847], [1564, 1564], [4447, 4448], [6068, 6069], [6155, 6159], [8192, 8207], [8232, 8239], [8287, 8303], [10240, 10240], [12644, 12644], [64976, 65007], [65279, 65279], [65440, 65440], [65529, 65535], [917504, 917631]].some(range => code >= range[0] && code <= range[1]);
}

/** 仅处理本次键入/粘贴；单位、中文牌号、负号和科学计数法均保持原语义。 */
export function sanitizeInput(value, rule) {
  const raw = String(value == null ? "" : value);
  const text = rule.kind === "json" ? raw : raw.replace(/<\s*\/?\s*[a-z][^>\r\n]*>/gi, "");
  let result = "";
  let bytes = 0;
  for (const character of text) {
    if (isForbiddenCodePoint(character.codePointAt(0), rule.kind === "multiline")) continue;
    if (rule.kind === "number" && !/[0-9eE.+-]/.test(character)) continue;
    // 名称/编码不接受HTML定界符；备注和比较条件保留合法数学比较符，仍拒绝标签及反引号。
    if (rule.kind !== "json" && (character === "`" ||
        (rule.kind !== "expression" && rule.kind !== "multiline" && /[<>]/.test(character)))) continue;
    if (result.length + character.length > rule.maxLength) break;
    const characterBytes = rule.maxBytes ? inputTextBytes(character) : 0;
    if (rule.maxBytes && bytes + characterBytes > rule.maxBytes) break;
    result += character;
    bytes += characterBytes;
  }
  return result;
}

/** 校验提交值而不截断；非法数据必须由用户修正，不能静默改变待保存内容。 */
export function validateInputText(value, rule, label) {
  if (value === null || value === undefined || typeof value !== "string") return;
  const name = label || "输入内容";
  if (value.length > rule.maxLength) throw new Error(name + "最多允许" + rule.maxLength + "个字符");
  if (rule.maxBytes && inputTextBytes(value) > rule.maxBytes) throw new Error(name + "最多允许" + rule.maxBytes + "字节");
  if (sanitizeInput(value, rule) !== value) throw new Error(name + "含有非法或不可见字符");
}
