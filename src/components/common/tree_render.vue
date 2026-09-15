<template>
  <!-- 树通用组件 是否可行-->
  <span style="flex: 1; display: flex; align-items: center; font-size: 14px; padding-right: 8px;">
    <span  style="width: 80%">
      <span>{{DATA.label}}</span>
    </span>
    <span class="span_icon">
      <el-button size="small" style="font-size: 12px;" type="text"  @click.stop="Append(STORE,DATA,NODE)">
        <i class="el-icon-plus"></i>
      </el-button>
      <el-button size="small" style="font-size: 12px;" type="text"  @click.stop="Modify(STORE,DATA,NODE)">
        <i class="el-icon-edit"></i>
      </el-button>
      <el-button size="small" style="font-size: 12px;" type="text"  @click.stop="Delete(STORE,DATA,NODE)">
        <i class="el-icon-delete"></i>
      </el-button>
    </span>
  </span>
</template>

<script>
  export default{
    name:'',
    data(){
      return {}
    },
    props:['NODE','DATA','STORE'],
    methods:{
      Append(s,d,n){
        //添加节点事件
        this.$emit('Append',s,d,n)
      },
      Delete(s,d,n){
        this.$emit('Delete',s,d,n)
      },
      WatchInfo(s,d,n){
        this.$emit('WatchInfo',s,d,n)
      },
      Modify(s,d,n){
        this.$emit('Modify',s,d,n);
      }
    }
  }
</script>

<style>

</style>
