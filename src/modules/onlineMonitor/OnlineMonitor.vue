<template>
  <div class="online-monitor" :class="{ 'is-fill': fill }" v-loading="trendLoading">
    <div class="monitor-toolbar">
      <el-autocomplete
        v-model="pointName"
        class="point-search"
        size="small"
        clearable
        :fetch-suggestions="pointNameSearchAsync"
        placeholder="请输入测点关键词"
        popper-class="trend-autocomplete"
        @select="pointNameHandleSelect"
      ></el-autocomplete>
      <div class="toolbar-row">
        <el-radio-group v-model="typeSelected" size="mini" @change="typeSelectChang">
          <el-radio-button label="实时"></el-radio-button>
          <el-radio-button label="回溯"></el-radio-button>
        </el-radio-group>
        <div class="date-term">
          <el-date-picker
            v-model="dateHistory"
            clearable
            size="small"
            type="datetimerange"
            value-format="yyyy-MM-dd HH:mm:ss"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            @change="historyChange"
          ></el-date-picker>
          <el-button
            size="small"
            icon="el-icon-search"
            @click="dateHistoryChange"
          ></el-button>
        </div>
        <el-select
          v-model="timeRadioButton"
          size="small"
          style="width: 120px"
          @change="timeChange"
        >
          <el-option label="默认" value="0"></el-option>
          <el-option label="自定义" value="自定义"></el-option>
          <el-option label="1时" value="1"></el-option>
          <el-option label="8时" value="8"></el-option>
          <el-option label="1天" value="24"></el-option>
          <el-option label="3天" value="72"></el-option>
          <el-option label="7天" value="168"></el-option>
          <el-option label="15天" value="360"></el-option>
          <el-option label="30天" value="720"></el-option>
        </el-select>
        <el-button-group class="tool-group">
          <el-tooltip content="量程自适应" placement="bottom">
            <el-button
              size="mini"
              :type="autoRange ? 'primary' : ''"
              icon="el-icon-s-data"
              @click="autoRangeChange"
            ></el-button>
          </el-tooltip>
          <el-tooltip content="前滚" placement="bottom">
            <el-button
              size="mini"
              icon="el-icon-d-arrow-left"
              :disabled="!dateHistory || dateHistory.length === 0"
              @click="timeScrolling(true)"
            ></el-button>
          </el-tooltip>
          <el-tooltip content="后滚" placement="bottom">
            <el-button
              size="mini"
              icon="el-icon-d-arrow-right"
              :disabled="!dateHistory || dateHistory.length === 0"
              @click="timeScrolling(false)"
            ></el-button>
          </el-tooltip>
          <el-tooltip :content="ifShowPause ? '暂停' : '播放'" placement="bottom">
            <el-button
              size="mini"
              :icon="ifShowPause ? 'el-icon-video-pause' : 'el-icon-video-play'"
              :disabled="typeSelected === '回溯'"
              @click="trendPausePlay"
            ></el-button>
          </el-tooltip>
          <el-tooltip content="下载" placement="bottom">
            <el-button size="mini" icon="el-icon-download" @click="saveImg"></el-button>
          </el-tooltip>
          <el-tooltip content="导出查询测点数据" placement="bottom">
            <el-button
              size="mini"
              icon="el-icon-tickets"
              @click="exportPointData('exportPointData')"
            ></el-button>
          </el-tooltip>
          <el-tooltip content="导出查询测点数据（附原始数据）" placement="bottom">
            <el-button
              size="mini"
              icon="el-icon-document"
              @click="exportPointData('exportPointDataWithTrue')"
            ></el-button>
          </el-tooltip>
        </el-button-group>
        <el-tooltip content="背景色" placement="bottom">
          <el-color-picker
            v-model="trendBgColor"
            size="small"
            @change="trendBgColorChange"
          ></el-color-picker>
        </el-tooltip>
      </div>
    </div>
    <div class="trend-box" :id="boxId" ref="trendBox">
      <el-table
        class="trend-point-table"
        :class="{ 'is-empty': !trendPointListData || !trendPointListData.length }"
        :data="trendPointListData"
        :height="trendPointListHeight"
        empty-text="暂无数据"
        size="mini"
        style="width: 100%"
      >
        <el-table-column width="42" align="center">
          <template slot-scope="scope">
            <input
              type="checkbox"
              v-model="scope.row.KEY"
              @change="setHandleSelect(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="GN" label="点名" align="center" min-width="90" show-overflow-tooltip></el-table-column>
        <el-table-column prop="ED" label="描述" align="center" min-width="100" show-overflow-tooltip></el-table-column>
        <el-table-column label="颜色" align="center" width="58">
          <template slot-scope="scope">
            <el-color-picker
              v-model="scope.row.CO"
              size="mini"
              @change="colorPickerChange(scope.row)"
            ></el-color-picker>
          </template>
        </el-table-column>
        <el-table-column label="实时值" align="center" min-width="70">
          <template slot-scope="scope">
            <span>{{ formatNum(scope.row.AV) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="EU" label="单位" align="center" min-width="50"></el-table-column>
        <el-table-column label="最大" align="center" min-width="70">
          <template slot-scope="scope">
            <a class="link-num" :title="scope.row.MAXTIME" @click="maxSelect(scope.row)">{{
              formatNum(scope.row.MAXV)
            }}</a>
          </template>
        </el-table-column>
        <el-table-column label="最小" align="center" min-width="70">
          <template slot-scope="scope">
            <a class="link-num" :title="scope.row.MINTIME" @click="minSelect(scope.row)">{{
              formatNum(scope.row.MINV)
            }}</a>
          </template>
        </el-table-column>
        <el-table-column label="平均值" align="center" min-width="70">
          <template slot-scope="scope">
            <span>{{ formatNum(scope.row.AVGV) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="上限" align="center" min-width="70">
          <template slot-scope="scope">
            <el-input
              v-model="scope.row.ATV"
              size="mini"
              @focus="focusLimit(scope.row, 'TV')"
              @change="changeTV(scope.row)"
            ></el-input>
          </template>
        </el-table-column>
        <el-table-column label="下限" align="center" min-width="70">
          <template slot-scope="scope">
            <el-input
              v-model="scope.row.ABV"
              size="mini"
              @focus="focusLimit(scope.row, 'BV')"
              @change="changeBV(scope.row)"
            ></el-input>
          </template>
        </el-table-column>
        <el-table-column label="高限" align="center" min-width="70">
          <template slot-scope="scope">
            <el-input
              v-model="scope.row.AT"
              size="mini"
              @focus="focusLimit(scope.row, 'AT')"
              @change="changeAT(scope.row)"
            ></el-input>
          </template>
        </el-table-column>
        <el-table-column label="低限" align="center" min-width="70">
          <template slot-scope="scope">
            <el-input
              v-model="scope.row.AB"
              size="mini"
              @focus="focusLimit(scope.row, 'AB')"
              @change="changeAB(scope.row)"
            ></el-input>
          </template>
        </el-table-column>
        <el-table-column label="线宽" align="center" min-width="60">
          <template slot-scope="scope">
            <el-input v-model="scope.row.LW" size="mini" @change="changeLW(scope.row)"></el-input>
          </template>
        </el-table-column>
        <el-table-column v-if="typeSelected === '回溯'" label="删除" align="center" width="52">
          <template slot-scope="scope">
            <i class="el-icon-delete delete-btn" @click="trendPointDelete(scope.row)"></i>
          </template>
        </el-table-column>
      </el-table>
      <div class="canvas-box" ref="canvasBox">
        <canvas :id="canvasId"></canvas>
      </div>
    </div>
    <el-dialog
      title="增加标记内容"
      :visible.sync="markVisible"
      width="380px"
      append-to-body
    >
      <el-form label-width="80px" size="small">
        <el-form-item label="选择测点">
          <el-select v-model="markForm.point" style="width: 100%">
            <el-option label="全部" value="全部"></el-option>
            <el-option
              v-for="row in trendPointListData"
              :key="row.GN"
              :label="row.GN"
              :value="row.GN"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="标记内容">
          <el-input type="textarea" :rows="3" v-model="markForm.text"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button size="small" @click="markVisible = false">取消</el-button>
        <el-button size="small" type="primary" @click="confirmMark">确认</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { createTrendGroup } from "./trendEngine";
import {
  getPoint,
  getTag,
  exportTrendExcel,
  isCancel,
  createCancelSource
} from "./api";

var AUTO_POINT_LIMIT = 30;

function okCode(code) {
  return code === 0 || code === "0";
}

function formatClock(date) {
  if (window.$utils && window.$utils.formatDate) {
    return window.$utils.formatDate(date);
  }
  return "";
}

export default {
  name: "OnlineMonitor",
  props: {
    pointKeyword: {
      type: String,
      default: ""
    },
    extraKeyword: {
      type: String,
      default: ""
    },
    fill: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      canvasId: "trend_container_" + this._uid,
      boxId: "trend_box_" + this._uid,
      trendLoading: false,
      typeSelected: "实时",
      pointName: "",
      dateHistory: [],
      historyCache: [],
      timeRadioButton: "0",
      autoRange: false,
      trendPointListData: [],
      pointOriginalList: [],
      pointVisibilityByGN: {},
      trendPointLayoutSig: "",
      trendPointListHeight: 68,
      trendBgColor: "#000000",
      emptyText: "暂无数据",
      ifShowPause: false,
      startMark: null,
      defaultTV: "",
      defaultBV: "",
      defaultAT: "",
      defaultAB: "",
      reloadDatas: null,
      coordData: null,
      markVisible: false,
      markTime: "",
      markForm: {
        point: "全部",
        text: ""
      },
      trendGroup: null,
      _inflightKey: "",
      _cancel: null,
      _autoSeq: 0,
      _autoTimer: null,
      _loadedKey: ""
    };
  },
  watch: {
    pointKeyword: {
      immediate: true,
      handler() {
        this.scheduleAutoLoad();
      }
    },
    extraKeyword() {
      this.scheduleAutoLoad();
    },
    trendPointListData() {
      this.onTrendPointListDataChange();
    }
  },
  mounted() {
    window.thisVue = this;
    this.$nextTick(() => {
      this.initTrend();
      this.scheduleAutoLoad();
      setTimeout(this._onResize, 300);
    });
    this._onResize = () => {
      this.layoutTrend();
    };
    window.addEventListener("resize", this._onResize);
  },
  beforeDestroy() {
    this.clearPolling();
    if (this._autoTimer) {
      clearTimeout(this._autoTimer);
    }
    if (this._cancel) {
      this._cancel();
    }
    if (window.trend_Util && this.trendGroup) {
      window.trend_Util.stopFlush(this.trendGroup);
    }
    if (window.thisVue === this) {
      window.thisVue = null;
    }
    if (window.trendGroup === this.trendGroup) {
      window.trendGroup = null;
    }
    window.removeEventListener("resize", this._onResize);
  },
  methods: {
    formatNum(value) {
      var num = parseFloat(value);
      if (isNaN(num)) {
        return "";
      }
      return num.toFixed(3);
    },
    scheduleAutoLoad() {
      var self = this;
      if (this._autoTimer) {
        clearTimeout(this._autoTimer);
      }
      this._autoTimer = setTimeout(function() {
        self.autoLoadPoints();
      }, 120);
    },
    autoLoadPoints() {
      if (!this.trendGroup) {
        return;
      }
      var primary = (this.pointKeyword || "").trim();
      var extra = (this.extraKeyword || "").trim();
      var loadKey = primary + "|" + extra;
      if (!primary && !extra) {
        return;
      }
      if (loadKey === this._loadedKey) {
        return;
      }
      this._loadedKey = loadKey;
      var keys = [];
      if (primary) {
        keys.push(primary);
      }
      if (extra && extra !== primary) {
        keys.push(extra);
      }
      var seq = ++this._autoSeq;
      this.searchByKeys(keys, 0, seq);
    },
    searchByKeys(keys, index, seq) {
      var self = this;
      if (seq !== this._autoSeq) {
        return;
      }
      if (index >= keys.length) {
        this.emptyText = "暂无数据";
        return;
      }
      getTag(keys[index])
        .then(function(res) {
          if (seq !== self._autoSeq) {
            return;
          }
          var rows = self.normalizeTags(res);
          if (!rows.length) {
            self.searchByKeys(keys, index + 1, seq);
            return;
          }
          if (rows.length > AUTO_POINT_LIMIT) {
            rows = rows.slice(0, AUTO_POINT_LIMIT);
          }
          self.applyPointRows(rows);
        })
        .catch(function() {
          if (seq !== self._autoSeq) {
            return;
          }
          self.searchByKeys(keys, index + 1, seq);
        });
    },
    normalizeTags(res) {
      if (!res || !okCode(res.code) || !res.data) {
        return [];
      }
      var list = Array.isArray(res.data) ? res.data : [];
      return list.filter(function(row) {
        return row && (row.tagName || row.GN);
      });
    },
    applyPointRows(rows) {
      var pointList = {
        pointID: rows.map(function(row) {
          if (row.id != null && row.id !== "") {
            return row.id;
          }
          return row.tagName || row.GN;
        }),
        pointName: rows.map(function(row) {
          return row.tagName || row.GN || "";
        })
      };
      if (this.typeSelected === "实时") {
        this.ifShowPause = true;
        this.startPolling(pointList);
      } else {
        var range = this.getTrendQueryTimeRange();
        this.obtainPoint(pointList, range[0], range[1]);
      }
    },
    initTrend() {
      var self = this;
      window.thisVue = this;
      this.trendGroup = createTrendGroup(this.canvasId);
      window.trendGroup = this.trendGroup;
      this.trendGroup.adaptive = false;
      this.trendGroup.isDialog = true;
      this.trendGroup.trendcontainer = this.canvasId;
      this.trendGroup.onRightMark = function(time) {
        self.openMark(time);
      };
      this.trendGroup.on("pointInfoLoad", function(data) {
        var normalized = (data || []).map(function(row) {
          var checked = !(
            row &&
            (row.CK === true || row.CK === "true" || row.CK === 1 || row.CK === "1")
          );
          if (row && row.KEY === true) {
            checked = true;
          }
          if (row && row.KEY === false) {
            checked = false;
          }
          if (
            row &&
            row.GN &&
            self.pointVisibilityByGN &&
            typeof self.pointVisibilityByGN[row.GN] !== "undefined"
          ) {
            checked = !!self.pointVisibilityByGN[row.GN];
          } else if (row && row.GN) {
            self.pointVisibilityByGN[row.GN] = checked;
          }
          row.KEY = checked;
          row.CK = !checked;
          return row;
        });
        self.pointOriginalList = normalized;
        self.trendPointListData = normalized.slice();
      });
      this.trendGroup.on("moveCanvasTimeHis", function() {
        var from = window.trend_Util && window.trend_Util._from_;
        var to = window.trend_Util && window.trend_Util._to_;
        if (window.trend_Util) {
          window.trend_Util._from_ = "";
          window.trend_Util._to_ = "";
        }
        if (from && to && String(from).indexOf("NaN") === -1 && String(to).indexOf("NaN") === -1) {
          self.dateHistory = [from, to];
          self.timeRadioButton = "自定义";
          self.changeTime();
        }
      });
      this.trendGroup.containerHeightFn = function() {
        var el = self.$refs.canvasBox;
        var height = el && el.clientHeight ? el.clientHeight : 280;
        return Math.max(180, height);
      };
      this.trendGroup.containerWidthFn = function() {
        var el = self.$refs.canvasBox;
        return el && el.clientWidth ? el.clientWidth : 0;
      };
      this.layoutTrend();
      var now = Date.now();
      this.trendGroup.addPointList("初始化", now - 10 * 60 * 1000, now);
    },
    layoutTrend() {
      if (!this.trendGroup || !this.$refs.canvasBox) {
        return;
      }
      if (!this.$refs.canvasBox.clientWidth) {
        return;
      }
      this.trendGroup.isResize = true;
      this.trendGroup.setHtmlCss();
    },
    idsKey(pointList) {
      return (pointList.pointID || [])
        .map(function(id) {
          return id == null ? "" : String(id);
        })
        .sort()
        .join(",");
    },
    isSubset(smallKey, bigKey) {
      if (!smallKey) {
        return true;
      }
      if (!bigKey) {
        return false;
      }
      var big = {};
      bigKey.split(",").forEach(function(id) {
        if (id) {
          big[id] = true;
        }
      });
      var ok = true;
      smallKey.split(",").forEach(function(id) {
        if (id && !big[id]) {
          ok = false;
        }
      });
      return ok;
    },
    isPayloadEmpty(payload) {
      if (!payload || typeof payload !== "object") {
        return true;
      }
      if (!Object.keys(payload).length) {
        return true;
      }
      var reload = payload.reloadDatas;
      if (!reload || reload.data == null) {
        return true;
      }
      return Array.isArray(reload.data) && reload.data.length === 0;
    },
    resolveNames(pointList, data) {
      var names = pointList.pointName || [];
      var reload = data && data.reloadDatas;
      if (!reload || !reload.data || !pointList.pointID) {
        return names;
      }
      var picked = [];
      pointList.pointID.forEach(function(pid) {
        if (pid == null || String(pid).trim() === "") {
          return;
        }
        var key = String(pid).trim();
        for (var i = 0; i < reload.data.length; i++) {
          var row = reload.data[i];
          if (!row || row.GN == null) {
            continue;
          }
          var gn = String(row.GN).trim();
          var id = row.ID == null ? "" : String(row.ID).trim();
          if (key === gn || key === id) {
            picked.push(row.GN);
            break;
          }
        }
      });
      return picked.length ? picked : names;
    },
    obtainPoint(pointList, startTime, endTime) {
      var self = this;
      if (!pointList || !pointList.pointID || !pointList.pointID.length) {
        return;
      }
      var key = this.idsKey(pointList);
      if (this._inflightKey) {
        if (this._inflightKey === key) {
          return;
        }
        if (this.isSubset(key, this._inflightKey)) {
          return;
        }
        if (this._cancel) {
          this._cancel();
        }
      }
      this._inflightKey = key;
      var source = createCancelSource();
      this._cancel = function() {
        source.cancel("abort");
      };
      var payload = { ids: pointList.pointID.join(",") };
      if (startTime) {
        payload.startTime = startTime;
      }
      if (endTime) {
        payload.endTime = endTime;
      }
      if (this.typeSelected !== "实时") {
        this.trendLoading = true;
      }
      getPoint(payload, source.token)
        .then(function(result) {
          if (self._inflightKey !== key) {
            return;
          }
          if (!result || !okCode(result.code) || self.isPayloadEmpty(result.data)) {
            if (self.typeSelected !== "实时") {
              self.$message.warning(
                (result && (result.msg || result.message)) || "数据为空"
              );
            }
            self.clearCanvasPrompt();
            return;
          }
          self.reloadDatas = result.data.reloadDatas;
          self.coordData = result.data.coordData;
          window.thisVue = self;
          window.trendGroup = self.trendGroup;
          var names = self.resolveNames(pointList, result.data);
          self.trendGroup.addPointList(names, startTime, endTime);
        })
        .catch(function(error) {
          if (isCancel(error)) {
            return;
          }
          self.trendLoading = false;
        })
        .then(function() {
          if (self._inflightKey === key) {
            self._inflightKey = "";
            self._cancel = null;
            self.trendLoading = false;
          }
        });
    },
    clearCanvasPrompt() {
      if (this.trendGroup && this.trendGroup.opTrend) {
        this.trendGroup.opTrend.promptMsg = "";
        if (typeof this.trendGroup.opTrend.repaint === "function") {
          this.trendGroup.opTrend.repaint(this.trendGroup.defaultTrendString || []);
        }
      }
    },
    getSelectedPoint() {
      var source =
        this.pointOriginalList && this.pointOriginalList.length
          ? this.pointOriginalList
          : this.trendPointListData;
      var pointID = [];
      var pointName = [];
      (source || []).forEach(function(item) {
        pointID.push(item.ID);
        pointName.push(item.GN);
      });
      return { pointID: pointID, pointName: pointName };
    },
    getTrendQueryTimeRange() {
      var range = this.dateHistory;
      if (range && range.length >= 2 && range[0] && range[1]) {
        return [range[0], range[1]];
      }
      return [undefined, undefined];
    },
    typeSelectChang() {
      if (!this.trendPointListData.length && this.typeSelected === "实时") {
        this.$message.warning("暂无测点，请先添加测点。");
        this.typeSelected = "回溯";
        return;
      }
      if (this.typeSelected === "实时") {
        this.ifShowPause = true;
        this.startPolling();
      } else {
        this.ifShowPause = false;
        this.clearPolling();
      }
    },
    startPolling(pointList) {
      var self = this;
      this.dateHistory = [];
      this.clearPolling();
      var first = pointList || this.getSelectedPoint();
      if (!first.pointID || !first.pointID.length) {
        return;
      }
      this.obtainPoint(first);
      this.startMark = setInterval(function() {
        self.obtainPoint(self.getSelectedPoint());
      }, 1000);
    },
    clearPolling() {
      if (this.startMark) {
        clearInterval(this.startMark);
        this.startMark = null;
      }
    },
    trendPausePlay() {
      if (this.ifShowPause) {
        this.clearPolling();
      } else {
        this.startPolling();
      }
      this.ifShowPause = !this.ifShowPause;
    },
    historyChange() {
      if (this.dateHistory && this.dateHistory[0] && this.dateHistory[1]) {
        this.timeRadioButton = "自定义";
        this.historyCache = this.dateHistory.slice();
      }
    },
    timeChange() {
      if (this.timeRadioButton === "0") {
        this.dateHistory = [];
      } else if (this.timeRadioButton === "自定义") {
        this.dateHistory = this.historyCache.slice();
      } else {
        var end = new Date();
        var start = new Date(end.getTime() - Number(this.timeRadioButton) * 60 * 60 * 1000);
        this.dateHistory = [formatClock(start), formatClock(end)];
      }
      this.dateHistoryChange();
    },
    dateHistoryChange() {
      if (!this.trendPointListData.length && !this.pointOriginalList.length) {
        this.$message.warning("暂无测点，请先添加测点。");
        return;
      }
      var range = this.getTrendQueryTimeRange();
      if (range[0] && range[1]) {
        this.clearPolling();
        this.ifShowPause = false;
        this.obtainPoint(this.getSelectedPoint(), range[0], range[1]);
        return;
      }
      if (this.typeSelected === "实时") {
        this.ifShowPause = true;
        this.startPolling();
        return;
      }
      this.obtainPoint(this.getSelectedPoint(), range[0], range[1]);
    },
    changeTime() {
      var range = this.getTrendQueryTimeRange();
      this.obtainPoint(this.getSelectedPoint(), range[0], range[1]);
    },
    timeScrolling(forward) {
      if (!this.dateHistory || this.dateHistory.length < 2) {
        return;
      }
      var startMs = new Date(String(this.dateHistory[0]).replace(/-/g, "/")).getTime();
      var endMs = new Date(String(this.dateHistory[1]).replace(/-/g, "/")).getTime();
      var span = endMs - startMs;
      var nextStart = forward ? startMs - span : endMs;
      var nextEnd = forward ? startMs : endMs + span;
      this.dateHistory = [formatClock(nextStart), formatClock(nextEnd)];
      this.timeRadioButton = "自定义";
      this.dateHistoryChange();
    },
    autoRangeChange() {
      if (!this.trendGroup) {
        return;
      }
      this.trendGroup.adaptiveRange();
      this.autoRange = this.trendGroup.adaptive;
    },
    trendBgColorChange() {
      if (this.trendGroup) {
        this.trendGroup.setTrendBgColor(this.trendBgColor || "#000000");
      }
    },
    saveImg() {
      var canvas = document.getElementById(this.canvasId);
      if (!canvas) {
        return;
      }
      var link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "趋势图.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    exportPointData(method) {
      var pointList = this.getSelectedPoint();
      if (!pointList.pointID.length) {
        this.$message.error("请选择要导出的测点");
        return;
      }
      var self = this;
      var loading = this.$loading({
        lock: true,
        text: "正在导出Excel文件，请稍候...",
        background: "rgba(0, 0, 0, 0.7)"
      });
      var range = this.dateHistory || [];
      exportTrendExcel(method, {
        ids: pointList.pointID.join(","),
        startTime: range[0] || "",
        endTime: range[1] || ""
      })
        .then(function(res) {
          var blob = res && res.data;
          if (!blob) {
            self.$message.warning("暂无数据可导出！");
            return;
          }
          if (blob.type && blob.type.indexOf("application/json") !== -1) {
            self.$message.warning("暂无数据可导出！");
            return;
          }
          var headers = (res && res.headers) || {};
          var disposition =
            headers["content-disposition"] || headers["Content-Disposition"] || "";
          var fileName = "测点数据导出.xlsx";
          var matched = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (matched && matched[1]) {
            fileName = decodeURIComponent(matched[1].replace(/['"]/g, ""));
          }
          var url = window.URL.createObjectURL(blob);
          var link = document.createElement("a");
          link.href = url;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          self.$message.success("Excel文件导出成功！");
        })
        .catch(function() {
          self.$message.error("文件导出失败，请稍后重试！");
        })
        .then(function() {
          loading.close();
        });
    },
    pointNameSearchAsync(queryString, callback) {
      if (!queryString) {
        callback([]);
        return;
      }
      getTag(queryString)
        .then(function(res) {
          var rows = [];
          if (res && okCode(res.code) && Array.isArray(res.data)) {
            rows = res.data.map(function(row) {
              return {
                value: row.tagName,
                address: row.ED,
                id: row.id,
                GN: row.tagName,
                ID: row.id
              };
            });
          }
          callback(rows);
        })
        .catch(function() {
          callback([]);
        });
    },
    pointNameHandleSelect(item) {
      var pointList = this.getSelectedPoint();
      var exists = pointList.pointID.some(function(id) {
        return String(id) === String(item.ID);
      });
      if (exists) {
        this.$message.warning((item.GN || item.value) + "趋势已存在");
        return;
      }
      pointList.pointID.push(item.ID);
      pointList.pointName.push(item.GN || item.value);
      this.pointName = "";
      if (this.typeSelected === "实时") {
        this.ifShowPause = true;
        this.startPolling(pointList);
      } else {
        var range = this.getTrendQueryTimeRange();
        this.obtainPoint(pointList, range[0], range[1]);
      }
    },
    bothRemovePoint(gn) {
      if (this.trendGroup) {
        this.trendGroup.removePoint(gn);
      }
      this.trendPointListData = this.trendPointListData.filter(function(item) {
        return item.GN !== gn;
      });
      this.pointOriginalList = (this.pointOriginalList || []).filter(function(item) {
        return item.GN !== gn;
      });
      if (this.pointVisibilityByGN) {
        delete this.pointVisibilityByGN[gn];
      }
    },
    trendPointDelete(row) {
      this.bothRemovePoint(row.GN);
      this.onTrendPointListDataChange();
    },
    setHandleSelect(row) {
      if (!this.trendGroup || !this.trendGroup.trendConfigInfoMap) {
        return;
      }
      var obj = this.trendGroup.trendConfigInfoMap.get(row.GN);
      if (!obj) {
        return;
      }
      var checked = !!row.KEY;
      this.pointVisibilityByGN[row.GN] = checked;
      obj.KEY = checked;
      obj.CK = !checked;
      row.CK = !checked;
      this.trendGroup.trendRedraw(obj);
    },
    colorPickerChange(row) {
      if (!this.trendGroup) {
        return;
      }
      var obj = this.trendGroup.trendConfigInfoMap.get(row.GN);
      if (obj) {
        obj.CO = row.CO;
        this.trendGroup.trendRedraw(obj);
      }
    },
    focusLimit(row, field) {
      if (field === "TV") {
        this.defaultTV = row.ATV != null && row.ATV !== "" ? row.ATV : row.TV;
      } else if (field === "BV") {
        this.defaultBV = row.ABV != null && row.ABV !== "" ? row.ABV : row.BV;
      } else if (field === "AT") {
        this.defaultAT = row.AT;
      } else if (field === "AB") {
        this.defaultAB = row.AB;
      }
    },
    lockManualRange() {
      if (this.trendGroup && this.trendGroup.adaptive) {
        this.trendGroup.adaptiveRange();
        this.autoRange = this.trendGroup.adaptive;
      }
    },
    redrawLimit(gn, patch) {
      if (!this.trendGroup) {
        return;
      }
      var obj = this.trendGroup.trendConfigInfoMap.get(gn);
      if (!obj) {
        return;
      }
      Object.keys(patch).forEach(function(key) {
        obj[key] = patch[key];
      });
      this.trendGroup.trendRedraw(obj);
    },
    changeTV(row) {
      var value = row.ATV;
      var lower = row.ABV != null && row.ABV !== "" ? row.ABV : row.BV;
      if (value === "" || value == null) {
        this.$message.warning("上限不能为空");
        row.ATV = this.defaultTV;
        return;
      }
      if (Number(value) < Number(lower)) {
        this.$message.warning("上限不能小于下限");
        row.ATV = this.defaultTV;
        return;
      }
      if (row.AT !== "" && Number(row.AT) > Number(value)) {
        row.AT = "";
      }
      if (row.AB !== "" && Number(row.AB) > Number(value)) {
        row.AB = "";
      }
      this.lockManualRange();
      var num = Number(value);
      row.TV = num;
      this.redrawLimit(row.GN, { AT: row.AT, AB: row.AB, TV: num, ATV: num });
    },
    changeBV(row) {
      var value = row.ABV;
      var upper = row.ATV != null && row.ATV !== "" ? row.ATV : row.TV;
      if (value === "" || value == null) {
        this.$message.warning("下限不能为空");
        row.ABV = this.defaultBV;
        return;
      }
      if (Number(upper) < Number(value)) {
        this.$message.warning("下限不能大于上限");
        row.ABV = this.defaultBV;
        return;
      }
      this.lockManualRange();
      var num = Number(value);
      row.BV = num;
      this.redrawLimit(row.GN, { AT: row.AT, AB: row.AB, BV: num, ABV: num });
    },
    changeAT(row) {
      var value = row.AT;
      var upper = row.ATV != null && row.ATV !== "" ? row.ATV : row.TV;
      var lower = row.ABV != null && row.ABV !== "" ? row.ABV : row.BV;
      if (value !== "" && value != null) {
        if (row.AB !== "" && Number(value) < Number(row.AB)) {
          this.$message.warning("高限不能小于低限");
          row.AT = this.defaultAT;
          return;
        }
        if (Number(value) > Number(upper)) {
          this.$message.warning("高限不能大于上限");
          row.AT = this.defaultAT;
          return;
        }
        if (Number(value) < Number(lower)) {
          this.$message.warning("高限不能小于下限");
          row.AT = this.defaultAT;
          return;
        }
      }
      this.redrawLimit(row.GN, { AT: value === "" ? "" : parseInt(value, 10) });
    },
    changeAB(row) {
      var value = row.AB;
      var upper = row.ATV != null && row.ATV !== "" ? row.ATV : row.TV;
      var lower = row.ABV != null && row.ABV !== "" ? row.ABV : row.BV;
      if (value !== "" && value != null) {
        if (row.AT !== "" && Number(row.AT) < Number(value)) {
          this.$message.warning("低限不能大于高限");
          row.AB = this.defaultAB;
          return;
        }
        if (Number(value) > Number(upper)) {
          this.$message.warning("低限不能大于上限");
          row.AB = this.defaultAB;
          return;
        }
        if (Number(value) < Number(lower)) {
          this.$message.warning("低限不能小于下限");
          row.AB = this.defaultAB;
          return;
        }
      }
      this.redrawLimit(row.GN, { AB: value === "" ? "" : parseInt(value, 10) });
    },
    changeLW(row) {
      var value = parseInt(row.LW, 10);
      if (isNaN(value)) {
        return;
      }
      this.redrawLimit(row.GN, { LW: value });
    },
    locateExtreme(row, percent, time, value) {
      if (!this.trendGroup || percent == null) {
        return;
      }
      var width = this.trendGroup.containerWidthFn();
      var height = this.trendGroup.containerHeightFn();
      var x = (width - width / 14) * percent;
      this.trendGroup.MAX_TIME = time;
      this.trendGroup.MAX_GN = row.GN;
      this.trendGroup.MAX_VALUE = value;
      this.trendGroup.MAX_CO = row.CO;
      this.trendGroup.MAX_EU = row.EU;
      this.trendGroup.setHtmlCss([x, parseInt(height * 0.2, 10), parseInt(x, 10)]);
    },
    maxSelect(row) {
      this.locateExtreme(row, row.MAXPercent, row.MAXTIME, row.MAXV);
    },
    minSelect(row) {
      this.locateExtreme(row, row.MINPercent, row.MINTIME, row.MINV);
    },
    onTrendPointListDataChange() {
      var list = this.trendPointListData || [];
      var sig = list
        .map(function(row) {
          return row && row.GN ? String(row.GN) : "";
        })
        .join("|");
      if (this.trendPointLayoutSig === sig) {
        return;
      }
      this.trendPointLayoutSig = sig;
      this.setTrendPointListHeight();
    },
    setTrendPointListHeight() {
      var count = this.trendPointListData ? this.trendPointListData.length : 0;
      var rows = count > 0 ? count : 1;
      var maxRows = 5;
      if (rows > maxRows) {
        rows = maxRows;
      }
      this.trendPointListHeight = 36 + rows * 32;
      var self = this;
      this.$nextTick(function() {
        self.layoutTrend();
      });
    },
    openMark(time) {
      if (!this.trendPointListData.length) {
        return;
      }
      this.markTime = time || "";
      this.markForm = { point: "全部", text: "" };
      this.markVisible = true;
    },
    confirmMark() {
      if (!this.trendGroup) {
        return;
      }
      var names = (this.trendGroup.defaultTrendString || []).filter(function(name) {
        return name && name !== "初始化";
      });
      var all = this.markForm.point === "全部";
      var flag = {
        description: this.markForm.text || "",
        start: this.markTime,
        end: this.markTime,
        point: all ? names : [this.markForm.point],
        type: 0,
        single: all ? 0 : 1,
        module: ""
      };
      if (!this.trendGroup.trendFlags) {
        this.trendGroup.trendFlags = [];
      }
      this.trendGroup.trendFlags.push(flag);
      window.trendGroup = this.trendGroup;
      if (this.trendGroup.opTrend && this.trendGroup.opTrend.repaint) {
        this.trendGroup.opTrend.repaint(this.trendGroup.defaultTrendString);
      }
      this.markVisible = false;
    }
  }
};
</script>

<style lang="less" scoped>
.online-monitor {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 250px);
  min-height: 560px;
  background: #fff;
  box-sizing: border-box;
}
.online-monitor.is-fill {
  flex: 1;
  height: 100%;
  min-height: 0;
}
.online-monitor.is-fill .monitor-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 8px;
  overflow-x: auto;
}
.online-monitor.is-fill .point-search {
  width: 168px;
  flex: 0 0 168px;
  margin-bottom: 0;
}
.online-monitor.is-fill .toolbar-row {
  flex-wrap: nowrap;
  flex: 1 0 auto;
  min-width: 0;
}
.online-monitor.is-fill .toolbar-row > * {
  flex-shrink: 0;
}
.online-monitor.is-fill .date-term /deep/ .el-date-editor {
  width: 308px;
}
.online-monitor.is-fill .toolbar-row > .el-select {
  width: 88px !important;
}
.monitor-toolbar {
  flex-shrink: 0;
  padding: 8px 8px 4px;
}
.point-search {
  width: 280px;
  margin-bottom: 8px;
}
.toolbar-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.date-term {
  display: flex;
  align-items: center;
}
.date-term /deep/ .el-date-editor {
  width: 360px;
}
.tool-group {
  display: inline-flex;
}
.trend-box {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.online-monitor /deep/ .trend-point-table.el-table {
  flex: 0 0 auto !important;
  width: 100%;
}
.online-monitor /deep/ .trend-point-table.is-empty.el-table {
  height: auto !important;
  max-height: none !important;
}
.online-monitor /deep/ .trend-point-table.is-empty .el-table__body-wrapper {
  height: auto !important;
  max-height: none !important;
}
.online-monitor /deep/ .trend-point-table.is-empty .el-table__empty-block {
  min-height: 32px !important;
  height: 32px !important;
  max-height: 32px !important;
}
.online-monitor /deep/ .trend-point-table .el-table__empty-text {
  background: none !important;
  background-image: none !important;
  width: auto !important;
  height: auto !important;
  min-height: 0 !important;
  padding: 0 !important;
  line-height: 32px !important;
  transform: none !important;
  font-size: 12px;
  color: #909399;
}
.canvas-box {
  flex: 1;
  min-height: 0;
  background: #fff;
  overflow: hidden;
}
.canvas-box canvas {
  display: block;
  width: 100%;
  height: 100%;
}
.link-num {
  color: #409eff;
  cursor: pointer;
}
.delete-btn {
  color: #f56c6c;
  cursor: pointer;
  font-size: 16px;
}
</style>
