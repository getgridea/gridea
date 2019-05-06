<template>
  <div>
    <a-list
    class="demo-loadmore-list"
    itemLayout="horizontal"
    :dataSource="sortedThemes"
  >
    <a-list-item slot="renderItem" slot-scope="item">
      <a-button slot="actions" :disabled="BaseThemes.includes(item.name)" type="primary" @click="handleUpdate(item)">update</a-button>
      <a-button slot="actions" :disabled="BaseThemes.includes(item.name)" @click="handleDelete(item)">delete</a-button>

      <a-list-item-meta
        :description="`${item.author} - ${item.version}`"
      >
        <div slot="title">{{item.name}}</div>
      </a-list-item-meta>
      <div>{{item.repository}}</div>
    </a-list-item>
    </a-list>
    <div class="input-search-wrap">
      <a-input-search v-model="remote" :placeholder="$t('loadThemePlaceholder')" @search="onSearch" >
        <a-button slot="enterButton">{{$t('loadTheme')}}</a-button>
      </a-input-search>
      <div class="loading" v-if="loading">
        <a-spin />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ipcRenderer, Event, shell } from 'electron'
import { Vue, Component } from 'vue-property-decorator'
import { State } from 'vuex-class'
import { Site } from '../../../store/modules/site'
import { UrlFormats, DEFAULT_FEED_COUNT } from '../../../helpers/constants'

@Component
export default class Theme extends Vue {
  @State('site') site!: Site
 
  BaseThemes = ['Fly', 'Notes', 'Paper', 'Simple']

  remote = ''

  loading:boolean = false

  get sortedThemes() {
    return JSON.parse(JSON.stringify(this.site.themes)).sort((a: any, b: any) => {
      return this.BaseThemes.includes(a.name) ? -1 : 1
    })
  }

  handleUpdate(theme: any) {
    this.loading = true

    ipcRenderer.send('theme-update', theme.folder)

    ipcRenderer.once('theme-update-success', async (event: Event, result: any) => {
      this.loading = false
      await this.$bus.$emit('site-reload')
      this.$message.success(this.$t('themeUpdated'))
    })

    ipcRenderer.once('theme-update-fail', async (event: Event, error: any) => {
      this.loading = false
      this.$message.error(error.msg || error.message || error)
    })
  }

  handleDelete(theme: any) {
    if (this.site.themeConfig.themeName === theme.name) {
      return this.$message.warning(this.$t('deleteUsingThemeWarning'))
    }

    this.loading = true
    ipcRenderer.send('theme-delete', theme.folder)

    ipcRenderer.once('theme-delete-success', async (event: Event, result: any) => {
      this.loading = false
      await this.$bus.$emit('site-reload')
      this.$router.push({ name: 'loading', query: { redirect: 'theme?tab=manager' } })
      this.$message.success(this.$t('themeUpdated'))
    })
  }

  onSearch() {
    if (!this.remote.match(/\.git$/)) {
      return this.$message.warning(this.$t('themeDownloadWarning'))
    }

    this.loading = true
    ipcRenderer.send('theme-load', this.remote)

    ipcRenderer.once('theme-load-success', async (event: Event, result: any) => {
      this.loading = false
      await this.$bus.$emit('site-reload')
      this.$router.push({ name: 'loading', query: { redirect: 'theme?tab=manager' } })
      this.$message.success(this.$t('themeUpdated'))
    })

    ipcRenderer.once('theme-load-fail', async (event: Event, error: any) => {
      this.loading = false
      this.$message.error(error.msg || error.message || error)
    })
  }

  mounted() {
    const config = this.site.themeConfig
  }

  openPage(url: string) {
    shell.openExternal(url)
  }
}
</script>

<style lang="less" scoped>
  .input-search-wrap {
    margin: 20px 10px;
  }
  .loading {
    text-align: center;
    margin: 10px auto 0;
  }
</style>
