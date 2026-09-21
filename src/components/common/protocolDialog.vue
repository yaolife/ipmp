<template>
  <div class="dia-warp">
      <el-dialog :title="title" :visible.sync="dialogVisible" :show-close="false" :close-on-click-modal="false" :close-on-press-escape="false" width="70%" :before-close="handleClose">
        <div ref="content" class="content-warp"></div>
        <div class="dialog-footer" v-show="isShow">
            <el-checkbox class="check" v-model="selected">{{agreeTitle}}</el-checkbox>
            <el-button class="agreeBtn" :disabled="!selected" type="primary" @click="agree">{{agreeTip}}</el-button>
        </div>
      </el-dialog>
  </div>
</template>

<script>
export default {
    props:['dialogVisible','lang'],
    data(){
        return{
            selected:'',
            isShow:false
        }
    },
    computed:{
        title(){
            return this.lang==="E"?'隐私协议':'Privacy Statement'
        },
        agreeTitle(){
            return this.lang==="E"?'我已阅读以上条款':'I have read the above terms'
            
        },
        agreeTip(){
            return this.lang==="E"?'同 意':'Agree'
            
        }
    },
    watch:{
        "$attrs.contentHtml":{
            handler(val){
               this.$nextTick(()=>{
                    if(val){
                    let dom = this.$refs['content']
                    dom.innerHTML = val
                    this.isShow = true
                    }
                })
            },immediate:true
        }
    },
    methods: {
        handleClose(){
            this.$emit('closeDialog')
        },
        agree(){
            this.$emit('handleArgee')
        }
    },
}
</script>

<style lang="less" scoped>
.dia-warp{
    /deep/ .el-dialog{
        border-radius: 6px;
    }
    .content-warp{
        padding: 10px 16px;
    }
    .dialog-footer{
        border-top: 1px solid #ccc;
        text-align: center;
        .check{
            width: 100%;
            padding: 10px;
        }
        .agreeBtn{
            line-height: 10px;
        }
    }
}

</style>