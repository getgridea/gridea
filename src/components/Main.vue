<template>
  <a-layout>
    <a-layout-sider
      class="sider"
      :style="{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0 }"
    >
      <div class="top-container">
        <div class="logo">
          <img class="img" src="@/assets/logo-hey.png">
          <h3>Gridea</h3>
        </div>
        <a-menu mode="inline" :defaultSelectedKeys="['articles']" @click="clickMenu">
          <a-menu-item key="articles">
            <i class="zwicon-document menu-icon"></i>
            <span class="nav-text">{{ $t('article') }}</span>
          </a-menu-item>
          <a-menu-item key="menu">
            <i class="zwicon-grid menu-icon"></i>
            <span class="nav-text">{{ $t('menu') }}</span>
          </a-menu-item>
          <a-menu-item key="tags">
            <i class="zwicon-price-tag menu-icon"></i>
            <span class="nav-text">{{ $t('tag') }}</span>
          </a-menu-item>
          <a-menu-item key="theme">
            <i class="zwicon-image-wide menu-icon"></i>
            <span class="nav-text">{{ $t('theme') }}</span>
          </a-menu-item>
          <a-menu-item key="setting">
            <i class="zwicon-cog menu-icon"></i>
            <span class="nav-text">{{ $t('setting') }}</span>
          </a-menu-item>
          <a-menu-item key="system">
            <i class="zwicon-desktop menu-icon"></i>
            <span class="nav-text">{{ $t('system') }}</span>
          </a-menu-item>
        </a-menu>
      </div>
      <div class="bottom-container">
        <a-button icon="eye" block @click="preview">{{ $t('preview') }}</a-button>
        <a-button icon="sync" block type="primary" :loading="publishLoading" @click="publish">{{ $t('syncSite') }}</a-button>
        <div class="version-container" :class="{ 'version-dot': hasUpdate }">
          <span>v {{ version }}</span>
          <i class="zwicon-web web-btn" @click="goWeb" v-if="site.setting.domain"></i>
          <a-tooltip title="🌟Star 支持作者！">
            <a-icon type="github" style="font-size: 14px; cursor: pointer;" @click="openInBrowser('https://github.com/getgridea/gridea')" />
          </a-tooltip>
        </div>
      </div>
    </a-layout-sider>
    <a-layout class="right-container">
      <div class="content">
        <keep-alive>
          <router-view></router-view>
        </keep-alive>
      </div>
    </a-layout>
  </a-layout>
</template>

<script lang="ts">
import { ipcRenderer, Event, shell } from 'electron'
import { Vue, Component } from 'vue-property-decorator'
import axios from 'axios'
import { State, Action } from 'vuex-class'
import ISnackbar from '../interfaces/snackbar'
import { Site } from '../store/modules/site'
import * as pkg from '../../package.json'

@Component
export default class App extends Vue {
  @State('site') site!: Site

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
      console.log(result)
      if (result.success) {
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

  goWeb() {
    if (this.site.setting.domain) {
      shell.openExternal(this.site.setting.domain)
    }
  }

  public async checkUpdate() {
    const res = await axios.get('https://api.github.com/repos/getgridea/gridea/releases/latest')
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
@import '~@/assets/styles/var.less';

.logo {
  min-height: 64px;
  -webkit-app-region: drag;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 32px 0 16px;
  h3 {
    color: @primary-color;
    font-size: 18px;
    transform: translateY(8px);
    // background-image: -webkit-gradient(linear, 0 0, 0 bottom, from(rgba(250, 250, 250, 1)), to(rgba(255, 255, 255, 0.4)));
    // -webkit-background-clip: text;
    // -webkit-text-fill-color: transparent;
  }
  .img {
    width: 64px;
    height: 64px;
    border-radius: 16px;
  }
}
.sider {
  background: @primary-bg;
  // background: linear-gradient(to bottom, #434343, #000000);
  &::-webkit-scrollbar {
    width: 0;
  }
}

/deep/ .ant-menu {
  background: @primary-bg;
  color: @primary-color;
}

/deep/ .ant-menu-vertical .ant-menu-item:after, .ant-menu-vertical-left .ant-menu-item:after, .ant-menu-vertical-right .ant-menu-item:after, .ant-menu-inline .ant-menu-item:after {
  border-right: none;
}

/deep/ .ant-menu:not(.ant-menu-horizontal) .ant-menu-item-selected {
  background-color: #efebe3;
}

/deep/ .ant-menu-inline, .ant-menu-vertical, .ant-menu-vertical-left {
  border-right: none;
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

.right-container {
  background: #fff;
  margin-left: 8px 8px 8px 208px;
  padding: 8px 16px 8px 8px;
  position: absolute;
  top: 8px;
  bottom: 8px;
  left: 208px;
  right: 0px;
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

.preview-btn {
  border-radius: 16px;
  background: #ffffff;
  &:hover {
    border: none;
    background: #c7c7c7;
  }
}

.publish-btn {
  border-radius: 16px;
  background: #383838;
  color: #bababa;
  border: none;
  &:hover {
    background: #252525;
    border: none;
  }
}

.web-btn {
  font-size: 16px;
  cursor: pointer;
  &:hover {
    color: @link-color;
  }
}

.menu-icon {
  font-size: 17px;
  margin-right: 8px;
  font-weight: 400;
}
</style>
