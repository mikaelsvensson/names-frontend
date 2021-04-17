<template>
  <div>
    <section v-if="!isLoggedIn()">
      <div class="block">
        <h1 class="title">
          {{ $t('profile.title') }}
        </h1>
      </div>

      <Login :show-logout="false" />
    </section>
    <section v-if="isLoggedIn()">
      <div class="block">
        <h1 class="title">
          {{ $t('profile.title') }}
        </h1>
      </div>
    </section>
    <section
      v-if="isLoggedIn() && !!profile"
      class="py-4"
    >
      <div class="content">
        <p>{{ $t('profile.identity_provider.body', {provider: $t('profile.identity_provider.' + profile.provider.toLowerCase())}) }}</p>
        <p v-if="profile.isPartnerConnected">
          {{ $t('profile.partner_connected') }}
        </p>
        <p v-if="!profile.isPartnerConnected">
          {{ $t('profile.partner_not_connected') }}
        </p>
      </div>

      <div class="buttons">
        <button
          type="button"
          class="button"
          @click="logOut()"
        >
          {{ $t('profile.log_out.button') }}
        </button>
      </div>
    </section>
    <section
      v-if="isLoggedIn()"
      class="py-4"
    >
      <h2 class="subtitle">
        {{ $t('profile.delete_account.heading') }}
      </h2>

      <div class="content">
        <p>
          {{ $t('profile.delete_account.instructions') }}
        </p>
      </div>

      <div class="buttons">
        <button
          type="button"
          class="button"
          @click="isConfirmDeleteChecked = true"
        >
          {{ $t('profile.delete_account.button') }}
        </button>
      </div>
    </section>

    <b-modal
      v-model="isConfirmDeleteChecked"
      :width="300"
      scroll="keep"
    >
      <div class="box">
        <div class="content">
          <h2 class="subtitle">
            {{ $t('profile.delete_account.confirmation.title') }}
          </h2>
          <p>
            {{ $t('profile.delete_account.confirmation.confirmation') }}
          </p>
        </div>
        <div class="buttons">
          <button
            type="button"
            class="button is-danger"
            @click="deleteProfile()"
          >
            {{ $t('profile.delete_account.confirmation.button_confirm') }}
          </button>
          <button
            type="button"
            class="button"
            @click="isConfirmDeleteChecked = false"
          >
            {{ $t('profile.delete_account.confirmation.button_cancel') }}
          </button>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
import Login from "@/components/auth/Login";

export default {
  name: 'Profile',
  inject: ['token'],
  components: {Login},
  data: function () {
    return {
      isLoading: true,
      isDeleting: true,
      profile: null,
      isConfirmDeleteChecked: false
    };
  },
  methods: {
    logOut() {
      this.token.value = null
    },
    isLoggedIn: function () {
      return !!this.token.value
    },
    loadProfile: async function () {
      this.isLoading = true;
      try {
        const profileResp = await fetch(`${process.env.VUE_APP_BASE_URL}/profile`, {
          mode: 'cors',
          headers: {
            ...(this.token.value ? {'Authorization': 'Bearer ' + this.token.value} : {})
          }
        });
        if (profileResp.ok) {
          this.profile = await profileResp.json()
        } else {
          console.log('💥 Failed to load profile')
        }
      } catch (e) {
        console.log('💥 Failed to load profile', e)
      }
      this.isLoading = false;
    },
    deleteProfile: async function () {
      this.isDeleting = true;
      if (this.isConfirmDeleteChecked) {
        try {
          const deleteResp = await fetch(`${process.env.VUE_APP_BASE_URL}/profile`, {
            method: 'DELETE',
            mode: 'cors',
            headers: {
              ...(this.token.value ? {'Authorization': 'Bearer ' + this.token.value} : {})
            }
          });
          if (deleteResp.ok) {
            this.logOut()
            await this.$router.replace({
              name: 'profile_deleted'
            })
          } else {
            console.log('💥 Failed to delete profile')
          }
        } catch (e) {
          console.log('💥 Failed to delete profile', e)
        }
      }
      this.isDeleting = false;
    }
  },
  async created() {
    await this.loadProfile()
  },
  watch: {
    'token.value': async function (newValue) {
      const isLoggedIn = !!newValue
      if (isLoggedIn) {
        await this.loadProfile()
      }
    }
  }
}
</script>

<style scoped lang="scss">
</style>
