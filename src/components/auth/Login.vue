<template>
  <div>
    <div
      v-if="message"
      class="mb-2 message-root"
    >
      <div class="message-icon">
        <font-awesome-icon
          size="2x"
          :icon="[ 'fa', 'door-open' ]"
        />
      </div>
      <div class="message-content">
        {{ message }}
      </div>
    </div>
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
    },
    message: {
      default: 'Först måste du logga in.',
      type: String
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
  .message-root {
    display: flex;
  }
  .message-icon {
    flex: 0;
    opacity: 0.75;
  }
  .message-content {
    flex: 1;
    padding: 5px 0 0 15px;
  }
</style>
