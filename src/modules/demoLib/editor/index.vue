<template>
  <el-card>
    <div class="main">
      <div class="title">wangEditor富文本编辑器</div>
      <div class="block">
        <div class="card">
          <div style="margin-bottom: 10px">
            值(HTML格式): {{ html || "无" }}
          </div>

          <div style="border: 1px solid #ccc">
            <!-- <Toolbar
              style="border-bottom: 1px solid #ccc"
              :editor="editor"
              :defaultConfig="toolbarConfig"
              :mode="mode"
            />
            <Editor
              style="height: 370px; overflow-y: hidden"
              v-model="html"
              :defaultConfig="editorConfig"
              :mode="mode"
              @onCreated="onCreated"
              @onChange="onChange"
              @onDestroyed="onDestroyed"
              @onMaxLength="onMaxLength"
              @onFocus="onFocus"
              @onBlur="onBlur"
              @customAlert="customAlert"
              @customPaste="customPaste"
            /> -->
          </div>
        </div>
        <div v-if="!show" class="meta">
          <div class="highligh" style="width: 100%">
            <pre v-highlightjs>
              <code class="vue code-css">
            {{htmlContent1}}
              </code>
           </pre>
          </div>
        </div>

        <div v-if="show" class="demo-block-control show" @click="isShow">
          <i class="el-icon-caret-bottom hovering"></i>
          <span class="show-content">显示代码</span>
        </div>
        <div v-else class="demo-block-control show" @click="isShow">
          <i class="el-icon-caret-top hovering"></i>
          <span class="show-content">隐藏代码</span>
        </div>
      </div>

      <div class="title" style="margin-top: 30px">tinyMce富文本编辑器</div>
      <div class="block">
        <div class="card">
          <div style="margin-bottom: 10px">
            值(HTML格式): {{ editorContent || "无" }}
          </div>

          <tinymce-editor
            ref="editor"
            v-model="editorContent"
            :menubarFlg="false"
            :plugins="plugins"
            :toolbar="toolbar"
            :disabled="disabled"
          ></tinymce-editor>
        </div>
        <div v-if="!show1" class="meta">
          <div class="highligh" style="width: 100%">
            <pre v-highlightjs>
              <code class="vue code-css">
            {{htmlContent}}
              </code>
           </pre>
          </div>
        </div>

        <div v-if="show1" class="demo-block-control show" @click="isShow1">
          <i class="el-icon-caret-bottom hovering"></i>
          <span class="show-content">显示代码</span>
        </div>
        <div v-else class="demo-block-control show" @click="isShow1">
          <i class="el-icon-caret-top hovering"></i>
          <span class="show-content">隐藏代码</span>
        </div>
      </div>
    </div>
  </el-card>
</template>
<script>
import hljs from "highlight.js";
// import hljs from "highlight.js/lib/highlight";
// import "highlight.js/styles/github.css";
import TinymceEditor from "@/components/editor/tinymce-vue";
// import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
// import "@wangeditor/editor/dist/css/style.css";
import { setFollow, unsetFollow } from "../components/scrollFollow.js";

const str1 = `
    使用示例：

    前端:
    <template>
        <div>
        <tinymce-editor
          ref="editor"
          v-model="editorContent"
          :menubarFlg="false"
          :plugins="plugins"
          :toolbar="toolbar"
          :disabled="disabled"
        ></tinymce-editor>
          </div>
    </template>
  <script>
  import TinymceEditor from "@/components/editor/tinymce-vue";
  export default {
  components: {
    TinymceEditor,
  },
  data() {
    return {
      show: true,
      show1: true,
      showDialog: false,
      disabled: false,
      editorContent: "",
      plugins: "lists table wordcount code fullscreen link",
      toolbar:
        "undo redo | formatselect | fontselect fontsizeselect bold italic forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | lists table link | removeformat code fullscreen",
    };
  },
};
< /script >`;

const str2 = `

    使用示例:
    具体使用可参考官网https://www.wangeditor.com/ , 示例完善
    因上传图片/视频的配置比较复杂,本demo采用的是模拟上传,通过URL.createObjectUrl(file)生成临时的本地UR;,实际项目中具体使用可参考官网https://www.wangeditor.com/v5/menu-config.html#上传图片
    前端:
          <Toolbar
            style="border-bottom: 1px solid #ccc"
            :editor="editor"
            :defaultConfig="toolbarConfig"
            :mode="mode"
          />
          <Editor
            style="height: 470px; overflow-y: hidden"
            v-model="html"
            :defaultConfig="editorConfig"
            :mode="mode"
            @onCreated="onCreated"
            @onChange="onChange"
            @onDestroyed="onDestroyed"
            @onMaxLength="onMaxLength"
            @onFocus="onFocus"
            @onBlur="onBlur"
            @customAlert="customAlert"
            @customPaste="customPaste"
          />


  <script>
  import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
  import "@wangeditor/editor/dist/css/style.css";

  export default {
  components: {
    Editor,
    Toolbar,
  },
  data() {
    return {
      editor: null,
      html: "<p>hello</p>",
      toolbarConfig: {},
      editorConfig: {
        placeholder: "请输入内容...",
        wordCount: true,
        maxLength: 100,
      },
      mode: "default", // or 'simple'    };
  },
  mounted() {
    // 模拟 ajax 请求，异步渲染编辑器
    setTimeout(() => {
      this.html = "<p>模拟 Ajax 异步设置内容 HTML</p>";
    }, 1500);
  },
  beforeDestroy() {
    const editor = this.editor;
    if (editor == null) return;
    editor.destroy(); // 组件销毁时，及时销毁编辑器
  },
  methods: {
    onCreated(editor) {
      this.editor = Object.seal(editor);
      console.log("onCreated", editor);
    },
    onChange(editor) {
      console.log("onChange", editor.children);
    },
    onDestroyed(editor) {
      console.log("onDestroyed", editor);
    },
    onMaxLength(editor) {
      console.log("onMaxLength", editor);
      this.$message.warning("字数限制100,您已经超出限制拉!");
    },
    onFocus(editor) {
      console.log("onFocus", editor);
    },
    onBlur(editor) {
      console.log("onBlur", editor);
    },
    customPaste(editor, event, callback) {
      console.log("ClipboardEvent 粘贴事件对象", event);
      // const html = event.clipboardData.getData('text/html') // 获取粘贴的 html
      // const text = event.clipboardData.getData('text/plain') // 获取粘贴的纯文本
      // const rtf = event.clipboardData.getData('text/rtf') // 获取 rtf 数据（如从 word wsp 复制粘贴）

      // 自定义插入内容
      editor.insertText("xxx");

      // 返回 false ，阻止默认粘贴行为
      event.preventDefault();
      callback(false); // 返回值（注意，vue 事件的返回值，不能用 return）

      // 返回 true ，继续默认的粘贴行为
      // callback(true)
    },
  },
};
< /script >
`;
export default {
  components: {
    TinymceEditor,
    // Editor,
    // Toolbar,
  },
  data() {
    return {
      show: true,
      show1: true,
      showDialog: false,
      disabled: false,
      editorContent: "",
      plugins: "lists table wordcount code fullscreen link",
      toolbar:
        "undo redo | formatselect | fontselect fontsizeselect bold italic forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | lists table link | removeformat code fullscreen",
      htmlContent: str1,
      htmlContent1: str2,
      editor: null,
      html: "<p>hello</p>",
      toolbarConfig: {},
      editorConfig: {
        placeholder: "请输入内容...",
        wordCount: true,
        maxLength: 1000,
        placeholder: "Please input content...",
        MENU_CONF: {
          // 图片上传配置
          uploadImage: {
            // 自定义图片上传逻辑
            async customUpload(file, insertFn) {
              console.log("图片上传触发", file);

              try {
                console.log("开始处理图片上传...");
                const url = URL.createObjectURL(file);
                const alt = file.name || "pasted image";
                const href = url;

                // 调用 insertFn 插入图片
                insertFn(url, alt, href);
                console.log(`图片上传完成，URL: ${url}`);
              } catch (error) {
                console.error("图片上传失败:", error);
                alert("Image upload failed, please try again");
              }
            },

            fieldName: "file",
            maxFileSize: 10 * 1024 * 1024, // 10M
            allowedFileTypes: [
              "image/jpeg",
              "image/png",
              "image/gif",
              "image/bmp",
              "image/webp",
            ],

            // 关键配置：确保粘贴图片能正常工作
            pasteIgnoreImg: false,

            // 添加事件回调来调试
            onInserted(files) {
              console.log("图片已插入编辑器", files);
            },
            onSuccess(file, res) {
              console.log(`${file.name} 上传成功`, res);
            },
            onFailed(file, res) {
              console.log(`${file.name} 上传失败`, res);
            },
            onError(file, err, res) {
              console.error(`${file.name} 上传出错`, err, res);
            },
          },
          uploadVideo: {
            async customUpload(file, insertFn) {
              console.log("视频上传触发", file);

              try {
                console.log("开始处理视频上传...");
                const videoUrl = URL.createObjectURL(file);
                // 调用 insertFn 插入图片
                insertFn(videoUrl, videoUrl);
                console.log(`视频上传完成，URL: ${videoUrl}`);
              } catch (error) {
                console.error("视频上传失败:", error);
                alert("Image upload failed, please try again");
              }
            },
          },
        },
      },
      mode: "default", // or 'simple'
    };
  },
  directives: {
    highlightjs: {
      bind: (el) => {
        let blocks = el.querySelectorAll("pre code");
        blocks.forEach((block) => {
          hljs.highlightBlock(block);
        });
      },
    },
  },
  mounted() {
    // 模拟 ajax 请求，异步渲染编辑器
    setTimeout(() => {
      this.html = "<p>模拟 Ajax 异步设置内容 HTML</p>";
    }, 1500);
    //设置滚动跟随选人选部门组件示例
    setFollow(this);
    hljs.highlightAll();
  },
  beforeDestroy() {
    const editor = this.editor;
    if (editor == null) return;
    editor.destroy(); // 组件销毁时，及时销毁编辑器
    //取消滚动跟随
    unsetFollow(this);
  },
  methods: {
    onCreated(editor) {
      this.editor = Object.seal(editor);
      console.log("onCreated", editor);
    },
    onChange(editor) {
      console.log("onChange", editor.children);
    },
    onDestroyed(editor) {
      console.log("onDestroyed", editor);
    },
    onMaxLength(editor) {
      console.log("onMaxLength", editor);
      this.$message.warning("字数限制100,您已经超出限制拉!");
    },
    onFocus(editor) {
      console.log("onFocus", editor);
    },
    onBlur(editor) {
      console.log("onBlur", editor);
    },
    customAlert(info, type) {
      window.alert(`customAlert in Vue demo\n${type}:\n${info}`);
    },
    customPaste(editor, event, callback) {
      console.log("ClipboardEvent 粘贴事件对象", event);
      const text = event.clipboardData.getData("text/plain"); // 获取粘贴的纯文本
      const html = event.clipboardData.getData("text/html"); // 获取粘贴的HTML
      const rtf = event.clipboardData.getData("text/rtf"); // 获取RTF格式（Word特有）

      if (html && rtf) {
        event.preventDefault(); // 阻止默认粘贴
        this.processWordContent(html, editor);
      }
      if (text) {
        editor.insertText(text);
      }
    },
    // 处理Word内容（提取图片并上传）
    async processWordContent(html, editor) {
      const cleanHtml = html
        .replace(/<meta[^>]*>/g, "")
        .replace(/<style[^>]*>[^<]+<\/style>/g, "")
        .replace(/class="[^"]*"/g, "");

      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = cleanHtml;
      const nodes = tempDiv.childNodes;

      // 遍历节点：处理文本和图片
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node.nodeType === Node.TEXT_NODE) {
          // 插入文本（保留换行）
          editor.insertText(node.textContent.replace(/\n/g, "<br>"));
        } else if (node.tagName === "IMG") {
          // 上传图片并替换为 URL
          const src = node.src;
          if (src.startsWith("data:")) {
            editor.insertHtml(`<img src="${url}" style="max-width:100%;">`);
          }
        } else {
          // 保留其他标签（如加粗、斜体）
          editor.insertHtml(node.outerHTML);
        }
      }
      // const tempDiv = document.createElement("div");
      // tempDiv.innerHTML = html;

      // editor.insertHtml(tempDiv.innerHTML); // 插入处理后的HTML
    },

    isShow() {
      this.show = !this.show;
    },
    isShow1() {
      this.show1 = !this.show1;
    },
  },
};
</script>
<style lang="less" scoped>
.main {
  padding: 20px;
  .title {
    font-size: 20px;
    margin-bottom: 20px;
    // margin-left: 15px;
  }
  .valShow {
    margin-bottom: 10px;
  }
  .card {
    padding: 20px 20px 40px 20px;
    border: 1px solid #ebebeb;
    border-radius: 3px;
    transition: 0.2s;
  }
  .demo-block-control {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #eaeefb;
    height: 44px;
    box-sizing: border-box;
    background-color: #fff;
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
    text-align: center;
    margin-top: -1px;
    color: #d3dce6;
    cursor: pointer;
    position: relative;
    .demo-block-control > span {
      position: absolute;
      transform: translateX(-30px);
      font-size: 14px;
      line-height: 44px;
      transition: 0.3s;
      display: inline-block;
    }
    i.hovering {
      transform: translateX(-10px);
    }
  }
  .demo-block-control:hover {
    color: #409eff;
  }
  .demo-block-control.is-fixed {
    position: fixed;
    bottom: 0;
    width: calc(100% - 295px);
  }
  .el-icon-caret-bottom {
    font-size: 16px;
    line-height: 44px;
    transition: 0.3s;
  }
  .el-icon-caret-bottom:before {
    content: "\e790";
  }
  .hljs {
    font-family: Menlo, Monaco, Consolas, Courier, monospace;
    font-size: 14px;
    padding: 0px 24px 0 110px;
    background-color: #fafafa;
    border-radius: 4px;
    -webkit-font-smoothing: auto;
  }
}
pre {
  background-color: #f8f8f8;
  margin: 0;
  overflow-x: auto;
}
code {
  font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
  font-size: 13px;
  color: #333;
}
/deep/ .el-card__body {
  padding: 15px;
}
.code-css {
  position: relative;
  top: 0px;
  left: -80px;
  font-size: 18px;
}
.show-content {
  display: none;
}
.show:hover .show-content {
  display: block;
}
/deep/.w-e-text-container h1 {
  font-size: 24px !important;
}
/deep/.w-e-full-screen-container {
  z-index: 1001;
}
</style>
