<template>
  <div class="layout">
    <sidebar></sidebar>
    <div class="right">
      <div class="content">
        <router-view></router-view>
      </div>
      <div class="copy">
        2018 &copy; EryouHao
      </div>
    </div>
  </div>
</template>
<script>
import fse from 'fs-extra'
import { mapActions } from 'vuex'
import { setting, website } from '@/store/types'
import Sidebar from '@/components/common/Sidebar'

export default {
  components: {
    Sidebar,
  },
  data() {
    return {
      setting: null,
    }
  },
  async mounted() {
    // remote setting
    const config = this.$db.get('remote').value()
    this.acUpdateSetting(config)
    // website setting
    const siteConfig = await this.$site.get('config').value()
    const menus = await this.$site.get('menus').value()
    this.acUpdateWebsiteSetting(siteConfig)
    this.acUpdateWebsiteMenus(menus)

    this.setting = this.$store.state.setting
    await this.syncImages()
  },
  methods: {
    ...mapActions({
      acUpdateSetting: setting.actions.UPDATE_SETTING,
      acUpdateWebsiteSetting: website.actions.UPDATE_SETTING,
      acUpdateWebsiteMenus: website.actions.UPDATE_MENUS,
    }),
    // 检查源文件目录图片和应用图片目录是否一致，若不一致则同步图片，以源文件目录图片为准
    async syncImages() {
      // 文章图片
      const sourceImagesPath = `${this.setting.source}/post-images`
      const appImagesPath = `${__static}/post-images`
      const sourceImages = await fse.readdir(sourceImagesPath)
      const appImages = await fse.readdir(appImagesPath)

      if (sourceImages.length !== appImages.length) {
        await fse.emptyDir(appImagesPath)
        await fse.copySync(sourceImagesPath, appImagesPath)
      }

      // 头像
      const sourceAvatarPath = `${this.setting.source}/images`
      const appAvatarPath = `${__static}/images`
      const appAvatar = await fse.readdir(appAvatarPath)
      if (!appAvatar.length) {
        await fse.copy(sourceAvatarPath, appAvatarPath)
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.layout {
  background: #f5f7f9;
  position: relative;
  overflow: hidden;
  &.hide-text .text {
    display: none;
  }
  .right {
    min-height: 100vh;
    padding-left: 160px;
    display: flex;
    flex-direction: column;
    background: #f5f5f5;
    .content {
      display: flex;
      flex-direction: column;
      flex: 1;
      margin: 15px;
      overflow: hidden;
      background: #fff;
      border-radius: 4px;
      box-shadow: 0 0 3px #ccc;
    }
    .copy {
      text-align: center;
      padding: 10px 0 20px;
      color: #9ea7b4;
    }
  }
}
</style>