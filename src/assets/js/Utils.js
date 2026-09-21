/**
 * 默认分页设置
 * @type {{layout: string, pageSizes: number[]}}
 */
export const Pagination = {
  layout: "total,sizes, prev, pager, next",
  pageSizes: [10, 20, 30, 40, 50, 100],
};

/**
 * 过滤器
 * @type {{taskCountDesc(*): string, priorityClass(*): string, fieldValue(*=, *): string}}
 */
export const Filters = {
  /**
   * 耗时格式化
   * @param duration 耗时的总数（duration个基本单位）
   * @param oneSecond 耗时中每秒占oneSecond个基本单位
   * @return {string}
   */
  durationDesc(duration, oneSecond) {
    duration = (duration === "" || duration == null || isNaN(duration)) ? duration : Number(duration);
    oneSecond = oneSecond || 1;
    const oneMinute = 60 * oneSecond;
    const oneHour = 60 * oneMinute;
    const oneDay = 24 * oneHour;

    let durationDesc = "";
    if (duration >= oneDay) {
      let days = (duration / oneDay).toFixed(2);
      durationDesc = parseFloat(days) + "天";
    } else if (duration >= oneHour) {
      let hours = (duration / oneHour).toFixed(2);
      durationDesc = parseFloat(hours) + "小时";
    } else if (duration >= oneMinute) {
      let minutes = (duration / oneMinute).toFixed(2);
      durationDesc = parseFloat(minutes) + "分钟";
    } else if (duration >= oneSecond) {
      let seconds = (duration / oneSecond).toFixed(2);
      durationDesc = parseFloat(seconds) + "秒";
    } else if (duration === 0) {
      durationDesc = "0秒";
    }
    return durationDesc;
  },

  /**
   * 时间格式化
   * @param time
   * @param format
   * @return {string|*}
   */
  timeFormat(time, format) {
    if (time === null || time === undefined) { return ''; }
    if (typeof(time) == 'number') {
      time = new Date(time)
    } else if (!(time instanceof Date)) {
      time = time.replace(new RegExp(/-/gm), "/"); //转换
      time = new Date(time)
    }
    let o = {
      'M+': time.getMonth() + 1, // 月份
      'd+': time.getDate(), // 日
      'H+': time.getHours(), // 小时
      'm+': time.getMinutes(), // 分
      's+': time.getSeconds(), // 秒
      'q+': Math.floor((time.getMonth() + 3) / 3), // 季度
      'S': time.getMilliseconds() // 毫秒
    }
    if (/(y+)/.test(format)) {
      format = format.replace(RegExp.$1, (time.getFullYear() + '').substr(4 - RegExp.$1.length))
    }
    for (let k in o) {
      if (new RegExp('(' + k + ')').test(format)) {
        format = format.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
      }
    }
    return format;
  },

  /**
   * 任务数量显示
   * @param count
   * @return {string}
   */
  taskCountDesc(count) {
    return (count > 9999 ? "9999+" : count);
  },

  /**
   * 从对象中获取字段显示值
   * @param obj
   * @param fieldKey
   * @param i18n
   * @return {string}
   */
  fieldValue(obj, fieldKey, i18n) {
    // 从对象中获取字段显示值
    let fieldValue = "";
    if (obj && obj[fieldKey]) {
      fieldValue = obj[fieldKey];
    }

    let fieldValueDesc = fieldValue;
    if (fieldKey == "procInstStatus" && i18n) {
      // 流程实例状态显示值转换
      fieldValueDesc = Options.getOptionLabel(i18n, Options.procInstStatus, fieldValue);
    }
    if (fieldKey == "procActName" && i18n) {
      fieldValueDesc = Filters.processName(obj, i18n, 'procActName', 'procActEnName');
    }
    if (fieldKey == "procDefName" && i18n) {
      fieldValueDesc = Filters.processName(obj, i18n, 'procDefName', 'procDefEnName');
    }
    return fieldValueDesc;
  },

  /**
   * 优先级样式类
   * @param priority
   * @return {string}
   */
  priorityClass(priority) {
    let className = "";
    if (priority == "2") { // 高
      className = "priority-high";
    } else if (priority == "1") { // 中
      className = "priority-middle";
    } else if (priority == "0") { // 低
      className = "priority-low";
    }
    return className;
  },

  /**
   * 根据语言，返回对应的流程名称（默认返回中文流程名称）
   * @param procesData
   * @param i18n
   * @param nameKey
   * @param enNameKey
   * @return {string|*|string}
   */
  processName(procesData, i18n, nameKey, enNameKey) {
    let isEn = isEnLanguage(i18n);
    let cnName = procesData[nameKey || "name"];
    let enName = procesData[enNameKey || "enName"];
    // 英文为空的时候取中文
    if (enName == undefined || enName == null || enName == 'null' || enName == '') {
      enName = cnName;
    }
    let result = (isEn ? enName : "") || cnName || "";
    return result;
  }
}

/**
 * 下拉选项列表
 * @type {{startTimeOrder: *[], priority: *[]}}
 */
export const Options = {
  /**
   * 优先级下拉选项
   */
  priority: [
    {labelKey: "cgnTask.priority.default", value: ""},
    {labelKey: "cgnTask.priority.high", value: "2"},
    {labelKey: "cgnTask.priority.middle", value: "1"},
    {labelKey: "cgnTask.priority.low", value: "0"}
  ],

  /**
   * 任务开始时间排序下拉选项
   */
  startTimeOrder: [
    {labelKey: "cgnTask.startTimeOrder.asc", value: "1"},
    {labelKey: "cgnTask.startTimeOrder.desc", value: "0"}
  ],

  /**
   * 流程实例状态下拉选项
   */
  procInstStatus: [
    {labelKey: "cgnTask.procInstStatus.all", value: ""},
    {labelKey: "cgnTask.procInstStatus.running", value: "0"},
    {labelKey: "cgnTask.procInstStatus.hangUp", value: "1"},
    {labelKey: "cgnTask.procInstStatus.finished", value: "2"},
    {labelKey: "cgnTask.procInstStatus.invalid", value: "3"},
    {labelKey: "cgnTask.procInstStatus.termination", value: "4"}
  ],

  /**
   * 获取选项显示值
   * @param i18n
   * @param options
   * @param currentValue
   * @return {string}
   */
  getOptionLabel(i18n, options, currentValue) {
    let selectedOptions = options.filter(function (item) {
      return currentValue == item.value;
    });
    return (selectedOptions.length > 0 ? i18n.t(selectedOptions[0].labelKey) : "");
  }
}

/**
 * 常量
 */
export const Constant = {
  ACT_TYPE: { // 环节类型
    START: 0, // 开始环节
    GENERAL: 1, // 普通审批环节
    COSIGN: 2, // 会签环节
    SHARE: 3, // 共享池环节
    WITH_SUB: 4, // 子流程环节
    END: 9, // 结束环节
  }
}

/**
 * 判断当前语言是否是英文
 * @param i18n
 * @return {*|boolean}
 */
export function isEnLanguage(i18n) {
  return (i18n && (i18n.locale || "").toLowerCase().indexOf("en") >= 0);
}

/**
 * 值为null时返回默认值
 * @param value
 * @param defaultValue
 * @return {*}
 */
export function defaultIfNull(value, defaultValue) {
  return (value == null || typeof(value) == "undefined") ? defaultValue : value;
}

/**
 * 产生随机字符串
 * @param len
 * @return {string|string}
 */
export function randomString(len) {
  len = len || 32;
  var charset = "ABCDEFGHIJKLMNOPQRSTUVWSYZ1234567890"
  var charsetLength = charset.length;

  var result = "";
  for (var i = 0; i < len; i++) {
    result += charset.charAt(Math.floor(Math.random() * charsetLength));
  }
  return result;
}
