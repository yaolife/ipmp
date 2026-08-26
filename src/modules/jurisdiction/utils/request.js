import axios from 'axios';

//console.log('process.env',process.env)

// 创建axios实例
const service = axios.create({
  baseURL: process.env.API_ROOT, // 从环境变量中获取基础URL
  timeout: 10000, // 请求超时时间
});

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 在发送请求之前可以做一些处理，例如添加token
    // const token = getToken();
    // if (token) {
    //   config.headers['Authorization'] = `Bearer ${token}`;
    // }
    return config;
  },
  error => {
    // 处理请求错误
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data;
    console.log('接口响应:', response);
    // 根据后端接口规范处理响应数据
    // 如果接口返回的状态码不是200，可以在这里统一处理错误
    if (res.code !== 200 && res.code !== 0 && response.status !== 200) {
      console.error('接口返回错误:', res.message || '未知错误');
      // 可以在这里处理特定的错误码，例如token过期等
      return Promise.reject(new Error(res.message || '未知错误'));
    } else {
      return response;
    }
  },
  error => {
    // 处理HTTP错误
    console.error('响应错误:', error);
    return Promise.reject(error);
  }
);

export default service;