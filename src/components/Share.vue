<template>
  <div>
    <section v-if="!isLoggedIn()">
      <div class="block">
        <h2 class="subtitle">
          {{ $t('share.subtitle') }}
        </h2>
      </div>

      <Login :show-logout="false" />
    </section>
    <section v-if="isLoggedIn()">
      <div class="block">
        <h2 class="subtitle">
          {{ $t('share.subtitle') }}
        </h2>
      </div>
      <div
        class="box"
        v-if="actionId"
      >
        <div class="content">
          <h5>{{ $t('share.send_link.heading') }}</h5>
          <p>{{ $t('share.send_link.instructions') }}</p>
        </div>
        <b-field>
          <b-input
            placeholder="Search..."
            expanded
            :value="getActionUrl(actionId)"
          />
          <p class="control">
            <button
              class="button copy-to-clipboard"
              :data-clipboard-text="getActionUrl(actionId)"
            >
              <span class="icon is-small">
                <font-awesome-icon
                  :icon="['far', 'copy']"
                />
              </span>
            </button>
          </p>
        </b-field>
      </div>
      <div
        class="box"
        v-if="actionId"
      >
        <div class="content">
          <h5>{{ $t('share.scan_qr.heading') }}</h5>

          <figure class="image">
            <img :src="getQrUrl(actionId)">
          </figure>
          <p>
            {{ $t('share.scan_qr.instructions') }}
          </p>
          <p><small>{{ $t('share.scan_qr.note') }}</small></p>
        </div>
      </div>

      <b-modal
        v-model="isQrLinkModal"
        :width="640"
        scroll="keep"
      >
        <div class="box">
          <figure class="image is-square">
            <img :src="getQrUrl(actionId)">
          </figure>
          <p>
            När din partner skannar QR-koden med sin mobilkamera, och går till adressen som då dyker upp, så
            kopplas era profiler ihop och ni ser varandras favoriter.
          </p>
        </div>
      </b-modal>
      <b-modal
        v-model="isShareLinkModal"
        :width="640"
        scroll="keep"
      >
        <div class="box">
          <p>Skicka den här länken till din partner:</p>
          <p><code>{{ getActionUrl(actionId) }}</code></p>
          <p>
            När hen klickar på länken kopplas era mobiler ihop. På så sätt kan ni ser varandras favoritnamn.
          </p>
        </div>
      </b-modal>
    </section>
  </div>
</template>

<script>
import Clipboard from 'clipboard/dist/clipboard.min'
import ComponentMixins from "@/util/ComponentMixins";
import Login from "@/components/auth/Login";

export default {
  name: 'Share',
  inject: ['token'],
  components: {Login},
  data: function () {
    return {
      isQrLinkModal: false,
      isShareLinkModal: false,
      actionId: null
    }
  },
  mixins: [
    ComponentMixins
  ],
  methods: {
    getQrUrl: function (actionId) {
      return `${process.env.VUE_APP_BASE_URL}/actions/${actionId}/qr`
    },
    getActionUrl: function (actionId) {
      return `${process.env.VUE_APP_BASE_URL}/#/${actionId}`
    },
    createShareLink: async function () {
      try {
        const createActionResp = await fetch(`${process.env.VUE_APP_BASE_URL}/actions`, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.token.value
          },
          body: JSON.stringify({
            type: 'ADD_RELATIONSHIP'
          })
        })
        if (createActionResp.ok) {
          const newAction = await createActionResp.json()
          this.actionId = newAction.id
        } else {
          console.log('💥 Failed to create link')
        }
      } catch (e) {
        console.log('💥', e)
      }
    },
    isLoggedIn: function () {
      return !!this.token.value
    }
  },
  mounted() {
    const toaster = this.$buefy.toast
    const clipboard = new Clipboard('.copy-to-clipboard');
    clipboard.on('success', (/* e */) => {
      toaster.open({
        message: 'Nu kan du klistra in länken i en annan app.',
        position: 'is-bottom'
      })
    })
    clipboard.on('error', (e) => {
      console.log('💥', e)
    })
    this.clipboard = clipboard
  },
  destroyed() {
    this.clipboard.destroy()
  },
  async created() {
    if (this.isLoggedIn()) {
      try {
        await this.createShareLink();
      } catch (e) {
        console.log('💥', e)
      }
    }
  },
  watch: {
    'token.value': async function (newValue) {
      const isLoggedIn = !!newValue
      if (isLoggedIn) {
        try {
          await this.createShareLink();
        } catch (e) {
          console.log('💥', e)
        }
      }
    }
  }
}
</script>

<style scoped lang="scss">
</style>
