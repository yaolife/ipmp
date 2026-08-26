export const codeList1 = `
使用示例

    选部门组件( 多选 ):<dept-select style='width: 280px' v-model='userInfo3'  />
    选部门组件( 中台 ):<dept-select-aep style='width: 280px' v-model='userInfo4'  />

    如何回显:
    * 需要在方法里使用$set赋值才能回显.
    
    选部门组件( 多选 ):
    {
     deptName:'部门编码;部门编码-部门名称;部门名称'
     deptNo:'部门编码;部门编码'
    }

    选部门组件( 中台 ):
    {
        deptName:'部门名称'
        deptNo:'部门编码'
    }
    
    属性: multiple 是否多选,placeholder占位符,detail只读,display是否显示
    
    事件: change 选中值发生变化时触发
`
