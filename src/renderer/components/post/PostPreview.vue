<template>
  <div class="post-preview">
    <span class="close" @click="close">
      <i-icon type="ios-close-empty"></i-icon>
    </span>
    <h1 class="title">{{ post.data.title }}</h1>
    <div class="content" v-html="post.htmlContent">
    </div>
  </div>
</template>

<script>
export default {
  props: {
    post: Object,
  },
  data() {
    return {}
  },
  created() {
  },
  methods: {
    close() {
      this.$parent.preview = false
    },
  },
}
</script>

<style lang="scss" scoped>
  .post-preview {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #fff;
    z-index: 100;
    padding: 40px 80px;
    overflow: auto;
    h1 {
      text-align: center;
      margin: 20px auto;
      font-size: 30px;
    }
  }
  .close {
    position: fixed;
    right: 40px;
    top: 20px;
    cursor: pointer;
    font-size: 40px;
  }
</style>
<style lang="scss">
  .post-preview {
    .content {
      font-size: 18px;
    }
    pre {
      padding: 10px;
      border-radius: 3px;
      background: #f5f5f5;
    }
    h2 {
      margin: 10px 0;
      font-size: 24px;
    }
    img {
      display: block;
      box-shadow: 0 0 50px #f1f1f1;
      max-width: 90%;
      margin: 10px auto;
      border-radius: 3px;
    }
  }
</style>

