<template>
  <div>
    <el-drawer
      class="task-dialog task-submit-dialog body-scroll-dialog"
      title=""
      :withHeader="false"
      :visible="isOpen && directionType == 'rtl'"
      size="640px"
      direction="rtl"
      destroy-on-close
      :close-on-press-escape="false"
      :wrapperClosable="false"
    >
      <!-- <div class="cud-inter-define-title">
        <span><img src="@/assets/img/drawersubmit.png" class="cud-define-pic"><span class="cud-define-text">{{$t('cgnTask.operate.viewOtherCosignItem')}}</span></span>
        <i class="el-icon-close cud-interdrawer-close" @click="handleClose"></i>
      </div> -->
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
        class="cud-drawer-form"
      >
        <div class="act-close">
          <el-button size="small" @click="handleClose" class="act-close-btn">
            <i class="el-icon el-icon-d-arrow-right"></i>
          </el-button>
        </div>
        <!-- 目标环节 -->
        <div class="act-warpper">
          <div class="act-warpper__header">
            {{ $t("cgnTask.field.targetAct") }}
          </div>
          <div class="act-warpper__body">
            <!-- 目标环节编辑 -->
            <el-tabs
              v-model="formData.currentTargetAct"
              type="card"
              v-if="!formData.end"
            >
              <el-tab-pane
                style="max-height: 450px; overflow: auto"
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
                <div v-if="item.procActType == ACT_TYPE.COSIGN">
                  <!-- 会签项Table：环节类型是“会签类型”时显示 -->
                  <!-- <el-table :data="item.cosignItemList.slice(0, 1)" border>
                  <el-table-column :label="$t('cgnTask.field.index')" type="index" header-align="center" align="center" width="50"></el-table-column>
                  <el-table-column :label="$t('cgnTask.field.cosignUser')" header-align="center">
                    <template slot-scope="scope">
                      <el-form-item label-width="0"
                                    :prop="'targetActList.' + itemIndex + '.cosignItemList.' + scope.$index + '.cosignerList'"
                                    :rules="formRules['targetActList.cosignItemList.cosignerList']">
                        <cgn-asc-person-select v-model="scope.row.cosignerList" :multiple="true" mode="tag" :disabled="modifyAssignee == false"
                                               :asc-url="ascUrl" :props="{userId: 'userID'}">
                        </cgn-asc-person-select>
                      </el-form-item>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('cgnTask.field.cosignItem')" header-align="center" width="250" prop="name"></el-table-column>
                </el-table> -->
                  <!-- 会签项Table：环节类型是“会签类型”时显示 -->
                  <el-table
                    :data="item.cosignItemList"
                    border
                    style="width: 100%"
                  >
                    <el-table-column
                      header-align="left"
                      :label="$t('cgnTask.field.index')"
                      type="index"
                      width="50"
                    >
                    </el-table-column>
                    <!-- header-align="center" -->
                    <el-table-column
                      :label="$t('cgnTask.field.cosignUser')"
                      width="200"
                    >
                      <template slot-scope="scope">
                        <el-form-item
                          label-width="0"
                          class="cosignerUserList"
                          :prop="
                            'targetActList.' +
                            itemIndex +
                            '.cosignItemList.' +
                            scope.$index +
                            '.cosignerList'
                          "
                          :rules="
                            formRules[
                              'targetActList.cosignItemList.cosignerList'
                            ]
                          "
                        >
                          <!-- style="margin-left: 26px" -->
                          <cgn-asc-person-select
                            v-model="scope.row.cosignerList"
                            :multiple="true"
                            mode="tag"
                            :disabledDelUser="!delAssigneePerson"
                            :disabledAddUser="!addAssigneePerson"
                            :asc-url="ascUrl"
                            :userCheck="userCheck"
                            :props="{ userId: 'userID' }"
                          >
                          </cgn-asc-person-select>
                        </el-form-item>
                      </template>
                    </el-table-column>
                    <el-table-column
                      :label="$t('cgnTask.field.cosignItem')"
                      header-align="left"
                    >
                      <div slot-scope="scope">
                        <el-form-item
                          label-width="0"
                          :prop="
                            'targetActList.' +
                            itemIndex +
                            '.cosignItemList.' +
                            scope.$index +
                            '.name'
                          "
                          :rules="
                            formRules['targetActList.cosignItemList.name']
                          "
                        >
                          <el-tooltip placement="top">
                            <div slot="content">{{ scope.row.name }}</div>
                            <el-select
                              clearable
                              allow-create
                              filterable
                              style="width: 90%"
                              :disabled="scope.row.cosignStatus == 0"
                              v-model="scope.row.scItemCofCode"
                              @change="selectScChange($event, scope.row)"
                              size="small"
                              :placeholder="
                                $t('cgnTask.tips.submitCosignItemNotSelect')
                              "
                            >
                              <el-option
                                v-for="(scItem, scIndex) in scItemCofList"
                                :key="scIndex"
                                :label="scItem.scItemCof"
                                :value="scItem.scItemCofCode"
                              ></el-option>
                            </el-select>
                          </el-tooltip>
                        </el-form-item>
                      </div>
                    </el-table-column>
                    <!-- header-align="center" -->
                    <el-table-column
                      :label="$t('cgnCommon.operate')"
                      width="100"
                    >
                      <div slot-scope="scope">
                        <!-- 会签功能上移/下移 -->
                        <div v-if="moveAssignee">
                          <el-button
                            size="small"
                            type="text"
                            :title="$t('cgnTask.operate.moveUp')"
                            :disabled="scope.$index == 0"
                            @click="
                              onSwapCosignItem(
                                item,
                                scope.$index,
                                scope.$index - 1
                              )
                            "
                            >上移</el-button
                          >
                          <el-button
                            size="small"
                            type="text"
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
                            >下移</el-button
                          >
                        </div>
                        <!-- 添加会签项 -->
                        <el-button
                          size="small"
                          v-if="addAssignee"
                          type="text"
                          :title="$t('cgnTask.operate.addCosignItem')"
                          @click="
                            onAddOrRemoveCosignItem(item, scope.$index, true)
                          "
                          >新增</el-button
                        >
                        <!-- 删除会签项 -->
                        <el-button
                          v-if="delAssignee"
                          size="small"
                          class="cud-common-operate-delete"
                          type="text"
                          :title="$t('cgnTask.operate.removeCosignItem')"
                          :disabled="item.cosignItemList.length < 2"
                          @click="
                            onAddOrRemoveCosignItem(item, scope.$index, false)
                          "
                          >删除</el-button
                        >
                      </div>
                    </el-table-column>
                  </el-table>

                  <!-- 会签项信息：环节类型是“会签类型”时显示 -->
                  <div style="display: flex; line-height: 42px">
                    <div class="dialog-info" style="flex: 1">
                      <el-button type="text" size="small"
                        ><i class="el-icon-info"></i
                      ></el-button>
                      <span v-if="item.approvalMode == '0'">{{
                        $t("cgnTask.approvalMode.singleDesc")
                      }}</span>
                      <span v-if="item.approvalMode == '1'">{{
                        $t("cgnTask.approvalMode.parallelDesc")
                      }}</span>
                    </div>
                    <!-- <div v-if="item.cosignItemList.length > 1">
                    <el-button type="text" @click="openOtherCosignDialog(item.cosignItemList)">{{$t('cgnTask.operate.viewOtherCosignItem')}}</el-button>
                  </div> -->
                  </div>
                </div>
                <!-- 处理人：环节类型是“普通环节”时显示 -->
                <el-form-item
                  v-if="item.procActType == ACT_TYPE.GENERAL"
                  :label="
                    $t('cgnTask.field.submitUser') + $t('cgnCommon.colon')
                  "
                  :prop="'targetActList.' + itemIndex + '.assigneeList'"
                  :rules="formRules['targetActList.assigneeList']"
                >
                  <cgn-asc-person-select
                    mode="tag"
                    v-model="item.assigneeList"
                    :multiple="true"
                    :asc-url="ascUrl"
                    :disabledDelUser="!delActPerson"
                    :disabledAddUser="!addActPerson"
                    :props="{ userId: 'userID' }"
                    :approvalMode="item.approvalMode"
                  ></cgn-asc-person-select>
                </el-form-item>

                <!-- 共享类别：环节类型是“共享环节”时显示 -->
                <el-form-item
                  v-if="item.procActType == ACT_TYPE.SHARE"
                  :label="$t('cgnTask.field.shareType') + $t('cgnCommon.colon')"
                  :prop="'targetActList.' + itemIndex + '.shareType'"
                  :rules="formRules['targetActList.shareType']"
                >
                  <el-input v-model="item.shareType" disabled></el-input>
                </el-form-item>
              </el-tab-pane>
            </el-tabs>
            <el-tag
              v-for="(item, index) in formData.targetActList"
              :key="index"
              v-if="formData.end"
              style="margin-left: 35px"
            >
              {{
                $options.filters.processName(
                  item,
                  $i18n,
                  "actName",
                  "actEnName"
                )
              }}
            </el-tag>
            <div style="margin-top: 15px">
              <!-- 主题(发起时填写) -->
              <el-form-item
                class="mb-25"
                v-if="isStartProcess && false"
                :label="$t('cgnTask.field.procSubject') + $t('cgnCommon.colon')"
                prop="subject"
              >
                <el-input
                  v-model="formData.subject"
                  :disabled="true"
                ></el-input>
              </el-form-item>
              <!-- 添加抄送人 -->
              <el-form-item
                v-if="!ccShow"
                :label="$t('cgnTask.field.ccUser') + $t('cgnCommon.colon')"
                prop="ccList"
              >
                <cgn-asc-person-select
                  v-model="formData.ccList"
                  :multiple="true"
                  :asc-url="ascUrl"
                  :props="{ userId: 'userID' }"
                ></cgn-asc-person-select>
              </el-form-item>
              <!--抄送意见-->
              <el-form-item
                v-if="!ccShow"
                class="mb-25"
                :label="$t('cgnTask.field.ccOpinion') + $t('cgnCommon.colon')"
                prop="ccOpinion"
              >
                <el-input
                  v-model="formData.ccOpinion"
                  placeholder="同意"
                  @input="handleInput"
                ></el-input>
              </el-form-item>
              <!-- <el-form-item :label="$t('cgnTask.field.noticeMethods') + $t('cgnCommon.colon')">
              沿用现有样式写通知方式
            </el-form-item> -->
              <!-- 审批意见(提交时填写) -->
              <!-- <el-form-item v-if="!isStartProcess" :label="$t('cgnTask.field.submitOpinion') + $t('cgnCommon.colon')" prop="comment">
              <el-input v-model="formData.comment" type="textarea"></el-input>
            </el-form-item> -->
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
                <div v-if="item.procActType == ACT_TYPE.COSIGN">
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
                            :disabledDelUser="!delAssigneePerson"
                            :disabledAddUser="!addAssigneePerson"
                            :asc-url="ascUrl"
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
                          <el-select
                            clearable
                            allow-create
                            filterable
                            style="width: 90%"
                            :disabled="scope.row.cosignStatus == 0"
                            v-model="scope.row.scItemCofCode"
                            @change="selectScChange($event, scope.row)"
                            size="small"
                            :placeholder="
                              $t('cgnTask.tips.submitCosignItemNotSelect')
                            "
                          >
                            <el-option
                              v-for="(item, index) in scItemCofList"
                              :key="index"
                              :label="item.scItemCof"
                              :value="item.scItemCofCode"
                            ></el-option>
                          </el-select>
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
                            size="small"
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
                            size="small"
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
                          size="small"
                          v-if="addAssignee"
                          type="text"
                          icon="el-icon-circle-plus-outline"
                          :title="$t('cgnTask.operate.addCosignItem')"
                          @click="
                            onAddOrRemoveCosignItem(item, scope.$index, true)
                          "
                        ></el-button>
                        <!-- 删除会签项 -->
                        <el-button
                          v-if="delAssignee"
                          size="small"
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
                  <div style="line-height: 42px">
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
                  :label="
                    $t('cgnTask.field.submitUser') + $t('cgnCommon.colon')
                  "
                  :prop="'actAssigneeInfoList.' + itemIndex + '.assigneeList'"
                  :rules="formRules['actAssigneeInfoList.assigneeList']"
                >
                  <cgn-asc-person-select
                    v-model="item.assigneeList"
                    :multiple="true"
                    :asc-url="ascUrl"
                    :props="{ userId: 'userID' }"
                  ></cgn-asc-person-select>
                </el-form-item>

                <!-- 共享类别：环节类型是“共享环节”时显示 -->
                <el-form-item
                  v-if="item.procActType == ACT_TYPE.SHARE"
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
        <!--通知方式-->
        <el-form-item
          :label="$t('cgnTask.field.noticeMethods')"
          v-if="
            (!emailMessageShow || !shortMessageShow || !dingMessageShow) &&
            !messageShow
          "
        >
          <el-checkbox-group
            v-model="formData.noticeMethods"
            style="padding-top: 6px; margin-top: 10px"
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
      </el-form>
      <!-- 弹窗底部按钮 -->
      <div class="cud-define-footer">
        <el-button size="small" @click="handleClose">{{
          $t("cgnCommon.cancel")
        }}</el-button>
        <el-button
          v-if="formData.targetActList.length > 0"
          size="small"
          type="primary"
          @click="handleCommitForm"
          v-loading.fullscreen.lock="btnLoading"
          >{{ $t("cgnCommon.commit") }}</el-button
        >
      </div>
    </el-drawer>

    <!-- 底部的弹窗 -->
    <el-drawer
      class="bomCss task-dialog task-submit-dialog body-scroll-dialog"
      title="提交审批"
      :withHeader="true"
      :visible="isOpen && directionType == 'btt'"
      size=""
      direction="btt"
      destroy-on-close
      :close-on-press-escape="false"
      :wrapperClosable="false"
      @close="handleClose"
    >
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
        class="cud-drawer-form"
      >
        <!-- 下一目标环节 -->
        <div class="act-warpper" style="border: none">
          <div
            class="act-warpper__header"
            style="margin-left: -18px; margin-bottom: -4px; border-left: none"
          >
            {{ $t("cgnTask.field.nextTargetAct") }}
          </div>
          <div class="act-warpper__body">
            <!-- 目标环节编辑 -->
            <el-tabs
              v-model="formData.currentTargetAct"
              type="card"
              v-if="!formData.end"
            >
              <el-tab-pane
                style="max-height: 450px; overflow: auto"
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
                <div v-if="item.procActType == ACT_TYPE.COSIGN">
                  <!-- 会签项Table：环节类型是“会签类型”时显示 -->
                  <el-table
                    :data="item.cosignItemList"
                    border
                    style="width: 100%"
                  >
                    <el-table-column
                      header-align="left"
                      :label="$t('cgnTask.field.index')"
                      type="index"
                      width="50"
                    >
                    </el-table-column>
                    <el-table-column
                      :label="$t('cgnTask.field.cosignUser')"
                      width="200"
                    >
                      <template slot-scope="scope">
                        <el-form-item
                          label-width="0"
                          class="cosignerUserList"
                          :prop="
                            'targetActList.' +
                            itemIndex +
                            '.cosignItemList.' +
                            scope.$index +
                            '.cosignerList'
                          "
                          :rules="
                            formRules[
                              'targetActList.cosignItemList.cosignerList'
                            ]
                          "
                        >
                          <cgn-asc-person-select
                            v-model="scope.row.cosignerList"
                            :multiple="true"
                            mode="tag"
                            :disabledDelUser="!delAssigneePerson"
                            :disabledAddUser="!addAssigneePerson"
                            :asc-url="ascUrl"
                            :userCheck="userCheck"
                            :props="{ userId: 'userID' }"
                            :isbottomDialog="true"
                          >
                          </cgn-asc-person-select>
                        </el-form-item>
                      </template>
                    </el-table-column>
                    <el-table-column
                      :label="$t('cgnTask.field.cosignItem')"
                      header-align="left"
                    >
                      <div slot-scope="scope">
                        <el-form-item
                          label-width="0"
                          :prop="
                            'targetActList.' +
                            itemIndex +
                            '.cosignItemList.' +
                            scope.$index +
                            '.name'
                          "
                          :rules="
                            formRules['targetActList.cosignItemList.name']
                          "
                        >
                          <el-tooltip placement="top">
                            <div slot="content">{{ scope.row.name }}</div>
                            <el-select
                              clearable
                              allow-create
                              filterable
                              style="width: 90%"
                              :disabled="scope.row.cosignStatus == 0"
                              v-model="scope.row.scItemCofCode"
                              @change="selectScChange($event, scope.row)"
                              size="small"
                              :placeholder="
                                $t('cgnTask.tips.submitCosignItemNotSelect')
                              "
                            >
                              <el-option
                                v-for="(scItem, scIndex) in scItemCofList"
                                :key="scIndex"
                                :label="scItem.scItemCof"
                                :value="scItem.scItemCofCode"
                              ></el-option>
                            </el-select>
                          </el-tooltip>
                        </el-form-item>
                      </div>
                    </el-table-column>
                    <el-table-column
                      :label="$t('cgnCommon.operate')"
                      width="100"
                    >
                      <div slot-scope="scope">
                        <!-- 会签功能上移/下移 -->
                        <div v-if="moveAssignee">
                          <el-button
                            size="small"
                            type="text"
                            :title="$t('cgnTask.operate.moveUp')"
                            :disabled="scope.$index == 0"
                            @click="
                              onSwapCosignItem(
                                item,
                                scope.$index,
                                scope.$index - 1
                              )
                            "
                            >上移</el-button
                          >
                          <el-button
                            size="small"
                            type="text"
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
                            >下移</el-button
                          >
                        </div>
                        <!-- 添加会签项 -->
                        <el-button
                          size="small"
                          v-if="addAssignee"
                          type="text"
                          :title="$t('cgnTask.operate.addCosignItem')"
                          @click="
                            onAddOrRemoveCosignItem(item, scope.$index, true)
                          "
                          >新增</el-button
                        >
                        <!-- 删除会签项 -->
                        <el-button
                          v-if="delAssignee"
                          size="small"
                          class="cud-common-operate-delete"
                          type="text"
                          :title="$t('cgnTask.operate.removeCosignItem')"
                          :disabled="item.cosignItemList.length < 2"
                          @click="
                            onAddOrRemoveCosignItem(item, scope.$index, false)
                          "
                          >删除</el-button
                        >
                      </div>
                    </el-table-column>
                  </el-table>

                  <!-- 会签项信息：环节类型是“会签类型”时显示 -->
                  <div style="display: flex; line-height: 42px">
                    <div class="dialog-info" style="flex: 1">
                      <el-button type="text" size="small"
                        ><i class="el-icon-info"></i
                      ></el-button>
                      <span v-if="item.approvalMode == '0'">{{
                        $t("cgnTask.approvalMode.singleDesc")
                      }}</span>
                      <span v-if="item.approvalMode == '1'">{{
                        $t("cgnTask.approvalMode.parallelDesc")
                      }}</span>
                    </div>
                  </div>
                </div>
                <!-- 处理人：环节类型是“普通环节”时显示 -->
                <el-form-item
                  style="margin-left: -26px"
                  v-if="item.procActType == ACT_TYPE.GENERAL"
                  label="
                   处理人：
                  "
                  :prop="'targetActList.' + itemIndex + '.assigneeList'"
                  :rules="formRules['targetActList.assigneeList']"
                >
                  <cgn-asc-person-select
                    mode="tag"
                    v-model="item.assigneeList"
                    :multiple="true"
                    :asc-url="ascUrl"
                    :disabledDelUser="!delActPerson"
                    :disabledAddUser="!addActPerson"
                    :props="{ userId: 'userID' }"
                    :approvalMode="item.approvalMode"
                    :isbottomDialog="true"
                  ></cgn-asc-person-select>
                </el-form-item>
              </el-tab-pane>
            </el-tabs>
            <el-tag
              v-for="(item, index) in formData.targetActList"
              :key="index"
              v-if="formData.end"
              style="margin-left: 35px"
            >
              {{
                $options.filters.processName(
                  item,
                  $i18n,
                  "actName",
                  "actEnName"
                )
              }}
            </el-tag>
            <div style="margin-top: 15px; margin-left: -6px">
              <!-- 主题(发起时填写) -->
              <el-form-item
                class="mb-25"
                v-if="isStartProcess && false"
                :label="$t('cgnTask.field.procSubject') + $t('cgnCommon.colon')"
                prop="subject"
              >
                <el-input
                  v-model="formData.subject"
                  :disabled="true"
                ></el-input>
              </el-form-item>
              <!-- 添加抄送人 -->
              <el-form-item
                v-if="!ccShow"
                :label="$t('cgnTask.field.ccUser') + $t('cgnCommon.colon')"
                prop="ccList"
              >
                <cgn-asc-person-select
                  v-model="formData.ccList"
                  :multiple="true"
                  :asc-url="ascUrl"
                  :props="{ userId: 'userID' }"
                  :isbottomDialog="true"
                ></cgn-asc-person-select>
              </el-form-item>
              <!--抄送意见-->
              <el-form-item
                v-if="!ccShow"
                class="mb-25"
                :label="$t('cgnTask.field.ccOpinion') + $t('cgnCommon.colon')"
                prop="ccOpinion"
              >
                <el-input
                  v-model="formData.ccOpinion"
                  placeholder="同意"
                  @input="handleInput"
                ></el-input>
              </el-form-item>
              <!--通知方式-->
              <el-form-item
                :label="$t('cgnTask.field.noticeMethods') + '：'"
                v-if="
                  (!emailMessageShow ||
                    !shortMessageShow ||
                    !dingMessageShow) &&
                  !messageShow
                "
              >
                <el-checkbox-group
                  v-model="formData.noticeMethods"
                  style="padding-top: 6px; margin-top: 10px"
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
                <div v-if="item.procActType == ACT_TYPE.COSIGN">
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
                            :disabledDelUser="!delAssigneePerson"
                            :disabledAddUser="!addAssigneePerson"
                            :asc-url="ascUrl"
                            :props="{ userId: 'userID' }"
                            :isbottomDialog="true"
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
                          <el-select
                            clearable
                            allow-create
                            filterable
                            style="width: 90%"
                            :disabled="scope.row.cosignStatus == 0"
                            v-model="scope.row.scItemCofCode"
                            @change="selectScChange($event, scope.row)"
                            size="small"
                            :placeholder="
                              $t('cgnTask.tips.submitCosignItemNotSelect')
                            "
                          >
                            <el-option
                              v-for="(item, index) in scItemCofList"
                              :key="index"
                              :label="item.scItemCof"
                              :value="item.scItemCofCode"
                            ></el-option>
                          </el-select>
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
                            size="small"
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
                            size="small"
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
                          size="small"
                          v-if="addAssignee"
                          type="text"
                          icon="el-icon-circle-plus-outline"
                          :title="$t('cgnTask.operate.addCosignItem')"
                          @click="
                            onAddOrRemoveCosignItem(item, scope.$index, true)
                          "
                        ></el-button>
                        <!-- 删除会签项 -->
                        <el-button
                          v-if="delAssignee"
                          size="small"
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
                  <div style="line-height: 42px">
                    <!-- 环节审批方式 0串行,1并行 -->
                    <el-checkbox
                      v-model="item.approvalMode"
                      :true-label="0"
                      :false-label="1"
                      >{{ $t("cgnTask.approvalMode.singleDesc") }}</el-checkbox
                    >
                  </div>
                </div>
                <!-- :label="
                    $t('cgnTask.field.submitUser') + $t('cgnCommon.colon')
                  " -->
                <!-- 处理人：环节类型是“普通环节”时显示 -->
                <el-form-item
                  v-if="getProcActType(item.actID) == ACT_TYPE.GENERAL"
                  label="
                    $t('cgnTask.field.submitUser') + $t('cgnCommon.colon')
                  "
                  :prop="'actAssigneeInfoList.' + itemIndex + '.assigneeList'"
                  :rules="formRules['actAssigneeInfoList.assigneeList']"
                >
                  <cgn-asc-person-select
                    v-model="item.assigneeList"
                    :multiple="true"
                    :asc-url="ascUrl"
                    :props="{ userId: 'userID' }"
                  ></cgn-asc-person-select>
                </el-form-item>

                <!-- 共享类别：环节类型是“共享环节”时显示 -->
                <el-form-item
                  v-if="item.procActType == ACT_TYPE.SHARE"
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
      <div class="cud-define-footer-bom">
        <el-button size="small" @click="handleClose">{{
          $t("cgnCommon.cancel")
        }}</el-button>
        <el-button
          v-if="formData.targetActList.length > 0"
          size="small"
          type="primary"
          @click="handleCommitForm"
          v-loading.fullscreen.lock="btnLoading"
          >{{ $t("cgnCommon.commit") }}</el-button
        >
      </div>
    </el-drawer>
    <!-- 其他会签事项弹窗 -->
    <!-- :visible="otherCosignDialog.isOpen" -->

    <el-drawer
      class="task-dialog task-submit-dialog body-scroll-dialog"
      title=""
      :withHeader="false"
      :visible="otherCosignDialog.isOpen"
      append-to-body
      size="600px"
      direction="rtl"
      destroy-on-close
      :close-on-press-escape="false"
      :wrapperClosable="false"
    >
      <div class="cud-inter-define-title">
        <span
          ><img
            src="@/assets/img/drawersubmit.png"
            class="cud-define-pic"
          /><span class="cud-define-text">{{
            $t("cgnTask.operate.viewOtherCosignItem")
          }}</span></span
        >
        <i
          class="el-icon-close cud-interdrawer-close"
          @click="otherCosignDialog.isOpen = false"
        ></i>
      </div>
      <el-table :data="otherCosignDialog.cosignItemList">
        <el-table-column
          :label="$t('cgnTask.field.index')"
          type="index"
          header-align="center"
          align="center"
          width="50"
          :index="
            (index) => {
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
              :asc-url="ascUrl"
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
    </el-drawer>
  </div>
</template>

<script>
import * as Utils from "@/utils/Utils";
import PersonSelect from "@/components/asc/PersonSelect";
// import CgnAscPersonSelect from "@@/components/cgnPsc/cgnAsc/CgnAscPersonSelect";

export default {
  name: "ProcessSubmitDialog",
  components: { PersonSelect },
  inject: [
    // 祖先组件注入参数
    "indexProvide", // Index注入参数 {procCategoryOptions: []}
  ],
  props: {
    end: { type: Boolean, default: false }, //是否结束环节
    isOpen: { type: Boolean, default: false },
    processId: { type: String, required: true }, // 流程ID
    isPromptSuccess: { type: Boolean, default: true }, // 是否提示成功信息
    isStartProcess: { type: Boolean, default: false }, // 是否发起流程，true-发起流程, false-提交流程
    procInstId: { type: String, default: "" }, // 流程实例ID，必填
    procActInstId: { type: String, default: "" }, // 流程环节实例ID，必填
    procTaskId: { type: String, default: "" }, // 任务ID，必填
    delAssignee: { type: Boolean, default: false }, // 是否可以删除会签项
    addAssignee: { type: Boolean, default: false }, // 是否可以允许添加多个会签项
    delAssigneePerson: { type: Boolean, default: false }, // 是否可以允许删除会签项负责人
    addAssigneePerson: { type: Boolean, default: false }, // 是否可以允许会签项添加多个负责人
    delActPerson: { type: Boolean, default: false }, // 由上一个环节进入是否可以删除已经配置的负责人
    addActPerson: { type: Boolean, default: false }, // 由上一个环节进入是否可以添加多个负责人
    moveAssignee: { type: Boolean, default: false }, // 是否可以允许移动会签项
    tipShow: { type: Boolean, default: false }, // 是否会签显示选人提示信息
    userCheck: { type: Boolean, default: false }, // 是否会签负责人可以勾选
    targetActList: { type: Array, required: true }, // 目标环节列表
    scItemCofList: { type: Array }, //会签事项名称配置
    actAssigneeInfoList: { type: Array }, // 可编辑环节列表
    ccList: { type: Array }, // 抄送人列表
    ccOpinion: { type: String }, // 抄送意见
    procInsBizExtendList: { type: Array }, // 流程实例业务信息拓展
    dataKey: { type: String, required: true }, // 缓存key
    dataUpdateFlag: { type: String }, // 数据更新标识
    subject: { type: String }, // 工作主题
    comment: { type: String }, // 审批意见
    modelName: { type: String },
    ccShow: { type: Boolean, default: false }, //是否显示抄送
    shortMessageShow: { type: Boolean, default: false },
    emailMessageShow: { type: Boolean, default: false },
    dingMessageShow: { type: Boolean, default: false },
    emailMessageTrue: { type: Boolean, default: false },
    shortMessageTrue: { type: Boolean, default: false },
    dingMessageTrue: { type: Boolean, default: false },
    messageAllHide: { type: String, default: "" },
    dialogAutoSubmit: { type: String, default: "" },
    directionType: { type: String, default: "rtl" },
    getOption: {
      type: Object,
      dufault: () => {},
    },
  },
  data() {
    return {
      loading: false,
      ascUrl: envConfig.ASC_ROOT,
      isEnLanguage: Utils.isEnLanguage(this.$i18n), // 是否是英语
      formData: {
        end: false, //是否结束环节
        currentTargetAct: "0", // 当前选中目标环节页签
        currentEditableAct: "0", // 当前选中可编辑环节页签
        subject: "", // 主题（发起时填写）
        comment: "", // 审批意见（提交时填写）
        ccOpinion: "", // 抄送意见（发起和提交时填写，非必填）
        targetActList: [], // 目标环节列表
        actAssigneeInfoList: [], // 可编辑环节列表
        ccList: [], // 抄送人列表
        procInsBizExtendList: [], // 流程实例业务信息拓展
        noticeMethods: [], //邮件
        ccNoticeFlag: false, //抄送人通知
      },
      formRules: {
        subject: [
          {
            required: true,
            message: this.$t("cgnTask.tips.submitSubjectNotEmpty"),
            trigger: "change",
          },
        ],
        comment: [
          {
            required: true,
            message: this.$t("cgnTask.tips.submitCommentNotEmpty"),
            trigger: "change",
          },
        ],
        "targetActList.cosignItemList.cosignerList": [
          {
            type: "array",
            required: true,
            message: this.$t("cgnTask.tips.submitCosignUserNotEmpty"),
          },
        ],
        "targetActList.cosignItemList.name": [
          {
            required: true,
            message: this.$t("cgnTask.tips.submitCosignItemNotSelect"),
            trigger: "change",
          },
        ],
        "targetActList.assigneeList": [
          {
            type: "array",
            required: true,
            message: this.$t("cgnTask.tips.submitAssigneeNotEmpty"),
          },
        ],
        "targetActList.shareType": [
          {
            required: true,
            message: this.$t("cgnTask.tips.submitShareTypeNotEmpty"),
            trigger: "change",
          },
        ],
        "actAssigneeInfoList.cosignItemList.cosignerList": [
          {
            type: "array",
            required: true,
            message: this.$t("cgnTask.tips.submitCosignUserNotEmpty"),
          },
        ],
        "actAssigneeInfoList.cosignItemList.name": [
          {
            required: true,
            message: this.$t("cgnTask.tips.submitCosignItemNotSelect"),
            trigger: "change",
          },
        ],
        "actAssigneeInfoList.assigneeList": [
          {
            type: "array",
            required: true,
            message: this.$t("cgnTask.tips.submitAssigneeNotEmpty"),
          },
        ],
        "actAssigneeInfoList.shareType": [
          {
            required: true,
            message: this.$t("cgnTask.tips.submitShareTypeNotEmpty"),
            trigger: "change",
          },
        ],
      },
      actMap: {}, // 环节实例映射<key: actID, value: actData>
      otherCosignDialog: {
        // 其他会签事项弹窗
        isOpen: false,
        cosignItemList: [],
      },
      ACT_TYPE: Utils.Constant.ACT_TYPE, // 环节类型
      actScMasterCodes: [],
      sourceCosign: {}, //初始化原始数据
      btnLoading: false,
      submitLoading: true,
    };
  },
  filters: {
    processName: Utils.Filters.processName,
  },
  computed: {
    // 通知方式显示隐藏
    messageShow() {
      let actName =
        this.messageAllHide.indexOf(",") > -1
          ? this.messageAllHide.split(",")
          : this.messageAllHide;
      return actName.includes(this.targetActList[0].actName) ? true : false;
    },
  },
  async mounted() {
    /** 短信、邮件、鹭钉初始化勾选 */
    this.formData.noticeMethods = [];
    if (this.emailMessageTrue) this.formData.noticeMethods.push("1");
    if (this.shortMessageTrue) this.formData.noticeMethods.push("2");
    if (this.dingMessageTrue) this.formData.noticeMethods.push("3");
    // /** 获取下一环节审批节点,存入sessionStrong缓存 */
    // sessionStorage.removeItem("nextActName");
    // if (this.targetActList && this.targetActList.length > 0) {
    //   sessionStorage.setItem("nextActName", this.targetActList[0].actName);
    // }
    // 加载流程环节列表
    await this.loadProcActList();
    // 如果隐藏弹框则自动提交
    // let actName = this.dialogAutoSubmit.indexOf(',') > -1 ? this.dialogAutoSubmit.split(',') : this.dialogAutoSubmit;
    // let autoSubmit = actName.includes(this.targetActList[0].actName) ? true : false;
    // if (autoSubmit) {
    //   this.submitLoading = true;
    //   this.handleCommitForm();
    // } else {
    // this.dialogSize = 640;
    //   this.submitLoading = false;
    // }
  },
  watch: {
    /**
     * 切换语言时重新查询表单
     */
    "$i18n.locale"() {
      this.isEnLanguage = Utils.isEnLanguage(this.$i18n);
    },
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
        this.formData.ccOpinion = filteredValue;
      } else {
        // 如果没有表情符号，直接传递原始值
        this.$emit("input", value);
      }
    },
    //会签下拉改变
    selectScChange(val, row) {
      this.scItemCofList.forEach((i) => {
        if (val === i.scItemCofCode) {
          row.name = i.scItemCof;
          row.scItemCofCode = i.scItemCofCode;
          row.scItemCofEn = i.scItemCofEn;
        }
      });
    },

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
      this.loading = true;
      // 更新表单数据
      this.formData.targetActList = this.targetActList || []; // 目标环节列表
      this.formData.actAssigneeInfoList = this.actAssigneeInfoList || []; // 目标环节列表
      this.formData.ccList = this.ccList || []; // 抄送人列表
      this.formData.procInsBizExtendList = this.procInsBizExtendList || []; // 流程实例业务信息拓展
      this.formData.subject = this.subject;
      this.formData.comment = this.comment;
      this.formData.end = this.end; //是否结束环节
      this.loading = false;

      for (let i = 0; i < this.formData.targetActList.length; i++) {
        let targetAct = this.formData.targetActList[i];
        let cosignItemList = this.formData.targetActList[i].cosignItemList;
        if (cosignItemList && cosignItemList.length > 0) {
          for (let j = 0; j < cosignItemList.length; j++) {
            // 原始会签项
            this.sourceCosign[targetAct.actID] = cosignItemList[j];
            let code = cosignItemList[j].code;
            if (cosignItemList[j].actScOriginalCode) {
              code = cosignItemList[j].actScOriginalCode;
            }
            let temp = {
              actId: targetAct.actID,
              cosignCode: code,
            };
            // 会签项原始CODE
            this.actScMasterCodes.push(temp);
          }
        }
      }
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
        this.ACT_TYPE.SHARE,
      ]; // 允许的流程环节类型
      let filterActList = function (rawActDatas, isEditable) {
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
              withdrawRule: Utils.defaultIfNull(rawActData.withdrawRule, 1), // 撤销权限 0不可撤销,1允许撤销
              shareType: rawActData.shareType || "", // 共享任务类型，可以传多个共享类型以英文逗号分割
              assigneeList: rawActData.assigneeList || [], // 处理人数组
              cosignItemList: rawActData.cosignItemList || [], // 会签项数组
              automatic: Utils.defaultIfNull(rawActData.automatic, null), // 是否自动跳过 0不跳过,1跳过
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
                cosignerList: [],
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
     * 提交方法
     */

    handleCommitForm() {
      let that = this;
      let filterActList = function (actDatas, sortNumber, userCheck) {
        // 环节列表中的会签项列表更新排序号
        let newActData = Object.assign([], actDatas);
        for (let i = 0; i < newActData.length; i++) {
          let actData = newActData[i];
          if (actData.cosignItemList && actData.cosignItemList.length > 0) {
            const actSc = that.actScMasterCodes.find(
              (p) => p.actId === actData.actID
            );
            for (let j = 0; j < actData.cosignItemList.length; j++) {
              //actData.cosignItemList[j].sortNumber = sortNumber
              actData.cosignItemList[j].actScOriginalCode = actSc.cosignCode;
              sortNumber++;
              if (userCheck) {
                let checkCosignerList = [];
                // 改为新增的方式，原先splice有bug
                for (
                  let k = 0;
                  k < actData.cosignItemList[j].cosignerList.length;
                  k++
                ) {
                  if (actData.cosignItemList[j].cosignerList[k].check) {
                    checkCosignerList.push(
                      actData.cosignItemList[j].cosignerList[k]
                    );
                  }
                }
                actData.cosignItemList[j].cosignerList = checkCosignerList;
              }
            }
          }
        }
        return newActData;
      };
      let requestApiFun = function (
        requestApi,
        requestApiBasic,
        { processId }
      ) {
        // // 环节列表中的会签项列表更新排序号
        let targetActList = filterActList(
          that.formData.targetActList,
          1,
          that.userCheck
        );
        // 目标环节列表
        let actAssigneeInfoList = that.formData.actAssigneeInfoList; // 可编辑环节列表
        //如果是会签环节， 串行提交，需要重新生成itemCode
        // 获取请求参数
        let requestApiMethod;
        if (that.isStartProcess) {
          let requestParams = {
            dataKey: that.dataKey,
            modelName: that.modelName,
            subject: that.formData.subject, // 主题
            targetActList: targetActList, // 目标环节列表
            ccList: that.formData.ccList, // 抄送人列表
            ccOpinion: that.formData.ccOpinion || "同意", // 抄送意见
            actAssigneeInfoList: actAssigneeInfoList, // 可编辑环节列表
            procInsBizExtendList: that.formData.procInsBizExtendList, // 流程实例业务信息拓展
            noticeMethods:
              that.formData.noticeMethods &&
              that.formData.noticeMethods.length > 0
                ? that.formData.noticeMethods.join(",")
                : "", // 通知方式
            //抄送通知
            ccNoticeFlag: that.formData.ccNoticeFlag,
          };
          requestApiMethod = requestApi.startProcess(requestParams);
        } else {
          let requestParams = {
            end: that.end,
            dataKey: that.dataKey,
            processId: that.processId,
            modelName: that.modelName,
            procInstId: that.procInstId, // 流程实例ID
            procActInstId: that.procActInstId, // 流程环节实例ID
            taskId: that.procTaskId, // 任务ID
            comment: that.formData.comment, // 审批意见
            targetActList: targetActList, // 目标环节列表
            ccList: that.formData.ccList, // 抄送人列表
            ccOpinion: that.formData.ccOpinion, // 抄送意见
            actAssigneeInfoList: actAssigneeInfoList, // 可编辑环节列表
            procInsBizExtendList: that.formData.procInsBizExtendList, // 流程实例业务信息拓展
            noticeMethods:
              that.formData.noticeMethods &&
              that.formData.noticeMethods.length > 0
                ? that.formData.noticeMethods.join(",")
                : "", // 通知方式
            //抄送通知
            ccNoticeFlag: that.formData.ccNoticeFlag,
          };

          requestApiMethod = requestApi.submitProcess(requestParams);
        }
        // 请求API
        that.loading = true;
        that.btnLoading = true;
        requestApiMethod
          .then((res) => {
            if (res.status == 200 && res.data.code === "0") {
              // 代码编辑器-表单提交事件
              if (!res.data.data) {
                that.$emit("saveFn");
              } else {
                that.$emit("saveFn", res.data.data.procInstId);
              }
              if (that.getOption) {
                let obj = that.getOption;
                let submitRet = true;
                submitRet = obj.option.submit
                  ? obj.option.submit(obj.dm, obj.form, obj._this)
                  : true;
                if (submitRet === false) {
                  return;
                }
              }
              // 提示成功，并关闭弹窗
              if (that.isPromptSuccess) {
                that.$message.success(
                  that.$t("cgnTask.tips.submitProcessSuccess")
                );
              }
              //等提示框弹出后再关闭窗口
              let timer = setTimeout(() => {
                that.$emit("closeDialog", true, res.data);
                that.loading = false;
                that.btnLoading = false;
                clearTimeout(timer);
              }, 1000);
            } else {
              that.loading = false;
              that.btnLoading = false;
              that.$message.error(res.data.message);
            }
          })
          .catch((err) => {
            that.loading = false;
            that.btnLoading = false;
          });
      };
      // that.$emit("requestApi", requestApiFun);
      let requestValidateApiFun = function (
        requestApi,
        requestApiBasic,
        { processId }
      ) {
        let requestValidateParams = {
          procInstId: that.procInstId, // 流程实例ID
          dataUpdateFlag: that.dataUpdateFlag, //数据更新标识
        };
        let requestValidateApiMethod = requestApi.procValidateUpdate(
          requestValidateParams
        );
        // 请求API
        that.loading = true;
        that.btnLoading = true;
        requestValidateApiMethod
          .then((res) => {
            that.loading = false;
            that.btnLoading = false;
            if (res.status == 200 && res.data.code === "0") {
              //验证成功后调用提交方法
              that.$emit("requestApi", requestApiFun);
            } else {
              // 执行前，询问用户是否确认操作
              that
                .$confirm(
                  that.$t("cgnTask.tips.confirmContinueTask"),
                  that.$t("cgnCommon.tips"),
                  {
                    confirmButtonText: that.$t("cgnCommon.confirm"),
                    cancelButtonText: that.$t("cgnCommon.cancel"),
                    type: "warning",
                  }
                )
                .then(() => {
                  // 点击确认后调用提交方法
                  that.$emit("requestApi", requestApiFun);
                })
                .catch(() => {});
            }
          })
          .catch((err) => {
            that.loading = false;
            that.btnLoading = false;
          });
      };
      // 若表单验证通过，则提交表单
      that.$refs.editForm.validate((valid, validateResult) => {
        if (valid) {
          //提交前对目标环节进行验证，每个会签事项必须要有一个处理人,先对数据进行复制
          let cloneTargetActList = this.deepClone(that.formData.targetActList);
          let validateTargetActList = filterActList(
            cloneTargetActList,
            1,
            that.userCheck
          );
          for (let i = 0; i < validateTargetActList.length; i++) {
            let actData = validateTargetActList[i];
            if (actData.cosignItemList && actData.cosignItemList.length > 0) {
              for (let j = 0; j < actData.cosignItemList.length; j++) {
                if (
                  actData.cosignItemList[j].cosignerList == null ||
                  actData.cosignItemList[j].cosignerList.length == 0
                ) {
                  //会签事项下没有处理人，提出提示，终止提交
                  that.$message.error(
                    that.$t("cgnTask.tips.forWork") +
                      "(" +
                      actData.cosignItemList[j].name +
                      ")" +
                      that.$t("cgnTask.tips.cosignerLeastTaskUser")
                  );
                  return;
                }
              }
            }
          }
          that.$emit("requestApi", requestValidateApiFun);
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
      // cosignStatus: 0 删除，1 新增， 2 修改， 3 无修改
      // 获取当前会签项列表（移除双向监听）
      let cosignItemList = JSON.parse(JSON.stringify(item.cosignItemList));

      if (isAdd) {
        // 添加会签项
        cosignItemList.splice(index + 1, 0, {
          code: this.randomCosignItemCode(cosignItemList),
          name: "",
          sortNumber: 0,
          cosignerList: [],
          cosignStatus: 1,
          addFlag: true,
        });
      } else {
        // 移除会签项
        cosignItemList.splice(index, 1);
      }

      // 重设修改后的会签项列表
      this.$delete(item, "cosignItemList");
      this.$nextTick(function () {
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
      this.$nextTick(function () {
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
    },
  },
};
</script>

<style lang="less" scoped>
/deep/ .el-drawer__body {
  border-top: 4px solid #0069ac;
  position: relative;
  padding-bottom: 80px;
}
.cud-drawer-form {
  padding: 0 25px 0 18px;
}

.cud-define-footer-bom {
  position: fixed;
  height: 56px;
  line-height: 62px;
  width: 100%;
  bottom: 0;
  right: 0;
  text-align: center;
  z-index: 2;
  background-color: white;
  -webkit-box-shadow: 0px -7px 14px 0px rgba(0, 0, 0, 0.2);
  box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.2);
  // box-shadow: 0px -7px 14px 0px rgba(0, 0, 0, 0.2);
}
.bomCss /deep/.el-drawer__header {
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  color: #ffffff;
  // color: #72767b;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  border-bottom: 1px solid rgba(5, 5, 5, 0.06);
  padding: 10px 20px !important;
  margin-bottom: 0px;
  background: #122a5a;
}
.bomCss /deep/.el-drawer__body {
  border-top: none;
}
/deep/ .el-dialog__close {
  color: #fff;
  // color: #94979b;
  font-size: 20px;
}

.cosignerUserList .el-form-item__content {
  height: auto !important;
}
.el-form-item__error {
  top: auto;
  bottom: 3px;
  left: 0px;
}
/deep/ .el-form-item__label {
  line-height: 32px;
}
/deep/.el-tabs .el-tabs__nav {
  margin-left: 0;
}
/deep/.el-tabs .el-tabs__item.is-active {
  background-color: #fff;
  border: 1px solid #ddd;
  border-bottom: none;
  border-radius: 5px 5px 0px 0px;
}
.cud-common-operate-delete {
  color: #ec6c00;
  margin-right: 10px;
  font-weight: 500;
  font-size: 14px;
}
/deep/ .el-table--border th {
  border-right: 1px solid #ebebeb;
}
/deep/ th:first-child .cell {
  padding-left: 12px;
}
.act-warpper {
  margin-left: 15px;
}
.act-close {
  position: absolute;
  top: 50%;
  left: 5px;
  .act-close-btn {
    width: 20px;
    .el-icon {
      margin-left: -5px;
    }
  }
}
.ccNoticeFlag {
  margin-top: 5px;
}
</style>
