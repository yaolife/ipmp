<!-- 流程展示多选 -->
<template>
  <div>
    <el-dialog
      v-if="visible"
      :title="this.$t('flow.show_process')"
      append-to-body
      :withHeader="false"
      :visible.sync="visible"
      :before-close="closeDialog"
      width="640px"
      :close-on-click-modal="false"
      v-dragMove="{
        DragButton: '.el-dialog__header',
        DragWindow: '.el-dialog'
      }"
      destroy-on-close
      :close-on-press-escape="false"
    >
      <el-input
        :placeholder="this.$t('cm.filterPlaceholder')"
        v-model="filterText"
      >
      </el-input>
      <el-tree
        ref="checkboxShowFlowTree"
        :data="processData"
        show-checkbox
        default-expand-all
        node-key="id"
        :props="defaultProps"
        :default-checked-keys="checkedPressList"
        highlight-current
        :filter-node-method="filterNode"
      >
      </el-tree>
      <div slot="footer" class="dialog-footer" align="center">
        <el-button @click="closeDialog" size="small">{{
          $t("cm.cancel")
        }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import api from "./api";

export default {
  name: "wf-checkbox-show",
  props: {
    showFlag: { type: Boolean, default: false },
    //默认选中的数据
    checkedPressList: {
      type: Array,
      default: () => {
        return [];
      }
    },
    //默认流程数据，没传后台查询全部
    initData: {
      type: Array,
      default: () => {
        return [];
      }
    }
  },
  data() {
    return {
      checkAllData: [],
      visible: false,
      filterText: "",
      processData: [],
      defaultProps: {
        children: "children",
        label: "label"
      }
    };
  },
  watch: {
    filterText(val) {
      immediate: true, this.$refs.checkboxShowFlowTree.filter(val);
    },
    // 观察父级组件的showFlag，并将showFlag的最新值设置给dialogVisible
    showFlag(newVal, oldVal) {
      this.visible = newVal;
    },
    checkedPressList(val) {
      //选中全部流程
      if (val != null && val.length == 1 && val[0] == "****") {
        let _this = this;
        _this.$nextTick(() => {
          this.$refs.checkboxShowFlowTree.setCheckedKeys(this.checkAllData);
        });
      }
    }
  },
  mounted() {
    if (this.initData === undefined || this.initData.length <= 0) {
      //父组件没传值就取默认值
      this.getAllCanSeeProcess();
    } else {
      this.processData = JSON.parse(JSON.stringify(this.initData));
      this.disabledCheck(this.processData);
    }
  },
  computed: {},
  methods: {
    closeDialog() {
      this.$refs.checkboxShowFlowTree.setCheckedKeys([]);
      let timer = setTimeout(() => {
        clearTimeout(timer);
        this.$emit("closeChildDialog");
      }, 100);
    },
    getAllCanSeeProcess: function() {
      let params = {};
      let _this = this;
      api.getAllCanSeeProcessAPI(params).then(res => {
        if (res.code === "0") {
          this.disabledCheck(res.data);
          _this.processData = res.data;
        } else {
        }
      });
    },
    //搜索
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    //禁止选择
    disabledCheck(data) {
      for (let i = 0; i < data.length; i++) {
        let children = data[i].children;
        if (children != undefined && children != [] && children.length > 0) {
          this.disabledCheck(children);
        }
        data[i].disabled = true;
        this.checkAllData.push(data[i].id);
      }
    }
  },
  destroyed() {}
};
</script>

<style scoped></style>
