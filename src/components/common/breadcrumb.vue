<template>
  <div class="breadcrumbBox">
    <i class="el-icon-location" style="display:inline-block;transform:translateY(-1px)"></i>
    <el-breadcrumb
      class="common-brand"
      style="display:inline-block"
      separator="/"
    >
      <template v-for="(item, index) in arrayName">
        <el-breadcrumb-item
          :key="index"
          v-if="arrayName.length == index + 1 && hasIcon == true"
        >
          <el-badge :value="1" class="brand-icon">
            {{ $t(item.name) }}
          </el-badge>
        </el-breadcrumb-item>
        <el-breadcrumb-item v-else :key="index">
          {{ $t(item.name) }}
        </el-breadcrumb-item>
      </template>
    </el-breadcrumb>
  </div>
</template>

<script>
export default {
  cudUnit: "面包屑",
  props: {
    arrayName: Array,
    hasIcon: Boolean
  },
  data() {
    return {};
  }
};
</script>

<style></style>
