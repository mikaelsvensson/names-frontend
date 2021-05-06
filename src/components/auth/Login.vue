<template>
  <div>
    <div
      v-if="!selectedAuthenticator"
    >
      <div
        v-if="translatedMessage"
        class="mb-4 message-root"
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
      <div class="buttons">
        <button
          v-for="conf in components"
          :key="conf.componentName"
          class="button is-fullwidth"
          @click="selectedAuthenticator = conf"
        >
          <span class="icon">
            <font-awesome-icon
              :icon="conf.icon"
            />
          </span>
          <span class="button-label">{{ $t('login.authenticator.' + conf.authenticator.toLowerCase() + '.button') }}</span>
          <span class="icon">
            <font-awesome-icon
              :icon="['fas', 'angle-right']"
            />
          </span>
        </button>
      </div>
    </div>
    <div
      v-if="selectedAuthenticator"
    >
      <div class="mt-4">
        <component
          :is="selectedAuthenticator.componentName"
          @authenticator-data="logIn(selectedAuthenticator.authenticator, $event)"
        />
      </div>
      <div class="mt-4">
        <a @click="selectedAuthenticator = null">
          {{ $t('login.back') }}
        </a>
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
import LoginAnonymous from "@/components/auth/LoginAnonymous";

export default {
  name: "Login",
  inject: ['token', 'requestToken'],
  components: {LoginAnonymous, LoginEmail, LoginFacebook},
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
    return {
      selectedAuthenticator: null
    }
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
    },
    components: function () {
      return [
        {
          componentName: "LoginFacebook",
          icon: [ 'fab', 'facebook' ],
          authenticator: 'FACEBOOK'
        },
        {
          componentName: "LoginEmail",
          icon: [ 'fa', 'envelope' ],
          authenticator: 'EMAIL'
        },
        {
          componentName: "LoginAnonymous",
          icon: [ 'fa', 'user-ninja' ],
          authenticator: 'ANONYMOUS'
        }
      ]
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
    .buttons button span.button-label {
        flex: 1;
        text-align: start;
    }
    .buttons button {
        justify-content: start;
    }
</style>
