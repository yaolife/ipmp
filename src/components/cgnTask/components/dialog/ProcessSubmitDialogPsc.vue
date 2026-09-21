<template>
  <el-dialog
    v-loading="loading"
    :visible="isOpen"
    :title="$t('cgnTask.operate.submitProcess')"
    width="1000px"
    :destroy-on-close="true"
    :close-on-click-modal="false"
    :before-close="handleClose"
    class="task-dialog task-submit-dialog body-scroll-dialog"
    v-dragMove="{ DragButton: '.el-dialog__header', DragWindow: '.el-dialog' }"
  >
    <!-- 目标环节为空 -->
    <div
      v-if="!loading && formData.targetActList.length == 0"
      class="dialog-empty"
    >
      <el-link type="warning" :underline="false"
        ><i class="el-icon-warning-outline"></i
      ></el-link>
      <span>{{ $t("cgnTask.tips.submitTargetActEmpty") }}</span>
    </div>

    <el-form
      v-if="formData.targetActList.length > 0"
      ref="editForm"
      size="small"
      :label-width="isEnLanguage ? '180px' : '120px'"
      :model="formData"
      :rules="formRules"
      :show-message="true"
    >
      <!-- 目标环节 -->
      <div class="act-warpper">
        <div class="act-warpper__header">
          {{ $t("cgnTask.field.targetAct") }}
        </div>
        <div class="act-warpper__body">
          <!-- 目标环节编辑 -->
          <el-tabs v-model="formData.currentTargetAct" type="card">
            <el-tab-pane
              v-for="(item, itemIndex) in formData.targetActList"
              :label="
                $options.filters.processName(
                  item,
                  $i18n,
                  'actName',
                  'actEnName'
                )
              "
              :key="itemIndex"
              :name="itemIndex.toString()"
            >
              <!-- 会签项表单 -->
              <div v-if="getProcActType(item.actID) == ACT_TYPE.COSIGN">
                <!-- 会签项Table：环节类型是“会签类型”时显示 -->
                <el-table :data="item.cosignItemList.slice(0, 1)" border>
                  <el-table-column
                    :label="$t('cgnTask.field.index')"
                    type="index"
                    header-align="center"
                    align="center"
                    width="50"
                  ></el-table-column>
                  <el-table-column
                    :label="$t('cgnTask.field.cosignUser')"
                    header-align="center"
                  >
                    <template slot-scope="scope">
                      <el-form-item
                        label-width="0"
                        :prop="
                          'targetActList.' +
                            itemIndex +
                            '.cosignItemList.' +
                            scope.$index +
                            '.cosignerList'
                        "
                        :rules="
                          formRules['targetActList.cosignItemList.cosignerList']
                        "
                      >
                        <cgn-asc-person-select
                          v-model="scope.row.cosignerList"
                          :multiple="true"
                          mode="tag"
                          :disabled="modifyAssignee == false"
                          :asc-url="indexProvide.ascUrl"
                          :props="{ userId: 'userID' }"
                        >
                        </cgn-asc-person-select>
                      </el-form-item>
                    </template>
                  </el-table-column>
                  <el-table-column
                    :label="$t('cgnTask.field.cosignItem')"
                    header-align="center"
                    width="250"
                    prop="name"
                  ></el-table-column>
                </el-table>

                <!-- 会签项信息：环节类型是“会签类型”时显示 -->
                <div style="display: flex; line-height: 42px;">
                  <div class="dialog-info" style="flex: 1;">
                    <el-button type="text"
                      ><i class="el-icon-info"></i
                    ></el-button>
                    <span v-if="item.approvalMode == '0'">{{
                      $t("cgnTask.approvalMode.singleDesc")
                    }}</span>
                    <span v-if="item.approvalMode == '1'">{{
                      $t("cgnTask.approvalMode.parallelDesc")
                    }}</span>
                  </div>
                  <div v-if="item.cosignItemList.length > 1">
                    <el-button
                      type="text"
                      @click="openOtherCosignDialog(item.cosignItemList)"
                      >{{
                        $t("cgnTask.operate.viewOtherCosignItem")
                      }}</el-button
                    >
                  </div>
                </div>
              </div>

              <!-- 处理人：环节类型是“普通环节”时显示 -->
              <el-form-item
                v-if="getProcActType(item.actID) == ACT_TYPE.GENERAL"
                :label="$t('cgnTask.field.submitUser') + $t('cgnCommon.colon')"
                :prop="'targetActList.' + itemIndex + '.assigneeList'"
                :rules="formRules['targetActList.assigneeList']"
              >
                <cgn-asc-person-select
                  v-model="item.assigneeList"
                  :multiple="true"
                  :asc-url="indexProvide.ascUrl"
                  :props="{ userId: 'userID' }"
                ></cgn-asc-person-select>
              </el-form-item>

              <!-- 共享类别：环节类型是“共享环节”时显示 -->
              <el-form-item
                v-if="getProcActType(item.actID) == ACT_TYPE.SHARE"
                :label="$t('cgnTask.field.shareType') + $t('cgnCommon.colon')"
                :prop="'targetActList.' + itemIndex + '.shareType'"
                :rules="formRules['targetActList.shareType']"
              >
                <el-input v-model="item.shareType"></el-input>
              </el-form-item>
            </el-tab-pane>
          </el-tabs>

          <div style="margin-top: 15px;">
            <!-- 主题(发起时填写) -->
            <el-form-item
              v-if="isStartProcess"
              :label="$t('cgnTask.field.procSubject') + $t('cgnCommon.colon')"
              prop="subject"
            >
              <el-input v-model="formData.subject"></el-input>
            </el-form-item>
            <!-- 添加抄送人 -->
            <el-form-item
              :label="$t('cgnTask.field.ccUser') + $t('cgnCommon.colon')"
              prop="ccList"
            >
              <cgn-asc-person-select
                v-model="formData.ccList"
                :multiple="true"
                :asc-url="indexProvide.ascUrl"
                :props="{ userId: 'userID' }"
              ></cgn-asc-person-select>
            </el-form-item>
            <!-- 审批意见(提交时填写) -->
            <el-form-item
              v-if="!isStartProcess"
              :label="$t('cgnTask.field.submitOpinion') + $t('cgnCommon.colon')"
              prop="comment"
            >
              <el-input
                v-model="formData.comment"
                type="textarea"
                maxlength="160"
                show-word-limit
              ></el-input>
            </el-form-item>
          </div>
        </div>
      </div>

      <!-- 可编辑环节 -->
      <div class="act-warpper" v-if="formData.actAssigneeInfoList.length > 0">
        <div class="act-warpper__header">
          {{ $t("cgnTask.field.editableAct") }}
        </div>
        <div class="act-warpper__body">
          <!-- 可编辑环节编辑 -->
          <el-tabs v-model="formData.currentEditableAct" type="card">
            <el-tab-pane
              v-for="(item, itemIndex) in formData.actAssigneeInfoList"
              :label="
                $options.filters.processName(
                  item,
                  $i18n,
                  'actName',
                  'actEnName'
                )
              "
              :key="itemIndex"
              :name="itemIndex.toString()"
            >
              <!-- 会签项表单 -->
              <div v-if="getProcActType(item.actID) == ACT_TYPE.COSIGN">
                <!-- 会签项Table：环节类型是“会签类型”时显示 -->
                <el-table :data="item.cosignItemList" border>
                  <el-table-column
                    :label="$t('cgnTask.field.index')"
                    type="index"
                    header-align="center"
                    align="center"
                    width="50"
                  ></el-table-column>
                  <el-table-column
                    :label="$t('cgnTask.field.cosignUser')"
                    header-align="center"
                  >
                    <template slot-scope="scope">
                      <el-form-item
                        label-width="0"
                        :prop="
                          'actAssigneeInfoList.' +
                            itemIndex +
                            '.cosignItemList.' +
                            scope.$index +
                            '.cosignerList'
                        "
                        :rules="
                          formRules[
                            'actAssigneeInfoList.cosignItemList.cosignerList'
                          ]
                        "
                      >
                        <cgn-asc-person-select
                          v-model="scope.row.cosignerList"
                          :multiple="true"
                          mode="tag"
                          :disabled="modifyAssignee == false"
                          :asc-url="indexProvide.ascUrl"
                          :props="{ userId: 'userID' }"
                        >
                        </cgn-asc-person-select>
                      </el-form-item>
                    </template>
                  </el-table-column>
                  <el-table-column
                    :label="$t('cgnTask.field.cosignItem')"
                    header-align="center"
                    width="250"
                  >
                    <div slot-scope="scope">
                      <el-form-item
                        label-width="0"
                        :prop="
                          'actAssigneeInfoList.' +
                            itemIndex +
                            '.cosignItemList.' +
                            scope.$index +
                            '.name'
                        "
                        :rules="
                          formRules['actAssigneeInfoList.cosignItemList.name']
                        "
                      >
                        <el-input
                          v-model="scope.row.name"
                          :placeholder="
                            $t('cgnTask.tips.submitCosignItemNotEmpty')
                          "
                        ></el-input>
                      </el-form-item>
                    </div>
                  </el-table-column>
                  <el-table-column
                    :label="$t('cgnCommon.operate')"
                    header-align="center"
                    width="150"
                    class-name="cosign-oprate"
                  >
                    <div slot-scope="scope">
                      <!-- 上移/下移 -->
                      <div class="btn-top-down-group">
                        <el-button
                          type="text"
                          icon="el-icon-caret-top"
                          :title="$t('cgnTask.operate.moveUp')"
                          :disabled="scope.$index == 0"
                          @click="
                            onSwapCosignItem(
                              item,
                              scope.$index,
                              scope.$index - 1
                            )
                          "
                        ></el-button>
                        <el-button
                          type="text"
                          icon="el-icon-caret-bottom"
                          :title="$t('cgnTask.operate.moveDown')"
                          :disabled="
                            scope.$index == item.cosignItemList.length - 1
                          "
                          @click="
                            onSwapCosignItem(
                              item,
                              scope.$index,
                              scope.$index + 1
                            )
                          "
                        ></el-button>
                      </div>
                      <!-- 添加会签项 -->
                      <el-button
                        type="text"
                        icon="el-icon-circle-plus-outline"
                        :title="$t('cgnTask.operate.addCosignItem')"
                        @click="
                          onAddOrRemoveCosignItem(item, scope.$index, true)
                        "
                      ></el-button>
                      <!-- 删除会签项 -->
                      <el-button
                        type="text"
                        class="danger"
                        icon="el-icon-delete"
                        :title="$t('cgnTask.operate.removeCosignItem')"
                        :disabled="item.cosignItemList.length < 2"
                        @click="
                          onAddOrRemoveCosignItem(item, scope.$index, false)
                        "
                      ></el-button>
                    </div>
                  </el-table-column>
                </el-table>

                <!-- 会签项信息：环节类型是“会签类型”时显示 -->
                <div style="line-height: 42px;">
                  <!-- 环节审批方式 0串行,1并行 -->
                  <el-checkbox
                    v-model="item.approvalMode"
                    :true-label="0"
                    :false-label="1"
                    >{{ $t("cgnTask.approvalMode.singleDesc") }}</el-checkbox
                  >
                </div>
              </div>

              <!-- 处理人：环节类型是“普通环节”时显示 -->
              <el-form-item
                v-if="getProcActType(item.actID) == ACT_TYPE.GENERAL"
                :label="$t('cgnTask.field.submitUser') + $t('cgnCommon.colon')"
                :prop="'actAssigneeInfoList.' + itemIndex + '.assigneeList'"
                :rules="formRules['actAssigneeInfoList.assigneeList']"
              >
                <cgn-asc-person-select
                  v-model="item.assigneeList"
                  :multiple="true"
                  :asc-url="indexProvide.ascUrl"
                  :props="{ userId: 'userID' }"
                ></cgn-asc-person-select>
              </el-form-item>

              <!-- 共享类别：环节类型是“共享环节”时显示 -->
              <el-form-item
                v-if="getProcActType(item.actID) == ACT_TYPE.SHARE"
                :label="$t('cgnTask.field.shareType') + $t('cgnCommon.colon')"
                :prop="'actAssigneeInfoList.' + itemIndex + '.shareType'"
                :rules="formRules['actAssigneeInfoList.shareType']"
              >
                <el-input v-model="item.shareType"></el-input>
              </el-form-item>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </el-form>

    <!-- 弹窗底部按钮 -->
    <div slot="footer" class="dialog-footer">
      <el-button
        v-if="formData.targetActList.length > 0"
        size="small"
        type="primary"
        @click="handleCommitForm"
        >{{ $t("cgnCommon.commit") }}</el-button
      >
      <el-button size="small" @click="handleClose">{{
        $t("cgnCommon.cancel")
      }}</el-button>
    </div>

    <!-- 其他会签事项弹窗 -->
    <el-dialog
      :title="$t('cgnTask.operate.viewOtherCosignItem')"
      :visible.sync="otherCosignDialog.isOpen"
      append-to-body
      width="800px"
      class="other-cosign-dialog"
      v-dragMove="{
        DragButton: '.el-dialog__header',
        DragWindow: '.el-dialog'
      }"
      :close-on-click-modal="false"
    >
      <el-table :data="otherCosignDialog.cosignItemList" border>
        <el-table-column
          :label="$t('cgnTask.field.index')"
          type="index"
          header-align="center"
          align="center"
          width="50"
          :index="
            index => {
              return index + 2;
            }
          "
        ></el-table-column>
        <el-table-column
          :label="$t('cgnTask.field.cosignUser')"
          header-align="center"
        >
          <template slot-scope="scope">
            <cgn-asc-person-select
              v-model="scope.row.cosignerList"
              :multiple="true"
              :mode="'tag'"
              :disabled="true"
              :props="{ userId: 'userID' }"
            ></cgn-asc-person-select>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('cgnTask.field.cosignItem')"
          header-align="center"
          align="center"
          width="250"
          prop="name"
        ></el-table-column>
      </el-table>
    </el-dialog>
  </el-dialog>
</template>

<script>
import * as Utils from "@/utils/Utils";
// import CgnAscPersonSelect from '@@/components/cgnPsc/cgnAsc/CgnAscPersonSelect';

export default {
  name: "ProcessSubmitDialog",
  // components: {CgnAscPersonSelect},
  inject: [
    // 祖先组件注入参数
    "indexProvide" // Index注入参数 {procCategoryOptions: []}
  ],
  props: {
    isOpen: { type: Boolean, default: false },
    isPromptSuccess: { type: Boolean, default: true }, // 是否提示成功信息
    isStartProcess: { type: Boolean, default: false }, // 是否发起流程，true-发起流程, false-提交流程
    procInsId: { type: String, required: true }, // 流程实例ID，必填
    procActInstId: { type: String, required: true }, // 流程环节实例ID，必填
    procTaskId: { type: String, required: true }, // 任务ID，必填
    modifyAssignee: { type: Boolean, default: true }, // 是否可以修改处理人
    targetActList: { type: Array, required: true }, // 目标环节列表
    actAssigneeInfoList: { type: Array }, // 可编辑环节列表
    ccList: { type: Array }, // 抄送人列表
    procInsBizExtendList: { type: Array } // 流程实例业务信息拓展
  },
  data() {
    return {
      loading: false,
      isEnLanguage: Utils.isEnLanguage(this.$i18n), // 是否是英语
      formData: {
        currentTargetAct: "0", // 当前选中目标环节页签
        currentEditableAct: "0", // 当前选中可编辑环节页签
        subject: "", // 主题（发起时填写）
        comment: "", // 审批意见（提交时填写）
        targetActList: [], // 目标环节列表
        actAssigneeInfoList: [], // 可编辑环节列表
        ccList: [], // 抄送人列表
        procInsBizExtendList: [] // 流程实例业务信息拓展
      },
      formRules: {
        subject: [
          {
            required: true,
            message: this.$t("cgnTask.tips.submitSubjectNotEmpty"),
            trigger: "change"
          }
        ],
        comment: [
          {
            required: true,
            message: this.$t("cgnTask.tips.submitCommentNotEmpty"),
            trigger: "change"
          }
        ],
        "targetActList.cosignItemList.cosignerList": [
          {
            type: "array",
            required: true,
            message: this.$t("cgnTask.tips.submitCosignUserNotEmpty")
          }
        ],
        "targetActList.cosignItemList.name": [
          {
            required: true,
            message: this.$t("cgnTask.tips.submitCosignItemNotEmpty"),
            trigger: "change"
          }
        ],
        "targetActList.assigneeList": [
          {
            type: "array",
            required: true,
            message: this.$t("cgnTask.tips.submitAssigneeNotEmpty")
          }
        ],
        "targetActList.shareType": [
          {
            required: true,
            message: this.$t("cgnTask.tips.submitShareTypeNotEmpty"),
            trigger: "change"
          }
        ],
        "actAssigneeInfoList.cosignItemList.cosignerList": [
          {
            type: "array",
            required: true,
            message: this.$t("cgnTask.tips.submitCosignUserNotEmpty")
          }
        ],
        "actAssigneeInfoList.cosignItemList.name": [
          {
            required: true,
            message: this.$t("cgnTask.tips.submitCosignItemNotEmpty"),
            trigger: "change"
          }
        ],
        "actAssigneeInfoList.assigneeList": [
          {
            type: "array",
            required: true,
            message: this.$t("cgnTask.tips.submitAssigneeNotEmpty")
          }
        ],
        "actAssigneeInfoList.shareType": [
          {
            required: true,
            message: this.$t("cgnTask.tips.submitShareTypeNotEmpty"),
            trigger: "change"
          }
        ]
      },
      actMap: {}, // 环节实例映射<key: actID, value: actData>
      otherCosignDialog: {
        // 其他会签事项弹窗
        isOpen: false,
        cosignItemList: []
      },
      ACT_TYPE: Utils.Constant.ACT_TYPE // 环节类型
    };
  },
  filters: {
    processName: Utils.Filters.processName
  },
  mounted() {
    // 加载流程环节列表
    this.loadProcActList();
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
    /**
     * 根据环节ID，从缓存中获取环节类型（0-开始环节，1-普通审批环节，2-会签环节，3-共享池环节，4-子流程环节，9-结束环节）
     */
    getProcActType(actId) {
      let actInfo = actId && actId in this.actMap ? this.actMap[actId] : null;
      return actInfo ? actInfo.procActType : "";
    },

    /**
     * 加载流程环节列表
     */
    loadProcActList() {
      let that = this;
      that.loading = true;
      that.$emit("requestApi", function(
        requestApi,
        requestApiBasic,
        { processId }
      ) {
        // 获取查询参数
        let requestParams = {
          basicInformation: Object.assign({}, requestApiBasic, {
            processId: processId
          }),
          parameter: { id: that.procInsId }
        };

        requestApi
          .getProcActListByProcInst(requestParams)
          .then(res => {
            that.loading = false;
            if (res.status == 200 && res.data.code == 200) {
              let procActList = res.data.data;
              that.initFormData(procActList);
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
     * 根据环节列表和组件传参，初始化表单数据
     * @param procActList 流程环节列表
     */
    initFormData(procActList) {
      procActList = procActList || [];
      let that = this;
      let ACT_TYPE = this.ACT_TYPE;
      // 组件传参
      let rawTargetActList = this.targetActList || []; // 目标环节列表
      let rawActAssigneeInfoList = this.actAssigneeInfoList || []; // 可编辑环节列表
      let rawCcList = this.ccList || []; // 抄送人列表
      let rawProcInsBizExtendList = this.procInsBizExtendList || []; // 流程实例业务信息拓展

      // 缓存环节实例映射<key: actID, value: actData>
      for (let i = 0; i < procActList.length; i++) {
        let procAct = procActList[i];
        this.$set(this.actMap, procAct.id, procAct);
      }

      // 组件传参“目标环节列表/可编辑环节列表”需对比“流程环节列表”过滤处理，存在的才显示
      let actMap = this.actMap; // 环节实例映射<key: actID, value: actData>
      let allowActType = [
        this.ACT_TYPE.GENERAL,
        this.ACT_TYPE.COSIGN,
        this.ACT_TYPE.SHARE
      ]; // 允许的流程环节类型
      let filterActList = function(rawActDatas, isEditable) {
        let newActDatas = [];
        for (let i = 0; i < rawActDatas.length; i++) {
          let rawActData = rawActDatas[i];
          let actInfo =
            rawActData.actID && rawActData.actID in actMap
              ? actMap[rawActData.actID]
              : null;
          if (actInfo && allowActType.indexOf(actInfo.procActType) >= 0) {
            let newActData = {
              actID: actInfo.id, // 环节ID
              actName: actInfo.name, // 环节名称
              actEnName: actInfo.enName, // 环节英文名称
              approvalMode: Utils.defaultIfNull(rawActData.approvalMode, 0), // 环节审批方式 0串行,1并行
              approvalRule: Utils.defaultIfNull(rawActData.approvalRule, 1), // 审批规则 0一人通过,1全票通过 并行必填
              shareType: rawActData.shareType || "", // 共享任务类型，可以传多个共享类型以英文逗号分割
              assigneeList: rawActData.assigneeList || [], // 处理人数组
              cosignItemList: rawActData.cosignItemList || [], // 会签项数组
              automatic: Utils.defaultIfNull(rawActData.automatic, null) // 是否自动跳过 0不跳过,1跳过
            };

            /**
             * 返回列表需满足：
             * 1.目标环节列表中，如果是环节类型是“会签项”，会签项列表必须指定了至少一项会签项
             * 2. 可编辑环节列表中，如果环节类型是“会签项”，会签项列表默认要有一项会签项
             * 3. 其他情况可直接添加到返回列表
             */
            if (
              actInfo.procActType != ACT_TYPE.COSIGN ||
              newActData.cosignItemList.length > 0
            ) {
              // 随机产生会签项编号
              for (let j = 0; j < newActData.cosignItemList.length; j++) {
                let cosignItem = newActData.cosignItemList[j];
                cosignItem.code = that.randomCosignItemCode(
                  newActData.cosignItemList,
                  cosignItem.code
                );
              }
              // 添加到返回列表
              newActDatas.push(newActData);
            } else if (isEditable && actInfo.procActType == ACT_TYPE.COSIGN) {
              newActData.cosignItemList.push({
                code: that.randomCosignItemCode(),
                name: "",
                sortNumber: 0,
                cosignerList: []
              });
              newActDatas.push(newActData);
            }
          }
        }
        return newActDatas;
      };
      let targetActList = filterActList(rawTargetActList, false); // 目标环节列表
      let actAssigneeInfoList = filterActList(rawActAssigneeInfoList, true); // 可编辑环节列表

      // 更新表单数据
      this.formData.targetActList = targetActList; // 目标环节列表
      this.formData.actAssigneeInfoList = actAssigneeInfoList; // 目标环节列表
      this.formData.ccList = rawCcList; // 抄送人列表
      this.formData.procInsBizExtendList = rawProcInsBizExtendList; // 流程实例业务信息拓展
    },

    /**
     * 随机生成会签项编码
     */
    randomCosignItemCode(cosignItemList, rawCode) {
      // 收集已存在的会签项编码
      let itemCodes = [];
      if (cosignItemList) {
        for (let i = 0; i < cosignItemList.length; i++) {
          let cosignItem = cosignItemList[i];
          if (cosignItem.code) {
            itemCodes.push(cosignItem.code);
          }
        }
      }

      // 随机生成会签项编码直到不重复
      let code = rawCode || Utils.randomString(4);
      while (itemCodes.indexOf(code) >= 0) {
        code = Utils.randomString(4);
      }
      return code;
    },

    /**
     * 提交抄送
     */
    handleCommitForm() {
      let that = this;
      let filterActList = function(actDatas) {
        // 环节列表中的会签项列表更新排序号
        for (let i = 0; i < actDatas.length; i++) {
          let actData = actDatas[i];
          if (actData.cosignItemList && actData.cosignItemList.length > 0) {
            for (let j = 0; j < actData.cosignItemList.length; j++) {
              let cosignItem = actData.cosignItemList[j];
              cosignItem.sortNumber = j;
            }
          }
        }
        return actDatas;
      };
      let requestApiFun = function(requestApi, requestApiBasic, { processId }) {
        // 环节列表中的会签项列表更新排序号
        let targetActList = filterActList(that.formData.targetActList); // 目标环节列表
        let actAssigneeInfoList = filterActList(
          that.formData.actAssigneeInfoList
        ); // 可编辑环节列表

        // 获取请求参数
        let requestApiMethod;
        if (that.isStartProcess) {
          let requestParams = {
            basicInformation: Object.assign({}, requestApiBasic, {
              processId: processId
            }),
            parameter: {
              subject: that.formData.subject, // 主题
              targetActList: targetActList, // 目标环节列表
              ccList: that.formData.ccList, // 抄送人列表
              actAssigneeInfoList: actAssigneeInfoList, // 可编辑环节列表
              procInsBizExtendList: that.formData.procInsBizExtendList // 流程实例业务信息拓展
            }
          };
          requestApiMethod = requestApi.startProcess(requestParams);
        } else {
          let requestParams = {
            basicInformation: Object.assign({}, requestApiBasic, {
              processId: processId
            }),
            parameter: {
              procInsID: that.procInsId, // 流程实例ID
              procActInstId: that.procActInstId, // 流程环节实例ID
              taskId: that.procTaskId, // 任务ID
              comment: that.formData.comment, // 审批意见
              targetActList: targetActList, // 目标环节列表
              ccList: that.formData.ccList, // 抄送人列表
              actAssigneeInfoList: actAssigneeInfoList, // 可编辑环节列表
              procInsBizExtendList: that.formData.procInsBizExtendList // 流程实例业务信息拓展
            }
          };
          requestApiMethod = requestApi.submitProcess(requestParams);
        }

        // 请求API
        that.loading = true;
        requestApiMethod
          .then(res => {
            that.loading = false;
            if (res.status == 200 && res.data.code == 200) {
              // 提示成功，并关闭弹窗
              if (that.isPromptSuccess) {
                that.$message.success(
                  that.$t("cgnTask.tips.submitProcessSuccess")
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
      that.$refs.editForm.validate((valid, validateResult) => {
        if (valid) {
          that.$emit("requestApi", requestApiFun);
        } else {
          // 从校验结果中判断是否有多页签的错误，若有，则记录第一笔的页签序号
          let currentTargetAct = null; // 当前选中目标环节页签
          let currentEditableAct = null; // 当前选中可编辑环节页签
          for (let key in validateResult) {
            if (!currentTargetAct && key.startsWith("targetActList.")) {
              currentTargetAct = key.split(".")[1];
            }
            if (!currentEditableAct && key.startsWith("actAssigneeInfoList.")) {
              currentEditableAct = key.split(".")[1];
            }
          }

          // 切换当前页签至有错误提示的页签
          if (currentTargetAct) {
            that.formData.currentTargetAct = currentTargetAct;
          }
          if (currentEditableAct) {
            that.formData.currentEditableAct = currentEditableAct;
          }
        }
      });
    },

    /**
     * 添加/移除会签项
     */
    onAddOrRemoveCosignItem(item, index, isAdd) {
      // 获取当前会签项列表（移除双向监听）
      let cosignItemList = JSON.parse(JSON.stringify(item.cosignItemList));

      if (isAdd) {
        // 添加会签项
        cosignItemList.splice(index + 1, 0, {
          code: this.randomCosignItemCode(cosignItemList),
          name: "",
          sortNumber: 0,
          cosignerList: []
        });
      } else {
        // 移除会签项
        cosignItemList.splice(index, 1);
      }

      // 重设修改后的会签项列表
      this.$delete(item, "cosignItemList");
      this.$nextTick(function() {
        this.$set(item, "cosignItemList", cosignItemList);
      });
    },

    /**
     * 上移/下移会签项
     */
    onSwapCosignItem(item, oldIndex, newIndex) {
      // 获取当前会签项列表（移除双向监听）
      let cosignItemList = JSON.parse(JSON.stringify(item.cosignItemList));

      // 交换会签项位置
      let oldItem = cosignItemList[oldIndex];
      let newItem = cosignItemList[newIndex];
      cosignItemList[oldIndex] = newItem;
      cosignItemList[newIndex] = oldItem;

      // 重设修改后的会签项列表
      this.$delete(item, "cosignItemList");
      this.$nextTick(function() {
        this.$set(item, "cosignItemList", cosignItemList);
      });
    },

    /**
     * 关闭弹窗事件
     */
    handleClose() {
      this.$emit("closeDialog");
    },

    /**
     * 打开其他会签事项弹窗
     */
    openOtherCosignDialog(cosignItemList) {
      this.otherCosignDialog.isOpen = true;
      this.otherCosignDialog.cosignItemList = cosignItemList.slice(1);
    }
  }
};
</script>
