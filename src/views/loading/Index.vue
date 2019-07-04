<template>
  <div class="loading-page">
    <img class="img" src="@/assets/images/developing_code.svg" width="160px">
    {{ $t('inConfig') }}...
  </div>
</template>

<script>
import { Vue, Component } from 'vue-property-decorator'

@Component({
  name: 'Loading',
})
export default class Loading extends Vue {
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
  flex-direction: column;
  min-height: 100vh;
  .img {
    margin-bottom: 16px;
  }
}
</style>
