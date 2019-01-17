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
          <v-btn depressed style="width: 90%;" @click="preview">💫 {{ $t('preview') }}</v-btn>
          <v-btn depressed style="width: 90%;" color="success" @click="publish">🚀 {{ $t('syncSite') }}</v-btn>
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
        <app-setting></app-setting>
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
          <v-icon left>notifications_active</v-icon>{{ $t('newVersion') }} {{ newVersion }}
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

    <v-dialog v-model="publishLoading" persistent width="300">
      <v-card color="primary" dark>
        <v-card-text>
          {{ $t('syncing') }}
          <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>

  </div>
</template>

<script lang="ts">
import { ipcRenderer, Event, shell } from 'electron'
import Vue from 'vue'
import Component from 'vue-class-component'
import AppSetting from './AppSetting.vue'
import axios from 'axios'
import ISnackbar from '../interfaces/snackbar'
import { State, Action } from 'vuex-class'
import { Site } from '../store/modules/site'
import * as pkg from '../../package.json'

@Component({
  components: {
    AppSetting,
  },
})
export default class App extends Vue {
  @State('site') site!: any
  @Action('site/updateSite') updateSite!: (siteData: Site) => void

  ipcRenderer = ipcRenderer

  version = (pkg as any).version

  drawer = true
  get items() {
    return [
      { icon: '📄', title: this.$t('article'), to: '/articles' },
      { icon: '📋', title: this.$t('menu'), to: '/menu' },
      { icon: '🏷️', title: this.$t('tag'), to: '/tags' },
      { icon: '🌁', title: this.$t('theme'), to: '/theme' },
      { icon: '⚙️', title: this.$t('setting'), to: '/setting' },
    ]
  }

  color?: string = 'success'
  snackbar?: boolean = false
  message?: string = ''
  bottom?: boolean = false
  publishLoading = false
  hasUpdate = false
  newVersion = ''

  created() {
    console.log('文章文案', this.$t('article'))
    this.$bus.$on('snackbar-display', (params: ISnackbar | string) => {
      if (typeof params === 'string') {
        this.snackbar = true
        this.color = 'success'
        this.bottom = false
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
      this.$bus.$emit('snackbar-display', `🎉  ${this.$t('renderSuccess')}`)
      this.openInBrowser(`file://${this.site.appDir}/output/index.html`)
    })
  }

  public publish() {
    const { setting } = this.site
    if (!setting.branch && !setting.domain && !setting.token && !setting.repository) {
      this.$bus.$emit('snackbar-display', { color: 'pink', message: `🙁  ${this.$t('syncWarning')}` })
      return false
    }

    ipcRenderer.send('site-publish')
    this.publishLoading = true
    ipcRenderer.once('site-published', (event: Event, result: any) => {
      this.$bus.$emit('snackbar-display', { color: result ? 'success' : 'pink', message: result ? `🎉  ${this.$t('syncSuccess')}` : `${this.$t('syncError')}` })
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
      const latestVersion = res.data.name.substring(1).split('.').map((item: string) => parseInt(item, 10))
      const currentVersion = this.version.split('.').map((item: string) => parseInt(item, 10))
      console.log(latestVersion, currentVersion)
      this.hasUpdate = currentVersion.reduce((hasUpdate: boolean, item: number, index: number) => {
        if (item < latestVersion[index]) {
          return true
        }
      }, false)

      if (this.hasUpdate) {
        this.$bus.$emit('snackbar-display', { message: `🔥  ${this.$t('newVersionTips')}`, bottom: true })
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
