<template>
  <el-dialog
    class="task-dialog task-submit-dialog body-fullscreen-dialog"
    v-dragMove="{ DragButton: '.el-dialog__header', DragWindow: '.el-dialog' }"
    :title="$t('cgnTask.operate.viewFlowChart')"
    append-to-body
    :withHeader="false"
    :visible.sync="isOpen"
    :before-close="handleClose"
    :fullscreen="true"
    direction="rtl"
    destroy-on-close
    :close-on-press-escape="false"
    :close-on-click-modal="false"
    :wrapperClosable="false"
  >
    <cgn-bpmn-map
      ref="bpmn"
      :psc-url="pscUrl1"
      :access-token="accessToken"
      :tenant-id="tenantId"
      :app-id="appId"
      :proc-inst-id="procInstId"
      :proc-def-id="procDefId"
      :show-transaction="true"
      @elementEvent="onElementEvent"
      @renderComplete="onRenderComplete"
      v-if="accessToken"
    >
    </cgn-bpmn-map>
    <div
      slot="footer"
      align="center"
      style="position: fixed; bottom: 15px; right: 0; left: 0; margin: auto"
    >
      <el-button @click="handleClose" size="small">
        {{ $t("workbench.closeProcess") }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { CgnBpmnMap } from "psc-module";

/**
 * 撤销弹窗
 */
export default {
  components: {
    //collect
    CgnBpmnMap
  },
  name: "TaskViewShowDialog",
  props: {
    isOpen: { type: Boolean, default: false },
    procInstId: { type: String, required: true }, // 流程ID，必填
    procDefId: { type: String, required: true } // 流程ID，必填
  },
  data() {
    return {
      formData: {},
      loading: false,
      appId: "", // 应用ID，必填
      accessToken: "", // 访问Token，必填
      tenantId: "", // 租户ID
      pscUrl1: envConfig.PSC_ROOT || "/api" // 指定psc域名地址，必填
    };
  },
  mounted() {
    this.getFwAuth();
  },
  methods: {
    onRenderComplete() {},
    onElementEvent() {},
    getFwAuth() {
      let that = this;
      that.loading = true;
      let aa = that.pscUrl1;
      that.$emit("requestApi", function(requestApi, requestApiBasic) {
        // 获取查询参数
        let requestParams = {};

        requestApi
          .postWfAuthAPI(requestParams)
          .then(res => {
            that.loading = false;
            if (res.status == 200 && res.data.code == 0) {
              let data = res.data.data;
              that.accessToken = data.accessToken; // 访问Token，必填
              that.tenantId = data.tenantId; // 租户ID
              that.appId = data.appId; // 应用ID，必填
            } else {
              that.$message.error(res.data.message);
            }
          })
          .catch(err => {
            that.loading = false;
          });
      });
    },

    /**
     * 关闭弹窗事件
     */
    handleClose() {
      this.$emit("closeDialog");
    }
  }
};
</script>
<style lang="less" scoped>
// @import "src/assets/css/style";
.el-dialog {
  overflow: auto;
}
/deep/ .el-dialog__close {
  color: black;
  line-height: 38px;
  font-size: 30px;
}
/deep/ .themecud .el-button--default {
  background-color: #fff !important;
}
</style>
