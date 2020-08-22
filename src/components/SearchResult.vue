<template>
  <div>
    <input
      type="text"
      v-model="searchText"
    >
    <div class="searchResult">
      <div
        v-for="item in searchResult"
        :key="item.id"
      >
        <div class="search-result-item">
          <span class="name">
            {{ item.name }}
          </span>
          <span
            v-if="item.male"
            class="icon-male"
          >♂</span>
          <span
            v-if="item.female"
            class="icon-female"
          >♀</span>
          <button
            @click="vote(item.id, 'UP')"
            type="button"
            :class="buttonClass(item.id, 'UP')"
          >
            👍
          </button>
          <button
            @click="vote(item.id, 'DOWN')"
            type="button"
            :class="buttonClass(item.id, 'DOWN')"
          >
            👎
          </button>
          <span
            v-if="item.count"
            class="count"
          >
            {{ item.count }} st
          </span>
        </div>
      </div>
    </div>
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
      console.log(value)
      const namesResponse = await fetch(`http://localhost:8080/names?name-prefix=${value}`, {mode: 'cors'})
      const names = await namesResponse.json()
      this.searchResult = names.names
    },
    vote: async function (id, voteType) {
      try {
        const userId = await this.getUserId();
        const voteResponse = await fetch(`http://localhost:8080/users/${userId}/votes/${id}`, {
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
        'vote-type-'+voteType.toLowerCase()
      ]
    }
  },
  mounted() {
    this.search = this.debounce(this.search, 500)
  },
  async created() {
    try {
      const userId = await this.getUserId();
      const votesResponse = await fetch(`http://localhost:8080/users/${userId}/votes`, {mode: 'cors'})
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

<style scoped>
    .icon-male {
        color: blue;
    }

    .icon-female {
        color: deeppink;
    }

    .vote-cast-yes.vote-type-up {
        background: lightgreen;
    }

    .vote-cast-yes.vote-type-down {
        background: lightpink;
    }

    .vote-cast-no {
        background: transparent;
    }

    div.search-result-item {
      padding: 0.5em 0;
    }

    div.search-result-item:hover {
      background-color: #eeeeee;
    }

    span.name {
      display: inline-block;
      width: 15em;
    }

    span.count {
      margin-left: 1em;
      display: inline-block;
      width: 5em;
      font-style: italic;
      font-size: 80%;
    }

    button {
        margin: 0 0.2em;
        padding: 0.5em 0.8em;
        border: 1px solid #cccccc;
    }
</style>
