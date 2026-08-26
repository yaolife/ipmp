import axios from "axios";
import API from "./api";
import { Message } from "element-ui";
const getToken = () => {
  return axios.get(envConfig.kkFileViewUrl + "/getToken");
};
const encode = str => {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function toSolidBytes(
      match,
      p1
    ) {
      return String.fromCharCode(Number("0x" + p1));
    })
  );
};
const kkFileView = function (row) {
  // getToken().then(result => {
  //   let token;
  //   if (result.status == 200 && result.data.success && result.data.token) {
  //     //兼容ie和低版本
  //     token = result.data.token.replace(/\+/g, '%2B');
  //     console.log(token, "获取token");
  API.getUrls({
    ids: row.fileId
  })
    .then(res => {
      if (res.data.code == 0) {
        let url = res.data.data[0].fileUrl;
        let previewUrl =
          envConfig.kkFileViewUrl +
          "/onlinePreview?url=" +
          encodeURIComponent(encode(url))
        // +
        // "&token=" +
        // token;
        // console.log(previewUrl, "拼接地址");
        window.open(previewUrl, "_blank", "noopener,noreferrer");
      } else {
        Message.error("获取文件临时地址失败！");
      }
    })
    .catch(err => { });
  //   } else {
  //     Message.error("预览服务异常！");
  //     return;
  //   }
  // });
};
export default kkFileView;
