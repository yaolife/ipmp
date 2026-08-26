import axios from '@/api/http';

const pageLogListUrl = '/invoking/log/pageList';
const logDetailUrl = '/invoking/log/queryDetailById/';

export default{
    pageLogListAPI: function(params) {
      return axios.post(pageLogListUrl, params).then( res => res.data);
    },
    logDetailAPI: function(logId) {
      return axios.get(logDetailUrl + logId).then( res => res.data);
    }
}
