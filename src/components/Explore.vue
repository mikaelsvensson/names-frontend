<template>
  <div>
    <section>
      <div class="content">
        <h1>
          Upptäck namn
        </h1>
        <p>
          Här kan du söka efter namn.
        </p>
      </div>
    </section>
    <section>
      <b-field>
        <b-input
          v-model="searchText"
          placeholder="Sök efter namn..."
          size="is-medium"
        />
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
                  <font-awesome-icon :style="{ color: 'green' }" :icon="[getVoteValue(item.id) === 100 ? 'fa' : 'far', 'smile']" />
                </span>
              </b-button>
              <b-button
                type="is-light"
                @click="vote(item.id, 0)"
              >
                <span class="icon is-small">
                  <font-awesome-icon :style="{ color: 'orange' }" :icon="[getVoteValue(item.id) === 0 ? 'fa' : 'far', 'meh']" />
                </span>
              </b-button>
              <b-button
                type="is-light"
                @click="vote(item.id, -100)"
              >
                <span class="icon is-small">
                  <font-awesome-icon :style="{ color: 'red' }" :icon="[getVoteValue(item.id) === -100 ? 'fa' : 'far', 'frown']" />
                </span>
              </b-button>
            </div>
          </div>
          <!--
          <div class="popularity">
            <span
              v-if="item.count"
              class="count"
            >
              {{ item.count }} st
            </span>
          </div>
          -->
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import ComponentMixins from "@/util/ComponentMixins";

export default {
  name: 'SearchResult',
  data: function () {
    return {
      searchText: '',
      searchResult: [],
      userVotes: []
    };
  },
  mixins: [
    ComponentMixins
  ],
  methods: {
    search: async function (value) {
      const userId = await this.getUserId();
      const namesResponse = await fetch(`${process.env.VUE_APP_BASE_URL}/users/${userId}/names?name-prefix=${value}`, {mode: 'cors'})
      const names = await namesResponse.json()
      this.searchResult = names.names
    },
    getGender: function (item) {
      const ratioWomen = item.attributes.find(attr => attr.key === 'SCB_PERCENT_WOMEN')?.value;
      return typeof ratioWomen !== 'undefined'
        ? (ratioWomen > 0.9
          ? 'FEMALE'
          : (ratioWomen < 0.1
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
    this.search = this.debounce(this.search, 500)
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
    searchText: function (value) {
      this.search(value)
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
