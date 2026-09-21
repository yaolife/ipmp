import axios from '@/api/http'
export default {
  // 树列表
  getFunctionTree: function (param, appId) {
    if (appId) {
      return axios.post('/function/functionTree' + '/' + appId, param)
    } else {
      return axios.post('/function/functionTree', param)
    }
  },
  getSynchroFunctionTree: function (appId) {
    if (appId) {
      return axios.post('/function/functionTree/synchro' + '/' + appId)
    } else {
      return axios.post('/function/functionTree/synchro')
    }
  },
  getFunction: function (functionId) {
    var url = '/function/get/' + functionId
    return axios.get(url)
  },
  delFunction: function (functionId) {
    var url = '/function/del/' + functionId
    return axios.get(url)
  },
  saveFunInfo: function (operator, model) {
    var url = '/function/save'
    if (operator === 'add') {
      url = url + '/add'
    } else {
      url = url + '/update'
    }
    return axios.post(url, model)
  },
  getAppList:function () {
    var url = '/function/getAppList/'
    return axios.get(url)
  },

  //获取demo应用信息
  getDemoApp: function() {
    return axios.get('/function/queryDemoAppId');
  },
  //复制应用功能
  copyAppFunc: function(param) {
    return axios.post('/function/copyApplicationFunction', param)
  },
}
