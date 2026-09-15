/*
 * @Author: Yin Rui Xue P644244@gnpjvc.com.cn
 * @Date: 2025-06-24 10:09:14
 * @LastEditors: Yin Rui Xue P644244@gnpjvc.com.cn
 * @LastEditTime: 2025-07-31 18:35:49
 * @FilePath: \cud4demo-ui\src\store\modules\buriedCode.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import btnsData from "@/assets/json/btn.json";
const collector = "frontend/collector";
export default {
  state: {},
  getters: {},
  mutations: {
    commonMethod(state, payload) {}
  },
  actions: {
    callCmmonMethod({ commit }, payload) {
      let obj = {};
      if (payload.type === "WEB") {
        let props = payload.to.matched[1].props;
        if (props.default && props.default.code) {
          obj = {
            monitorCode: props.default.code,
            elapsedTime: payload.time,
            eventType: "TRIGGER",
            targetType: payload.type,
            pageUrl: payload.to.path
          };
        }
      } else if (payload.type === "BUTTON") {
        obj = {
          monitorCode: btnsData[payload.label].monitorCode,
          elapsedTime: 1,
          eventType: "TRIGGER",
          targetType: payload.type,
          pageUrl: btnsData[payload.label].pageUrl
        };
      } else if (payload.type === "EXCEPTION") {
        obj = {
          monitorCode: btnsData[payload.label].monitorCode,
          elapsedTime: 0,
          eventType: "TRIGGER",
          targetType: payload.type,
          errorMessage: payload.errorMessage,
          pageUrl: btnsData[payload.label].pageUrl
        };
      }
      //按钮 BUTTON elapsedTime:默认1
      if (obj.monitorCode) {
        const http = require("@/api/http").default || require("@/api/http");
        http.post(collector, obj).then(res => {});
        console.log("埋码公用方法", obj);
        console.log("参数", payload);
        commit("commonMethod", payload);
      }
    }
  }
};
