import store from "@/store";
import btnsData from "@/assets/json/btns.json"; 

//判断用户是否拥有操作权限
export function hasPermission(perms) { 
  // development
  if (process.env.NODE_ENV == "development") {
    return true;
  } else if (process.env.LIGHT_AUTH === "true") {
    // 增加轻量级授权判断
    return true;
  } else {
    if (perms) {
      let hasPermission = false;
      // menu.json 与 uau 结合使用
      if (store.state.user.perms) {
        let permissions = store.state.user.perms;
        //刷新问题
        if (permissions.length == 0) {
          try {
            permissions = JSON.parse(sessionStorage.getItem("btns")) || [];
          } catch (e) {
            permissions = [];
          }
        }
        //增加了资源编码配置文件，资源编码放在code里，业务系统修改用
        if (btnsData[perms]) {
          if (btnsData[perms]["enable"] === false) return true;
          else perms = btnsData[perms]["code"];
        }
        if (!permissions || permissions.length == 0) {
          return true;
        }
        if (permissions) {
          for (let i = 0; i < permissions.length; i++) {
            if (permissions[i] === perms) {
              hasPermission = true;
              break;
            }
          }
        } 
        return hasPermission;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }
}
