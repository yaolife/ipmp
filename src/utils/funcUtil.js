'use strict'
import axios from "@/api/http";

const execFunctionURL = "/ruleEngine/execFunction";

export default {
  // js 中常见六大数据类型：Number，String，Boolean，Undefined，Object，Function
  Math: {
    ADD: function (a, b) {
      // if(typeof(a) ==="boolean" || typeof(b) ==="boolean"){
      //   // 给出错误提示
      //   throw new Error("加法运算中数据类型异常 a+b：a="+ a + "->" + typeof(a) + ",b=" + b + "->" + typeof(b));
      // }
      // 如果 a 是数字，需要把b也转为数字
      if (isNaN(a) || isNaN(b)) {
        return a + String(b);
      } else {
        return a + b;
      }
    },
    SUB: function (a, b) {
      var a_num = Number(a);
      var b_num = Number(b);

      if (isNaN(a_num)) {
        throw new Error(
          "数据类型转换异常 a-b：a=" + a + "->" + typeof a + ",转换为Number类型"
        );
        return;
      }

      if (isNaN(b_num)) {
        throw new Error(
          "数据类型转换异常 a-b：b=" + b + "->" + typeof b + ",转换为Number类型"
        );
        return;
      }
      return a_num - b_num;
    },
    MUL: function (a, b) {
      var a_num = Number(a);
      var b_num = Number(b);

      if (isNaN(a_num)) {
        throw new Error(
          "数据类型转换异常 a*b：a=" + a + "->" + typeof a + ",转换为Number类型"
        );
        return;
      }

      if (isNaN(b_num)) {
        throw new Error(
          "数据类型转换异常 a*b：b=" + b + "->" + typeof b + ",转换为Number类型"
        );
        return;
      }
      return a_num * b_num;
    },
    DIV: function (a, b) {
      var a_num = Number(a);
      var b_num = Number(b);

      if (isNaN(a_num)) {
        throw new Error(
          "数据类型转换异常 a/b：a=" + a + "->" + typeof a + ",转换为Number类型"
        );
        return;
      }

      if (isNaN(b_num)) {
        throw new Error(
          "数据类型转换异常 a/b：b=" + b + "->" + typeof b + ",转换为Number类型"
        );
        return;
      }
      return a_num / b_num;
    },

    /**
     *1、只要“||”前面为false，无论“||”后面是true还是false，结果都返回“||”后面的值
     2、只要“||”前面为true，无论“||”后面是true还是false，结果都返回“||”前面的值
     3、只要“&&”前面是false，无论“&&”后面是true还是false，结果都将返“&&”前面的值
     4、只要“&&”前面是true，无论“&&”后面是true还是false，结果都将返“&&”后面的值
     */

    AND: function (a, b) {
      if (a === "false" || a === "true" || typeof a === "boolean") {
        a = JSON.parse(a);
      } else {
        throw new Error(
          "数据类型转换异常 a && b：a=" +
          a +
          "->" +
          typeof a +
          ",转换为Boolean类型"
        );
      }
      if (b === "false" || b === "true" || typeof b === "boolean") {
        b = JSON.parse(b);
      } else {
        throw new Error(
          "数据类型转换异常 a && b：b=" +
          b +
          "->" +
          typeof b +
          ",转换为Boolean类型"
        );
      }
      return a && b;
    },
    OR: function (a, b) {
      if (a === "false" || a === "true" || typeof a === "boolean") {
        a = JSON.parse(a);
      } else {
        throw new Error(
          "数据类型转换异常 a || b：a=" +
          a +
          "->" +
          typeof a +
          ",转换为Boolean类型"
        );
      }
      if (b === "false" || b === "true" || typeof b === "boolean") {
        b = JSON.parse(b);
      } else {
        throw new Error(
          "数据类型转换异常 a || b：b=" +
          b +
          "->" +
          typeof b +
          ",转换为Boolean类型"
        );
      }
      return a || b;
    },

    GT: function (a, b) {
      var a_num = Number(a);
      if (isNaN(a_num)) {
        throw new Error(
          "数据类型转换异常 a>b：b=" + a + "->" + typeof a + ",转换为Number类型"
        );
      }

      var b_num = Number(b);
      if (isNaN(b_num)) {
        throw new Error(
          "数据类型转换异常 a>b：b=" + b + "->" + typeof b + ",转换为Number类型"
        );
      } else {
        return a_num > b_num;
      }
    },
    GE: function (a, b) {
      var a_num = Number(a);
      if (isNaN(a_num)) {
        throw new Error(
          "数据类型转换异常 a>=b：b=" +
          a +
          "->" +
          typeof a +
          ",转换为Number类型"
        );
      }

      var b_num = Number(b);
      if (isNaN(b_num)) {
        throw new Error(
          "数据类型转换异常 a>=b：b=" +
          b +
          "->" +
          typeof b +
          ",转换为Number类型"
        );
      } else {
        return a_num >= b_num;
      }
    },
    LT: function (a, b) {
      var a_num = Number(a);
      if (isNaN(a_num)) {
        throw new Error(
          "数据类型转换异常 a<b：b=" + a + "->" + typeof a + ",转换为Number类型"
        );
      }

      var b_num = Number(b);
      if (isNaN(b_num)) {
        throw new Error(
          "数据类型转换异常 a<b：b=" + b + "->" + typeof b + ",转换为Number类型"
        );
      } else {
        return a_num < b_num;
      }
    },
    LE: function (a, b) {
      var a_num = Number(a);
      if (isNaN(a_num)) {
        throw new Error(
          "数据类型转换异常 a<=b：b=" +
          a +
          "->" +
          typeof a +
          ",转换为Number类型"
        );
      }

      var b_num = Number(b);
      if (isNaN(b_num)) {
        throw new Error(
          "数据类型转换异常 a<=b：b=" +
          b +
          "->" +
          typeof b +
          ",转换为Number类型"
        );
      } else {
        return a_num <= b_num;
      }
    },
    EQ: function (a, b) {
      if (typeof a === "number") {
        var b_num = Number(b);
        if (isNaN(b_num)) {
          throw new Error(
            "数据类型转换异常 a==b：b=" +
            b +
            "->" +
            typeof b +
            ",转换为Number类型"
          );
        } else {
          return a === b_num;
        }
      }
      if (typeof a === "string") {
        var b_str = String(b);
        return a === b_str;
      }
      if (typeof a === "boolean") {
        if (b === "false" || b === "true" || typeof b === "boolean") {
          var b_bool = JSON.parse(b);
          return a === b_bool;
        } else {
          throw new Error(
            "数据类型转换异常 a == b：b=" +
            b +
            "->" +
            typeof b +
            ",转换为Boolean类型"
          );
        }
      }
    },
    NEQ: function (a, b) {
      if (typeof a === "number") {
        var b_num = Number(b);
        if (isNaN(b_num)) {
          throw new Error(
            "数据类型转换异常 a!=b：b=" +
            b +
            "->" +
            typeof b +
            ",转换为Number类型"
          );
        } else {
          return a !== b_num;
        }
      }
      if (typeof a === "string") {
        var b_str = String(b);
        return a !== b_str;
      }
      if (typeof a === "boolean") {
        if (b === "false" || b === "true" || typeof b === "boolean") {
          var b_bool = JSON.parse(b);
          return a !== b_bool;
        } else {
          throw new Error(
            "数据类型转换异常 a != b：b=" +
            b +
            "->" +
            typeof b +
            ",转换为Boolean类型"
          );
        }
      }
    },
    FUN: function (fnName, argsCount) {
      var result = {
        isFun: true,
        fnName: fnName,
        argsCount: argsCount
      };
      return result;
    },
    FormVAR: function (tableName, colName) {
      var result = {
        isFormVAR: true,
        tableName: tableName,
        colName: colName
      };
      return result;
    },
    ProcInstVAR: function (objectName, propName) {
      return {
        isProcInst: true,
        objectName: objectName,
        propName: propName
      };
    },
    TnryExpr: function () {
      return {
        isTnryExpr: true
      };
    },
    TmpVar: function (tmpVar) {
      return {
        isTmpVar: true,
        tmpVar: tmpVar
      };
    },
    SignSt: function (tmpVar, expr) {
      return {
        isSignSt: true,
        tmpVar: tmpVar,
        expr: expr
      };
    },
    RtnSt: function (expr) {
      return {
        isRtnSt: true,
        expr: expr
      };
    }
  },

  executeExpr: function (exprs, exeCallback, dmMap, workFlowData) {
    console.log('1111111111ssss');
    function interanl(exprs, exeCallback, dmMap, workFlowData) {
      console.log(77777777777);
      var params = [];
      function fun(funToken) {
        var funArgs = params.splice(0, funToken.argsCount);
        var args = [];
        args = funArgs.reverse();
        let paramList = [];
        let len = args.length;
        for (let j = 0; j < len; j++) {
          let param = { paramValue: args[j] };
          paramList.push(param);
        }

        let paramRule = {
          functionName: funToken.fnName,
          respParamDtos: paramList
        };
        axios
          .getHttp()
          .post(execFunctionURL, paramRule, { apiTitle: "执行函数" })
          .then(res => {
            ajaxCallback(res.data.data);
          });
      }

      function ajaxCallback(result) {
        if (result === null) {
          //this.$message({type: 'error', message: "函数执行异常"})
          //return
          throw new Error("函数执行异常");
        }
        params.unshift(result);
        //alert("params"+params)
        calcNext();
      }

      function evalFormVar(tableName, colName) {
        //表名 字段名
        var variable = dmMap[tableName][colName];
        if (variable === null || variable === undefined) {
          variable = "";
        }
        return variable;
      }

      function evalProcInst(objectName, propName) {
        //to do:获取procinst的值
        if (workFlowData === null || workFlowData === undefined) {
          return "null";
        } else {
          return eval("workFlowData." + propName);
        }
      }
      //三元表达式
      function evalTnryExpr() {
        function callbackCondition(rslt) {
          rslt
            ? interanl(exprTrue, callbackEnd, dmMap, workFlowData)
            : interanl(exprFalse, callbackEnd, dmMap, workFlowData);
        }
        function callbackEnd(rslt) {
          params.unshift(rslt);
          calcNext();
        }

        var exprFalse = params.shift();
        var exprTrue = params.shift();
        var condition = params.shift();
        interanl(condition, callbackCondition, dmMap, workFlowData);
      }

      function evalTmpVar(tmpVar) {
        return tmpVars[tmpVar];
      }

      function calcNext() {
        while (exprs.length >= 0) {
          if (exprs.length === 0) {
            console.log(8888888888888)
            exeCallback(params[0]);
            return;
          }
          var token = exprs.shift();
          if (typeof token === "function") {
            var b = params.shift();
            var a = params.shift();
            params.unshift(token(a, b));
            //alert("params"+params)
            continue;
          }
          if (token && token.isFormVAR) {
            params.unshift(evalFormVar(token.tableName, token.colName));
            continue;
          }
          if (token && token.isProcInst) {
            params.unshift(evalProcInst(token.objectName, token.propName));
            continue;
          }
          if (token && token.isFun) {
            fun(token);
            return;
          }
          if (token && token.isTnryExpr) {
            evalTnryExpr();
            return;
          }
          if (token && token.isTmpVar) {
            params.unshift(evalTmpVar(token.tmpVar));
            continue;
          }
          params.unshift(token);
        }
      }
      calcNext();
    }

    if (exprs.type === "expr") {
      console.log(222222222222)
      interanl(exprs.expr, exeCallback, dmMap, workFlowData);
    }
    if (exprs.type === "sentence") {
      var tmpVars = {};
      var stmts = exprs.expr;

      var i = -1;
      exeStmtNext();
      function exeStmtNext() {
        i += 1;
        if (i == stmts.length) {
          return;
        }
        var stmt = stmts[i];
        if (stmt.isSignSt) {
          interanl(
            stmt.expr,
            function (reslt) {
              tmpVars[stmt.tmpVar] = reslt;
              exeStmtNext();
            },
            dmMap,
            workFlowData
          );
          return;
        }

        if (stmt.isRtnSt) {
          interanl(
            stmt.expr,
            function (reslt) {
              console.log(3333333333)
              exeCallback(reslt);
            },
            dmMap,
            workFlowData
          );
          return;
        }
      }
    }
  }
};

// 节流
export function throttle(func, delay) {
  let timer = null;
  let startTime = Date.now();
  return function () {
    let context = this;
    let args = arguments;
    let currentTime = Date.now();
    let remaining = delay - (currentTime - startTime);
    clearTimeout(timer);
    if (remaining <= 0) {
      func.apply(context, args);
      startTime = Date.now();
    } else {
      timer = setTimeout(func, remaining);
    }
  };
}

// 防抖
export function debounce(fn, delay) {
  let timer = null
  return function () {
    clearTimeout(timer)
    const args = arguments
    const that = this
    timer = setTimeout(function () {
      fn.apply(that, args) // 这里的that是上一层函数的this
    }, delay)
  }
}

// iconfont编译
export function iconfont(icon) {
  const reg = /(&#x)?(.*)/;
  let iconfontName;
  if (reg.test(icon)) {
    iconfontName = reg.exec(icon)[2];
  }
  return String.fromCharCode(parseInt(iconfontName, 16));
}

/**
 * 去除秒
 * @param {yyyy-MM-dd hh:mm:ss} time
 * @returns yyyy-MM-dd hh:mm
 */
export function splitTime(time) {
  const timeArr = time.split(" ");
  const dayTime = timeArr[1].split(":");
  return timeArr[0] + " " + dayTime[0] + ":" + dayTime[1];
}

//获取请求头
export function getHeadersOptions() {
  let header = {};
  header["menuCode"] = sessionStorage.getItem("menuCode");
  if (process.env.AUTH_TYPE !== "AEP") {
    //带入token
    let token = sessionStorage.getItem("token");
    if (token !== null) header["token"] = token;
  }
  return header;
}

// 动态计算高度
export function calcHeight(that, height) {
  // that   组件本身，用于给它设置高度
  // height 微调高度，支持正负数
  that.$nextTick(() => {
    // 获取卡片边距需要一定延迟
    setTimeout(() => {
      let pageHeight = document.documentElement.clientHeight || document.body.clientHeight;
      // 根据缩放比例调整 $root.zoom 来自个人中心界面缩放
      pageHeight = that.$root.zoom ? pageHeight / (that.$root.zoom / 100) : pageHeight;
      // 加/减去微调的高度
      pageHeight += isNaN(height) ? 0 : height;
      // 树/表格高度
      let treeHeight = pageHeight;
      let tableHeight = pageHeight;

      // 查询树位置
      let treeBlock = that.$el.querySelector(".cud__tree--left .el-tree");
      if (treeBlock) {
        let rect = treeBlock.getBoundingClientRect();
        if (rect.top > 0) {
          treeHeight -= rect.top;
          that.treeBlockHeight = rect.top;
        } else if (that.treeBlockHeight && that.treeBlockHeight > 0) {
          // 页签隐藏时，虚拟dom会获取不到rect，使用之前的值
          treeHeight -= that.treeBlockHeight;
        }
      }

      // 查询表格位置（搜索条件展开时位置不同）
      // 页面有多个TAB表格，使用document.querySelector只会查第一个表格，故使用that.$el.querySelector
      let tableBlock = that.$el.querySelector(".cud__table--list .el-table, .cud__table--list .vxe-table");
      if (tableBlock) {
        let rect = tableBlock.getBoundingClientRect();
        if (rect.top > 0) {
          tableHeight -= rect.top;
          that.tableBlockHeight = rect.top;
        } else if (that.tableBlockHeight && that.tableBlockHeight > 0) {
          // 页签隐藏时，虚拟dom会获取不到rect，使用之前的值
          tableHeight -= that.tableBlockHeight;
        }
      }
    
      // 减去卡片/TAB边距
      let cardBlock = document.querySelector(".cud-commom-form-style .el-tabs");
      if (!cardBlock) cardBlock = document.querySelector(".cud-commom-form-style .el-card");
      if (cardBlock) {
        let styles = window.getComputedStyle(cardBlock);
        let margin = parseFloat(styles.marginBottom);
        if (margin > 0) {
          if (tableBlock) {
            // 减去下边距的高度，因为上边距已算在表格坐标内
            treeHeight -= margin;
            tableHeight -= margin;
            that.cardBlockHeight = margin;
          } else {
            // 查询不到表格的时候，减去上下双倍边距
            treeHeight -= margin * 2;
            tableHeight -= margin * 2;
            that.cardBlockHeight = margin * 2;
          }
        }
      }

      // 设置菜单树高度
      that.maxTreeHeight = treeHeight - 27;
      // 设置表格/组件高度
      that.maxRightHeight = that.maxTableHeight = tableHeight - 65;
      that.computedHeight = that.maxComponentHeight = tableHeight - 65;
    }, 200)
  })
}
