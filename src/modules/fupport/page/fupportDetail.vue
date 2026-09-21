<template>
  <div class="hanger-detail-page">
    <!-- 面包屑导航 -->
    <div class="page-breadcrumb-wrap">
      <i class="el-icon-location-outline breadcrumb-icon"></i>
      <el-breadcrumb class="page-breadcrumb" separator="/">
        <el-breadcrumb-item>资产管理</el-breadcrumb-item>
        <el-breadcrumb-item>支吊架数据库</el-breadcrumb-item>
        <el-breadcrumb-item>{{ pageTitle }}</el-breadcrumb-item>
      </el-breadcrumb>
      <!-- 页面标题 -->
      <div class="page-title">
        支吊架编号：{{ detailInfo.hangerNo || '-' }}
      </div>
    </div>

    <!-- 标签页切换 -->
    <el-tabs v-model="activeTab" class="detail-tabs">
      <el-tab-pane label="基本信息" name="baseInfo">
        <el-form
          ref="detailForm"
          :model="detailInfo"
          :rules="detailRules"
          label-width="150px"
          label-position="left"
          class="detail-form"
        >
          <el-row :gutter="24">
            <!-- 第一行剩余3列 -->
            <el-col :span="6" class="my-el-col-ind">
              <el-form-item label="支吊架编号:" prop="hangerNo">
                <el-input
                  v-model="detailInfo.hangerNo"
                  :disabled="pageType === 'view'|| pageType === 'edit'"
                  placeholder="请输入"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6" class="my-el-col-ind">
              <el-form-item label="机组号:" prop="unitNumber">
                <el-input
                  v-model="detailInfo.unitNumber"
                  :disabled="pageType === 'view'|| pageType === 'edit'"
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
              <el-form-item label="核岛/常规岛:" prop="nuclearIslandConventionalIsland">
                <el-input
                  v-model="detailInfo.nuclearIslandConventionalIsland"
                  :disabled="pageType === 'view'|| pageType === 'edit'"
                  placeholder="请输入"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
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
              <el-form-item label="支吊架分类:" prop="supportHangerClassification">
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

          <el-row :gutter="24">
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
              <el-form-item label="支吊架RCCM等级:" prop="rccmGradeSupportHanger">
                <el-input
                  v-model="detailInfo.rccmGradeSupportHanger"
                  :disabled="pageType === 'view'|| pageType === 'edit'"
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
          <el-row :gutter="24">
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
              <el-form-item label="支吊架安装图号:" prop="supportHangerInstallationDrawingNumber">
                <el-input
                  v-model="detailInfo.supportHangerInstallationDrawingNumber"
                  placeholder="请输入"
                  :disabled="pageType === 'view'"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6" class="my-el-col">
              <el-form-item label="支吊架安装图内部码:" prop="supportHangerInstallationDiagramInternalCode">
                <el-input
                  v-model="detailInfo.supportHangerInstallationDiagramInternalCode"
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

          <el-row :gutter="24">
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
              <el-form-item label="管线在流程图坐标:" prop="pipelineCoordinatesFlowChart">
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
              <el-form-item label="管线公称直径(英寸):" prop="pipelineNominalDiameter">
                <el-input
                  v-model="detailInfo.pipelineNominalDiameter"
                  placeholder="请输入"
                  :disabled="pageType === 'view'"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
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
          <el-row :gutter="24">
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

          <el-row :gutter="24">
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
              <el-form-item label="冷态载荷(KN):" prop="coldLoad">
                <el-input
                  v-model="detailInfo.coldLoad"
                  placeholder="请输入"
                  :disabled="pageType === 'view'"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6" class="my-el-col">
              <el-form-item label="热态载荷(KN):" prop="thermalLoad">
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

          <el-row :gutter="24">
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
          <el-row :gutter="24">
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
          <el-row :gutter="24">
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

      <el-tab-pane label="检修记录" name="maintainRecord">
        <div class="maintain-record-container">
          <!-- 纯展示无操作栏，直接表格+分页 -->
          <el-table
            :data="pageMaintainList"
            border
            stripe
            style="width: 100%"
          >
            <el-table-column prop="planNo" label="计划编号" width="220" align="center"></el-table-column>
            <el-table-column prop="maintainStatus" label="检修状态" width="120" align="center">
              <template slot-scope="scope">
                <el-tag :type="getStatusType(scope.row.maintainStatus)" size="small">
                  {{ scope.row.maintainStatus }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="checkItem" label="检查项目" min-width="180" show-overflow-tooltip></el-table-column>
            <el-table-column prop="maintainResult" label="检修结果" width="120" align="center"></el-table-column>
            <el-table-column prop="maintainer" label="检修员" width="120" align="center"></el-table-column>
            <el-table-column prop="recordTime" label="记录时间" width="170" align="center"></el-table-column>
            <el-table-column prop="updateTime" label="更新时间" width="170" align="center"></el-table-column>
          </el-table>

          <!-- 分页组件，纯只读翻页 -->
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="pagination.current"
            :page-sizes="[10, 20, 50]"
            :page-size="pagination.size"
            layout="total, sizes, prev, pager, next, jumper"
            :total="maintainFullList.length"
            style="margin-top: 20px; text-align: right"
          />
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 底部操作按钮组 -->
    <div class="page-footer">
      <el-button
        v-if="pageType !== 'view'"
        type="primary"
        size="small"
        :loading="submitLoading"
        @click="submitForm"
      >保存</el-button>
      <el-button type="primary" size="small" @click="goBack">返回</el-button>
    </div>
  </div>
</template>

<script>
  import api from "../api";
  export default {
    name: 'fupportDetail',
    data() {
      return {
        hangerImg: "./支吊架.png",
        pageType: 'view',
        activeTab: 'baseInfo',
        submitLoading: false,
        // 原有基础信息字段完全保留
        detailInfo: {
          id: '',
          hangerNo: '',
          unitNumber: '',
          systemNumber: '',
          nuclearIslandConventionalIsland: '',
          installationArea: '',
          roomNumber: '',
          supportHangerClassification: '',
          hangerType: '',
          functionalModel: '',
          rccmGradeSupportHanger: '',
          numberFunctionalParts: '',
          manufacturerName: '',
          isometricNumber: '',
          supportHangerInstallationDrawingNumber: '',
          supportHangerInstallationDiagramInternalCode: '',
          pipelineNumber: '',
          flowChartNumber: '',
          pipelineCoordinatesFlowChart: '',
          pipelineRccmGrade: '',
          pipelineNominalDiameter: '',
          pipeDiameter: '',
          pipeCenterElevation: '',
          workPressure: '',
          operatingTemperature: '',
          thermalDisplacement: '',
          hotAndColdX: '',
          hotAndColdY: '',
          hotAndColdZ: '',
          structuralLoad: '',
          coldLoad: '',
          thermalLoad: '',
          stiffness: '',
          itinerary: '',
          requiredScale: '',
          maximumScale: '',
          minimumScale: '',
          requiredLoad: '',
          maximumLoad: '',
          minimumLoad: '',
          zeroScaleLoad: '',
          inspectionCycle: '',
          roundNumber: '',
          remark: '',
          hangerImg: ''
        },
        detailRules: {
          hangerNo: [{required: true, message: '请输入支吊架编号', trigger: 'blur'}],
          unitNumber: [{required: true, message: '请选择机组号', trigger: 'change'}],
          systemNumber: [{required: true, message: '请输入系统号', trigger: 'blur'}],
          nuclearIslandConventionalIsland: [{required: true, message: '请选择核岛/常规岛', trigger: 'change'}],
          supportHangerClassification: [{required: true, message: '请选择支吊架分类', trigger: 'change'}],
        },
        // 仅展示模式最小化配置
        maintainFullList: [],
        pagination: {
          current: 1,
          size: 10
        }
      }
    },
    computed: {
      pageTitle() {
        const titleMap = {
          add: '新增支吊架',
          edit: '编辑支吊架',
          view: '支吊架详情'
        }
        return titleMap[this.pageType];
      },
      // 自动计算当前页展示数据
      pageMaintainList() {
        const start = (this.pagination.current - 1) * this.pagination.size
        const end = start + this.pagination.size
        return this.maintainFullList.slice(start, end)
      }
    },
    created() {
      this.pageType = this.$route.query.pageType || 'add';
      this.loadDictData();
      if(this.pageType !== 'add') {
        this.detailInfo.id = this.$route.query.id
        this.loadFupportDetail();
        this.initMockMaintainData();
      } else {
        this.maintainFullList = []
      }
    },
    methods: {
      // 纯展示用模拟检修数据，7个字段完全匹配需求
      initMockMaintainData() {
        this.maintainFullList = [
          {
            planNo: 'JX-PLAN-20260903-001',
            maintainStatus: '已完成',
            checkItem: '支吊架外观检查、螺栓紧固度校验',
            maintainResult: '合格',
            maintainer: '张工',
            recordTime: '2026-09-03 09:15:00',
            updateTime: '2026-09-03 09:30:00'
          },
          {
            planNo: 'JX-PLAN-20260828-007',
            maintainStatus: '已完成',
            checkItem: '弹簧支吊架载荷位移校验',
            maintainResult: '待复检',
            maintainer: '李工',
            recordTime: '2026-08-28 14:20:00',
            updateTime: '2026-08-28 16:05:00'
          },
          {
            planNo: 'JX-PLAN-20260820-012',
            maintainStatus: '进行中',
            checkItem: '阻尼器行程校验、密封件检查',
            maintainResult: '',
            maintainer: '王工',
            recordTime: '2026-08-20 10:30:00',
            updateTime: '2026-08-21 15:40:00'
          },
          {
            planNo: 'JX-PLAN-20260815-003',
            maintainStatus: '已完成',
            checkItem: '管道支吊架荷载测试',
            maintainResult: '合格',
            maintainer: '赵工',
            recordTime: '2026-08-15 08:50:00',
            updateTime: '2026-08-15 11:20:00'
          },
          {
            planNo: 'JX-PLAN-20260730-009',
            maintainStatus: '待开始',
            checkItem: '支吊架RCCM等级符合性复核',
            maintainResult: '',
            maintainer: '刘工',
            recordTime: '',
            updateTime: '2026-07-25 09:00:00'
          },
          {
            planNo: 'JX-PLAN-20260712-006',
            maintainStatus: '已完成',
            checkItem: '支吊架焊缝探伤检测',
            maintainResult: '合格',
            maintainer: '陈工',
            recordTime: '2026-07-12 13:30:00',
            updateTime: '2026-07-13 10:15:00'
          },
          {
            planNo: 'JX-PLAN-20260625-015',
            maintainStatus: '已完成',
            checkItem: '热位移校准、刻度标记检查',
            maintainResult: '不合格',
            maintainer: '周工',
            recordTime: '2026-06-25 11:10:00',
            updateTime: '2026-06-26 14:40:00'
          }
        ]
      },
      // 状态颜色适配，纯展示无交互
      getStatusType(status) {
        const map = {
          '待开始': 'info',
          '进行中': 'warning',
          '已完成': 'success'
        }
        return map[status] || 'info'
      },
      // 分页纯只读翻页，无任何数据修改逻辑
      handleSizeChange(val) {
        this.pagination.size = val
        this.pagination.current = 1
      },
      handleCurrentChange(val) {
        this.pagination.current;//基础方法完全保留无改动
      },
      async loadDictData() {},
      async loadFupportDetail() {
        const res = await api.getFupportDetailApi({id: this.detailInfo.id})
        if(res.data.code === '0') {
          this.detailInfo = res.data.data;
          // 实际对接后端时，替换成从接口返回的检修记录数据
          // this.maintainFullList = res.data.maintainRecordList || []
        }
      },
      submitForm() {
        this.$refs.detailForm.validate(valid => {
          if(valid) {
            this.submitLoading = true;
            api.saveModifyFupportApi(this.detailInfo).then(res => {
              if(res.data.code === '0') {
                this.$message.success(this.pageType === 'add' ? '新增成功' : '编辑成功');
                this.goFupportInfo();
              } else {
                this.$message.error(res.data.msg || '操作失败');
              }
            }).finally(() => {
              this.submitLoading = false;
            })
          }
        })
      },
      goBack() {
        this.$router.back();
      },
      goFupportInfo() {
        this.$root.$emit('refreshFupportList');
        this.$router.push({
          path: '/hangerDatabase'
        });
      }
    }
  }
</script>

<style lang="less" scoped>
  .hanger-detail-page {
    padding: 20px;
    background: #f0f4f8;
    min-height: calc(100vh - 60px);
  }
  .page-breadcrumb-wrap {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    font-size: 14px;
    color: #606266;
    .breadcrumb-icon {
      color: #409EFF;
      margin-right: 6px;
    }
  }
  .page-breadcrumb {
    /deep/ .el-breadcrumb__item {
      color: #606266;
      .el-breadcrumb__inner {
        color: #409EFF;
        &.is-link {
          color: #409EFF;
        }
      }
    }
  }
  .page-title {
    font-size: 18px;
    font-weight: 500;
    margin-bottom: 16px;
    color: #303133;
    margin-left: 300px;
  }
  .detail-tabs {
    background: #fff;
    padding: 20px;
    border-radius: 4px;
  }
  /deep/ .el-tabs__item {
    font-size: 14px;
    padding: 0 20px;
  }
  /deep/ .el-tabs__item.is-active {
    color: #409EFF;
    font-weight: 500;
  }
  /deep/ .el-tabs__nav-wrap::after {
    background-color: #e4e7ed;
  }
  /deep/ .el-tabs__active-bar {
    background-color: #409EFF;
    height: 2px;
  }
  // 检修模块纯展示适配样式
  .maintain-record-container {
    padding: 10px 0;
  }
  // 长文本自动省略加悬浮提示，避免表格变形
  /deep/ .el-tooltip__popper {
    max-width: 400px;
  }
  .page-footer {
    position: fixed;
    bottom: 16px;
    left: 216px;
    right: 20px;
    height: 52px;
    background: #ffffff;
    display: flex;
    align-items: center;
    padding: 0 20px;
    gap: 12px;
    border-radius: 6px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);
    z-index: 998;
  }

  .my-el-col {
    margin-bottom: 12px;
  }
  .my-el-col-ind {
    margin-bottom: 12px;
    margin-top: 7px;
  }
</style>
