<template>
  <div>
    <section v-if="!isLoggedIn()">
      <div class="block">
        <h2 class="subtitle">
          {{ $t('favourites.title') }}
        </h2>
      </div>

      <Login :show-logout="false" />
    </section>
    <section v-if="isLoggedIn()">
      <b-field>
        <b-radio-button
          v-for="item in overallOptions"
          :key="item.key"
          v-model="filters.overall"
          :native-value="item.key"
        >
          {{ $t('favourites.filter_labels.' + item.key) }}
        </b-radio-button>
      </b-field>

      <Loader v-if="isSearching" />

      <div
        class="search-result-list"
        v-if="!isSearching"
      >
        <div
          v-if="searchResult.length === 0"
          class="content"
        >
          <p v-if="filters.overall === 'mine'">
            {{ $t('favourites.empty_list.mine') }}
          </p>
          <p v-if="filters.overall === 'ours'">
            {{ $t('favourites.empty_list.ours') }}
          </p>
          <p v-if="filters.overall === 'not_voted_yet'">
            {{ $t('favourites.empty_list.not_voted_yet') }}
          </p>
          <p v-if="filters.overall === 'all'">
            {{ $t('favourites.empty_list.all') }}
          </p>
        </div>

        <div
          v-if="searchResult.length > 0"
          class="search-result-item"
        >
          <div class="name" />
          <div class="vote-you">
            {{ $t('favourites.vote_header.you') }}
          </div>
          <div class="vote-partner">
            {{ $t('favourites.vote_header.partner') }}
          </div>
        </div>

        <ListItem
          v-for="item in searchResult"
          :key="item.id"

          :name="item.name"
          :id="item.id"
          is-partner-vote-shown
          :partner-vote-value="item.votes.partnerVoteValue"
          :user-vote-value="item.votes.selfVoteValue"
          :percent-women="item.demographics.se.percentWomen"
        />

        <div v-if="!isLast">
          <b-button
            type="is-light"
            @click="loadMore()"
          >
            {{ $t('favourites.load_more') }}
          </b-button>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import ComponentMixins from "@/util/ComponentMixins";
import ListItem from "@/components/ListItem";
import VotesMixins from "@/util/VotesMixins";
import Loader from "@/components/Loader";
import Login from "@/components/auth/Login";

const BATCH_SIZE = 100

let searchResultId = 0

const OVERALL_FILTERS = {
  mine: {
    queryParam: `votes-filter=MY_FAVOURITES`
  },
  ours: {
    queryParam: `votes-filter=SHARED_FAVOURITES`
  },
  not_voted_yet: {
    queryParam: `votes-filter=NEW_PARTNER_VOTES`
  },
  all: {
    queryParam: `votes-filter=ALL_OUR_VOTES`
  }
}

const FILTER_MAPPERS = {
  overall: (filterValue) => (OVERALL_FILTERS[filterValue] ?? OVERALL_FILTERS.mine).queryParam
}

const defaultFilters = {
  overall: 'mine'
}

export default {
  name: 'Favourites',
  inject: ['token'],
  components: {Loader, ListItem, Login},
  data: function () {
    const initialFilters = typeof this.$route.params.filters === 'string'
      ? this.$route.params.filters.split(/\//)
      : Array.isArray(this.$route.params.filters)
        ? this.$route.params.filters
        : []
    return {
      isSearching: true,
      searchResult: [],
      searchOffset: 0,
      isLast: false,
      overallOptions: Object.keys(OVERALL_FILTERS).map(key => ({key})),
      filters: initialFilters
        .reduce((filters, current) => ({
          ...filters,
          [current.substr(0, current.indexOf('-'))]: current.substr(current.indexOf('-') + 1)
        }), {...defaultFilters})
    }
  },
  mixins: [
    ComponentMixins,
    VotesMixins
  ],
  methods: {
    search: async function () {
      this.$router.replace({
        name: 'favourites',
        params: {
          filters: Object.entries(this.filters)
            .filter(([, value]) => !!value)
            .map(keyValue => keyValue.join('-'))
        }
      })
    },
    loadMore: async function () {
      this.searchOffset += BATCH_SIZE
      const scrollY = window.pageYOffset
      await this.loadNames(this.filters)
      window.scrollTo(0, scrollY)
    },
    loadNames: async function (filters) {
      const queryParams = Object.entries(filters)
        .map(([key, value]) => FILTER_MAPPERS[key](value))
        .concat([
          `result-offset=${this.searchOffset}`,
          `result-count=${BATCH_SIZE}`
        ])
        .filter(param => !!param).join('&')

      const searchId = Date.now();

      searchResultId = searchId

      const namesResponse = await fetch(`${process.env.VUE_APP_BASE_URL}/names?${queryParams}`, {
        mode: 'cors',
        headers: {
          'Authorization': 'Bearer ' + this.token.value
        }
      })
      if (searchResultId === searchId) {
        const names = await namesResponse.json();
        try {
          names.names.forEach(name => this.searchResult.push(name))
          this.isLast = names.isLast
        } catch (e) {
          console.log('💥', e)
        }
      } else {
        console.log('💬 Ignore result')
      }

    },
    runSearch: async function (filters) {
      this.searchResult = []
      this.searchOffset = 0

      this.isSearching = true
      await this.loadNames(filters)
      this.isSearching = false
    },
    isLoggedIn: function () {
      return !!this.token.value
    }
  },
  async created() {
    if (this.isLoggedIn()) {
      this.runSearch(this.filters)
    }
  },
  watch: {
    'filters.overall': function () {
      this.search()
    },
    'token.value': async function (newValue) {
      const isLoggedIn = !!newValue
      if (isLoggedIn) {
        this.runSearch(this.filters)
      }
    },
    $route(to/*, from*/) {
      this.runSearch(to.params.filters
        ? to.params.filters
          .reduce((filters, current) => ({
            ...filters,
            [current.substr(0, current.indexOf('-'))]: current.substr(current.indexOf('-') + 1)
          }), {})
        : this.filters ?? [])
    }
  }
}
</script>

<style scoped lang="scss">
    div.search-result-item {
        display: flex;
        padding: 0.5em 0;
        align-items: center;

        div.name {
            flex: 1;
        }

        div.popularity {
            flex-basis: 3.5em;
            text-align: right;
        }

        div.vote-you {

            flex-basis: 9em;

            div.buttons {
                flex-wrap: unset;
            }
        }

        div.vote-partner {
            flex-basis: 3em;
            display: flex;
            justify-content: center;
        }
    }
</style>
