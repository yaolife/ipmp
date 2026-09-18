import axios from '@/api/http';
import draftsApi from '@/modules/drafts/api';

const tm01BaseUrl = '/tm01-assessments';

function unwrap(res) {
    return res && res.data;
}

const PIPE_DIRECTORY_TYPE = 0;

export default {
    getResourceDirectoryTree: function(params) {
        return draftsApi.getResourceDirectoryTree(
            Object.assign({ type: PIPE_DIRECTORY_TYPE }, params || {})
        );
    },
    getResourceDirectoryDetail: draftsApi.getResourceDirectoryDetail,
    evaluate: function(params) {
        return axios.post(tm01BaseUrl + '/evaluate', params, {
            apiTitle: '执行 TM01 定性评估'
        }).then(unwrap);
    },
    save: function(params) {
        return axios.post(tm01BaseUrl + '/save', params, {
            apiTitle: '保存 TM01 评估结果'
        }).then(unwrap);
    },
    getDetail: function(id) {
        return axios.get(tm01BaseUrl + '/' + id, {
            apiTitle: '查询 TM01 评估详情'
        }).then(unwrap);
    },
    pageHistory: function(params) {
        return axios.post(tm01BaseUrl + '/history/page', params, {
            apiTitle: '查询 TM01 版本历史'
        }).then(unwrap);
    }
};
