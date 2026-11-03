import axios from "axios";
import http from "@/api/http";

export function getPoint(data, cancelToken, history) {
  return http
    .post(history ? "/station/getKnsHv" : "/station/getKnsRv", data, {
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
