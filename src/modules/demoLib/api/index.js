/*
 * @Author: [P631038]杨旭
 * @Date: 2024-09-13 09:04:52
 * @LastEditors: [P631038]杨旭
 * @LastEditTime: 2025-09-28 10:13:38
 * @FilePath: \4.2.0-node16\cud4demo-ui\src\modules\demoLib\api\index.js
 * @Description: 
 */
import axios from '@/api/http';

export default {
    // 获取所有可发起流程
    getAllCanSeeProcess: params => {
        return axios.post('/wf/processManage/getAllCanSeeProcess', params);
    },
    /** 输入长连接获取短链接 */
    getShortLink: params => {
        return axios.post(`/s`, params);
    },
    getAllCanSeeProcess: params => {
        return axios.get('/wf/processManage/getAllCanSeeProcess', params);
    },
    getOnlyOffice: id => {
        return axios.get(`/onlyoffice/config?fileId=${id}`);
    },
}