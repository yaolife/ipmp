<!--
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2025-06-06 16:29:52
 * @LastEditors: Yin Rui Xue P644244@gnpjvc.com.cn
 * @LastEditTime: 2025-07-03 09:59:30
 * @FilePath: \cud4demo-ui\src\modules\engineering\components\addEngineering.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div>
    <el-dialog
      :title="title"
      :visible.sync="visible"
      :show-close="true"
      width="30%"
      :modal="true"
    >
      <div class="content">
        <el-input
          v-model="name"
          disabled
          type="textarea"
          :autosize="{ minRows: 5, maxRows: 10 }"
        ></el-input>
      </div>
      <div slot="footer" class="dialog-footer" align="center">
        <el-button size="small" type="primary" @click="visible = false">
          {{ $t("cm.confirm") }}
        </el-button>
        <el-button size="small" @click="visible = false">
          {{ $t("cm.cancel") }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "detail",
  data() {
    return {
      visible: false,
    };
  },
  watch: {
    visible(val) {},
  },
  props: {
    title: { type: String, default: "" },
    name: { type: String, default: "" },
  },
  methods: {},
};
</script>
<style lang="less" scoped>
.content {
  .el-textarea {
    height: 100%;
  }
  /deep/.el-textarea__inner {
    color: #333;
  }
}
</style>
