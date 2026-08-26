<template>
  <el-card>
    <div class="main">
      <div class="title">vxeTable表格</div>
      <div class="block">
        <div class="card">
          <div>
            支持斑马纹、单元格式自定义、单列排序、单列筛选、分页大数据(虚拟表格滚动)、自定义列(
            显隐、排序、冻结等功能 )...
          </div>
          <!-- 表格 -->
          <vxe-toolbar ref="xToolbar1" custom>
            <template #buttons>
              <vxe-button @click="onStripe">
                <div v-if="!isStripe">开启斑马纹</div>
                <div v-else>关闭斑马纹</div>
              </vxe-button>
              <vxe-button @click="colStypeCustom">
                <div v-if="!isColStypeCustom">开启单元格式自定义</div>
                <div v-else>关闭单元格式自定义</div>
              </vxe-button>
              <div style="margin: 0 12px">表格高度设置:</div>
              <vxe-input
                v-model="tableHeight"
                @input="setTableHeight"
                type="integer"
                placeholder="请输入表格高度"
              >
              </vxe-input>
            </template>
          </vxe-toolbar>
          <vxe-table
            ref="xTable1"
            :stripe="isStripe"
            border
            resizable
            id="toolbar_demo"
            :row-config="{ isHover: true }"
            :max-height="tableHeight"
            :custom-config="{
              storage: true,
              checkMethod: checkColumnMethod,
            }"
            :loading="loading"
            :data="tableData"
            :header-cell-style="headerCellStyle"
            :row-style="rowStyle"
            :cell-style="cellStyle"
          >
            <!-- mode: 'popup', -->
            <vxe-table-column type="seq" width="60"></vxe-table-column>
            <vxe-table-column type="checkbox" width="60"></vxe-table-column>
            <vxe-table-column
              field="name"
              title="姓名"
              sortable
            ></vxe-table-column>
            <vxe-table-column
              field="role"
              title="角色"
              sortable
              :filters="roleOptions"
              :filter-method="filterRoleMethod"
            >
              <template #filter="{ $panel, column }">
                <select
                  class="my-select"
                  size="small"
                  v-model="option.data"
                  v-for="(option, index) in column.filters"
                  :key="index"
                  @change="$panel.changeOption($event, !!option.data, option)"
                >
                  <option
                    v-for="(label, cIndex) in roleList"
                    :key="cIndex"
                    :value="label"
                  >
                    {{ label }}
                  </option>
                </select>
              </template>
            </vxe-table-column>
            <vxe-table-column
              field="sex"
              title="性别"
              sortable
              :filter-multiple="false"
              :filters="sexOptions"
            >
              <template #default="{ row }">
                <span v-if="row.sex == 1">{{ "男生" }}</span>
                <span v-if="row.sex == 0">{{ "女生" }}</span>
              </template>
            </vxe-table-column>
            <vxe-table-column
              field="age"
              title="年龄"
              sortable
              :filters="ageOptions"
              :filter-method="filterAgeMethod"
              :filter-recover-method="filterAgeRecoverMethod"
            >
              <template #filter="{ $panel, column }">
                <template v-for="(option, index) in column.filters">
                  <el-input
                    type="type"
                    size="small"
                    :key="index"
                    v-model="option.data"
                    @input="$panel.changeOption($event, !!option.data, option)"
                    @keyup.enter.native="$panel.confirmFilter()"
                    placeholder="按回车确认筛选"
                  />
                </template>
              </template>
            </vxe-table-column>
          </vxe-table>
          <!-- 分页器 -->
          <vxe-pager
            background
            size="small"
            :loading="loading"
            :current-page="tablePage.currentPage"
            :page-size="tablePage.pageSize"
            :total="tablePage.totalResult"
            :page-sizes="[
              10,
              20,
              100,
              { label: '大量数据', value: 1000 },
              { label: '全量数据', value: -1 },
            ]"
            :layouts="[
              'PrevPage',
              'JumpNumber',
              'NextPage',
              'FullJump',
              'Sizes',
              'Total',
            ]"
            @page-change="handlePageChange"
          >
          </vxe-pager>
        </div>
        <div v-if="!show" class="meta">
          <div class="highligh" style="width: 100%">
            <pre v-highlightjs>
            <code class="vue code-css">
          {{htmlContent1}}
            </code>
         </pre>
          </div>
        </div>

        <div v-if="show" class="demo-block-control show" @click="isShow">
          <i class="el-icon-caret-bottom hovering"></i>
          <span class="show-content">显示代码</span>
        </div>
        <div v-else class="demo-block-control show" @click="isShow">
          <i class="el-icon-caret-top hovering"></i>
          <span class="show-content">隐藏代码</span>
        </div>
      </div>
      <!-- 树行表格 -->
      <div class="title" style="margin-top: 30px">树形表格</div>
      <div class="block">
        <div class="card">
          <vxe-toolbar>
            <template #buttons>
              <vxe-button @click="$refs.xTable2.setAllTreeExpand(true)"
                >展开所有</vxe-button
              >
              <vxe-button @click="$refs.xTable2.setAllTreeExpand(false)"
                >收起所有</vxe-button
              >
            </template>
          </vxe-toolbar>

          <vxe-table
            show-overflow
            height="300"
            ref="xTable2"
            :tree-config="{ transform: true }"
            :scroll-y="{ enabled: true, gt: 20 }"
            :data="tableData2"
          >
            <vxe-column type="seq" width="200" tree-node></vxe-column>
            <vxe-column field="name" title="Name"></vxe-column>
            <vxe-column field="size" title="Size"></vxe-column>
            <vxe-column field="type" title="Type"></vxe-column>
            <vxe-column field="date" title="Date"></vxe-column>
          </vxe-table>
        </div>
        <div v-if="!show1" class="meta">
          <div class="highligh" style="width: 100%">
            <pre v-highlightjs>
            <code class="vue code-css">
          {{htmlContent2}}
            </code>
         </pre>
          </div>
        </div>

        <div v-if="show1" class="demo-block-control show" @click="isShow1">
          <i class="el-icon-caret-bottom hovering"></i>
          <span class="show-content">显示代码</span>
        </div>
        <div v-else class="demo-block-control show" @click="isShow1">
          <i class="el-icon-caret-top hovering"></i>
          <span class="show-content">隐藏代码</span>
        </div>
      </div>

      <!-- 分组表头 -->
      <div class="title" style="margin-top: 30px">表头分组</div>
      <div class="block">
        <div class="card">
          <vxe-toolbar>
            <template #buttons>
              <vxe-button @click="toggleFixedColumn('group0', 'left')"
                >切换第一列固定</vxe-button
              >
              <vxe-button @click="toggleFixedColumn('group1', 'left')"
                >切换第二列固定</vxe-button
              >
              <vxe-button @click="toggleFixedColumn('group3', 'right')"
                >切换第四列固定</vxe-button
              >
              <vxe-button @click="toggleFixedColumn('group4', 'right')"
                >切换第五列固定</vxe-button
              >
            </template>
          </vxe-toolbar>

          <vxe-table border ref="xTable3" height="300" :data="tableData">
            <vxe-colgroup field="group0" title="基本信息">
              <vxe-column type="seq" width="60"></vxe-column>
              <vxe-column field="name" title="Name" width="180"></vxe-column>
            </vxe-colgroup>
            <vxe-colgroup field="group1" title="分类信息1">
              <vxe-column field="age" title="Age1" width="120"></vxe-column>
            </vxe-colgroup>
            <vxe-colgroup field="group2" title="更多信息">
              <vxe-column field="role" title="Role" width="300"></vxe-column>
              <vxe-column field="attr1" title="Attr1" width="200"></vxe-column>
              <vxe-colgroup title="详细信息">
                <vxe-column field="sex" title="Sex" width="200"></vxe-column>
                <vxe-column field="num" title="Num" width="200"></vxe-column>
              </vxe-colgroup>
            </vxe-colgroup>
            <vxe-colgroup field="group3" title="分类信息2">
              <vxe-column field="attr6" title="Attr6" width="120"></vxe-column>
            </vxe-colgroup>
            <vxe-colgroup field="group4" title="额外信息">
              <vxe-column field="date3" title="Date" width="140"></vxe-column>
              <vxe-column
                field="address"
                title="Address"
                width="200"
                show-overflow
              ></vxe-column>
            </vxe-colgroup>
          </vxe-table>
        </div>
        <div v-if="!show2" class="meta">
          <div class="highligh" style="width: 100%">
            <pre v-highlightjs>
            <code class="vue code-css">
          {{htmlContent3}}
            </code>
         </pre>
          </div>
        </div>

        <div v-if="show2" class="demo-block-control show" @click="isShow2">
          <i class="el-icon-caret-bottom hovering"></i>
          <span class="show-content">显示代码</span>
        </div>
        <div v-else class="demo-block-control show" @click="isShow2">
          <i class="el-icon-caret-top hovering"></i>
          <span class="show-content">隐藏代码</span>
        </div>
      </div>
    </div>
  </el-card>
</template>
<script>
import hljs from "highlight.js";
// import hljs from "highlight.js/lib/highlight";
// import "highlight.js/styles/github.css";
import Vue from "vue";
import XEUtils from "xe-utils";
import VxeTable from "vxe-table";
import "vxe-table/lib/style.css";
import { setFollow, unsetFollow } from "../components/scrollFollow.js";

Vue.use(XEUtils);
Vue.use(VxeTable);

const str1 = `
   ** 该vxe-table版本为3.8.9 , 具体demo案例官网上十分完善 ,
   官网地址https://vxetable.cn/v3.8/#/table/start/install


          <!-- 表格 -->
        <vxe-toolbar ref="xToolbar1" custom>
          <template #buttons>
            <vxe-button @click="onStripe">
              <div v-if="!isStripe">开启斑马纹</div>
              <div v-else>关闭斑马纹</div>
            </vxe-button>
            <vxe-button @click="colStypeCustom">
              <div v-if="!isColStypeCustom">开启单元格式自定义</div>
              <div v-else>关闭单元格式自定义</div>
            </vxe-button>
            <div style="margin:0 12px">表格高度设置: </div>
            <vxe-input
              v-model="tableHeight"
              @input="setTableHeight"
              type="integer"
              placeholder="请输入表格高度"
            >
            </vxe-input>
          </template>
        </vxe-toolbar>
        <vxe-table
          ref="xTable1"
          :stripe="isStripe"
          border
          resizable
          id="toolbar_demo"
          :row-config="{ isHover: true }"
          :max-height="tableHeight"
          :custom-config="{ storage: true, checkMethod: checkColumnMethod }"
          :loading="loading"
          :data="tableData"
          :header-cell-style="headerCellStyle"
          :row-style="rowStyle"
          :cell-style="cellStyle"
        >
          <vxe-table-column type="seq" width="60"></vxe-table-column>
          <vxe-table-column
            field="name"
            title="姓名"
            sortable
          ></vxe-table-column>
          <vxe-table-column
            field="role"
            title="角色"
            sortable
            :filters="roleOptions"
            :filter-method="filterRoleMethod"
          >
            <template #filter="{ $panel, column }">
              <select
                class="my-select"
                size="small"
                v-model="option.data"
                v-for="(option, index) in column.filters"
                :key="index"
                @change="$panel.changeOption($event, !!option.data, option)"
              >
                <option
                  v-for="(label, cIndex) in roleList"
                  :key="cIndex"
                  :value="label"
                >
                  {{ label }}
                </option>
              </select>
            </template>
          </vxe-table-column>
          <vxe-table-column
            field="sex"
            title="性别"
            sortable
            :filter-multiple="false"
            :filters="sexOptions"
          >
            <template #default="{ row }">
              <span v-if="row.sex == 1">{{ "男生" }}</span>
              <span v-if="row.sex == 0">{{ "女生" }}</span>
            </template>
          </vxe-table-column>
          <vxe-table-column
            field="age"
            title="年龄"
            sortable
            :filters="ageOptions"
            :filter-method="filterAgeMethod"
            :filter-recover-method="filterAgeRecoverMethod"
          >
            <template #filter="{ $panel, column }">
              <template v-for="(option, index) in column.filters">
                <el-input
                  type="type"
                  size="small"
                  :key="index"
                  v-model="option.data"
                  @input="$panel.changeOption($event, !!option.data, option)"
                  @keyup.enter.native="$panel.confirmFilter()"
                  placeholder="按回车确认筛选"
                />
              </template>
            </template>
          </vxe-table-column>
        </vxe-table>

        <!-- 分页器 -->
        <vxe-pager
          background
          size="small"
          :loading="loading"
          :current-page="tablePage.currentPage"
          :page-size="tablePage.pageSize"
          :total="tablePage.totalResult"
          :page-sizes="[
            10,
            20,
            100,
            { label: '大量数据', value: 1000 },
            { label: '全量数据', value: -1 },
          ]"
          :layouts="[
            'PrevPage',
            'JumpNumber',
            'NextPage',
            'FullJump',
            'Sizes',
            'Total',
          ]"
          @page-change="handlePageChange"
        >
        </vxe-pager>

        export default {
          data () {
            return {
              tableData: [
                { id: 10001, name: 'Test1', role: 'Develop', sex: 'Man', age: 28, address: 'test abc' },
                { id: 10002, name: 'Test2', role: 'Test', sex: 'Women', age: 22, address: 'Guangzhou' },
                { id: 10003, name: 'Test3', role: 'PM', sex: 'Man', age: 32, address: 'Shanghai' },
                { id: 10004, name: 'Test4', role: 'Designer', sex: 'Women', age: 23, address: 'test abc' },
                { id: 10005, name: 'Test5', role: 'Develop', sex: 'Women', age: 30, address: 'Shanghai' },
                { id: 10006, name: 'Test6', role: 'Designer', sex: 'Women', age: 21, address: 'test abc' },
                { id: 10007, name: 'Test7', role: 'Test', sex: 'Man', age: 29, address: 'test abc' },
                { id: 10008, name: 'Test8', role: 'Develop', sex: 'Man', age: 35, address: 'test abc' }
              ]
            }
          },
          created () {
            this.$nextTick(() => {
              // 手动将表格和工具栏进行关联
              this.$refs.xTable1.connect(this.$refs.xToolbar1)
            })
          },
  methods:{
    filterAgeRecoverMethod({ option }) {
      // 如果是自定义筛选模板，当为点击确认时，该选项将被恢复为默认值
      option.data = "";
    },
    filterAgeMethod({ option, row }) {
      return row.age === Number(option.data);
    },
    filterRoleMethod({ option, row }) {
      return row.role === option.data;
    },
    checkColumnMethod({ column }) {
      // 给某一个列置灰
      //   if (column.field === "role") {
      //     return false;
      //   }
      return true;
    },
      headerCellStyle({ column }) {
      if (column.field === "name") {
        return {
          backgroundColor: "#f60",
          color: "#ffffff",
        };
      }
    },
    rowStyle({ rowIndex }) {
      if ([2, 3, 5].includes(rowIndex)) {
        return {
          backgroundColor: "red",
          color: "#ffffff",
        };
      }
    },
    cellStyle({ row, column }) {
      if (column.field === "sex") {
        if (row.sex >= "1") {
          return {
            backgroundColor: "#187",
          };
        } else if (row.age === 26) {
          return {
            backgroundColor: "#2db7f5",
          };
        }
      }
    },
          }
        }
`;
const str2 = `
 <vxe-toolbar>
          <template #buttons>
            <vxe-button @click="$refs.xTable.setAllTreeExpand(true)">展开所有</vxe-button>
            <vxe-button @click="$refs.xTable.setAllTreeExpand(false)">收起所有</vxe-button>
          </template>
        </vxe-toolbar>

        <vxe-table
          show-overflow
          height="500"
          ref="xTable"
          :tree-config="{transform: true}"
          :scroll-y="{enabled: true, gt: 20}"
          :data="tableData">
          <vxe-column type="seq" width="200" tree-node></vxe-column>
          <vxe-column field="name" title="Name"></vxe-column>
          <vxe-column field="size" title="Size"></vxe-column>
          <vxe-column field="type" title="Type"></vxe-column>
          <vxe-column field="date" title="Date"></vxe-column>
        </vxe-table>

 <vxe-toolbar>
          <template #buttons>
            <vxe-button @click="$refs.xTable.setAllTreeExpand(true)">展开所有</vxe-button>
            <vxe-button @click="$refs.xTable.setAllTreeExpand(false)">收起所有</vxe-button>
          </template>
        </vxe-toolbar>

        <vxe-table
          show-overflow
          height="500"
          ref="xTable"
          :tree-config="{transform: true}"
          :scroll-y="{enabled: true, gt: 20}"
          :data="tableData">
          <vxe-column type="seq" width="200" tree-node></vxe-column>
          <vxe-column field="name" title="Name"></vxe-column>
          <vxe-column field="size" title="Size"></vxe-column>
          <vxe-column field="type" title="Type"></vxe-column>
          <vxe-column field="date" title="Date"></vxe-column>
        </vxe-table>

        export default {
          data () {
            return {
              tableData: []
            }

          }

        }
`;
const str3 = `
        <vxe-toolbar>
          <template #buttons>
            <vxe-button @click="toggleFixedColumn('group0', 'left')">切换第一列固定</vxe-button>
            <vxe-button @click="toggleFixedColumn('group1', 'left')">切换第二列固定</vxe-button>
            <vxe-button @click="toggleFixedColumn('group3', 'right')">切换第四列固定</vxe-button>
            <vxe-button @click="toggleFixedColumn('group4', 'right')">切换第五列固定</vxe-button>
          </template>
        </vxe-toolbar>

        <vxe-table
          border
          ref="xTable"
          height="400"
          :data="tableData">
          <vxe-colgroup field="group0" title="基本信息">
            <vxe-column type="seq" width="60"></vxe-column>
            <vxe-column field="name" title="Name" width="180"></vxe-column>
          </vxe-colgroup>
          <vxe-colgroup field="group1" title="分类信息1">
            <vxe-column field="age" title="Age1" width="120"></vxe-column>
          </vxe-colgroup>
          <vxe-colgroup field="group2" title="更多信息">
            <vxe-column field="role" title="Role" width="300"></vxe-column>
            <vxe-column field="attr1" title="Attr1" width="200"></vxe-column>
            <vxe-colgroup title="详细信息">
              <vxe-column field="sex" title="Sex" width="200"></vxe-column>
              <vxe-column field="num" title="Num" width="200"></vxe-column>
            </vxe-colgroup>
          </vxe-colgroup>
          <vxe-colgroup field="group3" title="分类信息2">
            <vxe-column field="attr6" title="Attr6" width="120"></vxe-column>
          </vxe-colgroup>
          <vxe-colgroup field="group4" title="额外信息">
            <vxe-column field="date3" title="Date" width="140"></vxe-column>
            <vxe-column field="address" title="Address" width="200" show-overflow></vxe-column>
          </vxe-colgroup>
        </vxe-table>

             export default {
          data () {
            return {
              tableData: [
                { id: 10001, name: 'Test1', role: 'Develop', sex: 'Man', age: 28, address: 'test abc' },
                { id: 10002, name: 'Test2', role: 'Test', sex: 'Women', age: 22, address: 'Guangzhou' },
                { id: 10003, name: 'Test3', role: 'PM', sex: 'Man', age: 32, address: 'Shanghai' },
                { id: 10004, name: 'Test4', role: 'Designer', sex: 'Women', age: 23, address: 'test abc' },
                { id: 10005, name: 'Test5', role: 'Develop', sex: 'Women', age: 30, address: 'Shanghai' },
                { id: 10006, name: 'Test6', role: 'Designer', sex: 'Women', age: 21, address: 'test abc' },
                { id: 10007, name: 'Test7', role: 'Test', sex: 'Man', age: 29, address: 'test abc' },
                { id: 10008, name: 'Test8', role: 'Develop', sex: 'Man', age: 35, address: 'test abc' }
              ]
            }
          },
          methods: {
            toggleFixedColumn (field, type) {
              const xTable = this.$refs.xTable
              const column = xTable.getColumnByField(field)
              const groupFixed = column.fixed ? null : type
              // 将分组整体设置固定列
              XEUtils.eachTree([column], column => {
                column.fixed = groupFixed
              })
              // 刷新列
              xTable.refreshColumn()
            }
          }
        }
`;

export default {
  components: {
    // VXETable,
  },
  data() {
    return {
      show: true,
      show1: true,
      show2: true,
      showDialog: false,
      disabled: false,
      htmlContent1: str1,
      htmlContent2: str2,
      htmlContent3: str3,
      tableHeight: 300,
      tableData: [],
      tableData2: [
        {
          id: 110000,
          parentId: null,
          name: "vxe-table test abc1",
          type: "mp3",
          size: 1024,
          date: "2020-08-01",
        },

        {
          id: 111000,
          parentId: 110000,
          name: "vxe-table test abc2",
          type: "html",
          size: 600,
          date: "2021-04-01",
        },

        {
          id: 111100,
          parentId: 111000,
          name: "vxe-table test abc3",
          type: "html",
          size: 600,
          date: "2021-04-01",
        },

        {
          id: 111110,
          parentId: 111100,
          name: "vxe-table test abc4",
          type: "html",
          size: 600,
          date: "2021-04-01",
        },

        {
          id: 111111,
          parentId: 111110,
          name: "vxe-table test abc5",
          type: "html",
          size: 600,
          date: "2021-04-01",
        },

        {
          id: 111112,
          parentId: 111110,
          name: "vxe-table test abc6",
          type: "html",
          size: 600,
          date: "2021-04-01",
        },

        {
          id: 120000,
          parentId: null,
          name: "Test7",
          type: "mp4",
          size: null,
          date: "2021-04-01",
        },

        {
          id: 121000,
          parentId: 120000,
          name: "Test8",
          type: "avi",
          size: 1024,
          date: "2020-03-01",
        },

        {
          id: 121100,
          parentId: 121000,
          name: "vxe-table test abc9",
          type: "html",
          size: 600,
          date: "2021-04-01",
        },

        {
          id: 121200,
          parentId: 121000,
          name: "vxe-table test abc10",
          type: "avi",
          size: null,
          date: "2021-04-01",
        },

        {
          id: 121300,
          parentId: 121000,
          name: "vxe-table test abc11",
          type: "txt",
          size: 25,
          date: "2021-10-01",
        },

        {
          id: 121310,
          parentId: 121300,
          name: "Test12",
          type: "pdf",
          size: 512,
          date: "2020-01-01",
        },

        {
          id: 121320,
          parentId: 121310,
          name: "Test13",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 130000,
          parentId: null,
          name: "Test14",
          type: "xlsx",
          size: 2048,
          date: "2020-11-01",
        },

        {
          id: 140000,
          parentId: null,
          name: "vue 从入门到精通15",
          type: "avi",
          size: 224,
          date: "2020-10-01",
        },

        {
          id: 141000,
          parentId: 140000,
          name: "Test16",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 142000,
          parentId: 140000,
          name: "Test17",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 143000,
          parentId: 140000,
          name: "Test78",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 150000,
          parentId: null,
          name: "vue 从入门到精通19",
          type: "avi",
          size: 224,
          date: "2020-10-01",
        },

        {
          id: 160000,
          parentId: null,
          name: "vue 从入门到精通20",
          type: "avi",
          size: 224,
          date: "2020-10-01",
        },

        {
          id: 161000,
          parentId: 160000,
          name: "Test21",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 162000,
          parentId: 160000,
          name: "Test22",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 163000,
          parentId: 160000,
          name: "Test23",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 163100,
          parentId: 164000,
          name: "Test24",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 163200,
          parentId: 164000,
          name: "Test25",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 163300,
          parentId: 164000,
          name: "Test26",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 163400,
          parentId: 164000,
          name: "Test27",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 163500,
          parentId: 164000,
          name: "Test28",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 163600,
          parentId: 164000,
          name: "vxe-table test abc29",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 164000,
          parentId: 160000,
          name: "Test30",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 164100,
          parentId: 164000,
          name: "Test31",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 164200,
          parentId: 164000,
          name: "Test32",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 164300,
          parentId: 164000,
          name: "vxe-table test abc33",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 164400,
          parentId: 164000,
          name: "Test34",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 164500,
          parentId: 164000,
          name: "Test35",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 164600,
          parentId: 164000,
          name: "Test36",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 164700,
          parentId: 164000,
          name: "Test37",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 164800,
          parentId: 164000,
          name: "Test38",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 164900,
          parentId: 164000,
          name: "vxe-table test abc40",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 165000,
          parentId: 160000,
          name: "Test41",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 166000,
          parentId: 160000,
          name: "Test42",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 167000,
          parentId: 160000,
          name: "Test43",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 168000,
          parentId: 160000,
          name: "Test44",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 169000,
          parentId: 160000,
          name: "Test45",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 170000,
          parentId: null,
          name: "vue 从入门到精通46",
          type: "avi",
          size: 224,
          date: "2020-10-01",
        },

        {
          id: 180000,
          parentId: null,
          name: "vue 从入门到精通47",
          type: "avi",
          size: 224,
          date: "2020-10-01",
        },

        {
          id: 181000,
          parentId: 180000,
          name: "Test48",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 182000,
          parentId: 180000,
          name: "Test49",
          type: "js",
          size: 1024,
          date: "2021-06-14",
        },

        {
          id: 184000,
          parentId: 180000,
          name: "Test50",
          type: "js",
          size: 1024,
          date: "2021-06-23",
        },

        {
          id: 185000,
          parentId: 180000,
          name: "Test51",
          type: "js",
          size: 1024,
          date: "2021-06-11",
        },

        {
          id: 186000,
          parentId: 180000,
          name: "Test52",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 190000,
          parentId: null,
          name: "vue 从入门到精通53",
          type: "avi",
          size: 224,
          date: "2020-10-01",
        },

        {
          id: 191000,
          parentId: 190000,
          name: "Test54",
          type: "js",
          size: 1024,
          date: "2021-06-04",
        },

        {
          id: 192000,
          parentId: 190000,
          name: "Test55",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 193000,
          parentId: 190000,
          name: "Test56",
          type: "js",
          size: 1024,
          date: "2021-06-03",
        },

        {
          id: 194000,
          parentId: 190000,
          name: "Test57",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 200000,
          parentId: null,
          name: "vue 从入门到精通58",
          type: "avi",
          size: 224,
          date: "2020-10-01",
        },

        {
          id: 201000,
          parentId: 200000,
          name: "Test59",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 202000,
          parentId: 200000,
          name: "Test60",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 203000,
          parentId: 200000,
          name: "Test61",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 204000,
          parentId: 200000,
          name: "Test62",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 205000,
          parentId: 200000,
          name: "Test63",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 206000,
          parentId: 200000,
          name: "Test64",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 210000,
          parentId: null,
          name: "vue 从入门到精通65",
          type: "avi",
          size: 224,
          date: "2020-10-01",
        },

        {
          id: 220000,
          parentId: null,
          name: "vue 从入门到精通66",
          type: "avi",
          size: 224,
          date: "2020-10-01",
        },

        {
          id: 230000,
          parentId: null,
          name: "vxe-table test abc67",
          type: "avi",
          size: 224,
          date: "2020-10-01",
        },

        {
          id: 240000,
          parentId: null,
          name: "vue 从入门到精通68",
          type: "avi",
          size: 224,
          date: "2020-10-01",
        },

        {
          id: 250000,
          parentId: null,
          name: "vue 从入门到精通69",
          type: "avi",
          size: 224,
          date: "2020-01-01",
        },

        {
          id: 251000,
          parentId: 250000,
          name: "Test70",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 252000,
          parentId: 250000,
          name: "Test71",
          type: "js",
          size: 1024,
          date: "2021-08-02",
        },

        {
          id: 253000,
          parentId: 250000,
          name: "Test72",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 254000,
          parentId: 250000,
          name: "Test73",
          type: "js",
          size: 1024,
          date: "2021-06-03",
        },

        {
          id: 254100,
          parentId: 254000,
          name: "Test74",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 254200,
          parentId: 254000,
          name: "vxe-table test abc75",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 254300,
          parentId: 254000,
          name: "Test76",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 254310,
          parentId: 254300,
          name: "Test76",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 254320,
          parentId: 254300,
          name: "Test78",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 254321,
          parentId: 254320,
          name: "Test79",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 254322,
          parentId: 254320,
          name: "Test80",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 254323,
          parentId: 254320,
          name: "vxe-table test abc81",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 254324,
          parentId: 254320,
          name: "Test82",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 254325,
          parentId: 254320,
          name: "Test83",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 254326,
          parentId: 254320,
          name: "Test84",
          type: "js",
          size: 1024,
          date: "2021-06-07",
        },

        {
          id: 254327,
          parentId: 254320,
          name: "Test85",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 254330,
          parentId: 254300,
          name: "Test86",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 254340,
          parentId: 254300,
          name: "vxe-table test abc87",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 254350,
          parentId: 254300,
          name: "Test88",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 254360,
          parentId: 254300,
          name: "Test89",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 254370,
          parentId: 254300,
          name: "vxe-table test abc90",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 254400,
          parentId: 254000,
          name: "Test91",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 254500,
          parentId: 254000,
          name: "Test92",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 254600,
          parentId: 254000,
          name: "vxe-table test abc93",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 255000,
          parentId: 250000,
          name: "Test94",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 256000,
          parentId: 250000,
          name: "Test95",
          type: "js",
          size: 1024,
          date: "2021-06-08",
        },

        {
          id: 257000,
          parentId: 250000,
          name: "Test96",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 258000,
          parentId: 250000,
          name: "Test97",
          type: "js",
          size: 1024,
          date: "2021-06-01",
        },

        {
          id: 260000,
          parentId: null,
          name: "vue 从入门到精通98",
          type: "avi",
          size: 224,
          date: "2020-10-06",
        },

        {
          id: 261000,
          parentId: 260000,
          name: "vue 从入门到精通99",
          type: "avi",
          size: 224,
          date: "2020-10-01",
        },

        {
          id: 261100,
          parentId: 261000,
          name: "vue 从入门到精通100",
          type: "avi",
          size: 224,
          date: "2020-10-01",
        },

        {
          id: 261200,
          parentId: 261000,
          name: "vue 从入门到精通101",
          type: "avi",
          size: 224,
          date: "2020-10-04",
        },

        {
          id: 262000,
          parentId: 260000,
          name: "vue 从入门到精通102",
          type: "avi",
          size: 224,
          date: "2020-10-01",
        },

        {
          id: 262100,
          parentId: 262000,
          name: "vxe-table test abc103",
          type: "avi",
          size: 224,
          date: "2020-10-01",
        },

        {
          id: 262200,
          parentId: 262000,
          name: "vue 从入门到精通104",
          type: "avi",
          size: 224,
          date: "2020-10-03",
        },

        {
          id: 262300,
          parentId: 262000,
          name: "vue 从入门到精通105",
          type: "avi",
          size: 224,
          date: "2020-10-01",
        },

        {
          id: 263000,
          parentId: 260000,
          name: "vue 从入门到精通106",
          type: "avi",
          size: 224,
          date: "2020-10-01",
        },

        {
          id: 264000,
          parentId: 260000,
          name: "vxe-table test abc107",
          type: "avi",
          size: 224,
          date: "2020-10-01",
        },

        {
          id: 270000,
          parentId: null,
          name: "vue 从入门到精通108",
          type: "avi",
          size: 224,
          date: "2020-10-01",
        },

        {
          id: 280000,
          parentId: null,
          name: "vue 从入门到精通109",
          type: "avi",
          size: 224,
          date: "2020-09-01",
        },

        {
          id: 290000,
          parentId: null,
          name: "vxe-table test abc110",
          type: "avi",
          size: 224,
          date: "2020-10-01",
        },

        {
          id: 300000,
          parentId: null,
          name: "vue 从入门到精通111",
          type: "avi",
          size: 224,
          date: "2020-10-01",
        },

        {
          id: 310000,
          parentId: null,
          name: "vue 从入门到精通112",
          type: "avi",
          size: 224,
          date: "2020-10-01",
        },

        {
          id: 320000,
          parentId: null,
          name: "vue 从入门到精通113",
          type: "avi",
          size: 224,
          date: "2020-10-01",
        },

        {
          id: 321000,
          parentId: 320000,
          name: "vue 从入门到精通114",
          type: "avi",
          size: 224,
          date: "2020-10-01",
        },

        {
          id: 322000,
          parentId: 320000,
          name: "vue 从入门到精通115",
          type: "avi",
          size: 224,
          date: "2020-10-01",
        },

        {
          id: 323000,
          parentId: 320000,
          name: "vue 从入门到精通116",
          type: "avi",
          size: 224,
          date: "2020-10-01",
        },

        {
          id: 324000,
          parentId: 320000,
          name: "vue 从入门到精通117",
          type: "avi",
          size: 224,
          date: "2020-10-01",
        },

        {
          id: 325000,
          parentId: 320000,
          name: "vxe-table test abc118",
          type: "avi",
          size: 224,
          date: "2020-10-01",
        },

        {
          id: 326000,
          parentId: 320000,
          name: "vue 从入门到精通119",
          type: "avi",
          size: 224,
          date: "2020-10-01",
        },

        {
          id: 327000,
          parentId: 320000,
          name: "vue 从入门到精通120",
          type: "avi",
          size: 224,
          date: "2020-10-01",
        },

        {
          id: 328000,
          parentId: 320000,
          name: "vue 从入门到精通121",
          type: "avi",
          size: 224,
          date: "2020-10-01",
        },

        {
          id: 329000,
          parentId: 320000,
          name: "vue 从入门到精通122",
          type: "avi",
          size: 224,
          date: "2020-10-01",
        },

        {
          id: 329100,
          parentId: 329000,
          name: "vxe-table test abc123",
          type: "avi",
          size: 224,
          date: "2020-10-01",
        },

        {
          id: 329200,
          parentId: 329000,
          name: "vue 从入门到精通124",
          type: "avi",
          size: 224,
          date: "2020-10-01",
        },

        {
          id: 329300,
          parentId: 329000,
          name: "vue 从入门到精通125",
          type: "avi",
          size: 224,
          date: "2020-10-01",
        },

        {
          id: 329400,
          parentId: 329000,
          name: "vue 从入门到精通125",
          type: "avi",
          size: 224,
          date: "2020-10-01",
        },

        {
          id: 329500,
          parentId: 329000,
          name: "vue 从入门到精通126",
          type: "avi",
          size: 224,
          date: "2020-10-01",
        },

        {
          id: 329600,
          parentId: 329000,
          name: "vue 从入门到精通127",
          type: "avi",
          size: 224,
          date: "2020-10-01",
        },

        {
          id: 329700,
          parentId: 329000,
          name: "vue 从入门到精通128",
          type: "avi",
          size: 224,
          date: "2020-10-01",
        },

        {
          id: 329800,
          parentId: 329000,
          name: "vue 从入门到精通129",
          type: "avi",
          size: 224,
          date: "2020-10-01",
        },

        {
          id: 329810,
          parentId: 329800,
          name: "vxe-table test abc130",
          type: "avi",
          size: 224,
          date: "2020-10-01",
        },

        {
          id: 329820,
          parentId: 329800,
          name: "vue 从入门到精通131",
          type: "avi",
          size: 224,
          date: "2020-10-01",
        },

        {
          id: 329830,
          parentId: 329800,
          name: "vue 从入门到精通132",
          type: "avi",
          size: 224,
          date: "2020-10-01",
        },

        {
          id: 329840,
          parentId: 329800,
          name: "vue 从入门到精通133",
          type: "avi",
          size: 224,
          date: "2020-10-01",
        },

        {
          id: 330000,
          parentId: null,
          name: "vue 从入门到精通134",
          type: "avi",
          size: 224,
          date: "2020-10-01",
        },

        {
          id: 331000,
          parentId: null,
          name: "vue 从入门到精通135",
          type: "avi",
          size: 224,
          date: "2020-10-01",
        },
      ],
      tableData3: [
        {
          id: 10001,
          name: "Test1",
          role: "Develop",
          sex: "Man",
          age: 28,
          address: "test abc",
        },
        {
          id: 10002,
          name: "Test2",
          role: "Test",
          sex: "Women",
          age: 22,
          address: "Guangzhou",
        },
        {
          id: 10003,
          name: "Test3",
          role: "PM",
          sex: "Man",
          age: 32,
          address: "Shanghai",
        },
        {
          id: 10004,
          name: "Test4",
          role: "Designer",
          sex: "Women",
          age: 23,
          address: "test abc",
        },
        {
          id: 10005,
          name: "Test5",
          role: "Develop",
          sex: "Women",
          age: 30,
          address: "Shanghai",
        },
        {
          id: 10006,
          name: "Test6",
          role: "Designer",
          sex: "Women",
          age: 21,
          address: "test abc",
        },
        {
          id: 10007,
          name: "Test7",
          role: "Test",
          sex: "Man",
          age: 29,
          address: "test abc",
        },
        {
          id: 10008,
          name: "Test8",
          role: "Develop",
          sex: "Man",
          age: 35,
          address: "test abc",
        },
      ],
      loading: false,
      tablePage: {
        currentPage: 1,
        pageSize: 10,
        totalResult: 0,
      },
      sexOptions: [
        { label: "男生", value: "1" },
        { label: "女生", value: "0" },
      ],
      ageOptions: [{ data: "" }],
      roleOptions: [{ data: "" }],
      roleList: ["", "Develop", "PM", "Test"],
      isStripe: false,
      isColStypeCustom: false,
    };
  },
  // 高亮代码的自定义方法
  directives: {
    highlightjs: {
      bind: (el) => {
        let blocks = el.querySelectorAll("pre code");
        blocks.forEach((block) => {
          hljs.highlightBlock(block);
        });
      },
    },
  },
  created() {
    this.$nextTick(() => {
      // 手动将表格和工具栏进行关联
      this.$refs.xTable1.connect(this.$refs.xToolbar1);
    });
    this.initData();
  },
  mounted() {
    //设置滚动跟随
    setFollow(this);
    hljs.highlightAll()
  },
  beforeDestroy() {
    //取消滚动跟随
    unsetFollow(this);
  },
  methods: {
    toggleFixedColumn(field, type) {
      const xTable = this.$refs.xTable3;
      const column = xTable.getColumnByField(field);
      const groupFixed = column.fixed ? null : type;
      // 将分组整体设置固定列
      XEUtils.eachTree([column], (column) => {
        column.fixed = groupFixed;
      });
      // 刷新列
      xTable.refreshColumn();
    },
    // 开启斑马纹
    onStripe() {
      this.isStripe = !this.isStripe;
    },
    // 开启单元格式自定义
    colStypeCustom() {
      this.isColStypeCustom = !this.isColStypeCustom;
    },
    filterAgeRecoverMethod({ option }) {
      // 如果是自定义筛选模板，当为点击确认时，该选项将被恢复为默认值
      option.data = "";
    },
    filterAgeMethod({ option, row }) {
      return row.age === Number(option.data);
    },
    filterRoleMethod({ option, row }) {
      return row.role === option.data;
    },
    checkColumnMethod({ column }) {
      // 通过获取dom的方法去把工具栏配置列,序号和复选框删除.
      this.$nextTick(() => {
        const elementClass = document.querySelector(".vxe-table-custom--body");
        if(elementClass){
          const listItem= elementClass.querySelectorAll('li')
          listItem.forEach(item=>{
            if(item.innerText == '序号'){
              item.style.display = 'none'
            }
            if(item.innerText == "　"){
              item.style.display = 'none'
            }
          })
            }
      });
      return true;
    },
    resizableChangeEvent() {
      const columns = this.$refs.xTable1.getColumns();
      const customData = columns.map((column) => {
        return {
          width: column.renderWidth,
        };
      });
    },
    // 数据初始化
    initData() {
      this.loading = true;
      setTimeout(() => {
        const list = [
          {
            id: 10001,
            name: "Test1",
            nickname: "T1",
            role: "Develop",
            sex: "1",
            age: 28,
            address: "Shenzhen",
          },
          {
            id: 10002,
            name: "Test2",
            nickname: "T2",
            role: "Test",
            sex: "0",
            age: 22,
            address: "Guangzhou",
          },
          {
            id: 10003,
            name: "Test3",
            nickname: "T3",
            role: "PM",
            sex: "1",
            age: 32,
            address: "Shanghai",
          },
          {
            id: 10004,
            name: "Test4",
            nickname: "T4",
            role: "Designer",
            sex: "0",
            age: 23,
            address: "Shenzhen",
          },
          {
            id: 10005,
            name: "Test5",
            nickname: "T5",
            role: "Develop",
            sex: "0",
            age: 30,
            address: "Shanghai",
          },
          {
            id: 10006,
            name: "Test6",
            nickname: "T6",
            role: "Develop",
            sex: "0",
            age: 27,
            address: "Shanghai",
          },
          {
            id: 10007,
            name: "Test7",
            nickname: "T1",
            role: "Develop",
            sex: "1",
            age: 28,
            address: "Shenzhen",
          },
          {
            id: 10008,
            name: "Test8",
            nickname: "T2",
            role: "Test",
            sex: "0",
            age: 22,
            address: "Guangzhou",
          },
          {
            id: 10009,
            name: "Test9",
            nickname: "T3",
            role: "PM",
            sex: "1",
            age: 32,
            address: "Shanghai",
          },
          {
            id: 100010,
            name: "Test10",
            nickname: "T4",
            role: "Designer",
            sex: "0",
            age: 23,
            address: "Shenzhen",
          },
          {
            id: 100011,
            name: "Test11",
            nickname: "T5",
            role: "PM",
            sex: "0",
            age: 35,
            address: "Shenzhen",
          },
          {
            id: 100012,
            name: "Test12",
            nickname: "T6",
            role: "Designer",
            sex: "1",
            age: 25,
            address: "Shanghai",
          },
          {
            id: 100013,
            name: "Test13",
            nickname: "T9",
            role: "Develop",
            sex: "1",
            age: 33,
            address: "Shenzhen",
          },
          {
            id: 100014,
            name: "Test14",
            nickname: "T6",
            role: "Develop",
            sex: "0",
            age: 21,
            address: "Shanghai",
          },
          {
            id: 100015,
            name: "Test15",
            nickname: "T6",
            role: "Develop",
            sex: "0",
            age: 19,
            address: "Shanghai",
          },
          {
            id: 100016,
            name: "Test16",
            nickname: "T8",
            role: "Develop",
            sex: "1",
            age: 29,
            address: "Shenzhen",
          },
        ];
        this.loading = false;
        this.tablePage.totalResult = list.length;
        this.tableData = list.slice(
          (this.tablePage.currentPage - 1) * this.tablePage.pageSize,
          this.tablePage.currentPage * this.tablePage.pageSize
        );
      }, 300);
    },
    /** 分页器翻页事件事件 */
    handlePageChange({ currentPage, pageSize }) {
      this.tablePage.currentPage = currentPage;
      this.tablePage.pageSize = pageSize;
      this.initData();
    },
    // 设置表格高度
    setTableHeight(val) {
      this.tableHeight = Number(val.value);
    },
    isShow() {
      this.show = !this.show;
    },
    isShow1() {
      this.show1 = !this.show1;
    },
    isShow2() {
      this.show2 = !this.show2;
    },
    headerCellStyle({ column }) {
      if (column.field === "name" && this.isColStypeCustom) {
        return {
          backgroundColor: "#f60",
          color: "#ffffff",
        };
      }
    },
    rowStyle({ rowIndex }) {
      if ([2, 3, 5].includes(rowIndex) && this.isColStypeCustom) {
        return {
          backgroundColor: "red",
          color: "#ffffff",
        };
      }
    },
    cellStyle({ row, column }) {
      if (column.field === "sex" && this.isColStypeCustom) {
        if (row.sex >= "1") {
          return {
            backgroundColor: "#187",
          };
        } else if (row.age === 26) {
          return {
            backgroundColor: "#2db7f5",
          };
        }
      }
    },
  },
};
</script>
<style lang="less" scoped>
.main {
  padding: 20px;
  .title {
    font-size: 20px;
    margin-bottom: 20px;
    // margin-left: 15px;
  }
  .valShow {
    margin-bottom: 10px;
  }
  .card {
    padding: 20px 20px 40px 20px;
    border: 1px solid #ebebeb;
    border-radius: 3px;
    transition: 0.2s;
  }
  .demo-block-control {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #eaeefb;
    height: 44px;
    box-sizing: border-box;
    background-color: #fff;
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
    text-align: center;
    margin-top: -1px;
    color: #d3dce6;
    cursor: pointer;
    position: relative;
    .demo-block-control > span {
      position: absolute;
      transform: translateX(-30px);
      font-size: 14px;
      line-height: 44px;
      transition: 0.3s;
      display: inline-block;
    }
    i.hovering {
      transform: translateX(-10px);
    }
  }
  .demo-block-control:hover {
    color: #409eff;
  }
  .demo-block-control.is-fixed {
    position: fixed;
    bottom: 0;
    width: calc(100% - 295px);
  }
  .el-icon-caret-bottom {
    font-size: 16px;
    line-height: 44px;
    transition: 0.3s;
  }
  .el-icon-caret-bottom:before {
    content: "\e790";
  }
  .hljs {
    font-family: Menlo, Monaco, Consolas, Courier, monospace;
    font-size: 14px;
    padding: 0px 24px 0 110px;
    background-color: #fafafa;
    border-radius: 4px;
    -webkit-font-smoothing: auto;
  }
}
pre {
  background-color: #f8f8f8;
  margin: 0;
  overflow-x: auto;
}
code {
  font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
  font-size: 13px;
  color: #333;
}
/deep/ .el-card__body {
  padding: 15px;
}
.code-css {
  position: relative;
  top: 0px;
  left: -80px;
  font-size: 18px;
}
.show-content {
  display: none;
}
.show:hover .show-content {
  display: block;
}
.my-select {
  margin: 10px;
  width: 100px;
  height: 32px;
}
.my-input {
  margin: 10px;
  width: 140px;
  height: 32px;
}
</style>
