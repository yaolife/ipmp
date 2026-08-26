<template>
  <div>
    <el-form-item label="是否显示标题">
     <el-switch v-model="data.isShowTitle"></el-switch>
    </el-form-item>
  </div>
</template>

<script>
export default {
  name: "config-tableTree",
  description: "表格树组件自定义属性",
  props: ["data"],
  data() {
    return {};
  },
  methods: {},
};
</script>
