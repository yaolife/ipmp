<template>
  <div class="hanger-detail-page">
    <div class="detail-topbar">
      <div class="detail-crumb">
        <span>资产管理</span>
        <i class="el-icon-arrow-right crumb-sep"></i>
        <span>支吊架数据库</span>
        <i class="el-icon-arrow-right crumb-sep"></i>
        <span class="crumb-current">{{ pageTitle }}</span>
      </div>
    </div>

    <div class="detail-head-card">
      <div class="detail-head-title-row">
        <h2>支吊架详情</h2>
        <div class="detail-top-actions">
          <el-button size="small" @click="goBack">返回</el-button>
          <el-button
            v-if="pageType !== 'view'"
            type="primary"
            size="small"
            :loading="submitLoading"
            @click="submitForm"
            >保存</el-button
          >
        </div>
      </div>
      <p>支吊架编号：{{ detailInfo.hangerNo || "-" }}</p>
    </div>

    <div class="detail-body-card">
    <el-tabs
      v-model="activeTab"
      class="detail-tabs"
      @tab-click="handleTabClick"
    >
      <el-tab-pane label="基本信息" name="baseInfo">
        <el-form
          ref="detailForm"
          :model="detailInfo"
          :rules="detailRules"
          label-width="150px"
          label-position="left"
          class="detail-form"
        >
          <el-row :gutter="8">
            <!-- 第一行剩余3列 -->

            <el-col :span="6" class="my-el-col-ind">
              <el-form-item label="支吊架编号:" prop="hangerNo">
                <el-input
                  v-model="detailInfo.hangerNo"
                  :disabled="pageType === 'view' || pageType === 'edit'"
                  placeholder="请输入"
                ></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="6" class="my-el-col-ind">
              <el-form-item label="机组号:" prop="unitNumber">
                <el-input
                  v-model="detailInfo.unitNumber"
                  :disabled="pageType === 'view' || pageType === 'edit'"
                  placeholder="请输入"
                ></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="6" class="my-el-col-ind">
              <el-form-item label="系统编号:" prop="systemNumber">
                <el-input
                  v-model="detailInfo.systemNumber"
                  :disabled="pageType === 'view'"
                  placeholder="请输入"
                ></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="6" class="my-el-col-ind">
              <el-form-item
                label="核岛/常规岛:"
                prop="nuclearIslandConventionalIsland"
              >
                <el-input
                  v-model="detailInfo.nuclearIslandConventionalIsland"
                  :disabled="pageType === 'view' || pageType === 'edit'"
                  placeholder="请输入"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="8">
            <el-col :span="6" class="my-el-col">
              <el-form-item label="安全区域:" prop="installationArea">
                <el-input
                  v-model="detailInfo.installationArea"
                  placeholder="请输入"
                  :disabled="pageType === 'view'"
                ></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="6" class="my-el-col">
              <el-form-item label="房间号:" prop="roomNumber">
                <el-input
                  v-model="detailInfo.roomNumber"
                  placeholder="请输入"
                  :disabled="pageType === 'view'"
                ></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="6" class="my-el-col">
              <el-form-item
                label="支吊架分类:"
                prop="supportHangerClassification"
              >
                <el-select
                  v-model="detailInfo.supportHangerClassification"
                  style="width: 100%"
                  placeholder="请选择"
                  :disabled="pageType === 'view'"
                >
                  <el-option label="支吊架" value="支吊架"></el-option>

                  <el-option label="弹簧支吊架" value="弹簧支吊架"></el-option>

                  <el-option label="阻尼器" value="阻尼器"></el-option>
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="6" class="my-el-col">
              <el-form-item label="支吊架类型:" prop="hangerType">
                <el-input
                  v-model="detailInfo.hangerType"
                  placeholder="请输入"
                  :disabled="pageType === 'view'"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="8">
            <el-col :span="6" class="my-el-col">
              <el-form-item label="功能件型号:" prop="functionalModel">
                <el-input
                  v-model="detailInfo.functionalModel"
                  placeholder="请输入"
                  :disabled="pageType === 'view'"
                ></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="6" class="my-el-col-ind">
              <el-form-item
                label="支吊架RCCM等级:"
                prop="rccmGradeSupportHanger"
              >
                <el-input
                  v-model="detailInfo.rccmGradeSupportHanger"
                  :disabled="pageType === 'view' || pageType === 'edit'"
                  placeholder="请输入"
                ></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="6" class="my-el-col">
              <el-form-item label="功能件数量:" prop="numberFunctionalParts">
                <el-input
                  v-model="detailInfo.numberFunctionalParts"
                  placeholder="请输入"
                  :disabled="pageType === 'view'"
                ></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="6" class="my-el-col">
              <el-form-item label="制造商名称:" prop="manufacturerName">
                <el-input
                  v-model="detailInfo.manufacturerName"
                  placeholder="请输入"
                  :disabled="pageType === 'view'"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="8">
            <el-col :span="6" class="my-el-col">
              <el-form-item label="等轴图号:" prop="isometricNumber">
                <el-input
                  v-model="detailInfo.isometricNumber"
                  placeholder="请输入"
                  :disabled="pageType === 'view'"
                ></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="6" class="my-el-col">
              <el-form-item
                label="支吊架安装图号:"
                prop="supportHangerInstallationDrawingNumber"
              >
                <el-input
                  v-model="detailInfo.supportHangerInstallationDrawingNumber"
                  placeholder="请输入"
                  :disabled="pageType === 'view'"
                ></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="6" class="my-el-col">
              <el-form-item
                label="支吊架安装图内部码:"
                prop="supportHangerInstallationDiagramInternalCode"
              >
                <el-input
                  v-model="
                    detailInfo.supportHangerInstallationDiagramInternalCode
                  "
                  placeholder="请输入"
                  :disabled="pageType === 'view'"
                ></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="6" class="my-el-col">
              <el-form-item label="所在管线编号:" prop="pipelineNumber">
                <el-input
                  v-model="detailInfo.pipelineNumber"
                  placeholder="请输入"
                  :disabled="pageType === 'view'"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="8">
            <el-col :span="6" class="my-el-col">
              <el-form-item label="流程图号:" prop="flowChartNumber">
                <el-input
                  v-model="detailInfo.flowChartNumber"
                  placeholder="请输入"
                  :disabled="pageType === 'view'"
                ></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="6" class="my-el-col">
              <el-form-item
                label="管线在流程图坐标:"
                prop="pipelineCoordinatesFlowChart"
              >
                <el-input
                  v-model="detailInfo.pipelineCoordinatesFlowChart"
                  placeholder="请输入"
                  :disabled="pageType === 'view'"
                ></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="6" class="my-el-col">
              <el-form-item label="管线RCCM等级:" prop="pipelineRccmGrade">
                <el-input
                  v-model="detailInfo.pipelineRccmGrade"
                  placeholder="请输入"
                  :disabled="pageType === 'view'"
                ></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="6" class="my-el-col">
              <el-form-item
                label="管线公称直径(英寸):"
                prop="pipelineNominalDiameter"
              >
                <el-input
                  v-model="detailInfo.pipelineNominalDiameter"
                  placeholder="请输入"
                  :disabled="pageType === 'view'"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="8">
            <el-col :span="6" class="my-el-col">
              <el-form-item label="管道外径(mm):" prop="pipeDiameter">
                <el-input
                  v-model="detailInfo.pipeDiameter"
                  placeholder="请输入"
                  :disabled="pageType === 'view'"
                ></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="6" class="my-el-col">
              <el-form-item label="管道中心标高(m):" prop="pipeCenterElevation">
                <el-input
                  v-model="detailInfo.pipeCenterElevation"
                  placeholder="请输入"
                  :disabled="pageType === 'view'"
                ></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="6" class="my-el-col">
              <el-form-item label="工作压力(bar):" prop="workPressure">
                <el-input
                  v-model="detailInfo.workPressure"
                  placeholder="请输入"
                  :disabled="pageType === 'view'"
                ></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="6" class="my-el-col">
              <el-form-item label="工作温度(℃):" prop="operatingTemperature">
                <el-input
                  v-model="detailInfo.operatingTemperature"
                  placeholder="请输入"
                  :disabled="pageType === 'view'"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="8">
            <el-col :span="6" class="my-el-col">
              <el-form-item label="热位移(mm):" prop="thermalDisplacement">
                <el-input
                  v-model="detailInfo.thermalDisplacement"
                  placeholder="请输入"
                  :disabled="pageType === 'view'"
                ></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="6" class="my-el-col">
              <el-form-item label="X(冷态/热态)(mm):" prop="hotAndColdX">
                <el-input
                  v-model="detailInfo.hotAndColdX"
                  placeholder="请输入"
                  :disabled="pageType === 'view'"
                ></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="6" class="my-el-col">
              <el-form-item label="Y(冷态/热态)(mm):" prop="hotAndColdY">
                <el-input
                  v-model="detailInfo.hotAndColdY"
                  placeholder="请输入"
                  :disabled="pageType === 'view'"
                ></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="6" class="my-el-col">
              <el-form-item label="Z(冷态/热态)(mm):" prop="hotAndColdZ">
                <el-input
                  v-model="detailInfo.hotAndColdZ"
                  placeholder="请输入"
                  :disabled="pageType === 'view'"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="8">
            <el-col :span="6" class="my-el-col">
              <el-form-item label="结构载荷(KN):" prop="structuralLoad">
                <el-input
                  v-model="detailInfo.structuralLoad"
                  placeholder="请输入"
                  :disabled="pageType === 'view'"
                ></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="6" class="my-el-col">
              <el-form-item label="冷态载荷/安装载荷(KN):" prop="coldLoad">
                <el-input
                  v-model="detailInfo.coldLoad"
                  placeholder="请输入"
                  :disabled="pageType === 'view'"
                ></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="6" class="my-el-col">
              <el-form-item label="热态载荷/工作载荷(KN):" prop="thermalLoad">
                <el-input
                  v-model="detailInfo.thermalLoad"
                  placeholder="请输入"
                  :disabled="pageType === 'view'"
                ></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="6" class="my-el-col">
              <el-form-item label="刚度(N/mm):" prop="stiffness">
                <el-input
                  v-model="detailInfo.stiffness"
                  placeholder="请输入"
                  :disabled="pageType === 'view'"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="8">
            <el-col :span="6" class="my-el-col">
              <el-form-item label="行程(mm):" prop="itinerary">
                <el-input
                  v-model="detailInfo.itinerary"
                  placeholder="请输入"
                  :disabled="pageType === 'view'"
                ></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="6" class="my-el-col">
              <el-form-item label="检查周期:" prop="inspectionCycle">
                <el-input
                  v-model="detailInfo.inspectionCycle"
                  placeholder="请输入"
                  :disabled="pageType === 'view'"
                ></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="6" class="my-el-col">
              <el-form-item label="大修轮次:" prop="roundNumber">
                <el-input
                  v-model="detailInfo.roundNumber"
                  placeholder="请输入"
                  :disabled="pageType === 'view'"
                ></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="6" class="my-el-col">
              <el-form-item label="备注:" prop="remark">
                <el-input
                  v-model="detailInfo.remark"
                  placeholder="请输入"
                  :disabled="pageType === 'view'"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="8">
            <el-col :span="6" class="my-el-col">
              <el-form-item label="要求刻度(mm):" prop="requiredScale">
                <el-input
                  v-model="detailInfo.requiredScale"
                  placeholder="请输入"
                  :disabled="pageType === 'view'"
                ></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="6" class="my-el-col">
              <el-form-item label="最大刻度(mm):" prop="maximumScale">
                <el-input
                  v-model="detailInfo.maximumScale"
                  placeholder="请输入"
                  :disabled="pageType === 'view'"
                ></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="6" class="my-el-col">
              <el-form-item label="最小刻度(mm):" prop="minimumScale">
                <el-input
                  v-model="detailInfo.minimumScale"
                  placeholder="请输入"
                  :disabled="pageType === 'view'"
                ></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="6" class="my-el-col">
              <el-form-item label="要求载荷(KN):" prop="requiredLoad">
                <el-input
                  v-model="detailInfo.requiredLoad"
                  placeholder="请输入"
                  :disabled="pageType === 'view'"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="8">
            <el-col :span="6" class="my-el-col">
              <el-form-item label="最大载荷(KN):" prop="maximumLoad">
                <el-input
                  v-model="detailInfo.maximumLoad"
                  placeholder="请输入"
                  :disabled="pageType === 'view'"
                ></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="6" class="my-el-col">
              <el-form-item label="最小载荷(KN):" prop="minimumLoad">
                <el-input
                  v-model="detailInfo.minimumLoad"
                  placeholder="请输入"
                  :disabled="pageType === 'view'"
                ></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="6" class="my-el-col">
              <el-form-item label="零刻度载荷(KN):" prop="zeroScaleLoad">
                <el-input
                  v-model="detailInfo.zeroScaleLoad"
                  placeholder="请输入"
                  :disabled="pageType === 'view'"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="检修记录" name="maintainRecordJh">
        <div class="maintain-record-container">
          <!-- 纯展示无操作栏，直接表格+分页 -->

          <el-table
            ref="maintainTable"
            :data="pageMaintainList"
            :height="tableHeight"
            border
            stripe
            style="width: 100%"
            v-loading="pageMaintainLoading"
          >
            <el-table-column
              prop="hangerNo"
              label="支吊架编号"
              width="220"
              align="center"
            ></el-table-column>

            <!--            <el-table-column-->

            <!--              prop="maintainStatus"-->

            <!--              label="检修状态"-->

            <!--              width="120"-->

            <!--              align="center"-->

            <!--            >-->

            <!--              <template slot-scope="scope">-->

            <!--                <el-tag-->

            <!--                  :type="getStatusType(scope.row.maintainStatus)"-->

            <!--                  size="small"-->

            <!--                >-->

            <!--                  {{ scope.row.maintainStatus }}-->

            <!--                </el-tag>-->

            <!--              </template>-->

            <!--            </el-table-column>-->

            <el-table-column
              prop="unitNumber"
              label="机组号"
              min-width="80"
            ></el-table-column>

            <el-table-column
              prop="systemNumber"
              label="系统号"
              min-width="120"
            ></el-table-column>

            <el-table-column
              prop="supportHangerClassification"
              label="支吊架分类"
              min-width="120"
            ></el-table-column>

            <el-table-column
              prop="hangerType"
              label="支吊架类型"
              width="120"
              align="center"
            ></el-table-column>

            <el-table-column
              prop="recordDate"
              label="记录时间"
              width="120"
              align="center"
            ></el-table-column>

            <el-table-column
              prop="nuclearIslandConventionalIsland"
              label="核岛/常规岛"
              width="120"
              align="center"
            ></el-table-column>

            <el-table-column
              prop="defectDescribe"
              label="缺陷描述"
              width="170"
              align="center"
            ></el-table-column>

            <el-table-column
              prop="treatmentMeasure"
              label="处理措施"
              width="270"
              align="center"
              show-overflow-tooltip
            ></el-table-column>

            <el-table-column
              prop="maintenanceType"
              label="检修类型"
              width="120"
              align="center"
            ></el-table-column>

            <el-table-column
              prop="planNumber"
              label="计划编号"
              width="120"
              align="center"
            ></el-table-column>

            <el-table-column
              prop="inspectionResult"
              label="检修结果"
              width="120"
              align="center"
            ></el-table-column>

            <el-table-column
              prop="approvalStatus"
              label="检修状态"
              width="120"
              align="center"
            ></el-table-column>

            <el-table-column
              prop="overhauler"
              label="检修员"
              width="120"
              align="center"
            ></el-table-column>

            <el-table-column
              prop="updateTime"
              label="更新时间"
              width="180"
              align="center"
            ></el-table-column>
          </el-table>

          <!-- 分页组件，纯只读翻页 -->

          <el-pagination
            class="maintain-pagination"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="pagination.current"
            :page-sizes="[10, 20, 50]"
            :page-size="pagination.size"
            layout="total, sizes, prev, pager, next, jumper"
            :total="maintainTotal"
          />
        </div>
      </el-tab-pane>

      <el-tab-pane label="日常巡检" name="maintainRecordRc">
        <div class="maintain-record-container">
          <!-- 纯展示无操作栏，直接表格+分页 -->

          <el-table
            ref="inspectTable"
            :data="pageMaintainRcList"
            :height="tableHeight"
            border
            stripe
            style="width: 100%"
            v-loading="pageMaintainRcLoading"
          >
            <el-table-column
              prop="hangerNo"
              label="支吊架编号"
              width="220"
              align="center"
            ></el-table-column>

            <!--            <el-table-column-->

            <!--              prop="maintainStatus"-->

            <!--              label="检修状态"-->

            <!--              width="120"-->

            <!--              align="center"-->

            <!--            >-->

            <!--              <template slot-scope="scope">-->

            <!--                <el-tag-->

            <!--                  :type="getStatusType(scope.row.maintainStatus)"-->

            <!--                  size="small"-->

            <!--                >-->

            <!--                  {{ scope.row.maintainStatus }}-->

            <!--                </el-tag>-->

            <!--              </template>-->

            <!--            </el-table-column>-->

            <el-table-column
              prop="unitNumber"
              label="机组号"
              min-width="80"
            ></el-table-column>

            <el-table-column
              prop="systemNumber"
              label="系统号"
              min-width="120"
            ></el-table-column>

            <el-table-column
              prop="supportHangerClassification"
              label="支吊架分类"
              min-width="120"
            ></el-table-column>

            <el-table-column
              prop="hangerType"
              label="支吊架类型"
              width="120"
              align="center"
            ></el-table-column>

            <el-table-column
              prop="recordDate"
              label="记录时间"
              width="120"
              align="center"
            ></el-table-column>

            <el-table-column
              prop="nuclearIslandConventionalIsland"
              label="核岛/常规岛"
              width="120"
              align="center"
            ></el-table-column>

            <el-table-column
              prop="defectDescribe"
              label="缺陷描述"
              width="170"
              align="center"
            ></el-table-column>

            <el-table-column
              prop="treatmentMeasure"
              label="处理措施"
              width="270"
              align="center"
              show-overflow-tooltip
            ></el-table-column>

            <el-table-column
              prop="maintenanceType"
              label="检修类型"
              width="120"
              align="center"
            ></el-table-column>

            <el-table-column
              prop="inspectionResult"
              label="检修结果"
              width="120"
              align="center"
            ></el-table-column>

            <el-table-column
              prop="approvalStatus"
              label="检修状态"
              width="120"
              align="center"
            ></el-table-column>

            <el-table-column
              prop="overhauler"
              label="检修员"
              width="120"
              align="center"
            ></el-table-column>

            <el-table-column
              prop="updateTime"
              label="更新时间"
              width="180"
              align="center"
            ></el-table-column>
          </el-table>

          <!-- 分页组件，纯只读翻页 -->

          <el-pagination
            class="maintain-pagination"
            @size-change="handleSizeChangeRc"
            @current-change="handleCurrentChangeRc"
            :current-page="paginationRc.current"
            :page-sizes="[10, 20, 50]"
            :page-size="paginationRc.size"
            layout="total, sizes, prev, pager, next, jumper"
            :total="maintainRcTotal"
          />
        </div>
      </el-tab-pane>
    </el-tabs>
    </div>
  </div>
</template>

<script>
import api from "../api";

export default {
  name: "fupportDetail",

  data() {
    return {
      hangerImg: "./支吊架.png",

      pageType: "view",

      activeTab: "baseInfo",

      tableHeight: 360,

      submitLoading: false,

      maintainTotal: 0,

      maintainRcTotal: 0,

      pageMaintainList: [],

      pageMaintainRcList: [],

      pageMaintainLoading: false,

      pageMaintainRcLoading: false,

      // 原有基础信息字段完全保留

      detailInfo: {
        id: "",

        hangerNo: "",

        unitNumber: "",

        systemNumber: "",

        nuclearIslandConventionalIsland: "",

        installationArea: "",

        roomNumber: "",

        supportHangerClassification: "",

        hangerType: "",

        functionalModel: "",

        rccmGradeSupportHanger: "",

        numberFunctionalParts: "",

        manufacturerName: "",

        isometricNumber: "",

        supportHangerInstallationDrawingNumber: "",

        supportHangerInstallationDiagramInternalCode: "",

        pipelineNumber: "",

        flowChartNumber: "",

        pipelineCoordinatesFlowChart: "",

        pipelineRccmGrade: "",

        pipelineNominalDiameter: "",

        pipeDiameter: "",

        pipeCenterElevation: "",

        workPressure: "",

        operatingTemperature: "",

        thermalDisplacement: "",

        hotAndColdX: "",

        hotAndColdY: "",

        hotAndColdZ: "",

        structuralLoad: "",

        coldLoad: "",

        thermalLoad: "",

        stiffness: "",

        itinerary: "",

        requiredScale: "",

        maximumScale: "",

        minimumScale: "",

        requiredLoad: "",

        maximumLoad: "",

        minimumLoad: "",

        zeroScaleLoad: "",

        inspectionCycle: "",

        roundNumber: "",

        remark: "",

        hangerImg: ""
      },

      detailRules: {
        hangerNo: [
          { required: true, message: "请输入支吊架编号", trigger: "blur" }
        ],

        unitNumber: [
          { required: true, message: "请选择机组号", trigger: "change" }
        ],

        systemNumber: [
          { required: true, message: "请输入系统号", trigger: "blur" }
        ],

        nuclearIslandConventionalIsland: [
          { required: true, message: "请选择核岛/常规岛", trigger: "change" }
        ],

        supportHangerClassification: [
          { required: true, message: "请选择支吊架分类", trigger: "change" }
        ]
      },

      pagination: {
        current: 1,

        size: 10
      },

      paginationRc: {
        current: 1,

        size: 10
      }
    };
  },

  computed: {
    pageTitle() {
      const titleMap = {
        add: "新增支吊架",

        edit: "编辑支吊架",

        view: "支吊架详情"
      };

      return titleMap[this.pageType];
    }
  },

  created() {
    this.pageType = this.$route.query.pageType || "add";

    this.loadDictData();

    if (this.pageType !== "add") {
      this.detailInfo.id = this.$route.query.id;

      this.loadFupportDetail();
    }
  },

  mounted() {
    this.fitLayout();
    window.addEventListener("resize", this.fitLayout);
  },

  beforeDestroy() {
    window.removeEventListener("resize", this.fitLayout);
  },

  methods: {
    fitLayout() {
      this.$nextTick(() => {
        const page = this.$el;
        if (!page || !page.getBoundingClientRect) return;
        const bottomGap = 6;
        page.style.marginBottom = "0";
        const top = page.getBoundingClientRect().top;
        page.style.height =
          Math.max(window.innerHeight - top - bottomGap, 420) + "px";
        this.$nextTick(() => {
          const extra = document.documentElement.scrollHeight - window.innerHeight;
          if (extra > 1) {
            page.style.marginBottom = -extra + "px";
          }
          const content = page.querySelector(".detail-tabs .el-tabs__content");
          if (content) {
            const paginationBlock = 52;
            this.tableHeight = Math.max(
              Math.floor(content.clientHeight - paginationBlock),
              240
            );
          }
          this.$nextTick(() => {
            ["maintainTable", "inspectTable"].forEach(name => {
              const table = this.$refs[name];
              if (table && table.doLayout) table.doLayout();
            });
          });
        });
      });
    },

    handleTabClick(tab) {
      if (tab.name === "maintainRecordJh") {
        this.loadingmaintainRecordJh();
      } else if (tab.name === "maintainRecordRc") {
        this.loadingmaintainRecordRc();
      }
      this.fitLayout();
    },

    loadingmaintainRecordJh() {
      //获取检修记录(计划巡检)

      let params = {
        hangerNo: this.detailInfo.hangerNo, //支吊架编号

        unitNumber: "", //机组号

        systemNumber: "", //系统号

        supportHangerClassification: "",

        hangerType: "",

        nuclearIslandConventionalIsland: "",

        planNumber: "",

        planStatus: "",

        inspectionResult: "",

        overhauler: "",

        iwerk: "5060",

        maintenanceType: "JXJH", //检修记录

        pageIndex: this.pagination.current,

        pageSize: this.pagination.size
      };

      this.pageMaintainLoading = true;

      api.getMaintenRecordListApi(params).then(res => {
        this.pageMaintainLoading = false;

        let data = res.data;

        if (data.code === "0" && data.data.code === "0") {
          this.pageMaintainList = data.data.data.records;

          this.maintainTotal = data.data.data.total;
        }
      });
    },

    loadingmaintainRecordRc() {
      //获取检修记录(日常巡检)

      let params = {
        hangerNo: this.detailInfo.hangerNo, //支吊架编号

        unitNumber: "", //机组号

        systemNumber: "", //系统号

        supportHangerClassification: "",

        hangerType: "",

        nuclearIslandConventionalIsland: "",

        planNumber: "",

        planStatus: "",

        inspectionResult: "",

        overhauler: "",

        iwerk: "5060",

        maintenanceType: "RCXJ", //检修记录

        pageIndex: this.paginationRc.current,

        pageSize: this.paginationRc.size
      };

      this.pageMaintainRcLoading = true;

      api.getMaintenRecordListApi(params).then(res => {
        this.pageMaintainRcLoading = false;

        let data = res.data;

        if (data.code === "0" && data.data.code === "0") {
          this.pageMaintainRcList = data.data.data.records;

          this.maintainRcTotal = data.data.data.total;
        }
      });
    },

    // 状态颜色适配，纯展示无交互

    getStatusType(status) {
      const map = {
        待开始: "info",

        进行中: "warning",

        已完成: "success"
      };

      return map[status] || "info";
    },

    // 分页纯只读翻页，无任何数据修改逻辑

    handleSizeChange(val) {
      this.pagination.size = val;

      this.pagination.current = 1;

      //重新查询数据

      this.loadingmaintainRecordJh();
    },

    // 分页纯只读翻页，无任何数据修改逻辑

    handleSizeChangeRc(val) {
      this.paginationRc.size = val;

      this.paginationRc.current = 1;

      //重新查询数据

      this.loadingmaintainRecordRc();
    },

    handleCurrentChange(val) {
      this.pagination.current; //基础方法完全保留无改动

      this.loadingmaintainRecordJh();
    },

    handleCurrentChangeRc(val) {
      this.paginationRc.current; //基础方法完全保留无改动

      this.loadingmaintainRecordRc();
    },

    async loadDictData() {},

    async loadFupportDetail() {
      const res = await api.getFupportDetailApi({ id: this.detailInfo.id });

      if (res.data.code === "0") {
        this.detailInfo = res.data.data;
      }
    },

    submitForm() {
      this.$refs.detailForm.validate(valid => {
        if (valid) {
          this.submitLoading = true;

          api

            .saveModifyFupportApi(this.detailInfo)

            .then(res => {
              if (res.data.code === "0") {
                this.$message.success(
                  this.pageType === "add" ? "新增成功" : "编辑成功"
                );

                this.goFupportInfo();
              } else {
                this.$message.error(res.data.msg || "操作失败");
              }
            })

            .finally(() => {
              this.submitLoading = false;
            });
        }
      });
    },

    goBack() {
      this.$router.back();
    },

    goFupportInfo() {
      this.$root.$emit("refreshFupportList");

      this.$router.push({
        path: "/hangerDatabase"
      });
    }
  }
};
</script>

<style lang="less" scoped>
.hanger-detail-page {
  height: calc(100vh - 110px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: transparent;
  padding: 16px 20px 0;
  box-sizing: border-box;
}
.detail-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  margin-bottom: 12px;
}
.detail-crumb {
  font-size: 13px;
  color: #909399;
  .crumb-sep {
    margin: 0 6px;
    font-size: 12px;
  }
  .crumb-current {
    color: #1f2329;
    font-weight: 500;
  }
}
.detail-top-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.detail-head-card,
.detail-body-card {
  background: #fff;
  border: 1px solid #e6e8eb;
  border-radius: 8px;
  margin-bottom: 12px;
}
.detail-head-card {
  flex-shrink: 0;
  padding: 16px 20px;
}
.detail-head-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #1f2329;
    line-height: 32px;
  }
}
.detail-head-card p {
  margin: 6px 0 0;
  font-size: 13px;
  color: #909399;
}
.detail-body-card {
  flex: 1;
  min-height: 0;
  margin-bottom: 0;
  padding: 0 16px 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.detail-tabs {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  /deep/ .el-tabs__header {
    flex-shrink: 0;
    margin-bottom: 12px;
  }
  /deep/ .el-tabs__content {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }
  /deep/ .el-tab-pane {
    height: 100%;
    overflow: hidden;
    box-sizing: border-box;
  }
  /deep/ .el-tabs__nav-wrap::after {
    height: 1px;
    background-color: #e6e8eb;
  }
  /deep/ .el-tabs__item {
    height: 44px;
    line-height: 44px;
    font-size: 14px;
    color: #606266;
  }
  /deep/ .el-tabs__item.is-active {
    color: #1a6fc4;
    font-weight: 600;
  }
  /deep/ .el-tabs__active-bar {
    background-color: #1a6fc4;
    height: 2px;
  }
}
.detail-form {
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  /deep/ .el-row {
    margin-left: 0 !important;
    margin-right: 0 !important;
  }
  /deep/ .el-col {
    min-width: 0;
  }
  /deep/ .el-form-item__content {
    min-width: 0;
  }
  /deep/ .el-select,
  /deep/ .el-date-editor {
    width: 100%;
  }
}
.my-el-col {
  margin-bottom: 12px;
}
.my-el-col-ind {
  margin-bottom: 12px;
  margin-top: 7px;
}
.maintain-record-container {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  /deep/ .el-table__empty-block {
    min-height: 240px;
  }
}
.maintain-pagination {
  flex-shrink: 0;
  margin-top: 12px;
  text-align: right;
}
/deep/ .el-tooltip__popper {
  max-width: 400px;
}
</style>
