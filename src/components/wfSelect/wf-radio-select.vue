<!-- 流程选择单选 -->
<template>
  <div>
    <el-row>
      <el-col :span="24">
        <el-input
          :size="size"
          v-model="value"
          :disabled="true"
          :placeholder="$t('el.select.placeholder')"
          class="form-input"
        >
          <el-button
            :size="size"
            slot="append"
            icon="el-icon-plus"
            @click="show"
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
        ref="radioradioFlowTree"
        :data="processData"
        default-expand-all
        node-key="key"
        :props="defaultProps"
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
  name: "wf-radio-select",
  props: {
    size: {
      type: String,
      default: "small"
    },
    placeholder: {
      type: String,
      default() {
        return this.$t("cm.filterPlaceholder");
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
      processData: [],
      visible: false,
      value: "",
      filterText: "",
      defaultProps: {
        children: "children",
        label: "label"
      }
    };
  },
  watch: {
    filterText(val) {
      immediate: true, this.$refs.radioradioFlowTree.filter(val);
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
      var checkedNode = this.$refs.radioradioFlowTree.getCurrentNode();
      if (
        checkedNode == undefined ||
        checkedNode == null ||
        checkedNode.procId == null ||
        checkedNode.procId == ""
      ) {
        this.$alert(
          this.$t("cgnTask.withdrawTaskNotEmpty"),
          this.$t("cm.tips")
        );
        return;
      }

      this.value = checkedNode.label; //页面input控件显示的名称
      this.$emit("input", checkedNode.id); //父页面绑定的名称
      this.$emit("callback", checkedNode); //返回选中的数据List(key,label)
      this.hide();
    },
    clearValue(val) {
      this.value = val;
    }
  },
  destroyed() {}
};
</script>

<style lang="less" scoped>
/deep/ .el-dialog__body {
  overflow-y: scroll;
}
</style>
