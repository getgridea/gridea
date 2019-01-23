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

<style lang="stylus" scoped>

</style>


<style>

  /* Global CSS */
  body {
    background: #F7F6F3;
    color: #434343;
  }
  
  .header-bar {
    -webkit-app-region: drag;
  }
  .header-bar .btn {
    -webkit-app-region: no-drag;
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

  .navbar {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: #fff;
  }
  .btn-container {
    padding-bottom: 8px;
  }
  .content-container {
    background: #fff;
    min-height: 100%;
  }
  .v-card {
    box-shadow: 0 1px 8px 0 rgba(42,51,83,.16);
    overflow: hidden;
    position: relative;
  }
  .v-card:before {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: #1067de;
    background: linear-gradient(108deg, #1067de 0%, #2f5d9e 100%);
    border-radius: 2px 2px 0 0px;
  }

  .v-toolbar__content {
    background: #fff;
    box-shadow: 0 2px 3px rgba(21, 39, 57, 0.12);
    padding: 0 12px;
  }
  .theme--light.v-footer {
    background: #fff;
    box-shadow: 0 -2px 3px rgba(21, 39, 57, 0.12);
    color: #545454;
    font-size: 12px;
    padding: 0 16px;
  }
  .theme--light.v-table tbody tr:hover:not(.v-datatable__expand-row) {
    background: #f7f7f7;
  }
  .theme--light.v-table tbody tr:not(:last-child) {
    border-bottom: 1px solid rgba(0,0,0,.06)!important;
  }
  .github {
    font-size: 16px;
    margin-left: 16px;
    cursor: pointer;
  }

  .logo {
    cursor: pointer;
    user-select: none;
    margin-right: 8px;
  }

  .application {
    font-family: system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Droid Sans,Helvetica Neue,Fira Sans,sans-serif!important;
  }
</style>
