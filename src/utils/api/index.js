
import ht from '@/api/http'
export default {
    downloadFile: params => {
        return ht.post("/procAttachment/downloadFile", params, { responseType: 'blob' }).then(res => res);
    },
    // 获取文件临时地址
    getUrls: function (params) {
        return ht.post("/procAttachment/getUrls", params);
    },
    // 词条新增
    termsAdd: function (params) {
        return ht.post("/terms/add", params);
    },
    // 词条删除
    termsDelete: function (params) {
        return ht.post("/terms/del", params);
    },
    // 删除文件
    delFiles: function (params) {
        return ht.post("/procAttachment/physicalDelFile", params);
    },
    // 字典查询
    getDictItem: function(params) {
      return ht.post("/dict/dictTreeItem", params);
    },
}
