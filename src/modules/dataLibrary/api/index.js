import axios from "@/api/http";

// 管道详情导入的参数模板库，独立于LOF评估接口。
const endpoints = {
  material: "/data-material-libraries",
  operating: "/data-operating-condition-libraries"
};

function url(type, suffix) {
  return endpoints[type] + (suffix || "");
}

export default {
  page(type, params) {
    return axios.post(url(type, "/page"), params, { apiTitle: "分页查询管道数据基础库" });
  },
  find(type, id) {
    return axios.get(url(type, "/" + id), { apiTitle: "查询管道数据基础库详情" });
  },
  create(type, data) {
    return axios.post(url(type), data, { apiTitle: "新增管道数据基础库记录" });
  },
  update(type, data) {
    return axios.post(url(type, "/update"), data, { apiTitle: "修改管道数据基础库记录" });
  },
  remove(type, data) {
    return axios.post(url(type, "/delete"), data, { apiTitle: "删除管道数据基础库记录" });
  },
  importExcel(type, data) {
    return axios.post(url(type, "/import"), data, {
      timeout: 30 * 60 * 1000,
      headers: { "Content-Type": "multipart/form-data" },
      apiTitle: "导入管道数据基础库"
    });
  },
  exportExcel(type, data) {
    return axios.post(url(type, "/export"), data, {
      responseType: "blob",
      apiTitle: "导出管道数据基础库"
    });
  },
  template(type) {
    return axios.get(url(type, "/export-template"), {
      responseType: "blob",
      apiTitle: "下载管道数据基础库模板"
    });
  }
};
