<template>
  <div>
    <input
      type="text"
      v-model="searchText"
    >
    <div class="searchResult">
      <ul
        v-for="item in searchResult"
        :key="item.id"
      >
        <li>{{ item.name }}</li>
      </ul>
    </div>
  </div>
</template>

<script>
import ComponentMixins from "@/util/ComponentMixins";

export default {
  name: 'SearchResult',
  data: function () {
    return {
      searchText: '',
      searchResult: []
    };
  },
  mixins: [
    ComponentMixins
  ],
  methods: {
    search: async function (value) {
      console.log(value)
      const namesResponse = await fetch('http://localhost:8080/names?filter=' + value, {mode: 'cors'})
      const names = await namesResponse.json()
      this.searchResult = names.names.map((value, index) => ({
        id: index,
        name: value
      }))
    }
  },
  mounted() {
    this.search = this.debounce(this.search, 500)
  },
  watch: {
    searchText: function (value) {
      this.search(value)
    }
  }
}
</script>

<style scoped>

</style>
