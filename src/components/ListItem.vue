<template>
  <div>
    <div
      class="search-result-item"
    >
      <div
        class="name"
      >
        <router-link :to="'/name/' + id">
          {{ name }}
        </router-link>

        <span
          v-if="getGender() === 'MALE'"
          class="icon-male"
          title="Över 90 % av personerna med detta namn är män."
        >♂</span>
        <span
          v-if="getGender() === 'FEMALE'"
          title="Över 90 % av personerna med detta namn är kvinnor."
          class="icon-female"
        >♀</span>
        <span
          v-if="getGender() === 'UNISEX'"
          title="Namnet bärs av både kvinnor och män."
          class="icon-unisex"
        >⚤</span>
      </div>
      <div class="vote-you">
        <div class="vote-buttons">
          <div class="buttons">
            <b-button
              type="is-light"
              @click="castVote(100)"
            >
              <span class="icon is-small">
                <font-awesome-icon
                  :style="{ color: 'green' }"
                  :icon="[currentUserVoteValue === 100 ? 'fa' : 'far', 'smile']"
                />
              </span>
            </b-button>
            <b-button
              type="is-light"
              @click="castVote(0)"
            >
              <span class="icon is-small">
                <font-awesome-icon
                  :style="{ color: 'orange' }"
                  :icon="[currentUserVoteValue === 0 ? 'fa' : 'far', 'meh']"
                />
              </span>
            </b-button>
            <b-button
              type="is-light"
              @click="castVote(-100)"
            >
              <span class="icon is-small">
                <font-awesome-icon
                  :style="{ color: 'red' }"
                  :icon="[currentUserVoteValue === -100 ? 'fa' : 'far', 'frown']"
                />
              </span>
            </b-button>
          </div>
        </div>
      </div>
      <div
        v-if="isPartnerVoteShown"
        class="vote-partner"
      >
        <span class="icon is-small">
          <font-awesome-icon
            v-if="partnerVoteValue === 100"
            :style="{ color: 'green' }"
            :icon="[ 'far', 'smile']"
          />
          <font-awesome-icon
            v-if="partnerVoteValue === 0"
            :style="{ color: 'orange' }"
            :icon="[ 'far', 'meh']"
          />
          <font-awesome-icon
            v-if="partnerVoteValue === -100"
            :style="{ color: 'red' }"
            :icon="[ 'far', 'frown']"
          />
          <font-awesome-icon
            v-if="partnerVoteValue === null"
            :style="{ color: '#ccc' }"
            :icon="[ 'fa', 'question']"
          />
        </span>
      </div>
    </div>
    <div v-if="showLoginForm">
      <Login
        :show-logout="false"
        message="För att rösta måste du logga in."
      />
    </div>
  </div>
</template>

<script>
import ComponentMixins from "@/util/ComponentMixins";
import VotesMixins from "@/util/VotesMixins";
import Login from "@/components/auth/Login";

const UNISEX_THRESHOLD = 0.1

export default {
  name: "ListItem",
  inject: ['token'],
  data: function () {
    return {
      updatedUserVoteValue: null,
      showLoginForm: false,
      pendingVoteValue: null
    }
  },
  components: {Login},
  mixins: [
    ComponentMixins,
    VotesMixins
  ],
  props: {
    name: {
      default: '',
      type: String
    },
    id: {
      default: '',
      type: String
    },
    attributes: {
      default: function () { return [] },
      type: Array
    },
    isPartnerVoteShown: {
      default: false,
      type: Boolean
    },
    userVoteValue: {
      default: undefined,
      type: Number
    },
    partnerVoteValue: {
      default: undefined,
      type: Number
    }
  },
  computed: {
    currentUserVoteValue: function () {
      return this.updatedUserVoteValue !== null ? this.updatedUserVoteValue : this.userVoteValue
    }
  },
  methods: {
    isLoggedIn: function () {
      return !!this.token.value
    },
    castVote: async function (voteValue) {
      if (this.isLoggedIn()) {
        if (await this.vote(this.id, voteValue, this.token.value)) {
          this.updatedUserVoteValue = voteValue;
          this.$emit('vote-cast')
        }
      } else {
        this.showLoginForm = true
        this.pendingVoteValue = voteValue
      }
    },
    getGender: function () {
      const ratioWomen = this.attributes.find(attr => attr.key === 'SCB_PERCENT_WOMEN')?.value;
      return typeof ratioWomen !== 'undefined'
        ? (ratioWomen > (1 - UNISEX_THRESHOLD)
          ? 'FEMALE'
          : (ratioWomen < UNISEX_THRESHOLD
            ? 'MALE'
            : 'UNISEX'))
        : null
    }
  },
  watch: {
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
