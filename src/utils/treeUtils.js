'use strict'
// 递归查找到跟节点的路径
export default {
  getPathByKey: function(value, key, arr) {
    let temppath = [];
    try {
      function getNodePath(node) {
        temppath.push(node);
        if (node[key] === value) {
          throw "GOT IT!";
        }
        if (node.children && node.children.length > 0) {
          for (var i = 0; i < node.children.length; i++) {
            getNodePath(node.children[i]);
          }
          temppath.pop();
        } else {
          temppath.pop();
        }
      }
      for (let i = 0; i < arr.length; i++) {
        getNodePath(arr[i]);
      }
    } catch (e) {
      return temppath;
    }
  },
  // listToTree(arr, parentId, idKey, pidKey) {
  //     function loop(parentId) {
  //         return arr.reduce((acc, cur) => {
  //             if (cur[pidKey] === parId) {
  //                 cur.children = loop(cur[idKey])
  //                 acc.push(cur)
  //             }
  //             return acc
  //         }, [])
  //     }
  //     return loop(parId)
  // }
  listToTreeList(list, idKey, pidKey) {
    // 将普通列表转换为树结构的列表
    if (!list || !list.length) {
      return [];
    }
    let treeListMap = {};
    for (let item of list) {
      treeListMap[item[idKey]] = item;
    }
    for (let i = 0; i < list.length; i++) {
      if (list[i][pidKey] && treeListMap[list[i][pidKey]]) {
        if (!treeListMap[list[i][pidKey]].children) {
          treeListMap[list[i][pidKey]].children = [];
        }
        treeListMap[list[i][pidKey]].children.push(list[i]);
        list.splice(i, 1);
        i--;
      }
    }
    return list;
  },
};
