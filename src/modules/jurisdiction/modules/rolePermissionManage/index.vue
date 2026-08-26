<template>
  <div class="role-permission-manage el-card cud-commom-form-style">
    <DataTable
      :search-config="searchConfig"
      :table-columns="tableColumns"
      :operation-config="operationConfig"
      :load-data="loadData"
      ref="dataTableRef"
      :localPager="true"
    />
  </div>
</template>

<script>
import DataTable from "@/modules/jurisdiction/components/DataTable.vue";
import rolePermissionMixin from "./js/role_permission.js";

export default {
  name: "RolePermissionManage",
  components: {
    DataTable
  },
  mixins: [rolePermissionMixin]
};
</script>

<style scoped>
.role-permission-manage {
  height: calc(100vh / var(--zoom-value) - 116px);
  background: #fff;
}
</style>
