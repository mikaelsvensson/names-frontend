<template>
  <div>
    <section>
      <div class="block">
        <h2 class="title">
          {{ $t('privacy_policy.title') }}
        </h2>
        <h2 class="subtitle">
          {{ $t('privacy_policy.subtitle') }}
        </h2>
      </div>

      <div class="content">
        <h2>{{ $t('privacy_policy.content.section_1.heading') }}</h2>
        <p>{{ $t('privacy_policy.content.section_1.paragraph_1') }}</p>
        <p>{{ $t('privacy_policy.content.section_1.paragraph_2') }}</p>
        <ul>
          <li>{{ $t('privacy_policy.content.section_1.example_1') }}</li>
          <li>{{ $t('privacy_policy.content.section_1.example_2') }}</li>
          <li>{{ $t('privacy_policy.content.section_1.example_3') }}</li>
          <li>{{ $t('privacy_policy.content.section_1.example_4') }}</li>
        </ul>

        <h2>{{ $t('privacy_policy.content.section_2.heading') }}</h2>
        <p>{{ $t('privacy_policy.content.section_2.paragraph_1') }}</p>

        <h2>{{ $t('privacy_policy.content.section_3.heading') }}</h2>
        <p>{{ $t('privacy_policy.content.section_3.paragraph_1') }}</p>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'AboutPrivacyPolicy'
}
</script>

<style scoped lang="scss">
</style>
