# cuddemo4
# 目前技术栈是vue2 + element + avue + webpack3
# 需要使用的node.js版文为10.16.3
> CUD示例项目前端
## 目录结构说明
## lib    cud框架提供的JS低代码平台依赖包
## build  项目构建(webpack)相关代码
## config 配置目录，包括端口等。
## node_modules npm加载的项目依赖模块
## src 这里是我们要开发的目录，基本上要做的事情都在这个目录里。里面包含了几个目录及文件：
# assets: 放置一些图片，菜单配置文件，中英文切换配置文件。
# components: 目录里面放公共组件文件，可以不用。
# modules: 用户自己的组件文件。
# App.vue: 项目入口文件，我们也可以直接将组件写这里，而不使用 components 目录。
# main.js: 项目的核心文件。 
# static 静态资源目录 ，如图片、字体等 公共的资源放到nginx去了
# index.html   首页入口文件，你可以添加一些meta信息或统计代码啥的
# package.json 项目配置文件
# README.md    项目说明文档 



## Build Setup

``` bash
# localhost:8010 本地运行
npm run dev

# 构建测试环境/预生产|灰度环境/生产环境
npm run tets/pre/prod

# 在执行npm install之前，先执行此行关闭SSL证书验证
npm config set strict-ssl false

# 下载相应的依赖 内网暂未提供该功能
npm install

```
