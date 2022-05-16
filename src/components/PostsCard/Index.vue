<template>
  <div class="post-card" v-if="posts && posts.length > 0">
    <div class="item-container" v-for="(post, index) in posts" :key="index">
      <div @click="handleClick(post)">{{ post.data.title }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class PostsCard extends Vue {
  @Prop(Array) posts!: any[]

  handleClick(post: any) {
    this.$emit('select', post.link)
  }
}
</script>

<style lang="less" scoped>
.post-card {
  max-height: 480px;
  overflow: scroll;
  margin: -15px;
}
.item-container {
  margin: 4px;
  padding: 2px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  &:hover {
    background: #fafafa;
  }
}
</style>
