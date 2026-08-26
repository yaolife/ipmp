<!-- 申请公司 -->
<template>
  <div v-loading="componentsLoading">
    <el-select
      size="small"
      v-model="currentKey"
      :placeholder="placeholder"
      :disabled="disabled"
      :clearable="clearable"
      filterable
      @change="handleSelectChange"
    >
      <el-option
        v-for="item in dataList"
        :key="item.deptNo"
        :label="
          item.deptNo ? `[${item.deptNo}] ${item.deptName}` : `${item.deptName}`
        "
        :value="item.deptNo"
      >
      </el-option>
    </el-select>
  </div>
</template>


<script>
import masterAPI from "./api/index.js";
export default {
  name: "FsscApplyCompany",
  props: {
    value: {
      //申请公司Code
      type: String,
      default: "",
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    clearable: {
      type: Boolean,
      default: true,
    },
    placeholder: {
      type: String,
      default() {
        return this.$t("el.select.placeholder");
      },
    },
  },
  data() {
    /**
     * 设置向父组件传递的属性内容
     */
    const setEmit = (currentKey) => {
      this.currentKey = currentKey || "";

      //current为空则直接返回空值给父组件
      if (!currentKey) {
        this.$emit("input", "");
        this.$emit("change", {});
        return;
      }
      //根据select选中key获取对应选中value
      let currentData = this.dataList.find(
        (item) => item.deptNo === currentKey
      );
      currentData && (currentData.butxt = currentData.deptName);
      this.$emit("input", currentKey);
      this.$emit("change", {
        value: currentData,
      });
    };
    return {
      componentsLoading: false, //组件遮罩
      currentKey: this.value, //当前选中数据
      dataList: [], //数据列表
      setEmit,
    };
  },
  mounted() {
    //初始化列表数据
    this.getTableList();
  },
  methods: {
    //获取特别总账接口 获取数据
    getTableList() {
      //打开遮罩
      this.componentsLoading = true;
      //请求数据
      masterAPI
        .getApplyCompanyListAPI()
        .then((res) => {
          const { code, msg, data } = res;
          if (code === "0") {
            this.dataList = data;
            this.setEmit(this.value);
          }
        })
        .finally(() => {
          //关闭遮罩
          this.componentsLoading = false;
        });
    },
    //处理select change事件
    handleSelectChange(value) {
      //像父组件传递emit结果
      this.setEmit(value);
    },
  },
  watch: {
    value: {
      handler(newValue, oldValue) {
        //监听父组件传递过来的v-model的值，值为空则重置v-model
        if (newValue) {
          this.currentKey = newValue;
          //像父组件传递emit结果
          this.setEmit(this.currentKey);
        }
      },
    },
  },
};
</script>

