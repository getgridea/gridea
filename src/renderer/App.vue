<template>
  <div id="app">
    <v-app>
      <v-navigation-drawer fixed clipped v-model="drawer" app :mobile-break-point="640" :width="160" floating>
        <v-list>
          <v-list-tile 
            router
            :to="item.to"
            :key="i"
            v-for="(item, i) in items"
            exact
          >
            <v-list-tile-action>
              <v-icon v-html="item.icon"></v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title v-text="item.title"></v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
        <v-btn @click="preview">预览</v-btn>
      </v-navigation-drawer>
      <v-toolbar fixed app flat dense clipped-left class="header-bar">
        <v-toolbar-side-icon class="btn" small @click.native.stop="drawer = !drawer"></v-toolbar-side-icon>
        <v-toolbar-title style="color: #006cff" v-text="title"></v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn class="btn" icon small @click="$electron.ipcRenderer.send('min-window')"><v-icon>remove</v-icon></v-btn>
        <v-btn class="btn" icon small @click="$electron.ipcRenderer.send('max-window')"><v-icon>add</v-icon></v-btn>
        <v-btn class="btn" icon small @click="$electron.ipcRenderer.send('close-window')"><v-icon>close</v-icon></v-btn>
      </v-toolbar>
      <v-content>
        <v-container fluid>
          <v-slide-y-transition mode="out-in">
            <router-view></router-view>
          </v-slide-y-transition>
        </v-container>
      </v-content>
      <v-footer fixed app>
        <v-spacer></v-spacer>
        <span>&copy; 2018 EryouHao</span>
        <v-spacer></v-spacer>
      </v-footer>
    </v-app>

    <v-snackbar v-model="snackbar" :color="color" top>
      {{ message }}
      <v-icon dark @click="snackbar = false">
        close
      </v-icon>
    </v-snackbar>

  </div>
</template>

<script lang="ts">
import { ipcRenderer, Event } from 'electron'
import Vue from 'vue'
import Component from 'vue-class-component'
import ISnackbar from './interfaces/snackbar'
import { Action } from 'vuex-class'
import { Site } from './store/modules/site'

@Component
export default class App extends Vue {
  @Action('site/updateSite') updateSite!: (siteData: Site) => void

  drawer = true
  items = [
    { icon: 'apps', title: '文章', to: '/articles' },
    { icon: 'bubble_chart', title: '标签', to: '/tags' },
    { icon: 'bubble_chart', title: '主题', to: '/theme' },
    { icon: 'bubble_chart', title: '页面', to: '/page' },
    { icon: 'bubble_chart', title: '配置', to: '/setting' },
    { icon: 'bubble_chart', title: '资源', to: '/source' }
  ]
  title = 'Hve Next'

  color?: string = 'success'
  snackbar?: boolean = false
  message?: string = ''
  
  created() {
    this.$bus.$on('snackbar-display', (params: ISnackbar | string) => {
      if (typeof params === 'string') {
        this.snackbar = true
        this.message = params  
      } else {
        this.color = params.color
        this.snackbar = params.snackbar || true
        this.message = params.message
      }
    })
    this.$bus.$on('site-reload', () => {
      this.reloadSite()
    })
  }

  public reloadSite() {
    ipcRenderer.send('app-site-reload', {})
    ipcRenderer.once('app-site-loaded', (event: Event, result: Site) => {
      console.log(result)
      this.updateSite(result)
    })
  }

  public preview() {
    ipcRenderer.send('html-render')
    ipcRenderer.once('html-rendered', (event: Event, result: any) => {
      console.log('渲染完毕')
    })
  }
}
</script>

<style>
  @import url('https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons');
  /* Global CSS */
  
  .header-bar {
    -webkit-app-region: drag;
  }
  .header-bar .btn {
    -webkit-app-region: no-drag;
  }
  ::-webkit-scrollbar{
    width: 1px;
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
</style>
