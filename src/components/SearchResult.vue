<template>
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
            v-if="item.male && !item.female"
            class="icon-male"
            title="Över 90 % av personerna med detta namn är män."
          >♂</span>
          <span
            v-if="item.female && !item.male"
            title="Över 90 % av personerna med detta namn är kvinnor."
            class="icon-female"
          >♀</span>
          <span
            v-if="item.female && item.male"
            title="Namnet bärs av både kvinnor och män."
            class="icon-unisex"
          >⚤</span>
        </div>
        <div class="vote-buttons">
          <div class="buttons">
            <b-button
              type="is-light"
              @click="vote(item.id, 'UP')"
            >
              <span class="icon is-small">
                <font-awesome-icon :icon="[hasVoteType(item.id, 'UP') ? 'fa' : 'far', 'thumbs-up']" />
              </span>
            </b-button>
            <b-button
              type="is-light"
              @click="vote(item.id, 'DOWN')"
            >
              <span class="icon is-small">
                <font-awesome-icon :icon="[hasVoteType(item.id, 'DOWN') ? 'fa' : 'far', 'thumbs-down']" />
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
          await this.vote(newName.id, 'UP')
          this.searchResult.push(newName)
        } else {
          console.log('💥 Failed to create name')
        }
      } catch (e) {
        console.log('💥', e)
      }

    },
    vote: async function (id, voteType) {
      try {
        const userId = await this.getUserId();
        const voteResponse = await fetch(`${process.env.VUE_APP_BASE_URL}/users/${userId}/votes/${id}`, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({voteType: voteType})
        })
        if (voteResponse.ok) {
          const userVote = this.userVotes.find(vote => vote.nameId === id);
          if (userVote) {
            userVote.voteType = voteType
          } else {
            this.userVotes.push({
              nameId: id,
              userId: null,
              voteStrength: 0,
              voteType: voteType
            })
          }
        } else {
          console.log('💥 Failed to cast votes')
        }
      } catch (e) {
        console.log('💥', e)
      }
    },
    hasVoteType: function (id, voteType) {
      return this.userVotes.some(vote => vote.nameId === id && vote.voteType === voteType)
    },
    buttonClass: function (id, voteType) {
      return [
        this.userVotes.some(vote => vote.nameId === id && vote.voteType === voteType) ? 'vote-cast-yes' : 'vote-cast-no',
        'vote-type-' + voteType.toLowerCase()
      ]
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
