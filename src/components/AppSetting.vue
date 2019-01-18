<template>
  <div>
    <v-menu bottom right transition="slide-x-transition">
      <v-btn
        slot="activator"
        icon
      >
        <v-icon>more_vert</v-icon>
      </v-btn>

      <v-list>
        <v-list-tile @click="test">
          <v-list-tile-title>Language</v-list-tile-title>
        </v-list-tile>
      </v-list>
    </v-menu>

    <v-dialog v-model="languageVisible" width="400">
      <v-card>
        <v-card-title class="headline grey lighten-2">
          Language
        </v-card-title>
        <v-card-text>
          <v-radio-group v-model="currentLanguage">
            <v-radio label="简体中文" value="zhHans"></v-radio>
            <v-radio label="English" value="en"></v-radio>
          </v-radio-group>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" flat @click="saveLanguage">{{ $t('save') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

@Component
export default class App extends Vue {

  languageVisible = false
  currentLanguage = 'zhHans'

  mounted() {
    this.currentLanguage = localStorage.getItem('language') || 'zhHans'
  }
  test() {
    this.languageVisible = true
  }
  saveLanguage() {
    this.languageVisible = false
    localStorage.setItem('language', this.currentLanguage)
    this.$root.$i18n.locale = this.currentLanguage
  }
}
</script>

<style lang="stylus" scoped>
</style>
