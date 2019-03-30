<template>
  <div class="loading-page">
    配置中...
  </div>
</template>

<script>
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class Theme extends Vue {
  mounted() {
    setTimeout(() => {
      const { redirect } = this.$route.query
      this.$router.push(redirect)
    }, 1000)
  }
}
</script>

<style lang="less" scoped>
.loading-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
</style>
