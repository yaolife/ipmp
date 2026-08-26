
export const codeList = `
  使用示例:

      选人组件( 单选 ):<person-select style='width: 180px' v-model='userInfo1'  />
      选人组件( 多选 ):<person-select style='width: 180px' v-model='userInfo2' multiple />
      选人组件( 中台 ):<person-select-aep style='width: 180px' v-model='userInfo3'  />
      
      如何回显:
      * 需要在方法里使用$set赋值才能回显.
      
      单选:
      {
       userName:'[工号]姓名'
       userId:'工号'
      }

      多选:
      {
        userName:'[工号]姓名,[工号]姓名,[工号]姓名'
        userId:'工号,工号,工号'
      }
      
      属性: multiple 是否多选,placeholder占位符,detail只读,display是否显示
      
      事件: change 选中值发生变化时触发
`
