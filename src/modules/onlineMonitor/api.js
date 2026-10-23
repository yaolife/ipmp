import axios from "axios";
import http from "@/api/http";

export function getPoint(data, cancelToken) {
  return http
    .post("/opgview/getPoint", data, {
      apiTitle: "趋势测点数据",
      cancelToken: cancelToken,
      headers: {
        "Content-Type": "application/json"
      }
    })
    .then(function(res) {
      return res.data;
    });
}

export function getTag(tagName) {
  return http
    .post(
      "/opgview/getTag",
      { tagName: tagName },
      {
        apiTitle: "测点关键词搜索",
        headers: {
          "Content-Type": "application/json"
        }
      }
    )
    .then(function(res) {
      return res.data;
    });
}

export function exportTrendExcel(method, data) {
  return http.post("/opgview/" + method, data, {
    apiTitle: "导出测点数据",
    responseType: "blob",
    headers: {
      "Content-Type": "application/json"
    }
  });
}

export function isCancel(error) {
  return axios.isCancel(error);
}

export function createCancelSource() {
  return axios.CancelToken.source();
}
