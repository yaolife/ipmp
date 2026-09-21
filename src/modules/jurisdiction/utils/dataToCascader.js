/**
 * 将接口返回的data数据转换为级联选择器所需格式
 * @param {Object} data - 接口返回的data对象
 * @returns {Array} 级联选择器数据
 */
export  function convertToCascaderData(data) {
  // 判断一个值是否为最后一层（叶子节点）
  // 最后一层定义：数组，且数组第一个元素是没有子对象/数组的简单对象
  function isLastLevel(value) {
    if (!Array.isArray(value) || value.length === 0) return false;
    
    const firstItem = value[0];
    // 第一个元素不是对象，说明是最后一层
    if (typeof firstItem !== 'object' || firstItem === null) return true;
    
    // 检查第一个元素是否有子对象或子数组
    const hasChildren = Object.values(firstItem).some(prop => 
      (typeof prop === 'object' && prop !== null) && 
      (Array.isArray(prop) ? prop.length > 0 : Object.keys(prop).length > 0)
    );
    
    return !hasChildren;
  }

  // 处理最后一层数组，提取第一个元素的所有键作为选项
  function processLastLevelArray(array) {
    if (!Array.isArray(array) || array.length === 0) return [];
    
    const firstItem = array[0];
    // 如果第一个元素不是对象，直接返回数组元素作为选项
    if (typeof firstItem !== 'object' || firstItem === null) {
      return array.map(item => ({
        value: item.toString(),
        label: item.toString(),
        children: null
      }));
    }
    
    // 提取第一个元素的所有键作为选项
    return Object.keys(firstItem).map(key => ({
      value: key,
      label: key,
      children: null
    }));
  }

  // 递归处理数据的函数
  function processNode(node) {
    // 如果是数组
    if (Array.isArray(node)) {
      // 检查是否为最后一层
      if (isLastLevel(node)) {
        return processLastLevelArray(node);
      } else {
        // 非最后一层数组，递归处理每个元素
        return node.map((item, index) => ({
          value: `item-${index}`,
          label: `选项 ${index + 1}`,
          children: processNode(item)
        }));
      }
    } 
    // 如果是对象
    else if (typeof node === 'object' && node !== null) {
      return Object.keys(node).map(key => {
        const value = node[key];
        // 检查是否有子节点
        const hasChildren = (typeof value === 'object' && value !== null) && 
                          (Array.isArray(value) ? value.length > 0 : Object.keys(value).length > 0);
        
        return {
          value: key,
          label: key,
          children: hasChildren ? processNode(value) : null
        };
      });
    }
    // 基本类型直接返回
    return [{
      value: node.toString(),
      label: node.toString(),
      children: null
    }];
  }
  // data作为级联选择器的第一层级
  return [{
    label:'data',
    value:'data',
    children:processNode(data)
  }]
}

// 示例用法：
// 假设response是接口返回的完整数据对象
// const cascaderData = convertToCascaderData(response.data);
// 然后在级联选择器中使用cascaderData
    