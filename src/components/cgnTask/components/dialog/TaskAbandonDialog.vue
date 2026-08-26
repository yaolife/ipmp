<template>
  <el-dialog
    v-loading="loading"
    :visible="isOpen"
    :title="$t('cgnTask.operate.abandonTask')"
    width="640px"
    height="60%"
    :destroy-on-close="true"
    :close-on-click-modal="false"
    :before-close="handleClose"
    v-dragMove="{ DragButton: '.el-dialog__header', DragWindow: '.el-dialog' }"
  >
    <!-- 作废表单 -->
    <el-form
      ref="editForm"
      size="small"
      label-position="top"
      label-suffix="："
      :model="formData"
      :rules="formRules"
      label-width="170px"
    >
      <el-row>
        <el-col :span="24">
          <!-- 作废原因 -->
          <el-form-item
            :label="$t('cgnTask.field.abandonReason')"
            prop="comment"
          >
            <el-input
              v-model="formData.comment"
              type="textarea"
              :row="3"
              maxlength="160"
              show-word-limit
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div slot="footer" class="dialog-footer" align="center">
      <el-button @click="handleClose" size="small">{{
        $t("cgnCommon.cancel")
      }}</el-button>
      <el-button type="primary" @click="handleCommitForm" size="small">{{
        $t("cgnCommon.commit")
      }}</el-button>
    </div>
  </el-dialog>
</template>

<script>
/**
 * 作废弹窗
 */
export default {
  name: "TaskAbandonDialog",
  props: {
    isOpen: { type: Boolean, default: false },
    isPromptSuccess: { type: Boolean, default: true }, // 是否提示成功信息
    procInstId: { type: String, required: true }, // 流程实例ID，必填
    comment: { type: String, default: "" }, // 审批意见
    processId: { type: String, required: true },
    procActId: { type: String, required: true }, //环节ID
  },
  data() {
    return {
      loading: false,
      formData: {
        comment: "" // 作废原因
      },
      formRules: {
        comment: [
          {
            required: true,
            message: this.$t("cgnTask.tips.abandonReasonNotEmpty"),
            trigger: "change"
          }
        ]
      }
    };
  },
  mounted() {
    // 加载可退回环节列表
    this.initAbandonForm();
  },
  methods: {
    /**
     * 初始化表单数据
     */
    initAbandonForm() {
      //将审批意见的意见 显示在作废弹窗
      this.formData.comment = this.comment;
    },
    /**
     * 提交作废
     */
    handleCommitForm() {
      let that = this;
      let requestApiFun = function(requestApi, requestApiBasic, { processId }) {
        // 获取查询参数
        let requestParams = {
          procId: that.processId, //流程ID
          procInstId: that.procInstId, // 流程实例ID
          comment: that.formData.comment, // 作废原因
          actId: that.procActId, //环节ID
        };
        // 请求API
        that.loading = true;
        requestApi
          .abandonProcInst(requestParams)
          .then(res => {
            that.loading = false;
            if (res.status == 200 && res.data.code == 0) {
              // 提示成功，并关闭弹窗
              if (that.isPromptSuccess) {
                that.$message.success(
                  that.$t("cgnTask.tips.abandonTaskSuccess")
                );
              }
              //等提示框弹出后再关闭窗口
              let timer = setTimeout(() => {
                that.$emit("closeDialog", true, res.data);
                clearTimeout(timer);
              }, 1000);
            } else {
              that.$message.error(res.data.message);
            }
          })
          .catch(err => {
            that.loading = false;
          });
      };

      // 若表单验证通过，则提交表单
      that.$refs.editForm.validate(valid => {
        if (valid) {
          that.$emit("requestApi", requestApiFun);
        }
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
