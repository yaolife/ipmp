import axios from '@/api/http';

// 应用管理
const idpAPPListUrl = '/system/cudRegistApp/idpAPPList';
const getRegistAppTreeUrl = '/system/cudRegistApp/getRegistAppTree';
const addRegistAppUrl = '/system/cudRegistApp/addRegistApp';
const updRegistAppUrl = '/system/cudRegistApp/updRegistApp';
const delRegistAppUrl = '/system/cudRegistApp/delRegistApp';

// 接口管理
const pageInterFaceListUrl = '/system/cudRegistInterface/getRegistInterfaceByApp';
const addRegistInterfaceUrl = '/system/cudRegistInterface/addRegistInterface';
const updRegistInterfaceUrl = '/system/cudRegistInterface/updRegistInterface';
const delRegistInterfaceUrl = '/system/cudRegistInterface/delRegistInterface';
const queryRegistInterfaceInfoUrl = '/system/cudRegistInterface/queryRegistInterfaceInfo';
const batchInsertInterfaceUrl = '/system/cudRegistInterface/batchInsertInterface';

export default{
  // 应用管理
  idpAPPListAPI: function() {
    return axios.post(idpAPPListUrl).then(res => res.data);
  },
  getRegistAppTreeAPI: function(params) {
    return axios.post(getRegistAppTreeUrl , params).then(res => res.data);
  },
  addRegistAppAPI: function(params) {
    return axios.post(addRegistAppUrl , params).then(res => res.data);
  },
  updRegistAppAPI: function(params) {
    return axios.post(updRegistAppUrl , params).then(res => res.data);
  },
  delRegistAppAPI: function(params) {
    return axios.post(delRegistAppUrl , params).then(res => res.data);
  },

  // 接口管理
  pageListAPI: function(params) {
    return axios.post(pageInterFaceListUrl + "?current=" + params.current + "&size=" + params.size, params).then(res => res.data);
  },

  addRegistInterfaceAPI: function(params) {
    return axios.post(addRegistInterfaceUrl , params).then(res => res.data);
  },

  updRegistInterfaceAPI: function(params) {
    return axios.post(updRegistInterfaceUrl , params).then(res => res.data);
  },

  delRegistInterfaceAPI: function(params) {
    return axios.post(delRegistInterfaceUrl , params).then(res => res.data);
  },

  queryRegistInterfaceInfoAPI: function(params) {
    return axios.post(queryRegistInterfaceInfoUrl , params).then(res => res.data);
  },
  batchInsertInterfaceAPI: function(params) {
    return axios.post(batchInsertInterfaceUrl , params).then(res => res.data);
  },

}
