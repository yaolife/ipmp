/**
 * 全局管道元件类型
 * 与后端枚举保持一致：PIPE(0), ELBOW(1), ...
 */
export const COMPONENT_TYPES = [
  { code: 0, key: "PIPE", i18nKey: "lang.component_type_pipe" },
  { code: 1, key: "ELBOW", i18nKey: "lang.component_type_elbow" },
  { code: 2, key: "TEE", i18nKey: "lang.component_type_tee" },
  { code: 3, key: "REDUCER", i18nKey: "lang.component_type_reducer" },
  { code: 4, key: "WELD", i18nKey: "lang.component_type_weld" },
  { code: 5, key: "VALVE", i18nKey: "lang.component_type_valve" },
  { code: 6, key: "SAFETY_VALVE", i18nKey: "lang.component_type_safety_valve" },
  { code: 7, key: "ESD_VALVE", i18nKey: "lang.component_type_esd_valve" },
  { code: 8, key: "CHECK_VALVE", i18nKey: "lang.component_type_check_valve" },
  { code: 9, key: "THREE_WAY_VALVE", i18nKey: "lang.component_type_three_way_valve" },
  { code: 10, key: "GATE_VALVE", i18nKey: "lang.component_type_gate_valve" },
  { code: 11, key: "ORIFICE", i18nKey: "lang.component_type_orifice" },
  { code: 12, key: "FLANGE", i18nKey: "lang.component_type_flange" },
  { code: 13, key: "THERMOWELL", i18nKey: "lang.component_type_thermowell" },
  { code: 14, key: "SAMPLE", i18nKey: "lang.component_type_sample" },
  { code: 15, key: "NOZZLE", i18nKey: "lang.component_type_nozzle" },
  { code: 16, key: "CREEP", i18nKey: "lang.component_type_creep" },
  { code: 17, key: "DISPLACEMENT", i18nKey: "lang.component_type_displacement" },
  { code: 18, key: "FLOW_ELEMENT", i18nKey: "lang.component_type_flow_element" },
  { code: 19, key: "TEMP_ELEMENT", i18nKey: "lang.component_type_temp_element" },
  { code: 20, key: "SUPPORT", i18nKey: "lang.component_type_support" },
  { code: 21, key: "BOILER_PART", i18nKey: "lang.component_type_boiler_part" },
  { code: 22, key: "SMALL_BRANCH_PIPE", i18nKey: "lang.component_type_small_branch_pipe" },
  { code: 23, key: "SMALL_BRANCH_PIPE_SEAT", i18nKey: "lang.component_type_small_branch_pipe_seat" },
  { code: 24, key: "ELECTRIC_GATE_VALVE", i18nKey: "lang.component_type_electric_gate_valve" }
];

export const COMPONENT_TYPE = COMPONENT_TYPES.reduce((map, item) => {
  map[item.key] = item.code;
  return map;
}, {});

const TYPE_BY_CODE = COMPONENT_TYPES.reduce((map, item) => {
  map[item.code] = item;
  return map;
}, {});

const TYPE_BY_KEY = COMPONENT_TYPES.reduce((map, item) => {
  map[item.key] = item;
  return map;
}, {});

export function getComponentTypeItem(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number" && TYPE_BY_CODE[value]) {
    return TYPE_BY_CODE[value];
  }
  const text = String(value).trim();
  if (!text) return null;
  if (TYPE_BY_KEY[text]) return TYPE_BY_KEY[text];
  const asCode = Number(text);
  if (!Number.isNaN(asCode) && TYPE_BY_CODE[asCode]) {
    return TYPE_BY_CODE[asCode];
  }
  return null;
}

export function getComponentTypeLabel(value, t) {
  const item = getComponentTypeItem(value);
  if (!item) {
    return value === null || value === undefined ? "" : String(value);
  }
  if (typeof t === "function") {
    return t(item.i18nKey);
  }
  return item.key;
}

export function getComponentTypeOptions(t) {
  return COMPONENT_TYPES.map(item => ({
    value: item.code,
    key: item.key,
    label: typeof t === "function" ? t(item.i18nKey) : item.key
  }));
}

export default {
  COMPONENT_TYPE,
  COMPONENT_TYPES,
  getComponentTypeItem,
  getComponentTypeLabel,
  getComponentTypeOptions
};
