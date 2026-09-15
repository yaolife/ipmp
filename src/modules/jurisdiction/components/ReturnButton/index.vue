<!--
 * @Author: P645998 P645998@gnpjvc.com.cn
 * @Date: 2025-11-06 16:04:49
 * @LastEditors: P645998 P645998@gnpjvc.com.cn
 * @LastEditTime: 2025-11-06 17:17:37
 * @FilePath: \cud4-distransaction\src\modules\manage\components\CollapsePanel\index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <el-button @click="handleBack" class="return-button"  size="mini">返回</el-button>
</template>

<script>
export default {
  name: "ReturnButton",
  methods: {
    // 切换展开/收起状态
    handleBack() {
      this.$router.go(-1);
    }
  }
};
</script>
<style>
.return-button {
  position: absolute;
  right: 12px;
}
</style>

