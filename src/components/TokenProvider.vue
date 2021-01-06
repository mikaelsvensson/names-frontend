<template>
  <div>
    <slot />
  </div>
</template>

<script>
let pollTimer = null
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
      token: this.token,
      requestToken: this.requestToken,
      startPolling: this.startPolling,
      stopPolling: this.stopPolling
    }
  },
  methods: {
    requestToken: async function (authName, authData) {
      const tokenResp = await fetch(`${process.env.VUE_APP_BASE_URL}/token`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({provider: authName, data: authData})
      })
      const tokenRespBody = await tokenResp.json();
      console.log('🔑 Token returned from API')
      this.token.value = tokenRespBody.token
    },
    startPolling: function () {
      console.log('⏱ Start polling')
      const that = this
      pollTimer = setInterval(function () {
        const existingToken = window.localStorage.getItem('user.token');
        if (existingToken) {
          console.log('⏱ Found token')
          that.token.value = existingToken
          that.stopPolling()
        }
      }, 1000)
    },
    stopPolling: function () {
      console.log('⏱ Stop polling')
      clearInterval(pollTimer)
    }
  },
  watch: {
    'token.value': function (newValue) {
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
