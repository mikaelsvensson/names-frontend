<template>
  <div id="app">
    <SearchResult />
  </div>
</template>

<script>
import SearchResult from "@/components/SearchResult";

export default {
  name: 'App',
  components: {
    SearchResult
  }
}
</script>

<style>
#app {
  font-family: sans-serif;
}
</style>
