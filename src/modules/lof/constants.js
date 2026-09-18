export const INCENTIVES = [
  { id: 's1', name: '流动湍流' },
  { id: 's2', name: '高频声学激励' },
  { id: 's3', name: '机械激励' },
  { id: 's4', name: '往复流体脉动' },
  { id: 's5', name: '离心旋转失速' },
  { id: 's6', name: '空化闪蒸' },
  { id: 's7', name: '阀门水锤冲击' },
  { id: 's8', name: '侵入元件涡激' },
  { id: 's9', name: '段塞两相冲击' },
  { id: 's10', name: '历史振动失效' }
];

export const CONDITIONS = [
  { id: 'c1', name: '施工制造标准等级', source: '管道台账' },
  { id: 'c2', name: '腐蚀/介质侵蚀管控', source: '腐蚀管理台账' },
  { id: 'c3', name: '周期性间歇负荷波动', source: '运行工况库' },
  { id: 'c4', name: '年度启停/工况切换频次', source: '年度运行记录' }
];

export const SCORE_OPTIONS = [
  { value: 1, label: '1 - 低' },
  { value: 2, label: '2 - 中' },
  { value: 3, label: '3 - 高' }
];

export const RISK_MAP = {
  0: { text: 'Low', cls: 'badge-low' },
  1: { text: 'Medium', cls: 'badge-medium' },
  2: { text: 'High', cls: 'badge-high' }
};

export function scoreClass(score) {
  if (Number(score) === 1) return 'badge-low';
  if (Number(score) === 2) return 'badge-medium';
  if (Number(score) === 3) return 'badge-high';
  return 'badge-na';
}

export function riskMeta(level) {
  if (level === 0 || level === '0') return RISK_MAP[0];
  if (level === 1 || level === '1') return RISK_MAP[1];
  if (level === 2 || level === '2') return RISK_MAP[2];
  return { text: '-', cls: 'badge-na' };
}
