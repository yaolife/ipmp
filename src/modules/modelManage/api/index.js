import axios from "@/api/http";

const modelResourceUrl = "/api/model-resources";
const modelResourceItemUrl = "/api/model-resource-items";
const sysFileBaseUrl = "/api/sys-files";
const resourceDirectoryTreeUrl = "/api/model-resource-directories/tree";

function saveBlob(res, fallbackName) {
    const blob = res && res.data;
    if (!blob) {
        return Promise.reject({ msg: "下载失败" });
    }
    const type = blob.type || "";
    if (type.indexOf("application/json") !== -1) {
        return blob.text().then(text => {
            try {
                return Promise.reject(JSON.parse(text));
            } catch (e) {
                return Promise.reject({ msg: text || "下载失败" });
            }
        });
    }
    const headers = (res && res.headers) || {};
    const disposition = headers["content-disposition"] || headers["Content-Disposition"] || "";
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
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    return Promise.resolve();
}

export default {
    pageModelResources: function(params) {
        return axios.post(modelResourceUrl + "/page", params, {
            apiTitle: "分页查询模型资源"
        }).then(res => res.data);
    },
    getModelResourceDetail: function(id) {
        return axios.get(modelResourceUrl + "/" + id, {
            apiTitle: "查询模型详情"
        }).then(res => res.data);
    },
    createModelResource: function(params) {
        return axios.post(modelResourceUrl, params, {
            apiTitle: "创建模型资源"
        }).then(res => res.data);
    },
    uploadModelResource: function(formData) {
        return axios.post(modelResourceUrl + "/upload", formData, {
            apiTitle: "上传并解析模型压缩包"
        }).then(res => res.data);
    },
    updateModelResource: function(params) {
        return axios.post(modelResourceUrl + "/update", params, {
            apiTitle: "修改模型资源"
        }).then(res => res.data);
    },
    updateModelResourceStatus: function(params) {
        return axios.post(modelResourceUrl + "/status", params, {
            apiTitle: "修改模型资源状态"
        }).then(res => res.data);
    },
    deleteModelResources: function(params) {
        return axios.post(modelResourceUrl + "/delete", params, {
            apiTitle: "删除模型资源"
        }).then(res => res.data);
    },
    exportModelResources: function(params, filename) {
        return axios.post(modelResourceUrl + "/export", params, {
            responseType: "blob",
            apiTitle: "导出模型资源"
        }).then(res => saveBlob(res, filename || "模型资源.xlsx"));
    },
    pageModelResourceItems: function(params) {
        return axios.post(modelResourceItemUrl + "/page", params, {
            apiTitle: "分页查询模型资源明细"
        }).then(res => res.data);
    },
    getModelResourceItemDetail: function(id) {
        return axios.get(modelResourceItemUrl + "/" + id, {
            apiTitle: "查询模型资源明细"
        }).then(res => res.data);
    },
    createModelResourceItem: function(params) {
        return axios.post(modelResourceItemUrl, params, {
            apiTitle: "创建模型资源明细"
        }).then(res => res.data);
    },
    updateModelResourceItem: function(params) {
        return axios.post(modelResourceItemUrl + "/update", params, {
            apiTitle: "修改模型资源明细"
        }).then(res => res.data);
    },
    deleteModelResourceItems: function(params) {
        return axios.post(modelResourceItemUrl + "/delete", params, {
            apiTitle: "删除模型资源明细"
        }).then(res => res.data);
    },
    getResourceDirectoryTree: function(params) {
        return axios.get(resourceDirectoryTreeUrl, {
            params,
            apiTitle: "资源目录树查询"
        }).then(res => res.data);
    },
    uploadSysFile: function(formData) {
        return axios.post(sysFileBaseUrl + "/upload", formData, {
            apiTitle: "上传公共文件"
        }).then(res => res.data);
    },
    downloadSysFile: function(id, filename) {
        return axios.get(sysFileBaseUrl + "/stream/" + id, {
            responseType: "blob",
            apiTitle: "获取文件流"
        }).then(res => saveBlob(res, filename || "模型文件"));
    }
};
