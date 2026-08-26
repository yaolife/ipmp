<template>
  <div class="cud-commom-form-style">
    <div class="cud__scroll--div">
      <edit-user ref="editUser" title="基本信息" model-type="edit" :userId="userId" :url="url" :self="true"></edit-user>
    </div>
  </div>
</template>

<script>
  import api from "../api/index";
  import { throttle } from "@/utils/funcUtil";
  import breadcrumb from "@/components/common/breadcrumb";
  import editUser from "../../userManage/view/user_edit";

  export default {
    components: {
      breadcrumb,
      editUser
    },
    data() {
      return {
        userId: '',
        url: '',
      }
    },
    created() {
      let user = sessionStorage.getItem('user');
      if (user.indexOf(']') > -1) {
        this.userId = user.substring(1, user.indexOf(']'));
      }
      this.url = this.$route.path;
    },
  };
</script>
<style lang="less" scoped>
  // @import "src/assets/css/style";
</style>
