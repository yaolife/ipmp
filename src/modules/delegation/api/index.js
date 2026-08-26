import axios from '@/api/http';
const flowTreeUrl = '/assembly/procTree';
const saveUrl = '/assembly/createDelegation';
const deleteUrl = '/assembly/deleteDelegation';
const pageListUrl = '/assembly/queryDelegation';
const getTransFinancalUrl  = '/assembly/getTransFinancal';
const updateUrl = '/assembly/updateDelegation';

const getRecentUserUrl = '/assembly/getRecentUser'

export default{
  //获取当前用户信息
    getUserInfo : params => {
      return axios.post("user/getCurrentUser",params);
    },
    funcTreeAPI: function(params) {
      return axios.post(flowTreeUrl, params, {apiTitle: "树查询"}).then(res => res.data);
    },
    deleteAPI: function(params) {
      return axios.post(deleteUrl ,params, {apiTitle: "删除代理"}).then(res => res.data);
    },
    saveAPI: function(params) {
      return axios.post(saveUrl, params, {apiTitle: "保存代理"}).then(res => res.data);
    },
    updateAPI: function(params) {
      return axios.post(updateUrl, params, {apiTitle: "更新代理"}).then(res => res.data);
    },
    pageListAPI: function(params) {
      return axios.post(pageListUrl + "?pageIndex=" + params.current + "&pageSize=" + params.size, params).then(res => res.data);
    },
    getTransFinancalAPI: function(params) {
      return axios.post(getTransFinancalUrl , params).then(res => res.data);
    },
    getRecentUserAPI: function(params) {
      return axios.post(getRecentUserUrl).then(res => res.data);
    }
}
