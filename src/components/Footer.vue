<template>
  <footer class="footer">
    <div class="content has-text-centered">
      <b-button
        v-if="token.value"
        size="is-small"
        type="is-text"
        @click="logOut()"
      >
        Logga ut
      </b-button>
    </div>
  </footer>
</template>

<script>
export default {
  name: "Footer",
  inject: ['token'],
  methods: {
    logOut() {
      this.token.value = null
    }
  }
}
</script>

<style scoped>

</style>
