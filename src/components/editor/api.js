import axios from '@/api/http';

// 获取近期关联风险事件列表
export const getUrls = (params) => {
    return axios.post("/procAttachment/getUrls", params);
}