<template>
  <div>
    <section>
      <div class="block">
        <h2 class="subtitle">
          Era favoriter samlade på samma sida.
        </h2>
      </div>

      <b-field>
        <b-radio-button
          v-for="item in filterOptions"
          :key="item.key"
          v-model="filterOption"
          :native-value="item.key"
        >
          {{ item.label }}
        </b-radio-button>
      </b-field>

      <div v-if="listFiltered.length === 0">
        <p v-if="filterOption === 'mine'">
          Du har inte röstat på några favoriter ännu.
        </p>
        <div
          v-if="filterOption === 'ours' && isUserConnected"
          class="content"
        >
          <p>
            Ni har tyvärr inte några gemensamma favoriter ännu.
          </p>
        </div>
        <div
          v-if="filterOption === 'not_voted_yet' && isUserConnected"
          class="content"
        >
          <p>
            Inga nya namn att rösta på. Du har redan röstat på alla namn som din partner röstat på.
          </p>
        </div>
        <div
          v-if="filterOption === 'ours' && !isUserConnected"
          class="content"
        >
          <p>
            Ni har inte kopplat ihop era profiler ännu.
          </p>
          <p>
            Gå till
            <router-link to="/share">
              Dela
            </router-link>
            för att göra detta.
          </p>
        </div>
        <div
          v-if="filterOption === 'all' && isUserConnected"
          class="content"
        >
          <p>
            Varken du eller din partner har röstat på några namn ännu.
          </p>
        </div>
        <div
          v-if="filterOption === 'all' && !isUserConnected"
          class="content"
        >
          <p>
            Du har inte röstat på namn ännu.
          </p>
          <p>
            När ni kopplat ihop era profiler på
            <router-link to="/share">
              Dela
            </router-link>
            -sidan så ser du även din partners röster här.
          </p>
        </div>
        <p v-if="filterOption === 'all'" />
      </div>

      <div
        v-if="listFiltered.length > 0"
        class="search-result-item"
      >
        <div class="name" />
        <div class="vote-you">
          Jag
        </div>
        <div class="vote-partner">
          Partner
        </div>
      </div>
      <ListItem
        v-for="item in listFiltered"
        :key="item.id"

        :id="item.id"
        :name="item.name"
        :attributes="item.attributes"
        is-partner-vote-shown
        :partner-vote-value="item.votes.partner"
        :user-vote-value="userVoteValue(item.id)"
      />
    </section>
  </div>
</template>

<script>
import ComponentMixins from "@/util/ComponentMixins";
import ListItem from "@/components/ListItem";
import VotesMixins from "@/util/VotesMixins";

const FILTERS = {
  mine: {
    label: 'Mina',
    filter: (item) => item.votes.you > 0
  },
  ours: {
    label: 'Bådas',
    filter: (item) => item.votes.you > 0 && item.votes.partner > 0
  },
  not_voted_yet: {
    label: 'Nya',
    filter: (item) => typeof item.votes.you === 'undefined' && item.votes.partner >= 0
  },
  all: {
    label: 'Alla röster',
    filter: () => true
  }
}

let userId = null

export default {
  name: 'Favourites',
  components: {ListItem},
  data: function () {
    return {
      listFiltered: [],
      filterOption: 'ours',
      filterOptions: Object.entries(FILTERS).map(([key, {label}]) => ({key, label})),
      isUserConnected: false,
      relatedUserIds: []
    };
  },
  mixins: [
    ComponentMixins,
    VotesMixins
  ],
  methods: {
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
          this.refreshList()
        } else {
          console.log('💥 Failed to cast votes')
        }
      } catch (e) {
        console.log('💥', e)
      }
    },
    userVoteValue(nameId) {
      return this.getVoteValue(userId, nameId)
    },
    refreshList() {
      this.listFiltered = this.names.map(name => ({
        ...name,
        votes: {
          you: this.getVoteValue(userId, name.id),
          partner: this.relatedUserIds.map(userId => this.getVoteValue(userId, name.id)).filter(value => typeof value !== 'undefined')[0]
        }
      }))
        .filter(item => typeof item.votes.you !== 'undefined' || typeof item.votes.partner !== 'undefined')
        .filter(FILTERS[this.filterOption].filter)
    }
  },
  async created() {
    try {
      userId = await this.getUserId();

      const relationshipsResponse = await fetch(`${process.env.VUE_APP_BASE_URL}/users/${userId}/relationships`, {mode: 'cors'})

      const items = await relationshipsResponse.json();
      this.relatedUserIds = items.map(item => item.id)
      const userIds = [userId].concat(this.relatedUserIds)

      const namesResponse = await fetch(`${process.env.VUE_APP_BASE_URL}/users/${userId}/names?voted-by=${userIds.join(',')}&result-count=10000`, {mode: 'cors'})

      this.names = (await namesResponse.json()).names

      await Promise.all(userIds.map(userId => this.loadVotes(userId)))

      this.isUserConnected = this.relatedUserIds.length > 0
    } catch (e) {
      console.log('💥', e)
      this.names = []
    }
    this.refreshList()
  },
  watch: {
    filterOption: function () {
      this.refreshList()
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
            flex-basis: 4em;
            display: flex;
            justify-content: center;
        }
    }
</style>
