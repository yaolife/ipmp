import axios from '@/api/http';

export default{
    //查询应用
    getAppList(params) {
      // return axios.post("/sysappinfo/sysappinfos", params);
      return axios.get("/sysappinfo/apps", params);
    },
    //获取菜单权限
    getAppPermission(params) {
      return axios.post("/valid/queryUserFunctionTree");
    },
    //修改密码
    changePsw(params) {
      return axios.post("/login/updateUserPassword", params);
    },
}
