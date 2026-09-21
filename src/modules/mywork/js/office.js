import breadcrumb from '@/components/common/breadcrumb'
import CgnTaskCenter from '@/components/cgnTask/Center';

export default {
  name: "office",
  components: {
    breadcrumb,
    CgnTaskCenter
  },
  data() {
    return {
      hasIcon: false,
      brand: [
          { name: 'workbench.workbench' },
          { name: 'workbench.my_office' }
      ],
      taskCenter: {
        pageSize: 10, // 每页笔数
        // 权限列表，例如：claim(认领),unclaim(取消认领),cc(抄送),remind(催办),revoke(撤销),batchToRead(批量已阅),detegate(委托)
        rights: ["claim", "unclaim", "cc", "remind", "revoke", "batchToRead","detegate","batch_approval"],
        flowChartUrl: "http://localhost:8080/#/guest/trackDiagram", // 流程跟踪图地址
        showShareTask: true, // 是否显示共享列表
        shareTypes: ["001", "001测试", "001，002", "002", "002测试", "002，003", "1", "2", "3", "A001", "A002", "ad002", "ad003", "SDK共享1", "string", "共享任务", "测试"],
      },
      nowTime: '', // 当前时间
      timer: null, // 更新时间的定时器
      user:'', // 当前用户
    };
  },
  mounted(){
    this.getTime();
    this.user = sessionStorage.getItem('user');
    // this.timer = setInterval(()=>{
    //   this.getTime();
    // },1000)
  },
  computed: {
  },
  beforeDestroy(){
    // clearInterval(this.timer)
  },
  methods: {

    /**
     * 处理数据列表回调方法
     * @param datasType taskList(待办列表)/taskHistList(已办列表)/taskCcList(待阅列表)/taskCcHistList(已阅列表)/taskShareList(共享列表)
     * @param datas
     */
    handleDatas(datasType, datas, fieldSettings) {

      if (datas) {
        // 代办任务跳转到提交模式，其他则跳转到查看模式
        let model = (datasType == "taskList" ? "submit" : "view");

        for (let i = 0; i < datas.length; i++) {
          let item = datas[i];
          // 这里模拟跳转到流程工具条测试页面
          // item.formUrl = `/cgnTaskToolbar?model=${model}&appId=${this.taskCenter.appId}&processId=${item.procDefId}
          //       &procInsId=${item.procInstId}&procActInstId=${item.procActInstId}&procTaskId=${item.id}
          //       &userId=${this.taskCenter.actionUserInfo.userID}&userName=${this.taskCenter.actionUserInfo.userName}`;
          item.testFiled = datasType + "_" + i;
          // 待办存在摘要
          if (datasType === 'taskList') {
            try {
              item.abstract = JSON.parse(item.taskExtend02);
            } catch (error) {
              console.info("摘要数据格式错误："+item.taskExtend02);
            }
          }
        }
      }
      if (fieldSettings) {
        fieldSettings.push({
          fieldKey: "testFiled",
          fieldName: datasType + " Extend",
          order: 1,
          percent: "33%",
        });
      }
    },
    getTime(){
      const date = new Date();
      let isZH = this.$i18n.locale === "zh-CN"
      let startZh = date.getFullYear() + '年' + (date.getMonth()+1) + '月' + date.getDate() + '日 ';
      let startEn = date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate()+ ' ';
      let start = isZH ? startZh : startEn;
      let week = '';
      switch (date.getDay()) {
        case 0:
          week = isZH?'周日':'Sunday'
          break
        case 1:
          week = isZH?'周一':'Monday'
          break
        case 2:
          week = isZH?'周二':'Tuesday'
          break
        case 3:
          week = isZH?'周三':'Wednesday'
          break
        case 4:
          week = isZH?'周四':'Thursday'
          break
        case 5:
          week = isZH?'周五':'Friday'
          break
        case 6:
          week = isZH?'周六':'Saturday'
          break
      }
      let hours  = date.getHours();
      let minutes =date.getMinutes();
      let endZh = hours >= 12 ? ' 下午 ' + hours + ':' + (minutes> 10 ? minutes : '0' + minutes) : '上午 '+ hours + ':' + (minutes> 10 ? minutes : '0' + minutes)
      let endEn = hours + ':' + (minutes> 10 ? minutes : '0' + minutes) + hours >= 12 ? ' PM' : ' AM'
      let end = isZH ? endZh : endEn;
      this.nowTime = start + week + end;
    }
  }
}
