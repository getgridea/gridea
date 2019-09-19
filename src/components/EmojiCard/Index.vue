<template>
  <div class="emoji-card">
    <VEmojiPicker :pack="pack" :showSearch="false" :emojisByRow="8" @select="handleSelect" />
  </div>
</template>

<script lang="ts">
import {
  Vue, Component, Prop, Watch, Model,
} from 'vue-property-decorator'
import VEmojiPicker from 'v-emoji-picker'
import packData from 'v-emoji-picker/data/emojis.json'

@Component({
  components: {
    VEmojiPicker,
  },
})
export default class EmojiCard extends Vue {
  pack = packData

  handleSelect(emojiData: any) {
    this.$emit('select', emojiData.emoji)
  }
}
</script>

<style lang="less" scoped>
.emoji-card {
  margin: -14px -17px;
}
/deep/ #EmojiPicker {
  background: #fff;
  color: #000;
  #Categories {
    background: #fff;
    border-bottom: 1px solid #efefef;
  }
  .category {
    transition: all 0.3s ease;
    cursor: default;
    &:hover {
      background: #efefef;
    }
  }
  .category.active {
    border-bottom: 2px solid #000;
    padding-bottom: 3px;
  }

  ::-webkit-scrollbar {
    background-color: #fff;
  }

  ::-webkit-scrollbar-thumb {
    background-color: #eee;
    opacity: 0.7;
  }
  .emoji {
    cursor: default;
    width: 40px;
    height: 40px;
    line-height: 44px;
    padding: 0;
    border-radius: 8px;
    transition: all 0.3s ease;
    max-height: none;
    &:hover {
      background: #efefef;
    }
  }
  #VSvg {
    line-height: 16px;
  }
}
</style>
