<template>
  <div>
    <section>
      <Loader v-if="!name" />

      <div
        v-if="name"
        class="block"
      >
        <h1 class="title">
          {{ name.name }}
        </h1>
        <h2 class="subtitle">
          Statistik
        </h2>
      </div>

      <nav
        v-if="name"
        class="level"
      >
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">
              Andel pojkar och män
            </p>
            <p class="title">
              {{ getPopularityMen() }}
            </p>
          </div>
        </div>
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">
              Andel flickor och kvinnor
            </p>
            <p class="title">
              {{ getPopularityWomen() }}
            </p>
          </div>
        </div>
      </nav>
    </section>
    <section class="py-4">
      <h2 class="subtitle">
        Din röst
      </h2>
      <div class="vote-buttons">
        <div class="buttons is-centered">
          <button
            class="button is-large is-light"
            @click="castVote(100)"
          >
            <span class="icon">
              <font-awesome-icon
                size="lg"
                :style="{ color: 'green' }"
                :icon="[currentUserVoteValue === 100 ? 'fa' : 'far', 'smile']"
              />
            </span>
          </button>

          <button
            class="button is-large is-light"
            @click="castVote(0)"
          >
            <span class="icon">
              <font-awesome-icon
                size="lg"
                :style="{ color: 'orange' }"
                :icon="[currentUserVoteValue === 0 ? 'fa' : 'far', 'meh']"
              />
            </span>
          </button>

          <button
            class="button is-large is-light"
            @click="castVote(-100)"
          >
            <span class="icon">
              <font-awesome-icon
                size="lg"
                :style="{ color: 'red' }"
                :icon="[currentUserVoteValue === -100 ? 'fa' : 'far', 'frown']"
              />
            </span>
          </button>
        </div>
      </div>
    </section>
    <section class="py-4">
      <h2 class="subtitle">
        Liknande
      </h2>

      <Loader v-if="!similar" />

      <div
        v-if="similar"
        class="search-result-list"
      >
        <ListItem
          v-for="item in similar"
          :key="item.id"
          :name="item.name"
          :id="item.id"
          :user-vote-value="userVoteValue(item.id)"
        />
      </div>
    </section>
  </div>
</template>

<script>
import ComponentMixins from "@/util/ComponentMixins";
import ListItem from "@/components/ListItem";
import VotesMixins from "@/util/VotesMixins";
import Loader from "@/components/Loader";

const numberFormat = new Intl.NumberFormat('se-SV');

let userId = null

export default {
  name: 'Name',
  components: {
    Loader,
    ListItem
  },
  data: function () {
    return {
      name: null,
      similar: null,
      currentUserVoteValue: null
    }
  },
  mixins: [
    ComponentMixins,
    VotesMixins
  ],
  methods: {
    castVote: async function (voteValue) {
      if (await this.vote(this.name.id, voteValue)) {
        this.currentUserVoteValue = voteValue
      }
    },
    getSimilar: async function () {
      const userId = await this.getUserId();
      const similarResp = await fetch(`${process.env.VUE_APP_BASE_URL}/users/${userId}/names/${this.name.id}/similar`, {mode: 'cors'})
      this.similar = (await similarResp.json())
        .sort((a, b) => {
          const scoreB = Object.values(b.values).reduce((sum, term) => sum + term, 0);
          const scoreA = Object.values(a.values).reduce((sum, term) => sum + term, 0);
          return scoreB - scoreA;
        })
    },
    getPopularityWomen: function () {
      const scbPercentOfPopulation = this.name.attributes.find(attr => attr.key === 'SCB_PERCENT_OF_POPULATION')?.value || 0
      const scbPercentWomen = this.name.attributes.find(attr => attr.key === 'SCB_PERCENT_WOMEN')?.value || 0

      if (scbPercentWomen === 0) {
        return 'Noll'
      }

      const expW = 1 + Math.round(Math.abs(Math.log10(scbPercentOfPopulation * scbPercentWomen)));
      const multiplierW = Math.pow(10, expW);
      const valueW = Math.round(scbPercentOfPopulation * scbPercentWomen * multiplierW);

      if (isNaN(valueW)) {
        return 'Okänd'
      }

      return `${numberFormat.format(valueW)} av ${numberFormat.format(multiplierW)}`;
    },
    getPopularityMen: function () {
      const scbPercentOfPopulation = this.name.attributes.find(attr => attr.key === 'SCB_PERCENT_OF_POPULATION')?.value || 0
      const scbPercentWomen = this.name.attributes.find(attr => attr.key === 'SCB_PERCENT_WOMEN')?.value || 0

      if (scbPercentWomen === 1.0) {
        return 'Noll'
      }

      const expM = 1 + Math.round(Math.abs(Math.log10(scbPercentOfPopulation * (1.0-scbPercentWomen))));
      const multiplierM = Math.pow(10, expM);
      const valueM = Math.round(scbPercentOfPopulation * (1.0-scbPercentWomen) * multiplierM);

      if (isNaN(valueM)) {
        return 'Okänd'
      }

      return `${numberFormat.format(valueM)} av ${numberFormat.format(multiplierM)}`
    },
    userVoteValue(nameId) {
      return this.getVoteValue(userId, nameId)
    },
    getName: async function (nameId) {
      try {
        const nameResponse = await fetch(`${process.env.VUE_APP_BASE_URL}/names/${nameId}`, {mode: 'cors'})
        if (nameResponse.ok) {
          this.name = await nameResponse.json()
        } else {
          console.log('💥 Failed to fetch votes')
          this.name = null
        }

      } catch (e) {
        console.log('💥', e)
        this.name = null
      }
    },
  },
  async created() {
    await this.getName(this.$route.params.nameId)

    userId = await this.getUserId();
    await this.loadVotes(userId)

    await this.getSimilar()
    this.currentUserVoteValue = this.getVoteValue(userId, this.name.id)
  },
  watch: {
    async $route(to/*, from*/) {
      this.name = null
      this.similar = null
      await this.getName(to.params.nameId)
      await this.getSimilar()
      this.currentUserVoteValue = this.getVoteValue(userId, this.name.id)
    }
  }
}
</script>

<style scoped lang="scss">
</style>
