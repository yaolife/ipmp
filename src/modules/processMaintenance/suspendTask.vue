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
                      <el-input v-model="processTemplateVo.a_no" size="small" :placeholder="$t('cm.pleaseEnter')"
                        maxlength="64"></el-input>
                    </el-form-item>
                  </el-col> -->
                  <el-col :xs="12" :sm="12" :md="8" :lg="8">
                    <el-form-item :label="$t('pm.procSubject')">
                      <el-input
                        v-model="processTemplateVo.procSubject"
                        size="small"
                        :placeholder="$t('cm.pleaseEnter')"
                        maxlength="64"
                      ></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="12" :sm="12" :md="8" :lg="8">
                    <el-form-item :label="$t('pm.startTime')">
                      <!-- <el-date-picker v-model="processTemplateVo.startTimeBegin" type="date"
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
                  <el-col :xs="12" :sm="12" :md="8" :lg="8">
                    <!-- <el-form-item :label="$t('pm.startUserIdName')">
                      <person-select ref="personSelect" v-model="processTemplateVo.procName"></person-select>
                    </el-form-item> -->
                  </el-col>
                  <el-col :span="23" class="cud--right pt-23">
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
              <el-row
                class="cud__table--list"
                :style="{ height: maxRightHeight + 'px' }"
              >
                <el-table
                  :data="tableData"
                  :empty-text="$t('cm.nodata')"
                  border
                  stripe
                  highlight-current-row
                  header-row-class-name="cud-office-table-header"
                  class="cud-office-table"
                  @selection-change="selectChange"
                  v-loading="listLoading"
                  ref="table"
                >
                  <el-table-column
                    align="center"
                    min-width="50"
                    type="selection"
                    :selectable="checkBoxT"
                  ></el-table-column>
                  <el-table-column
                    align="left"
                    min-width=""
                    prop="procSubject"
                    show-overflow-tooltip
                    :label="$t('pm.procSubject')"
                  ></el-table-column>
                  <!-- <el-table-column align="center" width="120" show-overflow-tooltip prop="" :label="$t('pm.showFlow')">
                    <template slot-scope="scope">
                      <div class="cud-table-process-border" @click="onTaskViewFlowChart(scope.row)">
                        <span class="cud3-icon-blue font_family icon-icon_workplace_flowchart"></span>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column align="left" prop="" :label="$t('pm.processNo')" width="140"></el-table-column> -->
                  <!-- <el-table-column align="left" prop="" show-overflow-tooltip :label="$t('pm.procSubject')" width="">
                    <template slot-scope="scope">
                      <div class="task-subject cud-task-subject">
                        <el-tooltip placement="top" effect="light">
                          <div slot="content">
                            {{ $t("cgnTask.tips.taskBy") }}[{{
                              scope.row.fromUserIdTransfer
                            }}]{{ scope.row.fromUserNameTransfer
                            }}{{ $t("cgnTask.operate.detegateTask") }}
                          </div>
                          <el-tag v-if="scope.row.task === '1'" style="width: 46px; border: 0">
                            {{ $t("cgnTask.operate.detegateTask") }}</el-tag>
                        </el-tooltip>
                        <el-tooltip placement="top" effect="light">
                          <div slot="content">
                            {{ $t("cgnTask.tips.taskBy") }}[{{
                              scope.row.fromUserIdTransfer
                            }}]{{ scope.row.fromUserNameTransfer
                            }}{{ $t("cgnTask.operate.transferTask") }}
                          </div>
                          <el-tag v-if="scope.row.task === '2'" style="width: 46px; border: 0">
                            {{ $t("cgnTask.operate.transferTask") }}</el-tag>
                        </el-tooltip>
                        <el-tooltip placement="top" effect="light">
                          <div slot="content">
                            {{ $t("cgnTask.tips.taskBy") }}[{{
                              scope.row.fromUserIdDelegation
                            }}]{{ scope.row.fromUserNameDelegation
                            }}{{ $t("cgnTask.operate.delegation") }}
                          </div>
                          <el-tag v-if="scope.row.task === '3'" style="width: 46px; border: 0">
                            {{ $t("cgnTask.operate.delegation") }}</el-tag>
                        </el-tooltip>
                        <el-button size="small" type="text" @click="onOpenTaskForm('taskList', scope.row)">
                          {{ scope.row.procSubject }}</el-button>
                      </div>
                      <div class="cud-task-fields">
                        <div class="cud-task-field-item-wrap" style="cursor: pointer" v-if="
                            scope.row.abstract &&
                              scope.row.abstract['actAbstractShow'] === 1
                          " @click="digest(scope.row)">
                          <span class="cud-task-field-item">
                            <span class="task-field-name">{{ $t("cgnTask.field.abstract") }}：</span>
                            <el-tooltip placement="bottom" effect="light">
                              <div slot="content" v-html="scope.row.abstract['actAbstractContext']"></div>
                              <div class="task-field-value" v-html="scope.row.abstract['actAbstractContext']"
                                style="display: inline-flex; height: 16px"></div>
                            </el-tooltip>
                          </span>
                        </div>
                      </div>
                    </template>
                  </el-table-column> -->
                  <el-table-column
                    align="left"
                    prop="procName"
                    show-overflow-tooltip
                    :label="$t('pm.procDefName')"
                    width=""
                  >
                  </el-table-column>
                  <el-table-column
                    align="left"
                    prop="startTime"
                    :label="$t('pm.startTime')"
                    width=""
                  >
                  </el-table-column>
                  <el-table-column
                    align="left"
                    prop="startUserName"
                    :label="$t('pm.startUserIdName')"
                    width=""
                  >
                    <template slot-scope="scope">
                      <div>
                        [{{ scope.row.startUserId }}]{{
                          scope.row.startUserName
                        }}
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column
                    align="left"
                    prop="timeStamp"
                    :label="$t('pm.suspend.suspendTime')"
                    width=""
                  >
                  </el-table-column>
                  <el-table-column
                    align="left"
                    prop="endTime"
                    :label="$t('pm.suspend.endTime')"
                    width=""
                  >
                    <template slot-scope="scope">
                      <div>
                        {{ dateFormat(scope.row.timeStamp) }}
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column
                    align="center"
                    prop=""
                    :label="$t('cm.operate')"
                    width="120"
                    fixed="right"
                  >
                    <template slot-scope="scope">
                      <div
                        style="
                          display: flex;
                          justify-content: center;
                          cursor: pointer;
                        "
                        v-show="showOperate(scope.row.timeStamp)"
                      >
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
                <el-col :span="12">
                  <div class="btn-more">
                    <el-button
                      class="mr-10"
                      type="primary"
                      size="small"
                      @click="openActiveDialog"
                    >
                      {{ $t("flow.active") }}</el-button
                    >
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="cud-special-pagination">
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
                </el-col>
              </el-row>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

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
            trigger: ['change'],
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
        <el-button @click="isActive = false">{{ $t("cm.cancel") }}</el-button>
        <el-button type="primary" @click="activeSubmitProcess('activeForm')">{{
          $t("cm.confirm")
        }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import suspendTask from "./js/suspendTask";
export default suspendTask;
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

.orgselect /deep/.previewBtn {
  top: 0 !important;
}

/deep/.el-input__inner {
  height: 32px !important;
  padding: 0 !important;
}
</style>