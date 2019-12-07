<template>
  <div class="">
    <a-row type="flex" justify="end" class="tool-container">
      <a-tooltip placement="bottom" :title="$t('newTag')">
        <div class="op-btn" tabindex="0" @click="newTag">
          <i class="zwicon-plus"></i>
        </div>
      </a-tooltip>
    </a-row>
    <div class="content-container">
      <div v-for="(tag, index) in site.tags" :key="tag.name" class="tag-wrapper">
        <div class="tag" @click="tag.used ? null : updateTag(tag, index)"><i class="zwicon-price-tag text-base mr-1"></i> {{ tag.name }}</div>
        <i class="zwicon-trash delete-icon" v-if="!tag.used" @click="handleDelete(tag.name)"></i>
      </div>
    </div>
    <a-drawer
      :title="$t('tag')"
      width="400"
      :visible="visible"
      @close="close"
      :wrapStyle="{height: 'calc(100% - 108px)',overflow: 'auto',paddingBottom: '108px'}"
    >
      <a-form :form="form" layout="vertical">
        <a-form-item :label="$t('tagName')">
          <a-input v-model="form.name" @input="handleNameChange" />
        </a-form-item>
        <a-form-item label="标签 URL">
          <a-input v-model="form.slug" @input="handleSlugChange" />
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
        <a-button type="primary" :disabled="!canSubmit" @click="saveTag">{{ $t('save') }}</a-button>
      </div>
    </a-drawer>
  </div>
</template>

<script lang="ts">
import { ipcRenderer, IpcRendererEvent } from 'electron'
import { Vue, Component } from 'vue-property-decorator'
import { State } from 'vuex-class'
import shortid from 'shortid'
import slug from '../../helpers/slug'
import { Site } from '../../store/modules/site'
import { UrlFormats } from '../../helpers/enums'
import { ITag } from '../../interfaces/tag'
import ga from '../../helpers/analytics'

@Component
export default class Tags extends Vue {
  @State('site') site!: Site

  visible = false

  isUpdate = false

  form = {
    name: null,
    slug: '',
    index: -1,
  }

  slugChanged = false

  get canSubmit() {
    return this.form.name
  }

  handleNameChange(val: string) {
    if (!this.slugChanged && this.site.themeConfig.tagUrlFormat === UrlFormats.Slug) {
      this.form.slug = slug(this.form.name)
    }
  }

  handleSlugChange(val: string) {
    this.slugChanged = !!val
  }

  close() {
    this.visible = false
  }

  newTag() {
    this.form.name = null
    this.form.index = -1
    this.form.slug = ''
    this.visible = true
    this.isUpdate = false
    if (this.site.themeConfig.tagUrlFormat === UrlFormats.ShortId) {
      this.form.slug = shortid.generate()
    }

    ga.event('Tags', 'Tags - new', { evLabel: this.site.setting.domain })
  }

  buildSlug() {
    if (this.form.slug === '') {
      if (this.site.themeConfig.tagUrlFormat === UrlFormats.Slug) {
        this.form.slug = slug(this.form.name)
      }
      if (this.site.themeConfig.tagUrlFormat === UrlFormats.ShortId) {
        this.form.slug = shortid.generate()
      }
    }
  }

  updateTag(tag: any, index: number) {
    console.log(tag)
    this.visible = true
    this.isUpdate = true
    this.form.name = tag.name
    this.form.slug = tag.slug
    this.form.index = index
  }

  /**
   * 检查标签合法性
   * 若是新增，则 slug 和 name 都不允许和已有的重复
   * 若是编辑，则 slug 和 name 都不允许和已有的其他标签重复
   */
  checkTagValid() {
    const siteTags = this.site.tags

    const tags = JSON.parse(JSON.stringify(siteTags))
    if (this.isUpdate) {
      tags.splice(this.form.index, 1)
    }


    const foundTagIndex = tags.findIndex((tag: ITag) => tag.name === this.form.name || tag.slug === this.form.slug)
    if (foundTagIndex !== -1) {
      return false
    }

    return true
  }

  saveTag() {
    this.buildSlug()

    const valid = this.checkTagValid()
    if (!valid) {
      this.$message.error('标签的名称或 URL 与其他标签重复')
      return
    }

    ipcRenderer.send('tag-save', { ...this.form, used: false })
    ipcRenderer.once('tag-saved', (event: IpcRendererEvent, result: any) => {
      this.$bus.$emit('site-reload')
      this.$message.success('标签已保存')
      this.visible = false

      ga.event('Tags', 'Tags - save', { evLabel: this.form.name })
    })
  }

  async handleDelete(tagValue: string) {
    this.$confirm({
      title: `${this.$t('warning')}`,
      content: `${this.$t('deleteWarning')}`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: () => {
        ipcRenderer.send('tag-delete', tagValue)
        ipcRenderer.once('tag-deleted', (event: IpcRendererEvent, result: any) => {
          this.$bus.$emit('site-reload')
          this.$message.success('标签已删除')
          this.visible = false
        })
      },
    })
  }
}
</script>

<style lang="less" scoped>
.content-container {
  background: transparent;
}

.tag-wrapper {
  display: inline-flex;
  margin-right: 24px;
  margin-bottom: 16px;
  align-items: center;
  border: 1px solid #e8e8e8;
  border-radius: 20px;
  transition: all 0.3s;
  &:hover {
    // box-shadow: 0 4px 6px -1px rgba(0,0,0,.1),0 2px 4px -1px rgba(0,0,0,.06)!important;
    @apply shadow-lg;
  }
  .tag {
    font-size: 12px;
    margin-right: 0px;
    border-radius: 0;
    padding: 6px 16px 6px 12px;
    cursor: default;
    &:not(:last-child) {
      cursor: pointer;
      border-right: 1px solid #e8e8e8;
    }
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
