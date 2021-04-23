<template>
  <div class="buttons">
    <b-button
      v-for="item in voteOptions"
      :key="item.value"
      type="is-light"
      @click="onClick(item.value)"
    >
      <span class="icon is-small">
        <font-awesome-icon
          :style="{ color: item.color }"
          :icon="[item.isSelected ? 'fa' : 'far', item.icon]"
        />
      </span>
    </b-button>
  </div>
</template>

<script>
import VotesMixins, {VOTE_STRENGTH} from "@/util/VotesMixins";

export default {
  name: "VoteRegular",
  inject: ['token'],
  mixins: [
    VotesMixins
  ],
  props: {
    value: {
      default: undefined,
      type: Number
    }
  },
  computed: {
    voteOptions: function () {
      return [{
        value: VOTE_STRENGTH.VERY_POSITIVE,
        icon: 'smile',
        isSelected: this.value > VOTE_STRENGTH.NEUTRAL,
        color: 'green'
      }, {
        value: VOTE_STRENGTH.NEUTRAL,
        icon: 'meh',
        isSelected: this.value === VOTE_STRENGTH.NEUTRAL,
        color: 'orange'
      }, {
        value: VOTE_STRENGTH.VERY_NEGATIVE,
        icon: 'frown',
        isSelected: this.value < VOTE_STRENGTH.NEUTRAL,
        color: 'red'
      }];
    }
  },
  methods: {
    onClick: async function (voteValue) {
      this.$emit('vote', voteValue)
    }
  }
}
</script>

<style scoped lang="scss">
  div.buttons {
    flex-wrap: unset;
  }
</style>
