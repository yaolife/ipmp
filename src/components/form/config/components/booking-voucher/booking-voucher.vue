<template>
  <div>
    <el-form-item label="是否显示流程信息">
      <el-switch v-model="data.isShowProcInfo"></el-switch>
    </el-form-item>
  </div>
</template>

<script>
export default {
  name: "config-bookingVoucher",
  description: "记账凭证信息组件自定义属性",
  props: ["data"],
  data() {
    return {};
  },
  methods: {},
  watch: {}
};
</script>
