<template>
  <div>
    <section>
      <div class="block">
        <h2 class="subtitle">
          Du och din partner kan koppla ihop era profiler så att ni ser varandras favoriter.
        </h2>
        <h2 class="subtitle">
          Det finns två sätt att göra det på.
        </h2>
      </div>
      <div
        class="box"
        v-if="actionId"
      >
        <div class="content">
          <h5>Skicka länk</h5>
          <p>Kopiera den här länken och skicka till din partner:</p>
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
          <h5>Visa QR-kod</h5>

          <figure class="image">
            <img :src="getQrUrl(actionId)">
          </figure>
          <p>
            Din partner skannar QR-koden med sin mobilkamera och går till adressen som då dyker upp.
          </p>
          <p><small>QR-läsare finns i många mobilkameror, men inte alla.</small></p>
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

export default {
  name: 'Share',
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
        const userId = await this.getUserId();
        const createActionResp = await fetch(`${process.env.VUE_APP_BASE_URL}/users/${userId}/actions`, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'ADD_RELATIONSHIP'
          })
        })
        if (createActionResp.ok) {
          const newAction = await createActionResp.json()
          console.log('💬', newAction)
          this.actionId = newAction.id
        } else {
          console.log('💥 Failed to create name')
        }
      } catch (e) {
        console.log('💥', e)
      }
    },
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
    try {
      await this.createShareLink();
    } catch (e) {
      console.log('💥', e)
    }
  },
  watch: {}
}
</script>

<style scoped lang="scss">
</style>
