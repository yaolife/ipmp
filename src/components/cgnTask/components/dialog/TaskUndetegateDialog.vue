<template>
  <el-dialog
    v-loading="loading"
    :visible="isOpen"
    :title="$t('cgnTask.operate.undetegateTask')"
    width="640px"
    :destroy-on-close="true"
    :close-on-click-modal="false"
    :before-close="handleClose"
    class="task-dialog"
    v-dragMove="{ DragButton: '.el-dialog__header', DragWindow: '.el-dialog' }"
  >
    <!-- 取消委托表单 -->
    <el-form
      v-if="!loading && detegateUserOptions.length > 0"
      ref="editForm"
      size="small"
      label-suffix="："
      label-position="top"
      :model="formData"
      :rules="formRules"
      label-width="140px"
    >
      <el-row>
        <el-col :span="12">
          <!-- 已委托人 -->
          <el-form-item
            :label="$t('cgnTask.field.undetegateUser')"
            prop="assigneeIdList"
          >
            <el-checkbox-group v-model="formData.assigneeIdList">
              <el-checkbox
                v-for="item in detegateUserOptions"
                :key="item.userID"
                :label="item.userID"
                >{{ item.userName }}</el-checkbox
              >
            </el-checkbox-group>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <!-- 无委托人时显示 -->
    <div
      v-if="!loading && detegateUserOptions.length == 0"
      class="dialog-empty"
    >
      <el-link type="warning" :underline="false"
        ><i class="el-icon-warning-outline"></i
      ></el-link>
      <span>{{ $t("cgnTask.tips.detegateUserOptionsEmpty") }}</span>
    </div>

    <div slot="footer" class="dialog-footer" align="center">
      <el-button
        v-if="detegateUserOptions.length > 0"
        size="small"
        @click="handleClose"
        >{{ $t("cgnCommon.cancel") }}</el-button
      >
      <el-button
        v-if="detegateUserOptions.length == 0"
        size="small"
        @click="handleClose"
        >{{ $t("cgnCommon.close") }}</el-button
      >
      <el-button
        v-if="detegateUserOptions.length > 0"
        size="small"
        type="primary"
        @click="handleCommitForm"
        >{{ $t("cgnCommon.commit") }}</el-button
      >
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: "TaskDetegateDialog",
  props: {
    isOpen: { type: Boolean, default: false },
    isPromptSuccess: { type: Boolean, default: true }, // 是否提示成功信息
    procTaskId: { type: String, required: true } // 任务ID，必填
  },
  data() {
    return {
      loading: false,
      formData: {
        assigneeIdList: [] // 已委托人Id列表
      },
      formRules: {
        assigneeIdList: [
          {
            type: "array",
            required: true,
            message: this.$t("cgnTask.tips.undetegateUserNotEmpty"),
            trigger: "change"
          }
        ]
      },
      detegateUserOptions: [] // 已委托人选项
    };
  },
  mounted() {
    // 加载已委托人选项
    this.loadDetegateUserOptions();
  },
  methods: {
    /**
     * 加载已委托人选项
     */
    loadDetegateUserOptions() {
      let that = this;
      that.loading = true;
      that.$emit("requestApi", function(requestApi, requestApiBasic) {
        // 获取查询参数
        let requestParams = {
          parameter: { procTaskId: that.procTaskId }
        };

        requestApi
          .queryAssignorByProcId(requestParams.parameter)
          .then(res => {
            that.loading = false;
            if (res.status == 200 && res.data.code === "0") {
              that.detegateUserOptions = res.data.data;
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
     * 提交取消委托
     */
    handleCommitForm() {
      let that = this;

      // 整理勾选的委托人
      let assigneeIdList = that.formData.assigneeIdList;
      let assigneeList = [];
      for (let i = 0; i < assigneeIdList.length; i++) {
        assigneeList.push({ userID: assigneeIdList[i] });
      }

      let requestApiFun = function(requestApi, requestApiBasic) {
        // 获取查询参数
        let requestParams = {
          parameter: {
            procTaskId: that.procTaskId, // 任务ID
            assigneeList: assigneeList // 委托人
          }
        };

        // 请求API
        that.loading = true;
        requestApi
          .unDetegateTask(requestParams.parameter)
          .then(res => {
            that.loading = false;
            if (res.status == 200 && res.data.code === "0") {
              // 提示成功，并关闭弹窗
              if (that.isPromptSuccess) {
                that.$message.success(
                  that.$t("cgnTask.tips.undetegateTaskSuccess")
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
