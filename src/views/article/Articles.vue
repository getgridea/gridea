<template>
  <div class="articles-page">
    <div class="flex justify-between tool-container">
      <div class="flex items-center">
        <div v-if="selectedPost.length > 0" @click="deleteSelectedPosts" class="flex items-center py-1 px-2 bg-gray-100 transition cursor-default hover:bg-gray-200 rounded-sm">
          <i class="ri-delete-bin-3-line mr-2"></i><span class="text-sm">{{ $t('deleteSelected') }} {{ selectedPost.length }}</span>
        </div>
      </div>
      <div class="flex">
        <a-input-search
          class="search-input"
          :placeholder="$t('searchArticle')"
          style="width: 200px"
          @search="onSearch"
          v-model="keyword"
          @blur="handleSearchInputBlur"
          v-if="searchInputVisible"
        />
        <a-tooltip placement="bottom" :title="$t('searchArticle')">
          <div class="op-btn" @click="searchInputVisible = true" v-if="!keyword && !searchInputVisible">
            <i class="zwicon-search"></i>
          </div>
        </a-tooltip>
        <a-tooltip placement="bottom" :title="$t('newArticle')">
          <div class="op-btn" tabindex="0" @click="newArticle">
            <i class="zwicon-plus"></i>
          </div>
        </a-tooltip>
      </div>
    </div>
    <div class="content-container">
      <div class="pb-12">
        <div
          class="post-container flex mb-2 rounded-sm relative cursor-pointer transition-fast hover:bg-gray-100 overflow-hidden"
          v-for="post in currentPostList" :key="post.fileName"
          @click="editPost(post)"
        >
          <div class="p-4 flex-1 flex">
            <div class="flex flex-shrink-0 items-center pr-4">
              <a-checkbox @click.stop="() => {}" :checked="selectedPost.includes(post)" @change="onSelectChange(post)"></a-checkbox>
            </div>
            <div class="flex-1">
              <a class="post-title block text-base text-gray-700 mb-2">{{ post.data.title }}</a>
              <div class="text-xs flex items-center text-gray-300">
                <div class="text-xs flex items-center mr-2">
                  <div class="rounded-full w-1 h-1 mr-1" :class="{ 'bg-green-500': post.data.published, 'bg-gray-500': !post.data.published }"></div>
                  {{ post.data.published ? $t('published') : $t('draft') }}
                </div>
                <div class="flex items-center">
                  <i class="ri-calendar-line mr-1"></i> {{ $moment(post.data.date).format('YYYY-MM-DD') }}
                </div>
                <div class="flex-1 flex flex-wrap items-center ml-2" v-if="(post.data.tags || []).length > 0">
                  <i class="ri-price-tag-3-line"></i>
                  <div v-for="(tag, index) in post.data.tags" :key="index">
                    <div class="text-xs ml-1 flex" v-if="index < 2">
                      {{ tag }}
                    </div>
                  </div>
                  <div v-if="(post.data.tags || []).length > 2" class="ml-1">
                    ...
                  </div>
                </div>
              </div>
            </div>
          </div>

          <img v-if="post.data.feature" :src="post.data.feature" class="feature-img" />

          <div class="absolute right-0 top-0 -mt-px -mr-px flex">
            <div v-if="post.data.hideInList" class="text-xs flex items-center px-2 rounded-b rounded-br-none bg-gray-800 text-white">
              HIDE
            </div>
            <div v-if="post.data.isTop" class="ml-2 text-xs flex items-center px-2 rounded-b rounded-br-none bg-yellow-400 text-gray-900">
              TOP
            </div>
          </div>
        </div>
      </div>
      <div class="pagination-container py-2" v-if="postList.length > pageSize">
        <a-pagination
          v-model="currentPage"
          :pageSize="pageSize"
          :total="postList.length"
          @change="handlePageChanged"
        />
      </div>
    </div>

    <fade-transition :duration="100">
      <article-update
        v-if="articleUpdateVisible"
        :visible="articleUpdateVisible"
        :articleFileName="currentArticleFileName"
        @close="close"
        @fetchData="$bus.$emit('site-reload')"
      ></article-update>
    </fade-transition>
  </div>
</template>

<script lang="ts">
import { ipcRenderer, IpcRendererEvent } from 'electron'
import { Vue, Component, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'
import { FadeTransition } from 'vue2-transitions'
import { IPost } from '../../interfaces/post'
import ArticleUpdate from './ArticleUpdate.vue'
import ga from '../../helpers/analytics'

@Component({
  components: {
    ArticleUpdate,
    FadeTransition,
  },
})
export default class Articles extends Vue {
  @State('site') site!: any

  articleUpdateVisible = false

  currentArticleFileName = ''

  selectedPost: any = []

  keyword = ''

  searchInputVisible = false

  currentPage = 1

  pageSize = 20

  handleSearchInputBlur() {
    if (!this.keyword) {
      this.searchInputVisible = false
    }
  }

  get postList() {
    return this.site.posts.filter((item: IPost) => item.data.title.toLowerCase().includes(this.keyword.toLowerCase()))
  }

  get currentPostList() {
    return this.postList.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
  }

  onSelectChange(post: any) {
    const foundIndex = this.selectedPost.findIndex((item: any) => item === post)
    if (foundIndex !== -1) {
      this.selectedPost.splice(foundIndex, 1)
    } else {
      this.selectedPost.push(post)
    }
  }

  handlePageChanged(page: number) {
    this.currentPage = page
  }

  mounted() {
    this.$bus.$emit('site-reload')
  }

  close() {
    this.articleUpdateVisible = false
    this.currentArticleFileName = ''
  }

  newArticle() {
    this.articleUpdateVisible = true
    this.currentArticleFileName = ''

    ga.event('Post', 'Post - new', { evLabel: this.site.setting.domain })
  }

  editPost(post: IPost) {
    this.articleUpdateVisible = true
    this.currentArticleFileName = post.fileName
  }

  async deletePost(post: IPost) {
    this.$confirm({
      title: `${this.$t('warning')}`,
      content: `${this.$t('deleteWarning')}`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: () => {
        ipcRenderer.send('app-post-delete', post)
        ipcRenderer.once('app-post-deleted', (event: IpcRendererEvent, data: any) => {
          if (data) {
            this.$message.success(this.$t('articleDelete'))
            this.$bus.$emit('site-reload')
          }
        })
      },
    })
  }

  async deleteSelectedPosts() {
    this.$confirm({
      title: `${this.$t('warning')}`,
      content: `${this.$t('deleteWarning')}`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: () => {
        ipcRenderer.send('app-post-list-delete', this.selectedPost)
        ipcRenderer.once('app-post-list-deleted', (event: IpcRendererEvent, data: any) => {
          console.log(data)
          if (data) {
            this.$bus.$emit('snackbar-display', this.$t('articleDelete'))
            this.$bus.$emit('site-reload')

            ga.event('Post', 'Post - delete', { evLabel: this.site.setting.domain, evValue: this.selectedPost.length })

            this.selectedPost = []
          }
        })
      },
    })
  }

  onSearch(val: string) {
    this.keyword = val
  }

  @Watch('keyword')
  handleKeywordChange(val: string) {
    this.currentPage = 1
  }
}
</script>

<style lang="less" scoped>
@import '~@/assets/styles/var.less';

.articles-page {
  position: relative;
}

.post-container {
  box-shadow: inset 0 0 0 1px #eaeaea;
  &:hover {
    .post-title {
      color: @link-color;
    }
  }
}

.feature-img {
  height: 84px;
  width: 176px;
  object-fit: cover;
}

.pagination-container {
  display: flex;
  justify-content: center;
  position: fixed;
  bottom: 0;
  right: 0;
  left: 200px;
  background: #fff;
  border-top: 1px solid #e8e8e88a;
}
</style>
