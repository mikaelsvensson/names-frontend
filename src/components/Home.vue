<template>
  <div>
    <section>
      <div class="block">
        <h1 class="title">
          {{ $t('home.title') }}
        </h1>
        <h2 class="subtitle">
          {{ $t('home.subtitle') }}
        </h2>
      </div>

      <div class="box">
        <div class="content">
          <p>{{ $t('home.getting_started.intro') }}</p>
          <ol>
            <li>
              <i18n path="home.getting_started.step_1.sentence">
                <template #link>
                  <router-link
                    to="/explore"
                    v-html="$t('home.getting_started.step_1.link')"
                  />
                </template>
              </i18n>
            </li>
            <li>
              <i18n path="home.getting_started.step_2.sentence">
                <template #link>
                  <router-link
                    to="/share"
                    v-html="$t('home.getting_started.step_2.link')"
                  />
                </template>
              </i18n>
            </li>
            <li>
              <i18n path="home.getting_started.step_3.sentence">
                <template #link>
                  <router-link
                    to="/favourites"
                    v-html="$t('home.getting_started.step_3.link')"
                  />
                </template>
              </i18n>
            </li>
          </ol>
        </div>
      </div>

      <div class="box">
        <div class="content">
          <p>{{ $t('home.random_names.intro') }}</p>
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
              v-html="$t('home.random_names.load_more')"
            />
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
