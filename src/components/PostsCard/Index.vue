<template>
  <div class="post-card">
    <div class="item-container" v-for="(post, index) in site.posts" :key="index">
      <div @click="handleClick(post)">{{ post.data.title }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { State } from 'vuex-class'
import urlJoin from 'url-join'
import { Site } from '../../store/modules/site'

@Component
export default class PostsCard extends Vue {
  @State('site') site!: Site

  mounted() {
    console.log(this.site)
  }

  handleClick(post: any) {
    const postUrl = urlJoin(this.site.setting.domain, this.site.themeConfig.postPath, post.fileName)
    this.$emit('select', postUrl)
  }
}
</script>

<style lang="less" scoped>
.color-card {
  max-height: 480px;
  overflow: scroll;
}
.item-container {
  margin: 4px 0;
  padding: 2px;
  border-radius: 2px;
  font-weight: bold;
  cursor: pointer;
  &:hover {
    background: #fafafa;
  }
}
</style>
