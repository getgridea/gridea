<template>
  <div class="single-page">
    <h2>
      页面设置
      <i-dropdown
        class="new-page"
        trigger="click"
        placement="bottom-end"
        @on-click="newPage"
      >
        <i-button type="primary" icon="android-add">
          新单页
        </i-button>
        <i-dropdown-menu slot="list">
            <i-dropdown-item name="common">普通页</i-dropdown-item>
            <i-dropdown-item name="custom">自定义</i-dropdown-item>
        </i-dropdown-menu>
      </i-dropdown>
    </h2>
    <div class="card-container">
      <i-card class="card" v-for="page in pageList" :key="page.data.index">
        <p slot="title">
          <i-icon type="ios-book-outline"></i-icon>
          {{ page.data.title }}
        </p>
        <i-dropdown
          slot="extra"
          placement="bottom-end"
          trigger="click"
          @on-click="updatePage(page, $event)"
        >
          <a href="javascript:void(0)">
            设置
            <i-icon type="arrow-down-b"></i-icon>
          </a>
          <i-dropdown-menu slot="list">
            <i-dropdown-item name="edit">编辑</i-dropdown-item>
            <i-dropdown-item name="open" disabled>开启</i-dropdown-item>
            <i-dropdown-item name="close">关闭</i-dropdown-item>
            <i-dropdown-item name="delete">删除</i-dropdown-item>
          </i-dropdown-menu>
        </i-dropdown>
        <div>
          {{ page.content }}
        </div>
      </i-card>
    </div>
    <!-- 普通页 -->
    <page-common v-if="showNewCommonPage" :page="currentPage"></page-common>
  </div>
</template>

<script>
import Post from '@/lib/util/post'
import PageCommon from './PageCommon'
const post = new Post()

export default {
  components: {
    PageCommon,
  },
  data() {
    return {
      pageList: [],
      menus: [],
      showNewCommonPage: false,
      pageType: '',
      currentPage: null,
    }
  },
  async created() {
    // init pages
    this.$db.defaults({ pages: [] })
    // empty pages
    await this.$db.get('pages').remove().write()
    // read pages
    this.pageList = await this.getSinglePageList()
    await this.$db.set('pages', this.pageList).write()
    this.pageList = await this.$db
      .get('pages')
      .sortBy('data.index')
      .desc()
      .value()
    // update site menu
    this.menus = this.pageList.map(page => {
      console.log(page)
      return {
        name: page.data.title,
        link: page.linkName,
      }
    })
    // init menus
    this.$site.defaults({ 'menus': [] })
    // empty menus
    this.$site.get('menus').remove().write()
    // set menus
    this.$site.set('menus', this.menus).write()
  },
  methods: {
    async getSinglePageList() {
      const pageList = await post.getPageList(`${this.$store.state.setting.source}/pages`)
      return pageList
    },
    newPage(type) {
      this.showNewCommonPage = true
      this.currentPage = null
    },
    updatePage(page, type) {
      // 编辑
      if (type === 'edit') {
        this.showNewCommonPage = true
        this.currentPage = page
      }
    },
    test() {
      console.log('clicked')
    },
  },
}
</script>

<style lang="scss" scoped>
  .single-page {
    padding: 20px;
    .new-page {
      float: right;
    }
  }
  .card-container {
    padding: 20px 0;
    .card {
      margin-bottom: 20px;
    }
  }
</style>
