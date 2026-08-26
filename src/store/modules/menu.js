/*
 * @Author: [P631038]杨旭
 * @LastEditors: [P631038]杨旭
 * @Description:
 */
export default {
    state: {
        navTree: [],//导航菜单树
        subNavTree: [],//子菜单
        menus: [],//所有菜单
        badgeCount: {
          draftCount: 0, //草稿数量
        },
    },
    getters: {

    },
    mutations: {
        setNavTree(state, navTree) {  // 设置导航菜单树
            state.navTree = navTree;
        },
        setSubNavTree(state, subNavTree) {  // 设置导航菜单树
            state.subNavTree = subNavTree;
        },
        setMenus(state, menus) { //设置所有菜单
            state.menus = menus;
        },
        //设置菜单右侧数量标记
        setBadgeCount(state, count) {
            state.badgeCount[count.name] = count.count;
        }
    },
    actions: {
    }
}
