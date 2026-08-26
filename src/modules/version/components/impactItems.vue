<template>
  <div>
    <el-dialog
      title="编辑影响条目"
      :visible.sync="visible"
      :show-close="true"
      width="50%"
      :modal="true"
    >
      <div class="header">
        <span>影响条目</span>
        <el-button
            type="primary"
            size="mini"
            icon="el-icon-plus"
            @click="handleAdd"
         
          ></el-button>
        <!-- <div >
          <span
            class="cud3-icon-blue font_family icon-icon_common_add"
            title="新增"
          ></span>
        </div> -->
      </div>
      <div class="content">
        <el-form
          :ref="`editForm${index}`"
          class="impactItemsForm"
          v-for="(item, index) in formDataArr"
          :key="index"
          size="small"
          :model="formDataArr[index]"
          :rules="formRules"
          label-width="140px"
        >
          <el-form-item label="影响类型" prop="influenceType">
            <el-select v-model="item.influenceType" clearable>
              <el-option
                v-for="item in impactTypeList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="对应升级操作" prop="operation">
            <el-input
              v-model="item.operation"
              placeholder="请输入对应升级操作"
              size="small"
              type="textarea"
              :rows="4"
            ></el-input>
          </el-form-item>
          <el-form-item label="影响调整说明" prop="influenceItem">
            <el-input
              v-model="item.influenceItem"
              placeholder="请输入影响调整说明"
              size="small"
              type="textarea"
              :rows="3"
            ></el-input>
          </el-form-item>
          <!-- 预估涉及代码量 -->
          <el-form-item label="预估涉及代码量" prop="codeNumber">
            <el-input-number
              v-model="item.codeNumber"
              :min="0"
              :step="1"
              clearable
              :parser="parseInt"
              controls-position="right"
              style="width: 100%"
            ></el-input-number>
          </el-form-item>
          <i
            class="el-icon-delete-solid delete"
            @click.stop="delClick(index)"
          ></i>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer" align="center">
        <el-button size="small" @click="visible = false">
          {{ $t("cm.cancel") }}
        </el-button>
        <el-button
          size="small"
          type="primary"
          @click="handleConfirm"
          :loading="loading"
        >
          {{ $t("cm.confirm") }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import api from "../api";

export default {
  name: "addEngineering",
  data() {
    return {
      formDataArr: [],
      loading: false,
      visible: false,
      oldVersion: "",
      resultArr: [],
      formRules: {
        influenceType: {
          required: true,
          message: "影响类型不能为空",
          trigger: "blur"
        },
        codeNumber: {
          required: true,
          message: "预估涉及代码量不能为空",
          trigger: "change"
        },
        influenceItem: {
          required: true,
          message: "影响调整说明不能为空",
          trigger: "change"
        },
        operation: {
          required: true,
          message: "对应升级操作不能为空",
          trigger: "change"
        }
      }
    };
  },
  watch: {
    visible(val) {
      if (!val) {
        this.formDataArr = [];
      }
    },
    detailObj(val) {
      if (val) {
        this.formData = { ...val };
        this.getItems();
      }
    }
  },
  props: {
    title: { type: String, default: "" },
    detailObj: { type: Object, default: null },
    impactTypeList: { type: Array, default: [] }
  },
  methods: {
    //添加条目
    handleAdd() {
      let obj = {
        influenceItem: "",
        influenceType: "",
        operation: "",
        codeNumber: 0
      };
      this.formDataArr.push(obj);
    },
    //删除条目
    delClick(index) {
      this.formDataArr.splice(index, 1);
    },
    formRulesValidate(fName) {
      const result = new Promise(resolve => {
        this.$refs[fName][0].validate(valid => {
          if (valid) {
            resolve(valid);
          } else {
            reject();
          }
        });
      });
      this.resultArr.push(result);
    },
    submit() {
      let _this = this;
      _this.loading = true;
      let params = [...this.formDataArr];
      params.forEach(item => {
        item.adjustId = this.detailObj.id;
      });
      api
        .createUpdateItem(params)
        .then(result => {
          if (result.data.code !== "1") {
            this.$message({
              message: result.data.message || '成功',
              type: "success"
            });
            this.visible = false;
            this.$emit("handleConfirm");
            _this.loading = false;
          } else {
            _this.$message({
              message: result.data.msg || '失败',
              type: "warning"
            });
            this.loading = false;
          }
        })
        .catch(err => {
          this.loading = false;
          _this.$message({
            message: err,
            type: "warning"
          });
        });
    },
    handleConfirm() {
      let _this = this;
      this.resultArr = [];
      this.formDataArr.forEach((item, index) => {
        this.formRulesValidate(`editForm${index}`);
      });
      Promise.all(this.resultArr)
        .then(() => {
          this.submit();
        })
        .catch(() => {
          this.$message.error("请完善信息！");
        });
    },
    getItems() {
      let _this = this;
      let params = {
        adjustId: this.detailObj.id
      };
      api
        .getItems(params)
        .then(result => {
          if (result.data.code !== "1") {
            this.formDataArr = result.data.data;
          }
        })
        .catch(err => {
          _this.$message({
            message: err,
            type: "warning"
          });
        });
    }
  }
};
</script>
<style lang="less" scoped>
/deep/ .el-dialog__body {
  max-height: 550px;
  overflow: hidden;
}
/deep/ .el-button--mini {
  padding: 3px 9px;
}
.content {
  max-height: 500px;
  overflow-y: scroll;
}
.header {
  height: 30px;
  line-height: 30px;
  display: flex;
  span {
    margin-right: 10px;
  }
  div {
    cursor: pointer;
    width: 50px;
    height: 30px;
    text-align: center;
    border: 1px solid;
    border-radius: 4px;
    line-height: 30px;
    margin-left: 10px;
  }
}
.impactItemsForm {
  position: relative;
  border: 1px solid;
  padding: 10px;
  padding-right: 40px;
  margin-top: 10px;
}
.delete {
  color: #f56c6c;
  cursor: pointer;
  position: absolute;
  right: 20px;
  top: 50%;
}
</style>
