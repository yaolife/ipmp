<template>
  <el-dialog
    v-loading="loading"
    :visible.sync="isOpen"
    :title="$t('cgnTask.operate.remindTask')"
    width="640px"
    v-dragMove="{ DragButton: '.el-dialog__header', DragWindow: '.el-dialog' }"
    :destroy-on-close="true"
    :close-on-click-modal="false"
    :before-close="handleClose"
    class="task-dialog"
  >
    <!-- 催办 -->
    <el-form
      ref="editForm"
      size="small"
      label-suffix="："
      label-position="top"
      :model="formData"
      :rules="formRules"
      label-width="120px"
    >
      <el-row>
        <el-col :span="24">
          <!-- 审批人 -->
          <el-form-item :label="$t('cgnTask.field.remindUser')">
            <el-tag
              v-for="(user, userIndex) in remindUserList"
              :key="userIndex"
              effect="plain"
              :closable="false"
              class="user-tag"
            >
              <el-checkbox v-model="user.isCheck"></el-checkbox>
              [{{ user.userID }}]{{ user.userName }}
            </el-tag>
          </el-form-item>
        </el-col>
        <el-col>
          <el-form-item
            v-if="!emailMessageShow || !shortMessageShow || !dingMessageShow"
            :label="$t('cgnTask.field.noticeMethods')"
          >
            <el-checkbox-group v-model="formData.noticeMethods">
              <el-checkbox label="1" v-if="!emailMessageShow">{{
                $t("cgnTask.field.emailMessage")
              }}</el-checkbox>
              <el-checkbox label="2" v-if="!shortMessageShow">{{
                $t("cgnTask.field.shortMessage")
              }}</el-checkbox>
              <el-checkbox label="3" v-if="!dingMessageShow">{{
                $t("flow.dingMessage")
              }}</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-col>
        <!-- 邮件 -->
        <el-col :span="24">
          <!-- 催办原因 -->
          <el-form-item :label="$t('cgnTask.field.remindOpinion')">
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
// import CgnAscPersonSelect from "@@/components/cgnPsc/cgnAsc/CgnAscPersonSelect";
export default {
  name: "TaskRemindDialog",
  // components: { CgnAscPersonSelect },
  props: {
    isOpen: { type: Boolean, default: false },
    isPromptSuccess: { type: Boolean, default: true }, // 是否提示成功信息
    procInstId: { type: String, required: true }, // 流程实例ID，必填
    remindUserList: { type: Array, required: true },
    procActId: { type: String, required: true }, // 环节ID，必填
    shortMessageShow: { type: Boolean, default: false },
    emailMessageShow: { type: Boolean, default: false },
    dingMessageShow: { type: Boolean, default: false },
    emailMessageTrue: { type: Boolean, default: false },
    shortMessageTrue: { type: Boolean, default: false },
    dingMessageTrue: { type: Boolean, default: false },
  },
  data() {
    return {
      loading: false,
      formData: {
        remindUserList: [],
        description: "", // 催办原因
        noticeMethods: ["1"], //邮件
      },
      formRules: {
        description: [
          {
            required: true,
            message: this.$t("cgnTask.tips.remindOpinionNotEmpty"),
            trigger: "change",
          },
        ],
      },
    };
  },
  mounted() {
    if (
      this.emailMessageTrue &&
      this.shortMessageTrue &&
      this.dingMessageTrue
    ) {
      this.formData.noticeMethods = ["1", "2", "3"];
    } else if (this.emailMessageTrue && this.shortMessageTrue) {
      this.formData.noticeMethods = ["1", "2"];
    } else if (this.shortMessageTrue && this.dingMessageTrue) {
      this.formData.noticeMethods = ["2", "3"];
    } else if (this.emailMessageTrue && this.dingMessageTrue) {
      this.formData.noticeMethods = ["1", "3"];
    } else if (this.emailMessageTrue) {
      this.formData.noticeMethods = ["1"];
    } else if (this.shortMessageTrue) {
      this.formData.noticeMethods = ["2"];
    } else if (this.dingMessageTrue) {
      this.formData.noticeMethods = ["3"];
    }
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
     * 提交催办
     */
    handleCommitForm() {
      let remindUsers = [];
      this.remindUserList.forEach((item) => {
        if (item.isCheck) {
          remindUsers.push(item);
        }
      });
      if (remindUsers.length == 0) {
        this.$message.error(this.$t("cgnTask.tips.remindUserNotEmpty"));
        return;
      }
      let that = this;
      let requestApiFun = function (requestApi, requestApiBasic) {
        // 获取查询参数
        let requestParams = {
          description: that.formData.description || "同意",
          remindUsers: remindUsers,
          actId: that.procActId,
          procInsID: that.procInstId,
          noticeMethods:
            that.formData.noticeMethods &&
            that.formData.noticeMethods.length > 0
              ? that.formData.noticeMethods.join(",")
              : "", // 通知方式
        };

        // 请求API
        that.loading = true;
        requestApi
          .sendRemind(requestParams)
          .then((res) => {
            that.loading = false;
            if (res.status == 200 && res.data.code == 0) {
              // 提示成功，并关闭弹窗
              if (that.isPromptSuccess) {
                that.$message.success(
                  that.$t("cgnTask.tips.remindTaskSuccess")
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

    /**
     * 关闭弹窗事件
     */
    handleClose() {
      this.$emit("closeDialog");
    },
  },
};
</script>
