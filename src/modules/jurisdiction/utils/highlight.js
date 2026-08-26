import hljs from 'highlight.js'
import './highlight-theme.css'

export default {
  install(Vue) {
    Vue.directive('highlightjs', {
      inserted(el) {
        // 处理直接应用在pre标签上的情况
        let blocks;
        if (el.tagName.toLowerCase() === 'pre') {
          blocks = el.querySelectorAll('code');
          if (blocks.length === 0) {
            // 如果pre标签内没有code标签，创建一个
            const code = document.createElement('code');
            code.textContent = el.textContent;
            el.textContent = '';
            el.appendChild(code);
            blocks = [code];
          }
        } else {
          blocks = el.querySelectorAll('code');
        }

        blocks.forEach(block => {
          // 尝试格式化JSON内容
          try {
            // 尝试解析JSON，如果已经是格式化的JSON字符串，则保持原样
            const trimmedContent = block.textContent.trim();
            if (!trimmedContent) {
              return;
            }
            
            // 处理JSON中的注释
            let processedContent = trimmedContent;
            // 移除单行注释 (//...)
            processedContent = processedContent.replace(/\/\/.*?(\r?\n|$)/g, '$1');
            // 移除多行注释 (/* ... */)
            processedContent = processedContent.replace(/\/\*[\s\S]*?\*\//g, '');
            
            // 尝试解析并格式化
            const jsonContent = JSON.parse(processedContent);
            block.textContent = JSON.stringify(jsonContent, null, 2);
            block.classList.add('json');
          } catch (e) {
            // 不是JSON格式则保持原样
            console.log('JSON解析错误:', e);
          }
          
          // 自定义处理JSON中的注释
          if (block.classList.contains('json')) {
            // 保存原始内容用于高亮
            const originalContent = block.textContent;
            
            // 让highlight.js先处理基本的JSON高亮
            hljs.highlightElement(block);
            
            // 然后手动添加注释的高亮样式
            const commentedHtml = block.innerHTML
              // 高亮单行注释
              .replace(/(\/\/.*?)(\r?\n|$)/g, '<span class="hljs-comment">$1</span>$2')
              // 高亮多行注释
              .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="hljs-comment">$1</span>');
            
            block.innerHTML = commentedHtml;
          } else {
            hljs.highlightElement(block);
          }
        })
      },
      componentUpdated(el) {
        // 处理直接应用在pre标签上的情况
        let blocks;
        if (el.tagName.toLowerCase() === 'pre') {
          blocks = el.querySelectorAll('code');
          if (blocks.length === 0) {
            // 如果pre标签内没有code标签，创建一个
            const code = document.createElement('code');
            code.textContent = el.textContent;
            el.textContent = '';
            el.appendChild(code);
            blocks = [code];
          }
        } else {
          blocks = el.querySelectorAll('code');
        }
        
        blocks.forEach(block => {
          // 更新时重新高亮
          if (block.classList.contains('json')) {
            // 保存原始内容用于高亮
            const originalContent = block.textContent;
            
            // 让highlight.js先处理基本的JSON高亮
            hljs.highlightElement(block);
            
            // 然后手动添加注释的高亮样式
            const commentedHtml = block.innerHTML
              // 高亮单行注释
              .replace(/(\/\/.*?)(\r?\n|$)/g, '<span class="hljs-comment">$1</span>$2')
              // 高亮多行注释
              .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="hljs-comment">$1</span>');
            
            block.innerHTML = commentedHtml;
          } else {
            hljs.highlightElement(block);
          }
        })
      }
    })
  }
}
