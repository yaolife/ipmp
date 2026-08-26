<template>
  <!-- 富文本 -->
  <div>
    <editor
      :id="tinymceId"
      ref="textarea"
      v-model="content"
      :init="init"
      :disabled="disabled"
    ></editor>
  </div>
</template>

<script>
import tinymce from "tinymce/tinymce";
import Editor from "@tinymce/tinymce-vue";
import "tinymce/icons/default/icons";
import "tinymce/themes/silver";
import "tinymce/plugins/image";
import "tinymce/plugins/media";
import "tinymce/plugins/table";
import "tinymce/plugins/lists";
import "tinymce/plugins/contextmenu";
import "tinymce/plugins/wordcount";
import "tinymce/plugins/colorpicker";
import "tinymce/plugins/textcolor";
import "tinymce/plugins/preview";
import "tinymce/plugins/code";
import "tinymce/plugins/link";
import "tinymce/plugins/advlist";
import "tinymce/plugins/codesample";
import "tinymce/plugins/hr";
import "tinymce/plugins/fullscreen";
import "tinymce/plugins/textpattern";
import "tinymce/plugins/searchreplace";
import "tinymce/plugins/autolink";
import "tinymce/plugins/directionality";
import "tinymce/plugins/visualblocks";
import "tinymce/plugins/visualchars";
import "tinymce/plugins/template";
import "tinymce/plugins/charmap";
import "tinymce/plugins/nonbreaking";
import "tinymce/plugins/insertdatetime";
import "tinymce/plugins/imagetools";
import "tinymce/plugins/autosave";
import "tinymce/plugins/autoresize";
// import "tinymce/plugins/importword";

import { getHeadersOptions } from "@/utils/funcUtil.js";
// import { getUrls } from "./api";
export default {
  components: {
    Editor
  },
  props: {
    value: {
      type: String,
      default: ""
    },
    menubarFlg: {
      type: Boolean,
      default: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    plugins: {
      type: [String, Array],
      default:
        "preview searchreplace autolink directionality visualblocks visualchars fullscreen image link media template code codesample table charmap hr nonbreaking insertdatetime advlist lists wordcount imagetools textpattern autosave autoresize"
    },
    toolbar: {
      type: [String, Array],
      default:
        "code undo redo restoredraft | cut copy paste pastetext | forecolor backcolor bold italic underline strikethrough link codesample | alignleft aligncenter alignright alignjustify outdent indent formatpainter | \
      styleselect formatselect fontselect fontsizeselect | bullist numlist | blockquote subscript superscript removeformat | \
      table image media charmap hr pagebreak insertdatetime | fullscreen preview | importword"
    }
  },
  data() {
    return {
      //初始化配置
      init: {
        menubar: this.menubarFlg, // 菜单栏显隐
        language_url: "/static/tinymce/i18n/cn/zh_CN.js",
        language: "zh_CN",
        skin_url: "/static/tinymce/skins/ui/oxide",
        height: 470,
        min_height: 470,
        toolbar_mode: "wrap",
        plugins: this.plugins,
        toolbar: this.toolbar,
        fontsize_formats:
          "10px 11px 12px 13px 14px 15px 16px 17px 18px 19px 20px 24px 36px 48px",
        font_formats:
          "微软雅黑=Microsoft YaHei,Helvetica Neue,PingFang SC,sans-serif;苹果苹方=PingFang SC,Microsoft YaHei,sans-serif;宋体=simsun,serif;Andale Mono=andale mono,times;Arial=arial,helvetica,sans-serif;Arial Black=arial black,avant garde;Book Antiqua=book antiqua,palatino;Comic Sans MS=comic sans ms,sans-serif;Courier New=courier new,courier;Georgia=georgia,palatino;Helvetica=helvetica;Impact=impact,chicago;Symbol=symbol;Tahoma=tahoma,arial,helvetica,sans-serif;Terminal=terminal,monaco;Times New Roman=times new roman,times;Trebuchet MS=trebuchet ms,geneva;Verdana=verdana,geneva;Webdings=webdings;Wingdings=wingdings,zapf dingbats",
        branding: false, //去除右下角的技术支持文字
        browser_spellcheck: false, //是否启用拼写检查
        elementpath: false, //是否启用编辑器底部左下角的状态栏
        statusbar: true, //是否启用编辑器底部右下角的状态栏
        // external_plugins: {
        //   powerpaste: `/static/tinymce/powerpaste/plugin.min.js`, //${this.baseUrl}
        // },
        // powerpaste_word_import: "propmt", // 参数可以是propmt, merge, clear，效果自行切换对比
        // powerpaste_html_import: "propmt", // propmt, merge, clear
        // powerpaste_allow_local_images: true,
        paste_data_images: true, //是否允许粘贴图片
        convert_urls: false, //是否自动转换url
        selector: "textarea ", // 选择器，指定要初始化的textarea元素
        wordcount_elements: "body", // 设置wordcount插件监控的元素，这里是整个编辑器的body
        max_length: 100000, // 设置字数限制为1000个字符
        init_instance_callback: editor => {
          editor.on("paste", evt => {
            // 监听粘贴事件
            this.onPaste(evt);
          });
        },
        setup: function(editor) {
          editor.on("init", function(e) {
            // 获取右下角字的DOM,初始化默认点击一下
            const wordCountButton = document.querySelector(
              "button.tox-statusbar__wordcount"
            );
            if (wordCountButton) {
              wordCountButton.click();
            }
          });
          // 监听keyup事件来实时检查字数
          editor.on("keyup", function(e) {
            var maxLength = editor.settings.max_length || 0;
            var currentLength = editor.getContent({ format: "text" }).length;
            if (maxLength > 0 && currentLength > maxLength) {
              // 当超出字数限制时，截取内容至字数限制长度
              editor.setContent(
                editor.getContent({ format: "text" }).substring(0, maxLength)
              );
            }
          });
        },
        // paste_postprocess: function (pluginApi, data) {
        //   var images = data.target.dom.select("img");
        //   tinymce.each(images, function (img) {
        //     var src = img.src;
        //   });
        // },

        // 图片上传
        // images_upload_handler: (blobInfo, success, failure) => {
        //   // const img = 'data:image/jpeg;base64,' + blobInfo.base64()
        //   // success(img)
        //
        //   const formData = new FormData()
        //   formData.append('file', blobInfo.blob())
        //   reserveTableFoodDescribe(formData).then(res => {
        //     if (res.code === '10000') {
        //       const file = res.data
        //       success(file.url)
        //       return
        //     }
        //     failure('上传失败')
        //   }).catch(() => {
        //     failure('上传出错')
        //   })
        // }
        images_upload_handler: (blobInfo, success, failure) => {
          const img = "data:image/jpeg;base64," + blobInfo.base64();
          success(img);
        },
        // valid_elements: "p,a[href|target],br,img[src|alt],iframe[src],div,",
        // extended_valid_elements: "span[class|style]",
        // entity_encoding: "raw"
      },
      content: this.value,
      uploadNum: 0, // 记录上传次数
      uploadPicList: [], // 图片URL list
      imgUrl: [],
      headersOptions: getHeadersOptions()
    };
  },
  computed: {
    tinymceId() {
      return (
        "vue-tinymce-" + +new Date() + ((Math.random() * 1000).toFixed(0) + "")
      );
    }
  },
  watch: {
    value(newValue) {
      this.content = newValue;
    },
    content(newValue) {
      this.$emit("input", newValue);
    }
  },
  mounted() {
    tinymce.init({
      // word文件导入功能
      importword_handler: function(editor, files, next) {
        var file_name = files[0].name;
        if (file_name.substr(file_name.lastIndexOf(".") + 1) == "docx") {
          editor.notificationManager.open({
            text: "正在转换中...",
            type: "info",
            closeButton: false
          });
          next(files);
        } else {
          editor.notificationManager.open({
            text:
              "目前仅支持docx文件格式，doc格式，请打开文件重新另存为docx格式即可上传",
            type: "warning"
          });
        }
      },
      importword_filter: function(result, insert, message) {
        // 自定义操作部分
        insert(result); //回插函数
      }
    });
  },
  methods: {
    onPaste(event) {
      // 获取rtf数据（从word复制粘贴过程中的图文就在里面）
      const rtf = event.clipboardData.getData("text/rtf");
      if (rtf) {
        // 提取图片信息
        const hexStrings = this.extractImageDataFromRtf(rtf);
        // 获取base64图片数据
        const base64Images = hexStrings.map(hexObj => {
          return this.convertHexToBase64(hexObj.hex);
        });
        // 调用上传接口
        let baseList = [];
        for (let i = 0; i < base64Images.length; i++) {
          // 调用接口给到后端
          // this.picUpload(
          //   `data:image/png;base64,${base64Images[i]}`,
          //   base64Images.length,
          //   i
          // );
          // base64 list给到image循环回显至富文本内.
          baseList.push({
            baseurl: `data:image/png;base64,${base64Images[i]}`
          });
        }
        this.setResponseUrl(baseList);
      } else {
        // 单张图片
        const items = event.clipboardData.items;
        for (var i = 0, len = items.length; i < len; i++) {
          var item = items[i];
          if (item.kind === "file" && item.type.startsWith("image/")) {
            var blob = item.getAsFile();
            this.blobToBase64(blob, function(result) {
              tinymce.execCommand(
                "mceInsertContent",
                false,
                '<img src="' + result + '" alt="Pasted Image" />'
              );
            });
            event.preventDefault();
            break;
          }
        }
      }
    },
    /** 提取图片信息 */
    extractImageDataFromRtf(rtfData) {
      if (!rtfData) {
        return [];
      }
      const regexPictureHeader = /{\\pict[\s\S]+?({\\\*\\blipuid\s?[\da-fA-F]+)[\s}]*/;
      const regexPicture = new RegExp(
        "(?:(" + regexPictureHeader.source + "))([\\da-fA-F\\s]+)\\}",
        "g"
      );
      const images = rtfData.match(regexPicture);
      const result = [];

      if (images) {
        for (const image of images) {
          let imageType = false;
          if (image.includes("\\pngblip")) {
            imageType = "image/png";
          } else if (image.includes("\\jpegblip")) {
            imageType = "image/jpeg";
          }
          if (imageType) {
            result.push({
              hex: image
                .replace(regexPictureHeader, "")
                .replace(/[^\da-fA-F]/g, ""),
              type: imageType
            });
          }
        }
      }
      return result;
    },
    // 将hex格式转化为base64
    convertHexToBase64(hexString) {
      return btoa(
        hexString
          .match(/\w{2}/g)
          .map(char => {
            return String.fromCharCode(parseInt(char, 16));
          })
          .join("")
      );
    },
    // 将blob格式转base64
    blobToBase64(blob, callback) {
      var reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = function(e) {
        callback(e.target.result);
      };
    },
    /** 调用中台上传接口,获取文件id */
    async picUpload(data, len, i) {
      ++this.uploadNum;
      let file = this.base64toFile(data);
      var formData = new FormData();
      formData.append("file", file);
      await this.axios({
        ContentType: "application/json;charset=UTF-8",
        headers: this.headersOptions,
        url: "/procAttachment/upfile",
        method: "post",
        data: formData
      }).then(res => {
        this.getFileUrl(res.data.data);
        if (this.uploadNum === len) {
          setTimeout(() => {
            this.setResponseUrl();
          }, 1000);
        }
      });
    },
    // 通过文件id,获取临时url地址
    async getFileUrl(row) {
      await getUrls({
        ids: [row.fileId]
      })
        .then(res => {
          this.imgUrl.push({
            fileUrl: res.data.data[0].fileUrl,
            fileId: res.data.data[0].fileId
          });
        })
        .catch(err => {
          console.log(err);
        });
    },
    /** 设置图片回显的类型. */
    setResponseUrl(baseurl) {
      // 文件以base64格式回显至图片
      setTimeout(() => {
        const iframes = parent.document.getElementsByTagName("iframe");
        const iframe = iframes[0];
        const imgList = iframe.contentWindow.document.querySelectorAll("img");
        imgList.forEach(async (item, i) => {
          baseurl.forEach((it, index) => {
            // 根据对相应顺序 替换url 图片地址
            if (i === index) {
              item.setAttribute("src", it.baseurl);
            }
          });
        });
      }, 10);
    },
    /** base64文件转换为文件流 */
    base64toFile(dataurl, filename = "file") {
      let arr = dataurl.split(",");
      let mime = arr[0].match(/:(.*?);/)[1];
      let suffix = mime.split("/")[1];
      let bstr = atob(arr[1]);
      let n = bstr.length;
      let u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      let file = new File([u8arr], `${filename}.${suffix}`, {
        type: mime
      });
      return file;
    }
  }
};
</script>
<style scoped lang="less"></style>
