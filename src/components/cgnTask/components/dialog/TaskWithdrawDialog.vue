<template>
  <el-dialog
    v-loading="loading"
    :visible="isOpen"
    :title="$t('cgnTask.operate.withdrawTask')"
    width="640px"
    v-dragMove="{ DragButton: '.el-dialog__header', DragWindow: '.el-dialog' }"
    :destroy-on-close="true"
    :close-on-click-modal="false"
    :before-close="handleClose"
    class="task-dialog"
  >
    <!-- 撤销表单 -->
    <el-form
      ref="editForm"
      size="small"
      label-suffix="："
      label-position="top"
      :model="formData"
      :rules="formRules"
      label-width="170px"
    >
      <el-row>
        <el-col :span="24">
          <!-- 撤销原因 -->
          <el-form-item :label="$t('cgnTask.field.withdrawReason')">
            <!-- prop="comment" -->
            <el-input
              v-model="formData.comment"
              type="textarea"
              :row="3"
              maxlength="160"
              show-word-limit
              placeholder="同意"
              @input="handleInput"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <div slot="footer" class="dialog-footer" align="center">
      <el-button size="small" @click="handleClose">{{
        $t("cgnCommon.cancel")
      }}</el-button>
      <el-button size="small" type="primary" @click="handleCommitForm">{{
        $t("cgnCommon.commit")
      }}</el-button>
    </div>
  </el-dialog>
</template>

<script>
import ApiTask from "../../common/ApiTask";
/**
 * 撤销弹窗
 */
export default {
  name: "TaskWithdrawDialog",
  props: {
    isOpen: { type: Boolean, default: false },
    isPromptSuccess: { type: Boolean, default: true }, // 是否提示成功信息
    procDefId: { type: String, required: true }, // 流程ID，必填
    procTaskId: { type: String, required: true }, // 流程任务ID，必填
    procInstId: { type: String, required: true }, // 流程实例ID，必填
    procActId: { type: String }, //
    cosignItemCode: { type: String }, //
    cosignItemName: { type: String }, //
    isOperationDispatch: { type: Boolean, default: false },
    userId: { type: String, default: "" },
    userName: { type: String, default: "" }
  },
  data() {
    return {
      loading: false,
      formData: {
        comment: "" // 撤销原因
      },
      formRules: {
        comment: [
          {
            required: true,
            message: this.$t("cgnTask.tips.withdrawReasonNotEmpty"),
            trigger: "change"
          }
        ]
      }
    };
  },
  methods: {
    handleInput(value) {
      // 定义正则表达式，匹配表情符号
      const regex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/gi;
      // 检测是否有匹配的表情符号
      if (regex.test(value)) {
        // 替换表情符号为空字符串
        const filteredValue = value.replace(regex, "");
        this.formData.comment = filteredValue;
      } else {
        // 如果没有表情符号，直接传递原始值
        this.$emit("input", value);
      }
    },
    /**
     * 提交撤销
     */
    handleCommitForm() {
      let that = this;
      let requestApiFun = function(requestApi, requestApiBasic) {
        // 获取查询参数
        //requestApiBasic.processId = that.procDefId;
        //let requestParams = {
        //  basicInformation: requestApiBasic,
        //  parameter: {
        //    taskId: that.procTaskId, // 流程任务ID
        //    comment: that.formData.comment, // 撤销原因
        //  }
        //};

        let requestParams = {
          processId: that.procDefId,
          taskId: that.procTaskId, // 流程任务ID
          comment: that.formData.comment || "同意", // 撤销原因
          processInstId: that.procInstId, // 流程实例ID
          procActId: that.procActId, //
          cosignItemCode: that.cosignItemCode, //
          cosignItemName: that.cosignItemName //
        };

        // 请求API
        that.loading = true; 
        let _requestApi;
        if (that.isOperationDispatch) {
          Object.assign(requestParams, {
            actionUserInfo: {
              userID: that.userId,
              userName: that.userName
            }
          });
          _requestApi = requestApi.withdrawTaskApi(requestParams);
        } else {
          _requestApi = requestApi.withdrawTask(requestParams);
        }
        _requestApi
          .then(res => {
            that.loading = false;
            if (res.status == 200 && res.data.code == 0) {
              // 提示成功，并关闭弹窗
              if (that.isPromptSuccess) {
                that.$message.success(
                  that.$t("cgnTask.tips.withdrawTaskSuccess")
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
          requestApiFun(ApiTask);
          // that.$emit("requestApi", requestApiFun);
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
