<template>
  <div>
    <div v-if="isLoading">
      <p>{{ $t('login_email.sending_link') }}</p>
      <b-skeleton
        width="100%"
        animated
      />
    </div>
    <div
      v-if="isDone"
      class="mb-4"
    >
      <div
        v-if="isSuccess"
        class="content"
      >
        Du är inloggad
      </div>
    </div>
    <div v-if="!isLoading">
      <div class="content">
        <p>
          Ett tillfälligt anonymt konto har samma funktioner som ett vanligt konto men med vissa
          begränsningar:
        </p>
        <ul>
          <li>kontot fungerar bara på denna mobil eller dator</li>
          <li>kontot fungerar inte om du surfar i "inkognito-läge"</li>
          <li>kontot slutar fungera efter 30 dagar av inaktivitet</li>
        </ul>
      </div>
      <b-button
        @click="startAuth()"
        type="is-primary"
      >
        Logga in anonymt
      </b-button>
    </div>
  </div>
</template>

<script>

import AnonymousAuthenticatorMixins from "@/util/AnonymousAuthenticatorMixins";

const State = {
  NOT_SENT: 'NOT_SENT',
  SENDING: 'SENDING',
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE'
}

export default {
  name: "LoginAnonymous",
  inject: ['token'],
  mixins: [
    AnonymousAuthenticatorMixins
  ],
  data: function () {
    return {
      state: State.NOT_SENT
    }
  },
  methods: {
    startAuth: async function () {
      this.state = State.SENDING
      try {
        const createIdResp = await fetch(`${process.env.VUE_APP_BASE_URL}/anonymous-authenticator/id`, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
          }
        })
        if (createIdResp.ok) {
          const createIdRespBody = await createIdResp.json();
          this.setAnonymousAuthenticatorUserId(createIdRespBody.id)
          this.state = State.SUCCESS
          this.$emit('authenticator-data', this.getAnonymousAuthenticatorUserId())
        } else {
          this.state = State.FAILURE
        }
      } catch (e) {
        this.state = State.FAILURE
        console.log('💥', e)
      }
    }

  },
  computed: {
    isInitial() {
      return this.state === State.NOT_SENT
    },
    isLoading() {
      return this.state === State.SENDING
    },
    isDone() {
      return this.state === State.SUCCESS || this.state === State.FAILURE
    },
    isSuccess() {
      return this.state === State.SUCCESS
    }
  },
  unmounted: function () {
  },
  async created() {
    const id = this.getAnonymousAuthenticatorUserId()
    if (id) {
      this.$emit('authenticator-data', id)
    }
  }
}
</script>

<style scoped>

</style>
