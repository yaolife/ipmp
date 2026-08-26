<template>
  <div class="customFlow">
    <el-alert title="模拟测试不支持处理类执行。" type="warning"> </el-alert>
    <el-collapse v-model="activeName1">
      <el-collapse-item name="tab1">
        <template slot="title">
          <span class="title-line"></span>
          <span class="cud-avue-title">流程信息</span>
        </template>
        <div>
          <el-form
            ref="simulationForm"
            :model="simulationParamsForm"
            size="small"
            label-width="150px"
          >
            <el-row>
              <el-col :span="12">
                <el-form-item label="流程名称">
                  <el-input v-model="procInfo.procName" disabled></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="流程版本">
                  <el-input v-model="procInfo.procVersion" disabled></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="当前环节">
                  <el-input v-model="currentActName" disabled></el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>
      </el-collapse-item>
      <el-collapse-item
        name="tab2"
        v-if="testType == 0 && groupRulesRelDM.length > 0"
      >
        <template slot="title">
          <span class="title-line"></span>
          <span class="cud-avue-title">流程表单规则字段</span>
        </template>
        <div>
          <el-form
            ref="simulationForm"
            :model="simulationParamsForm"
            size="small"
            label-width="150px"
          >
            <div>
              <el-row>
                <el-col
                  :span="12"
                  v-for="(item, index) in groupRulesRelDM"
                  :key="index"
                >
                  <el-form-item :label="item.label" :prop="testType">
                    <el-input
                      @blur="blurRulesRelDm"
                      v-model="item.mockValue"
                      placeholder="请输入内容"
                    ></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </el-form>
        </div>
      </el-collapse-item>
      <el-collapse-item v-if="testType == 0 && !autoFlag" name="tab3">
        <template slot="title">
          <span class="title-line"></span>
          <span class="cud-avue-title">流程流转信息</span>
        </template>
        <el-form
          ref="simulationForm"
          :model="simulationParamsForm"
          size="small"
          label-width="150px"
        >
          <div>
            <el-row v-if="!isEnd">
              <el-col :span="24">
                <el-form-item label="流程处理" v-if="!isEnd">
                  <el-radio-group v-model="submitType">
                    <el-radio label="1">提交</el-radio>
                    <el-radio
                      label="0"
                      :disabled="sendBackConfig.actsBackAllow.length == 0"
                      >退回</el-radio
                    >
                  </el-radio-group>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row v-if="submitType == 1 && !isEnd">
              <el-col :span="24">
                <el-form-item label="目标环节">
                  <!-- <el-input v-model="targetActName" readonly></el-input> -->
                  <el-input
                    v-if="!isShowSelectAct"
                    v-model="targetActName"
                    disabled
                  ></el-input>
                  <el-select
                    v-else
                    v-model="targetActName"
                    @change="handlerChangeTargetAct"
                  >
                    <el-option
                      v-for="(item, index) in nextActData"
                      :key="index"
                      :label="item.actName"
                      :value="item.actId"
                      :disabled="item.disabled"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row
              v-if="
                defaultNextAct &&
                  defaultNextAct.actType != 5 &&
                  submitType == 1 &&
                  !isEnd
              "
            >
              <el-col :span="24">
                <el-form-item label="目标环节处理人">
                  <el-input :value="userName" disabled class="form-input">
                    <el-button
                      icon="el-icon-plus"
                      slot="append"
                      @click="openActParticipantFunc"
                      style="
                    color: #ffffff !important;
                    background-color: #0c7bca !important;
                    border-radius: 0 5px 5px 0;
                  "
                    ></el-button>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row v-if="submitType == 0">
              <el-col :span="24">
                <el-form-item label="退回规则">
                  <el-radio-group v-model="actBackRule">
                    <el-radio label="2" disabled>退回后重新审批</el-radio>
                    <el-radio label="1" disabled>退回后返回</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row v-if="submitType == 0">
              <el-col :span="24">
                <el-form-item label="可退回环节">
                  <el-select v-model="actBackId">
                    <template v-for="(item, index) in procTemplateData.actDef">
                      <el-option
                        v-if="sendBackConfig.actsBackAllow.includes(item.actId)"
                        :key="index"
                        :label="item.actName"
                        :value="item.actId"
                      ></el-option>
                    </template>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </el-form>
        <el-row justify="center">
          <el-col :span="24">
            <div class="centerBtnBox">
              <el-button
                size="small"
                type="primary"
                style="margin-right:10px"
                @click="submitProcTest"
                v-if="testType == 0"
                :disabled="autoFlag"
                >执行</el-button
              >
              <!-- <el-button
                    size="small"
                    type="primary"
                    @click="createProcAct"
                    v-if="testType == 1"
                    style="margin-right:10px"
                    :disabled="loading"
                    >创建环节</el-button
                  > -->
              <!-- <el-button
                size="small"
                type="primary"
                @click="autoExecute"
                v-if="testType == 1"
                :disabled="
                  actList.length == 0 || (actList.length !== 0 && autoFlag)
                "
                >执行</el-button
              > -->
            </div>
          </el-col>
        </el-row>
      </el-collapse-item>
      <el-collapse-item v-if="testType == 1" name="tab4">
        <template slot="title">
          <span class="title-line"></span>
          <span class="cud-avue-title">流程环节</span>
        </template>

        <div>
          <el-table
            :data="actList"
            style="padding: 0px 10px"
            v-loading="loading"
          >
            <el-table-column
              align="left"
              show-overflow-tooltip
              prop="actName"
              :label="$t('pm.analogTable.nodeName')"
            >
              <template slot-scope="{ row }">
                <el-select
                  v-if="row.length"
                  v-model="targetActName"
                  @change="changeSelectActive"
                >
                  <el-option
                    v-for="(item, index) in row"
                    :key="index"
                    :label="item.actName"
                    :value="item.actId"
                  ></el-option>
                </el-select>
                <span v-else>{{ row.actName }}</span>
              </template>
            </el-table-column>
            <!-- <el-table-column
              align="left"
              show-overflow-tooltip
              prop="userDetail"
              label="处理人"
            >
              <template slot-scope="scope">
                <span v-if="scope.row.userDetail">{{
                  scope.row.userDetail
                }}</span>
              </template>
            </el-table-column> -->
            <el-table-column
              align="left"
              show-overflow-tooltip
              prop="userName"
              label="负责人"
            >
              <!-- <template slot-scope="scope">
                <div style="padding: 5px" v-if="scope.row.actType != 5">
                  <el-input
                    :value="filterUserNo(scope.row.userName)"
                    readonly
                    class="form-input"
                  >
                    <el-button
                      icon="el-icon-plus"
                      slot="append"
                      @click="openActParticipantFunc(scope)"
                      style="
                        color: #ffffff !important;
                        background-color: #0c7bca !important;
                        border-radius: 0 5px 5px 0;
                      "
                    ></el-button>
                  </el-input>
                </div>
              </template> -->
            </el-table-column>
          </el-table>
          <br />
        </div>
        <el-row justify="center">
          <el-col :span="24">
            <div class="centerBtnBox">
              <!-- <el-button
                    size="small"
                    type="primary"
                    style="margin-right:10px"
                    @click="submitProcTest"
                    v-if="testType == 0"
                    :disabled="autoFlag"
                    >执行</el-button
                  > -->
              <!-- <el-button
                    size="small"
                    type="primary"
                    @click="createProcAct"
                    v-if="testType == 1"
                    style="margin-right:10px"
                    :disabled="loading"
                    >创建环节</el-button
                  > -->
              <el-button
                size="small"
                type="primary"
                @click="autoExecute"
                v-if="testType == 1"
                :disabled="
                  actList.length == 0 || (actList.length !== 0 && autoFlag)
                "
                >执行</el-button
              >
            </div>
          </el-col>
        </el-row>
      </el-collapse-item>
      <el-collapse-item name="tab5" style="background-color: #ffffff">
        <template slot="title">
          <span class="title-line"></span>
          <span class="cud-avue-title">流程日志</span>
        </template>
        <div>
          <el-table
            :data="tableData"
            :empty-text="$t('cm.nodata')"
            highlight-current-row
            header-row-class-name="cud-office-table-header"
            class="cud-office-table"
            v-loading="listLoading"
            style="padding: 0px 10px"
          >
            <el-table-column
              align="left"
              show-overflow-tooltip
              prop="nodeName"
              label="当前环节"
            ></el-table-column>
            <el-table-column
              align="left"
              show-overflow-tooltip
              prop="approvedBy"
              v-if="testType == 1"
              label="当前环节负责人"
            ></el-table-column>
            <el-table-column
              align="left"
              show-overflow-tooltip
              prop="targetNodeName"
              label="目标环节"
            ></el-table-column>
            <el-table-column
              align="left"
              show-overflow-tooltip
              prop="approvedBy"
              v-if="testType != 1"
              label="目标环节处理人"
            ></el-table-column>
            <el-table-column
              align="left"
              show-overflow-tooltip
              prop="approvalTime"
              :label="$t('pm.analogTable.approveTime')"
            ></el-table-column>
            <el-table-column
              align="left"
              show-overflow-tooltip
              prop="approvalResult"
              label="流程流转状态"
            >
              <template slot-scope="scope">
                {{ [0, 3].includes(scope.row.testResult) ? "成功" : "失败" }}
              </template>
            </el-table-column>
            <el-table-column
              align="left"
              show-overflow-tooltip
              prop="resultDes"
              :label="$t('pm.analogTable.simulationDesc')"
            ></el-table-column>
            <el-table-column
              align="left"
              show-overflow-tooltip
              prop="testResult"
              :label="$t('pm.analogTable.simulationResult')"
            >
              <template slot-scope="scope">
                {{ [0, 3].includes(scope.row.testResult) ? "成功" : "失败" }}
              </template>
            </el-table-column>
            <!-- <el-table-column
              align="left"
              show-overflow-tooltip
              :label="$t('pm.analogTable.operate')"
            >
              <template slot-scope="scope">
                <span
                  style="color: #006aaf; cursor: pointer"
                  @click="preview(scope)"
                  >预览</span
                >
              </template>
            </el-table-column> -->
          </el-table>

          <div class="cud-special-pagination cud-special-pagination-button">
            <el-pagination
              style="margin-bottom:20px"
              popper-class="cud-pager-dropdown"
              ref="pager"
              class="cud__page"
              @size-change="changeSize"
              @current-change="changeCurrentPage"
              :current-page.sync="pageIndex"
              :page-sizes="[10, 20, 30, 40]"
              :page-size.sync="pageSize"
              :pager-count="5"
              layout="total,sizes, prev, pager, next"
              :total="total"
            >
            </el-pagination>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
    <!-- 流程节点 -->
    <!-- <el-collapse
      v-model="activeName4"
      v-for="(item, index) in rulesList"
      :key="index"
    >
      <el-collapse-item :name="index" v-if="item.actName">
        <template slot="title">
          <span class="title-line"></span>
          <span class="cud-avue-title">流程节点: {{ item.actName }} </span>
          <span style="margin-left: 20px; font-weight: 400; color: #a5a5a5"
            >规则名称: {{ item.ruleMasterName }}</span
          >
        </template>
        <el-form size="small" label-width="150px">
          <el-row>
            <div>
              <el-col
                :span="12"
                v-for="(item1, index1) in item.ruleParamList"
                :key="index1"
              >
                <el-form-item
                  :label="item1.mockCnName ? item1.mockCnName : item1.mockName"
                >
                  <el-input
                    v-model="item1.mockVal"
                    size="small"
                    :placeholder="String(item1.mockType)"
                  ></el-input>
                </el-form-item>
              </el-col>
            </div>
          </el-row>
        </el-form>
      </el-collapse-item>
    </el-collapse> -->

    <el-dialog
      width="60%"
      :visible.sync="showActParticipantDialog"
      v-if="showActParticipantDialog"
      custom-class="act-creator-dialog"
      :modal="false"
      :destory-on-close="true"
      title="执行人配置"
      :close-on-click-modal="false"
      v-dragMove="{
        DragButton: '.el-dialog__header',
        DragWindow: '.el-dialog'
      }"
    >
      <div class="el-dialog-div">
        <wf-comm-person-component
          ref="wfCommPersonComponentId"
          :initUserId="userNo"
        ></wf-comm-person-component>
      </div>
      <div slot="footer" class="dialog-footer" align="center">
        <el-button size="small" @click="closeActParticipantFunc">{{
          $t("cm.cancel")
        }}</el-button>
        <el-button
          size="small"
          type="primary"
          @click="commitActParticipantFunc"
          >{{ $t("cm.commit") }}</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
import runPage from "./js/runPage";
export default runPage;
</script>
<style scoped lang="less">
// 必须引入
@import "../customFlow/css/index.less";
.customFlow {
  padding-bottom: 20px;
}
.centerBtnBox {
  display: flex;
  justify-content: center;
}
/deep/ .el-collapse-item {
  margin-bottom: 0 !important;
}
/deep/ .el-collapse-item__content{
  padding-top:15px !important
}
</style>
