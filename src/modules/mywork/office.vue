<template>
  <div class="cud-commom-form-style">
    <!-- <div class="brand">
      <breadcrumb :arrayName="brand" :hasIcon="hasIcon"></breadcrumb>
    </div> -->
    <!-- <img src="@/assets/img/officebg.png" class="cud-offfice-bg"> -->
    <!-- <div class="cud-office-info">
      <div class="cud-office-user">{{$t('cgnTask.hello')}} {{user || ''}}</div>
      <div class="cud-office-time">{{nowTime || ''}}</div>
    </div> -->
    <div
      class="cud__scroll--div rs-office"
      style="margin: 10px 12px 0 -5px;"
    > 
      <cgn-task-center
        v-bind="taskCenter"
        :handle-datas="handleDatas"
      ></cgn-task-center>
    </div>
  </div>
</template>

<script>
import office from "./js/office.js";
export default office;
</script>

<style lang="less" scoped>
// .cgn-task-box {
//   overflow: hidden;
//   .cgn-task-center {
//     height: calc(100vh - 139px);
//   }
//   .cud-offfice-bg {
//     position: relative;
//     width: 100%;
//     height: 138px;
//   }
//   .cud-office-info {
//     position: relative;
//     margin-left: 50px;
//     margin-top: -112px;
//     color: #fff;
//     .cud-office-user {
//       font-size: 20px;
//       font-weight: bold;
//     }
//     .cud-office-time {
//       font-size: 14px;
//       margin-bottom: 14px;
//     }
//   }
// }
/deep/ .cud-cgn-task-center .cgn-task-tabs .el-tabs__content,
.cud-process-wrap .cgn-task-tabs .el-tabs__content,
.cud__table--list .cgn-task-tabs .el-tabs__content {
  padding: 20px 15px 0 ;
  overflow: visible; 
}
</style>
