/**
 * @description 对象组件转数组
 * */

const componentObject2Array = (obj) => {
  if (Object.prototype.toString.call(obj) === '[object Object]') {
    return Object.values(obj);
  } else {
    // console.error('组件/控件配置错误!!!')
    return {};
  }
}

export {
  componentObject2Array
}
