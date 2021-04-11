<template>
  <div>
    <TokenProvider>
      <section class="mx-4 my-4">
        <div class="columns is-centered">
          <div class="column is-half-tablet is-one-third-desktop">
            <b-navbar :mobile-burger="false">
              <template slot="brand">
                <b-navbar-item
                  tag="router-link"
                  :to="{ path: '/' }"
                >
                  {{ $t('navbar.home') }}
                </b-navbar-item>
                <b-navbar-item href="#/explore">
                  {{ $t('navbar.explore') }}
                </b-navbar-item>
                <b-navbar-item href="#/recommendations">
                  {{ $t('navbar.recommendations') }}
                </b-navbar-item>
                <b-navbar-item href="#/share">
                  {{ $t('navbar.share') }}
                </b-navbar-item>
                <b-navbar-item href="#/favourites">
                  {{ $t('navbar.favourites') }}
                </b-navbar-item>
              </template>

              <!--
        <template slot="start">
          <b-navbar-dropdown label="Info">
            <b-navbar-item href="#">
              About
            </b-navbar-item>
            <b-navbar-item href="#">
              Contact
            </b-navbar-item>
          </b-navbar-dropdown>
        </template>
-->
              <!--
        <template slot="end">
          <b-navbar-item tag="div">
            <div class="buttons">
              <a class="button is-primary">
                <strong>Sign up</strong>
              </a>
              <a class="button is-light">
                Log in
              </a>
            </div>
          </b-navbar-item>
        </template>
-->
            </b-navbar>
            <router-view />
          </div>
        </div>
      </section>
      <Footer />
    </TokenProvider>
  </div>
</template>

<script>
import TokenProvider from "@/components/TokenProvider";
import Footer from "@/components/Footer";
export default {
  name: 'App',
  components: {
    Footer,
    TokenProvider
  },
}
</script>

<style lang="scss">
  nav {
    .navbar-brand > .navbar-item {
      font-family: 'Chewy';
      font-size: 1.5em;
      padding-left: 0;
    }
  }
</style>
