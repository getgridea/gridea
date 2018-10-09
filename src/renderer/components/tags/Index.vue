<template>
  <div class="">
    标签列表
    {{ site.tags }}
  </div>
</template>

<script lang="ts">
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
}
</script>

<style scoped>
</style>
