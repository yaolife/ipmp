import axios from "@/api/http";

// 每次按文件ID获取认证信息，仅用于本次请求，不缓存账号密码或拼入URL。
export function fetchAuthenticatedFile(id) {
  if (!id) return Promise.reject({ msg: "文件缺少主键，无法读取" });
  return axios.get("/sys-files/download-info/" + encodeURIComponent(id), {
    apiTitle: "获取文件下载信息"
  }).then(response => {
    const result = response.data;
    if (!result || (result.code !== 0 && result.code !== "0") || !result.data || !result.data.url) {
      return Promise.reject({ msg: (result && result.msg) || "获取文件下载信息失败" });
    }
    const info = result.data;
    const headers = {};
    if (info.username || info.password) {
      headers.Authorization = "Basic " + btoa(unescape(encodeURIComponent(
        (info.username || "") + ":" + (info.password || "")
      )));
    }
    return fetch(info.url, { credentials: "omit", headers }).then(res => {
      if (!res.ok) return Promise.reject({ msg: "文件读取失败，状态码：" + res.status });
      return res.blob();
    }).then(blob => ({ blob, name: info.originalName }));
  }).catch(error => {
    if (error && error.msg) return Promise.reject(error);
    return Promise.reject({ msg: "文件读取失败，请检查文件服务连接、证书及跨域配置" });
  });
}

export function downloadAuthenticatedFile(id, filename) {
  return fetchAuthenticatedFile(id).then(({ blob, name }) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = name || filename || "文件";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // 下载点击后延迟释放，避免浏览器尚未接管Blob时地址已失效。
    setTimeout(() => window.URL.revokeObjectURL(url), 60000);
  });
}

// 图片与预览只能使用Blob地址，因为img和window.open无法自定义认证请求头。
export const authenticatedPreviewMixin = {
  created() {
    this._fileBlobUrls = [];
  },
  beforeDestroy() {
    this.releaseFilePreviews();
  },
  methods: {
    releaseFilePreviews() {
      (this._fileBlobUrls || []).forEach(url => window.URL.revokeObjectURL(url));
      this._fileBlobUrls = [];
      this._filePreviewGeneration = (this._filePreviewGeneration || 0) + 1;
    },
    loadAuthenticatedImages(items) {
      this.releaseFilePreviews();
      const generation = this._filePreviewGeneration;
      const previews = (items || []).map(item => ({ ...item, url: "" }));
      this.imagePreviews = previews;
      previews.forEach(item => {
        fetchAuthenticatedFile(item.id).then(({ blob }) => {
          // 切换管段、移除图片或关闭页面后，不接收过期请求返回的图片。
          if (this._filePreviewGeneration !== generation || this.imagePreviews !== previews || previews.indexOf(item) < 0) return;
          const url = window.URL.createObjectURL(blob);
          this._fileBlobUrls.push(url);
          this.$set(item, "url", url);
        }).catch(error => {
          if (this._filePreviewGeneration === generation && this.imagePreviews === previews && previews.indexOf(item) >= 0) {
            this.$message.error(error.msg || "附件图片加载失败");
          }
        });
      });
    }
  }
};
