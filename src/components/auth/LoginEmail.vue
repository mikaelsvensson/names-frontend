<template>
  <div class="b-tooltips">
    <div v-if="isLoading">
      <p>Nu skickar vi en länk till dig...</p>
      <b-skeleton
        width="100%"
        animated
      />
    </div>
    <div
      v-if="isDone"
      class="mb-4"
    >
      <div v-if="isSuccess">
        <p>
          <strong>Gå till din inkorg</strong> för att hitta mejlet vi skickat.
          <strong>Klicka sedan på länken i mejlet</strong> för att logga in.
        </p>
        <p>Om du inte fått brevet inom ett par minuter så kan du försöka igen.</p>
      </div>
      <div v-if="!isSuccess">
        <p><strong>Oj, något gick fel.</strong></p>
        <p>Vi kunde inte skicka inloggningslänken till dig.</p>
        <p>Försök gärna igen om några minuter.</p>
      </div>
    </div>
    <div v-if="!isLoading">
      <div
        v-if="isInitial"
        style="display: flex"
      >
        <div style="flex: 1">
          <p>Logga in utan lösenord</p>
        </div>
        <div style="flex: 0">
          <b-tooltip
            type="is-light"
            position="is-left"
            multilined
          >
            <font-awesome-icon
              :style="{ color: '#ccc' }"
              :icon="[ 'fa', 'question-circle']"
            />
            <template v-slot:content>
              <div class="has-text-left">
                Du får en <strong>länk via e-post</strong> när du vill logga in.
                Klicka på länken för att logga in.
                <strong>Lösenord behövs inte.</strong>
              </div>
            </template>
          </b-tooltip>
        </div>
      </div>

      <b-field>
        <b-input
          v-model="emailAddress"
          placeholder="E-postadress"
          expanded
        />
        <p class="control">
          <b-button
            @click="startAuth()"
            type="is-primary"
          >
            <font-awesome-icon
              :icon="[ 'fa', 'arrow-right']"
            />
          </b-button>
        </p>
      </b-field>
    </div>
  </div>
</template>

<script>
const State = {
  NOT_SENT: 'NOT_SENT',
  SENDING: 'SENDING',
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE'
}

export default {
  name: "LoginEmail",
  inject: ['token', 'requestToken', 'startPolling', 'stopPolling'],
  data: function () {
    return {
      state: State.NOT_SENT,
      emailAddress: ''
    }
  },
  methods: {
    startAuth: async function () {
      this.state = State.SENDING
      try {
        const emailVerificationResp = await fetch(`${process.env.VUE_APP_BASE_URL}/token/email-verification`, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            emailAddress: this.emailAddress,
            redirectTo: this.$router.currentRoute.fullPath
          })
        })
        if (emailVerificationResp.ok) {
          // const newName = await emailVerificationResp.json()
          // await this.vote(newName.id, 100, this.token.value)
          // this.searchResult.push(newName)
          this.state = State.SUCCESS
          console.log('👍 Started authentication', emailVerificationResp)
          this.startPolling()
        } else {
          this.state = State.FAILURE
          console.log('💥 Failed to start authentication')
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
    this.stopPolling()
  }
}
</script>

<style scoped>

</style>
