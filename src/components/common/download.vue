<template>
  <!-- 下载通用组件 是否可行   table形式显示-->
  <div>
    <!--v-if="showBrand"-->
    <div class="brand" v-if="lookBrand">
      <breadcrumb :arrayName="brand" :hasIcon="hasIcon"></breadcrumb>
    </div>

    <!--:class="showBrand?'container container-top':''"-->
    <div
      :class="lookBrand ? 'container container-top' : ''"
      :style="lookBrand ? 'padding-bottom:15px' : ''"
    >
      <el-row :class="lookBrand ? 'table-body' : 'table-body-bottom'">
        <!-- 展示下载列表 -->
        <el-table
          v-loading="loading"
          :style="lookBrand ? 'margin-top:15px;margin-bottom:15px;' : ''"
          :data="downloadData"
        >
          <el-table-column
            v-for="item in fileProp"
            :prop="item.prop"
            :key="item.label"
            :label="item.label"
          ></el-table-column>
          <el-table-column :label="$t('cm.operate')">
            <template slot-scope="scope">
              <el-button
                type="text"
                size="small"
                v-if="showload"
                @click="downloadFile(scope.row)"
                >下载</el-button
              >
              <el-button
                type="text"
                size="small"
                v-if="showDel"
                @click="delFile(scope.row)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </el-row>

      <el-row class="table-bottom">
        <el-pagination popper-class="cud-pager-dropdown"
          @size-change="changeSize"
          @current-change="changeCurrentPage"
          @prev-click="selectPage"
          @next-click="selectPage"
          :current-page="currentPage"
          :page-sizes="[10, 20, 30, 40]"
          :page-size="pageSize"
          :pager-count="5"
          layout="total,sizes, prev, pager, next"
          :total="total"
        >
        </el-pagination>
      </el-row>

      <el-row>
        <div style="text-align: center">
          <el-button
            class="btn-second"
            v-if="lookBrand"
            size="small"
            @click="back"
            style="display: inline-block"
            >返回</el-button
          >
        </div>
      </el-row>
    </div>
  </div>
</template>

<script>
import { mixinsComp } from "@/mixins/index";
import breadcrumb from "./breadcrumb";
import { downloadFile } from "@/api/api.js";
export default {
  mixins: [mixinsComp],
  components: {
    breadcrumb
  },
  props: [
    "showBrand",
    "datalist",
    "props",
    "showDel",
    "showUpload",
    "showLoading"
  ],
  data() {
    return {
      mixinsCmptCode: "download",
      mixinsCmptName: "下载列表",
      brand: [{ name: "lang.workbench" }, { name: "cm.download" }],
      hasIcon: false,
      //downloadData  和 props 都是从子页面传过来的， 或者 是直接 router-link到这个页面  带参数
      currentPage: 1,
      pageSize: 10
      // total:0,
      // total:this.datalist.length,
      // downloadData:this.datalist,
    };
  },
  methods: {
    back: function() {
      this.$router.push("/need_deal_task");
    },
    changeSize: function(pageSize) {
      //处理list
      this.pageSize = pageSize;
      this.currentPage = 1;
    },
    changeCurrentPage: function(currentPage) {
      //处理list
      this.currentPage = currentPage;
    },
    //下一页或上一页
    selectPage: function(currentPage) {
      //处理list
      this.currentPage = currentPage;
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
        })
        .catch(err => {
          //这里是取消操作
        });
    },
    downloadFile: function(row) {
      //下载文件
      let _this = this;
      downloadFile({
        fileUrl: row.fileUrl,
        fileName: row.fileName,
        fileRealName: row.fileRealName,
        t: Math.random()
      })
        .then(res => {
          var blob = new Blob([res.data], {
            type: "application/actet-stream;charset=utf-8"
          });
          var contentDisposition = res.headers["content-disposition"]; //从response的headers中获取filename, 后端response.setHeader("Content-disposition", "attachment; filename=xxxx.docx") 设置的文件名;
          // var patt = new RegExp("filename=([^;]+\\.[^\\.;]+);*");
          // var result = patt.exec(contentDisposition);
          // var filename = result[1];
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
            navigator.msSaveBlob(blob, filename);
          }
        })
        .catch(err => {
          console.log(err);
          _this.$alert(err, _this.$t("cm.tips"));
        });
    }
  },
  mounted: function() {},
  computed: {
    total: function() {
      if (typeof this.showBrand != "undefined") {
        return this.datalist.length;
      } else {
        return this.$route.query.fileLists.length;
      }
    },
    lookBrand: function() {
      if (typeof this.showBrand != "undefined") {
        return this.showBrand;
      } else {
        return true;
      }
    },
    loading: function() {
      if (typeof this.showLoading != "undefined") {
        return this.showLoading;
      } else {
        return false;
      }
    },
    showload: function() {
      if (typeof this.showBrand != "undefined") {
        return this.showUpload;
      } else {
        return true;
      }
    },
    fileProp: function() {
      if (typeof this.showBrand != "undefined") {
        return this.props;
      } else {
        return this.$route.query.fileProps;
      }
    },
    downloadData: function() {
      //截取list
      if (typeof this.showBrand != "undefined") {
        let index = 0;
        let pageFrom = (this.currentPage - 1) * this.pageSize + 1; //从第几条开始取
        //判断 total 是否大于 要取的最后一条
        let pageEnd =
          this.currentPage * this.pageSize < this.total
            ? this.currentPage * this.pageSize
            : this.total - (this.currentPage - 1) * this.pageSize; //要取的最后一条
        let list = this.datalist.slice(pageFrom - 1, pageFrom - 1 + pageEnd);
        return list;
      } else {
        return this.$route.query.fileLists;
      }
    }
  }
};
</script>

<style scoped>
.table-body-bottom {
  margin-bottom: 15px;
}
</style>
