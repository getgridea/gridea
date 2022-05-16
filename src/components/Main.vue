<template>
  <a-layout>
    <a-layout-sider
      class="sider"
      :style="{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0 }"
    >
      <div class="top-container">
        <div class="logo">
          <img class="img" src="@/assets/logo.png">
        </div>
        <a-menu mode="inline" :defaultSelectedKeys="['/articles']" @click="clickMenu">
          <a-menu-item :key="menu.router" v-for="menu in sideMenus">
            <div class="menu-item">
              <div class="flex items-center">
                <i
                  class="mr-2 text-base"
                  :class="{ [menu.icon]: true }"
                  :style="{ color: currentRouter === menu.router ? '#f9d757' : 'inherit' }"
                ></i>
                <span class="nav-text">{{ menu.text }}</span>
              </div>
              <span class="number">{{ menu.count }}</span>
            </div>
          </a-menu-item>
        </a-menu>
      </div>
      <div class="bottom-container">
        <a-button class="preview-btn" block @click="preview">
          <i class="zwicon-eye"></i>
          {{ $t('preview') }}
        </a-button>
        <a-button class="sync-btn" block type="primary" :loading="publishLoading" @click="publish">
          <template v-if="!publishLoading">
            <i class="zwicon-deploy"></i>
            {{ $t('syncSite') }}
          </template>
        </a-button>
        <div class="version-container" :class="{ 'version-dot': hasUpdate }">
          <i class="ri-equalizer-line text-base" @click="systemModalVisible = true"></i>
          <i class="ri-earth-line web-btn" @click="goWeb" v-if="site.setting.domain"></i>
          <a-tooltip :title="`🌟 ${$t('starSupport')}`">
            <i class="ri-github-line text-base" @click="handleGithubClick"></i>
          </a-tooltip>
        </div>
      </div>
    </a-layout-sider>
    <a-layout class="right-container">
      <div class="content">
        <keep-alive exclude="Loading,Theme">
          <router-view></router-view>
        </keep-alive>
      </div>
    </a-layout>

    <a-modal :visible="syncErrorModalVisible" :footer="null" @cancel="syncErrorModalVisible = false" :maskClosable="false">
      🙁 {{ $t('syncError1') }} <a @click="openInBrowser('https://gridea.dev/')">FAQ</a> {{ $t('or') }} <a @click="openInBrowser('https://github.com/getgridea/gridea/issues')">Issues</a> {{ $t('syncError2') }}
    </a-modal>

    <a-modal title="🔥 New Version" :visible="updateModalVisible" :footer="null" @cancel="updateModalVisible = false" :maskClosable="false">
      <div class="download-container">
        👉 <a href="https://gridea.dev">Gridea Homepage</a> | <a href="https://github.com/getgridea/gridea/releases">Github Releases</a> 👈
      </div>
      <h2>{{ newVersion }}</h2>
      <div class="version-info" v-html="updateContent"></div>
    </a-modal>

    <!-- <a-modal :width="900" :visible="systemModalVisible" :footer="null" @cancel="systemModalVisible = false">
      <app-system />
    </a-modal> -->

    <a-modal :width="900" :visible="logModalVisible" :footer="null" @cancel="logModalVisible = false">
      <h2>{{ log.type }}</h2>
      <pre>
        {{ log.message }}
      </pre>
    </a-modal>

    <a-drawer
      title=""
      placement="bottom"
      height="100%"
      @close="systemModalVisible = false"
      :visible="systemModalVisible"
    >
      <app-system />
    </a-drawer>

  </a-layout>
</template>

<script lang="ts">
import { VNodeChildren } from 'vue'
import { ipcRenderer, IpcRendererEvent, shell } from 'electron'
import { Vue, Component } from 'vue-property-decorator'
import axios from 'axios'
import { State, Action } from 'vuex-class'
import AppSystem from './AppSystem/Index.vue'
import ISnackbar from '../interfaces/snackbar'
import { Site } from '../store/modules/site'
import * as pkg from '../../package.json'
import markdown from '../server/plugins/markdown'
import ga from '../helpers/analytics'

@Component({
  components: {
    AppSystem,
  },
})
export default class App extends Vue {
  @State('site') site!: Site

  @Action('site/updateSite') updateSite!: (siteData: Site) => void

  ipcRenderer = ipcRenderer

  version = (pkg as any).version

  drawer = true

  publishLoading = false

  hasUpdate = false

  newVersion = ''

  syncErrorModalVisible = false

  updateModalVisible = false

  systemModalVisible = false

  updateContent = ''

  logModalVisible = false

  log: any = {}

  get currentRouter() {
    return this.$route.path
  }

  get sideMenus() {
    return [
      {
        icon: 'ri-article-line',
        text: this.$t('article'),
        count: this.site.posts.length,
        router: '/articles',
      },
      {
        icon: 'ri-menu-2-line',
        text: this.$t('menu'),
        count: this.site.menus.length,
        router: '/menu',
      },
      {
        icon: 'ri-price-tag-3-line',
        text: this.$t('tag'),
        count: this.site.tags.length,
        router: '/tags',
      },
      {
        icon: 'ri-t-shirt-line',
        text: this.$t('theme'),
        router: '/theme',
      },
      {
        icon: 'ri-server-line',
        text: this.$t('remote'),
        router: '/setting',
      },
    ]
  }

  created() {
    this.$bus.$on('site-reload', () => {
      this.reloadSite()
    })
    this.checkUpdate()

    ipcRenderer.on(('log-error'), (event: any, result: any) => {
      this.log = result
      this.logModalVisible = true
    })
  }

  mounted() {
    // @see https://docs.headwayapp.co/widget for more configuration options.
    const config = {
      selector: '.version-container',
      account: 'xbrnVx',
      translations: {
        title: 'Gridea News',
        readMore: 'Read more',
        labels: {
          'new': 'News',
          'improvement': 'Updates',
          'fix': 'Fixes',
        },
        footer: 'Read more 👉',
      },
    }
    // @ts-ignore
    if (window.Headway) {
      // @ts-ignore
      Headway.init(config)
    }
  }

  clickMenu(e: any) {
    this.$router.push(e.key)
  }

  public reloadSite() {
    const siteFolder = localStorage.getItem('sourceFolder') || ''

    ipcRenderer.send('app-site-reload', { siteFolder })
    ipcRenderer.once('app-site-loaded', (event: IpcRendererEvent, result: Site) => {
      console.log(result)
      this.updateSite(result)
    })
  }

  public preview() {
    ipcRenderer.send('html-render')

    ga.event('Preview', 'Preview - start', { evLabel: this.site.setting.domain })

    ipcRenderer.once('html-rendered', (event: IpcRendererEvent, result: any) => {
      // this.$message.success(`🎉  ${this.$t('renderSuccess')}`)

      ga.event('Preview', 'Preview - success', { evLabel: this.site.setting.domain })

      ipcRenderer.send('app-preview-server-port-get')
      ipcRenderer.once(
        'app-preview-server-port-got',
        (portGotEvent: IpcRendererEvent, port: number | string | null) => {
          if (!port && typeof port !== 'number') {
            this.$message.config({
              top: '36px',
            })
            this.$message.open({
              content: (h: Vue.CreateElement) => {
                const errStyle = {
                  display: 'inline-block',
                  maxWidth: '800px',
                }
                return h('span', {
                  style: errStyle,
                }, `❌ ${this.$t('renderError')}` as any as VNodeChildren)
              },
              icon: '',
            })
          } else {
            this.$message.success(`🎉  ${this.$t('renderSuccess')}`)
            this.openInBrowser(`http://localhost:${port}`)
          }
        },
      )
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

    ga.event('Publish', 'Publish - start', { evLabel: this.site.setting.domain })

    ipcRenderer.once('site-published', (event: IpcRendererEvent, result: any) => {
      console.log(result)
      if (result.success) {
        this.$message.success(`🎉  ${this.$t('syncSuccess')}`)

        ga.event('Publish', 'Publish - success', { evLabel: this.site.setting.domain })
      } else {
        this.syncErrorModalVisible = true

        ga.event('Publish', 'Publish - failed', { evLabel: this.site.setting.domain })
      }
      this.publishLoading = false
    })
  }

  openInBrowser(url: string) {
    shell.openExternal(url)
  }

  goWeb() {
    if (this.site.setting.domain) {
      ga.event('Client', 'Client - open-web', { evLabel: this.site.setting.domain })

      shell.openExternal(this.site.setting.domain)
    }
  }

  handleGithubClick() {
    ga.event('Client', 'Client - open-github', {})

    this.openInBrowser('https://github.com/getgridea/gridea')
  }

  public async checkUpdate() {
    const res = await axios.get('https://api.github.com/repos/getgridea/gridea/releases/latest')
    if (res.status === 200) {
      this.newVersion = res.data.name
      const latestVersion = res.data.name.substring(1).split('.').map((item: string) => parseInt(item, 10))
      const currentVersion = this.version.split('.').map((item: string) => parseInt(item, 10))
      this.updateContent = markdown.render(res.data.body)

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
        // this.$message.success(`🔥  ${this.$t('newVersionTips')}`, 8)
        this.updateModalVisible = true
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
  @apply text-gray-500;
}

/deep/ .ant-menu-item {
  padding-left: 16px !important;
  transition: all 0.3s;
  cursor: default;

  &:hover {
    background-color: #fff;
  }
}

/deep/ .ant-menu-vertical .ant-menu-item:after, .ant-menu-vertical-left .ant-menu-item:after, .ant-menu-vertical-right .ant-menu-item:after, .ant-menu-inline .ant-menu-item:after {
  border-right: none;
}

/deep/ .ant-menu:not(.ant-menu-horizontal) .ant-menu-item-selected {
  background-color: #fff;
  // @apply shadow;
  color: #000;
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
    margin: 8px 0;
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
  border-radius: 20px;
  background: #fff;
  transition: all 0.3s;
  &:hover {
    background: #fafafa;
  }
}

.sync-btn {
  border-radius: 20px;
  background: linear-gradient(124deg, rgba(65,70,75,1) 0%, rgba(0,0,0,1) 100%);
  color: #bababa;
  border: none;
  transition: all 0.3s;
  &:hover {
    background: linear-gradient(124deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 100%);
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

.nav-text {
  font-weight: normal;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  .number {
    font-weight: lighter;
  }
}

.menu-icon {
  font-size: 17px;
  margin-right: 8px;
  font-weight: 400;
}

.version-info {
  /deep/ code {
    background-color: rgba(27,31,35,.05);
    border-radius: 3px;
    font-size: 85%;
    margin: 0;
    padding: .2em .4em;
  }
  /deep/ blockquote {
    border-left: .25em solid #dfe2e5;
    color: #6a737d;
    padding: 0 1em;
  }
  /deep/ ul, ol {
    padding: 0;
    list-style-type: none;
    font-size: 14px;
    margin: 30px 20px;

    ul,
    ol {
      margin: 20px 20px 10px;
    }
  }

  /deep/ li {
      line-height: 1.2;
    }

  /deep/ ul > li {
      display: table-row;

      &:before {
        content:'\25CF';
        color: #fad849;
        padding-right: 10px;
        display: table-cell;
      }

      + li:before {
        padding-top: 10px;
      }
    }

  /deep/ ol {
      counter-reset: ordered-counter;
      > li {
        counter-increment: ordered-counter;
        display: table-row;

        &:before {
          content: counter(ordered-counter);
          color: #fad849;
          padding-right: 10px;
          display: table-cell;
          text-align: right;
        }

        + li:before {
          padding-top: 10px;
        }
      }
    }
}

.download-container {
  text-align: center;
  padding: 16px 0;
  background: #fafafa;
}
</style>
