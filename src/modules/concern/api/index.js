import axios from '@/api/http';
const pageListUrl = '/concern/getConcernAllByPage';
const delListUrl = '/concern/deleteMyConcern';
const getWfAuth = '/wfAuth/getWfAuth';

export default{
    pageListAPI: function(params) {
        return axios.post(pageListUrl + "?current=" + params.pageIndex + "&size=" + params.pageSize, params).then(res => res.data);
    },
    deleteMyConcern: function(params) {
        return axios.post(delListUrl + "?ids=" + params.ids , params).then(res => res.data);
    },
    // 获取工作流授权参数
    postWfAuthAPI : function(){
        return axios.post(getWfAuth, {apiTitle: "获取工作流授权参数"}).then(res => res.data);
    },
    
 }