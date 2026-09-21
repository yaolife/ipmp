<template>
  <div class="cud-commom-form-style">
    <div class="cud__scroll--div">
      <el-card class="no-padding" style="margin-bottom: 0px !important;">
        <div class="banner" :style="{ backgroundImage: 'url(' + require('@/assets/img/home/banner.png') +')' }">
          <div class="icon">
            <img :src="require('@/assets/img/home/w.svg')" alt="" />
          </div>
          <div class="weather">
            <div class="city">{{ city }} {{ weather }}</div>
            <div class="temperature">{{ tempLow }} - {{ tempHigh }}</div>
          </div>
          <div class="datetime">
            <div class="date">{{ date }}</div>
            <div class="time">{{ time }}</div>
          </div>
          <div class="tips">{{ tips }}</div>
        </div>
      </el-card>
      <el-row :gutter="0">
        <el-col :span="18" style="position: relative;">
          <el-card class="no-padding">
            <el-tabs type="card" v-model="activeName2" class="task-tabs">
              <el-tab-pane label="" name="first">
                <div slot="label">
                  <span>我的待办({{ taskCount[0] }})</span>
                </div>
                <task-list :taskType="1" :taskCount="taskCount[0]" @updateCount="updateCount" :tableHeight="tableHeight"></task-list>
              </el-tab-pane>
              <el-tab-pane label="" name="second">
                <div slot="label">
                  <span>我的已办({{ taskCount[1] }})</span>
                </div>
                <task-list :taskType="2" :taskCount="taskCount[1]" @updateCount="updateCount" :tableHeight="tableHeight"></task-list>
              </el-tab-pane>
              <el-tab-pane label="" name="third">
                <div slot="label">
                  <span>我的待阅({{ taskCount[2] }})</span>
                </div>
                <task-list :taskType="3" :taskCount="taskCount[2]" @updateCount="updateCount" :tableHeight="tableHeight"></task-list>
              </el-tab-pane>
              <el-tab-pane label="" name="fourth">
                <div slot="label">
                  <span>我的已阅({{ taskCount[3] }})</span>
                </div>
                <task-list :taskType="4" :taskCount="taskCount[3]" @updateCount="updateCount" :tableHeight="tableHeight"></task-list>
              </el-tab-pane>
            </el-tabs>
          </el-card>
          <div class="task-tab-right">
            <el-input v-model="searchInput" size="small" suffix-icon="el-icon-search" class="task-search"></el-input>
            <!-- <div class="task-display">
              <el-button type="text" size="small">
                <i class="el-icon-tickets"></i>
              </el-button>
              <el-button type="text" size="small">
                <i class="el-icon-menu"></i>
              </el-button>
            </div> -->
          </div>
        </el-col>
        <el-col :span="6">
          <el-card style="margin-left: 0px !important;">
            <div slot="header" class="card-title">
              <span>日程安排</span>
              <el-button type="text" size="small" class="card-btn-right"><i class="el-icon-plus"></i> 添加日程</el-button>
            </div>
            <el-row :gutter="10">
              <el-col :span="12">
                <el-select size="small" v-model="year">
                  <el-option v-for="item in yearList" :key="item.value" :value="item.value" :label="item.label"></el-option>
                </el-select>
              </el-col>
              <el-col :span="12">
                <el-select size="small" v-model="month">
                  <el-option v-for="item in monthList" :key="item.value" :value="item.value" :label="item.label"></el-option>
                </el-select>
              </el-col>
            </el-row>
            <el-calendar v-model="calendar"></el-calendar>
          </el-card>
          <el-card style="margin-left: 0px !important;">
            <el-tabs v-model="activeName" class="card-tabs">
              <el-tab-pane label="我的日程" name="first">
                <ul class="card-list" :style="{ height: rightHeight + 'px', overflowY: 'scroll' }">
                  <li>
                    <p>今天要开早会和领导沟通预算金额与决策的事...</p>
                    <span>08:30-12:00</span>
                  </li>
                  <li>
                    <p>年中汇报材料整理</p>
                    <span>14:30-16:00</span>
                  </li>
                  <li>
                    <p>维修费用结算事项</p>
                    <span>16:30-18:00</span>
                  </li>
                  <li>
                    <p>办公室5S检查</p>
                    <span>18:30-19:00</span>
                  </li>
                  <li>
                    <p>CUD4.2系统讨论</p>
                    <span>全天</span>
                  </li>
                </ul>
              </el-tab-pane>
              <el-tab-pane label="我的安排" name="second">
                  <ul class="card-list" :style="{ height: rightHeight + 'px', overflowY: 'scroll' }">
                    <li>
                      <p>暂无安排</p>
                      <span>08:30-17:30</span>
                    </li>
                  </ul>
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import breadcrumb from '@/components/common/breadcrumb';
import taskList from '../components/taskList';
import * as Utils from "@/utils/Utils";
import {throttle} from '../../../utils/funcUtil'

export default {
  name: "office",
  components: {
    breadcrumb,
    taskList
  },
  data() {
    return {
      hasIcon: false,
      brand: [
          { name: 'workbench.workbench' },
          { name: 'workbench.my_office' }
      ],
      tableHeight: 0,
      rightHeight: 0,

      city: '深圳',
      weather: '晴',
      tempLow: '29℃',
      tempHigh: '32℃',
      date: '',    // 当前时间
      time: '',    // 当前时间
      timer: null, // 更新时间的定时器
      tips: '',    // 提示
      taskCount: [0, 0, 0, 0],
      activeName: 'first',
      activeName2: 'first',
      calendar: new Date(),
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      yearList: [],
      monthList: [],
      searchInput: '',
    };
  },
  mounted(){
    this.getTime();
    this.timer = setInterval(()=>{
      this.getTime();
    }, 1000)
    //日历
    this.initCalenList();
    this.initMaxHeight();
    // throttleFunc记录当前的节流方法，用于在页面销毁时释放
    this.throttleFunc = throttle(this.initMaxHeight, 500);
    window.addEventListener("resize", this.throttleFunc);
  },
  beforeDestroy(){
    clearInterval(this.timer);
    window.removeEventListener("resize", this.throttleFunc);
  },
  methods: {
    //调整高度
    initMaxHeight() {
      this.$nextTick(() => {
        let pageHeight = document.documentElement.clientHeight || document.body.clientHeight;
        // 根据缩放比例调整 $root.zoom 来自个人中心界面缩放
        pageHeight = this.$root.zoom ? pageHeight / (this.$root.zoom / 100) : pageHeight;

        let tableHeight = pageHeight;
        // 查询位置
        let tableBlock = this.$el.querySelector(".task-tabs");
        if (tableBlock) {
          let rect = tableBlock.getBoundingClientRect();
          if (rect.top > 0) {
            tableHeight -= rect.top;
          }
        }
        let rightHeight = pageHeight;
        // 查询位置
        let rightBlock = this.$el.querySelector(".card-tabs");
        if (rightBlock) {
          let rect = rightBlock.getBoundingClientRect();
          if (rect.top > 0) {
            rightHeight -= rect.top;
          }
        }
        this.tableHeight = tableHeight - 115;
        this.rightHeight = rightHeight - 93;
      })
    },
    //初始化日历数据
    initCalenList() {
      this.yearList = [];
      for(let i = this.year -50; i < this.year + 50; i++) {
        this.yearList.push({
          label: i + '年',
          value: i
        })
      }
      this.monthList = [];
      for(let i = 1; i <= 12; i++) {
        this.monthList.push({
          label: i + '月',
          value: i
        })
      }
    },
    //格式化时间
    getTime() {
      const date = new Date();
      let isZH = this.$i18n.locale === "zh-CN"
      let dateZh = date.getFullYear() + '年' + (date.getMonth()+1) + '月' + date.getDate() + '日 ';
      let dateEn = date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate()+ ' ';

      let week = '';
      switch (date.getDay()) {
        case 0:
          week = isZH ? '星期日' : 'Sunday'
          break
        case 1:
          week = isZH ? '星期一' : 'Monday'
          break
        case 2:
          week = isZH ? '星期二' : 'Tuesday'
          break
        case 3:
          week = isZH ? '星期三' : 'Wednesday'
          break
        case 4:
          week = isZH ? '星期四' : 'Thursday'
          break
        case 5:
          week = isZH ? '星期五' : 'Friday'
          break
        case 6:
          week = isZH ? '星期六' : 'Saturday'
          break
      }
      let hours  = date.getHours();
      let minutes = date.getMinutes();
      let seconds = date.getSeconds();
      let time = (hours >= 10 ? hours : '0' + hours) + ' : ' + (minutes >= 10 ? minutes : '0' + minutes) + ' : ' + (seconds >= 10 ? seconds : '0' + seconds);

      this.date = isZH ? dateZh + week : dateEn + week;
      this.time = time;
      this.tips = (hours > 12 ? '下午' : '上午') + '好，喝杯茶，让精神抖擞起来！'
    },
    //更新任务数量
    updateCount(taskType, num) {
      this.taskCount[taskType - 1] = num;
    },
  }
}
</script>

<style lang="less" scoped>
/deep/ .no-padding .el-card__body {
  padding: 0;
}
.banner {
  width: 100%;
  height: 140px;
  background-size: 100% 100%;
  .icon {
    float: left;
    margin-left: 70px;
    margin-top: 45px;
    width: 70px;
    height: 70px;
  }
  .weather {
    float: left;
    margin-left: 20px;
    margin-top: 40px;
    width: 100px;
    color: #FFF;
    font-size: 18px;
  }
  .temperature {
    margin-top: 10px;
  }
  .datetime {
    float: left;
    margin-left: 40px;
    padding-left: 40px;
    margin-top: 40px;
    color: #FFF;
    border-left: 1px solid rgba(255, 255, 255, 0.5);
  }
  .date {
    font-size: 14px;
  }
  .time {
    padding-top: 10px;
    font-size: 28px;
    line-height: 28px;
  }
  .tips {
    float: right;
    padding-right: 40px;
    padding-top: 20px;
    font-size: 16px;
    color: #FFF;
  }
}
/deep/ .task-tabs {
  margin: 0 !important;

  .el-tabs__header {
    height: 50px;
    margin: 0 0 10px;
  }
  .el-tabs__item {
    font-size: 15px;
    color: #999;
    margin-top: 10px;
    margin-left: 10px;
    padding: 0 15px;
  }
  .el-tabs__item.is-active {
    border: 1px solid #eee;
    border-bottom: none;
    border-radius: 5px 5px 0 0;
    color: #0775DB;
    font-weight: bold;
    height: 41px;
    background-color: #fff;
  }
  .el-tabs__content {

  }
}
/deep/ .el-card__header {
  border-bottom: none;
  padding-bottom: 0 !important;
}
.card-title {
  padding-top: 5px;
  font-size: 15px;
  font-weight: bold;
  border-bottom: none;
}
.card-btn-right {
  float: right;
  margin-top: -5px;
}
/deep/ .el-calendar {
  .el-calendar__header {
    display: none;
  }
  .el-calendar__body {
    padding: 10px 0;
  }
}
/deep/ .card-tabs {
  margin: 0 !important;
  .el-tabs__item {
    font-size: 15px;
    font-weight: bold;
  }
}
.card-list {
  padding-left: 20px;
  list-style: circle;
  li {
    padding-bottom: 5px;
  }
  p {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    margin-bottom: 0px;
  }
  span {
    margin-bottom: 10px;
    font-size: 12px;
    color: #999;
  }
}
.task-tab-right {
  width: 210px;
  position: absolute;
  top: 22px;
  right: 10px;
  /deep/.task-search {
    float: left;
    width: 200px;
    .el-input__inner {
      height: 30px;
      border: 1px solid rgba(236, 240, 249, 1);
      border-radius: 5px;
    }
    .el-input__suffix {
      margin-right: -5px;
      padding: 0px 5px;
      color: #0775DB;
      background-color: rgba(236, 240, 249, 1);
      border-radius: 0 5px 5px 0;
      cursor: pointer;
      transition: none;
    }
    .el-input__suffix:hover {
      color: #fff;
      background-color: #0775DB;
    }
  }
  .task-display {
    float: right;
    width: 60px;
    .el-button {
      font-size: 20px;
      padding-top: 5px;
    }
  }
}
</style>
