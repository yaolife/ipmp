/*
 * @Author: [P631038]杨旭
 * @Date: 2024-06-11 15:06:58
 * @LastEditors: [P631038]杨旭
 * @LastEditTime: 2024-08-05 08:58:59
 * @FilePath: \cud4demo-ui\src\mixins\index.js
 * @Description: 
 */
import store from '@/store'
import datetime from '@/utils/datetime'
export const mixinsPage = {
    data(){
        return {
            renderMills:0,
            renderMillsStart:0,
            renderMillsEnd:0
        }
    },
    created(){
        this.renderMillsStart = new Date().getTime()
    },
    methods:{
    },
    beforeCreate () {
    },
    computed:{
    },
    beforeMount() {
    },
    mounted() {
        this.renderMillsEnd = new Date().getTime()
    },
    watch: {
    }
}

export const mixinsComp = {
    data(){
        return {
            mixinsCmptCode: "",
            mixinsCmptName: "",
            mixinsInvokeTime: new Date()
        }
    },
    beforeCreate () {
        if(!this.mixinsCmptCode) {
            this.mixinsCmptCode = "code" + new Date().getTime()
        }
        if(!this.mixinsCmptName) {
            this.mixinsCmptName = "name" + new Date().getTime()
        }
    },
}