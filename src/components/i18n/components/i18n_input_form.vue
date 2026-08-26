<!-- 动态多语言录入表单组件-->
<template>
  <el-form class="cud__mlr-20 cud__mtb-20" label-suffix="：" label-position="top">
    <el-row>
      <el-col :span="12">
        <el-form-item label="key" label-width="100px">
          <el-input v-model="_formData.itemKey" size="small" class="i18n-form-key" :disabled="readonly">
          </el-input>
        </el-form-item>
      </el-col>
      <el-col :span="12" v-for="(lang) in languages" :key="lang.code">
        <el-form-item :label="$t($i18nn(lang.name))" label-width="100px">
          <el-input size="small"
                    v-model="_formData[lang.code]" :disabled="_disabled"></el-input>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<script>
import {mapState} from "vuex";
import {sync} from "@/mixins/valueMixin";

export default {
  name: "i18n_input_form",
  mixins: [sync("formData", "_formData"),sync("disabled","_disabled")],
  props: {
    isGroup: {
      type: Boolean,
      default: true
    }
  },
  data: () => ({
    modules: [
      'system',
      'processForm',
      'function',
      'rule',
    ]
  }),
  methods: {
    reset() {
      this._formData = {
        i18nItemKey: null,
      }
    },
  },
  computed: {
    ...mapState({languages: state => state.i18n.languages}),
    readonly() {
      return !!this._formData && !!this._formData.itemId
    },
  },
  created() {
    if (!this.formData || !this.formData.itemKey)
      this.reset()
  },
}
</script>

<style scoped lang="less">
.i18n-form-key /deep/ {
  .el-input-group__prepend {
    background-color: #ffffff !important;
    padding: 0 10px !important;
  }
}
</style>
