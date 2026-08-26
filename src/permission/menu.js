/*
 * @Author: [P631038]杨旭
 * @Date: 2024-11-08 17:14:00
 * @LastEditors: [P631038]杨旭
 * @LastEditTime: 2025-04-29 14:00:04
 * @FilePath: \4.2.0-node16\cud4demo-ui\src\permission\menu.js
 * @Description: 
 */
import store from '@/store'
// 判断用户是否拥有操作权限
export function hasMenuPermission(perms) {
    // development
    if (process.env.NODE_ENV == "development") {
        return true;
    } else if (process.env.LIGHT_AUTH === 'true') { // 增加轻量级授权判断
        return true;
    } else {
        if (perms) {
            let hasPermission = false;
            // menu.json 与 uau 结合使用
            if (store.state.menu.navTree) {
                let permissions = store.state.menu.navTree;
                // 动态路由 通过uau 生成自动菜单
                // let permissions = store.state.menu.menus;
                //刷新问题
                if (permissions.length == 0) {
                    if (!sessionStorage.getItem("menus")) {
                        // permissions = JSON.parse(localStorage.getItem("menus"));
                    } else {
                        permissions = JSON.parse(sessionStorage.getItem("menus"));
                    }
                }
                if (permissions == null || permissions.length == 0) {
                    return false;
                }
                for (let i = 0; i < permissions.length; i++) {
                    if (permissions[i].menuCode === perms) {
                        hasPermission = true;
                        break;
                    }
                }
                return hasPermission;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
}
