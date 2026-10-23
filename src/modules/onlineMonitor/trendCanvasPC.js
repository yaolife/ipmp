(function() {
  function log(message) {
    if (window && window.console && console.log) {
      console.log(message);
    }
  }
  //-----------------------
  function defaultTrendGroup(el) {
    //事件驱动
    var event = {};
    this.on = function f(eventName, fn) {
      if (event[eventName]) {
        event[eventName].push(fn);
      } else {
        event[eventName] = [fn];
      }
    };
    this.emit = function f1(eventName, a, b, c, d, e) {
      if (event[eventName]) {
        event[eventName].forEach(function(item) {
          item(a, b, c, d, e);
        });
      }
    };
    /**
     * emit 事件
     * hisDataLoad 当历史加载数据加载完成
     * @type {Array}
     */

    this.trendTimeHistory = []; //选择时间区域历史队列
    this.trendTimeHistoryNo = 0; //当前时间游标

    this.trendFlags = [];

    //添加历史时间
    this.addCanvasTimeHis = function(data, reset) {
      if (reset) {
        this.trendTimeHistory = [];
        this.trendTimeHistoryNo = 0;
      }
      if (data) {
        var le = this.trendTimeHistory.length - this.trendTimeHistoryNo - 1;
        this.trendTimeHistory.splice(this.trendTimeHistoryNo + 1, le, data);
        this.trendTimeHistoryNo = this.trendTimeHistory.length - 1;
      }
      var obj = {
        list: this.trendTimeHistory,
        index: this.trendTimeHistoryNo,
        canBack:
          this.trendTimeHistory.length > 0 && this.trendTimeHistoryNo > 0,
        canNext: this.trendTimeHistory.length - this.trendTimeHistoryNo > 1
      };
      this.emit("moveCanvasTimeHis", obj);
    };
    //移动历史时间路由
    this.moveCanvasTimeHis = function(step) {
      this.trendTimeHistoryNo += step;
      this.trendBeginTime = this.trendTimeHistory[this.trendTimeHistoryNo].bt;
      this.trendEndTime = this.trendTimeHistory[this.trendTimeHistoryNo].et;
      if (!this.trendBeginTime && !this.trendEndTime) {
        this.addTrendDate(this.defaultTrendString, null, null);
      } else {
        this.addTrendDate(
          this.defaultTrendString,
          this.trendBeginTime,
          this.trendEndTime
        );
      }
      var obj = {
        list: this.trendTimeHistory,
        index: this.trendTimeHistoryNo,
        canBack:
          this.trendTimeHistory.length > 0 && this.trendTimeHistoryNo > 0,
        canNext: this.trendTimeHistory.length - this.trendTimeHistoryNo > 1
      };
      this.emit("moveCanvasTimeHis", obj);
    };
    //改变趋势背景色
    this.setTrendBgColor = function(color) {
      if (color) {
        this.opTrend.trend_bgColor = color;
      } else {
        this.opTrend.trend_bgColor = "black";
      }
      this.opTrend.backCanvas = null;
      this.opTrend.repaint();
    };

    this.message = function(a, b, c) {
      alert(a, b, c);
    };
    // this.i18n = function (key) {
    //   var obj = {
    //     moreLinePrefix: "最多容纳",
    //     moreLineSuffix: "条曲线",
    //     pointRepetition: "点名重复",
    //     overMaximum: "超过最大放大值"
    //   };
    //   return obj[key];
    // };
    this.pointInfoTableData = []; //点信息
    this.isTrendPause = false; //是否暂停
    this.trendcontainer = el || "trend_container";
    this.isPanelFull = false; //面板是否全屏
    this.deviationX = 10; //偏移宽度
    this.localFormat = false; //是否使用本地格式
    this.adaptive = false; //趋势图默认自动量程
    this.trendBeginTime = "";
    this.trendEndTime = "";

    this.opTrend = new opTrend();
    this.opTrend.trendGroupObj = this;
    this.socket = null;
    this.canvas_context = null;
    this.pointsTable = "pointsTable";
    this.pointType = $config["trend.mode"] || "plot"; // 点的类型
    this.isDialog = false; // 是否是对话框
    this.isResize = false;
    this._layoutInited = false;
    this.isLarge = false;
    this.isShow = false;
    this.layerIndex = 0;
    this.lineWidth = 2;
    this.isMs = false;
    this.flushInterval = 1000; // 刷新频率
    this.formatString = "yyyy-MM-dd"; //'yyyy-MM-dd HH:mm:ss'
    this.defaultTrendString = []; // 趋势集合
    this.history = "history"; //历时
    this.trendIntervalId = 0;
    this.trendStopFlushFlags = []; //趋势停刷的集合
    this.containerHeightFn = function() {
      log("需要实现高度计算方法 containerHeightFn 返回数值");
    };
    this.containerWidthFn = function() {
      log("需要实现宽度计算方法 containerWidthFn 返回数值");
    };

    this.viewerFont = 15;
    this.viewerFontLineHeight = 14; // 趋势刻度线浮游小面板高度
    this.viewerWidth = 220; // 趋势刻度线浮游小面板宽度
    this.viewerFontSpace = 30;

    this.linePointCount = 1600; // 点的总个数
    this.mouseLeaveXY = []; // 鼠标离开的位置
    this.trendTotleCount = 100; // 趋势总个数
    this.trendIdFlags = []; //趋势ID标记
    this.trendConfigInfoMap = new trendUtilMap(); // 趋势列表
    this.trendChartColors = [
      "#FF0000",
      "#FFFF00",
      "#00FF00",
      "#6666E1",
      "#00FFFF",
      "#FF00FF",
      "#FF007B",
      "#804000",
      "#FFAFAF",
      "#99CC00",
      "#FFC800",
      "#CCFFFF",
      "#695D61",
      "#00EBA3",
      "#8540FF",
      "#FF9900"
    ];
    this.trendColorNotUseing = [
      "#FF0000",
      "#FFFF00",
      "#00FF00",
      "#6666E1",
      "#00FFFF",
      "#FF00FF",
      "#FF007B",
      "#804000",
      "#FFAFAF",
      "#99CC00",
      "#FFC800",
      "#CCFFFF",
      "#695D61",
      "#00EBA3",
      "#8540FF",
      "#FF9900"
    ];
    this.MAX_TIME = null;
    this.MAX_CO = "white";
    this.MAX_GN = "测点名称";
    this.MAX_EU = "MPa";
    this.MAX_VALUE = "0";
    this.trendColorUseing = [];
    this.initColor = function() {
      this.trendColorNotUseing = [];
      for (var i in this.trendChartColors) {
        this.trendColorNotUseing.push(this.trendChartColors[i]);
      }
      this.trendColorUseing = [];
    };
    // 获取趋势颜色
    this.getTrendColor = function() {
      var co = null;
      if (this.trendColorNotUseing.length == 0) {
        // 生成新的颜色
        co = this.getRandomColor();
      } else {
        // 优先使用颜色池中的颜色
        co = this.trendColorNotUseing.shift();
      }
      this.trendColorUseing.push(co);
      return co;
    };
    // 生成一个随机的十六进制颜色代码
    this.getRandomColor = function() {
      var letters = "0123456789ABCDEF";
      var color = "#";
      for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    };
    this.returnTrendColor = function(color) {
      this.trendColorNotUseing.push(color);
      var cos = [];
      for (var i in this.trendColorUseing) {
        if (this.trendColorUseing[i] != color) {
          cos.push(this.trendColorUseing[i]);
        }
      }
      this.trendColorUseing = cos;
    };
    /**
     * 初始化基本参数
     * 绘制趋势的基本容器
     * @param from
     * @param to
     * @param width
     * @param height
     * @param current
     */
    this.initProperties = function(from, to) {
      if (!trend_Util.isNull(from)) {
        this.opTrend.from = from;
      }
      if (!trend_Util.isNull(to)) {
        this.opTrend.to = to;
      }
      this.opTrend.localFormat = this.localFormat;
      // 设置基本信息
      this.opTrend.margin_top = 0;
      this.opTrend.margin_bottom = 0;
      this.opTrend.margin_padding = 0;
      this.opTrend.xAxisScaleCount = 4;

      var _bounds = [0, 0, this.containerWidthFn(), this.containerHeightFn()];
      this.opTrend.canvasX = parseInt(_bounds[0]);
      this.opTrend.canvasY = parseInt(_bounds[1]);
      this.opTrend.canvasWidth = parseInt(
        _bounds[2] - this.opTrend.margin_padding * 2
      );
      this.opTrend.canvasHeight = parseInt(
        _bounds[3] - this.opTrend.margin_top - this.opTrend.margin_bottom
      );
      //this.opTrend.trend_bgColor = "white";
      this.opTrend.trend_bgLineColor = "white";
      this.opTrend.innerBorder_color = "white";
      this.opTrend.isComponents = false;
    };
    this.isFull = function() {
      if (this.defaultTrendString.length >= this.trendTotleCount) {
        return true;
      } else {
        return false;
      }
    };

    /**
     * [增加趋势测点]
     * @param   {[String,Array]}  pointList  [pointList description]
     * @param   {[String]}  startTime  [startTime description]
     * @param   {[String]}  endTime    [endTime description]
     *
     * obtainPoint 每次传入的是当前完整测点名列表；若仍对 defaultTrendString 做 push，
     * 实时轮询每秒会重复追加同名，数组暴涨并触发上限或 initPointInfoTable 与接口数据错位（闪一下后消失）。
     * 故对「完整列表」采用整体替换（去重、去掉占位初始化名）；仅「初始化」占位保持原语义。
     */
    this.addPointList = function(pointList, startTime, endTime) {
      var raw = pointList;
      var pointList_ = pointList;
      if (Object.prototype.toString.call(pointList_) !== "[object Array]") {
        pointList_ = String(pointList).split(",");
      }
      pointList_ = trend_Util.removeArraySameElement(pointList_);

      var isInitPlaceholder =
        (typeof raw === "string" && raw === "初始化") ||
        (pointList_.length === 1 && pointList_[0] === "初始化");

      if (isInitPlaceholder) {
        pointList_ = ["初始化"];
      } else {
        pointList_ = pointList_.filter(function(n) {
          return n != null && n !== "" && n !== "初始化";
        });
      }

      if (!pointList_ || pointList_.length === 0) {
        return;
      }
      if (pointList_.length > this.trendTotleCount) {
        this.message("最多容纳" + this.trendTotleCount + "条曲线");
        return;
      }

      this.initProperties(startTime, endTime);
      this.defaultTrendString = pointList_.slice();
      this.addTrendDate(this.defaultTrendString, startTime, endTime);
    };
    this.updatePointInfo = function(type, val) {
      var that = this;
      function toChecked(v, fallback) {
        if (v === true || v === false) {
          return v;
        }
        if (v === 1 || v === "1" || v === "true") {
          return true;
        }
        if (v === 0 || v === "0" || v === "false" || v === "" || v == null) {
          return false;
        }
        return !!fallback;
      }
      if (!that.pointInfoTableData || !val) {
        return;
      }
      switch (type) {
        case "hisDataLoad":
          var stat = val.stat;
          if (stat) {
            for (var key in stat) {
              var keyob = stat[key];
              keyob &&
                that.pointInfoTableData.forEach(function(row) {
                  if (row.ID == keyob.ID && !!keyob.AVGV) {
                    row.AVGV = Number(keyob.AVGV).toFixed(
                      row.FM || $config["more.defaultFM"]
                    );
                    row.MAXV = Number(keyob.MAXV).toFixed(
                      row.FM || $config["more.defaultFM"]
                    );
                    row.MINV = Number(keyob.MINV).toFixed(
                      row.FM || $config["more.defaultFM"]
                    );
                    row.MAXTIME = new Date(row.MAXVDATE).pattern();
                    row.MINTIME = new Date(row.MINDATE).pattern();
                  }
                });
            }
          }
          break;
        case "refreshTrendValue":
          for (var key in val) {
            that.pointInfoTableData.forEach(function(row) {
              if (row.ID == key) {
                if (val[key].y === null) {
                  row.AV = "";
                } else if (row.RT == 7) {
                  row.AV = val[key].y;
                } else {
                  var v = Number(val[key].y);
                  if (
                    v != undefined &&
                    typeof +v == "number" &&
                    Math.floor(v) != v
                  ) {
                    row.AV = v.toFixed(row.FM || $config["more.defaultFM"]);
                  } else {
                    row.AV = v;
                  }
                }
              }
            });
          }
          break;
        case "replaceTrendTVBV":
          val.forEach(function(row1) {
            that.pointInfoTableData.forEach(function(row2) {
              if (row2.GN == row1.key) {
                row2.TV = row1.value.TV;
                row2.BV = row1.value.BV;
              }
            });
          });
      }
    };

    this.reloadData = function(names, from, to) {
      // if (!names || names.length === 0) return
      that = this;
      function isBinarySeries(arr) {
        if (!arr || !arr.length) {
          return false;
        }
        var hasValid = false;
        for (var i = 0; i < arr.length; i++) {
          var p = arr[i];
          if (!p || p.y === null || p.y === undefined || p.y === "") {
            continue;
          }
          var y = Number(p.y);
          if (isNaN(y)) {
            return false;
          }
          if (y !== 0 && y !== 1) {
            return false;
          }
          hasValid = true;
        }
        return hasValid;
      }
      function parseTimeMs(v) {
        if (v === null || v === undefined || v === "") {
          return NaN;
        }
        if (typeof v === "number") {
          return v;
        }
        if (Object.prototype.toString.call(v) === "[object Date]") {
          return v.getTime();
        }
        var s = String(v).replace(/-/g, "/");
        var t = new Date(s).getTime();
        return isNaN(t) ? NaN : t;
      }
      function normalizeRange(startMs, endMs) {
        if (isNaN(startMs) || isNaN(endMs)) {
          return null;
        }
        if (startMs > endMs) {
          var tmp = startMs;
          startMs = endMs;
          endMs = tmp;
        }
        return [startMs, endMs];
      }
      function normalizeTrendData(raw) {
        if (!raw || !raw.length) {
          return [];
        }
        var out = [];
        for (var i = 0; i < raw.length; i++) {
          var p = raw[i];
          if (!p || p.x === null || p.x === undefined || p.x === "") {
            continue;
          }
          var x = Number(p.x);
          if (isNaN(x)) {
            continue;
          }
          var y = null;
          if (!(p.y === null || p.y === undefined || p.y === "")) {
            var yn = Number(p.y);
            y = isNaN(yn) ? null : yn;
          }
          out.push({ x: x, y: y, z: p.z, DS: p.DS });
        }
        out.sort(function(a, b) {
          return a.x - b.x;
        });
        return out;
      }
      //从trendPC获取点数据
      var data = thisVue.reloadDatas;
      if (!data || data.data == null || data.data === undefined) {
        that.opTrend.promptMsg = "";
        try {
          that.opTrend.repaint(names);
        } catch (eRep) {}
        return;
      }
      // 趋势信息处理
      that.initPointInfoTable(data.data, names);
      // 日期的下拉框形式和选择按钮形式的切换
      if (that.isDialog) {
        that.showDialog();
      } else {
        // 实时刷新时避免每次回包都重置 canvas 尺寸，减少可见闪烁
        if (!that._layoutInited || that.isResize) {
          that.setHtmlCss();
          that._layoutInited = true;
          that.isResize = false;
        }
      }
      trend_Util.setCanvasFun(that);
      var coordPayload = thisVue.coordData;
      data =
        coordPayload != null && coordPayload.value !== undefined && coordPayload.value !== null
          ? coordPayload.value
          : {};
      // that.updatePointInfo("hisDataLoad", data);

      // 实时模式下每秒清空并重建 trendArray 会造成可见闪帧；
      // 改为复用已有对象并原位更新，避免“回溯不闪/实时闪”的差异问题。
      var oldTrendArray = that.opTrend.trendArray || [];
      var oldTrendMap = {};
      for (var oi = 0; oi < oldTrendArray.length; oi++) {
        var oldTrend = oldTrendArray[oi];
        if (oldTrend && oldTrend.pointName) {
          oldTrendMap[oldTrend.pointName] = oldTrend;
        }
      }
      var nextTrendArray = [];
      if (!data) {
        data = {};
      }
      var value = data.value;
      var globalMinX = Infinity;
      var globalMaxX = -Infinity;
      // 参考旧逻辑：回溯查询切换时间窗时应重置每条曲线缓存数据，避免沿用旧窗口 data 导致“有值不出线”
      var shouldResetSeriesCache =
        (typeof thisVue !== "undefined" &&
          thisVue &&
          thisVue.typeSelected === "回溯") ||
        !trend_Util.isNull(from) ||
        !trend_Util.isNull(to);
      var selectedRange = null;
      if (
        typeof thisVue !== "undefined" &&
        thisVue &&
        thisVue.typeSelected === "回溯" &&
        thisVue.dateHistory &&
        thisVue.dateHistory.length >= 2
      ) {
        selectedRange = normalizeRange(
          parseTimeMs(thisVue.dateHistory[0]),
          parseTimeMs(thisVue.dateHistory[1])
        );
      }
      for (var i = 0; i < names.length; i++) {
        var name = names[i];
        // 跳过初始化
        if (name === "初始化") {
          continue; // 使用 continue 跳过当前循环
        }
        var obj = that.trendConfigInfoMap.get(name);
        if (!obj || obj.ID == null) {
          continue;
        }
        var t1 = oldTrendMap[name] || new that.opTrend.trendObj();
        t1.opTrend = that.opTrend;
        if (shouldResetSeriesCache) {
          t1.data = [];
          t1.trendData = [];
        }
        t1.id = obj.ID;
        t1.pointName = obj.GN;
        t1.dotcount = obj.FM;
        t1.color = obj.CO;
        t1.EU = obj.EU;
        t1.AV = obj.AV;
        t1.lineWidth = obj.LW;
        // 绘图量程来源：
        // - 自适应开启：用 TV/BV（自适应会持续改写）
        // - 自适应关闭：用 ATV/ABV（用户手工设定）
        if (that.adaptive) {
          // 自适应开启时，实时回包会先把 obj.TV/BV 带回接口固定量程；
          // 若直接使用会在每轮刷新出现“直线闪一下”。优先沿用上一帧已算好的量程。
          var oldTop =
            oldTrendMap[name] && oldTrendMap[name].topLimit !== undefined
              ? Number(oldTrendMap[name].topLimit)
              : NaN;
          var oldLow =
            oldTrendMap[name] && oldTrendMap[name].lowLimit !== undefined
              ? Number(oldTrendMap[name].lowLimit)
              : NaN;
          if (!isNaN(oldTop) && !isNaN(oldLow) && oldTop > oldLow) {
            t1.topLimit = oldTop;
            t1.lowLimit = oldLow;
            obj.TV = oldTop;
            obj.BV = oldLow;
          } else {
            t1.topLimit = obj.TV;
            t1.lowLimit = obj.BV;
          }
        } else {
          t1.topLimit =
            obj.ATV != null && obj.ATV !== "" ? obj.ATV : obj.TV;
          t1.lowLimit =
            obj.ABV != null && obj.ABV !== "" ? obj.ABV : obj.BV;
        }
        // 状态量(0/1)在长时间范围内按阶梯线绘制，避免被普通折线“压扁”成看不见的跳变
        var trendDataRaw = value && value[name] ? value[name] : null;
        var trendDataNormalized = normalizeTrendData(trendDataRaw);
        var isBinary = isBinarySeries(trendDataNormalized);
        t1.type = obj.RT == 7 && isBinary ? 2 : obj.RT;
        if (trendDataNormalized.length > 0) {
          var trendDataUse = trendDataNormalized;
          if (selectedRange) {
            var s0 = selectedRange[0];
            var s1 = selectedRange[1];
            trendDataUse = trendDataNormalized.filter(function(p) {
              return p && p.x != null && p.x >= s0 && p.x <= s1;
            });
          }
          t1.trendData = trendDataUse;
          if (trendDataUse.length > 0) {
            if (trendDataUse[0].x < globalMinX) {
              globalMinX = trendDataUse[0].x;
            }
            if (trendDataUse[trendDataUse.length - 1].x > globalMaxX) {
              globalMaxX = trendDataUse[trendDataUse.length - 1].x;
            }
          }
        } else {
          t1.trendData = [];
        }
        t1.alarmTop = obj.AT;
        t1.alarmLow = obj.AB;
        // 显隐状态统一归一化，避免 CK/KEY 为字符串导致实时重载闪帧
        var ckTrue =
          obj.CK === true || obj.CK === "true" || obj.CK === 1 || obj.CK === "1";
        var checked =
          obj.KEY === true ||
          obj.KEY === "true" ||
          obj.KEY === 1 ||
          obj.KEY === "1"
            ? true
            : obj.KEY === false ||
              obj.KEY === "false" ||
              obj.KEY === 0 ||
              obj.KEY === "0" ||
              obj.KEY === "" ||
              obj.KEY == null
            ? false
            : !ckTrue;
        if (
          typeof thisVue !== "undefined" &&
          thisVue &&
          thisVue.pointVisibilityByGN &&
          typeof thisVue.pointVisibilityByGN[name] !== "undefined"
        ) {
          checked = !!thisVue.pointVisibilityByGN[name];
        }
        obj.KEY = checked;
        obj.CK = !checked;
        t1.hide = !checked;
        // if (!trend_Util.frameSelect) {
        nextTrendArray.push(t1);
        // }
      }
      that.opTrend.trendArray = nextTrendArray;
      // 从trendPC-reloadDatas获取接口返回的时间戳
      var beginTemp = data.beginTime;
      var endTemp = data.endTime;
      var startTime_ = null;
      var endTime_ = null;
      // 如果接口没有返回则为初始化情况 使用传递过来的时间
      if (beginTemp) {
        startTime_ = new Date(beginTemp);
        endTime_ = new Date(endTemp);
      } else {
        startTime_ = from;
        endTime_ = to;
      }
      // 回溯模式下，校验接口时间戳与“已选时间区间”是否一致；若超出则按用户区间对齐
      if (selectedRange) {
        var selectedStartMs = selectedRange[0];
        var selectedEndMs = selectedRange[1];
        var axisStartMs = parseTimeMs(startTime_);
        var axisEndMs = parseTimeMs(endTime_);
        if (!isNaN(axisStartMs) && !isNaN(axisEndMs)) {
          if (axisStartMs > axisEndMs) {
            var swap = axisStartMs;
            axisStartMs = axisEndMs;
            axisEndMs = swap;
          }
          var crossStart = Math.max(axisStartMs, selectedStartMs);
          var crossEnd = Math.min(axisEndMs, selectedEndMs);
          if (crossStart <= crossEnd) {
            startTime_ = new Date(crossStart);
            endTime_ = new Date(crossEnd);
          } else {
            startTime_ = new Date(selectedStartMs);
            endTime_ = new Date(selectedEndMs);
          }
        } else {
          startTime_ = new Date(selectedStartMs);
          endTime_ = new Date(selectedEndMs);
        }
      }
      // 兜底：若接口时间或选择区间与实际点集不一致，则以“实际绘制点范围”为准，防止有点却不在可视窗
      if (globalMinX !== Infinity && globalMaxX !== -Infinity) {
        var fromMsFinal = parseTimeMs(startTime_);
        var toMsFinal = parseTimeMs(endTime_);
        if (
          isNaN(fromMsFinal) ||
          isNaN(toMsFinal) ||
          globalMaxX < fromMsFinal ||
          globalMinX > toMsFinal
        ) {
          startTime_ = new Date(globalMinX);
          endTime_ = new Date(globalMaxX);
        }
      }
      that.opTrend.from = startTime_;
      that.opTrend.to = endTime_;
      this.initAdaptiveRange();
      // from = trend_Util.dateFormat(from, that.formatString);
      // to = trend_Util.dateFormat(to, that.formatString);
      // if (true) {
      //   that.historyPlayer(names, from, to, current);
      // } else {
      //   that.opTrend.repaint(names);
      // }
      // that.initAdaptiveRange();
      // thisVue.autoRangeChange()
    };
    /**
     重新建立连接的时候，需要移除以前的监听
     */
    this.resetSocket = function(socket) {
      // var socketOn = this.socket;
      // socketOn.removeAllListeners("/trend/getPointInfo");
      // socketOn.removeAllListeners("/trend/getTrendHis");
      // socketOn.removeAllListeners("/trend/refreshTrend");
      // this.socket = socket;
      // this.getTrendRealLoading = false;
    };
    this.getTrendRealLoading = false;
    //实时刷新数据
    this.getTrendReal = function() {
      // var socketOn = this.socket;
      // var that = this;
      // that.trendIntervalId = setInterval(function () {
      //   if (that.getTrendRealLoading) {
      //     return;
      //   }
      //   that.getTrendRealLoading = true;
      //   // socketOn.emit("/trend/refreshTrend", {
      //   //   pointsName: that.defaultTrendString
      //   // });
      // }, that.flushInterval);
    };
    /**
     * 格式化显示信息
     * @param {Object} data
     * @source 源数据 源自接口
     * @names 需要显示的测点趋势名称
     * 2024/10/18 12:00:00 P637930 修正
     */
    this.initPointInfoTable = function(source, names) {
      if (!source || !names) {
        return;
      }
      var that = this;
      function toChecked(v, fallback) {
        if (v === true || v === false) {
          return v;
        }
        if (v === 1 || v === "1" || v === "true") {
          return true;
        }
        if (v === 0 || v === "0" || v === "false" || v === "" || v == null) {
          return false;
        }
        return !!fallback;
      }
      // 兜底缓存：当 map 偶发未命中时，仍可从上一帧表格状态恢复 KEY/CK
      var oldPointInfoTableData = that.pointInfoTableData
        ? that.pointInfoTableData.slice()
        : [];
      function findOldRow(cur) {
        if (!cur) {
          return null;
        }
        for (var oi = 0; oi < oldPointInfoTableData.length; oi++) {
          var old = oldPointInfoTableData[oi];
          if (!old) {
            continue;
          }
          if (cur.GN && old.GN && String(cur.GN) === String(old.GN)) {
            return old;
          }
          if (cur.ID && old.ID && String(cur.ID) === String(old.ID)) {
            return old;
          }
        }
        return null;
      }
      // 上下限与接口一致（支持小数，避免 parseInt 截断）
      function normalizeLimit(v) {
        if (v === null || v === undefined || v === "") {
          return v;
        }
        var n = Number(v);
        return isNaN(n) ? v : n;
      }
      function getForcedChecked(gn) {
        if (
          typeof thisVue !== "undefined" &&
          thisVue &&
          thisVue.pointVisibilityByGN &&
          gn &&
          typeof thisVue.pointVisibilityByGN[gn] !== "undefined"
        ) {
          return !!thisVue.pointVisibilityByGN[gn];
        }
        return null;
      }
      // 先清空测点表格数据
      that.pointInfoTableData = [];
      // 如果传递的测点数据为空则不继续往下走
      // 接口返回的所有趋势原数据
      var objSize = source.length;
      // 需要添加的趋势点长度
      var objNameSize = names.length;
      for (var j = 0; j < objNameSize; j++) {
        // 添加趋势数据：names 可能为 GN、也可能为 KNS 数字 id（与接口 GN 不一致时需按 ID 匹配）
        var objNameRaw = names[j];
        var objName =
          objNameRaw == null ? "" : String(objNameRaw).trim();
        var matched = null;
        for (var i = 0; i < objSize; i++) {
          var row = source[i];
          if (!row) {
            continue;
          }
          var gnCell = row.GN == null ? "" : String(row.GN).trim();
          if (objName && gnCell && objName === gnCell) {
            matched = row;
            break;
          }
          if (
            objName &&
            row.ID != null &&
            objName === String(row.ID).trim()
          ) {
            matched = row;
            break;
          }
        }
        if (!matched || matched.ID == null || matched.GN == null) {
          continue;
        }
        var obj = matched;
        // 监测是否（已经添加）存在该测点
        var objC = this.trendConfigInfoMap.get(obj.GN);
        // console.log(objC,'objC');
        // console.log(obj,'obj');
        if (objC && objC.ID) {
          // 匹配测点：颜色/线宽等沿用缓存
          // TV/BV 保持接口最新值；ATV/ABV 若用户已手动修改则优先保留（实时刷新时不被回写覆盖）
          var apiTV = normalizeLimit(obj.TV);
          var apiBV = normalizeLimit(obj.BV);
          var keepATV =
            objC.ATV !== undefined && objC.ATV !== null && objC.ATV !== ""
              ? normalizeLimit(objC.ATV)
              : apiTV;
          var keepABV =
            objC.ABV !== undefined && objC.ABV !== null && objC.ABV !== ""
              ? normalizeLimit(objC.ABV)
              : apiBV;
          // 保留用户勾选状态：KEY(表格) 与 CK(canvas隐藏标记) 必须成对同步
          var keepChecked = toChecked(
            objC.KEY,
            !(objC.CK === true || objC.CK === "true" || objC.CK === 1 || objC.CK === "1")
          );
          var forcedChecked = getForcedChecked(obj.GN);
          if (forcedChecked !== null) {
            keepChecked = forcedChecked;
          }
          obj.KEY = keepChecked;
          obj.CK = !keepChecked;
          obj.FM = objC.FM;
          obj.CO = objC.CO;
          obj.RT = objC.RT;
          obj.TV = apiTV;
          obj.BV = apiBV;
          obj.ATV = keepATV;
          obj.ABV = keepABV;
          obj.AT = objC.AT;
          obj.AB = objC.AB;
          obj.LW = objC.LW;
          obj.EU = objC.EU;
          // obj.AV = objC.AV;
          // 与表格使用同一引用，避免 map 里仍是旧 TV/BV
          this.trendConfigInfoMap.put(obj.GN, obj);
        } else {
          // 首次添加：上下限同样取自接口 TV、BV，与表格、map 使用同一对象，避免 map 与表格行不一致
          obj.AT = "";
          obj.AB = "";
          obj.LW = that.lineWidth;
          var oldObj = findOldRow(obj);
          if (oldObj) {
            var oldChecked = toChecked(
              oldObj.KEY,
              !(oldObj.CK === true || oldObj.CK === "true" || oldObj.CK === 1 || oldObj.CK === "1")
            );
            var forcedCheckedOld = getForcedChecked(obj.GN);
            if (forcedCheckedOld !== null) {
              oldChecked = forcedCheckedOld;
            }
            obj.KEY = oldChecked;
            obj.CK = !oldChecked;
            obj.CO = oldObj.CO || that.getTrendColor();
            obj.FM = oldObj.FM || obj.FM;
            obj.RT = oldObj.RT || obj.RT;
            obj.AT = oldObj.AT;
            obj.AB = oldObj.AB;
            obj.LW = oldObj.LW || that.lineWidth;
          } else {
            var forcedCheckedNew = getForcedChecked(obj.GN);
            obj.KEY = forcedCheckedNew !== null ? forcedCheckedNew : true;
            obj.CK = !obj.KEY;
            obj.CO = that.getTrendColor();
          }
          var apiTV0 = normalizeLimit(obj.TV);
          var apiBV0 = normalizeLimit(obj.BV);
          obj.TV = apiTV0;
          obj.BV = apiBV0;
          obj.ATV = apiTV0;
          obj.ABV = apiBV0;
          this.trendConfigInfoMap.put(obj.GN, obj);
        }
        if (!obj.ID) {
          // 初始化的数据没有id（只有一条）
          continue;
        }
        // 添加至表格数据
        that.pointInfoTableData.push(obj);
        if (typeof thisVue !== "undefined" && thisVue && obj.GN) {
          if (!thisVue.pointVisibilityByGN) {
            thisVue.pointVisibilityByGN = {};
          }
          thisVue.pointVisibilityByGN[obj.GN] = !!obj.KEY;
        }
      }
      // 告知trendPC已修改表格数据
      this.emit("pointInfoLoad", that.pointInfoTableData);
    };
    this.removePoint = function(GN) {
      if (this.opTrend.trendArray) {
        this.trendConfigInfoMap.remove(GN);
        for (var j = 0; j < this.opTrend.trendArray.length; j++) {
          if (GN == this.opTrend.trendArray[j].pointName) {
            var co = this.opTrend.trendArray[j].color;
            this.returnTrendColor(co);
            this.opTrend.trendArray.splice(j, 1);
          }
        }
      }
      var names = [];
      var namesTemp = this.defaultTrendString;
      for (var i = 0; i < namesTemp.length; i++) {
        var nameTemp = namesTemp[i];
        if (nameTemp != GN) {
          names.push(nameTemp);
        }
      }
      this.defaultTrendString = names;
      if (this.defaultTrendString.length == 0) {
        trend_Util.stopFlush(this);
        trend_Util.clearDefaultString(this, this);
      }
      this.setHtmlCss();
      this.opTrend.repaint(names);
    };
    this.historyPlayer = function(names, from, to, current) {
      var that = this;
      var toTime = new Date(to);
      that.opTrend.currentFrom = that.opTrend.from;
      that.opTrend.to = new Date(current);
      that.opTrend.current = that.opTrend.to;
      that.history = setInterval(function() {
        if (that.opTrend.to.getTime() != toTime.getTime()) {
          that.opTrend.updateTimeReplayer(that.opTrend.to.getTime());
          trend_Util.showHistory(that.opTrend.to, that);
          that.opTrend.repaint(names);
          that.opTrend.current = that.opTrend.to;
          that.opTrend.currentFrom = that.opTrend.from;
          if (that.mouseLeaveXY.length != 0) {
            trend_Util.drawVernier(that.mouseLeaveXY, that);
          }
        } else {
          that.opTrend.from = from;
          that.opTrend.to = to;
          clearInterval(that.history);
        }
      }, that.flushInterval);
    };
    this.addTrendDate = function(names, from, to) {
      // console.log(" (names, from, to) {");
      // console.log(names, from, to, playing, current,'names, from, to, playing, current')
      names = trend_Util.removeArraySameElement(names);
      this.opTrend.promptMsg = "数据加载中";
      $("#" + this.trendcontainer).unbind();
      this.opTrend.interval = this.flushInterval;
      trend_Util.stopFlush(this);
      if (this.isDialog) {
        this.showDialog();
      } else {
        this.setHtmlCss();
      }
      this.trendStopFlushFlags.push(this.trendIntervalId);
      this.reloadData(names, from, to);
    };

    //刷新数据
    this.refreshTrend = function(value) {
      var that = this;
      var data = value.value;
      that.updatePointInfo("refreshTrendValue", data);
      var time = value.time;
      var names = that.defaultTrendString;
      var flag = false;

      for (var i = 0; i < names.length; i++) {
        var j = 0;
        for (j = 0; j < that.opTrend.trendArray.length; j++) {
          if (names[i] === that.opTrend.trendArray[j].pointName) {
            var pointId = that.opTrend.trendArray[j].id;
            if (pointId !== -1 && !trend_Util.isNull(data[pointId])) {
              var arr = [];
              arr[0] = data[pointId].x;
              arr[1] = data[pointId].y;
              that.opTrend.trendArray[j].addPoint(arr);
              //自适应量程
              if (
                arr[1] > that.opTrend.trendArray[j].TV ||
                arr[1] < that.opTrend.trendArray[j].BV
              ) {
                flag = true;
              }
            }
            break;
          }
        }
      }
      if (!that.isTrendPause) {
        //自适应量程
        that.opTrend.updateTime(time);
        that.opTrend.repaint(names);
        if (that.mouseLeaveXY.length != 0) {
          trend_Util.drawVernier(that.mouseLeaveXY, that);
        }
      }
      // if (flag) {
      //   that.initAdaptiveRange();
      // }
    };
    this.showDialog = function() {
      this.setHtmlCss();
      this.isShow = true;
    };
    /**
     *  设置趋势宽高
     *  设置页面样式和大小
     */

    this.setHtmlCss = function(xys) {
      var _canvas = document.getElementById(this.trendcontainer);
      this.canvas_context = _canvas.getContext("2d");
      this.opTrend.canvas_context = this.canvas_context;
      var canvas_width = this.containerWidthFn();
      var canvas_height = this.containerHeightFn();
      _canvas.width = canvas_width;
      _canvas.height = canvas_height;
      this.opTrend.canvasWidth = canvas_width;
      // 只给时间文字留两行，避免时间轴下方留出黑底
      var axisBand = 34;
      this.opTrend.canvasHeight = Math.max(40, canvas_height - axisBand);
      this.opTrend.timeFontLineHeight = 6;
      this.opTrend.backCanvas = null;
      // this.emit("canvasWidthChange", canvas_width);
      this.opTrend.repaint(this.defaultTrendString);
      // 此处xys传递只用在了点击测点表格最大值最小值的定位上
      trend_Util.setCanvasClick(xys, this);
      trend_Util.setCanvasFun(this);
    };
    /**
     * 重新绘制
     */
    this.trendRedraw = function(row) {
      if (this.opTrend.trendArray) {
        for (var j = 0; j < this.opTrend.trendArray.length; j++) {
          if (row.GN == this.opTrend.trendArray[j].pointName) {
            // 显隐状态统一归一化，避免 KEY/CK 类型漂移导致显示一闪一闪
            var rowCkTrue =
              row.CK === true ||
              row.CK === "true" ||
              row.CK === 1 ||
              row.CK === "1";
            var rowChecked =
              row.KEY === true ||
              row.KEY === "true" ||
              row.KEY === 1 ||
              row.KEY === "1"
                ? true
                : row.KEY === false ||
                  row.KEY === "false" ||
                  row.KEY === 0 ||
                  row.KEY === "0" ||
                  row.KEY === "" ||
                  row.KEY == null
                ? false
                : !rowCkTrue;
            row.KEY = rowChecked;
            row.CK = !rowChecked;
            if (typeof thisVue !== "undefined" && thisVue && row.GN) {
              if (!thisVue.pointVisibilityByGN) {
                thisVue.pointVisibilityByGN = {};
              }
              thisVue.pointVisibilityByGN[row.GN] = !!rowChecked;
            }
            this.opTrend.trendArray[j].hide = !rowChecked;
            this.opTrend.trendArray[j].color = row.CO;
            if (this.adaptive) {
              this.opTrend.trendArray[j].topLimit = row.TV;
              this.opTrend.trendArray[j].lowLimit = row.BV;
            } else {
              this.opTrend.trendArray[j].topLimit =
                row.ATV != null && row.ATV !== "" ? row.ATV : row.TV;
              this.opTrend.trendArray[j].lowLimit =
                row.ABV != null && row.ABV !== "" ? row.ABV : row.BV;
            }
            this.opTrend.trendArray[j].alarmTop = row.AT;
            this.opTrend.trendArray[j].alarmLow = row.AB;
            this.opTrend.trendArray[j].lineWidth = row.LW;
            break;
          }
        }
      }
      this.opTrend.repaint(this.defaultTrendString);
    };
    /**
     * 查询快捷键
     * @param hour
     */
    this.shortCutSearch = function(hour) {
      var that = this;
      that.trend_getData4CheckboxFlag = true;
      var time = that.trendEndTime;
      if (!time) {
        time = trend_Util.dateFormat(
          new Date().getTime(),
          "yyyy-MM-dd HH:mm:ss"
        );
      }
      //当 hour 为 0时，是实时，其他为历时 单位是小时
      if (hour == 0) {
        that.addTrendDate(that.defaultTrendString, null, null);
      } else {
        var from = trend_Util.getParameter4Time(hour, that, time);
        that.addTrendDate(that.defaultTrendString, from, time);
      }
    };
    /*自适应量程*/
    this.adaptiveRange = function() {
      if (this.adaptive) {
        this.opTrend.reAdaptiveRange(this.trendConfigInfoMap);
      } else {
        this.opTrend.adaptiveRange(this.trendConfigInfoMap);
      }
      this.adaptive = !this.adaptive;
      this.modifyAdaptive();
      this.opTrend.repaint(this.defaultTrendString);
    };
    /*重新加载数据的时候判断是不是处于自适应量程状态*/
    this.initAdaptiveRange = function() {
      var this_ = this;
      if (this_.adaptive) {
        setTimeout(function() {
          this_.opTrend.adaptiveRange(this_.trendConfigInfoMap);
          this_.modifyAdaptive();
          this_.opTrend.repaint(this_.defaultTrendString);
        }, 0);
      } else {
        // 固定量程：用 map 中 ATV/ABV（与表格回显一致）同步到曲线与 TV/BV，避免仅表格正确而 canvas 量程错误
        setTimeout(function() {
          this_.opTrend.reAdaptiveRange(this_.trendConfigInfoMap);
          this_.modifyAdaptive();
          this_.opTrend.repaint(this_.defaultTrendString);
        }, 0);
      }
      this_.opTrend.repaint(this_.defaultTrendString);
    };
    /*
     修改量程上下限
     */
    this.modifyAdaptive = function() {
      var pointArray = this.trendConfigInfoMap.arr;
      this.updatePointInfo("replaceTrendTVBV", pointArray);
    };

    this.clear = function() {
      var socketOn = this.socket;
      this.defaultTrendString = [];
      trend_Util.stopFlush(this);
      trend_Util.clearDefaultString(this, this);
      socketOn.removeAllListeners(
        "http://220.248.70.147:6040/opgview/trend/getPointInfo"
      );
      socketOn.removeAllListeners(
        "http://220.248.70.147:6040/opgview/trend/getTrendHis"
      );
      socketOn.removeAllListeners(
        "http://220.248.70.147:6040/opgview/trend/refreshTrend"
      );
      this.getTrendRealLoading = false;
    };
  }

  var trend_Util = {
    // frameSelect: false,
    _to_: "",
    _from_: "",
    dotcount: 2,
    colorHex: function(target) {
      var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
      var that = target;
      if (/^(rgba|RGBA)/.test(that)) {
        var aColor = that.replace(/(?:\(|\)|rgba|RGBA)*/g, "").split(",");
        var strHex = "#";
        for (var i = 0; i < aColor.length - 1; i++) {
          var hex = Number(aColor[i]).toString(16);
          if (hex === "0") {
            hex += hex;
          }
          strHex += hex;
        }
        if (strHex.length !== 7) {
          strHex = that;
        }
        return strHex;
      } else if (reg.test(that)) {
        var aNum = that.replace(/#/, "").split("");
        if (aNum.length === 6) {
          return that;
        } else if (aNum.length === 3) {
          var numHex = "#";
          for (var i = 0; i < aNum.length; i += 1) {
            numHex += aNum[i] + aNum[i];
          }
          return numHex;
        }
      } else {
        return that;
      }
    },
    isNull: function(obj) {
      if (obj == null) {
        return true;
      } else if (obj == "") {
        return true;
      } else if (undefined == obj) {
        return true;
      } else {
        return false;
      }
    },
    /**
     * 日期格式化
     *
     * @param {}
     *            time
     * @param {}
     *            format
     * @return {}
     */
    dateFormat: function(time, format) {
      var t = new Date(time),
        tf = function(i) {
          return (i < 10 ? "0" : "") + i;
        };
      return format.replace(/yyyy|yy|MM|dd|HH|mm|ss/g, function(a) {
        switch (a) {
          case "yy":
            return tf((t.getFullYear() + "").substr(2, 3));
            break;
          case "yyyy":
            return tf(t.getFullYear());
            break;
          case "MM":
            return tf(t.getMonth() + 1);
            break;
          case "mm":
            return tf(t.getMinutes());
            break;
          case "dd":
            return tf(t.getDate());
            break;
          case "HH":
            return tf(t.getHours());
            break;
          case "ss":
            return tf(t.getSeconds());
            break;
        }
      });
    },
    /**
     * 清空点组和刷新标记
     */
    clearDefaultString: function(obj, objTrendGroup) {
      objTrendGroup.defaultTrendString = [];
      objTrendGroup.trendConfigInfoMap = new trendUtilMap();
      objTrendGroup.opTrend.trendArray = [];
      objTrendGroup.initColor();
      clearInterval(objTrendGroup.trendIntervalId);
    },
    /**
     * 获取对象在页面的位置
     *
     * @param obj
     * @returns {Array}
     */
    getPosition: function(obj) {
      var topValue = 0,
        leftValue = 0,
        height = 0,
        arr = [];
      while (obj) {
        leftValue += obj.offsetLeft;
        topValue += obj.offsetTop;
        height = obj.height;
        obj = obj.offsetParent;
      }
      arr.push(leftValue);
      arr.push(topValue);
      arr.push(height);
      return arr;
    },
    /**
     * 获取canvas容器坐标
     *
     * @param e
     * @returns {Array}
     */
    getCanvasPos: function(e, objTrendGroup) {
      var canvas = document.getElementById(objTrendGroup.trendcontainer);
      var arrayXY = trend_Util.getPosition(canvas);
      var pointX = e.pageX - arrayXY[0];
      var pointY = canvas.height / 2 - 80;
      var posX = e.pageX - arrayXY[0];
      var offset = objTrendGroup.isMs ? 205 : 175;
      if (pointX + offset > canvas.width) {
        posX = canvas.width - offset;
      }
      return [pointX, pointY, posX];
    },
    /*
     根据点击的位置，获取趋势位置
     */

    getCanvasPosMobile: function(e, objTrendGroup) {
      var canvas = document.getElementById(objTrendGroup.trendcontainer);
      var arrayXY = trend_Util.getPosition(canvas);
      // console.log(arrayXY, "arrayXY");
      var touch = e.touches[0];
      var pointX = touch.clientX - arrayXY[0];
      var pointY = canvas.height / 2 - 80;
      var posX = touch.clientX - arrayXY[0];
      if (pointX + 175 > canvas.width) {
        posX = canvas.width - 175;
      }
      return [pointX, pointY, posX];
    },
    /**
     * 绘制游标值及游标线
     * @param xys
     * @param objTrendGroup
     */
    drawVernier: function(xys, objTrendGroup) {
      $("#customContextMenu").remove(); // 移除右键拖拽的菜单选项
      objTrendGroup.opTrend.repaint(objTrendGroup.defaultTrendString);
      // 数据
      objTrendGroup.canvas_context.save();
      var objs = objTrendGroup.opTrend.trendArray,
        pointX = xys[0],
        pointY = xys[1],
        posX = xys[2];
      objTrendGroup.canvas_context.globalAlpha = 0.8; // 浮游面板透明度
      objTrendGroup.canvas_context.fillStyle = "#aea7a7";
      objTrendGroup.canvas_context.fillRect(
        posX,
        pointY,
        objTrendGroup.viewerWidth,
        objTrendGroup.viewerFont +
          objTrendGroup.viewerFontLineHeight * objs.length +
          10
      );
      objTrendGroup.canvas_context.globalAlpha = 1;
      objTrendGroup.canvas_context.strokeStyle =
        objTrendGroup.opTrend.trend_bgLineColor;
      objTrendGroup.canvas_context.lineWidth = 1;
      objTrendGroup.canvas_context.save();
      objTrendGroup.canvas_context.translate(0.5, 0.5);
      objTrendGroup.canvas_context.beginPath();
      objTrendGroup.canvas_context.lineWidth = 2;
      objTrendGroup.canvas_context.moveTo(pointX, 0 + 0.8);
      objTrendGroup.canvas_context.lineTo(
        pointX,
        objTrendGroup.opTrend.canvasHeight + 0.8
      );
      objTrendGroup.canvas_context.stroke();
      objTrendGroup.canvas_context.restore();
      var time = new Date(
        objTrendGroup.opTrend.getTimeFromX(pointX + 0.8)
      ).getTime();
      var ms = "" + new Date(time).getMilliseconds();
      for (var j = 0; j <= 2; j++) {
        if (ms.length < 3) {
          ms += "0";
        }
      }
      var showTime = new Date(time);
      var year = showTime.getFullYear();
      var month = showTime.getMonth() + 1; // 月份从0开始，需要加1
      var day = showTime.getDate();
      var hours = showTime.getHours();
      var minutes = showTime.getMinutes();
      var seconds = showTime.getSeconds();
      // 格式化小时、分钟和秒
      var formattedMonth = month < 10 ? "0" + month : month;
      var formattedDay = day < 10 ? "0" + day : day;
      var formattedHours = hours < 10 ? "0" + hours : hours;
      var formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
      var formattedSeconds = seconds < 10 ? "0" + seconds : seconds;
      var formattedDateTime =
        year +
        "-" +
        formattedMonth +
        "-" +
        formattedDay +
        " " +
        formattedHours +
        ":" +
        formattedMinutes +
        ":" +
        formattedSeconds;
      var ymd = formattedDateTime;
      if (time !== time) {
        ymd = objTrendGroup.MAX_TIME;
      }
      // var ymd = trend_Util.dateFormat(new Date(time), objTrendGroup.formatString) + (objTrendGroup.isMs ? ('.' + ms) : '')
      objTrendGroup.canvas_context.fillStyle = "black";
      objTrendGroup.canvas_context.font =
        "bold " + objTrendGroup.viewerFont + "px 宋体";
      objTrendGroup.canvas_context.fillText(
        " " + ymd,
        posX,
        pointY + objTrendGroup.viewerFontLineHeight
      );
      var arr = objTrendGroup.opTrend.getValueFromTime(time);

      if (objTrendGroup.MAX_TIME) {
        objTrendGroup.canvas_context.fillStyle = objTrendGroup.MAX_CO;
        var val =
          objTrendGroup.MAX_GN +
          "  " +
          objTrendGroup.MAX_VALUE +
          " " +
          objTrendGroup.MAX_EU;
        var X = posX + 5;
        var Y =
          pointY +
          objTrendGroup.viewerFontSpace +
          objTrendGroup.viewerFontLineHeight;
        objTrendGroup.canvas_context.fillText(val, X, Y);
      } else {
        for (var f = 0; f < objs.length; f++) {
          objTrendGroup.canvas_context.fillStyle = objs[f].color;
          var val = arr[f];
          var X = posX + 5;
          var Y =
            pointY +
            objTrendGroup.viewerFontSpace +
            objTrendGroup.viewerFontLineHeight * f; // 增行高
          objTrendGroup.canvas_context.fillText(val, X, Y);
        }
      }
      objTrendGroup.canvas_context.restore();
      objTrendGroup.MAX_TIME = null;
    },
    rightClick: function(xys, objTrendGroup) {
      // 移除右键拖拽的菜单选项
      $("#customContextMenu").remove();
      // 重绘图表
      objTrendGroup.opTrend.repaint(objTrendGroup.defaultTrendString);
      // 保存画布状态
      objTrendGroup.canvas_context.save();
      var pointX = xys[0]; // 获取点击位置的X坐标
      // 绘制纵向线条
      objTrendGroup.canvas_context.strokeStyle =
        objTrendGroup.opTrend.trend_bgLineColor; // 设置线条颜色
      objTrendGroup.canvas_context.lineWidth = 1; // 设置线条宽度
      objTrendGroup.canvas_context.save();
      objTrendGroup.canvas_context.translate(0.5, 0.5); // 微调位置，防止线条偏差
      objTrendGroup.canvas_context.beginPath();
      objTrendGroup.canvas_context.lineWidth = 2; // 设置线条宽度
      objTrendGroup.canvas_context.moveTo(pointX, 0 + 0.8); // 设置线条起始点
      objTrendGroup.canvas_context.lineTo(
        pointX,
        objTrendGroup.opTrend.canvasHeight + 0.8
      ); // 设置线条终止点
      objTrendGroup.canvas_context.stroke(); // 绘制线条
      objTrendGroup.canvas_context.restore(); // 恢复画布状态
      // 弹出标注输入框
      var menu = $(
        '<ul id="customContextMenu" class="context-menu" style="display: none; position: absolute; list-style: none; padding: 5px 10px; background: #fff; border: 1px solid #ccc; box-shadow: 0px 2px 5px rgba(0,0,0,0.2);">'
      ).append('<li><a href="#">标注(不支持IE)</a></li>');
      // 在页面上显示菜单
      $("body").append(menu);
      // 设置菜单位置
      // 获取canvas的位置信息
      var canvasRect = document
        .getElementById("trend_container")
        .getBoundingClientRect();
      // 设定线条的范围
      var from = new Date(objTrendGroup.opTrend.getTimeFromX(pointX));
      var to = new Date(objTrendGroup.opTrend.getTimeFromX(pointX));
      menu
        .css({
          top: xys[1] + canvasRect.top + "px", // 使用传入的 Y 坐标加上canvas的top位置
          left: xys[0] + canvasRect.left + "px" // 使用传入的 X 坐标加上canvas的left位置
        })
        .show();
      // 点击菜单项时的处理
      menu.find("li a").on("click", function() {
        // 处理标注弹窗
        var type = 0; // 默认类型
        var pts = $("#trendFlag select[name=points]");
        pts.empty();
        pts.append("<option value='全部'>全部</option>");
        objTrendGroup.defaultTrendString &&
          objTrendGroup.defaultTrendString.forEach(function(e) {
            if (e !== "初始化") {
              pts.append("<option value='" + e + "'>" + e + "</option>");
            }
          });
        var text = layer.open({
          type: 1, // 弹出层类型
          area: ["300px", "250px"], // 弹出层大小
          title: "增加标记内容",
          content: $("#trendFlag"), // 弹出内容
          btn: ["确认", "取消"], // 按钮
          yes: function() {
            var description = $("#trendFlag textarea[name=low]").val(); // 获取描述文本
            var choose = $("#trendFlag select[name=points]").val(); // 获取选中的点
            var pps = [];
            var single = 1;
            if (choose === "全部") {
              pps = objTrendGroup.defaultTrendString; // 如果选择了全部，使用所有点
              single = 0;
            } else {
              pps.push(choose); // 否则，只添加选中的点
            }
            var urlParms = $utils.getUrlParms(location.search);
            var module = urlParms["module"] || ""; // 获取URL参数中的module字段
            // 标记对象
            var flag = {
              description: description,
              start: trend_Util.dateFormat(from, "yyyy-MM-dd HH:mm:ss"),
              end: trend_Util.dateFormat(to, "yyyy-MM-dd HH:mm:ss"),
              point: pps,
              type: type,
              single: single,
              module: module
            };
            // 将标记添加到趋势标记数组
            trendGroup.trendFlags.push(flag);
            layer.close(text); // 关闭弹出层
            objTrendGroup.opTrend.repaint(); // 重绘图表
            to = null;
            from = null;
          }
        });
        // 移除右键菜单
        menu.remove();
      });
    },

    /**
     * 为canvas 设置click 事件
     * @param objTrendGroup
     *
     */
    // setCanvasClick: function (xys, objTrendGroup) {
    //   var rightX =
    //     objTrendGroup.opTrend.canvasX +
    //     (objTrendGroup.opTrend.canvasWidth *
    //       objTrendGroup.opTrend.widthRatioA) /
    //     objTrendGroup.opTrend.widthRatioB +
    //     objTrendGroup.opTrend.margin_padding;
    //   $("#" + objTrendGroup.trendcontainer).unbind("click");
    //   $("#" + objTrendGroup.trendcontainer).bind("click", function (e) {
    //     var xys = trend_Util.getCanvasPos(e, objTrendGroup);
    //     if (parseInt(xys[0]) > parseInt(rightX)) {
    //       xys[0] = parseInt(rightX) - 3;
    //     }
    //     objTrendGroup.mouseLeaveXY = xys;
    //     trend_Util.drawVernier(xys, objTrendGroup);
    //   });
    //   if (xys) {
    //     trend_Util.drawVernier(xys, objTrendGroup);
    //   }
    // },
    setCanvasClick: function(xys, objTrendGroup) {
      var rightX =
        objTrendGroup.opTrend.canvasX +
        (objTrendGroup.opTrend.canvasWidth *
          objTrendGroup.opTrend.widthRatioA) /
          objTrendGroup.opTrend.widthRatioB +
        objTrendGroup.opTrend.margin_padding;

      // 先解绑之前的点击事件
      $("#" + objTrendGroup.trendcontainer).unbind("click");
      $("#" + objTrendGroup.trendcontainer).unbind("contextmenu");
      // 绑定左键点击事件
      $("#" + objTrendGroup.trendcontainer).bind("click", function(e) {
        var xys = trend_Util.getCanvasPos(e, objTrendGroup);
        if (parseInt(xys[0]) > parseInt(rightX)) {
          xys[0] = parseInt(rightX) - 3;
        }
        objTrendGroup.mouseLeaveXY = xys;
        trend_Util.drawVernier(xys, objTrendGroup);
      });

      // 绑定右键点击事件 (contextmenu)
      $("#" + objTrendGroup.trendcontainer).bind("contextmenu", function(e) {
        e.preventDefault(); // 阻止默认的右键菜单弹出
        // 获取右键点击位置
        var xys = trend_Util.getCanvasPos(e, objTrendGroup);
        if (parseInt(xys[0]) > parseInt(rightX)) {
          xys[0] = parseInt(rightX) - 3;
        }
        objTrendGroup.mouseLeaveXY = xys;
        // 标注
        // trend_Util.rightClick(xys, objTrendGroup);
        // 左键功能同步
        trend_Util.drawVernier(xys, objTrendGroup);
      });

      // 如果有初始的 xys，绘制标尺
      if (xys) {
        // 绘制浮游小面板
        trend_Util.drawVernier(xys, objTrendGroup);
      }
    },

    // /**
    //  * 为整体canvas添加事件
    //  */
    // setCanvasFun2: function (objTrendGroup) {
    //   var that = this;
    //   var clickBeginX = 0,
    //     downflag = false,
    //     moveflag = false,
    //     from = null,
    //     to = null;
    //   var rightX =
    //     objTrendGroup.opTrend.canvasX +
    //     (objTrendGroup.opTrend.canvasWidth *
    //       objTrendGroup.opTrend.widthRatioA) /
    //     objTrendGroup.opTrend.widthRatioB +
    //     objTrendGroup.opTrend.margin_padding;
    //   $("#" + objTrendGroup.trendcontainer).unbind("mousedown");
    //   $("#" + objTrendGroup.trendcontainer).unbind("mouseup");
    //   $("#" + objTrendGroup.trendcontainer).unbind("mousemove");
    //   $("#" + objTrendGroup.trendcontainer).bind({
    //     mousedown: function (e) {
    //       downflag = true;
    //       moveflag = false;
    //       var xys = trend_Util.getCanvasPos(e, objTrendGroup),
    //         pointX = xys[0];
    //       clickBeginX = pointX;
    //       from = new Date(objTrendGroup.opTrend.getTimeFromX(pointX));
    //       that._from_ = from;
    //       that._from_ = $utils.formatDate(that._from_);
    //       console.log(that._from_, "$utils.formatDate(that._from_)");
    //     },
    //     mousemove: function (e) {
    //       if (!downflag) return;
    //       var xys = trend_Util.getCanvasPos(e, objTrendGroup);
    //       if (parseInt(xys[0]) >= parseInt(rightX)) {
    //         xys[0] = parseInt(rightX);
    //       }
    //       var width = parseInt(xys[0]) - clickBeginX;
    //       if (downflag && parseInt(xys[0]) <= parseInt(rightX)) {
    //         objTrendGroup.opTrend.repaint(objTrendGroup.defaultTrendString);
    //         if (width >= 2) {
    //           moveflag = true;
    //           objTrendGroup.canvas_context.globalAlpha = 0.4;
    //           objTrendGroup.canvas_context.fillStyle =
    //             objTrendGroup.opTrend.trend_bgLineColor;
    //           objTrendGroup.canvas_context.fillRect(
    //             clickBeginX,
    //             0,
    //             width,
    //             objTrendGroup.opTrend.canvasHeight
    //           );
    //           objTrendGroup.canvas_context.globalAlpha = 1;
    //           to = new Date(objTrendGroup.opTrend.getTimeFromX(xys[0]));
    //           objTrendGroup.mouseLeaveXY = [];
    //         }
    //       }
    //     },
    //     mouseup: function (e) {
    //       downflag = false;
    //       var xys = trend_Util.getCanvasPos(e, objTrendGroup);
    //       if (parseInt(xys[0]) >= parseInt(rightX)) {
    //         xys[0] = parseInt(rightX);
    //       }
    //       objTrendGroup.mouseLeaveXY = xys;
    //       that._to_ = new Date(objTrendGroup.opTrend.getTimeFromX(xys[0]));
    //       that._to_ = $utils.formatDate(that._to_);
    //       console.log(that._to_, "$utils.formatDate(that._to_)");

    //       var type = !to || from == to ? 0 : 1;
    //       if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) {
    //         var pts = $("#trendFlag select[name=points]");
    //         pts.empty()
    //         pts.append("<option value='全部'>全部</option>")
    //         objTrendGroup.defaultTrendString && objTrendGroup.defaultTrendString.forEach(function (e) {
    //           if (e !== "初始化") {
    //             pts.append("<option value='" + e + "'>" + e + "</option>");
    //           }
    //         })
    //         var text = layer.open({
    //           //基本层类型
    //           type: 1,
    //           //宽高
    //           area: ['300px', '250px'],
    //           //标题
    //           title: '增加标记内容',
    //           //内容
    //           content: $('#trendFlag'),
    //           //按钮
    //           btn: ['确认', '取消'],
    //           //确定按钮
    //           yes: function () {
    //             var description = $("#trendFlag textarea[name=low]").val();
    //             var choose = $("#trendFlag select[name=points]").val();
    //             var pps = []
    //             var single = 1;
    //             if (choose === '全部') {
    //               pps = objTrendGroup.defaultTrendString;
    //               single = 0;
    //             } else {
    //               pps.push(choose)
    //             }
    //             var urlParms = $utils.getUrlParms(location.search);
    //             var module = urlParms['module'] || "";
    //             var flag = {
    //               description: description,
    //               start: trend_Util.dateFormat(from, "yyyy-MM-dd HH:mm:ss"),
    //               end: trend_Util.dateFormat(to, "yyyy-MM-dd HH:mm:ss"),
    //               point: pps,
    //               type: type,
    //               single: single,
    //               module: module
    //             }
    //             trendGroup.trendFlags.push(flag)
    //             layer.close(text);
    //             objTrendGroup.opTrend.repaint()
    //             to = null;
    //             from = null;
    //             // var data = {
    //             //   id: urlParms['id'],
    //             //   beginTime: trendGroup.trendBeginTime || $trendDate.from || $utils.dateFormat(new Date(new Date().getTime() - 60 * 1000 * 10), 'yyyy/MM/dd HH:mm:ss'),
    //             //   endTime: trendGroup.trendEndTime || $trendDate.to || $utils.dateFormat(new Date(), 'yyyy/MM/dd HH:mm:ss'),
    //             // }
    //             // if (urlParms.api) {
    //             //   $.ajax({
    //             //     type: 'GET',
    //             //     data: data,
    //             //     url: urlParms.api,
    //             //     success: function (msg) {
    //             //       consoel.log("趋势标记时间同步成功")
    //             //     },
    //             //     error: function (e) {
    //             //       console.error("获取日志失败" + e)
    //             //     }
    //             //   })
    //             // }
    //           },
    //         });
    //         moveflag = false;
    //         return;
    //       }
    //       if (moveflag) {
    //         objTrendGroup.trend_getData4CheckboxFlag = true;
    //         objTrendGroup.mouseLeaveXY = [];
    //         if (to == from) {
    //           if (!objTrendGroup.opTrend.playing) {
    //             objTrendGroup.addTrendDate(
    //               objTrendGroup.defaultTrendString,
    //               objTrendGroup.opTrend.from,
    //               objTrendGroup.opTrend.to
    //             );
    //           }
    //           return;
    //         }
    //         var maxom = 60000;
    //         if (objTrendGroup.isMs) {
    //           maxom = 6000;
    //         }
    //         if (to - from < maxom) {
    //           objTrendGroup.message('超过最大放大值', 2000);
    //           if (!objTrendGroup.opTrend.playing) {
    //             objTrendGroup.addTrendDate(
    //               objTrendGroup.defaultTrendString,
    //               objTrendGroup.opTrend.from,
    //               objTrendGroup.opTrend.to
    //             );
    //           }
    //           return;
    //         }
    //         if (
    //           (to - from) /
    //           (objTrendGroup.opTrend.to - objTrendGroup.opTrend.from) <
    //           0.002
    //         ) {
    //           if (!objTrendGroup.opTrend.playing) {
    //             objTrendGroup.addTrendDate(
    //               objTrendGroup.defaultTrendString,
    //               objTrendGroup.opTrend.from,
    //               objTrendGroup.opTrend.to
    //             );
    //           }
    //           return;
    //         }
    //         objTrendGroup.opTrend.from = from;
    //         objTrendGroup.opTrend.to = to;
    //         from = trend_Util.dateFormat(from, objTrendGroup.formatString);
    //         to = trend_Util.dateFormat(to, objTrendGroup.formatString);
    //         // trend_Util.frameSelect = true
    //         var obj = {};
    //         obj.bt = from;
    //         obj.et = to;

    //         objTrendGroup.addCanvasTimeHis(obj);
    //         objTrendGroup.addTrendDate(
    //           objTrendGroup.defaultTrendString,
    //           from,
    //           to
    //         );
    //       }
    //       // else {
    //       //   trend_Util.frameSelect = false
    //       // }

    //       moveflag = false;
    //     }
    //   });
    // },
    setCanvasFun: function(objTrendGroup) {
      var that = this;
      var clickBeginX = 0,
        downflag = false,
        moveflag = false,
        dragMark = 0,
        from = null,
        to = null;
      var rightX =
        objTrendGroup.opTrend.canvasX +
        (objTrendGroup.opTrend.canvasWidth *
          objTrendGroup.opTrend.widthRatioA) /
          objTrendGroup.opTrend.widthRatioB +
        objTrendGroup.opTrend.margin_padding;

      // 解绑原有的事件（注意兼容IE11）
      $("#" + objTrendGroup.trendcontainer).off(
        "mousedown mouseup mousemove contextmenu"
      );
      // 禁用默认右键菜单
      // $("#" + objTrendGroup.trendcontainer).on("contextmenu", function (e) {
      //   e.preventDefault(); // 禁用右键菜单
      //   return false; // 阻止默认行为
      // });
      $("#" + objTrendGroup.trendcontainer).on(
        "contextmenu mousedown mouseup mousemove",
        function(e) {
          e.preventDefault(); // 禁用右键菜单
          return false; // 阻止默认行为
        }
      );
      // 鼠标事件处理
      $("#" + objTrendGroup.trendcontainer).on({
        mousedown: function(e) {
          var xys = trend_Util.getCanvasPos(e, objTrendGroup),
            pointX = xys[0];
          clickBeginX = pointX;
          downflag = true;
          moveflag = false;
          mark = false;
          if (e.button === 0) {
            // 处理左键点击---clickBeginX存储
            dragMark = 0;
          } else if (e.button === 2) {
            // 处理右键点击---clickBeginX存储
            dragMark = 1;
          }
          // 起始时间标记/配合拖拽进行范围操作
          from = new Date(objTrendGroup.opTrend.getTimeFromX(pointX));
          that._from_ = from;
          that._from_ = $utils.formatDate(that._from_);
        },
        mousemove: function(e) {
          if (downflag) {
            var xys = trend_Util.getCanvasPos(e, objTrendGroup);
            if (parseInt(xys[0]) >= parseInt(rightX)) {
              xys[0] = parseInt(rightX);
            }
            var width = parseInt(xys[0]) - clickBeginX;
            if (downflag && parseInt(xys[0]) <= parseInt(rightX)) {
              objTrendGroup.opTrend.repaint(objTrendGroup.defaultTrendString);
              // 只有在拖动距离超过一定阈值时才认为是拖动
              if (width >= 5) {
                mark = true;
                moveflag = true;
                objTrendGroup.canvas_context.globalAlpha = 0.4;
                objTrendGroup.canvas_context.fillStyle =
                  objTrendGroup.opTrend.trend_bgLineColor;
                objTrendGroup.canvas_context.fillRect(
                  clickBeginX,
                  0,
                  width,
                  objTrendGroup.opTrend.canvasHeight
                );
                objTrendGroup.canvas_context.globalAlpha = 1;
                to = new Date(objTrendGroup.opTrend.getTimeFromX(xys[0]));
                objTrendGroup.mouseLeaveXY = [];
              } else {
                mark = false;
              }
            }
          }
        },
        mouseup: function(e) {
          downflag = false;
          if (moveflag) {
            // 如果发生了拖动
            // if (dragMark === 0) { 左键
            if (true) {
              // console.log("左键拖动结束，进行区域放大");
              var xys = trend_Util.getCanvasPos(e, objTrendGroup);
              if (parseInt(xys[0]) >= parseInt(rightX)) {
                xys[0] = parseInt(rightX);
              }
              objTrendGroup.mouseLeaveXY = xys;
              var v = new Date(objTrendGroup.opTrend.getTimeFromX(xys[0]));
              that._to_ = $utils.formatDate(v);
              // console.log(that._to_, "$utils.formatDate(that._to_)");
              objTrendGroup.trend_getData4CheckboxFlag = true;
              objTrendGroup.mouseLeaveXY = [];
              // 最小放大值
              var maxom = 60000;
              if (objTrendGroup.isMs) {
                maxom = 6000;
              }
              if (to - from < maxom) {
                objTrendGroup.message("超过最大放大值", 2000);
                if (!objTrendGroup.opTrend.playing) {
                  objTrendGroup.addTrendDate(
                    objTrendGroup.defaultTrendString,
                    objTrendGroup.opTrend.from,
                    objTrendGroup.opTrend.to
                  );
                }
                return;
              }
              objTrendGroup.opTrend.from = from;
              objTrendGroup.opTrend.to = to;
              from = trend_Util.dateFormat(from, objTrendGroup.formatString);
              to = trend_Util.dateFormat(to, objTrendGroup.formatString);
              trend_Util.frameSelect = true;
              var obj = {};
              obj.bt = from;
              obj.et = to;
              objTrendGroup.addCanvasTimeHis(obj);
              moveflag = false;
            } else {
              if (mark) {
                // // 刘休仁
                // console.log('右键拖动结束，进行区域框选标记');
                // // 清除已存在的自定义右键菜单
                // $("#customContextMenu").remove();
                // // 创建自定义右键菜单
                // var menu = $('<ul id="customContextMenu" class="context-menu" style="display: none; position: absolute; list-style: none; padding: 5px 10px; background: #fff; border: 1px solid #ccc; box-shadow: 0px 2px 5px rgba(0,0,0,0.2);">')
                //   .append('<li><a href="#">标注(不支持IE)</a></li>');
                // // 在页面上显示菜单
                // $("body").append(menu);
                // // 设置菜单位置
                // menu.css({
                //   top: e.pageY + "px",
                //   left: e.pageX + "px"
                // }).show();
                // // 点击菜单项时的处理
                // menu.find('li a').on('click', function () {
                //   var type = !to || from == to ? 0 : 1;
                //   var pts = $("#trendFlag select[name=points]");
                //   pts.empty()
                //   pts.append("<option value='全部'>全部</option>")
                //   objTrendGroup.defaultTrendString && objTrendGroup.defaultTrendString.forEach(function (e) {
                //     if (e !== "初始化") {
                //       pts.append("<option value='" + e + "'>" + e + "</option>");
                //     }
                //   })
                //   var text = layer.open({
                //     //基本层类型
                //     type: 1,
                //     //宽高
                //     area: ['300px', '250px'],
                //     //标题
                //     title: '增加标记内容',
                //     //内容
                //     content: $('#trendFlag'),
                //     //按钮
                //     btn: ['确认', '取消'],
                //     //确定按钮
                //     yes: function () {
                //       var description = $("#trendFlag textarea[name=low]").val();
                //       var choose = $("#trendFlag select[name=points]").val();
                //       var pps = []
                //       var single = 1;
                //       if (choose === '全部') {
                //         pps = objTrendGroup.defaultTrendString;
                //         single = 0;
                //       } else {
                //         pps.push(choose)
                //       }
                //       var urlParms = $utils.getUrlParms(location.search);
                //       var module = urlParms['module'] || "";
                //       var flag = {
                //         description: description,
                //         start: trend_Util.dateFormat(from, "yyyy-MM-dd HH:mm:ss"),
                //         end: trend_Util.dateFormat(to, "yyyy-MM-dd HH:mm:ss"),
                //         point: pps,
                //         type: type,
                //         single: single,
                //         module: module
                //       }
                //       trendGroup.trendFlags.push(flag)
                //       layer.close(text);
                //       objTrendGroup.opTrend.repaint()
                //       to = null;
                //       from = null;
                //     },
                //   });
                //   moveflag = false;
                //   mark = false
                //   menu.remove(); // 点击后移除菜单
                //   return;
                // });
              }
            }
          } else {
            var xys = trend_Util.getCanvasPos(e, objTrendGroup),
              pointX = xys[0];
            clickBeginX = pointX;
            // 如果没有拖动，且只是点击
            if (dragMark === 0) {
              console.log("单纯点击，左键显示测点值");
              from = new Date(objTrendGroup.opTrend.getTimeFromX(pointX));
              that._from_ = from;
              that._from_ = $utils.formatDate(that._from_);
              // console.log(that._from_, "$utils.formatDate(that._from_)");
            } else if (typeof objTrendGroup.onRightMark === "function") {
              objTrendGroup.onRightMark(that._from_);
            }
          }
        }
      });
    },
    /**
     * 显示历史回放实时数据
     */
    showHistory: function(time, objTrendGroup) {
      var objs = objTrendGroup.opTrend.trendArray;
      var arr = objTrendGroup.opTrend.getValueFromTime(time);
      var data = {};
      for (var i = 0; i < objs.length; i++) {
        var da = {};
        da.y = arr[i];
        data[objs[i].id] = da;
      }
      this.emit("refreshTrendValue", data);
    },
    checkDouble: function(obj, precision, scale) {
      // 如果未空直接返回；
      var objValue = obj.value;
      if (objValue == null || objValue.length == 0) {
        return;
      }
      // 将所有非数字，非"."去掉；
      if (objValue.match(/[^-0-9\.]+/)) {
        obj.value = objValue.replace(/[^-0-9\.]+/, "");
        objValue = obj.value;
      }
      // 小数点最多一个，超过一个，保留第一个；
      if (objValue.indexOf(".") != objValue.lastIndexOf(".")) {
        obj.value = objValue.dotClear();
        objValue = obj.value;
      }
      // 去掉首位多余的0；
      if (objValue.match(/^0+$/)) {
        obj.value = objValue.replace(/^0+$/, "0");
        objValue = obj.value;
      } else if (objValue.match(/^0+/)) {
        obj.value = objValue.replace(/^0+/, "");
        objValue = obj.value;
      }
      if (!objValue.match(/\./)) {
        // 如果没有小数点
        if (objValue.length - precision > 0) {
          // 最大长度precision
          obj.value = objValue.substring(
            obj.value.length - precision,
            obj.value.length
          );
          objValue = obj.value;
        }
      } else {
        // 有小数点；
        var dotIndex = objValue.indexOf(".");
        if (dotIndex === 0) {
          // 如果小数点在首位，前面加0
          obj.value = "0" + objValue;
          objValue = obj.value;
        }
        dotIndex = objValue.indexOf(".");
        if (dotIndex - precision > 0) {
          // 保证小数点左边最多 precision位；(超出的话向左移动小数点)
          obj.value =
            objValue.substring(dotIndex - precision, dotIndex) +
            objValue.substring(dotIndex);
          objValue = obj.value;
        }
        dotIndex = objValue.indexOf(".");
        var realScale = objValue.length - (dotIndex + 1);
        if (realScale - scale > 0) {
          // 保证小数点右边最多sacle位；
          obj.value = objValue.substring(
            0,
            objValue.length - (realScale - scale)
          );
          objValue = obj.value;
        }
      }
    },
    /**
     * 根据参数获取日期
     *
     * @param {}
     *            count
     * @return {}
     */
    getParameter4Time: function(count, objTrendGroup, dateTime) {
      var temp = 1000 * 60 * 60;
      var time = dateTime.replace(/-/g, "/");
      var result;
      if (!trend_Util.isNull(time)) {
        result = trend_Util.dateFormat(
          new Date(time).getTime() - temp * count,
          objTrendGroup.formatString
        );
      } else {
        result = trend_Util.dateFormat(
          new Date().getTime() - temp * count,
          objTrendGroup.formatString
        );
      }
      return result;
    },
    /**
     * 检测点名是否重复
     * @param names
     * @return {Boolean}
     */
    checkNameRE: function(names, objTrendGroup) {
      var flag = false;
      var length = objTrendGroup.defaultTrendString.length;
      for (var j = 0; j < names.length; j++) {
        for (var i = 0; i < length; i++) {
          if (objTrendGroup.defaultTrendString[i] == names[j]) {
            flag = true;
            break;
          }
        }
        if (i == length) {
          if (names[j]) {
            objTrendGroup.defaultTrendString.push(names[j]);
          }
        }
      }
      return flag;
    },
    /**
     * 停止刷新
     */
    stopFlush: function(objTrendGroup) {
      for (var i = 0; i < objTrendGroup.trendStopFlushFlags.length; i++) {
        clearInterval(objTrendGroup.trendStopFlushFlags[i]);
      }
      clearInterval(objTrendGroup.trendIntervalId);
      clearInterval(objTrendGroup.history);
    },
    /**
     * 删除数组中的重复元素
     * @param array
     * @returns {*}
     */
    removeArraySameElement: function(array) {
      for (var i = 0; i < array.length; i++) {
        for (var j = i + 1; j < array.length; j++) {
          if (array[i] == array[j]) {
            array = trend_Util.removeElement(j, array); // 删除指定下标的元素
            i = -1;
            break;
          }
        }
      }
      return array;
    },
    /**
     * 移除数组对象
     *
     * @param {}
     *            index
     * @param {}
     *            array
     * @return {}
     */
    removeElement: function(index, array) {
      if (index >= 0 && index < array.length) {
        for (var i = index; i < array.length; i++) {
          array[i] = array[i + 1];
        }
        array.length = array.length - 1;
      }
      return array;
    },
    statusOfDS: function(DS) {
      if (DS < 0) {
        return true;
      }
      var ds = DS >> 14;
      if (ds > 0) {
        return true;
      }
      return false;
    }
  };

  function opTrend() {
    this.trendGroupObj = null;
    this.localFormat = true;
    this.backCanvas = null;
    this.canvas_context = null;
    this.canvasX = 0;
    this.canvasY = 0;
    this.canvasWidth = 400;
    this.canvasHeight = 300;
    this.drawLineType = 0; // 画曲线类型，（暂定0为当前时间曲线，即曲线会跟随时间平移，1为固定时间区间内画曲线）
    this.colors = [
      "#FF0000",
      "#FFFF00",
      "#00FF00",
      "#6666E1",
      "#00FFFF",
      "#FF00FF",
      "#FF007B",
      "#804000",
      "#FFAFAF",
      "#99CC00",
      "#FFC800",
      "#CCFFFF",
      "#695D61",
      "#00EBA3",
      "#8540FF",
      "#FF9900"
    ];
    this.from = null;
    this.to = null;
    this.currentFrom = null;
    this.current = null;
    this.interval = 1000; // 更新频率
    this.dateType = 4; // 日期格式化类型，具体内容参考画图工具设置
    this.playing = true; // 曲线是否动态播放
    this.trendObjs = new trendUtilMap(); // 趋势组
    this.trendArray = [];
    this.margin_top = 10; // 趋势内部面板与边框上下间隔
    this.margin_bottom = 40; // 趋势内部面板与边框下间隔
    this.margin_padding = 40; // 趋势内部面板与边框左右的间隔
    this.margin_lineStyle = 0; // 外边框样式
    this.margin_fillColor = "white"; // 外边框前景色
    this.margin_fillBackColor = "white"; // 外边框后景色
    this.margin_lineWidth = 1; // 外边框线宽度
    this.margin_lineColor = "black"; // 外边框线颜色
    this.margin_type = 1; // 背景框填充样式
    this.margin_fillStyleFirst = 0;
    this.margin_fillStyleSecond = 0;
    this.margin_fillStyleThird = 0;
    this.widthRatioA = 13;
    this.widthRatioATemp = 13;
    this.widthRatioB = 14; // 趋势区域所占整体宽度为widthRatioA/widthRatioB，上下限所占（B-A）/B
    this.innerBorder_lineWidth = 1; // 内边框线宽
    this.innerBorder_lineStyle = 0; // 内边框样式
    this.innerBorder_color = "black"; // 内边框颜色
    this.xaxisHeight = 0; // x轴刻度高度
    this.xAxisScaleCount = 4; // 刻度个数
    this.timeFontColor = "#4b7288"; // 时间字体颜色
    this.timeFontSize = 14; // 时间刻度字体
    this.timeFontLineHeight = 8; //时间刻度字体距离视图距离
    this.trend_backLineCount = 10; // 背景线条数
    this.trend_bgLineColor = "black"; // 背景线颜色
    this.trend_bgLineWidth = 0.5; // 背景线宽
    this.trend_bgLineStyle = 3; // 背景线样式
    this.trend_bgColor = "black"; // 趋势面板背景色
    this.isComponents = true;
    this.promptMsg = "数据正在加载中，请稍侯……";
    this.rightMessageBackgroundColor = "white"; // 上下限信息背景色
    // 添加趋势
    this.addTrendMap = function(name, lines) {
      // 添加趋势
      this.trendObjs.put(name, lines);
    };
    this.addTrend = function(line) {
      // console.log("this.trendArray.push(line);");
      this.trendArray.push(line);
    };
    /*自适应量程*/
    this.adaptiveRange = function(trendObjMap) {
      for (var j = 0; j < this.trendArray.length; j++) {
        var opT = this.trendArray[j];
        var obj = trendObjMap.get(opT.pointName);
        opT.adaptiveRange(obj);
      }
    };
    /*重置自适应量程*/
    this.reAdaptiveRange = function(trendObjMap) {
      for (var j = 0; j < this.trendArray.length; j++) {
        var opT = this.trendArray[j];
        var obj = trendObjMap.get(opT.pointName);
        opT.reAdaptiveRange(obj);
      }
    };
    this.repaint = function(name) {
      // 重绘
      this.from = new Date(this.from);
      this.to = new Date(this.to);
      this.drawBack();
      this.drawTrend(name);
      this.canvasXAxis.draw(this);
    };
    this.drawBack = function() {
      if (
        !this.backCanvas ||
        (this.backCanvas && this.widthRatioATemp != this.widthRatioA)
      ) {
        var _canvas = document.createElement("canvas");
        _canvas.width = this.canvasWidth + this.margin_padding * 2;
        _canvas.height =
          this.canvasHeight + this.margin_top + this.margin_bottom;
        var _context = _canvas.getContext("2d");
        // 背景
        this.borderRect.draw(this, _context);
        // 绘制趋势背景区域
        this.trendRect.draw(this, _context);
        // 绘制背景线
        this.trendBackLine.draw(this, _context);
        //绘制右边区间
        this.rightMessage.draw(this, _context);
        // 绘制x轴刻度
        this.verticalDraw.draw(this, _context);
        this.backCanvas = _canvas;
        this.widthRatioATemp = this.widthRatioA;
      }
      // 清除整个画布
      this.canvas_context.clearRect(
        this.canvasX,
        this.canvasY,
        this.canvasWidth + this.margin_padding * 2,
        this.canvasHeight + this.margin_top + this.margin_bottom + 100
      );
      this.canvas_context.drawImage(
        this.backCanvas,
        this.canvasX,
        this.canvasY,
        this.canvasWidth + this.margin_padding * 2,
        this.canvasHeight + this.margin_top + this.margin_bottom
      );
    };

    // 绘制趋势标记
    // this.drawFlags = function () {
    //   var that = this;
    //   trendGroup.trendFlags.forEach(function (flag) {
    //     var start = new Date(flag.start).getTime();
    //     var end = new Date(flag.end).getTime();
    //     var xx1 = that.getCanvasX(start) + that.canvasX + that.margin_padding;
    //     var xx2 = that.getCanvasX(end) + that.canvasX + that.margin_padding;
    //     var yy1 = that.canvasY + that.margin_padding;
    //     var yy2 = that.canvasY + that.margin_padding + that.canvasHeight;
    //     that.canvas_context.save();
    //     that.canvas_context.lineWidth = 3;

    //     if (flag.single) {
    //       that.trendArray.forEach(function (e) {
    //         if (e.pointName == flag.point) {
    //           that.canvas_context.fillStyle = e.color;
    //         }
    //       });
    //     } else {
    //       that.canvas_context.fillStyle = "#fff";
    //     }
    //     that.canvas_context.font = "30px Dialog ";
    //     var strArr = [];
    //     for (var i = 0; i < flag.description.length; i += 8) {
    //       strArr.push(flag.description.slice(i, i + 8));
    //     }

    //     if (flag.type == 1) {
    //       that.canvas_context.strokeStyle = "#00FF00";
    //       that.canvas_context.strokeRect(
    //         xx1,
    //         yy1 + 1,
    //         xx2 - xx1,
    //         that.canvasHeight - 2
    //       );

    //       strArr.forEach(function (e) {
    //         that.canvas_context.fillText(e, xx1 + 5, yy1 + 100);
    //         yy1 += 30;
    //       });
    //     } else {
    //       that.canvas_context.strokeStyle = "#cbb423";
    //       that.canvas_context.beginPath();
    //       that.canvas_context.moveTo(xx1, yy1);
    //       that.canvas_context.lineTo(xx1, yy2);
    //       that.canvas_context.stroke();
    //       that.canvas_context.closePath();
    //       strArr.forEach(function (e) {
    //         that.canvas_context.fillText(e, xx1 + 5, yy1 + 100);
    //         yy1 += 30;
    //       });
    //     }
    //     that.canvas_context.restore();
    //   });
    // };
    this.drawFlags = function() {
      var _this = this; // 兼容 IE11 的 this
      trendGroup.trendFlags.forEach(function(flag) {
        var start = new Date(flag.start).getTime();
        var end = new Date(flag.end).getTime();
        var xx1 =
          _this.getCanvasX(start) + _this.canvasX + _this.margin_padding;
        var xx2 = _this.getCanvasX(end) + _this.canvasX + _this.margin_padding;
        var yy1 = _this.canvasY + _this.margin_padding;
        var yy2 = _this.canvasY + _this.margin_padding + _this.canvasHeight;
        _this.canvas_context.save();
        _this.canvas_context.lineWidth = 3;
        var textColor = "#fff";
        // 设置填充颜色
        if (flag.single) {
          var trend = _this.trendArray.find(function(e) {
            return e.pointName === flag.point[0];
          });
          if (trend) {
            textColor = trend.color;
          }
        }
        // 获取 textColor 的 RGBA 值并调整透明度
        var rgbaTextColor = $utils.hexToRgba(textColor, 0.4); // 将 hex 转换为 rgba 格式，并设置透明度
        _this.canvas_context.font = "20px Dialog";
        // 分割描述文本为多行
        var strArr = [];
        for (var i = 0; i < flag.description.length; i += 8) {
          strArr.push(flag.description.slice(i, i + 8));
        }
        // 根据类型绘制标记
        if (flag.type === 1) {
          // 绘制矩形标记，背景色为绿色透明度
          _this.canvas_context.fillStyle = rgbaTextColor; // 半透明绿色背景
          _this.canvas_context.fillRect(
            xx1,
            yy1 + 1,
            xx2 - xx1,
            _this.canvasHeight - 2
          );
          _this.canvas_context.strokeStyle = "#00FF00"; // 矩形边框颜色
          // 绘制文本背景和文本
          strArr.forEach(function(text, index) {
            var textWidth = _this.canvas_context.measureText(text).width;
            var padding = 10; // 给文本加点内边距
            // 绘制带透明背景的矩形
            _this.canvas_context.fillStyle = "rgba(255, 255, 255, 0.7)"; // 半透明白色背景
            _this.canvas_context.fillRect(
              xx1 + 5,
              yy1 + 100 + index * 30 - 20,
              textWidth + padding * 2,
              40
            );
            // 绘制文本
            _this.canvas_context.fillStyle = textColor; // 字体颜色
            _this.canvas_context.fillText(
              text,
              xx1 + 5 + padding,
              yy1 + 100 + index * 30
            );
          });
        } else {
          // _this.canvas_context.setLineDash([5, 5]); // 设置虚线，5px画线，5px空隙
          // 绘制直线标记
          _this.canvas_context.strokeStyle = textColor;
          _this.canvas_context.beginPath();
          _this.canvas_context.moveTo(xx1, yy1);
          _this.canvas_context.lineTo(xx1, yy2);
          _this.canvas_context.stroke();
          _this.canvas_context.closePath();

          // 绘制文本背景和文本
          strArr.forEach(function(text, index) {
            var textWidth = _this.canvas_context.measureText(text).width;
            var padding = 10; // 给文本加点内边距
            // 绘制带透明背景的矩形
            _this.canvas_context.fillStyle = "rgba(255, 255, 255, 0.7)"; // 半透明白色背景
            _this.canvas_context.fillRect(
              xx1 + 5,
              yy1 + 100 + index * 30 - 20,
              textWidth + padding * 2,
              40
            );
            // 绘制文本
            _this.canvas_context.fillStyle = "#000000"; // 字体颜色
            _this.canvas_context.fillText(
              text,
              xx1 + 5 + padding,
              yy1 + 100 + index * 30
            );
          });
        }

        _this.canvas_context.restore();
      });
    };
    this.drawTrend = function(name) {
      var temp = 0;
      var objs = null;
      if (this.trendArray.length > 0) {
        objs = this.trendArray;
        for (var j = 0; j < objs.length; j++) {
          objs[j].draw();
          objs[j].update();
          temp += this.canvasHeight / 20;

          objs[j].drawRightMessage(temp);

          objs[j].drawAlarmLine();
        }
      }

      this.drawFlags();
    };
    this.drawRightTxt = function() {};
    /**
     * 数据加载信息
     * @param str
     */
    this.drawPrompt = function(str) {
      this.canvas_context.fillStyle = "red";
      this.canvas_context.font = "15px 宋体";
      this.canvas_context.fillText(
        str,
        this.canvasX +
          ((this.canvasWidth / this.widthRatioB) * this.widthRatioA) / 2,
        this.canvasY + this.canvasHeight / 2
      );
    };
    /**
     * 更新X轴坐标时间
     */
    this.updateTime = function(time) {
      var interval = this.to.getTime() - this.from.getTime();
      this.from = new Date(time - interval);
      this.to = new Date(time);
    };
    /**
     * 更新X轴坐标时间
     */
    this.updateTimeReplayer = function(time) {
      var interval = this.to.getTime() - this.from.getTime();

      this.from = new Date(time - interval + this.trendGroupObj.flushInterval);
      this.to = new Date(time + this.trendGroupObj.flushInterval);
    };
    this.init = function() {
      this.from = this.getTimeFromString(this.from);
      this.to = this.getTimeFromString(this.to);
    };
    this.clear = function() {
      this.trendObjs = new trendUtilMap();
      this.trendArray = [];
    };

    /**
     * 字符串转时间
     * @param target
     * @returns {Date}
     */
    this.getTimeFromString = function(target) {
      var str = target.toString();
      str = str.replace(/-/g, "/");
      var oDate1 = new Date(str);
      return oDate1;
    };
    /**
     * 日期格式化
     * @param _format_index
     * @returns {*}
     */
    this.getDateFormat = function(_format_index) {
      switch (_format_index) {
        case 0:
          return "mm:ss";
        case 1:
          return "mm";
        case 2:
          return "hh";
        case 3:
          return "hh:mm:ss";
        case 4:
          return "yyyy-MM-dd HH:mm:ss";
        case 5:
          return "yyyy-MM-dd";
        case 6:
          return "MM-dd";
        case 7:
          return "MM-dd-yy";
        case 8:
          return "EEE";
        case 9:
          return "yyyy-MM-dd HH:mm";
        case 10:
          return "yyyy-MM-dd HH";
      }
    };
    /**
     * 趋势对象
     *
     * @param data
     * @returns
     */
    this.trendObj = function() {
      this.opTrend = new opTrend();
      this.id = -1;
      this.pointName = null;
      this.type = null;
      this.lineWidth = 1;
      this.topLimit = 100; // 上限
      this.lowLimit = 0; // 下限
      this.alarmTop = null; // 限高
      this.alarmLow = null; // 限低
      this.hide = false;
      this.dotcount = 2;
      this.color = "red";
      this.data = [];
      this.trendData = [];
      /*重置自适应量程*/
      this.reAdaptiveRange = function(obj) {
        this.topLimit = obj.ATV;
        this.lowLimit = obj.ABV;
        obj.TV = obj.ATV;
        obj.BV = obj.ABV;
      };
      /*自适应量程*/
      this.adaptiveRange = function(obj) {
        if (this.type == 1) {
          this.topLimit = 2;
          this.lowLimit = -1;
          obj.TV = this.topLimit;
          obj.BV = this.lowLimit;
          return;
        }
        var min, max;
        if (this.data != null && this.data.length > 1) {
          for (var i in this.data) {
            var value = this.data[i][1];
            if (!value && value != 0) {
              continue;
            }
            if ((!min && min != 0) || value < min) {
              min = value;
            }
            if (!max || max < value) {
              max = value;
            }
          }
        }
        if ((min && max) || min == 0 || max == 0) {
          min = Number(min).toFixed(3);
          max = Number(max).toFixed(3);
          var dis = max - min;
          dis = dis.toFixed(3);
          // this.topLimit = parseInt(max + dis * 0.2);
          // this.lowLimit = parseInt(min - dis * 0.2);
          this.topLimit = Number(max) + Number(dis) * 0.2;
          this.lowLimit = Number(min) - Number(dis) * 0.2;
          // if (dis == 0) {
          //     this.topLimit = parseInt(max + 1);
          //     this.lowLimit = parseInt(min - 1);
          // }
          if (Number(min) <= Number(this.lowLimit)) {
            this.lowLimit = Number(this.lowLimit) - 1;
          }
          if (Number(max) >= Number(this.topLimit)) {
            this.topLimit = Number(this.topLimit) + 1;
          }
        }
        this.lowLimit = Number(this.lowLimit).toFixed(3);
        this.topLimit = Number(this.topLimit).toFixed(3);
        obj.TV = this.topLimit;
        obj.BV = this.lowLimit;
      };
      // 绘制曲线--
      this.draw = function() {
        var y =
          this.opTrend.canvasY +
          this.opTrend.canvasHeight +
          this.opTrend.margin_top;
        this.opTrend.canvas_context.beginPath();
        this.opTrend.canvas_context.strokeStyle = this.color;
        this.opTrend.canvas_context.lineWidth = this.lineWidth;
        if (this.data != null && this.data.length > 1 && !this.hide) {
          this.opTrend.repaintLine(
            this.data,
            y,
            this.color,
            this.lineWidth,
            this.type,
            this.topLimit,
            this.lowLimit
          );
        } else if (this.trendData != null && this.trendData.length > 0) {
          this.data = this.opTrend.drawLineAndGenerateData(
            this.trendData,
            y,
            this.color,
            this.lineWidth,
            this.type,
            this.topLimit,
            this.lowLimit,
            this.hide
          );
          this.trendData = [];
        }
      };
      // 绘制限高限低线
      this.drawAlarmLine = function() {
        var y =
          this.opTrend.canvasY +
          this.opTrend.canvasHeight +
          this.opTrend.margin_top;
        var x1 = this.opTrend.canvasX + this.opTrend.margin_padding,
          x2 =
            this.opTrend.canvasX +
            (this.opTrend.canvasWidth * this.opTrend.widthRatioA) /
              this.opTrend.widthRatioB +
            this.opTrend.margin_padding;
        var height = 16,
          tempH = 4,
          tempW = 2;
        if (this.alarmTop != null && this.alarmTop != "" && !this.hide) {
          var width =
            this.opTrend.canvas_context.measureText(this.alarmTop).width * 1.2;
          var yy = this.opTrend.getCanvasY(
            this.alarmTop,
            this.topLimit,
            this.lowLimit
          );
          yy = this.opTrend.drawLineLimit(yy, y);
          trend_funStyle.drawDashedLine(
            x1 + width,
            yy,
            x2 - width,
            yy,
            2,
            this.lineWidth,
            this.color,
            this.opTrend.canvas_context
          );
          this.opTrend.canvas_context.globalAlpha = 0.6;
          this.opTrend.canvas_context.fillStyle = this.color;
          this.opTrend.canvas_context.fillRect(
            x1,
            yy - height / 2,
            width,
            height
          );
          this.opTrend.canvas_context.fillRect(
            x2 - width,
            yy - height / 2,
            width,
            height
          );
          this.opTrend.canvas_context.globalAlpha = 1;
          this.opTrend.canvas_context.fillStyle = this.color;
          this.opTrend.canvas_context.font = "12px 宋体";
          this.opTrend.canvas_context.fillText(
            this.alarmTop,
            x1 + tempW,
            yy + tempH
          );
          this.opTrend.canvas_context.fillText(
            this.alarmTop,
            x2 - width + tempW,
            yy + tempH
          );
        }
        if (this.alarmLow != null && this.alarmLow != "" && !this.hide) {
          var width =
            this.opTrend.canvas_context.measureText(this.alarmLow).width * 1.2;
          var yy = this.opTrend.getCanvasY(
            this.alarmLow,
            this.topLimit,
            this.lowLimit
          );
          yy = this.opTrend.drawLineLimit(yy, y);
          trend_funStyle.drawDashedLine(
            x1 + width,
            yy,
            x2 - width,
            yy,
            2,
            this.lineWidth,
            this.color,
            this.opTrend.canvas_context
          );
          this.opTrend.canvas_context.globalAlpha = 0.6;
          this.opTrend.canvas_context.fillStyle = this.color;
          this.opTrend.canvas_context.fillRect(
            x1,
            yy - height / 2,
            width,
            height
          );
          this.opTrend.canvas_context.fillRect(
            x2 - width,
            yy - height / 2,
            width,
            height
          );
          this.opTrend.canvas_context.globalAlpha = 1;
          this.opTrend.canvas_context.fillStyle = this.color;
          this.opTrend.canvas_context.font = "12px 宋体";
          this.opTrend.canvas_context.fillText(
            this.alarmLow,
            x1 + tempW,
            yy + tempH
          );
          this.opTrend.canvas_context.fillText(
            this.alarmLow,
            x2 - width + tempW,
            yy + tempH
          );
        }
      };

      // 绘制右边上下限图形及文字(方法已重构)
      // this.drawRightMessage = function (temp) {
      //   var x =
      //     this.opTrend.canvasX +
      //     this.opTrend.canvasWidth +
      //     this.opTrend.margin_padding -
      //     (this.opTrend.canvasWidth / this.opTrend.widthRatioB) *
      //     (this.opTrend.widthRatioB - this.opTrend.widthRatioA);
      //   var y = this.opTrend.canvasY + this.opTrend.margin_top,
      //     width = this.opTrend.canvasWidth / this.opTrend.widthRatioB,
      //     height = this.opTrend.canvasHeight,
      //     side = height / 35,
      //     x1 = x + width / this.opTrend.widthRatioB,
      //     y1 = y + temp - 8,
      //     y2 = y + height - temp;
      //   this.opTrend.canvas_context.fillStyle = this.color;
      //   this.opTrend.canvas_context.fillRect(x1, y1, side, side);
      //   this.opTrend.canvas_context.fillRect(x1, y2, side, side);
      //   this.opTrend.canvas_context.font =
      //     this.opTrend.timeFontSize + "px Verdana";
      //   var t = this.topLimit,
      //     l = this.lowLimit;
      //   this.opTrend.canvas_context.fillText(t, x1 + side * 1.5, y1 + side);
      //   this.opTrend.canvas_context.fillText(l, x1 + side * 1.5, y2 + side);

      //   //---------标尺----刻度数字
      //   if ($TREND_GAUGE) {
      //     var kx = x - temp * 3;
      //     var tbl = this.opTrend.trend_backLineCount;
      //     for (var i = 1; i < tbl; i++) {
      //       var ky1 = y + (i * height) / tbl + 5;
      //       var kt1 = Math.round((i * 100 * t) / tbl) / 100;
      //       this.opTrend.canvas_context.fillText(kt1, kx, ky1);
      //     }

      //     /*                var ky1 = y + height - height / 5 + 5;
      //                     var kt1 = Math.round(100*t / 5)/100;
      //                     this.opTrend.canvas_context.fillText(kt1, kx, ky1);
      //                     var ky2 = y + height - height / 5 * 2 + 5;
      //                     var kt2 = Math.round(100*t / 5 * 2)/100;
      //                     this.opTrend.canvas_context.fillText(kt2, kx, ky2);
      //                     var ky3 = y + height - height / 5 * 3 + 5;
      //                     var kt3 = Math.round(100*t / 5 * 3)/100;
      //                     this.opTrend.canvas_context.fillText(kt3, kx, ky3);
      //                     var ky4 = y + height - height / 5 * 4 + 5;
      //                     var kt4 = Math.round(100*t / 5 * 4)/100;
      //                     this.opTrend.canvas_context.fillText(kt4, kx, ky4);*/
      //   }
      // };

      /**
       * [drawRightMessage 绘制右边上下限图形及文字]
       *
       * @param   {[type]}  temp  [temp description]
       *
       * @return  {[type]}        [return description]
       * 方法重构P637930
       */
      this.drawRightMessage = function(temp) {
        // 获取画布的基本信息
        var canvasX = this.opTrend.canvasX; // 画布的X坐标
        var canvasY = this.opTrend.canvasY; // 画布的Y坐标
        var canvasWidth = this.opTrend.canvasWidth; // 画布的宽度
        var canvasHeight = this.opTrend.canvasHeight; // 画布的高度
        var marginPadding = this.opTrend.margin_padding; // 边距填充
        var marginTop = this.opTrend.margin_top; // 上边距

        // 计算绘制区域的宽度和高度
        var width = canvasWidth / this.opTrend.widthRatioB; // 绘制区域的宽度
        var height = canvasHeight; // 绘制区域的高度
        var side = height / 35; // 正方形的边长

        // 计算绘制位置的X坐标
        var x =
          canvasX +
          canvasWidth +
          marginPadding -
          (canvasWidth / this.opTrend.widthRatioB) *
            (this.opTrend.widthRatioB - this.opTrend.widthRatioA);

        // 计算上下限的位置
        var y1 = canvasY + temp - 8; // 上限的Y坐标
        var y2 = canvasY + height - temp; // 下限的Y坐标

        // 设置填充颜色
        this.opTrend.canvas_context.fillStyle = this.color;

        // 绘制上限的正方形
        this.opTrend.canvas_context.fillRect(
          x + width / this.opTrend.widthRatioB,
          y1,
          side,
          side
        );

        // 绘制下限的正方形
        this.opTrend.canvas_context.fillRect(
          x + width / this.opTrend.widthRatioB,
          y2,
          side,
          side
        );

        // 设置字体样式
        this.opTrend.canvas_context.font =
          this.opTrend.timeFontSize + "px Verdana";

        // 绘制上限的文字
        this.opTrend.canvas_context.fillText(
          this.topLimit,
          x + width / this.opTrend.widthRatioB + side * 1.5,
          y1 + side
        );

        // 绘制下限的文字
        this.opTrend.canvas_context.fillText(
          this.lowLimit,
          x + width / this.opTrend.widthRatioB + side * 1.5,
          y2 + side
        );

        // 如果启用了标尺，绘制标尺及刻度数字
        if ($TREND_GAUGE) {
          this.drawGauge(x, temp, canvasY, height);
        }
      };

      // 绘制标尺及刻度数字
      this.drawGauge = function(x, temp, baseY, height) {
        // 计算刻度数字的X坐标
        var kx = x - temp * 3;
        var tbl = this.opTrend.trend_backLineCount; // 获取标尺的总刻度数

        // 绘制每个刻度及其对应的数字
        for (var i = 1; i < tbl; i++) {
          // 计算刻度的Y坐标
          var ky = baseY + (i * height) / tbl + 5;

          // 计算当前刻度的值，并保留三位小数（与表格展示精度一致）
          var kt = Math.round((i * 1000 * this.topLimit) / tbl) / 1000;

          // 在指定位置绘制刻度数字
          this.opTrend.canvas_context.fillText(kt.toFixed(3), kx, ky);
        }
      };

      // 每次间隔更新坐标
      this.update = function() {
        var timeWidth = this.opTrend.to.getTime() - this.opTrend.from.getTime();
        if (this.data.length > 10) {
          if (this.data[1][0] + timeWidth < this.opTrend.from.getTime()) {
            this.data.splice(0, 1);
          }
        }
      };
      // 实时添加动态数据
      this.addPoint = function(arr) {
        if (this.data && this.data.length > 0) {
          var length = this.data.length;
          var val = this.data[length - 1];
          if (val[0] == arr[0]) {
            this.data[length - 1] = arr;
          } else {
            this.data.push(arr);
          }
        } else {
          this.data = [];
          this.data.push(arr);
        }
      };
    };
    /**
     * 背景框
     */
    this.borderRect = {
      draw: function(opTrend, context) {
        var width = opTrend.canvasWidth + opTrend.margin_padding * 2,
          height =
            opTrend.canvasHeight + opTrend.margin_bottom + opTrend.margin_top;
        var dashedRect = {
          x: opTrend.canvasX,
          y: opTrend.canvasY,
          width: width,
          height: height,
          lineStyle: opTrend.margin_lineStyle,
          fillType: opTrend.margin_type,
          lineWidth: opTrend.margin_lineWidth,
          color: opTrend.margin_lineColor,
          fcolor: opTrend.margin_fillColor,
          bcolor: opTrend.margin_fillBackColor,
          firstParam: opTrend.margin_fillStyleFirst,
          secondParam: opTrend.margin_fillStyleSecond,
          thirdParam: opTrend.margin_fillStyleThird
        };
        if (context) {
          trend_funStyle.drawRect(dashedRect, context);
        } else {
          trend_funStyle.drawRect(dashedRect, opTrend.canvas_context);
        }
      }
    };
    /**
     * 背景线
     */
    this.trendBackLine = {
      draw: function(opTrend, context) {
        var x = opTrend.canvasX + opTrend.margin_padding,
          y = opTrend.canvasY + opTrend.margin_top,
          targetHeight = opTrend.canvasHeight,
          temp = targetHeight / opTrend.trend_backLineCount;
        for (var i = 0; i < opTrend.trend_backLineCount - 1; i++) {
          if (context) {
            trend_funStyle.drawDashedLine(
              x,
              temp + y,
              opTrend.canvasWidth +
                x -
                (opTrend.canvasWidth / opTrend.widthRatioB) *
                  (opTrend.widthRatioB - opTrend.widthRatioA),
              temp + y,
              opTrend.trend_bgLineStyle,
              opTrend.trend_bgLineWidth,
              opTrend.trend_bgLineColor,
              context
            );
          } else {
            trend_funStyle.drawDashedLine(
              x,
              temp + y,
              opTrend.canvasWidth +
                x -
                (opTrend.canvasWidth / opTrend.widthRatioB) *
                  (opTrend.widthRatioB - opTrend.widthRatioA),
              temp + y,
              opTrend.trend_bgLineStyle,
              opTrend.trend_bgLineWidth,
              opTrend.trend_bgLineColor,
              opTrend.canvas_context
            );
          }
          temp += targetHeight / opTrend.trend_backLineCount;
        }
      }
    };
    /**
     * 绘制竖线
     * @type {{draw: opTrend.verticalDraw.draw}}
     */
    this.verticalDraw = {
      draw: function(opTrend, context) {
        var y = opTrend.canvasY + opTrend.canvasHeight + opTrend.margin_top,
          temp =
            (opTrend.canvasWidth -
              (opTrend.canvasWidth / opTrend.widthRatioB) *
                (opTrend.widthRatioB - opTrend.widthRatioA)) /
            opTrend.xAxisScaleCount,
          xTemp = 0;
        for (var i = 0; i < opTrend.xAxisScaleCount + 1; i++) {
          var _x = xTemp + opTrend.canvasX + opTrend.margin_padding;
          if (i != 0 && i < opTrend.xAxisScaleCount) {
            if (context) {
              trend_funStyle.drawDashedLine(
                _x,
                y,
                _x + 0.1,
                opTrend.canvasY + opTrend.margin_top,
                opTrend.trend_bgLineStyle,
                opTrend.trend_bgLineWidth,
                opTrend.trend_bgLineColor,
                context
              );
            } else {
              trend_funStyle.drawDashedLine(
                _x,
                y,
                _x + 0.1,
                opTrend.canvasY + opTrend.margin_top,
                opTrend.trend_bgLineStyle,
                opTrend.trend_bgLineWidth,
                opTrend.trend_bgLineColor,
                opTrend.canvas_context
              );
            }
          }
          xTemp += temp;
        }
      }
    };

    /**
     * 趋势画布
     */

    this.trendRect = {
      draw: function(opTrend, context) {
        var x = opTrend.canvasX + opTrend.margin_padding,
          y = opTrend.canvasY + opTrend.margin_top,
          width =
            (opTrend.canvasWidth / opTrend.widthRatioB) * opTrend.widthRatioA,
          height = opTrend.canvasHeight;
        var dashedRect = {
          x: x,
          y: y,
          width: width,
          height: height,
          lineStyle: opTrend.innerBorder_lineStyle,
          fillType: 1,
          lineWidth: opTrend.innerBorder_lineWidth,
          color: opTrend.innerBorder_color,
          fcolor: null,
          bcolor: opTrend.trend_bgColor
        };

        if (context) {
          trend_funStyle.drawRect(dashedRect, context);
        } else {
          trend_funStyle.drawRect(dashedRect, opTrend.canvas_context);
        }
      }
    };

    /**
     * x轴刻度对象
     */
    this.canvasXAxis = {
      time: 0,
      scale: {
        lineHeight: 5,
        draw: function(opTrend) {
          try {
            var y = opTrend.canvasY + opTrend.canvasHeight + opTrend.margin_top;
            var axisCanvas = opTrend.canvas_context && opTrend.canvas_context.canvas;
            if (axisCanvas && axisCanvas.height > y) {
              opTrend.canvas_context.save();
              opTrend.canvas_context.fillStyle = "#ffffff";
              opTrend.canvas_context.fillRect(
                0,
                y,
                axisCanvas.width,
                axisCanvas.height - y
              );
              opTrend.canvas_context.restore();
            }
            var temp =
                (opTrend.canvasWidth -
                  (opTrend.canvasWidth / opTrend.widthRatioB) *
                    (opTrend.widthRatioB - opTrend.widthRatioA)) /
                opTrend.xAxisScaleCount,
              xTemp = 0;
            opTrend.canvas_context.fillStyle = opTrend.timeFontColor;
            for (var i = 0; i < opTrend.xAxisScaleCount + 1; i++) {
              var _x = xTemp + opTrend.canvasX + opTrend.margin_padding;
              opTrend.canvas_context.font = opTrend.timeFontSize + "px Verdana";
              var time = new Date(opTrend.getTimeFromX(xTemp)).getTime(),
                ymd = "",
                hms = "";
              if (opTrend.dateType == 4) {
                var ms = "" + new Date(time).getMilliseconds();
                for (var j = 0; j <= 2; j++) {
                  if (ms.length < 3) {
                    ms += "0";
                  }
                }
                if (time != time) {
                  ymd = trend_Util.dateFormat(new Date(), "yyyy-MM-dd");
                  hms =
                    trend_Util.dateFormat(new Date(), "HH:mm:ss") +
                    (opTrend.trendGroupObj.isMs ? "." + ms : "");
                } else {
                  ymd = trend_Util.dateFormat(new Date(time), "yyyy-MM-dd");
                  hms =
                    trend_Util.dateFormat(new Date(time), "HH:mm:ss") +
                    (opTrend.trendGroupObj.isMs ? "." + ms : "");
                }
              } else {
                hms = trend_Util.dateFormat(
                  new Date(time),
                  opTrend.getDateFormat(opTrend.dateType)
                );
              }
              var labelX = _x;
              var isLastScale = i === opTrend.xAxisScaleCount;
              if (isLastScale) {
                var canvasNode = opTrend.canvas_context.canvas;
                var canvasRight = canvasNode ? canvasNode.width - 2 : labelX;
                if (labelX > canvasRight) labelX = canvasRight;
                // 末尾刻度改为右对齐，避免时间文字画出画布被裁掉
                opTrend.canvas_context.textAlign = "right";
              }
              opTrend.canvas_context.fillText(
                hms,
                labelX,
                y + opTrend.timeFontLineHeight * 2
              );
              opTrend.canvas_context.fillText(
                ymd,
                labelX,
                y + opTrend.timeFontLineHeight * 4
              );
              if (isLastScale) {
                opTrend.canvas_context.textAlign = "left";
              }
              xTemp += temp;
            }
          } catch (e) {
            log(e);
          }
        }
      },
      // 绘制背景框
      draw: function(opTrend) {
        this.scale.draw(opTrend);
      }
    };
    /**
     * 画板上下限区域
     *
     * @type
     */
    this.rightMessage = {
      draw: function(opTrend, context) {
        var x =
            opTrend.canvasX +
            opTrend.canvasWidth +
            opTrend.margin_padding -
            (opTrend.canvasWidth / opTrend.widthRatioB) *
              (opTrend.widthRatioB - opTrend.widthRatioA),
          y = opTrend.canvasY + opTrend.margin_top,
          width =
            (opTrend.canvasWidth / opTrend.widthRatioB) *
            (opTrend.widthRatioB - opTrend.widthRatioA),
          height = opTrend.canvasHeight;
        var dashedRect = {
          x: x,
          y: y,
          width: width,
          height: height,
          lineStyle: opTrend.innerBorder_lineStyle,
          fillType: 1,
          lineWidth: opTrend.innerBorder_lineWidth,
          color: opTrend.innerBorder_color,
          fcolor: null,
          bcolor: opTrend.trend_bgColor
        };
        if (context) {
          trend_funStyle.drawRect(dashedRect, context);
        } else {
          trend_funStyle.drawRect(dashedRect, opTrend.canvas_context);
        }
      }
    };
    /**
     * 获取画布x坐标
     *
     * @param target
     * @returns {Number}
     */
    this.getCanvasX = function(target) {
      var result = null,
        interval = target - this.from.getTime();
      result = this.getXProportion() * interval;
      return result;
    };
    /**
     * 获取画布y坐标
     * @param target
     * @param top
     * @param low
     * @returns {Number}
     */
    this.getCanvasY = function(target, top, low) {
      var interval = target - low,
        res =
          this.canvasHeight +
          this.canvasY +
          this.margin_top -
          this.getYProportion(top, low) * interval;
      return res;
    };
    /**
     * 获取X轴比例
     * @returns {Number}
     */
    this.getXProportion = function() {
      var timeWidth = this.to.getTime() - this.from.getTime();
      return (
        (this.canvasWidth -
          (this.canvasWidth / this.widthRatioB) *
            (this.widthRatioB - this.widthRatioA)) /
        timeWidth
      );
    };
    /**
     * 获取Y轴比例
     * @returns {Number}
     */
    this.getYProportion = function(top, low) {
      var valueHeight = top - low;
      return this.canvasHeight / valueHeight;
    };
    /**
     * 根据坐标获取时间
     *
     * @param xx
     * @returns
     */
    this.getTimeFromX = function(xx) {
      var result =
        this.from.getTime() +
        (xx * (this.to.getTime() - this.from.getTime())) /
          (this.canvasWidth -
            (this.canvasWidth / this.widthRatioB) *
              (this.widthRatioB - this.widthRatioA));
      return result;
    };
    /**
     * 根据时间获取游标值
     * @param time
     * @returns {Array}
     */
    this.getValueFromTime = function(time) {
      var arr = [],
        objs = this.trendArray;
      value = null;
      for (var f = 0; f < objs.length; f++) {
        var data = objs[f].data;
        var val = $config["openPlant.GraphConst.N_D"];
        if (objs[f].id == -1) {
          if ($checkUserPointAuth(objs[f].pointName)) {
            val = $config["openPlant.GraphConst.N_A"];
          } else {
            val = $config["openPlant.GraphConst.N_P"];
          }
        }
        if (!data || data.length == 0) {
          arr.push(val);
        } else {
          var index = this.getDataIndexFromTime(data, time, objs[f].type); // 获取数据集中和时间最近的一点
          if (index == -1) {
            arr.push($config["openPlant.GraphConst.N_D"]);
            continue;
          }
          var EU = objs[f].EU ? objs[f].EU : "";
          value = this.calcYaxisValue(
            index,
            objs[f].type,
            data,
            time,
            objs[f].id
          );
          if (typeof value == "number") {
            // 斜率
            if (objs[f].type == 1 || objs[f].type == 2 || objs[f].type == 3) {
              arr.push(value + " " + EU);
              continue;
            }
            arr.push(value.toFixed(3) + " " + EU);
          } else {
            arr.push(value + " " + EU);
          }
        }
      }
      return arr;
    };
    /**
     * 计算游标值
     *
     * @param {}
     *            index
     * @param {}
     *            type
     * @param {}
     *            data
     * @param {}
     *            time
     * @return {String}
     */
    this.calcYaxisValue = function(index, type, data, time, id) {
      if (id == -1) {
        return $config["openPlant.GraphConst.N_A"];
      }
      if (type == 0 || type == 4) {
        try {
          var xy1 = data[index],
            x1 = 0,
            y1 = 0,
            x2 = 0,
            y2 = 0;
          if (xy1 && xy1[1] != null) {
            x1 = xy1[0];
            y1 = xy1[1];
          } else {
            return $config["openPlant.GraphConst.N_D"];
          }
          if (time < x1) {
            index = index - 1;
          } else {
            index = index + 1;
          }
          var xy2 = data[index];
          if (xy2 && xy2[1] != null) {
            x2 = xy2[0];
            y2 = xy2[1];
          } else {
            return $config["openPlant.GraphConst.N_D"];
          }
          var k = (y2 - y1) / (x2 - x1),
            b = y1 - k * x1;
          var yy = k * time + b;
          return yy;
        } catch (e) {
          log(e.message);
          return $config["openPlant.GraphConst.N_D"];
        }
      } else {
        try {
          var t = data[index][1];
          var t1;
          if (data[index + 1]) {
            t1 = data[index + 1][1];
          }
          if (t != null && t1 != null) {
            return t;
          } else {
            return $config["openPlant.GraphConst.N_D"];
          }
        } catch (e) {
          log(e.message);
          return $config["openPlant.GraphConst.N_D"];
        }
      }
    };
    /**
     * 遍历数据组取时间点相近的数据的位置
     *
     * @param data
     * @param time
     * @returns {Array}
     */
    this.getDataIndexFromTime = function(data, time, type) {
      var count = -1;
      if (data) {
        if (type == 0 || type == 4) {
          for (var d = 0; d < data.length; d++) {
            var tm = Math.round(data[d][0]);
            var dataNext = data[d + 1];
            if (!dataNext) {
              return d;
            }
            var tmNext = Math.round(dataNext[0]);
            var temp = time - tm;
            var tempNext = time - tmNext;
            if (temp <= 500 && temp >= -500) {
              count = d;
              break;
            } else if (temp > 0 && tempNext < 0) {
              if (Math.abs(tempNext) > temp) {
                return d;
              } else {
                return d + 1;
              }
            } else if (tm > time) {
              count = d - 1;
              break;
            }
          }
        } else {
          for (var d = 0; d < data.length; d++) {
            var tm = Math.round(data[d][0]);
            var d2 = data[d + 1];
            if (d2) {
              var tm2 = Math.round(d2[0]);
            } else {
              return d;
            }
            if (tm >= time && time <= tm2) {
              count = d;
              break;
            } else if (tm2 > time) {
              count = d;
              break;
            }
          }
        }
      }
      return count;
    };
    /**
     * 初次画曲线并且生成x,y数组
     *
     * @param data
     * @param top
     * @param low
     * @param y
     * @returns {Array}
     */
    this.drawLineAndGenerateData = function(
      data,
      y,
      color,
      lineWidth,
      type,
      top,
      low,
      isHide
    ) {
      var newData = [];
      // console.time("用时计算");
      // 一条线600点用时<0.1
      for (var i = 0; i < data.length; i++) {
        var xys = [];
        xys[0] = data[i].x;
        if (data[i].y == null) {
          xys[1] = null;
        } else {
          xys[1] = data[i].y;
        }
        newData.push(xys);
      }
      // console.timeEnd("用时计算");
      if (!isHide) {
        this.repaintLine(newData, y, color, lineWidth, type, top, low);
      }
      return newData;
    };
    /**
     * 曲线坐标变更后重绘曲线
     *
     * @param data
     * @param y
     * @param color
     * @param lineWidth
     */
    this.repaintLine = function(data, y, color, lineWidth, type, top, low) {
      if (type == 1) {
        data = this.getDXDataFromOldData(data);
      }
      this.canvas_context.lineWidth = lineWidth;
      this.canvas_context.strokeStyle = color;
      if (type == 2 || type == 3) {
        if (data.length > 0) {
          var yyTemp;
          for (var i = 0; i < data.length; i++) {
            var xx =
                this.getCanvasX(data[i][0]) +
                this.canvasX +
                this.margin_padding,
              yy = data[i][1];

            //回放趋势时未达到的数据不进行绘制
            if (data[i]) {
              var rightX =
                this.canvasX +
                (this.canvasWidth * this.widthRatioA) / this.widthRatioB +
                this.margin_padding;
              if ((yy == null || i == 0) && i + 1 < data.length) {
                if (yy == null) {
                  var x1 =
                    this.getCanvasX(data[i + 1][0]) +
                    this.canvasX +
                    this.margin_padding;
                  if (x1 > rightX) {
                    x1 = rightX;
                  }
                  var y1 = this.getCanvasY(data[i + 1][1], top, low);
                  y1 = this.drawLineLimit(y1, y);
                  this.canvas_context.moveTo(x1, y1);
                  yyTemp = y1;
                  i++;
                } else if (i == 0) {
                  var x1 =
                    this.getCanvasX(data[i][0]) +
                    this.canvasX +
                    this.margin_padding;
                  if (x1 > rightX) {
                    x1 = rightX;
                  }
                  var y1 = this.getCanvasY(data[i][1], top, low);
                  y1 = this.drawLineLimit(y1, y);
                  this.canvas_context.moveTo(x1, y1);
                  yyTemp = y1;
                }
              } else {
                if (yy != null) {
                  yy = this.getCanvasY(yy, top, low);
                  yy = this.drawLineLimit(yy, y);
                  if (xx > rightX) {
                    xx = rightX;
                  }
                  this.canvas_context.lineTo(xx, yyTemp);
                  this.canvas_context.lineTo(xx, yy);
                  yyTemp = yy;
                }
              }
            }
            if (data[i][0] > this.to.getTime()) {
              break;
            }
          }
          this.canvas_context.stroke();
        }
      } else {
        if (data.length > 0) {
          var preData;
          for (var i = 0; i < data.length; i++) {
            var xx =
                this.getCanvasX(data[i][0]) +
                this.canvasX +
                this.margin_padding,
              yy = data[i][1];
            //回放趋势时未达到的数据不进行绘制
            if (data[i]) {
              var rightX =
                this.canvasX +
                (this.canvasWidth * this.widthRatioA) / this.widthRatioB +
                this.margin_padding;
              if ((yy == null || i == 0) && i + 1 < data.length) {
                //当超时断点时，重新开始绘线
                if (yy == null) {
                  if (data[i + 1][1] !== null) {
                    var x1 =
                      this.getCanvasX(data[i + 1][0]) +
                      this.canvasX +
                      this.margin_padding;
                    if (x1 > rightX) {
                      x1 = rightX;
                    }
                    var y1 = this.getCanvasY(data[i + 1][1], top, low);
                    y1 = this.drawLineLimit(y1, y);
                    preData = data[i];
                    this.canvas_context.moveTo(x1, y1);
                    i++;
                  }
                } else if (i == 0) {
                  var x1 =
                    this.getCanvasX(data[i][0]) +
                    this.canvasX +
                    this.margin_padding;
                  if (x1 > rightX) {
                    x1 = rightX;
                  }
                  var y1 = this.getCanvasY(data[i][1], top, low);
                  y1 = this.drawLineLimit(y1, y);
                  preData = data[i];
                  this.canvas_context.moveTo(x1, y1);
                }
              } else {
                if (yy != null) {
                  if (xx > rightX) {
                    yy = this.getTopCrossBorder(
                      preData,
                      data[i],
                      this.to.getTime()
                    );
                    xx = rightX;
                  }
                  yy = this.getCanvasY(yy, top, low);
                  yy = this.drawLineLimit(yy, y);
                  if (
                    preData &&
                    preData[1] < low &&
                    data[i][1] > low &&
                    preData[1] != null
                  ) {
                    var dataT = this.getLowCrossBorder(preData, data[i], low);
                    var xxT =
                        this.getCanvasX(dataT[0]) +
                        this.canvasX +
                        this.margin_padding,
                      yyT = dataT[1];
                    if (xxT > rightX) {
                      xxT = rightX;
                    }
                    yyT = this.getCanvasY(yyT, top, low);
                    yyT = this.drawLineLimit(yyT, y);
                    this.canvas_context.lineTo(xxT, yyT);
                  }
                  preData = data[i];
                  this.canvas_context.lineTo(xx, yy);
                }
              }
            }
            if (data[i][0] > this.to.getTime()) {
              break;
            }
          }
          this.canvas_context.stroke();
        }
      }
    };
    /**
     * 绘制前后两个点在量程下限不同位置
     * @param preData
     * @param nowData
     * @param low
     */
    this.getLowCrossBorder = function(preData, nowData, low) {
      var k = (nowData[1] - preData[1]) / (nowData[0] - preData[0]),
        b = preData[1] - k * preData[0];
      var x = (low - b) / k;
      return [parseInt(x), low];
    };
    this.getTopCrossBorder = function(preData, nowData, top) {
      var k = (nowData[1] - preData[1]) / (nowData[0] - preData[0]),
        b = preData[1] - k * preData[0];
      var y = k * top + b;
      return y;
    };
    /**
     * 数据转换为DX曲线数据
     *
     * @param data
     * @returns {Array}
     */
    this.getDXDataFromOldData = function(data) {
      var newData = [];
      if (data.length > 0) {
        for (var i = 0; i < data.length; i++) {
          if (i + 1 < data.length) {
            newData.push(data[i]);
            if (data[i][1] != null && data[i + 1][1] != null) {
              var arr = [];
              arr[0] = data[i + 1][0];
              arr[1] = data[i][1];
              newData.push(arr);
            }
          } else {
            newData.push(data[i]);
          }
        }
      }
      return newData;
    };
    /**
     * 修正曲线超出上下屏时坐标
     *
     * @param n
     * @param limit
     * @returns
     */
    this.drawLineLimit = function(n, limit) {
      if (n >= limit) {
        n = limit;
      } else if (n < this.canvasY + this.margin_top) {
        n = this.canvasY + this.margin_top;
      }
      return n;
    };
  }

  // --------------------------------------------------------------------------------------
  var trend_funStyle = {
    /**
     * 画矩形 obj --> x,y,width,height,lineStyle,lineWidth,color,fcolor,bcolor……
     */
    drawRect: function(obj, canvas_context) {
      var grd = null;
      switch (obj.fillType) {
        case 0:
          canvas_context.fillStyle = "white";
          trend_funStyle.drawBorderRect(obj, canvas_context);
          break;
        case 1:
          if (obj.fcolor == null || obj.fcolor == undefined) {
            obj.fcolor = "white";
          }
          canvas_context.fillStyle = obj.bcolor;
          trend_funStyle.drawBorderRect(obj, canvas_context);
          break;
        case 2:
          canvas_context.fillStyle = obj.bcolor;
          trend_funStyle.drawBorderRect(obj, canvas_context);
          trend_funStyle.drawBgStyle(obj, canvas_context);
          break;
        case 3:
          grd = trend_funStyle.drawBgColorChange(obj, canvas_context);
          canvas_context.fillStyle = grd;
          trend_funStyle.drawBorderRect(obj, canvas_context);
          break;
      }
    },
    /**
     * 背景色渐变
     */
    drawBgColorChange: function(obj, canvas_context) {
      var grd = null;
      switch (obj.secondParam) {
        case 0:
          grd = canvas_context.createLinearGradient(
            0,
            obj.y,
            0,
            obj.height + obj.y
          );
          break;
        case 1:
          grd = canvas_context.createLinearGradient(
            obj.x,
            0,
            obj.width + obj.x,
            0
          );
          break;
        case 2:
          grd = canvas_context.createLinearGradient(
            obj.x,
            obj.y,
            obj.width + obj.x,
            obj.height + obj.y
          );
          break;
        case 3:
          grd = canvas_context.createLinearGradient(
            obj.x,
            obj.height + obj.y,
            obj.width + obj.x,
            obj.y
          );
          break;
      }
      switch (obj.thirdParam) {
        case 0:
          grd.addColorStop(0, obj.bcolor);
          grd.addColorStop(1, obj.fcolor);
          break;
        case 1:
          grd.addColorStop(0, obj.fcolor);
          grd.addColorStop(1, obj.bcolor);
          break;
        case 2:
          grd.addColorStop(0, obj.bcolor);
          grd.addColorStop(0.5, obj.fcolor);
          grd.addColorStop(1, obj.bcolor);
          break;
        case 3:
          grd.addColorStop(0, obj.fcolor);
          grd.addColorStop(0.5, obj.bcolor);
          grd.addColorStop(1, obj.fcolor);
          break;
      }
      return grd;
    },
    /**
     * 背景图案
     */
    drawBgStyle: function(obj, canvas_context) {
      var a = 6,
        b = 8;
      switch (obj.firstParam) {
        case 0: // 横线
          trend_funStyle.drawLine4Lateral(a, obj, canvas_context);
          break;
        case 1: // 纵线
          trend_funStyle.drawLine4Longitudinal(a, obj, canvas_context);
          break;
        case 2: // 横纵交叉线
          trend_funStyle.drawLine4Lateral(a, obj, canvas_context);
          trend_funStyle.drawLine4Longitudinal(a, obj, canvas_context);
          break;
        case 3: // 横线
          trend_funStyle.drawLine4Lateral(a / 2, obj, canvas_context);
          break;
        case 4: // 纵线
          trend_funStyle.drawLine4Longitudinal(a / 2, obj, canvas_context);
          break;
        case 5: // 纵横交叉线
          trend_funStyle.drawLine4Lateral(a / 2, obj, canvas_context);
          trend_funStyle.drawLine4Longitudinal(a / 2, obj, canvas_context);
          break;
        case 6: // k = 1
          trend_funStyle.drawLine4beveled(b, obj, canvas_context);
          break;
        case 7: // k = -1
          trend_funStyle._drawLine4beveled(b, obj, canvas_context);
          break;
        case 8: // 交叉线
          trend_funStyle.drawLine4beveled(b, obj, canvas_context);
          trend_funStyle._drawLine4beveled(b, obj, canvas_context);
          break;
        case 9: // k = 1
          trend_funStyle.drawLine4beveled(b / 2, obj, canvas_context);
          break;
        case 10: // k = -1
          trend_funStyle._drawLine4beveled(b / 2, obj, canvas_context);
          break;
        case 11: // 交叉线
          trend_funStyle.drawLine4beveled(b / 2, obj, canvas_context);
          trend_funStyle._drawLine4beveled(b / 2, obj, canvas_context);
          break;
        case 12: // 波浪线
          trend_funStyle.drawWavesLine(obj);
          break;
        case 13: // 砖块线
          trend_funStyle.drawBrickBG(obj);
          break;
        case 14: // 横线虚线
          trend_funStyle.drawDashedLine4BGLateral(a, obj, canvas_context);
          break;
        case 15: // 纵向虚线
          trend_funStyle.drawDashedLine4BGLongitudinal(a, obj, canvas_context);
          break;
      }
    },

    /**
     * 画纵线
     *
     * @param temp
     * @param obj
     */
    drawLine4Longitudinal: function(temp, obj, canvas_context) {
      var count = temp;
      while (obj.x + count < obj.width + obj.x) {
        trend_funStyle.drawDashedLine(
          obj.x + count,
          obj.y,
          obj.x + count,
          obj.y + obj.height,
          0,
          1,
          obj.fcolor,
          canvas_context
        );
        count += temp;
      }
    },
    /**
     * 画横线
     *
     * @param temp
     * @param obj
     */
    drawLine4Lateral: function(temp, obj, canvas_context) {
      var count = temp;
      while (obj.y + count < obj.height + obj.y) {
        trend_funStyle.drawDashedLine(
          obj.x,
          obj.y + count,
          obj.x + obj.width,
          obj.y + count,
          0,
          1,
          obj.fcolor,
          canvas_context
        );
        count += temp;
      }
    },
    /**
     *
     * @param temp
     * @param obj
     */
    drawLine4beveled: function(temp, obj, canvas_context) {
      var count = temp;
      var flag = 0;
      while (obj.y + count <= obj.height + obj.y) {
        trend_funStyle.drawDashedLine(
          obj.x,
          obj.y + count,
          obj.x + count,
          obj.y,
          0,
          1,
          obj.fcolor,
          canvas_context
        );
        count += temp;
      }
      flag = count - temp;
      count = temp;
      while (obj.x + flag + count < obj.x + obj.width) {
        trend_funStyle.drawDashedLine(
          obj.x + count,
          obj.y + obj.height,
          obj.x + flag + count,
          obj.y,
          0,
          1,
          obj.fcolor,
          canvas_context
        );
        count += temp;
      }
      count = temp;
      while (obj.y + obj.height - count > obj.y) {
        trend_funStyle.drawDashedLine(
          obj.x + obj.width - count,
          obj.y + obj.height,
          obj.x + obj.width,
          obj.y + obj.height - count,
          0,
          1,
          obj.fcolor,
          canvas_context
        );
        count += temp;
      }
    },
    /**
     * 画斜线 k = 1 TODO width<height 情况未处理
     *
     * @param temp
     * @param obj
     */
    _drawLine4beveled: function(temp, obj, canvas_context) {
      var count = temp;
      var flag = 0;
      while (obj.y + count <= obj.height + obj.y) {
        trend_funStyle.drawDashedLine(
          obj.x,
          obj.y + obj.height - count,
          obj.x + count,
          obj.y + obj.height,
          0,
          1,
          obj.fcolor
        );
        count += temp;
      }
      flag = count - temp;
      count = temp;
      while (obj.x + flag + count < obj.x + obj.width) {
        trend_funStyle.drawDashedLine(
          obj.x + count,
          obj.y,
          obj.x + count + flag,
          obj.y + obj.height,
          0,
          1,
          obj.fcolor,
          canvas_context
        );
        count += temp;
      }
      count = temp;
      while (obj.y + obj.height - count > obj.y) {
        trend_funStyle.drawDashedLine(
          obj.x + obj.width - count,
          obj.y,
          obj.x + obj.width,
          obj.y + count,
          0,
          1,
          obj.fcolor,
          canvas_context
        );
        count += temp;
      }
    },
    /**
     * 画矩形边框（虚线样式）
     *
     * @param obj
     */
    drawBorderRect: function(obj, canvas_context) {
      canvas_context.fillRect(obj.x, obj.y, obj.width, obj.height);
      trend_funStyle.drawDashedLine(
        obj.x,
        obj.y,
        obj.x,
        obj.y + obj.height,
        obj.lineStyle,
        obj.lineWidth,
        obj.color,
        canvas_context
      );
      trend_funStyle.drawDashedLine(
        obj.x + obj.width,
        obj.y,
        obj.x + obj.width,
        obj.y + obj.height,
        obj.lineStyle,
        obj.lineWidth,
        obj.color,
        canvas_context
      );
      trend_funStyle.drawDashedLine(
        obj.x,
        obj.y,
        obj.x + obj.width,
        obj.y,
        obj.lineStyle,
        obj.lineWidth,
        obj.color,
        canvas_context
      );
      trend_funStyle.drawDashedLine(
        obj.x,
        obj.y + obj.height,
        obj.x + obj.width,
        obj.y + obj.height,
        obj.lineStyle,
        obj.lineWidth,
        obj.color,
        canvas_context
      );
    },
    /**
     * 背景横向虚线
     */
    drawDashedLine4BGLateral: function(temp, obj, canvas_context) {
      var count = temp;
      while (obj.y + count < obj.height + obj.y) {
        trend_funStyle.drawDashedLine(
          obj.x,
          obj.y + count,
          obj.x + obj.width,
          obj.y + count,
          1,
          1,
          obj.fcolor,
          canvas_context
        );
        count += temp;
        var yy = obj.y + count;
        if (yy >= obj.height + obj.y) {
          yy = obj.height + obj.y;
        }
        trend_funStyle.drawDashedLine(
          obj.x + temp,
          yy,
          obj.x + obj.width,
          yy,
          1,
          1,
          obj.fcolor,
          canvas_context
        );
        count += temp;
      }
    },
    /**
     * 背景纵向虚线
     *
     * @param temp,obj
     */
    drawDashedLine4BGLongitudinal: function(temp, obj, canvas_context) {
      var count = temp;
      while (obj.x + count < obj.width + obj.x) {
        trend_funStyle.drawDashedLine(
          obj.x + count,
          obj.y,
          obj.x + count,
          obj.y + obj.height,
          1,
          1,
          obj.fcolor,
          canvas_context
        );
        count += temp;
        var xx = obj.x + count;
        if (xx >= obj.width + obj.x) {
          xx = obj.width + obj.x;
        }
        trend_funStyle.drawDashedLine(
          xx,
          obj.y + temp,
          xx,
          obj.y + obj.height,
          1,
          1,
          obj.fcolor,
          canvas_context
        );
        count += temp;
      }
    },
    /**
     * 画波浪线
     */
    drawWavesLine: function(obj, canvas_context) {
      var tempX = 0,
        tempY = 0,
        temp = 5;
      while (tempY < obj.height - temp) {
        while (tempX < obj.width) {
          trend_funStyle.drawDashedLine(
            obj.x + tempX,
            obj.y + tempY,
            obj.x + tempX + temp,
            obj.y + tempY + temp,
            0,
            1,
            obj.fcolor,
            canvas_context
          );
          trend_funStyle.drawDashedLine(
            obj.x + tempX + temp,
            obj.y + tempY + temp,
            obj.x + tempX + 2 * temp,
            obj.y + tempY,
            0,
            1,
            obj.fcolor,
            canvas_context
          );
          tempX += 2 * temp;
        }
        tempX = 0;
        tempY += temp;
      }
    },
    /**
     * 背景砖块图案
     *
     * @param obj
     */
    drawBrickBG: function(obj, canvas_context) {
      var temp = 7,
        tempX = 0,
        tempY = 0;
      trend_funStyle.drawLine4Lateral(temp, obj);
      while (tempY < obj.height - temp) {
        while (tempX + temp < obj.width) {
          trend_funStyle.drawDashedLine(
            obj.x + tempX,
            obj.y + tempY,
            obj.x + tempX,
            obj.y + tempY + temp,
            0,
            1,
            obj.fcolor,
            canvas_context
          );
          trend_funStyle.drawDashedLine(
            obj.x + tempX + temp,
            obj.y + tempY + temp,
            obj.x + tempX + temp,
            obj.y + tempY + 2 * temp,
            0,
            1,
            obj.fcolor,
            canvas_context
          );
          tempX += 2 * temp;
        }
        tempX = 0;
        tempY += 2 * temp;
      }
    },
    /**
     * 画虚线
     * @param x
     * @param y
     * @param x2
     * @param y2
     * @param type
     * @param lw
     * @param color
     * @param canvas_context
     */
    drawDashedLine: function(x, y, x2, y2, type, lw, color, canvas_context) {
      if (color == null || color == undefined) {
        color = "black";
      }
      if (lw == null || lw == undefined) {
        lw = 1;
      }
      var dashGapArray = [];
      var flag = "butt";
      switch (type) {
        case 0:
          dashGapArray = [20000];
          flag = "square";
          break;
        case 1:
          dashGapArray = [8];
          break;
        case 2:
          dashGapArray = [4];
          break;
        case 3:
          dashGapArray = [3];
          break;
        case 4:
          dashGapArray = [2];
          break;
        case 5:
          dashGapArray = [11, 2, 2, 11];
          break;
        case 6:
          dashGapArray = [12, 3];
          break;
        case 7:
          dashGapArray = [2, 12, 2, 4];
          break;
        case 8:
          dashGapArray = [2, 2, 2, 2, 14, 12, 2, 2];
          break;
        case 9:
          dashGapArray = [11, 11, 2];
          break;
        case 10:
          dashGapArray = [4, 10];
          break;
        case 11:
          dashGapArray = [6, 10];
          break;
        case 12:
          dashGapArray = [8, 10];
          break;
        case 13:
          dashGapArray = [10, 9, 3, 10];
          break;
        case 14:
          dashGapArray = [30, 12, 6, 12];
          break;
      }
      canvas_context.lineWidth = lw;
      canvas_context.lineCap = flag;
      canvas_context.beginPath();
      canvas_context.strokeStyle = color;
      canvas_context.dashedLine(x, y, x2, y2, dashGapArray);
      canvas_context.stroke();
    }
  };

  // js map 函数
  function trendUtilMap() {
    var struct = function(key, value) {
      this.key = key;
      this.value = value;
    };
    var put = function(key, value) {
      for (var i = 0; i < this.arr.length; i++) {
        if (this.arr[i].key === key) {
          this.arr[i].value = value;
          return;
        }
      }
      this.arr[this.arr.length] = new struct(key, value);
    };

    var get = function(key) {
      for (var i = 0; i < this.arr.length; i++) {
        if (this.arr[i].key === key) {
          return this.arr[i].value;
        }
      }
      return null;
    };

    var getObj = function(key) {
      return this.arr[key].value;
    };
    var remove = function(key) {
      var v;
      for (var i = 0; i < this.arr.length; i++) {
        v = this.arr.pop();
        if (v.key === key) {
          continue;
        }
        this.arr.unshift(v);
      }
    };

    var size = function() {
      return this.arr.length;
    };

    var isEmpty = function() {
      return this.arr.length <= 0;
    };
    this.arr = [];
    this.get = get;
    this.put = put;
    this.remove = remove;
    this.size = size;
    this.getObj = getObj;
    this.isEmpty = isEmpty;
  }

  //增加一个画虚线的方法
  if (
    window.CanvasRenderingContext2D &&
    CanvasRenderingContext2D.prototype.lineTo
  ) {
    CanvasRenderingContext2D.prototype.dashedLine = function(
      x,
      y,
      x2,
      y2,
      dashArray
    ) {
      var temp = 0.1;
      if (!dashArray) {
        dashArray = [10, 5];
      }
      var dashCount = dashArray.length;
      this.moveTo(x + temp, y + temp);
      var dx = x2 - x,
        dy = y2 - y;
      var slope = dx ? dy / dx : 1e15;
      var distRemaining = Math.sqrt(dx * dx + dy * dy);
      var dashIndex = 0,
        draw = true;
      while (distRemaining >= 0.1 && dashIndex < 10000) {
        var dashLength = dashArray[dashIndex++ % dashCount];
        if (dashLength == 0) {
          dashLength = 0.001;
        } // Hack for Safari
        if (dashLength > distRemaining) {
          dashLength = distRemaining;
        }
        var xStep = Math.sqrt((dashLength * dashLength) / (1 + slope * slope));
        x += xStep;
        y += slope * xStep;
        this[draw ? "lineTo" : "moveTo"](x + temp, y + temp);
        distRemaining -= dashLength;
        draw = !draw;
      }
      this.moveTo(0, 0);
    };
  }

  window.defaultTrendGroup = defaultTrendGroup;
  window.opTrend = opTrend;
  window.trend_Util = trend_Util;
  if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = {
      defaultTrendGroup: defaultTrendGroup,
      opTrend: opTrend,
      trend_Util: trend_Util
    };
  }
})();
