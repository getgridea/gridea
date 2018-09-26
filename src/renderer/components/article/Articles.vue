<template>
  <div class="">
    <v-card>
      <v-data-table :headers="headers" :items="items">

      </v-data-table>
    </v-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

@Component
export default class Articles extends Vue {
  headers = [
    {
      text: '标题',
      value: 'title',
    },
    {
      text: '创建时间',
      value: 'createAt',
    },
    {
      text: '操作',
      value: 'id',
      sortable: false,
    },
  ]

  items = []
}
</script>

<style scoped>
</style>
