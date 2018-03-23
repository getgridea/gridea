<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'hve',
    created() {
      this.$Message.config({
        duration: 3,
      })
    },
  }
</script>

<style>
  /* CSS */
</style>
