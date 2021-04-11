<template>
  <div>
    <section>
      <div class="block">
        <h1 class="title">
          {{ $t('about.title') }}
        </h1>
      </div>

      <div class="content">
        <p>
          {{ $t('about.paragraph_1') }}
        </p>
        <p>
          {{ $t('about.paragraph_2') }}
        </p>
        <p>
          {{ $t('about.paragraph_3') }}
        </p>
        <p>
          {{ $t('about.paragraph_4') }}
        </p>
        <p>
          <i18n
            tag="p"
            path="about.privacy_policy.sentence"
          >
            <template #link>
              <router-link
                to="/about/privacy"
                v-html="$t('about.privacy_policy.link')"
              />
            </template>
          </i18n>
        </p>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'About'
}
</script>

<style scoped lang="scss">
</style>
