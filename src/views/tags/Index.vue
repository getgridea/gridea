<template>
  <div class="">
    <v-card flat>
      <v-card-title>
        <span class="headline">🏷️ {{ $t('tag') }}</span>
        <v-spacer></v-spacer>
        <v-btn depressed color="primary" @click="newTag">{{ $t('newTag') }}</v-btn>
      </v-card-title>
      <v-card-text>
        <v-chip
          small
          @click.stop="tag.used ? null : updateTag(tag, index)"
          v-for="(tag, index) in site.tags"
          :key="tag.name"
          :close="!tag.used"
          @input="handleDelete(tag.name)"
        >
          {{ tag.name }}
        </v-chip>
      </v-card-text>
    </v-card>

    <v-dialog v-model="visible" :width="320">
      <v-card>
        <v-card-title>
          🏷️ {{ $t('tag') }}
        </v-card-title>
        <v-card-text>
          <v-text-field :label="$t('tagName')" v-model="form.name" @input="handleNameChange"></v-text-field>
          <v-text-field label="标签 URL" v-model="form.slug" @input="handleSlugChange"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat @click="visible = false">{{ $t('cancel') }}</v-btn>
          <v-btn flat color="primary" :disabled="!canSubmit" @click="saveTag">{{ $t('save') }}</v-btn>
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
import shortid from 'shortid'
import slug from '../../helpers/slug'
import { Site } from '../../store/modules/site'
import { UrlFormats } from '../../helpers/enums'
import { ITag } from '../../interfaces/tag'

@Component
export default class Tags extends Vue {
  @State('site') site!: Site

  visible = false

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

  newTag() {
    this.form.name = null
    this.form.index = -1
    this.form.slug = ''
    this.visible = true
    if (this.site.themeConfig.tagUrlFormat === UrlFormats.ShortId) {
      this.form.slug = shortid.generate()
    }
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
    this.form.name = tag.name
    this.form.slug = tag.slug
    this.form.index = index
  }

  /**
   * 检查标签合法性
   */
  checkTagValid() {
    const siteTags = this.site.tags
    const foundTagIndex = siteTags.findIndex((tag: ITag) => tag.name === this.form.name || tag.slug === this.form.slug)
    if (foundTagIndex !== -1) {
      // 若是新增，则 slug 和 name 都不允许和已有的重复
      if (this.form.index === -1) {
        return false
      } else {
        // 若是编辑，则 slug 和 name 都不允许和已有的其他标签重复
        const restTags = JSON.parse(JSON.stringify(siteTags))
        restTags.splice(foundTagIndex, 1)
        const index = restTags.findIndex((tag: ITag) => tag.name === this.form.name || tag.slug === this.form.slug)
        if (index !== -1) {
          return false
        }
      }
    }
    return true
  }

  saveTag() {
    this.buildSlug()

    const valid = this.checkTagValid()
    if (!valid) {
      this.$bus.$emit('snackbar-display', { color: 'pink', message: '标签的名称或 URL 与其他标签重复' })
      return
    }

    ipcRenderer.send('tag-save', { ...this.form, used: false })
    ipcRenderer.once('tag-saved', (event: Event, result: any) => {
      this.$bus.$emit('site-reload')
      this.$bus.$emit('snackbar-display', '标签已保存')
      this.visible = false
    })
  }
  async handleDelete(tagValue: string) {
    const confirm = await this.$dialog.confirm({
      text: `${this.$t('deleteWarning')}`,
      title: `${this.$t('warning')}`,
    })
    if (confirm) {
      console.log('clicked', tagValue)
      ipcRenderer.send('tag-delete', tagValue)
      ipcRenderer.once('tag-deleted', (event: Event, result: any) => {
        this.$bus.$emit('site-reload')
        this.$bus.$emit('snackbar-display', '标签已删除')
        this.visible = false
      })
    }
  }
}
</script>

<style scoped>
</style>
