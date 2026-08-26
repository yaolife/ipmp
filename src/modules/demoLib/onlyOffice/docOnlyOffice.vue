<template>
  <div id="docOnlyOffice"></div>
</template>
 
<script>
let script;
// 脚本标识
const scriptId = `onlyoffice-editor${Math.floor(Math.random() * 9999)}`;
// host
const host = "http://10.100.128.193:9697";
const loadScript = () =>
  new Promise((resolve, reject) => {
    const src = host + "/web-apps/apps/api/documents/api.js";
    // const src = "/onlyOfficeJs/web-apps/apps/api/documents/api.js";
    script = document.querySelector(`#${scriptId}`);
    // 加载成功
    const onLoad = () => {
      resolve();
      script.removeEventListener("load", onLoad);
    };
    // 加载失败
    const onError = () => {
      reject(new Error(`脚本 ${src} 加载失败`));
      script.removeEventListener("error", onError);
    };
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = src;
      script.addEventListener("load", onLoad);
      script.addEventListener("error", onError);
      document.head.appendChild(script);

      console.log("[ script ]-39", script);
    } else if (window.DocsAPI) {
      resolve();
    } else {
      script.addEventListener("load", onLoad);
      script.addEventListener("error", onError);
    }
  });
export default {
  name: "DocOnlyOffice",
  props: {
    option: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  data() {
    return {
      doctype: "",
      docEditor: null,
    };
  },
  beforeDestroy() {
    if (this.docEditor !== null) {
      this.docEditor.destroyEditor();
      this.docEditor = null;
    }
  },
  watch: {
    option: {
      handler: function (n) {
        this.setEditor(n);
        this.doctype = this.getFileType(n.fileType);
      },
      deep: true,
    },
  },
  mounted() {
    loadScript();

    if (this.option.url) {
      this.setEditor(this.option);
    }
  },
  methods: {
    async setEditor(option) {
      console.log("[ option ]-82", option);
      if (this.docEditor !== null) {
        this.docEditor.destroyEditor();
        this.docEditor = null;
      }
      this.doctype = this.getFileType(option.fileType);
      let config = {
        document: {
          //后缀
          fileType: option.fileType,
          key: option.key || "",
          title: option.title,
          permissions: {
            edit: option.isEdit, // 是否可以编辑: 只能查看，传false
            print: option.isPrint, // 是否可以打印
            download: true, // 是否可以下载
            // "fillForms": true,//是否可以填写表格，如果将mode参数设置为edit，则填写表单仅对文档编辑器可用。 默认值与edit或review参数的值一致。
            // 启用预览
            review: true,
            // 筛选是否可用
            modifyFilter: true,
          },
          url: option.url,
        },
        documentType: this.doctype,
        // documentServer: "http://192.168.1.135:80/onlyoffice/", // 使用代理地址
        editorConfig: {
          callbackUrl: option.editUrl, //"编辑word后保存时回调的地址，这个api需要自己写了，将编辑后的文件通过这个api保存到自己想要的位置
          lang: option.lang, //语言设置
          //定制
          customization: {
            autosave: false, //是否自动保存
            // forcesave: true,
            chat: false,
            comments: false,
            help: false,
            // "hideRightMenu": false,//定义在第一次加载时是显示还是隐藏右侧菜单。 默认值为false
            //是否显示插件
            plugins: false,
            //fileId是文件主键Id，用于回调保存时查询文件的路径，实现修改文件
            userData: {
              fileId: option.fileId,
            },
            logo: {
              image: "", // 设为空，隐藏 OnlyOffice 图标
              imageEmbedded: "", // 设为空，隐藏嵌入式 logo
              url: "", // 设为空，去掉点击跳转链接
              visible: false,
            },
          },

          mode: "edit",
          user: option.user,
          origin: "https://cuddemo4-t"
        },
        width: "100%",
        height: "100%",
        token: option.token || "",
      };

      // eslint-disable-next-line no-undef,no-unused-vars
      setTimeout(() => {
        console.log("[ DocsAPI ]-146", DocsAPI);
        this.docEditor = new DocsAPI.DocEditor("docOnlyOffice", config);
      }, 1000);
    },
    getFileType(fileType) {
      let docType = "";
      let fileTypesDoc = [
        "doc",
        "docm",
        "docx",
        "dot",
        "dotm",
        "dotx",
        "epub",
        "fodt",
        "htm",
        "html",
        "mht",
        "odt",
        "ott",
        "pdf",
        "rtf",
        "txt",
        "djvu",
        "xps",
      ];
      let fileTypesCsv = [
        "csv",
        "fods",
        "ods",
        "ots",
        "xls",
        "xlsm",
        "xlsx",
        "xlt",
        "xltm",
        "xltx",
      ];
      let fileTypesPPt = [
        "fodp",
        "odp",
        "otp",
        "pot",
        "potm",
        "potx",
        "pps",
        "ppsm",
        "ppsx",
        "ppt",
        "pptm",
        "pptx",
      ];
      if (fileTypesDoc.includes(fileType)) {
        docType = "text";
      }
      if (fileTypesCsv.includes(fileType)) {
        docType = "spreadsheet";
      }
      if (fileTypesPPt.includes(fileType)) {
        docType = "presentation";
      }
      return docType;
    },
  },
};
</script>
 
 
<style lang="less" scoped>
</style>
