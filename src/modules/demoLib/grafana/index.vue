<template>
  <div>
    <iframe :src="src" class="iframe" frameborder="0" width="100%"></iframe>
  </div>
</template>

<script>
export default {
  data() {
    return {
      src: ""
    };
  },
  created() {
    this.src =
      "https://cuddemo4-t/grafana/d/000000127_2/telegraf-xi-tong-yi-biao-pan-v2?orgId=1&refresh=1m&kiosk";
  }
};
</script>

<style lang="less">
.iframe {
  width: 100%;
  height: 100vh;
  border: none;
}
</style>
