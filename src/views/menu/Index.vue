<template>
  <div class="">
    <a-row type="flex" justify="end" class="tool-container">
      <a-tooltip placement="bottom" :title="$t('newMenu')">
        <div class="op-btn" tabindex="0" @click="newMenu">
          <i class="zwicon-plus"></i>
        </div>
      </a-tooltip>
    </a-row>
    <div class="content-container">
      <a-table
        :columns="columns"
        :dataSource="site.menus"
        rowKey="name"
        :pagination="false"
      >
        <a
          class="menu-title"
          href="javascript:;"
          slot="name"
          slot-scope="text, record, index"
          @click="editMenu(record, index)"
        ><i class="zwicon-hamburger-menu menu-icon"></i> {{ text }}</a>
        <a-tag slot="openType" slot-scope="text" :color="text === 'Internal' ? 'purple' : 'blue' ">{{ text }}</a-tag>
        <span slot="action" slot-scope="record">
          <i class="zwicon-trash delete-icon" @click="deleteMenu(record.name)"></i>
        </span>
      </a-table>
    </div>
    <a-drawer
      title="Menu"
      width="400"
      :visible="visible"
      @close="close"
      :wrapStyle="{height: 'calc(100% - 108px)',overflow: 'auto',paddingBottom: '108px'}"
    >
      <a-form :form="form" layout="vertical">
        <a-form-item :label="$t('name')">
          <a-input v-model="form.name" />
        </a-form-item>
        <a-form-item label=" ">
          <a-radio-group defaultValue="a" buttonStyle="solid" v-model="form.openType">
            <a-radio-button v-for="item in menuTypes" :key="item" :value="item">{{ item }}</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="Link">
          <a-input v-model="form.link" class="link-input" placeholder="输入或从下面选择"></a-input>
          <a-select v-model="form.link">
            <a-select-option v-for="item in menuLinks" :key="item.value" :value="item.value">{{ item.text }}</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
      <div
        :style="{
          position: 'absolute',
          left: 0,
          bottom: 0,
          width: '100%',
          padding: '10px 16px',
          background: '#fff',
          textAlign: 'right',
        }"
      >
        <a-button
          :style="{marginRight: '8px'}"
          @click="close"
        >
          {{ $t('cancel') }}
        </a-button>
        <a-button type="primary" :disabled="!canSubmit" @click="saveMenu">{{ $t('save') }}</a-button>
      </div>
    </a-drawer>
  </div>
</template>

<script lang="ts">
import { ipcRenderer, IpcRendererEvent } from 'electron'
import { Vue, Component } from 'vue-property-decorator'
import { State } from 'vuex-class'
import urlJoin from 'url-join'
import { MenuTypes } from '../../helpers/enums'
import { IMenu } from '../../interfaces/menu'
import { IPost } from '../../interfaces/post'
import ga from '../../helpers/analytics'

interface IForm {
  name: any
  index: any
  openType: string
  link: string
}

@Component
export default class Menu extends Vue {
  @State('site') site!: any

  form: IForm = {
    name: '',
    index: '',
    openType: MenuTypes.Internal,
    link: '',
  }

  visible = false

  menuTypes = MenuTypes

  get columns() {
    return [
      {
        title: this.$t('name'),
        dataIndex: 'name',
        scopedSlots: { customRender: 'name' },
      },
      {
        title: this.$t('openType'),
        dataIndex: 'openType',
        scopedSlots: { customRender: 'openType' },
      },
      {
        title: this.$t('link'),
        dataIndex: 'link',
      },
      {
        title: this.$t('actions'),
        key: 'action',
        scopedSlots: { customRender: 'action' },
      },
    ]
  }

  get menuLinks() {
    const { setting, themeConfig } = this.site
    const posts = this.site.posts.map((item: IPost) => {
      return {
        text: `📄 ${item.data.title}`,
        value: urlJoin(setting.domain, themeConfig.postPath, item.fileName),
      }
    })
    return [
      {
        text: '🏠 Homepage',
        value: setting.domain,
      },
      {
        text: '📚 Archives',
        value: urlJoin(setting.domain, themeConfig.archivesPath),
      },
      {
        text: '🏷️ Tags',
        value: urlJoin(setting.domain, 'tags'),
      },
      ...posts,
    ]
  }

  get canSubmit() {
    return this.form.name && this.form.link
  }

  newMenu() {
    this.form.name = null
    this.form.index = null
    this.form.openType = MenuTypes.Internal
    this.form.link = ''
    this.visible = true

    ga.event('Menu', 'Menu - new', { evLabel: this.site.setting.domain })
  }

  close() {
    this.visible = false
  }

  editMenu(menu: IMenu, index: number) {
    this.visible = true
    this.form.index = index
    this.form.name = menu.name
    this.form.openType = menu.openType
    this.form.link = menu.link
  }

  saveMenu() {
    console.log('click save menu', this.form)
    ipcRenderer.send('menu-save', { ...this.form })
    ipcRenderer.once('menu-saved', (event: IpcRendererEvent, result: any) => {
      this.$bus.$emit('site-reload')
      this.$message.success(this.$t('menuSuccess'))
      this.visible = false

      ga.event('Menu', 'Menu - save', { evLabel: this.form.name })
    })
  }

  async deleteMenu(menuValue: string) {
    this.$confirm({
      title: `${this.$t('warning')}`,
      content: `${this.$t('deleteWarning')}`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: () => {
        ipcRenderer.send('menu-delete', menuValue)
        ipcRenderer.once('menu-deleted', (event: IpcRendererEvent, result: any) => {
          this.$bus.$emit('site-reload')
          this.$message.success(this.$t('menuDelete'))
          this.visible = false
        })
      },
    })
  }
}
</script>

<style lang="less" scoped>
.link-input {
  margin-bottom: 8px;
}
.menu-icon {
  font-size: 18px;
}
.menu-title {
  color: #373530;
  &:hover {
    color: #3687eb;
  }
}
.delete-icon {
  padding: 4px 8px;
  &:hover {
    color: #fa5252;
    cursor: pointer;
  }
}
</style>
