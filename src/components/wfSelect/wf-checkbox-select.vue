<!-- 流程选择多选 -->
<template>
  <div>
    <el-row>
      <el-col :span="24">
        <el-input
          :size="size"
          :title="value"
          v-model="value"
          :disabled="true"
          :placeholder="$t('el.select.placeholder')"
          class="form-input"
        >
          <el-button
            :size="size"
            @click="show"
            slot="append"
            icon="el-icon-plus"
            style="color:#ffffff !important; background-color: #0C7BCA !important;border-radius: 0 5px 5px 0;"
          ></el-button>
        </el-input>
      </el-col>
    </el-row>
    <el-dialog
      :title="this.$t('flow.select_process')"
      append-to-body
      :withHeader="false"
      :visible.sync="visible"
      width="640px"
      :close-on-click-modal="false"
      v-dragMove="{
        DragButton: '.el-dialog__header',
        DragWindow: '.el-dialog'
      }"
      destroy-on-close
      :close-on-press-escape="false"
    >
      <el-input :placeholder="placeholder" v-model="filterText"> </el-input>
      <el-tree
        ref="checkboxFlowTree"
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
        <el-button size="small" @click="hide">{{ $t("cm.cancel") }}</el-button>
        <el-button size="small" @click="save" type="primary">{{
          $t("cm.confirm")
        }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import api from "./api";

export default {
  name: "wf-checkbox-select",
  props: {
    size: {
      type: String,
      default: "small"
    },
    initValue: {
      type: String,
      default: ""
    },
    placeholder: {
      type: String,
      default() {
        return this.$t("cm.filterPlaceholder");
      }
    },
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
      visible: false,
      value: "",
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
      immediate: true, this.$refs.checkboxFlowTree.filter(val);
    },
    initValue: {
      immediate: true,
      handler(val) {
        this.value = val;
      }
    }
  },
  mounted() {
    if (this.initData === undefined || this.initData.length <= 0) {
      //父组件没传值就取默认值
      this.getAllCanSeeProcess();
    } else {
      this.processData = JSON.parse(JSON.stringify(this.initData));
    }
  },
  computed: {},
  methods: {
    getAllCanSeeProcess: function(processData) {
      let params = {};
      let _this = this;
      api.getAllCanSeeProcessAPI(params).then(res => {
        if (res.code === "0") {
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
    //打开
    show() {
      this.visible = true;
      this.filterText = "";
    },
    //取消
    hide() {
      this.visible = false;
    },
    //确认
    save() {
      var checkedNodes = this.$refs.checkboxFlowTree.getCheckedNodes(true);
      if (checkedNodes.length <= 0) {
        // this.$alert("请至少选择一条流程！", this.$t('cm.tips'));
        this.value = ""; //页面input控件显示的名称
        this.$emit("input", ""); //父页面绑定的名称
        this.$emit("callback", []); //返回选中的数据List(id,label)
        this.hide();
      } else {
        var returnLabel = [];
        var returnId = [];
        checkedNodes.forEach(item => {
          returnLabel.push(item.label);
          returnId.push(item.id);
        });
        this.value = returnLabel.join(","); //页面input控件显示的名称
        this.$emit("input", returnId.join(",")); //父页面绑定的名称
        this.$emit("callback", checkedNodes); //返回选中的数据List(id,label)
        this.hide();
      }
    }
  },
  destroyed() {}
};
</script>

<style scoped></style>
