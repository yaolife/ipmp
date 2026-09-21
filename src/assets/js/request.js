import axios from 'axios';
import { Message } from 'element-ui';

// 创建axios实例
const service = axios.create({});
service.defaults.timeout = 1000000; // 请求超时时间
service.defaults.baseURL = ''; // api 的 base_url
service.defaults.crossDomain = true;
service.defaults.withCredentials = true;

// request拦截器
let requestInterceptorId = service.interceptors.request.use(
  config => {
    return config
  },
  error => {
    Promise.reject(error);
  }
);

// response 拦截器
let responseInterceptorId = service.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    Message.error(error.toString());
    return Promise.reject(error);
  }
);

export default service;

/**
 * 重置请求拦截器
 * @param newInterceptorId 新的拦截器id
 */
export const resetRequestInterceptor = function (newInterceptorId) {
  service.interceptors.request.eject(requestInterceptorId);
  requestInterceptorId = newInterceptorId;
};

/**
 * 重置响应拦截器
 * @param newInterceptorId 新的拦截器id
 */
export const resetResponseInterceptor = function (newInterceptorId) {
  service.interceptors.response.eject(responseInterceptorId);
  responseInterceptorId = newInterceptorId;
};

/**
 * 重置服务地址和token
 * @param baseUrl
 */
export const resetBaseUrl = function (baseUrl, accessToken) {
  service.defaults.baseURL = baseUrl;

  // 重置请求拦截器
  let newInterceptorId = service.interceptors.request.use(
    config => {
      config.headers["access-token"] = accessToken;
      config.headers["menuCode"] = sessionStorage.getItem("menuCode");
      return config
    },
    error => {
      Promise.reject(error);
    }
  );
  resetRequestInterceptor(newInterceptorId);
}
