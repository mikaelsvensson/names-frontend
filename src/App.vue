<template>
  <div id="app">
    <SearchResult />
  </div>
</template>

<script>
import SearchResult from "@/components/SearchResult";

const getUserId = async () => {
  const existingUserId = window.localStorage.getItem('user.id');
  if (existingUserId) {
    return existingUserId
  }
  const userResponse = await fetch('http://localhost:8080/users', {method: 'POST', mode: 'cors'});
  const user = await userResponse.json();
  window.localStorage.setItem('user.id', user.id);
  return user.id
}

export default {
  name: 'App',
  components: {
    SearchResult
  },
  data: function() {
    return {
    };
  },
  async created() {
    const userId = await getUserId()
    console.log('😀 userId:', userId)
  }
}
</script>

<style>
#app {
  font-family: sans-serif;
}
</style>
