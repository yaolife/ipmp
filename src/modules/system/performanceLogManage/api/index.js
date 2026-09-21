import axios from '@/api/http';

//审计日志管理
const searchPerformanceLogInfo = '/system/cudInterfaceLog/queryPerformanceLogList';
const getPerformanceLogDetail = '/system/cudInterfaceLog/getPerformanceLogDetail/';

export default {
  //查询性能日志配置信息
  searchPerformanceLogInfo(params) {
    return axios.post(searchPerformanceLogInfo, params, '查询审计日志配置信息').then(res => res.data);
  },

  //查询性能日志详情
  getPerformanceLogDetail(logId) {
    return axios.post(getPerformanceLogDetail + logId, '查询性能日志详情').then(res => res.data);
  },
}
