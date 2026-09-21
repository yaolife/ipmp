import axios from '@/api/http';

const componentBaseUrl = '/pipeline-components';
const sysFileBaseUrl = '/sys-files';

function saveBlob(res, fallbackName) {
    const blob = res && res.data;
    if (!blob) {
        return Promise.reject({ msg: '下载失败' });
    }
    const type = blob.type || '';
    if (type.indexOf('application/json') !== -1) {
        return blob.text().then(text => {
            try {
                return Promise.reject(JSON.parse(text));
            } catch (e) {
                return Promise.reject({ msg: text || '下载失败' });
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
    getComponentDetail: function(id) {
        return axios.get(componentBaseUrl + '/' + id, {
            apiTitle: '查询管道元件详情'
        }).then(res => res.data);
    },
    createComponent: function(params) {
        return axios.post(componentBaseUrl, params, {
            apiTitle: '新增管道元件'
        }).then(res => res.data);
    },
    updateComponent: function(params) {
        return axios.post(componentBaseUrl + '/update', params, {
            apiTitle: '修改管道元件'
        }).then(res => res.data);
    },
    deleteComponents: function(params) {
        return axios.post(componentBaseUrl + '/delete', params, {
            apiTitle: '删除管道元件'
        }).then(res => res.data);
    },
    uploadSysFile: function(formData) {
        return axios.post(sysFileBaseUrl + '/upload', formData, {
            apiTitle: '上传公共文件'
        }).then(res => res.data);
    },
    listSysFiles: function(params) {
        return axios.post(sysFileBaseUrl + '/list', params, {
            apiTitle: '批量查询文件对象'
        }).then(res => res.data);
    },
    listSysFilesByIdString: function(params) {
        return axios.post(sysFileBaseUrl + '/list-by-id-string', params, {
            apiTitle: '按文件ID字符串查询文件对象'
        }).then(res => res.data);
    },
    deleteSysFiles: function(params) {
        return axios.post(sysFileBaseUrl + '/delete', params, {
            apiTitle: '删除公共文件'
        }).then(res => res.data);
    },
    downloadSysFile: function(id, filename) {
        return axios.get(sysFileBaseUrl + '/stream/' + id, {
            responseType: 'blob',
            apiTitle: '获取文件流'
        }).then(res => saveBlob(res, filename || '模型文件'));
    }
};
