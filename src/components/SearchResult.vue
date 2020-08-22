<template>
  <div>
    <input
      type="text"
      v-model="searchText"
    >
    <div class="searchResult">
      <ul
        v-for="item in searchResult"
        :key="item.id"
      >
        <li>
          {{ item.name }}
          <span
            v-if="item.count"
            class="count"
          >
            {{ item.count }} st
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
          >
            <span
              class="vote-cast-yes"
              v-if="hasVoteType(item.id, 'UP')"
            >👍</span>
            <span
              class="vote-cast-no"
              v-else
            >👍</span>
          </button>
          <button
            @click="vote(item.id, 'DOWN')"
            type="button"
          >
            <span
              class="vote-cast-yes"
              v-if="hasVoteType(item.id, 'DOWN')"
            >👎</span>
            <span
              class="vote-cast-no"
              v-else
            >👎</span>
          </button>
        </li>
      </ul>
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
    .count {
        font-style: italic;
      font-size: 80%;
    }
    .icon-male {
        color: blue;
    }

    .icon-female {
        color: deeppink;
    }

    .vote-cast-yes {
        background: green;
    }

    .vote-cast-no {
        background: transparent;
    }

    button span {
        padding: 0.5em;
    }

    button {
        margin: 0;
        padding: 0;
    }
</style>
