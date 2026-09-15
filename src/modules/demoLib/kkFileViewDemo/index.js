/*
 * @Author: [P631038]杨旭
 * @LastEditors: [P631038]杨旭
 * @Description:
 */
// 高亮字体插件
import hljs from "highlight.js";
// import hljs from "highlight.js/lib/highlight";
// import "highlight.js/styles/github.css";
import kkFileView from "@/utils/kkFileView.js";
// import Api from "@@/components/form/api";
import { getHeadersOptions } from "@/utils/funcUtil.js";
import { setFollow, unsetFollow } from '../components/scrollFollow.js';

const str = `
使用示例：
// tips:需要一台部署了kkFileView的服务器
// 首先将文件上传到中台，获取文件ID



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

    通过文件id获取文件临时地址;
    API.getUrls({
      ids: row.fileId
    })
      .then(res => {
        if (res.data.code == 0) {
          let url = res.data.data[0].fileUrl;
          let previewUrl =
          envConfig.kkFileViewUrl +
            "/onlinePreview?url=" +
            encodeURIComponent(encode(url)) +
            "&token=" +
            token;
          window.open(previewUrl, "_blank");
        } else {
          Message.error("获取文件临时地址失败！");
        }
      })
      .catch(err => {});
  如果文件不是使用中台云存储的，那么将上述示例中获取到的临时地址url替换成文件地址即可。
  如果文件返回的是文件流，那么需要在文件链接后面拼接上对应的文件名称
  var originUrl = 'http://127.0.0.1:8080/filedownload?fileId=1'; //要预览文件的访问地址
  var url = originUrl + '&fullfilename=test.txt'
`;
export default {
  components: {},
  data() {
    return {
      src: "",
      fileList: [],
      dialogVisible: false,
      type: "",
      htmlContent: str,
      show: false,
      title: "word预览",
      pdfDocument: null,
      fileUploadUrl: envConfig.API_ROOT + "/procAttachment/upfile",
      headersOptions: getHeadersOptions(),
    };
  },
  directives: {
    highlightjs: {
      bind: el => {
        let blocks = el.querySelectorAll("pre code");
        blocks.forEach(block => {
          hljs.highlightBlock(block);
        });
      }
    }
  },
  mounted() {
    //设置滚动跟随
    setFollow(this);
    hljs.highlightAll()
  },
  beforeDestroy() {
    //取消滚动跟随
    unsetFollow(this);
  },
  methods: {
    /** 文件上传成功时的钩子 */
    upfileBack(response, file, fileList) {
      console.log(response);
      if (response.code == 0) {
        this.fileList.push(response.data);
      } else {
        this.$message.error(response.msg || "上传失败")
      }
      console.log(this.fileList);
    },
    filePreview: row => kkFileView(row),
    /** 上传文件之前 */
    beforeUpload(file) {
      return true;
    },
    isShow() {
      this.show = !this.show;
    }
  }
};
