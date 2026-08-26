export default {
    state: {
        collapse: false,//导航栏收缩状态 true关闭 false打开
        width: true,
        hasMenuPerm: false,//判断用户是否已经有菜单权限
        hasBtnPerm: false,
        searchHeight: 0
    },
    getters: {

    },
    mutations: {
        changeCollapse(state) { //改变收缩状态
            state.collapse = !state.collapse;
        },
        changeWidth(state) {
            state.width = !state.width;
        },
        setHasMenuPerm(state) {
            state.hasMenuPerm = true;
        },
        setHasBtnPerm(state) {
            state.hasBtnPerm = true;
        }
    },
    actions: {

    }
}