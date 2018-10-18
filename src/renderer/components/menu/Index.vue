<template>
  <div class="">
    <v-card flat>
      <v-card-title>
        <span class="headline">📋 菜单</span>
        <v-spacer></v-spacer>
        <v-btn depressed color="primary" @click="newMenu">新菜单</v-btn>
      </v-card-title>
    </v-card>
  </div>
</template>

<script lang="ts">
import { ipcRenderer, Event } from 'electron'
import Vue from 'vue'
import Component from 'vue-class-component'
import { State } from 'vuex-class'
import { Site } from '../../store/modules/site'

@Component
export default class Tags extends Vue {
  @State('site') site!: Site

  visible = false
  
  form = {
    name: null,
    index: -1,
  }
  
  newMenu() {
    this.form.name = null
    this.form.index = -1
    this.visible = true
  }
  updateTag(tag: any, index: number) {
    console.log(tag)
    this.visible = true
    this.form.name = tag.name
    this.form.index = index
  }

  saveTag() {
    ipcRenderer.send('tag-save', { ...this.form, used: false })
    ipcRenderer.once('tag-saved', (event: Event, result: any) => {
      this.$bus.$emit('site-reload')
      this.$bus.$emit('snackbar-display', '标签已保存')
      this.visible = false
    })
  }
  handleDelete(tagValue: string) {
    console.log('clicked', tagValue)
    ipcRenderer.send('tag-delete', tagValue)
    ipcRenderer.once('tag-deleted', (event: Event, result: any) => {
      this.$bus.$emit('site-reload')
      this.$bus.$emit('snackbar-display', '标签已删除')
      this.visible = false
    })
  }
}
</script>

<style lang="stylus" scoped>
</style>
