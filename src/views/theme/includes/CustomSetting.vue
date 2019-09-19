<template>
  <div>
    <a-card v-if="currentThemeConfig.length > 0" :bordered="false">
      <a-button style="margin-right: 16px;" slot="extra" @click="resetThemeCustomConfig">{{ $t('reset') }}</a-button>
      <a-button slot="extra" @click="saveThemeCustomConfig" type="primary">{{ $t('save') }}</a-button>
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
                <color-card slot="content" @change="handleColorChange($event, index1, item.name)"></color-card>
                <a-input :ref="`color${index1}`" v-if="item.type === 'input' && item.card === 'color'" :placeholder="item.note" v-model="form[item.name]" />
              </a-popover>

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

              <a-textarea v-if="item.type === 'textarea'" v-model="form[item.name]" :placeholder="item.note" :autosize="{ minRows: 2, maxRows: 32 }" />

            </a-form-item>
          </div>
        </a-tab-pane>
      </a-tabs>
    </a-card>
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
import { Site } from '../../../store/modules/site'
import ColorCard from '../../../components/ColorCard.vue'

@Component({
  name: 'ThemeCustomSetting',
  components: {
    ColorCard,
  },
})
export default class ThemeCustomSetting extends Vue {
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

  activeKey = 1

  mounted() {
    this.loadCustomConfig()
  }

  activated() {
    this.loadCustomConfig()
  }

  loadCustomConfig() {
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
    ipcRenderer.once('theme-custom-config-saved', (event: IpcRendererEvent, result: any) => {
      this.$bus.$emit('site-reload')
      this.$message.success(this.$t('saved'))
    })
  }

  resetThemeCustomConfig() {
    ipcRenderer.send('theme-custom-config-save', {})
    ipcRenderer.once('theme-custom-config-saved', async (event: IpcRendererEvent, result: any) => {
      await this.$bus.$emit('site-reload')
      this.$router.push({ name: 'loading', query: { redirect: 'theme?tab=custom' } })
      this.$message.success(this.$t('reseted'))
    })
  }

  handleColorChange(color: string, index: number, name: string) {
    this.form[name] = color
    console.log(color)
  }
}
</script>

<style lang="less" scoped>
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
