import { Loading } from 'element-ui'

// Loading 实例管理器
class LoadingManager {
  constructor() {
    this.loadingInstances = new Map();
  }

  // 显示 loading
  show(key, options = {}) {
    // 如果已经存在相同 key 的 loading，先关闭它
    this.close(key);
    
    // 创建新的 loading 实例
    const loadingInstance = Loading.service({
      lock: true,
      text: '加载中...',
      spinner: 'el-icon-loading',
      background: 'rgba(0, 0, 0, 0.5)',
      ...options
    });
    
    // 保存实例
    this.loadingInstances.set(key, loadingInstance);
    
    return loadingInstance;
  }

  // 关闭 loading
  close(key) {
    if (this.loadingInstances.has(key)) {
      const loadingInstance = this.loadingInstances.get(key);
      loadingInstance.close();
      this.loadingInstances.delete(key);
    }
  }

  // 关闭所有 loading
  closeAll() {
    this.loadingInstances.forEach(instance => {
      instance.close();
    });
    this.loadingInstances.clear();
  }
}

// 创建单例
const loadingManager = new LoadingManager();

export default loadingManager;