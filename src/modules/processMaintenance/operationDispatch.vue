<template>
  <div class="cud-commom-form-style cud-cgn-task-center" v-loading="loading">
    <div class="brand">
      <breadcrumb :arrayName="brand" :hasIcon="hasIcon"></breadcrumb>
    </div>

    <el-tabs
      v-model="activeName"
      @tab-click="handleClick"
      class="dict_tab cgn-task-tabs"
      ref="tabs"
      style="margin-top: 15px;"
    >
      <el-tab-pane name="db">
        <div slot="label" class="cgn-task-tab-title">
          <span class="cgn-title">待办</span>
        </div>
        <div class="cud__scroll--div workflow_template_manage">
          <el-row class="cud-common-bottom-wrap">
            <el-col :span="24">
              <div class="cud__tree--right">
                <!-- <el-form
                    label-suffix="："
                    label-width="110px"
                    label-position="top"
                  >
                    <el-row
                      class="cud__search--rowhigh cud-senior-search"
                      type="flex"
                    >
                      <el-col :xs="12" :sm="12" :md="8" :lg="12">
                        <el-form-item :label="$t('pm.procSubject')">
                          <el-input
                            v-model="queryTaskData.procSubject"
                            size="small"
                            :placeholder="$t('cm.pleaseEnter')"
                            maxlength="64"
                          ></el-input>
                        </el-form-item>
                      </el-col>
                      <el-col :xs="12" :sm="12" :md="8" :lg="12">
                        <el-form-item :label="$t('到达时间')"> 
                          <el-date-picker
                            :default-time="['00:00:00', '23:59:59']"
                            v-model="sTime"
                            type="daterange"
                            value-format="yyyy-MM-dd HH:mm:ss"
                            :placeholder="$t('cgnTask.startTimeOrder.desc')"
                            :clearable="false"
                          >
                          </el-date-picker>
                        </el-form-item>
                      </el-col>
                      <el-col :xs="12" :sm="12" :md="8" :lg="12">
                        <el-form-item :label="$t('pm.startUserIdName')">
                          <personSelect
                            ref="personSelect"
                            v-model="processTemplateVo.procName"
                          ></personSelect>
                        </el-form-item>
                      </el-col>

                      <el-col :span="24" class="cud--right pt-23">
                        <el-button
                          class="mr-10"
                          type="primary"
                          size="small"
                          @click="searchProcessTemplates"
                        >
                          {{ $t("cm.search") }}</el-button
                        >
                        <el-button size="small" @click="resetProcessTemplate">{{
                          $t("cm.reset")
                        }}</el-button>
                      </el-col>
                    </el-row>
                  </el-form>

                  <el-row class="cud__search--rowhigh">
                    <div class="cud__divider"></div>
                  </el-row> -->
                <div ref="searchRef">
                  <query-form
                    :queryFormId="'offce_task_list'"
                    :queryFields="queryFields"
                    :loading="listLoading"
                    @resize="initMaxHeight"
                    @submit="searchProcessTemplates"
                    ref="queryDialog1"
                    class="cud-commom-form-search"
                  >
                  </query-form>
                </div>

                <el-row
                  class="query-result cud__table--list"
                  :style="{ height: getComputedHeight + 'px' }"
                >
                  <el-table
                    :data="tableData"
                    :empty-text="$t('cm.nodata')"
                    highlight-current-row
                    header-row-class-name="cud-office-table-header"
                    class="cud-office-table"
                    v-loading="listLoading"
                    :max-height="getComputedHeight"
                    ref="table"
                  >
                    <!-- <el-table-column
                      align="center"
                      width="80"
                      :label="$t('pm.procInstStatus')"
                    >
                      <template slot-scope="scope">
                        <div style="display: flex;justify-content: center;">
                           <i
                            v-if="
                              scope.row.procInstStatus == 3 ||
                                scope.row.procInstStatus == 4
                            "
                            class="el-icon-circle-close"
                            style="color: rgb(230, 20, 30);"
                          ></i>  
                          <i
                            v-if="scope.row.status == 1"
                            class="el-icon-circle-check"
                            style="color: green;font-size: 23px;transform: translate(-1px,1px);"
                          ></i>
                          <div v-else class="i-i">
                            <i
                              class="el-icon-more"
                              style="color: rgb(235, 83, 13);"
                            ></i>
                          </div>
                        </div>
                      </template>
                    </el-table-column> -->
                    <el-table-column
                      align="center"
                      width="80"
                      show-overflow-tooltip
                      prop="procVersion"
                      :label="$t('pm.showFlow')"
                    >
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
                        <div
                          class="task-subject cud-task-subject"
                          style="cursor: auto !important;"
                        >
                          <el-tooltip placement="top" effect="light">
                            <div slot="content">
                              {{ $t("cgnTask.tips.taskBy") }}[{{
                                scope.row.sentByUserId
                              }}]{{ scope.row.sentByUserName }}退回
                            </div>
                            <el-tag
                              v-if="
                                scope.row.sentByApprovalAction ===
                                  '退回重新审批' ||
                                  scope.row.sentByApprovalAction ===
                                    '退回后返回'
                              "
                              style="width: 46px; border: 0"
                              >退回</el-tag
                            >
                          </el-tooltip>
                          <el-button type="text" @click="view(scope.row)">{{
                            scope.row.procSubject
                          }}</el-button>
                        </div>
                      </template>
                    </el-table-column>
                    <el-table-column
                      align="left"
                      prop="procDefName"
                      :label="$t('pm.procDefName')"
                      width=""
                      show-overflow-tooltip
                    ></el-table-column>
                    <el-table-column
                      align="left"
                      width="160"
                      :label="$t('wm.arrival_time')"
                    >
                      <template slot-scope="scope">
                        {{ filters(scope.row.assignTime) }}
                      </template>
                    </el-table-column>
                    <el-table-column
                      align="left"
                      :label="$t('pm.startUserIdName')"
                      width=""
                      show-overflow-tooltip
                    >
                      <template slot-scope="scope">
                        [{{ scope.row.startUserId }}]
                        {{ scope.row.startUserName }}
                      </template>
                    </el-table-column>
                    <el-table-column
                      align="left"
                      prop="procActName"
                      :label="$t('pm.operationDispatch.currentNode')"
                      width=""
                      show-overflow-tooltip
                    ></el-table-column>
                    <el-table-column
                      align="left"
                      prop=""
                      show-overflow-tooltip
                      label="任务处理人"
                      width="200"
                    >
                      <template slot-scope="scope">
                        <!-- <div> 
                          {{ handleShowUser(scope.row) }}
                        </div> -->
                        [{{ scope.row.assigneeId }}]
                        {{ scope.row.assigneeName }}
                      </template>
                    </el-table-column>
                    <el-table-column
                      align="left"
                      fixed="right"
                      :label="$t('cm.operate')"
                      width="175"
                    >
                      <template slot-scope="scope">
                        <div v-show="scope.row.status !== -1">
                          <el-button
                            type="text"
                            size="small"
                            class="cud-common-operate-edit"
                            @click="updateData(scope.row)"
                          >
                            {{ $t("cm.edit") }}
                          </el-button>
                          <!-- <el-button
                            v-show="scope.row.status === 1"
                            type="text"
                            size="small"
                            class="cud-common-operate-edit"
                            @click="taskInstJump(scope.row)"
                          >
                            {{ $t("wm.jump") }}
                          </el-button> -->
                          <el-button
                            v-show="scope.row.status !== 1"
                            type="text"
                            size="small"
                            class="cud-common-operate-edit" 
                            @click="onTransition(scope.row)"
                            >转办
                          </el-button>
                          <el-dropdown
                            @command="moreCommandHandler"
                            trigger="click"
                            size="small"
                            placement="bottom"
                          >
                            <span class="el-dropdown-link"
                              >{{ $t("cm.more")
                              }}<i class="el-icon-arrow-down"></i>
                            </span>
                            <el-dropdown-menu slot="dropdown">
                              <el-dropdown-item
                                :command="
                                  beforeMoreCommandHandler(
                                    'openSendBackDialog',
                                    scope.row
                                  )
                                "
                              >
                                {{ $t("cudComponents.send_back") }}
                              </el-dropdown-item>
                              <el-dropdown-item
                                :command="
                                  beforeMoreCommandHandler(
                                    'changeCompleterNameDialog',
                                    scope.row
                                  )
                                "
                              >
                                {{ $t("更换处理人") }}
                              </el-dropdown-item>
                              <el-dropdown-item
                                :command="
                                  beforeMoreCommandHandler(
                                    'onEntrust',
                                    scope.row
                                  )
                                "
                              >
                                委托
                              </el-dropdown-item>
                              <el-dropdown-item
                                :command="
                                  beforeMoreCommandHandler(
                                    'taskInstAddSign',
                                    scope.row
                                  )
                                "
                                disabled
                              >
                                {{ $t("wm.addSign") }}
                              </el-dropdown-item>
                              <el-dropdown-item
                                :command="
                                  beforeMoreCommandHandler(
                                    'openTaskCcDialog',
                                    scope.row
                                  )
                                "
                              >
                                抄送
                              </el-dropdown-item>
                              <el-dropdown-item
                                :command="
                                  beforeMoreCommandHandler(
                                    'flowDetailFn',
                                    scope.row
                                  )
                                "
                              >
                                任务派生
                              </el-dropdown-item>
                              <el-dropdown-item
                                :command="
                                  beforeMoreCommandHandler(
                                    'flowRecordFn',
                                    scope.row
                                  )
                                "
                              >
                                操作日志
                              </el-dropdown-item>
                            </el-dropdown-menu>
                          </el-dropdown>
                        </div>
                      </template>
                    </el-table-column>
                  </el-table>
                </el-row>

                <el-row>
                  <el-col :span="24">
                    <div class="cud-special-pagination">
                      <el-pagination
                        popper-class="cud-pager-dropdown"
                        ref="pager"
                        class="cud__page"
                        @size-change="changeSize"
                        @current-change="changeCurrentPage"
                        :current-page.sync="tablePage.pageNum"
                        :page-sizes="[10, 20, 30, 40]"
                        :page-size.sync="tablePage.pageSize"
                        :pager-count="5"
                        layout="total,sizes, prev, pager, next"
                        :total="tablePage.total"
                      >
                      </el-pagination>
                    </div>
                  </el-col>
                </el-row>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-tab-pane>

      <el-tab-pane name="yb">
        <div slot="label" class="cgn-task-tab-title">
          <span class="cgn-title">已办</span>
        </div>
        <div class="cud__scroll--div workflow_template_manage">
          <el-row class="cud-common-bottom-wrap">
            <el-col :span="24">
              <div class="cud__tree--right">
                <!-- <el-form
                    label-suffix="："
                    label-width="110px"
                    label-position="top"
                  >
                    <el-row
                      class="cud__search--rowhigh cud-senior-search"
                      type="flex"
                    >
                      <el-col :xs="12" :sm="12" :md="8" :lg="12">
                        <el-form-item :label="$t('pm.procSubject')">
                          <el-input
                            v-model="queryTaskData.procSubject"
                            size="small"
                            :placeholder="$t('cm.pleaseEnter')"
                            maxlength="64"
                          ></el-input>
                        </el-form-item>
                      </el-col>
                      <el-col :xs="12" :sm="12" :md="8" :lg="12">
                        <el-form-item :label="$t('到达时间')"> 
                          <el-date-picker
                            v-model="sTime"
                            type="daterange"
                            value-format="yyyy-MM-dd HH:mm:ss"
                            :placeholder="$t('cgnTask.startTimeOrder.desc')"
                            :clearable="false"
                          >
                          </el-date-picker>
                        </el-form-item>
                      </el-col>
                      <el-col :xs="12" :sm="12" :md="8" :lg="12">
                        <el-form-item :label="$t('pm.startUserIdName')">
                          <personSelect
                            ref="personSelect"
                            v-model="processTemplateVo.procName"
                          ></personSelect>
                        </el-form-item>
                      </el-col>

                      <el-col :span="24" class="cud--right pt-23">
                        <el-button
                          class="mr-10"
                          type="primary"
                          size="small"
                          @click="searchProcessTemplates"
                        >
                          {{ $t("cm.search") }}</el-button
                        >
                        <el-button size="small" @click="resetProcessTemplate">{{
                          $t("cm.reset")
                        }}</el-button>
                      </el-col>
                    </el-row>
                  </el-form>

                  <el-row class="cud__search--rowhigh">
                    <div class="cud__divider"></div>
                  </el-row> -->
                <div ref="searchRef">
                  <query-form
                    :queryFormId="'offce_task_list'"
                    :queryFields="queryFields"
                    :loading="listLoading"
                    @resize="initMaxHeight"
                    @submit="searchProcessTemplates"
                    ref="queryDialog2"
                    class="cud-commom-form-search"
                  >
                  </query-form>
                </div>

                <el-row
                  class="query-result cud__table--list"
                  :style="{ height: getComputedHeight + 'px' }"
                >
                  <el-table
                    :data="tableData"
                    :empty-text="$t('cm.nodata')"
                    :max-height="getComputedHeight"
                    highlight-current-row
                    header-row-class-name="cud-office-table-header"
                    class="cud-office-table"
                    v-loading="listLoading"
                    ref="table"
                    ><el-table-column
                      align="center"
                      width="80"
                      show-overflow-tooltip
                      prop="procVersion"
                      :label="$t('pm.showFlow')"
                    >
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
                    <el-table-column
                      align="left"
                      show-overflow-tooltip
                      min-width="150"
                      prop="procSubject"
                      :label="$t('wm.procSubject')"
                    >
                      <template slot-scope="scope">
                        <el-button type="text" @click="view(scope.row)">{{
                          scope.row.procSubject
                        }}</el-button>
                      </template>
                    </el-table-column>
                    <el-table-column
                      align="left"
                      prop="procDefName"
                      :label="$t('pm.procDefName')"
                      width=""
                      show-overflow-tooltip
                    ></el-table-column>
                    <el-table-column
                      align="left"
                      width="160"
                      :label="$t('wm.arrival_time')"
                    >
                      <template slot-scope="scope">
                        {{ filters(scope.row.assignTime) }}
                      </template>
                    </el-table-column>
                    <el-table-column
                      align="left"
                      :label="$t('pm.startUserIdName')"
                      width=""
                      show-overflow-tooltip
                    >
                      <template slot-scope="scope">
                        [{{ scope.row.startUserId }}]
                        {{ scope.row.startUserName }}
                      </template>
                    </el-table-column>
                    <el-table-column
                      align="left"
                      prop="procActName"
                      :label="$t('pm.operationDispatch.currentNode')"
                      width=""
                      show-overflow-tooltip
                    ></el-table-column>
                    <el-table-column
                      align="left"
                      prop=""
                      show-overflow-tooltip
                      label="任务处理人"
                      width="200"
                    >
                      <template slot-scope="scope">
                        <!-- <div> 
                          {{ handleShowUser(scope.row) }}
                        </div> -->
                        [{{ scope.row.assigneeId }}]
                        {{ scope.row.assigneeName }}
                      </template>
                    </el-table-column>
                    <el-table-column
                      align="left"
                      fixed="right"
                      :label="$t('cm.operate')"
                      width="250"
                    >
                      <template slot-scope="scope">
                        <el-button
                          type="text"
                          size="small"
                          class="cud-common-operate-edit"
                          @click="lookDetail(scope.row)"
                        >
                          {{ $t("cudLCCommon.view_detail") }}
                        </el-button>
                        <!-- 撤销 -->
                        <!-- <el-button
                          size="small"
                          type="text"
                          class="cud-common-operate-edit"
                          @click="SelectedwithdrawTask(scope.row)"
                          >{{ $t("cgnTask.operate.withdrawTask") }}</el-button
                        > -->
                        <el-button
                          size="small"
                          type="text"
                          class="cud-common-operate-edit"
                          @click="flowDetailFn(scope.row)"
                          >任务派生</el-button
                        >
                        <el-button
                          size="small"
                          type="text"
                          class="cud-common-operate-edit"
                          @click="flowRecordFn(scope.row)"
                          >操作日志</el-button
                        > 

                        <!-- 跳转 -->
                        <!-- <el-button
                            v-show="scope.row.status === 1"
                            type="text"
                            size="small"
                            class="cud-common-operate-edit"
                            @click="taskInstJump(scope.row)"
                          >
                            {{ $t("wm.jump") }}
                          </el-button> -->
                      </template>
                    </el-table-column>
                  </el-table>
                </el-row>

                <el-row>
                  <el-col :span="12">
                    <div class="btn-more">
                      <!-- <el-button class="mr-10" size="small" @click="openSendBackDialog">
                          {{ $t("cudComponents.send_back")}}
                        </el-button>
                        <el-button class="mr-10" size="small" @click="hangHpDialog">{{ $t("flow.hangup")}}</el-button>
                        <el-button size="small" @click="changeCompleterNameDialog">{{ $t("更换处理人")}}</el-button> -->
                    </div>
                  </el-col>
                  <el-col :span="12">
                    <div class="cud-special-pagination">
                      <el-pagination
                        popper-class="cud-pager-dropdown"
                        ref="pager"
                        class="cud__page"
                        @size-change="changeSize"
                        @current-change="changeCurrentPage"
                        :current-page.sync="tablePage.pageNum"
                        :page-sizes="[10, 20, 30, 40]"
                        :page-size.sync="tablePage.pageSize"
                        :pager-count="5"
                        layout="total,sizes, prev, pager, next"
                        :total="tablePage.total"
                      >
                      </el-pagination>
                    </div>
                  </el-col>
                </el-row>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 查看流程图弹出窗口 -->
    <task-view-show-dialog
      v-if="taskViewShowDialog.isOpen"
      v-bind="taskViewShowDialog"
      @closeDialog="closeTaskViewShowDialog"
      @requestApi="getRequestApi"
    >
    </task-view-show-dialog>

    <!-- 激活 -->
    <el-dialog
      :title="$t('激活流程')"
      :visible.sync="isActive"
      width="800px"
      @closed="closeActiveDialog"
      :close-on-click-modal="false"
    >
      <el-form
        ref="activeForm"
        :model="activeForm"
        size="small"
        label-width="110px"
      >
        <el-row style="margin: 30px">
          <el-col :span="24" align="center">是否确认将任务再度激活？</el-col>
        </el-row>

        <el-form-item
          :label="$t('激活原因')"
          prop="input"
          :rules="{
            required: true,
            message: $t('cm.tiprequired'),
            trigger: ['change']
          }"
        >
          <el-input
            type="textarea"
            v-model="activeForm.input"
            placeholder="请输入内容"
            :autosize="{ minRows: 3 }"
          >
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" align="center">
        <el-button @click="isActive = false" size="small">{{
          $t("cm.cancel")
        }}</el-button>
        <el-button
          type="primary"
          @click="activeSubmitProcess('activeForm')"
          size="small"
          >{{ $t("cm.confirm") }}</el-button
        >
      </div>
    </el-dialog>
    <!-- 退回 -->
    <el-dialog
      :visible.sync="isSendBack"
      width="700px"
      class="d-header"
      append-to-body
      :destroy-on-close="true"
      :close-on-click-modal="false"
    >
      <span slot="title" class="el-dialog__title">
        退回流程
        <el-popover
          placement="top-start"
          width="250"
          trigger="hover"
          content="将任务退回给发起人或某一前序审批环节重新处理，退回任务会显示退回标识。"
        >
          <i class="el-icon-question" slot="reference"></i>
        </el-popover>
      </span>
      <el-form
        ref="sendBackForm"
        :model="sendBackForm"
        size="small"
        label-width="110px"
      >
        <el-form-item :label="$t('退回到')" prop="input">
          <el-button
            :type="isChange == 0 ? 'primary' : 'default'"
            @click="isChange = 0"
            size="small"
            >{{ $t("flow.apply_user") }}
          </el-button>
          <el-button
            :type="isChange == 1 ? 'primary' : 'default'"
            @click="prevLink"
            size="small"
            >{{ $t("上一环节") }}</el-button
          >
          <el-button
            :type="isChange == 2 ? 'primary' : 'default'"
            @click="isChange = 2"
            size="small"
            >{{ $t("指定环节") }}</el-button
          >
        </el-form-item>

        <el-form-item
          v-show="isChange > 0"
          :label="$t('退回环节')"
          prop="input"
        >
          <el-input
            v-show="isChange == 1"
            v-model="sendBackForm.input"
            placeholder="请输入内容"
            :disabled="true"
          ></el-input>

          <el-input
            v-show="isChange == 2"
            v-model="sendBackForm.input"
            placeholder="请输入内容"
            :disabled="true"
          >
            <i
              slot="suffix"
              class="select-process"
              @click="isSelectProcess = true"
              >选择环节</i
            >
          </el-input>
        </el-form-item>

        <el-form-item
          :label="$t('退回理由')"
          prop="txt"
          :rules="{
            required: true,
            message: $t('cm.tiprequired'),
            trigger: ['blue']
          }"
        >
          <el-input
            type="textarea"
            v-model="sendBackForm.txt"
            placeholder="请输入内容"
            :autosize="{ minRows: 3 }"
          >
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" align="center">
        <el-button @click="isSendBack = false" size="small">{{
          $t("cm.cancel")
        }}</el-button>
        <el-button
          type="primary"
          @click="sendBackSubmitProcess('sendBackForm')"
          size="small"
          >{{ $t("cm.confirm") }}</el-button
        >
      </div>

      <el-dialog
        :title="$t('选择环节')"
        :visible.sync="isSelectProcess"
        width="800px"
        :modal="false"
        :close-on-click-modal="false"
      >
        <!-- <el-card> -->
        <el-table
          :data="canSendBack"
          :empty-text="$t('cm.nodata')"
          :max-height="getComputedHeight"
          highlight-current-row
          header-row-class-name="cud-office-table-header"
          class="cud-office-table"
          v-loading="listLoading"
          height="200"
        >
          <el-table-column
            align="center"
            prop="actName"
            :label="$t('流程节点')"
          ></el-table-column>
          <el-table-column
            align="center"
            prop=""
            :label="$t('workbench.executor_user')"
          ></el-table-column>
          <el-table-column align="center" prop="" :label="$t('操作')">
            <template slot-scope="scope">
              <div class="canSendBack-p" @click="selectBackNode(scope.row)">
                选择
              </div>
            </template>
          </el-table-column>
        </el-table>
        <!-- </el-card> -->
        <div slot="footer" class="dialog-footer" align="center">
          <el-button @click="isSelectProcess = false" size="small">{{
            $t("cm.cancel")
          }}</el-button>
          <el-button
            type="primary"
            @click="isSelectProcess = false"
            size="small"
            >{{ $t("cm.confirm") }}</el-button
          >
        </div>
      </el-dialog>
    </el-dialog>
    <!-- 挂起 -->
    <!-- <el-dialog :title="$t('挂起流程')" :visible.sync="isHangHp" width="800px">
      <div class="dialog-title" slot="title">
        <p>
          {{ $t("挂起流程") }}
          <span>流程挂起后在系统中可见但所有相关数据将被回滚</span>
        </p>
      </div>
      <el-form
        ref="hangHpForm"
        :model="hangHpForm"
        size="small"
        label-width="110px"
      >
        <el-row style="margin: 30px">
          <el-col :span="24" align="center">是否确认将该流程挂起？</el-col>
        </el-row>

        <el-form-item
          :label="$t('挂起原因')"
          prop="input"
          :rules="{
            required: true,
            message: $t('cm.tiprequired'),
            trigger: ['blue']
          }"
        >
          <el-input
            type="textarea"
            v-model="hangHpForm.input"
            placeholder="请输入内容"
            :autosize="{ minRows: 3 }"
          >
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" align="center">
        <el-button @click="isHangHp = false">{{ $t("cm.cancel") }}</el-button>
        <el-button type="primary" @click="hanghpSubmitProcess('hangHpForm')">{{
          $t("cm.confirm")
        }}</el-button>
      </div>
    </el-dialog> -->
    <!-- 更换处理人 -->
    <el-dialog
      :visible.sync="isChangeCompleterName"
      width="600px"
      @closed="closeCompleterDialog"
      :close-on-click-modal="false"
    >
      <span slot="title" class="el-dialog__title">
        更换处理人
        <el-popover
          placement="top-start"
          width="250"
          trigger="hover"
          content="直接修改人，在待办列表中不会有委托、转办标识。"
        >
          <i class="el-icon-question" slot="reference"></i>
        </el-popover>
      </span>
      <el-form
        ref="changeCompleterNameForm"
        :model="changeCompleterNameForm"
        size="small"
        label-width="110px"
      >
        <el-form-item
          label="当前处理人"
          prop="input"
          :rules="{
            required: true,
            message: $t('cm.tiprequired'),
            trigger: ['blur']
          }"
        >
          <personSelect
            ref="personSelectB"
            v-model="changeCompleterNameForm.assigneeObj"
            :handleCallback="true"
            @input="callName"
            :detail="true"
          ></personSelect>
          <!-- <PersonSelect ref="personSelect" v-model="changeCompleterNameForm.input" :handleCallback="true" @callback="callName"></PersonSelect> -->
        </el-form-item>
        <el-form-item
          :label="$t('新处理人')"
          prop="input"
          :rules="{
            required: true,
            message: $t('cm.tiprequired'),
            trigger: ['blur']
          }"
        >
          <personSelect
            ref="personSelectC"
            v-model="changeCompleterNameForm.input"
            :handleCallback="true"
            :isFullscreen="true"
            @input="callName"
          ></personSelect>
          <!-- <PersonSelect ref="personSelect" v-model="changeCompleterNameForm.input" :handleCallback="true" @callback="callName"></PersonSelect> -->
        </el-form-item>
        <el-form-item :label="$t('更换原因')" prop="txt">
          <el-input
            type="textarea"
            v-model="changeCompleterNameForm.txt"
            placeholder="请输入内容"
            :autosize="{ minRows: 2 }"
          >
          </el-input>
        </el-form-item>
        <el-form-item
          :label="$t('cgnTask.field.noticeMethods')"
          prop="noticeMethods"
        >
          <el-checkbox-group v-model="changeCompleterNameForm.noticeMethods">
            <el-checkbox label="1">{{
              $t("cgnTask.field.emailMessage")
            }}</el-checkbox>
            <el-checkbox label="2">{{
              $t("cgnTask.field.shortMessage")
            }}</el-checkbox>
            <el-checkbox label="3">{{ $t("flow.dingMessage") }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" align="center">
        <el-button @click="closeCompleterDialog" size="small">{{
          $t("cm.cancel")
        }}</el-button>
        <el-button
          type="primary"
          size="small"
          @click="changeCompleterSubmitProcess('changeCompleterNameForm')"
          >{{ $t("cm.confirm") }}
        </el-button>
      </div>
    </el-dialog>
    <el-dialog
      v-dragMove="{
        DragButton: '.el-dialog__header',
        DragWindow: '.el-dialog'
      }"
      :title="$t('cgnTask.field.taskInstJump')"
      :visible.sync="jumpDialogVisible"
      width="640px"
      height="90%"
      destroy-on-close
      :before-close="jumpClose"
      class="jump-dialog"
      :close-on-click-modal="false"
    >
      <el-form
        ref="jumpForm"
        size="small"
        label-suffix=":"
        :rules="jumpRules"
        label-position="top"
        :model="
          typeof ReqGotoActivityDto === 'string' ? {} : ReqGotoActivityDto
        "
        label-width="170px"
      >
        <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('wm.procName')" prop="procName">
              <span>{{ ReqGotoActivityDto.procDefName }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('flow.jumpActname')" prop="actId">
              <el-select
                :placeholder="$t('cm.pselect')"
                clearable
                v-model="ReqGotoActivityDto.actId"
              >
                <el-option
                  v-for="(item, index) in ReqGotoActivityDto.actListDto"
                  :key="index"
                  :label="item.actName"
                  :value="item.actID"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('flow.approvalMode')" prop="approvalMode">
              <el-radio v-model="ReqGotoActivityDto.approvalMode" label="1">{{
                $t("flow.approval_type1")
              }}</el-radio>
              <el-radio v-model="ReqGotoActivityDto.approvalMode" label="2">{{
                $t("flow.approval_type2")
              }}</el-radio>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('flow.isNotify')" prop="notify">
              <el-radio-group v-model="ReqGotoActivityDto.notify">
                <el-radio v-model="ReqGotoActivityDto.notify" :label="0">{{
                  $t("flow.notInform")
                }}</el-radio>
                <el-radio v-model="ReqGotoActivityDto.notify" :label="1">{{
                  $t("flow.inform")
                }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <!--<el-form-item :label="$t('flow.completerName')" prop="assigneeList" >
                  <el-input size="small" ref="assigneeListInput" @focus="showSelectUserDialog('assigneeListInput')" :title="assigneeUsers" v-model="assigneeUsers" :maxlength="30" clearable :placeholder="$t('cm.pleaseSelect')">
                    <el-button size="small" type="primary" class="el-button&#45;&#45;half" slot="append" icon="el-icon-plus" @click="showSelectUserDialog('assigneeListInput')"></el-button>
                  </el-input>
                </el-form-item>-->
            <el-form-item :label="$t('flow.completerName')" prop="assigneeList">
              <el-input
                size="small"
                ref="assigneeListInput"
                v-show="false"
              ></el-input>
              <el-tag
                class="tagMarginClick"
                v-for="(item, index) in ReqGotoActivityDto.assigneeList"
                :key="index"
                closable
                @close="handleDelPerson(index)"
                >{{ "[" + item.userID + "]" + item.userName }}</el-tag
              >
              <el-button
                type="primary"
                icon="el-icon-plus"
                size="small"
                @click="showSelectUserDialog('assigneeListInput')"
              ></el-button>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item :label="$t('flow.jumpReason')" prop="comment">
              <el-input
                maxlength="100"
                rows="3"
                :placeholder="$t('cm.pleaseEnter')"
                class="form-input"
                type="textarea"
                show-word-limit
                v-model="ReqGotoActivityDto.comment"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer" align="center">
        <el-button size="small" @click="jumpClose">{{
          $t("cm.cancel")
        }}</el-button>
        <el-button
          size="small"
          type="primary"
          v-loading.fullscreen.lock="fullscreenLoading"
          @click="jumpCommit"
          >{{ $t("cm.commit") }}
        </el-button>
      </div>
    </el-dialog>
    <el-dialog
      width="60%"
      :visible.sync="showSelectUser"
      custom-class="act-creator-dialog"
      :modal="false"
      :destory-on-close="true"
      :title="$t('cm.choose') + $t(selectUserTitle)"
      :before-close="closeSelectUserDialog"
      :close-on-click-modal="false"
      v-dragMove="{
        DragButton: '.el-dialog__header',
        DragWindow: '.el-dialog'
      }"
    >
      <div class="el-dialog-div">
        <wf-comm-person-component
          v-if="showSelectUser"
          ref="selectUser"
          :showUserMultiple="isUserMultiple"
          :show-user-group-tab="false"
          :showDynRoleTab="false"
          :showStationTab="false"
          :showOrgTab="false"
          :initUserId="initUserId"
        ></wf-comm-person-component>
      </div>
      <div slot="footer" class="dialog-footer" align="center">
        <el-button size="small" @click="closeSelectUserDialog">{{
          $t("cm.cancel")
        }}</el-button>
        <el-button size="small" type="primary" @click="commitSelectUser">{{
          $t("cm.confirm")
        }}</el-button>
      </div>
    </el-dialog>
    <el-dialog
      v-dragMove="{
        DragButton: '.el-dialog__header',
        DragWindow: '.el-dialog'
      }"
      :visible.sync="addSignDialogVisible"
      width="640px"
      height="90%"
      destroy-on-close
      :before-close="addSignClose"
      class="add-sign-dialog"
      :close-on-click-modal="false"
    >
      <span slot="title" class="el-dialog__title">
        {{ $t("cgnTask.field.taskInstAddSign") }}
        <el-popover
          placement="top-start"
          width="250"
          trigger="hover"
          content="普通环节顺序审批（全票通过）加签的审批人为最后审批人；普通环节并行审批（全票通过或者一人通过）加签相当于新增处理人；"
        >
          <i class="el-icon-question" slot="reference"></i>
        </el-popover>
      </span>
      <el-form
        ref="addSignForm"
        size="small"
        label-position="top"
        label-suffix=":"
        :rules="addSignFormRules"
        :model="typeof ReqUpdateTaskDto === 'string' ? {} : ReqUpdateTaskDto"
        label-width="170px"
      >
        <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('wm.procName')" prop="procName">
              <span>{{ ReqUpdateTaskDto.procDefName }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('flow.procActName')" prop="procActName">
              <span>{{ ReqUpdateTaskDto.procActName }}</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('flow.start_user')" prop="creatorName">
              <span
                >[{{ ReqUpdateTaskDto.creatorId }}]
                {{ ReqUpdateTaskDto.creatorName }}</span
              >
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('flow.create_time')" prop="createTime">
              <span>{{ dataFormat(ReqUpdateTaskDto.createTime) }}</span>
            </el-form-item>
          </el-col>
        </el-row>
        <!-- <el-row>
          <el-col :span="12" v-if="ReqUpdateTaskDto.assignType === 0">
            <el-form-item label="会签事项" prop="scItemCofCode">
              <el-select
                clearable
                allow-create
                filterable
                v-model="ReqUpdateTaskDto.actCountersignItem.scItemCofCode"
                size="small"
                @change="
                  selectScChange($event, ReqUpdateTaskDto.actCountersignItem)
                "
                :placeholder="$t('cgnTask.tips.submitCosignItemNotSelect')"
              >
                <el-option
                  v-for="(item, index) in scItemCofList"
                  :key="index"
                  :label="item.scItemCof"
                  :value="item.scItemCofCode"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="ReqUpdateTaskDto.assignType === 0">
            <el-form-item label="审批规则" prop="cosignItemType">
              <el-select
                :placeholder="$t('cm.pleaseEnter')"
                v-model="ReqUpdateTaskDto.actCountersignItem.cosignItemType"
                filterable
                size="small"
              >
                <el-option label="一人通过" :value="1"></el-option>
                <el-option label="全票通过" :value="0"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row> -->
        <el-row>
          <el-col :span="12">
            <el-form-item
              :label="$t('flow.completerName')"
              prop="completerName"
            >
              <el-input
                size="small"
                ref="completerInput"
                @focus="showSelectUserDialog('completerInput')"
                :title="completerUser"
                v-model="completerUser"
                :maxlength="30"
                clearable
                :disabled="true"
                :placeholder="$t('cm.pleaseSelect')"
              >
                <el-button
                  size="small"
                  type="primary"
                  class="el-button--half"
                  slot="append"
                  icon="el-icon-plus"
                  @click="showSelectUserDialog('completerInput')"
                ></el-button>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('flow.isNotify')" prop="noticeMethods">
              <!-- <el-radio-group v-model="ReqUpdateTaskDto.notify">
                <el-radio v-model="ReqUpdateTaskDto.notify" :label="0">{{
                  $t("flow.notInform")
                }}</el-radio>
                <el-radio v-model="ReqUpdateTaskDto.notify" :label="1">{{
                  $t("flow.inform")
                }}</el-radio>
              </el-radio-group> -->

              <el-checkbox-group v-model="ReqUpdateTaskDto.noticeMethods">
                <el-checkbox label="1">{{
                  $t("cgnTask.field.emailMessage")
                }}</el-checkbox>
                <el-checkbox label="2">{{
                  $t("cgnTask.field.shortMessage")
                }}</el-checkbox>
                <el-checkbox label="3">{{
                  $t("flow.dingMessage")
                }}</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer" align="center">
        <el-button size="small" @click="addSignClose">{{
          $t("cm.cancel")
        }}</el-button>
        <el-button
          size="small"
          type="primary"
          v-loading.fullscreen.lock="fullscreenLoading"
          @click="addSign"
          >{{ $t("cm.commit") }}
        </el-button>
      </div>
    </el-dialog>
    <!-- 任务转办弹窗 -->
    <task-transfer-dialog
      v-if="taskTransferDialog.isOpen"
      v-bind="taskTransferDialog"
      @requestApi="getRequestApi"
      @closeDialog="closeTaskTransferDialog"
      :emailMessageShow="false"
      :shortMessageShow="false"
      :dingMessageShow="false"
      :emailMessageTrue="false"
      :shortMessageTrue="false"
      :dingMessageTrue="false"
      :isOperationDispatch="true"
    >
    </task-transfer-dialog>
    <!-- 任务委托弹窗 -->
    <task-detegate-dialog
      v-if="taskDetegateDialog.isOpen"
      v-bind="taskDetegateDialog"
      @requestApi="getRequestApi"
      @closeDialog="closeTaskDetegateDialog"
      :emailMessageShow="false"
      :shortMessageShow="false"
      :dingMessageShow="false"
      :emailMessageTrue="false"
      :shortMessageTrue="false"
      :dingMessageTrue="false"
      :isOperationDispatch="true"
    >
    </task-detegate-dialog>
    <!-- 任务抄送弹窗 -->
    <task-cc-dialog
      v-if="taskCcDialog.isOpen"
      v-bind="taskCcDialog"
      @closeDialog="closeTaskCcDialog"
      :emailMessageShow="false"
      :shortMessageShow="false"
      :dingMessageShow="false"
      :emailMessageTrue="false"
      :shortMessageTrue="false"
      :dingMessageTrue="false"
      :isOperationDispatch="true"
    >
    </task-cc-dialog>
    <!-- 任务退回弹窗 -->
    <task-send-back-dialog
      v-if="taskSendBackDialog.isOpen"
      v-bind="taskSendBackDialog"
      @requestApi="getRequestApi"
      @closeDialog="closeTaskSendBackDialog"
      :emailMessageShow="false"
      :shortMessageShow="false"
      :dingMessageShow="false"
      :emailMessageTrue="false"
      :shortMessageTrue="false"
      :dingMessageTrue="false"
      :isOperationDispatch="true"
    >
    </task-send-back-dialog>
    <!-- 任务撤销弹窗 -->
    <!-- <task-withdraw-dialog
      v-if="taskWithdrawDialog.isOpen"
      v-bind="taskWithdrawDialog"
      @closeDialog="closeTaskWithdrawDialog"
      :isOperationDispatch="true"
    >
    </task-withdraw-dialog> -->
    <flowDetail
      :isShow="isShow"
      @closeDialog="closeFlowDetailDialog"
      :row="row"
    />
    <flowRecord
      :flowRecordShow="flowRecordShow"
      @closeDialog="closeFlowRecordDialog"
      :row="row"
    />
  </div>
</template>

<script>
import operationDispatch from "./js/operationDispatch";
export default operationDispatch;
</script>

<style lang="less" scoped>
//  @import "src/assets/css/style";
.workflow_template_manage .el-table .cell {
  padding: 0;
}

.cud_tree {
  max-height: 552px;
}

.color_select_after .el-icon-arrow-up:before {
  content: none;
}

.importClass .el-upload.el-upload--text {
  width: 100%;
  text-align: left;
}

/deep/ .el-card__body {
  padding: 15px 15px 0;
}

/deep/ .el-table__body .cell {
  line-height: none !important;
}

/deep/ .el-input--prefix .el-input__inner {
  height: 32px;
}

.btn-more {
  margin-top: 16px;
  flex-wrap: nowrap;
  overflow-x: auto;
  overflow-y: hidden;
  padding-left: 10px;
  float: left;
  margin-bottom: 10px;
}

.dialog-title {
  display: flex;
  align-items: center;
  height: 100%;
}

.dialog-title > p {
  padding-left: 10px;
  font-size: 20px;
  color: #333333;
  font-weight: 400;
  border-left: 6px solid #0069ac;
  margin-bottom: 0;
}

.dialog-title > p > span {
  font-size: 16px;
  color: #666;
  padding-left: 5px;
}

.select-process {
  font-style: normal;
  margin-right: 10px;
  color: #0069ac;
  cursor: pointer;
}

.canSendBack-p {
  color: #0069ac;
  cursor: pointer;
  text-align: center;
}

.orgselect /deep/.previewBtn {
  top: 0 !important;
}

.i-i {
  border-radius: 50%;
  border: 1px solid #eb530d;
  height: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2px;
}

.bg-f {
  background-color: #fff;
}

.cud__table--list {
  overflow-y: auto;
}

/deep/ .el-tabs__active-bar {
  width: 30px !important;
  left: 52px;
}
/deep/ .el-tabs__content {
  padding: 20px 15px 0 !important;
  overflow: visible;
}
.tagMargin {
  margin-right: 3px;
  cursor: pointer;
}
.tagMarginClick {
  margin-right: 3px;
  cursor: pointer;
  color: #0c7bca;
}
</style>
