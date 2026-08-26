<!--固定位置的按钮组  作为组件来使用 -->
<template>
    <el-row class="fixedbtn" >
        <slot name="fixbtn"></slot>
    </el-row>
</template>


<script>
    import {mixinsComp} from '@/mixins/index' 
    export default {
       mixins:[mixinsComp],
       data() {
           return {
               mixinsCmptCode: 'fixbtn',
               mixinsCmptName: '固定位置按钮'
           }
       }
    }

</script>

<style scoped>
    .fixedbtn{
        padding-left:15px;
        padding-top:15px;
        padding-bottom:15px;
        position: fixed;
        width:100%;
        bottom:0;
        background-color:#fff;
        border: 1px solid #EBEBEB;
        box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.1);
    }
</style>