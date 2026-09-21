<template>
  <div class="cud-commom-form-style">
    <div class="cud__scroll--div">
      <el-card>
        <query-form
          :queryFormId="'apiManage'"
          :queryFields="queryFields"
          :loading="tableLoading"
          :showMoreSetting="false"
          labelWidth="120px"
          @resize="initMaxHeight"
          @submit="search"
          ref="queryForm"
          class="cud-commom-form-search"
        >
        </query-form>
      </el-card>
      <el-card>
        <div class="table-button">
          <el-button type="primary" size="small" icon="el-icon-plus" @click="handleAdd">新增</el-button>
        </div>
        <el-row
          class="cud__table--list"
          :style="{ height: computedTableHeight + 'px' }"
        >
          <el-table
            :data="tableData"
            ref="multipleSelection"
            @selection-change="handleSelectionChange"
            v-loading="tableLoading"
            :empty-text="$t('cm.nodata')"
            highlight-current-row
            border
            stripe
            :max-height="computedTableHeight"
            header-row-class-name="cud-office-table-header"
            class="cud-office-table"
          >
            <el-table-column
              align="center"
              type="index"
              :label="$t('cm.no')"
              width="60"
              :index="indexMethod"
            ></el-table-column>
            <el-table-column label="状态" align="center" width="50">
              <template slot-scope="scope">
                <span class="status-dot" :class="getStatusIcon(scope.row.interfaceStatus)"></span>
              </template>
            </el-table-column>
            <el-table-column
              label="关联系统"
              prop="relevanceSystem"
              align="center"
              width="140"
            />
            <el-table-column
              label="接口名(中文)"
              prop="interfaceNameCh"
              align="left"
              width="160"
              show-overflow-tooltip
            />

            <el-table-column
              label="接口名(英文)"
              prop="interfaceNameEn"
              align="left"
              width="160"
              show-overflow-tooltip
            />
            <el-table-column
              label="接口URL"
              prop="downInterfaceUrl"
              align="left"
              width="350"
              show-overflow-tooltip
            />

            <el-table-column
              label="备注"
              prop="remark"
              align="center"
              min-width="180"
              show-overflow-tooltip
            />
            <el-table-column
              label="平均响应"
              prop="costTimeAvg"
              width="100"
              align="center"
            >
              <template slot-scope="scope">
                <span>{{toPercentNumMs(scope.row.costTimeAvg)}}</span>
              </template>
            </el-table-column>

            <el-table-column
              label="是否启用"
              prop="isEnable"
              align="center"
              width="80"
            >
              <template slot-scope="scope">
                <span :style="{background: scope.row.isEnable==='0'?'greenyellow':'gray'}">{{scope.row.isEnable=='0'?"启用":"停用"}}</span>
              </template>
            </el-table-column>

            <el-table-column
              align="center"
              prop="isMonitor"
              label="是否监测"
              width="100"
            >
              <template slot-scope="scope">
                <span>{{scope.row.isMonitor==='0'?'是':'否'}}</span>
              </template>
            </el-table-column>

            <el-table-column
              align="center"
              prop="frequencyCron"
              label="监测定时cron"
              width="130"
            ></el-table-column>

            <el-table-column
              align="center"
              prop="checkTimeEnd"
              label="最后检查时间"
              width="180"
            ></el-table-column>

            <el-table-column
              align="center"
              prop="createUser"
              label="创建人"
              width="180"
            />

            <el-table-column
              align="center"
              :label="$t('cm.operate')"
              width="180"
              fixed="right"
            >
              <template slot-scope="scope">

                <el-button
                  type="text"
                  size="small"
                  class="cud-common-operate-edit"
                  @click.stop="toLogDetail(scope.row)"
                >日志详情</el-button
                >
                <el-button
                  type="text"
                  size="small"
                  class="cud-common-operate-edit"
                  @click.stop="onClickEdit(scope.row)"
                >编辑</el-button
                >
                <el-button
                  type="text"
                  size="small"
                  class="cud-common-operate-edit"
                  @click.stop="onClickDelete(scope.row)"
                >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-row>
        <el-row>
          <div class="cud-special-pagination cud-special-pagination-button">
            <el-pagination
              popper-class="cud-pager-dropdown"
              ref="pager"
              class="cud__page"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="currentNo"
              :page-sizes="[10, 20, 30, 40]"
              :page-size="sizeNo"
              layout="total,sizes, prev, pager, next"
              :pager-count="5"
              :total="total"
              :disabled="tableLoading"
            >
            </el-pagination>
          </div>
        </el-row>
      </el-card>
    </div>
    <!-- 子组件引用 -->
    <apiLog ref="apiLogRef"/>

    <!-- 新增/编辑标签对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="editDialogVisible" width="40%" :close-on-click-modal="false"
               @close="dialogClose">
      <el-form ref="editForm" :model="editForm" :rules="editRules" label-width="150px">

        <el-form-item label="关联系统" prop="relevanceSystem" class="my-el-col">
          <el-input size="small" type="text" v-model="editForm.relevanceSystem"
                    :disabled="dialogType != 'add'">
          </el-input>
        </el-form-item>
        <el-form-item label="接口名(中文)" prop="interfaceNameCh" class="my-el-col">
          <el-input size="small" type="text" v-model="editForm.interfaceNameCh"
                    :disabled="dialogType != 'add'">
          </el-input>
        </el-form-item>

        <el-form-item label="接口名(英文)" prop="interfaceNameEn" class="my-el-col">
          <el-input size="small" type="text" v-model="editForm.interfaceNameEn"
                    placeholder="请输入"
                    :disabled="dialogType != 'add'"
          ></el-input>
        </el-form-item>

        <el-form-item label="接口URL" prop="downInterfaceUrl" class="my-el-col">
          <el-input size="small" type="text" v-model="editForm.downInterfaceUrl" placeholder="请输入"></el-input>
        </el-form-item>

        <el-form-item label="启用/停用" prop="isEnable" class="my-el-col">
          <el-switch
            v-model="editForm.isEnable"
            active-text="启用中"
            inactive-text="已停用"
            active-color="#13ce66"
            inactive-color="#ff4949"
            style="margin-left: 10px;"
          />
        </el-form-item>

        <el-form-item label="是否监测" prop="isMonitor" class="my-el-col">
          <el-select
            v-model="editForm.isMonitor"
            placeholder="请选择"
            class="form-select"
          >
            <el-option
              v-for="item in monitorOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>


        <el-form-item label="检查频率" prop="checkFrequency" class="my-el-col">
          <el-select
            v-model="editForm.checkFrequency"
            placeholder="请选择"
            class="form-select"
            @change="setCronParams"
          >
            <el-option
              v-for="item in intervalOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <span class="unit-text">min/次</span>
        </el-form-item>

        <el-form-item label="定时cron" prop="frequencyCron" class="my-el-col">
          <el-input size="small" type="text" v-model="editForm.frequencyCron" placeholder="请输入"></el-input>
        </el-form-item>

        <el-form-item label="备注" prop="remark" class="my-el-col">
          <el-input size="small" type="text" v-model="editForm.remark"
                    placeholder="请输入"
          ></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button size="small" class="button" @click="dialogClose">取 消</el-button>
        <el-button size="small" class="button" :loading="buttonLoading" type="primary"
                   @click="onClickAddModify">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import apiManage from "./js/apiManage.js";
  export default apiManage;
</script>
<style lang="less" scoped>
  /deep/ .el-button--text {
    user-select: unset;
  }
  /deep/ .el-form-item__label {
    white-space: nowrap;
  }

  /deep/ .el-dialog__header {
    padding: 10px 14px;
    border-bottom: 1px solid #ebeef5;
    position: relative;
  }
  /deep/ .el-dialog__title {
    padding-left: 12px;
    font-size: 18px; /* 标题字号加大 */
    font-weight: 700; /* 标题加粗更醒目 */
    color: #303133;
    line-height: 20px; /* 行高和竖线高度严格匹配，保证垂直居中对齐 */
    &::before {
      content: '';
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      width: 6px; /* 竖线加宽 */
      height: 30px;
      background-color: #409eff;
      border-radius: 2px;
    }
  }
  /deep/ .el-dialog__headerbtn {
    top: 20px;
  }
  /deep/ .el-dialog__body {
    padding: 24px;
  }

  .table-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }
  .table-button {
    text-align: right;
    flex-shrink: 0;
  }
  .level-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .level-chip {
    display: inline-flex;
    align-items: center;
    height: 28px;
    padding: 0 10px;
    border-radius: 14px;
    font-size: 12px;
    color: #606266;
    background: #f4f6f8;
    cursor: pointer;
    user-select: none;
    em {
      font-style: normal;
      margin-left: 6px;
      font-weight: 600;
    }
    &.active {
      color: #fff;
      background: #409eff;
    }
    &.error.active {
      background: #f56c6c;
    }
    &.warn.active {
      background: #e6a23c;
    }
    &.info.active {
      background: #67c23a;
    }
    &.debug.active {
      background: #909399;
    }
  }
  .log-message {
    color: #303133;
  }
  .log-detail {
    padding: 0 20px 24px;
  }
  .log-detail-row {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    font-size: 13px;
    label {
      width: 80px;
      color: #909399;
      flex-shrink: 0;
    }
  }
  .log-detail-block {
    margin-top: 16px;
    label {
      display: block;
      margin-bottom: 8px;
      color: #909399;
      font-size: 13px;
    }
    p,
    pre {
      margin: 0;
      padding: 12px;
      background: #f6f8fa;
      border-radius: 4px;
      color: #303133;
      white-space: pre-wrap;
      word-break: break-all;
      font-size: 13px;
      line-height: 1.6;
    }
  }
  .mono {
    font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
  }

  .my-el-col {
    margin-bottom: 20px;
  }

  /* 输入框宽度统一优化 */
  .my-el-col /deep/ .el-input {
    width: 75%;
  }

  .form-select {
    width: 25%;
    display: inline-block;
    vertical-align: middle;
    margin-right: 0 !important;
    /* 穿透清除下拉组件内部的默认边距 */
    /deep/ .el-input__inner {
      padding-right: 0px; /* 把默认的右内边距从35px大幅缩小，减少组件自身右侧留白 */
    }
  }

  .unit-text {
    margin-left: 2px; /* 进一步缩小间距，几乎紧贴选择框右侧 */
    display: inline-block;
    line-height: 32px;
    vertical-align: middle;
    color: #606266;
    white-space: nowrap;
  }
  // 状态圆点样式
  .status-dot {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 1px solid var(--border-color, #dcdfe6);
    &.green {
      background-color: #00ff11;
    }
    &.red {
      background-color: #f32121;
    }
    &.orange {
      background-color: #ff8800;
    }
    &.gray {
      background-color: #9e9e9e;
    }
  }
</style>




