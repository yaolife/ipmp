import axios from '@/api/http'
export default {
  query: function (param) {
    return axios.post('/sysappinfo/sysappinfos', param)
  },
  sysAppInfoDel: function (param) {
    return axios.post('/sysappinfo/delete/' + param, param)
  },
  sysAppInfoAdd: function (param) {
    return axios.post('/sysappinfo/save/add', param)
  },
  sysAppInfoUpdate: function (param) {
    return axios.post('/sysappinfo/save/update', param)
  }
}
