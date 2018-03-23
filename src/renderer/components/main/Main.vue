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
  async created() {
    // remote setting
    const config = this.$db.get('remote').value()
    this.acUpdateSetting(config)
    // website setting
    const siteConfig = this.$site.get('config').value()
    const menus = this.$site.get('menus').value()
    this.acUpdateWebsiteSetting(siteConfig)
    this.acUpdateWebsiteMenus(menus)

    this.setting = this.$store.state.setting
    await this.syncImages()
    console.log(this.$route.path)
  },
  methods: {
    ...mapActions({
      acUpdateSetting: setting.actions.UPDATE_SETTING,
      acUpdateWebsiteSetting: website.actions.UPDATE_SETTING,
      acUpdateWebsiteMenus: website.actions.UPDATE_MENUS,
    }),
    async syncImages() {
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