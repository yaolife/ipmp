import router from "@/router";
import axios from "axios";
import { Message, Loading } from "element-ui";
// import store from "@/store";

// 存储所有请求的AbortController
const requestMap = new Map();

// 创建axios实例
const axiosInstance = axios.create({
  baseURL:envConfig.VUE_APP_BASE_API,
  timeout: 300000,
});

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    // 开启loading
    config.loading = Loading.service({
      lock: true,
      text: "加载中...",
      spinner: "el-icon-loading",
      background: "rgba(0,0,0,0.7)",
    });

    // 为每个请求创建AbortController
    const controller = new AbortController();
    config.signal = controller.signal;

    // 存储请求控制器
    const requestKey = `${config.method}-${config.url}`;
    requestMap.set(requestKey, controller);

    // 添加token
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("请求错误", error);
    return Promise.reject(error);
  }
);

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response) => {
    // 关闭 Loading
    if (response.config.loading) {
      response.config.loading.close();
    }
    // 处理状态码
    const status = response.status;
    if (status >= 200 && status < 300) {
      return response.data;
    } else if (status === 401) {
      return Promise.reject({ status: 401 });
    } else {
      return Promise.reject(new Error("请求失败"));
    }
  },
  (error) => {
    // 响应错误处理
    console.log("响应错误", error);
    // 关闭 Loading
    if (error.config && error.config.loading) {
      error.config.loading.close();
    }
    // 统一处理错误
    const { response } = error;
    if (response) {
      const { status } = response;
      if (status === 400) {
        Message.error("请求参数错误");
      } else if (status === 401) {
        Message.error("请先登录");
        router.push("/login");
      } else if (status === 404) {
        Message.error("资源没找到");
      } else if (status === 500) {
        Message.error("服务器内部错误");
      } else if (status === 504) {
        Message.error("网关超时");
      } else {
        Message.error("请求失败,请稍后重试");
      }
    } else {
      // 超时或网络问题
      if (error.message.includes("timeout")) {
        Message.error("请求失败,请检查网络");
      } else {
        Message.error("网络连接错误");
      }
    }
    return Promise.reject(error);
  }
);

// 直接导出各个请求方法
export function get(url, params = {}, config = {}) {
  return axiosInstance.get(url, { ...config, params });
}

export function post(url, data = {}, config = {}) {
  return axiosInstance.post(url, data, config);
}

export function put(url, data = {}, config = {}) {
  return axiosInstance.put(url, data, config);
}

export function del(url, config = {}) {
  return axiosInstance.delete(url, config);
}

// 保留原有http对象导出方式以保持兼容
export const http = {
  get,
  post,
  put,
  delete: del,
  cancelRequest,
  cancelAllRequests,
};

/**
 * 取消特定请求
 * @param {string} url - 请求URL
 * @param {string} method - 请求方法(GET/POST等)
 */
export function cancelRequest(url, method = "GET") {
  const requestKey = `${method.toUpperCase()}-${url}`;
  const controller = requestMap.get(requestKey);
  if (controller) {
    controller.abort();
    requestMap.delete(requestKey);
  }
}

/**
 * 取消所有待处理请求
 */
export function cancelAllRequests() {
  requestMap.forEach((controller) => {
    controller.abort();
  });
  requestMap.clear();
}

export default axiosInstance;

/**
 * REACT_APP_BASE_API 配置说明：
 * 1. 在项目根目录下的.env文件中添加：
 *    REACT_APP_BASE_API=http://your-api-server.com/api
 *
 * 2. 或在启动命令前设置：
 *    REACT_APP_BASE_API=http://your-api-server.com/api npm start
 *
 * 3. Create React App会自动加载以REACT_APP_开头的环境变量
 *
 * 4. 开发环境配置在.env.development
 *    生产环境配置在.env.production
 */