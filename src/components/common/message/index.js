/*
 * @Author: P623437
 * @Date: 2021-09-08 15:22:45
 * @LastEditors: P623437
 * @LastEditTime: 2021-09-08 15:22:56
 * @Description: 错误消息通用显示配置
 */
export default {
  httpCatchErrorMessage: (that, msg) => {
    let message = (msg && msg !== '') ? msg : '网络中断！'
    that.$message({
      showClose: true,
      message: message,
      type: 'warning'
    })
  },
  httpBizWarnMessage: (that, msg) => {
    let message = (msg && msg !== '') ? msg : '未知错误联系管理员！'
    that.$message({
      showClose: true,
      message: message,
      type: 'warning'
    })
  },
  cancelMessage: (that, msg) => {
    let message = (msg && msg !== '') ? msg : '已经取消操作！'
    that.$message({
      showClose: true,
      message: message,
      type: 'warning'
    })
  }
}
