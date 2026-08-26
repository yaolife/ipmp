<template>
  <div>
    <el-input
      ref="input"
      :value="currentValue"
      :placeholder="placeholder"
      :name="name"
      :size="size"
      :id="id"
      :disabled="inputDisabled"
      :readonly="readonly"
      class="form-input"
    >
      <el-button
        :size="size"
        slot="append"
        icon="el-icon-plus"
        @click="show"
        style="color:#ffffff !important; background-color: #0C7BCA !important;border-radius: 0 5px 5px 0;"
      ></el-button>
    </el-input>
    <!-- <el-dialog :title="title"  append-to-body=true  :visible.sync="visible" modal=false width="850px"
                   :close-on-click-modal="false">
            <asc-base v-bind:width="800"  :src="src" v-bind:height="600" :selected="selected"
                      @handle="handle"></asc-base>
        </el-dialog> -->
    <el-dialog
      :title="title"
      :append-to-body="toBody"
      :visible.sync="visible"
      width="850px"
      :close-on-click-modal="false"
      v-dragMove="{
        DragButton: '.el-dialog__header',
        DragWindow: '.el-dialog'
      }"
    >
      <asc-base
        v-bind:width="800"
        :src="src"
        v-bind:height="600"
        :selected="selected"
        @handle="handle"
      ></asc-base>
    </el-dialog>
  </div>
</template>

<script>
import { mixinsComp } from "@/mixins/index";
import ascBase from "../asc/AscBase";


export default {
  mixins: [mixinsComp],
  name: "person-select",
  components: {
    ascBase
  },
  inject: {
    elForm: {
      default: ""
    },
    elFormItem: {
      default: ""
    }
  },
  data() {
    return {
      mixinsCmptCode: "personselect",
      mixinsCmptName: "选人",
      currentValue:
        this.value === undefined || this.value === null ? "" : this.value,
      src: "",
      visible: false,
      readonly: true,
      toBody: true,
      size: "small",
      title: this.multiple
        ? this.$t("el.select.placeholder")
        : this.$t("el.select.placeholder")
    };
  },
  watch: {
    value: {
      immediate: true,
      handler(val) {
        this.setSelected(val);
      }
    }
  },
  mounted() {
    //this.url = process.env.ASC_ROOT + this.src + "?lang=zh_CN";
    //this.$refs.ascframe.src = this.url;
    // const iframe =  this.$refs.ascframe.contentWindow;
    // iframe.onload = function () {
    //     iframe.postMessage('test', '/');
    // }
  },
  computed: {
    inputDisabled() {
      return this.disabled || (this.elForm || {}).disabled;
    },
    inputSrc() {
      var src = this.multiple
        ? "/personwidget.html"
        : "/singlepersonwidget.html";

      return src;
    }
  },
  methods: {
    load() {},
    setSelected(value) {
      this.currentValue = value === undefined || value === null ? "" : value;
      this.selected = new Array();
      let changeValue = "";
      if (this.currentValue != "") {
        let array = this.currentValue.split(",");
        let arr = [];
        for (let i = 0; i < array.length; i++) {
          arr.push(array[i].substr(1, array[i].indexOf("]") - 1));
        }
        changeValue = arr.join(",");
      }

      // value 为 [pxmw001]001,[pxmw002]002 类型的格式，转换成 pxmw001,pxmw002
      if (this.multiple) {
        this.selected[0] = "";
        this.selected[1] = "";
        this.selected[2] = "";
        this.selected[3] = "";
        this.selected[4] = "";
        this.selected[5] = changeValue;
      } else {
        this.selected[0] = "";
        this.selected[1] = "";
        this.selected[2] = "";
        this.selected[3] = "";
        this.selected[4] = "";
        this.selected[5] = changeValue;
      }
    },
    handle(data) {
      if (data === "close") {
        this.visible = false;
      } else {
        //处理一下  //如果安装了 vue.js devtools google插件 下面会报错
        if (data !== "cancelPersons") {
          let userIdArr = data[0].split(";");
          let userNameArr = data[1].split(";");
          let value = [];
          for (let i = 0; i < userIdArr.length; i++) {
            value.push("[" + userIdArr[i] + "]" + userNameArr[i]);
          }
          // const value = "["+data[0]+"]"+data[1];
          if (data[0] === "") {
            this.setSelected("");
          } else {
            this.setSelected(value.join(","));
          }

          //是否进行回调  2020-06-17 增
          if (this.handleCallback) {
            this.$emit("callback", value);
          }
        } else {
          //取消操作
          // console.log(data);
          // this.setSelected("");
        }

        this.visible = false;
      }
      //alert(data);
    },
    messageListener(messageEvent) {
      this.visible = false;
      //window.removeEventListener('message', this.messageListener, false);
      this.value = messageEvent.data[0];
    },
    show() {
      this.visible = true;
      var src =
        this.$i18n.locale == "zh-CN"
          ? this.inputSrc + "?lang=zh_CN"
          : this.inputSrc + "?lang=en_US";
      this.src = src + "&time=" + new Date().getTime() + "&rDept=true";
      //window.addEventListener('message', this.messageListener, false);
    }
  },
  destroyed() {
    //this.$refs.ascframe.contentWindow.removeEventListener('message', this.messageListener, false);
  },
  props: {
    id: String,
    name: String,
    // selected: [],
    value: [String, Number],
    size: {
      type: String,
      default: ""
    },
    text: [String, Number],
    disabled: {
      type: Boolean,
      default: false
    },
    multiple: Boolean,
    multipleLimit: {
      type: Number,
      default: 0
    },
    placeholder: {
      type: String,
      default() {
        return this.$t("el.select.placeholder");
      }
    },
    handleCallback: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style scoped></style>
