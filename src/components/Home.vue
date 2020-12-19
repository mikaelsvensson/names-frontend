<template>
  <div>
    <section>
      <div class="block">
        <h1 class="title">
          Vad ska barnet heta?
        </h1>
        <h2 class="subtitle">
          Upptäck vilka namn ni båda gillar.
        </h2>
      </div>

      <div class="box">
        <div class="content">
          <p>Det är enkelt att komma igång:</p>
          <ol>
            <li>
              Hitta några egna favoriter på <router-link to="/explore">söksidan</router-link>.
            </li>
            <li>
              <router-link to="/share">
                Dela en personlig länk
              </router-link>
              med din partner.
            </li>
            <li>
              Klart. Nu kan ni båda <router-link to="/favourites">se varandras favoriter</router-link>.
            </li>
          </ol>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data: function () {
    return {};
  },
  mixins: [],
  methods: {},
  mounted() {
  },
  created() {
  },
  watch: {}
}
</script>

<style scoped lang="scss">
</style>
