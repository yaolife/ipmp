<template>
  <div>
    <div class="brand">
      <breadcrumb :arrayName="brand"  :hasIcon="false"></breadcrumb>
    </div>
    <div class="container container-top" :style="{ height: maxTableHeight + 'px' }">
      <div class="info">
        <img src="/static/img/404.png" style="vertical-align: middle;"  />
        <p class="font1">出错啦！<el-button size="small" @click="closePage">{{ $t('cm.close') }}</el-button></p>
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
          {name:'lang.nofindPage'}
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
      //关闭页面
      closePage() {
        this.closeTab();
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
