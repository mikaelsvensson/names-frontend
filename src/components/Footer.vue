<template>
  <footer class="footer">
    <div class="content has-text-centered">
      <p class="is-size-7">
        <router-link
          to="/profile"
          v-html="$t('profile.title')"
        />.
        <router-link
          to="/about"
          v-html="$t('about.title')"
        />.
        <router-link
          to="/about/privacy"
          v-html="$t('privacy_policy.title')"
        />.
      </p>
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
