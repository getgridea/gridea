<template>
  <div class="">
    <v-tabs
      v-model="active"
      dark
      slider-color="white"
    >
      <v-tab ripple>️️️⚙️ {{ $t('basicSetting') }}</v-tab>
      <v-tab ripple>💬 {{ $t('gitalkSetting') }}</v-tab>
      <v-tab ripple>🌅 {{ $t('faviconSetting') }}</v-tab>
      <v-tab ripple>🤠 {{ $t('avatarSetting') }}</v-tab>
      <v-tab-item>
        <basic-setting></basic-setting>
      </v-tab-item>
      <v-tab-item>
        <gitalk-setting></gitalk-setting>
      </v-tab-item>
      <v-tab-item>
        <favicon-setting></favicon-setting>
      </v-tab-item>
      <v-tab-item>
        <avatar-setting></avatar-setting>
      </v-tab-item>
    </v-tabs>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import BasicSetting from './includes/BasicSetting.vue'
import GitalkSetting from './includes/GitalkSetting.vue'
import FaviconSetting from './includes/FaviconSetting.vue'
import AvatarSetting from './includes/AvatarSetting.vue'

@Component({
  components: {
    BasicSetting,
    GitalkSetting,
    FaviconSetting,
    AvatarSetting,
  },
})
export default class Setting extends Vue {
  active = null
}
</script>

<style lang="stylus" scoped>
>>> .v-card:before
  background: none;
</style>
