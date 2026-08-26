<template>
  <!-- class="hidden" -->
  <div id="examine-tool" ref="dmCom">
    <div class="hidden">
      <!-- 关闭 -->
      <el-button
        v-if="isShowButton('CLOSEPAGE_BUTTON')"
        size="small"
        @click="onBack"
        >{{ $t("cudComponents.closePage") }}</el-button
      >
      <!-- 重置 -->
      <el-button
        v-if="
          (isShowButton('RESET_BUTTON') && $route.query.procNode === '1') ||
            $route.query.procNode === '2'
        "
        size="small"
        @click="onReset()"
        >{{ $t("cudComponents.reset") }}</el-button
      >
      <!-- 保存 -->
      <el-button
        size="small"
        type="primary"
        @click="onSave()"
        v-if="isShowButton('SAVE_BUTTON')"
      >
        {{ $t("cm.save") }}
      </el-button>
      <!-- 打印 -->
      <el-button
        size="small"
        @click="onPrint()"
        v-if="isShowButton('PRINT_BUTTON')"
        >{{ $t("cudComponents.print") }}</el-button
      >
      <!-- 作废 -->
      <el-button
        v-if="isShowButton('DELETE_BUTTON') && $route.query.procNode !== '1'"
        size="small"
        @click="onCancellation()"
        :type="isCancelPlain ? 'default' : ''"
        >{{ $t("cudComponents.invalid") }}</el-button
      > 
      <!-- 查看流程图 -->
      <el-button
        size="small"
        @click="onProcDiagram()"
        v-if="isShowButton('VIEW_FLOWCHART_BUTTON')"
        >{{ $t("cudComponents.view_flow_chart") }}</el-button
      >
      <!-- 转办 -->
      <el-button
        size="small"
        @click="onTransition()"
        v-if="isShowButton('TRANSFER_BUTTON') && $route.query.procNode === '2'"
        >{{ $t("cudComponents.transfer_task") }}</el-button
      >
      <!-- 委托 -->
      <el-button
        size="small"
        @click="onEntrust()"
        v-if="isShowButton('ENTRUST_BUTTON') && $route.query.procNode === '2'"
        >{{ $t("cudComponents.delegate") }}</el-button
      >
      <!-- 取消委托 -->
      <el-button
        size="small"
        @click="offEntrust()"
        v-if="isShowButton('CANCEL_ENTRUST_BUTTON')&& $route.query.procNode === '2'"
        >{{ $t("cudComponents.undelegate_task") }}</el-button
      >
      <!-- 退回 -->
      <el-button
        @click="onSendBack()"
        size="small"
        v-if="isShowButton('RETURN_BUTTON') && $route.query.procNode === '2'"
        :type="isSendBackPlain ? 'default' : ''"
        >{{ $t("cudComponents.send_back") }}</el-button
      >
      <!-- 关注 -->
      <el-button
        size="small"
        @click="onConcern()"
        v-if="isShowButton('CONCERN_BUTTON')"
        >{{ $t("cudComponents.concern") }}</el-button
      >
      <!-- 取消关注 -->
      <el-button
        size="small"
        @click="onCancelConcern()"
        v-if="
          isShowButton('CANCEL_CONCERN_BUTTON') && $route.query.processInfoId
        "
        >{{ $t("cudComponents.unconcern") }}</el-button
      >
      <!-- 发起提交 -->
      <el-button
        size="small"
        type="primary"
        @click="onInitiate($event)"
        v-if="
          isShowButton('START_PROC_BUTTON') && ($route.query.procNode === '1' || $route.query.procNode === '4')
        "
      >
        <span v-if="isPreview">
          {{ "发起" }}
        </span>
        <span v-else>
          {{ $t("cm.commit") }}
        </span>
      </el-button>
      <!-- 待办提交 -->
      <el-button
        size="small"
        type="primary"
        @click="onSubmit($event)"
        v-if="
          isShowButton('COMMIT_PROC_BUTTON') && $route.query.procNode === '2'
        "
        >{{ $t("cm.commit") }}
      </el-button>
      <!-- 已阅 -->
      <el-button
        v-if="isShowButton('READED_BUTTON') && $route.query.procNode !== '1'"
        size="small"
        type="primary"
        @click="onHaveRead()"
        >{{ $t("cudComponents.readed") }}</el-button
      >
    </div>
  </div>
</template>

<script> 
import osUtil from "@/utils/osUtil";
export default {
  name: "ExamineTool",
  components: {},
  props: {
    prop: { type: String },
    buttons: {
      type: Array,
      default: () => {
        return [
          { buttonName: "查看流程图", buttonType: "VIEW_FLOWCHART_BUTTON" },
          { buttonName: "保存", buttonType: "SAVE_BUTTON" },
          { buttonName: "打印", buttonType: "PRINT_BUTTON" },
          { buttonName: "作废", buttonType: "DELETE_BUTTON" },
          { buttonName: "转办", buttonType: "TRANSFER_BUTTON" },
          { buttonName: "委托", buttonType: "ENTRUST_BUTTON" },
          { buttonName: "取消委托", buttonType: "CANCEL_ENTRUST_BUTTON" },
          { buttonName: "退回", buttonType: "RETURN_BUTTON" },
          { buttonName: "发起", buttonType: "START_PROC_BUTTON" },
          { buttonName: "提交", buttonType: "COMMIT_PROC_BUTTON" },
          { buttonName: "已阅", buttonType: "READED_BUTTON" },
          { buttonName: "关注", buttonType: "CONCERN_BUTTON" },
          { buttonName: "取消关注", buttonType: "CANCEL_CONCERN_BUTTON" },
          { buttonName: "关闭", buttonType: "CLOSEPAGE_BUTTON" },
          { buttonName: "重置", buttonType: "RESET_BUTTON" }
        ];
      }
    }
  },
  computed: {
    isPreview() {
      return this.$route.query ? this.$route.query.isPreview : false;
    }
  },
  data() {
    return {
      formValidate: false,
      isCancelPlain: true, //能否作废
      isSendBackPlain: true //能否退回
    };
  },
  methods: {
    isShowButton: function(type) {
      let index = this.buttons.findIndex(button => {
        return button.buttonType == type;
      });
      return index > -1;
    },
    onBack() {
      this.$confirm("此操作将离开页面, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          if (window.getPageList) {
            // this.$router.back();
            window.getPageList();
          } else if (window.opener && window.opener.getPageList) {
            window.opener.getPageList();
            window.opener.getPageList = null;
            // window.close();
          } else {
            if (this.$route.query) {
              this.$router.push("/office");
            } else {
              // 新建浏览器窗口
              if (window.opener && window.opener.refreshAllTaskCount) {
                window.opener.refreshAllTaskCount();
                window.opener.refreshAllTaskCount = null;
                // window.close();
              }
            }
          }
          //关闭页签
          this.closeTab("/office");
        })
        .catch(() => {});
    },
    onProcDiagram() {
      this.$emit("onProcDiagram");
    },
    onSave() {
      this.$emit("onSave");
    },
    onPrint() {
      this.$emit("onPrint");
    },
    onCancellation() {
      this.$emit("onCancellation");
    }, 
    onTransition() {
      this.$emit("onTransition");
    },
    onEntrust() {
      this.$emit("onEntrust");
    },
    offEntrust() {
      this.$emit("offEntrust");
    },
    onSendBack() {
      this.$emit("onSendBack");
    },
    onClosePage() {
      this.$confirm("此操作将离开页面, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          if (window.getPageList) {
            this.$router.back();
          } else if (
            navigator.userAgent.indexOf("Firefox") !== -1 ||
            navigator.userAgent.indexOf("Chrome") !== -1
          ) {
            window.location.href = "about:blank";
            window.close();
          } else {
            this.$router.go(-1);
          }
        })
        .catch(() => {});
    },
    //重置表单
    onReset() {
      this.$emit("onReset");
    },
    //点击按钮失焦
    onBlur(event) {
      if (!event) return;
      if (event.target.nodeName === "SPAN") {
        event.target.parentNode.blur();
      } else {
        event.target.blur();
      }
    },
    //发起
    async onInitiate(event) {
      this.onBlur(event);
      await this.formValidateFn();
      return this.$emit("onInitiate");
    },
    //提交
    async onSubmit(event) {
      console.log("====");

      this.onBlur(event);
      // 调用提交
      if (
        this.$refs.dmCom.parentElement.__vue__.$refs.comment.selectedMode ===
        "1"
      ) {
        await this.formValidateFn();
        return this.$emit("onSubmit");
      } else if (
        this.$refs.dmCom.parentElement.__vue__.$refs.comment.selectedMode ===
        "2"
      ) {
        // 调用退回
        this.onSendBack();
      } else if (
        this.$refs.dmCom.parentElement.__vue__.$refs.comment.selectedMode ===
        "3"
      ) {
        // 调用作废
        this.onCancellation();
      }
    },
    onHaveRead() {
      this.$emit("onHaveRead");
    },
    onCancelConcern() {
      this.$emit("onCancelConcern");
    },
    onConcern() {
      this.$emit("onConcern");
    },
    //表单校验相关逻辑
    async formValidateFn() {
      return true;
    },
    baseInfoDm() {
      this.$nextTick(() => {
        if ([...document.getElementsByClassName("base-info")].length > 0) {
          document.getElementsByClassName(
            "base-info"
          )[0].parentElement.parentElement.parentElement.style.padding = "0";
          document.getElementsByClassName(
            "base-info"
          )[0].parentElement.parentElement.parentElement.parentElement.style.cssText =
            "padding-left:0;padding-right:0";
          document.getElementsByClassName(
            "base-info"
          )[0].parentElement.parentElement.parentElement.parentElement.style.paddingLeft =
            "0";
          document.getElementsByClassName(
            "base-info"
          )[0].parentElement.parentElement.parentElement.parentElement.style.paddingRight =
            "0";
        }
      });
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
#examine-tool {
  background: #fff;
  padding: 15px 15px 10px 15px;
  position: fixed;
  bottom: 0;
  right: 0;
  box-shadow: 0px 1px 8px #d5dfe8;
}
@media print {
  .hidden {
    display: none;
  }
}

@media print {
  html,
  body {
    height: inherit;
  }
}

@media print {
  @page {
    size: auto;
    margin: 3mm;
  }
  body {
    height: auto; //在实际页面中高度不够部分内容隐藏了
  }
}
</style>
