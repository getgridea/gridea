<template>
  <div class="footer-box bg-white py-2 px-4">
    <slot />
  </div>
</template>

<script lang="ts">
import {
  Vue, Component, Prop, Watch, Model,
} from 'vue-property-decorator'

@Component
export default class EmojiCard extends Vue {
}
</script>

<style lang="less" scoped>
.footer-box {
  border-top: 1px solid #e8e8e88a;
  position: fixed;
  left: 200px;
  right: 0;
  bottom: 0;
  z-index: 10;
}
</style>
