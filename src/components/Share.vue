<template>
  <div>
    <section>
      <div class="content">
          <h1>
            Dela med partner
          </h1>
          <p>
            Du och din partner kan koppla ihop era profiler så att ni ser varandras favoriter. Det finns tre sätt att göra det på.
          </p>
      </div>
    </section>
    <section>
      <div
        class="box"
        v-if="actionId"
      >
        <div class="content">
          <h5>Skicka länk</h5>
          <p>Skicka den här länken till din partner:</p>
          <p><code>{{ getActionUrl(actionId) }}</code></p>
        </div>
      </div>
      <div
        class="box"
        v-if="actionId"
      >
        <!--
        <p>
          <a
            href="#"
            @click.prevent.stop="isQrLinkModal = true"
          >Visa en QR-kod med en länk för din partner</a>
        </p>
-->
        <div class="content">
          <h5>Visa QR-kod</h5>

          <figure class="image">
            <img :src="getQrUrl(actionId)">
          </figure>
          <p>
            Din partner skannar QR-koden med sin mobilkamera och går till adressen som då dyker upp.
          </p>
          <p><small>QR-kodläsare finns inbyggd i de flesta, men inte alla, mobilkameror.</small></p>
        </div>
      </div>

<!--
      <div
        class="box"
        v-if="actionId"
      >
        <div class="content">
          <h5>Skriv kod</h5>

          <p>Be din partner surfa till den här hemsidan och sedan klicka på Jag har en kod. På den sidan ska hen skriva in den här koden:</p>
          <p><code>{{ actionId }}</code></p>
        </div>
      </div>
-->

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
    // this.search = this.debounce(this.search, 500)
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
