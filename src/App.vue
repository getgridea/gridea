<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

@Component
export default class App extends Vue {

}
</script>

<style lang="less" scoped>

</style>


<style>

  /* Global CSS */
  body {
    background: #fff;
    color: #434343;
  }

  ::-webkit-scrollbar{
    width: 0px;
    height: 6px;
    border-radius: 4px;
    background-color: #fff;

  }
    /*滚动条两端的箭头*/
  ::-webkit-scrollbar-button{
    display: none;
  }
    /*	经测试好像并不能控制什么	*/
  ::-webkit-scroll-track{
    display: none;
  }
    /*	滚动条内侧部分 去掉	*/
  ::-webkit-scrollbar-track-piece {
    display: none;
  }

  /*	滚动条中可以拖动的那部分	*/
  ::-webkit-scrollbar-thumb{
    background-color: #eee;
    opacity: 0.7;
    border-radius: 4px;
  }
  /*	变角部分	*/
  ::-webkit-scrollbar-corner {
    display: none;
  }
  ::-webkit-resizer{
    display: none;
  }

  .github {
    font-size: 16px;
    margin-left: 16px;
    cursor: pointer;
  }

  .logo {
    user-select: none;
  }

  .application {
    font-family: system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Droid Sans,Helvetica Neue,Fira Sans,sans-serif!important;
  }
</style>
