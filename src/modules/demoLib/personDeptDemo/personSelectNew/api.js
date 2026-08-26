/*
 * @Author: [P631038]杨旭
 * @LastEditors: [P631038]杨旭
 * @Description: 
 */
import axios from '@/api/http';

export default {
    // 加载部门信息树
    getOrgTreeForOrgWidget: params => {
        return axios.post('/hrcenter/getOrgTreeForOrgWidget', params);
    },
    // 根据部门信息关键字查询部门
    getOrgByKeyWord: params => {
        return axios.post('/hrcenter/getOrgByKeyWord', params);
    },
    // 获取人员信息
    getStaffsByOrgId: params => {
        return axios.post('/hrcenter/getStaffsByOrgId', params);
    },
    // 清除选择记录
    userHistoryClear: params => {
        return axios.post('/selection-user-history/clear', params);
    },
    // 获取最近选择的人员
    userGetRecentHistory: params => {
        return axios.post('/selection-user-history/getRecentHistory', params);
    },
    // 记录用户选择记录
    userRecord: params => {
        return axios.post('/selection-user-history/record', params);
    },
    // 组管理分页查询
    getEntityAllByPage: params => {
        return axios.post('/wfProcessGroup/getEntityAllByPage', params);
    },
    // 新增根据分组id获取组人员信息
    getGroupUserList: groupId => {
        return axios.post(`/wfProcessGroup/getGroupUserList/${groupId}`,{});
    },
    // 获取多个人员信息
    getStaffTysInfos: params => {
        return axios.post('/hrcenter/getStaffTysInfo', params);
    },
}