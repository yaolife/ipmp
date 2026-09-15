<template>
  <div>
    <el-form ref="tableForm" :model="formData" :rules="formRules">
      msg1:
      <el-form-item prop="msg1">
        <el-input
          v-model="formData.msg1"
          size="small"
          @input="onInput"
        ></el-input>
      </el-form-item>
      msg2:
      <el-form-item prop="msg2">
        <el-input
          v-model="formData.msg2"
          size="small"
          @input="onInput"
        ></el-input>
      </el-form-item>
      msg3:
      <el-form-item prop="msg3">
        <el-input
          v-model="formData.msg3"
          size="small"
          @input="onInput"
        ></el-input>
      </el-form-item>
    </el-form>
    <div @click="onClick">表格 {{ tableData }}</div>
    <el-table
      ref="multipleTable"
      :data="tableData"
      tooltip-effect="dark"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55"> </el-table-column>
      <el-table-column label="日期" width="120">
        <template slot-scope="scope">
          <el-input
            v-model="scope.row.row1"
            placeholder="请输入内容"
            size="small"
            @input="onInput(scope.row)"
          ></el-input>
        </template>
      </el-table-column>
      <el-table-column prop="row2" label="姓名" width="120">
        <template slot-scope="scope">
          <el-input
            v-model="scope.row.row2"
            placeholder="请输入内容"
            size="small"
            @input="onInput(scope.row)"
          ></el-input>
        </template>
      </el-table-column>
      <el-table-column prop="row3" label="地址" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-input
            v-model="scope.row.row3"
            placeholder="请输入内容"
            size="small"
            @input="onInput(scope.row)"
          ></el-input>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: "CustomTable",
  props: ["value", "isShowTitle", "display", "detail", "click", "change"],
  inject: ["setCustomRule"],
  data() {
    return {
      formData: {
        msg1: "",
        msg2: "",
        msg3: "",
      },
      tableData: [],
      formRules: {
        msg1: [{ required: true, message: "输入框必填", trigger: "blur" }],
        msg2: [{ required: true, message: "输入框必填", trigger: "blur" }],
        msg3: [{ required: true, message: "输入框必填", trigger: "blur" }],
      },
      tableData: [],
      multipleSelection: [],
    };
  },
  watch: {
    // 回显数据
    value: {
      handler(n, o) {
        if (n != null && n != "" && (o == null || o == "")) {
          this.formData.msg1 = n.msg1;
          this.formData.msg2 = n.msg2;
          this.formData.msg3 = n.msg3;
          this.tableData = n.tableData;
        }
      },
      deep: true,
    },
  },
  mounted() {
    // 注册自定义校验
    if (this.setCustomRule) {
      // 如果需要TAB页签切换需要提供prop属性
      // this.setCustomRule(this.formValidate, this.prop);
    }
    // 监听只进入一次
    // const unwatch = this.$watch("value", function (val) {
    //   if (val) {
    //     this.formData.msg1 = val.msg1;
    //     this.formData.msg2 = val.msg2;
    //     this.formData.msg3 = val.msg3;
    //     this.tableData = val.tableData;
    //     unwatch();
    //   }
    // });
  },
  methods: {
    toggleSelection(rows) {
      if (rows) {
        rows.forEach((row) => {
          this.$refs.multipleTable.toggleRowSelection(row);
        });
      } else {
        this.$refs.multipleTable.clearSelection();
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    onClick() {
      if (this.click) {
        this.click("hello word");
      }
    },
    // 自定义组件校验必填
    formValidate(callback) {
      if (this.$refs["tableForm"]) {
        console.log("自定义组件校验");
        this.$refs.tableForm.validate((valid) => {
          if (!valid) {
            this.$message({
              type: "warning",
              message: "校验失败,请检查页面输入项",
            });
            callback(false);
          }
        });
      }
      callback();
    },
    onInput() {
      const data = {
        msg1: this.formData.msg1,
        msg2: this.formData.msg2,
        msg3: this.formData.msg3,
        tableData: this.tableData,
      };
      console.log("[ data ]", data);
      this.$emit("input", data);
    },
  },
};
</script>

<style>
</style>