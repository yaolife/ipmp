import axios from '@/api/http';

const resourceDirectoryTreeUrl = '/api/model-resource-directories/tree';
const pipelineBaseUrl = '/api/pipelines';

function saveBlob(res, fallbackName) {
    const blob = res && res.data;
    if (!blob) {
        return Promise.reject({ msg: '导出失败' });
    }
    const type = blob.type || '';
    if (type.indexOf('application/json') !== -1) {
        return blob.text().then(text => {
            try {
                return Promise.reject(JSON.parse(text));
            } catch (e) {
                return Promise.reject({ msg: text || '导出失败' });
            }
        });
    }
    const headers = (res && res.headers) || {};
    const disposition = headers['content-disposition'] || headers['Content-Disposition'] || '';
    let filename = fallbackName;
    const matched = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^;"']+)/i);
    if (matched && matched[1]) {
        try {
            filename = decodeURIComponent(matched[1]);
        } catch (e) {
            filename = matched[1];
        }
    }
    if (window.navigator.msSaveBlob) {
        window.navigator.msSaveOrOpenBlob(blob, filename);
        return Promise.resolve();
    }
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    return Promise.resolve();
}

export default {
    getResourceDirectoryTree: function(params) {
        return axios.get(resourceDirectoryTreeUrl, {
            params,
            apiTitle: '资源目录树查询'
        }).then(res => res.data);
    },
    pagePipelines: function(params) {
        return axios.post(pipelineBaseUrl + '/page', params, {
            apiTitle: '分页查询管道'
        }).then(res => res.data);
    },
    getPipelineDetail: function(id) {
        return axios.get(pipelineBaseUrl + '/' + id, {
            apiTitle: '查询管道详情'
        }).then(res => res.data);
    },
    createPipeline: function(params) {
        return axios.post(pipelineBaseUrl, params, {
            apiTitle: '新建管道'
        }).then(res => res.data);
    },
    updatePipeline: function(params) {
        return axios.post(pipelineBaseUrl + '/update', params, {
            apiTitle: '修改管道'
        }).then(res => res.data);
    },
    deletePipelines: function(params) {
        return axios.post(pipelineBaseUrl + '/delete', params, {
            apiTitle: '删除管道'
        }).then(res => res.data);
    },
    importPipelines: function(formData) {
        return axios.post(pipelineBaseUrl + '/import', formData, {
            apiTitle: '导入管道'
        }).then(res => res.data);
    },
    exportPipelines: function(params, filename) {
        return axios.post(pipelineBaseUrl + '/export', params, {
            responseType: 'blob',
            apiTitle: '导出管道'
        }).then(res => saveBlob(res, filename || '管道数据.xlsx'));
    },
    downloadPipelineTemplate: function() {
        return axios.get(pipelineBaseUrl + '/export-template', {
            responseType: 'blob',
            apiTitle: '下载管道导入模板'
        }).then(res => saveBlob(res, '管道导入模板.xlsx'));
    }
};
