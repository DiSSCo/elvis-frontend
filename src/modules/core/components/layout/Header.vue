<template>
  <div class="header">
    <nav class="navigation">
      <div v-if="!isHomePage" class="logo">
        <router-link title="Elvis" :to="'/'">
          <img
            v-if="sizes.includes('size-up-to-desktop')"
            :src="require('@/assets/images/logo/logo-elvis-white-compact.svg')"
          />
          <img v-else :src="require('@/assets/images/logo/logo-elvis-white.svg')" />
        </router-link>
      </div>
      <navigation v-if="isAuthenticated" />
    </nav>

    <div v-if="isAuthenticated" class="profile">
      <b-tooltip type="is-dark" label="Questions and Feedback" position="is-bottom" animated>
        <router-link tag="button" class="button is-secondary help" to="/help">
          <span>?</span>
        </router-link>
      </b-tooltip>
      <b-dropdown position="is-bottom-left" aria-role="list" :mobile-modal="false">
        <b-button slot="trigger" size="is-large" class="button is-secondary profile" data-cy="profile">
          <i class="settings icon icon-user" />
        </b-button>
        <b-dropdown-item aria-role="listitem" @click="openProfile">{{ $t('profile.my_profile') }}</b-dropdown-item>
        <b-dropdown-item aria-role="listitem" @click="logout" data-cy="logout">{{ $t('logout') }}</b-dropdown-item>
        <b-dropdown-item v-if="isAdmin" aria-role="listitem" @click="openSettings">
          <span><i class="feather icon-settings" /> {{ $t('admin.settings') }}</span>
        </b-dropdown-item>
      </b-dropdown>
      <span slot="trigger" class="profile-text">{{ fullName }}</span>
    </div>
    <b-button v-else class="is-primary login-btn" @click="login" data-cy="login-btn">{{ $t('login') }}</b-button>
  </div>
</template>

<script>
import { getProfile, kcLogin, kcLogout, isAdmin } from '@/modules/core/utils/auth';
import { getScreenSizes } from '@/modules/core/utils/devices';
import Navigation from './Navigation';

export default {
  components: {
    Navigation
  },

  props: {
    authenticated: Boolean
  },

  computed: {
    isAuthenticated() {
      return this.authenticated;
    },

    isHomePage() {
      return this.$route.name === 'welcome';
    },

    isAdmin() {
      return isAdmin();
    },

    sizes() {
      return getScreenSizes();
    },

    profile() {
      return getProfile();
    },

    fullName() {
      return `${this.profile.firstName} ${this.profile.lastName}`;
    }
  },

  methods: {
    login() {
      kcLogin();
    },

    logout() {
      kcLogout();
    },

    openProfile() {
      if (this.$route.path !== '/profile') {
        this.$router.push({
          name: 'profile'
        });
      }
    },

    openSettings() {
      this.$router.push({
        name: 'settings'
      });
    },

    showErrorMessage() {
      this.$buefy.dialog.alert({
        title: 'Error',
        message: "You currently don't have permission to proceed.",
        type: 'is-danger',
        ariaRole: 'alertdialog',
        ariaModal: true
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.header {
  height: $header-height;
  background: $primary;
  display: flex;
  align-items: center;
  justify-content: flex-end;

  padding: 0 2em;
  .prev-nav {
    display: none;
    i {
      font-size: 26px;
    }
  }
  .navigation {
    display: flex;
    align-items: center;
    flex: 1;
  }
  .logo,
  .logo a {
    display: flex;
    width: 100%;
  }
  .logo {
    width: 150px;
    max-height: 50px;
    .size-up-to-desktop & {
      max-width: 200px;
      min-width: 0;
    }
    .size-desktop & {
      width: 250px;
      min-width: 0;
    }
    img {
      width: 100%;
    }
  }
}

.profile {
  position: relative;
  display: flex;
  height: 100%;
  justify-content: center;
  align-items: center;
  padding-bottom: 0.5em;

  .settings {
    .size-up-to-desktop & {
      margin-left: 0 !important;
      margin-right: 0 !important;
    }
  }
  .arrow {
    display: none;
    .size-desktop & {
      display: flex;
    }
  }
  button {
    padding-top: 0;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.4);
    display: flex;
    align-items: center;
    width: 40px;
    height: 40px;
    padding: 0;
    &:hover {
      border: 2px solid $white;
      background-color: transparent;
    }
    &.help {
      margin-top: 0;
      span {
        font-weight: 700;
        font-size: 24px;
        margin-top: 0;
      }
    }
    &.profile {
      margin-left: 24px;
    }
  }
  .profile-text {
    font-size: 8px;
    color: $white;
    position: absolute;
    right: 0;
    bottom: 4px;
    white-space: nowrap;
  }
}
</style>
