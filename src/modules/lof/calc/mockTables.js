const MockData = {
  flowSupportParams: {
    '刚性':{fn:15,alpha:52000,beta:-0.80,desc:'刚性支撑'},
    '中刚':{fn:10,alpha:62000,beta:-0.83,desc:'中刚支撑'},
    '中等':{fn:6,alpha:68000,beta:-0.84,desc:'中等支撑'},
    '中等柔性':{fn:4,alpha:71000,beta:-0.855,desc:'中等柔性支撑'},
    '柔性':{fn:1,alpha:74493.89,beta:-0.861637,desc:'柔性支撑'}
  },
  mechanicalLofTable: {
    '往复式/容积式压缩机/泵':0.90,
    '柴油机/燃气机':0.80,
    '螺杆压缩机/泵':0.60,
    '离心泵':0.40,
    '电动机/交流发电机':0.40,
    '离心式压缩机':0.40,
    '燃气轮机':0.40,
    '风机':0.20,
    '相邻且共用管架 LOF≥0.5 的管道':0.50,
    '无':0.0
  },
  valveFLTable: {
    'ball':0.60,
    'butterfly':0.62,
    'globe':0.90,
    'gate':0.60,
    'check':0.60
  },
  tm02Factors: [
    {id:"f1",name:"流动湍流",value:0.72,note:"按 ρv²·FVF/Fv 实时计算"},
    {id:"f2",name:"高频声学",value:0.20,note:"按声功率级 PWL 计算（复杂多声源模型，示例值）"},
    {id:"f3",name:"机械激励",value:0.90,note:"按设备类型查表定值"},
    {id:"f4",name:"往复脉动",value:0.40,note:"按功率/压力/API618 判定"},
    {id:"f5",name:"离心旋转失速",value:0.40,note:"按失速特性与流量判定"},
    {id:"f6",name:"死支管涡激",value:0.29,note:"按临界管径与雷诺数判定"},
    {id:"f7",name:"阀门水锤",value:0.55,note:"按冲击力/荷载限值计算"},
    {id:"f8",name:"空化闪蒸",value:1.00,note:"闪蒸 LOF=1.0"}
  ],
  tm02ValidationInputs: {
    flowInducedTurbulence:{P:1.931,TP:213.3,Dext:609,T:19.05,Q:86.9,mu:1.6e-5,Lspan:22.0,rho:9.62,v:35.288625,rhoV2:11979.661483,FVF:0.127671,support:"柔性",fn:1,alpha:74493.89,beta:-0.861637,Fv:3763.539844,LOF:0.406389},
    highFreqAcoustic:{
      P:7.034,TP:286.7,c:492,Dext:790,T:45,Q:396.15,rho:33.24,Mw:18,
      sources:[{
        name:'GRE0151VV',
        hasSilencer:true,
        reduction:10,
        Te:559.7,
        P1:7034000,
        P2:1670000,
        sonic:true,
        SFF:6
      }],
      discontinuities:[{
        name:'GPV0001YP',
        branchOd:16,
        branchT:3,
        Ldis:10,
        weldedBoss:false,
        duplexSteel:false
      }],
      // Excel 高频声激励示例（row 6）预计算中间量
      Dint:700,
      A:384845.100065,
      v:30.967966,
      sourcePWL:187.731697,
      totalPWL:186.874555,
      a:0.915564,
      s:74.344444,
      B:170.455234,
      N:1230457.302252,
      ratio:49.375,
      FLM1:0.5,
      FLM2:1,
      FLM3:1,
      NR:615228.651126,
      LfRaw:1,
      Lf:1,
      LOF:1.0
    },
    mechanical:{equipmentType:"往复式/容积式压缩机/泵",LOF:0.90},
    reciprocating:{power:150,pressure:40,hasReport:true,passAPI:true,LOF:0.40},
    rotatingStall:{known:true,hasStall:true,lowFlow:false,LOF:0.40},
    deadBranch:{dBranch:21.3,Re:47435141.5,dcrit:40.13,FeFs:0.636297,LOF:0.29},
    waterHammer:{type:"liquid_close",rho:1000,v:10,Dext:500,T:10,Dint:480,Lspan:11.3,support:"中等柔性",fn:4,Fmax:17233.8797,psi:0.884956,Flim:45.250472,LOF:0.026392},
    cavitation:{P1:2700000,P2:5800,dP:2694200,Pv:11176,valveType:"globe",FL:0.9,delta:2178309.54,mechanism:"闪蒸",LOF:1.0},
    slug:{LOF:1.0},
    thermowell:{
      // 热电偶套管 示例（Excel row 6）：从基础库取数的完整输入
      P:1.03,TP:267.73,Dext:1430,T:15,Sch:22.2,
      rhoF:4.264,v:165.713525911616,mu:1.882e-5,
      twType:"tapered",reinforcement:"不带补强",
      Etw:200e9,rhoTw:8000,Ltw:0.115,
      // 直型
      Dtw:null,dtw:7,
      // 锥型/台阶型
      D1:19,D2:12.5,L1:null,L2:null,
      // 中间结果与 LOF（由计算逻辑重新生成）
      Dint:1400,Re:52563414680.23,FM:0.42,
      Dchar:12.5,fn:1424.420801,S:0.312648,Fe:4144.802885,FeFn:2.909816,LOF:1.0
    }
  },
  tm05SmallPipe: {
    Do:[60.3,48.3,33.7],
    tp:[5.54,4.06,3.38],
    Lp:[800,600,400],
    mv:[2.5,0,0],
    rho_p:7980,
    rho_f:36.5,
    rho_in:120,
    tin:50,
    hfRoot:false,
    weldType:"BUTTERFLY_WELDING",
    endCondition:"Z_BEND",
    operatingTemp:285,
    Sa_T:186,
    C5:1.0,
    C0:3.5,
    beta:13.42,
    measuredPeak:15.0,
    measuredRms:4.29,
    expected:{
      lp:1800,
      mp0:5.4521,
      mf0:0.0509,
      min0:2.0791,
      Cm:0.2547,
      C1:0.9923,
      C3:1.1793,
      C2K2:2.0,
      C4:0.74,
      V_peak_allow:777.15,
      V_rms_allow:222.04
    }
  },
};

export default MockData;
