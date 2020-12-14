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
              <Login
                @mode="loginModeChanged($event)"
                :show-logout="false"
              />
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
    async loginModeChanged(newMode) {
      if (!this.isRetried) {
        switch (newMode) {
        case 'LOGGED_IN':
          try {
            await this.performAction()
          } catch (e) {
            console.log('💥', e)
          }
          this.isRetried = true
        }
      }
    },
    setMessage(type, message) {
      this.notification = { type, message }
    },
    async performAction () {
      const actionId = this.$route.params.actionId;
      if (actionId) {
        this.isLoading = true
        try {
          const token = window.localStorage.getItem('user.token');
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
              this.setMessage(Types.SUCCESS, 'Ni kan nu se varandras favoriter.')
            } else {
              this.setMessage(Types.SUCCESS, 'Klart.')
            }
          } else {
            if (actionResp.status === 404) {
              this.setMessage(Types.INFO, 'Länken har tyvärr slutat fungera.')
            } else if (actionResp.status === 401) {
              this.setMessage(Types.INFO, 'Börja med att logga in.')
              this.isError = false
              this.isLoginRequired = true
            } else if (actionResp.status === 410) {
              this.setMessage(Types.ERROR, 'Denna engångs-länk har redan använts en gång.')
            } else {
              this.setMessage(Types.ERROR, 'Oj, något gick fel.')
            }
          }
        } catch (e) {
          console.log('💥', e)
        }
        this.isLoading = false
      } else {
        this.setMessage(Types.ERROR, 'Oj, vi klantade oss och något gick fel.')
      }
    },
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
  }
}
</script>

<style scoped lang="scss">
</style>
