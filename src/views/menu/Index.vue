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
      <draggable v-model="menuList" handle=".handle" @change="handleMenuSort">
        <div
          class="menu-container flex mb-2 rounded-sm relative cursor-pointer transition-fast hover:bg-gray-100"
          v-for="(menu, index) in menuList"
          :key="index"
          @click="editMenu(menu, index)"
        >
          <div class="flex items-center pl-4 handle cursor-move">
            <i class="ri-drag-move-line"></i>
          </div>
          <div class="p-4 flex-1">
            <div class="text-base text-gray-700 mb-2">
              {{ menu.name }}
            </div>
            <div class="text-xs flex items-center">
              <div class="text-xs flex items-center px-2 rounded border bg-gray-100 border-gray-200 text-gray-500 mr-4">
                {{ menu.openType }}
                <i class="ri-external-link-line ml-2" v-if="menu.openType === 'External'"></i>
              </div>
              <div class="text-gray-300">
                {{ menu.link }}
              </div>
            </div>
          </div>
          <div class="flex items-center px-4">
            <i class="ri-delete-bin-4-line hover:text-red-700" @click.stop="deleteMenu(menu.name)"></i>
          </div>
        </div>
      </draggable>
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
import Draggable from 'vuedraggable'
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

@Component({
  components: {
    Draggable,
  },
})
export default class Menu extends Vue {
  @State('site') site!: any

  form: IForm = {
    name: '',
    index: '',
    openType: MenuTypes.Internal,
    link: '',
  }

  menuList: any = []

  draggleList: any = []

  visible = false

  menuTypes = MenuTypes

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

  mounted() {
    this.menuList = [...this.site.menus]
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
    ipcRenderer.send('menu-save', { ...this.form })
    ipcRenderer.once('menu-saved', (event: IpcRendererEvent, result: any) => {
      if (typeof this.form.index !== 'number') {
        this.menuList.push({ ...this.form })
      } else {
        this.menuList[this.form.index] = { ...this.form }
      }
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
          const foundIndex = this.menuList.findIndex((item: IMenu) => item.name === menuValue)
          this.menuList.splice(foundIndex, 1)

          this.$bus.$emit('site-reload')
          this.$message.success(this.$t('menuDelete'))
          this.visible = false
        })
      },
    })
  }

  async handleMenuSort() {
    ipcRenderer.send('menu-sort', this.menuList)
    ipcRenderer.once('menu-sorted', (event: IpcRendererEvent, result: any) => {
      this.$bus.$emit('site-reload')
      this.$message.success(this.$t('menuSuccess'))
      ga.event('Menu', 'Menu - sort', { evLabel: '' })
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
.menu-container {
  box-shadow: inset 0 0 0 1px #eaeaea;
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
