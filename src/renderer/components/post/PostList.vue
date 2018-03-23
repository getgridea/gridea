<template>
  <div class="post-list">
    <p
      class="post"
      v-show="!preview"
      v-for="(post, index) in postList"
      @mouseover="hover(index)"
      @mouseout="blur"
    >
      <span @click="showPost(post)">{{ post.data.title }}</span>
      <i-poptip
        v-if="hovered && currentIndex === index"
        confirm
        title="您确认删除吗？"
        placement="left"
        @on-ok="deletePost(post)">
        <i-button
          type="error"
          size="small"
          shape="circle"
          icon="android-delete"
        ></i-button>
      </i-poptip>
      <time v-else>{{ post.data.date | formatDate }}</time>
    </p>
    <div class="new-post">
      <router-link to="/new">
        <i-button type="primary" shape="circle" icon="plus-round" size="large"></i-button>
      </router-link>
    </div>
    <post-preview v-if="preview" :post="currentPost"></post-preview>
  </div>
</template>

<script>
import fse from 'fs-extra'
import moment from 'moment'
import marked from 'marked'
import Post from '@/lib/util/post'
import PostPreview from './PostPreview'
const post = new Post()

export default {
  components: {
    PostPreview,
  },
  data() {
    return {
      postList: [],
      hovered: false,
      currentIndex: -1,
      preview: false,
      currentPost: null,
    }
  },
  async created() {
    // Init posts
    this.$db.defaults({ posts: [] })

    // Empty posts
    await this.$db.get('posts').remove().write()

    // Read posts and write to db
    const postList = await this.getPostList()
    await this.$db.set('posts', postList).write()

    // Sort articles by time when displaying articles
    this.postList = await this.queryPosts()
  },
  methods: {
    async queryPosts() {
      const list = await this.$db.get('posts')
        .sortBy('data.date')
        .desc()
        .value()
      return list
    },
    async getPostList() {
      const postPath = `${this.$store.state.setting.source}/posts`
      const postList = await post.getPostList(postPath)
      return postList
    },
    async deletePost(post) {
      try {
        await this.$db.get('posts')
          .remove(d => d.data.title === post.data.title && d.data.date === post.data.date)
          .write()
        const basePath = this.$db.get('remote').value().source
        await fse.remove(`${basePath}/posts/${post.fileName}.md`)
        this.postList.splice(this.postList.indexOf(post), 1)
        this.$Message.success('😔  您删除了一篇创作，期待您新的创作！')
      } catch (e) {
        console.log(e)
      }
    },
    hover(index) {
      this.currentIndex = index
      this.hovered = true
    },
    blur() {
      this.currentIndex = -1
      this.hovered = false
    },
    showPost(post) {
      post.htmlContent = marked(post.content, { breaks: true })
      this.currentPost = post
      this.preview = true
    },
  },
  filters: {
    formatDate(date) {
      // Should use new Date(date) https://github.com/moment/moment/issues/1407
      return moment(new Date(date)).format('YYYY-MM-DD')
    },
  },
}
</script>

<style lang="scss" scoped>
  .post-list {
    padding: 10px;
    font-size: 14px;
    .post {
      border-radius: 3px;
      display: flex;
      justify-content: space-between;
      padding: 6px 10px;
      line-height: 25px;
      transition: all 0.3s;
      span {
        cursor: pointer;
      }
      &:hover {
        background: #eee;
        padding-left: 15px;
      }
    }
  }
  .new-post {
    position: fixed;
    right: 20px;
    bottom: 10px;
  }
</style>
