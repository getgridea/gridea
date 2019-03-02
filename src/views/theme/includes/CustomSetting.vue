<template>
  <div>
    <a-card>
      <a-button v-if="currentThemeConfig.length > 0" slot="extra" @click="saveThemeCustomConfig" type="primary">{{ $t('save') }}</a-button>
      <a-tabs tabPosition="left" v-if="currentThemeConfig.length > 0">
        <a-tab-pane :tab="group" v-for="(group, index) in groups" :key="index + 1">
          <div v-for="(item, index) in currentThemeConfig">
            <a-form-item v-if="item.group === group" :label="item.label">
              <a-input :placeholder="item.note" v-model="form[item.name]" />
            </a-form-item>
          </div>
        </a-tab-pane>
      </a-tabs>
      <div class="empty-container" v-else>
        <img class="icon" src="@/assets/images/graphic-empty-box.svg" alt="">
        <div class="description">当前主题暂无自定义配置</div>
      </div>
    </a-card>
  </div>
</template>

<script lang="ts">
import { ipcRenderer, Event, shell } from 'electron'
import { Vue, Component } from 'vue-property-decorator'
import { State } from 'vuex-class'
import { Site } from '../../../store/modules/site'

@Component
export default class Theme extends Vue {
  @State('site') site!: Site

  form: any = {}

  get groups() {
    let list = this.site.currentThemeConfig.map((item: any) => item.group)
    list = [...new Set(list)]
    return list
  }

  get currentThemeConfig() {
    return this.site.currentThemeConfig || []
  }

  mounted() {
    const keys = Object.keys(this.site.themeCustomConfig || {})
    keys.forEach((key: string) => {
      this.$set(this.form, key, this.site.themeCustomConfig[key])
    })
    this.currentThemeConfig.forEach((item: any) => {
      if (!this.form[item.name]) {
        this.$set(this.form, item.name, item.value)
      }
    })
  }

  openPage(url: string) {
    shell.openExternal(url)
  }

  saveThemeCustomConfig() {
    ipcRenderer.send('theme-custom-config-save', this.form)
    ipcRenderer.once('theme-custom-config-saved', (event: Event, result: any) => {
      this.$bus.$emit('site-reload')
      this.$message.success('主题自定义配置已保存')
    })
  }
}
</script>

<style lang="less" scoped>
/deep/ .ant-slider-rail {
  background: #e1e1e1;
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
</style>
