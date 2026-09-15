/**
 * 时间日期相关操作
 */


/**
 * 时间格式化
 * 将 2019-07-18T11:54:16.000+0000 格式化成 2019/07/18 11:54:16
 * @param datetime 国际化日期格式
 */
'use strict'
export function format(datetime) {
  return formatWithSeperator(datetime, "/", ":");
}

/**
 * 时间格式化
 * 将 2019-07-18T11:54:16.000+0000 格式化成类似 2019/07/18 11:54:16
 * 可以指定日期和时间分隔符
 * @param datetime 国际化日期格式
 */
export function formatWithSeperator(datetime, dateSeprator, timeSeprator) {
  if (datetime != null) {
    const dateMat = new Date(datetime);
    const year = dateMat.getFullYear();
    const month = (dateMat.getMonth() + 1) < 10 ? '0' + (dateMat.getMonth() + 1) : (dateMat.getMonth() + 1);
    const day = dateMat.getDate() < 10 ? '0' + dateMat.getDate() : dateMat.getDate();
    const hh = dateMat.getHours() < 10 ? '0' + dateMat.getHours() : dateMat.getHours();
    const mm = dateMat.getMinutes() < 10 ? '0' + dateMat.getMinutes() : dateMat.getMinutes();
    const ss = dateMat.getSeconds() < 10 ? '0' + dateMat.getSeconds() : dateMat.getSeconds();
    const timeFormat = year + dateSeprator + month + dateSeprator + day + " " + hh + timeSeprator + mm + timeSeprator + ss;
    return timeFormat;
  }
}

/**
 * 时间格式化
 * 将 2019-07-18T11:54:16.000+0000 格式化成类似 2019-07-18
 * 可以指定日期和时间分隔符
 * @param datetime 国际化日期格式
 */
export function formatTime(datetime) {
  if (datetime != null) {
    const dateMat = new Date(datetime);
    const year = dateMat.getFullYear();
    const month = (dateMat.getMonth() + 1) < 10 ? (dateMat.getMonth() + 1) : (dateMat.getMonth() + 1);
    const day = dateMat.getDate() < 10 ? dateMat.getDate() : dateMat.getDate();
    return year + "-" + month + "-" + day;
  }
}

/**
 * 时间格式化
 * 将 2019-07-18T11:54:16.000+0000 格式化成类似 2019-07-18
 * 可以指定日期和时间分隔符
 * @param datetime 国际化日期格式
 */
export function formatTimeDate(datetime) {
  if (datetime != null) {
    console.log(datetime, 'datetime')
    const dateMat = new Date(datetime);
    const year = dateMat.getFullYear();
    const month = (dateMat.getMonth() + 1) < 10 ? '0' + (dateMat.getMonth() + 1) : (dateMat.getMonth() + 1);
    const day = dateMat.getDate() < 10 ? '0' + dateMat.getDate() : dateMat.getDate();
    return year + "-" + month + "-" + day;
  }
}




