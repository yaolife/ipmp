<template>
  <el-dialog
    v-loading="loading"
    :visible="isOpen"
    :title="$t('cgnTask.operate.readTask')"
    width="640px"
    v-dragMove="{ DragButton: '.el-dialog__header', DragWindow: '.el-dialog' }"
    :destroy-on-close="true"
    :close-on-click-modal="false"
    :before-close="handleClose"
    class="task-dialog"
  >
    <!-- 已阅表单 -->
    <el-form
      ref="editForm"
      size="small"
      label-suffix="："
      label-position="top"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-row>
        <el-col :span="24">
          <!-- 处理意见 -->
          <el-form-item :label="$t('cgnTask.field.readOpinion')">
            <!-- prop="description" -->
            <el-input
              v-model="formData.description"
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
import osUtil from "@/utils/osUtil";

/**
 * 作废弹窗
 */
export default {
  name: "TaskAbandonDialog",
  props: {
    isOpen: { type: Boolean, default: false },
    isPromptSuccess: { type: Boolean, default: true }, // 是否提示成功信息
    procTaskIds: { type: Array, required: true }, // 流程任务ID列表，必填
  },
  data() {
    return {
      loading: false,
      formData: {
        description: "", // 处理意见
      },
      formRules: {
        description: [
          {
            required: true,
            message: this.$t("cgnTask.tips.readOpinionNotEmpty"),
            trigger: "change",
          },
        ],
      },
    };
  },
  methods: {
    handleInput(value) {
      // 定义正则表达式，匹配表情符号
      const regex =
        /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/gi;
      // 检测是否有匹配的表情符号
      if (regex.test(value)) {
        // 替换表情符号为空字符串
        const filteredValue = value.replace(regex, "");
        this.formData.description = filteredValue;
      } else {
        // 如果没有表情符号，直接传递原始值
        this.$emit("input", value);
      }
    },
    /**
     * 提交已阅
     */
    handleCommitForm() {
      let that = this;
      let requestApiFun = function (requestApi, requestApiBasic) {
        // 获取查询参数
        let requestParams = {
          procTasks: that.procTaskIds, // 流程任务ID列表
          description: that.formData.description || "同意", // 处理意见
        };
        // 请求API
        that.loading = true;
        requestApi
          .completeTaskCC(requestParams)
          .then((res) => {
            that.loading = false;
            if (res.status == 200 && res.data.code == "0") {
              // 提示成功，并关闭弹窗
              if (that.isPromptSuccess) {
                that.$message.success(that.$t("cgnTask.tips.readTaskSuccess"));
              }
              //等提示框弹出后再关闭窗口
              let timer = setTimeout(() => {
                that.$emit("closeDialog", true, res.data);
                clearTimeout(timer);
                that.closeWindow();
              }, 1000);
            } else {
              that.$message.error(res.data.message);
            }
          })
          .catch((err) => {
            that.loading = false;
          });
      };
      // 若表单验证通过，则提交表单
      that.$refs.editForm.validate((valid) => {
        if (valid) {
          requestApiFun(ApiTask);
          // that.$emit("requestApi", requestApiFun);
        }
      });
    },
    //返回
    closeWindow() {
      if (osUtil.getBrowserInfo().browser.indexOf("IE") === 0) {
        history.back();
      } else {
        // 创建一个名为 "my_channel" 的广播频道
        const myChannel = new BroadcastChannel("my_channel");
        // 向该频道发送消息
        myChannel.postMessage("refreshOffice");
        // 当完成后断开与频道链接
        myChannel.close();
        if (osUtil.getBrowserInfoString() === "cgnLlq") {
          this.closeTab();
        } else {
          window.close();
        }
      }
    },
    /**
     * 关闭弹窗事件
     */
    handleClose() {
      this.$emit("closeDialog");
    },
  },
};
</script>
