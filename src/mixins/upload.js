/*
 * @Author: [P631038]杨旭
 * @LastEditors: [P631038]杨旭
 * @Description: 
 */

import axios from "@/api/http";
export default {
  components: {},
  data() {
    return {
      fileUploadUrl: "/procAttachment/upfile",
      getUrl: '/procAttachment/getUrls',
      imgUrl: ''
    };
  },
  methods: {
    upfile(file) {
      let self = this
      return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('file', file);
        axios.post(
          self.fileUploadUrl,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        ).then(res => {
          let data = res.data
          if (data.code === '0') {
            let ids = data.data.fileId
            axios.post(self.getUrl, {
              ids
            }).then((result) => {
              resolve(result.data);
            });
          } else {
            const errorMsg = data.msg || '小文件上传失败: 服务器返回错误';
            throw new Error(errorMsg);
          }
        });
      });
    }
  }
};
