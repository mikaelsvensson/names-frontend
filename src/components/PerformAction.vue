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
          <div v-if="button.action">
            <div class="mt-2">
              <b-button
                @click="button.action"
              >
                {{ button.label }}
              </b-button>
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
      button: {
        action: null,
        label: null
      },
      isLoginRequired: false
    };
  },
  mixins: [
    ComponentMixins
  ],
  methods: {
    setMessage(type, message) {
      this.notification = {type, message}
    },
    setButton(label, action) {
      this.button = {label, action}
    },
    async performAction(actionId) {
      if (actionId) {
        this.isLoading = true;
        try {
          const token = this.token.value;
          const actionResp = await fetch(`${process.env.VUE_APP_BASE_URL}/actions/${actionId}/invocation`, {
            method: 'POST',
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? {'Authorization': 'Bearer ' + token} : {})
            }
          });
          this.isError = !actionResp.ok;
          if (!this.isError) {
            const updatedAction = await actionResp.json();
            if (updatedAction.type === 'ADD_RELATIONSHIP') {
              this.setMessage(Types.SUCCESS, this.$t('perform_action.success_add_relationship'));
              this.setButton(null, null)
            } else if (updatedAction.type === 'VERIFY_EMAIL') {
              this.setMessage(Types.SUCCESS, this.$t('perform_action.success_verify_email'));
              this.setButton(null, null);
              this.isRetried = true;
              await this.requestToken('EMAIL', updatedAction.token);

              if (updatedAction.redirectTo) {
                await this.$router.push(updatedAction.redirectTo)
              }
            } else if (updatedAction.type === 'DELETE_DATA_REQUEST_STATUS') {
              this.setMessage(Types.INFO, this.$t('perform_action.delete_data_request_status.body'));
              this.setButton(this.$t('perform_action.delete_data_request_status.button'), async () => {
                await this.$router.replace({
                  name: 'perform_action',
                  params: {
                    actionId: updatedAction.parameters.confirmActionId
                  }
                })
              });
              this.isRetried = true;
              await this.requestToken('EMAIL', updatedAction.token);

              if (updatedAction.redirectTo) {
                await this.$router.push(updatedAction.redirectTo)
              }
            } else if (updatedAction.type === 'DELETE_DATA_CONFIRMATION') {
              this.setMessage(Types.SUCCESS, this.$t('perform_action.delete_data_request_status.success'));
              this.setButton(null, null);
              this.logOut()
            } else {
              this.setMessage(Types.SUCCESS, this.$t('perform_action.success_generic'));
              this.setButton(null, null)
            }
          } else {
            if (actionResp.status === 404) {
              this.setMessage(Types.INFO, this.$t('perform_action.info_link_expired'))
            } else if (actionResp.status === 401) {
              this.setMessage(Types.INFO, this.$t('perform_action.info_login_required'));
              this.isError = false;
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
    logOut: function () {
      this.token.value = null
    },
    isLoggedIn: function () {
      return !!this.token.value
    }
  },
  mounted() {
  },
  async created() {
    try {
      await this.performAction(this.$route.params.actionId)
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
    },
    async $route(to) {
      try {
        await this.performAction(to.params.actionId)
      } catch (e) {
        console.log('💥', e)
      }
    }
  }
}
</script>

<style scoped lang="scss">
</style>
