<template>
  <div class="">
    <v-card flat>
      <v-card-title>
        <span class="headline">📄 {{ $t('article') }}</span>
        <v-spacer></v-spacer>
        <v-btn depressed color="primary" @click="$router.push('/articles/create')">{{ $t('newArticle') }}</v-btn>
      </v-card-title>
      <v-data-table :headers="headers" :items="site.posts" :pagination.sync="pagination">
        <template slot="items" slot-scope="props">
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
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { State } from 'vuex-class'
import { IPost } from '../../interfaces/post'
import { ipcRenderer } from 'electron'

@Component
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
        value: 'id',
        sortable: false,
      },
    ]
  }

  pagination = {
    sortBy: 'data.date',
    descending: true,
  }

  mounted() {
    this.$bus.$emit('site-reload')
  }

  editPost(post: IPost) {
    this.$router.push({ name: 'articles-edit', params: { articleFileName: post.fileName } })
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
}
</script>

<style scoped>
</style>
