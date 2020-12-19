<template>
  <div>
    <slot />
  </div>
</template>

<script>
export default {
  name: "TokenProvider",
  data() {
    const existingToken = window.localStorage.getItem('user.token');
    return {
      token: {
        value: existingToken
      }
    }
  },
  provide() {
    return {
      token: this.token
    }
  },
  watch: {
    'token.value': function (newValue) {
      console.log(`👻 Token changed to ${newValue}`)
      if (newValue) {
        window.localStorage.setItem('user.token', newValue);
      } else {
        window.localStorage.removeItem('user.token')
      }
    }
  }
}
</script>

<style scoped>

</style>
