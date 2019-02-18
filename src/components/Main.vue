<template>
  <a-layout>
    <a-layout-sider
      class="sider"
      :style="{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0 }"
    >
      <div class="top-container">
        <div class="logo">
          <h3>𝗛𝘃𝗲 𝗡𝗼𝘁𝗲𝘀</h3>
        </div>
        <a-menu theme="dark" mode="inline" :defaultSelectedKeys="['articles']" @click="clickMenu">
          <a-menu-item key="articles">
            <a-icon type="file-text" />
            <span class="nav-text">{{ $t('article') }}</span>
          </a-menu-item>
          <a-menu-item key="menu">
            <a-icon type="bars" />
            <span class="nav-text">{{ $t('menu') }}</span>
          </a-menu-item>
          <a-menu-item key="tags">
            <a-icon type="tags" />
            <span class="nav-text">{{ $t('tag') }}</span>
          </a-menu-item>
          <a-menu-item key="theme">
            <a-icon type="picture" />
            <span class="nav-text">{{ $t('theme') }}</span>
          </a-menu-item>
          <a-menu-item key="setting">
            <a-icon type="setting" />
            <span class="nav-text">{{ $t('setting') }}</span>
          </a-menu-item>
          <a-menu-item key="system">
            <a-icon type="desktop" />
            <span class="nav-text">{{ $t('system') }}</span>
          </a-menu-item>
        </a-menu>
      </div>
      <div class="bottom-container">
        <a-button block @click="preview">{{ $t('preview') }}</a-button>
        <a-button block type="primary" :loading="publishLoading" @click="publish">{{ $t('syncSite') }}</a-button>
        <div class="version-container" :class="{ 'version-dot': hasUpdate }"><span>- {{ version }}</span> <i class="fa fa-github-square github" @click="openInBrowser('https://github.com/hve-notes/hve-notes')"></i></div>
      </div>
    </a-layout-sider>
    <a-layout class="right-container">
      <div class="content">
        <router-view></router-view>
      </div>
    </a-layout>
  </a-layout>
</template>

<script lang="ts">
import { ipcRenderer, Event, shell } from 'electron'
import { Vue, Component } from 'vue-property-decorator'
import axios from 'axios'
import ISnackbar from '../interfaces/snackbar'
import { State, Action } from 'vuex-class'
import { Site } from '../store/modules/site'
import * as pkg from '../../package.json'

@Component
export default class App extends Vue {
  @State('site') site!: any
  @Action('site/updateSite') updateSite!: (siteData: Site) => void

  ipcRenderer = ipcRenderer

  version = (pkg as any).version

  drawer = true

  publishLoading = false
  hasUpdate = false
  newVersion = ''

  created() {
    this.$bus.$on('site-reload', () => {
      this.reloadSite()
    })
    this.checkUpdate()
  }

  clickMenu(e: any) {
    this.$router.push(e.key)
  }

  public reloadSite() {
    const siteFolder = localStorage.getItem('sourceFolder') || ''

    ipcRenderer.send('app-site-reload', { siteFolder })
    ipcRenderer.once('app-site-loaded', (event: Event, result: Site) => {
      console.log(result)
      this.updateSite(result)
    })
  }

  public preview() {
    ipcRenderer.send('html-render')
    ipcRenderer.once('html-rendered', (event: Event, result: any) => {
      this.$message.success(`🎉  ${this.$t('renderSuccess')}`)
      this.openInBrowser(`file://${this.site.appDir}/output/index.html`)
    })
  }

  public publish() {
    const { setting } = this.site
    if (!setting.branch && !setting.domain && !setting.token && !setting.repository) {
      this.$message.error(`🙁  ${this.$t('syncWarning')}`)
      return false
    }

    ipcRenderer.send('site-publish')
    this.publishLoading = true
    ipcRenderer.once('site-published', (event: Event, result: any) => {
      if (result) {
        this.$message.success(`🎉  ${this.$t('syncSuccess')}`)
      } else {
        this.$message.error(`${this.$t('syncError')}`)
      }
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

      for (let i = 0; i < currentVersion.length; i += 1) {
        if (currentVersion[i] > latestVersion[i]) {
          this.hasUpdate = false
          break
        }
        if (currentVersion[i] < latestVersion[i]) {
          this.hasUpdate = true
          break
        }
      }

      if (this.hasUpdate) {
        this.$message.success(`🔥  ${this.$t('newVersionTips')}`, 8)
      }
    }
  }
}
</script>

<style lang="less" scoped>
.logo {
  height: 64px;
  -webkit-app-region: drag;
  display: flex;
  align-items: center;
  justify-content: center;
  h3 {
    color: #fafafa;
    font-size: 18px;
    transform: translateY(8px);
    background-image: -webkit-gradient(linear, 0 0, 0 bottom, from(rgba(250, 250, 250, 1)), to(rgba(255, 255, 255, 0.4)));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
}
.sider {
  background: #000000;
  background: linear-gradient(to bottom, #434343, #000000);
}

/deep/ .ant-layout-sider-children {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.bottom-container {
  padding: 24px 32px 8px;
  button {
    margin: 4px 0;
  }
}

/deep/ .ant-menu-dark, .ant-menu-dark .ant-menu-sub {
  background: transparent;
}
.right-container {
  background: #F7F6F3;
  margin-left: 8px 8px 8px 208px;
  padding: 8px;
  position: absolute;
  top: 8px;
  bottom: 8px;
  left: 208px;
  right: 8px;
}
.version-container {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  align-items: center;
  position:relative;
  font-size: 12px;
  &.version-dot {
    &:before {
      content: '';
      display: block;
      width: 4px;
      height: 4px;
      background: red;
      border-radius: 2px;
      position: absolute;
      top: 51%;
      left: -12px;
      transform: translateY(-50%);
    }
  }
}
</style>
