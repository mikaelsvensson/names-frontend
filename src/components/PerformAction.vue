<template>
  <div>
    <section>
      <div v-if="isLoading">
        <b-skeleton
          width="20%"
          :animated="true"
        />
      </div>
      <div v-if="!isLoading">
        <Notification
          :type="notification.type"
          v-if="notification.message"
        >
          <div>
            {{ notification.message }}
          </div>
          <div v-if="isLoginRequired">
            <div class="mt-2">
              <Login :show-logout="false" />
            </div>
          </div>
        </Notification>
      </div>
    </section>
  </div>
</template>

<script>

import ComponentMixins from "@/util/ComponentMixins";
import Login from "@/components/auth/Login";
import Notification, {Types} from "@/components/Notification";

export default {
  name: 'PerformAction',
  inject: ['token', 'requestToken'],
  components: {Login, Notification},
  data: function () {
    return {
      isLoading: false,
      isRetried: false,
      isError: false,
      notification: {
        type: null,
        message: null
      },
      isLoginRequired: false
    };
  },
  mixins: [
    ComponentMixins
  ],
  methods: {
    setMessage(type, message) {
      this.notification = { type, message }
    },
    async performAction () {
      const actionId = this.$route.params.actionId;
      if (actionId) {
        this.isLoading = true
        try {
          const token = this.token.value;
          const actionResp = await fetch(`${process.env.VUE_APP_BASE_URL}/actions/${actionId}/invocation`, {
            method: 'POST',
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? {'Authorization': 'Bearer ' + token} : {})
            }
          })
          this.isError = !actionResp.ok
          if (!this.isError) {
            const updatedAction = await actionResp.json()
            if (updatedAction.type === 'ADD_RELATIONSHIP') {
              this.setMessage(Types.SUCCESS, this.$t('perform_action.success_add_relationship'))
            } else if (updatedAction.type === 'VERIFY_EMAIL') {
              this.setMessage(Types.SUCCESS, this.$t('perform_action.success_verify_email'))
              this.isRetried = true
              await this.requestToken('EMAIL', updatedAction.token)

              if (updatedAction.redirectTo) {
                await this.$router.push(updatedAction.redirectTo)
              }
            } else {
              this.setMessage(Types.SUCCESS, this.$t('perform_action.success_generic'))
            }
          } else {
            if (actionResp.status === 404) {
              this.setMessage(Types.INFO, this.$t('perform_action.info_link_expired'))
            } else if (actionResp.status === 401) {
              this.setMessage(Types.INFO, this.$t('perform_action.info_login_required'))
              this.isError = false
              this.isLoginRequired = true
            } else if (actionResp.status === 410) {
              this.setMessage(Types.ERROR, this.$t('perform_action.error_already_used'))
            } else {
              this.setMessage(Types.ERROR, this.$t('perform_action.error_unknown_status'))
            }
          }
        } catch (e) {
          console.log('💥', e)
        }
        this.isLoading = false
      } else {
        this.setMessage(Types.ERROR, this.$t('perform_action.error_no_action'))
      }
    },
    isLoggedIn: function () {
      return !!this.token.value
    }
  },
  mounted() {
  },
  async created() {
    try {
      await this.performAction()
    } catch (e) {
      console.log('💥', e)
    }
  },
  watch: {
    'token.value': async function (newValue) {
      const isLoggedIn = !!newValue;
      if (!this.isRetried && isLoggedIn) {
        try {
          await this.performAction()
        } catch (e) {
          console.log('💥', e)
        }
        this.isRetried = true
      }
    }
  }
}
</script>

<style scoped lang="scss">
</style>
