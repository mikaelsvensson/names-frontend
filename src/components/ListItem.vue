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

        <!--
                        <span
                          v-if="getGender() === 'MALE'"
                          :title="$t('list_item.gender_description.male')"
                          class="icon-male"
                        >♂</span>
                        <span
                          v-if="getGender() === 'FEMALE'"
                          :title="$t('list_item.gender_description.female')"
                          class="icon-female"
                        >♀</span>
                        <span
                          v-if="getGender() === 'UNISEX'"
                          :title="$t('list_item.gender_description.unisex')"
                          class="icon-unisex"
                        >⚤</span>
                -->
      </div>
      <div class="votes">
        <div class="vote-you">
          <div class="vote-buttons">
            <VoteRegular
              v-if="voteComponent !== 'emoji'"
              :value="currentUserVoteValue"
              @vote="castVote"
            />
            <VoteEmoji
              v-if="voteComponent === 'emoji'"
              :value="currentUserVoteValue"
              @vote="castVote"
            />
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
    </div>
    <b-modal
      v-model="showLoginForm"
      :width="500"
      scroll="keep"
    >
      <div class="box-wrapper">
        <div class="box">
          <Login
            :show-logout="false"
            :message="$t('list_item.login_message')"
          />
          <div class="mt-4">
            <a @click="showLoginForm = false">
              {{ $t('list_item.login_cancel') }}
            </a>
          </div>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
import ComponentMixins from "@/util/ComponentMixins";
import VotesMixins from "@/util/VotesMixins";
import Login from "@/components/auth/Login";
import VoteRegular from "@/components/VoteRegular";
import VoteEmoji from "@/components/VoteEmoji";

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
  components: {VoteEmoji, VoteRegular, Login},
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
    },
    percentWomen: {
      default: undefined,
      type: Number
    }
  },
  computed: {
    currentUserVoteValue: function () {
      return this.updatedUserVoteValue !== null ? this.updatedUserVoteValue : this.userVoteValue
    },
    voteComponent: function () {
      return 'emoji';
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
      const ratioWomen = this.percentWomen;
      return typeof ratioWomen !== 'undefined' && ratioWomen != null
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
        justify-content: stretch;
        flex-wrap: wrap;
        align-content: flex-end;
        justify-items: right;
        flex-direction: row;

        div.name {
            flex: 1;
            white-space: nowrap;
            flex-basis: 9em;
        }

        div.popularity {
            flex-basis: 3.5em;
            text-align: right;
        }

        div.votes {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            flex: 1;
        }

        div.vote-partner {
            display: flex;
            justify-content: center;
            width: 40px;
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

    .box-wrapper {
      margin: 10px;
    }
</style>
