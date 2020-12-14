<template>
  <div>
    <div v-if="mode === 'NOT_LOGGED_IN'">
      <LoginFacebook
        @authenticator-data="logIn('FACEBOOK', $event)"
      />
    </div>
    <div v-if="mode === 'LOGGED_OUT'">
      <LoginFacebook @authenticator-data="logIn('FACEBOOK', $event)" />
    </div>
    <div v-if="mode === 'LOGGED_IN' && showLogout">
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

const MODE = {
  UNKNOWN: 'UNKNOWN',
  NOT_LOGGED_IN: 'NOT_LOGGED_IN',
  LOGGED_IN: 'LOGGED_IN',
  LOGGED_OUT: 'LOGGED_OUT'
}

export const Modes = Object.keys(MODE).reduce((types, key) => ({...types, [key]: key}), {})

export default {
  name: "Login",
  components: {LoginFacebook},
  props: {
    showLogout: {
      default: true,
      type: Boolean
    }
  },
  data: function () {
    return {
      mode: MODE.UNKNOWN
    }
  },
  created: function () {
    const token = window.localStorage.getItem('user.token');
    if (token) {
      this.mode = MODE.LOGGED_IN
    } else {
      this.mode = MODE.NOT_LOGGED_IN
    }
  },
  methods: {
    logIn: async function (authName, authData) {
      console.log(`🔑 Log in using ${authName}`)
      const token = await this.getToken(authName, authData)
      window.localStorage.setItem('user.token', token);
      this.mode = MODE.LOGGED_IN
    },
    logOut: function () {
      window.localStorage.removeItem('user.token')
      this.mode = MODE.LOGGED_OUT
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
  },
  watch: {
    mode: function (newMode) {
      this.$emit('mode', newMode)
      console.log(`🔑 Mode changed to ${newMode}`)
    }
  }
}
</script>

<style scoped>

</style>
