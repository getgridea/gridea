<template>
  <div class="articles-page">
    <a-row type="flex" justify="end" class="tool-container">
      <a-button type="primary">{{ $t('newArticle') }}</a-button>
    </a-row>
    <div class="content-container">
      <a-table
        :rowSelection="rowSelection"
        :columns="columns"
        :dataSource="site.posts"
      >
        <a href="javascript:;" slot="name" slot-scope="text">{{ text }}</a>
        <a-tag slot="status" :color="text ? '#2bb15a': '#8a8a8a'" slot-scope="text">{{ text ? $t('publish') : $t('draft') }}</a-tag>
      </a-table>
    </div>
  </div>
</template>

<script lang="ts">
import { ipcRenderer } from 'electron'
import { Vue, Component } from 'vue-property-decorator'
import { State } from 'vuex-class'
import { IPost } from '../../interfaces/post'

@Component
export default class Articles extends Vue {
  @State('site') site!: any

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
        width: 260,
      },
    ]
  }

  get rowSelection() {
    return {
      onChange: (selectedRowKeys: any, selectedRows: any) => {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows)
      },
    }
  }

  mounted() {
    this.$bus.$emit('site-reload')
  }
}
</script>

<style lang="less" scoped>
.articles-page {
  position: relative;
}
.tool-container {
  padding: 8px 0 16px;
  margin-bottom: 16px;
  position: fixed;
  top: 8px;
  left: 216px;
  right: 16px;
  z-index: 1;
  background: #F7F6F3;
  border-bottom: 1px solid #e2e2e2;
}
.content-container {
  margin-top: 64px;
}
</style>
