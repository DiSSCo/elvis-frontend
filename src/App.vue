<template>
  <div id="app">
    <app-header :authenticated="authenticated" />
    <div class="main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
    <div class="spacer" />
    <app-footer />
  </div>
</template>

<script>
import AppHeader from '@/modules/core/components/layout/Header.vue';
import AppFooter from '@/modules/core/components/layout/Footer.vue';
import { setScreenSizes, checkIfTouch } from '@/modules/core/utils/devices';
import { getTokenParsed, setPermissions, isAuthenticated } from '@/modules/core/utils/auth';

export default {
  components: {
    AppHeader,
    AppFooter,
  },
  data() {
    return {
      authenticated: isAuthenticated(),
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
  unmounted() {
    window.removeEventListener('resize', setScreenSizes);
  },
  methods: {
    handlePermissions(tokenParsed) {
      const resourceAccess = tokenParsed.resource_access[tokenParsed.azp];
      const permissions = resourceAccess
        ? JSON.parse(JSON.stringify(tokenParsed.resource_access[tokenParsed.azp].roles))
        : [];
      setPermissions(permissions);
    },
  },
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

<style lang="css">
/* Generic styles on top of the Oruga UI library */
.primaryButton {
  background-color: #ffd85d !important;
  border-color: transparent !important;
  color: #363636 !important;
}

.primaryButton:hover {
  background-color: #f6bb00 !important;
}

.tableButton {
  background-color: white;
  border-color: gray;
  color: gray;
}

/* Global Overwrite Oruga Classes */
.o-pag__link--current {
  background-color: #0c86c6;
  border-color: #0c86c6;
}

.o-tip__content--primary {
  background-color: #363636;
  color: white;
}
</style>
