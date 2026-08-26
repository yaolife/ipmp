<template>
  <div>
    我是自定义组件的空白模板示例,这个文件是配置右侧组件属性的配置.

    <el-form-item label="是否显示标题">
      <el-switch v-model="data.isShowTitle"></el-switch>
    </el-form-item>
  </div>
</template>

<script>
export default {
  name: "config-blankTemp",
  description: "空白模板",
  props: ["data"],
  data() {
    return {};
  },
  methods: {},
};
</script>
