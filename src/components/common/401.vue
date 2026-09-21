<template>
  <div>
    <div class="brand">
      <breadcrumb :arrayName="brand"  :hasIcon="false"></breadcrumb>
    </div>
    <div class="container container-top" :style="{ height: maxTableHeight + 'px' }">
      <div class="info">
        <img src="/static/img/401.png" style="vertical-align: middle;"  />
        <p class="font1">没有访问权限，请联系管理员添加！</p>
      </div>
    </div>
  </div>
</template>

<script>
  import  breadcrumb from './breadcrumb';
  import {throttle} from '@/utils/funcUtil';
  import { calcHeight } from "@/utils/funcUtil";

  export default {
    components:{
      breadcrumb
    },
    data(){
      return {
        brand:[
          {name: '401页面'}
        ],
        maxTableHeight: 0,
      }
    },
    mounted() {
      this.initMaxHeight();
      // throttleFunc记录当前的节流方法，用于在页面销毁时释放
      this.throttleFunc = throttle(this.initMaxHeight, 500);
      window.addEventListener("resize", this.throttleFunc);
    },
    beforeDestroy(){
      window.removeEventListener('resize', this.throttleFunc);
    },
    methods: {
      // 计算列表高度
      initMaxHeight(){
        calcHeight(this, -20);
      },
    }
  }
</script>

<style>
.container-top {
  margin-top: 0;
  background-color: #fff;
  height: calc(100% - 80px);
}
.info {
  width: 260px;
  margin: 0 auto;
  padding-top: 200px;
}
.font1 {
  padding-top: 20px;
  text-align: center;
  font-size: 14px;
  color: #666;
}
</style>
