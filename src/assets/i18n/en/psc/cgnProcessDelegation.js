export const cgnProcessDelegation = {
  processDelegation: "Process Agent",
  validDelegation: "Active Agent ",
  invalidDelegation: "Expired Agent",
  field: {
    index: "S/N",
    procDef: "Process",
    procDefName: "Process name",
    delegateTimeRange: "Agency time period",
    startTime: "Start time",
    endTime: "End time",
    delegateDesc: "Agent description",
    delegateToUser: "Assignee",
    delegateScope: "Agency scope",
    invalidReason: "Reason for failure",
  },
  operate: {
    operate: "Operating",
    selectProcess: "Selection process",
  },
  timeTo: "to",
  delegateScope: {
    all: "All processes",
    part: "Part processes",
    selected: "Selected process"
  },
  invalidReason: {
    deleted: "Delete invalid",
    expire: "Expired",
  },
  tips: {
    createDelegateSuccess: "Added successfully!",
    updateDelegateSuccess: "Successfully modified!",
    confirmDeleteDelegate: "Are you sure to delete the process agent? ",
    deleteDelegateSuccess: "successfully deleted! ",
    timeRangeNotEmpty: "Please enter the agent time period",
    toUserNotEmpty: "Please select the assignee",
    delegateScopeNotEmpty: "Please select the scope of agency",
    delegationDetailNotEmpty: "Please select the agent process"
  }
}
