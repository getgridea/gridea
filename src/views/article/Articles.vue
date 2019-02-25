<template>
  <div class="articles-page">
    <a-row type="flex" justify="end" class="tool-container">
      <a-button class="btn" type="danger" v-if="selectedRowKeys.length > 0" @click="deleteSelectedPosts">删除选中</a-button>
      <a-button class="btn" type="primary" @click="newArticle">{{ $t('newArticle') }}</a-button>
    </a-row>
    <div class="content-container">
      <a-table
        :rowSelection="rowSelection"
        :columns="columns"
        :dataSource="site.posts"
        :pagination="{ size: 'small' }"
      >
        <a
          class="table-cell-link"
          href="javascript:;"
          slot="name"
          slot-scope="text, record, index"
          @click="editPost(record)"
        >{{ text }} <a-tag v-if="record.data.hideInList" color="orange">Hide</a-tag> </a>
        <a-tag :class="{'tag-success': text, 'tag-draft': !text }" slot="status" :color="text ? '#d8f5ea': '#e8e8e8'" slot-scope="text">{{ text ? $t('published') : $t('draft') }}</a-tag>
        <span slot="date" slot-scope="text" class="post-date">{{ text }}</span>
      </a-table>
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
import { ipcRenderer } from 'electron'
import { Vue, Component } from 'vue-property-decorator'
import { State } from 'vuex-class'
import { FadeTransition } from 'vue2-transitions'
import { IPost } from '../../interfaces/post'
import ArticleUpdate from './ArticleUpdate.vue'

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
  selectedRowKeys = []
  selectedPost = []

  get columns() {
    return [
      {
        title: this.$t('title'),
        key: 'data.title',
        dataIndex: 'data.title',
        scopedSlots: { customRender: 'name' },
      },
      {
        title: this.$t('status'),
        dataIndex: 'data.published',
        scopedSlots: { customRender: 'status' },
        width: 100,
      },
      {
        title: this.$t('createAt'),
        dataIndex: 'data.date',
        scopedSlots: { customRender: 'date' },
        width: 185,
      },
    ]
  }

  get rowSelection() {
    return {
      selectedRowKeys: this.selectedRowKeys,
      onChange: (selectedRowKeys: any, selectedRows: any) => {
        this.selectedRowKeys = selectedRowKeys
        this.selectedPost = selectedRows
      },
    }
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
        ipcRenderer.once('app-post-deleted', (event: Event, data: any) => {
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
        ipcRenderer.once('app-post-list-deleted', (event: Event, data: any) => {
          console.log(data)
          if (data) {
            this.$bus.$emit('snackbar-display', this.$t('articleDelete'))
            this.$bus.$emit('site-reload')
            this.selectedPost = []
            this.selectedRowKeys = []
          }
        })
      },
    })
  }
}
</script>

<style lang="less" scoped>
.articles-page {
  position: relative;
}
.post-date {
  color: #989898;
}

.tag-success {
  color: #0e4933;
}
.tag-draft {
  color: #4c4c4c;
}
</style>
