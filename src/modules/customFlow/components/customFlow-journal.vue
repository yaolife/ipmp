<template>
  <div>
    <div width="100%">
      <el-row class="table-body">
        <el-table
          :data="journalData"
          ref="formTable"
          v-loading="listLoading"
          :empty-text="$t('cm.nodata')"
        >
          <el-table-column
            prop="linkName"
            key="1"
            show-overflow-tooltip
            :label="$t('cudComponents.node_name')"
          ></el-table-column>
          <el-table-column
            prop="approveUser"
            key="2"
            show-overflow-tooltip
            :label="$t('cudComponents.approver')"
          ></el-table-column>
          <!-- width="150" -->
          <el-table-column
            prop="taskArrivalTime"
            key="3"
            show-overflow-tooltip
            :label="$t('cudComponents.task_arrival_time')"
          ></el-table-column>
          <!-- width="150" -->
          <el-table-column
            prop="taskCompletionTime"
            key="4"
            show-overflow-tooltip
            :label="$t('cudComponents.task_completion_time')"
          ></el-table-column>
          <!-- width="150" -->
          <el-table-column
            prop="timeConsuming"
            key="5"
            show-overflow-tooltip
            :label="$t('cudComponents.time_consuming')"
          ></el-table-column>
          <!-- width="100" -->
          <el-table-column
            prop="circlationMode"
            key="6"
            show-overflow-tooltip
            :label="$t('cudComponents.circulation_mode')"
          ></el-table-column>
          <!-- width="150" -->
          <el-table-column
            prop="comment"
            key="7"
            :label="$t('cudComponents.approve_suggest')"
          ></el-table-column>
          <el-table-column
            v-if="fileShow"
            prop="attachmentList"
            key="8"
            :label="$t('cudComponents.return_file')"
          >
            <template slot-scope="scope">
              <div
                v-for="(item, index) in scope.row.attachmentList"
                :key="index"
              >
                <span @click="download(item)" class="file-color"
                  >{{ index + 1 + "." }}{{ item.fileRealName }}</span
                >
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-row>
      <el-row class="table-bottom" style="margin-top: 15px">
        <el-pagination
          v-if="show"
          ref="pager"
          layout="total,sizes, prev, pager, next"
          hide-on-single-page
          :current-page="currentPage"
          :page-sizes="[10, 20, 30, 40]"
          :page-size="pageSizes"
          :pager-count="5"
          :total="totals"
          @size-change="changeSize"
          @current-change="changeCurrentPage"
          @prev-click="prePage"
          @next-click="nextPage"
        ></el-pagination>
      </el-row>
      <div v-if="tableData && tableData.length > 1">
        <div v-if="!show" class="demo-block-control show" @click="handleExpand">
          <i class="el-icon-caret-bottom hovering"></i>
          <span class="show-content">查看更多流程</span>
        </div>
        <div v-else class="demo-block-control show" @click="handleRecover">
          <i class="el-icon-caret-top hovering"></i>
          <span class="show-content">收回</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ht from "@/api/http";
import API from "../api";
export default {
  name: "Journal", 
  data() {
    return {
      journalData: [],  
      paramProcActId: this.procActId, 
      currentPage: 1,
      pageSizes: 10,
      totals: 0,
      listLoading: false,
      fileShow: false,
      arr: [],
      tableData: [],
      show: true
    };
  },
  mounted() {
    this.initForm();
  },
  methods: {
    // 展开
    handleExpand() {
      this.show = true;
      this.journalData = this.tableData;
    },
    // 收回
    handleRecover() {
      this.show = false;
      this.journalData = this.arr;
    },
    initForm() {
      let params = {
        // pageIndex: this.currentPage,
        // pageSize: this.pageSizes,
        // procInsID: this.paramProcInsID,
        // approvalAction: this.paramApprovalAction,
        // paging: this.paramPaging
        // procActInstId: this.$route.query.actInstId,
        procInsID: this.$route.query.procInstId,
        pageSize: this.pageSizes,
        pageIndex: this.currentPage,
        paging: true,
        customForm: 1
      };
      this.listLoading = true;
      this.getFormList(params).then(res => {
        console.log(res, "====");
        if (res.code === "0") {
          this.journalData = res.records;

          this.tableData = res.records;
          let procItem = JSON.parse(sessionStorage.getItem("procItem"));
          if (this.currentPage == 1 && procItem.procInstStatus === "2") {
            this.tableData.unshift({
              linkName: "流程结束",
              approveUser: "-",
              taskArrivalTime: "-",
              taskCompletionTime: "-",
              timeConsuming: "-",
              circlationMode: "-",
              comment: "-"
            });
          }
          this.totals = res.total;
          this.listLoading = false;
          this.fileShow = false;
          this.journalData.forEach(item => {
            if (item.attachmentList && item.attachmentList.length > 0) {
              this.fileShow = true;
            }
          }); 
          let data = JSON.parse(JSON.stringify(this.journalData));
          this.arr = [];
          this.arr.push(data[0]); 
        } else {
          this.listLoading = false;
          this.$message({ message: res.message, type: "error" });
        }
      });
    },
    /** 附件退回下载 */
    download(row) {
      let _this = this;
      _this.listLoading = true;
      API.downloadFile({
        fileRealName: row.fileRealName,
        fileId: row.fileId,
        fileSize: row.fileSizeValue || row.fileRealSize * 1024
      })
        .then(res => {
          console.log(res, "======");
          // if (this.onlyImg) {
          //   const reader = new FileReader();
          //   reader.onload = (e) => {
          //     this.imageUrl = e.target.result;
          //   };
          //   reader.readAsDataURL(res);
          //   this.imageUrl = URL.createObjectURL(res);
          // } else {
          _this.listLoading = false;
          var blob = new Blob([res], {
            type: "application/octet-stream;charset=utf-8"
          });
          var filename = row.fileRealName;
          if ("download" in document.createElement("a")) {
            var downloadElement = document.createElement("a");
            var href = window.URL.createObjectURL(blob); //创建下载的链接
            downloadElement.style.display = "none";
            downloadElement.href = href;
            downloadElement.download = filename; //下载后文件名
            document.body.appendChild(downloadElement);
            downloadElement.click(); //点击下载
            document.body.removeChild(downloadElement); //下载完成移除元素
            window.URL.revokeObjectURL(href); //释放掉blob对象
          } else {
            window.navigator.msSaveOrOpenBlob(blob, row.fileRealName);
            // navigator.msSaveBlob(blob, filename);
          }
          // }
        })
        .catch(err => {
          _this.loading = false;
          _this.$alert(err, _this.$t("cm.tips"));
        });
    },
    //改变每页显示数
    changeSize: function(pageSize) {
      this.pageSizes = pageSize;
      this.initForm();
    },
    //翻页
    changeCurrentPage: function(current) {
      this.currentPage = current;
      this.initForm();
    },
    //上一页
    prePage: function(current) {
      this.currentPage = current;
      this.initForm();
    },
    //下一页
    nextPage: function(current) {
      this.currentPage = current;
      this.initForm();
    },
    getFormList(params) {
      return ht
        .post("/assembly/queryProcessLogBackUp", params)
        .then(res => res.data);
    }
  }
};
</script>
<style lang="less" scoped>
.topTitle {
  padding: inherit;
  display: flex;
}

.sidebarText {
  width: 2px;
  margin-right: 5px;
  background: rgba(7, 75, 132, 1);
}
.file-color {
  color: #0c7bca;
  cursor: pointer;
}
:hover.file-color {
  color: #409eff;
}
.expand {
  text-align: center;
  cursor: pointer;
}
:hover.expand {
  color: #0775db;
}

.demo-block-control {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 14px;
  box-sizing: border-box;
  background-color: #fff;
  // border: 1px solid #eaeefb;
  // border-bottom-left-radius: 4px;
  // border-bottom-right-radius: 4px;
  text-align: center;
  margin-top: 0px;
  color: #d3dce6;
  cursor: pointer;
  position: relative;
  .demo-block-control > span {
    position: absolute;
    transform: translateX(-30px);
    font-size: 14px;
    line-height: 44px;
    transition: 0.3s;
    display: inline-block;
  }
  i.hovering {
    transform: translateX(-10px);
  }
}
.demo-block-control:hover {
  color: #409eff;
}
.show-content {
  display: none;
}
.show:hover .show-content {
  display: block;
}
i.hovering {
  transform: translateX(-10px);
}
</style>
