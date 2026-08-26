<template>
  <div class="cud-cgn-task-center">
    <el-card>
      <div style="font-size: 16px; font-weight: 600; padding: 0px 0px 10px 0px">
        许可证
      </div>
      <el-row>
        <el-col :span="2">
          <div style="margin-top: 10px">许可证基本信息</div>
        </el-col>
        <el-col :span="22">
          <!-- 表格 -->
          <el-table
            highlight-current-row
            header-row-class-name="cud-office-table-header"
            class="cud-office-table"
            ref="table"
            id="table"
            :data="tableData"
            border
            stripe
            style="width: 100%; margin: 10px 0"
          >
            <!-- <el-table-column width="50" type="index"></el-table-column> -->
            <el-table-column prop="date" label="通知单号">
              <template slot-scope="scope">
                <el-input
                  v-model="scope.row.date"
                  size="small"
                  placeholder="请输入"
                ></el-input>
              </template>
            </el-table-column>
            <el-table-column prop="name" label="通知单类型">
              <template slot-scope="scope">
                <el-input
                  v-model="scope.row.name"
                  size="small"
                  placeholder="请输入"
                ></el-input>
              </template>
            </el-table-column>
            <el-table-column prop="address" label="通知单描述">
              <template slot-scope="scope">
                <el-input
                  v-model="scope.row.address"
                  size="small"
                  placeholder="请输入"
                ></el-input>
              </template>
            </el-table-column>
            <el-table-column prop="gongdan" label="工单">
              <template slot-scope="scope">
                <el-input
                  v-model="scope.row.address"
                  size="small"
                  placeholder="请输入"
                ></el-input>
              </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" width="100">
              <template slot-scope="scope">
                <el-button type="text" size="small">新增</el-button>
                <el-button type="text" size="small">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            class="cud__page float-right"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage4"
            :page-sizes="[100, 200, 300, 400]"
            :page-size="10"
            layout="total, sizes, prev, pager, next"
            :total="1"
          >
          </el-pagination>
        </el-col>
      </el-row>

      <el-row style="margin-top: 40px; padding-bottom: 40px">
        <el-col :span="2">
          <div style="margin-top: 10px">变更信息</div>
        </el-col>
        <el-col :span="22">
          <!-- 表格 -->
          <el-table
            highlight-current-row
            header-row-class-name="cud-office-table-header"
            class="cud-office-table"
            ref="table"
            id="table"
            :data="tableData"
            border
            stripe
            style="width: 100%; margin: 10px 0"
          >
            <!-- <el-table-column width="50" type="index"></el-table-column> -->
            <el-table-column prop="date" label="通知单号">
              <template slot-scope="scope">
                <el-input
                  v-model="scope.row.date"
                  size="small"
                  placeholder="请输入"
                ></el-input>
              </template>
            </el-table-column>
            <el-table-column prop="name" label="通知单类型">
              <template slot-scope="scope">
                <el-input
                  v-model="scope.row.name"
                  size="small"
                  placeholder="请输入"
                ></el-input>
              </template>
            </el-table-column>
            <el-table-column prop="address" label="通知单描述">
              <template slot-scope="scope">
                <el-input
                  v-model="scope.row.address"
                  size="small"
                  placeholder="请输入"
                ></el-input>
              </template>
            </el-table-column>
            <el-table-column prop="gongdan" label="工单">
              <template slot-scope="scope">
                <el-input
                  v-model="scope.row.address"
                  size="small"
                  placeholder="请输入"
                ></el-input>
              </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" width="100">
              <template slot-scope="scope">
                <el-button type="text" size="small">新增</el-button>
                <el-button type="text" size="small">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            class="cud__page float-right"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage4"
            :page-sizes="[100, 200, 300, 400]"
            :page-size="10"
            layout="total, sizes, prev, pager, next"
            :total="1"
          >
          </el-pagination>
        </el-col>
      </el-row>
    </el-card>

    <el-card>
      <div style="font-size: 16px; font-weight: 600; padding: 0px 0px 10px 0px">
        授权人确认信息
      </div>
      <el-row style="padding: 10px 0 30px 0">
        <el-col :span="2">
          <div>多选</div>
        </el-col>
        <el-col :span="22">
          <el-checkbox-group v-model="checkedCities1" :min="1" :max="2">
            <el-checkbox v-for="city in cities" :label="city" :key="city">{{
              city
            }}</el-checkbox>
          </el-checkbox-group>
        </el-col>
      </el-row>
    </el-card>

    <el-card>
      <div style="font-size: 16px; font-weight: 600; padding: 0px 0px 10px 0px">
        补充信息
      </div>
      <el-input
        style="padding: 10px 0 40px 0"
        type="textarea"
        :rows="4"
        placeholder="请输入内容"
        v-model="textarea"
      ></el-input
>
        <div
          style="
            display: flex;
            justify-content: space-between;
            align-items: center;
          "
        >
          <el-checkbox v-model="checkAll" @change="checkAllChangeFn"
            >全部</el-checkbox
          >
          <el-button type="text" @click="reset(true)">重置</el-button>
        </div>
        <el-divider></el-divider>
        <el-checkbox-group v-model="checkColumns" @change="changeColumns">
          <draggable v-model="columns" ghost-class="ghost" :animation="300"  :setData="()=>{}">
            <li v-for="(item, index) in columns" :key="index">
              <i
                style="font-size: 14px; margin-right: 10px; cursor: move"
                class="el-icon-rank"
              ></i>
              <el-checkbox :label="item.label">
                {{ item.label }}
              </el-checkbox>
            </li>
          </draggable>
        </el-checkbox-group>
        <i class="el-icon-menu icon-css" slot="reference"></i>
      </el-popover>
      <!-- 表格 -->
      <el-table
        highlight-current-row
        header-row-class-name="cud-office-table-header"
        class="cud-office-table"
        ref="table"
        id="table"
        :data="tableData1"
        border
        stripe
        style="width: 100%; margin: 10px 0"
      >
        <!-- <el-table-column width="50" type="index"></el-table-column> -->
        <el-table-column prop="wjm" label="文件名"> </el-table-column>
        <el-table-column prop="dx" label="大小"> </el-table-column>
        <el-table-column prop="scr" label="上传人"> </el-table-column>
        <el-table-column prop="scsj" label="上传时间"> </el-table-column>
        <el-table-column fixed="right" label="操作" width="100">
          <template slot-scope="scope">
            <el-button type="text" size="small">查看</el-button>
            <el-button type="text" size="small">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="text-align: right">
        <el-button type="primary" size="small">上传附件</el-button>
      </div>
    </el-card>
  </div>
</template>
<script>
import Draggable from "vuedraggable";
const cityOptions = [
  "确认新工作负责人资质满足要求",
  "确认工作负责人变更相关信息交接情况",
];
export default {
  components: {
    Draggable,
  },
  data() {
    return {
      textarea: "",
      checkedCities1: [],
      cities: cityOptions,
      currentPage1: 5,
      currentPage2: 5,
      currentPage3: 5,
      currentPage4: 4,
      tableData: [
        {
          date: "",
          name: "",
          age: "",
          money: "",
          gongdan: "",
        },
      ],
      tableData1: [
        {
          wjm: "",
          dx: "",
          scr: "",
          scsj: "",
        },
      ],
      columns: [
        { label: "日期", prop: "date", isShow: true },
        { label: "姓名", prop: "name", isShow: true },
        { label: "年龄", prop: "age", isShow: true },
        { label: "财产", prop: "money", isShow: true },
      ],
      checkColumns: [],
      checkAll: false,
    };
  },

  mounted() {},
  methods: {
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`);
    },
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`);
    },
    // 全选复选框事件监听
    checkAllChangeFn(val) {
      if (val) {
        // 全选
        this.reset(true);
      } else {
        // 反全选
        this.reset(false);
      }
    },
    // 重置，flag: Boolean，全部重置为flag
    reset(flag) {
      this.columns.forEach((item) => {
        item.isShow = flag;
      });
      this.showPopover();
      this.refreshTable();
    },
    // 表格列是否显示的方法
    showColumn(currentColumn) {
      return this.columns.find((item) => item.prop == currentColumn).isShow;
    },
    /* 选择列 */
    changeColumns(val) {
      this.columns.forEach((item) => {
        item.isShow = false;
      });
      // columns将val数组存在的值设为true，不存在的设为false
      val.forEach((item) => {
        let current = this.columns.find((i) => i.label == item);
        current.isShow = true;
      });
      // 判断是否全选
      this.judgeIsCheckAll();
      this.refreshTable();
    },
    // 重新渲染表格
    refreshTable() {
      this.$nextTick(() => {
        this.$refs.table.doLayout();
      });
    },
    // 气泡框出现
    showPopover() {
      this.checkColumns = [];
      this.columns.forEach((item) => {
        if (item.isShow) {
          this.checkColumns.push(item.label);
        }
      });
      // 判断是否全选
      this.judgeIsCheckAll();
    },
    // 判断是否全选
    judgeIsCheckAll() {
      // 选中的长度 = 表格列的长度  全选按钮就选中
      if (this.checkColumns.length == this.columns.length) this.checkAll = true;
      else this.checkAll = false;
    },
  },
};
</script>
<style lang="less" scoped>
/* 分割线 */
.el-divider {
  margin: 6px 0 10px 0 !important;
}
.el-divider--horizontal {
  margin: 6px 0 10px 0 !important;
}
.el-checkbox + .el-checkbox {
  margin-left: 0px;
  margin-bottom: 2px;
}
/* 复选框 */
/deep/.el-checkbox-group {
  display: flex;
  flex-direction: column;
}

/* 操作列图标位置 */
/deep/.popover {
  display: flex;
  justify-content: flex-end;
  font-size: 16px;
}
.icon-css {
  border: 1px solid #dde0e7;
  border-radius: 50%;
  padding: 4px;
  cursor: pointer;
}
:hover.icon-css {
  border: 1px solid #dde0e7;
  border-radius: 50%;
  padding: 4px;
  cursor: pointer;
  color: #0775db;
}
/deep/ .el-checkbox-group {
  flex-direction: inherit !important;
}
</style>
