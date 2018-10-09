<template>
  <div class="">
    <v-card flat>
      <v-card-title>
        标 签
        <v-spacer></v-spacer>
        <v-btn depressed color="primary" @click="newTag">新标签</v-btn>
      </v-card-title>
      <v-chip
        v-for="tag in site.tags"
        :key="tag.value"
        :close="!tag.used"
        @input="handleDelete(tag.value)"
      >
        {{ tag.value }}
      </v-chip>
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

  // 将标签文件中的标签列表和文章中使用的标签进行并集同步
  syncTags() {

  }
  
  newTag() {

  }
  handleDelete(tagValue: string) {
    console.log('clicked', tagValue)
    ipcRenderer.send('tag-delete', tagValue)
    ipcRenderer.once('tag-deleted', (event: Event, result: any) => {
      this.$bus.$emit('site-reload')
      console.log('delete success')
    })
  }
}
</script>

<style scoped>
</style>
