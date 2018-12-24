<template>
  <div class="">
    <v-card flat>
      <v-card-title>
        <span class="headline">📋 菜单</span>
        <v-spacer></v-spacer>
        <v-btn depressed color="primary" @click="newMenu">新菜单</v-btn>
      </v-card-title>
      <v-data-table :headers="headers" :items="site.menus">
        <template slot="items" slot-scope="props">
          <td>{{ props.item.name }}</td>
          <td>{{ props.item.openType }}</td>
          <td>{{ props.item.slug }}</td>
          <td>{{ props.item.link }}</td>
          <td>
            <v-icon @click="editMenu(props.item, props.index)" small>
              edit
            </v-icon>
            <v-icon @click="deleteMenu(props.item.name)" small>
              delete
            </v-icon>
          </td>
        </template>
      </v-data-table>

    </v-card>

    <v-dialog v-model="visible" :width="480">
      <v-card>
        <v-card-text>
          <v-text-field label="📋  名称" v-model="form.name"></v-text-field>
          <v-radio-group v-model="form.openType" row>
            <v-radio v-for="item in menuTypes" :key="item" :label="item" :value="item"></v-radio>
          </v-radio-group>
          <v-text-field label="Slug" v-model="form.slug"></v-text-field>
          <v-text-field label="Link" v-model="form.link"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat @click="visible = false">取消</v-btn>
          <v-btn flat color="primary" @click="saveMenu">保存</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { ipcRenderer, Event } from 'electron'
import Vue from 'vue'
import Component from 'vue-class-component'
import { State } from 'vuex-class'
import { MenuTypes } from '../../../helpers/enums'
import { IMenu } from '../../interfaces/menu'

interface IForm {
  name: any
  index: any
  openType: string
  slug: string
  link: string
}

@Component
export default class Tags extends Vue {
  @State('site') site!: any

  headers = [
    {
      text: '名称',
      value: 'title',
    },
    {
      text: '打开方式',
      value: 'openType',
    },
    {
      text: 'Slug',
      value: 'slug',
    },
    {
      text: 'Link',
      value: 'link',
    },
    {
      text: '操作',
      value: 'id',
      sortable: false,
    },
  ]

  visible = false

  menuTypes = MenuTypes
  
  form: IForm = {
    name: null,
    index: null,
    openType: MenuTypes.Internal,
    slug: '/',
    link: '',
  }
  
  newMenu() {
    this.form.name = null
    this.form.index = null
    this.visible = true
  }
  editMenu(menu: IMenu, index: number) {
    this.visible = true
    this.form.index = index
    this.form.name = menu.name
    this.form.openType = menu.openType
    this.form.slug = menu.slug
    this.form.link = menu.link
  }

  saveMenu() {
    console.log('click save menu', this.form)
    ipcRenderer.send('menu-save', { ...this.form })
    ipcRenderer.once('menu-saved', (event: Event, result: any) => {
      this.$bus.$emit('site-reload')
      this.$bus.$emit('snackbar-display', '菜单已保存')
      this.visible = false
    })
  }

  deleteMenu(menuValue: string) {
    ipcRenderer.send('menu-delete', menuValue)
    ipcRenderer.once('menu-deleted', (event: Event, result: any) => {
      this.$bus.$emit('site-reload')
      this.$bus.$emit('snackbar-display', '菜单已删除')
      this.visible = false
    })
  }
}
</script>

<style lang="stylus" scoped>
</style>
