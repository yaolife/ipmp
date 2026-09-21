export const cgnProcessDelegation = {
  processDelegation: "流程代理",
  validDelegation: "已生效代理",
  invalidDelegation: "已失效代理",
  field: {
    index: "序号",
    procDef: "流程",
    procDefName: "流程名称",
    delegateTimeRange: "代理时间段",
    startTime: "开始时间",
    endTime: "结束时间",
    delegateDesc: "代理说明",
    delegateToUser: "受理人",
    delegateScope: "代理范围",
    invalidReason: "失效原因",
  },
  operate: {
    operate: "操作",
    selectProcess: "选择流程",
  },
  timeTo: "至",
  delegateScope: {
    all: "全部流程",
    part: "部分流程",
    selected: "已选择的流程"
  },
  invalidReason: {
    deleted: "删除失效",
    expire: "过期失效",
  },
  tips: {
    createDelegateSuccess: "新增流程代理成功！",
    updateDelegateSuccess: "修改流程代理成功！",
    confirmDeleteDelegate: "是否确认删除流程代理？",
    deleteDelegateSuccess: "删除流程代理成功！",
    timeRangeNotEmpty: "请输入代理时间段",
    toUserNotEmpty: "请选择受理人",
    delegateScopeNotEmpty: "请选择代理范围",
    delegationDetailNotEmpty: "请选择代理流程"
  }
}
