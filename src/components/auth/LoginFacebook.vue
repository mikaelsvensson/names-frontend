<template>
  <div>
    <div
      ref="fbLoginButtonContainer"
    >
      <div
        class="fb-login-button"
        data-size="medium"
        data-button-type="login_with"
        data-layout="default"
        data-auto-logout-link="false"
        data-use-continue-as="false"
        data-width=""
        data-onlogin="loginFacebookCallback()"
      />
    </div>
    <b-skeleton
      v-if="isLoading"
      width="20%"
      :animated="true"
    />
  </div>
</template>

<script>

export default {
  name: "LoginFacebook",
  data: function () {
    return {
      isLoading: false
    }
  },
  props: {
    autoLogin: {
      default: false,
      type: Boolean
    },
  },
  created() {

    const that = this

    window.loginFacebookCallback = function (...args) {
      that.getLoginStatus()
    }

    window.fbAsyncInit = function () {
      window.FB.init({
        appId: process.env.VUE_APP_FACEBOOK_APP_ID,
        cookie: true, // This is important, it's not enabled by default
        version: "v8.0"
      });
      that.initDone()
    };

    this.isLoading = true
    const isSdkLoading = this.loadFacebookSDK(document, 'script', 'bf-jssdk')
    if (!isSdkLoading) {
      this.initDone()
    }
  },
  methods: {
    initDone() {
      if (this.autoLogin) {
        this.getLoginStatus()
      } else {
        this.renderLoginButton()
      }
    },
    renderLoginButton() {
      const that = this
      setTimeout(function () {
        const container = that.$refs.fbLoginButtonContainer ?? window.document.body;
        that.isLoading = false
        window.FB.XFBML.parse(container);
      }, 1)
    },
    getLoginStatus() {
      const that = this

      window.FB.getLoginStatus(function (response) {
        that.handleLoginStatus(response)
      });
    },
    handleLoginStatus(response) {
      // Statuses:
      //   connected:       the person is logged into Facebook, and has logged into your app.
      //   not_authorized:  the person is logged into Facebook, but has not logged into your app.
      //   unknown:         the person is not logged into Facebook, so you don't know if they've logged into your app or FB.logout() was called before and therefore, it cannot connect to Facebook.

      if (response.status === 'connected') {
        this.$emit('authenticator-data', response.authResponse.signedRequest)
        this.isLoading = false
      } else {
        this.renderLoginButton()
      }
    },
    loadFacebookSDK(d, s, id) {
      var js,
          fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {
        return false;
      } else {
        js = d.createElement(s);
        js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
        return true
      }
    }
  }
}
</script>

<style scoped>

</style>
