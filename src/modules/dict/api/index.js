/*
 * @Author: [P631038]杨旭
 * @Date: 2024-11-08 17:14:00
 * @LastEditors: [P631038]杨旭
 * @LastEditTime: 2024-12-26 10:36:01
 * @FilePath: \4.2.0-node16\cud4demo-ui\src\modules\dict\api\index.js
 * @Description: 
 */
import axios from '@/api/http';

const DictTreeUrl = '/dict/dictTree';
const saveDictUrl = '/dict/saveDict';
const updateDictUrl = '/dict/updateDict';
const dictTreeItemUrl = '/dict/v2/dictTreeItem';
// const dictTreeItemUrl = '/dict/dictTreeItem';
const saveDictItemUrl = '/dict/saveDictItem';
const updateDictItemUrl = '/dict/updateDictItem';
const deleteDictItemUrl = '/dict/deleteDictItem';
const batchDeleteUrl = '/dict/batchDelete';
const deleteDictUrl = '/dict/deleteDict';

const DictTreeRemoteUrl = '/dict/dictTreeRemote';
const dictTreeItemRemoteUrl = '/dict/dictTreeItemRemote';
const checkduplicateUrl = '/dict/checkduplicate';

export default{
    DictTreeAPI: function(params) {
        return axios.post(DictTreeUrl, params, {apiTitle: "字典树查询"}).then(res => res.data);
    },
    DictTreeRemoteAPI: function(params) {
        return axios.post(DictTreeRemoteUrl, params, {apiTitle: "字典树查询（远程）"}).then(res => res.data);
    },
    saveDictAPI: function(params) {
        return axios.post(saveDictUrl, params, {apiTitle: "保存字典树"}).then(res => res.data);
    },
    updateDictAPI: function(params) {
        return axios.post(updateDictUrl, params, {apiTitle: "更新字典树"}).then(res => res.data);
    },
    dictTreeItemAPI: function(params) {
        return axios.post(dictTreeItemUrl, params, {apiTitle: "字典项查询"}).then(res => res.data);
    },
    dictTreeItemRemoteAPI: function(params) {
        return axios.post(dictTreeItemRemoteUrl, params, {apiTitle: "字典项查询（远程）"}).then(res => res.data);
    },
    saveDictItemAPI: function(params) {
        return axios.post(saveDictItemUrl, params, {apiTitle: "保存字典项"}).then(res => res.data);
    },
    updateDictItemAPI: function(params) {
        return axios.post(updateDictItemUrl, params, {apiTitle: "更新字典项"}).then(res => res.data);
    },
    deleteDictItemAPI: function(params) {
        return axios.get(deleteDictItemUrl + '/' + params.id, {apiTitle: "删除字典项"}).then(res => res.data);
    },
    batchDeleteDictItemAPI: function(params) {
        return axios.post(batchDeleteUrl, params, {apiTitle: "批量删除字典项"}).then(res => res.data);
    },
    deleteDictAPI: function(params) {
        return axios.get(deleteDictUrl + '/' + params.id, {apiTitle: "删除字典树"}).then(res => res.data);
    },
    checkduplicate: function(params) {
        return axios.post(checkduplicateUrl, params, {apiTitle: "字典项重复校验"}).then(res => res.data);
    }
}
