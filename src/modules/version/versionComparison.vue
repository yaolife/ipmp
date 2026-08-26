<template>
  <div class="cud-commom-form-style">
    <div class="brand">
      <breadcrumb :arrayName="brand" :hasIcon="hasIcon"></breadcrumb>
    </div>
    <div class="cud__scroll--div">
      <el-card class="head">
        <el-row>
          <el-col :span="8" class="select">
            <span>原始版本</span>
            <el-select v-model="orgVersion" clearable>
              <el-option
                v-for="item in versionList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-col>
          <el-col :span="4">
            <img src="./img/right.svg" style="padding-left: 30%" />
          </el-col>
          <el-col :span="8" class="select">
            <span>目标版本</span>
            <el-select v-model="targetVersion" clearable>
              <el-option
                v-for="item in versionList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-col>
          <el-col :span="4" class="btn-box">
            <el-button type="primary" size="small" @click="handleComparison"
              >比对</el-button
            >
            <el-button size="small" @click="handleReset()">重置</el-button>
          </el-col>
        </el-row>
      </el-card>
      <el-card>
        <div class="cud__tree--right">
          <div class="comTitle">
            <span class="cud-common-title-icon"></span>
            <span class="name">升级方向</span>
            <el-button
              type="primary"
              size="small"
              @click="exportExcel"
              :loading="exportLoading"
              v-if="btnShow('version_comparison_export')"
              >导出</el-button
            >
          </div>
          <div class="upgrade">
            <template v-if="upgradePathList.length > 0">
              <div
                v-for="(item, index) in upgradePathList.length + 1"
                class="upContent"
                :key="index"
              >
                <div class="version" v-if="upgradePathList[index]">
                  版本{{ upgradePathList[index].orgVersion }}
                </div>
                <div class="version" v-else>
                  版本{{ upgradePathList[index - 1].targetVersion }}
                </div>
                <div
                  v-if="
                    upgradePathList[index] &&
                    upgradePathList[index].operation === '回退'
                  "
                  class="btn"
                >
                  <span>{{
                    `${upgradePathList[index].operation}(版本跨度：${upgradePathList[index].versionSpan})`
                  }}</span>
                  <img src="./img/right1.svg" />
                </div>
                <div
                  v-else-if="
                    upgradePathList[index] &&
                    upgradePathList[index].operation === '升级'
                  "
                  class="btn"
                >
                  <span>{{
                    `${upgradePathList[index].operation}(版本跨度：${upgradePathList[index].versionSpan})`
                  }}</span>
                  <img src="./img/right2.svg" />
                </div>
              </div>
            </template>
          </div>
          <div class="comTitle">
            <span class="cud-common-title-icon"></span>
            <span class="name">升级步骤</span>
          </div>
          <div
            class="cud__table--list"
            v-for="(item, index) in versionCompareList"
            :key="index"
          >
            <div class="info">
              <div class="infoHead">
                {{ index + 1 }}-{{
                  `从${item.orgVersion}版本 ${item.operation}至 ${item.targetVersion}版本`
                }}
              </div>
              <div class="infoContent">
                <span> 版本跨度：{{ item.versionSpan }} </span>
                <span> 调整功能项：{{ item.adjustCount }} </span>
                <span> 影响条目量：{{ item.influenceItemCount }} </span>
                <span> 预估涉及代码总量：{{ item.totalCode }} </span>
              </div>
            </div>
            <el-table
              :data="item.adjustDetails"
              ref="multipleSelection"
              border
              stripe
              v-loading="loading"
              :max-height="500"
              highlight-current-row
              class="cud-office-table"
            >
              <el-table-column
                align="left"
                prop="index"
                width="60"
                label="步骤"
              >
                <template slot-scope="scope">
                  <div class="text-align:center">{{ scope.$index + 1 }}</div>
                </template>
              </el-table-column>
              <el-table-column
                show-overflow-tooltip
                align="left"
                prop="operation"
                :label="`${item.operation}操作指引`"
              >
                <template slot-scope="scope">
                  <span
                    class="detail"
                    @click="
                      handleDetail(
                        scope.row.operation,
                        `查看${item.operation}操作`
                      )
                    "
                    >{{
                      getoperation(scope.row.operation, item.operation)
                    }}</span
                  >
                </template>
              </el-table-column>
              <el-table-column
                show-overflow-tooltip
                align="left"
                prop="influenceItem"
                label="影响说明"
              >
                <template slot-scope="scope">
                  <span
                    class="detail"
                    @click="
                      handleDetail(scope.row.influenceItem, '查看影响说明')
                    "
                    >{{ scope.row.influenceItem }}</span
                  >
                </template>
              </el-table-column>
              <el-table-column
                show-overflow-tooltip
                align="left"
                prop="type"
                :label="`${item.operation}操作类别`"
              >
                <template slot-scope="scope">
                  <span>{{ getType(scope.row.type, item.operation) }}</span>
                </template>
              </el-table-column>
              <el-table-column
                show-overflow-tooltip
                align="left"
                prop="codeNumber"
                label="预估涉及代码量"
              ></el-table-column>
              <el-table-column
                show-overflow-tooltip
                align="left"
                prop="describe"
                label="调整条目"
              ></el-table-column>
              <el-table-column
                align="left"
                prop="linkResources"
                label="调整资源"
              >
                <template slot-scope="scope">
                  <div class="linkResources">{{ scope.row.linkResources }}</div>
                </template>
              </el-table-column>
              <el-table-column
                show-overflow-tooltip
                align="left"
                prop="president"
                label="负责人"
              ></el-table-column>
            </el-table>
            <el-row>
              <div class="cud-special-pagination cud-special-pagination-button">
                <el-pagination
                  popper-class="cud-pager-dropdown"
                  class="cud__page float-right"
                  @size-change="(val) => handleSizeChange(item, val)"
                  @current-change="(val) => handleCurrentChange(item, val)"
                  @prev-click="(val) => prePage(item, val)"
                  @next-click="(val) => nextPage(item, val)"
                  :current-page.sync="item.pageDto.currentPage"
                  :page-sizes="[10, 20, 30, 40]"
                  :page-size="item.pageDto.pageSize"
                  layout="total,sizes, prev, pager, next"
                  :total="item.pageDto.total"
                  :pager-count="5"
                  :disabled="loading"
                >
                </el-pagination>
              </div>
            </el-row>
          </div>
        </div>
      </el-card>
    </div>
    <detail ref="detailRef" :name="name" :title="title"></detail>
  </div>
</template>

<script>
import versionComparison from "./js/versionComparison";
export default versionComparison;
</script>
<style lang="less" scoped>
.btn-box {
  display: flex;
  justify-content: end;
}
/deep/ .el-button+.el-button {
  margin-left: 10px;
}
.cud__tree--right {
  position: relative;
}
/deep/ .el-card__body {
  padding: 15px 15px 1px;
}
.head {
  padding-bottom: 15px;
}
.select {
  display: flex;
  span {
    width: 90px;
    line-height: 30px;
  }
  /deep/.el-input {
    width: 90%;
  }
  /deep/ input {
    height: 30px;
  }
}
.cud-common-title-icon {
  margin-top: 2px;
  margin-right: 16px;
  width: 6px;
  height: 22px;
  background: #0069ac;
  display: block;
}
.comTitle {
  display: flex;
  margin-bottom: 10px;
  line-height: 22px;
  .name {
    font-weight: bold;
  }
  .el-button {
    position: absolute;
    right: 0px;
  }
}
.upgrade {
  height: 70px;
  border: 1px solid;
  margin-top: 16px;
  margin-bottom: 16px;
  display: flex;
  padding-left: 100px;
  padding-top: 8px;
  background: rgba(255, 255, 128, 0.23529411764705882);
  .upContent {
    display: flex;
    align-items: center;
    .btn {
      margin-right: 10px;
      display: flex;
      flex-direction: column;
      span {
        color: #0000ff;
      }
    }
  }
}
.version {
  width: 100px;
  text-align: center;
  border: 1px solid;
  height: 30px;
  line-height: 30px;
  border-radius: 4px;
  background: #fff;
  margin-top: 12px;
  margin-right: 10px;
}
.linkResources {
  white-space: pre-wrap;
}
.info {
  height: 50px;
  border: 1px solid;
  padding: 10px 10px 0px 10px;
  margin-bottom: 10px;
  border-color: rgba(121, 121, 121, 1);
  background-color: rgba(170, 170, 170, 0.23529411764705882);
  color: #333;
  .infoHead {
    font-weight: bold;
  }
  .infoContent {
    margin-left: 16px;
    margin-top: 5px;
    span {
      margin-right: 10px;
    }
  }
}
.detail {
  color: #0000ff;
  cursor: pointer;
}
</style>
