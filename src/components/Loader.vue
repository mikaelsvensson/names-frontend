<template>
  <div>
    <div
      style="display: flex; justify-content: space-between; height: 56px"
      v-for="width in [130, 80, 120, 70, 40]"
      :key="width"
    >
      <div style="display: flex; align-items: center">
        <b-skeleton
          :width="width"
          :animated="false"
        />
      </div>
      <div style="display: flex; align-items: center">
        <span
          class="icon is-large"
          v-for="item in [1,2, 3]"
          :key="item"
        >
          <b-skeleton
            :rounded="true"
            :animated="false"
            height="40"
            width="40"
          />
        </span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Loader"
}
</script>

<style scoped>

</style>
