<template>
  <div class="buttons has-addons">
    <div
      :class="'button ' + (item.isSelected ? 'has-background-grey-light' : 'is-light')"
      v-for="item in voteOptions"
      :key="item.value"
      @click="onClick(item.value)"
    >
      <div
        class="emoji"
        v-html="item.code"
      />
    </div>
  </div>
</template>

<script>
import VotesMixins, {VOTE_STRENGTH} from "@/util/VotesMixins";

export default {
  name: "VoteEmoji",
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
        code: '&#x1F60D', // smiling face with heart-eyes
        isSelected: this.value >= VOTE_STRENGTH.VERY_POSITIVE
      }, {
        value: VOTE_STRENGTH.POSITIVE,
        code: '&#x1F642', // slightly smiling face
        isSelected: this.value > VOTE_STRENGTH.NEUTRAL && this.value < VOTE_STRENGTH.VERY_POSITIVE
      }, {
        value: VOTE_STRENGTH.NEUTRAL,
        code: '&#x1F610', // neutral face
        isSelected: this.value === VOTE_STRENGTH.NEUTRAL
      }, {
        value: VOTE_STRENGTH.NEGATIVE,
        code: '&#x1F62C', // grimacing face
        isSelected: this.value < VOTE_STRENGTH.NEUTRAL && this.value > VOTE_STRENGTH.VERY_NEGATIVE
      }, {
        value: VOTE_STRENGTH.VERY_NEGATIVE,
        code: '&#x1F92E', // face vomiting
        isSelected: this.value <= VOTE_STRENGTH.VERY_NEGATIVE
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

    div.button {
        width: 40px;
        height: 40px;
    }

    div.emoji {
      font-size: 30px;
      margin-top: 4px;
    }
</style>
