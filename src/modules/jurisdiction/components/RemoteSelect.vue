<template>
  <el-select
    style="width: 100%;"
    v-model="currentValue"
    filterable
    reserve-keyword
    validate-event
    clearable
    :placeholder="placeholder"
    :remote-method="handleRemoteSearch"
    :loading="loading"
    :multiple="multiple"
    :disabled="disabled"
    @change="handleChange"
  >
    <el-option
      v-for="item in options"
      :key="item[valueKey]"
      :label="item[labelKey]"
      :value="item[valueKey]"
    />
  </el-select>
</template>

<script>
export default {
  props: {
    value: [String, Number],
    placeholder: String,
    api: Function, // 远程搜索接口函数
    queryKey: String, // 搜索字段名，如 'keyword'
    valueKey: {
      type: String,
      default: 'value'
    },
    labelKey: {
      type: String,
      default: 'name'
    },
    extraParams: {
      type: Object,
      default: () => ({})
    },
    onChange:Function,
    prop:String,
    multiple:{
      type:Boolean,
      default:false
    },
    disabled:{
      type:Boolean,
      default:false
    }
  },
  data() {
    return {
      currentValue: this.value,
      options: [],
      loading: false
    };
  },
  watch: {
    value(val) {
      this.currentValue = val;
    }
  },
  methods: {
    async handleRemoteSearch(query) {
      if (!this.api) return;
      this.loading = true;
      const params = {
        [this.queryKey]: query,
        ...this.extraParams
      };
      try {
        const res = await this.api(params);
        this.options = res.data.data ||res.data.records|| [];
      } finally {
        this.loading = false;
      }
    },
    handleChange(val) {
     this.onChange && this.onChange(val);
      this.$emit('input', val);
      this.$emit('change',val);
      this.$emit('update:modelValue', val);
    }
  },
  created(){
    this.handleRemoteSearch();
  },
  mounted(){
    const select = this.$children.find(c => c.$options.name === 'ElSelect')
    if (select && this.prop) {
      select.$parent.prop = this.prop
    }
  }
};
</script>