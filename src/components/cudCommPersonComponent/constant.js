export default {
    // 前台岗位或者职位定义
    // stationType: {'1': '正职', '2': '副职', '3': '部门秘书', '4': '部门助理', '5': '预算协调员', '6': '培训工程师', '7': '资产协调员', '8': '信息协调员'},
    stationType: [{'label': '正职', 'value': '1'}, {'label': '副职', 'value': '2'}, {'label': '部门秘书', 'value': '3'}, {'label': '预算协调员', 'value': '5'}],
    // 后台对象返回的岗位或者职位定义
    backStationType: {'header1':'1', 'header2':'2', 'assistantBugget':'5', 'deptSecretary':'3'},
    // 调用规则组件绑定 规则函数类型 通用规则 1  动态规则 2   逻辑规则 3
    ruleFunType: {'dynamic': 1, 'currency': 2, 'logic': 3},
}

