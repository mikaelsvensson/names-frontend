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
      </div>
    </section>
    <section class="py-4">
      <h2 class="subtitle">
        {{ $t('name.your_vote.title') }}
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
      <div
        v-if="showLoginForm"
        class="mt-2"
      >
        <Login
          :show-logout="false"
          :message="$t('name.login_message')"
        />
      </div>
    </section>
    <section
      class="py-4"
      v-for="item in demographics"
      :key="item.country"
    >
      <h2 class="subtitle">
        {{ $t('name.stats_for.title', { region: $t('name.stats_for.region.' + item.country) }) }}
      </h2>
      <nav
        v-if="name"
        class="level"
      >
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">
              {{ $t('name.gender.men')}}
            </p>
            <p class="subtitle">
              {{ item.labelMen }}
            </p>
          </div>
        </div>
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">
              {{ $t('name.gender.women')}}
            </p>
            <p class="subtitle">
              {{ item.labelWomen }}
            </p>
          </div>
        </div>
      </nav>
    </section>
    <section class="py-4">
      <h2 class="subtitle">
        {{ $t('name.similar.title') }}
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
          :user-vote-value="item.votes.selfVoteValue"
          :percent-women="item.demographics.se.percentWomen"
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

const numberFormat = new Intl.NumberFormat();

const NBSP = '\xa0'; // Non-breakable space is char 0xa0 (160 dec)

const toNumericString = (number) => numberFormat.format(number).replaceAll(',', NBSP).replace('.', ',');

const getPopularityLabel = (percentOfPopulation, genderPercent) => {
  if (genderPercent === 0) {
    return 'Inga'
  }

  const exp = 1 + Math.round(Math.abs(Math.log10(percentOfPopulation * (genderPercent))));
  const multiplier = Math.pow(10, exp);
  const value = Math.round(percentOfPopulation * (genderPercent) * multiplier);

  if (exp > 6) {
    return `Ett fåtal i landet`
  }

  if (isNaN(value)) {
    return 'Okänt';
  }

  return `${toNumericString(value)} på ${toNumericString(multiplier)}`
};

export default {
  name: 'Name',
  inject: ['token'],
  components: {
    Loader,
    ListItem,
    Login
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
      return this.updatedUserVoteValue !== null ? this.updatedUserVoteValue : this.name?.votes?.selfVoteValue
    },
    demographics: function () {
      var data = this.name?.demographics ?? {};
      return Object.keys(data)
        .map(country => ({
          country,
          percentOfPopulation: data[country].percentOfPopulation,
          percentWomen: data[country].percentWomen,
          labelMen: this.getPopularityMen(data[country].percentOfPopulation, data[country].percentWomen),
          labelWomen: this.getPopularityWomen(data[country].percentOfPopulation, data[country].percentWomen)
        }))
        .filter(item => item.percentOfPopulation !== null)
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
        this.showLoginForm = true;
        this.pendingVoteValue = voteValue
      }
    },
    getSimilar: async function () {
      const similarResp = await fetch(`${process.env.VUE_APP_BASE_URL}/names/${this.name.id}/similar`, {
        mode: 'cors',
        headers: {
          ...(this.token.value ? {'Authorization': 'Bearer ' + this.token.value} : {})
        }
      });
      this.similar = await similarResp.json()
    },
    getPopularityWomen: function (percentOfPopulation, percentWomen) {
      return getPopularityLabel(percentOfPopulation, percentWomen);
    },
    getPopularityMen: function (percentOfPopulation, percentWomen) {
      return getPopularityLabel(percentOfPopulation, 1.0 - percentWomen);
    },
    getName: async function (nameId) {
      try {
        const nameResponse = await fetch(`${process.env.VUE_APP_BASE_URL}/names/${nameId}`, {
          mode: 'cors',
          headers: {
            ...(this.token.value ? {'Authorization': 'Bearer ' + this.token.value} : {})
          }
        });
        if (nameResponse.ok) {
          this.name = await nameResponse.json()
        } else {
          console.log('💥 Failed to fetch votes');
          this.name = null
        }

      } catch (e) {
        console.log('💥', e);
        this.name = null
      }
    },
  },
  async created() {
    await this.getName(this.$route.params.nameId);
    await this.getSimilar()
  },
  watch: {
    async $route(to/*, from*/) {
      this.name = null;
      this.similar = null;
      await this.getName(to.params.nameId);
      await this.getSimilar()
    },
    'token.value': async function (newValue) {
      const isLoggedIn = !!newValue;
      if (isLoggedIn) {
        this.showLoginForm = false;
        if (this.pendingVoteValue !== null) {
          this.castVote(this.pendingVoteValue);
          this.pendingVoteValue = null
        }
      }
    }
  }
}
</script>

<style scoped lang="scss">
</style>
