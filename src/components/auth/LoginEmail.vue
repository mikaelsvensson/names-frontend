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
        <i18n
          path="login_email.check_inbox.sentence"
          tag="p"
        >
          <template #strong_1>
            <strong
              v-html="$t('login_email.check_inbox.strong_1')"
            />
          </template>
          <template #strong_2>
            <strong
              v-html="$t('login_email.check_inbox.strong_2')"
            />
          </template>
        </i18n>

        <p>{{ $t('login_email.wait_a_few_minutes') }}</p>
      </div>
      <Notification
        type="WARNING"
        v-if="!isSuccess"
      >
        <p><strong>{{ $t('login_email.error.paragraph_1') }}</strong></p>
        <p>{{ $t('login_email.error.paragraph_2') }}</p>
        <p>{{ $t('login_email.error.paragraph_3') }}</p>
      </Notification>
    </div>
    <div v-if="!isLoading">
      <b-field>
        <b-input
          v-model="emailAddress"
          :placeholder="$t('login_email.input_field.placeholder')"
          expanded
        />
      </b-field>

      <div class="control">
        <b-button
          @click="startAuth()"
          type="is-primary"
        >
          {{ $t('login_email.send_link') }}
        </b-button>
      </div>

      <div
        v-if="isInitial"
        class="content my-4"
      >
        <i18n
          path="login_email.instructions.sentence"
          tag="p"
        >
          <template #strong_1>
            <strong
              v-html="$t('login_email.instructions.strong_1')"
            />
          </template>
          <template #strong_2>
            <strong
              v-html="$t('login_email.instructions.strong_2')"
            />
          </template>
        </i18n>
      </div>
    </div>
  </div>
</template>

<script>
import Notification from "@/components/Notification";

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
  components: {Notification},
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
