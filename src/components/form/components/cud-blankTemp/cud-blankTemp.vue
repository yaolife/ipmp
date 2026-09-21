<!--
 * @Author: [P631038]杨旭
 * @Date: 2024-11-08 17:14:00
 * @LastEditors: [P631038]杨旭
 * @LastEditTime: 2024-12-17 09:23:04
 * @FilePath: \4.2.0-node16\cud4demo-ui\src\components\form\components\cud-blankTemp\cud-blankTemp.vue
 * @Description: 
-->
<template>
  <div v-if="!isShowTitle">
    我是一个自定义组件的空白模板示例 ( 可以在代码里搜索找到我 )
    <div>需在:</div>
    <div>①\src\components\form\components\index.js</div>
    <div>②\src\components\form\fieldsConfig.js 注册</div>
    <div @click="onClick">点击一下这里, 提交出去的数据 msg : {{ msg }}</div>
  </div>
</template>
<script>
export default {
  components: {},
  name: "BlankTemp", // name组件首字母大写.
  props: ["value", "isShowTitle", "click"],

  data() {
    return {
      msg: "",
    };
  },
  watch: {
    // 数据回显,通过value返回
    value: {
      immediate: true,
      handler(n, o) {
        if (n != null && n != "" && (o == null || o == "")) {
          this.msg = n;
        }
      },
    },
  },
  created() {},
  mounted() {},
  methods: {
    onClick() {
      // 提交数据,通过this.$emit('input','值')
      this.msg = "hello word";
      this.$emit("input", this.msg);
      if(this.click){
        this.click("你好呀")
      }
    },
  },
};
</script>
<style lang="less" scoped>
</style>