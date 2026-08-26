<template>
  <div>
    <div style="position: relative;">
      <el-form :model="ruleForm" :rules="rules" ref="ruleForm" size="small">
        <el-form-item label="功能位置" prop="funcLocationName">
          <el-autocomplete :disabled="detail" class="functionalLocations" v-model="ruleForm.funcLocationName"
            :popper-append-to-body="false" :fetch-suggestions="querySearch" placeholder="请输入内容" @select="handleSelect"
            @change="changeLocationInfo($event)">
            <template slot-scope="{ item }">
              <span class="addr">{{
                item.locationNo
                }}</span>
            </template>
          </el-autocomplete>
          <span class="locationSearch"><i class="el-icon-search el-input__icon" slot="suffix"
              @click="searchHandle"></i></span>
        </el-form-item>
      </el-form>
    </div>
    <el-dialog id="queryDialog" title="选择功能位置" :visible.sync="dialogVisible" append-to-body width="80%">
      <el-form class="diaologQueryFrom" size="small" label-position="top" ref="resetForm" :model="queryParams">
        <el-row tsype="flex" class="cud-senior-search cud__search--rowhigh" v-if="flag">
          <el-col :span="4">
            <el-form-item label="计划工厂" label-width="150px" prop="planPlant">
              <el-select v-model="queryParams.planPlant" placeholder="请选择" clearable>
                <el-option v-for="item in planPlantOptions" :key="item.planPlant"
                  :label="`${item.planPlant} ${item.planPlantDesc}`" :value="item.planPlant">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="功能位置编码" label-width="150px" prop="locationNo">
              <el-input v-model="queryParams.locationNo" :placeholder="$t('cm.pleaseEnter')" maxlength="32"
                clearable></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="功能位置描述" label-width="150px" prop="locationDesc">
              <el-input v-model="queryParams.locationDesc" :placeholder="$t('cm.pleaseEnter')" maxlength="200"
                clearable></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="维护工厂" label-width="150px" prop="maintainPlant">
              <el-select v-model="queryParams.maintainPlant" placeholder="请选择" clearable>
                <el-option v-for="item in maintainPlantOptions" :key="item.plant"
                  :label="`${item.plant} ${item.plantDesc}`" :value="item.plant">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="ABC标识" label-width="150px" prop="abcFlag">
              <el-select v-model="queryParams.abcFlag" placeholder="请选择" clearable>
                <el-option v-for="item in abcFlagOptions" :key="item.abcId" :label="`${item.abcId} ${item.abcDesc}`"
                  :value="item.abcId">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="位置" label-width="150px" prop="position">
              <el-select v-model="queryParams.position" placeholder="请选择" clearable>
                <el-option v-for="item in plantPositionOptions" :key="item.id" :label="
                      `${item.plant} ${item.position} ${item.postionDesc}`
                    " :value="item.position">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="房间" label-width="150px" prop="roomId">
              <el-input v-model="queryParams.roomId" :placeholder="$t('cm.pleaseEnter')" maxlength="32"
                clearable></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="主工作中心" label-width="150px" prop="mainWorkCenter">
              <el-select v-model="queryParams.mainWorkCenter" placeholder="请选择" clearable>
                <el-option v-for="item in workCenterOptions" :key="item.workCenter + item.plant" :label="
                      `${item.workCenter} ${item.workCenterDesc}`
                    " :value="item.workCenter">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="FEG(日常)" label-width="150px" prop="fegDaily">
              <el-select v-model="queryParams.fegDaily" placeholder="请选择" clearable>
                <el-option v-for="item in fegDailyOptions" :key="item.itemCode" :label="item.itemText"
                  :value="item.itemCode">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="FEG(大修)" label-width="150px" prop="fegOverhaul">
              <el-select v-model="queryParams.fegOverhaul" placeholder="请选择" clearable>
                <el-option v-for="item in fegOverhaulOptions" :key="item.itemCode" :label="item.itemText"
                  :value="item.itemCode">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="CCM设备" label-width="150px" prop="ccmEqp">
              <el-select v-model="queryParams.ccmEqp" placeholder="请选择" clearable>
                <el-option v-for="item in ccmEqpOptions" :key="item.itemCode" :label="item.itemText"
                  :value="item.itemCode">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="是否I0设备" label-width="150px" prop="ioDeviceOrNot">
              <el-select v-model="queryParams.ioDeviceOrNot" placeholder="请选择" clearable>
                <el-option v-for="item in ioDeviceOrNotOptions" :key="item.itemCode" :label="item.itemText"
                  :value="item.itemCode">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="8" :sm="8" :md="6" :lg="6" class="cud--right pt-30">
            <el-button class="mr-10" type="primary" size="small" @click="searchFunctionLocationList">{{ $t("cm.query")
              }}</el-button>
            <el-button size="small" @click="resetParam">{{
              $t("cm.reset")
              }}</el-button>
            <el-button type="text" style="margin-left: 8px" @click="expandHandle">{{ flag ? "收起" : "展开"}}
              <span style="margin-left: 10px">
                <i :class="flag ? 'el-icon-arrow-up' : 'el-icon-arrow-down'">
                </i>
              </span>
            </el-button>
          </el-col>
        </el-row>
        <el-row tsype="flex" class="cud-senior-search cud__search--rowhigh" v-else>
          <el-col :span="4">
            <el-form-item label="功能位置编码" label-width="150px" prop="locationNo">
              <el-input v-model="queryParams.locationNo" :placeholder="$t('cm.pleaseEnter')" maxlength="32"
                clearable></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="功能位置描述" label-width="150px" prop="locationDesc">
              <el-input v-model="queryParams.locationDesc" :placeholder="$t('cm.pleaseEnter')" maxlength="200"
                clearable></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="计划工厂" label-width="150px" prop="planPlant">
              <el-select v-model="queryParams.planPlant" placeholder="请选择" clearable>
                <el-option v-for="item in planPlantOptions" :key="item.planPlant"
                  :label="`${item.planPlant} ${item.planPlantDesc}`" :value="item.planPlant">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="维护工厂" label-width="150px" prop="maintainPlant">
              <el-select v-model="queryParams.maintainPlant" placeholder="请选择" clearable>
                <el-option v-for="item in maintainPlantOptions" :key="item.plant"
                  :label="`${item.plant} ${item.plantDesc}`" :value="item.plant">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="ABC标识" label-width="150px" prop="abcFlag">
              <el-select v-model="queryParams.abcFlag" placeholder="请选择" clearable>
                <el-option v-for="item in abcFlagOptions" :key="item.abcId" :label="`${item.abcId} ${item.abcDesc}`"
                  :value="item.abcId">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="位置" label-width="150px" prop="position">
              <el-select v-model="queryParams.position" placeholder="请选择" clearable>
                <el-option v-for="item in plantPositionOptions" :key="item.id" :label="
                      `${item.plant} ${item.position} ${item.postionDesc}`
                    " :value="item.position">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="8" :sm="8" :md="6" :lg="6" class="cud--right pt-30">
            <el-button class="mr-10" type="primary" size="small" @click="searchFunctionLocationList">{{ $t("cm.query")
              }}</el-button>
            <el-button size="small" @click="resetParam">{{
              $t("cm.reset")
              }}</el-button>
            <el-button type="text" style="margin-left: 8px" @click="expandHandle">{{ flag ? "收起" : "展开"}}
              <span style="margin-left: 10px">
                <i :class="flag ? 'el-icon-arrow-up' : 'el-icon-arrow-down'">
                </i>
              </span>
            </el-button>
          </el-col>
        </el-row>
      </el-form>
      <!-- 数据列表 -->
      <el-row class="cud__table--list">
        <el-table style="width: 100%" :data="equList" ref="objectTable" v-loading="tableLoading" border
          :empty-text="$t('cm.nodata')" highlight-current-row header-row-class-name="cud-office-table-header"
          :height="computedTableHeight" @row-dblclick="handleCurrentChange">
          <el-table-column type="index" :label="$t('cm.no')" width="70"></el-table-column>
          <el-table-column prop="locationNo" label="功能位置" min-width="199" show-overflow-tooltip>
          </el-table-column>
          <el-table-column prop="locationDesc" label="功能位置描述" min-width="199" show-overflow-tooltip>
          </el-table-column>
          <el-table-column prop="planPlant" label="计划工厂" min-width="199" show-overflow-tooltip>
          </el-table-column>
          <el-table-column prop="maintainPlant" label="维护工厂" min-width="199" show-overflow-tooltip>
          </el-table-column>
          <el-table-column prop="abcFlag" label="ABC标识" min-width="119" show-overflow-tooltip>
          </el-table-column>
          <el-table-column prop="position" label="位置" min-width="199" show-overflow-tooltip>
          </el-table-column>
          <el-table-column prop="roomId" label="房间" min-width="119" show-overflow-tooltip>
          </el-table-column >
          <el-table-column prop="mainWorkCenter" label="主工作中心" min-width="199" show-overflow-tooltip>
          </el-table-column>
          <el-table-column prop="fegDaily" label="FEG(日常)" min-width="100" show-overflow-tooltip>
          </el-table-column>
          <el-table-column prop="fegOverhaul" label="FEG(大修)" min-width="100" show-overflow-tooltip>
          </el-table-column>
          <el-table-column prop="ccmEqp" label="CCM设备" min-width="100" show-overflow-tooltip>
          </el-table-column>
          <el-table-column prop="ioDeviceOrNot" label="是否I0设备" min-width="100" show-overflow-tooltip>
          </el-table-column>
          <el-table-column prop="structId" label="结构标识" min-width="199" show-overflow-tooltip>
          </el-table-column>
          <el-table-column prop="userStat" label="用户状态" min-width="119">
          </el-table-column>
          <el-table-column prop="createDate" label="创建日期" min-width="119"></el-table-column>
          <el-table-column prop="updateDate" label="最新修改日期" min-width="119"></el-table-column>
          <el-table-column prop="updateBy" label="最新修改人员" min-width="199"></el-table-column>
        </el-table>
        <!-- 底部新增、分页 -->
        <el-col :span="24" style="margin-top: 12px;">
          <el-pagination ref="pager" class="cud__page" @size-change="handlePageSizeChange"
            @current-change="changeCurrentPage" :current-page="pageNumber" :page-sizes="[10, 20, 30, 40]"
            :page-size="pageSize" layout="total,sizes, prev, pager, next" :pager-count="5" :total="pageTotal">
          </el-pagination>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>
<script>
  import osUtil from "@/utils/osUtil";
  import { throttle } from "@/utils/funcUtil";
  export default {
    name: 'FunctionLocation',
    inject: ['setCustomRule'],
    props: ['value', "detail", "label", "display"],
    data() {
      return {
        ruleForm: {
          funcLocationName: "",
        },
        funcLocationName: [
          { "locationNo": "GO" },
          { "locationNo": "GG" },
          { "locationNo": "KK" },
        ],
        dialogVisible: false,
        queryParams: {
          planPlant: "", //计划工厂
          maintainPlant: "", //维护工厂
          locationNo: "", //功能位置编码
          locationDesc: "", //功能位置描述
          abcFlag: "", //ABC标识
          position: "", //位置
          roomId: "", //房间
          fegDaily: "", //FEG日常
          fegOverhaul: "", //FEG大修
          ioDeviceOrNot: "", //是否I0设备
          ccmEqp: "", //CCM设备
          mainWorkCenter: "", //主工作中心
        },
        flag: false,
        tableLoading: false,
        equList: [],
        planPlantOptions: [], // 计划工厂
        maintainPlantOptions: [], //维护工厂
        abcFlagOptions: [],
        fegDailyOptions: [],
        fegOverhaulOptions: [],
        ccmEqpOptions: [],
        ioDeviceOrNotOptions: [],
        workCenterOptions: [],
        plantPositionOptions: [],
        pageNumber: 1,
        pageSize: 10,
        pageTotal: 0,
        maxTableHeight: 0,
        rules: {
          funcLocationName: [
            { required: true, message: "功能位置必填", trigger: "change" }
          ],
        },
        timeout: null
      };
    },
    watch: {
      ruleForm: {
        handler(n, o) {
          this.$emit('input', this.ruleForm.funcLocationName);
        },
        deep: true,
      },
    },
    mounted() {
      if (this.setCustomRule) {
        this.setCustomRule(this.formValidate)
      }
      const _watch = this.$watch('value', (val) => {
        if (val) {
          this.ruleForm.funcLocationName = val
          _watch()
        }
      })
      window.addEventListener("resize", throttle(this.initMaxHeight, 500));
      if (osUtil.getBrowserInfo().browser.indexOf("IE") === 0) {
        this.$refs.dmCom.parentNode.removeAttribute("disabled");
      }
    },
    computed: {
      computedTableHeight() {
        return this.maxTableHeight;
      },
    },
    methods: {
      searchHandle() {
        if (this.detail) {
          return
        }
        this.dialogVisible = true;
        this.initMaxHeight()
      },
      // 自定义组件校验必填
      formValidate(callback) {
        if (this.$refs["ruleForm"]) {
          this.$refs.ruleForm.validate(valid => {
            if (!valid) {
              this.$message({
                type: "warning",
                message: "校验失败,请检查页面输入项"
              });
              callback(false);
            }
          });
        }
        callback();
      },
      expandHandle() {
        this.flag = !this.flag;
        this.initMaxHeight();
      },
      //查询搜索
      querySearch(queryString, cb) {
        var results = queryString ? this.funcLocationName.filter(this.createStateFilter(queryString)) : this.funcLocationName;
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
          cb(results);
        }, 1000);
      },
      createStateFilter(queryString) {
        return (state) => {
          return (state.locationNo.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
        };
      },
      //选中的值
      handleSelect(item) {
        this.ruleForm.funcLocationName = item.locationNo
      },
      //input改变时
      changeLocationInfo() {
      },
      searchFunctionLocationList() {
        this.getFunctionLocationList()
      },
      //功能位置清单查询
      getFunctionLocationList() {
        this.equList = [
          {
            "abcDesc": "",
            "abcFlag": null,
            "businessDeptDesc": "",
            "businessRange": null,
            "ccmEqp": null,
            "company": null,
            "costCenter": null,
            "createBy": "P632870",
            "createDate": "2025-04-24",
            "createUserName": null,
            "equipDesc": null,
            "equipNo": null,
            "equipmentQualitySafetyLevel": null,
            "fegDaily": null,
            "fegOverhaul": null,
            "id": 7618,
            "ioDeviceOrNot": "N",
            "ioDeviceOrNotDesc": "否",
            "location": null,
            "locationDesc": null,
            "locationName": null,
            "locationNo": "GO",
            "locationType": "L",
            "mainWorkCenter": null,
            "maintainPlant": null,
            "planPersonGroup": null,
            "planPlant": null,
            "planPlantDesc": "",
            "plantArea": null,
            "plantDesc": "",
            "position": null,
            "positionDesc": "",
            "roomId": null,
            "site": null,
            "structId": "N0010",
            "systStat": "AC",
            "upLocation": null,
            "updateBy": "P632870",
            "updateDate": "2025-04-24",
            "updateUserName": null,
            "userStat": "E0001",
            "workCenterDesc": null
          },
          {
            "abcDesc": "",
            "abcFlag": null,
            "businessDeptDesc": "",
            "businessRange": null,
            "ccmEqp": null,
            "company": null,
            "costCenter": null,
            "createBy": "P632870",
            "createDate": "2025-04-24",
            "createUserName": null,
            "equipDesc": null,
            "equipNo": null,
            "equipmentQualitySafetyLevel": null,
            "fegDaily": null,
            "fegOverhaul": null,
            "id": 7617,
            "ioDeviceOrNot": "N",
            "ioDeviceOrNotDesc": "否",
            "location": null,
            "locationDesc": null,
            "locationName": null,
            "locationNo": "GG",
            "locationType": "L",
            "mainWorkCenter": null,
            "maintainPlant": null,
            "planPersonGroup": null,
            "planPlant": null,
            "planPlantDesc": "",
            "plantArea": null,
            "plantDesc": "",
            "position": null,
            "positionDesc": "",
            "roomId": null,
            "site": null,
            "structId": "N0010",
            "systStat": "AC",
            "upLocation": null,
            "updateBy": "P632870",
            "updateDate": "2025-04-24",
            "updateUserName": null,
            "userStat": "E0001",
            "workCenterDesc": null
          },
          {
            "abcDesc": "",
            "abcFlag": null,
            "businessDeptDesc": "业主公司",
            "businessRange": "1000",
            "ccmEqp": null,
            "company": null,
            "costCenter": null,
            "createBy": "P632870",
            "createDate": "2025-04-24",
            "createUserName": null,
            "equipDesc": null,
            "equipNo": null,
            "equipmentQualitySafetyLevel": null,
            "fegDaily": null,
            "fegOverhaul": null,
            "id": 7616,
            "ioDeviceOrNot": "N",
            "ioDeviceOrNotDesc": "否",
            "location": null,
            "locationDesc": "123",
            "locationName": null,
            "locationNo": "KK",
            "locationType": "N",
            "mainWorkCenter": null,
            "maintainPlant": "5011",
            "planPersonGroup": null,
            "planPlant": "5010",
            "planPlantDesc": "大亚湾计划工厂",
            "plantArea": null,
            "plantDesc": "大亚湾1号机维修工厂",
            "position": null,
            "positionDesc": "",
            "roomId": null,
            "site": null,
            "structId": "N0010",
            "systStat": "AC",
            "upLocation": null,
            "updateBy": "P632870",
            "updateDate": "2025-04-24",
            "updateUserName": null,
            "userStat": "E0001",
            "workCenterDesc": null
          },
        ]
      },
      //重置
      resetParam() {
        this.queryParams.maintainPlant = "";
        this.queryParams.locationNo = "";
        this.queryParams.locationDesc = "";
        this.queryParams.planPlant = "";
        this.queryParams.abcFlag = "";
        this.queryParams.position = "";;
        this.queryParams.roomId = "";
        this.queryParams.fegDaily = "";
        this.queryParams.fegOverhaul = "";
        this.queryParams.ioDeviceOrNot = "";
        this.queryParams.ccmEqp = "";
        this.queryParams.mainWorkCenter = "";
        this.pageSize = 10;
        this.pageNumber = 1;
        this.getFunctionLocationList()
      },
      // 动态计算高度
      initMaxHeight() {
        this.$nextTick(() => {
          const el = document.querySelector('#queryDialog>.el-dialog>.el-dialog__body')
          if (el) {
            let pageHeight = el.clientHeight
            let searchBox = document.querySelector(".diaologQueryFrom");
            if (searchBox) {
              let styles = window.getComputedStyle(searchBox);
              // 调整最大高度
              const h = this.flag ? 202 : 118
              this.maxTableHeight = pageHeight - h - 10 - 5 - 10 - 42 - 22

            }
          }

        });
      },
      handlePageSizeChange(pageSize) {
        this.pageSize = pageSize;
        this.pageNumber = 1;
        this.getFunctionLocationList();
      },
      // 变更当前页
      changeCurrentPage(current) {
        this.pageNumber = current;
        this.getFunctionLocationList();
      },
      handleCurrentChange(val) {
        this.ruleForm.funcLocationName = val.locationNo;
        this.dialogVisible = false
      }
    }
  };
</script>
<style lang="less" scoped>
  .functionalLocations {
    width: 100% !important;
  }

  .locationSearch {
    position: absolute;
    top: 0;
    right: 4px;
    color: #c0c4cc;
    line-height: 34px;
  }

  // /deep/ .el-form--label-top .el-form-item__label {
  //   font-family: PingFangSC-Regular;
  //   font-size: 14px;
  //   font-weight: 400;
  // }
  .sub-button {
    float: right;
  }

  .word-break {
    word-wrap: break-word;
  }

  /deep/.search-collapse-content .cud__search--triangle {
    left: 300px !important;
  }

  /deep/ .el-dialog .el-form-item__content {
    line-height: 40px;
  }

  .cud-special-pagination {
    justify-content: flex-end;
  }

  .cud--right {
    float: right;
  }

  .el-button {
    user-select: unset;
  }

  .cud__search--rowhigh {
    padding-bottom: 20px;
  }

  /deep/ .el-form-item {
    padding: 0 5.5px !important;
  }

  /deep/ .el-dialog__title {
    font-size: 18px;
    color: #000000;
    font-weight: 600;
  }

  /deep/ .el-card__body {
    padding: 15px 15px 0;
  }

  /deep/ .el-dialog__body {
    min-height: 70vh;
    overflow-y: hidden;
  }

  /deep/ .el-table--scrollable-x .el-table__body-wrapper {
    overflow: auto !important;
  }

  /deep/ .pt-30 {
    padding-top: 0px;
  }

  /deep/ .cud__page {
    margin-top: 4px;
  }

  /deep/ .el-table th,
  .el-table thead tr th.is-leaf {
    border-right: 1px dashed transparent;
    background: linear-gradient(#f4f7ff, #f4f7ff) padding-box, repeating-linear-gradient(180deg, #f4f7ff, #f4f7ff 14px, #ccc 0, #ccc 28px);
  }

  /deep/ .el-table thead tr th:nth-last-of-type(2) {
    border-right: none;
  }

  /deep/ .el-table th .cell {
    line-height: 40px;
  }

  /deep/ .el-table td,
  .el-table th.is-leaf {
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }

  /deep/ .el-table th.is-leaf {
    border-bottom: none !important;
  }
</style>