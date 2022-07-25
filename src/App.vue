<template>
  <div id="app">
    <app-header :authenticated="authenticated" />
    <div class="main">
      <transition name="fade" mode="out-in">
        <router-view />
      </transition>
    </div>
    <div class="spacer" />
    <app-footer />
  </div>
</template>

<script>
import AppHeader from '@/modules/core/components/layout/Header';
import AppFooter from '@/modules/core/components/layout/Footer';
import { setScreenSizes, checkIfTouch } from '@/modules/core/utils/devices';
import { getTokenParsed, setPermissions, isAuthenticated } from '@/modules/core/utils/auth';

export default {
  components: {
    AppHeader,
    AppFooter
  },

  data() {
    return {
      authenticated: isAuthenticated()
    };
  },

  created() {
    const parsedToken = getTokenParsed();
    if (parsedToken) {
      this.handlePermissions(parsedToken);
    }
  },

  mounted() {
    window.addEventListener('resize', () => {
      setScreenSizes();
    });
    setScreenSizes();
    checkIfTouch();
  },

  updated() {
    this.authenticated = isAuthenticated();
  },

  destroyed() {
    window.removeEventListener('resize', setScreenSizes);
  },

  methods: {
    handlePermissions(tokenParsed) {
      const resourceAccess = tokenParsed.resource_access[tokenParsed.azp];
      const permissions = resourceAccess
        ? JSON.parse(JSON.stringify(tokenParsed.resource_access[tokenParsed.azp].roles))
        : [];
      setPermissions(permissions);
    }
  }
};
</script>

<style lang="scss">
@import './assets/styles/app.scss';
.main {
  height: auto;
  min-height: calc(100vh - #{$header-height + $footer-height});
}
.size-phone .spacer {
  height: $header-height;
}
</style>
