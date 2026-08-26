<template>
  <div>
    <div class="arrow">
      <div @click="changeMonth(-1)">
        <i class="el-icon-arrow-left"></i>
      </div>
      <div @click="changeMonth(1)">
        <i class="el-icon-arrow-right"></i>
      </div>
    </div>
    <el-calendar v-model="selDay">
      <template slot="dateCell" slot-scope="{ data }">
        {{ data.day.split("-").slice(2).join("-") }}
        <template v-for="(item, index) in scheduleData">
          <div
            class="iStar"
            :key="index"
            v-if="item.workingDay.indexOf(data.day) != -1"
          ></div>
        </template>
      </template>
    </el-calendar>
    <div class="msLint" v-for="(item, index) in msLint" :key="index">
      <div class="icon"><i class="el-icon-date"></i></div>
      <div>
        <div>{{ item.workingDay }}</div>
        <div class="itemContent">{{ item.content }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Calendar",
  data() {
    return {
      selDay: new Date(),
      msLint: [],
      scheduleData: [
        {
          workingDay: "2025-08-25",
          content: "111",
        },
        {
          workingDay: "2025-09-05",
          content: "121",
        },
        {
          workingDay: "2025-08-20",
          content: "131",
        },
      ],
    };
  },
  watch: {
    selDay(newVal) {
      this.fnShow(newVal);
    },
  },
  methods: {
    fnShow: function (date) {
      let dateTime = this.formatDate(date);
      this.msLint =
        this.scheduleData.filter((item) => item.workingDay == dateTime) || [];
    },

    formatDate: function (date) {
      var formatChangeDate = "YYYY-MM-DD";
      // 年
      formatChangeDate = formatChangeDate.replace(/YYYY/, date.getFullYear());
      // 月
      let month = date.getMonth() + 1;
      let monthStr = month < 10 ? "0" + month : month;
      formatChangeDate = formatChangeDate.replace(/MM/, monthStr);
      // 日
      let day = date.getDate();
      let dayStr = day < 10 ? "0" + day : day;
      formatChangeDate = formatChangeDate.replace(/DD/, dayStr);
      return formatChangeDate;
    },

    changeMonth: function (direction) {
      let newDate = new Date();
      newDate.setMonth(this.selDay.getMonth() + direction);
      this.selDay = newDate;
    },
  },
};
</script>

<style scoped lang="less">
.el-calendar {
  font-size: 12px;
  /deep/ .el-calendar__title {
    font-size: 16px;
    font-weight: 800;
  }

  /deep/ .el-calendar__button-group {
    display: none;
  }

  /deep/ .el-calendar-table thead {
    background-color: #ffffff;
    text-align: center;
  }

  /deep/ .el-calendar-table .el-calendar-day {
    height: 40px;
    position: relative;
    z-index: 99;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /deep/ .el-calendar-table .el-calendar-day:hover {
    background: none;
  }

  /deep/ .is-selected {
    position: relative;
    background: none;
  }

  /deep/ .el-calendar-day:hover::after,
  /deep/ .is-selected::after {
    content: "";
    position: absolute;
    width: 25px;
    height: 25px;
    background: #bce6fb;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 50%;
  }

  /deep/ .el-calendar-day:hover::after {
    z-index: -1;
  }

  /deep/ .el-calendar-table td {
    border: none;
  }

  .iStar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }

  .iStar::after {
    content: "";
    position: absolute;
    top: 90%;
    transform: translate(-50%);
    left: 50%;
    width: 7px;
    height: 7px;
    background-color: #10ec64;
    border-radius: 50%;
  }
}

.msLint {
  font-size: 16px;
  padding: 0 20px;
  margin: 0;
  display: flex;
  .icon {
    margin-right: 0.5em;
  }
  .itemContent {
    margin: 0;
    color: #afafaf;
  }
}

.arrow {
  display: flex;
  position: absolute;
  top: 10px;
  right: 20px;
  div:hover {
    cursor: pointer;
  }
  i {
    font-size: 24px;
  }
}
</style>