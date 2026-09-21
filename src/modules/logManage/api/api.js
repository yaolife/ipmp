import axios from '@/api/http';

export default {

  // 获取日志分页列表
  getApiLogListAPI: params => {
    return axios.post("/system/systemApiLog/getApiLogList", params);
  }

};
