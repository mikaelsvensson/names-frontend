<template>
  <footer class="footer">
    <div class="content has-text-centered">
      <p class="is-size-7">
        <router-link to="/profile">{{ $t('profile.title') }}</router-link>.
        <router-link to="/about">{{ $t('about.title') }}</router-link>.
        <router-link to="/about/privacy">{{ $t('privacy_policy.title') }}</router-link>.
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
