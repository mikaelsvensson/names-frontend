<template>
  <section class="mx-4 my-4">
    <div class="columns is-centered">
      <div class="column is-half-tablet is-one-third-desktop">
        <SearchResult />
      </div>
    </div>
  </section>
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

</style>
