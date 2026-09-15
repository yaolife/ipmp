<template>
  <div>
    <div :style="{ height: tableHeight + 'px', overflowY: 'scroll' }">
      <div v-for="item in tableData" :key="item.id" class="task-item" :class="itemClass(item)">
        <div class="subject">{{ item.procSubject }}</div>
        <div class="detail">
          <el-button type="text" size="small" @click="openTask(item)"><i class="el-icon-tickets"></i> 查看详情</el-button>
          <el-button type="text" size="small" @click="taskClick(item)"><i class="el-icon-edit-outline"></i> 快速处理</el-button>
          <span>|</span> 上一处理人：{{ item.startUserName }} <span>|</span> 时间：{{ item.assignTime ? item.assignTime : item.assigneeTime }}
        </div>
        <el-button type="text" v-if="taskType == 1" @click="taskClick(item)" class="task-btn">
          <i :class="item.showApproval ? 'el-icon-arrow-down' : 'el-icon-arrow-up'"></i>
        </el-button>
        <div v-if="item.showApproval" class="task-approval">
          <el-row :gutter="10">
            <el-col :span="6" align="right">
              <el-radio-group v-model="item.radio2" style="padding-top: 5px;">
                <el-radio :label="3">同意</el-radio>
                <el-radio :label="6">退回</el-radio>
              </el-radio-group>
            </el-col>
            <el-col :span="6">
              <el-input size="small" v-model="item.input" placeholder="审批意见"></el-input>
            </el-col>
            <el-col :span="6">
              <el-input size="small" v-model="item.input2" placeholder="下一处理人"></el-input>
            </el-col>
            <el-col :span="6">
              <el-button size="small" type="primary" @click="taskApproval(item)">
                {{ $t("cm.commit") }}
              </el-button>
            </el-col>
          </el-row>

          <el-dialog visible.sync="item.showDialog">
            <!-- <wf-comm-person-component
              ref="wfCommPersonComponentId"
              :show-user-group-tab="false"
              :showDynRoleTab="false"
              :showStationTab="false"
              :showOrgTab="false"
              :showUserMultiple="true"
              :showCheckbox="false"
              :initUserId="initUserId"
            ></wf-comm-person-component> -->
            <div slot="footer">
              <el-button size="small" type="primary" @click="taskApproval(item)">
                {{ $t("cm.commit") }}
              </el-button>
            </div>
          </el-dialog>
        </div>
      </div>
    </div>
    <div class="task-bottom">
      <el-button type="text" @click="$router.push('/office')">查看更多</el-button>
    </div>
  </div>
</template>

<script>
import taskApi from "../../../components/cgnTask/common/ApiTask";

export default {
  name: "taskList",
  components: {
    //
  },
  props: {
    taskType: { type: Number, default: 1 },      // 类型，1待办 2已办 3待阅 4已阅
    taskCount: { type: Number, default: "" },    // 任务数量
    searchKey: { type: String, default: "" },    // 搜索
    taskOrderBy: { type: Number, default: 0 },   // 排序方式 0-任务分派时间降序 1-任务分派时间升序
    updateCount: { type: Function },             // 更新数量
    tableHeight: { type: Number, default: 500 }, // 高度
  },
  data() {
    return {
      tableData: [],  //数据
      loading: false,
      pagination: { // 分页参数
        pageSize: 10,
        pageNum: 1,
        total: 0
      },
    };
  },
  mounted() {
    this.queryTaskList();
  },
  computed: {
    //
  },
  watch: {
    //
  },
  methods: {
    itemClass(item) {
      if (item.priority == 0) return '';
      else if (item.priority == 1) return 'warn1';
      else if (item.priority == 2) return 'warn2'
    },
    //查询任务列表
    queryTaskList() {
      let that = this;
      let api = null;
      switch(this.taskType) {
        case 1:
          api = taskApi.queryTask;
        break;
        case 2:
          api = taskApi.queryTaskHist;
        break;
        case 3:
          api = taskApi.queryTaskCC;
        break;
        case 4:
          api = taskApi.queryTaskCCHist;
        break;
      }
      let params = {
        pageIndex: that.pagination.pageNum,
        pageSize: that.pagination.pageSize,
        procSubject: that.searchKey,
        taskOrderBy: that.taskOrderBy,
      }
      that.loading = true;
      api(params).then((res) => {
        that.loading = false;
        if (res.status == 200 && res.data.code == 0) {
          let data = res.data.data.page;
          that.tableData = data.records;
          that.pagination.total = data.total;
          that.pagination.pageNum = data.current;
          that.$emit("updateCount", that.taskType, data.total);
        }
      }).catch((err) => {
        that.loading = false;
      })
    },
    //详情
    openTask(row) {
      let datasType = 2;
      row.dataType = datasType;
      const dataType = {
        draft: 4,
        taskList: 2,
        taskHistList: 3,
        taskCcList: 5,
        taskCcHistList: 6
      };
      let dataInfo = {
        // 流程ID
        procId: row.procDefId,
        // 流程版本
        procVersion: row.taskExtend01,
        // 流程名
        procName: row.procDefName,
        // 流程实例ID
        procInstId: row.procInstId,
        // 类型 // 1 发起页面 / 2 待办页面 / 3 已办页面 / 4 草稿页面
        procNode: dataType[datasType],
        // 活动ID
        actId: row.procActId,
        // 活动实例ID
        actInstId: row.procActInstId,
        // 活动名
        actName: row.procActName,
        // 上一操作流程环节id
        sentByProcActId: row.sentByProcActId,
        // 流程模型ID
        procModelId: row.procModelId,
        // 任务ID
        procTaskId: row.id,
        // 会签ID
        cosignItemCode: row.cosignItemCode,
        procInstStatus: row.procInstStatus,
        endTime: row.endTime,
        actCode: row.actCode,
        // 流程状态
        flowStatus: "2"
      };
      sessionStorage.removeItem("procItem");
      sessionStorage.setItem("procItem", JSON.stringify(dataInfo));
      // 待办列表，验证任务是否被任务，被处理刷新列表，未被处理打开新页面
      if (datasType === "taskList") {
        // console.log(row, "row===");
        let params = {
          procId: row.procDefId,
          procTaskId: row.id
        };
        this.loading = true;
        ApiTask.checkTask(params).then(res => {
          this.loading = false;
          if (res.data.code === "0") {
            if (row.formUrl) {
              this.$router.push({
                path: row.formUrl,
                query: {
                  actId: dataInfo.actId,
                  procNode: dataInfo.procNode,
                  procVersion: dataInfo.procVersion,
                  procId: dataInfo.procId,
                  id: dataInfo.procTaskId,
                  actInstId: dataInfo.actInstId,
                  procInstId: dataInfo.procInstId,
                  procName: dataInfo.procName,
                  r: Math.random(),
                  // 流程状态
                  flowStatus: "2"
                }
              });
            } else {
              //打开页签
              this.openTab({
                path: "/workbench/view",
                query: {
                  procName: dataInfo.procName,
                  r: Math.random()
                }
              });
            }
          } else {
            this.$alert(res.data.msg);
            // 更新任务数量
            this.refreshAllTaskCount();
            // 更新代办任务列表
            this.$refs.taskList.queryTaskList();
          }
        }).catch((err) => {
          this.loading = false;
        });
      } else {
        if (row.formUrl) {
          this.$router.push({
            path: row.formUrl,
            query: {
              actId: dataInfo.actId,
              procNode: dataInfo.procNode,
              procVersion: dataInfo.procVersion,
              procId: dataInfo.procId,
              id: dataInfo.procTaskId,
              actInstId: dataInfo.actInstId,
              procInstId: dataInfo.procInstId,
              procName: dataInfo.procName,
              r: Math.random(),
              // 流程状态
              flowStatus: "2"
            }
          });
        } else {
          //打开页签
          this.openTab({
            path: "/workbench/view",
            query: {
              // item: dataInfo
              procName: dataInfo.procName,
              r: Math.random()
            }
          });
        }
      }
    },
    //点击
    taskClick(item) {
      item.showApproval = !item.showApproval;
      this.$forceUpdate();
    },
    //快速审批
    taskApproval(item) {
      item.showDialog = false;
      this.$forceUpdate();
    },
  },
};
</script>
<style lang="less" scoped>
.task-item {
  position: relative;
  min-height: 60px;
  padding-left: 10px;
  padding-top: 10px;
  border: 1px solid #f0f0f0;
  border-left: 4px solid rgba(0, 162, 233, 1);
  border-right: none;
}
.task-item:hover {
  background-color: #fafcfc;
}
.task-item.warn1 {
  border-left-color: rgba(246, 173, 2, 1);
}
.task-item.warn2 {
  border-left-color: rgba(233, 72, 72, 1);
}
.task-item .subject {
  height: 25px;
  font-size: 16px;
}
.task-item .detail {
  color: #999;
}
.task-item .detail span {
  padding: 0 15px;
  color: #ddd;
}
.task-item .task-btn {
  position: absolute;
  top: 10px;
  right: 0;
  width: 60px;
  height: 50px;
  border-left: 1px solid #f0f0f0;
}
.task-item .task-approval {
  border-top: 1px solid #f0f0f0;
  margin-top: 5px;
  padding: 10px 0;
  margin-right: 10px;
}
.task-bottom {
  width: 100%;
  height: 40px;
  text-align: center;
  border-top: 1px solid #f0f0f0;
  box-shadow: 2px 2px 10px #eee;
}
</style>
