<template>
  <div>
    <!--审批-->
    <el-dialog
      v-loading="loading"
      :visible="isOpen"
      :title="$t('cgnTask.operate.batch_approval')"
      min-width="640px"
      width="60%"
      v-dragMove="{
        DragButton: '.el-dialog__header',
        DragWindow: '.el-dialog',
      }"
      :destroy-on-close="true"
      :close-on-click-modal="false"
      :before-close="handleClose"
      class="task-dialog"
    >
      <!-- 批量审批任务 -->
      <div class="query-result cud__table--list" :style="{ height:  '100% '}">
      <!-- 表格 -->
      <el-table
        ref="multipleTable"
        highlight-current-row
        header-row-class-name="cud-office-table-header"
        border
        stripe
        :data="data"
        :row-key="(row)=>row.id"
        max-height="600px"
        class="cud-office-table"
        :default-sort="{ prop: 'assignTime', order: 'descending' }"
        @cell-mouse-enter="cellMouseEnter"
        @cell-mouse-leave="cellMouseLeave"
        @selection-change="handleSelectionChange"
      >
        <!-- 优先级 -->
        <!-- <el-table-column width="130" align="left" class-name="vertical-align-top">
          <template slot-scope="scope">
            <div :class="['cud-task-priority', $options.filters.priorityClass(scope.row.priority)]">{{$t(getRowPriority(scope.row.priority))}}·{{$t('cgnTask.field.priority')}}</div>
          </template>
        </el-table-column> -->
         <el-table-column type="selection" :reserve-selection="true" width="55"></el-table-column>
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
              <el-button type="text" @click="$emit('openTaskForm', scope.row)">{{
                scope.row.procSubject
              }}</el-button>
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
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="cud-special-pagination" style="margin-bottom: 0">
      <!-- 分页 -->
      <el-pagination
        class="cud__page float-right"
        :layout="pagination.layout"
        :page-sizes="pagination.pageSizes"
        :page-size="pagination.pageSize"
        :pager-count="5"
        :current-page="pagination.pageNum"
        :total="pagination.total"
        @size-change="(pageSize) => queryTaskList(1, pageSize)"
        @current-change="(pageNum) => queryTaskList(pageNum)"
      >
      </el-pagination>
    </div>

      <div slot="footer" class="dialog-footer" align="center">
        <el-button size="small" @click="handleClose">{{
          $t("cgnCommon.cancel")
        }}</el-button>
        <el-button size="small" type="primary" @click="openDescriptionDialog">{{
          $t("cgnCommon.commit")
        }}</el-button>
      </div>
    </el-dialog>
    <!--意见及通知方式-->
    <el-dialog
      :visible="showDialog"
      :title="$t('cgnTask.operate.circulation')"
      width="640px"
      v-dragMove="{
        DragButton: '.el-dialog__header',
        DragWindow: '.el-dialog'
      }"
      :destroy-on-close="true"
      :close-on-click-modal="false"
      class="task-dialog"
      :before-close="()=>showDialog = false"
    >
    <el-form ref="editForm" size="small" label-suffix="：" label-position="top" :model="formData" :rules="formRules" label-width="170px">
      <el-row>
        <el-col :span="12">
          <el-form-item :label="$t('cgnTask.field.circulation_mode')" prop="circulation">
            <el-radio-group v-model="formData.circulation">
              <el-radio :label="'1'">{{$t('cgnTask.circulation.submit')}}</el-radio>
              <el-radio :label="'2'">{{$t('cgnTask.circulation.sendback')}}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <!--通知-->
        <!-- <el-col :span="12">
          <el-form-item
            v-if="!emailMessageShow || !shortMessageShow || !dingMessageShow"
            :label="$t('cgnTask.field.noticeMethods')"
          >
            <el-checkbox-group v-model="formData.noticeMethods">
              <el-checkbox label="1" v-if="!emailMessageShow">{{
                $t("cgnTask.field.emailMessage")
              }}</el-checkbox>
              <el-checkbox label="2" v-if="!shortMessageShow">{{
                $t("cgnTask.field.shortMessage")
              }}</el-checkbox>
              <el-checkbox label="3" v-if="!dingMessageShow">{{
                $t("flow.dingMessage")
              }}</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-col> -->
        <!-- 意见 -->
        <el-col :span="24">
          <el-form-item :label="$t('cgnTask.field.circulationOpinion')">
            <el-input
              v-model="formData.description"
              type="textarea"
              :row="4"
              maxlength="160"
              show-word-limit
              placeholder="同意"
            ></el-input>
          </el-form-item>
        </el-col>

      </el-row>
    </el-form>
    <div slot="footer" class="dialog-footer" align="center">
        <el-button size="small" @click="showDialog = false">{{
          $t("cgnCommon.cancel")
        }}</el-button>
        <el-button size="small" type="primary" @click="handleCommitForm">{{
          $t("cgnCommon.commit")
        }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as Utils from "@/utils/Utils";
import ApiTask from "../../common/ApiTask";
export default {
  name: "TaskBatchApprovalDialog",
  props: {
    isOpen: { type: Boolean, default: false },
    procDefName:{ type: String, default:  ""  },
    taskOrderBy:{ type: String, default:  "" },
    pageSize: { type: Number, default: 10 }, 
    // shortMessageShow: { type: Boolean, default: false },
    // emailMessageShow: { type: Boolean, default: false },
    // dingMessageShow: { type: Boolean, default: false },
    // emailMessageTrue: { type: Boolean, default: false },
    // shortMessageTrue: { type: Boolean, default: false },
    // dingMessageTrue: { type: Boolean, default: false },
  },
  data() {
    return {
      loading: false,
      showDialog: false,
      fieldSettings:[],
      data:[],
      multipleSelection:[],
      pagination: {
        // 分页参数
        layout: Utils.Pagination.layout,
        pageSizes: Utils.Pagination.pageSizes,
        pageSize: this.pageSize,
        pageNum: 1,
        total: 0
      },
      formData: {
        circulation:"",//审批方式
        description: "", // 意见
        // noticeMethods: [] // 通知方式
      },
      formRules:{
        circulation:[{ required:true , message: this.$t("cgnTask.tips.circulationModeNotEmpty") }]
      }
    };
  },
  filters: Utils.Filters,
  watch: {
    /**
     * 切换语言时重新查询表单
     */
    "$i18n.locale"() {
      this.queryTaskList();
    },
    // 表格高度的监听
  },
  created() {
    this.queryTaskList(1)
  },
  mounted(){
    //通知相关 目前不用
    // if (
    //   this.emailMessageTrue &&
    //   this.shortMessageTrue &&
    //   this.dingMessageTrue
    // ) {
    //   this.formData.noticeMethods = ["1", "2", "3"];
    // } else if (this.emailMessageTrue && this.shortMessageTrue) {
    //   this.formData.noticeMethods = ["1", "2"];
    // } else if (this.shortMessageTrue && this.dingMessageTrue) {
    //   this.formData.noticeMethods = ["2", "3"];
    // } else if (this.emailMessageTrue && this.dingMessageTrue) {
    //   this.formData.noticeMethods = ["1", "3"];
    // } else if (this.emailMessageTrue) {
    //   this.formData.noticeMethods = ["1"];
    // } else if (this.shortMessageTrue) {
    //   this.formData.noticeMethods = ["2"];
    // } else if (this.dingMessageTrue) {
    //   this.formData.noticeMethods = ["3"];
    // }
  },
  methods: {
    getFieldName(fieldKey) {
      return "cgnTask.toDoList." + fieldKey;
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
    // 鼠标移入行事件
    cellMouseEnter(row, column, cell, event) {
      this.active = row.id;
    },
    cellMouseLeave() {
      this.active = "";
    },
    /**
     * 任务操作：查看流程图
     */
    onTaskViewFlowChart(row) {
      this.$emit("viewFlowChart", row);
    },
    /**
     * 查询任务列表
     */
    async queryTaskList(pageNum, pageSize) {
      let that = this
      // 更新分页参数
      that.pagination.pageNum = pageNum || that.pagination.pageNum;
      that.pagination.pageSize = pageSize || that.pagination.pageSize;
      // 清空查询显示
      that.data = [];
      that.fieldSettings = [];
      // 获取查询参数
      let requestParams = { 
          taskOrderBy:that.taskOrderBy,// 排序方式 0-任务分派时间降序 1-任务分派时间升序
          pageIndex: that.pagination.pageNum,
          pageSize: that.pagination.pageSize,
          procDefName:that.procDefName
        }
      // 请求API
      that.loading = true;
      try {
        let res = await ApiTask.queryTask(requestParams)
        if (res.status == 200 && res.data.code == 0) {
          let dataList = res.data.data.page.records.filter(e=>e.isMultiProc==='1')
          let fieldSettings = res.data.data.fieldReturnDtoList;
          that.data = dataList; // 更新查询结果
          that.pagination.total = res.data.data.page.total; // 更新分页总数
          that.fieldSettings = fieldSettings; // 更新字段显示设置
        }
      } catch (error) {
        
      } finally{
        that.loading = false
      }
      

      
    },
    //选中项
    handleSelectionChange(val){
     this.multipleSelection = val
    },
    openDescriptionDialog(){
      if(!this.multipleSelection.length)return this.$message.warning('请选择至少一条数据！')
      this.showDialog = true
    },

    // 提交
    async handleCommitForm() {
      this.$refs.editForm.validate(valid => {
        if (valid) {
          this.approval()
        }
      })
    },
    //审批
    async approval(){
      
      const loading = this.$loading({
        lock: true,
        text: '提交中...',
        spinner: 'el-icon-loading',
        background: 'rgba(255, 255, 255, 0.8)'
      });

      let params = []
      let key = {
        procId: "", // 流程ID
        procVersion: "", // 流程版本
        procName: "",// 流程名
        procNode: 2,// 类型 // 1 发起页面 / 2 待办页面 / 3 已办页面 / 4 草稿页面
        procInstId: "",// 流程实例ID
        pscModelId: "",// 流程模型ID
        actId: "",// 活动ID
        actInstId: "",// 活动实例ID
        actName: "",// 活动名
        procTaskId: "",// 任务ID
        flowStatus: "",// 流程状态 1：草稿，2：非草稿
        procInstStatus: "",
        taskFromStatus: "",
        endTime: "",
        formId: "",
        extData: "",
        cosignItemCode: "",
        noticeMethods:"",//通知方式
        comment: "同意"
      }

      this.multipleSelection.map(e=>{
        let obj = JSON.parse(JSON.stringify(key))
        obj.procId = e.procDefId
        obj.procVersion = e.taskExtend01
        obj.procName = e.procDefName
        obj.procInstId = e.procInstId
        obj.pscModelId = e.pscModelId
        obj.actId = e.procActId
        obj.actInstId = e.procActInstId
        obj.actName = e.procActName
        obj.procTaskId = e.id
        obj.flowStatus = '2'
        obj.procInstStatus = e.procInstStatus
        obj.cosignItemCode = e.cosignItemCode
        obj.endTime = e.endTime
        obj.actCode = e.actCode
        if(this.formData.description){
          obj.comment = this.formData.description&&this.formData.description
        }
        // obj.noticeMethods = this.formData.noticeMethods && this.formData.noticeMethods.length > 0 ? this.formData.noticeMethods.join(","): "" 

        params.push(obj)
      })
        

      // this.loading = true
      try {
        const API = this.formData.circulation === '1' ? ApiTask.multiSubmitProcess:ApiTask.multiSendBack;
        let res = await API(params)
        console.log(res,'[res]');
        const {data} = res
        if(data){
          const {code,data:list,msg} = data
          if(code==='0'){
            this.$message.success(msg||'操作成功！')
            this.$emit('successFn')
            this.showDialog = false
            this.handleClose()
            return 
          }else return this.$message.error(msg||'操作失败！')
        }
      } catch (error) {
        console.error(error);
      }finally{
        // this.loading = false
        loading.close()
      }
    },

    // 关闭弹窗
    handleClose() {
      this.$emit("closeDialog");
    },

  },
};
</script>
<style lang="less" scoped></style>
