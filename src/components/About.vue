<template>
  <div>
    <section>
      <div class="block">
        <h1 class="title">
          Om sidan
        </h1>
      </div>

      <div class="content">
        <p>
          På den här sidan kan ni som blivande föräldrar hitta ett namn till ert barn.
        </p>
        <p>
          Tanken är att underlätta för föräldrar som har svårt att hitta namn som de båda gillar. Vardera
          förälder loggar in och röstar på sina egna favoriter och så visar sidan vilka namn som båda gillar.
        </p>
        <p>
          Tjänsten är gratis att använda.
        </p>
        <p>
          Tjänsten drivs och utvecklas av Mikael Svensson.
        </p>
        <p>
          <router-link to="/about/privacy">Information om hur tjänsten hanterar användarnas data</router-link>
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
