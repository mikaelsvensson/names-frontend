<template>
  <div>
    <div
      v-if="translatedMessage"
      class="mb-2 message-root"
    >
      <div class="message-icon">
        <font-awesome-icon
          size="2x"
          :icon="[ 'fa', 'door-open' ]"
        />
      </div>
      <div class="message-content">
        {{ translatedMessage }}
      </div>
    </div>
    <div v-if="!isLoggedIn()">
      <div class="mt-4">
        <LoginFacebook
          @authenticator-data="logIn('FACEBOOK', $event)"
        />
      </div>
    </div>
    <div v-if="!isLoggedIn()">
      <div class="mt-4">
        <LoginEmail
          @authenticator-data="logIn('EMAIL', $event)"
        />
      </div>
    </div>
    <div v-if="isLoggedIn() && showLogout">
      <b-button
        type="is-light"
        @click="logOut()"
      >
        {{ $t('login.logout') }}
      </b-button>
    </div>
  </div>
</template>

<script>
import LoginFacebook from "@/components/auth/LoginFacebook";
import LoginEmail from "@/components/auth/LoginEmail";

export default {
  name: "Login",
  inject: ['token', 'requestToken'],
  components: {LoginEmail, LoginFacebook},
  props: {
    showLogout: {
      default: true,
      type: Boolean
    },
    message: {
      default: null,
      type: String
    }
  },
  data: function () {
    return {}
  },
  methods: {
    logIn: async function (authName, authData) {
      console.log(`🔑 Log in using ${authName}`)
      await this.requestToken(authName, authData)
    },
    logOut: function () {
      this.token.value = null
    },
    isLoggedIn: function () {
      return !!this.token.value
    }
  },
  computed: {
    translatedMessage: function () {
      return this.message || this.$t('login.login_required')
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
