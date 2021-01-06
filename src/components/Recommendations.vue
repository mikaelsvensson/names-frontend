<template>
  <div>
    <section v-if="!isLoggedIn()">
      <div class="block">
        <h2 class="subtitle">
          Förslag utifrån dina röster
        </h2>
      </div>

      <Login :show-logout="false" />
    </section>
    <section v-if="isLoggedIn()">
      <div class="block">
        <h2 class="subtitle">
          Förslag baserade på dina favoriter
        </h2>
      </div>

      <b-field>
        <b-radio-button
          v-for="item in genderOptions"
          :key="item.key"
          v-model="filters.gender"
          :native-value="item.key"
        >
          {{ item.label }}
        </b-radio-button>
      </b-field>

      <Loader v-if="isSearching" />

      <div v-if="!isSearching">
        <ListItem
          v-for="item in searchResult"
          :key="item.id"

          :name="item.name"
          :id="item.id"
          :attributes="item.attributes"
          :user-vote-value="item.userVoteValue"

          @vote-cast="registerCastVote(item.id)"
        />

        <div
          v-if="batchNumber <= 2"
          class="mt-4"
        >
          <Notification type="INFO">
            <div>När du röstat på alla tio förslag får du tio nya.</div>
          </Notification>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import ComponentMixins from "@/util/ComponentMixins";
import Login from "@/components/auth/Login";
import Notification from "@/components/Notification";
import ListItem from "@/components/ListItem";
import Loader from "@/components/Loader";

const UNISEX_THRESHOLD = 0.1

const BATCH_SIZE = 10

let searchResultId = 0

const GENDER_FILTERS = {
  all: {
    label: 'Alla',
    queryParam: ''
  },
  girls: {
    label: 'Flicka',
    queryParam: `attribute-filter=SCB_PERCENT_WOMEN:GREATER_THAN:${1 - UNISEX_THRESHOLD}`
  },
  boys: {
    label: 'Pojke',
    queryParam: `attribute-filter=SCB_PERCENT_WOMEN:LESS_THAN:${UNISEX_THRESHOLD}`
  },
  unisex: {
    label: 'Unisex',
    queryParam: `attribute-filter=SCB_PERCENT_WOMEN:GREATER_THAN:${UNISEX_THRESHOLD}&attribute-filter=SCB_PERCENT_WOMEN:LESS_THAN:${1 - UNISEX_THRESHOLD}`
  }
}

const FILTER_MAPPERS = {
  gender: (filterValue) => (GENDER_FILTERS[filterValue] ?? GENDER_FILTERS.all).queryParam
}

const defaultFilters = {
  gender: 'all'
}

export default {
  name: 'Recommendation',
  inject: ['token'],
  components: {Login, Notification, ListItem, Loader},
  data: function () {
    const initialFilters = typeof this.$route.params.filters === 'string'
      ? this.$route.params.filters.split(/\//)
      : Array.isArray(this.$route.params.filters)
        ? this.$route.params.filters
        : []

    return {
      isSearching: false,
      batchNumber: 0,
      searchResult: [],
      votesLeft: 0,
      isLast: false,
      genderOptions: Object.entries(GENDER_FILTERS).map(([key, {label}]) => ({key, label})),
      filters: initialFilters
        .reduce((filters, current) => ({
          ...filters,
          [current.substr(0, current.indexOf('-'))]: current.substr(current.indexOf('-') + 1)
        }), {...defaultFilters})
    }
  },
  mixins: [
    ComponentMixins
  ],
  methods: {
    registerCastVote: function (nameId) {
      this.searchResult.find(n => n.id === nameId).isVoteCast = true
    },
    search: async function () {
      this.$router.replace({
        name: 'recommendations',
        params: {
          filters: Object.entries(this.filters)
            .filter(([, value]) => !!value)
            .map(keyValue => keyValue.join('-'))
        }
      })
    },
    loadRecommendations: async function (filters) {
      try {
        const queryParams = Object.entries(filters)
          .map(([key, value]) => FILTER_MAPPERS[key](value))
          .concat([
            `result-count=${BATCH_SIZE}`
          ])
          .filter(param => !!param).join('&')

        const searchId = Date.now();

        searchResultId = searchId


        const resp = await fetch(`${process.env.VUE_APP_BASE_URL}/names/recommendations?${queryParams}`, {
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.token.value
          }
        })
        if (resp.ok) {
          if (searchResultId === searchId) {
            const recommendations = await resp.json();
            recommendations.forEach(name => this.searchResult.push({
              ...name,
              isVoteCast: false
            }))
            this.batchNumber++
          } else {
            console.log('💬 Ignore result')
          }
        } else {
          console.log('💥 Failed to get recommendations')
        }
      } catch (e) {
        console.log('💥', e)
      }
    },
    runSearch: async function (filters) {
      this.searchResult = []

      this.isSearching = true
      await this.loadRecommendations(filters)
      this.isSearching = false
    },
    isLoggedIn: function () {
      return !!this.token.value
    }
  },
  async created() {
    if (this.isLoggedIn()) {
      try {
        this.runSearch(this.filters)
      } catch (e) {
        console.log('💥', e)
      }
    }
  },
  computed: {
    getMissingVotesCount: function () {
      return this.searchResult.length ? this.searchResult.filter(n => !n.isVoteCast).length : null
    }
  },
  watch: {
    getMissingVotesCount: async function (newCount) {
      if (newCount === 0) {
        await this.runSearch(this.filters);
      }
    },
    'filters.gender': async function () {
      await this.search()
    },
    $route(to/*, from*/) {
      this.runSearch((to.params.filters ?? [])
        .reduce((filters, current) => ({
          ...filters,
          [current.substr(0, current.indexOf('-'))]: current.substr(current.indexOf('-') + 1)
        }), {}))
    },
    'token.value': async function (newValue) {
      const isLoggedIn = !!newValue
      if (isLoggedIn) {
        try {
          await this.runSearch(this.filters);
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
