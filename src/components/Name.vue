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
      <div v-if="showLoginForm" class="mt-2">
        <Notification type="LOGIN">
          <div>
            För att rösta måste du logga in.
          </div>
          <div class="mt-2">
            <Login :show-logout="false" />
          </div>
        </Notification>
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
          :attributes="item.attributes"
          :id="item.id"
          :user-vote-value="item.userVoteValue"
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
import Login from "@/components/auth/Login";
import Notification from "@/components/Notification";

const numberFormat = new Intl.NumberFormat('se-SV');

export default {
  name: 'Name',
  inject: ['token'],
  components: {
    Loader,
    ListItem,
    Login,
    Notification
  },
  data: function () {
    return {
      name: null,
      similar: null,
      updatedUserVoteValue: null,
      showLoginForm: false,
      pendingVoteValue: null
    }
  },
  mixins: [
    ComponentMixins,
    VotesMixins
  ],
  computed: {
    currentUserVoteValue: function () {
      return this.updatedUserVoteValue !== null ? this.updatedUserVoteValue : this.name?.userVoteValue
    }
  },
  methods: {
    isLoggedIn: function () {
      return !!this.token.value
    },
    castVote: async function (voteValue) {
      if (this.isLoggedIn()) {
        if (await this.vote(this.name.id, voteValue, this.token.value)) {
          this.updatedUserVoteValue = voteValue;
        }
      } else {
        this.showLoginForm = true
        this.pendingVoteValue = voteValue
      }
    },
    getSimilar: async function () {
      const similarResp = await fetch(`${process.env.VUE_APP_BASE_URL}/names/${this.name.id}/similar`, {
        mode: 'cors',
        headers: {
          ...(this.token.value ? {'Authorization': 'Bearer ' + this.token.value} : {})
        }
      })
      this.similar = await similarResp.json()
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

      const expM = 1 + Math.round(Math.abs(Math.log10(scbPercentOfPopulation * (1.0 - scbPercentWomen))));
      const multiplierM = Math.pow(10, expM);
      const valueM = Math.round(scbPercentOfPopulation * (1.0 - scbPercentWomen) * multiplierM);

      if (isNaN(valueM)) {
        return 'Okänd'
      }

      return `${numberFormat.format(valueM)} av ${numberFormat.format(multiplierM)}`
    },
    getName: async function (nameId) {
      try {
        const nameResponse = await fetch(`${process.env.VUE_APP_BASE_URL}/names/${nameId}`, {
          mode: 'cors',
          headers: {
            ...(this.token.value ? {'Authorization': 'Bearer ' + this.token.value} : {})
          }
        })
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
    await this.getSimilar()
  },
  watch: {
    async $route(to/*, from*/) {
      this.name = null
      this.similar = null
      await this.getName(to.params.nameId)
      await this.getSimilar()
    },
    'token.value': async function (newValue) {
      const isLoggedIn = !!newValue
      if (isLoggedIn) {
        this.showLoginForm = false
        if (this.pendingVoteValue !== null) {
          this.castVote(this.pendingVoteValue)
          this.pendingVoteValue = null
        }
      }
    }
  }
}
</script>

<style scoped lang="scss">
</style>
