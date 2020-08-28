<template>
  <div>
    <div v-if="currentThemeConfig.length > 0" style="padding-bottom: 48px;">
      <a-tabs tabPosition="left" defaultActiveKey="1" v-model="activeKey">
        <a-tab-pane :tab="group" v-for="(group, index) in groups" :key="index + 1">
          <div v-for="(item, index1) in currentThemeConfig" :key="index1">
            <a-form-item v-if="item.group === group" :label="item.label" :colon="false" :help="item.note">

              <!-- 普通输入 -->
              <a-input v-if="item.type === 'input' && !item.card" :placeholder="item.note" v-model="form[item.name]" />

              <!-- 带颜色卡片输入 -->
              <a-popover
                title="Color"
                trigger="click"
                placement="bottomLeft"
              >
                <color-card slot="content" @change="handleColorChange($event, item.name)"></color-card>
                <a-input :ref="`color${index1}`" v-if="item.type === 'input' && item.card === 'color'" :placeholder="item.note" v-model="form[item.name]">
                  <div class="w-4 h-4 rounded-full" slot="prefix" v-if="form[item.name]" :style="{ backgroundColor: form[item.name] }"></div>
                </a-input>
              </a-popover>
              
              <!-- 带文章卡片输入 -->
              <a-popover
                title="文章"
                trigger="click"
                placement="bottomLeft"
              >
                <posts-card slot="content" :posts="postsWithLink" @select="handlePostSelected($event, item.name)"></posts-card>
                <a-input :ref="`color${index1}`" v-if="item.type === 'input' && item.card === 'post'" :placeholder="item.note" v-model="form[item.name]" />
              </a-popover>
              <div class="tip-text mb-1" v-if="item.type === 'input' && item.card === 'post' && form[item.name]">{{ getPostTitleByLink(form[item.name]) }}</div>

              <!-- 下拉选择 -->
              <a-select v-if="item.type === 'select'" v-model="form[item.name]" style="width: 100%;">
                <a-select-option v-for="(option, index2) in item.options" :key="index2" :value="option.value">{{ option.label }}</a-select-option>
              </a-select>

              <!-- 单选组合 -->
              <a-radio-group v-if="item.type === 'radio'" v-model="form[item.name]">
                <a-radio v-for="(option, index2) in item.options" :key="index2" :value="option.value">{{ option.label }}</a-radio>
              </a-radio-group>

              <!-- switch 类型 -->
              <a-switch v-if="item.type === 'switch'" v-model="form[item.name]"/>

              <!-- textarea 类型 -->
              <a-textarea v-if="item.type === 'textarea'" v-model="form[item.name]" :placeholder="item.note" :autosize="{ minRows: 2, maxRows: 32 }" />

              <!-- picture-upload 类型 -->
              <div v-if="item.type === 'picture-upload'" style="display: flex;">
                <a-upload
                  action=""
                  listType="picture-card"
                  class="feature-uploader"
                  :showUploadList="false"
                  :beforeUpload="file => beforeImageUpload(file, item.name)"
                >
                  <div v-if="form[item.name] && form[item.name].startsWith('/media/')">
                    <img class="picture" :src="`file://${site.appDir}/themes/${site.themeConfig.themeName}/assets${form[item.name]}`" height="150" />
                  </div>
                  <div v-else-if="form[item.name] === ''">
                    <img src="@/assets/images/image_upload.svg" class="picture">
                    <i class="zwicon-upload upload-icon"></i>
                  </div>
                  <div v-else>
                    <img class="picture" :src="`file://${form[item.name]}`" alt="">
                  </div>
                </a-upload>
                <a-tooltip placement="left" title="Reset">
                  <a-button style="margin-left: 8px;" v-if="form[item.name]" shape="circle" site="small" @click="resetFormItem(item.name)">
                    <i class="zwicon-undo"></i>
                  </a-button>
                </a-tooltip>
              </div>

              <!-- Markdown 类型 -->
              <div v-if="item.type === 'markdown'" class="shadow p-4">
                <monaco-markdown-editor ref="monacoMarkdownEditor" v-model="form[item.name]"></monaco-markdown-editor>
              </div>

              <!-- array 类型 -->
              <div v-if="item.type === 'array'">
                <div class="item-card" v-for="(configItem, configItemIndex) in form[item.name]" :key="configItemIndex">
                  <div v-for="(field, fieldIndex) in item.arrayItems" :key="fieldIndex">
                    <a-form-item :label="field.label" :colon="false" :help="field.note" :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper">
                      <!-- 普通输入 -->
                      <a-input v-if="field.type === 'input' && !field.card" :placeholder="field.note" v-model="configItem[field.name]" />

                      <!-- 带颜色卡片输入 -->
                      <a-popover
                        title="Color"
                        trigger="click"
                        placement="bottomLeft"
                      >
                        <color-card slot="content" @change="handleColorChange($event, item.name, configItemIndex, field.name)"></color-card>
                        <a-input :ref="`color-${configItemIndex}-${fieldIndex}`" v-if="field.type === 'input' && field.card === 'color'" :placeholder="field.note" v-model="configItem[field.name]">
                          <div class="w-4 h-4 rounded-full" slot="prefix" v-if="configItem[field.name]" :style="{ backgroundColor: configItem[field.name] }"></div>
                        </a-input>
                      </a-popover>

                      <!-- 带文章卡片输入 -->
                      <a-popover
                        title="文章"
                        trigger="click"
                        placement="bottomLeft"
                      >
                        <posts-card slot="content" :posts="postsWithLink" @select="handlePostSelected($event, item.name, configItemIndex, field.name)"></posts-card>
                        <a-input :ref="`color-${configItemIndex}-${fieldIndex}`" v-if="field.type === 'input' && field.card === 'post'" :placeholder="field.note" v-model="configItem[field.name]" />
                      </a-popover>
                      <div class="tip-text mb-1" v-if="field.type === 'input' && field.card === 'post' && configItem[field.name]">{{ getPostTitleByLink(configItem[field.name]) }}</div>

                      <!-- 下拉选择 -->
                      <a-select v-if="field.type === 'select'" v-model="configItem[field.name]" style="width: 100%;">
                        <a-select-option v-for="(option, index2) in field.options" :key="index2" :value="option.value">{{ option.label }}</a-select-option>
                      </a-select>

                      <!-- 单选组合 -->
                      <a-radio-group v-if="field.type === 'radio'" v-model="configItem[field.name]">
                        <a-radio v-for="(option, index2) in field.options" :key="index2" :value="option.value">{{ option.label }}</a-radio>
                      </a-radio-group>

                      <!-- switch 类型 -->
                      <a-switch v-if="field.type === 'switch'" v-model="configItem[field.name]"/>

                      <!-- textarea 类型 -->
                      <a-textarea v-if="field.type === 'textarea'" v-model="configItem[field.name]" :placeholder="field.note" :autosize="{ minRows: 2, maxRows: 32 }" />

                      <!-- picture-upload 类型 -->
                      <div v-if="field.type === 'picture-upload'" style="display: flex;">
                        <a-upload
                          action=""
                          listType="picture-card"
                          class="feature-uploader"
                          :showUploadList="false"
                          :beforeUpload="file => beforeImageUpload(file, item.name, field.name, configItemIndex)"
                        >
                          <div v-if="configItem[field.name] && configItem[field.name].startsWith('/media/')">
                            <img class="picture" :src="`file://${site.appDir}/themes/${site.themeConfig.themeName}/assets${configItem[field.name]}`" height="150" />
                          </div>
                          <div v-else-if="configItem[field.name] === ''">
                            <img src="@/assets/images/image_upload.svg" class="picture">
                            <i class="zwicon-upload upload-icon"></i>
                          </div>
                          <div v-else>
                            <img class="picture" :src="`file://${configItem[field.name]}`" alt="">
                          </div>
                        </a-upload>
                        <a-tooltip placement="left" title="Reset">
                          <a-button style="margin-left: 8px;" v-if="configItem[field.name]" shape="circle" site="small" @click="resetFormItem(item.name, field.name, configItemIndex)">
                            <i class="zwicon-undo"></i>
                          </a-button>
                        </a-tooltip>
                      </div>

                      <!-- Markdown 类型 -->
                      <div v-if="field.type === 'markdown'" class="shadow p-4">
                        <monaco-markdown-editor ref="monacoMarkdownEditor" v-model="configItem[field.name]"></monaco-markdown-editor>
                      </div>
                    </a-form-item>
                  </div>

                  <a-button shape="circle" @click="addConfigItem(form[item.name], configItemIndex, item.arrayItems)" style="margin-right: 8px;"><i class="zwicon-plus"></i></a-button>
                  <a-button shape="circle" @click="deleteConfigItem(form[item.name], configItemIndex)"><i class="zwicon-minus"></i></a-button>
                </div>

                <a-button v-if="!form[item.name] || form[item.name].length === 0" block @click="addConfigItem(form[item.name], 0, item.arrayItems)"><i class="zwicon-plus"></i></a-button>
              </div>

            </a-form-item>
          </div>
        </a-tab-pane>
      </a-tabs>
      <footer-box>
        <div class="flex justify-between">
          <a-button @click="resetThemeCustomConfig">
            <i class="zwicon-undo"></i>
          </a-button>
          <a-button @click="saveThemeCustomConfig" type="primary">{{ $t('save') }}</a-button>
        </div>
      </footer-box>
    </div>
    <div class="empty-container" v-else>
      <img class="icon" src="@/assets/images/graphic-empty-box.svg" alt="">
      <div class="description">{{ $t('noCustomConfigTip') }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { ipcRenderer, IpcRendererEvent, shell } from 'electron'
import { Vue, Component } from 'vue-property-decorator'
import { State } from 'vuex-class'
import urlJoin from 'url-join'
import { Site } from '../../../store/modules/site'
import MonacoMarkdownEditor from '../../../components/MonacoMarkdownEditor/Index.vue'
import FooterBox from '../../../components/FooterBox/Index.vue'
import ColorCard from '../../../components/ColorCard/Index.vue'
import PostsCard from '../../../components/PostsCard/Index.vue'

@Component({
  name: 'ThemeCustomSetting',
  components: {
    MonacoMarkdownEditor,
    FooterBox,
    ColorCard,
    PostsCard,
  },
})
export default class ThemeCustomSetting extends Vue {
  @State('site') site!: Site

  formLayout = {
    label: { span: 6 },
    wrapper: { span: 12 },
  }

  form: any = {}

  get groups() {
    let list = this.site.currentThemeConfig.map((item: any) => item.group)
    list = [...new Set(list)]
    return list
  }

  get currentThemeConfig() {
    return this.site.currentThemeConfig || []
  }

  get postsWithLink() {
    const list = this.site.posts.map((post: any) => {
      return {
        ...post,
        link: urlJoin(this.site.setting.domain, this.site.themeConfig.postPath, post.fileName, '/'),
      }
    }).filter((post: any) => post.data.published)
    
    return list
  }

  activeKey = 1

  mounted() {
    this.loadCustomConfig()
  }

  activated() {
    this.loadCustomConfig()
  }

  getPostTitleByLink(link: string) {
    const foundPost = this.postsWithLink.find((post: any) => post.link === link)
    return (foundPost && foundPost.data.title) || ''
  }

  loadCustomConfig() {
    const keys = Object.keys(this.site.themeCustomConfig || {})
    keys.forEach((key: string) => {
      this.$set(this.form, key, this.site.themeCustomConfig[key])
    })
    this.currentThemeConfig.forEach((item: any) => {
      if (this.form[item.name] === undefined) {
        this.$set(this.form, item.name, item.value)
      }
    })
  }

  openPage(url: string) {
    shell.openExternal(url)
  }

  saveThemeCustomConfig() {
    console.log('this.form', this.form)
    ipcRenderer.send('theme-custom-config-save', this.form)
    ipcRenderer.once('theme-custom-config-saved', (event: IpcRendererEvent, result: any) => {
      this.$bus.$emit('site-reload')
      this.$message.success(this.$t('saved'))
    })
  }

  resetThemeCustomConfig() {
    this.$confirm({
      title: '重置',
      content: '此操作将会使该主题配置恢复到初始状态，确认重置吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        ipcRenderer.send('theme-custom-config-save', {})
        ipcRenderer.once('theme-custom-config-saved', async (event: IpcRendererEvent, result: any) => {
          await this.$bus.$emit('site-reload')
          this.$router.push({ name: 'loading', query: { redirect: 'theme?tab=custom' } })
          this.$message.success(this.$t('reseted'))
        })
      },
    })
  }

  handleColorChange(color: string, name: string, arrayIndex?: number, fieldName?: string) {
    if (arrayIndex === undefined) {
      this.form[name] = color
    } else if (arrayIndex !== undefined && fieldName !== undefined) {
      this.form[name][arrayIndex][fieldName] = color
    }
  }

  handlePostSelected(postUrl: string, name: string, arrayIndex?: number, fieldName?: string) {
    console.log('postUrl', postUrl)
    if (arrayIndex === undefined) {
      this.form[name] = postUrl
    } else if (arrayIndex !== undefined && fieldName !== undefined) {
      this.form[name][arrayIndex][fieldName] = postUrl
    }
  }

  beforeImageUpload(file: any, formItemName: string, arrayFieldItemName?: string, configItemIndex?: number) {
    if (!file) {
      return
    }

    if (arrayFieldItemName && typeof configItemIndex === 'number') {
      this.form[formItemName][configItemIndex][arrayFieldItemName] = file.path
      return false
    }

    this.form[formItemName] = file.path
    return false
  }

  resetFormItem(formItemName: string, arrayFieldItemName?: string, configItemIndex?: number) {
    const originalItem = this.currentThemeConfig.find((item: any) => item.name === formItemName)
    if (arrayFieldItemName && typeof configItemIndex === 'number') {
      const foundItem = originalItem.arrayItems.find((item: any) => item.name === arrayFieldItemName)
      this.form[formItemName][configItemIndex][arrayFieldItemName] = foundItem.value
    } else {
      this.form[formItemName] = originalItem.value
    }
  }

  deleteConfigItem(formItem: any[], index: number) {
    console.log('run...', formItem, index)
    formItem.splice(index, 1)
  }

  addConfigItem(formItem: any[], index: number, arrayItems: any) {
    const newValue = arrayItems.reduce((o: any, c: any) => {
      o[c.name] = c.value
      return o
    }, {})
    formItem.splice(index + 1, 0, newValue)
  }
}
</script>

<style lang="less" scoped>
.top-container {
  display: flex;
  justify-content: space-between;
  padding-bottom: 24px;
}
.empty-container {
  text-align: center;
  padding: 40px 0;
  .icon {
    width: 48px;
  }
  .description {
    font-size: 16px;
    padding: 24px;
    color: #8c8c8c;
  }
}

.picture {
  height: 150px;
}

.item-card {
  margin-bottom: 24px;
  padding: 24px;
  box-shadow: 0 1px 3px 0 rgba(0,0,0,.1),0 1px 2px 0 rgba(0,0,0,.06);
  border-radius: 2px;
}

/deep/ .ant-slider-rail {
  background: #e1e1e1;
}

/deep/ .ant-card {
  background: transparent;
}
/deep/ .ant-card-head {
  border-bottom: none;
}

/deep/ .ant-tabs-nav .ant-tabs-tab-active {
  color: #434343;
  border-radius: 4px 0 0 4px;
  &::after {
    display: none;
  }
}

/deep/ .ant-tabs .ant-tabs-left-bar .ant-tabs-ink-bar, .ant-tabs .ant-tabs-right-bar .ant-tabs-ink-bar {
  width: 1px;
}
</style>
