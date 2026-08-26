<template>
  <el-dialog
    v-loading="loading"
    :visible="isOpen"
    :title="$t('cgnTask.operate.sendBackTask')"
    width="640px"
    :destroy-on-close="true"
    :close-on-click-modal="false"
    :before-close="handleClose"
    class="task-dialog"
    v-dragMove="{ DragButton: '.el-dialog__header', DragWindow: '.el-dialog' }"
  >
    <!-- 退回表单 -->
    <el-form
      ref="editForm"
      size="small"
      label-suffix="："
      label-position="top"
      :model="formData"
      :rules="formRules"
      :label-width="isEnLanguage ? '170px' : '120px'"
    >
      <el-row>
        <!--
        <el-col :span="12">
          当前环节
          <el-form-item :label="$t('cgnTask.field.currentProcAct')">
            <label class="el-form-item__label">{{currentProcAct | processName($i18n, 'procActName', 'procActEnName')}}</label>
          </el-form-item>
        </el-col>
        -->
        <el-col :span="12">
          <!-- 退回环节 -->
          <el-form-item
            :label="$t('cgnTask.field.sendBackProcAct')"
            prop="targetActId"
          >
            <el-select
              v-model="formData.targetActId"
              @change="onTargetActSelectChange"
              popper-class="targetActSelect"
            >
              <el-option
                v-for="item in goBackActOptions"
                :key="item.actID"
                :label="
                  $options.filters.processName(
                    item,
                    $i18n,
                    'actName',
                    'actEnName'
                  )
                "
                :value="item.actID"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <!-- 退回会签项（有可退回的会签项时显示） -->
          <!-- && formData.targetAct.approvalMode === 0 会签不显示问题 -->
          <el-form-item
            v-if="
              formData.targetAct &&
                formData.targetAct.cosignItemList &&
                formData.targetAct.cosignItemList.length > 0
            "
            :label="$t('cgnTask.field.sendBackCosignItem')"
            prop="cosignItemId"
          >
            <el-select
              v-model="formData.cosignItemId"
              @change="onCosignItemSelectChange"
            >
              <el-option
                v-for="item in formData.targetAct.cosignItemList"
                :key="item.code"
                :label="item.name"
                :value="item.code"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col v-if="formData.approvalAction == 0" :span="24">
          <!-- 处理人 -->
          <el-form-item
            :label="$t('cgnTask.field.sendBackUser')"
            prop="sendBackUsers"
          >
            <cgn-asc-person-select
              v-if="formData.sendBackUsers.length > 0"
              v-model="formData.sendBackUsers"
              :multiple="true"
              mode="tag"
              :disabledAddUser="disabledAddUser"
              :asc-url="ascUrl"
              :disabled="true"
              :props="{ userId: 'userID' }"
            ></cgn-asc-person-select>
          </el-form-item>
        </el-col>

        <el-col v-else :span="12">
          <el-form-item
            :label="$t('cgnTask.field.sendBackUser')"
            prop="sendBackUsersRadio"
          >
            <!-- <el-select
              v-model="formData.sendBackUsers"
              placeholder="请选择处理人"
              size="small"
            >
              <el-option
                v-for="item in formData.sendBackUsers"
                :key="item.userID"
                :label="item.userName"
                :value="item.userID"
              >
              </el-option>
            </el-select> -->
            <el-radio-group v-model="formData.sendBackUsersRadio">
              <el-radio
                v-for="item in formData.sendBackUsers"
                :label="item.userID"
                :key="item.userID"
                >{{ item.userName }}</el-radio
              >
            </el-radio-group>
          </el-form-item>
        </el-col>

          <!-- 处理人 -->
          <el-form-item
            v-else
            :label="$t('cgnTask.field.sendBackUser')"
            prop="sendBackUsers"
          >
            <cgn-asc-person-select
              v-if="formData.sendBackUsers.length > 0"
              v-model="formData.sendBackUsers"
              :multiple="true"
              mode="tag"
              :disabledAddUser="disabledAddUser"
              :asc-url="ascUrl"
              :disabled="true"
              :props="{ userId: 'userID' }"
            ></cgn-asc-person-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <!-- 退回方式 -->
          <el-form-item
            :label="$t('cgnTask.field.sendBackAction')"
            prop="approvalAction"
          >
            <el-radio-group
              v-model="formData.approvalAction"
              @change="onApprovalActionSelectChange"
              :disabled="approvalFlg"
            >
              <el-radio
                :label="0"
                v-if="!(approvalFlg && formData.approvalAction == 1)"
                >{{ $t("cgnTask.sendBackAction.forReApproval") }}</el-radio
              >
              <el-radio
                :label="1"
                v-if="!(approvalFlg && formData.approvalAction == 0)"
                >{{ $t("cgnTask.sendBackAction.forReturn") }}</el-radio
              >
            </el-radio-group>
          </el-form-item>
        </el-col>
        <!-- 邮件处理 -->
        <el-col :span="24">
          <el-form-item
            :label="$t('cgnTask.field.noticeMethods')"
            v-if="!emailMessageShow || !shortMessageShow || !dingMessageShow"
          >
            <el-checkbox-group
              v-model="formData.noticeMethods"
              @change="checkBoxChange"
            >
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
        <el-col :span="24" v-if="!isShowComment">
          <!-- 退回意见 -->
          <el-form-item
            :label="$t('cgnTask.field.sendBackOpinion')"
            prop="comment"
          >
            <el-input
              v-model="formData.comment"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 10 }"
              maxlength="200"
              show-word-limit
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
import * as Utils from "@/utils/Utils";
import osUtil from "@/utils/osUtil";
// import CgnAscPersonSelect from "@@/components/cgnPsc/cgnAsc/CgnAscPersonSelect";

export default {
  name: "TaskSendBackDialog",
  // components: { CgnAscPersonSelect },
  inject: [
    // 祖先组件注入参数
    "indexProvide" // Index注入参数 {procCategoryOptions: []}
  ],
  props: {
    isOpen: { type: Boolean, default: false },
    procInstId: { type: String, required: true }, // 流程实例ID，必填
    procActInstId: { type: String, required: true }, // 流程环节实例ID，必填
    procTaskId: { type: String, required: true }, // 任务ID，必填
    processId: { type: String, required: true },
    procVersion: { type: String, required: true },
    procActId: { type: String, required: true },
    procActName: { type: String, required: true },
    procActEnName: { type: String, required: true },
    approval: { type: Boolean, default: false },
    approvalAction: { type: Number, default: 0 },
    comment: { type: String, default: "" },
    attachment: { type: Array, default: () => [] },
    backActOptions: { type: Array },
    shortMessageShow: { type: Boolean, default: false },
    emailMessageShow: { type: Boolean, default: false },
    dingMessageShow: { type: Boolean, default: false },
    emailMessageTrue: { type: Boolean, default: false },
    shortMessageTrue: { type: Boolean, default: false },
    dingMessageTrue: { type: Boolean, default: false },
    isShowComment: { type: Boolean, default: false }, // 是否显示退回意见
    isOperationDispatch: { type: Boolean, default: false },
    modelRelation: { type: Array }, //数据模型映射
    newUserId: { type: String, default: "" },
    newUserName: { type: String, default: "" }
  },
  data() {
    return { 
      messageChecked: false,
      mailChecked: false,
      loading: false,
      isPromptSuccess: { type: Boolean, default: true }, // 是否提示成功信息
      isEnLanguage: Utils.isEnLanguage(this.$i18n), // 是否是英语
      ascUrl: envConfig.ASC_ROOT,
      currentProcAct: {
        // 当前环节信息
        id: "", // 环节实例ID
        procActId: "", // 环节ID
        procActName: "", // 环节名称
        procActEnName: "" // 环节英文名称
      },
      formData: {
        targetActId: "", // 退回环节ID
        targetAct: null, // 退回环节信息
        cosignItemId: "", // 退回会签项ID
        cosignItem: null, // 退回会签项信息
        sendBackUsers: [], // 退回处理人
        oldSendBackUsers: [],
        approvalAction: 0, // 退回方式
        comment: "", // 退回意见
        noticeMethods: [], //邮件
        sendBackUsersRadio:""
      },
      formRules: {
        targetActId: [
          {
            required: true,
            message: this.$t("cgnTask.tips.sendBackActNotEmpty"),
            trigger: "blur"
          }
        ],
        sendBackUsers: [
          {
            type: "array",
            required: true,
            message: this.$t("cgnTask.tips.sendBackUserNotEmpty"),
            trigger: "blur"
          }
        ],
        approvalAction: [
          {
            required: true,
            message: this.$t("cgnTask.tips.sendBackAction"),
            trigger: "blur"
          }
        ],
        comment: [
          {
            required: true,
            message: this.$t("cgnTask.tips.sendBackOpinionNotEmpty"),
            trigger: "change",
          },
        ],
        sendBackUsersRadio: [
          {
            required: true,
            message: this.$t("cgnTask.tips.sendBackUserNotEmpty"),
            trigger: "change",
          },
        ],
      },
      approvalFlg: false,
      ACT_TYPE: Utils.Constant.ACT_TYPE, // 环节类型
      goBackActOptions: [], // 可退回环节列表,
      disabledAddUser: false,
      userId: ""
    };
  },
  filters: {
    processName: Utils.Filters.processName
  },
  mounted() {
    // 加载可退回环节列表
    this.loadGoBackActOptions();
    // if (this.emailMessageTrue && this.shortMessageTrue) {
    //   this.formData.noticeMethods = ["1", "2"];
    // } else if (this.emailMessageTrue) {
    //   this.formData.noticeMethods = ["1"];
    // } else if (this.shortMessageTrue) {
    //   this.formData.noticeMethods = ["2"];
    // }
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
  watch: {
    /**
     * 切换语言时重新查询表单
     */
    "$i18n.locale"() {
      this.isEnLanguage = Utils.isEnLanguage(this.$i18n);
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
        this.formData.comment = filteredValue;
      } else {
        // 如果没有表情符号，直接传递原始值
        this.$emit("input", value);
      }
    },
    checkBoxChange() {},
    /**
     * 加载可退回环节列表
     */
    loadGoBackActOptions() {
      // 可通过父页面传入
      this.currentProcAct.id = this.procTaskId;
      this.currentProcAct.processId = this.processId;
      this.currentProcAct.procVersion = this.procVersion;
      this.currentProcAct.procActId = this.procActId;
      this.currentProcAct.procActName = this.procActName;
      this.currentProcAct.procActEnName = this.procActEnName;
      this.currentProcAct.procInstId = this.procInstId;
      this.currentProcAct.procActInstId = this.procActInstId;
      this.goBackActOptions = this.backActOptions;
      if (this.goBackActOptions.length === 1) {
        // 只有一个环节时默认选中
        this.formData.targetActId = this.goBackActOptions[0]["actID"];
        this.onTargetActSelectChange(this.formData.targetActId);
        // this.formData.sendBackUsers = this.goBackActOptions[0]['assigneeList'];
      }
      this.approvalFlg = this.approval;
      if (this.approvalAction === 2) {
        this.formData.approvalAction = 0;
      } else {
        this.formData.approvalAction = this.approvalAction;
      }
      //将审批意见的意见 显示在退回弹窗
      this.formData.comment = this.comment;
    },

    /**
     * 退回环节改变事件
     */
    onTargetActSelectChange(selectedActId) {
      // 获取当前选中退回环节
      let selectedItems = this.goBackActOptions.filter(function(item) {
        return item.actID == selectedActId;
      });
      let targetAct = selectedItems.length > 0 ? selectedItems[0] : null;

      // 更新当前选中退回环节信息，并清空当前选中退回会签项
      this.formData.targetAct = targetAct;
      this.formData.oldSendBackUsers = JSON.parse(
        JSON.stringify(targetAct.assigneeList)
      );
      this.userId = this.formData.oldSendBackUsers[0].userID;
      this.formData.cosignItemId = "";
      this.formData.cosignItem = null;
      if (selectedItems[0].procActType === 1) {
        this.disabledAddUser = true;
      } else {
        this.disabledAddUser = false;
      }
      // 重置退回处理人显示
      this.resetSendBackUsers();
    },

    /**
     * 退回会签项改变事件
     */
    onCosignItemSelectChange(selectedCosignItemCode) {
      // 获取当前选中退回会签项
      let selectedItems = this.formData.targetAct.cosignItemList.filter(
        function(item) {
          return item.code == selectedCosignItemCode;
        }
      );
      let cosignItem = selectedItems.length > 0 ? selectedItems[0] : null;

      // 更新当前选中退回会签项信息
      this.formData.cosignItem = cosignItem;
      // 重置退回处理人显示
      this.resetSendBackUsers();
    },

    /**
     * 退回方式选项改变事件
     */
    onApprovalActionSelectChange() {
      // 重置退回处理人显示
      this.resetSendBackUsers();
    },

    /**
     * 重置退回处理人显示
     */
    resetSendBackUsers() {
      let targetAct = this.formData.targetAct;
      let cosignItem = this.formData.cosignItem;
      let approvalAction = this.formData.approvalAction;
      // 根据选中退回节，更新退回处理人
      let sendBackUsers = [];
      if (targetAct) {
        // 若“当前环节类型是"普通环节" || 当前环节类型是"共享环节"”，处理人为环节处理人（会签环节处理人需选定会签项后指定）
        if (
          targetAct.procActType == this.ACT_TYPE.GENERAL ||
          targetAct.procActType == this.ACT_TYPE.SHARE
        ) {
          sendBackUsers =
            JSON.parse(JSON.stringify(targetAct.assigneeList)) || [];
          if (
            targetAct.procActType == this.ACT_TYPE.GENERAL &&
            approvalAction == 1
          ) {
            // “普通环节 && 退回方式为"退回后返回"”时，只显示第一个
            sendBackUsers =
              JSON.parse(JSON.stringify(targetAct.assigneeList)) || [];
            // sendBackUsers = sendBackUsers.slice(0, 1);
          }
        } else if (cosignItem) {
          // 根据选中退回会签项，更新退回处理人
          sendBackUsers =
            JSON.parse(JSON.stringify(cosignItem.cosignerList)) || [];
          this.formData.oldSendBackUsers = sendBackUsers;
          if (sendBackUsers && sendBackUsers.length > 0) {
            this.$set(this, "userId", sendBackUsers[0].userID);
          }
        }
      }

      // 强制刷新（避免选项切换时无法重置）
      this.formData.sendBackUsers = [];
      this.$nextTick(function() {
        if (approvalAction == 1) {
          this.formData.sendBackUsers = this.formData.oldSendBackUsers;
        } else {
          this.formData.sendBackUsers = sendBackUsers;
        }
      });
    },

    /**
     * 提交退回
     */
    handleCommitForm() {
      console.log(this.formData);
      let that = this;

      if (!this.formData.targetActId) {
        that.$message.warning("未选择退回环节");
      }
      let requestApiFun = function(requestApi, requestApiBasic, { processId }) {
        // 判断是否是同一会签环节的会签项之间退回
        let isSendBackInAct =
          that.currentProcAct.procActId == that.formData.targetActId;
        if (
          that.formData.targetAct.cosignItemList &&
          that.formData.targetAct.cosignItemList.length > 0
        ) {
          that.formData.targetAct.cosignItemList = [];
          that.formData.cosignItem.cosignerList = that.formData.sendBackUsers;
          that.formData.targetAct.cosignItemList.push(that.formData.cosignItem);
        }

        // 如果是会签环节,且是退回后返回
        if (
          that.formData.targetAct.procActType == 2 &&
          that.formData.approvalAction == 1
        ) {
          let sendPerson = [];
          that.formData.oldSendBackUsers.forEach(item => {
            if (that.userId == item.userID) {
              sendPerson.push(item);
            }
          });
          that.formData.cosignItem.cosignerList = sendPerson[0];
          that.formData.targetAct.cosignItemList = [];
          that.formData.targetAct.cosignItemList = that.formData.cosignItem;
          // that.formData.targetAct.cosignItemList = sendPerson;
        }

        //  如果选择的是退回后返回,只能选择一个人返回
        if (
          that.formData.targetAct.procActType == that.ACT_TYPE.GENERAL &&
          that.formData.approvalAction == 1
        ) {
          let sendArr = [];
          that.formData.sendBackUsers.forEach((item) => {
            if (item.userID === that.formData.sendBackUsersRadio) {
              sendArr.push(item);
            }
          });
          that.formData.targetAct.assigneeList = sendArr;
        } else {
          that.formData.targetAct.assigneeList = that.formData.sendBackUsers;
        }
        // 获取查询参数
        let requestParams = {
          processId: that.processId,
          procInstId: that.procInstId,
          taskId: that.procTaskId, // 任务id
          approvalAction: that.formData.approvalAction, // 退回方式
          comment: that.formData.comment, // 审批意见
          actId: that.currentProcAct.procActId,
          actName: that.currentProcAct.procActName,
          targetActList: [that.formData.targetAct], // 目标环节列表（目前只支持一笔）
          cosignItem: that.formData.cosignItem, // 退回会签项
          ccList: [], // 抄送人列表
          noticeMethods:
            that.formData.noticeMethods &&
            that.formData.noticeMethods.length > 0
              ? that.formData.noticeMethods.join(",")
              : "", // 通知方式
          attachment: that.attachment,
          // 退回增加数据模型
          modelRelation: that.modelRelation
        };

        let requestApiMethod;
        if (that.isOperationDispatch) {
          Object.assign(requestParams, {
            actionUserInfo: {
              userID: that.newUserId,
              userName: that.newUserName
            }
          });
          requestApiMethod = requestApi.sendBackApi(requestParams);
        } else {
          requestApiMethod = requestApi.sendBack(requestParams);
        }
        // 请求API
        that.loading = true;
        requestApiMethod
          .then(res => {
            that.loading = false;
            if (res.status == 200 && res.data.code == 0) {
              // 提示成功，并关闭弹窗
              if (that.isPromptSuccess) {
                that.$message.success(
                  that.$t("cgnTask.tips.sendBackTaskSuccess")
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
    },
    changeUserId() {
      let flag = false;
      let arr = [];
      this.formData.oldSendBackUsers.forEach(item => {
        if (item.userID === this.userId || flag) {
          flag = true;
          arr.push(item);
        }
      });
      this.formData.sendBackUsers = arr;
    }
  }
};
</script>
<style lang="less" scoped>
/deep/ .el-textarea__inner {
  height: auto;
  min-height: 68px !important;
}
</style>
