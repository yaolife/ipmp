'use strict'
export default (app) => {
  app.directive('dragMove', (el, binding) => {
    //拖拽按钮
    const DragButton = el.querySelector(binding.value.DragButton)
    //头部加上可拖动cursor
    DragButton.style.cursor = 'move';
    //拖拽窗口 DragWindow
    const DragWindow = el.querySelector(binding.value.DragWindow);
    //判断当前流程是是否为IE还是谷歌等
    const sty = DragWindow.currentStyle || window.getComputedStyle(DragWindow, null)
    // 按下鼠标处理事件
    DragButton.onmousedown = (e) => {
      //鼠标按下，计算当前元素距离可视区的距离
      const disX = e.clientX - DragButton.offsetLeft
      const disY = e.clientY - DragButton.offsetTop
      let styL, styT
      if (sty.left.includes('auto')) {
        styL = +document.body.clientWidth * 0.01
        styT = +document.body.clientHeight * 0.01
      } else {
        styL = +sty.left.replace(/px/g, '')
        styT = +sty.top.replace(/px/g, '')
      }
      document.onmousemove = (e) => {
        // 通过事件委托，计算移动的距离
        let left = e.clientX - disX
        let top = e.clientY - disY

        // 移动当前元素
        DragWindow.style.left = `${left + styL}px`
        DragWindow.style.top = `${top + styT}px`
      }
      document.onmouseup = () => {
        document.onmousemove = null
        document.onmouseup = null
      }
    }
  })
}



