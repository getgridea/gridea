<template>
  <div class="">
    <v-card flat>
      <v-card-title>
        <span class="headline">📄 {{ $t('article') }}</span>
        <v-spacer></v-spacer>
        <v-btn v-if="selected.length > 0" depressed color="red lighten-2" @click="deleteAllPosts">删除选中</v-btn>
        <v-btn depressed color="primary" @click="newPost">{{ $t('newArticle') }}</v-btn>
      </v-card-title>
      <v-data-table
        v-model="selected"
        select-all
        :headers="headers"
        :items="site.posts"
        :pagination.sync="pagination"
        item-key="fileName"
      >
        <template slot="items" slot-scope="props">
          <td style="width: 80px">
            <v-checkbox
              v-model="props.selected"
              primary
              hide-details
            ></v-checkbox>
          </td>
          <td>{{ props.item.data.title }}</td>
          <td>
            <v-chip v-if="props.item.data.published" color="green" text-color="white" small>
              {{ $t('publish') }}
            </v-chip>
            <v-chip v-else color="grey  lighten-3" text-color="black" small>
              {{ $t('draft') }}
            </v-chip>
            
          </td>
          <td>{{ $dayjs(props.item.data.date).format('YYYY-MM-DD') || '-' }}</td>
          <td>
            <v-btn
              flat
              icon
              color="blue lighten-2"
              @click="editPost(props.item)"
              small
            >
              <v-icon small>edit</v-icon>
            </v-btn>
            <v-btn
              flat
              icon
              color="red lighten-2"
              @click="deletePost(props.item)"
              small
            >
              <v-icon small>delete</v-icon>
            </v-btn>
          </td>
        </template>
      </v-data-table>
    </v-card>
    <v-dialog v-model="articleUpdateVisible" fullscreen hide-overlay transition="fade-transition">
      <article-update
        :articleFileName="currentArticleFileName"
        @close="close"
        @fetchData="$bus.$emit('site-reload')"
      ></article-update>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { ipcRenderer } from 'electron'
import Vue from 'vue'
import Component from 'vue-class-component'
import { State } from 'vuex-class'
import { IPost } from '../../interfaces/post'
import ArticleUpdate from './ArticleUpdate.vue'

@Component({
  components: {
    ArticleUpdate,
  },
})
export default class Articles extends Vue {
  @State('site') site!: any

  get headers() {
    return [
      {
        text: this.$t('title'),
        value: 'title',
      },
      {
        text: this.$t('status'),
        value: 'data.published',
      },
      {
        text: this.$t('createAt'),
        value: 'data.date',
      },
      {
        text: this.$t('Actions'),
        value: 'title',
        sortable: false,
      },
    ]
  }

  articleUpdateVisible = false
  currentArticleFileName = ''

  pagination = {
    sortBy: 'data.date',
    descending: true,
  }
  selected = []

  mounted() {
    this.$bus.$emit('site-reload')
  }

  close() {
    this.articleUpdateVisible = false
    this.currentArticleFileName = ''
  }

  newPost() {
    this.articleUpdateVisible = true
    this.currentArticleFileName = ''
  }

  editPost(post: IPost) {
    this.articleUpdateVisible = true
    this.currentArticleFileName = post.fileName
  }

  async deletePost(post: IPost) {
    const confirm = await this.$dialog.confirm({
      text: `${this.$t('deleteWarning')}`,
      title: `${this.$t('warning')}`,
    })
    if (confirm) {
      ipcRenderer.send('app-post-delete', post)
      ipcRenderer.once('app-post-deleted', (event: Event, data: any) => {
        if (data) {
          this.$bus.$emit('snackbar-display', this.$t('articleDelete'))
          this.$bus.$emit('site-reload')
        }
      })
    }
  }

  async deleteAllPosts() {
    const confirm = await this.$dialog.confirm({
      text: `${this.$t('deleteWarning')}`,
      title: `${this.$t('warning')}`,
    })
    if (confirm) {
      ipcRenderer.send('app-post-list-delete', this.selected)
      ipcRenderer.once('app-post-list-deleted', (event: Event, data: any) => {
        console.log(data)
        if (data) {
          this.$bus.$emit('snackbar-display', this.$t('articleDelete'))
          this.$bus.$emit('site-reload')
          this.selected = []
        }
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
</style>
