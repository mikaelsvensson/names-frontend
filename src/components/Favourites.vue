<template>
  <div>
    <section>
      <div class="content">
        <h1>
          Era favoriter
        </h1>
        <p>
          Dina och din partners favoriter samlade.
        </p>
      </div>
    </section>
    <section>
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
        <p v-if="filterOption === 'ours'">
          Ni har tyvärr några gemensamma favoriter ännu.
        </p>
        <p v-if="filterOption === 'all'">
          Varken du eller din partner har röstat på några namn ännu.
        </p>
      </div>

      <div
        v-if="listFiltered.length > 0"
        class="search-result-item"
      >
        <div class="name" />
        <div class="vote-you">
          Du
        </div>
        <div class="vote-partner">
          Partner
        </div>
      </div>
      <div
        v-for="item in listFiltered"
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
        <div class="vote-you">
          <div class="buttons">
            <span class="icon is-small">
              <!-- User's vote -->
              <font-awesome-icon
                v-if="item.votes.you === 100"
                :style="{ color: 'green' }"
                :icon="[ 'far', 'smile']"
              />
              <font-awesome-icon
                v-if="item.votes.you === 0"
                :style="{ color: 'orange' }"
                :icon="[ 'far', 'meh']"
              />
              <font-awesome-icon
                v-if="item.votes.you === -100"
                :style="{ color: 'red' }"
                :icon="[ 'far', 'frown']"
              />
              <font-awesome-icon
                v-if="typeof item.votes.you === 'undefined'"
                :style="{ color: '#ccc' }"
                :icon="[ 'fa', 'question']"
              />
            </span>
          </div>
        </div>
        <div class="vote-partner">
          <div class="buttons">
            <span class="icon is-small">
              <!-- Partner's vote -->
              <font-awesome-icon
                v-if="item.votes.partner === 100"
                :style="{ color: 'green' }"
                :icon="[ 'far', 'smile']"
              />
              <font-awesome-icon
                v-if="item.votes.partner === 0"
                :style="{ color: 'orange' }"
                :icon="[ 'far', 'meh']"
              />
              <font-awesome-icon
                v-if="item.votes.partner === -100"
                :style="{ color: 'red' }"
                :icon="[ 'far', 'frown']"
              />
              <font-awesome-icon
                v-if="typeof item.votes.partner === 'undefined'"
                :style="{ color: '#ccc' }"
                :icon="[ 'fa', 'question']"
              />
            </span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import ComponentMixins from "@/util/ComponentMixins";

const FILTERS = {
  mine: {
    label: 'Mina',
    filter: (item) => item.votes.you > 0
  },
  ours: {
    label: 'Gemensamma',
    filter: (item) => item.votes.you > 0 && item.votes.partner > 0
  },
  all: {
    label: 'Även bortröstade',
    filter: () => true
  }
}

export default {
  name: 'Favourites',
  data: function () {
    return {
      listAll: [],
      listFiltered: [],
      filterOption: 'ours',
      filterOptions: Object.entries(FILTERS).map(([key, {label}]) => ({key, label}))
    };
  },
  mixins: [
    ComponentMixins
  ],
  methods: {},
  mounted() {
  },
  async created() {
    try {
      const userId = await this.getUserId();

      const relationshipsResponse = await fetch(`${process.env.VUE_APP_BASE_URL}/users/${userId}/relationships`, {mode: 'cors'})

      const items = await relationshipsResponse.json();
      const relatedUserIds = items.map(item => item.id)
      const userIds = [userId].concat(relatedUserIds)

      const namesResponse = await fetch(`${process.env.VUE_APP_BASE_URL}/users/${userId}/names?voted-by=${userIds.join(',')}`, {mode: 'cors'})

      const names = (await namesResponse.json()).names

      const votes = {}
      for (const id of userIds) {
        const votesResponse = await fetch(`${process.env.VUE_APP_BASE_URL}/users/${id}/votes`, {mode: 'cors'})
        votes[id] = await votesResponse.json()
      }

      this.listAll = names.map(name => ({
        ...name,
        votes: {
          you: votes[userId].find(vote => vote.nameId === name.id)?.value,
          partner: Object.values(votes).flatMap(x => x).find(vote => relatedUserIds.includes(vote.userId) && name.id === vote.nameId)?.value
        }
      }))
        .filter(item => typeof item.votes.you !== 'undefined' || typeof item.votes.partner !== 'undefined')
    } catch (e) {
      console.log('💥', e)
      this.listAll = []
    }
    this.listFiltered = this.listAll.filter(FILTERS[this.filterOption].filter)
  },
  watch: {
    filterOption: function () {
      this.listFiltered = this.listAll.filter(FILTERS[this.filterOption].filter)
    }
  }
}
</script>

<style scoped lang="scss">
  div.search-result-item {
    display: flex;
    padding: 0.5em 0;
    align-items: center;

    div {
      /*flex: 0;*/
    }

    div.name {
      flex: 1;
    }

    div.popularity {
      flex-basis: 4em;
      text-align: right;
    }

    div.vote-you {

      flex-basis: 4em;

      div.buttons {
        flex-wrap: unset;
      }
    }

    div.vote-partner {
      flex-basis: 4em;
    }
  }
</style>
