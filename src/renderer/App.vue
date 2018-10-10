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
      </v-navigation-drawer>
      <v-toolbar fixed app flat dense clipped-left>
        <v-toolbar-side-icon @click.native.stop="drawer = !drawer"></v-toolbar-side-icon>
        <v-toolbar-title v-text="title"></v-toolbar-title>
        <v-spacer></v-spacer>
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
}
</script>

<style>
  @import url('https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons');
  /* Global CSS */
</style>
