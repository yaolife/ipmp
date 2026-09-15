<!--
 * @Author: [P631038]杨旭
 * @Date: 2024-11-08 17:14:00
 * @LastEditors: [P631038]杨旭
 * @LastEditTime: 2025-08-08 10:45:20
 * @FilePath: \4.2.0-node16\cud4demo-ui\src\components\form\components\cud-table-tree\cud-table-tree.vue
 * @Description: 
-->
<template>
  <div ref="dmCom">
    <!-- <div v-if="isShowTitle"> -->
    <!-- 课程编号:{{ "cudCeshi01" }} 课程名称:{{ "cud项目培训" }} -->
    <el-input
      v-model="kcCode"
      clearable
      size="small"
      placeholder="请填写课程编号"
    ></el-input>

    <el-input
      v-model="kcName"
      clearable
      size="small"
      placeholder="请填写课程名称"
    ></el-input>

    <el-button
      v-if="tableData.length == 0"
      style="margin-bottom: 10px"
      title="删除"
      size="small"
      type="primary"
      @click="handleFirstAdd"
    >
      插入行
    </el-button>
    <el-table
      :data="tableData"
      style="width: 100%"
      row-key="ckId"
      border
      default-expand-all
    >
      <el-table-column label="目录">
        <template slot-scope="scope">
          <span v-if="!scope.row.showInput">{{ scope.row.muluName }}</span>
          <el-input
            v-else
            v-model="scope.row.muluName"
            v-focus
            placeholder="请输入内容"
            size="small"
            @blur="inputBlur(scope.row)"
          ></el-input>
        </template>
      </el-table-column>

      <el-table-column label="负责人姓名">
        <template slot-scope="scope">
          <span v-if="!scope.row.showInput">{{ scope.row.zerenren }}</span>
          <el-input
            v-else
            v-model="scope.row.zerenren"
            v-focus
            placeholder="请输入内容"
            size="small"
            @blur="inputBlur(scope.row)"
          ></el-input>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
            type="text"
            v-if="!scope.row.showInput"
            @click="handleAdd(scope.$index, scope.row)"
            >插入行</el-button
          >
          <el-button
            v-if="!scope.row.showInput"
            type="text"
            @click="handleChildAdd(scope.$index, scope.row)"
            >新增子项</el-button
          >
          <el-button
            v-if="!scope.row.showInput"
            type="text"
            style="color: #ec6c00"
            @click="handleDelete(scope.$index, scope.row)"
            >删除</el-button
          >
          <el-button
            v-if="scope.row.showInput"
            type="text"
            @click="handleSave(scope.$index, scope.row)"
            >保存</el-button
          >
          <el-button
            v-if="scope.row.showInput"
            type="text"
            @click="handleCancel(scope.$index, scope.row)"
            >取消</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <el-pagination popper-class="cud-pager-dropdown"
      ref="pager"
      class="cud__page"
      @size-change="changeSize"
      @current-change="changeCurrentPage"
      :current-page.sync="tablePage.pageIndex"
      :page-sizes="[10, 20, 30, 40, 50, 100]"
      :page-size.sync="tablePage.pageSize"
      :pager-count="5"
      layout="total,sizes, prev, pager, next"
      :total="tablePage.total"
    >
    </el-pagination>
  </div>
</template>

<script>
let id = 1000;
let fid = 100001;
import { uuId } from "@/utils/uuidUtil";
import osUtil from "@/utils/osUtil";
export default {
  components: {},
  name: "TableTree",
  inject: ["setCustomReset"],
  props: ["value", "isShowTitle", "detail", "click", "disabled"],
  directives: {
    // 注册一个局部的自定义指令 v-focus
    focus: {
      inserted(el) {
        if (el.querySelector("input")) {
          el.querySelector("input").focus();
        }
      },
    },
  },
  data() {
    return {
      //分页参数
      tablePage: {
        total: 0,
        pageSize: 10,
        pageIndex: 1,
      },
      timeoutID: "",
      // 表格源数据
      tableData: [],
      kcCode111: "",
      kcCode: "",
      kcName: "",
    };
  },
  watch: {
    /** 获取模型映射返回的参数 */
    value: {
      immediate:true,
      handler(val, o) {
        if (val != null && val != "" && (o == null || o == "")) {
          // // 扁平化数据转换回树结构
          function tranListToTreeData(list) {
            const treeList = [];
            const map = {};

            list.forEach((item) => {
              if (!item.children) {
                item.children = [];
              }
              map[item.ckId] = item;
            });
            list.forEach((item) => {
              const parent = map[item.parentId];
              if (parent) {
                parent.children.push(item);
              } else {
                treeList.push(item);
              }
            });
            return treeList;
          }
          let tableData = tranListToTreeData(val.kcInfo);
          this.tableData = tableData;
        this.kcCode = val.kcCode
        this.kcName = val.kcName
        }
      },
    },
    /** 表格树修改监听 模型映射入参 */
    tableData: {
      handler(newVal) {
        // 数组扁平化
        const treeFlat = (data) => {
          let result = [];
          if (Array.isArray(data) && data.length) {
            data.forEach((item) => {
              result.push({
                muluName: item.muluName,
                zerenren: item.zerenren,
                parentId: item.parentId,
                ckId: item.ckId,
              });
              if (item.children) result.push(...treeFlat(item.children));
            });
          }
          return result;
        };
        let list = treeFlat(newVal);

        // 提交的数据
        let data = {
          kcCode: this.kcCode, // 主表,课程编号
          kcName: this.kcName, // 主表,课程名称
          kcInfo: list, // 对应模型子表, 表格数据
        };

        console.log('[ data表格树 ]-223', data)
        this.$emit("input", data);
      },
      deep: true,
    },
  },
  created() {},
  mounted() {
    //自定义重置
    if (this.setCustomReset) {
      this.setCustomReset(this.handleReset);
    }

    if (osUtil.getBrowserInfo().browser.indexOf("IE") === 0) {
      this.$refs.dmCom.parentNode.removeAttribute("disabled");
    }
  },
  methods: {
    //自定义组件重置
    handleReset() {
      console.log("handle reset");
      this.tableData = [];
    },
    /** 第一次新增父级 */
    handleFirstAdd(index, row) {
      id += 1;
      fid += 1;
      const newChild = {
        ckId: id + uuId(),
        zerenren: "",
        muluName: "",
        parentId: fid + uuId(),
        showInput: true,
        children: [],
      };
      this.tableData.push(newChild);
    },
    /** 新增父级 */
    handleAdd(index, row) {
      id += 1;
      fid += 1;
      const newChild = {
        ckId: id + uuId(),
        zerenren: "",
        muluName: "",
        showInput: true,
        parentId: fid + uuId(),
        children: [],
      };

      this.tableData = this.insertChild(this.tableData, row.ckId, newChild);
    },
    /** 新增子项 */
    handleChildAdd(index, row) {
      console.log("[ row ]", row);
      id += 1;
      const newChild = {
        ckId: id + uuId(),
        zerenren: "",
        muluName: "",
        showInput: true,
        parentId: row.ckId,
        children: [],
      };
      this.$nextTick(() => {
        row.children.push(newChild);
      });
    },
    insertChild(list, id, newChild) {
      list.forEach((item) => {
        const flag = item.ckId === id;
        if (flag) {
          list.push(newChild);
        } else {
          if (item.children.length > 0) {
            item.children = this.insertChild(item.children, id, newChild);
          }
        }
      });
      return list;
    },

    /** 删除 */
    handleDelete(index, row) {
      this.tableData = this.remoteChild(this.tableData, row.ckId);
    },
    remoteChild(list, id) {
      list = list.filter((item) => {
        const flag = item.ckId != id; // 过滤非匹配id

        if (flag) {
          if (item.children.length > 0) {
            item.children = this.remoteChild(item.children, id);
          }
          return true;
        }
        return flag;
      });
      return list;
    },
    inputBlur(val) {
      // if (val.name) {
      //   val.showInput = false;
      // }
    },
    /** 保存数据 */
    handleSave(index, row) {
      row.showInput = false;
      if (this.click) {
        this.click(row);
      }
    },
    /** 取消 */
    handleCancel(input, row) {
      this.tableData = this.remoteChild(this.tableData, row.ckId);
    },
    //改变显示条数
    changeSize(data) {
      this.tablePage.pageSize = data;
    },
    //改变当前页
    changeCurrentPage(data) {
      this.tablePage.pageIndex = data;
    },
  },
};
</script>

<style lang="less" scoped>
/** 小箭头位置 */
/deep/ .el-table__expand-icon {
  position: none;
  left: 0;
  display: inline-block;
  padding-right: 5px;
}
/deep/.el-table--enable-row-hover .el-table__body tr:hover > td {
  background-color: #f5f7fa; /** 设置行背景颜色 */
  /* color: #f19944;  /* 设置文字颜色， */
}
/deep/ .el-table__indent {
  padding-left: 0px !important;
  line-height: 0px !important;
}
/deep/.el-table__expand-icon {
  position: relative;
  cursor: pointer;
  color: #666;
  font-size: 12px;
  transition: transform 0.2s ease-in-out;
  height: 20px;
  margin-right: 5px;
  margin-top: 1px;
  line-height: 20px;
}
</style>
