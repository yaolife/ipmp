<template>
  <div>
    <el-dialog
      v-loading="loading"
      :visible="isOpen"
      :title="$t('cgnTask.operate.detegateTask')"
      width="640px"
      :destroy-on-close="true"
      :close-on-click-modal="false"
      :before-close="handleClose"
      class="task-dialog"
      v-dragMove="{
        DragButton: '.el-dialog__header',
        DragWindow: '.el-dialog'
      }"
    >
      <span slot="title" class="el-dialog__title">
        {{ $t("cgnTask.operate.detegateTask") }}
        <el-popover
          placement="top-start"
          width="250"
          trigger="hover"
          content="将任务委托给其他人，处理人跟委托人都会有这条待办任务，在待办列表中委托任务会显示委托标识。"
        >
          <i class="el-icon-question" slot="reference"></i>
        </el-popover>
      </span>
      <!-- 委托表单 -->
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
          <el-col :span="12">
            <!-- 委托人 -->
            <el-form-item
              :label="$t('cgnTask.field.detegateUser')"
              prop="detegateUserList"
            >
              <el-input
                ref="input"
                :title="formData.detegateUser"
                v-model="formData.detegateUser"
                :placeholder="$t('el.select.placeholder')"
                name="personSelect"
                id="detegateUser"
                :disabled="true"
                class="form-input"
                @focus="openCreatorFunc"
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
              <!--<cgn-asc-person-select v-model="formData.detegateUserList" :multiple="false" :asc-url="ascUrl"
                                  :props="{userId: 'userID'}" @change="onDetegateUserSelect"></cgn-asc-person-select>-->
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <!-- 委托意见 -->
            <el-form-item :label="$t('cgnTask.field.detegateOpinion')">
              <!-- prop="approvalComment" -->
              <el-input
                v-model="formData.approvalComment"
                type="textarea"
                :row="3"
                maxlength="160"
                show-word-limit
                placeholder="同意"
                @input="handleInput"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item :label="$t('cgnTask.field.noticeMethods')">
              <el-checkbox-group size="small" v-model="formData.noticeMethods">
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
          <el-button size="small" @click="closeCreatorFunc">{{
            $t("cm.cancel")
          }}</el-button>
          <el-button size="small" type="primary" @click="commitCreatorFunc">{{
            $t("cm.commit")
          }}</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
// import CgnAscPersonSelect from '@@/components/cgnPsc/cgnAsc/CgnAscPersonSelect';
// import wfCommPersonComponent from "@@/components/cudCommPersonComponent/wfCommPersonComponent.vue";
import ApiTask from "../../common/ApiTask";
export default {
  name: "TaskDetegateDialog",
  // components: { "wf-comm-person-component": wfCommPersonComponent },
  // inject: [
  //   // 祖先组件注入参数
  //   "indexProvide" // Index注入参数 {procCategoryOptions: []}
  // ],
  props: {
    isOpen: { type: Boolean, default: false },
    isPromptSuccess: { type: Boolean, default: true }, // 是否提示成功信息
    procTaskId: { type: String, required: true }, // 任务ID，必填
    procActId: { type: String, required: true }, // 环节ID，必填
    procInstId: { type: String, required: true }, // 流程实例ID，必填
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
      ascUrl: envConfig.ASC_ROOT,
      initUserId: "",
      formData: {
        detegateUser: "", // 显示委托人
        detegateUserList: [], // 委托人列表
        approvalComment: "", // 委托意见
        noticeMethods: [] //通知方式
      },
      formRules: {
        detegateUserList: [
          {
            type: "array",
            required: true,
            message: this.$t("cgnTask.tips.detegateUserNotEmpty")
          }
        ],
        approvalComment: [
          {
            required: true,
            message: this.$t("cgnTask.tips.detegateOpinionNotEmpty"),
            trigger: "change"
          }
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
        this.formData.approvalComment = filteredValue;
      } else {
        // 如果没有表情符号，直接传递原始值
        this.$emit("input", value);
      }
    },
    /**
     * 提交委托
     */
    handleCommitForm() {
      let that = this;
      let requestApiFun = function(requestApi, requestApiBasic) {
        // 获取查询参数
        let requestParams = {
          basicInformation: requestApiBasic,
          parameter: {
            procTaskId: that.procTaskId, // 任务ID
            approvalComment: that.formData.approvalComment || "同意", // 转办意见
            assigneeList: that.formData.detegateUserList, // 委托人
            procInsID: that.procInstId, // 流程实例ID
            actId: that.procActId, // 环节ID
            noticeMethods:
              that.formData.noticeMethods &&
              that.formData.noticeMethods.length > 0
                ? that.formData.noticeMethods.join(",")
                : "" // 通知方式
          }
        };

        // 请求API
        that.loading = true;
        let _requestApi;
        if (that.isOperationDispatch) {
          Object.assign(requestParams.parameter, {
            actionUserInfo: {
              userID: that.userId,
              userName: that.userName
            }
          });
          _requestApi = requestApi.detegateTaskApi(requestParams.parameter);
        } else {
          _requestApi = requestApi.detegateTask(requestParams.parameter);
        }
        _requestApi
          .then(res => {
            that.loading = false;
            if (res.status == 200 && res.data.code == 0) {
              // 提示成功，并关闭弹窗
              if (that.isPromptSuccess) {
                that.$message.success(
                  that.$t("cgnTask.tips.detegateTaskSuccess")
                );
                that.$emit("successFn", that.procTaskId);
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
          let basicInfo = {
            tenantID: this.tenantId,
            appId: this.appId,
            actionUserInfo: this.actionUserInfo
          };
          requestApiFun(ApiTask, basicInfo);
          // that.$emit("requestApi", requestApiFun);
        }
      });
    },
    onDetegateUserSelect() {},
    /**
     * 关闭弹窗事件
     */
    handleClose() {
      this.$emit("closeDialog");
    },
    // 打开委托人模态框
    openCreatorFunc() {
      this.showDialog = true;
    },
    // 关闭委托人模态框
    closeCreatorFunc() {
      this.showDialog = false;
    },
    // 选委托人回调
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
            this.formData.detegateUserList = [];
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
              this.formData.detegateUserList.push(participantData);
            }
            this.initUserId = ids;
            this.formData.detegateUser = users;
          }
        }
      }
      this.showDialog = false;
    }
  }
};
</script>
