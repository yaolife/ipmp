/*
 * @Author: Yin Rui Xue P644244@gnpjvc.com.cn
 * @Date: 2025-07-25 16:42:14
 * @LastEditors: Yin Rui Xue P644244@gnpjvc.com.cn
 * @LastEditTime: 2025-08-06 15:30:57
 * @FilePath: \cud4demo-ui\src\modules\engineering\api\index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import axios from "@/api/http";

const getPageListUrl = "project/getPageList";
const createProjectUrl = "project/create";
const updateProjectUrl = "project/update";
const deleteProjectUrl = "project/delete";

export default {
  getPageList: params => {
    return axios.post(
      getPageListUrl +
        `/${params.pageSize}/${
          params.pageIndex
        }?projectName=${params.projectName || ""}`
    );
  },
  createProject: params => {
    return axios.post(createProjectUrl, params);
  },
  updateProject: params => {
    return axios.post(updateProjectUrl, params);
  },
  deleteProject: params => {
    return axios.post(deleteProjectUrl, params);
  }
};
