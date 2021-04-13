<template>
  <div>
    <section>
      <div class="block">
        <h1 class="title">
          {{ $t('profile_deleted.title') }}
        </h1>
        <div class="content">
          <p>
            {{ $t('profile_deleted.body') }}
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'ProfileDeleted'
}
</script>

<style scoped lang="scss">
</style>
