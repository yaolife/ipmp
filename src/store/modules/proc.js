// 流程相关信息 存储
export default {
    state: {
        procName: "",//流程名称
        procFullName:"BMWS\\TestProcess",//流程全名
        procId:'',//流程版本ID
        procSetId:'',//流程集ID
    },
    getters: {

    },
    mutations: {
        procName(state,procName){  // 设置流程名称
            state.procName = procName;
        },
        procFullName(state,procFullName){  // 设置流程全名
            state.procFullName = procFullName;
        },
        procId(state,procId){  // 设置流程全名
            state.procId = procId;
        },
        procSetId(state,procSetId){  // 设置流程全名
            state.procSetId = procSetId;
        },
    },
    actions: {

    }
}