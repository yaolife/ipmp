export default {
  inserted(el, binding) {
    const scrollElement = el.querySelector('.el-select-dropdown .el-select-dropdown__wrap');
    //未找到 el-select 的下拉列表元素
    if (!scrollElement) {
      return;
    }

    const callback = binding.value;
    //绑定函数
    if (typeof callback !== 'function') {
      return;
    }

    let debounceTimer = null;
    const debounceDelay = 100; // 防抖延迟时间
    
    scrollElement.addEventListener('scroll', function handleScroll() {
      clearTimeout(debounceTimer);
      
      debounceTimer = setTimeout(() => {
        const { scrollTop, scrollHeight, clientHeight } = this;
        const distance = binding.arg || 50;
        
        if (scrollHeight - (scrollTop + clientHeight) <= distance) {
          callback();
        }
      }, debounceDelay);
    });
  }
};