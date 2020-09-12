<template>
  <div>
    <section>
      <div class="content">
        <h1>
          Välkommen
        </h1>
        <p>
          Kul att ni vill hitta ett namn tillsammans!
        </p>
      </div>
    </section>
    <section>
      <div v-if="!isError" class="notification is-success is-light content">
        <p>
        {{ message }}
        </p>
        <p>
          Vill du <router-link to="/favourites">se era gemensamma favoriter</router-link> eller <router-link to="/explore">hitta dina egna favoriter</router-link>?
        </p>
      </div>
      <div v-if="isError" class="notification is-danger is-light content">
        {{ message }}
      </div>
    </section>
  </div>
</template>

<script>

import ComponentMixins from "@/util/ComponentMixins";

export default {
  name: 'PerformAction',
  data: function () {
    return {
      isError: false,
      message: null
    };
  },
  mixins: [
    ComponentMixins
  ],
  methods: {
    performAction: async function (actionId) {
      try {
        const userId = await this.getUserId();
        const actionResp = await fetch(`${process.env.VUE_APP_BASE_URL}/actions/${actionId}/invocation`, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            invokingUser: userId
          })
        })
        this.isError = !actionResp.ok
        if (!this.isError) {
          const updatedAction = await actionResp.json()
          if (updatedAction.type === 'ADD_RELATIONSHIP') {
            this.message = 'Nu ser ni varandras favoriter.'
          } else {
            this.message = 'Klart.'
          }
          console.log('👻', updatedAction);
        } else {
          if (actionResp.status === 404) {
            this.message = 'Den här länken har tyvärr slutat fungera.'
          } else if (actionResp.status === 409) {
            this.message = 'Ni ser redan varandras favoriter.'
          } else {
            this.message = 'Oj, något gick fel.'
          }
        }
      } catch (e) {
        console.log('💥', e)
      }
    },
  },
  mounted() {
  },
  async created() {
    try {
      const actionId = this.$route.params.actionId;
      if (actionId) {
        await this.performAction(actionId)
      }
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
