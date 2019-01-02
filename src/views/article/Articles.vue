<template>
  <div class="">
    <v-card flat>
      <v-card-title>
        <span class="headline">📄 文 章</span>
        <v-spacer></v-spacer>
        <v-btn depressed color="primary" @click="$router.push('/articles/create')">新文章</v-btn>
      </v-card-title>
      <v-data-table :headers="headers" :items="site.posts" :pagination.sync="pagination">
        <template slot="items" slot-scope="props">
          <td>{{ props.item.data.title }}</td>
          <td>{{ $dayjs(props.item.data.date).format('YYYY-MM-DD') || '-' }}</td>
          <td>
            <v-icon @click="editPost(props.item)" small>
              edit
            </v-icon>
            <v-icon @click="deletePost(props.item)" small>
              delete
            </v-icon>
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
import { ipcRenderer } from 'electron';

@Component
export default class Articles extends Vue {
  @State('site') site!: any

  headers = [
    {
      text: '标题',
      value: 'title',
    },
    {
      text: '创建时间',
      value: 'data.date',
    },
    {
      text: '操作',
      value: 'id',
      sortable: false,
    },
  ]

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
      text: '你确定要删除吗?',
      title: '警告',
    })
    if (confirm) {
      ipcRenderer.send('app-post-delete', post)
      ipcRenderer.once('app-post-deleted', (event: Event, data: any) => {
        if (data) {
          this.$bus.$emit('snackbar-display', '文章已删除')
          this.$bus.$emit('site-reload')
        }
      })
    }
  }
}
</script>

<style scoped>
</style>
