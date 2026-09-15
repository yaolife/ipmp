/**
 * 给树形结构的每个节点新增 value 字段，值等于 label
 * @param {Array} tree  原始树数组
 * @param {String} childKey  子节点字段名，默认 'children'
 * @returns {Array}  新树（原数据不变）
 */
export function addValueField(tree, childKey = 'children') {
  if (!Array.isArray(tree)) return [];
  return tree.map(node => {
    const newNode = { ...node, value: node.dictCode }; // 核心逻辑
    if (Array.isArray(node[childKey]) && node[childKey].length) {
      newNode[childKey] = addValueField(node[childKey], childKey); // 递归
    }
    if(Array.isArray(node[childKey]) && node[childKey].length == 0) {
      newNode[childKey] = null
    }
    return newNode;
  });
}

/* ====== 使用示例 ====== */
// const data = [
//   {
//     label: '浙江',
//     children: [
//       { label: '杭州', children: [{ label: '西湖' }] },
//       { label: '宁波' }
//     ]
//   },
//   { label: '江苏', children: [{ label: '南京' }] }
// ];

// const readyForCascader = addValueField(data);
// console.log(JSON.stringify(readyForCascader, null, 2));