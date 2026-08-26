<!--
 * @Author: [P631038]杨旭
 * @LastEditors: [P631038]杨旭
 * @Description: 
-->
<template>
  <iframe
    ref="ascIframe"
    frameborder="0"
    scrolling="auto"
    :width="width"
    :height="height"
    :src="src"
    @load="onIframeLoad"
  ></iframe>
</template>

<script>
export default {
  name: "CgnAscBase",
  props: {
    width: { type: String, default: 600 },
    height: { type: Number, default: 400 },
    src: { type: String, required: true },
    selected: {
      type: Array,
      default: () => {
        return [];
      }
    }
  }, 
  watch: {
    src: {
      immediate: true,
      handler(val) {
        // src改变时，添加消息监听
        window.addEventListener("message", this.onMessageArrive, false);
        if (this.$refs.ascIframe) {
          this.$refs.ascIframe.src = this.src;
        }
      }
    }
  },
  methods: {
    /**
     * Iframe加载完成时，初始化选中
     */
    onIframeLoad() {

      console.log('[ this.selected ]-45', this.selected)
      this.$refs.ascIframe.contentWindow.postMessage(this.selected, "/");
    },

    /**
     * 消息到达时，回调并返回消息
     * @param messageEvent
     */
    onMessageArrive(messageEvent) {
      // 获取到第一条消息后，移出消息监听
      window.removeEventListener("message", this.onMessageArrive, false);
      this.$emit("handle", messageEvent.data);
    }
  },
  destroyed() {
    // window.removeEventListener("message", this.onMessageArrive, false);
  }
};
</script>
