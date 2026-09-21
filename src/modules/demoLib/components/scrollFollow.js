
const setFollow = (instance) => {
  //设置滚动跟随
  instance.scrollFunc = (event) => {
    let block = document.getElementsByClassName('block');
    if (!block || block.length < 1) return;
    //有多个block，需要遍历一下
    for(let index = 0; index < block.length; index ++) {
      let item = block[index];
      let content = item.getElementsByClassName('meta')[0]; //内容块
      let control = item.getElementsByClassName('demo-block-control')[0]; //要跟随的块
      if (!content) {
        if (control) control.className = control.className.replace(' is-fixed', '');
        continue; //没有找到内容或被隐藏，查找下一个
      }
      let target = event ? event.target : document.getElementsByClassName('el-scrollbar__wrap')[0];
      let currentTop = target.scrollTop + target.clientHeight;
      let contentTop = content.offsetTop + content.offsetHeight;
      //当页面滚动到内容区的起始位置offsetTop，且不超过内容区的offsetHeight
      //让跟随块定位到屏幕底部
      if (target.scrollTop > 0 && currentTop > content.offsetTop && currentTop < contentTop) {
        if (control.className.indexOf(' is-fixed') == -1) control.className += ' is-fixed';
      } else {
        control.className = control.className.replace(' is-fixed', '');
      }
    }
  }
  //给滚动区域设置滚动事件
  let wrap = document.getElementsByClassName('el-scrollbar__wrap')[0];
  wrap.addEventListener('scroll', instance.scrollFunc);
  //初始化时先执行一次
  instance.scrollFunc();
}

const unsetFollow = (instance) => {
  let wrap = document.getElementsByClassName('el-scrollbar__wrap')[0];
  wrap.removeEventListener('scroll', instance.scrollFunc);
}

export { setFollow, unsetFollow }
