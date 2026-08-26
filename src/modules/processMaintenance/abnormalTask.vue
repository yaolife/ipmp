<template>
  <div class="cud-commom-form-style" v-loading="loading">
    <div class="brand">
      <breadcrumb :arrayName="brand" :hasIcon="hasIcon"></breadcrumb>
    </div>
    <div class="cud__scroll--div workflow_template_manage">
      <el-row class="cud-common-bottom-wrap">
        <el-col :span="24">
          <el-card>
            <div class="cud__tree--right">
              <!--头部搜索-->
              <el-form
                label-suffix="："
                label-width="110px"
                label-position="top"
              >
                <el-row
                  class="cud__search--rowhigh cud-senior-search"
                  type="flex"
                >
                  <!-- <el-col :xs="12" :sm="12" :md="8" :lg="8">
                    <el-form-item :label="$t('pm.processNo')">
                      <el-input v-model="processTemplateVo.procName" size="small" :placeholder="$t('cm.pleaseEnter')"
                        maxlength="64"></el-input>
                    </el-form-item>
                  </el-col> -->
                  <el-col :span="6">
                    <el-form-item :label="$t('pm.procSubject')">
                      <el-input
                        v-model="processTemplateVo.procTitle"
                        size="small"
                        :placeholder="$t('cm.pleaseEnter')"
                        maxlength="64"
                      ></el-input>
                    </el-form-item>
                  </el-col>

                  <el-col :span="6">
                    <el-form-item :label="$t('时间')">
                      <!-- <el-date-picker v-model="processTemplateVo.startTime" type="date"
                        value-format="yyyy-MM-dd HH:mm:ss" :placeholder="$t('cm.selectTime')"></el-date-picker> -->
                      <el-date-picker
                        :default-time="['00:00:00', '23:59:59']"
                        v-model="processTemplateVo.time"
                        type="daterange"
                        value-format="yyyy-MM-dd HH:mm:ss"
                        :placeholder="$t('cgnTask.startTimeOrder.desc')"
                        :clearable="false"
                      >
                      </el-date-picker>
                    </el-form-item>
                  </el-col>

                  <el-col :span="6">
                    <el-form-item :label="$t('处理人')">
                      <person-select
                        ref="personSelect"
                        v-model="processTemplateVo.user"
                      ></person-select>
                    </el-form-item>
                  </el-col>

                  <!-- <el-col :xs="12" :sm="12" :md="8" :lg="8">
                    <el-form-item :label="$t('pm.abnormal.abnormalNode')">
                      <el-select class="form-input" v-model="processTemplateVo.procStatus" size="small"
                        :placeholder="$t('wm.statusSelect')">
                        <el-option :label="$t('wm.draftdesign')" :value="0"></el-option>
                        <el-option :label="$t('wm.designandpublish')" :value="1"></el-option>
                        <el-option :label="$t('wm.draftconfig')" :value="2"></el-option>
                        <el-option :label="$t('wm.configandpublish')" :value="3"></el-option>
                      </el-select>
                    </el-form-item>
                  </el-col> -->

                  <el-col :span="6">
                    <el-form-item :label="$t('pm.abnormal.abnormalType')">
                      <el-select
                        class="form-input"
                        v-model="processTemplateVo.dateFlag"
                        size="small"
                        :placeholder="$t('wm.statusSelect')"
                      >
                        <el-option :label="$t('超时')" value="1"></el-option>
                        <el-option
                          :label="$t('即将超时')"
                          value="2"
                        ></el-option>
                      </el-select>
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
              </el-row>
              <div class="table-button">
                <el-button
                  type="primary"
                  size="small"
                  @click="addWfTemplateDesignFun"
                  >{{ $t("修复") }}</el-button
                >
              </div>
              <!--table-->
              <el-row
                class="cud__table--list"
                :style="{ height: maxRightHeight + 'px' }"
              >
                <!-- 表格 -->
                <el-table
                  :data="tableData"
                  ref="table"
                  :empty-text="$t('cm.nodata')"
                  highlight-current-row
                  border
                  stripe
                  header-row-class-name="cud-office-table-header"
                  class="cud-office-table"
                  @selection-change="selectChange"
                  v-loading="listLoading"
                >
                  <el-table-column
                    align="center"
                    min-width="50"
                    type="selection"
                  ></el-table-column>

                  <!-- 流程图 -->
                  <el-table-column
                    width="70"
                    align="center"
                    :label="$t('adt.proc_pic')"
                  >
                    <template slot-scope="scope">
                      <div
                        class="cud-table-process-border"
                        @click="onTaskViewFlowChart(scope.row)"
                      >
                        <span
                          class="
                            cud3-icon-blue
                            font_family
                            icon-icon_workplace_flowchart
                          "
                        ></span>
                      </div>
                    </template>
                  </el-table-column>
                  <!-- 流程主题 -->
                  <el-table-column
                    align="left"
                    prop=""
                    :label="$t('pm.procSubject')"
                    width="350"
                    show-overflow-tooltip
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
                            style="width: 46px; border: 0; padding-left: 10px"
                          >
                            {{ $t("cgnTask.operate.detegateTask") }}</el-tag
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
                            style="width: 46px; border: 0; padding-left: 10px"
                          >
                            {{ $t("cgnTask.operate.transferTask") }}</el-tag
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
                            style="width: 46px; border: 0; padding-left: 10px"
                          >
                            {{ $t("cgnTask.operate.delegation") }}</el-tag
                          >
                        </el-tooltip>
                        <el-button
                          size="small"
                          type="text"
                          @click="onOpenTaskForm('taskList', scope.row)"
                        >
                          {{ scope.row.procSubject }}</el-button
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
                                v-html="
                                  scope.row.abstract['actAbstractContext']
                                "
                              ></div>
                              <div
                                class="task-field-value"
                                v-html="
                                  scope.row.abstract['actAbstractContext']
                                "
                                style="display: inline-flex; height: 16px"
                              ></div>
                            </el-tooltip>
                          </span>
                        </div>
                      </div>
                    </template>
                  </el-table-column>
                  <!-- 流程名称 -->
                  <el-table-column
                    show-overflow-tooltip
                    min-width="110"
                    align="left"
                    :label="$t('ndt.procName')"
                  >
                    <template slot-scope="scope">
                      <span>{{ scope.row.procDefName }}</span>
                    </template>
                  </el-table-column>
                  <!--发起时间-->
                  <el-table-column
                    show-overflow-tooltip
                    min-width="150"
                    align="left"
                    :label="$t('发起时间')"
                  >
                    <template slot-scope="scope">
                      <span>{{ timeFormat(scope.row.startTime) }}</span>
                    </template>
                  </el-table-column>

                  <!-- 发送者 -->
                  <el-table-column
                    show-overflow-tooltip
                    min-width="150"
                    align="left"
                    :label="$t('处理人')"
                  >
                    <template slot-scope="scope">
                      <!--                      <span>[{{ scope.row.startUserId }}]{{ scope.row.startUserName }}</span>-->
                      <span
                        >[{{ scope.row.assigneeId }}]{{
                          scope.row.assigneeName
                        }}</span
                      >
                    </template>
                  </el-table-column>

                  <el-table-column
                    show-overflow-tooltip
                    min-width="150"
                    align="left"
                    :label="$t('异常节点')"
                  >
                    <template slot-scope="scope">
                      <span>{{ scope.row.procActName }}</span>
                    </template>
                  </el-table-column>

                  <el-table-column
                    show-overflow-tooltip
                    min-width="150"
                    align="left"
                    :label="$t('异常类型')"
                  >
                    <template slot-scope="scope">
                      <span>{{ showException(scope.row.procInstId) }}</span>
                    </template>
                  </el-table-column>

                  <el-table-column
                    show-overflow-tooltip
                    min-width="150"
                    align="left"
                    :label="$t('处理情况')"
                  >
                    <template slot-scope="scope">
                      <span>{{
                        showhandSit(scope.row.procInstId) == "1"
                          ? "已处理"
                          : "未处理"
                      }}</span>
                    </template>
                  </el-table-column>

                  <!-- 操作 -->
                  <el-table-column
                    width="100"
                    align="left"
                    class-name="task-oprate cud-task-oprate"
                    :label="$t('ndt.operate')"
                  >
                    <template slot-scope="scope">
                      <div style="cursor: pointer">
                        <i
                          class="el-icon-setting"
                          @click="handleActiveIcon(scope.row)"
                          style="color: #0c7bca"
                        ></i>
                      </div>
                    </template>
                  </el-table-column>
                </el-table>
              </el-row>
              <el-row>
                <div
                  class="cud-special-pagination cud-special-pagination-button"
                >

                  <el-pagination popper-class="cud-pager-dropdown"
                    ref="pager"
                    class="cud__page"
                    @size-change="changeSize"
                    @current-change="changeCurrentPage"
                    :current-page.sync="tablePage.pageIndex"
                    :page-sizes="[10, 20, 30, 40]"
                    :page-size.sync="tablePage.pageSize"
                    :pager-count="5"
                    layout="total,sizes, prev, pager, next"
                    :total="tablePage.total"
                  >
                  </el-pagination>
                </div>
              </el-row>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <el-dialog
      :title="$t('修复流程')"
      :visible.sync="dialogVisible"
      width="800px"
      @closed="closedApi"
    >
      <el-form
        ref="simulationForm"
        :model="simulationParamsForm"
        size="small"
        label-width="110px"
      >
        <el-form-item :label="$t('pm.abnormal.abnormalNode')" prop="testType">
          <span style="color: red">{{
            mulSelect[0] ? mulSelect[0].procActName : ""
          }}</span>
        </el-form-item>

        <el-form-item
          :label="$t('新处理人')"
          prop="input"
          :rules="{
            required: true,
            message: $t('cm.tiprequired'),
            trigger: ['blur'],
          }"
        >
          <PersonSelect
            ref="personSelect"
            v-model="simulationParamsForm.input"
            :handleCallback="true"
            @callback="callName"
          ></PersonSelect>
        </el-form-item>

        <el-form-item
          :label="$t('备注说明')"
          prop="txt"
          :rules="{
            required: true,
            message: $t('cm.tiprequired'),
            trigger: ['change'],
          }"
        >
          <el-input
            type="textarea"
            v-model="simulationParamsForm.txt"
            placeholder="请输入内容"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" align="center">
        <el-button @click="dialogVisible = false">{{
          $t("cm.cancel")
        }}</el-button>
        <el-button type="primary" @click="submitProcess('simulationForm')">{{
          $t("cm.confirm")
        }}</el-button>
      </div>
    </el-dialog>

    <!-- 查看流程图弹出窗口 -->
    <task-view-show-dialog
      v-if="taskViewShowDialog.isOpen"
      v-bind="taskViewShowDialog"
      @closeDialog="closeTaskViewShowDialog"
      @requestApi="getRequestApi"
    >
    </task-view-show-dialog>
  </div>
</template>

<script>
import abnormalTask from "./js/abnormalTask";
export default abnormalTask;
</script>

<style lang="less" scoped>
//  @import "src/assets/css/style";
.workflow_template_manage .el-table .cell {
  padding: 0;
}

.el-table .el-tag {
  padding: 0;
  width: 70px;
  text-align: center;
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

.orgselect /deep/.previewBtn {
  top: 0 !important;
}

/deep/.el-input__inner {
  height: 32px !important;
  padding: 0 !important;
}
</style>
