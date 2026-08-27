import axios from '@/api/http';
const pageListUrl = '/procssinfo/getDraftsAllByPage';
const delListUrl = '/procssinfo/deleteMyDrafts';
const checkUrl = '/procssinfo/checkDrafts';
const deleteMyDraftsV2Url = '/procssinfo/v2/deleteMyDrafts';
const resourceDirectoryTreeUrl = '/api/model-resource-directories/tree';
export default{
    pageListAPI: function(params) {
        return axios.post(pageListUrl + "?current=" + params.pageIndex + "&size=" + params.pageSize, params).then(res => res.data);
    },
    deleteMyDrafts: function(params) {
        return axios.post(delListUrl , params).then(res => res.data);
    },
    deleteMyDraftsV2: function(params) {
        return axios.post(deleteMyDraftsV2Url , params).then(res => res.data);
    },
    checkDrafts: function(params) {
        return axios.post(checkUrl , params).then(res => res.data);
    },
    getResourceDirectoryTree: function(params) {
        return axios.get(resourceDirectoryTreeUrl, {
            params,
            apiTitle: "资源目录树查询"
        }).then(res => res.data);
    }
 }
