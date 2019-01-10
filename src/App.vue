<template>
  <div id="app">
    <v-app>
      <v-navigation-drawer class="navbar" fixed clipped v-model="drawer" app :mobile-break-point="640" :width="160" floating>
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
        <div class="btn-container">
          <v-btn depressed style="width: 90%;" @click="preview">💫 预 览</v-btn>
          <v-btn depressed style="width: 90%;" color="success" :loading="publishLoading" @click="publish">🚀 发 布</v-btn>
        </div>
      </v-navigation-drawer>
      <v-toolbar fixed app flat dense clipped-left class="header-bar">
        <v-spacer></v-spacer>
        <img class="logo" src="@/assets/logo.png" width="28px" height="28px" @click="drawer = !drawer">
        <h3>𝗛𝘃𝗲 𝗡𝗼𝘁𝗲𝘀</h3>
        <v-spacer></v-spacer>
        <!-- <v-btn class="btn" icon small @click="ipcRenderer.send('min-window')"><v-icon>remove</v-icon></v-btn>
        <v-btn class="btn" icon small @click="ipcRenderer.send('max-window')"><v-icon>add</v-icon></v-btn>
        <v-btn class="btn" icon small @click="ipcRenderer.send('close-window')"><v-icon>close</v-icon></v-btn> -->
      </v-toolbar>
      <v-content>
        <v-container class="content-container" fluid>
          <v-slide-y-transition mode="out-in">
            <router-view></router-view>
          </v-slide-y-transition>
        </v-container>
      </v-content>
      <v-footer class="footer" fixed app>
        <span>🎨 + 🔨 by <a @click="openInBrowser('https://github.com/eryouhao')">EryouHao</a></span>
        <v-spacer></v-spacer>
        <v-chip class="new-version-chip" label color="pink" text-color="white" v-if="hasUpdate" @click="openInBrowser('https://github.com/hve-notes/hve-notes/releases')">
          <v-icon left>notifications_active</v-icon>有新版本 {{ newVersion }}
        </v-chip>
        <span class="copyright">👣 - {{ version }}</span>
        <i class="fa fa-github-square github" @click="openInBrowser('https://github.com/hve-notes/hve-notes')"></i>
      </v-footer>
    </v-app>

    <v-snackbar v-model="snackbar" :color="color" top :bottom="bottom">
      {{ message }}
      <v-icon dark @click="snackbar = false">
        close
      </v-icon>
    </v-snackbar>

  </div>
</template>

<script lang="ts">
import { ipcRenderer, Event, shell } from 'electron'
import Vue from 'vue'
import Component from 'vue-class-component'
import axios from 'axios'
import ISnackbar from './interfaces/snackbar'
import { State, Action } from 'vuex-class'
import { Site } from './store/modules/site'
import * as pkg from '../package.json'

@Component
export default class App extends Vue {
  @State('site') site!: any
  @Action('site/updateSite') updateSite!: (siteData: Site) => void

  ipcRenderer = ipcRenderer

  version = (pkg as any).version

  drawer = true
  items = [
    { icon: '📄', title: '文 章', to: '/articles' },
    { icon: '📋', title: '菜 单', to: '/menu' },
    { icon: '🏷️', title: '标 签', to: '/tags' },
    { icon: '🌁', title: '主 题', to: '/theme' },
    { icon: '⚙️', title: '配 置', to: '/setting' },
  ]

  color?: string = 'success'
  snackbar?: boolean = false
  message?: string = ''
  bottom?: boolean = false
  publishLoading = false
  hasUpdate = false
  newVersion = ''

  created() {
    this.$bus.$on('snackbar-display', (params: ISnackbar | string) => {
      if (typeof params === 'string') {
        this.snackbar = true
        this.message = params
      } else {
        this.color = params.color
        this.snackbar = params.snackbar || true
        this.message = params.message
        this.bottom = params.bottom
      }
    })
    this.$bus.$on('site-reload', () => {
      this.reloadSite()
    })
    this.checkUpdate()
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
      this.$bus.$emit('snackbar-display', '🎉  渲染完毕，快去预览吧！')
      this.openInBrowser(`file://${this.site.appDir}/output/index.html`)
    })
  }

  public publish() {
    const { setting } = this.site
    if (!setting.branch && !setting.domain && !setting.token && !setting.repository) {
      this.$bus.$emit('snackbar-display', { color: 'pink', message: '🙁  必须完成配置才能发布哦！' })
      return false
    }

    ipcRenderer.send('site-publish')
    this.publishLoading = true
    ipcRenderer.once('site-published', (event: Event, result: any) => {
      this.$bus.$emit('snackbar-display', `${result ? '🎉  发布成功啦!' : '站点暂无更新!'}`)
      this.publishLoading = false
    })
  }

  openInBrowser(url: string) {
    shell.openExternal(url)
  }

  public async checkUpdate() {
    const res = await axios.get('https://api.github.com/repos/hve-notes/hve-notes/releases/latest')
    if (res.status === 200) {
      this.newVersion = res.data.name
      const latestVersion = res.data.name.substring(1).split('.').map((item: string) => parseInt(item))
      const currentVersion = this.version.split('.').map((item: string) => parseInt(item))
      console.log(latestVersion, currentVersion)
      this.hasUpdate = currentVersion.reduce((hasUpdate: boolean, item: number, index: number) => {
        if (item < latestVersion[index]) {
          return true
        }
      }, false)
      
      if (this.hasUpdate) {
        this.$bus.$emit('snackbar-display', { message: '🔥  有新版本发布，快去下载新版本吧！', bottom: true })
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.new-version-chip
  font-size 12px
  >>> .v-chip__content
    height 24px
  >>> .material-icons
    font-size 16px
</style>


<style>

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
