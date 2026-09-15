<template>
  <div>
    我是自定义表格的模板

    <el-form-item label="是否显示标题">
      <el-switch v-model="data.isShowTitle"></el-switch>
    </el-form-item>
  </div>
</template>

<script>
export default {
  name: "config-customTable",
  description: "我是自定义表格的模板",
  props: ["data"],
  data() {
    return {};
  },
  methods: {},
};
</script>
