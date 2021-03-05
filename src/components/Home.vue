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
              Hitta några egna favoriter på
              <router-link to="/explore">
                söksidan
              </router-link>
              .
            </li>
            <li>
              <router-link to="/share">
                Dela en personlig länk
              </router-link>
              med din partner.
            </li>
            <li>
              Klart. Nu kan ni båda
              <router-link to="/favourites">
                se varandras favoriter
              </router-link>
              .
            </li>
          </ol>
        </div>
      </div>

      <div class="box">
        <div class="content">
          <p>Ett par namn att börja med:</p>
          <Loader v-if="isSearching" />

          <div v-if="!isSearching">
            <ListItem
              v-for="item in randomNames"
              :key="item.id"

              :name="item.name"
              :id="item.id"
              :user-vote-value="item.votes.selfVoteValue"
              :percent-women="item.demographics.se.percentWomen"
            />

            <b-button
              type="is-light"
              @click="loadNames()"
            >
              Ge mig några till...
            </b-button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import Loader from "@/components/Loader";
import ListItem from "@/components/ListItem";

let searchResultId = 0;
let batchOffset = 0;
const BATCH_SIZE = 5;
const RANDOM_SEED = Math.round(Math.random() * 100000);
const CACHE_FACTOR = 20;

export default {
  name: 'Home',
  inject: ['token'],
  components: {Loader, ListItem},
  data: function () {
    return {
      isSearching: true,
      searchResult: [],
      searchOffset: 0,
      randomNames: []
    };
  },
  mixins: [],
  methods: {
    loadNames: async function () {
      this.isSearching = true;
      if (!this.searchResult.length) {
        const queryParams = [
          `attribute-filter=SCB_PERCENT_OF_POPULATION:GREATER_THAN:0.0001`,
          `sort-order=RANDOM:${RANDOM_SEED}`,
          `result-offset=${BATCH_SIZE * batchOffset * CACHE_FACTOR}`,
          `result-count=${BATCH_SIZE * CACHE_FACTOR}`
        ].join('&');

        const searchId = Date.now();

        searchResultId = searchId;

        const namesResponse = await fetch(`${process.env.VUE_APP_BASE_URL}/names?${queryParams}`, {
          mode: 'cors',
          headers: {
            'Authorization': 'Bearer ' + this.token.value
          }
        });
        if (searchResultId === searchId) {
          batchOffset++;
          const names = await namesResponse.json();
          try {
            this.searchResult = names.names
          } catch (e) {
            console.log('💥', e)
          }
        } else {
          console.log('💬 Ignore result')
        }
      }
      this.randomNames = this.searchResult.splice(0, Math.min(this.searchResult.length, BATCH_SIZE))
      this.isSearching = false;
    }
  },
  mounted() {
  },
  async created() {
    await this.loadNames()
  },
  watch: {}
}
</script>

<style scoped lang="scss">
</style>
