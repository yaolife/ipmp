import customTable from "./cud-custom-table";// 组件前端vue代码文件名
export default {
    //注意：组件配置信息是入库的，更改了组件配置后需要在表单里点击刷新或者重新拉一个组件出来
    fieldsConfig: [
        {
            modelType: "common", // 区分是组件类型（常用组件-common/数据模型-model），默认写common即可
            type: "customTable", // 组件类型，要求唯一不可重复（相当于组件唯一标识）
            name: "自定义表格模板", // name必须要有，组件在表单设计器里显示的名字，组件支持按name搜索
            isCustom: true, //是否时自定义的组件，默认写true即可
            labelWidth: "140", // 组件的标题宽度，隐藏标题的话写'0'
            label: "自定义表格模板", // 组件的标题，隐藏标题的话写''
            hiddenLabel: true, // 是否隐藏标题
            icon: "icon-zujiantubiao-xuanbumen", // 组件在表单设计器里的图标
            span: 24, // 组件宽度，用法同vue栅格，24代表整行
            component: "cud-customTable", // 组件注册的名字，默认为vue文件名
            //注册组件，所以以下三处配置成组件相关类
            display: true, // 组件是否显示，默认写true显示
            isControl: true,
            isShowTitle: false, // 是否显示标题,自定义配置的属性,在\src\components\form\config\components\中配置
            controlNames: [],
            events: [
                {
                    name: "click",
                    params: "val",
                    func: ""
                },
                {
                    name: "change",
                    params: "val",
                    func: ""
                },

            ], // 组件自定义事件list
            // fieldColumn: ['value'], // 组件的数据模型映射字段,如果是对象需要配置成数组接口,参考下面注释代码
            value: {
                msg1: "",
                msg2: "",
                msg3: "",
                tableData: []
            }, // 组件提交到表单的数据结构，表单设计的模型映射界面中组件映射字段来自于此配置；一版与组件数据模型的结构保持一致。
            // value它可以是一个string(value:""),可以是一个对象Object(value:{})

            /** 多数据 */
            // value: {
            //     str1: "",
            //     str2: "",
            //     str3: "",
            //     array: []
            // },
            fieldColumn: [
                {
                    name: "msg1" // 字符串
                },
                {
                    name: "msg2" // 字符串
                },
                {
                    name: "msg3" // 字符串
                },
                {
                    name: 'row1',
                    type: 'report', // 固定report,表格/列表类型
                    parentName: 'tableData',
                },
                {
                    name: 'row2',
                    type: 'report', // 固定report,表格/列表类型
                    parentName: 'tableData',
                },
                {
                    name: 'row3',
                    type: 'report', // 固定report,表格/列表类型
                    parentName: 'tableData',
                },
                // {
                //     name: "模型绑定的字段,入str1" // 字符串
                // },
                // {
                //     name: '模型绑定的字段',
                //     type: 'report', // 固定report,表格/列表类型
                //     parentName: '绑定的是那个数组,如array',
                // }
            ]
        }
    ],
    components: {
        customTable
    }
};
