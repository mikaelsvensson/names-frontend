<template>
  <div>
    <section>
      <b-field>
        <b-input
          v-model="filters.name"
          placeholder="Sök efter namn..."
          size="is-medium"
        />
      </b-field>

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

      <b-field>
        <b-radio-button
          v-for="item in popularityOptions"
          :key="item.key"
          v-model="filters.popularity"
          :native-value="item.key"
        >
          {{ item.label }}
        </b-radio-button>
      </b-field>

      <b-field>
        <b-radio-button
          v-for="item in lengthOptions"
          :key="item.key"
          v-model="filters.length"
          :native-value="item.key"
        >
          {{ item.label }}
        </b-radio-button>
      </b-field>

      <article
        class="message"
        v-if="!isFilterSpecified"
      >
        <Notification type="INFO">
          <div>
            Använd sökfältet och knapparna ovan att hitta namn.
          </div>
        </Notification>
      </article>

      <Loader v-if="isSearching" />

      <div
        class="search-result-list"
        v-if="isFilterSpecified && !isSearching"
      >
        <div
          v-if="searchResult.length === 0 && filters.name !== ''"
          class="content"
        >
          <p>
            Det var ett ovanligt namn.
          </p>
          <p>
            <a @click.prevent="addName">Spara {{ filters.name }} som ett namn du gillar</a>. Bara du och din
            partner kommer se detta namn.
          </p>
        </div>

        <ListItem
          v-for="item in searchResult"
          :key="item.id"

          :name="item.name"
          :id="item.id"
          :attributes="item.attributes"
          :user-vote-value="item.userVoteValue"
        />

        <div v-if="!isLast">
          <b-button
            type="is-light"
            @click="loadMore()"
          >
            Visa fler...
          </b-button>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import ComponentMixins from "@/util/ComponentMixins";
import VotesMixins from "@/util/VotesMixins";
import ListItem from "@/components/ListItem";
import Notification from "@/components/Notification";
import Loader from "@/components/Loader";

const UNISEX_THRESHOLD = 0.1

const BATCH_SIZE = 100

let searchResultId = 0

const GENDER_FILTERS = {
  all: {
    label: 'Alla',
    queryParam: ''
  },
  girls: {
    label: 'Flicknamn',
    queryParam: `attribute-filter=SCB_PERCENT_WOMEN:GREATER_THAN:${1 - UNISEX_THRESHOLD}`
  },
  boys: {
    label: 'Pojknamn',
    queryParam: `attribute-filter=SCB_PERCENT_WOMEN:LESS_THAN:${UNISEX_THRESHOLD}`
  },
  unisex: {
    label: 'Unisex',
    queryParam: `attribute-filter=SCB_PERCENT_WOMEN:GREATER_THAN:${UNISEX_THRESHOLD}&attribute-filter=SCB_PERCENT_WOMEN:LESS_THAN:${1 - UNISEX_THRESHOLD}`
  }
}

const POPULARITY_FILTERS = {
  all: {
    label: 'Alla',
    queryParam: ''
  },
  common: {
    label: 'Vanligt',
    queryParam: `attribute-filter=SCB_PERCENT_OF_POPULATION:GREATER_THAN:${1.0 / 1000}`
  },
  between: {
    label: 'Varken eller',
    queryParam: `attribute-filter=SCB_PERCENT_OF_POPULATION:GREATER_THAN:${1.0 / 100000}&attribute-filter=SCB_PERCENT_OF_POPULATION:LESS_THAN:${1.0 / 1000}`
  },
  uncommon: {
    label: 'Ovanligt',
    queryParam: `attribute-filter=SCB_PERCENT_OF_POPULATION:LESS_THAN:${1.0 / 100000}`
  }
}

const LENGTH_FILTERS = {
  all: {
    label: 'Alla',
    queryParam: ''
  },
  short: {
    label: 'Korta',
    queryParam: `attribute-filter=SYLLABLE_COUNT:LESS_THAN:${2}`
  },
  medium: {
    label: 'Medel',
    queryParam: `attribute-filter=SYLLABLE_COUNT:GREATER_THAN:${1.9}&attribute-filter=SYLLABLE_COUNT:LESS_THAN:${4}`
  },
  long: {
    label: 'Långa',
    queryParam: `attribute-filter=SYLLABLE_COUNT:GREATER_THAN:${3.9}`
  }
}


const FILTER_MAPPERS = {
  name: (filterValue) => filterValue ? `name-prefix=${filterValue}` : null,
  gender: (filterValue) => (GENDER_FILTERS[filterValue] ?? GENDER_FILTERS.all).queryParam,
  popularity: (filterValue) => (POPULARITY_FILTERS[filterValue] ?? POPULARITY_FILTERS.all).queryParam,
  length: (filterValue) => (LENGTH_FILTERS[filterValue] ?? LENGTH_FILTERS.all).queryParam
}

const defaultFilters = {
  name: '',
  gender: 'all',
  popularity: 'all',
  length: 'all'
}

export default {
  name: 'SearchResult',
  inject: ['token'],
  components: {Loader, ListItem, Notification},
  data: function () {
    const initialFilters = typeof this.$route.params.filters === 'string'
      ? this.$route.params.filters.split(/\//)
      : Array.isArray(this.$route.params.filters)
        ? this.$route.params.filters
        : []

    return {
      isSearching: false,
      searchResult: [],
      searchOffset: 0,
      isLast: false,
      genderOptions: Object.entries(GENDER_FILTERS).map(([key, {label}]) => ({key, label})),
      popularityOptions: Object.entries(POPULARITY_FILTERS).map(([key, {label}]) => ({key, label})),
      lengthOptions: Object.entries(LENGTH_FILTERS).map(([key, {label}]) => ({key, label})),
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
        name: 'explore',
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
          ...(this.token.value ? {'Authorization': 'Bearer ' + this.token.value} : {})
        }})
      if (searchResultId === searchId) {
        const names = await namesResponse.json();
        names.names.forEach(name => this.searchResult.push(name))
        this.isLast = names.isLast
      } else {
        console.log('💬 Ignore result')
      }

    },
    runSearch: async function (filters) {
      if (!this.isFilterSpecified) {
        this.searchResult = []
        return
      }
      this.searchResult = []
      this.searchOffset = 0

      this.isSearching = true
      this.loadNames(filters)
      this.isSearching = false
    },
    addName: async function () {
      try {
        const createNameResp = await fetch(`${process.env.VUE_APP_BASE_URL}/names`, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.token.value
          },
          body: JSON.stringify({
            name: this.filters.name
          })
        })
        if (createNameResp.ok) {
          const newName = await createNameResp.json()
          await this.vote(newName.id, 100, this.token.value)
          this.searchResult.push(newName)
        } else {
          console.log('💥 Failed to create name')
        }
      } catch (e) {
        console.log('💥', e)
      }
    },
  },
  mounted() {
    this.onSearchTextChange = this.debounce(this.search, 500)
  },
  async created() {
    this.runSearch(this.filters)
  },
  computed: {
    isFilterSpecified: function () {
      return Object.keys(defaultFilters).some(filterKey => this.filters[filterKey] !== defaultFilters[filterKey])
    }
  },
  watch: {
    'filters.name': function () {
      this.onSearchTextChange()
    },
    'filters.gender': function () {
      this.search()
    },
    'filters.popularity': function () {
      this.search()
    },
    'filters.length': function () {
      this.search()
    },
    $route(to/*, from*/) {
      this.runSearch((to.params.filters ?? [])
        .reduce((filters, current) => ({
          ...filters,
          [current.substr(0, current.indexOf('-'))]: current.substr(current.indexOf('-') + 1)
        }), {}))
    }
  }
}
</script>

<style scoped lang="scss">

</style>
