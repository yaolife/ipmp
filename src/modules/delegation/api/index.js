import axios from '@/api/http';

const componentBaseUrl = '/api/pipeline-components';

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
    pageComponents: function(params) {
        return axios.post(componentBaseUrl + '/page', params, {
            apiTitle: '分页查询管道元件'
        }).then(res => res.data);
    },
    deleteComponents: function(params) {
        return axios.post(componentBaseUrl + '/delete', params, {
            apiTitle: '删除管道元件'
        }).then(res => res.data);
    },
    importComponents: function(formData) {
        return axios.post(componentBaseUrl + '/import', formData, {
            apiTitle: '导入管道元件'
        }).then(res => res.data);
    },
    exportComponents: function(params, filename) {
        return axios.post(componentBaseUrl + '/export', params, {
            responseType: 'blob',
            apiTitle: '导出管道元件'
        }).then(res => saveBlob(res, filename || '管道元件数据.xlsx'));
    },
    downloadComponentTemplate: function() {
        return axios.get(componentBaseUrl + '/export-template', {
            responseType: 'blob',
            apiTitle: '下载管道元件导入模板'
        }).then(res => saveBlob(res, '管道元件导入模板.xlsx'));
    }
};
