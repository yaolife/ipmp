<template>
  <div class="main" ref="dmCom">
    <el-form ref="tableForm" :model="formData" :rules="formRules" :disabled="detail" v-if="display">
      <el-row class="bottom-border">
        <el-col :span="24" class="title">自定义组件示例（PC端界面）</el-col>
      </el-row>
      <el-row class="bottom-border">
        <el-col :span="8" class="common-center">
          输入框
        </el-col>
        <el-col :span="16" class="left-border">
          <el-form-item prop="text">
            <el-input size="small" v-model="formData.text" placeholder="请输入文本"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row class="bottom-border">
        <el-col :span="8" class="common-center">
          文本域
        </el-col>
        <el-col :span="16" class="left-border">
          <el-form-item prop="textArea">
            <el-input size="small" v-model="formData.textArea" type="textarea" rows="2" placeholder="请输入文本"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row class="bottom-border">
        <el-col :span="8" class="common-center">
          单选框
        </el-col>
        <el-col :span="16" class="left-border">
          <el-radio-group v-model="formData.select">
            <el-radio label="1">选项1</el-radio>
            <el-radio label="2">选项2</el-radio>
          </el-radio-group>
        </el-col>
      </el-row>
      <el-row class="bottom-border">
        <el-col :span="8" class="common-center">
          多选框
        </el-col>
        <el-col :span="16" class="left-border">
          <el-checkbox size="small" v-model="formData.option1">选项1</el-checkbox>
          <el-checkbox size="small" v-model="formData.option2">选项2</el-checkbox>
        </el-col>
      </el-row>
      <el-row class="bottom-border">
        <el-col :span="8" class="common-center">
          列表数据
        </el-col>
        <el-col :span="16" class="left-border">
          <p>列表映射的模型需在模型管理中勾选“列表”，列表的数据不能和非列表数据混用</p>
          <el-button size="small" @click="tableAdd">新增</el-button>
          <el-row v-for="(item,index) in formData.listData" :key="item.id">
            <el-col :span="10">
              <el-input size="small" v-model="item.name" placeHolder="键"></el-input>
            </el-col>
            <el-col :span="10">
              <el-input size="small" v-model="item.value" placeHolder="值"></el-input>
            </el-col>
            <el-col :span="4">
              <el-button type="text" size="small" @click="tableDel(index)">删除</el-button>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
      <el-row class="bottom-border">
        <el-col :span="8" class="common-center">
          提示信息
        </el-col>
        <el-col :span="16" class="left-border">
          因UI框架不同，PC端的自定义组件无法直接在移动端渲染，移动端需参考PC端自定义组件，在移动端/src/components/form/编写对应的组件代码
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>
<script>
import osUtil from "@/utils/osUtil";
export default {
  name: 'ProcessTable',
  props: ["value", "detail", "label", "display", "prop","dataModel"],
  inject: ["setCustomRule"],
  data() {
    return {
      formData: {
        text: '',
        textArea: '',
        option1: false,
        option2: false,
        select: '1',
        listData: [{
          id: '0',
          name: '',
          value: ''
        }]
      },
      formRules: {
        text: [
          { required: true, message: "输入框必填", trigger: "blur" }
        ],
        textArea: [
          { required: true, message: "文本域必填", trigger: "blur" }
        ]
      },
    };
  },
  watch: {
    value: {
      handler(n, o) {

        console.log('[ 自定义组件的值 ]-112', n)

        console.log('[ dataModel ]-114',this.dataModel)
        if (n != null && o == null) {
        // if (n != null) {
          // 绑定了文本模型
          n.option1 = (n.option1 == true || n.option1 == 'true') ? true : false;
          n.option2 = (n.option2 == true || n.option2 == 'true') ? true : false;
          Object.assign(this.formData, n);
        }
      },
      deep: true
    },
    formData: {
      handler(n, o) {
        this.$emit('input', n);
      },
      deep: true,
    },
    formRef:{
      handler(newVal){

        console.log('[ 222222222222222]-134', newVal)
      },
      deep:true
    }
  },
  computed:{
   formRef(){
    return this.$root['form'].dm
   }
  },
  mounted() {
    // 注册自定义校验
    if (this.setCustomRule) {
      // 如果需要TAB页签切换需要提供prop属性
      this.setCustomRule(this.formValidate, this.prop);
    }
    if (osUtil.getBrowserInfo().browser.indexOf("IE") === 0) {
      this.$refs.dmCom.parentNode.removeAttribute("disabled");
    }
  },
  methods: {
    // 自定义组件校验必填
    formValidate(callback) {
      if (this.$refs["tableForm"]) {
        console.log('自定义组件校验');
        this.$refs.tableForm.validate(valid => {
          if (!valid) {
            this.$message({
              type: "warning",
              message: "校验失败,请检查页面输入项"
            });
            callback(false);
          }
        });
      }
      callback();
    },
    // 表格新增
    tableAdd() {
      this.formData.listData.push({
        id: Math.random().toString(),
        name: '',
        value: '',
      });
    },
    // 表格删除
    tableDel(index) {
      this.formData.listData.splice(index, 1);
    }
  }
};
</script>
<style lang="less" scoped>
.main {
  border: 1px solid #ededed;
  background-color: #ffffff;
}
.title {
  display: flex;
  height: 100%;
  font-weight: bold;
  justify-content: center;
  align-items: center;
  background-color: #f6f6f6;
}
.left-border {
  padding-left: 15px;
  height: 100%;
  border-left: 1px solid #ededed;
}
.bottom-border {
  width: 100%;
  border-bottom: 1px solid #ededed;
}
.common-center {
  display: flex;
  height: 100%;
  justify-content: center;
  align-items: center;
}
</style>
