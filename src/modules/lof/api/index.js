import axios from '@/api/http';
import draftsApi from '@/modules/drafts/api';

const tm01BaseUrl = '/tm01-assessments';
const tm02BaseUrl = '/tm02-assessments';
const tm05BaseUrl = '/tm05-assessments';
const lofLedgerBaseUrl = '/lof-ledger';

function unwrap(res) {
    return res && res.data;
}

const PIPE_DIRECTORY_TYPE = 0;

export default {
    pageLedger: function(params) {
        return axios.post(lofLedgerBaseUrl + '/page', params, {
            apiTitle: '分页查询 LOF 三维台账'
        }).then(unwrap);
    },
    autoAnalyzeLedger: function(params) {
        return axios.post(lofLedgerBaseUrl + '/auto-analyze', params, {
            apiTitle: '一键自动分析 LOF 三维台账'
        }).then(unwrap);
    },
    getResourceDirectoryTree: function(params) {
        return draftsApi.getLofSegmentTree(
            Object.assign({
                moduleType: PIPE_DIRECTORY_TYPE
            }, params || {})
        );
    },
    getResourceDirectoryDetail: draftsApi.getResourceDirectoryDetail,
    evaluate: function(params) {
        return axios.post(tm01BaseUrl + '/evaluate', params, {
            apiTitle: '执行定性评估'
        }).then(unwrap);
    },
    save: function(params) {
        return axios.post(tm01BaseUrl + '/save', params, {
            apiTitle: '保存定性评估结果'
        }).then(unwrap);
    },
    getDetail: function(id) {
        return axios.get(tm01BaseUrl + '/' + id, {
            apiTitle: '查询定性评估详情'
        }).then(unwrap);
    },
    pageHistory: function(params) {
        return axios.post(tm01BaseUrl + '/history/page', params, {
            apiTitle: '查询定性评估版本历史'
        }).then(unwrap);
    },
    pageTm02History: function(params) {
        return axios.post(tm02BaseUrl + '/history/page', params, {
            apiTitle: '查询定量评估版本历史'
        }).then(unwrap);
    },
    evaluateTm02: function(params) {
        return axios.post(tm02BaseUrl + '/evaluate', params, {
            apiTitle: '执行定量评估'
        }).then(unwrap);
    },
    saveTm02: function(params) {
        return axios.post(tm02BaseUrl + '/save', params, {
            apiTitle: '保存定量评估结果'
        }).then(unwrap);
    },
    getTm02Detail: function(id) {
        return axios.get(tm02BaseUrl + '/' + id, {
            apiTitle: '查询定量评估详情'
        }).then(unwrap);
    },
    evaluateTm05: function(params) {
        return axios.post(tm05BaseUrl + '/evaluate', params, {
            apiTitle: '执行振动校核'
        }).then(unwrap);
    },
    saveTm05: function(params) {
        return axios.post(tm05BaseUrl + '/save', params, {
            apiTitle: '保存振动校核结果'
        }).then(unwrap);
    },
    getTm05Detail: function(id) {
        return axios.get(tm05BaseUrl + '/' + id, {
            apiTitle: '查询振动校核详情'
        }).then(unwrap);
    },
    pageTm05History: function(params) {
        return axios.post(tm05BaseUrl + '/history/page', params, {
            apiTitle: '查询振动校核版本历史'
        }).then(unwrap);
    }
};
