<template>
  <div class="hello-world">
    <h1>{{ msg }}</h1>
    <h2>流程相关组件</h2>
    <ul>
      <li><router-link to="/cgnSelectProcess">选择流程</router-link></li>
      <li><router-link to="/cgnProcessDelegation">流程代理</router-link></li>
    </ul>
    <h2>任务相关组件</h2>
    <ul>
      <li><router-link to="/cgnTaskCenter">任务中心</router-link></li>
      <li><router-link to="/cgnTaskToolbar">任务工具条</router-link></li>
    </ul>
    <h2>其他组件</h2>
    <ul>
      <li><router-link to="/cgnAsc">选择部门/选择人员</router-link></li>
    </ul>
  </div>
</template>

<script>
  export default {
    name: 'HelloWorld',
    data() {
      return {
        msg: '流程组件示例'
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" scoped>
  .hello-world {
    text-align: center;

    h1, h2 {
      font-weight: normal;
    }
    ul {
      list-style-type: none;
      padding: 0;
    }
    li {
      display: inline-block;
      margin: 0 10px;
    }
    a {
      color: #42b983;
    }
  }
</style>
