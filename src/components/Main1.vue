<template>
  <a-layout>
    <a-layout-sider
      class="sider"
      :style="{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0 }"
    >
      <div class="top-container">
        <div class="logo"></div>
        <a-menu theme="dark" mode="inline" :defaultSelectedKeys="['4']">
          <a-menu-item key="1">
            <a-icon type="user" />
            <span class="nav-text">文 章</span>
          </a-menu-item>
          <a-menu-item key="2">
            <a-icon type="video-camera" />
            <span class="nav-text">菜 单</span>
          </a-menu-item>
          <a-menu-item key="3">
            <a-icon type="upload" />
            <span class="nav-text">标 签</span>
          </a-menu-item>
        </a-menu>
      </div>
      <div class="bottom-container">
        <a-button block @click="preview">{{ $t('preview') }}</a-button>
        <a-button block type="primary" @click="publish">{{ $t('syncSite') }}</a-button>
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
import Vue from 'vue'
import Component from 'vue-class-component'
// import AppSetting from './AppSetting.vue'
import axios from 'axios'
import ISnackbar from '../interfaces/snackbar'
import { State, Action } from 'vuex-class'
import { Site } from '../store/modules/site'
import * as pkg from '../../package.json'

@Component({
  components: {
    // AppSetting,
  },
})
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
        this.$message.success(`🔥  ${this.$t('newVersionTips')}`, 12)
      }
    }
  }
}
</script>

<style lang="less" scoped>
.logo {
  height: 64px;
  -webkit-app-region: drag;
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
  padding: 24px 32px;
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
.content {

}
</style>
