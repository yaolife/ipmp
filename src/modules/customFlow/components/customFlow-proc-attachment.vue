<template>
  <div class="proc-attachment" v-if="display && this.tabValue ? true : false">
    <el-tabs type="card" @tab-click="handleClick" :value="this.tabValue">
      <el-tab-pane
        v-for="item in typeAndNum"
        :key="item.label"
        :label="item.label"
        :name="item.label"
      >
        <el-row>
          <el-col :span="24" class="add_tip_textarea">
            <!--上传的文件列表-->
            <!-- :showDownLoad="enableDownLoad" -->
            <download
              ref="download"
              style="width: 100%"
              @delData="delFiles"
              :showUpload="true"
              :showDel="enableDel"
              :showProcDel="enableProcDel"
              :disabled="detail"
              :datalist="fileListShow"
              :props="fileProps"
              :readonly="readonly"
              :tableIndex="tableIndex"
              :batchEnableDel="batchEnableDel"
            ></download>
            <!-- :showDownLoad="enableDownLoad" -->
          </el-col>
        </el-row>
        <el-row type="flex" justify="end">
          <el-col :offset="22" :span="2" align="right">
            <el-button
              v-if="enableDel && fileListDownLoad.length > 0 && batchEnableDel"
              :disabled="readonly"
              size="small"
              type="warning"
              @click="delSelected"
            >
              批量删除
            </el-button>
            <el-upload
              :headers="headersOptions"
              v-if="enableAdd && !readonly"
              :show-file-list="false"
              :action="fileUploadUrl"
              :accept="fileTypes"
              :before-upload="beforeUpload"
              :on-success="upfileBack"
              :with-credentials="true"
              :disabled="detail"
              :multiple="true"
              :on-exceed="handleOverSize"
              style="display: inline"
            >
              <div style="position: absolute; left: 0px; bottom: 0px">
                {{ `只能上传${fileTypes}文件，且不超过${fileSize}KB` }}
              </div>
              <el-button
                v-if="!readonly && uploadShow"
                class="btn-second"
                size="small"
                style="margin-top: 10px; margin-left: 36px"
              >
                <i class="el-icon-upload"></i>{{ $t("cm.upload") }}
              </el-button>
            </el-upload>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>
  </div>
  <div v-else-if="display && !this.tabValue ? true : false" v-loading="loading">
    <el-row>
      <el-col :span="24" class="add_tip_textarea">
        <!--上传的文件列表-->
        <!-- :showDownLoad="enableDownLoad" -->
        <download
          ref="download"
          style="width: 100%"
          @delData="delFilesOnly"
          :showUpload="true"
          :showDel="enableDel"
          :showProcDel="enableProcDel"
          :disabled="detail"
          :datalist="fileListDownLoad"
          :props="fileProps"
          :readonly="readonly"
          :tableIndex="tableIndex"
        ></download>
        <!-- :showDownLoad="enableDownLoad" -->
      </el-col>
    </el-row>
    <el-row type="flex" justify="end">
      <el-col align="right">
        <!-- v-if="enableAdd && !readonly" -->
        <el-button
          v-if="enableDel && fileListDownLoad.length > 0 && batchEnableDel"
          :disabled="readonly"
          size="small"
          type="warning"
          @click="delSelected"
        >
          批量删除
        </el-button>
        <el-upload
          v-if="enableAdd"
          :headers="headersOptions"
          :show-file-list="false"
          :action="fileUploadUrl"
          :accept="fileTypes"
          :before-upload="beforeUpload"
          :on-success="upfileBack"
          :with-credentials="true"
          :disabled="readonly"
          :multiple="this.limit ? false : true"
          :on-exceed="handleOverSize"
          style="display: inline"
        >
          <!-- v-if="!readonly && uploadShow" -->
          <div style="position: absolute; left:15.5px; bottom: 0px">
            {{ typeTips || `只能上传${fileTypes}文件，且不超过${fileSize}KB` }}
          </div>
          <el-button
            type="primary"
            size="small"
            :disabled="readonly"
            v-if="uploadShow"
            style="margin-top: 10px; margin-right: 0"
          >
            <i class="el-icon-upload"></i>{{ $t("cm.upload") }}
          </el-button>
        </el-upload>
      </el-col>
    </el-row>
    <div
      class="el-form-item__error"
      v-if="fileListDownLoad.length === 0 && required"
    >
      {{ rulesMsg }}
    </div>
  </div>
</template>

<script>
import download from "./download";
import { getHeadersOptions } from "@/utils/funcUtil.js";

export default {
  name: "ProcAttachment",
  components: {
    download
  },
  props: {
    detail: { type: Boolean, default: false },
    prop: { type: String, default: null },
    typeTips: { type: String, default: null },
    // labelWidth: { type: Number, default: 0 },
    readonly: { type: Boolean, default: false },
    // 是否能上传
    enableAdd: { type: Boolean, default: true },
    // 是否能删除
    enableDel: { type: Boolean, default: true },
    // 批量删除
    batchEnableDel: { type: Boolean, default: true },
    // 是否能下载
    // enableDownLoad: { type: String },
    // 仅本环节可删除
    enableProcDel: { type: String, default: "" },
    disabled: { type: Boolean, default: false },
    display: { type: Boolean, default: true },
    tableIndex: { type: Boolean, default: false },
    //加载文件列表
    attachmentList: {
      type: Array,
      default: () => {
        return [];
      }
    },
    //加载节点名称
    procActName: { type: String, default: null },
    //类型和数量
    proAttachmentVOS: {
      type: Array,
      default: () => {
        return [];
      }
    },
    value: {
      type: [Array, String],
      default: () => {
        return [];
      }
    },
    limit: {
      type: String,
      default: ""
    },
    fileTypes: {
      type: String,
      default: ""
    },
    fileSize: {
      type: String,
      default: "1024"
    }
  },
  watch: {
    "$store.state.form.rulesMsg": {
      handler(n) {
        this.rulesMsg = n;
      },
      deep: true,
      immediate: true
    },
    "$store.state.form.required": {
      handler(n) {
        this.required = n;
      },
      deep: true,
      immediate: true
    },
    value: {
      handler(n, o) {
        console.log(n, "==========================");
        this.fileListDownLoad = n;
        // this.$emit("input", this.fileListDownLoad);
        this.fileListShow = this.fileListDownLoad.filter(
          file => file.fileType === this.showTabName
        );
      },
      deep: true,
      immediate: true
    },
    fileListDownLoad: {
      handler(n, o) {
        this.fileListShow = this.fileListDownLoad.filter(
          file => file.fileType === this.showTabName
        );
        this.upfileList = this.fileList.filter(
          file => file.fileType === this.showTabName
        );
        if (this.typeAndNum != null && this.typeAndNum.length > 0) {
          if (
            this.uploadNumber != null &&
            this.uploadNumber != "" &&
            this.uploadNumber != 0
          ) {
            if (
              this.upfileList.length != 0 &&
              this.uploadNumber != this.fileListShow.length
            ) {
              // this.$message({
              //   type: "error",
              //   message: "上传文件个数应该为" + this.uploadNumber + "个"
              // });
              this.uploadShow = true;
            } else if (this.upfileList.length != 0) {
              this.$message({
                type: "success",
                message: "上传文件个数符合要求"
              });
              this.uploadShow = false;
            }
          }
        }
      },
      deep: true,
      immediate: true
    }
  },
  data() {
    return {
      customStyle: "",
      fileListDownLoad: [],
      fileListShow: [],
      fileList: [],
      upfileList: [],
      fileUploadUrl: envConfig.API_ROOT + "/procAttachment/upfile",
      fileProps: [
        //文件上传的属性
        { prop: "node", label: "cudComponents.node" },
        { prop: "fileRealName", label: "cudComponents.file_real_name" },
        {
          prop: "fileRealSize",
          label: "cudComponents.file_real_size",
          width: "150"
        },
        {
          prop: "createUser",
          label: "cudComponents.upload_user",
          width: "150"
        },
        {
          prop: "createTime",
          label: "cudComponents.upload_time",
          width: "150"
        }
      ],
      //返回的类型集合
      typeAndNum: this.proAttachmentVOS,
      //点击上传时获取当前的类型
      showTabName: "",
      //显示上传
      showUpload: true,
      //上传文件的数量
      uploadNumber: null,
      //上传文件的数量相关的集合
      uploadNumberList: this.proAttachmentVOS,
      //显示上传按钮
      uploadShow: true,
      //默认tab的值
      tabValue: "",
      loading: false,
      headersOptions: getHeadersOptions(),
      comDisabled: false,
      rulesMsg: "",
      required: false
    };
  },

  mounted() {
    if (this.typeAndNum != null && this.typeAndNum.length > 0) {
      this.tabValue = this.typeAndNum[0].label;
      this.handleClick({ name: this.typeAndNum[0].label });
    }
    if (this.attachmentList) {
      let attList = [];
      this.attachmentList.forEach(item => {
        if (item.componentFlag.includes("pro_att")) {
          attList.push(item);
        }
      });
      this.fileListDownLoad = attList;
    }
    // let timer = setTimeout(() => {
    //   this.comDisabled = JSON.parse(JSON.stringify(this.detail));
    //   clearTimeout(timer);
    // }, 500);
  },

  methods: {
    //上传文件时的回调
    upfileBack: function(response, file, fileList) {
      this.loading = false;
      if ("" == response) {
        this.$message({
          type: "error",
          message: "此文件类型不符合要求，上传文件失败"
        });
        return;
      } else if (response.code == 1) {
        this.$message({ type: "error", message: response.msg });
        return;
      }
      let uploadFile = {
        node: this.procActName,
        fileId: response.data.fileId,
        fileRealName: response.data.fileName,
        fileRealSize: (response.data.fileSize / 1024).toFixed(2) + " KB",
        createUser: response.data.uploadUserName,
        createTime: this.formatDate(),
        fileType: this.showTabName,
        fileSizeValue: response.data.fileSize,
        componentFlag: this.prop
      };
      this.fileList.push(uploadFile);
      this.fileListDownLoad.push(uploadFile);
      this.$emit("input", this.fileListDownLoad);
    },
    //删除文件

    delFiles: function(row) {
      let _this = this;
      if (null != row.fileId || undefined != row.fileId) {
        _this.fileListDownLoad.splice(
          _this.fileListDownLoad.findIndex(item => item.fileId === row.fileId),
          1
        );
      } else {
        _this.fileListDownLoad.splice(
          _this.fileListDownLoad.findIndex(
            item => item.fileRealName === row.name
          ),
          1
        );
      }
      this.$emit("input", this.fileListDownLoad);
    },

    //当只有一种类型时的删除
    delFilesOnly: function(row) {
      let _this = this;
      _this.fileListDownLoad.splice(
        _this.fileListDownLoad.findIndex(item => item.fileId === row.fileId),
        1
      );
    },
    // 获取当前日期时间
    formatDate: function() {
      var formatChangeDate = "YYYY-MM-DD HH:mm:ss";
      let date = new Date();
      // 年
      formatChangeDate = formatChangeDate.replace(/YYYY/, date.getFullYear());
      // 月
      let month = date.getMonth() + 1;
      let monthStr = month < 10 ? "0" + month : month;
      formatChangeDate = formatChangeDate.replace(/MM/, monthStr);
      // 日
      let day = date.getDate();
      let dayStr = day < 10 ? "0" + day : day;
      formatChangeDate = formatChangeDate.replace(/DD/, dayStr);
      // 时
      let hour = date.getHours();
      let hourStr = hour < 10 ? "0" + hour : hour;
      formatChangeDate = formatChangeDate.replace(/HH/, hourStr);
      // 分
      let minute = date.getMinutes();
      let minuteStr = minute < 10 ? "0" + minute : minute;
      formatChangeDate = formatChangeDate.replace(/mm/, minuteStr);
      // 秒
      let second = date.getSeconds();
      let secondStr = second < 10 ? "0" + second : second;
      formatChangeDate = formatChangeDate.replace(/ss/, secondStr);
      return formatChangeDate;
    },
    handleClick(tab) {
      this.fileListShow = this.fileListDownLoad.filter(
        file => file.fileType === tab.name
      );
      this.upfileList = this.fileList.filter(
        file => file.fileType === tab.name
      );
      this.showTabName = tab.name;
      for (let uploadNum of this.uploadNumberList) {
        if (uploadNum.label == tab.name) {
          this.uploadNumber = uploadNum.value;
        }
      }
      if (
        this.uploadNumber != null &&
        this.uploadNumber != "" &&
        this.uploadNumber != 0
      ) {
        if (this.uploadNumber != this.fileListShow.length) {
          this.uploadShow = true;
        } else {
          this.uploadShow = false;
        }
      }
    },
    beforeUpload(file) {
      let fileExt = file.name.replace(/.+\./, "");
      let fileSize = file.size / 1024;
      if (
        this.fileTypes &&
        this.fileTypes.indexOf(fileExt.toLowerCase()) === -1
      ) {
        this.$message({
          type: "warning",
          message: "请上传后缀名为" + this.fileTypes + "的文件"
        });
        return false;
      } else if (this.fileSize && fileSize >= this.fileSize) {
        this.$message({
          type: "warning",
          message: "上传的文件大小不得大于" + this.fileSize + "KB"
        });
        return false;
      } else if (this.limit && this.fileListDownLoad.length >= this.limit) {
        this.$message({
          type: "warning",
          message: "上传的文件数量超过" + this.limit
        });
        return false;
      }
      this.loading = true;
      return true;
    },
    // 删除所选
    delSelected() {
      this.$refs.download.delSelected();
    },
    // 超过数量限制
    handleOverSize() {
      this.$message({
        type: "warning",
        message: "上传的文件数量超过限制"
      });
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.add_tip_textarea .el-form-item div {
  margin-bottom: 18px !important;
}
</style>
