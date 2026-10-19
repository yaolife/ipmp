const ANALYSTS = ["张三", "李三", "王五", "赵六"];
const STATUSES = ["published", "pending", "draft"];
const NAMES = [
  "主蒸汽管道应力分析",
  "主给水管道应力分析",
  "辅助蒸汽管道应力分析",
  "凝结水管道应力分析",
  "循环水管道应力分析",
  "旁路管道应力分析",
  "抽汽管道应力分析",
  "疏水管道应力分析"
];

function pad(value) {
  return value < 10 ? "0" + value : String(value);
}

export function formatDateTime(date) {
  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    " " +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes()) +
    ":" +
    pad(date.getSeconds())
  );
}

function buildMockRecords() {
  const start = new Date(2026, 4, 17, 9, 41, 23);
  const records = [];
  for (let index = 0; index < 128; index += 1) {
    const time = new Date(start.getTime() - index * 26 * 60 * 60 * 1000);
    const serial = index + 1;
    records.push({
      id: "stress-" + serial,
      analysisName: NAMES[index % NAMES.length],
      analysisNo: "PSA-" + String(1000 + serial),
      description: NAMES[index % NAMES.length] + "，覆盖设计工况与支吊架边界。",
      analyst: ANALYSTS[index % ANALYSTS.length],
      versionNo: "V1." + (index % 8),
      analysisTime: formatDateTime(time),
      status: STATUSES[index % STATUSES.length]
    });
  }
  return records;
}

export const ANALYST_OPTIONS = ANALYSTS.slice();
export const stressRecords = buildMockRecords();

let serial = stressRecords.length;

export function createStressRecord(partial) {
  serial += 1;
  const record = Object.assign(
    {
      id: "stress-" + serial,
      analysisName: "",
      analysisNo: "PSA-" + String(1000 + serial),
      description: "",
      analyst: ANALYST_OPTIONS[0],
      versionNo: "V1.0",
      analysisTime: formatDateTime(new Date()),
      status: "draft"
    },
    partial || {}
  );
  record.id = "stress-" + serial;
  stressRecords.unshift(record);
  return record;
}

export function updateStressRecord(record) {
  const index = stressRecords.findIndex(item => item.id === record.id);
  if (index === -1) return null;
  stressRecords.splice(index, 1, Object.assign({}, stressRecords[index], record));
  return stressRecords[index];
}

export function removeStressRecord(id) {
  const index = stressRecords.findIndex(item => item.id === id);
  if (index === -1) return false;
  stressRecords.splice(index, 1);
  return true;
}
