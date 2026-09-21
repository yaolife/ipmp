<template>
  <div>
    <el-dialog
      v-loading="loading"
      :visible="isOpen"
      :title="$t('cgnTask.operate.ccTask')"
      width="640px"
      v-dragMove="{
        DragButton: '.el-dialog__header',
        DragWindow: '.el-dialog'
      }"
      :destroy-on-close="true"
      :close-on-click-modal="false"
      :before-close="handleClose"
      class="task-dialog"
    >
      <!-- 抄送表单 -->
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
          <el-col :span="12">
            <!-- 抄送人 -->
            <el-form-item :label="$t('cgnTask.field.ccUser')" prop="ccUserList">
              <el-input
                ref="input"
                :title="formData.ccUser"
                v-model="formData.ccUser"
                :placeholder="$t('el.select.placeholder')"
                name="personSelect"
                id="ccUser"
                :disabled="true"
                @focus="openCreatorFunc"
                class="form-input"
              >
                <el-button
                  type="primary"
                  class="el-button--half"
                  size="small"
                  slot="append"
                  icon="el-icon-plus"
                  @click="openCreatorFunc"
                ></el-button>
              </el-input>
              <!-- <cgn-asc-person-select v-model="formData.ccUserList" :multiple="true" :asc-url="ascUrl"
                                  :props="{userId: 'userID'}"></cgn-asc-person-select> -->
            </el-form-item>
          </el-col>
          <el-col :span="12">
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
          <el-col :span="24">
            <!-- 抄送意见 -->
            <el-form-item :label="$t('cgnTask.field.ccOpinion')">
              <!-- prop="description" -->
              <el-input
                v-model="formData.description"
                type="textarea"
                :row="4"
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
    <div class="wfCommPersonComponentDialog">
      <el-dialog
        width="60%"
        :visible.sync="showDialog"
        v-if="showDialog"
        custom-class="process-creator-dialog"
        :modal="false"
        :destory-on-close="true"
        :title="$t('el.select.placeholder')"
        :close-on-click-modal="false"
        v-dragMove="{
          DragButton: '.el-dialog__header',
          DragWindow: '.el-dialog'
        }"
      >
        <div class="el-dialog-div">
          <wf-comm-person-component
            ref="wfCommPersonComponentId"
            :show-user-group-tab="false"
            :showDynRoleTab="false"
            :showStationTab="false"
            :showOrgTab="false"
            :showUserMultiple="true"
            :showCheckbox="false"
            :initUserId="initUserId"
          ></wf-comm-person-component>
        </div>
        <div slot="footer" class="dialog-footer" align="center">
          <el-button @click="closeCreatorFunc" size="small">{{
            $t("cm.cancel")
          }}</el-button>
          <!-- 确定 -->
          <el-button type="primary" @click="commitCreatorFunc" size="small">{{
            $t("cm.confirm")
          }}</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
// import CgnAscPersonSelect from '@/components/cgnPsc/cgnAsc/CgnAscPersonSelect';
// import wfCommPersonComponent from "@@/components/cudCommPersonComponent/wfCommPersonComponent.vue";
import ApiTask from "../../common/ApiTask";
export default {
  name: "TaskCcDialog",
  // inject: [
  //   // 祖先组件注入参数
  //   "indexProvide" // Index注入参数 {procCategoryOptions: []}
  // ],
  props: {
    isOpen: { type: Boolean, default: false },
    isPromptSuccess: { type: Boolean, default: true }, // 是否提示成功信息
    procInstId: { type: String, required: true }, // 流程实例ID，必填
    procActInstId: { type: String, required: true }, // 流程环节实例ID，必填
    procTaskId: { type: String, required: true }, // 任务ID，必填
    procActId: { type: String, required: true }, // 环节ID，必填
    shortMessageShow: { type: Boolean, default: false },
    emailMessageShow: { type: Boolean, default: false },
    dingMessageShow: { type: Boolean, default: false },
    emailMessageTrue: { type: Boolean, default: false },
    shortMessageTrue: { type: Boolean, default: false },
    dingMessageTrue: { type: Boolean, default: false },
    isOperationDispatch: { type: Boolean, default: false },
    userId: { type: String, default: "" },
    userName: { type: String, default: "" }
  },
  data() {
    return {
      loading: false,
      showDialog: false,
      // ascUrl: process.env.ASC_ROOT,
      initUserId: "",
      formData: {
        ccUser: "", // 显示抄送人
        ccUserList: [], // 抄送人列表
        description: "", // 抄送意见
        noticeMethods: [] // 通知方式
      },
      formRules: {
        ccUserList: [
          {
            type: "array",
            required: true,
            message: this.$t("cgnTask.tips.ccUserNotEmpty")
          }
        ],
        description: [
          {
            required: true,
            message: this.$t("cgnTask.tips.ccOpinionNotEmpty"),
            trigger: "change"
          }
        ]
      },
      options: {
        ccOpinion: [
          "标签1",
          "标签2",
          "标签3",
          "标签4",
          "标签5",
          "标签6",
          "标签7",
          "标签8",
          "标签9",
          "标签10"
        ]
      }
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
      const regex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/gi;
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
     * 提交抄送
     */
    handleCommitForm() {
      let that = this;
      let requestApiFun = function(requestApi) {
        // 获取查询参数
        let requestParams = {
          procInsID: that.procInstId, // 流程实例ID
          procActInstId: that.procActInstId, // 流程环节实例ID
          procTaskId: that.procTaskId, // 任务ID
          description: that.formData.description || "同意",
          ccList: that.formData.ccUserList,
          actId: that.procActId, // 环节ID
          noticeMethods:
            that.formData.noticeMethods &&
            that.formData.noticeMethods.length > 0
              ? that.formData.noticeMethods.join(",")
              : "" // 通知方式
        };

        // 请求API
        that.loading = true;
        let _requestApi;
        if (that.isOperationDispatch) {
          Object.assign(requestParams, {
            ccUserInfo: {
              userID: that.userId,
              userName: that.userName
            }
          });
          _requestApi = requestApi.createTaskCCApi(requestParams);
        } else {
          _requestApi = requestApi.createTaskCC(requestParams);
        }
        _requestApi
          .then(res => {
            that.loading = false;
            if (res.status == 200 && res.data.code == 0) {
              // 提示成功，并关闭弹窗
              if (that.isPromptSuccess) {
                that.$message.success(that.$t("cgnTask.tips.ccTaskSuccess"));
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
    },

    // 打开抄送人模态框
    openCreatorFunc() {
      this.showDialog = true;
    },
    // 关闭抄送人模态框
    closeCreatorFunc() {
      this.showDialog = false;
    },
    // 选抄送人回调
    commitCreatorFunc() {
      let userData = [];
      let creatorData = this.$refs.wfCommPersonComponentId.getData();
      if (creatorData) {
        userData = creatorData.get("userData");
        if (userData && userData.length > 0) {
          // 判断用户信息是否为空，不为空才插入数据
          if (
            userData[1] &&
            userData[1].length === 2 &&
            userData[1][0] !== ""
          ) {
            let userDataIdsStr = userData[1][0];
            let userDataNamesStr = userData[1][1];
            let userDataIds = userDataIdsStr.split(";");
            let userDataNames = userDataNamesStr.split(";");
            let ids = "";
            let users = "";
            this.formData.ccUserList = [];
            for (let i = 0; i < userDataIds.length; i++) {
              ids += (i === 0 ? "" : ",") + userDataIds[i];
              users +=
                (i === 0 ? "" : ",") +
                "[" +
                userDataIds[i] +
                "]" +
                userDataNames[i];
              // 判断发起人的表格中是否存在添加过来的人
              let participantData = {};
              participantData.userID = userDataIds[i];
              participantData.userName = userDataNames[i];
              this.formData.ccUserList.push(participantData);
            }
            this.initUserId = ids;
            this.formData.ccUser = users;
          }
        }
      }
      this.showDialog = false;
    }
  }
};
</script>
<style lang="less" scoped></style>
