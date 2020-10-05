<template>
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
    <div class="vote-buttons">
      <div class="buttons">
        <b-button
          type="is-light"
          :key="id + '100' + lastVoteUpdate"
          @click="vote(id, 100)"
        >
          <span class="icon is-small">
            <font-awesome-icon
              :style="{ color: 'green' }"
              :icon="[getVoteValue(id) === 100 ? 'fa' : 'far', 'smile']"
            />
          </span>
        </b-button>
        <b-button
          type="is-light"
          :key="id + '0' + lastVoteUpdate"
          @click="vote(id, 0)"
        >
          <span class="icon is-small">
            <font-awesome-icon
              :style="{ color: 'orange' }"
              :icon="[getVoteValue(id) === 0 ? 'fa' : 'far', 'meh']"
            />
          </span>
        </b-button>
        <b-button
          type="is-light"
          :key="id + '-100' + lastVoteUpdate"
          @click="vote(id, -100)"
        >
          <span class="icon is-small">
            <font-awesome-icon
              :style="{ color: 'red' }"
              :icon="[getVoteValue(id) === -100 ? 'fa' : 'far', 'frown']"
            />
          </span>
        </b-button>
      </div>
    </div>
  </div>
</template>

<script>
import ComponentMixins from "@/util/ComponentMixins";
import VotesMixins from "@/util/VotesMixins";

const UNISEX_THRESHOLD = 0.1

export default {
  name: "ListItem",
  data: function () {
    return {
    }
  },
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
    }
  },
  methods: {
    getGender: function () {
      const ratioWomen = this.attributes.find(attr => attr.key === 'SCB_PERCENT_WOMEN')?.value;
      return typeof ratioWomen !== 'undefined'
        ? (ratioWomen > (1 - UNISEX_THRESHOLD)
          ? 'FEMALE'
          : (ratioWomen < UNISEX_THRESHOLD
            ? 'MALE'
            : 'UNISEX'))
        : null
    },
    async created() {
      const userId = await this.getUserId();
      await this.loadVotes(userId)
    },
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
