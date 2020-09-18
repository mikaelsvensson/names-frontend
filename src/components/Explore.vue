<template>
  <div>
    <section>
      <b-field>
        <b-input
          v-model="searchText"
          placeholder="Sök efter namn..."
          size="is-medium"
        />
      </b-field>

      <b-field>
        <b-radio-button
          v-for="item in genderOptions"
          :key="item.key"
          v-model="genderOption"
          :native-value="item.key"
        >
          {{ item.label }}
        </b-radio-button>
      </b-field>

      <b-field>
        <b-radio-button
          v-for="item in popularityOptions"
          :key="item.key"
          v-model="popularityOption"
          :native-value="item.key"
        >
          {{ item.label }}
        </b-radio-button>
      </b-field>

      <div class="search-result-list">
        <div
          v-if="searchResult.length === 0 && searchText !== ''"
          class="content"
        >
          <p>
            Det var ett ovanligt namn.
          </p>
          <p>
            <a @click.prevent="addName">Spara {{ searchText }} som ett namn du gillar</a>. Bara du och din
            partner kommer se detta namn.
          </p>
        </div>
        <div
          v-for="item in searchResult"
          :key="item.id"
          class="search-result-item"
        >
          <div class="name">
            {{ item.name }}

            <span
              v-if="getGender(item) === 'MALE'"
              class="icon-male"
              title="Över 90 % av personerna med detta namn är män."
            >♂</span>
            <span
              v-if="getGender(item) === 'FEMALE'"
              title="Över 90 % av personerna med detta namn är kvinnor."
              class="icon-female"
            >♀</span>
            <span
              v-if="getGender(item) === 'UNISEX'"
              title="Namnet bärs av både kvinnor och män."
              class="icon-unisex"
            >⚤</span>
          </div>
          <div class="vote-buttons">
            <div class="buttons">
              <b-button
                type="is-light"
                @click="vote(item.id, 100)"
              >
                <span class="icon is-small">
                  <font-awesome-icon
                    :style="{ color: 'green' }"
                    :icon="[getVoteValue(item.id) === 100 ? 'fa' : 'far', 'smile']"
                  />
                </span>
              </b-button>
              <b-button
                type="is-light"
                @click="vote(item.id, 0)"
              >
                <span class="icon is-small">
                  <font-awesome-icon
                    :style="{ color: 'orange' }"
                    :icon="[getVoteValue(item.id) === 0 ? 'fa' : 'far', 'meh']"
                  />
                </span>
              </b-button>
              <b-button
                type="is-light"
                @click="vote(item.id, -100)"
              >
                <span class="icon is-small">
                  <font-awesome-icon
                    :style="{ color: 'red' }"
                    :icon="[getVoteValue(item.id) === -100 ? 'fa' : 'far', 'frown']"
                  />
                </span>
              </b-button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import ComponentMixins from "@/util/ComponentMixins";

const UNISEX_THRESHOLD = 0.1

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
    queryParam: `attribute-filter=SCB_PERCENT_OF_POPULATION:GREATER_THAN:${1.0/1000}`
  },
  between: {
    label: 'Varken eller',
    queryParam: `attribute-filter=SCB_PERCENT_OF_POPULATION:GREATER_THAN:${1.0/100000}&attribute-filter=SCB_PERCENT_OF_POPULATION:LESS_THAN:${1.0/1000}`
  },
  uncommon: {
    label: 'Ovanligt',
    queryParam: `attribute-filter=SCB_PERCENT_OF_POPULATION:LESS_THAN:${1.0/100000}`
  }
}

export default {
  name: 'SearchResult',
  data: function () {
    return {
      searchText: '',
      searchResult: [],
      userVotes: [],
      genderOption: 'all',
      genderOptions: Object.entries(GENDER_FILTERS).map(([key, {label}]) => ({key, label})),
      popularityOption: 'all',
      popularityOptions: Object.entries(POPULARITY_FILTERS).map(([key, {label}]) => ({key, label}))
    };
  },
  mixins: [
    ComponentMixins
  ],
  methods: {
    search: async function () {
      const value = this.searchText
      const userId = await this.getUserId();
      const queryParams = [
        value ? `name-prefix=${value}` : null,
        GENDER_FILTERS[this.genderOption]?.queryParam,
        POPULARITY_FILTERS[this.popularityOption]?.queryParam
      ].filter(param => !!param).join('&')
      const namesResponse = await fetch(`${process.env.VUE_APP_BASE_URL}/users/${userId}/names?${queryParams}`, {mode: 'cors'})
      const names = await namesResponse.json()
      this.searchResult = names.names
    },
    getGender: function (item) {
      const ratioWomen = item.attributes.find(attr => attr.key === 'SCB_PERCENT_WOMEN')?.value;
      return typeof ratioWomen !== 'undefined'
        ? (ratioWomen > (1 - UNISEX_THRESHOLD)
          ? 'FEMALE'
          : (ratioWomen < UNISEX_THRESHOLD
            ? 'MALE'
            : 'UNISEX'))
        : null
    },
    addName: async function () {
      try {
        const userId = await this.getUserId();
        const createNameResp = await fetch(`${process.env.VUE_APP_BASE_URL}/users/${userId}/names`, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: this.searchText
          })
        })
        if (createNameResp.ok) {
          const newName = await createNameResp.json()
          await this.vote(newName.id, 100)
          this.searchResult.push(newName)
        } else {
          console.log('💥 Failed to create name')
        }
      } catch (e) {
        console.log('💥', e)
      }

    },
    vote: async function (id, value) {
      try {
        const userId = await this.getUserId();
        const voteResponse = await fetch(`${process.env.VUE_APP_BASE_URL}/users/${userId}/votes/${id}`, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({value})
        })
        if (voteResponse.ok) {
          const userVote = this.userVotes.find(vote => vote.nameId === id);
          if (userVote) {
            userVote.value = value
          } else {
            this.userVotes.push({
              nameId: id,
              userId: null,
              value
            })
          }
        } else {
          console.log('💥 Failed to cast votes')
        }
      } catch (e) {
        console.log('💥', e)
      }
    },
    getVoteValue: function (id) {
      return this.userVotes.find(vote => vote.nameId === id)?.value;
    }
  },
  mounted() {
    this.onSearchTextChange = this.debounce(this.search, 500)
  },
  async created() {
    try {
      const userId = await this.getUserId();
      const votesResponse = await fetch(`${process.env.VUE_APP_BASE_URL}/users/${userId}/votes`, {mode: 'cors'})
      if (votesResponse.ok) {
        this.userVotes = await votesResponse.json()
      } else {
        console.log('💥 Failed to fetch votes')
        this.userVotes = []
      }
    } catch (e) {
      console.log('💥', e)
      this.userVotes = []
    }
  },
  watch: {
    searchText: function (/*value*/) {
      this.onSearchTextChange()
    },
    genderOption: function (/*value*/) {
      this.search()
    },
    popularityOption: function (/*value*/) {
      this.search()
    }
  }
}
</script>

<style scoped lang="scss">
    .search-result-list {
    }

    div.search-result-item {
        display: flex;
        padding: 0.5em 0;
        align-items: center;

        div {
            flex: 0;
        }

        div.name {
            flex: 1;
        }

        div.popularity {
            flex-basis: 4em;
            text-align: right;
        }

        div.vote-buttons {
            div.buttons {
                flex-wrap: unset;
            }
        }
    }

    .icon-male {
        color: blue;
        padding-left: 1rem;
    }

    .icon-female {
        color: deeppink;
        padding-left: 1rem;
    }

    .icon-unisex {
        color: mediumpurple;
        padding-left: 1rem;
    }

    span.count {
        font-style: italic;
    }
</style>
