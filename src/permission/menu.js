/*
 * @Author: [P631038]杨旭
 * @Date: 2024-11-08 17:14:00
 * @LastEditors: [P631038]杨旭
 * @LastEditTime: 2025-04-29 14:00:04
 * @FilePath: \4.2.0-node16\cud4demo-ui\src\permission\menu.js
 * @Description:
 */
// 判断用户是否拥有操作权限
// 当前部署无 UAU 授权服务，打包到 nginx 后一律放行本地 menu.json
export function hasMenuPermission() {
    return true;
}
