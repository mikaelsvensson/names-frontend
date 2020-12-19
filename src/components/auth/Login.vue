<template>
  <div>
    <div v-if="!isLoggedIn()">
      <LoginFacebook
        @authenticator-data="logIn('FACEBOOK', $event)"
      />
    </div>
    <div v-if="isLoggedIn() && showLogout">
      <b-button
        type="is-light"
        @click="logOut()"
      >
        Logga ut
      </b-button>
    </div>
  </div>
</template>

<script>
import LoginFacebook from "@/components/auth/LoginFacebook";

export default {
  name: "Login",
  inject: ['token'],
  components: {LoginFacebook},
  props: {
    showLogout: {
      default: true,
      type: Boolean
    }
  },
  data: function () {
    return {
    }
  },
  methods: {
    logIn: async function (authName, authData) {
      console.log(`🔑 Log in using ${authName}`)
      const token = await this.getToken(authName, authData)
      this.token.value = token
    },
    logOut: function () {
      this.token.value = null
    },
    isLoggedIn: function () {
      return !!this.token.value
    },
    async getToken(authName, authData) {
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
      return tokenRespBody.token
    }
  }
}
</script>

<style scoped>

</style>
