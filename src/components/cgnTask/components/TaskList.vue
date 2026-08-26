<template>
  <div class="task-tab-content">
    <!-- 查询条件 -->
    <!-- <new-query
      class="cud-office-search-block"
      ref="queryDialog"
      :fields="queryFields"
      :moreMenus="moreMenus"
      :currentTabName="currentTabName"
      @submit="submitQueryForm"
      @onMoreMenuCommand="onMoreMenuCommand"
      @resizeTableHeight="resizeTableHeight"
    >
    </new-query> -->
    <query-form
      :queryFormId="'offce_task_list'"
      :queryFields="queryFields"
      :loading="loading"
      @resize="resizeTableHeight"
      @submit="submitQueryForm"
      ref="queryDialog"
      class="cud-commom-form-search"
    >
    </query-form>
    <!-- 卡片布局 -->
    <div class="cud-card-view" v-if="displayCard === 'card'">
      <div class="cud-card-list">
        <div v-for="(item, index) in data" :key="item.id" class="cud-card-item"
          :style="{ animationDuration: 0.5 + index % 20 * 0.05 + 's' }">
          <div class="icon" @click="onTaskViewFlowChart(item)">
            <span class="cud3-icon-blue font_family icon-icon_workplace_flowchart"></span>
          </div>
          <div class="title">{{ item.procSubject }}</div>
          <div class="desc">
            <p>{{ $t('workbench.act_name') }}：{{ item.procActName }}</p>
            <p>{{ $t('pw.sender') }}：　{{ item.startUserIdName }}</p>
            <!-- <p>{{ $t('cgnTask.toDoList.assignTime') }}：{{ item.startTime }}</p> -->
            <p>{{ $t("cgnTask.toDoList.assignTime") }}：{{ item | fieldValue("assignTime", $i18n) }}</p>          </div>
          <div class="button">
            <el-button @click="$emit('openTaskForm', item)">查看</el-button>
            <el-button @click="onTaskCc(item)">{{ $t("cgnTask.operate.ccTask") }}</el-button>
            <el-button @click="onTaskDetegate(item)">{{ $t("cgnTask.operate.detegateTask") }}</el-button>
          </div>
        </div>
      </div>
      <!-- <div class="cud-card-more" v-if="data.length && data.length > 0">
        <el-button size="small" @click="scrollTop" icon="el-icon-arrow-up">返回顶部</el-button>
        <el-button size="small" @click="loadingMore" icon="el-icon-more" :loading="loading">加载更多</el-button>
      </div> -->
      <div style="clear: both;"></div>
      <div class="cud-card-top" @click="scrollTop" v-if="showScrollTop && data.length > 0">
        <img :src="require('@/assets/img/rocket.svg')" />
        <span>返回顶部</span>
      </div>
      <div class="el-table__empty-block" v-if="data.length == 0" v-loading="loading">
        <span class="el-table__empty-text">暂无数据</span>
      </div>
    </div>
    <!-- 查询结果 -->
    <div
      class="query-result cud__table--list"
      :style="{ height: getComputedHeight + 'px' }"
      v-if="displayCard === 'table'"
    >
      <!-- 表格 -->
      <el-table
        highlight-current-row
        header-row-class-name="cud-office-table-header"
        v-loading="loading"
        border
        stripe
        :data="data"
        :max-height="getComputedHeight"
        class="cud-office-table"
        :default-sort="{ prop: 'assignTime', order: 'descending' }"
        @cell-mouse-enter="cellMouseEnter"
        @cell-mouse-leave="cellMouseLeave"
      >
        <!-- 优先级 -->
        <!-- <el-table-column width="130" align="left" class-name="vertical-align-top">
          <template slot-scope="scope">
            <div :class="['cud-task-priority', $options.filters.priorityClass(scope.row.priority)]">{{$t(getRowPriority(scope.row.priority))}}·{{$t('cgnTask.field.priority')}}</div>
          </template>
        </el-table-column> -->
        <!-- 流程图 -->
        <el-table-column width="70" align="center" :label="$t('pw.proc_pic')">
          <template slot-scope="scope">
            <div
              class="cud-table-process-border"
              @click="onTaskViewFlowChart(scope.row)"
            >
              <span
                class="cud3-icon-blue font_family icon-icon_workplace_flowchart"
              ></span>
            </div>
          </template>
        </el-table-column>
        <!-- 工作主题 -->
        <el-table-column
          min-width="240"
          show-overflow-tooltip
          :label="$t('cgnBpmn.field.procSubject')"
        >
          <template slot-scope="scope">
            <div class="task-subject cud-task-subject">
              <el-tooltip placement="top" effect="light">
                <div slot="content">
                  {{ $t("cgnTask.tips.taskBy") }}[{{
                    scope.row.fromUserIdTransfer
                  }}]{{ scope.row.fromUserNameTransfer
                  }}{{ $t("cgnTask.operate.detegateTask") }}
                </div>
                <el-tag
                  v-if="scope.row.task === '1'"
                  style="width: 46px; border: 0"
                  >{{ $t("cgnTask.operate.detegateTask") }}</el-tag
                >
              </el-tooltip>
              <el-tooltip placement="top" effect="light">
                <div slot="content">
                  {{ $t("cgnTask.tips.taskBy") }}[{{
                    scope.row.fromUserIdTransfer
                  }}]{{ scope.row.fromUserNameTransfer
                  }}{{ $t("cgnTask.operate.transferTask") }}
                </div>
                <el-tag
                  v-if="scope.row.task === '2'"
                  style="width: 46px; border: 0"
                  >{{ $t("cgnTask.operate.transferTask") }}</el-tag
                >
              </el-tooltip>
              <el-tooltip placement="top" effect="light">
                <div slot="content">
                  {{ $t("cgnTask.tips.taskBy") }}[{{
                    scope.row.fromUserIdDelegation
                  }}]{{ scope.row.fromUserNameDelegation
                  }}{{ $t("cgnTask.operate.delegation") }}
                </div>
                <el-tag
                  v-if="scope.row.task === '3'"
                  style="width: 46px; border: 0"
                  >{{ $t("cgnTask.operate.delegation") }}</el-tag
                >
              </el-tooltip>
              <el-tooltip placement="top" effect="light">
                <div slot="content">
                  {{ $t("cgnTask.tips.taskBy") }}[{{
                    scope.row.sentByUserId
                  }}]{{ scope.row.sentByUserName }}退回
                </div>
                <el-tag
                  v-if="
                    scope.row.sentByApprovalAction === '退回重新审批' ||
                      scope.row.sentByApprovalAction === '退回后返回'
                  "
                  style="width: 46px; border: 0"
                  >退回</el-tag
                >
              </el-tooltip>
              <el-button
                type="text"
                @click="$emit('openTaskForm', scope.row)"
                >{{ scope.row.procSubject }}</el-button
              >
            </div>
            <div class="cud-task-fields">
              <div
                class="cud-task-field-item-wrap"
                style="cursor: pointer"
                v-if="
                  scope.row.abstract &&
                    scope.row.abstract['actAbstractShow'] === 1
                "
                @click="digest(scope.row)"
              >
                <span class="cud-task-field-item">
                  <span class="task-field-name"
                    >{{ $t("cgnTask.field.abstract") }}：</span
                  >
                  <el-tooltip placement="bottom" effect="light">
                    <div
                      slot="content"
                      v-html="scope.row.abstract['actAbstractContext']"
                    ></div>
                    <div
                      class="task-field-value"
                      v-html="scope.row.abstract['actAbstractContext']"
                      style="display: inline-flex; height: 16px"
                    ></div>
                  </el-tooltip>
                </span>
              </div>
            </div>
          </template>
        </el-table-column>
        <!-- 优先级暂时注释 -->
        <el-table-column
          min-width="65"
          align="left"
          :label="$t('cgnTask.field.priority')"
        >
          <template slot-scope="scope">
            <span>{{ $t(getRowPriority(scope.row.priority)) }}</span>
          </template>
        </el-table-column>
        <!-- 循环的psc给的字段fieldReturnDtoList,暂时通过v-if隐藏了 -->
        <template v-for="(field, fieldIndex) in fieldSettings">
          <el-table-column
            :min-width="field.fieldKey === 'assignTime' ? '155' : 120"
            show-overflow-tooltip
            v-if="
              field.fieldKey !== 'procDefName' &&
                field.fieldKey !== 'startUserIdName' &&
                field.fieldKey !== 'testFiled' &&
                field.fieldKey !== 'assignTime'
            "
            align="left"
            :key="fieldIndex"
            :label="$t(getFieldName(field.fieldKey))"
          >
            <template slot-scope="scope">
              {{ scope.row | fieldValue(field.fieldKey, $i18n) }}
            </template>
          </el-table-column>
        </template>
        <!-- 到达时间 -->
        <el-table-column
          show-overflow-tooltip
          min-width="110"
          align="left"
          :label="$t(getFieldName('assignTime'))"
          sortable
          prop="assignTime"
        >
        </el-table-column>
        <!-- 流程名称 -->
        <el-table-column
          show-overflow-tooltip
          min-width="110"
          align="left"
          :label="$t('pw.procName')"
        >
          <template slot-scope="scope">
            <span>{{ scope.row | fieldValue("procDefName", $i18n) }}</span>
          </template>
        </el-table-column>
        <!-- 发送者 -->
        <el-table-column
          show-overflow-tooltip
          min-width="150"
          align="left"
          :label="$t('pw.sender')"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.startUserIdName }}</span>
            <div
              v-if="active == scope.row.id && !actionButtonDisplay"
              class="btn-posHeight-css"
            >
              <el-button
                v-if="indexProvide.rights.indexOf('cc') >= 0 && showBtn('cc')"
                class="cellbtn"
                type="primary"
                size="mini"
                @click="onTaskCc(scope.row)"
                >{{ $t("cgnTask.operate.ccTask") }}</el-button
              >
              <el-button
                v-if="
                  indexProvide.rights.indexOf('detegate') >= 0 &&
                    showBtn('detegate')
                "
                class="cellbtn"
                type="primary"
                style="margin-left: 5px"
                size="mini"
                @click="onTaskDetegate(scope.row)"
                >{{ $t("cgnTask.operate.detegateTask") }}</el-button
              >
            </div>
          </template>
        </el-table-column>
        <!-- 操作 -->
        <el-table-column
          v-if="
            actionButtonDisplay &&
              (showBtn('unclaim') || showBtn('cc') || showBtn('detegate'))
          "
          min-width="120"
          align="left"
          class-name="task-oprate cud-task-oprate"
          :label="$t('cm.operate')"
          fixed="right"
        >
          <div slot-scope="scope">
            <!-- 取消认领（共享任务可操作） -->
            <el-button
              size="small"
              v-if="
                indexProvide.rights.indexOf('unclaim') >= 0 &&
                  scope.row.isShareTask == 1 &&
                  showBtn('unclaim')
              "
              type="text"
              :title="$t('cgnTask.operate.unclaimTask')"
              @click="onTaskUnclaim(scope.row)"
              >{{ $t("cgnTask.operate.unclaimTask") }}</el-button
            >
            <!-- 抄送 -->
            <el-button
              size="small"
              v-if="indexProvide.rights.indexOf('cc') >= 0 && showBtn('cc')"
              type="text"
              :title="$t('cgnTask.operate.ccTask')"
              @click="onTaskCc(scope.row)"
              >{{ $t("cgnTask.operate.ccTask") }}</el-button
            >
            <!-- 取消委托 -->
            <el-button
              size="small"
              @click="cancelFn(scope.row.id)"
              v-if="scope.row.taskExtend05 && scope.row.taskExtend05 !== '0'"
              type="text"
              title="取消委托"
              >取消委托</el-button
            >
            <!-- 委托 -->
            <el-button
              size="small"
              v-if="
                indexProvide.rights.indexOf('detegate') >= 0 &&
                  showBtn('detegate') &&
                  (!scope.row.taskExtend05 || scope.row.taskExtend05 === '0')
              "
              type="text"
              :title="$t('cgnTask.operate.detegateTask')"
              @click="onTaskDetegate(scope.row)"
              >{{ $t("cgnTask.operate.detegateTask") }}</el-button
            >

            <!--批量审批-->
            <el-button
              size="small"
              v-if="
                scope.row.isMultiProc == 1 &&
                  indexProvide.rights.includes('batch_approval') &&
                  showBtn('batch_approval')
              "
              type="text"
              :title="$t('cgnTask.operate.batch_approval')"
              @click="onTaskBatchApproval(scope.row)"
              >{{ $t("cgnTask.operate.batch_approval") }}</el-button
            >
          </div>
        </el-table-column>
      </el-table>
    </div>
    <div class="cud-special-pagination" style="margin-bottom: 0" v-if="displayCard === 'table'">
      <!-- 分页 -->
      <el-pagination
        popper-class="cud-pager-dropdown"
        class="cud__page float-right"
        :layout="pagination.layout"
        :page-sizes="pagination.pageSizes"
        :page-size="pagination.pageSize"
        :pager-count="5"
        :current-page="pagination.pageNum"
        :total="pagination.total"
        :disabled="loading"
        @size-change="pageSize => queryTaskList(1, pageSize)"
        @current-change="pageNum => queryTaskList(pageNum)"
      >
      </el-pagination>
    </div>
    <!-- 任务抄送弹窗 -->
    <task-cc-dialog
      v-if="taskCcDialog.isOpen"
      v-bind="taskCcDialog"
      :emailMessageShow="emailMessageShow"
      :shortMessageShow="shortMessageShow"
      :dingMessageShow="dingMessageShow"
      :emailMessageTrue="emailMessageTrue"
      :shortMessageTrue="shortMessageTrue"
      :dingMessageTrue="dingMessageTrue"
      @closeDialog="closeTaskCcDialog"
    >
    </task-cc-dialog>

    <!-- 任务委托弹窗 -->
    <task-detegate-dialog
      v-if="taskDetegateDialog.isOpen"
      v-bind="taskDetegateDialog"
      :emailMessageShow="emailMessageShow"
      :shortMessageShow="shortMessageShow"
      :dingMessageShow="dingMessageShow"
      :emailMessageTrue="emailMessageTrue"
      :shortMessageTrue="shortMessageTrue"
      :dingMessageTrue="dingMessageTrue"
      @closeDialog="closeTaskDetegateDialog"
      @successFn="ccSuccessFn"
    >
    </task-detegate-dialog>

    <!--批量审批弹窗-->
    <task-batch-approval-dialog
      v-if="taskBatchApprovalDialog.isOpen"
      v-bind="taskBatchApprovalDialog"
      :emailMessageShow="emailMessageShow"
      :shortMessageShow="shortMessageShow"
      :dingMessageShow="dingMessageShow"
      :emailMessageTrue="emailMessageTrue"
      :shortMessageTrue="shortMessageTrue"
      :dingMessageTrue="dingMessageTrue"
      @closeDialog="closeTaskBatchApprovalDialog"
      @successFn="batchApprovalSuccessFn"
      @viewFlowChart="onTaskViewFlowChart"
      @openTaskForm="row => openTaskForm(row)"
    ></task-batch-approval-dialog>

    <el-dialog
      title="取消委托"
      width="640px"
      :visible.sync="cancelVisible"
      :destroy-on-close="true"
      :close-on-click-modal="false"
      class="task-dialog"
      v-dragMove="{
        DragButton: '.el-dialog__header',
        DragWindow: '.el-dialog'
      }"
    >
      <el-form
        :model="cancelFormData"
        label-width="120px"
        label-position="right"
      >
        <el-form-item label="当前委托人">
          <el-checkbox
            :indeterminate="isIndeterminate"
            v-model="checkAll"
            @change="handleCheckAllChange"
            >全选</el-checkbox
          >
          <div style="margin: 15px 0;"></div>
          <el-checkbox-group
            v-model="cancelFormData.assigneeList"
            @change="handleCheckedAssigneeListChange"
          >
            <el-checkbox
              v-for="item in assigneeList"
              :label="'[' + item.userId + ']' + item.userName"
              :key="item.userId"
              >{{ "[" + item.userId + "]" + item.userName }}</el-checkbox
            >
          </el-checkbox-group>
        </el-form-item></el-form
      >
      <div slot="footer" class="dialog-footer" align="center">
        <el-button size="small" @click="handleAssigneeClose">{{
          $t("cgnCommon.cancel")
        }}</el-button>
        <el-button
          size="small"
          type="primary"
          @click="handleAssignee"
          :loading="btnLoading"
          >{{ $t("cgnCommon.commit") }}</el-button
        >
      </div></el-dialog
    >
    <el-dialog
      :title="$t('cgnTask.operate.quickApproval')"
      :visible.sync="digestVisible"
      :destroy-on-close="true"
      :close-on-click-modal="false"
      class="task-dialog"
      v-dragMove="{
        DragButton: '.el-dialog__header',
        DragWindow: '.el-dialog'
      }"
    >
      <el-form :model="formData" label-width="120px" label-position="right">
        <el-form-item :label="$t('cgnTask.field.transferMode')">
          <el-radio-group
            v-model="formData.selectedMode"
            @change="changeCirclationMode"
            :disabled="radioDisable"
          >
            <el-radio
              v-for="(item, index) in circlationModeDataList"
              :key="index"
              :label="item.label"
              >{{ $t(item.value) }}</el-radio
            >
          </el-radio-group>
        </el-form-item>
        <!-- 邮件发送 -->
        <el-form-item
          :label="$t('cgnTask.field.noticeMethods')"
          v-if="!this.formData.end"
        >
          <el-checkbox-group v-model="noticeMethods">
            <el-checkbox label="1">{{
              $t("cgnTask.field.emailMessage")
            }}</el-checkbox>
            <el-checkbox label="2">{{
              $t("cgnTask.field.shortMessage")
            }}</el-checkbox>
            <el-checkbox label="3">{{ $t("flow.dingMessage") }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <div v-show="formData.selectedMode === '1'">
          <el-form-item
            :label="$t('cgnTask.field.submitOpinion')"
            style="height: 140px"
          >
            <el-input
              type="textarea"
              style="width: 85%"
              :placeholder="$t('cgnTask.tips.submitCommentNotEmpty')"
              minlength="0"
              maxlength="160"
              rows="3"
              show-word-limit
              v-model="formData.commentText"
              v-on:blur="getCommentText"
            ></el-input>
          </el-form-item>
          <!-- <el-form-item label="常用词条" >
            <el-tag class="tagMargin" v-for="(item, index) in commonTermsList"
                :key="index"
                v-on:click="addCommentText(item)"
                >{{ item }}</el-tag>
          </el-form-item> -->
          <el-form-item :label="$t('cgnTask.field.targetAct')">
            <el-tag
              :class="actIndex === index ? 'tagMarginClick' : 'tagMargin'"
              v-for="(item, index) in formData.targetActList"
              :key="index"
              @click="tagHandle(index)"
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
          </el-form-item>
          <el-form-item
            v-show="isCosign"
            :label="$t('cgnTask.field.cosignItem')"
          >
            <el-tag
              :class="cosignIndex === index ? 'tagMarginClick' : 'tagMargin'"
              v-for="(item, index) in cosignList"
              :key="index"
              @click="tagCosignHandle(index)"
            >
              {{ item.name }}
            </el-tag>
          </el-form-item>
          <el-form-item
            :label="$t('cgnTask.field.approver')"
            v-if="!this.formData.end"
          >
            <el-tag
              class="tagMarginClick"
              v-for="(item, index) in aproverUsers"
              :key="index"
              :closable="delActPerson || delAssigneePerson"
              @close="handleDelPerson(index)"
              >{{ item }}</el-tag
            >
            <el-button
              type="primary"
              icon="el-icon-plus"
              size="small"
              v-if="addActPerson || addAssigneePerson"
              @click="openCreatorFunc"
            ></el-button>
          </el-form-item>
        </div>
        <div v-if="formData.selectedMode === '2'">
          <el-form-item
            :label="$t('cgnTask.field.currentProcAct') + $t('cgnCommon.colon')"
          >
            <label class="el-form-item__label">{{
              currentProcAct
                | processName($i18n, "procActName", "procActEnName")
            }}</label>
          </el-form-item>
          <!-- 退回环节 -->
          <el-form-item
            :label="$t('cgnTask.field.sendBackProcAct') + $t('cgnCommon.colon')"
            prop="targetActId"
          >
            <el-select
              v-model="formData.targetActId"
              @change="onTargetActSelectChange"
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
          <!-- 退回会签项（有可退回的会签项时显示） -->
          <el-form-item
            v-if="
              formData.backTargetActList &&
                formData.backTargetActList.cosignItemList &&
                formData.backTargetActList.cosignItemList.length > 0 &&
                formData.backTargetActList.approvalMode === 0
            "
            :label="
              $t('cgnTask.field.sendBackCosignItem') + $t('cgnCommon.colon')
            "
            prop="cosignItemId"
          >
            <el-select
              v-model="formData.cosignItemId"
              @change="onCosignItemSelectChange"
            >
              <el-option
                v-for="item in formData.backTargetActList.cosignItemList"
                :key="item.code"
                :label="item.name"
                :value="item.code"
              ></el-option>
            </el-select>
          </el-form-item>
          <!-- 处理人 -->
          <el-form-item
            v-if="formData.sendBackUsers.length > 0"
            :label="$t('cgnTask.field.sendBackUser') + $t('cgnCommon.colon')"
            prop="sendBackUsers"
          >
            <el-tag v-for="(item, index) in formData.sendBackUsers" :key="index"
              >[{{ item.userID }}]{{ item.userName }}</el-tag
            >
          </el-form-item>
          <!-- 退回方式 -->
          <el-form-item
            :label="$t('cgnTask.field.sendBackAction') + $t('cgnCommon.colon')"
            prop="approvalAction"
          >
            <el-radio-group
              v-model="formData.approvalAction"
              :disabled="approvalFlg"
              @change="onApprovalActionSelectChange"
            >
              <el-radio :label="0">{{
                $t("cgnTask.sendBackAction.forReApproval")
              }}</el-radio>
              <el-radio :label="1">{{
                $t("cgnTask.sendBackAction.forReturn")
              }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item
            :label="$t('cgnTask.field.sendBackOpinion') + $t('cgnCommon.colon')"
            prop="comment"
          >
            <el-input
              type="textarea"
              :placeholder="$t('cgnTask.tips.sendBackOpinionNotEmpty')"
              minlength="0"
              maxlength="160"
              rows="5"
              v-model="formData.comment"
              v-on:blur="getCommentText"
            ></el-input>
          </el-form-item>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="handleDigestClose">{{
          $t("cgnCommon.cancel")
        }}</el-button>
        <el-button
          size="small"
          type="primary"
          @click="handleCommitForm"
          :loading="btnLoading"
          >{{ $t("cgnCommon.commit") }}</el-button
        >
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
import * as Utils from "@/utils/Utils";
import { throttle } from "@/utils/funcUtil";
// import NewQuery from "./dialog/NewQuery";
// import TaskCcDialog from "./dialog/TaskCcDialog";
// import TaskDetegateDialog from "./dialog/TaskDetegateDialog";
import api from "../common/ApiTask";
import cmsg from "@/components/common/message";
import { hasPermission } from "@/permission/btn";
// import wfCommPersonComponent from "@@/components/cudCommPersonComponent/wfCommPersonComponent.vue";
import queryForm from "@/components/common/queryForm";
import { calcHeight } from "@/utils/funcUtil";

/**
 * 待办任务列表
 */
export default {
  name: "CgnTaskCenterTaskList",
  components: {
    // NewQuery,
    // TaskCcDialog,
    // TaskDetegateDialog
    queryForm
  },
  inject: [
    // 祖先组件注入参数
    "indexProvide" // Index注入参数
  ],
  props: {
    showQuery: { type: Boolean, default: false }, // 是否显示查询表单
    taskCount: { type: Number, default: 0 }, // 任务数量
    taskCountLoading: { type: Boolean, default: false }, // 是否统计任务数量完成
    pageSize: { type: Number, default: 10 }, // 每页笔数
    handleDatas: { type: Function, default: (datas, fieldSettings) => {} }, // 处理数据列表回调方法
    moreMenus: { type: Object, default: () => {} },
    currentTabName: { type: String, default: "" },
    displayCard: { type: String, default: "table" },
    showScrollTop: { type: Boolean, default: false }
  },
  data() {
    return {
      active: "",
      showDialog: false,
      // 邮件单选结束
      loading: false,
      initUserId: "",
      actionButtonDisplay: true, // 行按钮操作
      tableLayout: "", // 表格布局
      cellHeight: "8px",
      // queryFields: [
      //   "procSubject",
      //   "startUser",
      //   "startDept",
      //   "procDefName",
      //   "assignTimeForArrival",
      //   "procCategory",
      //   "priority",
      //   "taskOrderBy",
      // ],
      queryFields: [
        {
          name: "procDefName",
          label: "",
          labelKey: "流程名称",
          value: "",
          type: "input",
          display: true,
          order: 1
        },
        {
          name: "procSubject",
          label: "",
          labelKey: "工作主题",
          value: "",
          type: "input",
          display: true,
          order: 2
        },
        {
          name: "startUserId",
          label: "",
          labelKey: "cgnTask.field.startUser",
          value: "",
          type: "personal",
          display: true,
          order: 3
        },
        {
          name: "priority",
          label: "",
          labelKey: "cgnTask.field.priority",
          value: "",
          type: "select",
          display: true,
          order:4,
          fieldMap: Utils.Options.priority
        },
        {
          name: "taskOrderBy",
          label: "",
          labelKey: "cgnTask.field.startTimeOrder",
          value: "0",
          type: "select",
          display: true,
          order: 5,
          fieldMap: Utils.Options.startTimeOrder
        },
        {
          name: "startAssignTime",
          label: "",
          labelKey: "cgnTask.field.arrivalTime",
          relation: "endAssignTime",
          value: "",
          type: "dateRange",
          display: true,
          order: 6
        }
      ],
      queryForm: {
        // 查询表单
        procSubject: "", // 任务主题
        startUserId: "", // 发起人
        startDeptId: "", // 发起人部门ID
        procDefName: "", // 流程名称
        startAssignTime: "", // 任务分派开始时间
        endAssignTime: "", // 任务分派结束时间
        procCategoryId: "", // 流程分类ID
        priority: "", // 优先级
        taskOrderBy: "0" // 任务开始时间排序
      },
      noticeMethods: [], // 邮件单选
      data: [], // 查询结果
      fieldSettings: [], // 查询结果字段设定
      pagination: {
        // 分页参数
        layout: Utils.Pagination.layout,
        pageSizes: Utils.Pagination.pageSizes,
        pageSize: this.pageSize,
        pageNum: 1,
        total: 0
      },
      taskCcDialog: {
        // 任务抄送弹窗
        isOpen: false,
        procInstId: "", // 流程实例ID，必填
        procActInstId: "", // 流程环节实例ID，必填
        isPromptSuccess: false, // 是否提示成功信息（设置不提示，由工具条调用方提示）
        procTaskId: "", // 任务ID，必填
        procActId: "" // 环节ID，必填
      },
      taskDetegateDialog: {
        // 任务委托弹窗
        isOpen: false,
        procInstId: "", // 流程实例ID，必填
        procActInstId: "", // 流程环节实例ID，必填
        isPromptSuccess: false, // 是否提示成功信息（设置不提示，由工具条调用方提示）
        procTaskId: "", // 任务ID，必填
        procActId: "" // 环节ID，必填
      },
      computedHeight: 0,
      digestData: {
        procInstId: "",
        procId: "",
        actId: "",
        dataModelId: ""
      },
      digestVisible: false,
      cancelVisible: false,
      isIndeterminate: true,
      procTaskId: "",
      checkAll: false,
      circlationModeDataList: [
        { value: "cgnTask.operate.submitProcess", label: "1" },
        { value: "cgnTask.operate.sendBackTask", label: "2" }
      ],
      commonTermsList: [
        "同意，请速办",
        "同意，完成后请通知我",
        "拒绝，不符合工作要求",
        "请办理",
        "请审核",
        "已阅"
      ],
      formData: {
        selectedMode: "",
        commentText: "",
        targetActId: "", // 退回环节ID
        targetAct: null, // 退回环节信息
        cosignItemId: "", // 退回会签项ID
        cosignItem: null, // 退回会签项信息
        sendBackUsers: [], // 退回处理人
        approvalAction: 0, // 退回方式
        comment: "", // 退回意见
        targetActList: [],
        backTargetActList: [],
        noticeMethods: ""
      },
      cancelFormData: {
        assigneeList: []
      },
      assigneeList: [],
      aproverUsers: [],
      cosignIndex: 0, //点击的会签类型序号
      actIndex: 0, //点击的目标环节的序号
      delActPerson: false, // 由上一个环节进入是否可以删除已经配置的负责人
      addActPerson: false, // 由上一个环节进入是否可以添加多个负责人
      delAssigneePerson: false, // 是否可以允许删除会签项负责人
      addAssigneePerson: false, // 是否可以允许会签项添加多个负责人
      actName: "",
      isCosign: false,
      cosignList: [],
      radioDisable: false,
      ACT_TYPE: Utils.Constant.ACT_TYPE, // 环节类型
      currentProcAct: {
        // 当前环节信息
        id: "", // 环节实例ID
        procActId: "", // 环节ID
        procActName: "", // 环节名称
        procActEnName: "" // 环节英文名称
      },
      goBackActOptions: [],
      approvalFlg: false,
      btnLoading: false,
      dingMessageShow: false,
      emailMessageShow: false,
      shortMessageShow: false,
      emailMessageTrue: false,
      shortMessageTrue: false,
      dingMessageTrue: false,

      taskBatchApprovalDialog: {
        isOpen: false,
        procDefName: "", // 流程名称
        taskOrderBy: ""
      }
    };
  },
  filters: Utils.Filters,
  mounted() {
    // 缓存查询表单值
    this.queryForm = Object.assign(
      this.queryForm,
      this.$refs.queryDialog.getQueryForm()
    );

    // this.updateTaskCount();
    // this.resizeTableHeight();

    // throttleFunc记录当前的节流方法，用于在页面销毁时释放
    this.throttleFunc = throttle(this.resizeTableHeight, 500);
    window.addEventListener("resize", this.throttleFunc);

    // this.actionButtonDisplay =
    //   this.tableConfig.actionButtonDisplay !== "fixed" ? false : true;
  },
  computed: {
    getComputedHeight() {
      return this.computedHeight;
    },
    tableConfig() {
      if (sessionStorage.getItem("userSetting")) {
        return JSON.parse(sessionStorage.getItem("userSetting")).tableSettings;
      } else {
        return {};
      }
    }
  },
  watch: {
    /**
     * 切换语言时重新查询表单
     */
    "$i18n.locale"() {
      this.queryTaskList();
    },
  },
  methods: {
    // 鼠标移入行事件
    cellMouseEnter(row, column, cell, event) {
      this.active = row.id;
    },
    cellMouseLeave() {
      this.active = "";
    },
    showBtn(btn) {
      return hasPermission(btn);
    },
    // 打开新增人模态框
    openCreatorFunc() {
      this.showDialog = true;
    },
    // 关闭新增人模态框
    closeCreatorFunc() {
      this.showDialog = false;
    },
    // 选人回调
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
            this.initUserId = userDataIdsStr;
            let userDataIds = userDataIdsStr.split(";");
            let userDataNames = userDataNamesStr.split(";");
            for (let i = 0; i < userDataIds.length; i++) {
              let setData = true;
              if (this.addActPerson) {
                this.formData.targetActList[this.actIndex].assigneeList.forEach(
                  data => {
                    if (data.userID === userDataIds[i]) {
                      setData = false;
                    }
                  }
                );
              }
              if (this.addAssigneePerson) {
                this.cosignList[this.cosignIndex].cosignerList.forEach(data => {
                  if (data.userID === userDataIds[i]) {
                    setData = false;
                  }
                });
              }
              //不存在的添加
              if (setData) {
                let participantData = {};
                participantData.userID = userDataIds[i];
                participantData.userName = userDataNames[i];
                this.aproverUsers.push(
                  "[" + participantData.userID + "]" + participantData.userName
                );
                if (this.addActPerson) {
                  this.formData.targetActList[this.actIndex].assigneeList.push(
                    participantData
                  );
                }
                if (this.addAssigneePerson) {
                  this.cosignList[this.cosignIndex].cosignerList.push(
                    participantData
                  );
                }
              }
            }
          }
        }
      }
      this.showDialog = false;
    },
    //删除环节处理人
    handleDelPerson(index) {
      if (this.delActPerson) {
        if (
          this.formData.targetActList[this.actIndex].assigneeList.length == 1
        ) {
          this.$message.warning(this.$t("cgnTask.tips.leastApprover"));
          return;
        }
        this.formData.targetActList[this.actIndex].assigneeList.splice(
          index,
          1
        );
      }
      if (this.delAssigneePerson) {
        if (this.cosignList[this.cosignIndex].cosignerList.length == 1) {
          this.$message.warning(this.$t("cgnTask.tips.leastApprover"));
          return;
        }
        this.cosignList[this.cosignIndex].cosignerList.splice(index, 1);
      }
      this.aproverUsers.splice(index, 1);
    },
    resizeTableHeight() {
      calcHeight(this, 6);
    },
    resetSeniorSearch() {
      this.$refs.queryDialog.resetSeniorSearch();
    },
    onMoreMenuCommand() {
      this.$emit("onMoreMenuCommand");
    },
    /**
     * 隐藏查询表单
     */
    hideQueryForm() {
      this.$emit("update:showQuery", false);
    },

    /**
     * 提交查询表单
     */
    submitQueryForm() {
      // 缓存查询表单值，并提交查询表单
      this.queryForm = Object.assign(
        this.queryForm,
        this.$refs.queryDialog.getQueryForm()
      );
      this.queryTaskList(1);
    },

    /**
     * 请求API，更新任务数量
     */
    updateTaskCount() {
      let that = this;
      that.$emit("requestApi", function(requestApi, requestApiBasic) {
        let requestParams = {
          parameter: ""
        };

        // 请求API
        that.$emit("update:taskCount", 0);
        that.$emit("update:taskCountLoading", true);
        requestApi
          .countTask(requestParams)
          .then(res => {
            that.$emit("update:taskCountLoading", false);
            if (res.status == 200 && res.data.code == 0) {
              that.$emit("update:taskCount", res.data.data);
            }
          })
          .catch(err => {
            that.$emit("update:taskCountLoading", false);
          });
      });
    },

    /**
     * 请求API，查询任务列表
     */
    queryTaskList(pageNum, pageSize) {
      let that = this;
      //防重点击
      // if (that.loading) {
      //   that.$message({ type: 'warning', message: that.$t('cm.system_is_processing') });
      //   return;
      // }
      // 更新分页参数
      that.pagination.pageNum = pageNum || that.pagination.pageNum;
      that.pagination.pageSize = pageSize || that.pagination.pageSize;

      that.$emit("requestApi", function(
        requestApi,
        requestApiBasic,
        { priority, taskOrderBy, languageType }
      ) {
        that.taskBatchApprovalDialog.taskOrderBy = taskOrderBy;
        // 清空查询显示
        that.data = [];
        that.fieldSettings = [];
        // 获取查询参数
        let requestParams = Object.assign(
          {
            taskOrderBy: taskOrderBy, // 排序方式 0-任务分派时间降序 1-任务分派时间升序
            pageIndex: that.pagination.pageNum,
            pageSize: that.pagination.pageSize,
            priority: priority
          },
          that.queryForm
        );
        // 请求API
        that.loading = true;
        requestApi
          .queryTask(requestParams)
          .then(res => {
            that.loading = false;
            if (res.status == 200 && res.data.code == 0) {
              // 更新前回调处理数据列表方法
              let dataList = res.data.data.page.records;
              let fieldSettings = res.data.data.fieldReturnDtoList;
              if (that.handleDatas instanceof Function) {
                that.handleDatas(dataList, fieldSettings);
              }
              that.data = dataList; // 更新查询结果
              that.pagination.total = res.data.data.page.total; // 更新分页总数
              that.fieldSettings = fieldSettings; // 更新字段显示设置
              that.$emit("update:taskCountLoading", false); // 关闭任务数量Loading提示
              that.$emit("update:taskCount", res.data.data.page.total);
              // 隐藏查询表单
              //that.hideQueryForm();
            }
          })
          .catch(err => {
            that.loading = false;
            that.$emit("update:taskCountLoading", false);
          });
      });
    },

    /**
     * 任务操作：查看流程图
     */
    onTaskViewFlowChart(row) {
      this.$emit("viewFlowChart", row);
    },

    /**
     * 任务操作：取消认领
     */
    onTaskUnclaim(row) {
      let that = this;
      // 预定义请求API执行的方法
      let requestApiFun = function(requestApi, requestApiBasic) {
        // 获取提交参数
        requestApiBasic.processId = row.procDefId;
        let requestParams = {
          taskId: row.id
        };

        // 请求API
        that.loading = true;
        requestApi
          .unClaimTask(requestParams)
          .then(res => {
            that.loading = false;
            if (res.status == 200 && res.data.code == 200) {
              that.$message.success(that.$t("cgnTask.tips.unclaimTaskSuccess"));
              // 通知任务状态变更，并重新查询任务列表
              that.$emit("taskStatusChange");
              that.queryTaskList();
            } else {
              that.$message.error(res.data.message);
            }
          })
          .catch(err => {
            that.loading = false;
          });
      };

      // 执行前，询问用户是否确认操作
      that
        .$confirm(
          that.$t("cgnTask.tips.confirmUnclaimTask"),
          that.$t("cgnCommon.tips"),
          {
            confirmButtonText: that.$t("cgnCommon.confirm"),
            cancelButtonText: that.$t("cgnCommon.cancel"),
            type: "warning"
          }
        )
        .then(() => {
          // 点击确认，则回调执行方法，并传入输入备注
          that.$emit("requestApi", requestApiFun);
        })
        .catch(() => {});
    },

    /**
     * 任务操作：抄送
     */
    onTaskCc(row) {
      if (row.formUrl) {
        this.taskCcDialog.procInstId = row.procInstId; // 流程实例ID，必填
        this.taskCcDialog.procActInstId = row.procActInstId; // 流程环节实例ID，必填
        this.taskCcDialog.procTaskId = row.id; // 任务ID，必填
        this.taskCcDialog.procActId = row.procActId; // 环节ID，必填
        this.taskCcDialog.isPromptSuccess = true;
        this.taskCcDialog.isOpen = true;
      } else {
        this.loading = true;
        api
          .getProcFormExamineTool({
            procInstId: row.procInstId
          })
          .then(res => {
            this.loading = false;
            if (res.data.code === "0") {
              this.dingMessageShow = res.data.data.dingMessageShow;
              this.emailMessageShow = res.data.data.emailMessageShow;
              this.shortMessageShow = res.data.data.shortMessageShow;
              this.emailMessageTrue = res.data.data.emailMessageTrue;
              this.shortMessageTrue = res.data.data.shortMessageTrue;
              this.dingMessageTrue = res.data.data.dingMessageTrue;
              this.taskCcDialog.procInstId = row.procInstId; // 流程实例ID，必填
              this.taskCcDialog.procActInstId = row.procActInstId; // 流程环节实例ID，必填
              this.taskCcDialog.procTaskId = row.id; // 任务ID，必填
              this.taskCcDialog.procActId = row.procActId; // 环节ID，必填
              this.taskCcDialog.isPromptSuccess = true;
              this.taskCcDialog.isOpen = true;
            } else {
              this.taskCcDialog.procInstId = row.procInstId; // 流程实例ID，必填
              this.taskCcDialog.procActInstId = row.procActInstId; // 流程环节实例ID，必填
              this.taskCcDialog.procTaskId = row.id; // 任务ID，必填
              this.taskCcDialog.procActId = row.procActId; // 环节ID，必填
              this.taskCcDialog.isPromptSuccess = true;
              this.taskCcDialog.isOpen = true;
            }
          })
          .catch(err => {
            console.log(err);
          });
      }
    },

    /**
     * 任务操作：委托
     * @param row 流程数据携带信息
     */
    onTaskDetegate(row) {
      this.taskDetegateDialog.procInstId = row.procInstId; // 流程实例ID，必填
      this.taskDetegateDialog.procActInstId = row.procActInstId; // 流程环节实例ID，必填
      this.taskDetegateDialog.procTaskId = row.id; // 任务ID，必填
      this.taskDetegateDialog.procActId = row.procActId; // 环节ID，必填
      this.taskDetegateDialog.isPromptSuccess = true;
      this.taskDetegateDialog.isOpen = true;
    },

    //清空表单数据
    clearFormData() {
      this.formData = {
        selectedMode: "",
        commentText: "",
        targetActId: "", // 退回环节ID
        targetAct: null, // 退回环节信息
        cosignItemId: "", // 退回会签项ID
        cosignItem: null, // 退回会签项信息
        sendBackUsers: [], // 退回处理人
        approvalAction: 0, // 退回方式
        comment: "", // 退回意见
        targetActList: [],
        backTargetActList: [],
        noticeMethods: ""
      };
    },

    digest(row) {
      //打开前历史数据清空
      this.clearFormData();
      this.formData.selectedMode = "1";
      this.formData.cosignItemCode = row.cosignItemCode;
      this.formData.procInstId = row.procInstId;
      this.formData.actId = row.procActId;
      this.formData.actName = row.procActName;
      this.formData.taskId = row.id;
      this.formData.procId = row.procDefId;
      this.formData.procName = row.procDefName;
      this.formData.procVersion = row.taskExtend01;
      (this.formData.noticeMethods =
        this.noticeMethods && this.noticeMethods.length > 0
          ? this.noticeMethods.join(",")
          : ""), // 通知方式
        (this.loading = true);
      // 请求获取审批人信息
      api.quickApprove(this.formData).then(res => {
        this.loading = false;
        this.aproverUsers = [];
        this.cosignList = [];
        this.isCosign = false;
        this.delActPerson = false;
        this.addActPerson = false;
        this.delAssigneePerson = false;
        this.addAssigneePerson = false;
        if (res.status === 200 && res.data.code === "0") {
          this.digestVisible = true;
          // 读取下一环节数据
          const submit = res.data.data.submit;
          if (submit.code === "0") {
            this.delActPerson = submit.data.delActPerson;
            this.addActPerson = submit.data.addActPerson;
            this.delAssigneePerson = submit.data.delAssigneePerson;
            this.addAssigneePerson = submit.data.addAssigneePerson;
            this.formData.targetActList = submit.data.targetActList;
            this.formData.end = submit.data.end;
            if (!submit.data.end) {
              this.actIndex = 0;
              this.cosignIndex = 0;
              if (
                this.formData.targetActList[0].procActType ==
                this.ACT_TYPE.GENERAL
              ) {
                for (
                  let i = 0;
                  i < this.formData.targetActList[0].assigneeList.length;
                  i++
                ) {
                  this.aproverUsers.push(
                    "[" +
                      this.formData.targetActList[0].assigneeList[i].userID +
                      "]" +
                      this.formData.targetActList[0].assigneeList[i].userName
                  );
                }
              }
              if (
                this.formData.targetActList[0].procActType ==
                this.ACT_TYPE.COSIGN
              ) {
                this.isCosign = true;
                for (
                  let i = 0;
                  i < this.formData.targetActList[0].cosignItemList.length;
                  i++
                ) {
                  this.cosignList.push(
                    this.formData.targetActList[0].cosignItemList[i]
                  );
                }
                for (
                  let i = 0;
                  i < this.cosignList[0].cosignerList.length;
                  i++
                ) {
                  this.aproverUsers.push(
                    "[" +
                      this.cosignList[0].cosignerList[i].userID +
                      "]" +
                      this.cosignList[0].cosignerList[i].userName
                  );
                }
              }
            }
            this.formData.dataKey = submit.data.dataKey;
          }
          const back = res.data.data.back;
          if (back.code === "0") {
            // 任务ID
            this.currentProcAct.id = row.id;
            // 流程ID
            this.currentProcAct.processId = row.procDefId;
            // 版本号
            this.currentProcAct.procVersion = row.taskExtend01;
            // 环节ID
            this.currentProcAct.procActId = row.procActId;
            // 环节名
            this.currentProcAct.procActName = row.procActName;
            // 环节英文名
            this.currentProcAct.procActEnName = row.procActEnName;
            // 流程实例ID
            this.currentProcAct.procInstId = row.procInstId;
            // 环节实例ID
            this.currentProcAct.procActInstId = row.procActInstId;
            // 可退回环节表列
            this.goBackActOptions = back.data.targActList;

            this.radioDisable = false;
          } else {
            this.radioDisable = true;
          }
        } else {
          this.$message.error(res.data.message);
        }
      });
    },
    // 环节点击事件
    tagHandle(index) {
      this.actIndex = index;
      this.cosignIndex = 0;
      this.aproverUsers = [];
      this.cosignList = [];
      this.isCosign = false;
      // 环节与会签
      if (
        this.formData.targetActList[index].procActType == this.ACT_TYPE.GENERAL
      ) {
        for (
          let i = 0;
          i < this.formData.targetActList[index].assigneeList.length;
          i++
        ) {
          this.aproverUsers.push(
            "[" +
              this.formData.targetActList[index].assigneeList[i].userID +
              "]" +
              this.formData.targetActList[index].assigneeList[i].userName
          );
        }
      }
      if (
        this.formData.targetActList[index].procActType == this.ACT_TYPE.COSIGN
      ) {
        this.isCosign = true;
        for (
          let i = 0;
          i < this.formData.targetActList[index].cosignItemList.length;
          i++
        ) {
          this.cosignList.push(
            this.formData.targetActList[index].cosignItemList[i]
          );
        }
        for (let i = 0; i < this.cosignList[0].cosignerList.length; i++) {
          this.aproverUsers.push(
            "[" +
              this.cosignList[0].cosignerList[i].userID +
              "]" +
              this.cosignList[0].cosignerList[i].userName
          );
        }
      }
    },
    // 会签项点击事件
    tagCosignHandle(index) {
      this.cosignIndex = index;
      this.aproverUsers = [];
      for (let i = 0; i < this.cosignList[index].cosignerList.length; i++) {
        this.aproverUsers.push(
          "[" +
            this.cosignList[index].cosignerList[i].userID +
            "]" +
            this.cosignList[index].cosignerList[i].userName
        );
      }
    },
    handleDigestClose() {
      this.digestVisible = false;
    },
    handleAssigneeClose() {
      this.cancelVisible = false;
    },
    addCommentText(item) {
      this.formData.commentText = item;
    },
    /**
     * 退回方式选项改变事件
     */
    onApprovalActionSelectChange() {
      // 重置退回处理人显示
      this.resetSendBackUsers();
    },
    /**
     * 关闭任务抄送弹窗
     */
    closeTaskCcDialog() {
      this.taskCcDialog.isOpen = false;
    },
    /**
     * 关闭任务委托弹窗
     */
    closeTaskDetegateDialog() {
      this.taskDetegateDialog.isOpen = false;
    },
    getRowPriority(priority) {
      switch (priority) {
        case "0":
          return "cgnTask.priority.low";
        case "1":
          return "cgnTask.priority.middle";
        case "2":
          return "cgnTask.priority.high";
      }
    },
    getFieldName(fieldKey) {
      return "cgnTask.toDoList." + fieldKey;
    },

    changeCirclationMode(value) {},
    getCommentText() {},
    handleCommitForm() {
      // 判断是否是同一会签环节的会签项之间退回
      if (this.formData.selectedMode === "2") {
        let isSendBackInAct =
          this.currentProcAct.procActId == this.formData.targetActId;
        if (
          this.formData.backTargetActList.cosignItemList &&
          this.formData.backTargetActList.cosignItemList.length > 0
        ) {
          this.formData.backTargetActList.cosignItemList = [];
          this.formData.cosignItem.cosignerList = this.formData.sendBackUsers;
          this.formData.backTargetActList.cosignItemList.push(
            this.formData.cosignItem
          );
        }
        this.formData.backTargetActList.assigneeList = this.formData.sendBackUsers;
        this.formData.backTargetActList = [this.formData.backTargetActList];
      } else {
        this.formData.backTargetActList = [];
      }
      (this.formData.noticeMethods =
        this.noticeMethods && this.noticeMethods.length > 0
          ? this.noticeMethods.join(",")
          : ""), // 通知方式
        (this.btnLoading = true);
      api
        .quickSubmit(this.formData)
        .then(res => {
          this.btnLoading = false;
          this.digestVisible = false;
          this.$message({
            message: res.data.message,
            type: res.data.code === "0" ? "success" : "warning"
          });
          //this.$message.success(res.data.message)
          this.submitQueryForm();
        })
        .catch(error => {
          this.btnLoading = false;
          cmsg.httpCatchErrorMessage(this);
        });
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
      this.formData.backTargetActList = targetAct;
      this.formData.cosignItemId = "";
      this.formData.cosignItem = null;
      // 重置退回处理人显示
      this.resetSendBackUsers();
    },
    /**
     * 重置退回处理人显示
     */
    resetSendBackUsers() {
      let targetAct = this.formData.backTargetActList;
      let cosignItem = this.formData.cosignItem;
      let approvalAction = this.formData.approvalAction;

      // 根据选中退回环节，更新退回处理人
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
            sendBackUsers = sendBackUsers.slice(0, 1);
          }
        } else if (cosignItem) {
          // 根据选中退回会签项，更新退回处理人
          sendBackUsers =
            JSON.parse(JSON.stringify(cosignItem.cosignerList)) || [];
        }
      }

      // 强制刷新（避免选项切换时无法重置）
      this.formData.sendBackUsers = [];
      this.$nextTick(function() {
        this.formData.sendBackUsers = sendBackUsers;
      });
    },
    /**
     * 退回会签项改变事件
     */
    onCosignItemSelectChange(selectedCosignItemCode) {
      // 获取当前选中退回会签项
      let selectedItems = this.formData.backTargetActList.cosignItemList.filter(
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
    cancelFn(id) {
      api
        .queryDetegateByTaskId({
          procTaskId: id
        })
        .then(res => {
          this.assigneeList = res.data.data.participantData;
          this.cancelFormData.assigneeList = [];
          this.assigneeList.forEach(item => {
            this.cancelFormData.assigneeList.push(
              "[" + item.userId + "]" + item.userName
            );
          });
          this.handleCheckedAssigneeListChange(
            this.cancelFormData.assigneeList
          );
          this.cancelVisible = true;
          this.procTaskId = id;
        });
    },
    handleCheckedAssigneeListChange(value) {
      let checkedCount = value.length;
      this.checkAll = checkedCount === this.assigneeList.length;
      this.isIndeterminate =
        checkedCount > 0 && checkedCount < this.assigneeList.length;
    },
    handleCheckAllChange(val) {
      if (val) {
        this.assigneeList.forEach(item => {
          this.cancelFormData.assigneeList.push(
            "[" + item.userId + "]" + item.userName
          );
        });
      } else {
        this.cancelFormData.assigneeList = [];
      }
      this.isIndeterminate = false;
    },
    handleAssignee() {
      this.btnLoading = true;
      let arr = [];
      this.cancelFormData.assigneeList.forEach(item => {
        arr.push({
          userID: item.split("[")[1].split("]")[0],
          userName: item.split("[")[1].split("]")[1]
        });
      });
      api
        .unDetegateTask({
          procTaskId: this.procTaskId,
          assigneeList: arr
        })
        .then(res => {
          if (res.data.code === "0") {
            this.$message.success("取消成功");
            this.cancelVisible = false;
            api
              .queryDetegateByTaskId({
                procTaskId: this.procTaskId
              })
              .then(res => {
                if (
                  !res.data.data.participantData ||
                  res.data.data.participantData.length === 0
                ) {
                  this.data.forEach(item => {
                    if (item.id === this.procTaskId) {
                      item.taskExtend05 = "0";
                    }
                  });
                }
              });
          } else {
            this.$message(res.data.message);
          }
          this.btnLoading = false;
        });
    },
    ccSuccessFn(id) {
      this.data.forEach(item => {
        if (item.id === id) {
          item.taskExtend05 = "1";
        }
      });
    },
    //打开批量审批弹窗
    onTaskBatchApproval(row) {
      this.taskBatchApprovalDialog.isOpen = true;
      this.taskBatchApprovalDialog.procDefName = row.procDefName;
    },
    closeTaskBatchApprovalDialog() {
      this.taskBatchApprovalDialog.isOpen = false;
    },
    batchApprovalSuccessFn() {
      this.queryTaskList();
    },
    async openTaskForm(row) {
      await this.$emit("openTaskForm", row);
      this.taskBatchApprovalDialog.isOpen = false;
    },

    //加载更多
    loadingMore() {
      let that = this;
      if (that.loading) return;
      if (that.data.length >= that.pagination.total) {
        that.$message.error('没有更多数据了...');
        return;
      }
      // 更新分页参数
      that.pagination.pageNum = that.pagination.pageNum + 1;
      that.$emit("requestApi", function(
        requestApi,
        requestApiBasic,
        { priority, taskOrderBy, languageType }
      ) {
        // 获取查询参数
        let requestParams = Object.assign(
          {
            taskOrderBy: taskOrderBy, // 排序方式 0-任务分派时间降序 1-任务分派时间升序
            pageIndex: that.pagination.pageNum,
            pageSize: that.pagination.pageSize,
            priority: priority
          },
          that.queryForm
        );
        // 请求API
        that.loading = true;
        const loading = that.$loading();
        requestApi
          .queryTask(requestParams)
          .then(res => {
            that.loading = false;
            loading.close();
            if (res.status == 200 && res.data.code == 0) {
              // 更新前回调处理数据列表方法
              let dataList = res.data.data.page.records;
              dataList.forEach((item) => {
                that.data.push(item);
              })
              that.pagination.total = res.data.data.page.total;
            }
          })
          .catch(err => {
            that.loading = false;
            loading.close();
          });
      });
    },
    //返回顶部
    scrollTop() {
      document.querySelector('.cud-display-card').scrollIntoView({
        block: "center",
        behavior: "smooth",
      });
    },
  },
  beforeDestroy() {
    // throttleFunc记录当前的节流方法，用于在页面销毁时释放
    window.removeEventListener("resize", this.throttleFunc);
  }
};
</script>
<style lang="less" scoped>
// @import "src/assets/css/style";
.tagMargin {
  margin-right: 3px;
  cursor: pointer;
}
.tagMarginClick {
  margin-right: 3px;
  cursor: pointer;
  color: #0c7bca;
}
/deep/ .el-table_fixed {
  height: 100% !important;
}
/deep/ .el-table--scrollable-y .el-table__body-wrapper {
  // height: 90% !important;
}
/deep/ .cud-commom-form-style .cud-special-pagination {
  margin-bottom: 0 !important;
}
/deep/ .cud__page {
  margin-bottom: 0;
  margin-top: 10px;
}

/deep/ .el-button--mini {
  font-size: 12px;
  height: 24px;
  display: inline-block;
  line-height: 0.2;
  white-space: nowrap;
  cursor: pointer;
  background: #fff;
  border: 1px solid #dcdfe6;
  color: #444;
  appearance: none;
  -webkit-appearance: none;
  text-align: center;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  outline: 0;
  margin: 0;
  -webkit-transition: 0.1s;
  transition: 0.1s;
  font-weight: 500;
  padding: 12px 12px;
  font-size: 14px;
  border-radius: 4px;
}
.cud-table-height32 .btn-posHeight-css {
  position: absolute;
  right: 10px;
  top: 7px;
}
.cud-table-height42 .btn-posHeight-css {
  position: absolute;
  right: 10px;
  top: 8px;
}
.cud-table-height52 .btn-posHeight-css {
  position: absolute;
  right: 10px;
  top: 13px;
}
</style>
