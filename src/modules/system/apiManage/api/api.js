import axios from '@/api/http';

export default {

  // 获取接口分页列表
  getFaceInfoListAPI: params => {
    return axios.post("/system/interfaceInfo/getFaceInfoList", params);
  },

  // 获取日志分页列表
  getApiLogListAPI: params => {
    return axios.post("/system/systemApiLog/getApiLogList", params);
  },

  //新增接口信息
  saveFaceInfoAPI: params => {
    return axios.post("/system/interfaceInfo/saveFaceInfo", params);
  },

  //删除接口信息
  deleteFaceInfoAPI: params => {
    return axios.post("/system/interfaceInfo/deleteFaceInfo", params);
  },

  //编辑接口信息
  modifyFaceInfoAPI: params => {
    return axios.post("/system/interfaceInfo/modifyFaceInfo", params);
  },

};
