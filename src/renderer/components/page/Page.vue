<template>
  <div class="single-page">
    <h2>
      页面设置
      <i-button class="new-page" type="primary" icon="android-add" @click="$router.push('/page-new')">
        新单页
      </i-button>
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
            操作
            <i-icon type="arrow-down-b"></i-icon>
          </a>
          <i-dropdown-menu slot="list">
            <i-dropdown-item name="edit">编辑</i-dropdown-item>
            <i-dropdown-item name="delete">删除</i-dropdown-item>
          </i-dropdown-menu>
        </i-dropdown>
        <div>
          {{ page.content }}
        </div>
      </i-card>
    </div>
  </div>
</template>

<script>
import fse from 'fs-extra'
import Post from '@/lib/util/post'
const post = new Post()

export default {
  data() {
    return {
      pageList: [],
      menus: [],
      setting: null,
    }
  },
  async created() {
    this.setting = this.$store.state.setting

    await this.fetchPageList()
    await this.updateMenus()
  },
  methods: {
    async fetchPageList() {
      await this.$db.defaults({ pages: [] })
      await this.$db
        .get('pages')
        .remove()
        .write()

      this.pageList = await post.getPageList(`${this.setting.source}/pages`)
      await this.$db.set('pages', this.pageList).write()

      this.pageList = await this.$db
        .get('pages')
        .sortBy('data.index')
        .desc()
        .value()
    },
    async updateMenus() {
      this.menus = this.pageList.map(page => {
        return {
          name: page.data.title,
          link: page.linkName,
        }
      })
      await this.$site.defaults({ menus: [] })
      await this.$site
        .get('menus')
        .remove()
        .write()
      await this.$site.set('menus', this.menus).write()
    },
    updatePage(page, type) {
      switch (type) {
        case 'edit':
          this.$router.push({ name: 'page-new', params: { page: page } })
          break
        case 'delete':
          this.removePage(page)
          break
        default:
          return false
      }
    },
    async removePage(page) {
      this.menus = this.menus.filter(menu => menu.link !== page.linkName)
      this.pageList = this.pageList.filter(p => p.linkName !== page.linkName)

      await fse.remove(`${this.setting.source}/pages/${page.linkName}`)

      await this.updateMenus()
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
