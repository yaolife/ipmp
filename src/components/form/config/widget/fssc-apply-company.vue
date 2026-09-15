<template>
  <div>
    <!-- <el-form-item label="是否多选">
      <el-switch v-model="data.multiple"></el-switch>
    </el-form-item> -->
    <!-- <el-form-item label="所属公司" v-if="data.type === 'department'">
      <dept-select :handleCallback="true" @callback="callCompany" :value="data.company"></dept-select>
    </el-form-item>
    <el-form-item label="默认部门" v-if="data.type === 'department'">
      <dept-select :handleCallback="true" @callback="callDepartment" :value="data.department"></dept-select>
    </el-form-item> -->
    <el-form-item label="切换选择模式">
      <el-radio v-model="data.radio" label="1">模糊搜索</el-radio>
      <el-radio v-model="data.radio" label="2">分页查询</el-radio>
    </el-form-item>
    <!-- <el-form-item label="默认人员" v-if="data.type === 'personnel'">
      <person-select :handleCallback="true" @callback="callPersonnel" :value="data.person" :multiple="data.multiple"></person-select>
    </el-form-item> -->
  </div>
</template>

<script>
export default {
  name: "config-fsscApplyCompany",
  props: ["data"],
  data() {
    return {
    };
  },
  methods: {
  },
  watch: {
  },
  methods: {
  }
};
</script>
