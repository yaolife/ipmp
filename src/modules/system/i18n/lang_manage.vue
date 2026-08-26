<template>
  <div class="cud-commom-form-style">
    <div class="brand">
      <breadcrumb :arrayName="brand" :hasIcon="hasIcon"></breadcrumb>
    </div>
    <div
      class="cud__scroll--div dict_manage cud-cgn-task-center"
      style="margin: 8px 10px 14px "
    >
      <el-tabs
        v-model="activeNameState"
        @tab-click="handleClick"
        ref="tabs"
        class="dict_tab cgn-task-tabs"
      >
        <el-tab-pane
          :label="$t('sys.i18n_item_manage')"
          name="i18n_item"
          class="cud-task-list"
        >
          <i18n_item_manage ref="item-manage" :activeName="activeNameState"></i18n_item_manage>
        </el-tab-pane>
        <el-tab-pane :label="$t('sys.i18n_lang_manage')" name="i18n_lang">
          <i18n_lang_manage ref="lang-manage" :activeName="activeNameState"></i18n_lang_manage>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import lang_manage from "./js/lang_manage.js";
export default lang_manage;
</script>

<style lang="less" scoped>
/deep/ .cud-cgn-task-center .cgn-task-tabs .el-tabs__content {
  padding: 10px;
}
/deep/ .cud-cgn-task-center {
  margin-top: 0;
}
/deep/ .el-tabs__active-bar {
  width: 30px !important;
  left: 52px;
}
// @import "src/assets/css/style";
</style>
