// 组件属性栏配置
import componentAttrConfig from './components/index';
// 控件属性栏配置
import widgetAttrConfig from './widget/index';
const components = [
    ...componentAttrConfig,
    ...widgetAttrConfig
]

const Config = {
    install(Vue) {
        if (this.installed) return
        this.installed = true

        components.map(component => {
            Vue.component(component.name, component);
        })
    }
}

export default Config
