# 组件开发

1. 当前 components 文件夹下添加对应组件文件夹, 命名规则 cud-fssc-模块名称(多个单词使用-分割) 例如 `cud-fssc-base-info`
2. 新添加文件夹下添加对应文件

   * 组件入口vue文件。 例如: cud-fssc-base-info.vue

   ```vue
     // * vue组件必须有name属性
     name: FsscBaseInfo, // 大驼峰的 Fssc + 组件名称

   ```
   * config.js

   ```vue
    import FsscBaseInfo from './cud-fssc-base-info';
    export default {
      fieldsConfig: [...组件配置],  // 具体配置需要查看组件开发文档
      components: {
        FsscBaseInfo
      }
    }
   ```
   * js(dir)

   **可以选择使用将js从vue文件中抽取出来的方式, 将页面逻辑和页面拆开, 具体可以查看base-info组件**
   1. 组件注册

      在 `form `的 fieldsConfig.js 中注册组件配置信息

      ```js
       import CudFsscBaseInfo from './components/cud-fssc-base-info/config'; // 基本信息组件模块
       export default [
           {
               title: '财务共享组件',
               list: [
                   ...CudFsscBaseInfo.fieldsConfig,  // 组测配置
               ]
          },
          {
            title: '财务共享的控件',
            list: CudFsscWidgets.fieldsConfig
          },
       ]

      ```
      在 `form `的 components 下的index.js 中注册组件

      ```
        import FsscBaseInfo from './cud-fssc-base-info.vue'
        const components = [
          ...
          FsscBaseInfo
        ];

        ...
        export default {
          ...
          FsscBaseInfo
        }

      ```
3. 组件按照vue正常开发
