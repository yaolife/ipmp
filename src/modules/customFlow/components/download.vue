<template>
  <div>
    <el-row>
      <!-- 展示下载列表 -->
      <el-table
        v-loading="loading"
        fixed
        :data="downloadData"
        @selection-change="selectedChange"
      >
        <!-- :header-cell-style="{ 'text-align': 'center' }" -->
        <!-- align="center" -->
        <el-table-column
          type="selection"
          width="40"
          align="center"
        ></el-table-column>
        <el-table-column
          v-if="tableIndex"
          type="index"
          width="50"
          label="序号"
        ></el-table-column>
        <el-table-column
          show-overflow-tooltip
          v-for="item in fileProp"
          :prop="item.prop"
          :key="item.label"
          :label="$t(item.label)"
          :width="item.width"
        ></el-table-column>
        <el-table-column align="center" :label="$t('cm.operate')" width="150">
          <template slot-scope="scope">
            <div style="text-align: right">
              <span v-if="showDel && !readonly">
                <el-button
                  v-if="
                    $route   && (['businessForm','customPageForm'].includes($route.query.name)
                      ? true
                      : procItem.actName === showProcDel
                      ? scope.row.node === showProcDel
                      : true) 
                  "
                  icon="el-icon-minus"
                  type="warning"
                  size="small"
                  @click="delFile(scope.row)"
                  :disabled="disabled"
                ></el-button>
              </span>
              <el-button
                icon="el-icon-download"
                type="primary"
                size="small"
                @click="downloadFile(scope.row)"
              ></el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-row>
  </div>
</template>

<script>
// import {mixinsComp} from '@/mixins/index';
import API from "../api/index";
export default {
  // mixins:[mixinsComp],
  props: [
    "datalist",
    "props",
    "showDel",
    // "showDownLoad",
    "showUpload",
    "showProcDel",
    "disabled",
    "readonly",
    "tableIndex",
    "currentLoginDel"
  ],
  data() {
    return {
      mixinsCmptCode: "download",
      mixinsCmptName: "下载列表",
      loading: false,
      //downloadData  和 props 都是从子页面传过来的
      selected: []
    };
  },
  methods: {
    // 调接口删除文件
    delFileApi: function(ids) {
      if (!ids || ids.length < 1) {
        return;
      }
      let _this = this;
      _this.loading = true;
      API.delFiles({
        ids: ids
      })
        .then(res => {
          _this.loading = false;
          if (res.code === "0") {
            _this.$message({
              type: "success",
              message: "删除成功！"
            });
          }
        })
        .catch(() => {
          _this.loading = false;
        });
    },
    delFile: function(row) {
      let _this = this;
      this.$confirm(this.$t("cm.delete_tips"), this.$t("cm.tips"), {
        confirmButtonText: this.$t("cm.confirm"),
        cancelButtonText: this.$t("cm.cancel"),
        cancelButtonClass: "btn-second",
        confirmButtonClass: "btn-default",
        type: "error"
      })
        .then(result => {
          this.$emit("delData", row);
          // 调用删除接口
          this.delFileApi([row.fileId]);
        })
        .catch(err => {
          //这里是取消操作
        });
    },
    // 删除所选
    delSelected: function() {
      if (this.selected.length < 1) return;
      let _this = this;
      this.$confirm(this.$t("cm.delete_tips"), this.$t("cm.tips"), {
        confirmButtonText: this.$t("cm.confirm"),
        cancelButtonText: this.$t("cm.cancel"),
        cancelButtonClass: "btn-second",
        confirmButtonClass: "btn-default",
        type: "error"
      })
        .then(result => {
          let fileIds = [];
          _this.selected.forEach(item => {
            _this.$emit("delData", item);
            fileIds.push(item.fileId);
          });
          // 调用删除接口
          this.delFileApi(fileIds);
        })
        .catch(err => {
          //这里是取消操作
        });
    },
    // 选择
    selectedChange: function(row) {
      this.selected = row;
    },
    downloadFile: function(row) {
      let fileSizeFloat = Math.ceil(row.fileRealSize.split(" ")[0] * 1024);
      //下载文件
      let _this = this;
      _this.loading = true;
      API.downloadFile({
        fileRealName: row.fileRealName,
        fileId: row.fileId,
        fileSize: row.fileSizeValue || fileSizeFloat
      })
        .then(res => {
          _this.loading = false;
          var blob = new Blob([res.data], {
            type: "application/octet-stream;charset=utf-8"
          });
          //var contentDisposition = res.headers['content-disposition'];  //从response的headers中获取filename, 后端response.setHeader("Content-disposition", "attachment; filename=xxxx.docx") 设置的文件名;
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
        })
        .catch(err => {
          _this.loading = false;
          _this.$alert(err, _this.$t("cm.tips"));
        });
    }
  },
  mounted: function() {},
  computed: {
    fileProp: function() {
      return this.props;
    },
    downloadData: function() {
      return this.datalist;
    },
    procItem() {
      return JSON.parse(sessionStorage.getItem("procItem"));
    },
  }
};
</script>

<style scoped>
.table-body-bottom {
  margin-bottom: 15px;
}
.el-table__body .el-table-column--selection .cell {
  display: none;
}
</style>
