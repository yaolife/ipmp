/**
 * 事件总线插件
 * 用于组件间通信，特别是用于触发图表重绘事件
 */

class EventBus {
  constructor() {
    this.events = {};
  }

  /**
   * 注册事件监听器
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   */
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  /**
   * 移除事件监听器
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   */
  off(event, callback) {
    if (!this.events[event]) return;
    
    if (callback) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    } else {
      delete this.events[event];
    }
  }

  /**
   * 触发事件
   * @param {string} event - 事件名称
   * @param {any} args - 传递给监听器的参数
   */
  emit(event, ...args) {
    if (!this.events[event]) return;
    
    this.events[event].forEach(callback => {
      callback(...args);
    });
  }
}

// 创建Vue插件
const EventBusPlugin = {
  install(Vue) {
    const bus = new EventBus();
    Vue.prototype.$bus = bus;
  }
};

export default EventBusPlugin;