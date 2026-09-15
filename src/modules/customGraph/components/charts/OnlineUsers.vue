<!--
 * @Author: [P631038]杨旭
 * @LastEditors: [P631038]杨旭
 * @Description: 
-->
<template>
  <div>
    <div class="onlineTable">
      <el-table :data="tableData" height="200">
        <el-table-column label="序号" type="index" width="50"></el-table-column>
        <el-table-column label="工号姓名" prop="userNameAndId">
          <template slot-scope="scope"
            >[{{ scope.row.userId }}]{{ scope.row.userName }}
          </template>
        </el-table-column>
        <el-table-column
          label="登录次数"
          prop="loginCount"
          width="80"
        ></el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import { getUserLoginCountList } from "@/api/api.js";
export default {
  name: "OnlineUsers",
  data() {
    return {
      tableData: []
    };
  },
  created() {
    this.getOnline();
  },
  methods: {
    async getOnline() {
      //获取在线用户信息
      let _this = this;
      const result = await getUserLoginCountList({ pageSize: 100 });
      console.log(result, "result==");
      this.tableData = result.data;
    }
  }
};
</script>

<style lang="less" scoped>
.onlineTable {
  height: 100%;
  width: 100%;
  overflow: auto;
  background-color: #eaf2ff;
  .onlineTitle {
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 15px;
  }
}
/deep/.el-table {
  .cell {
    text-align: center;
    display: block;
  }
  th {
    background-color: #dbe6fa;
  }
}
/deep/.el-table__empty-text {
  color: #909399;
  font-size: 14px;
  display: inline-block;
  width: 60px;
  height: 60px;
  line-height: 80px;
  padding-top: 15px;
  transform: translateY(5px);
  background-size: contain;
  background-repeat: no-repeat;
}
</style>
