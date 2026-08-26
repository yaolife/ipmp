import axios from '@/api/http';

//审计日志管理
const searchAuditLogConfigInfo = '/system/cudInterfaceLog/queryAuditLogConfigList';
const searchAuditLogRunInfo = '/system/cudInterfaceLog/queryAuditLogRunList';

export default {
  //查询审计日志配置信息
  searchAuditLogConfigInfo(params) {
    return axios.post(searchAuditLogConfigInfo, params, '查询审计日志配置信息').then(res => res.data);
  },
  //查询审计日志运行信息
  searchAuditLogRunInfo(params) {
    return axios.post(searchAuditLogRunInfo, params, '查询审计日志运行信息').then(res => res.data);
  }
}
