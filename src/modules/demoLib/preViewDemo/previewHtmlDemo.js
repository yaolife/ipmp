/*
 * @Author: [P631038]杨旭
 * @LastEditors: [P631038]杨旭
 * @Description: 
 */
export const codeList = `
使用示例:

文档预览场景大致可以分为两种：
有文档网络地址，比如 https://***.docx
文件上传时预览，此时可以获取文件的ArrayBuffer或Blob


代码参考:
<template>
  <div id="docx-demo">
    // 上传组件
    <el-upload :limit="1" :file-list="fileList" accept=".docx" :beforeUpload="beforeUpload" action="">
    <el-button size="small" type="warning">点击上传</el-button>
    </el-upload>

    // 使用组件 *src 文档地址   *rendered方法:首次渲染完成及每次src变化之后渲染完成都会触发该事件.
    <vue-office-docx :src="src" @rendered="renderedWord" />
    <vue-office-excel :src="src" @rendered="renderedPdf" />
    <vue-office-pdf :src="src" @rendered="renderedPdf" />
  </div>
</template>

<script>
//引入VueOffice组件
import VueOfficeDocx from "@vue-office/docx";
import VueOfficeExcel from "@vue-office/excel";
import VueOfficePdf from "@vue-office/pdf";
//引入相关样式
import "@vue-office/docx/lib/index.css";
import "@vue-office/excel/lib/index.css";
export default {
  components: {
    VueOfficeDocx,
    VueOfficeExcel,
    VueOfficePdf,
  },
  data(){
    return {
      src:'', // 设置文档网络地址,可以是相对地址.
      fileList:[]
    }
  },
  methods:{
    // 上传回调
    beforeUpload(file){
        let reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = (loadEvent) => {
          this.dialogVisible = true;
          let arrayBuffer = loadEvent.target.result;
          this.src = arrayBuffer;
        };
        return false;
    },
    /** word事件 */
    renderedWord() {
      console.log("[ word渲染完成 ]");
    },
    /** excel事件 */
    renderedExcel() {
      console.log("[ excel渲染完成 ]");
    },
    /** pdf事件 */
    renderedPdf() {
      console.log("[ pdf渲染完成 ]");
    },
  }
}
</script>
`
